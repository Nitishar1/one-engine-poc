import dayjs from 'dayjs';
import { DATE_FORMAT, DATE_TIME_FORMAT } from './constants';

export const formatDateTime = (value?: string | null) =>
  value ? dayjs(value).format(DATE_TIME_FORMAT) : '—';

export const formatDate = (value?: string | null) =>
  value ? dayjs(value).format(DATE_FORMAT) : '—';

export const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
};

export const truncate = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max).trimEnd()}...` : value;
