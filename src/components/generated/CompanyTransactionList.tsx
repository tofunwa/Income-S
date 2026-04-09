import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { ContactsContent } from './ContactsContent';
import { IncomesContent } from './IncomesContent';
import { ExpensesContent } from './ExpensesContent';
import { SettingsPage } from './SettingsPage';
import { HelpPage } from './HelpPage';
import {
  DropdownMenu,
  DropdownTriggerButton,
  DROPDOWN_TRIGGER_GAP,
  SlidingTextSwapButton,
} from './interactionPrimitives';

export { DropdownMenu, DropdownTriggerButton, DROPDOWN_TRIGGER_GAP, SlidingTextSwapButton };

// ─── Types ────────────────────────────────────────────────────────────────────

interface SidebarItemProps {
  Icon: React.FC<{ isHovered?: boolean; color?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

interface Transaction {
  id: number;
  company: string;
  logo: string;
  logoBg: string;
  date: string;
  description: string;
  amount: string;
  type: 'income' | 'expense';
  tag?: string;
  recurring?: string;
  notes?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TRANSACTIONS: Transaction[] = [
  { id: 0, company: 'Augment LLC - Financial services company', logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/f4f353a7-30fa-4422-a2a3-a40095dbb40c.svg', logoBg: 'rgba(255, 255, 255, 1)', date: '6 Dec, 2023', description: 'Internet bill', amount: '-$24.00', type: 'expense', recurring: 'Monthly', notes: 'Office internet subscription — fiber plan.' },
  { id: 1, company: 'FierceExchance Inc - Foreign exchange company', logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/622f2a7a-9904-4980-93ec-eb69d646960d.svg', logoBg: 'rgba(255, 75, 75, 1)', date: '5 Dec, 2023', description: 'Trade: Buy', amount: '+$360.00', type: 'income', tag: 'Exchange', notes: 'USD/EUR buy order executed.' },
  { id: 2, company: 'FierceExchance Inc - Foreign exchange company', logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/8324691d-bcea-4405-a771-82e907870bf0.svg', logoBg: 'rgba(255, 75, 75, 1)', date: '5 Jan, 2023', description: 'Trade: Sell', amount: '-$340.00', type: 'expense', tag: 'Exchange', notes: 'EUR/GBP sell order executed.' },
  { id: 3, company: 'Augment LLC - Financial services company', logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/54fe0b06-3c3d-4453-aa7e-6d0ce865d250.svg', logoBg: 'rgba(255, 255, 255, 1)', date: '4 Jan, 2023', description: 'Electricity bill', amount: '-$15.00', type: 'expense', recurring: 'Monthly', notes: 'Office electricity — winter rate.' },
  { id: 4, company: 'Webflow - Website building and hosting', logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/9ee4912a-e537-4010-8749-188c651eba05.svg', logoBg: 'rgba(67, 83, 255, 1)', date: '4 Jan, 2023', description: 'Web. maintenance', amount: '-$45.00', type: 'expense', recurring: 'Monthly', notes: 'Webflow site plan — business tier.' },
];

const COMPANY_INFO: Record<string, { since: string; totalThisYear: string }> = {
  'Augment LLC - Financial services company': { since: 'March 2021', totalThisYear: '$2,400.00' },
  'FierceExchance Inc - Foreign exchange company': { since: 'July 2022', totalThisYear: '$4,200.00' },
  'Webflow - Website building and hosting': { since: 'January 2023', totalThisYear: '$540.00' },
};

const PERIOD_OPTIONS = ['This Week', 'This Month', 'This Quarter', 'This Year'];

const PERIOD_STATS: Record<string, { total: string; tax: string; spent: string; net: string; label: string; summary: string }> = {
  'This Week':    { total: '$320.00',    tax: '-$28.00',    spent: '-$145.00',   net: '$292.00',    label: 'This Week:',  summary: 'Income up 5%\nExpenses down 3%' },
  'This Month':   { total: '$1,100.00',  tax: '-$100.00',   spent: '-$600.24',   net: '$1,000.00',  label: 'November:',   summary: 'Income increased by 10%\nExpenses increased by 10%' },
  'This Quarter': { total: '$4,200.00',  tax: '-$380.00',   spent: '-$2,100.00', net: '$3,820.00',  label: 'Q4:',         summary: 'Income up 18%\nExpenses up 12%' },
  'This Year':    { total: '$18,500.00', tax: '-$1,650.00', spent: '-$8,400.00', net: '$16,850.00', label: '2023:',       summary: 'Best quarter: Q3\nHighest expense: March' },
};

const NOTIFICATIONS = [
  { id: 1, text: 'New income recorded from FierceExchance Inc', time: '2 min ago', unread: true },
  { id: 2, text: 'Monthly report for November is ready', time: '1 hr ago', unread: true },
  { id: 3, text: 'Webflow subscription renewed automatically', time: '3 hrs ago', unread: false },
  { id: 4, text: 'Storage usage reached 25% of your plan', time: 'Yesterday', unread: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const font = '"Approach TRIAL", sans-serif';

// Easing curve — snappy spring feel
const ease = [0.16, 1, 0.3, 1] as const;

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onClose]);
}

function useEscapeKey(onClose: () => void, active = true) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, active]);
}

// ─── CountUp ──────────────────────────────────────────────────────────────────
// Animates a formatted dollar string from 0 to its value. Re-fires on value change.

const CountUp: React.FC<{ rawValue: string; style?: React.CSSProperties }> = ({ rawValue, style }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const isNeg = rawValue.startsWith('-');
    const isPos = rawValue.startsWith('+');
    const prefix = isNeg ? '-$' : isPos ? '+$' : '$';
    const num = parseFloat(rawValue.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return;

    const controls = animate(0, num, {
      duration: 1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (nodeRef.current) {
          nodeRef.current.textContent = `${prefix}${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
      },
    });
    return () => controls.stop();
  }, [rawValue]);

  return <span ref={nodeRef} style={style}>{rawValue}</span>;
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const PencilIcon = ({ size = 16, color = '#666', isHovered }: { size?: number; color?: string; isHovered?: boolean }) => (
  <motion.svg width={size} height={size} viewBox="0 0 16 16" fill="none" initial="rest" animate={isHovered ? 'draw' : 'rest'} variants={{ rest: {}, draw: {} }}>
    <motion.path
      d="M11.5 1.5L14.5 4.5L5 14H2V11L11.5 1.5Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={{
        rest: { pathLength: 1 },
        draw: { pathLength: [1, 0, 1], transition: { duration: 0.45, times: [0, 0.5, 1] } },
      }}
    />
  </motion.svg>
);

const ChevronRightIcon = ({ size = 16, color = '#666', isHovered }: { size?: number; color?: string; isHovered?: boolean }) => (
  <motion.svg width={size} height={size} viewBox="0 0 16 16" fill="none" initial="rest" animate={isHovered ? 'draw' : 'rest'} variants={{ rest: {}, draw: {} }}>
    <motion.path
      d="M6 3L11 8L6 13"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={{
        rest: { pathLength: 1 },
        draw: { pathLength: [1, 0, 1], transition: { duration: 0.4, times: [0, 0.5, 1] } },
      }}
    />
  </motion.svg>
);

// Home: Lucide-style — static house, animated door-only path draw
const homeDoorVariants = {
  rest: { pathLength: 1, opacity: 1 },
  hover: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: { duration: 0.4, opacity: { duration: 0.18 } },
  },
};
const HomeIcon: React.FC<{ isHovered?: boolean; color?: string }> = ({ color = '#888', isHovered }) => (
  <motion.svg
    width={16}
    height={16}
    viewBox="0 0 13 14"
    fill="none"
    initial={false}
    animate={isHovered ? 'hover' : 'rest'}
    style={{ flexShrink: 0, overflow: 'visible' }}
  >
    {/* Static house outline (roof + walls) */}
    <path
      d="M0.834961 5.03499L6.23496 0.834991L11.635 5.03499V11.635C11.635 11.9533 11.5085 12.2585 11.2835 12.4835C11.0584 12.7086 10.7532 12.835 10.435 12.835H2.03496C1.7167 12.835 1.41148 12.7086 1.18643 12.4835C0.961389 12.2585 0.834961 11.9533 0.834961 11.635V5.03499Z"
      stroke={color}
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Door-only path draw on hover */}
    <motion.path
      d="M4.43496 12.835V6.83499H8.03496V12.835"
      stroke={color}
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={homeDoorVariants}
    />
  </motion.svg>
);

const analyticsBarVariants = {
  // Default: full bar visible
  rest: { pathLength: 1, opacity: 1 },
  // Hover: bar path is quickly redrawn (bottom → top)
  hover: {
    pathLength: [1, 0, 1],
    opacity: [1, 0.7, 1],
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};
const AnalyticsIcon: React.FC<{ isHovered?: boolean; color?: string }> = ({ color = '#888', isHovered }) => (
  <motion.svg
    width={16}
    height={16}
    viewBox="0 0 11 14"
    fill="none"
    initial={false}
    animate={isHovered ? 'hover' : 'rest'}
    variants={{ rest: {}, hover: { transition: { staggerChildren: 0.08 } } }}
    style={{ flexShrink: 0 }}
  >
    {/* smallest bar (left) grows first */}
    <motion.path
      d="M0.834961 12.835V9.83499"
      stroke={color}
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={analyticsBarVariants}
      style={{ transformOrigin: '0.83px 12.835px' }}
    />
    {/* middle bar */}
    <motion.path
      d="M5.33496 12.835V5.33499"
      stroke={color}
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={analyticsBarVariants}
      style={{ transformOrigin: '5.33px 12.835px' }}
    />
    {/* tallest bar (right) grows last */}
    <motion.path
      d="M9.83496 12.835V0.834991"
      stroke={color}
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={analyticsBarVariants}
      style={{ transformOrigin: '9.83px 12.835px' }}
    />
  </motion.svg>
);

const contactsContainer = { rest: {}, hover: { transition: { staggerChildren: 0.05 } } };
const contactsDrawVariants = {
  // Default: fully drawn
  rest: { pathLength: 1, opacity: 1 },
  // Hover: redraw path
  hover: {
    pathLength: [1, 0, 1],
    opacity: [1, 0.6, 1],
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};
const ContactsIcon: React.FC<{ isHovered?: boolean; color?: string }> = ({ color = '#888', isHovered }) => (
  <motion.svg
    width={16}
    height={16}
    viewBox="0 0 14 12"
    fill="none"
    initial="rest"
    animate={isHovered ? 'hover' : 'rest'}
    variants={contactsContainer}
    style={{ flexShrink: 0 }}
  >
    {/* back-right person */}
    <motion.path
      d="M12.835 10.6532V9.56226C12.8346 9.07884 12.6737 8.60923 12.3775 8.22716C12.0813 7.8451 11.6667 7.57221 11.1986 7.45136"
      stroke={color}
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={contactsDrawVariants}
    />
    {/* front-left person */}
    <motion.path
      d="M9.01678 0.905901C9.4861 1.02606 9.90207 1.29901 10.1991 1.68171C10.4962 2.0644 10.6574 2.53508 10.6574 3.01954C10.6574 3.50399 10.4962 3.97467 10.1991 4.35737C9.90207 4.74006 9.4861 5.01301 9.01678 5.13317M7.38042 3.01681C7.38042 4.22179 6.40358 5.19863 5.1986 5.19863C3.99361 5.19863 3.01678 4.22179 3.01678 3.01681C3.01678 1.81182 3.99361 0.834991 5.1986 0.834991C6.40358 0.834991 7.38042 1.81182 7.38042 3.01681Z"
      stroke={color}
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={contactsDrawVariants}
    />
    {/* base */}
    <motion.path
      d="M9.56223 10.6532V9.56226C9.56223 8.98361 9.33236 8.42866 8.92319 8.01949C8.51402 7.61032 7.95907 7.38045 7.38042 7.38045H3.01678C2.43812 7.38045 1.88317 7.61032 1.474 8.01949C1.06483 8.42866 0.834961 8.98361 0.834961 9.56226V10.6532"
      stroke={color}
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={contactsDrawVariants}
    />
  </motion.svg>
);

const incomesCurveVariants = {
  // Default: S-curve fully visible
  rest: { pathLength: 1, opacity: 1 },
  // Hover: redraw S first
  hover: {
    pathLength: [1, 0, 1],
    opacity: [1, 0.9, 1],
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};
// Slash: on hover it starts off-frame (y=-14 = full viewBox height above), then slides to y=0. Frame clips so off-frame = invisible.
// Slight overlap: slash begins its slide shortly before (but close to) when the S finishes drawing; easing softened so it feels less sharp.
const incomesSlashVariants = {
  rest: { y: 0 },
  hover: {
    y: 0,
    transition: { duration: 0.39, ease: [0.25, 0.9, 0.3, 1], delay: 0.32 },
  },
};
const IncomesIcon: React.FC<{ isHovered?: boolean; color?: string }> = ({ color = '#888', isHovered }) => (
  <motion.svg
    width={16}
    height={16}
    viewBox="0 0 9 14"
    fill="none"
    initial={false}
    animate={isHovered ? 'hover' : 'rest'}
    variants={{ rest: {}, hover: {} }}
    style={{ flexShrink: 0, overflow: 'hidden' }}
  >
    {/* main S curve of the dollar */}
    <motion.path
      d="M6.83496 3.01681H2.74405C2.23773 3.01681 1.75214 3.21795 1.39412 3.57597C1.0361 3.93399 0.834961 4.41958 0.834961 4.9259C0.834961 5.43222 1.0361 5.91781 1.39412 6.27583C1.75214 6.63386 2.23773 6.83499 2.74405 6.83499H5.47132C5.97765 6.83499 6.46323 7.03613 6.82126 7.39415C7.17928 7.75218 7.38042 8.23776 7.38042 8.74408C7.38042 9.2504 7.17928 9.73599 6.82126 10.094C6.46323 10.452 5.97765 10.6532 5.47132 10.6532H0.834961"
      stroke={color}
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={incomesCurveVariants}
    />
    {/* Vertical dollar slash: on hover starts at y=-14 (outside frame = clipped/invisible), then slides to 0 */}
    <motion.path
      key={isHovered ? 'hover' : 'rest'}
      d="M4.10769 0.834991V12.835"
      stroke={color}
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={incomesSlashVariants}
      initial={isHovered ? { y: -14 } : { y: 0 }}
    />
  </motion.svg>
);

const expensesInnerVariants = {
  // Default: fully drawn
  rest: { pathLength: 1, opacity: 1 },
  // Hover: re-draw inner elements
  hover: {
    pathLength: [1, 0, 1],
    opacity: [1, 0.7, 1],
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};
const ExpensesIcon: React.FC<{ isHovered?: boolean; color?: string }> = ({ color = '#888', isHovered }) => (
  <motion.svg
    width={16}
    height={16}
    viewBox="0 0 16 14"
    fill="none"
    initial="rest"
    animate={isHovered ? 'hover' : 'rest'}
    variants={{ rest: {}, hover: { transition: { staggerChildren: 0.07 } } }}
    style={{ flexShrink: 0 }}
  >
    {/* outer card stays static */}
    <path
      d="M11.4232 12.835H4.36437C2.24673 12.835 0.834961 11.7762 0.834961 9.30558V4.3644C0.834961 1.89382 2.24673 0.834991 4.36437 0.834991H11.4232C13.5408 0.834991 14.9526 1.89382 14.9526 4.3644V9.30558C14.9526 11.7762 13.5408 12.835 11.4232 12.835Z"
      stroke={color}
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* inner circle + lines draw out */}
    <motion.path
      d="M7.89377 8.95298C9.06331 8.95298 10.0114 8.00487 10.0114 6.83533C10.0114 5.66578 9.06331 4.71768 7.89377 4.71768C6.72423 4.71768 5.77612 5.66578 5.77612 6.83533C5.77612 8.00487 6.72423 8.95298 7.89377 8.95298Z"
      stroke={color}
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={expensesInnerVariants}
    />
    <motion.path
      d="M12.8349 3.30569H10.7173"
      stroke={color}
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={expensesInnerVariants}
    />
    <motion.path
      d="M5.07028 10.3643H2.95264"
      stroke={color}
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={expensesInnerVariants}
    />
  </motion.svg>
);

const helpCircleVariants = { rest: { scale: 1 }, hover: { scale: [1, 1.04, 1], transition: { duration: 0.4 } } };
const helpQVariants = { rest: { rotate: 0, y: 0 }, hover: { rotate: [0, -8, 8, 0], y: [0, -1, 0], transition: { duration: 0.4, ease: 'easeInOut' } } };
const HelpIcon: React.FC<{ isHovered?: boolean; color?: string }> = ({ color = '#444', isHovered }) => (
  <motion.svg width={16} height={16} viewBox="0 0 18 18" fill="none" initial="rest" animate={isHovered ? 'hover' : 'rest'} variants={{ rest: {}, hover: {} }} style={{ flexShrink: 0 }}>
    <motion.g variants={helpCircleVariants} style={{ transformOrigin: '9px 9px' }}>
      <path d="M16.75 8.75C16.75 13.1683 13.1683 16.75 8.75 16.75C4.33172 16.75 0.75 13.1683 0.75 8.75C0.75 4.33172 4.33172 0.75 8.75 0.75C13.1683 0.75 16.75 4.33172 16.75 8.75Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </motion.g>
    <motion.g variants={helpQVariants} style={{ transformOrigin: '8.75px 9.75px' }}>
      <path d="M6.422 6.35C6.61008 5.81533 6.98132 5.36449 7.46996 5.07731C7.95861 4.79013 8.53312 4.68515 9.09174 4.78097C9.65037 4.87679 10.1571 5.16722 10.5221 5.60082C10.8871 6.03443 11.0868 6.58322 11.086 7.15C11.086 8.75 8.686 9.55 8.686 9.55M8.75 12.75H8.758" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </motion.g>
  </motion.svg>
);

const settingsVariants = {
  rest: { rotate: 0 },
  hover: { rotate: 90, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};
const SettingsIcon: React.FC<{ isHovered?: boolean; color?: string }> = ({ color = '#444', isHovered }) => (
  <motion.svg width={16} height={16} viewBox="0 0 18 18" fill="none" initial="rest" animate={isHovered ? 'hover' : 'rest'} variants={{ rest: {}, hover: {} }} style={{ flexShrink: 0 }}>
    <motion.g variants={settingsVariants} style={{ transformOrigin: '9px 9px' }}>
      <path d="M8.75 10.9318C9.95499 10.9318 10.9318 9.95499 10.9318 8.75C10.9318 7.54502 9.95499 6.56818 8.75 6.56818C7.54502 6.56818 6.56818 7.54502 6.56818 8.75C6.56818 9.95499 7.54502 10.9318 8.75 10.9318Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.1318 10.9318C14.035 11.1512 14.0061 11.3945 14.0489 11.6304C14.0917 11.8664 14.2042 12.0841 14.3718 12.2555L14.4155 12.2991C14.5507 12.4342 14.658 12.5946 14.7312 12.7712C14.8044 12.9478 14.8421 13.137 14.8421 13.3282C14.8421 13.5193 14.8044 13.7086 14.7312 13.8852C14.658 14.0618 14.5507 14.2222 14.4155 14.3573C14.2804 14.4925 14.1199 14.5998 13.9434 14.673C13.7668 14.7462 13.5775 14.7839 13.3864 14.7839C13.1952 14.7839 13.0059 14.7462 12.8294 14.673C12.6528 14.5998 12.4924 14.4925 12.3573 14.3573L12.3136 14.3136C12.1422 14.146 11.9245 14.0335 11.6886 13.9907C11.4527 13.9479 11.2094 13.9768 10.99 14.0736C10.7749 14.1658 10.5914 14.3189 10.4622 14.514C10.333 14.7091 10.2637 14.9378 10.2627 15.1718V15.2955C10.2627 15.6812 10.1095 16.0512 9.8367 16.324C9.56392 16.5968 9.19395 16.75 8.80818 16.75C8.42241 16.75 8.05244 16.5968 7.77966 16.324C7.50688 16.0512 7.35364 15.6812 7.35364 15.2955V15.23C7.34801 14.9893 7.27009 14.7558 7.13001 14.56C6.98993 14.3641 6.79417 14.2149 6.56818 14.1318C6.34882 14.035 6.1055 14.0061 5.86957 14.0489C5.63365 14.0917 5.41595 14.2042 5.24455 14.3718L5.20091 14.4155C5.06582 14.5507 4.9054 14.658 4.72882 14.7312C4.55224 14.8044 4.36297 14.8421 4.17182 14.8421C3.98067 14.8421 3.79139 14.8044 3.61481 14.7312C3.43824 14.658 3.27782 14.5507 3.14273 14.4155C3.00749 14.2804 2.9002 14.1199 2.827 13.9434C2.75381 13.7668 2.71613 13.5775 2.71613 13.3864C2.71613 13.1952 2.75381 13.0059 2.827 12.8294C2.9002 12.6528 3.00749 12.4924 3.14273 12.3573L3.18636 12.3136C3.35403 12.1422 3.4665 11.9245 3.50928 11.6886C3.55205 11.4527 3.52317 11.2094 3.42636 10.99C3.33417 10.7749 3.18109 10.5914 2.98597 10.4622C2.79085 10.333 2.56221 10.2637 2.32818 10.2627H2.20455C1.81878 10.2627 1.44881 10.1095 1.17603 9.8367C0.903246 9.56392 0.75 9.19395 0.75 8.80818C0.75 8.42241 0.903246 8.05244 1.17603 7.77966C1.44881 7.50688 1.81878 7.35364 2.20455 7.35364H2.27C2.51072 7.34801 2.74419 7.27009 2.94004 7.13001C3.13589 6.98993 3.28507 6.79417 3.36818 6.56818C3.46499 6.34882 3.49387 6.1055 3.45109 5.86957C3.40832 5.63365 3.29585 5.41595 3.12818 5.24455L3.08455 5.20091C2.94931 5.06582 2.84202 4.9054 2.76882 4.72882C2.69562 4.55224 2.65795 4.36297 2.65795 4.17182C2.65795 3.98067 2.69562 3.79139 2.76882 3.61481C2.84202 3.43824 2.94931 3.27782 3.08455 3.14273C3.21963 3.00749 3.38005 2.9002 3.55663 2.827C3.73321 2.75381 3.92249 2.71613 4.11364 2.71613C4.30479 2.71613 4.49406 2.75381 4.67064 2.827C4.84722 2.9002 5.00764 3.00749 5.14273 3.14273L5.18636 3.18636C5.35777 3.35403 5.57547 3.4665 5.81139 3.50928C6.04731 3.55205 6.29064 3.52317 6.51 3.42636H6.56818C6.78329 3.33417 6.96674 3.18109 7.09596 2.98597C7.22518 2.79085 7.29452 2.56221 7.29545 2.32818V2.20455C7.29545 1.81878 7.4487 1.44881 7.72148 1.17603C7.99426 0.903246 8.36423 0.75 8.75 0.75C9.13577 0.75 9.50574 0.903246 9.77852 1.17603C10.0513 1.44881 10.2045 1.81878 10.2045 2.20455V2.27C10.2055 2.50403 10.2748 2.73267 10.404 2.92779C10.5333 3.12291 10.7167 3.27599 10.9318 3.36818C11.1512 3.46499 11.3945 3.49387 11.6304 3.45109C11.8664 3.40832 12.0841 3.29585 12.2555 3.12818L12.2991 3.08455C12.4342 2.94931 12.5946 2.84202 12.7712 2.76882C12.9478 2.69562 13.137 2.65795 13.3282 2.65795C13.5193 2.65795 13.7086 2.69562 13.8852 2.76882C14.0618 2.84202 14.2222 2.94931 14.3573 3.08455C14.4925 3.21963 14.5998 3.38005 14.673 3.55663C14.7462 3.73321 14.7839 3.92249 14.7839 4.11364C14.7839 4.30479 14.7462 4.49406 14.673 4.67064C14.5998 4.84722 14.4925 5.00764 14.3573 5.14273L14.3136 5.18636C14.146 5.35777 14.0335 5.57547 13.9907 5.81139C13.9479 6.04731 13.9768 6.29064 14.0736 6.51V6.56818C14.1658 6.78329 14.3189 6.96674 14.514 7.09596C14.7091 7.22518 14.9378 7.29452 15.1718 7.29545H15.2955C15.6812 7.29545 16.0512 7.4487 16.324 7.72148C16.5968 7.99426 16.75 8.36423 16.75 8.75C16.75 9.13577 16.5968 9.50574 16.324 9.77852C16.0512 10.0513 15.6812 10.2045 15.2955 10.2045H15.23C14.996 10.2055 14.7673 10.2748 14.5722 10.404C14.3771 10.5333 14.224 10.7167 14.1318 10.9318Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </motion.g>
  </motion.svg>
);

const profileDrawVariants = {
  rest: { pathLength: 1, opacity: 1 },
  hover: {
    pathLength: [0, 1],
    opacity: [0.7, 1],
    transition: { duration: 0.35, times: [0, 1] },
  },
};

const UserIcon: React.FC<{ size?: number; color?: string; isHovered?: boolean }> = ({ size = 16, color = '#444', isHovered }) => (
  <motion.svg
    // Keep width consistent with other icons (16x16) so the "Profile" label aligns.
    // Slightly reduce height to better match the visual center with Settings/Help.
    width={size}
    height={size * 0.95}
    viewBox="0 0 15 20"
    fill="none"
    initial="rest"
    animate={isHovered ? 'hover' : 'rest'}
    variants={{ rest: {}, hover: {} }}
    style={{ flexShrink: 0, display: 'block', overflow: 'visible' }}
  >
    {/*
      Visual tuning:
      - Head/body gap reduced by ~1px on screen by shifting the body path upward.
      - Stroke thickness matched to other icons (18x18) by increasing strokeWidth
        to compensate for different viewBox scaling.
    */}
    {(() => {
      const renderedHeight = size * 0.95; // px
      // Head/body gap tuning on screen:
      // Positive values move the body upward (reduce the gap).
      // Nudge closer by ~0.5px as requested.
      const gapReductionPx = 0.1; // px on screen (reduce gap by ~0.5px vs previous)
      const bodyShiftViewBoxY = gapReductionPx * 20 / renderedHeight; // viewBox units
      const strokeWidthEq18 = 1.75; // tuned to match 18x18 perceived thickness at current scale

      return (
        <>
          <motion.path
            d="M7.66227 7.6268C7.58483 7.61905 7.4919 7.61905 7.40672 7.6268C5.56362 7.56478 4.09998 6.05297 4.09998 4.19228C4.09998 2.29282 5.63331 0.75 7.53837 0.75C9.43568 0.75 10.9768 2.29282 10.9768 4.19228C10.969 6.05297 9.50538 7.56478 7.66227 7.6268Z"
            stroke={color}
            strokeWidth={strokeWidthEq18}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={profileDrawVariants}
          />
          <motion.path
            d="M2.53305 11.6276C0.155649 13.2191 0.155649 15.8126 2.53305 17.3943C5.23465 19.2019 9.66526 19.2019 12.3669 17.3943C14.7443 15.8028 14.7443 13.2092 12.3669 11.6276C9.67509 9.82979 5.24447 9.82979 2.53305 11.6276Z"
            stroke={color}
            strokeWidth={strokeWidthEq18}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={profileDrawVariants}
            transform={`translate(0 ${-bodyShiftViewBoxY})`}
          />
        </>
      );
    })()}
  </motion.svg>
);

const LogoutIcon = ({ size = 16, color = '#E42C2C' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M6 14H3.5C2.95 14 2.5 13.55 2.5 13V3C2.5 2.45 2.95 2 3.5 2H6M10.5 11.5L14 8L10.5 4.5M14 8H6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SwitchAccountIcon = ({ size = 16, color = '#444' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M3 5H13M3 11H13" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    <path d="M6 3L3 5L6 7" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 9L13 11L10 13" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// User menu button — 3D distortion: hovering near an end makes the bar "bend" in that direction
// + dropdown gap animation like DropdownTriggerButton (gap expands 12px→14px on hover)
const UserMenuButton: React.FC<{ onClick: () => void; avatarUrl: string; name: string; chevronUrl: string }> = ({ onClick, avatarUrl, name, chevronUrl }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotate({ x: -y * 8, y: x * 12 });
  };
  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setHovered(false);
  };
  return (
    <motion.button
      ref={ref}
      whileTap={{ scaleX: 0.98, scaleY: 1 }}
      transition={{ duration: 0.18, ease }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: hovered ? '13px' : '12px',
        padding: '10px 16px',
        border: '1px solid rgba(208,213,221,0.5)',
        borderRadius: '8px',
        backgroundColor: 'white',
        cursor: 'pointer',
        perspective: '600px',
        transformStyle: 'preserve-3d',
        transition: 'gap 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <img src={avatarUrl} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
      <span style={{ fontSize: '14px', fontFamily: font, color: '#000' }}>{name}</span>
      <img src={chevronUrl} alt="" />
    </motion.button>
  );
};

// Calendar: on hover — pins undraw+redraw, body fades out, guide draws in (with overlap).
const CalendarIcon: React.FC<{ isHovered?: boolean; color?: string }> = ({ color = '#444444', isHovered }) => (
  <svg width={17} height={19} viewBox="0 0 17 19" fill="none" style={{ flexShrink: 0 }}>
    {/* Pin A — undraws then redraws on hover */}
    <motion.path
      d="M11.6683 0.834961V4.16829"
      stroke={color}
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 1, opacity: 1 }}
      animate={isHovered ? { pathLength: [1, 0, 1], opacity: 1 } : { pathLength: 1, opacity: 1 }}
      transition={isHovered ? { duration: 0.36, times: [0, 0.35, 1], ease: 'linear' } : { duration: 0 }}
    />
    {/* Pin B — slight stagger after A */}
    <motion.path
      d="M5.00163 0.834961V4.16829"
      stroke={color}
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 1, opacity: 1 }}
      animate={isHovered ? { pathLength: [1, 0, 1], opacity: 1 } : { pathLength: 1, opacity: 1 }}
      transition={isHovered ? { duration: 0.36, times: [0, 0.35, 1], ease: 'linear', delay: 0.05 } : { duration: 0 }}
    />
    {/* Body + divider — fades out on hover; guide takes over */}
    <motion.path
      d="M0.834961 7.50163H15.835M2.50163 2.50163H14.1683C15.0888 2.50163 15.835 3.24782 15.835 4.16829C15.835 8.72441 15.835 11.2788 15.835 15.835C15.835 16.7554 15.0888 17.5016 14.1683 17.5016H2.50163C1.58115 17.5016 0.834961 16.7554 0.834961 15.835V4.16829C0.834961 3.24782 1.58115 2.50163 2.50163 2.50163Z"
      stroke={color}
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ opacity: 1 }}
      animate={{ opacity: isHovered ? 0 : 1 }}
      transition={{ duration: 0.08 }}
    />
    {/* Guide: draws 1→7 on hover, overlapping with pins redraw */}
    <motion.path
      d="M0.834961 7.50163 V4.16829 C0.834961 3.24782 1.58115 2.50163 2.50163 2.50163 H14.1683 C15.0888 2.50163 15.835 3.24782 15.835 4.16829 V15.835 C15.835 16.7554 15.0888 17.5016 14.1683 17.5016 H2.50163 C1.58115 17.5016 0.834961 16.7554 0.834961 15.835 V7.50163 H15.835"
      stroke={color}
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={isHovered ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
      transition={
        isHovered
          ? { pathLength: { duration: 0.5, ease: 'linear', delay: 0.08 }, opacity: { duration: 0.01, delay: 0.08 } }
          : { pathLength: { duration: 0 }, opacity: { duration: 0.12 } }
      }
    />
  </svg>
);

// Period button ("This Month") — calendar with path-draw hover (same finesse as sidebar icons)
const PeriodButton: React.FC<{ activePeriod: string; showDropdown: boolean; onClick: () => void }> = ({ activePeriod, showDropdown, onClick }) => {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: '40px',
        padding: '0 16px',
        border: '1px solid #D0D5DD',
        borderRadius: '8px',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        boxShadow: '0px 1px 2px rgba(16,24,40,0.05)',
      }}
    >
      <CalendarIcon isHovered={hover} color="#344054" />
      <span style={{ fontSize: '14px', fontFamily: '"Inter", sans-serif', fontWeight: 500 }}>{activePeriod}</span>
      <motion.img
        animate={{ rotate: showDropdown ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/51a57b13-6fcd-4429-bc1b-ef5556fb6ed8.svg"
        alt=""
      />
    </motion.button>
  );
};

// 3-dots button — dots disappear then reappear left-to-right on hover (same motion style as sidebar)
const threeDotsVariants = {
  rest: { opacity: 1 },
  hover: (i: number) => ({
    opacity: [1, 0, 1],
    transition: { duration: 0.6, times: [0, 0.2, 1], delay: i * 0.07 },
  }),
};
const StatsMenuButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: '40px',
        width: '40px',
        border: '1px solid #D0D5DD',
        borderRadius: '8px',
        backgroundColor: '#fff',
        cursor: 'pointer',
        boxShadow: '0px 1px 2px rgba(16,24,40,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
      }}
    >
      <motion.div
        style={{ display: 'flex', gap: '4px' }}
        initial="rest"
        animate={hover ? 'hover' : 'rest'}
        variants={{ rest: {}, hover: {} }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            custom={i}
            variants={threeDotsVariants}
            style={{ width: '4px', height: '4px', backgroundColor: '#444', borderRadius: '50%' }}
          />
        ))}
      </motion.div>
    </motion.button>
  );
};

// Notification button — full CTA area triggers bell path-draw; no scale on hover
const NotificationButton: React.FC<{ onClick: () => void; unreadCount: number }> = ({ onClick, unreadCount }) => {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '4px' }}
    >
      <NotificationBellIcon isHovered={hover} />
    </motion.button>
  );
};

// Notification bell — ring/vibrate side-to-side + clapper swing (AlarmClock-style)
const bellShakeVariants = {
  rest: { x: 0 },
  hover: { x: [0, -1.5, 1.5, -1.5, 1.5, 0], transition: { duration: 0.4, ease: 'easeInOut' } },
};
const bellClapperVariants = {
  rest: { rotate: 0 },
  hover: { rotate: [0, -12, 12, -8, 0], transition: { duration: 0.4, delay: 0.05, ease: 'easeInOut' } },
};
const NotificationBellIcon: React.FC<{ isHovered?: boolean }> = ({ isHovered = false }) => (
  <motion.svg width={17} height={20} viewBox="0 0 17 20" fill="none" initial="rest" animate={isHovered ? 'hover' : 'rest'} variants={{ rest: {}, hover: {} }} style={{ display: 'block', overflow: 'visible' }}>
    <motion.g variants={bellShakeVariants} style={{ transformOrigin: '8.5px 10px' }}>
      <path d="M8.03314 1.70255C5.07196 1.70255 2.66544 4.10907 2.66544 7.07025V9.65569C2.66544 10.2014 2.43284 11.0334 2.15551 11.4986L1.1267 13.2073C0.49152 14.263 0.929883 15.4349 2.09289 15.8286C5.94869 17.1168 10.1087 17.1168 13.9645 15.8286C15.0469 15.4707 15.5211 14.1914 14.9306 13.2073L13.9018 11.4986C13.6334 11.0334 13.4008 10.2014 13.4008 9.65569" stroke="#344054" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.68838 1.96221C9.41105 1.88169 9.12477 1.81907 8.82955 1.78329C7.97071 1.67593 7.14767 1.73855 6.3783 1.96221C6.63773 1.30019 7.28186 0.834991 8.03334 0.834991C8.78482 0.834991 9.42894 1.30019 9.68838 1.96221Z" stroke="#344054" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
    </motion.g>
    <motion.g variants={bellClapperVariants} style={{ transformOrigin: '8.5px 14px' }}>
      <path d="M10.7172 16.1517C10.7172 17.6278 9.50946 18.8356 8.03334 18.8356C7.29975 18.8356 6.61984 18.5314 6.13675 18.0483C5.65366 17.5652 5.34949 16.8853 5.34949 16.1517" stroke="#344054" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
    </motion.g>
    <circle cx="11.8974" cy="5.14742" r="4.31243" fill="#F32C2C" />
  </motion.svg>
);

// ─── Animated modal overlay ───────────────────────────────────────────────────

const Overlay: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => {
  useEscapeKey(onClose, true);
  return (
  // Esc key should dismiss any popup/modal.
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    onClick={onClose}
    style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 12 }}
      transition={{ duration: 0.22, ease }}
      onClick={e => e.stopPropagation()}
      style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '32px', maxWidth: '500px', width: '90%', boxShadow: '0px 24px 48px rgba(0,0,0,0.12)', position: 'relative' }}
    >
      <motion.button
        onClick={onClose}
        initial="rest"
        animate="rest"
        whileHover="hover"
        variants={{ rest: { backgroundColor: 'rgba(0,0,0,0)' }, hover: { backgroundColor: 'rgba(0,0,0,0.04)' } }}
        style={{ position: 'absolute', top: '16px', right: '16px', width: '28px', height: '28px', background: 'none', border: 'none', borderRadius: '999px', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <motion.svg
          width={20}
          height={20}
          viewBox="0 0 20 20"
          fill="none"
          variants={{ rest: { rotate: 0 }, hover: { rotate: 180 } }}
          transition={{ duration: 0.24, ease }}
          style={{ transformOrigin: '50% 50%' }}
        >
          <path d="M6 6L14 14" stroke="#888" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M14 6L6 14" stroke="#888" strokeWidth="1.8" strokeLinecap="round" />
        </motion.svg>
      </motion.button>
      {children}
    </motion.div>
  </motion.div>
);
};

const AnalyticsLogoPopover: React.FC<{ row: typeof ANALYTICS_ROWS[0]; onClose: () => void }> = ({ row, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose);
  useEscapeKey(onClose, true);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.94, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: -4 }}
      transition={{ duration: 0.16, ease }}
      style={{ position: 'absolute', left: 0, top: '30px', backgroundColor: '#fff', border: '1px solid rgba(208,213,221,0.7)', borderRadius: '10px', boxShadow: '0px 8px 24px rgba(0,0,0,0.08)', zIndex: 120, padding: '16px', width: '260px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ width: '40px', height: '40px', backgroundColor: row.logo.bg ?? '#FFF', border: row.logo.border ?? 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img src={row.logo.src} alt="" style={{ maxWidth: '22px', maxHeight: '22px' }} />
        </div>
        <div>
          <div style={{ fontSize: '14px', fontFamily: font, fontWeight: 600, color: '#000', letterSpacing: '-0.28px' }}>{row.entity}</div>
          <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginTop: '2px', lineHeight: 1.4 }}>{row.desc}</div>
        </div>
      </div>
      <div style={{ height: '1px', backgroundColor: '#EEEEEE', marginBottom: '12px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 12px' }}>
        {[
          { label: 'Amount', value: row.amount, color: row.isNeg ? '#E42C2C' : '#159600' },
          { label: 'Date', value: row.date, color: '#000' },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <div style={{ fontSize: '11px', fontFamily: font, color: '#888', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '13px', fontFamily: font, color, fontWeight: 500 }}>{value}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Help/Settings button — full CTA area triggers path-draw; move right on hover
const HelpSettingsButton: React.FC<{ label: string; Icon: React.FC<{ isHovered?: boolean; color?: string }>; isActive: boolean; onClick: () => void }> = ({ label, Icon, isActive, onClick }) => {
  const [hover, setHover] = useState(false);
  const baseColor = isActive ? '#000' : '#444';
  return (
    <motion.button
      whileHover={{ x: 2 }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: isActive ? 'rgba(255,255,255,1)' : 'transparent',
        border: isActive ? '1px solid rgba(208,213,221,1)' : '1px solid transparent',
        borderRadius: '8px',
        boxShadow: isActive ? '0px 1px 2px rgba(16,24,40,0.05)' : 'none',
        cursor: 'pointer',
        padding: '10px 12px',
      }}
    >
      <Icon isHovered={hover} color={baseColor} />
      <span style={{ fontSize: '14px', fontFamily: font, color: baseColor, fontWeight: isActive ? 500 : 400 }}>{label}</span>
    </motion.button>
  );
};

// ─── Sidebar item ─────────────────────────────────────────────────────────────
// Move right on hover; icon path-draw when full button area is hovered
const SidebarItem: React.FC<SidebarItemProps> = ({ Icon, label, active, onClick }) => {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      whileHover={{ x: 2 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 12px',
        backgroundColor: active ? 'rgba(255,255,255,1)' : 'transparent',
        border: active ? '1px solid rgba(208,213,221,1)' : '1px solid transparent',
        borderRadius: '8px',
        boxShadow: active ? '0px 1px 2px rgba(16,24,40,0.05)' : 'none',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      <Icon isHovered={hover} color={active ? '#000' : '#888'} />
      <span style={{ color: active ? '#000' : 'rgba(136,136,136,1)', fontSize: '14px', fontFamily: font, fontWeight: active ? 500 : 400, letterSpacing: '-0.28px' }}>{label}</span>
    </motion.button>
  );
};

// ─── Logo popover (animated) ──────────────────────────────────────────────────

const LogoPopover: React.FC<{ tx: Transaction; onClose: () => void }> = ({ tx, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose);
  const info = COMPANY_INFO[tx.company] ?? { since: 'Unknown', totalThisYear: '$0.00' };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.94, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: -4 }}
      transition={{ duration: 0.16, ease }}
      style={{ position: 'absolute', left: 0, top: '30px', backgroundColor: '#fff', border: '1px solid rgba(208,213,221,0.7)', borderRadius: '10px', boxShadow: '0px 8px 24px rgba(0,0,0,0.08)', zIndex: 100, padding: '20px', width: '260px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
        <div style={{ width: '48px', height: '48px', backgroundColor: tx.logoBg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: tx.logoBg === 'rgba(255, 255, 255, 1)' ? '1px solid #000' : 'none', flexShrink: 0 }}>
          <img src={tx.logo} alt="" style={{ maxWidth: '32px', maxHeight: '32px' }} />
        </div>
        <div style={{ fontSize: '15px', fontFamily: font, fontWeight: 500, color: '#000', lineHeight: 1.3, letterSpacing: '-0.28px' }}>{tx.company.split(' - ')[0]}</div>
      </div>
      <div style={{ height: '1px', backgroundColor: '#EEEEEE', marginBottom: '14px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[{ label: 'Customer since', value: info.since }, { label: 'Total paid this year', value: info.totalThisYear }].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontFamily: font, color: '#888' }}>{label}</span>
            <span style={{ fontSize: '13px', fontFamily: font, color: '#000', fontWeight: 500 }}>{value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// User card menu item with "grey slide" background on hover
const UserCardMenuItem: React.FC<{ label: string; Icon: React.FC<{ isHovered?: boolean; color?: string }>; onClick?: () => void; onClose: () => void; keepOpen?: boolean }> = ({ label, Icon, onClick, onClose, keepOpen }) => {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      onClick={() => { if (!keepOpen) onClose(); onClick?.(); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '11px 20px',
        background: 'none',
        border: 'none',
        textAlign: 'left',
        fontSize: '14px',
        fontFamily: font,
        color: '#111',
        cursor: 'pointer',
        letterSpacing: '-0.28px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <motion.div
        initial={false}
        animate={{ x: hover ? 0 : '-100%' }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', inset: 0, backgroundColor: '#F8F8F9', zIndex: -1 }}
      />
      <Icon color="#111" />{label}
    </motion.button>
  );
};

// ─── User card (animated) ─────────────────────────────────────────────────────

const UserCard: React.FC<{ onClose: () => void; onProfileClick: () => void; onSettingsClick?: () => void; userName: string; userEmail: string; userAvatarUrl: string }> = ({ onClose, onProfileClick, onSettingsClick, userName, userEmail, userAvatarUrl }) => {
  const [hoverSwitch, setHoverSwitch] = useState(false);
  const [hoverSignOut, setHoverSignOut] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18, ease }}
      style={{ position: 'absolute', right: 0, top: '56px', width: '280px', backgroundColor: '#fff', border: '1px solid rgba(208,213,221,0.7)', borderRadius: '12px', boxShadow: '0px 8px 24px rgba(0,0,0,0.08)', zIndex: 100, overflow: 'hidden' }}
    >
      <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src={userAvatarUrl} alt="" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '15px', fontFamily: font, fontWeight: 600, color: '#000', letterSpacing: '-0.3px' }}>{userName}</div>
          <div style={{ fontSize: '13px', fontFamily: font, color: '#888', marginTop: '2px' }}>{userEmail}</div>
        </div>
      </div>
      <div style={{ height: '1px', backgroundColor: '#EEEEEE' }} />
      <div style={{ padding: '0' }}>
        <UserCardMenuItem label="Profile" Icon={UserIcon} onClick={onProfileClick} onClose={onClose} keepOpen />
        <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.04)' }} />
        <UserCardMenuItem label="Settings" Icon={SettingsIcon} onClick={onSettingsClick} onClose={onClose} />
        <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.04)' }} />
        <UserCardMenuItem label="Help" Icon={HelpIcon} onClose={onClose} />
      </div>
      <div style={{ height: '1px', backgroundColor: '#EEEEEE' }} />
      {/* Bottom: 1fr | 1px | 1fr grid so the divider is mathematically centered; content centered per cell */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1px 1fr',
          alignItems: 'stretch',
          height: '50px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <motion.button
          type="button"
          onClick={onClose}
          onMouseEnter={() => setHoverSwitch(true)}
          onMouseLeave={() => setHoverSwitch(false)}
          style={{
            minWidth: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '0 12px',
            margin: 0,
            background: 'transparent',
            border: 'none',
            fontSize: '14px',
            lineHeight: '21px',
            fontFamily: font,
            color: '#111',
            cursor: 'pointer',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={false}
            animate={{ x: hoverSwitch ? 0 : '-100%' }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'absolute', inset: 0, backgroundColor: '#F8F8F9', zIndex: 0 }}
          />
          <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SwitchAccountIcon />
            Switch User
          </span>
        </motion.button>
        <motion.div
          animate={{ scaleY: hoverSwitch || hoverSignOut ? 0 : 1 }}
          transition={hoverSwitch || hoverSignOut ? { duration: 0 } : { duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
          style={{ width: '1px', height: '100%', backgroundColor: 'rgba(0,0,0,0.06)', transformOrigin: 'top' }}
          aria-hidden
        />
        <motion.button
          type="button"
          onClick={onClose}
          onMouseEnter={() => setHoverSignOut(true)}
          onMouseLeave={() => setHoverSignOut(false)}
          style={{
            minWidth: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '0 12px',
            margin: 0,
            background: 'transparent',
            border: 'none',
            fontSize: '14px',
            lineHeight: '21px',
            fontFamily: font,
            color: '#E42C2C',
            cursor: 'pointer',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={false}
            animate={{ x: hoverSignOut ? 0 : '100%' }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(228,44,44,0.05)', zIndex: 0 }}
          />
          <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogoutIcon />
            Sign Out
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── Profile sheet (right-side drawer) ────────────────────────────────────────

const PROFILE_TOAST_SAVED = 'Saved!';

/** SVG user units; both circle and check use this width. */
const SAVED_ICON_STROKE = 1.5;
const SAVED_CIRCLE_R = 10;
const SAVED_CIRCLE_LEN = 2 * Math.PI * SAVED_CIRCLE_R;

/** Light notification: circle + check draw quickly; “Saved” fades in overlapping the icon motion. */
const ProfileSavedNotification: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
    >
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ color: '#159600' }}>
        <g transform={`rotate(-90 12 12)`}>
          <motion.circle
            cx="12"
            cy="12"
            r={SAVED_CIRCLE_R}
            fill="none"
            stroke="currentColor"
            strokeWidth={SAVED_ICON_STROKE}
            strokeLinecap="round"
            strokeDasharray={SAVED_CIRCLE_LEN}
            initial={{ strokeDashoffset: SAVED_CIRCLE_LEN }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          />
        </g>
        <motion.path
          d="M8.75 12.2 L11.35 14.85 L16.05 10.1"
          fill="none"
          stroke="currentColor"
          strokeWidth={SAVED_ICON_STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 0.45, delay: 0.12, ease: [0.25, 0.9, 0.2, 1] },
            opacity: { duration: 0.12, delay: 0.12 },
          }}
        />
      </svg>
    </motion.div>
    <motion.span
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.26, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      style={{ fontSize: '13px', fontFamily: font, color: '#159600', letterSpacing: '-0.02em', fontWeight: 300 }}
    >
      Saved
    </motion.span>
  </div>
);

interface UserProfile { firstName: string; lastName: string; email: string; jobTitle: string; avatarUrl: string; }

const ProfileSheet: React.FC<{ onClose: () => void; user: UserProfile; onSaveUser: (u: UserProfile) => void }> = ({ onClose, user, onSaveUser }) => {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [jobTitle, setJobTitle] = useState(user.jobTitle);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);

  useEffect(() => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setJobTitle(user.jobTitle);
    setAvatarUrl(user.avatarUrl);
  }, [user.firstName, user.lastName, user.email, user.jobTitle, user.avatarUrl]);
  const [avatarHover, setAvatarHover] = useState(false);
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [prefs, setPrefs] = useState({ weeklyEmail: true, productUpdates: true, reminders: true });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (!toastMessage) return;
    const ms = toastMessage === PROFILE_TOAST_SAVED ? 3000 : 2500;
    const t = setTimeout(() => setToastMessage(null), ms);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #D0D5DD',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: font,
    color: '#111',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const cardStyle: React.CSSProperties = {
    border: '1px solid rgba(208,213,221,0.5)',
    borderRadius: '12px',
    padding: '18px',
    backgroundColor: '#FFFFFF',
  };

  const resetPersonalFromUser = () => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setJobTitle(user.jobTitle);
    setAvatarUrl(user.avatarUrl);
  };

  const cancelPersonalEdit = () => {
    resetPersonalFromUser();
    setEditingPersonal(false);
  };

  const handleSavePersonal = () => {
    setSaving(true);
    const updated = { firstName, lastName, email, jobTitle, avatarUrl };
    onSaveUser(updated);
    setTimeout(() => {
      setSaving(false);
      setToastMessage(PROFILE_TOAST_SAVED);
      setEditingPersonal(false);
    }, 400);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingPersonal) return;
    const f = e.target.files?.[0];
    if (f) {
      const url = URL.createObjectURL(f);
      setAvatarUrl(url);
      onSaveUser({ firstName, lastName, email, jobTitle, avatarUrl: url });
      setToastMessage('Avatar updated!');
    }
  };

  const readOnlyFieldBox: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: font,
    color: '#7c7c7c',
    padding: '10px 14px',
    borderRadius: '8px',
    backgroundColor: '#FCFCFC',
    border: '1px solid rgba(208,213,221,0.55)',
    boxSizing: 'border-box',
    minHeight: '42px',
    display: 'flex',
    alignItems: 'center',
  };

  const personalActionsLayoutTransition = {
    type: 'tween' as const,
    duration: 0.38,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  };

  const togglePref = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
      transition={{ duration: 0.2, ease: 'easeOut', delay: 0.25 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.32)',
        zIndex: 250,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0, transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] } }}
        exit={{ x: '100%', transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '540px',
          maxWidth: '100%',
          height: '100%',
          backgroundColor: '#FFFFFF',
          boxShadow: '-24px 0 48px rgba(0,0,0,0.16)',
          borderRadius: '16px 0 0 16px',
          padding: '24px 28px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          willChange: 'transform',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '18px', fontFamily: font, fontWeight: 500, letterSpacing: '-0.36px' }}>Profile</div>
            <div style={{ fontSize: '13px', fontFamily: font, color: '#888', marginTop: '4px', maxWidth: '360px', lineHeight: 1.5 }}>
              Manage your personal details, account, and preferences for {firstName}&apos;s workspace.
            </div>
          </div>
          <motion.button
            onClick={onClose}
            initial="rest"
            animate="rest"
            whileHover="hover"
            variants={{ rest: { backgroundColor: 'rgba(0,0,0,0)' }, hover: { backgroundColor: 'rgba(0,0,0,0.04)' } }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              width: '28px',
              height: '28px',
              padding: 0,
              borderRadius: '999px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.svg
              width={18}
              height={18}
              viewBox="0 0 18 18"
              fill="none"
              variants={{ rest: { rotate: 0 }, hover: { rotate: 180 } }}
              transition={{ duration: 0.24, ease }}
              style={{ transformOrigin: '50% 50%' }}
            >
              <path d="M5 5L13 13" stroke="#888" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M13 5L5 13" stroke="#888" strokeWidth="1.8" strokeLinecap="round" />
            </motion.svg>
          </motion.button>
        </div>

        {/* Account summary — avatar with hover overlay */}
        <div
          style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}
        >
          <label
            style={{ position: 'relative', cursor: editingPersonal ? 'pointer' : 'default', flexShrink: 0 }}
            onMouseEnter={() => editingPersonal && setAvatarHover(true)}
            onMouseLeave={() => setAvatarHover(false)}
          >
            {editingPersonal && <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />}
            <img src={avatarUrl} alt="" style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }} />
            {editingPersonal && avatarHover && (
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                <PencilIcon size={17} color="#fff" />
              </div>
            )}
          </label>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '16px', fontFamily: font, fontWeight: 600, color: '#000', letterSpacing: '-0.32px' }}>{firstName} {lastName}</div>
            <div style={{ fontSize: '13px', fontFamily: font, color: '#666', marginTop: '4px' }}>{email}</div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontFamily: font, color: '#444', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(208,213,221,0.8)', backgroundColor: 'rgba(248,248,249,0.8)' }}>Workspace owner</span>
              <span style={{ fontSize: '12px', fontFamily: font, color: '#444', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(208,213,221,0.8)' }}>Income S</span>
            </div>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: '#EEEEEE' }} />

        <div style={{ flex: 1, paddingRight: '6px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Personal details — view until Edit */}
            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ fontSize: '14px', fontFamily: font, fontWeight: 500, color: '#000' }}>Personal details</div>
              <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginTop: '2px' }}>Basic info that appears on invoices and reports.</div>
            </div>
            <div style={{ height: '1px', backgroundColor: '#EEEEEE' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '6px', display: 'block' }}>First name</label>
                {editingPersonal ? (
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} style={inputStyle} onFocus={e => (e.currentTarget.style.borderColor = '#000')} onBlur={e => (e.currentTarget.style.borderColor = '#D0D5DD')} />
                ) : (
                  <div style={readOnlyFieldBox}>{firstName}</div>
                )}
              </div>
              <div>
                <label style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '6px', display: 'block' }}>Last name</label>
                {editingPersonal ? (
                  <input value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle} onFocus={e => (e.currentTarget.style.borderColor = '#000')} onBlur={e => (e.currentTarget.style.borderColor = '#D0D5DD')} />
                ) : (
                  <div style={readOnlyFieldBox}>{lastName}</div>
                )}
              </div>
              <div>
                <label style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '6px', display: 'block' }}>Email</label>
                {editingPersonal ? (
                  <input value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} onFocus={e => (e.currentTarget.style.borderColor = '#000')} onBlur={e => (e.currentTarget.style.borderColor = '#D0D5DD')} />
                ) : (
                  <div style={readOnlyFieldBox}>{email}</div>
                )}
                <div style={{ fontSize: '11px', fontFamily: font, color: '#888', marginTop: '4px' }}>Changes require verification</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '6px', display: 'block' }}>Job title</label>
                {editingPersonal ? (
                  <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} style={inputStyle} onFocus={e => (e.currentTarget.style.borderColor = '#000')} onBlur={e => (e.currentTarget.style.borderColor = '#D0D5DD')} />
                ) : (
                  <div style={readOnlyFieldBox}>{jobTitle}</div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start', flexWrap: 'wrap', alignItems: 'center' }}>
              <motion.div layout transition={personalActionsLayoutTransition} style={{ display: 'inline-flex' }}>
                <SlidingTextSwapButton
                  label={editingPersonal ? 'Cancel' : 'Edit'}
                  variant="secondary"
                  onClick={editingPersonal ? cancelPersonalEdit : () => setEditingPersonal(true)}
                  disabled={saving}
                />
              </motion.div>
              <motion.div layout transition={personalActionsLayoutTransition} style={{ display: 'inline-flex' }}>
                <SlidingTextSwapButton
                  label={saving ? 'Saving…' : 'Save'}
                  variant="primary"
                  onClick={handleSavePersonal}
                  disabled={!editingPersonal || saving}
                />
              </motion.div>
            </div>
          </div>

          {/* Security */}
          <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ fontSize: '14px', fontFamily: font, fontWeight: 500, color: '#000' }}>Security</div>
              <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginTop: '2px' }}>Manage password and two-factor authentication.</div>
            </div>
            <div style={{ height: '1px', backgroundColor: '#EEEEEE' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <SlidingTextSwapButton label="Change Password" variant="secondary" onClick={() => setShowPasswordDialog(true)} style={{ alignSelf: 'flex-start' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '13px', fontFamily: font, fontWeight: 500, color: '#111' }}>Enable Two-Factor Authentication</div>
                  <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginTop: '2px' }}>Add an extra layer of security.</div>
                </div>
                <button onClick={() => setToastMessage('Coming soon')} style={{ width: '36px', height: '20px', borderRadius: '999px', backgroundColor: '#D0D5DD', border: 'none', cursor: 'pointer', padding: '0 2px', boxSizing: 'border-box' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', marginLeft: '0', transition: 'margin 0.2s ease' }} />
                </button>
              </div>
            </div>
          </div>

          {/* Preferences — functional toggles */}
          <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '14px', fontFamily: font, fontWeight: 500, color: '#000' }}>Preferences</div>
              <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginTop: '2px' }}>Control how Income S keeps you in the loop.</div>
            </div>
            <div style={{ height: '1px', backgroundColor: '#EEEEEE', marginTop: '6px', marginBottom: '4px' }} />
            {[
              { key: 'weeklyEmail' as const, label: 'Weekly email summary', description: 'A snapshot of incomes, expenses, and tax for the last week.' },
              { key: 'productUpdates' as const, label: 'Product updates', description: 'Occasional emails when we ship something important.' },
              { key: 'reminders' as const, label: 'Reminders & alerts', description: 'Due invoices, renewals, and threshold alerts.' },
            ].map(({ key, label, description }) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontFamily: font, color: '#111', fontWeight: 500 }}>{label}</div>
                  <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginTop: '2px', lineHeight: 1.4 }}>{description}</div>
                </div>
                <button onClick={() => togglePref(key)} style={{ width: '36px', height: '20px', borderRadius: '999px', backgroundColor: prefs[key] ? '#000' : '#D0D5DD', border: 'none', cursor: 'pointer', padding: '0 2px', boxSizing: 'border-box' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', marginLeft: prefs[key] ? '16px' : '0', transition: 'margin 0.2s ease' }} />
                </button>
              </div>
            ))}
          </div>

          {/* Delete Account — no Danger Zone styling */}
          <div style={{ ...cardStyle }}>
            <SlidingTextSwapButton label="Delete Account" variant="dangerOutlineToSolid" onClick={() => setShowDeleteDialog(true)} />
          </div>
        </div>

        {toastMessage && (
          <AnimatePresence>
            <motion.div
              key={toastMessage}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute',
                bottom: '24px',
                right: '28px',
                padding: '8px 13px',
                backgroundColor: '#FFFFFF',
                color: '#333',
                fontSize: '13px',
                fontFamily: font,
                borderRadius: '9999px',
                border:
                  toastMessage === PROFILE_TOAST_SAVED
                    ? '1px solid #159600'
                    : '1px solid rgba(208,213,221,0.85)',
                boxShadow: '0px 8px 28px rgba(0,0,0,0.07)',
                maxWidth: 'min(320px, calc(100vw - 48px))',
              }}
            >
              {toastMessage === PROFILE_TOAST_SAVED ? (
                <ProfileSavedNotification />
              ) : (
                toastMessage
              )}
            </motion.div>
          </AnimatePresence>
        )}

        <AnimatePresence>
          {showPasswordDialog && (
            <Overlay key="pw" onClose={() => setShowPasswordDialog(false)}>
              <div style={{ fontSize: '18px', fontFamily: font, fontWeight: 500, marginBottom: '20px' }}>Change Password</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '6px', display: 'block' }}>Current password</label>
                  <input type="password" placeholder="••••••••" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '6px', display: 'block' }}>New password</label>
                  <input type="password" placeholder="••••••••" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '6px', display: 'block' }}>Confirm new password</label>
                  <input type="password" placeholder="••••••••" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <SlidingTextSwapButton label="Cancel" variant="secondary" onClick={() => setShowPasswordDialog(false)} />
                <SlidingTextSwapButton
                  label="Update"
                  variant="primary"
                  onClick={() => { setShowPasswordDialog(false); setToastMessage('Password updated!'); }}
                />
              </div>
            </Overlay>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showDeleteDialog && (
            <Overlay key="del" onClose={() => setShowDeleteDialog(false)}>
              <div style={{ fontSize: '18px', fontFamily: font, fontWeight: 500, marginBottom: '8px' }}>Delete Account</div>
              <div style={{ fontSize: '14px', fontFamily: font, color: '#666', marginBottom: '24px', lineHeight: 1.5 }}>Are you sure? This cannot be undone.</div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <SlidingTextSwapButton label="Cancel" variant="secondary" onClick={() => setShowDeleteDialog(false)} />
                <SlidingTextSwapButton
                  label="Delete"
                  variant="danger"
                  onClick={() => { setShowDeleteDialog(false); setToastMessage('Account deletion requested.'); }}
                />
              </div>
            </Overlay>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// ─── Modals ───────────────────────────────────────────────────────────────────

const DetailsModal: React.FC<{ tx: Transaction; onClose: () => void }> = ({ tx, onClose }) => {
  const amountColor = tx.amount.startsWith('+') ? '#159600' : '#E42C2C';
  return (
    <Overlay onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div style={{ width: '36px', height: '36px', backgroundColor: tx.logoBg, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: tx.logoBg === 'rgba(255, 255, 255, 1)' ? '1px solid #000' : 'none', flexShrink: 0 }}>
          <img src={tx.logo} alt="" style={{ maxWidth: '24px', maxHeight: '24px' }} />
        </div>
        <div>
          <div style={{ fontSize: '16px', fontFamily: font, fontWeight: 500, color: '#000', letterSpacing: '-0.3px' }}>{tx.company}</div>
          <div style={{ fontSize: '13px', fontFamily: font, color: '#888', marginTop: '2px' }}>{tx.description}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {[{ label: 'Amount', value: tx.amount, color: amountColor }, { label: 'Type', value: tx.type.charAt(0).toUpperCase() + tx.type.slice(1) }, { label: 'Date', value: tx.date }, { label: 'Category', value: tx.tag ?? '—' }].map(({ label, value, color }) => (
          <div key={label}>
            <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '16px', fontFamily: font, color: color ?? '#000', fontWeight: 500 }}>{value}</div>
          </div>
        ))}
      </div>
      {tx.recurring && <div style={{ marginBottom: '16px' }}><div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '4px' }}>Recurring</div><div style={{ fontSize: '14px', fontFamily: font, color: '#000' }}>{tx.recurring}</div></div>}
      {tx.notes && <div style={{ marginBottom: '20px' }}><div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '4px' }}>Notes</div><div style={{ fontSize: '14px', fontFamily: font, color: '#444', lineHeight: 1.5 }}>{tx.notes}</div></div>}
      <div style={{ height: '1px', backgroundColor: '#EEEEEE', marginBottom: '20px' }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SlidingTextSwapButton label="Close" variant="secondary" onClick={onClose} />
      </div>
    </Overlay>
  );
};

const NameDetailModal: React.FC<{ tx: Transaction; onClose: () => void }> = ({ tx, onClose }) => {
  const [notes, setNotes] = useState(tx.notes ?? '');
  const amountColor = tx.amount.startsWith('+') ? '#159600' : '#E42C2C';
  return (
    <Overlay onClose={onClose}>
      <div style={{ fontSize: '18px', fontFamily: font, fontWeight: 500, marginBottom: '6px', letterSpacing: '-0.36px' }}>Transaction Details</div>
      <div style={{ fontSize: '13px', fontFamily: font, color: '#888', marginBottom: '24px' }}>{tx.company}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {[{ label: 'Description', value: tx.description }, { label: 'Amount', value: tx.amount, color: amountColor }, { label: 'Date', value: tx.date }, { label: 'Category', value: tx.tag ?? '—' }].map(({ label, value, color }) => (
          <div key={label}>
            <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '15px', fontFamily: font, color: color ?? '#000', fontWeight: 500 }}>{value}</div>
          </div>
        ))}
      </div>
      {tx.recurring && <div style={{ padding: '12px 16px', backgroundColor: '#F8F8F9', borderRadius: '8px', marginBottom: '16px' }}><span style={{ fontSize: '13px', fontFamily: font, color: '#666' }}>Recurring: </span><span style={{ fontSize: '13px', fontFamily: font, color: '#000', fontWeight: 500 }}>{tx.recurring}</span></div>}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '6px' }}>Notes</div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ width: '100%', minHeight: '80px', border: '1px solid #D0D5DD', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', fontFamily: font, color: '#111', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} onFocus={e => (e.currentTarget.style.borderColor = '#000')} onBlur={e => (e.currentTarget.style.borderColor = '#D0D5DD')} />
      </div>
      <div style={{ height: '1px', backgroundColor: '#EEEEEE', marginBottom: '20px' }} />
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <SlidingTextSwapButton label="Cancel" variant="secondary" onClick={onClose} />
        <SlidingTextSwapButton label="Save" variant="primary" onClick={onClose} />
      </div>
    </Overlay>
  );
};

const DateModal: React.FC<{ date: string; onClose: () => void }> = ({ date, onClose }) => {
  const txs = TRANSACTIONS.filter(t => t.date === date);
  return (
    <Overlay onClose={onClose}>
      <div style={{ fontSize: '18px', fontFamily: font, fontWeight: 500, marginBottom: '4px', letterSpacing: '-0.36px' }}>All transactions on {date}</div>
      <div style={{ fontSize: '13px', fontFamily: font, color: '#888', marginBottom: '24px' }}>{txs.length} transaction{txs.length !== 1 ? 's' : ''}</div>
      <div>
        {txs.map(tx => {
          const c = tx.amount.startsWith('+') ? '#159600' : '#E42C2C';
          return (
            <div key={tx.id} style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #EEEEEE', gap: '12px' }}>
              <div style={{ width: '28px', height: '28px', backgroundColor: tx.logoBg, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: tx.logoBg === 'rgba(255, 255, 255, 1)' ? '1px solid #000' : 'none', flexShrink: 0 }}>
                <img src={tx.logo} alt="" style={{ maxWidth: '18px', maxHeight: '18px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontFamily: font, color: '#000', fontWeight: 500, letterSpacing: '-0.28px' }}>{tx.company.split(' - ')[0]}</div>
                <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginTop: '2px' }}>{tx.description}</div>
              </div>
              <span style={{ fontSize: '14px', fontFamily: font, color: c, fontWeight: 500 }}>{tx.amount}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
        <SlidingTextSwapButton label="Close" variant="secondary" onClick={onClose} />
      </div>
    </Overlay>
  );
};

const EditModal: React.FC<{ tx: Transaction; onClose: () => void }> = ({ tx, onClose }) => {
  const [form, setForm] = useState({ description: tx.description, amount: tx.amount, date: tx.date, category: tx.tag ?? '', notes: tx.notes ?? '' });
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #D0D5DD', borderRadius: '8px', fontSize: '14px', fontFamily: font, color: '#111', boxSizing: 'border-box', outline: 'none' };
  return (
    <Overlay onClose={onClose}>
      <div style={{ fontSize: '18px', fontFamily: font, fontWeight: 500, marginBottom: '4px', letterSpacing: '-0.36px' }}>Edit Transaction</div>
      <div style={{ fontSize: '13px', fontFamily: font, color: '#888', marginBottom: '24px' }}>{tx.company.split(' - ')[0]}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        {(['description', 'amount', 'date', 'category'] as const).map(key => (
          <div key={key}>
            <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '6px' }}>{key.charAt(0).toUpperCase() + key.slice(1)}</div>
            <input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle} onFocus={e => (e.currentTarget.style.borderColor = '#000')} onBlur={e => (e.currentTarget.style.borderColor = '#D0D5DD')} />
          </div>
        ))}
        <div>
          <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '6px' }}>Notes</div>
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ ...inputStyle, minHeight: '72px', resize: 'vertical' }} onFocus={e => (e.currentTarget.style.borderColor = '#000')} onBlur={e => (e.currentTarget.style.borderColor = '#D0D5DD')} />
        </div>
      </div>
      <div style={{ height: '1px', backgroundColor: '#EEEEEE', marginBottom: '20px' }} />
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <SlidingTextSwapButton label="Cancel" variant="secondary" onClick={onClose} />
        <SlidingTextSwapButton label="Save Changes" variant="primary" onClick={onClose} />
      </div>
    </Overlay>
  );
};

const UpgradeModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <Overlay onClose={onClose}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '22px', fontFamily: font, fontWeight: 600, marginBottom: '8px' }}>Upgrade Storage</div>
      <div style={{ fontSize: '14px', fontFamily: font, color: '#666', marginBottom: '28px', lineHeight: 1.6 }}>You're using 1.25 GB of your 5 GB plan. Upgrade for more storage and premium features.</div>
      {[{ label: 'Pro — 20 GB', price: '$9/mo' }, { label: 'Business — 100 GB', price: '$29/mo' }].map(plan => (
        <div key={plan.label} style={{ border: '1px solid #E0E0E0', borderRadius: '8px', padding: '14px 20px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#000')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
        >
          <span style={{ fontSize: '14px', fontFamily: font, fontWeight: 500 }}>{plan.label}</span>
          <span style={{ fontSize: '14px', fontFamily: font, color: '#444' }}>{plan.price}</span>
        </div>
      ))}
      <SlidingTextSwapButton label="Get Started" variant="primary" onClick={onClose} style={{ width: '100%', marginTop: '8px', padding: '11px' }} />
    </div>
  </Overlay>
);

// ─── Analytics data ───────────────────────────────────────────────────────────

const ANALYTICS_STAT_CARDS = [
  { title: 'Earned',   amount: '$1,000.00', subtext: '$100 more than November', percentage: '10%', isPositive: true,  icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/014a0924-f3b1-4d18-8028-7cf395eea7e4.svg' },
  { title: 'Spent',    amount: '$600.24',   subtext: '$100 more than November', percentage: '10%', isPositive: false, icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/1e97b8bd-d214-47a4-847e-275e7626a8df.svg' },
  { title: 'Saved',    amount: '$200.07',   subtext: '$20 more than November',  percentage: '8%',  isPositive: true,  icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/cb4ca95a-8ffa-47f1-b6df-79cb827735bd.svg' },
  { title: 'Invested', amount: '$199.69',   subtext: '+$20 more than November', percentage: '10%', isPositive: true,  icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/0e540694-ffe6-472d-839e-5cc1179fe992.svg' },
];

type ChartPeriodType = 'Yearly' | 'Quarterly' | 'Monthly';
interface ChartBar { label: string; earned: number; spent: number }

const CHART_DATASETS: Record<ChartPeriodType, ChartBar[]> = {
  Yearly: [
    { label: 'Jan', earned: 820, spent: 480 }, { label: 'Feb', earned: 650, spent: 390 },
    { label: 'Mar', earned: 900, spent: 520 }, { label: 'Apr', earned: 740, spent: 410 },
    { label: 'May', earned: 980, spent: 600 }, { label: 'Jun', earned: 860, spent: 470 },
    { label: 'Jul', earned: 1000, spent: 580 }, { label: 'Aug', earned: 780, spent: 430 },
    { label: 'Sep', earned: 920, spent: 550 }, { label: 'Oct', earned: 690, spent: 360 },
    { label: 'Nov', earned: 850, spent: 500 }, { label: 'Dec', earned: 760, spent: 440 },
  ],
  Quarterly: [
    { label: 'Q1', earned: 2370, spent: 1390 },
    { label: 'Q2', earned: 2580, spent: 1480 },
    { label: 'Q3', earned: 2700, spent: 1560 },
    { label: 'Q4', earned: 2460, spent: 1400 },
  ],
  Monthly: [
    { label: 'Wk 1', earned: 280, spent: 160 },
    { label: 'Wk 2', earned: 320, spent: 185 },
    { label: 'Wk 3', earned: 210, spent: 130 },
    { label: 'Wk 4', earned: 265, spent: 125 },
  ],
};

const SPEND_MONTHS_LIST = ['January', 'February', 'March', 'April', 'May', 'June'];
const SPEND_BASE = [
  { label: 'Shipping Costs',    color: '#1A3A8F' },
  { label: 'Deliveries',        color: '#2D5BFF' },
  { label: 'Web. Maintenance',  color: '#4C7EFF' },
  { label: 'Software Licenses', color: '#5BB8E8' },
  { label: 'Advertising',       color: '#77D4F5' },
  { label: 'Office Supplies',   color: '#95E0FB' },
  { label: 'Miscellaneous',     color: '#B8C4D4' },
];
const SPEND_MONTH_VALS: Record<string, number[]> = {
  January:  [125, 110, 70, 95, 140, 85, 102],
  February: [110, 130, 65, 88, 155, 75, 95],
  March:    [140, 100, 80, 100, 120, 90, 112],
  April:    [118, 115, 68, 95, 148, 80, 98],
  May:      [132, 108, 74, 92, 162, 88, 104],
  June:     [115, 125, 72, 98, 135, 82, 100],
};
const buildSpendCategories = (month: string) => {
  const vals = SPEND_MONTH_VALS[month] ?? SPEND_MONTH_VALS.January;
  const total = vals.reduce((s, v) => s + v, 0);
  const trends = ['-3.5%', '+4.0%', '+0.0%', '+2.1%', '+6.2%', '-1.2%', '+0.8%'];
  const trendColors = ['#159600', '#E42C2C', 'rgba(0,0,0,0.35)', '#E42C2C', '#E42C2C', '#159600', '#E42C2C'];
  return SPEND_BASE.map((b, i) => ({
    ...b,
    val: `-$${vals[i]}`,
    pct: `${((vals[i] / total) * 100).toFixed(1)}%`,
    trend: trends[i],
    trendColor: trendColors[i],
  }));
};
const buildConicGradient = (cats: ReturnType<typeof buildSpendCategories>) => {
  const total = cats.reduce((s, c) => s + Math.abs(parseFloat(c.pct)), 0);
  let cur = 0;
  return `conic-gradient(${cats.map(c => {
    const share = Math.abs(parseFloat(c.pct)) / total * 360;
    const stop = `${c.color} ${cur.toFixed(1)}deg ${(cur + share).toFixed(1)}deg`;
    cur += share;
    return stop;
  }).join(', ')})`;
};

const ANALYTICS_ROWS = [
  { logo: { src: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/96120dbc-a72e-4677-944b-003188314ee2.svg', border: '1px solid #000' }, entity: 'Augment LLC',      date: '6 Dec, 2023', desc: 'Internet Bill', amount: '-$24.00',  isNeg: true  },
  { logo: { src: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/c378731f-4693-44ef-91b6-91bd4b9b0237.svg', bg: '#FF4B4B' },         entity: 'FierceExchance Inc', date: '5 Dec, 2023', desc: 'Trade: Buy',   amount: '+$360.00', isNeg: false },
  { logo: { src: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/0a2481b0-a334-4fd4-9747-ac07982d8209.svg', bg: '#FF4B4B' },         entity: 'FierceExchance Inc', date: '5 Dec, 2023', desc: 'Trade: Sell',  amount: '-$340.00', isNeg: true  },
  { logo: { src: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/3f03dafd-eab5-41f6-9943-013a0267566d.svg', border: '1px solid #000' }, entity: 'Augment LLC',      date: '4 Dec, 2024', desc: 'Service Fee',  amount: '-$15.00',  isNeg: true  },
  { logo: { src: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/bd04d485-acd2-4959-a448-f1aaced9fc81.svg', bg: '#4353FF' },         entity: 'Gaant Giant',        date: '3 Dec, 2023', desc: 'Webflow',     amount: '-$49.00',  isNeg: true  },
  { logo: { src: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/98e93cea-45e7-4de5-a10c-41ce726abdc2.svg', border: '1px solid #000' }, entity: 'Harry Mants',        date: '2 Dec, 2023', desc: 'Cuboid',      amount: '-$32.00',  isNeg: true  },
];

// ─── Analytics sub-components ─────────────────────────────────────────────────

const AnalyticsStatCard: React.FC<typeof ANALYTICS_STAT_CARDS[0] & { index: number; onClick: () => void }> = ({ title, amount, subtext, percentage, isPositive, icon, index, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<SVGRectElement>(null);
  /** While true, skip ResizeObserver updates so border 1px→1.5px hover does not remeasure and restart the orbit animation (flicker). */
  const orbitLayoutFrozenRef = useRef(false);
  /**
   * Border-box metrics (not clientWidth): the SVG must sit on the same box the CSS border is painted on.
   * bw = border width — rect is inset by bw/2 so the stroke centerline matches the border centerline.
   */
  const [dims, setDims] = useState({ ow: 0, oh: 0, bt: 0, bl: 0, bw: 0 });
  const [orbitPathLen, setOrbitPathLen] = useState(0);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const read = () => {
      if (orbitLayoutFrozenRef.current) return;
      const cs = getComputedStyle(el);
      const bt = parseFloat(cs.borderTopWidth) || 0;
      const bl = parseFloat(cs.borderLeftWidth) || 0;
      const bw = parseFloat(cs.borderTopWidth) || 0;
      const ow = el.offsetWidth;
      const oh = el.offsetHeight;
      if (ow > 0 && oh > 0) setDims({ ow, oh, bt, bl, bw });
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    const vv = window.visualViewport;
    vv?.addEventListener('resize', read);
    window.addEventListener('resize', read);
    return () => {
      ro.disconnect();
      vv?.removeEventListener('resize', read);
      window.removeEventListener('resize', read);
    };
  }, []);

  const r = 8;
  const { ow, oh, bt, bl, bw } = dims;
  /** Centerline of the CSS border (inset from border-box outer edge by bw/2) */
  const inset = bw / 2;
  const rw = Math.max(0, ow - bw);
  const rh = Math.max(0, oh - bw);
  const rxUse = rw > 0 && rh > 0 ? Math.min(Math.max(0, r - inset), rw / 2, rh / 2) : 0;
  const accentStroke = isPositive ? 'rgba(21,150,0,0.75)' : 'rgba(228,44,44,0.75)';

  useLayoutEffect(() => {
    if (!hovered || rw <= 0 || rh <= 0) {
      setOrbitPathLen(0);
      return;
    }
    const measure = () => {
      const el = orbitRef.current;
      if (!el) return;
      const len = el.getTotalLength();
      setOrbitPathLen(len);
      if (len > 20) {
        el.setAttribute('stroke-dasharray', `18 ${len - 18}`);
        el.setAttribute('stroke-dashoffset', '0');
      }
    };
    measure();
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [hovered, rw, rh, rxUse]);

  useEffect(() => {
    if (!hovered || orbitPathLen <= 20) return;
    const el = orbitRef.current;
    if (!el) return;
    el.setAttribute('stroke-dasharray', `18 ${orbitPathLen - 18}`);
    el.setAttribute('stroke-dashoffset', '0');
    const controls = animate(0, -orbitPathLen, {
      duration: 3.2,
      repeat: Infinity,
      ease: 'linear',
      onUpdate: v => {
        if (el.isConnected) el.setAttribute('stroke-dashoffset', String(v));
      },
    });
    return () => controls.stop();
  }, [hovered, orbitPathLen]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, transition: { duration: 0.35, ease: 'easeInOut' } }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, delay: index * 0.07, ease }}
      onClick={onClick}
      onHoverStart={() => {
        orbitLayoutFrozenRef.current = true;
        setHovered(true);
      }}
      onHoverEnd={() => {
        setHovered(false);
        orbitLayoutFrozenRef.current = false;
        const el = cardRef.current;
        if (!el) return;
        requestAnimationFrame(() => {
          const cs = getComputedStyle(el);
          const bt = parseFloat(cs.borderTopWidth) || 0;
          const bl = parseFloat(cs.borderLeftWidth) || 0;
          const bw = parseFloat(cs.borderTopWidth) || 0;
          const ow = el.offsetWidth;
          const oh = el.offsetHeight;
          if (ow > 0 && oh > 0) setDims({ ow, oh, bt, bl, bw });
        });
      }}
      style={{
        boxSizing: 'border-box',
        border: hovered
          ? `1.5px solid ${isPositive ? 'rgba(21,150,0,0.25)' : 'rgba(228,44,44,0.25)'}`
          : '1px solid rgba(208,213,221,0.5)',
        borderRadius: '8px', padding: '25px', flex: 1, minWidth: '200px',
        display: 'flex', flexDirection: 'column', backgroundColor: '#FFF',
        cursor: 'pointer', position: 'relative',
        transition: 'border-color 0.3s, border-width 0.3s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <img src={icon} alt={title} style={{ width: '10px', height: '10px' }} />
        <span style={{ color: 'rgba(119,119,119,1)', fontSize: '14px', fontWeight: 500, fontFamily: font }}>{title}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <CountUp key={amount} rawValue={amount} style={{ color: '#000', fontSize: '26px', fontFamily: font }} />
        <div style={{ display: 'inline-flex', padding: '8px 12px', gap: '7px', backgroundColor: isPositive ? 'rgba(21,150,0,0.1)' : 'rgba(228,44,44,0.1)', borderRadius: '10px', alignItems: 'center' }}>
          <img src={isPositive
            ? 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/292003e2-c325-4519-b04f-e6840a857962.svg'
            : 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/d7f17ec3-c44a-4900-81cf-47524eaeccd4.svg'}
            alt="trend" style={{ width: '7.5px', height: '10px' }} />
          <span style={{ color: isPositive ? 'rgba(21,150,0,1)' : 'rgba(228,44,44,1)', fontSize: '14px', fontFamily: font, fontWeight: 500, letterSpacing: '-0.28px' }}>{percentage}</span>
        </div>
      </div>
      <span style={{ marginTop: '12px', color: isPositive ? 'rgba(21,150,0,1)' : 'rgba(228,44,44,1)', fontSize: '12px', fontFamily: font }}>{subtext}</span>

      {/* ── Orbiting glow: SVG coordinate system = border box; path = border centerline (matches CSS stroke) ── */}
      <AnimatePresence>
        {hovered && ow > 0 && oh > 0 && (
          <motion.svg
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            viewBox={`0 0 ${ow} ${oh}`}
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              top: -bt,
              left: -bl,
              width: ow,
              height: oh,
              display: 'block',
              pointerEvents: 'none',
              zIndex: 2,
              overflow: 'visible',
            }}
          >
            <rect
              ref={orbitRef}
              x={inset}
              y={inset}
              width={rw}
              height={rh}
              rx={rxUse}
              ry={rxUse}
              fill="none"
              stroke={accentStroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: orbitPathLen > 15 ? 1 : 0 }}
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const StatisticsChart: React.FC<{ data: ChartBar[]; animKey: string }> = ({ data, animKey }) => {
  const chartH = 200;
  const yMax = Math.max(...data.map(d => Math.max(d.earned, d.spent)));
  const yMaxR = Math.ceil(yMax / 200) * 200 || 1000;
  const yLabels = [yMaxR, yMaxR * 0.8, yMaxR * 0.6, yMaxR * 0.4, yMaxR * 0.2, 0];
  const fmt = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : String(v);
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '36px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: `${chartH}px` }}>
          {yLabels.map(v => <span key={v} style={{ fontSize: '11px', color: '#888', fontFamily: font, textAlign: 'right', display: 'block', lineHeight: 1 }}>{fmt(v)}</span>)}
        </div>
        <div style={{ flex: 1, marginLeft: '16px', height: `${chartH}px`, position: 'relative' }}>
          {yLabels.map((_, i) => <div key={i} style={{ position: 'absolute', top: `${i / (yLabels.length - 1) * 100}%`, left: 0, right: 0, height: '1px', backgroundColor: '#F2F4F7' }} />)}
          <div key={animKey} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            {data.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', flex: 1, justifyContent: 'center' }}>
                <motion.div initial={{ height: 0 }} animate={{ height: `${d.earned / yMaxR * chartH}px` }} transition={{ duration: 0.55, delay: 0.05 + i * 0.035, ease }} style={{ width: '10px', backgroundColor: '#377CF6', borderRadius: '3px 3px 0 0' }} />
                <motion.div initial={{ height: 0 }} animate={{ height: `${d.spent / yMaxR * chartH}px` }} transition={{ duration: 0.55, delay: 0.1 + i * 0.035, ease }} style={{ width: '10px', backgroundColor: '#95E0FB', borderRadius: '3px 3px 0 0' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', marginTop: '10px', paddingLeft: '52px' }}>
        {data.map(d => <div key={d.label} style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: '#888', fontFamily: font }}>{d.label}</div>)}
      </div>
    </div>
  );
};

/** View All / Show Less: underline slides in from the left; line sits at text baseline (same pattern as table links). */
const SpendBreakdownViewAllToggle: React.FC<{ showAll: boolean; onToggle: () => void }> = ({ showAll, onToggle }) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontFamily: font,
        alignSelf: 'flex-end',
        padding: '10px 0 0 0',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      <span style={{ position: 'relative', display: 'inline-block', lineHeight: 1.2 }}>
        <span style={{ color: '#888' }}>{showAll ? 'Show Less' : 'View All'}</span>
        <motion.span
          initial={false}
          animate={{ scaleX: hover ? 1 : 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '1px',
            backgroundColor: '#888',
            transformOrigin: 'left',
          }}
        />
      </span>
      <motion.span animate={{ rotate: showAll ? 270 : 90 }} transition={{ duration: 0.2 }} style={{ fontSize: '13px', display: 'inline-block', color: '#888' }}>
        ›
      </motion.span>
    </button>
  );
};

const SpendBreakdown: React.FC<{ month: string; onMonthChange: (m: string) => void }> = ({ month, onMonthChange }) => {
  const [showAll, setShowAll] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setShowMenu(false));
  const cats = buildSpendCategories(month);
  const visible = showAll ? cats : cats.slice(0, 4);
  return (
    <div style={{ flex: '0 0 300px', minWidth: '280px', backgroundColor: '#FFF', border: '1px solid rgba(208,213,221,0.5)', borderRadius: '8px', padding: '25px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '18px', fontFamily: font, fontWeight: 500 }}>Spend Breakdown</span>
        <div ref={menuRef} style={{ position: 'relative' }}>
          <DropdownTriggerButton onClick={() => setShowMenu(v => !v)}>
            {month.slice(0, 3)}
            <motion.img animate={{ rotate: showMenu ? 180 : 0 }} transition={{ duration: 0.2 }}
              src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/75edc13f-6ea6-4659-b53b-40b5db2828b7.svg" alt="" style={{ width: '20px' }} />
          </DropdownTriggerButton>
          <AnimatePresence>
            {showMenu && (
              <DropdownMenu style={{ top: '38px', right: 0, minWidth: '130px' }}
                items={SPEND_MONTHS_LIST.map(m => ({ label: m, onClick: () => { onMonthChange(m); setShowMenu(false); } }))} />
            )}
          </AnimatePresence>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <motion.div key={month} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.7, ease }}
          style={{ width: '100px', height: '100px', borderRadius: '50%', background: buildConicGradient(cats), position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '48px', height: '48px', backgroundColor: '#FFF', borderRadius: '50%' }} />
        </motion.div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', flex: 1 }}>
        <AnimatePresence mode="popLayout">
          {visible.map((item, idx) => (
            <motion.div key={item.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2, delay: idx * 0.03 }}
              style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', width: '130px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap', fontFamily: font, color: '#000' }}>{item.label}</span>
              </div>
              <span style={{ width: '40px', fontFamily: font, color: '#000' }}>{item.val}</span>
              <span style={{ color: '#888', fontFamily: font }}>({item.pct})</span>
              <span style={{ color: item.trendColor, fontFamily: font }}>{item.trend}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <SpendBreakdownViewAllToggle showAll={showAll} onToggle={() => setShowAll(v => !v)} />
    </div>
  );
};

// Custom checkbox with visible checkmark
const Checkbox: React.FC<{ checked: boolean; onChange: (v: boolean) => void; stopClick?: boolean }> = ({ checked, onChange, stopClick = false }) => (
  <motion.div
    animate={{ backgroundColor: checked ? '#377CF6' : '#FFF', borderColor: checked ? '#377CF6' : 'rgba(208,213,221,0.8)' }}
    transition={{ duration: 0.12 }}
    onClick={e => { if (stopClick) e.stopPropagation(); onChange(!checked); }}
    style={{ width: '14px', height: '14px', border: '1.5px solid rgba(208,213,221,0.8)', borderRadius: '3px', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <AnimatePresence>
      {checked && (
        <motion.svg initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.12 }} width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      )}
    </AnimatePresence>
  </motion.div>
);

// Analytics transaction detail modal
const AnalyticsDetailModal: React.FC<{ row: typeof ANALYTICS_ROWS[0]; onClose: () => void }> = ({ row, onClose }) => (
  <Overlay onClose={onClose}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
      <div style={{ width: '36px', height: '36px', backgroundColor: row.logo.bg ?? '#FFF', border: row.logo.border ?? 'none', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <img src={row.logo.src} alt="" style={{ maxWidth: '22px', maxHeight: '22px' }} />
      </div>
      <div>
        <div style={{ fontSize: '16px', fontFamily: font, fontWeight: 500, color: '#000', letterSpacing: '-0.3px' }}>{row.entity}</div>
        <div style={{ fontSize: '13px', fontFamily: font, color: '#888', marginTop: '2px' }}>{row.desc}</div>
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
      {[{ label: 'Amount', value: row.amount, color: row.isNeg ? '#E42C2C' : '#159600' }, { label: 'Date', value: row.date }, { label: 'Description', value: row.desc }, { label: 'Status', value: 'Success', color: '#159600' }].map(({ label, value, color }) => (
        <div key={label}>
          <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '4px' }}>{label}</div>
          <div style={{ fontSize: '16px', fontFamily: font, color: color ?? '#000', fontWeight: 500 }}>{value}</div>
        </div>
      ))}
    </div>
    <div style={{ height: '1px', backgroundColor: '#EEEEEE', marginBottom: '20px' }} />
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
      <SlidingTextSwapButton label="Close" variant="secondary" onClick={onClose} />
      <SlidingTextSwapButton label="Edit" variant="primary" onClick={onClose} />
    </div>
  </Overlay>
);

const AnalyticsTransactionRow: React.FC<{ row: typeof ANALYTICS_ROWS[0]; index: number; checked: boolean; onCheck: (v: boolean) => void; onClick: () => void; logoPopoverOpen: boolean; onLogoClick: () => void; onLogoClose: () => void }> = ({ row, index, checked, onCheck, onClick, logoPopoverOpen, onLogoClick, onLogoClose }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0, backgroundColor: checked ? 'rgba(55,124,246,0.05)' : 'rgba(255,255,255,0)' }}
    exit={{
      opacity: 0,
      x: 80,
      filter: 'blur(3px)',
      height: 0,
      paddingTop: 0,
      paddingBottom: 0,
      borderBottomWidth: 0,
    }}
    transition={{
      opacity: { duration: 0.22, ease: 'easeOut' },
      x: { duration: 0.28, ease: [0.4, 0, 1, 1] },
      filter: { duration: 0.22 },
      height: { duration: 0.22, delay: 0.18, ease: 'easeInOut' },
      paddingTop: { duration: 0.22, delay: 0.18 },
      paddingBottom: { duration: 0.22, delay: 0.18 },
      borderBottomWidth: { duration: 0.22, delay: 0.18 },
    }}
    style={{ display: 'flex', alignItems: 'center', padding: '14px 25px', borderBottom: '1px solid rgba(208,213,221,0.2)', overflow: 'visible', cursor: 'pointer' }}
    onClick={() => onCheck(!checked)}
    onMouseEnter={e => !checked && (e.currentTarget.style.backgroundColor = 'rgba(248,248,249,0.7)')}
    onMouseLeave={e => !checked && (e.currentTarget.style.backgroundColor = 'transparent')}
  >
    <div style={{ width: '40px', flexShrink: 0 }}>
      <Checkbox checked={checked} onChange={onCheck} stopClick />
    </div>
    {/* To/From */}
    <div style={{ width: '220px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px', marginRight: '88px', position: 'relative' }}>
      <motion.div
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.18, ease }}
        onClick={e => { e.stopPropagation(); onLogoClick(); }}
        style={{ width: '20px', height: '20px', backgroundColor: row.logo.bg ?? '#FFF', border: row.logo.border ?? 'none', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
      >
        <img src={row.logo.src} alt="" style={{ width: '12px' }} />
      </motion.div>
      <TableUnderlineLink onClick={onClick} stopPropagation style={{ color: '#000' }}>
        {row.entity}
      </TableUnderlineLink>
      <AnimatePresence>
        {logoPopoverOpen && <AnalyticsLogoPopover row={row} onClose={onLogoClose} />}
      </AnimatePresence>
    </div>
    <div style={{ width: '120px', flexShrink: 0, marginRight: '72px' }}>
      <TableUnderlineLink onClick={onClick} stopPropagation style={{ color: '#000' }}>
        {row.date}
      </TableUnderlineLink>
    </div>
    <div style={{ width: '120px', flexShrink: 0, marginRight: '72px' }}><span style={{ fontSize: '14px', color: '#000', fontFamily: font }}>{row.desc}</span></div>
    <div style={{ width: '100px', flexShrink: 0, marginRight: '60px' }}>
      <span style={{ fontSize: '14px', color: row.isNeg ? '#E42C2C' : '#159600', fontFamily: font, fontWeight: 400 }}>{row.amount}</span>
    </div>
    <div style={{ width: '105px', flexShrink: 0 }}>
      <span
        style={{
          display: 'inline-block',
          padding: '6px 20px',
          backgroundColor: '#FFF',
          border: '1px solid rgba(21,150,0,1)',
          borderRadius: '100px',
          color: 'rgba(21,150,0,1)',
          fontSize: '14px',
          fontFamily: font,
          cursor: 'default',
          userSelect: 'none',
        }}
      >
        Success
      </span>
    </div>
  </motion.div>
);

// ─── Analytics stat detail modal ──────────────────────────────────────────────

const StatDetailModal: React.FC<{ card: typeof ANALYTICS_STAT_CARDS[0]; onClose: () => void }> = ({ card, onClose }) => (
  <Overlay onClose={onClose}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
      <img src={card.icon} alt="" style={{ width: '16px', height: '16px' }} />
      <span style={{ fontSize: '18px', fontFamily: font, fontWeight: 500, letterSpacing: '-0.36px' }}>{card.title} Overview</span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <CountUp key={card.amount} rawValue={card.amount} style={{ fontSize: '36px', fontFamily: font, color: '#000' }} />
      <div style={{ display: 'inline-flex', padding: '8px 14px', gap: '8px', backgroundColor: card.isPositive ? 'rgba(21,150,0,0.1)' : 'rgba(228,44,44,0.1)', borderRadius: '10px', alignItems: 'center' }}>
        <span style={{ color: card.isPositive ? '#159600' : '#E42C2C', fontSize: '15px', fontFamily: font, fontWeight: 500 }}>{card.percentage}</span>
      </div>
    </div>
    <div style={{ fontSize: '13px', fontFamily: font, color: card.isPositive ? '#159600' : '#E42C2C', marginBottom: '24px' }}>{card.subtext}</div>
    <div style={{ height: '1px', backgroundColor: '#EEEEEE', marginBottom: '20px' }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
      {['vs Last Month', 'vs Last Quarter', 'vs Last Year'].map((label, i) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontFamily: font }}>
          <span style={{ color: '#888' }}>{label}</span>
          <span style={{ color: card.isPositive ? '#159600' : '#E42C2C', fontWeight: 500 }}>{card.isPositive ? '+' : ''}{(i + 1) * (card.isPositive ? 8 : -5)}%</span>
        </div>
      ))}
    </div>
    <SlidingTextSwapButton
      label="Done"
      variant="primary"
      onClick={onClose}
      style={{ width: '100%', padding: '11px 10px' }}
    />
  </Overlay>
);

// ─── Analytics page content ───────────────────────────────────────────────────

const AnalyticsContent: React.FC = () => {
  const [chartPeriod, setChartPeriod] = useState<ChartPeriodType>('Yearly');
  const [showChartMenu, setShowChartMenu] = useState(false);
  const [spendMonth, setSpendMonth] = useState('January');
  const [rows, setRows] = useState(ANALYTICS_ROWS);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [detailRow, setDetailRow] = useState<typeof ANALYTICS_ROWS[0] | null>(null);
  const [statDetail, setStatDetail] = useState<typeof ANALYTICS_STAT_CARDS[0] | null>(null);
  const [openLogoPopover, setOpenLogoPopover] = useState<number | null>(null);

  const chartMenuRef = useRef<HTMLDivElement>(null);
  useClickOutside(chartMenuRef, () => setShowChartMenu(false));

  const chartData = CHART_DATASETS[chartPeriod];
  const allSelected = rows.length > 0 && selectedRows.size === rows.length;
  const toggleAll = () => allSelected ? setSelectedRows(new Set()) : setSelectedRows(new Set(rows.map((_, i) => i)));
  const toggleRow = (i: number, v: boolean) => {
    const next = new Set(selectedRows);
    v ? next.add(i) : next.delete(i);
    setSelectedRows(next);
  };
  const clearSelection = () => setSelectedRows(new Set());
  const deleteSelected = () => {
    setRows(prev => prev.filter((_, i) => !selectedRows.has(i)));
    setSelectedRows(new Set());
  };

  useEscapeKey(() => {
    if (openLogoPopover !== null) {
      setOpenLogoPopover(null);
      return;
    }
    if (detailRow !== null || statDetail !== null) return;
    if (selectedRows.size > 0) setSelectedRows(new Set());
  }, openLogoPopover !== null || (selectedRows.size > 0 && detailRow === null && statDetail === null));

  return (
    <motion.div
      key="analytics"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.3, ease }}
      style={{ overflowY: 'auto', flex: 1, position: 'relative', zIndex: 1, paddingTop: '14px', boxSizing: 'border-box' }}
    >

      {/*
        Esc closes popups opened on Analytics.
        Overlay popups will handle Esc via Overlay hook; this covers the logo popover.
      */}

      {/* Stat cards — paddingTop on parent + z-index so lift/orbit aren’t clipped by the main shell */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', overflow: 'visible', position: 'relative', zIndex: 2 }}>
        {ANALYTICS_STAT_CARDS.map((card, i) => <AnalyticsStatCard key={card.title} {...card} index={i} onClick={() => setStatDetail(card)} />)}
      </div>

      {/* Charts row */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '2', minWidth: '400px', backgroundColor: '#FFF', border: '1px solid rgba(208,213,221,0.5)', borderRadius: '8px', padding: '25px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '18px', fontFamily: font, fontWeight: 500 }}>Statistics</span>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              {[{ color: '#377CF6', label: 'Earned' }, { color: '#95E0FB', label: 'Spent' }].map(leg => (
                <div key={leg.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontFamily: font }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: leg.color }} /> {leg.label}
                </div>
              ))}
              <div ref={chartMenuRef} style={{ position: 'relative' }}>
                <DropdownTriggerButton onClick={() => setShowChartMenu(v => !v)}>
                  {chartPeriod}
                  <motion.img animate={{ rotate: showChartMenu ? 180 : 0 }} transition={{ duration: 0.2 }}
                    src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/65bc4581-aeec-47ac-8a0f-79e059030bb7.svg" alt="" style={{ width: '20px' }} />
                </DropdownTriggerButton>
                <AnimatePresence>
                  {showChartMenu && (
                    <DropdownMenu style={{ top: '40px', right: 0 }} items={(['Yearly', 'Quarterly', 'Monthly'] as ChartPeriodType[]).map(p => ({
                      label: p, onClick: () => { setChartPeriod(p); setShowChartMenu(false); }
                    }))} />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          <StatisticsChart data={chartData} animKey={chartPeriod} />
        </div>
        <SpendBreakdown month={spendMonth} onMonthChange={setSpendMonth} />
      </div>

      {/* Latest Transactions */}
      <div style={{ border: '1px solid rgba(208,213,221,0.5)', borderRadius: '8px', backgroundColor: '#FFF', marginBottom: '8px' }}>
        <div style={{ padding: '20px 25px', borderBottom: '1px solid rgba(208,213,221,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '18px', fontFamily: font, fontWeight: 500 }}>Latest Transactions</span>
          <AnimatePresence>
            {selectedRows.size > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15 }}
                style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontFamily: font, color: '#888' }}>{selectedRows.size} selected</span>
                <SlidingTextSwapButton label="Clear" variant="secondary" onClick={clearSelection} />
                <SlidingTextSwapButton label="Delete" variant="danger" onClick={deleteSelected} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 25px', color: '#666', fontSize: '14px', fontFamily: font, borderBottom: '1px solid rgba(208,213,221,0.2)', backgroundColor: 'rgba(248,248,249,0.5)' }}>
          <div style={{ width: '40px', flexShrink: 0 }}>
            <Checkbox checked={allSelected} onChange={toggleAll} />
          </div>
          {[{ w: '220px', mr: '88px', label: 'To/From:' }, { w: '120px', mr: '72px', label: 'Date' }, { w: '120px', mr: '72px', label: 'Description' }, { w: '100px', mr: '60px', label: 'Amount' }, { w: '105px', mr: '0', label: 'Status' }].map(col => (
            <div key={col.label} style={{ width: col.w, flexShrink: 0, marginRight: col.mr }}>{col.label}</div>
          ))}
        </div>
        <AnimatePresence>
          {rows.map((row, i) => (
            <AnalyticsTransactionRow
              key={`${row.entity}-${row.date}-${row.desc}`}
              row={row}
              index={i}
              checked={selectedRows.has(i)}
              onCheck={v => toggleRow(i, v)}
              onClick={() => setDetailRow(row)}
              logoPopoverOpen={openLogoPopover === i}
              onLogoClick={() => setOpenLogoPopover(openLogoPopover === i ? null : i)}
              onLogoClose={() => setOpenLogoPopover(null)}
            />
          ))}
        </AnimatePresence>
        {rows.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px', textAlign: 'center', fontSize: '14px', fontFamily: font, color: '#888' }}>
            No transactions
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {detailRow && <AnalyticsDetailModal key="detail" row={detailRow} onClose={() => setDetailRow(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {statDetail && <StatDetailModal key="statdetail" card={statDetail} onClose={() => setStatDetail(null)} />}
      </AnimatePresence>
    </motion.div>
  );
};

// Table action buttons — path-draw on full CTA area hover; no scale
const TableActionButtons: React.FC<{ onEditClick: () => void; onDetailsClick: () => void }> = ({ onEditClick, onDetailsClick }) => {
  const [editHover, setEditHover] = useState(false);
  const [detailsHover, setDetailsHover] = useState(false);
  return (
    <div style={{ width: '56px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onEditClick}
        onMouseEnter={e => { setEditHover(true); e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)'; }}
        onMouseLeave={e => { setEditHover(false); e.currentTarget.style.backgroundColor = 'transparent'; }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <PencilIcon size={16} isHovered={editHover} />
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onDetailsClick}
        onMouseEnter={e => { setDetailsHover(true); e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)'; }}
        onMouseLeave={e => { setDetailsHover(false); e.currentTarget.style.backgroundColor = 'transparent'; }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <ChevronRightIcon size={16} isHovered={detailsHover} />
      </motion.button>
    </div>
  );
};

// Table link with underline that slides in from left on hover (fast, sized to text only, visually close to native underline)
const TableUnderlineLink: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  /** When the row also handles clicks (e.g. toggle selection), stop bubbling so link actions stay separate. */
  stopPropagation?: boolean;
}> = ({ onClick, children, style, stopPropagation: stopRow }) => {
  const [hover, setHover] = useState(false);
  return (
    <span
      onClick={e => {
        if (stopRow) e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ fontSize: '14px', fontFamily: font, letterSpacing: '-0.28px', textAlign: 'left', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', ...style }}
    >
      <span style={{ position: 'relative', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
        {children}
        <motion.span
          initial={false}
          animate={{ scaleX: hover ? 1 : 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          // bottom offset chosen so the line touches the base of letters similarly to a native underline
          style={{ position: 'absolute', left: 0, right: 0, bottom: '2px', height: '1px', backgroundColor: '#000', transformOrigin: 'left' }}
        />
      </span>
    </span>
  );
};

// ─── Transaction row ──────────────────────────────────────────────────────────

interface TransactionRowProps {
  tx: Transaction;
  index: number;
  onLogoClick: () => void;
  onLogoClose: () => void;
  onNameClick: () => void;
  onDateClick: () => void;
  onEditClick: () => void;
  onDetailsClick: () => void;
  logoPopoverOpen: boolean;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ tx, index, onLogoClick, onLogoClose, onNameClick, onDateClick, onEditClick, onDetailsClick, logoPopoverOpen }) => {
  const amountColor = tx.amount.startsWith('+') ? '#159600' : '#E42C2C';
  const dashIdx = tx.company.indexOf(' - ');
  const companyName = dashIdx !== -1 ? tx.company.slice(0, dashIdx) : tx.company;
  const companyDesc = dashIdx !== -1 ? tx.company.slice(dashIdx) : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.055, ease: 'easeOut' }}
      style={{ display: 'flex', alignItems: 'center', padding: '20px 16px', borderBottom: '1px solid rgba(238,238,238,1)', gap: '16px', minWidth: '800px', position: 'relative' }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(248,248,249,0.5)')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {/* Company */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '2', minWidth: '200px', position: 'relative' }}>
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.18, ease }}
          onClick={onLogoClick}
          style={{ width: '20px', height: '20px', backgroundColor: tx.logoBg, borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: tx.logoBg === 'rgba(255, 255, 255, 1)' ? '1px solid rgba(0,0,0,1)' : 'none', flexShrink: 0, cursor: 'pointer' }}
        >
          <img src={tx.logo} alt="" style={{ maxWidth: '14px', maxHeight: '16px' }} />
        </motion.div>
        <TableUnderlineLink onClick={onNameClick} style={{ flex: 1, minWidth: 0 }}>
          <span style={{ color: '#000' }}>{companyName}</span>
          {companyDesc && <span style={{ color: '#888888' }}>{companyDesc}</span>}
        </TableUnderlineLink>
        <AnimatePresence>
          {logoPopoverOpen && <LogoPopover tx={tx} onClose={onLogoClose} />}
        </AnimatePresence>
      </div>

      {/* Date */}
      <TableUnderlineLink onClick={onDateClick} style={{ flex: '1', minWidth: '120px' }}>
        {tx.date}
      </TableUnderlineLink>

      {/* Description */}
      <span style={{ flex: '1', minWidth: '150px', fontSize: '14px', fontFamily: font, color: '#000', letterSpacing: '-0.28px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
        {tx.description}
      </span>

      {/* Amount + tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '0 0 200px' }}>
        <div style={{ fontSize: '14px', fontFamily: font, color: amountColor, letterSpacing: '-0.28px', minWidth: '70px', textAlign: 'left', fontWeight: 400 }}>
          {tx.amount}
        </div>
        {tx.tag && (
          <div style={{ display: 'inline-flex', padding: '2px 10px', borderRadius: '3px', backgroundColor: tx.type === 'income' ? 'rgba(21,150,0,0.1)' : 'rgba(228,44,44,0.1)', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: '12px', fontFamily: font, color: tx.type === 'income' ? 'rgba(21,150,0,1)' : 'rgba(228,44,44,1)' }}>{tx.tag}</span>
          </div>
        )}
      </div>

      {/* Action icons */}
      <TableActionButtons onEditClick={onEditClick} onDetailsClick={onDetailsClick} />
    </motion.div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const DEFAULT_AVATAR = 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/e3a005ab-d5f5-49e1-b1a7-61759b67b053.jpg';

export const CompanyTransactionList: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const isSettingsPage = pathname === '/settings';
  const isHelpPage = pathname === '/help';
  const isStandalonePage = isSettingsPage || isHelpPage;

  const [activeTab, setActiveTab] = useState('Home');
  const [activePeriod, setActivePeriod] = useState('This Month');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showStatsMenu, setShowStatsMenu] = useState(false);
  const [showUserCard, setShowUserCard] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const [user, setUser] = useState({ firstName: 'Medina', lastName: 'Mendes', email: 'medina@incomes.co', jobTitle: 'Founder', avatarUrl: DEFAULT_AVATAR });

  const [openLogoPopover, setOpenLogoPopover] = useState<number | null>(null);
  const [nameModalTx, setNameModalTx] = useState<Transaction | null>(null);
  const [dateModalDate, setDateModalDate] = useState<string | null>(null);
  const [editModalTx, setEditModalTx] = useState<Transaction | null>(null);
  const [detailsModalTx, setDetailsModalTx] = useState<Transaction | null>(null);

  const periodRef = useRef<HTMLDivElement>(null);
  const statsMenuRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useClickOutside(periodRef, () => setShowPeriodDropdown(false));
  useClickOutside(statsMenuRef, () => setShowStatsMenu(false));
  useClickOutside(userRef, () => setShowUserCard(false));
  useClickOutside(notifRef, () => setShowNotifications(false));

  // Esc closes any open popup/modal throughout the shell.
  useEscapeKey(() => {
    setShowPeriodDropdown(false);
    setShowStatsMenu(false);
    setShowUserCard(false);
    setShowNotifications(false);
    setShowUpgrade(false);
    setShowProfileSheet(false);
    setOpenLogoPopover(null);
    setNameModalTx(null);
    setDateModalDate(null);
    setEditModalTx(null);
    setDetailsModalTx(null);
  }, true);

  const stats = PERIOD_STATS[activePeriod];
  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;
  const breadcrumb: Record<string, string> = { Home: 'Home', Analytics: 'Analytics', Contacts: 'Contacts', Incomes: 'Incomes', Expenses: 'Expenses' };
  const BreadcrumbIcon = isSettingsPage
    ? SettingsIcon
    : isHelpPage
      ? HelpIcon
      : ({ Home: HomeIcon, Analytics: AnalyticsIcon, Contacts: ContactsIcon, Incomes: IncomesIcon, Expenses: ExpensesIcon } as const)[activeTab] ?? HomeIcon;

  // #region agent log
  fetch('http://127.0.0.1:7922/ingest/aa52f02a-b593-4a36-aa29-89498cec660d', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '3ce036' },
    body: JSON.stringify({
      sessionId: '3ce036',
      runId: 'initial',
      hypothesisId: 'H0',
      location: 'CompanyTransactionList.tsx:CompanyTransactionList',
      message: 'Main CompanyTransactionList render reached',
      data: { pathname, activeTab, activePeriod },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#F8F8F9', display: 'flex', paddingTop: '20px', paddingBottom: '20px', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', display: 'flex', gap: '1.75%', position: 'relative' }}>

        {/* ── Sidebar ── */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease }}
          style={{ width: 'calc(17.5% - 20px)', minWidth: '200px', marginLeft: '1.75%', flexShrink: 0, display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '35px' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(180deg,#FFFFFF 0%,#D0D5DD 100%)', border: '0.3px solid #D0D5DD', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/7dd5292e-9f71-4304-a694-de2c09e578d6.svg" alt="Logo" style={{ width: '100%' }} />
            </div>
            <span style={{ fontSize: '18px', fontFamily: font, fontWeight: 600, letterSpacing: '-0.18px' }}>Income S</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
            {[
              { label: 'Home', Icon: HomeIcon },
              { label: 'Analytics', Icon: AnalyticsIcon },
              { label: 'Contacts', Icon: ContactsIcon },
              { label: 'Incomes', Icon: IncomesIcon },
              { label: 'Expenses', Icon: ExpensesIcon },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.05 + i * 0.05, ease }}>
                <SidebarItem
                  Icon={item.Icon}
                  label={item.label}
                  active={!isStandalonePage && activeTab === item.label}
                  onClick={() => {
                    setActiveTab(item.label);
                    if (isStandalonePage) navigate('/');
                  }}
                />
              </motion.div>
            ))}
          </nav>

          <div style={{ marginTop: 'auto', paddingBottom: '20px' }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ width: '100%', height: '5px', backgroundColor: '#D9D9D9', borderRadius: '4px', marginBottom: '10px' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: '25%' }} transition={{ duration: 0.8, delay: 0.4, ease }} style={{ height: '100%', backgroundColor: '#000', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontFamily: font, color: '#888' }}>1.25 / 5 GB</span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUpgrade(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '14px',
                    fontFamily: font,
                    color: '#000',
                    cursor: 'pointer',
                    padding: 0,
                    position: 'relative',
                    overflow: 'hidden',
                    lineHeight: 1.2,
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget;
                    el.style.backgroundImage = 'linear-gradient(currentColor,currentColor)';
                    el.style.backgroundRepeat = 'no-repeat';
                    el.style.backgroundSize = '0% 1px';
                    // place the underline where a native text-decoration would sit (slightly above the bottom)
                    el.style.backgroundPosition = '0 90%';
                    // trigger layout so transition applies
                    // @ts-ignore
                    void el.offsetWidth;
                    el.style.transition = 'background-size 0.18s ease-out';
                    el.style.backgroundSize = '100% 1px';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget;
                    el.style.backgroundSize = '0% 1px';
                  }}
                >
                  Upgrade
                </motion.button>
              </div>
            </div>
            <div style={{ height: '1px', backgroundColor: '#EDEDED', marginBottom: '24px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <HelpSettingsButton
                label="Help"
                Icon={HelpIcon}
                isActive={isHelpPage}
                onClick={() => navigate('/help')}
              />
              <HelpSettingsButton
                label="Settings"
                Icon={SettingsIcon}
                isActive={isSettingsPage}
                onClick={() => navigate('/settings')}
              />
            </div>
          </div>
        </motion.div>

        {/* ── Main Content ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease }}
          style={{ width: '79%', minWidth: '600px', marginRight: '20px', backgroundColor: '#FFFFFF', borderRadius: '15px', padding: '25px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', overflow: 'visible', position: 'relative' }}
        >
          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', transform: 'scale(0.75)', transformOrigin: 'left center' }}>
                <BreadcrumbIcon color="rgba(119,119,119,1)" />
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '14px', fontFamily: font }}>
                <button type="button" onClick={() => navigate('/')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: font, fontSize: '14px', color: 'rgba(119,119,119,1)' }}>Income S</button>
                <span style={{ color: '#000' }}>/</span>
                <span style={{ color: '#000' }}>{isSettingsPage ? 'Settings' : isHelpPage ? 'Help' : (breadcrumb[activeTab] ?? activeTab)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
              {/* Notifications */}
              <div ref={notifRef} style={{ position: 'relative' }}>
                <NotificationButton
                  onClick={() => { setShowNotifications(v => !v); setShowUserCard(false); }}
                  unreadCount={unreadCount}
                />
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.18, ease }}
                      style={{ position: 'absolute', right: 0, top: '40px', width: '320px', backgroundColor: '#fff', border: '1px solid rgba(208,213,221,0.7)', borderRadius: '10px', boxShadow: '0px 8px 24px rgba(0,0,0,0.08)', zIndex: 100, overflow: 'hidden' }}
                    >
                      <div style={{ padding: '14px 16px', borderBottom: '1px solid #EEEEEE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontFamily: font, fontWeight: 500 }}>Notifications</span>
                        <span style={{ fontSize: '12px', fontFamily: font, color: '#888', cursor: 'pointer' }}>Mark all read</span>
                      </div>
                      {NOTIFICATIONS.map(n => (
                        <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #F5F5F5', backgroundColor: n.unread ? 'rgba(0,0,0,0.015)' : 'transparent', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: n.unread ? '#000' : 'transparent', marginTop: '5px', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: '13px', fontFamily: font, color: '#111', lineHeight: 1.4 }}>{n.text}</div>
                            <div style={{ fontSize: '12px', fontFamily: font, color: '#999', marginTop: '3px' }}>{n.time}</div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User */}
              <div ref={userRef} style={{ position: 'relative' }}>
                <UserMenuButton
                  onClick={() => { setShowUserCard(v => !v); setShowNotifications(false); }}
                  avatarUrl={user.avatarUrl}
                  name={`${user.firstName} ${user.lastName}`}
                  chevronUrl="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/bb05f540-15f5-48f8-b269-4402da60c336.svg"
                />
                <AnimatePresence>
                  {showUserCard && (
                    <UserCard
                      onClose={() => setShowUserCard(false)}
                      onProfileClick={() => setShowProfileSheet(true)}
                      onSettingsClick={() => { setShowUserCard(false); navigate('/settings'); }}
                      userName={`${user.firstName} ${user.lastName}`}
                      userEmail={user.email}
                      userAvatarUrl={user.avatarUrl}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {!isStandalonePage && activeTab !== 'Contacts' && (
            <h1 style={{ fontSize: '24px', fontFamily: font, fontWeight: 400, margin: activeTab === 'Analytics' ? '0 0 16px 0' : '0 0 30px 0', letterSpacing: '-0.48px' }}>
              {activeTab === 'Analytics' ? 'Analytics' : activeTab === 'Incomes' ? 'Incomes' : activeTab === 'Expenses' ? 'Expenses' : 'Summary'}
            </h1>
          )}

          {isSettingsPage ? (
            <SettingsPage />
          ) : isHelpPage ? (
            <HelpPage />
          ) : (
          <AnimatePresence mode="wait">
          {activeTab === 'Contacts' ? <ContactsContent key="contacts" /> : activeTab === 'Analytics' ? <AnalyticsContent key="analytics" /> : activeTab === 'Incomes' ? <IncomesContent key="incomes" /> : activeTab === 'Expenses' ? <ExpensesContent key="expenses" /> : <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2, ease }}
            style={{ border: '1px solid rgba(208,213,221,0.5)', borderRadius: '8px', padding: '24px 31px', marginBottom: '24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '18px', fontFamily: font, letterSpacing: '-0.36px' }}>Total</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '15px' }}>
                  <CountUp
                    key={stats.total}
                    rawValue={stats.total}
                    style={{ fontSize: '50px', fontFamily: font, letterSpacing: '-1px', lineHeight: '1' }}
                  />
                  <img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/e858fb3f-c637-43fa-bcde-ffa91a483501.svg" alt="" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div ref={periodRef} style={{ position: 'relative', display: 'flex' }}>
                  <PeriodButton
                    activePeriod={activePeriod}
                    showDropdown={showPeriodDropdown}
                    onClick={() => setShowPeriodDropdown(v => !v)}
                  />
                  <AnimatePresence>
                    {showPeriodDropdown && (
                      <DropdownMenu style={{ top: '46px', right: 0 }} items={PERIOD_OPTIONS.map(opt => ({ label: opt, onClick: () => { setActivePeriod(opt); setShowPeriodDropdown(false); } }))} />
                    )}
                  </AnimatePresence>
                </div>

                <div ref={statsMenuRef} style={{ position: 'relative', display: 'flex' }}>
                  <StatsMenuButton onClick={() => setShowStatsMenu(v => !v)} />
                  <AnimatePresence>
                    {showStatsMenu && (
                      <DropdownMenu style={{ top: '46px', right: 0 }} items={[
                        { label: 'Export CSV', onClick: () => setShowStatsMenu(false) },
                        { label: 'View Full Report', onClick: () => setShowStatsMenu(false) },
                        { label: 'Print', onClick: () => { setShowStatsMenu(false); window.print(); } },
                      ]} />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Tax', value: stats.tax, icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/548701c3-1763-4a91-85ad-01bc7183daa1.svg', color: '#E42C2C' },
                  { label: 'Spent', value: stats.spent, icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/ef76cfbc-8b50-4240-89c9-1625b6e0258f.svg', color: '#E42C2C' },
                  { label: 'Net Income', value: stats.net, icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/3e54916f-696b-4996-a7f9-7f9489d60b0b.svg', color: '#159600' },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '18px', minWidth: '120px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#666', fontSize: '16px', fontFamily: font }}>{label}</span>
                      <div style={{ width: '12px', height: '12px', border: '1.5px solid #666', borderRadius: '50%', position: 'relative' }}>
                        <img src={icon} alt="" style={{ position: 'absolute', top: '2px', left: '2px' }} />
                      </div>
                    </div>
                    <CountUp key={`${label}-${value}`} rawValue={value} style={{ color, fontSize: '30px', fontFamily: font }} />
                  </div>
                ))}
              </div>

              <div style={{ width: '1px', height: '62px', backgroundColor: 'rgba(0,0,0,0.3)', flexShrink: 0 }} />

              <motion.div
                key={activePeriod}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease }}
                style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '200px' }}
              >
                <span style={{ color: '#444', fontSize: '16px', fontFamily: font, fontWeight: 500 }}>{stats.label}</span>
                <span style={{ color: '#000', fontSize: '16px', fontFamily: font, lineHeight: '1.5' }}>
                  {stats.summary.split('\n').map((line, i, arr) => <span key={i}>{line}{i < arr.length - 1 && <br />}</span>)}
                </span>
              </motion.div>
            </div>
          </motion.div>

          <div style={{ height: '1px', backgroundColor: 'rgba(208,213,221,0.5)', width: '100%', marginBottom: '24px' }} />

          {/* Table */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div style={{ backgroundColor: 'rgba(248,248,249,1)', borderRadius: '7px', padding: '14px 16px', display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '16px', minWidth: '800px' }}>
              {[
                { label: 'Client / Customer', flex: '2', minWidth: '200px' },
                { label: 'Date Paid', flex: '1', minWidth: '120px' },
                { label: 'Description', flex: '1', minWidth: '150px' },
                { label: 'Amount', flex: '0 0 200px', minWidth: undefined },
              ].map(col => (
                <span key={col.label} style={{ flex: col.flex, minWidth: col.minWidth, fontSize: '14px', fontFamily: font, color: 'rgba(119,119,119,1)', textAlign: 'left' }}>
                  {col.label}
                </span>
              ))}
              <span style={{ width: '56px', flexShrink: 0 }} />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
              {TRANSACTIONS.map((tx, index) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  index={index}
                  logoPopoverOpen={openLogoPopover === tx.id}
                  onLogoClick={() => setOpenLogoPopover(openLogoPopover === tx.id ? null : tx.id)}
                  onLogoClose={() => setOpenLogoPopover(null)}
                  onNameClick={() => { setOpenLogoPopover(null); setNameModalTx(tx); }}
                  onDateClick={() => { setOpenLogoPopover(null); setDateModalDate(tx.date); }}
                  onEditClick={() => { setOpenLogoPopover(null); setEditModalTx(tx); }}
                  onDetailsClick={() => { setOpenLogoPopover(null); setDetailsModalTx(tx); }}
                />
              ))}
            </div>
          </div>
          </motion.div>}
          </AnimatePresence>
          )}

        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {detailsModalTx && <DetailsModal key="details" tx={detailsModalTx} onClose={() => setDetailsModalTx(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {nameModalTx && <NameDetailModal key="name" tx={nameModalTx} onClose={() => setNameModalTx(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {dateModalDate && <DateModal key="date" date={dateModalDate} onClose={() => setDateModalDate(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {editModalTx && <EditModal key="edit" tx={editModalTx} onClose={() => setEditModalTx(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showUpgrade && <UpgradeModal key="upgrade" onClose={() => setShowUpgrade(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showProfileSheet && <ProfileSheet key="profile-sheet" onClose={() => setShowProfileSheet(false)} user={user} onSaveUser={setUser} />}
      </AnimatePresence>
    </div>
  );
};
