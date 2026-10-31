import type { BaseEntity } from '@/types/common.types';
import type { IconKey } from '@/components/common/iconRegistry';

export type AgentPlatform = 'windows' | 'nonWindows';
export type AgentCategory = 'agents' | 'others';
export type ScriptType = 'PowerShell' | 'Shell' | 'Python' | 'Batch';

export interface AgentParameter {
  name: string;
  label: string;
  required: boolean;
  defaultValue?: string;
}

export interface Agent extends BaseEntity {
  name: string;
  description: string;
  platform: AgentPlatform;
  category: AgentCategory;
  icon: IconKey;
  scriptType: ScriptType;
  script: string;
  parameters: AgentParameter[];
  timeoutSeconds: number;
}
