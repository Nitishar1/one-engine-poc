import type { ReactNode } from 'react';
import { isSpecialChar, specialCharHint } from '../utils/sourceFiles';

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

/** Read-only source listing with line numbers, wrapped so long lines stay on screen. */
export function CodeView({ content }: { content: string }) {
  const lines = content.replace(/\n+$/, '').split('\n');
  return (
    <div className="oe-card overflow-hidden">
      <table className="w-full border-collapse font-mono text-[13px] leading-[1.6]">
        <tbody>
          {lines.map((line, i) => (
            <tr key={i} className="align-top hover:bg-hover">
              <td
                className={`w-px select-none border-r border-line px-3 text-right ${
                  (i + 1) % 5 === 0 ? 'text-fg-secondary' : 'text-fg-muted'
                }`}
              >
                {i + 1}
              </td>
              <td className="whitespace-pre-wrap break-words px-3 text-fg [tab-size:2]">
                {renderLine(line)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
