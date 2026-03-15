import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { organizationId: true } });
  if (!user?.organizationId) return NextResponse.json({ error: "No org" }, { status: 403 });

  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ products: [], customers: [], suppliers: [] });

  const orgId = user.organizationId;

  const [products, customers, suppliers] = await Promise.all([
    prisma.product.findMany({
      where: {
        organizationId: orgId,
        isArchived: false,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { barcode: { contains: q } },
          { sku: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, sellingPrice: true, sku: true, barcode: true },
      take: 5,
    }),
    prisma.customer.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
        ],
      },
      select: { id: true, fullName: true, phone: true, debtAmount: true },
      take: 5,
    }),
    prisma.supplier.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { companyName: { contains: q, mode: "insensitive" } },
          { contactName: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
        ],
      },
      select: { id: true, companyName: true, phone: true },
      take: 5,
    }),
  ]);

  return NextResponse.json({ products, customers, suppliers });
}
