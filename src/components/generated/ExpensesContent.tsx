import React, { useState, useRef, useEffect, useLayoutEffect, useMemo, useId } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { DropdownTriggerButton, DropdownMenu as SharedDropdownMenu, SlidingTextSwapButton, CloseButton } from './interactionPrimitives';

// ─── Constants ────────────────────────────────────────────────────────────────

const font = '"Approach TRIAL", sans-serif';
const ease = [0.16, 1, 0.3, 1] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type ExpenseStatus = 'paid' | 'overdue' | 'upcoming';
const EXPENSE_CATEGORIES = ['Software & Tools', 'Payroll', 'Marketing', 'Infrastructure', 'Office & Supplies', 'Travel', 'Legal & Compliance', 'Utilities'] as const;
type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
type ExpensePeriod = 'Yearly' | 'Quarterly' | 'Monthly';

interface ExpenseEntry {
  id: number;
  vendor: string;
  logo: string;
  logoBg: string;
  date: string;
  category: ExpenseCategory;
  amount: string;
  status: ExpenseStatus;
  method: string;
  recurring?: string;
  notes?: string;
  contact?: string;
}

type ExpenseFormData = {
  vendor: string; amount: string; date: string;
  category: ExpenseCategory; status: ExpenseStatus;
  method: string; recurring: string; notes: string; contact: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const INITIAL_ENTRIES: ExpenseEntry[] = [
  { id: 1,  vendor: 'Augment LLC',        logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/f4f353a7-30fa-4422-a2a3-a40095dbb40c.svg',  logoBg: 'rgba(255,255,255,1)', date: '5 Dec, 2023',  category: 'Utilities',          amount: '-$24.00',     status: 'paid',     method: 'Bank Transfer', recurring: 'Monthly',   contact: 'Brice Howard',      notes: 'Office internet — fiber broadband plan.' },
  { id: 2,  vendor: 'FierceExchange Inc', logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/622f2a7a-9904-4980-93ec-eb69d646960d.svg', logoBg: 'rgba(255,75,75,1)',   date: '4 Dec, 2023',  category: 'Software & Tools',   amount: '-$340.00',    status: 'paid',     method: 'Credit Card',                           contact: 'Holden Steinberg',  notes: 'Annual trading platform license renewal.' },
  { id: 3,  vendor: 'Webflow',            logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/9ee4912a-e537-4010-8749-188c651eba05.svg',  logoBg: 'rgba(67,83,255,1)',   date: '3 Dec, 2023',  category: 'Software & Tools',   amount: '-$45.00',     status: 'paid',     method: 'Credit Card', recurring: 'Monthly',   contact: 'Gaant Giant',       notes: 'Webflow business plan subscription.' },
  { id: 4,  vendor: 'Augment LLC',        logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/54fe0b06-3c3d-4453-aa7e-6d0ce865d250.svg',  logoBg: 'rgba(255,255,255,1)', date: '2 Dec, 2023',  category: 'Utilities',          amount: '-$15.00',     status: 'paid',     method: 'Bank Transfer', recurring: 'Monthly',   contact: 'George Clooney',    notes: 'Office electricity — winter rate increase.' },
  { id: 5,  vendor: 'Cuboid Inc',         logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/98e93cea-45e7-4de5-a10c-41ce726abdc2.svg',  logoBg: 'rgba(255,255,255,1)', date: '1 Dec, 2023',  category: 'Marketing',          amount: '-$890.00',    status: 'paid',     method: 'Wire Transfer',                         contact: 'Harry Mants',       notes: 'Q4 campaign creative — social + display assets.' },
  { id: 6,  vendor: 'FierceExchange Inc', logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/8324691d-bcea-4405-a771-82e907870bf0.svg',  logoBg: 'rgba(255,75,75,1)',   date: '28 Nov, 2023', category: 'Legal & Compliance', amount: '-$1,200.00',  status: 'overdue',  method: 'Bank Transfer',                         contact: 'Denker Matthews',   notes: 'Annual legal retainer — overdue by 12 days. Requires immediate action.' },
  { id: 7,  vendor: 'Augment LLC',        logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/f4f353a7-30fa-4422-a2a3-a40095dbb40c.svg',  logoBg: 'rgba(255,255,255,1)', date: '1 Dec, 2023',  category: 'Office & Supplies',  amount: '-$2,400.00',  status: 'paid',     method: 'Bank Transfer', recurring: 'Monthly',   contact: 'Nina Carlson',      notes: 'Monthly office rent — Q4 2023.' },
  { id: 8,  vendor: 'Webflow',            logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/9ee4912a-e537-4010-8749-188c651eba05.svg',  logoBg: 'rgba(67,83,255,1)',   date: '25 Nov, 2023', category: 'Infrastructure',     amount: '-$160.00',    status: 'upcoming', method: 'Credit Card',                           contact: 'Menda Sage',        notes: 'Annual domain renewal + CDN bandwidth costs.' },
  { id: 9,  vendor: 'Augment LLC',        logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/54fe0b06-3c3d-4453-aa7e-6d0ce865d250.svg',  logoBg: 'rgba(255,255,255,1)', date: '15 Nov, 2023', category: 'Payroll',            amount: '-$5,200.00',  status: 'paid',     method: 'Bank Transfer', recurring: 'Monthly',   contact: 'Brice Howard',      notes: 'November payroll disbursement — all contractors.' },
  { id: 10, vendor: 'FierceExchange Inc', logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/622f2a7a-9904-4980-93ec-eb69d646960d.svg', logoBg: 'rgba(255,75,75,1)',   date: '10 Nov, 2023', category: 'Software & Tools',   amount: '-$180.00',    status: 'paid',     method: 'Credit Card',   recurring: 'Monthly',   contact: 'Holden Steinberg',  notes: 'Platform API access — enterprise tier subscription.' },
  { id: 11, vendor: 'Cuboid Inc',         logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/98e93cea-45e7-4de5-a10c-41ce726abdc2.svg',  logoBg: 'rgba(255,255,255,1)', date: '20 Nov, 2023', category: 'Travel',             amount: '-$160.00',    status: 'upcoming', method: 'Credit Card',                           contact: 'Larry Page',        notes: 'Conference travel & accommodation — Q4 tech summit.' },
];

// Budget per category ($)
const EXPENSE_BUDGETS: Record<ExpenseCategory, number> = {
  'Software & Tools':   800,
  'Payroll':            6000,
  'Marketing':          1500,
  'Infrastructure':     500,
  'Office & Supplies':  3000,
  'Travel':             500,
  'Legal & Compliance': 1200,
  'Utilities':          200,
};

const TOTAL_BUDGET = Object.values(EXPENSE_BUDGETS).reduce((s, v) => s + v, 0); // 13700

const KPI_CARDS = [
  { title: 'Total Spent',    amount: '$10,614.00', subtext: '+$804 vs November',          percentage: '8.2%',  isPositive: false, icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/1e97b8bd-d214-47a4-847e-275e7626a8df.svg', sparkValues: [8200,8900,9400,9800,10100,10300,10614], uid: 'spent'   },
  { title: 'Avg Monthly',    amount: '$3,538.00',  subtext: '+5.1% vs last quarter',      percentage: '5.1%',  isPositive: false, icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/0e540694-ffe6-472d-839e-5cc1179fe992.svg', sparkValues: [2800,3100,3200,3300,3400,3500,3538],    uid: 'avg'    },
  { title: 'Overdue',        amount: '$1,200.00',  subtext: '1 payment past due date',    percentage: '11.3%', isPositive: false, icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/014a0924-f3b1-4d18-8028-7cf395eea7e4.svg', sparkValues: [0,800,0,1500,0,2100,1200],              uid: 'overdue' },
  { title: 'Budget Left',    amount: '$3,086.00',  subtext: '22.5% of $13.7k remaining',  percentage: '22.5%', isPositive: true,  icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/cb4ca95a-8ffa-47f1-b6df-79cb827735bd.svg', sparkValues: [5500,4800,4300,4100,3800,3400,3086],    uid: 'left'   },
];

const HERO_SPARK_VALUES = [7800, 8200, 8600, 9100, 9400, 9800, 10200, 10614];

const EXPENSE_CHART_DATA: Record<ExpensePeriod, { label: string; spend: number }[]> = {
  Yearly:    [{ label:'Jan',spend:7200},{ label:'Feb',spend:6800},{ label:'Mar',spend:8100},{ label:'Apr',spend:7600},{ label:'May',spend:8900},{ label:'Jun',spend:8200},{ label:'Jul',spend:9100},{ label:'Aug',spend:8600},{ label:'Sep',spend:9800},{ label:'Oct',spend:9200},{ label:'Nov',spend:9810},{ label:'Dec',spend:10614}],
  Quarterly: [{ label:'Q1',spend:22100},{ label:'Q2',spend:24700},{ label:'Q3',spend:27500},{ label:'Q4',spend:29624}],
  Monthly:   [{ label:'Wk 1',spend:6254},{ label:'Wk 2',spend:2400},{ label:'Wk 3',spend:1960},{ label:'Wk 4',spend:0}],
};

const SPEND_MONTHS_LIST = ['January', 'February', 'March', 'April', 'May', 'June'];
const SPEND_CAT_BASE = [
  { label: 'Payroll',          color: '#4F46E5' },
  { label: 'Office & Supp.',   color: '#0E7490' },
  { label: 'Software',         color: '#377CF6' },
  { label: 'Marketing',        color: '#C07800' },
  { label: 'Other',            color: '#A8B0C5' },
];
const SPEND_CAT_VALS: Record<string, number[]> = {
  January:  [4800, 2400, 480, 720,  340],
  February: [5200, 2400, 565, 890,  160],
  March:    [5200, 2400, 420, 650,  240],
  April:    [5000, 2400, 540, 980,  180],
  May:      [5200, 2400, 480, 1100, 320],
  June:     [5200, 2400, 610, 750,  260],
};

const STATUS_CONFIG: Record<ExpenseStatus, { label: string; color: string; bg: string; border: string; accentBg: string; accentBorder: string }> = {
  paid:     { label: 'Paid',     color: '#444',    bg: 'rgba(0,0,0,0.04)',          border: 'rgba(100,100,100,0.35)', accentBg: 'rgba(0,0,0,0.02)',        accentBorder: 'rgba(0,0,0,0.15)' },
  overdue:  { label: 'Overdue',  color: '#E42C2C', bg: 'rgba(228,44,44,0.07)',      border: 'rgba(228,44,44,0.9)',    accentBg: 'rgba(228,44,44,0.04)',    accentBorder: '#E42C2C' },
  upcoming: { label: 'Upcoming', color: '#377CF6', bg: 'rgba(55,124,246,0.07)',     border: 'rgba(55,124,246,0.8)',   accentBg: 'rgba(55,124,246,0.03)',   accentBorder: '#377CF6' },
};

const CATEGORY_COLORS: Record<ExpenseCategory, { bg: string; text: string }> = {
  'Software & Tools':   { bg: 'rgba(55,124,246,0.10)', text: '#1D5EBF' },
  'Payroll':            { bg: 'rgba(79,70,229,0.10)',  text: '#4338CA' },
  'Marketing':          { bg: 'rgba(192,120,0,0.10)',  text: '#9A6200' },
  'Infrastructure':     { bg: 'rgba(139,92,246,0.10)', text: '#6D28D9' },
  'Office & Supplies':  { bg: 'rgba(14,116,144,0.10)', text: '#0E7490' },
  'Travel':             { bg: 'rgba(234,88,12,0.10)',  text: '#C2410C' },
  'Legal & Compliance': { bg: 'rgba(180,50,50,0.10)',  text: '#A03030' },
  'Utilities':          { bg: 'rgba(15,118,110,0.10)', text: '#0F766E' },
};

const PAYMENT_METHODS = ['Bank Transfer', 'Credit Card', 'Wire Transfer', 'ACH', 'Cash', 'Check'] as const;
const EMPTY_FORM: ExpenseFormData = { vendor: '', amount: '', date: '', category: 'Software & Tools', status: 'paid', method: 'Bank Transfer', recurring: '', notes: '', contact: '' };

// ─── Budget helpers ────────────────────────────────────────────────────────────

function getBudgetColor(pct: number): string {
  if (pct >= 1.0) return '#E42C2C';
  if (pct >= 0.85) return '#C07800';
  if (pct >= 0.65) return '#377CF6';
  return '#D0D5DD';
}
function getBudgetFillColor(pct: number): string {
  if (pct >= 1.0) return '#E42C2C';
  if (pct >= 0.85) return '#C07800';
  if (pct >= 0.65) return '#377CF6';
  return '#B8C4D4';
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function useClickOutside(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) cb(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [ref, cb]);
}

function buildSparkPath(values: number[], w: number, h: number): string {
  if (values.length < 2) return '';
  const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
  const pts = values.map((v, i) => ({
    x: parseFloat(((i / (values.length - 1)) * w).toFixed(1)),
    y: parseFloat((h - ((v - min) / range) * (h * 0.78) - h * 0.11).toFixed(1)),
  }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = parseFloat(((pts[i - 1].x + pts[i].x) / 2).toFixed(1));
    d += ` C ${cpx} ${pts[i - 1].y}, ${cpx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  return d;
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

const Sparkline: React.FC<{ values: number[]; color: string; gradId: string; w?: number; h?: number; strokeWidth?: number; delay?: number; fillOpacity?: number }> = ({ values, color, gradId, w = 80, h = 28, strokeWidth = 1.5, delay = 0.4, fillOpacity = 0.16 }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const d = buildSparkPath(values, w, h);
  const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
  const lastY = parseFloat((h - ((values[values.length - 1] - min) / range) * (h * 0.78) - h * 0.11).toFixed(1));
  const areaD = `${d} L ${w} ${h} L 0 ${h} Z`;

  useEffect(() => {
    const el = pathRef.current; if (!el) return;
    const l = el.getTotalLength();
    el.style.strokeDasharray = String(l); el.style.strokeDashoffset = String(l);
    const ctrl = animate(l, 0, { duration: 1.3, ease: [0.16, 1, 0.3, 1], delay, onUpdate: v => { if (pathRef.current) pathRef.current.style.strokeDashoffset = String(v); } });
    return () => ctrl.stop();
  }, [d, delay]);

  return (
    <svg width={w} height={h} style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path ref={pathRef} d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <motion.circle cx={w} cy={lastY} r={3} fill={color} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25, delay: delay + 1.1 }} />
    </svg>
  );
};

// ─── CountUp ──────────────────────────────────────────────────────────────────

const CountUp: React.FC<{ rawValue: string; style?: React.CSSProperties }> = ({ rawValue, style }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const isNeg = rawValue.startsWith('-');
    const prefix = isNeg ? '-$' : '$';
    const num = parseFloat(rawValue.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return;
    const ctrl = animate(0, num, { duration: 1, ease: [0.16, 1, 0.3, 1], onUpdate: v => { if (nodeRef.current) nodeRef.current.textContent = `${prefix}${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; } });
    return () => ctrl.stop();
  }, [rawValue]);
  return <span ref={nodeRef} style={style}>{rawValue}</span>;
};

// ─── Overlay ──────────────────────────────────────────────────────────────────

const Overlay: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose}
    style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }} transition={{ duration: 0.22, ease }}
      onClick={e => e.stopPropagation()}
      style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '32px', maxWidth: '500px', width: '90%', boxShadow: '0px 24px 48px rgba(0,0,0,0.12)', position: 'relative' }}>
      <CloseButton onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px' }} />
      {children}
    </motion.div>
  </motion.div>
);
};

// ─── Checkbox ─────────────────────────────────────────────────────────────────

const Checkbox: React.FC<{ checked: boolean; onChange: (v: boolean) => void; stopClick?: boolean }> = ({ checked, onChange, stopClick = false }) => (
  <motion.div animate={{ backgroundColor: checked ? '#377CF6' : '#FFF', borderColor: checked ? '#377CF6' : 'rgba(208,213,221,0.8)' }} transition={{ duration: 0.12 }}
    onClick={e => { if (stopClick) e.stopPropagation(); onChange(!checked); }}
    style={{ width: '14px', height: '14px', border: '1.5px solid rgba(208,213,221,0.8)', borderRadius: '3px', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <AnimatePresence>
      {checked && (
        <motion.svg initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.12 }} width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      )}
    </AnimatePresence>
  </motion.div>
);

// ─── Dropdown Menu ────────────────────────────────────────────────────────────

type DropdownItems = { label: string; icon?: React.ReactNode; danger?: boolean; onClick: () => void }[];
const DropdownMenu: React.FC<{ items: DropdownItems; style?: React.CSSProperties }> = ({ items, style }) => (
  <SharedDropdownMenu items={items} style={style} />
);

// ─── Budget Arc ───────────────────────────────────────────────────────────────

const BudgetArc: React.FC<{ spent: number; budget: number }> = ({ spent, budget }) => {
  const pct = Math.min(spent / budget, 1.05);
  const r = 32, cx = 40, cy = 40, circ = 2 * Math.PI * r;
  const arcColor = getBudgetFillColor(pct);
  const arcRef = useRef<SVGCircleElement>(null);
  const overBudget = pct >= 1;

  useEffect(() => {
    const el = arcRef.current; if (!el) return;
    el.style.strokeDasharray = String(circ);
    el.style.strokeDashoffset = String(circ);
    const ctrl = animate(circ, circ * (1 - Math.min(pct, 1)), { duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.5, onUpdate: v => { if (arcRef.current) arcRef.current.style.strokeDashoffset = String(v); } });
    return () => ctrl.stop();
  }, [pct, circ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <svg width={80} height={80}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(208,213,221,0.35)" strokeWidth="5" />
        <circle ref={arcRef} cx={cx} cy={cy} r={r} fill="none" stroke={arcColor} strokeWidth="5" strokeLinecap="round"
          style={{ transformOrigin: `${cx}px ${cy}px`, transform: 'rotate(-90deg)' }} />
        <text x={cx} y={cy - 3} textAnchor="middle" style={{ fontFamily: font, fontSize: overBudget ? '10px' : '13px', fontWeight: 600, fill: arcColor }}>
          {overBudget ? 'OVER' : `${Math.round(pct * 100)}%`}
        </text>
        <text x={cx} y={cy + 11} textAnchor="middle" style={{ fontFamily: font, fontSize: '9px', fill: '#888' }}>
          {overBudget ? 'budget' : 'of budget'}
        </text>
      </svg>
      <span style={{ fontSize: '11px', fontFamily: font, color: '#888' }}>Budget: ${(budget / 1000).toFixed(1)}k</span>
    </div>
  );
};

// ─── Hero Banner ──────────────────────────────────────────────────────────────

const HeroBanner: React.FC<{ entries: ExpenseEntry[] }> = ({ entries }) => {
  const total = entries.reduce((s, e) => s + parseFloat(e.amount.replace(/[^0-9.]/g, '')), 0);
  const paid = entries.filter(e => e.status === 'paid').reduce((s, e) => s + parseFloat(e.amount.replace(/[^0-9.]/g, '')), 0);
  const overdue = entries.filter(e => e.status === 'overdue').reduce((s, e) => s + parseFloat(e.amount.replace(/[^0-9.]/g, '')), 0);
  const upcoming = entries.filter(e => e.status === 'upcoming').reduce((s, e) => s + parseFloat(e.amount.replace(/[^0-9.]/g, '')), 0);
  const fmt = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  // burn rate: total / 31 days
  const burnRate = (total / 31).toFixed(0);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05, ease }}
      style={{ border: '1px solid rgba(208,213,221,0.5)', borderRadius: '8px', padding: '28px 32px', marginBottom: '20px', backgroundColor: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 75% 50%, rgba(228,44,44,0.025) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
        {/* Left — big number */}
        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontFamily: font, color: '#888' }}>Total Spent · December 2023</span>
            <div style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(228,44,44,0.08)' }}>
              <span style={{ fontSize: '11px', fontFamily: font, color: '#E42C2C', fontWeight: 500 }}>▲ 8.2%</span>
            </div>
          </div>
          <CountUp rawValue={`-$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            style={{ fontSize: '48px', fontFamily: font, letterSpacing: '-1.5px', color: '#E42C2C', lineHeight: 1.05, display: 'block' }} />
          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '13px', fontFamily: font, color: '#888' }}>
              <span style={{ color: '#E42C2C', fontWeight: 500 }}>↑ $804</span>&nbsp;more than November
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(192,120,0,0.07)', border: '1px solid rgba(192,120,0,0.25)' }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="#C07800" strokeWidth="1.2"/><path d="M5 3v2.5l1.5 1" stroke="#C07800" strokeWidth="1.2" strokeLinecap="round"/></svg>
              <span style={{ fontSize: '11px', fontFamily: font, color: '#C07800', fontWeight: 500 }}>${burnRate}/day burn rate</span>
            </div>
          </div>
        </div>

        {/* Center — sparkline */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', paddingTop: '6px' }}>
          <Sparkline values={HERO_SPARK_VALUES} color="#E42C2C" gradId="hero-exp-spark" w={180} h={56} strokeWidth={2} delay={0.3} fillOpacity={0} />
          <span style={{ fontSize: '11px', fontFamily: font, color: '#bbb', letterSpacing: '0.02em' }}>8-MONTH SPEND TREND</span>
        </div>

        {/* Right — budget arc */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingTop: '2px' }}>
          <BudgetArc spent={total} budget={TOTAL_BUDGET} />
        </div>
      </div>

      {/* Bottom strip */}
      <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(208,213,221,0.35)', display: 'flex', gap: '0', flexWrap: 'wrap' }}>
        {[
          { label: 'Paid',     value: fmt(paid),     color: '#444',    icon: '✓' },
          { label: 'Overdue',  value: fmt(overdue),  color: '#E42C2C', icon: '!' },
          { label: 'Upcoming', value: fmt(upcoming),  color: '#377CF6', icon: '◷' },
        ].map(({ label, value, color, icon }, i) => (
          <div key={label} style={{ flex: 1, minWidth: '120px', paddingRight: '24px', marginRight: '24px', borderRight: i < 2 ? '1px solid rgba(208,213,221,0.35)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', color, fontFamily: font }}>{icon}</span>
              <span style={{ fontSize: '12px', fontFamily: font, color: '#888' }}>{label}</span>
            </div>
            <span style={{ fontSize: '20px', fontFamily: font, color: '#000', letterSpacing: '-0.5px' }}>{value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ─── KPI Stat Card ────────────────────────────────────────────────────────────

const ExpenseStatCard: React.FC<typeof KPI_CARDS[0] & { index: number; onClick: () => void }> = ({ title, amount, subtext, percentage, isPositive, icon, sparkValues, uid, index, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<SVGRectElement>(null);
  const orbitLayoutFrozenRef = useRef(false);
  const [dims, setDims] = useState({ ow: 0, oh: 0, bt: 0, bl: 0, bw: 0 });
  const [orbitPathLen, setOrbitPathLen] = useState(0);
  const color = isPositive ? '#159600' : '#E42C2C';
  const accentStroke = isPositive ? 'rgba(21,150,0,0.75)' : 'rgba(228,44,44,0.75)';

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
  const inset = bw / 2;
  const rw = Math.max(0, ow - bw);
  const rh = Math.max(0, oh - bw);
  const rxUse = rw > 0 && rh > 0 ? Math.min(Math.max(0, r - inset), rw / 2, rh / 2) : 0;

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <img src={icon} alt={title} style={{ width: '10px', height: '10px' }} />
        <span style={{ color: 'rgba(119,119,119,1)', fontSize: '14px', fontWeight: 500, fontFamily: font }}>{title}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <CountUp key={amount} rawValue={amount} style={{ color: '#000', fontSize: '24px', fontFamily: font, letterSpacing: '-0.5px' }} />
        <div style={{ display: 'inline-flex', padding: '6px 10px', gap: '5px', backgroundColor: isPositive ? 'rgba(21,150,0,0.1)' : 'rgba(228,44,44,0.1)', borderRadius: '8px', alignItems: 'center' }}>
          <img src={isPositive ? 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/292003e2-c325-4519-b04f-e6840a857962.svg' : 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/d7f17ec3-c44a-4900-81cf-47524eaeccd4.svg'} alt="" style={{ width: '7px', height: '9px' }} />
          <span style={{ color, fontSize: '13px', fontFamily: font, fontWeight: 500 }}>{percentage}</span>
        </div>
      </div>
      <div style={{ marginBottom: '8px' }}>
        <Sparkline values={sparkValues} color={color} gradId={`kpi-exp-${uid}`} w={80} h={22} strokeWidth={1.5} delay={0.3 + index * 0.07} fillOpacity={0} />
      </div>
      <span style={{ color, fontSize: '11px', fontFamily: font }}>{subtext}</span>

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

// ─── Top Vendors Card ─────────────────────────────────────────────────────────

const TopVendorsCard: React.FC<{ entries: ExpenseEntry[] }> = ({ entries }) => {
  const vendors = useMemo(() => {
    const map = new Map<string, { logo: string; logoBg: string; total: number }>();
    entries.forEach(e => {
      const num = parseFloat(e.amount.replace(/[^0-9.]/g, ''));
      const ex = map.get(e.vendor);
      if (ex) ex.total += num; else map.set(e.vendor, { logo: e.logo, logoBg: e.logoBg, total: num });
    });
    return [...map.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.total - a.total);
  }, [entries]);

  const topVal = vendors[0]?.total ?? 1;
  const fmt = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const barColors = ['#377CF6', '#4F46E5', '#C07800', '#0E7490'];

  return (
    <div style={{ flex: '0 0 240px', minWidth: '220px', backgroundColor: '#FFF', border: '1px solid rgba(208,213,221,0.5)', borderRadius: '8px', padding: '25px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 12V5l5-3 5 3v7" stroke="#888" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="5" y="8" width="4" height="4" rx="0.5" stroke="#888" strokeWidth="1.3"/>
        </svg>
        <span style={{ fontSize: '16px', fontFamily: font, fontWeight: 500 }}>Top Vendors</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        {vendors.slice(0, 4).map((v, i) => {
          const barPct = (v.total / topVal) * 100;
          return (
            <motion.div key={v.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, delay: i * 0.06, ease }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: v.logoBg, border: v.logoBg === 'rgba(255,255,255,1)' ? '1px solid rgba(0,0,0,0.8)' : 'none', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <img src={v.logo} alt="" style={{ width: '10px' }} />
                </div>
                <span style={{ fontSize: '12px', fontFamily: font, color: '#000', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.name}</span>
                <span style={{ fontSize: '12px', fontFamily: font, color: '#000', fontWeight: 500, flexShrink: 0 }}>{fmt(v.total)}</span>
              </div>
              <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(208,213,221,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${barPct}%` }} transition={{ duration: 0.6, delay: 0.2 + i * 0.07, ease }}
                  style={{ height: '100%', backgroundColor: barColors[i] ?? barColors[3], borderRadius: '4px' }} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Spend Trend Chart ────────────────────────────────────────────────────────

const SpendTrendChart: React.FC<{ data: { label: string; spend: number }[]; animKey: string }> = ({ data, animKey }) => {
  const chartH = 200;
  const pathRef = useRef<SVGPathElement>(null);
  const yMax = Math.max(...data.map(d => d.spend));
  const yMaxR = Math.ceil(yMax / 1000) * 1000 || 5000;
  const yLabels = [yMaxR, yMaxR * 0.8, yMaxR * 0.6, yMaxR * 0.4, yMaxR * 0.2, 0];
  const fmt = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : String(v);
  const lineD = buildSparkPath(data.map(d => d.spend), 400, chartH);

  useEffect(() => {
    const el = pathRef.current; if (!el) return;
    const l = el.getTotalLength();
    el.style.strokeDasharray = String(l); el.style.strokeDashoffset = String(l);
    const ctrl = animate(l, 0, { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.35, onUpdate: v => { if (pathRef.current) pathRef.current.style.strokeDashoffset = String(v); } });
    return () => ctrl.stop();
  }, [lineD]);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '36px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: `${chartH}px` }}>
          {yLabels.map(v => <span key={v} style={{ fontSize: '11px', color: '#888', fontFamily: font, textAlign: 'right', display: 'block', lineHeight: 1 }}>{fmt(v)}</span>)}
        </div>
        <div style={{ flex: 1, marginLeft: '16px', height: `${chartH}px`, position: 'relative' }}>
          {yLabels.map((_, i) => <div key={i} style={{ position: 'absolute', top: `${i / (yLabels.length - 1) * 100}%`, left: 0, right: 0, height: '1px', backgroundColor: '#F2F4F7' }} />)}
          {/* Bars */}
          <div key={animKey} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            {data.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-end', flex: 1, justifyContent: 'center' }}>
                <motion.div initial={{ height: 0 }} animate={{ height: `${d.spend / yMaxR * chartH}px` }} transition={{ duration: 0.5, delay: 0.05 + i * 0.035, ease }}
                  style={{ width: '12px', backgroundColor: '#95E0FB', borderRadius: '3px 3px 0 0' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#7AD4F5')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#95E0FB')} />
              </div>
            ))}
          </div>
          {/* Trend line overlay */}
          <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }} width="100%" height="100%" viewBox={`0 0 400 ${chartH}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="exp-line-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#95E0FB" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#95E0FB" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${lineD} L 400 ${chartH} L 0 ${chartH} Z`} fill="url(#exp-line-grad)" />
            <path ref={pathRef} d={lineD} fill="none" stroke="#95E0FB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div style={{ display: 'flex', marginTop: '10px', paddingLeft: '52px' }}>
        {data.map(d => <div key={d.label} style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: '#888', fontFamily: font }}>{d.label}</div>)}
      </div>
    </div>
  );
};

// ─── Spend By Category Panel ──────────────────────────────────────────────────

function buildCatCategories(month: string) {
  const vals = SPEND_CAT_VALS[month] ?? SPEND_CAT_VALS.January;
  const total = vals.reduce((s, v) => s + v, 0);
  const trends   = ['+2.0%', '+0.0%', '+8.4%', '+12.0%', '-4.2%'];
  const trendClr = ['#C07800', 'rgba(0,0,0,0.35)', '#E42C2C', '#E42C2C', '#159600'];
  return SPEND_CAT_BASE.map((b, i) => ({ ...b, val: `-$${vals[i]}`, pct: `${((vals[i] / total) * 100).toFixed(1)}%`, trend: trends[i], trendColor: trendClr[i] }));
}
function buildCatConic(cats: ReturnType<typeof buildCatCategories>) {
  const total = cats.reduce((s, c) => s + Math.abs(parseFloat(c.pct)), 0);
  let cur = 0;
  return `conic-gradient(${cats.map(c => { const sh = Math.abs(parseFloat(c.pct)) / total * 360; const st = `${c.color} ${cur.toFixed(1)}deg ${(cur + sh).toFixed(1)}deg`; cur += sh; return st; }).join(', ')})`;
}

const CatPanelViewAllToggle: React.FC<{ showAll: boolean; onToggle: () => void }> = ({ showAll, onToggle }) => {
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
        fontSize: '13px',
        fontFamily: font,
        alignSelf: 'flex-end',
        padding: '8px 0 0 0',
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
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '1px', backgroundColor: '#888', transformOrigin: 'left' }}
        />
      </span>
      <motion.span animate={{ rotate: showAll ? 270 : 90 }} transition={{ duration: 0.2 }} style={{ fontSize: '12px', display: 'inline-block', color: '#888' }}>
        ›
      </motion.span>
    </button>
  );
};

