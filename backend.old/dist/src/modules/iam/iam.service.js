"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IamService = void 0;
const rbac_1 = require("../auth/rbac");
const iam_repository_1 = require("./iam.repository");
class IamService {
    repository;
    constructor(prisma) {
        this.repository = new iam_repository_1.IamRepository(prisma);
    }
    listRoles(organizationId) {
        return this.repository.listRoles(organizationId);
    }
    createRole(input) {
        const unknownPermissions = input.permissions.filter((permission) => !rbac_1.PERMISSIONS.includes(permission));
        if (unknownPermissions.length) {
            throw new Error(`Unknown permissions: ${unknownPermissions.join(", ")}`);
        }
        return this.repository.createRole(input);
    }
}
exports.IamService = IamService;
