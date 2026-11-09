/** Shared helpers for the typing reference pages (/ref, /ref2). */

export interface SourceFile {
  path: string;
  content: string;
  lines: number;
  /** Id of a `ReferenceGroup`; files are listed under their group's heading. */
  group: string;
}

/** A heading in the file list. Only `required` groups count towards progress. */
export interface ReferenceGroup {
  id: string;
  label: string;
  required?: boolean;
}

export const countLines = (content: string) => content.replace(/\n+$/, '').split('\n').length;

/** Windows `mkdir` line (PowerShell) that creates every folder of a file list in one go. */
export function mkdirCommand(files: SourceFile[], extraDirs: string[] = []) {
  const dirs = new Set([
    ...files
      .filter((f) => f.path.includes('/'))
      .map((f) => f.path.slice(0, f.path.lastIndexOf('/'))),
    ...extraDirs,
  ]);
  return `mkdir ${[...dirs]
    .map((dir) => dir.replaceAll('/', '\\'))
    .sort()
    .join(', ')}`;
}

/** How to type each non-ASCII character used in the sources on a Windows keyboard. */
const SPECIAL_CHARS: Record<string, { name: string; alt?: string }> = {
  '…': { name: 'Horizontal Ellipsis', alt: '0133' },
  '—': { name: 'Em Dash', alt: '0151' },
  '–': { name: 'En Dash', alt: '0150' },
  '·': { name: 'Middle Dot', alt: '0183' },
  '’': { name: 'Right Single Quotation Mark', alt: '0146' },
  '“': { name: 'Left Double Quotation Mark', alt: '0147' },
  '”': { name: 'Right Double Quotation Mark', alt: '0148' },
  '©': { name: 'Copyright Sign', alt: '0169' },
  '€': { name: 'Euro Sign', alt: '0128' },
  '•': { name: 'Bullet', alt: '0149' },
  '›': { name: 'Single Right-Pointing Angle Quotation Mark', alt: '0155' },
  '→': { name: 'Rightwards Arrow' },
  '↑': { name: 'Upwards Arrow' },
  '↓': { name: 'Downwards Arrow' },
  '↵': { name: 'Downwards Arrow With Corner Leftwards' },
  '⌘': { name: 'Place Of Interest Sign' },
  '₹': { name: 'Indian Rupee Sign' },
};

export const isSpecialChar = (char: string) => char.charCodeAt(0) > 127;

export function specialCharHint(char: string) {
  const code = `U+${char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`;
  const info = SPECIAL_CHARS[char];
  if (!info) return `${code} - Character Map: search ${code}`;
  const how = info.alt ? `Alt+${info.alt}` : `Character Map: search "${info.name}"`;
  return `${code} ${info.name} - ${how}`;
}

export const countSpecialChars = (content: string) => [...content].filter(isSpecialChar).length;