const SpendByCategoryPanel: React.FC<{ month: string; onMonthChange: (m: string) => void }> = ({ month, onMonthChange }) => {
  const [showAll, setShowAll] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setShowMenu(false));
  const cats = buildCatCategories(month);
  const visible = showAll ? cats : cats.slice(0, 4);

  return (
    <div style={{ flex: '0 0 280px', minWidth: '260px', backgroundColor: '#FFF', border: '1px solid rgba(208,213,221,0.5)', borderRadius: '8px', padding: '25px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '16px', fontFamily: font, fontWeight: 500 }}>By Category</span>
        <div ref={menuRef} style={{ position: 'relative' }}>
          <DropdownTriggerButton onClick={() => setShowMenu(v => !v)} style={{ padding: '6px 14px', fontSize: '13px', boxShadow: '0px 1px 2px rgba(16,24,40,0.05)' }}>
            {month.slice(0, 3)}
            <motion.img animate={{ rotate: showMenu ? 180 : 0 }} transition={{ duration: 0.2 }}
              src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/75edc13f-6ea6-4659-b53b-40b5db2828b7.svg" alt="" style={{ width: '18px' }} />
          </DropdownTriggerButton>
          <AnimatePresence>
            {showMenu && <DropdownMenu style={{ top: '36px', right: 0, minWidth: '120px' }} items={SPEND_MONTHS_LIST.map(m => ({ label: m, onClick: () => { onMonthChange(m); setShowMenu(false); } }))} />}
          </AnimatePresence>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
        <motion.div key={month} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.7, ease }}
          style={{ width: '96px', height: '96px', borderRadius: '50%', background: buildCatConic(cats), position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '48px', height: '48px', backgroundColor: '#FFF', borderRadius: '50%' }} />
        </motion.div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        <AnimatePresence mode="popLayout">
          {visible.map((item, idx) => (
            <motion.div key={item.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2, delay: idx * 0.03 }}
              style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '80px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }} />
                <span style={{ fontFamily: font, color: '#000', whiteSpace: 'nowrap' }}>{item.label}</span>
              </div>
              <span style={{ fontFamily: font, color: '#000', minWidth: '38px', textAlign: 'right' }}>{item.val}</span>
              <span style={{ color: '#888', fontFamily: font, minWidth: '34px', textAlign: 'right' }}>({item.pct})</span>
              <span style={{ color: item.trendColor, fontFamily: font, minWidth: '38px', textAlign: 'right' }}>{item.trend}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <CatPanelViewAllToggle showAll={showAll} onToggle={() => setShowAll(v => !v)} />
    </div>
  );
};

// ─── Budget Health Panel ──────────────────────────────────────────────────────

const BudgetHealthPanel: React.FC<{ entries: ExpenseEntry[] }> = ({ entries }) => {
  const spendByCategory = useMemo(() => {
    const map = new Map<ExpenseCategory, number>();
    entries.forEach(e => {
      const num = parseFloat(e.amount.replace(/[^0-9.]/g, ''));
      map.set(e.category, (map.get(e.category) ?? 0) + num);
    });
    return map;
  }, [entries]);

  const rows = useMemo(() =>
    EXPENSE_CATEGORIES.map(cat => {
      const spent = spendByCategory.get(cat) ?? 0;
      const budget = EXPENSE_BUDGETS[cat];
      const pct = spent / budget;
      return { cat, spent, budget, pct };
    }).sort((a, b) => b.pct - a.pct),
    [spendByCategory]
  );

  const totalSpent = [...spendByCategory.values()].reduce((s, v) => s + v, 0);
  const overallPct = totalSpent / TOTAL_BUDGET;

  const fmtMoney = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15, ease }}
      style={{ border: '1px solid rgba(208,213,221,0.5)', borderRadius: '8px', padding: '25px', backgroundColor: '#fff', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '17px', fontFamily: font, fontWeight: 500 }}>Budget Health</span>
          <span style={{ fontSize: '13px', fontFamily: font, color: '#888', marginLeft: '10px' }}>December 2023</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {[{ color: '#B8C4D4', label: '< 65%' }, { color: '#377CF6', label: '65–85%' }, { color: '#C07800', label: '85–100%' }, { color: '#E42C2C', label: 'Over' }].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: color }} />
                <span style={{ fontSize: '11px', fontFamily: font, color: '#888' }}>{label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', backgroundColor: getBudgetColor(overallPct) === '#E42C2C' ? 'rgba(228,44,44,0.07)' : getBudgetColor(overallPct) === '#C07800' ? 'rgba(192,120,0,0.07)' : 'rgba(55,124,246,0.07)', border: `1px solid ${getBudgetColor(overallPct)}30` }}>
            <span style={{ fontSize: '12px', fontFamily: font, color: getBudgetColor(overallPct), fontWeight: 500 }}>
              {Math.round(overallPct * 100)}% overall · {fmtMoney(TOTAL_BUDGET - totalSpent)} remaining
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
        {rows.map(({ cat, spent, budget, pct }, i) => {
          const fillColor = getBudgetFillColor(pct);
          const cc = CATEGORY_COLORS[cat];
          const isOver = pct >= 1;
          const isDanger = pct >= 0.85;

          return (
            <motion.div key={cat} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: i * 0.04, ease }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '3px', backgroundColor: cc.bg }}>
                    <span style={{ fontSize: '11px', fontFamily: font, color: cc.text }}>{cat}</span>
                  </span>
                  {isOver && (
                    <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
                      style={{ fontSize: '11px', fontFamily: font, color: '#E42C2C', fontWeight: 500 }}>⚠ Over budget</motion.span>
                  )}
                  {!isOver && isDanger && (
                    <span style={{ fontSize: '11px', fontFamily: font, color: '#C07800' }}>Near limit</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontFamily: font, color: '#888' }}>
                    {fmtMoney(spent)} / {fmtMoney(budget)}
                  </span>
                  <span style={{ fontSize: '12px', fontFamily: font, color: fillColor, fontWeight: 500, minWidth: '36px', textAlign: 'right' }}>
                    {Math.round(pct * 100)}%
                  </span>
                </div>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(208,213,221,0.25)', borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 1) * 100}%` }}
                  transition={{ duration: 0.7, delay: 0.2 + i * 0.05, ease }}
                  style={{ height: '100%', backgroundColor: fillColor, borderRadius: '4px', position: 'relative' }}>
                  {isOver && (
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}
                      style={{ position: 'absolute', inset: 0, backgroundColor: '#E42C2C', borderRadius: '4px' }} />
                  )}
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ─── KPI Detail Modal ─────────────────────────────────────────────────────────

const KpiDetailModal: React.FC<{ card: typeof KPI_CARDS[0]; onClose: () => void }> = ({ card, onClose }) => (
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
    <div style={{ marginBottom: '16px' }}>
      <Sparkline values={card.sparkValues} color={card.isPositive ? '#159600' : '#E42C2C'} gradId={`modal-exp-${card.uid}`} w={300} h={60} strokeWidth={2} delay={0.2} fillOpacity={0} />
    </div>
    <div style={{ fontSize: '13px', fontFamily: font, color: card.isPositive ? '#159600' : '#E42C2C', marginBottom: '24px' }}>{card.subtext}</div>
    <div style={{ height: '1px', backgroundColor: '#EEEEEE', marginBottom: '20px' }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
      {['vs Last Month', 'vs Last Quarter', 'vs Last Year'].map((label, i) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontFamily: font }}>
          <span style={{ color: '#888' }}>{label}</span>
          <span style={{ color: card.isPositive ? '#159600' : '#E42C2C', fontWeight: 500 }}>{card.isPositive ? '+' : ''}{(i + 1) * (card.isPositive ? 6 : -4)}%</span>
        </div>
      ))}
    </div>
    <div style={{ width: '100%' }}>
      <SlidingTextSwapButton variant="primary" label="Done" onClick={onClose} style={{ width: '100%', padding: '10px 20px' }} />
    </div>
  </Overlay>
);

