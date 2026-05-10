"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoleSchema = void 0;
const zod_1 = require("zod");
exports.createRoleSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    code: zod_1.z.string().min(2),
    permissions: zod_1.z.array(zod_1.z.string().min(3)).min(1)
});
