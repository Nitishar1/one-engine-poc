import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Checkbox, Input } from 'antd';
import { ArrowLeft, ArrowRight, BookOpen, Check, Copy, Search } from 'lucide-react';
import { AppButton } from '@/components/common/AppButton';
import { toast } from '@/components/feedback/toastStore';
import { BrandMark } from '@/components/layout/BrandMark';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ROUTES } from '@/config/routes';
import { useHotkey } from '@/hooks/useHotkey';
import { APP_CONFIG, STORAGE_KEYS } from '@/utils/constants';
import { CodeView } from '../components/CodeView';
import { SetupGuide } from '../components/SetupGuide';
import { GROUP_LABELS, GROUP_ORDER, SOURCE_FILES, countSpecialChars } from '../utils/sourceFiles';

const required = SOURCE_FILES.filter((f) => f.group === 'required');
const requiredLines = required.reduce((sum, f) => sum + f.lines, 0);

function readDone(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.typingProgress) ?? '[]'));
  } catch {
    return new Set();
  }
}

/** Ticked-off files, kept per browser so progress survives reloads. */
function useDoneFiles() {
  const [done, setDone] = useState(readDone);
  const toggle = (path: string, value: boolean) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (value) next.add(path);
      else next.delete(path);
      try {
        localStorage.setItem(STORAGE_KEYS.typingProgress, JSON.stringify([...next]));
      } catch {
        // Storage unavailable (private window): progress lasts for this visit only.
      }
      return next;
    });
  return { done, toggle };
}

/**
 * Typing reference: every project file in the order it should be retyped on a machine with
 * no way to copy files across. Public route so it can be opened without signing in.
 */
export default function ReferencePage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState('');
  const { done, toggle } = useDoneFiles();
  const mainRef = useRef<HTMLElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  const path = params.get('file');
  const index = SOURCE_FILES.findIndex((f) => f.path === path);
  const file = index >= 0 ? SOURCE_FILES[index] : undefined;

  const open = (next?: string) => setParams(next ? { file: next } : {});
  const step = (delta: number) => {
    const target = index + delta;
    if (target < 0) open();
    else if (target < SOURCE_FILES.length) open(SOURCE_FILES[target].path);
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
    document.title = `${file ? file.path : 'Typing reference'} · ${APP_CONFIG.name}`;
    mainRef.current?.scrollTo({ top: 0 });
    activeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [file]);

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q ? SOURCE_FILES.filter((f) => f.path.toLowerCase().includes(q)) : SOURCE_FILES;
  }, [filter]);

  const doneRequired = required.filter((f) => done.has(f.path));
  const doneLines = doneRequired.reduce((sum, f) => sum + f.lines, 0);
  const percent = Math.round((doneLines / requiredLines) * 100);

  return (
    <div className="flex h-screen flex-col bg-bg text-fg">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-header px-4">
        <BrandMark size={26} />
        <div className="min-w-0">
          <p className="m-0 truncate text-[14px] font-semibold leading-tight">Typing reference</p>
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
            {GROUP_ORDER.map((group) => {
              const items = visible.filter((f) => f.group === group);
              if (!items.length) return null;
              return (
                <div key={group} className="mb-2">
                  <p className="m-0 px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
                    {GROUP_LABELS[group]}
                  </p>
                  {items.map((f) => {
                    const n = SOURCE_FILES.indexOf(f) + 1;
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
                    disabled={index === SOURCE_FILES.length - 1}
                    onClick={() => step(1)}
                  >
                    Next
                  </AppButton>
                </div>
              </div>
              <CodeView content={file.content} />
            </>
          ) : (
            <SetupGuide requiredFiles={required.length} requiredLines={requiredLines} />
          )}
        </main>
      </div>
    </div>
  );
}
