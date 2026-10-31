import type { ReactNode } from 'react';
import { Check, Copy, SquarePen } from 'lucide-react';
import { useState } from 'react';
import { AppDrawer } from '@/components/common/AppDrawer';
import { AppButton } from '@/components/common/AppButton';
import { IconAvatar } from '@/components/common/IconAvatar';
import { toast } from '@/components/feedback/toastStore';
import { formatDateTime } from '@/utils/formatters';
import type { Agent } from '../types/agent.types';

interface AgentDetailsDrawerProps {
  agent: Agent | null;
  onClose: () => void;
  onEdit: (agent: Agent) => void;
}

function Section({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h4 className="m-0 font-sans text-[12px] font-medium uppercase tracking-[0.06em] text-fg-muted">
          {title}
        </h4>
        {aside}
      </div>
      {children}
    </section>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      void toast.success('Script copied to clipboard');
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      void toast.error('Clipboard is not available');
    }
  };
  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-label="Copy script"
      className="oe-icon-btn !h-7 !w-auto gap-1.5 !px-2 text-[12px]"
    >
      {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export function AgentDetailsDrawer({ agent, onClose, onEdit }: AgentDetailsDrawerProps) {
  const details: Array<[string, ReactNode]> = agent
    ? [
        ['Platform', agent.platform === 'windows' ? 'Windows' : 'Non Windows'],
        ['Category', agent.category === 'agents' ? 'Agents' : 'Others'],
        ['Script type', agent.scriptType],
        ['Timeout', `${agent.timeoutSeconds} seconds`],
        ['Modified by', agent.modifiedBy],
        ['Modified on', <span className="tabular-nums">{formatDateTime(agent.modifiedOn)}</span>],
      ]
    : [];

  return (
    <AppDrawer
      title="Agent details"
      open={Boolean(agent)}
      onClose={onClose}
      width={520}
      footer={
        agent && (
          <div className="flex justify-end gap-2">
            <AppButton tone="secondary" onClick={onClose}>
              Close
            </AppButton>
            <AppButton icon={<SquarePen size={15} />} onClick={() => onEdit(agent)}>
              Edit agent
            </AppButton>
          </div>
        )
      }
    >
      {agent && (
        <div className="flex flex-col gap-7">
          <div className="flex items-start gap-3.5">
            <IconAvatar icon={agent.icon} size={44} />
            <div className="min-w-0">
              <h3 className="m-0 text-[17px] font-semibold text-fg">{agent.name}</h3>
              <p className="m-0 mt-1 text-[13.5px] leading-relaxed text-fg-secondary">
                {agent.description}
              </p>
            </div>
          </div>

          <Section title="Overview">
            <dl className="m-0 grid grid-cols-[130px_1fr] gap-y-2.5 text-[13.5px]">
              {details.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-fg-muted">{label}</dt>
                  <dd className="m-0 text-fg">{value}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section title={`Parameters (${agent.parameters.length})`}>
            {agent.parameters.length ? (
              <ul className="m-0 flex list-none flex-col divide-y divide-[var(--oe-border)] overflow-hidden rounded-[10px] border border-line p-0">
                {agent.parameters.map((p) => (
                  <li key={p.name} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="m-0 text-[13.5px] font-medium text-fg">{p.label}</p>
                      <p className="m-0 font-mono text-[12px] text-fg-muted">
                        {p.name}
                        {p.defaultValue ? ` = ${p.defaultValue}` : ''}
                      </p>
                    </div>
                    {p.required && (
                      <span className="rounded-md border border-line bg-surface-alt px-1.5 py-0.5 text-[11.5px] font-medium text-fg-secondary">
                        Required
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 text-[13.5px] text-fg-muted">This agent takes no parameters.</p>
            )}
          </Section>

          <Section title="Script" aside={<CopyButton text={agent.script} />}>
            <pre className="m-0 max-h-[340px] overflow-auto rounded-[10px] border border-line bg-surface-sunken p-3.5 font-mono text-[12.5px] leading-relaxed text-fg">
              {agent.script}
            </pre>
          </Section>
        </div>
      )}
    </AppDrawer>
  );
}
