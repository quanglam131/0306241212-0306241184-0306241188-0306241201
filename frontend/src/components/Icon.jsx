/** Bo icon nho dang SVG (khong can thu vien ngoai). */
const PATHS = {
  menu: 'M4 6h16M4 12h16M4 18h16',
  plus: 'M12 5v14M5 12h14',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z',
  trash: 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  lock: 'M6 11h12v9H6ZM8 11V8a4 4 0 0 1 8 0v3',
  settings: 'M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1M15 4v4M9 10v4M17 16v4',
  notes: 'M6 3h9l4 4v14H6ZM14 3v5h5M9 13h7M9 17h5',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM21 21l-5-5',
  x: 'M6 6l12 12M18 6 6 18',
  folder: 'M3 6h6l2 2h10v11H3Z',
};

export default function Icon({ name, size = 18 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
