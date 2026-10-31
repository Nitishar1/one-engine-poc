import { z } from 'zod';
import { ICON_KEYS } from '@/components/common/iconRegistry';
import { requiredText } from '@/utils/validators';

export const AI_PROVIDERS = [
  'OCI Generative AI',
  'Azure OpenAI',
  'Anthropic',
  'On-Premise',
] as const;
export const AI_AGENT_KINDS = [
  { label: 'Summarization', value: 'summarization' },
  { label: 'Data Extraction', value: 'extraction' },
  { label: 'Generic', value: 'generic' },
] as const;

export const aiModelSchema = z.object({
  name: requiredText('Model Name', 80),
  provider: z.enum(AI_PROVIDERS, { error: 'Provider is required' }),
  modelId: requiredText('Model Id', 120),
  endpoint: z.url({ error: 'Enter a valid endpoint URL' }),
  maxTokens: z.number({ error: 'Max Tokens is required' }).int().min(1).max(200000),
  temperature: z.number({ error: 'Temperature is required' }).min(0).max(2),
  status: z.enum(['Active', 'Inactive']),
});
export type AiModelFormValues = z.infer<typeof aiModelSchema>;

export const aiAgentConfigSchema = z.object({
  name: requiredText('Agent Name', 60),
  kind: z.enum(['summarization', 'extraction', 'generic'], { error: 'Agent Type is required' }),
  icon: z.enum(ICON_KEYS, { error: 'Icon is required' }),
  modelId: z.string().min(1, 'AI Model is required'),
  shortDescription: requiredText('Short Description', 200),
  fullDescription: requiredText('Full Description', 4000),
  prerequisites: requiredText('Prerequisites', 1000),
});
export type AiAgentConfigFormValues = z.infer<typeof aiAgentConfigSchema>;

export const MAX_RUN_INPUT = 50_000;

export const aiRunSchema = z.object({
  input: requiredText('Input', MAX_RUN_INPUT),
  instructions: z.string().max(500).optional(),
});
export type AiRunFormValues = z.infer<typeof aiRunSchema>;
