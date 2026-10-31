import { ArrowUpRight, CircleAlert, TriangleAlert, X } from 'lucide-react';
import type { WorkflowIssue } from '../types/workflow.types';

interface WorkflowIssuesProps {
  issues: WorkflowIssue[];
  onSelect: (nodeId: string) => void;
  onClose: () => void;
}

/** Validation results; clicking an issue focuses the offending step. */
export function WorkflowIssues({ issues, onSelect, onClose }: WorkflowIssuesProps) {
  if (!issues.length) return null;
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.length - errors;
  const tone = errors ? 'var(--oe-error)' : 'var(--oe-warning)';

  return (
    <div
      role="region"
      aria-label="Runbook validation"
      className="oe-animate-in overflow-hidden rounded-[10px] border border-line-strong bg-surface-elevated shadow-pop"
      style={{ ['--tone' as string]: tone }}
    >
      <div className="flex items-center gap-2 border-b border-line px-3.5 py-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--tone)]" aria-hidden />
        <strong className="text-[13px] font-semibold text-fg">
          {errors
            ? `${errors} error${errors === 1 ? '' : 's'} must be fixed before saving`
            : 'Warnings'}
        </strong>
        {errors > 0 && warnings > 0 && (
          <span className="text-[12px] text-fg-muted">
            · {warnings} warning{warnings === 1 ? '' : 's'}
          </span>
        )}
        <button
          type="button"
          aria-label="Hide validation results"
          onClick={onClose}
          className="oe-icon-btn ml-auto !h-6 !w-6"
        >
          <X size={14} />
        </button>
      </div>
      <ul className="m-0 flex max-h-[180px] list-none flex-col overflow-y-auto p-1">
        {issues.map((issue, index) => {
          const Icon = issue.severity === 'error' ? CircleAlert : TriangleAlert;
          return (
            <li key={`${issue.message}-${index}`}>
              <button
                type="button"
                disabled={!issue.nodeId}
                onClick={() => issue.nodeId && onSelect(issue.nodeId)}
                className="group flex w-full cursor-pointer items-center gap-2.5 rounded-[7px] border-0 bg-transparent px-2.5 py-1.5 text-left text-[13px] text-fg-secondary enabled:hover:bg-hover enabled:hover:text-fg disabled:cursor-default"
              >
                <Icon
                  size={14}
                  className={`shrink-0 ${issue.severity === 'error' ? 'text-danger' : 'text-warning'}`}
                />
                <span className="flex-1">{issue.message}</span>
                {issue.nodeId && (
                  <ArrowUpRight
                    size={14}
                    className="shrink-0 text-fg-muted opacity-0 transition-opacity group-hover:opacity-100"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
