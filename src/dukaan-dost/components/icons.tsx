type IconProps = { size?: number; color?: string; strokeWidth?: number };

export function IconChevronLeft({ size = 20, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5 8 12l7 7" />
    </svg>
  );
}

export function IconCheck({ size = 19, color = "currentColor", strokeWidth = 3.2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12.5 9.5 18 20 6.5" />
    </svg>
  );
}

export function IconPlus({ size = 26, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconPhone({ size = 20, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M6.6 3.5 3.5 6.6c-.4.4-.5 1-.3 1.5 2 5 6.7 9.7 11.7 11.7.5.2 1.1.1 1.5-.3l3.1-3.1c.4-.4.4-1.1 0-1.5l-3-3c-.4-.4-1-.4-1.4-.1l-1.6 1.1c-1.9-1.1-3.5-2.7-4.6-4.6l1.1-1.6c.3-.4.3-1-.1-1.4l-3-3c-.4-.4-1-.4-1.4 0Z" />
    </svg>
  );
}

export function IconShop({ size = 50, color = "#FCF8F0" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5 5 4h14l2 5.5" />
      <path d="M4 9.5h16V20H4z" />
      <path d="M3 9.5c0 1.4 1.1 2.5 2.5 2.5S8 10.9 8 9.5c0 1.4 1.1 2.5 2.5 2.5S13 10.9 13 9.5c0 1.4 1.1 2.5 2.5 2.5S18 10.9 18 9.5" />
      <path d="M9.5 20v-5h5v5" />
    </svg>
  );
}

export function IconGoogle({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path fill="#4285F4" d="M45 24c0-1.6-.1-2.7-.4-4H24v7.5h12c-.2 2-1.5 5-4.4 7l6.8 5.3C42.4 36 45 30.6 45 24z" />
      <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.4-5.3l-6.8-5.3c-1.8 1.3-4.3 2.2-7.6 2.2-5.8 0-10.7-3.8-12.5-9.1l-7 5.4C8 41 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.5 28.5c-.5-1.4-.8-2.9-.8-4.5s.3-3.1.7-4.5l-7-5.4C3.6 17 3 20.4 3 24s.6 7 2.4 9.9l6.1-5.4z" />
      <path fill="#EA4335" d="M24 10.4c4.1 0 6.9 1.8 8.5 3.3l6.2-6C34.9 4.2 29.9 2 24 2 15.4 2 8 7 5.4 14.1l7 5.4C14.2 14.2 19.1 10.4 24 10.4z" />
    </svg>
  );
}

export function IconBoxTile({ size = 32, color = "#FFFFFF" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h18v13H3z" />
      <path d="M3 7l2.5-4h13L21 7" />
      <path d="M9 11h6" />
    </svg>
  );
}

export function IconBoxNav({ size = 26, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 8h17v12h-17z" />
      <path d="M3.5 8 6 4h12l2.5 4" />
      <path d="M9.5 12h5" />
    </svg>
  );
}

export function IconScooter({ size = 34, color = "#FFFFFF", strokeWidth = 2.1, dotR = 2.6 }: IconProps & { dotR?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="17.5" r={dotR} />
      <circle cx="18" cy="17.5" r={dotR} />
      <path d="M3 7h3l3.4 10.5H15" />
      <path d="M14 8h6v5h-6z" />
    </svg>
  );
}

export function IconBookTile({ size = 32, color = "#FFFFFF" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h13v18H6z" />
      <path d="M6 3H4.5v18H6" />
      <path d="M10 8h5" />
      <path d="M10 12h5" />
      <path d="M10 16h3" />
    </svg>
  );
}

export function IconBookNav({ size = 26, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 3.5h13v17h-13z" />
      <path d="M6.5 3.5H5v17h1.5" />
      <path d="M10 9h6" />
      <path d="M10 13h6" />
    </svg>
  );
}

export function IconTag({ size = 32, color = "#FFFFFF" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 5h9" />
      <path d="M7 8.5h9" />
      <path d="M7 12h4.5c2.6 0 4.5-1.5 4.5-3.5" />
      <path d="M7.5 12 14 19" />
    </svg>
  );
}

export function IconHomeNav({ size = 26, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 10.5 12 4l8.5 6.5V20H3.5z" />
      <path d="M9.5 20v-5.5h5V20" />
    </svg>
  );
}

export function IconGuess({ size = 19, color = "#8A6A22" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v2" />
      <path d="M12 19v2" />
      <path d="M5 12H3" />
      <path d="M21 12h-2" />
      <circle cx="12" cy="12" r="4.2" />
    </svg>
  );
}

export function IconBoxCheck({ size = 52, color = "#7A6B55" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h18v13H3z" />
      <path d="M3 7l2.5-4h13L21 7" />
      <path d="M8.5 12.5 11 15l4.5-4.5" />
    </svg>
  );
}

export function IconClock({ size = 24, color = "#3A2A08" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function IconImage({ size = 34, color = "#8A6A22" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16V6h16v12H4z" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M9 6l1.3-2h3.4L15 6" />
    </svg>
  );
}

export function IconUpload({ size = 24, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 17V5" />
      <path d="M7 10l5-5 5 5" />
      <path d="M4 19h16" />
    </svg>
  );
}

export function IconRupeeArrow({ size = 26, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 5h10" />
      <path d="M7 9h10" />
      <path d="M7 13h5c3 0 5-1.8 5-4" />
      <path d="M7 13l7 7" />
    </svg>
  );
}
