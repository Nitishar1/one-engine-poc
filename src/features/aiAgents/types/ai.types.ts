import type { BaseEntity } from '@/types/common.types';
import type { IconKey } from '@/components/common/iconRegistry';

export type AiProvider = 'OCI Generative AI' | 'Azure OpenAI' | 'Anthropic' | 'On-Premise';
export type AiModelStatus = 'Active' | 'Inactive';

export interface AiModel extends BaseEntity {
  name: string;
  provider: AiProvider;
  modelId: string;
  endpoint: string;
  maxTokens: number;
  temperature: number;
  status: AiModelStatus;
}

export type AiAgentKind = 'summarization' | 'extraction' | 'generic';

export interface AiAgentConfig extends BaseEntity {
  name: string;
  kind: AiAgentKind;
  shortDescription: string;
  fullDescription: string;
  prerequisites: string;
  icon: IconKey;
  modelId: string;
}

export interface AiAgentRunRequest {
  input: string;
  instructions?: string;
}

export interface AiAgentRunResult {
  output: string;
  /** Present for extraction agents. */
  fields?: Array<{ key: string; value: string }>;
  modelName: string;
  durationMs: number;
  tokensUsed: number;
}
