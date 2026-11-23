// Icônes SVG en ligne — aucune dépendance externe.
type P = { size?: number; className?: string };
const base = (size = 16) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

export const IconSearch = ({ size, className }: P) => (<svg {...base(size)} className={className}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const IconBell = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10.3 20a2 2 0 0 0 3.4 0" /></svg>);
export const IconClose = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const IconPlus = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M12 5v14M5 12h14" /></svg>);
export const IconMinus = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M5 12h14" /></svg>);
export const IconTarget = ({ size, className }: P) => (<svg {...base(size)} className={className}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>);
export const IconChevron = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="m9 6 6 6-6 6" /></svg>);
export const IconFactory = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M3 21V10l6 4V10l6 4V6l6 3v12H3z" /></svg>);
export const IconBox = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M21 8 12 3 3 8v8l9 5 9-5V8z" /><path d="m3 8 9 5 9-5M12 13v8" /></svg>);
export const IconBolt = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" /></svg>);
export const IconWave = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M2 12c3-4 5-4 8 0s5 4 8 0 3-2 4-2" /><path d="M2 18c3-4 5-4 8 0s5 4 8 0 3-2 4-2" /></svg>);
export const IconPlay = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M7 5v14l11-7z" /></svg>);
export const IconStamp = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M9 3h6l-1 7h4v4H6v-4h4L9 3z" /><path d="M5 18h14v3H5z" /></svg>);

export const VisionMark = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="1" y="1" width="22" height="22" rx="4" stroke="var(--vision-line)" />
    <path d="M6 7l6 10 6-10" stroke="var(--vision-text-primary)" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);
