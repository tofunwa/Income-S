import React, { useState } from 'react';
import { motion } from 'framer-motion';

/** Shared font + easing for hover micro-interactions */
export const interactionFont = '"Approach TRIAL", sans-serif';
export const interactionEase = [0.16, 1, 0.3, 1] as const;

// ─── Dropdown menu ────────────────────────────────────────────────────────────

export interface DropdownMenuItemConfig {
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  onClick: () => void;
}

const DropdownMenuItem: React.FC<{ item: DropdownMenuItemConfig; isLast: boolean }> = ({ item, isLast }) => {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      type="button"
      onClick={item.onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 16px',
        background: 'none',
        border: 'none',
        textAlign: 'left',
        fontSize: '14px',
        fontFamily: interactionFont,
        color: item.danger ? '#E42C2C' : '#111',
        cursor: 'pointer',
        borderBottom: isLast ? 'none' : '1px solid rgba(238,238,238,1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <motion.div
        initial={false}
        animate={{ x: hover ? 0 : '-100%' }}
        transition={{ duration: 0.25, ease: interactionEase }}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: item.danger ? 'rgba(228,44,44,0.05)' : '#F8F8F9',
          zIndex: -1,
        }}
      />
      {item.icon}
      {item.label}
    </motion.button>
  );
};

export const DropdownMenu: React.FC<{
  items: DropdownMenuItemConfig[];
  style?: React.CSSProperties;
  /** Slightly richer enter/exit for settings-style selects. */
  motionPreset?: 'default' | 'emphasized';
}> = ({ items, style, motionPreset = 'default' }) => (
  <motion.div
    initial={motionPreset === 'emphasized' ? { opacity: 0, y: -10, scale: 0.94 } : { opacity: 0, y: -6, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={motionPreset === 'emphasized' ? { opacity: 0, y: -8, scale: 0.96 } : { opacity: 0, y: -6, scale: 0.97 }}
    transition={
      motionPreset === 'emphasized'
        ? { duration: 0.26, ease: interactionEase }
        : { duration: 0.18, ease: interactionEase }
    }
    style={{
      position: 'absolute',
      backgroundColor: '#fff',
      border: '1px solid rgba(208,213,221,0.7)',
      borderRadius: '8px',
      boxShadow: '0px 8px 24px rgba(0,0,0,0.08)',
      zIndex: 100,
      minWidth: '160px',
      overflow: 'hidden',
      ...style,
    }}
  >
    {items.map((item, i) => (
      <DropdownMenuItem key={i} item={item} isLast={i === items.length - 1} />
    ))}
  </motion.div>
);

/** Label–chevron gap at rest / on hover (hover widens trigger; height unchanged). */
export const DROPDOWN_TRIGGER_GAP = { rest: 4, hover: 6 } as const;

/** Main dropdown trigger: border pill, gap animates rest→hover, tap scales X only. */
export const DropdownTriggerButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ onClick, children, style: extra }) => {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      type="button"
      whileTap={{ scaleX: 0.98, scaleY: 1 }}
      transition={{ duration: 0.18, ease: interactionEase }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '6px 16px',
        border: '1px solid rgba(208,213,221,0.5)',
        borderRadius: '8px',
        background: '#FFF',
        cursor: 'pointer',
        fontFamily: interactionFont,
        fontSize: '14px',
        ...extra,
        // After consumer styles so padding/font overrides still work, but hover gap is never overridden.
        gap: hover ? DROPDOWN_TRIGGER_GAP.hover : DROPDOWN_TRIGGER_GAP.rest,
        transition: 'gap 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
    </motion.button>
  );
};

// ─── SlidingTextSwapButton (text-only base buttons) ───────────────────────────
// "Primary" here means the shared hover *logic* (slide label up / duplicate in from below + paired fill/border shift),
// not "always a black button". Icon buttons and dropdown triggers use different patterns.
// Variants: secondary + primary (black) were first; danger (red fill) + dangerOutline (red border / red text) extend the same motion.
// primary / danger: only backgroundColor tweens; label stays fixed white.
// secondary / dangerOutline: tween bg + color + borderColor.

export type SlidingTextVariant =
  | 'secondary'
  | 'primary'
  | 'danger'
  | 'dangerOutline'
  /** Red outline + red label at rest; hover → solid red fill, white label, no separate border ring (Profile Delete Account). */
  | 'dangerOutlineToSolid'
  /** Transparent bg, red text, soft pink border; hover → #FFDCDC fill (e.g. Expenses “View overdue”). */
  | 'softRedOutline';

