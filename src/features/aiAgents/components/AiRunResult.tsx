import { Table } from 'antd';
import { Clock, Copy, Cpu, Hash, Sparkles } from 'lucide-react';
import { AppButton } from '@/components/common/AppButton';
import { EmptyState } from '@/components/common/EmptyState';
import type { AiAgentRunResult } from '../types/ai.types';
import { toast } from '@/components/feedback/toastStore';

interface AiRunResultProps {
  result?: AiAgentRunResult;
  /** What the agent does, shown before the first run. */
  expectation?: string;
}

export function AiRunResult({ result, expectation }: AiRunResultProps) {
  if (!result) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Ready when you are"
        description={
          <>
            {expectation && <span className="mb-1.5 block text-fg-secondary">{expectation}</span>}
            Provide input and run the agent. Its output will appear here.
          </>
        }
      />
    );
  }

  const copy = async () => {
    const text = result.fields?.length
      ? result.fields.map((f) => `${f.key}: ${f.value}`).join('\n')
      : result.output;
    try {
      await navigator.clipboard.writeText(text);
      void toast.success('Copied to clipboard');
    } catch {
      void toast.error('Clipboard is not available');
    }
  };

  const stats = [
    { icon: Cpu, label: result.modelName },
    { icon: Clock, label: `${result.durationMs.toLocaleString()} ms` },
    { icon: Hash, label: `${result.tokensUsed.toLocaleString()} tokens` },
  ];

  return (
    <div className="oe-animate-in flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-fg-muted">
        {stats.map(({ icon: Icon, label }, i) => (
          <span key={label} className={i === 0 ? 'oe-ai-chip' : 'inline-flex items-center gap-1.5'}>
            <Icon size={i === 0 ? 11 : 13} /> <span className="tabular-nums">{label}</span>
          </span>
        ))}
        <AppButton
          tone="secondary"
          size="small"
          icon={<Copy size={13} />}
          onClick={() => void copy()}
          className="ml-auto"
        >
          Copy
        </AppButton>
      </div>
      <p className="oe-gradient-border m-0 whitespace-pre-wrap rounded-[10px] bg-surface p-4 text-[14px] leading-relaxed text-fg shadow-sm">
        {result.output}
      </p>
      {result.fields && result.fields.length > 0 && (
        <Table
          className="oe-table"
          size="small"
          rowKey={(r) => `${r.key}-${r.value}`}
          pagination={false}
          dataSource={result.fields}
          columns={[
            { title: 'Field', dataIndex: 'key', width: 160 },
            { title: 'Value', dataIndex: 'value' },
          ]}
        />
      )}
    </div>
  );
}
