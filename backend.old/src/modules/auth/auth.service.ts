import { Prisma, PrismaClient } from "@prisma/client";

import { signAuthToken } from "../../lib/jwt";
import { comparePassword, hashPassword } from "../../lib/password";
import { getRolePermissions, SYSTEM_ROLE_PERMISSIONS } from "./rbac";

type BootstrapInput = {
  organizationName: string;
  organizationSlug?: string;
  companyName: string;
  companyCode: string;
  branchName: string;
  branchCode: string;
  warehouseName: string;
  warehouseCode: string;
  adminFullName: string;
  adminLogin: string;
  adminPassword: string;
  adminEmail?: string;
  adminPhone?: string;
  baseCurrency: string;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensureDefaultRoles(tx: Prisma.TransactionClient, organizationId: string) {
  const entries = Object.entries(SYSTEM_ROLE_PERMISSIONS);

  const roles = await Promise.all(
    entries.map(([code, permissions]) =>
      tx.role.upsert({
        where: {
          organizationId_code: {
            organizationId,
            code
          }
        },
        update: {
          name: code.replace(/_/g, " "),
          permissions,
          isSystem: true
        },
        create: {
          organizationId,
          code,
          name: code.replace(/_/g, " "),
          permissions,
          isSystem: true
        }
      })
    )
  );

  return roles;
}

async function ensureBaseDictionaries(tx: Prisma.TransactionClient, organizationId: string, baseCurrency: string) {
  const currencies = [
    { code: "UZS", name: "Uzbek Sum", symbol: "UZS" },
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "CNY", name: "Chinese Yuan", symbol: "CNY" }
  ];

  await Promise.all(
    currencies.map((currency) =>
      tx.currency.upsert({
        where: {
          organizationId_code: {
            organizationId,
            code: currency.code
          }
        },
        update: {
          ...currency,
          isBase: currency.code === baseCurrency
        },
        create: {
          organizationId,
          ...currency,
          isBase: currency.code === baseCurrency
        }
      })
    )
  );

  const units = [
    { code: "PCS", name: "Piece", precision: 0 },
    { code: "KG", name: "Kilogram", precision: 3 },
    { code: "L", name: "Liter", precision: 3 }
  ];

  await Promise.all(
    units.map((unit) =>
      tx.unitOfMeasure.upsert({
        where: {
          organizationId_code: {
            organizationId,
            code: unit.code
          }
        },
        update: unit,
        create: {
          organizationId,
          ...unit
        }
      })
    )
  );
}

export async function bootstrapOrganization(prisma: PrismaClient, input: BootstrapInput) {
  const passwordHash = await hashPassword(input.adminPassword);

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const organization = await tx.organization.create({
      data: {
        name: input.organizationName,
        slug: input.organizationSlug ?? slugify(`${input.organizationName}-${Date.now()}`),
        baseCurrency: input.baseCurrency
      }
    });

    const company = await tx.company.create({
      data: {
        organizationId: organization.id,
        name: input.companyName,
        code: input.companyCode.toUpperCase()
      }
    });

    const branch = await tx.branch.create({
      data: {
        companyId: company.id,
        name: input.branchName,
        code: input.branchCode.toUpperCase(),
        isMain: true
      }
    });

    const warehouse = await tx.warehouse.create({
      data: {
        companyId: company.id,
        branchId: branch.id,
        name: input.warehouseName,
        code: input.warehouseCode.toUpperCase()
      }
    });

    const roles = await ensureDefaultRoles(tx, organization.id);
    await ensureBaseDictionaries(tx, organization.id, input.baseCurrency);

    const ownerRole = roles.find((role) => role.code === "OWNER");
    if (!ownerRole) {
      throw new Error("Owner role template was not created");
    }

    const user = await tx.user.create({
      data: {
        organizationId: organization.id,
        companyId: company.id,
        branchId: branch.id,
        roleId: ownerRole.id,
        fullName: input.adminFullName,
        login: input.adminLogin,
        email: input.adminEmail,
        phone: input.adminPhone,
        passwordHash
      },
      include: {
        role: true
      }
    });

    const token = signAuthToken({
      userId: user.id,
      organizationId: organization.id,
      companyId: company.id,
      branchId: branch.id,
      roleCode: user.role.code,
      permissions: user.role.permissions
    });

    return {
      token,
      organization,
      company,
      branch,
      warehouse,
      user: {
        id: user.id,
        fullName: user.fullName,
        login: user.login,
        roleCode: user.role.code,
        permissions: user.role.permissions
      }
    };
  });
}

export async function login(prisma: PrismaClient, input: { login: string; password: string }) {
  const user = await prisma.user.findFirst({
    where: { login: input.login },
    include: {
      role: true
    }
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValid = await comparePassword(input.password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  const token = signAuthToken({
    userId: user.id,
    organizationId: user.organizationId,
    companyId: user.companyId,
    branchId: user.branchId,
    roleCode: user.role.code,
    permissions: user.role.permissions.length
      ? user.role.permissions
      : getRolePermissions(user.role.code)
  });

  return {
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      login: user.login,
      organizationId: user.organizationId,
      companyId: user.companyId,
      branchId: user.branchId,
      roleCode: user.role.code,
      permissions: user.role.permissions
    }
  };
}