export const SlidingTextSwapButton: React.FC<{
  label: string;
  variant: SlidingTextVariant;
  onClick: () => void;
  style?: React.CSSProperties;
  disabled?: boolean;
}> = ({ label, variant, onClick, style: extraStyle, disabled }) => {
  const [hovered, setHovered] = useState(false);
  const effectiveHover = disabled ? false : hovered;

  const isFixedWhite = variant === 'primary' || variant === 'danger';
  const labelLineHeightPx = 18;

  const border = variant === 'primary' || variant === 'danger' ? 'none' : '1px solid';

  let borderColorRest = '#D0D5DD';
  let borderColorHover = 'rgba(208, 213, 221, 0.9)';
  let backgroundRest = '#fff';
  let backgroundHover = '#FAFAFA';
  let textColorRest = '#111';
  let textColorHover = '#5A5A5A';

  if (variant === 'primary') {
    backgroundRest = '#000';
    backgroundHover = '#363636';
  } else if (variant === 'danger') {
    backgroundRest = '#E42C2C';
    backgroundHover = '#F84E4E';
  } else if (variant === 'dangerOutline') {
    borderColorRest = '#E42C2C';
    borderColorHover = '#E42C2C';
    textColorRest = '#E42C2C';
    textColorHover = '#C91F1F';
    backgroundRest = '#fff';
    backgroundHover = '#FFF5F5';
  } else if (variant === 'dangerOutlineToSolid') {
    borderColorRest = '#E42C2C';
    borderColorHover = '#E42C2C';
    textColorRest = '#E42C2C';
    textColorHover = '#FFFFFF';
    backgroundRest = '#fff';
    backgroundHover = '#E42C2C';
  } else if (variant === 'softRedOutline') {
    borderColorRest = '#F3A4A4';
    borderColorHover = '#F3A4A4';
    textColorRest = '#E42C2C';
    textColorHover = '#C91F1F';
    backgroundRest = 'transparent';
    backgroundHover = '#FFEAEA';
  }

  return (
    <motion.button
      type="button"
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial="rest"
      animate={effectiveHover ? 'hover' : 'rest'}
      variants={
        isFixedWhite
          ? {
              rest: { backgroundColor: backgroundRest, opacity: disabled ? 0.5 : 1 },
              hover: { backgroundColor: backgroundHover, opacity: disabled ? 0.5 : 1 },
            }
          : {
              rest: {
                backgroundColor: backgroundRest,
                color: textColorRest,
                borderColor: borderColorRest,
                opacity: disabled ? 0.5 : 1,
              },
              hover: {
                backgroundColor: backgroundHover,
                color: textColorHover,
                borderColor: borderColorHover,
                opacity: disabled ? 0.5 : 1,
              },
            }
      }
      transition={
        isFixedWhite
          ? { backgroundColor: { duration: 0.16, ease: interactionEase } }
          : { duration: 0.16, ease: interactionEase }
      }
      style={{
        border,
        borderRadius: '8px',
        padding: '9px 20px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...(isFixedWhite ? { color: '#FFFFFF' } : {}),
        pointerEvents: disabled ? 'none' : 'auto',
        ...extraStyle,
      }}
    >
      <div style={{ height: `${labelLineHeightPx}px`, overflow: 'hidden' }}>
        <motion.div
          style={{ display: 'flex', flexDirection: 'column' }}
          animate={{ y: effectiveHover ? -labelLineHeightPx : 0 }}
          transition={{ duration: 0.18, ease: 'easeInOut' }}
        >
          {[0, 1].map(i => (
            <div
              key={i}
              style={{
                height: `${labelLineHeightPx}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '14px',
                  fontFamily: interactionFont,
                  lineHeight: `${labelLineHeightPx}px`,
                  height: `${labelLineHeightPx}px`,
                  display: 'block',
                  color: isFixedWhite ? '#FFFFFF' : 'currentColor',
                  WebkitTextFillColor: isFixedWhite ? '#FFFFFF' : undefined,
                  opacity: isFixedWhite ? 1 : undefined,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.button>
  );
};

// ─── CloseButton (X close button with grey circular bg + rotation on hover) ─────
// Pattern A from Home/Analytics pages: SVG-based X with coordinated parent-child animation
// Grey circular background fill on hover + 180-degree X rotation

export const CloseButton: React.FC<{
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
  iconColor?: string;
}> = ({ onClick, size = 'md', style: extraStyle, iconColor = '#888' }) => {
  const dimensions = {
    sm: { button: 24, icon: 16, stroke: 1.5 },
    md: { button: 28, icon: 20, stroke: 1.8 },
    lg: { button: 32, icon: 24, stroke: 2 },
  }[size];

  return (
    <motion.button
      onClick={onClick}
      initial="rest"
      animate="rest"
      whileHover="hover"
      variants={{
        rest: { backgroundColor: 'rgba(0,0,0,0)' },
        hover: { backgroundColor: 'rgba(0,0,0,0.04)' },
      }}
      transition={{ duration: 0.2, ease: interactionEase }}
      style={{
        width: dimensions.button,
        height: dimensions.button,
        background: 'none',
        border: 'none',
        borderRadius: '999px',
        cursor: 'pointer',
        padding: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...extraStyle,
      }}
    >
      <motion.svg
        width={dimensions.icon}
        height={dimensions.icon}
        viewBox={`0 0 ${dimensions.icon} ${dimensions.icon}`}
        fill="none"
        variants={{
          rest: { rotate: 0 },
          hover: { rotate: 180 },
        }}
        transition={{ duration: 0.24, ease: interactionEase }}
        style={{ transformOrigin: '50% 50%' }}
      >
        <path
          d={`M${dimensions.icon * 0.3} ${dimensions.icon * 0.3}L${dimensions.icon * 0.7} ${dimensions.icon * 0.7}`}
          stroke={iconColor}
          strokeWidth={dimensions.stroke}
          strokeLinecap="round"
        />
        <path
          d={`M${dimensions.icon * 0.7} ${dimensions.icon * 0.3}L${dimensions.icon * 0.3} ${dimensions.icon * 0.7}`}
          stroke={iconColor}
          strokeWidth={dimensions.stroke}
          strokeLinecap="round"
        />
      </motion.svg>
    </motion.button>
  );
};
