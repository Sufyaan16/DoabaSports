import { z } from "zod";

// User roles enum
export const userRoleSchema = z.enum(["customer", "admin"], {
  message: "Role must be either 'customer' or 'admin'",
});

// User metadata schema
export const userMetadataSchema = z.object({
  role: userRoleSchema,
  createdAt: z.string().datetime({ message: "Invalid datetime format" }),
});

// Update user metadata (partial)
export const updateUserMetadataSchema = userMetadataSchema.partial();

// Type exports
export type UserRole = z.infer<typeof userRoleSchema>;
export type UserMetadata = z.infer<typeof userMetadataSchema>;
export type UpdateUserMetadata = z.infer<typeof updateUserMetadataSchema>;
