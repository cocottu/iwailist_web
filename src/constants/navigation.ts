export type NavigationItem = {
  path: string;
  label: string;
  icon: string;
};

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { path: '/', label: 'ホーム', icon: '🏠' },
  { path: '/gifts', label: '贈答品', icon: '🎁' },
  { path: '/persons', label: '人物', icon: '👤' },
  { path: '/returns', label: 'お返し', icon: '↩️' },
  { path: '/reminders', label: 'リマインダー', icon: '⏰' },
  { path: '/statistics', label: '統計', icon: '📊' },
  { path: '/data-management', label: 'データ管理', icon: '💾' },
  { path: '/settings', label: '設定', icon: '⚙️' },
];

export const PRIMARY_NAV_PATHS = ['/', '/gifts', '/persons', '/returns', '/reminders'] as const;

export const PRIMARY_NAV_ITEMS = NAVIGATION_ITEMS.filter((item) =>
  PRIMARY_NAV_PATHS.includes(item.path as (typeof PRIMARY_NAV_PATHS)[number])
);

export const SECONDARY_NAV_ITEMS = NAVIGATION_ITEMS.filter(
  (item) => !PRIMARY_NAV_PATHS.includes(item.path as (typeof PRIMARY_NAV_PATHS)[number])
);
