import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  permissions: z.array(z.string().min(3)).min(1)
});
