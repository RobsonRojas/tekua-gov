/* eslint-disable @typescript-eslint/no-explicit-any */

export const normalizeSearchText = (value: unknown): string =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

const localized = (value: any): string => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return [value.pt, value.en].filter(Boolean).join(' ');
  return String(value);
};

/** Builds one normalized string with every searchable field of an activity. */
export const buildActivitySearchText = (activity: any, statusLabel = ''): string => {
  if (!activity) return '';
  const executors = Array.isArray(activity.executors)
    ? activity.executors.map((e: any) => e?.full_name)
    : [];
  const parts = [
    localized(activity.title),
    localized(activity.description),
    activity.requester?.full_name,
    activity.worker?.full_name,
    ...executors,
    activity.project?.name,
    localized(activity.category?.name),
    activity.protocol?.title,
    activity.status,
    statusLabel
  ];
  return normalizeSearchText(parts.filter(Boolean).join(' '));
};

/** Keeps activities containing every whitespace-separated term, in any order. */
export const filterActivitiesBySearch = (
  activities: any[] | null | undefined,
  term: string,
  getStatusLabel?: (status: string) => string
): any[] => {
  const list = activities || [];
  const terms = normalizeSearchText(term).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return list;
  return list.filter((a) => {
    const text = buildActivitySearchText(a, getStatusLabel?.(a?.status) ?? '');
    return terms.every((q) => text.includes(q));
  });
};
