import dayjs from 'dayjs';
import type { ExecutionRecord, ExecutionStatus } from '@/features/dashboard/types/dashboard.types';

/** Deterministic PRNG so the generated history is stable between reloads. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RUNBOOKS = [
  'Restart IIS Service',
  'Disk Cleanup',
  'Create AD User',
  'Patch Compliance Check',
  'Certificate Renewal',
];
const TARGETS = ['OE-WEB-PRD-01', 'OE-APP-PRD-01', 'OE-SQL-PRD-01', 'OE-WEB-STG-01'];
const USERS = ['admin', 'SuperUser', 'scheduler'];

export function generateExecutions(count = 90, days = 14): ExecutionRecord[] {
  const rand = mulberry32(20261030);
  const pick = <T>(list: T[]) => list[Math.floor(rand() * list.length)];
  const now = dayjs();

  return Array.from({ length: count }, (_, i) => {
    const roll = rand();
    const status: ExecutionStatus = i < 2 ? 'Running' : roll < 0.84 ? 'Success' : 'Failed';
    return {
      id: `ex_${i + 1}`,
      runbookName: pick(RUNBOOKS),
      target: pick(TARGETS),
      triggeredBy: pick(USERS),
      status,
      startedOn: now
        .subtract(Math.floor((i / count) * days * 24 * 60) + Math.floor(rand() * 50), 'minute')
        .toISOString(),
      durationSeconds: 8 + Math.floor(rand() * 240),
    };
  });
}
