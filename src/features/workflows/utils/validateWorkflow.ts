import type { Agent } from '@/features/agentRepository/types/agent.types';
import type { WorkflowEdge, WorkflowIssue, WorkflowNode } from '../types/workflow.types';
import { reachableFrom } from './graph';

/** Static checks run before a runbook is saved. Errors block saving; warnings do not. */
export function validateWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  agents: Agent[],
): WorkflowIssue[] {
  const issues: WorkflowIssue[] = [];
  const starts = nodes.filter((n) => n.type === 'start');

  if (starts.length === 0) issues.push({ severity: 'error', message: 'Add a Start step' });
  if (starts.length > 1)
    issues.push({ severity: 'error', message: 'Only one Start step is allowed' });
  if (nodes.filter((n) => n.type !== 'start' && n.type !== 'end').length === 0) {
    issues.push({
      severity: 'error',
      message: 'Add at least one agent, command or condition step',
    });
  }
  if (!nodes.some((n) => n.type === 'end')) {
    issues.push({
      severity: 'warning',
      message: 'No End step: the runbook finishes after its last step',
    });
  }

  const reachable = starts[0] ? reachableFrom(starts[0].id, edges) : new Set<string>();
  const agentById = new Map(agents.map((a) => [a.id, a]));

  for (const node of nodes) {
    const name = node.data.label || node.type;
    if (starts[0] && !reachable.has(node.id)) {
      issues.push({
        severity: 'error',
        nodeId: node.id,
        message: `"${name}" is not connected to Start`,
      });
    }

    switch (node.type) {
      case 'action': {
        const agent = agentById.get(node.data.agentId);
        if (!agent) {
          issues.push({
            severity: 'error',
            nodeId: node.id,
            message: `"${name}" references an agent that no longer exists`,
          });
          break;
        }
        const missing = agent.parameters.filter(
          (p) => p.required && !node.data.parameters[p.name]?.trim(),
        );
        if (missing.length) {
          issues.push({
            severity: 'error',
            nodeId: node.id,
            message: `"${name}" is missing ${missing.map((p) => p.label).join(', ')}`,
          });
        }
        break;
      }
      case 'condition': {
        if (!node.data.expression.trim()) {
          issues.push({
            severity: 'error',
            nodeId: node.id,
            message: `"${name}" has no expression`,
          });
        }
        const handles = new Set(
          edges.filter((e) => e.source === node.id).map((e) => e.sourceHandle),
        );
        if (!handles.has('true') || !handles.has('false')) {
          issues.push({
            severity: 'warning',
            nodeId: node.id,
            message: `"${name}" does not handle both Yes and No branches`,
          });
        }
        break;
      }
      case 'command':
        if (!node.data.command.trim()) {
          issues.push({ severity: 'error', nodeId: node.id, message: `"${name}" has no command` });
        }
        break;
      default:
        break;
    }
  }
  return issues;
}

/** Ids of nodes with at least one error, for highlighting on the canvas. */
export const nodesWithErrors = (issues: WorkflowIssue[]) =>
  new Set(issues.filter((i) => i.severity === 'error' && i.nodeId).map((i) => i.nodeId as string));
