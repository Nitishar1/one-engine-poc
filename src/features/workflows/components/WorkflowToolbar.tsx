import { useRef, type ChangeEvent } from 'react';
import { Tooltip } from 'antd';
import {
  Download,
  Maximize2,
  ShieldCheck,
  Trash2,
  Upload,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from 'lucide-react';

interface WorkflowToolbarProps {
  onValidate: () => void;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onDeleteSelected: () => void;
  onExport: () => void;
  onImport: (json: string) => void;
  hasSelection: boolean;
}

function ToolButton({
  title,
  icon: Icon,
  onClick,
  disabled,
  danger,
}: {
  title: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <Tooltip title={title}>
      <button
        type="button"
        aria-label={title}
        disabled={disabled}
        onClick={onClick}
        className={`oe-icon-btn ${danger ? 'is-danger' : ''}`}
      >
        <Icon size={16} />
      </button>
    </Tooltip>
  );
}

const Divider = () => <span aria-hidden className="mx-0.5 h-5 w-px bg-[var(--oe-border-strong)]" />;

/** Floating canvas toolbar: validation, view, selection and file actions. */
export function WorkflowToolbar({
  onValidate,
  onFitView,
  onZoomIn,
  onZoomOut,
  onDeleteSelected,
  onExport,
  onImport,
  hasSelection,
}: WorkflowToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) onImport(await file.text());
  };

  return (
    <div
      role="toolbar"
      aria-label="Runbook tools"
      className="oe-glass flex items-center gap-0.5 rounded-[10px] border border-line-strong p-1 shadow-pop"
    >
      <ToolButton title="Validate runbook" icon={ShieldCheck} onClick={onValidate} />
      <Divider />
      <ToolButton title="Zoom out" icon={ZoomOut} onClick={onZoomOut} />
      <ToolButton title="Zoom in" icon={ZoomIn} onClick={onZoomIn} />
      <ToolButton title="Fit to view" icon={Maximize2} onClick={onFitView} />
      <Divider />
      <ToolButton
        title="Delete selected"
        icon={Trash2}
        onClick={onDeleteSelected}
        disabled={!hasSelection}
        danger
      />
      <Divider />
      <ToolButton title="Export JSON" icon={Download} onClick={onExport} />
      <ToolButton title="Import JSON" icon={Upload} onClick={() => fileRef.current?.click()} />
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => void onFile(e)}
      />
    </div>
  );
}