// ─── Expense Detail Modal ─────────────────────────────────────────────────────

const ExpenseDetailModal: React.FC<{ entry: ExpenseEntry; onClose: () => void; onEdit: () => void }> = ({ entry, onClose, onEdit }) => {
  const sc = STATUS_CONFIG[entry.status];
  const cc = CATEGORY_COLORS[entry.category];
  return (
    <Overlay onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div style={{ width: '36px', height: '36px', backgroundColor: entry.logoBg, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: entry.logoBg === 'rgba(255,255,255,1)' ? '1px solid #000' : 'none', flexShrink: 0 }}>
          <img src={entry.logo} alt="" style={{ maxWidth: '22px', maxHeight: '22px' }} />
        </div>
        <div>
          <div style={{ fontSize: '16px', fontFamily: font, fontWeight: 500, color: '#000', letterSpacing: '-0.3px' }}>{entry.vendor}</div>
          <div style={{ display: 'inline-flex', marginTop: '4px', padding: '2px 8px', borderRadius: '3px', backgroundColor: cc.bg }}>
            <span style={{ fontSize: '12px', fontFamily: font, color: cc.text }}>{entry.category}</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {[{ label: 'Amount', value: entry.amount, color: '#E42C2C' }, { label: 'Date', value: entry.date }, { label: 'Status', value: sc.label, color: sc.color }, { label: 'Method', value: entry.method }].map(({ label, value, color }) => (
          <div key={label}>
            <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '15px', fontFamily: font, color: color ?? '#000', fontWeight: 500 }}>{value}</div>
          </div>
        ))}
      </div>
      {entry.recurring && <div style={{ padding: '10px 14px', backgroundColor: '#F8F8F9', borderRadius: '8px', marginBottom: '14px' }}><span style={{ fontSize: '13px', fontFamily: font, color: '#666' }}>Recurring: </span><span style={{ fontSize: '13px', fontFamily: font, fontWeight: 500 }}>{entry.recurring}</span></div>}
      {entry.contact && <div style={{ marginBottom: '14px' }}><div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '4px' }}>Contact</div><div style={{ fontSize: '14px', fontFamily: font, color: '#000' }}>{entry.contact}</div></div>}
      {entry.notes && <div style={{ padding: '12px 16px', backgroundColor: entry.status === 'overdue' ? 'rgba(228,44,44,0.04)' : '#F8F8F9', borderRadius: '8px', borderLeft: entry.status === 'overdue' ? '3px solid #E42C2C' : 'none', marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '4px' }}>Notes</div>
        <div style={{ fontSize: '14px', fontFamily: font, color: '#444', lineHeight: 1.5 }}>{entry.notes}</div>
      </div>}
      <div style={{ height: '1px', backgroundColor: '#EEEEEE', marginBottom: '20px' }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <SlidingTextSwapButton variant="secondary" label="Close" onClick={onClose} />
        <SlidingTextSwapButton variant="primary" label="Edit" onClick={onEdit} />
      </div>
    </Overlay>
  );
};

