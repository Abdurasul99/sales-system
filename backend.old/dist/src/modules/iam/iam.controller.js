"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IamController = void 0;
const rbac_1 = require("../auth/rbac");
const iam_schemas_1 = require("./iam.schemas");
const iam_service_1 = require("./iam.service");
class IamController {
    service;
    constructor(prisma) {
        this.service = new iam_service_1.IamService(prisma);
    }
    getPermissions = async (_req, res) => {
        res.json({ permissions: rbac_1.PERMISSIONS });
    };
    listRoles = async (req, res) => {
        const roles = await this.service.listRoles(req.auth.organizationId);
        res.json({ roles });
    };
    createRole = async (req, res) => {
        const payload = iam_schemas_1.createRoleSchema.parse(req.body);
        const role = await this.service.createRole({
            organizationId: req.auth.organizationId,
            name: payload.name,
            code: payload.code,
            permissions: payload.permissions
        });
        res.status(201).json({ role });
    };
}
exports.IamController = IamController;
