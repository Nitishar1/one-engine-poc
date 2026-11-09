import { z } from 'zod';
import type { BaseEntity } from '@/types/common.types';
import { identifier, optionalText, requiredText } from '@/utils/validators';

export interface AgentParameter {
  name: string;
  value: string;
}

/** A named set of parameters passed to agents at run time. */
export interface AgentParameterGroup extends BaseEntity {
  groupName: string;
  description: string;
  parameters: AgentParameter[];
}

export const agentParameterGroupSchema = z.object({
  groupName: identifier('Group Name', 60),
  description: optionalText('Description', 500),
  parameters: z
    .array(
      z.object({
        name: identifier('Parameter Name', 60),
        value: requiredText('Value', 500),
      }),
    )
    .min(1, 'Add at least one parameter')
    .max(50, 'A group can have at most 50 parameters')
    .refine(
      (list) => new Set(list.map((p) => p.name.toLowerCase())).size === list.length,
      'Parameter names must be unique',
    ),
});

export type AgentParameterGroupFormValues = z.infer<typeof agentParameterGroupSchema>;
