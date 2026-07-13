import { z } from 'zod'

export const CreateWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name must be at least 1 character long')
    .max(100, 'Name must not exceed 100 characters'),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .nullable(),
})

export const UpdateWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name must be at least 1 character long')
    .max(100, 'Name must not exceed 100 characters')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .nullable(),
})
