import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Checkbox, Input, Segmented, Tooltip } from 'antd';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  Download,
  FolderDown,
  Search,
} from 'lucide-react';
import { AppButton } from '@/components/common/AppButton';
import { toast } from '@/components/feedback/toastStore';
import { BrandMark } from '@/components/layout/BrandMark';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ROUTES } from '@/config/routes';
import { useHotkey } from '@/hooks/useHotkey';
import { APP_CONFIG } from '@/utils/constants';
import { countSpecialChars, type ReferenceGroup, type SourceFile } from '../utils/referenceUtils';
import { createZip, downloadBlob, downloadText } from '../utils/download';
import { CodeView, type CodeSize } from './CodeView';

/** Small per-browser setting (text size, marked lines); falls back to `initial`. */
function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  const update = (next: T) => {
    setValue(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Storage unavailable: the setting lasts for this visit only.
    }
  };
  return [value, update] as const;
}

function readDone(storageKey: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(storageKey) ?? '[]'));
  } catch {
    return new Set();
  }
}

/** Ticked-off files, kept per browser so progress survives reloads. */
function useDoneFiles(storageKey: string) {
  const [done, setDone] = useState(() => readDone(storageKey));
  const toggle = (path: string, value: boolean) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (value) next.add(path);
      else next.delete(path);
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {
        // Storage unavailable (private window): progress lasts for this visit only.
      }
      return next;
    });
  return { done, toggle };
}

interface ReferenceViewerProps {
  title: string;
  /** Files in the order they should be typed. */
  files: SourceFile[];
  groups: ReferenceGroup[];
  /** localStorage key for the ticked-off files; one per project. */
  storageKey: string;
  /** Folder / zip name for "Download all", e.g. oneEngine_lite. */
  downloadName: string;
  /** Shown before the first file; receives the size of the required files. */
  renderSetup: (required: { files: number; lines: number }) => ReactNode;
}

/**
 * Typing reference: every file of a project in the order it should be retyped on a machine
 * with no way to copy files across, with progress, special-character hints and copy.
 */
