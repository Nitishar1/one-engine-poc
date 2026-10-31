import { z } from 'zod';
import { ICON_KEYS } from '@/components/common/iconRegistry';
import { requiredText } from '@/utils/validators';

export const PLATFORM_OPTIONS = [
  { label: 'Windows', value: 'windows' },
  { label: 'Non Windows', value: 'nonWindows' },
] as const;

export const CATEGORY_OPTIONS = [
  { label: 'Agents', value: 'agents' },
  { label: 'Others', value: 'others' },
] as const;

export const SCRIPT_TYPES = ['PowerShell', 'Shell', 'Python', 'Batch'] as const;

export const agentSchema = z.object({
  name: requiredText('Agent Name', 60).regex(
    /^[A-Za-z][\w-]*$/,
    'Start with a letter; use letters, digits, - or _ only',
  ),
  description: requiredText('Description', 500),
  platform: z.enum(['windows', 'nonWindows'], { error: 'Platform is required' }),
  category: z.enum(['agents', 'others'], { error: 'Category is required' }),
  icon: z.enum(ICON_KEYS, { error: 'Icon is required' }),
  scriptType: z.enum(SCRIPT_TYPES, { error: 'Script Type is required' }),
  timeoutSeconds: z
    .number({ error: 'Timeout is required' })
    .int()
    .min(5, 'Minimum 5 seconds')
    .max(3600, 'Maximum 3600 seconds'),
  script: requiredText('Script', 20000),
  parameters: z
    .array(
      z.object({
        name: requiredText('Parameter name', 40).regex(/^[A-Za-z_]\w*$/, 'Invalid identifier'),
        label: requiredText('Label', 60),
        required: z.boolean(),
        defaultValue: z.string().max(200).optional(),
      }),
    )
    .refine(
      (params) => new Set(params.map((p) => p.name.toLowerCase())).size === params.length,
      'Parameter names must be unique',
    ),
});

export type AgentFormValues = z.infer<typeof agentSchema>;
