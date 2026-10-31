import { z } from 'zod';
import { ICON_KEYS } from '@/components/common/iconRegistry';
import { ipv4, optionalText, requiredText } from '@/utils/validators';

export const ciTypeSchema = z.object({
  name: requiredText('CI Type', 50),
  icon: z.enum(ICON_KEYS, { error: 'Icon is required' }),
});
export type CiTypeFormValues = z.infer<typeof ciTypeSchema>;

export const CI_ENVIRONMENTS = ['Production', 'Staging', 'Development', 'DR'] as const;
export const CI_STATUSES = ['Active', 'Inactive', 'Maintenance'] as const;
export const CI_RELATIONSHIP_TYPES = [
  'Depends On',
  'Hosts',
  'Connects To',
  'Runs On',
  'Backs Up',
] as const;

export const ciMasterSchema = z.object({
  name: requiredText('CI Name', 80),
  ciTypeId: z.string().min(1, 'CI Type is required'),
  hostName: requiredText('Host Name', 255).regex(
    /^[a-zA-Z0-9.-]+$/,
    'Host name may contain letters, digits, dots and hyphens',
  ),
  ipAddress: ipv4,
  operatingSystem: requiredText('Operating System', 80),
  environment: z.enum(CI_ENVIRONMENTS, { error: 'Environment is required' }),
  status: z.enum(CI_STATUSES, { error: 'Status is required' }),
});
export type CiMasterFormValues = z.infer<typeof ciMasterSchema>;

export const ciRelationshipSchema = z
  .object({
    sourceCiId: z.string().min(1, 'Source CI is required'),
    relationshipType: z.enum(CI_RELATIONSHIP_TYPES, { error: 'Relationship is required' }),
    targetCiId: z.string().min(1, 'Target CI is required'),
    description: optionalText(500),
  })
  .refine((v) => v.sourceCiId !== v.targetCiId, {
    path: ['targetCiId'],
    message: 'Target CI must be different from the source CI',
  });
export type CiRelationshipFormValues = z.infer<typeof ciRelationshipSchema>;
