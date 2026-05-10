"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IamRepository = void 0;
class IamRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    listRoles(organizationId) {
        return this.prisma.role.findMany({
            where: { organizationId },
            orderBy: { name: "asc" }
        });
    }
    createRole(input) {
        return this.prisma.role.create({
            data: {
                organizationId: input.organizationId,
                name: input.name,
                code: input.code.toUpperCase(),
                permissions: input.permissions
            }
        });
    }
}
exports.IamRepository = IamRepository;