export function ReferenceViewer({
  title,
  files,
  groups,
  storageKey,
  downloadName,
  renderSetup,
}: ReferenceViewerProps) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState('');
  const { done, toggle } = useDoneFiles(storageKey);
  const required = useMemo(() => {
    const ids = groups.filter((g) => g.required).map((g) => g.id);
    return files.filter((f) => ids.includes(f.group));
  }, [files, groups]);
  const requiredLines = required.reduce((sum, f) => sum + f.lines, 0);
  const mainRef = useRef<HTMLElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  const path = params.get('file');
  const index = files.findIndex((f) => f.path === path);
  const file = index >= 0 ? files[index] : undefined;

  const open = (next?: string) => setParams(next ? { file: next } : {});
  const step = (delta: number) => {
    const target = index + delta;
    if (target < 0) open();
    else if (target < files.length) open(files[target].path);
  };

  const [codeSize, setCodeSize] = useStoredState<CodeSize>(`${storageKey}:size`, 'normal');
  const [markedLines, setMarkedLines] = useStoredState<Record<string, number>>(
    `${storageKey}:lines`,
    {},
  );

  /** Whole project as a .zip, for machines where copy / paste is blocked. */
  const downloadAll = () => {
    downloadBlob(
      `${downloadName}.zip`,
      createZip(files.map((f) => ({ path: `${downloadName}/${f.path}`, content: f.content }))),
    );
    void toast.success(`Downloading ${files.length} files as ${downloadName}.zip`);
  };

  const copy = async () => {
    if (!file) return;
    try {
      await navigator.clipboard.writeText(file.content);
      void toast.success(`Copied ${file.path}`);
    } catch {
      void toast.error('Clipboard is not available');
    }
  };

  useHotkey('ArrowRight', () => step(1));
  useHotkey('ArrowLeft', () => step(-1));

  useEffect(() => {
    document.title = `${file ? file.path : title} · ${APP_CONFIG.name}`;
    mainRef.current?.scrollTo({ top: 0 });
    activeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [file, title]);

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q ? files.filter((f) => f.path.toLowerCase().includes(q)) : files;
  }, [filter, files]);

  const doneRequired = required.filter((f) => done.has(f.path));
  const doneLines = doneRequired.reduce((sum, f) => sum + f.lines, 0);
  const percent = requiredLines ? Math.round((doneLines / requiredLines) * 100) : 0;

  return (
    <div className="flex h-screen flex-col bg-bg text-fg">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-header px-4">
        <BrandMark size={26} />
        <div className="min-w-0">
          <p className="m-0 truncate text-[14px] font-semibold leading-tight">{title}</p>
          <p className="m-0 truncate text-[12px] text-fg-muted">
            {doneRequired.length} / {required.length} files · {doneLines.toLocaleString()} /{' '}
            {requiredLines.toLocaleString()} lines
          </p>
        </div>
        <div className="mx-2 hidden h-1.5 w-40 overflow-hidden rounded-full bg-surface-sunken sm:block">
          <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
        </div>
        <span className="hidden text-[12px] tabular-nums text-fg-muted sm:inline">{percent}%</span>
        <div className="ml-auto flex items-center gap-2">
          <Tooltip title="Text size of the code">
            <Segmented<CodeSize>
              size="small"
              value={codeSize}
              onChange={setCodeSize}
              options={[
                { label: 'A', value: 'normal' },
                { label: 'A+', value: 'large' },
                { label: 'A++', value: 'xlarge' },
              ]}
            />
          </Tooltip>
          <AppButton tone="secondary" icon={<FolderDown size={15} />} onClick={downloadAll}>
            Download all (.zip)
          </AppButton>
          <ThemeToggle />
          <AppButton tone="secondary" onClick={() => navigate(ROUTES.home)}>
            Open app
          </AppButton>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex max-h-[40vh] shrink-0 flex-col border-b border-line bg-surface lg:max-h-none lg:w-[340px] lg:border-b-0 lg:border-r">
          <div className="p-3">
            <Input
              allowClear
              placeholder="Filter files"
              prefix={<Search size={14} className="text-fg-muted" />}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            <button
              type="button"
              ref={file ? undefined : activeRef}
              onClick={() => open()}
              className={`mb-2 flex w-full cursor-pointer items-center gap-2 rounded-[var(--oe-radius)] border-0 px-2.5 py-2 text-left text-[13px] ${
                file
                  ? 'bg-transparent text-fg-secondary hover:bg-hover'
                  : 'bg-active font-medium text-fg'
              }`}
            >
              <BookOpen size={15} /> Setup & instructions
            </button>
            {groups.map((group) => {
              const items = visible.filter((f) => f.group === group.id);
              if (!items.length) return null;
              return (
                <div key={group.id} className="mb-2">
                  <p className="m-0 px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
                    {group.label}
                  </p>
                  {items.map((f) => {
                    const n = files.indexOf(f) + 1;
                    const active = f === file;
                    const isDone = done.has(f.path);
                    return (
                      <div
                        key={f.path}
                        className={`flex items-center gap-2 rounded-[var(--oe-radius)] px-2.5 ${
                          active ? 'bg-active' : 'hover:bg-hover'
                        }`}
                      >
                        <Checkbox
                          checked={isDone}
                          onChange={(e) => toggle(f.path, e.target.checked)}
                          aria-label={`Mark ${f.path} as typed`}
                        />
                        <button
                          type="button"
                          ref={active ? activeRef : undefined}
                          onClick={() => open(f.path)}
                          title={f.path}
                          className={`flex min-w-0 flex-1 cursor-pointer items-center gap-2 border-0 bg-transparent p-0 py-1.5 text-left font-mono text-[12px] ${
                            isDone
                              ? 'text-fg-muted line-through'
                              : active
                                ? 'text-fg'
                                : 'text-fg-secondary'
                          }`}
                        >
                          <span className="w-7 shrink-0 text-right text-fg-muted">{n}</span>
                          {/* Folder truncates first so the file name always stays visible. */}
                          <span className="min-w-0 truncate opacity-70">
                            {f.path.slice(0, f.path.lastIndexOf('/') + 1)}
                          </span>
                          <span className="-ml-2 shrink-0">
                            {f.path.slice(f.path.lastIndexOf('/') + 1)}
                          </span>
                          <span className="ml-auto shrink-0 tabular-nums text-fg-muted">
                            {f.lines}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </aside>

        <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
          {file ? (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="rounded-[var(--oe-radius-sm)] bg-primary px-2 py-0.5 text-[12px] font-semibold text-on-primary">
                  {index + 1}
                </span>
                <h1 className="m-0 min-w-0 break-all font-mono text-[16px] font-semibold">
                  {file.path}
                </h1>
                <span className="text-[12.5px] text-fg-muted">
                  {file.lines} lines
                  {countSpecialChars(file.content) > 0 &&
                    ` · ${countSpecialChars(file.content)} special characters`}
                </span>
                <div className="ml-auto flex gap-2">
                  <AppButton tone="secondary" icon={<Copy size={15} />} onClick={copy}>
                    Copy
                  </AppButton>
                  <AppButton
                    tone="secondary"
                    icon={<Download size={15} />}
                    onClick={() =>
                      downloadText(file.path.split('/').pop() ?? 'file.txt', file.content)
                    }
                  >
                    Download
                  </AppButton>
                  <AppButton
                    tone="secondary"
                    icon={<ArrowLeft size={15} />}
                    onClick={() => step(-1)}
                  >
                    Prev
                  </AppButton>
                  <AppButton
                    icon={<Check size={15} />}
                    onClick={() => {
                      toggle(file.path, true);
                      step(1);
                    }}
                  >
                    Done & next
                  </AppButton>
                  <AppButton
                    tone="secondary"
                    icon={<ArrowRight size={15} />}
                    iconPlacement="end"
                    disabled={index === files.length - 1}
                    onClick={() => step(1)}
                  >
                    Next
                  </AppButton>
                </div>
              </div>
              <p className="m-0 mb-2 text-[12.5px] text-fg-muted">
                Click a line to mark where you are; lines above it are dimmed.
              </p>
              <CodeView
                content={file.content}
                size={codeSize}
                currentLine={markedLines[file.path]}
                onLineClick={(line) => setMarkedLines({ ...markedLines, [file.path]: line })}
              />
            </>
          ) : (
            renderSetup({ files: required.length, lines: requiredLines })
          )}
        </main>
      </div>
    </div>
  );
}
