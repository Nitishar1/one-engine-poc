import type { ThemeTokens } from '@/components/theme/themeTokens';
import type { WorkflowNodeType } from '../types/workflow.types';

/** Theme token holding each node type's accent colour (canvas, palette and minimap share it). */
export const NODE_ACCENT_TOKEN: Record<WorkflowNodeType, keyof ThemeTokens> = {
  start: 'nodeStart',
  end: 'nodeEnd',
  condition: 'nodeCondition',
  delay: 'nodeDelay',
  command: 'nodeCommand',
  action: 'nodeAction',
};

/** CSS variable form of a node type's accent, for inline styles. */
export const nodeAccentVar = (type: WorkflowNodeType) =>
  `var(--oe-${NODE_ACCENT_TOKEN[type].replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)})`;
