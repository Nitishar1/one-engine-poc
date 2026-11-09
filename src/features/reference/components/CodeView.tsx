import type { ReactNode } from 'react';
import { isSpecialChar, specialCharHint } from '../utils/referenceUtils';

export type CodeSize = 'normal' | 'large' | 'xlarge';

const SIZE_CLASS: Record<CodeSize, string> = {
  normal: 'text-[13px] leading-[1.6]',
  large: 'text-[16px] leading-[1.65]',
  xlarge: 'text-[19px] leading-[1.7]',
};

/** Splits a line so every non-ASCII character is highlighted with a typing hint. */
function renderLine(line: string): ReactNode {
  if (!line) return ' ';
  const parts: ReactNode[] = [];
  let plain = '';
  [...line].forEach((char, i) => {
    if (!isSpecialChar(char)) {
      plain += char;
      return;
    }
    if (plain) parts.push(plain);
    plain = '';
    parts.push(
      <mark
        key={i}
        title={specialCharHint(char)}
        className="cursor-help rounded-[3px] bg-warning/25 text-fg outline outline-1 outline-warning"
      >
        {char}
      </mark>,
    );
  });
  if (plain) parts.push(plain);
  return parts;
}

interface CodeViewProps {
  content: string;
  size?: CodeSize;
  /** Line the user is typing (1-based); highlighted, lines above it are dimmed. */
  currentLine?: number;
  onLineClick?: (line: number) => void;
}

/**
 * Read-only source listing with line numbers, wrapped so long lines stay on screen. Clicking a
 * line marks it as "where I am", so the place is easy to find again while typing.
 */
export function CodeView({ content, size = 'normal', currentLine, onLineClick }: CodeViewProps) {
  const lines = content.replace(/\n+$/, '').split('\n');
  return (
    <div className="oe-card overflow-hidden">
      <table className={`w-full border-collapse font-mono ${SIZE_CLASS[size]}`}>
        <tbody>
          {lines.map((line, i) => {
            const n = i + 1;
            const isCurrent = n === currentLine;
            const isDone = currentLine !== undefined && n < currentLine;
            return (
              <tr
                key={i}
                id={`code-line-${n}`}
                onClick={() => onLineClick?.(n)}
                className={`align-top ${onLineClick ? 'cursor-pointer' : ''} ${
                  isCurrent ? 'bg-primary-soft' : 'hover:bg-hover'
                } ${isDone ? 'opacity-45' : ''}`}
              >
                <td
                  className={`w-px select-none border-r px-3 text-right ${
                    isCurrent
                      ? 'border-primary font-semibold text-primary'
                      : `border-line ${n % 5 === 0 ? 'text-fg-secondary' : 'text-fg-muted'}`
                  }`}
                >
                  {n}
                </td>
                <td className="whitespace-pre-wrap break-words px-3 text-fg [tab-size:2]">
                  {renderLine(line)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
