import { z } from 'zod';
import { requiredText } from '@/utils/validators';

export const runbookSchema = z.object({
  name: requiredText('Runbook Name', 80),
  roles: z.array(z.string()).min(1, 'Select at least one role'),
  description: z.string().max(500),
});

export type RunbookFormValues = z.infer<typeof runbookSchema>;