// ─── Expense Form Modal ───────────────────────────────────────────────────────

const ExpenseFormModal: React.FC<{ title: string; initialData: ExpenseFormData; onSave: (d: ExpenseFormData) => void; onClose: () => void }> = ({ title, initialData, onSave, onClose }) => {
  const [form, setForm] = useState<ExpenseFormData>(initialData);
  const set = (f: keyof ExpenseFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [f]: e.target.value }));
  const iStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid rgba(208,213,221,0.9)', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: font, color: '#000', transition: 'border-color 0.15s' };
  const fi = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = '#000');
  const fo = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = 'rgba(208,213,221,0.9)');
  const lbl = (t: string) => <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '5px' }}>{t}</div>;

  return (
    <Overlay onClose={onClose}>
      <div style={{ fontSize: '17px', fontFamily: font, fontWeight: 500, marginBottom: '20px', letterSpacing: '-0.34px' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '62vh', overflowY: 'auto', paddingRight: '4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>{lbl('Vendor / Company')}<input style={iStyle} value={form.vendor} onChange={set('vendor')} placeholder="e.g. Acme Corp" onFocus={fi} onBlur={fo} /></div>
          <div>{lbl('Amount')}<input style={iStyle} value={form.amount} onChange={set('amount')} placeholder="-$500.00" onFocus={fi} onBlur={fo} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>{lbl('Date')}<input style={iStyle} value={form.date} onChange={set('date')} placeholder="5 Dec, 2023" onFocus={fi} onBlur={fo} /></div>
          <div>{lbl('Category')}<select style={{ ...iStyle, appearance: 'none', cursor: 'pointer' }} value={form.category} onChange={set('category')} onFocus={fi} onBlur={fo}>{EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>{lbl('Status')}<select style={{ ...iStyle, appearance: 'none', cursor: 'pointer' }} value={form.status} onChange={set('status')} onFocus={fi} onBlur={fo}><option value="paid">Paid</option><option value="overdue">Overdue</option><option value="upcoming">Upcoming</option></select></div>
          <div>{lbl('Payment Method')}<select style={{ ...iStyle, appearance: 'none', cursor: 'pointer' }} value={form.method} onChange={set('method')} onFocus={fi} onBlur={fo}>{PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>{lbl('Recurring')}<select style={{ ...iStyle, appearance: 'none', cursor: 'pointer' }} value={form.recurring} onChange={set('recurring')} onFocus={fi} onBlur={fo}><option value="">One-time</option><option value="Weekly">Weekly</option><option value="Monthly">Monthly</option><option value="Quarterly">Quarterly</option><option value="Annually">Annually</option></select></div>
          <div>{lbl('Contact (optional)')}<input style={iStyle} value={form.contact} onChange={set('contact')} placeholder="e.g. Jane Smith" onFocus={fi} onBlur={fo} /></div>
        </div>
        <div>{lbl('Notes (optional)')}<textarea style={{ ...iStyle, minHeight: '64px', resize: 'vertical' }} value={form.notes} onChange={set('notes')} onFocus={fi} onBlur={fo} /></div>
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
        <SlidingTextSwapButton variant="secondary" label="Cancel" onClick={onClose} />
        <SlidingTextSwapButton
          variant="primary"
          label="Save"
          disabled={!form.vendor.trim() || !form.amount.trim()}
          onClick={() => form.vendor.trim() && form.amount.trim() && onSave(form)}
        />
      </div>
    </Overlay>
  );
};

// ─── Expense Row (expandable) ─────────────────────────────────────────────────

const ExpenseRow: React.FC<{
  entry: ExpenseEntry;
  index: number;
  checked: boolean;
  expanded: boolean;
  onCheck: (v: boolean) => void;
  onToggleExpand: () => void;
  onDetails: () => void;
  onEdit: () => void;
  onMarkPaid: () => void;
}> = ({ entry, checked, expanded, onCheck, onToggleExpand, onDetails, onEdit, onMarkPaid }) => {
  const sc = STATUS_CONFIG[entry.status];
  const cc = CATEGORY_COLORS[entry.category];
  const isOverdue = entry.status === 'overdue';
  const [vendorHover, setVendorHover] = useState(false);
  const [dateHover, setDateHover] = useState(false);
  const [editHover, setEditHover] = useState(false);
  const [detailsHover, setDetailsHover] = useState(false);

  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0, backgroundColor: isOverdue ? 'rgba(228,44,44,0.02)' : checked ? 'rgba(55,124,246,0.04)' : 'rgba(255,255,255,0)' }}
      exit={{ opacity: 0, x: 80, filter: 'blur(3px)', height: 0, paddingTop: 0, paddingBottom: 0, borderBottomWidth: 0 }}
      transition={{ opacity: { duration: 0.22, ease: 'easeOut' }, x: { duration: 0.28, ease: [0.4, 0, 1, 1] }, height: { duration: 0.22, delay: 0.18, ease: 'easeInOut' } }}
      style={{ borderBottom: '1px solid rgba(208,213,221,0.2)', overflow: 'hidden', borderLeft: isOverdue ? '2px solid rgba(228,44,44,0.5)' : '2px solid transparent' }}
      onMouseEnter={e => !checked && !expanded && !isOverdue && (e.currentTarget.style.backgroundColor = 'rgba(248,248,249,0.6)')}
      onMouseLeave={e => !checked && !expanded && !isOverdue && (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '13px 23px', cursor: 'pointer' }} onClick={onToggleExpand}>
        <div style={{ width: '34px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <Checkbox checked={checked} onChange={onCheck} stopClick />
        </div>
        <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.18 }} style={{ width: '18px', marginRight: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 2L7 5L3 8" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </motion.div>

        {/* Vendor */}
        <div style={{ width: '220px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px', marginRight: '18px' }}>
          <motion.div
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => { e.stopPropagation(); onDetails(); }}
            style={{ width: '20px', height: '20px', backgroundColor: entry.logoBg, border: entry.logoBg === 'rgba(255,255,255,1)' ? '1px solid #000' : 'none', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
          >
            <img src={entry.logo} alt="" style={{ width: '12px' }} />
          </motion.div>
          <span
            onClick={e => { e.stopPropagation(); onDetails(); }}
            onMouseEnter={() => setVendorHover(true)}
            onMouseLeave={() => setVendorHover(false)}
            style={{ fontSize: '14px', color: '#000', fontFamily: font, cursor: 'pointer', minWidth: 0 }}
          >
            <span style={{ position: 'relative', display: 'inline-block', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
              {entry.vendor}
              <motion.span
                initial={false}
                animate={{ scaleX: vendorHover ? 1 : 0 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'absolute', left: 0, right: 0, bottom: '2px', height: '1px', backgroundColor: '#000', transformOrigin: 'left' }}
              />
            </span>
          </span>
        </div>

        {/* Date */}
        <div style={{ width: '130px', flexShrink: 0, marginRight: '16px' }}>
          <span
            onClick={e => { e.stopPropagation(); onDetails(); }}
            onMouseEnter={() => setDateHover(true)}
            onMouseLeave={() => setDateHover(false)}
            style={{ fontSize: '14px', color: '#444', fontFamily: font, cursor: 'pointer' }}
          >
            <span style={{ position: 'relative', display: 'inline-block', lineHeight: 1.2 }}>
              {entry.date}
              <motion.span
                initial={false}
                animate={{ scaleX: dateHover ? 1 : 0 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'absolute', left: 0, right: 0, bottom: '2px', height: '1px', backgroundColor: '#444', transformOrigin: 'left' }}
              />
            </span>
          </span>
        </div>

        {/* Category */}
        <div style={{ width: '160px', flexShrink: 0, marginRight: '16px' }}>
          <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: '3px', backgroundColor: cc.bg }}>
            <span style={{ fontSize: '11px', fontFamily: font, color: cc.text, whiteSpace: 'nowrap' }}>{entry.category}</span>
          </span>
        </div>

        {/* Amount */}
        <div style={{ width: '116px', flexShrink: 0, marginRight: '16px' }}>
          <span style={{ fontSize: '14px', color: '#E42C2C', fontFamily: font, fontWeight: 400 }}>{entry.amount}</span>
        </div>

        {/* Method */}
        <div style={{ width: '120px', flexShrink: 0, marginRight: '16px' }}>
          <span style={{ fontSize: '12px', fontFamily: font, color: '#888' }}>{entry.method}</span>
        </div>

        {/* Status */}
        <div style={{ width: '116px', flexShrink: 0 }}>
          <motion.span
            animate={isOverdue ? { opacity: [1, 0.65, 1] } : {}}
            transition={{ duration: 1.8, repeat: Infinity }}
            style={{ display: 'inline-flex', padding: '4px 11px', backgroundColor: sc.bg, border: `1px solid ${sc.border}`, borderRadius: '100px', color: sc.color, fontSize: '12px', fontFamily: font }}>
            {sc.label}
          </motion.span>
        </div>

        {/* Actions */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '2px' }} onClick={e => e.stopPropagation()}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onEdit}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => { setEditHover(true); e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)'; }}
            onMouseLeave={e => { setEditHover(false); e.currentTarget.style.backgroundColor = 'transparent'; }}>
            <motion.svg width="14" height="14" viewBox="0 0 16 16" fill="none" initial="rest" animate={editHover ? 'draw' : 'rest'}>
              <motion.path d="M11.5 1.5L14.5 4.5L5 14H2V11L11.5 1.5Z" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" variants={{ rest: { pathLength: 1 }, draw: { pathLength: [1, 0, 1], transition: { duration: 0.4, times: [0, 0.5, 1] } } }} />
            </motion.svg>
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onDetails}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => { setDetailsHover(true); e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)'; }}
            onMouseLeave={e => { setDetailsHover(false); e.currentTarget.style.backgroundColor = 'transparent'; }}>
            <motion.svg width="14" height="14" viewBox="0 0 16 16" fill="none" initial="rest" animate={detailsHover ? 'draw' : 'rest'}>
              <motion.path d="M6 3L11 8L6 13" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" variants={{ rest: { pathLength: 1 }, draw: { pathLength: [1, 0, 1], transition: { duration: 0.4, times: [0, 0.5, 1] } } }} />
            </motion.svg>
          </motion.button>
        </div>
      </div>

      {/* Expandable panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ height: { duration: 0.22, ease: 'easeInOut' }, opacity: { duration: 0.18 } }} style={{ overflow: 'hidden' }}>
            <div style={{ margin: '0 23px 14px 62px', padding: '14px 18px', borderRadius: '8px', backgroundColor: sc.accentBg, borderLeft: `3px solid ${sc.accentBorder}`, display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {entry.notes && (
                <div style={{ flex: 2, minWidth: '180px' }}>
                  <div style={{ fontSize: '11px', fontFamily: font, color: '#888', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</div>
                  <div style={{ fontSize: '13px', fontFamily: font, color: '#333', lineHeight: 1.5 }}>{entry.notes}</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {entry.contact && (
                  <div style={{ minWidth: '90px' }}>
                    <div style={{ fontSize: '11px', fontFamily: font, color: '#888', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</div>
                    <div style={{ fontSize: '13px', fontFamily: font, color: '#333' }}>{entry.contact}</div>
                  </div>
                )}
                <div style={{ minWidth: '90px' }}>
                  <div style={{ fontSize: '11px', fontFamily: font, color: '#888', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Method</div>
                  <div style={{ fontSize: '13px', fontFamily: font, color: '#333' }}>{entry.method}</div>
                </div>
                {entry.recurring && (
                  <div style={{ minWidth: '70px' }}>
                    <div style={{ fontSize: '11px', fontFamily: font, color: '#888', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recurring</div>
                    <div style={{ fontSize: '13px', fontFamily: font, color: '#333' }}>{entry.recurring}</div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                {(entry.status === 'overdue' || entry.status === 'upcoming') && (
                  <motion.button whileTap={{ scale: 0.97 }} onClick={onMarkPaid}
                    style={{ padding: '6px 14px', border: '1px solid rgba(0,0,0,0.25)', borderRadius: '6px', background: 'rgba(0,0,0,0.04)', color: '#333', fontSize: '13px', fontFamily: font, cursor: 'pointer' }}>
                    Mark Paid
                  </motion.button>
                )}
                <motion.button whileTap={{ scale: 0.97 }} onClick={onToggleExpand}
                  style={{ padding: '6px 10px', border: '1px solid rgba(208,213,221,0.6)', borderRadius: '6px', background: '#fff', color: '#888', fontSize: '13px', fontFamily: font, cursor: 'pointer' }}>
                  Collapse
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Floating Action Bar ──────────────────────────────────────────────────────

const FloatingActionBar: React.FC<{ count: number; onClear: () => void; onMarkPaid: () => void; onDelete: () => void }> = ({ count, onClear, onMarkPaid, onDelete }) => {
  const uid = useId();
  return (
    <motion.div key={uid} initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.96 }} transition={{ duration: 0.22, ease }}
      style={{ position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)', zIndex: 150, display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: '#111', borderRadius: '12px', boxShadow: '0px 8px 32px rgba(0,0,0,0.24)', whiteSpace: 'nowrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '12px', borderRight: '1px solid rgba(255,255,255,0.12)', marginRight: '6px' }}>
        <div style={{ width: '18px', height: '18px', backgroundColor: '#377CF6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '11px', color: '#fff', fontFamily: font, fontWeight: 600, lineHeight: 1 }}>{count}</span>
        </div>
        <span style={{ fontSize: '13px', fontFamily: font, color: 'rgba(255,255,255,0.7)' }}>selected</span>
      </div>
      {[{ label: 'Mark Paid', onClick: onMarkPaid }, { label: 'Export CSV', onClick: onClear }].map(({ label, onClick }) => (
        <motion.button key={label} whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.96 }} onClick={onClick}
          style={{ padding: '6px 12px', background: 'none', border: 'none', borderRadius: '6px', color: 'rgba(255,255,255,0.88)', fontSize: '13px', fontFamily: font, cursor: 'pointer' }}>
          {label}
        </motion.button>
      ))}
      <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.12)', margin: '0 4px' }} />
      <motion.button whileHover={{ backgroundColor: 'rgba(228,44,44,0.18)' }} whileTap={{ scale: 0.96 }} onClick={onDelete}
        style={{ padding: '6px 12px', background: 'none', border: 'none', borderRadius: '6px', color: '#FF6B6B', fontSize: '13px', fontFamily: font, cursor: 'pointer' }}>Delete</motion.button>
      <motion.button
        onClick={onClear}
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileTap={{ scale: 0.9 }}
        variants={{ rest: { backgroundColor: 'rgba(255,255,255,0.08)' }, hover: { backgroundColor: 'rgba(255,255,255,0.16)' } }}
        transition={{ duration: 0.2, ease }}
        style={{ width: '24px', height: '24px', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '4px', flexShrink: 0 }}
      >
        <motion.svg
          width={16}
          height={16}
          viewBox="0 0 16 16"
          fill="none"
          variants={{ rest: { rotate: 0 }, hover: { rotate: 180 } }}
          transition={{ duration: 0.24, ease }}
          style={{ transformOrigin: '50% 50%' }}
        >
          <path d="M4 4L12 12" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M12 4L4 12" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
        </motion.svg>
      </motion.button>
    </motion.div>
  );
};

// ─── Main ExpensesContent ─────────────────────────────────────────────────────

export const ExpensesContent: React.FC = () => {
  const [entries, setEntries] = useState<ExpenseEntry[]>(INITIAL_ENTRIES);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [chartPeriod, setChartPeriod] = useState<ExpensePeriod>('Yearly');
  const [showChartMenu, setShowChartMenu] = useState(false);
  const [catMonth, setCatMonth] = useState('February');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'All'>('All');
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [showStatMenu, setShowStatMenu] = useState(false);
  const [detailEntry, setDetailEntry] = useState<ExpenseEntry | null>(null);
  const [editEntry, setEditEntry] = useState<ExpenseEntry | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [kpiDetail, setKpiDetail] = useState<typeof KPI_CARDS[0] | null>(null);
  const [addHover, setAddHover] = useState(false);
  const [pillHover, setPillHover] = useState<ExpenseCategory | null>(null);
  const [dismissedOverdueBanner, setDismissedOverdueBanner] = useState(false);
  const [overdueCloseHover, setOverdueCloseHover] = useState(false);

  const chartMenuRef = useRef<HTMLDivElement>(null);
  const catMenuRef = useRef<HTMLDivElement>(null);
  const statMenuRef = useRef<HTMLDivElement>(null);
  useClickOutside(chartMenuRef, () => setShowChartMenu(false));
  useClickOutside(catMenuRef, () => setShowCatMenu(false));
  useClickOutside(statMenuRef, () => setShowStatMenu(false));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (kpiDetail || detailEntry || editEntry || showAddModal) return;
      setSelectedRows(new Set());
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [kpiDetail, detailEntry, editEntry, showAddModal]);

  const filtered = useMemo(() => entries.filter(e => {
    const q = searchQuery.toLowerCase().trim();
    return (!q || e.vendor.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || (e.notes ?? '').toLowerCase().includes(q) || (e.contact ?? '').toLowerCase().includes(q) || e.method.toLowerCase().includes(q))
      && (categoryFilter === 'All' || e.category === categoryFilter)
      && (statusFilter === 'All' || e.status === statusFilter);
  }), [entries, searchQuery, categoryFilter, statusFilter]);

  const allSelected = filtered.length > 0 && filtered.every(e => selectedRows.has(e.id));
  const toggleAll = () => allSelected ? setSelectedRows(new Set()) : setSelectedRows(new Set(filtered.map(e => e.id)));
  const toggleRow = (id: number, v: boolean) => { const next = new Set(selectedRows); v ? next.add(id) : next.delete(id); setSelectedRows(next); };

  const handleMarkPaid = (id?: number) => {
    if (id !== undefined) setEntries(prev => prev.map(e => e.id === id ? { ...e, status: 'paid' } : e));
    else { setEntries(prev => prev.map(e => selectedRows.has(e.id) ? { ...e, status: 'paid' } : e)); setSelectedRows(new Set()); }
  };
  const deleteSelected = () => { setEntries(prev => prev.filter(e => !selectedRows.has(e.id))); setSelectedRows(new Set()); };

  const handleAdd = (form: ExpenseFormData) => {
    const id = Math.max(0, ...entries.map(e => e.id)) + 1;
    setEntries(prev => [{
      id, vendor: form.vendor,
      logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/f4f353a7-30fa-4422-a2a3-a40095dbb40c.svg',
      logoBg: 'rgba(255,255,255,1)', date: form.date || '—',
      category: form.category, amount: form.amount.startsWith('-') ? form.amount : `-${form.amount}`,
      status: form.status, method: form.method, recurring: form.recurring || undefined,
      notes: form.notes || undefined, contact: form.contact || undefined,
    }, ...prev]);
    setShowAddModal(false);
  };

  const handleEdit = (form: ExpenseFormData) => {
    if (!editEntry) return;
    setEntries(prev => prev.map(e => e.id === editEntry.id ? { ...e, vendor: form.vendor, date: form.date, category: form.category, amount: form.amount.startsWith('-') ? form.amount : `-${form.amount}`, status: form.status, method: form.method, recurring: form.recurring || undefined, notes: form.notes || undefined, contact: form.contact || undefined } : e));
    setEditEntry(null); setDetailEntry(null);
  };

  const activeCatCounts = useMemo(() => { const m = new Map<ExpenseCategory, number>(); entries.forEach(e => m.set(e.category, (m.get(e.category) ?? 0) + 1)); return m; }, [entries]);
  const overdueCount = entries.filter(e => e.status === 'overdue').length;
  const upcomingTotal = entries.filter(e => e.status === 'upcoming').reduce((s, e) => s + parseFloat(e.amount.replace(/[^0-9.]/g, '')), 0);

  return (
    <motion.div key="expenses" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.3, ease }} style={{ overflowY: 'auto', flex: 1, paddingTop: '8px', paddingRight: '8px', boxSizing: 'border-box' }}>

      {/* ── Overdue alert banner ── */}
      <AnimatePresence>
        {overdueCount > 0 && !dismissedOverdueBanner && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ position: 'relative', marginBottom: '14px', padding: '10px 18px', borderRadius: '8px', backgroundColor: 'rgba(228,44,44,0.06)', border: '1px solid rgba(228,44,44,0.2)', display: 'flex', alignItems: 'center', gap: '10px', overflow: 'visible' }}>
            <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#E42C2C', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', fontFamily: font, color: '#E42C2C', fontWeight: 500 }}>
              {overdueCount} overdue payment{overdueCount > 1 ? 's' : ''} {overdueCount === 1 ? 'requires' : 'require'} immediate attention
            </span>
            <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
              <SlidingTextSwapButton
                variant="softRedOutline"
                label="View overdue"
                onClick={() => setStatusFilter('overdue')}
                style={{ padding: '7px 16px' }}
              />
            </div>
            {/* Close button - positioned top right, cutting out of border (fills: rest #FDF2F2 → hover #FFEAEA) */}
            <motion.button
              type="button"
              aria-label="Dismiss overdue alert"
              onClick={() => setDismissedOverdueBanner(true)}
              onMouseEnter={() => setOverdueCloseHover(true)}
              onMouseLeave={() => setOverdueCloseHover(false)}
              animate={{ rotate: overdueCloseHover ? 180 : 0 }}
              transition={{ duration: 0.24, ease }}
              style={{ position: 'absolute', top: '-6px', right: '-6px', width: '12px', height: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, overflow: 'visible' }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
                <motion.rect
                  x="0.5"
                  y="0.5"
                  width="11"
                  height="11"
                  rx="5.5"
                  stroke="#F3A4A4"
                  animate={{ fill: overdueCloseHover ? '#FFEAEA' : '#FDF2F2' }}
                  transition={{ duration: 0.2, ease }}
                />
                <path d="M4 4L8 8" stroke="#E42C2C" strokeLinecap="round"/>
                <path d="M8 4L4 8" stroke="#E42C2C" strokeLinecap="round"/>
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero Banner ── */}
      <HeroBanner entries={entries} />

      {/* ── KPI Cards ── */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', paddingTop: '10px', marginTop: '-10px', overflow: 'visible' }}>
        {KPI_CARDS.map((card, i) => <ExpenseStatCard key={card.title} {...card} index={i} onClick={() => setKpiDetail(card)} />)}
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {/* Spend Trend */}
        <div style={{ flex: '2', minWidth: '340px', backgroundColor: '#FFF', border: '1px solid rgba(208,213,221,0.5)', borderRadius: '8px', padding: '25px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '16px', fontFamily: font, fontWeight: 500 }}>Spend Trend</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#95E0FB' }} />
                  <span style={{ fontSize: '12px', fontFamily: font, color: '#888' }}>Spend</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '16px', height: '1.5px', backgroundColor: '#95E0FB' }} />
                  <span style={{ fontSize: '12px', fontFamily: font, color: '#888' }}>Trend</span>
                </div>
              </div>
            </div>
            <div ref={chartMenuRef} style={{ position: 'relative' }}>
              <DropdownTriggerButton onClick={() => setShowChartMenu(v => !v)} style={{ padding: '6px 14px', fontSize: '13px', boxShadow: '0px 1px 2px rgba(16,24,40,0.05)' }}>
                {chartPeriod}
                <motion.img animate={{ rotate: showChartMenu ? 180 : 0 }} transition={{ duration: 0.2 }}
                  src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/65bc4581-aeec-47ac-8a0f-79e059030bb7.svg" alt="" style={{ width: '18px' }} />
              </DropdownTriggerButton>
              <AnimatePresence>
                {showChartMenu && <DropdownMenu style={{ top: '38px', right: 0 }} items={(['Yearly', 'Quarterly', 'Monthly'] as ExpensePeriod[]).map(p => ({ label: p, onClick: () => { setChartPeriod(p); setShowChartMenu(false); } }))} />}
              </AnimatePresence>
            </div>
          </div>
          <SpendTrendChart data={EXPENSE_CHART_DATA[chartPeriod]} animKey={chartPeriod} />
        </div>

        {/* Spend by Category */}
        <SpendByCategoryPanel month={catMonth} onMonthChange={setCatMonth} />

        {/* Top Vendors */}
        <TopVendorsCard entries={entries} />
      </div>

      {/* ── Budget Health ── */}
      <BudgetHealthPanel entries={entries} />

      {/* ── Expense Ledger ── */}
      <div style={{ border: '1px solid rgba(208,213,221,0.5)', borderRadius: '8px', backgroundColor: '#FFF', marginBottom: '24px' }}>
        {/* Header */}
        <div style={{ padding: '18px 25px', borderBottom: '1px solid rgba(208,213,221,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '17px', fontFamily: font, fontWeight: 500 }}>Expense Ledger</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AnimatePresence>
              {selectedRows.size > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15 }}
                  style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontFamily: font, color: '#888' }}>{selectedRows.size} selected</span>
                  <motion.button whileTap={{ scale: 0.96 }} onClick={() => setSelectedRows(new Set())}
                    style={{ padding: '5px 12px', border: '1px solid #D0D5DD', borderRadius: '6px', background: '#fff', fontSize: '12px', fontFamily: font, cursor: 'pointer' }}>Clear</motion.button>
                  <motion.button whileTap={{ scale: 0.96 }} onClick={deleteSelected}
                    style={{ padding: '5px 12px', border: 'none', borderRadius: '6px', background: '#E42C2C', color: '#fff', fontSize: '12px', fontFamily: font, cursor: 'pointer' }}>Delete</motion.button>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowAddModal(true)} onMouseEnter={() => setAddHover(true)} onMouseLeave={() => setAddHover(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 15px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontFamily: font, fontWeight: 400 }}>
              <motion.svg width="17" height="17" viewBox="0 0 24 24" fill="none" animate={{ rotate: addHover ? 180 : 0 }} transition={{ type: 'spring', stiffness: 100, damping: 15 }}>
                <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
              Add Expense
            </motion.button>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ padding: '12px 25px', borderBottom: '1px solid rgba(208,213,221,0.2)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px', border: '1px solid rgba(208,213,221,0.5)', borderRadius: '8px', boxShadow: '0px 1px 2px rgba(16,24,40,0.05)' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, color: searchQuery.trim() ? '#444' : '#98A2B3' }}>
                <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.4" />
                <path d="M8.5 8.5L11 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input type="text" placeholder="Search expenses…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '14px', color: '#444', width: '160px', fontFamily: font }} />
              {searchQuery && (
                <CloseButton onClick={() => setSearchQuery('')} size="sm" iconColor="#aaa" />
              )}
            </div>

            {/* Category filter */}
            <div ref={catMenuRef} style={{ position: 'relative' }}>
              <DropdownTriggerButton
                onClick={() => setShowCatMenu(v => !v)}
                style={{
                  padding: '7px 12px',
                  fontSize: '13px',
                  border: `1px solid ${categoryFilter !== 'All' ? 'rgba(228,44,44,0.4)' : 'rgba(208,213,221,0.5)'}`,
                  background: categoryFilter !== 'All' ? 'rgba(228,44,44,0.04)' : '#fff',
                  boxShadow: '0px 1px 2px rgba(16,24,40,0.05)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 3h10M3 6h6M5 9h2" stroke={categoryFilter !== 'All' ? '#E42C2C' : '#666'} strokeWidth="1.3" strokeLinecap="round"/></svg>
                <span style={{ color: categoryFilter !== 'All' ? '#E42C2C' : '#444', fontFamily: font }}>{categoryFilter === 'All' ? 'Category' : categoryFilter}</span>
                <motion.svg animate={{ rotate: showCatMenu ? 180 : 0 }} transition={{ duration: 0.2 }} width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 3.5L5 6.5L8 3.5" stroke={categoryFilter !== 'All' ? '#E42C2C' : '#666'} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </motion.svg>
              </DropdownTriggerButton>
              <AnimatePresence>
                {showCatMenu && <DropdownMenu style={{ top: '40px', left: 0, minWidth: '180px' }}
                  items={[{ label: 'All Categories', onClick: () => { setCategoryFilter('All'); setShowCatMenu(false); } },
                    ...EXPENSE_CATEGORIES.map(c => ({ label: `${c} (${activeCatCounts.get(c) ?? 0})`, onClick: () => { setCategoryFilter(c); setShowCatMenu(false); } }))]} />}
              </AnimatePresence>
            </div>

            {/* Status filter */}
            <div ref={statMenuRef} style={{ position: 'relative' }}>
              <DropdownTriggerButton
                onClick={() => setShowStatMenu(v => !v)}
                style={{
                  padding: '7px 12px',
                  fontSize: '13px',
                  border: `1px solid ${statusFilter !== 'All' ? STATUS_CONFIG[statusFilter].border : 'rgba(208,213,221,0.5)'}`,
                  background: statusFilter !== 'All' ? STATUS_CONFIG[statusFilter].bg : '#fff',
                  boxShadow: '0px 1px 2px rgba(16,24,40,0.05)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke={statusFilter !== 'All' ? STATUS_CONFIG[statusFilter].color : '#666'} strokeWidth="1.3"/><path d="M4 6l1.5 1.5L8 4" stroke={statusFilter !== 'All' ? STATUS_CONFIG[statusFilter].color : '#666'} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ color: statusFilter !== 'All' ? STATUS_CONFIG[statusFilter].color : '#444', fontFamily: font }}>{statusFilter === 'All' ? 'Status' : STATUS_CONFIG[statusFilter].label}</span>
                <motion.svg animate={{ rotate: showStatMenu ? 180 : 0 }} transition={{ duration: 0.2 }} width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 3.5L5 6.5L8 3.5" stroke={statusFilter !== 'All' ? STATUS_CONFIG[statusFilter].color : '#666'} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </motion.svg>
              </DropdownTriggerButton>
              <AnimatePresence>
                {showStatMenu && <DropdownMenu style={{ top: '40px', left: 0, minWidth: '140px' }}
                  items={[{ label: 'All Statuses', onClick: () => { setStatusFilter('All'); setShowStatMenu(false); } },
                    ...(['paid', 'overdue', 'upcoming'] as ExpenseStatus[]).map(s => ({ label: STATUS_CONFIG[s].label, onClick: () => { setStatusFilter(s); setShowStatMenu(false); } }))]} />}
              </AnimatePresence>
            </div>

            {(categoryFilter !== 'All' || statusFilter !== 'All' || searchQuery) && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.97 }}
                onClick={() => { setCategoryFilter('All'); setStatusFilter('All'); setSearchQuery(''); }}
                style={{ fontSize: '12px', fontFamily: font, color: '#888', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                Clear all
              </motion.button>
            )}
          </div>
          <span style={{ fontSize: '12px', fontFamily: font, color: '#aaa' }}>{filtered.length} of {entries.length}</span>
        </div>

        {/* Category quick-filter pills */}
        <div style={{ padding: '10px 25px', borderBottom: '1px solid rgba(208,213,221,0.15)', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontFamily: font, color: '#bbb', marginRight: '2px' }}>Filter:</span>
          {EXPENSE_CATEGORIES.map(cat => {
            const count = activeCatCounts.get(cat) ?? 0;
            if (count === 0) return null;
            const active = categoryFilter === cat;
            const cc = CATEGORY_COLORS[cat];
            const isHover = pillHover === cat;
            const accent = active || isHover;
            return (
              <motion.button
                key={cat}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setCategoryFilter(active ? 'All' : cat)}
                onMouseEnter={() => setPillHover(cat)}
                onMouseLeave={() => setPillHover(null)}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 10px',
                  borderRadius: '100px',
                  border: `1px solid ${accent ? cc.text : 'rgba(208,213,221,0.5)'}`,
                  background: active ? cc.bg : 'transparent',
                  cursor: 'pointer',
                  transition: 'border-color 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <motion.div
                  initial={false}
                  animate={{ scaleY: !active && isHover ? 1 : 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: 'absolute',
                    inset: '-1px',
                    backgroundColor: cc.bg,
                    zIndex: 0,
                    transformOrigin: 'bottom',
                    borderRadius: '100px',
                  }}
                />
                <span style={{ position: 'relative', zIndex: 1, fontSize: '11px', fontFamily: font, color: accent ? cc.text : '#666', transition: 'color 0.18s ease' }}>{cat}</span>
                <span style={{ position: 'relative', zIndex: 1, fontSize: '10px', fontFamily: font, color: accent ? cc.text : '#aaa', opacity: accent ? 0.92 : 1, transition: 'color 0.18s ease' }}>{count}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Table header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '11px 25px', color: '#888', fontSize: '13px', fontFamily: font, borderBottom: '1px solid rgba(208,213,221,0.2)', backgroundColor: 'rgba(248,248,249,0.5)' }}>
          <div style={{ width: '34px', flexShrink: 0 }}><Checkbox checked={allSelected} onChange={toggleAll} /></div>
          <div style={{ width: '18px', marginRight: '12px', flexShrink: 0 }} />
          {[
            { label: 'Vendor',    w: '220px', mr: '18px' },
            { label: 'Date',      w: '130px', mr: '16px' },
            { label: 'Category',  w: '160px', mr: '16px' },
            { label: 'Amount',    w: '116px', mr: '16px' },
            { label: 'Method',    w: '120px', mr: '16px' },
            { label: 'Status',    w: '116px', mr: '0'    },
          ].map(col => (
            <div key={col.label} style={{ width: col.w, flexShrink: 0, marginRight: col.mr }}>{col.label}</div>
          ))}
        </div>

        {/* Rows */}
        <AnimatePresence>
          {filtered.map((entry, i) => (
            <ExpenseRow key={entry.id} entry={entry} index={i}
              checked={selectedRows.has(entry.id)}
              expanded={expandedRow === entry.id}
              onCheck={v => toggleRow(entry.id, v)}
              onToggleExpand={() => setExpandedRow(expandedRow === entry.id ? null : entry.id)}
              onDetails={() => setDetailEntry(entry)}
              onEdit={() => setEditEntry(entry)}
              onMarkPaid={() => handleMarkPaid(entry.id)}
            />
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ padding: '48px', textAlign: 'center', fontSize: '14px', fontFamily: font, color: '#888' }}>
            {searchQuery || categoryFilter !== 'All' || statusFilter !== 'All' ? 'No expenses match your filters.' : 'No expenses yet. Add your first expense above.'}
          </motion.div>
        )}

        {/* Upcoming footer */}
        {entries.some(e => e.status === 'upcoming') && (
          <div style={{ padding: '12px 25px', borderTop: '1px solid rgba(208,213,221,0.2)', backgroundColor: 'rgba(55,124,246,0.02)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="#377CF6" strokeWidth="1.2"/><path d="M6.5 4v3l2 1.5" stroke="#377CF6" strokeWidth="1.2" strokeLinecap="round"/></svg>
            <span style={{ fontSize: '12px', fontFamily: font, color: '#555' }}>
              Upcoming scheduled payments:{' '}
              <strong style={{ color: '#000', fontWeight: 500 }}>
                {entries.filter(e => e.status === 'upcoming').length} {entries.filter(e => e.status === 'upcoming').length === 1 ? 'payment' : 'payments'}&nbsp;·&nbsp;
                -${upcomingTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} due
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {kpiDetail && <KpiDetailModal key="kpi" card={kpiDetail} onClose={() => setKpiDetail(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {detailEntry && <ExpenseDetailModal key="detail" entry={detailEntry} onClose={() => setDetailEntry(null)} onEdit={() => { setEditEntry(detailEntry); setDetailEntry(null); }} />}
      </AnimatePresence>
      <AnimatePresence>
        {editEntry && <ExpenseFormModal key="edit" title="Edit Expense" initialData={{ vendor: editEntry.vendor, amount: editEntry.amount, date: editEntry.date, category: editEntry.category, status: editEntry.status, method: editEntry.method, recurring: editEntry.recurring ?? '', notes: editEntry.notes ?? '', contact: editEntry.contact ?? '' }} onSave={handleEdit} onClose={() => setEditEntry(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showAddModal && <ExpenseFormModal key="add" title="Add Expense" initialData={EMPTY_FORM} onSave={handleAdd} onClose={() => setShowAddModal(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedRows.size > 0 && <FloatingActionBar key="fab" count={selectedRows.size} onClear={() => setSelectedRows(new Set())} onMarkPaid={() => handleMarkPaid()} onDelete={deleteSelected} />}
      </AnimatePresence>
    </motion.div>
  );
};
