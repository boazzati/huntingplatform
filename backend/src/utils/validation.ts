import { z } from 'zod';

export const HuntParamsSchema = z.object({
  subChannel: z
    .string()
    .min(1, 'Sub-channel is required')
    .max(100, 'Sub-channel too long'),
  markets: z
    .array(z.string().min(1))
    .min(1, 'At least one market is required')
    .max(10, 'Maximum 10 markets allowed'),
  focusBrands: z
    .array(z.string().min(1))
    .min(1, 'At least one focus brand is required')
    .max(10, 'Maximum 10 focus brands allowed'),
  maxAccounts: z.number().int().min(1).max(50).optional().default(10),
});

export const PlaybookParamsSchema = z.object({
  subChannel: z
    .string()
    .min(1, 'Sub-channel is required')
    .max(100, 'Sub-channel too long'),
});

export type HuntParams = z.infer<typeof HuntParamsSchema>;
export type PlaybookParams = z.infer<typeof PlaybookParamsSchema>;

export const validateHuntParams = (data: unknown): HuntParams => {
  return HuntParamsSchema.parse(data);
};

export const validatePlaybookParams = (data: unknown): PlaybookParams => {
  return PlaybookParamsSchema.parse(data);
};
