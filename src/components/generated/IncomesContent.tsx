import React, { useState, useRef, useEffect, useLayoutEffect, useMemo, useId } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { DropdownTriggerButton, DropdownMenu as SharedDropdownMenu, SlidingTextSwapButton, CloseButton } from './interactionPrimitives';

// ─── Constants ────────────────────────────────────────────────────────────────

const font = '"Approach TRIAL", sans-serif';
const ease = [0.16, 1, 0.3, 1] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type IncomeStatus = 'received' | 'pending' | 'scheduled';
const INCOME_CATEGORIES = ['Consulting', 'SaaS Revenue', 'Freelance', 'Trade Revenue', 'Royalties', 'Dividends'] as const;
type IncomeCategory = typeof INCOME_CATEGORIES[number];
type IncomePeriod = 'Yearly' | 'Quarterly' | 'Monthly';

interface IncomeEntry {
  id: number;
  source: string;
  logo: string;
  logoBg: string;
  date: string;
  category: IncomeCategory;
  amount: string;
  status: IncomeStatus;
  recurring?: string;
  notes?: string;
  contact?: string;
}

type IncomeFormData = {
  source: string; amount: string; date: string;
  category: IncomeCategory; status: IncomeStatus;
  recurring: string; notes: string; contact: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const INITIAL_ENTRIES: IncomeEntry[] = [
  { id: 1,  source: 'Augment LLC',        logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/f4f353a7-30fa-4422-a2a3-a40095dbb40c.svg',  logoBg: 'rgba(255,255,255,1)', date: '5 Dec, 2023',  category: 'Consulting',    amount: '+$4,500.00', status: 'received',  recurring: 'Monthly',   contact: 'Brice Howard',      notes: 'Monthly consulting retainer — financial services advisory.' },
  { id: 2,  source: 'FierceExchange Inc', logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/622f2a7a-9904-4980-93ec-eb69d646960d.svg', logoBg: 'rgba(255,75,75,1)',   date: '4 Dec, 2023',  category: 'Trade Revenue', amount: '+$1,240.00', status: 'received',                          contact: 'Denker Matthews',   notes: 'Trade commission from USD/EUR position close.' },
  { id: 3,  source: 'Webflow',            logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/9ee4912a-e537-4010-8749-188c651eba05.svg',  logoBg: 'rgba(67,83,255,1)',   date: '3 Dec, 2023',  category: 'SaaS Revenue',  amount: '+$890.00',   status: 'received',  recurring: 'Monthly',   contact: 'Gaant Giant',       notes: 'Monthly platform subscription revenue share.' },
  { id: 4,  source: 'Cuboid Inc',         logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/98e93cea-45e7-4de5-a10c-41ce726abdc2.svg',  logoBg: 'rgba(255,255,255,1)', date: '2 Dec, 2023',  category: 'Freelance',     amount: '+$2,100.00', status: 'pending',                              contact: 'Harry Mants',       notes: 'Design sprint invoice — awaiting client approval.' },
  { id: 5,  source: 'Augment LLC',        logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/54fe0b06-3c3d-4453-aa7e-6d0ce865d250.svg',  logoBg: 'rgba(255,255,255,1)', date: '1 Dec, 2023',  category: 'Consulting',    amount: '+$3,200.00', status: 'received',  recurring: 'Monthly',   contact: 'Nina Carlson',      notes: 'Strategy consulting — Q4 financial planning session.' },
  { id: 6,  source: 'FierceExchange Inc', logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/8324691d-bcea-4405-a771-82e907870bf0.svg',  logoBg: 'rgba(255,75,75,1)',   date: '28 Nov, 2023', category: 'Trade Revenue', amount: '+$560.00',   status: 'received',                          contact: 'Holden Steinberg',  notes: 'Spot trade proceeds — GBP/JPY pair.' },
  { id: 7,  source: 'Webflow',            logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/9ee4912a-e537-4010-8749-188c651eba05.svg',  logoBg: 'rgba(67,83,255,1)',   date: '25 Nov, 2023', category: 'SaaS Revenue',  amount: '+$890.00',   status: 'scheduled', recurring: 'Monthly',   contact: 'Menda Sage',        notes: 'Scheduled December payout — subscription renewal.' },
  { id: 8,  source: 'Cuboid Inc',         logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/98e93cea-45e7-4de5-a10c-41ce726abdc2.svg',  logoBg: 'rgba(255,255,255,1)', date: '20 Nov, 2023', category: 'Freelance',     amount: '+$1,750.00', status: 'received',                          contact: 'Larry Page',        notes: 'Website audit and UX consulting engagement.' },
  { id: 9,  source: 'Augment LLC',        logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/f4f353a7-30fa-4422-a2a3-a40095dbb40c.svg',  logoBg: 'rgba(255,255,255,1)', date: '15 Nov, 2023', category: 'Royalties',     amount: '+$380.00',   status: 'received',                                                        notes: 'Q3 IP licensing royalty payment.' },
  { id: 10, source: 'FierceExchange Inc', logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/622f2a7a-9904-4980-93ec-eb69d646960d.svg', logoBg: 'rgba(255,75,75,1)',   date: '10 Nov, 2023', category: 'Dividends',     amount: '+$1,120.00', status: 'received',                                                        notes: 'Annual dividend from portfolio holdings.' },
];

const KPI_CARDS = [
  { title: 'Total Earned', amount: '$13,640.00', subtext: '+$1,540 vs November', percentage: '12.7%', isPositive: true,  icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/014a0924-f3b1-4d18-8028-7cf395eea7e4.svg', sparkValues: [8200,9100,9800,10500,11200,12100,13640], uid: 'total'    },
  { title: 'Avg Monthly',  amount: '$4,546.67',  subtext: '+$320 vs last quarter', percentage: '7.6%',  isPositive: true,  icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/0e540694-ffe6-472d-839e-5cc1179fe992.svg', sparkValues: [3800,4100,4200,4300,4400,4500,4547], uid: 'avg'      },
  { title: 'Pending',      amount: '$2,100.00',  subtext: '1 invoice awaiting',    percentage: '15.4%', isPositive: false, icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/1e97b8bd-d214-47a4-847e-275e7626a8df.svg', sparkValues: [1200,2100,800,1500,900,2500,2100],   uid: 'pending'  },
  { title: 'Recurring',    amount: '$9,480.00',  subtext: '69.5% of total income', percentage: '69.5%', isPositive: true,  icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/cb4ca95a-8ffa-47f1-b6df-79cb827735bd.svg', sparkValues: [7200,7800,8100,8400,8900,9200,9480], uid: 'recurring' },
];

const HERO_SPARK_VALUES = [5400, 6200, 7100, 8200, 9800, 10200, 11490, 13640];
const INCOME_GOAL = 15000;

const INCOME_CHART_DATA: Record<IncomePeriod, { label: string; income: number }[]> = {
  Yearly:    [{ label:'Jan',income:6200},{ label:'Feb',income:5400},{ label:'Mar',income:7800},{ label:'Apr',income:6900},{ label:'May',income:8200},{ label:'Jun',income:7100},{ label:'Jul',income:9400},{ label:'Aug',income:8600},{ label:'Sep',income:10200},{ label:'Oct',income:9800},{ label:'Nov',income:11490},{ label:'Dec',income:13640}],
  Quarterly: [{ label:'Q1',income:19400},{ label:'Q2',income:22200},{ label:'Q3',income:28200},{ label:'Q4',income:34930}],
  Monthly:   [{ label:'Wk 1',income:5740},{ label:'Wk 2',income:3760},{ label:'Wk 3',income:2650},{ label:'Wk 4',income:1490}],
};

const SOURCE_MONTHS_LIST = ['January', 'February', 'March', 'April', 'May', 'June'];
const SOURCE_BASE = [
  { label: 'Consulting',    color: '#377CF6' },
  { label: 'SaaS Revenue',  color: '#4F46E5' },
  { label: 'Freelance',     color: '#C07800' },
  { label: 'Trade Revenue', color: '#EA580C' },
  { label: 'Other',         color: '#A8B0C5' },
];
const SOURCE_MONTH_VALS: Record<string, number[]> = {
  January:  [4200, 890, 1200, 980,  380],
  February: [3800, 890, 2100, 1240,   0],
  March:    [5100, 890, 1750, 560,  1500],
  April:    [4500, 890,  900, 1800,   0],
  May:      [6200,1780, 2100, 1240,  380],
  June:     [4800, 890, 1400, 980,  1120],
};

const STATUS_CONFIG: Record<IncomeStatus, { label: string; color: string; bg: string; border: string; accentBg: string }> = {
  received:  { label:'Received',  color:'#159600', bg:'rgba(21,150,0,0.06)',    border:'rgba(21,150,0,1)',       accentBg:'rgba(21,150,0,0.08)' },
  pending:   { label:'Pending',   color:'#C07800', bg:'rgba(192,120,0,0.06)',   border:'rgba(192,120,0,1)',      accentBg:'rgba(192,120,0,0.08)' },
  scheduled: { label:'Scheduled', color:'#777',    bg:'rgba(119,119,119,0.06)', border:'rgba(119,119,119,0.7)', accentBg:'rgba(119,119,119,0.06)' },
};

const CATEGORY_COLORS: Record<IncomeCategory, { bg: string; text: string }> = {
  'Consulting':    { bg:'rgba(55,124,246,0.10)', text:'#1D5EBF' },
  'SaaS Revenue':  { bg:'rgba(79,70,229,0.10)',  text:'#4338CA' },
  'Freelance':     { bg:'rgba(192,120,0,0.10)',  text:'#9A6200' },
  'Trade Revenue': { bg:'rgba(234,88,12,0.10)',  text:'#C2410C' },
  'Royalties':     { bg:'rgba(139,92,246,0.10)', text:'#6D28D9' },
  'Dividends':     { bg:'rgba(14,116,144,0.10)', text:'#0E7490' },
};

const EMPTY_FORM: IncomeFormData = { source:'', amount:'', date:'', category:'Consulting', status:'received', recurring:'', notes:'', contact:'' };

// ─── Utility ──────────────────────────────────────────────────────────────────

function useClickOutside(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) cb(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [ref, cb]);
}

/** Builds a smooth cubic bezier SVG path through value array */
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

const Sparkline: React.FC<{
  values: number[];
  color: string;
  gradId: string;
  w?: number; h?: number;
  strokeWidth?: number;
  delay?: number;
  fillOpacity?: number;
}> = ({ values, color, gradId, w = 80, h = 28, strokeWidth = 1.5, delay = 0.4, fillOpacity = 0.16 }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const d = buildSparkPath(values, w, h);
  const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
  const lastY = parseFloat((h - ((values[values.length - 1] - min) / range) * (h * 0.78) - h * 0.11).toFixed(1));
  const areaD = `${d} L ${w} ${h} L 0 ${h} Z`;

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const l = el.getTotalLength();
    el.style.strokeDasharray = String(l);
    el.style.strokeDashoffset = String(l);
    const ctrl = animate(l, 0, {
      duration: 1.3, ease: [0.16, 1, 0.3, 1], delay,
      onUpdate: v => { if (pathRef.current) pathRef.current.style.strokeDashoffset = String(v); },
    });
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
      <motion.circle cx={w} cy={lastY} r={3} fill={color}
        initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, delay: delay + 1.1 }} />
    </svg>
  );
};

// ─── Circular Goal Arc ────────────────────────────────────────────────────────

const GoalArc: React.FC<{ current: number; goal: number }> = ({ current, goal }) => {
  const pct = Math.min(current / goal, 1);
  const r = 32, cx = 40, cy = 40;
  const circ = 2 * Math.PI * r;
  const arcRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = arcRef.current;
    if (!el) return;
    el.style.strokeDasharray = String(circ);
    el.style.strokeDashoffset = String(circ);
    const ctrl = animate(circ, circ * (1 - pct), {
      duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.5,
      onUpdate: v => { if (arcRef.current) arcRef.current.style.strokeDashoffset = String(v); },
    });
    return () => ctrl.stop();
  }, [pct, circ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <svg width={80} height={80}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(208,213,221,0.35)" strokeWidth="5" />
        <circle
          ref={arcRef} cx={cx} cy={cy} r={r} fill="none"
          stroke="#159600" strokeWidth="5" strokeLinecap="round"
          style={{ transformOrigin: `${cx}px ${cy}px`, transform: 'rotate(-90deg)' }}
        />
        <text x={cx} y={cy - 3} textAnchor="middle" style={{ fontFamily: font, fontSize: '13px', fontWeight: 600, fill: '#000' }}>
          {Math.round(pct * 100)}%
        </text>
        <text x={cx} y={cy + 11} textAnchor="middle" style={{ fontFamily: font, fontSize: '9px', fill: '#888' }}>
          of goal
        </text>
      </svg>
      <span style={{ fontSize: '11px', fontFamily: font, color: '#888' }}>
        Goal: ${(goal / 1000).toFixed(0)}k
      </span>
    </div>
  );
};

// ─── CountUp ──────────────────────────────────────────────────────────────────

const CountUp: React.FC<{ rawValue: string; style?: React.CSSProperties }> = ({ rawValue, style }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const isPos = rawValue.startsWith('+');
    const prefix = isPos ? '+$' : '$';
    const num = parseFloat(rawValue.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return;
    const ctrl = animate(0, num, {
      duration: 1, ease: [0.16, 1, 0.3, 1],
      onUpdate: v => { if (nodeRef.current) nodeRef.current.textContent = `${prefix}${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; },
    });
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
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
    onClick={onClose}
    style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
      transition={{ duration: 0.22, ease }}
      onClick={e => e.stopPropagation()}
      style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '32px', maxWidth: '500px', width: '90%', boxShadow: '0px 24px 48px rgba(0,0,0,0.12)', position: 'relative' }}
    >
      <CloseButton onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px' }} />
      {children}
    </motion.div>
  </motion.div>
);
};

// ─── Checkbox ─────────────────────────────────────────────────────────────────

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

// ─── Dropdown Menu ────────────────────────────────────────────────────────────

type DropdownItems = { label: string; icon?: React.ReactNode; danger?: boolean; onClick: () => void }[];
const DropdownMenu: React.FC<{ items: DropdownItems; style?: React.CSSProperties }> = ({ items, style }) => (
  <SharedDropdownMenu items={items} style={style} />
);

// ─── Hero Banner ──────────────────────────────────────────────────────────────

const HeroBanner: React.FC<{ entries: IncomeEntry[] }> = ({ entries }) => {
  const total = entries.reduce((s, e) => s + parseFloat(e.amount.replace(/[^0-9.]/g, '')), 0);
  const received = entries.filter(e => e.status === 'received').reduce((s, e) => s + parseFloat(e.amount.replace(/[^0-9.]/g, '')), 0);
  const pending = entries.filter(e => e.status === 'pending').reduce((s, e) => s + parseFloat(e.amount.replace(/[^0-9.]/g, '')), 0);
  const scheduled = entries.filter(e => e.status === 'scheduled').reduce((s, e) => s + parseFloat(e.amount.replace(/[^0-9.]/g, '')), 0);

  const fmt = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05, ease }}
      style={{ border: '1px solid rgba(208,213,221,0.5)', borderRadius: '8px', padding: '28px 32px', marginBottom: '20px', backgroundColor: '#fff', position: 'relative', overflow: 'hidden' }}
    >
      {/* Subtle background tint */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 75% 50%, rgba(21,150,0,0.03) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>

        {/* Left — Big number */}
        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontFamily: font, color: '#888', letterSpacing: '-0.01em' }}>Total Income · December 2023</span>
            <div style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(21,150,0,0.08)' }}>
              <span style={{ fontSize: '11px', fontFamily: font, color: '#159600', fontWeight: 500 }}>▲ 12.7%</span>
            </div>
          </div>
          <CountUp rawValue={`$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            style={{ fontSize: '48px', fontFamily: font, letterSpacing: '-1.5px', color: '#000', lineHeight: 1.05, display: 'block' }} />
          <div style={{ marginTop: '6px', fontSize: '13px', fontFamily: font, color: '#888' }}>
            <span style={{ color: '#159600', fontWeight: 500 }}>↑ $1,540</span>&nbsp; more than November
          </div>
        </div>

        {/* Center — Sparkline */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', paddingTop: '6px' }}>
          <Sparkline values={HERO_SPARK_VALUES} color="#159600" gradId="hero-spark" w={180} h={56} strokeWidth={2} delay={0.3} fillOpacity={0} />
          <span style={{ fontSize: '11px', fontFamily: font, color: '#bbb', letterSpacing: '0.02em' }}>8-MONTH TREND</span>
        </div>

        {/* Right — Goal arc */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', paddingTop: '2px' }}>
          <GoalArc current={total} goal={INCOME_GOAL} />
        </div>
      </div>

      {/* Bottom strip — quick stats */}
      <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(208,213,221,0.35)', display: 'flex', gap: '0', flexWrap: 'wrap' }}>
        {[
          { label: 'Received',  value: fmt(received),  color: '#159600', icon: '✓' },
          { label: 'Pending',   value: fmt(pending),   color: '#C07800', icon: '◑' },
          { label: 'Scheduled', value: fmt(scheduled), color: '#888',    icon: '◷' },
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

// ─── KPI Stat Card (with mini sparkline) ──────────────────────────────────────

const IncomeStatCard: React.FC<typeof KPI_CARDS[0] & { index: number; onClick: () => void }> = ({ title, amount, subtext, percentage, isPositive, icon, sparkValues, uid, index, onClick }) => {
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
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
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
        <Sparkline values={sparkValues} color={color} gradId={`kpi-${uid}`} w={80} h={22} strokeWidth={1.5} delay={0.3 + index * 0.07} fillOpacity={0} />
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

// ─── Top Earners Card ─────────────────────────────────────────────────────────

const TopEarnersCard: React.FC<{ entries: IncomeEntry[] }> = ({ entries }) => {
  const earners = useMemo(() => {
    const map = new Map<string, { logo: string; logoBg: string; total: number }>();
    entries.forEach(e => {
      const num = parseFloat(e.amount.replace(/[^0-9.]/g, ''));
      const ex = map.get(e.source);
      if (ex) ex.total += num;
      else map.set(e.source, { logo: e.logo, logoBg: e.logoBg, total: num });
    });
    return [...map.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.total - a.total);
  }, [entries]);

  const topVal = earners[0]?.total ?? 1;
  const fmt = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div style={{ flex: '0 0 240px', minWidth: '220px', backgroundColor: '#FFF', border: '1px solid rgba(208,213,221,0.5)', borderRadius: '8px', padding: '25px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        {/* trophy icon inline */}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 9.5C4.79 9.5 3 7.71 3 5.5V2h8v3.5C11 7.71 9.21 9.5 7 9.5Z" stroke="#888" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 3H1.5C1.5 3 1 5.5 3 6.5M11 3h1.5C12.5 3 13 5.5 11 6.5" stroke="#888" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M7 9.5V11.5M5 12h4" stroke="#888" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <span style={{ fontSize: '16px', fontFamily: font, fontWeight: 500 }}>Top Earners</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        {earners.slice(0, 4).map((earner, i) => {
          const barPct = (earner.total / topVal) * 100;
          return (
            <motion.div key={earner.name}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.06, ease }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: earner.logoBg, border: earner.logoBg === 'rgba(255,255,255,1)' ? '1px solid rgba(0,0,0,0.8)' : 'none', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <img src={earner.logo} alt="" style={{ width: '10px' }} />
                </div>
                <span style={{ fontSize: '12px', fontFamily: font, color: '#000', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{earner.name}</span>
                <span style={{ fontSize: '12px', fontFamily: font, color: '#000', fontWeight: 500, flexShrink: 0 }}>{fmt(earner.total)}</span>
              </div>
              <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(208,213,221,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${barPct}%` }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.07, ease }}
                  style={{ height: '100%', backgroundColor: i === 0 ? '#377CF6' : i === 1 ? '#4F46E5' : i === 2 ? '#C07800' : '#EA580C', borderRadius: '4px' }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Income Trend Chart (with line overlay) ───────────────────────────────────

const IncomeTrendChart: React.FC<{ data: { label: string; income: number }[]; animKey: string }> = ({ data, animKey }) => {
  const chartH = 200;
  const pathRef = useRef<SVGPathElement>(null);
  const yMax = Math.max(...data.map(d => d.income));
  const yMaxR = Math.ceil(yMax / 1000) * 1000 || 5000;
  const yLabels = [yMaxR, yMaxR * 0.8, yMaxR * 0.6, yMaxR * 0.4, yMaxR * 0.2, 0];
  const fmt = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : String(v);

  const lineD = buildSparkPath(data.map(d => d.income), 400, chartH);

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const l = el.getTotalLength();
    el.style.strokeDasharray = String(l);
    el.style.strokeDashoffset = String(l);
    const ctrl = animate(l, 0, {
      duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.35,
      onUpdate: v => { if (pathRef.current) pathRef.current.style.strokeDashoffset = String(v); },
    });
    return () => ctrl.stop();
  }, [lineD]);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '36px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: `${chartH}px` }}>
          {yLabels.map(v => <span key={v} style={{ fontSize: '11px', color: '#888', fontFamily: font, textAlign: 'right', display: 'block', lineHeight: 1 }}>{fmt(v)}</span>)}
        </div>
        <div style={{ flex: 1, marginLeft: '16px', height: `${chartH}px`, position: 'relative' }}>
          {/* Grid lines */}
          {yLabels.map((_, i) => <div key={i} style={{ position: 'absolute', top: `${i / (yLabels.length - 1) * 100}%`, left: 0, right: 0, height: '1px', backgroundColor: '#F2F4F7' }} />)}
          {/* Bars */}
          <div key={animKey} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            {data.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-end', flex: 1, justifyContent: 'center' }}>
                <motion.div
                  initial={{ height: 0 }} animate={{ height: `${d.income / yMaxR * chartH}px` }}
                  transition={{ duration: 0.5, delay: 0.05 + i * 0.035, ease }}
                  style={{ width: '12px', background: 'linear-gradient(180deg, #4C9EFF 0%, #377CF6 100%)', borderRadius: '3px 3px 0 0' }}
                  onMouseEnter={e => ((e.currentTarget.style.background = 'linear-gradient(180deg, #2D7EE0 0%, #1D5EBF 100%)'))}
                  onMouseLeave={e => ((e.currentTarget.style.background = 'linear-gradient(180deg, #4C9EFF 0%, #377CF6 100%)'))}
                />
              </div>
            ))}
          </div>
          {/* Line overlay */}
          <svg
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
            width="100%" height="100%"
            viewBox={`0 0 400 ${chartH}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="line-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#377CF6" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#377CF6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${lineD} L 400 ${chartH} L 0 ${chartH} Z`} fill="url(#line-grad)" />
            <path ref={pathRef} d={lineD} fill="none" stroke="rgba(55,124,246,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div style={{ display: 'flex', marginTop: '10px', paddingLeft: '52px' }}>
        {data.map(d => <div key={d.label} style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: '#888', fontFamily: font }}>{d.label}</div>)}
      </div>
    </div>
  );
};

// ─── Income Sources Panel ─────────────────────────────────────────────────────

function buildSourceCategories(month: string) {
  const vals = SOURCE_MONTH_VALS[month] ?? SOURCE_MONTH_VALS.January;
  const total = vals.reduce((s, v) => s + v, 0);
  const trends = ['+8.2%', '+0.0%', '+12.4%', '-3.1%', '+2.0%'];
  const trendClr = ['#377CF6', 'rgba(0,0,0,0.35)', '#4F46E5', '#E42C2C', '#0E7490'];
  return SOURCE_BASE.map((b, i) => ({ ...b, val: `+$${vals[i]}`, pct: `${((vals[i] / total) * 100).toFixed(1)}%`, trend: trends[i], trendColor: trendClr[i] }));
}
function buildSourceConic(cats: ReturnType<typeof buildSourceCategories>) {
  const total = cats.reduce((s, c) => s + Math.abs(parseFloat(c.pct)), 0);
  let cur = 0;
  return `conic-gradient(${cats.map(c => { const sh = Math.abs(parseFloat(c.pct)) / total * 360; const st = `${c.color} ${cur.toFixed(1)}deg ${(cur + sh).toFixed(1)}deg`; cur += sh; return st; }).join(', ')})`;
}

const SourcePanelViewAllToggle: React.FC<{ showAll: boolean; onToggle: () => void }> = ({ showAll, onToggle }) => {
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

const IncomeSourcesPanel: React.FC<{ month: string; onMonthChange: (m: string) => void }> = ({ month, onMonthChange }) => {
  const [showAll, setShowAll] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setShowMenu(false));
  const cats = buildSourceCategories(month);
  const visible = showAll ? cats : cats.slice(0, 4);

  return (
    <div style={{ flex: '0 0 280px', minWidth: '260px', backgroundColor: '#FFF', border: '1px solid rgba(208,213,221,0.5)', borderRadius: '8px', padding: '25px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '16px', fontFamily: font, fontWeight: 500 }}>By Source</span>
        <div ref={menuRef} style={{ position: 'relative' }}>
          <DropdownTriggerButton onClick={() => setShowMenu(v => !v)} style={{ padding: '6px 14px', fontSize: '13px', boxShadow: '0px 1px 2px rgba(16,24,40,0.05)' }}>
            {month.slice(0, 3)}
            <motion.img animate={{ rotate: showMenu ? 180 : 0 }} transition={{ duration: 0.2 }}
              src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/75edc13f-6ea6-4659-b53b-40b5db2828b7.svg" alt="" style={{ width: '18px' }} />
          </DropdownTriggerButton>
          <AnimatePresence>
            {showMenu && <DropdownMenu style={{ top: '36px', right: 0, minWidth: '120px' }} items={SOURCE_MONTHS_LIST.map(m => ({ label: m, onClick: () => { onMonthChange(m); setShowMenu(false); } }))} />}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
        <motion.div key={month} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.7, ease }}
          style={{ width: '96px', height: '96px', borderRadius: '50%', background: buildSourceConic(cats), position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '48px', height: '48px', backgroundColor: '#FFF', borderRadius: '50%' }} />
        </motion.div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        <AnimatePresence mode="popLayout">
          {visible.map((item, idx) => (
            <motion.div key={item.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2, delay: idx * 0.03 }}
              style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '100px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }} />
                <span style={{ fontFamily: font, color: '#000', whiteSpace: 'nowrap' }}>{item.label}</span>
              </div>
              <span style={{ fontFamily: font, color: '#000', minWidth: '36px', textAlign: 'right' }}>{item.val}</span>
              <span style={{ color: '#888', fontFamily: font, minWidth: '34px', textAlign: 'right' }}>({item.pct})</span>
              <span style={{ color: item.trendColor, fontFamily: font, minWidth: '36px', textAlign: 'right' }}>{item.trend}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <SourcePanelViewAllToggle showAll={showAll} onToggle={() => setShowAll(v => !v)} />
    </div>
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
      <Sparkline values={card.sparkValues} color={card.isPositive ? '#159600' : '#E42C2C'} gradId={`modal-${card.uid}`} w={300} h={60} strokeWidth={2} delay={0.2} fillOpacity={0} />
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
    <div style={{ width: '100%' }}>
      <SlidingTextSwapButton variant="primary" label="Done" onClick={onClose} style={{ width: '100%', padding: '10px 20px' }} />
    </div>
  </Overlay>
);

// ─── Income Detail Modal ──────────────────────────────────────────────────────

const IncomeDetailModal: React.FC<{ entry: IncomeEntry; onClose: () => void; onEdit: () => void }> = ({ entry, onClose, onEdit }) => {
  const sc = STATUS_CONFIG[entry.status];
  const cc = CATEGORY_COLORS[entry.category];
  return (
    <Overlay onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div style={{ width: '36px', height: '36px', backgroundColor: entry.logoBg, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: entry.logoBg === 'rgba(255,255,255,1)' ? '1px solid #000' : 'none', flexShrink: 0 }}>
          <img src={entry.logo} alt="" style={{ maxWidth: '22px', maxHeight: '22px' }} />
        </div>
        <div>
          <div style={{ fontSize: '16px', fontFamily: font, fontWeight: 500, color: '#000', letterSpacing: '-0.3px' }}>{entry.source}</div>
          <div style={{ display: 'inline-flex', marginTop: '4px', padding: '2px 8px', borderRadius: '3px', backgroundColor: cc.bg }}>
            <span style={{ fontSize: '12px', fontFamily: font, color: cc.text }}>{entry.category}</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {[{ label: 'Amount', value: entry.amount, color: '#159600' }, { label: 'Date', value: entry.date }, { label: 'Status', value: sc.label, color: sc.color }, { label: 'Recurring', value: entry.recurring ?? '—' }].map(({ label, value, color }) => (
          <div key={label}>
            <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '15px', fontFamily: font, color: color ?? '#000', fontWeight: 500 }}>{value}</div>
          </div>
        ))}
      </div>
      {entry.contact && <div style={{ marginBottom: '14px' }}><div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '4px' }}>Contact</div><div style={{ fontSize: '14px', fontFamily: font, color: '#000' }}>{entry.contact}</div></div>}
      {entry.notes && <div style={{ padding: '12px 16px', backgroundColor: '#F8F8F9', borderRadius: '8px', marginBottom: '20px' }}><div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '4px' }}>Notes</div><div style={{ fontSize: '14px', fontFamily: font, color: '#444', lineHeight: 1.5 }}>{entry.notes}</div></div>}
      <div style={{ height: '1px', backgroundColor: '#EEEEEE', marginBottom: '20px' }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <SlidingTextSwapButton variant="secondary" label="Close" onClick={onClose} />
        <SlidingTextSwapButton variant="primary" label="Edit" onClick={onEdit} />
      </div>
    </Overlay>
  );
};

// ─── Income Form Modal ────────────────────────────────────────────────────────

const IncomeFormModal: React.FC<{ title: string; initialData: IncomeFormData; onSave: (d: IncomeFormData) => void; onClose: () => void }> = ({ title, initialData, onSave, onClose }) => {
  const [form, setForm] = useState<IncomeFormData>(initialData);
  const set = (f: keyof IncomeFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [f]: e.target.value }));
  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid rgba(208,213,221,0.9)', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: font, color: '#000', transition: 'border-color 0.15s' };
  const fi = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = '#000');
  const fo = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = 'rgba(208,213,221,0.9)');
  const lbl = (t: string) => <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '5px' }}>{t}</div>;

  return (
    <Overlay onClose={onClose}>
      <div style={{ fontSize: '17px', fontFamily: font, fontWeight: 500, marginBottom: '20px', letterSpacing: '-0.34px' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '62vh', overflowY: 'auto', paddingRight: '4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>{lbl('Source / Company')}<input style={inputStyle} value={form.source} onChange={set('source')} placeholder="e.g. Acme Corp" onFocus={fi} onBlur={fo} /></div>
          <div>{lbl('Amount')}<input style={inputStyle} value={form.amount} onChange={set('amount')} placeholder="+$1,200.00" onFocus={fi} onBlur={fo} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>{lbl('Date')}<input style={inputStyle} value={form.date} onChange={set('date')} placeholder="5 Dec, 2023" onFocus={fi} onBlur={fo} /></div>
          <div>{lbl('Category')}<select style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} value={form.category} onChange={set('category')} onFocus={fi} onBlur={fo}>{INCOME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>{lbl('Status')}<select style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} value={form.status} onChange={set('status')} onFocus={fi} onBlur={fo}><option value="received">Received</option><option value="pending">Pending</option><option value="scheduled">Scheduled</option></select></div>
          <div>{lbl('Recurring')}<select style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} value={form.recurring} onChange={set('recurring')} onFocus={fi} onBlur={fo}><option value="">One-time</option><option value="Weekly">Weekly</option><option value="Monthly">Monthly</option><option value="Quarterly">Quarterly</option><option value="Annually">Annually</option></select></div>
        </div>
        <div>{lbl('Contact (optional)')}<input style={inputStyle} value={form.contact} onChange={set('contact')} placeholder="e.g. Jane Smith" onFocus={fi} onBlur={fo} /></div>
        <div>{lbl('Notes (optional)')}<textarea style={{ ...inputStyle, minHeight: '68px', resize: 'vertical' }} value={form.notes} onChange={set('notes')} onFocus={fi} onBlur={fo} /></div>
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
        <SlidingTextSwapButton variant="secondary" label="Cancel" onClick={onClose} />
        <SlidingTextSwapButton
          variant="primary"
          label="Save"
          disabled={!form.source.trim() || !form.amount.trim()}
          onClick={() => form.source.trim() && form.amount.trim() && onSave(form)}
        />
      </div>
    </Overlay>
  );
};

// ─── Income Row (expandable) ──────────────────────────────────────────────────

const IncomeRow: React.FC<{
  entry: IncomeEntry;
  index: number;
  checked: boolean;
  expanded: boolean;
  onCheck: (v: boolean) => void;
  onToggleExpand: () => void;
  onDetails: () => void;
  onEdit: () => void;
  onMarkReceived: () => void;
}> = ({ entry, checked, expanded, onCheck, onToggleExpand, onDetails, onEdit, onMarkReceived }) => {
  const sc = STATUS_CONFIG[entry.status];
  const cc = CATEGORY_COLORS[entry.category];
  const [sourceHover, setSourceHover] = useState(false);
  const [dateHover, setDateHover] = useState(false);
  const [editHover, setEditHover] = useState(false);
  const [detailsHover, setDetailsHover] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0, backgroundColor: checked ? 'rgba(55,124,246,0.04)' : 'rgba(255,255,255,0)' }}
      exit={{ opacity: 0, x: 80, filter: 'blur(3px)', height: 0, paddingTop: 0, paddingBottom: 0, borderBottomWidth: 0 }}
      transition={{ opacity: { duration: 0.22, ease: 'easeOut' }, x: { duration: 0.28, ease: [0.4, 0, 1, 1] }, height: { duration: 0.22, delay: 0.18, ease: 'easeInOut' } }}
      style={{ borderBottom: '1px solid rgba(208,213,221,0.2)', overflow: 'hidden' }}
      onMouseEnter={e => !checked && !expanded && (e.currentTarget.style.backgroundColor = 'rgba(248,248,249,0.6)')}
      onMouseLeave={e => !checked && !expanded && (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '13px 25px', cursor: 'pointer' }} onClick={onToggleExpand}>
        {/* Checkbox */}
        <div style={{ width: '34px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <Checkbox checked={checked} onChange={onCheck} stopClick />
        </div>

        {/* Expand caret */}
        <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.18 }} style={{ width: '18px', marginRight: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M3 2L7 5L3 8" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>

        {/* Source */}
        <div style={{ width: '220px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px', marginRight: '20px' }}>
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
            onMouseEnter={() => setSourceHover(true)}
            onMouseLeave={() => setSourceHover(false)}
            style={{ fontSize: '14px', color: '#000', fontFamily: font, cursor: 'pointer', minWidth: 0 }}
          >
            <span style={{ position: 'relative', display: 'inline-block', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
              {entry.source}
              <motion.span
                initial={false}
                animate={{ scaleX: sourceHover ? 1 : 0 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'absolute', left: 0, right: 0, bottom: '2px', height: '1px', backgroundColor: '#000', transformOrigin: 'left' }}
              />
            </span>
          </span>
        </div>

        {/* Date */}
        <div style={{ width: '130px', flexShrink: 0, marginRight: '18px' }}>
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
        <div style={{ width: '154px', flexShrink: 0, marginRight: '18px' }}>
          <span style={{ display: 'inline-flex', padding: '3px 9px', borderRadius: '3px', backgroundColor: cc.bg }}>
            <span style={{ fontSize: '12px', fontFamily: font, color: cc.text, whiteSpace: 'nowrap' }}>{entry.category}</span>
          </span>
        </div>

        {/* Amount */}
        <div style={{ width: '118px', flexShrink: 0, marginRight: '18px' }}>
          <span style={{ fontSize: '14px', color: '#159600', fontFamily: font, fontWeight: 400 }}>{entry.amount}</span>
        </div>

        {/* Recurring */}
        <div style={{ width: '100px', flexShrink: 0, marginRight: '18px' }}>
          {entry.recurring
            ? <span style={{ fontSize: '12px', fontFamily: font, color: '#444', display: 'flex', alignItems: 'center', gap: '4px' }}><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5A3.5 3.5 0 1 0 5 1.5" stroke="#888" strokeWidth="1.2" strokeLinecap="round"/><path d="M5 1.5 3.5 0 3.5 3" stroke="#888" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>{entry.recurring}</span>
            : <span style={{ fontSize: '12px', fontFamily: font, color: '#ccc' }}>—</span>
          }
        </div>

        {/* Status */}
        <div style={{ width: '124px', flexShrink: 0 }}>
          <span style={{ display: 'inline-flex', padding: '4px 12px', backgroundColor: sc.bg, border: `1px solid ${sc.border}`, borderRadius: '100px', color: sc.color, fontSize: '12px', fontFamily: font }}>
            {sc.label}
          </span>
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
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ height: { duration: 0.22, ease: 'easeInOut' }, opacity: { duration: 0.18 } }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ margin: '0 25px 14px 62px', padding: '14px 18px', borderRadius: '8px', backgroundColor: sc.accentBg, borderLeft: `3px solid ${sc.border}`, display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {entry.notes && (
                <div style={{ flex: 2, minWidth: '180px' }}>
                  <div style={{ fontSize: '11px', fontFamily: font, color: '#888', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</div>
                  <div style={{ fontSize: '13px', fontFamily: font, color: '#333', lineHeight: 1.5 }}>{entry.notes}</div>
                </div>
              )}
              {entry.contact && (
                <div style={{ minWidth: '100px' }}>
                  <div style={{ fontSize: '11px', fontFamily: font, color: '#888', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</div>
                  <div style={{ fontSize: '13px', fontFamily: font, color: '#333' }}>{entry.contact}</div>
                </div>
              )}
              {entry.recurring && (
                <div style={{ minWidth: '80px' }}>
                  <div style={{ fontSize: '11px', fontFamily: font, color: '#888', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recurring</div>
                  <div style={{ fontSize: '13px', fontFamily: font, color: '#333' }}>{entry.recurring}</div>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                {entry.status === 'pending' && (
                  <motion.button whileTap={{ scale: 0.97 }} onClick={onMarkReceived}
                    style={{ padding: '6px 14px', border: '1px solid rgba(21,150,0,0.7)', borderRadius: '6px', background: 'rgba(21,150,0,0.06)', color: '#159600', fontSize: '13px', fontFamily: font, cursor: 'pointer' }}>
                    Mark Received
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

const FloatingActionBar: React.FC<{
  count: number;
  onClear: () => void;
  onMarkReceived: () => void;
  onDelete: () => void;
}> = ({ count, onClear, onMarkReceived, onDelete }) => {
  const uid = useId();
  return (
    <motion.div
      key={uid}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.96 }}
      transition={{ duration: 0.22, ease }}
      style={{ position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)', zIndex: 150, display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: '#111', borderRadius: '12px', boxShadow: '0px 8px 32px rgba(0,0,0,0.24)', whiteSpace: 'nowrap' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '12px', borderRight: '1px solid rgba(255,255,255,0.12)', marginRight: '6px' }}>
        <div style={{ width: '18px', height: '18px', backgroundColor: '#377CF6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '11px', color: '#fff', fontFamily: font, fontWeight: 600, lineHeight: 1 }}>{count}</span>
        </div>
        <span style={{ fontSize: '13px', fontFamily: font, color: 'rgba(255,255,255,0.7)' }}>selected</span>
      </div>

      {[
        { label: 'Mark Received', onClick: onMarkReceived, color: 'rgba(255,255,255,0.88)' },
        { label: 'Export CSV',    onClick: onClear,         color: 'rgba(255,255,255,0.88)' },
      ].map(({ label, onClick, color }) => (
        <motion.button key={label} whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.96 }} onClick={onClick}
          style={{ padding: '6px 12px', background: 'none', border: 'none', borderRadius: '6px', color, fontSize: '13px', fontFamily: font, cursor: 'pointer' }}>
          {label}
        </motion.button>
      ))}

      <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.12)', margin: '0 4px' }} />

      <motion.button whileHover={{ backgroundColor: 'rgba(228,44,44,0.18)' }} whileTap={{ scale: 0.96 }} onClick={onDelete}
        style={{ padding: '6px 12px', background: 'none', border: 'none', borderRadius: '6px', color: '#FF6B6B', fontSize: '13px', fontFamily: font, cursor: 'pointer' }}>
        Delete
      </motion.button>

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

// ─── Main IncomesContent ──────────────────────────────────────────────────────

export const IncomesContent: React.FC = () => {
  const [entries, setEntries] = useState<IncomeEntry[]>(INITIAL_ENTRIES);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [chartPeriod, setChartPeriod] = useState<IncomePeriod>('Yearly');
  const [showChartMenu, setShowChartMenu] = useState(false);
  const [sourceMonth, setSourceMonth] = useState('January');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<IncomeCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<IncomeStatus | 'All'>('All');
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [showStatMenu, setShowStatMenu] = useState(false);
  const [detailEntry, setDetailEntry] = useState<IncomeEntry | null>(null);
  const [editEntry, setEditEntry] = useState<IncomeEntry | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [kpiDetail, setKpiDetail] = useState<typeof KPI_CARDS[0] | null>(null);
  const [addHover, setAddHover] = useState(false);
  const [pillHover, setPillHover] = useState<IncomeCategory | null>(null);

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

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return entries.filter(e => {
      const matchQ = !q || e.source.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || (e.notes ?? '').toLowerCase().includes(q) || (e.contact ?? '').toLowerCase().includes(q);
      const matchCat = categoryFilter === 'All' || e.category === categoryFilter;
      const matchStat = statusFilter === 'All' || e.status === statusFilter;
      return matchQ && matchCat && matchStat;
    });
  }, [entries, searchQuery, categoryFilter, statusFilter]);

  const allSelected = filtered.length > 0 && filtered.every(e => selectedRows.has(e.id));
  const toggleAll = () => allSelected ? setSelectedRows(new Set()) : setSelectedRows(new Set(filtered.map(e => e.id)));
  const toggleRow = (id: number, v: boolean) => {
    const next = new Set(selectedRows);
    v ? next.add(id) : next.delete(id);
    setSelectedRows(next);
  };

  const handleMarkReceived = (id?: number) => {
    if (id !== undefined) {
      setEntries(prev => prev.map(e => e.id === id ? { ...e, status: 'received' } : e));
    } else {
      setEntries(prev => prev.map(e => selectedRows.has(e.id) ? { ...e, status: 'received' } : e));
      setSelectedRows(new Set());
    }
  };
  const deleteSelected = () => {
    setEntries(prev => prev.filter(e => !selectedRows.has(e.id)));
    setSelectedRows(new Set());
  };

  const handleAdd = (form: IncomeFormData) => {
    const id = Math.max(0, ...entries.map(e => e.id)) + 1;
    setEntries(prev => [{
      id, source: form.source,
      logo: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/f4f353a7-30fa-4422-a2a3-a40095dbb40c.svg',
      logoBg: 'rgba(255,255,255,1)', date: form.date || '—',
      category: form.category, amount: form.amount.startsWith('+') ? form.amount : `+${form.amount}`,
      status: form.status, recurring: form.recurring || undefined,
      notes: form.notes || undefined, contact: form.contact || undefined,
    }, ...prev]);
    setShowAddModal(false);
  };

  const handleEdit = (form: IncomeFormData) => {
    if (!editEntry) return;
    setEntries(prev => prev.map(e => e.id === editEntry.id ? { ...e, source: form.source, date: form.date, category: form.category, amount: form.amount.startsWith('+') ? form.amount : `+${form.amount}`, status: form.status, recurring: form.recurring || undefined, notes: form.notes || undefined, contact: form.contact || undefined } : e));
    setEditEntry(null);
    setDetailEntry(null);
  };

  const chartData = INCOME_CHART_DATA[chartPeriod];

  // Category quick-filter pills (unique categories in current entries)
  const activeCatCounts = useMemo(() => {
    const m = new Map<IncomeCategory, number>();
    entries.forEach(e => m.set(e.category, (m.get(e.category) ?? 0) + 1));
    return m;
  }, [entries]);

  return (
    <motion.div
      key="incomes"
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.3, ease }}
      style={{ overflowY: 'auto', flex: 1 }}
    >
      {/* ── Hero Banner ── */}
      <HeroBanner entries={entries} />

      {/* ── KPI Cards ── */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', paddingTop: '10px', marginTop: '-10px', overflow: 'visible' }}>
        {KPI_CARDS.map((card, i) => (
          <IncomeStatCard key={card.title} {...card} index={i} onClick={() => setKpiDetail(card)} />
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>

        {/* Trend Chart */}
        <div style={{ flex: '2', minWidth: '340px', backgroundColor: '#FFF', border: '1px solid rgba(208,213,221,0.5)', borderRadius: '8px', padding: '25px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '16px', fontFamily: font, fontWeight: 500 }}>Income Trend</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'linear-gradient(180deg,#4C9EFF,#377CF6)' }} />
                  <span style={{ fontSize: '12px', fontFamily: font, color: '#888' }}>Income</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '16px', height: '1.5px', backgroundColor: 'rgba(55,124,246,0.7)' }} />
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
                {showChartMenu && (
                  <DropdownMenu style={{ top: '38px', right: 0 }}
                    items={(['Yearly', 'Quarterly', 'Monthly'] as IncomePeriod[]).map(p => ({ label: p, onClick: () => { setChartPeriod(p); setShowChartMenu(false); } }))} />
                )}
              </AnimatePresence>
            </div>
          </div>
          <IncomeTrendChart data={chartData} animKey={chartPeriod} />
        </div>

        {/* Income Sources */}
        <IncomeSourcesPanel month={sourceMonth} onMonthChange={setSourceMonth} />

        {/* Top Earners */}
        <TopEarnersCard entries={entries} />
      </div>

      {/* ── Income Ledger ── */}
      <div style={{ border: '1px solid rgba(208,213,221,0.5)', borderRadius: '8px', backgroundColor: '#FFF', marginBottom: '24px' }}>

        {/* Ledger header */}
        <div style={{ padding: '18px 25px', borderBottom: '1px solid rgba(208,213,221,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '17px', fontFamily: font, fontWeight: 500 }}>Income Ledger</span>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddModal(true)}
            onMouseEnter={() => setAddHover(true)}
            onMouseLeave={() => setAddHover(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 15px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontFamily: font, fontWeight: 400 }}
          >
            <motion.svg width="17" height="17" viewBox="0 0 24 24" fill="none" animate={{ rotate: addHover ? 180 : 0 }} transition={{ type: 'spring', stiffness: 100, damping: 15 }}>
              <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
            Add Income
          </motion.button>
        </div>

        {/* Search + filter bar */}
        <div style={{ padding: '12px 25px', borderBottom: '1px solid rgba(208,213,221,0.2)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px', border: '1px solid rgba(208,213,221,0.5)', borderRadius: '8px', boxShadow: '0px 1px 2px rgba(16,24,40,0.05)' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, color: searchQuery.trim() ? '#444' : '#98A2B3' }}>
                <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.4" />
                <path d="M8.5 8.5L11 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input type="text" placeholder="Search income…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
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
                  border: `1px solid ${categoryFilter !== 'All' ? 'rgba(21,150,0,0.5)' : 'rgba(208,213,221,0.5)'}`,
                  background: categoryFilter !== 'All' ? 'rgba(21,150,0,0.05)' : '#fff',
                  boxShadow: '0px 1px 2px rgba(16,24,40,0.05)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 3h10M3 6h6M5 9h2" stroke={categoryFilter !== 'All' ? '#159600' : '#666'} strokeWidth="1.3" strokeLinecap="round"/></svg>
                <span style={{ color: categoryFilter !== 'All' ? '#159600' : '#444', fontFamily: font }}>{categoryFilter === 'All' ? 'Category' : categoryFilter}</span>
                <motion.svg animate={{ rotate: showCatMenu ? 180 : 0 }} transition={{ duration: 0.2 }} width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 3.5L5 6.5L8 3.5" stroke={categoryFilter !== 'All' ? '#159600' : '#666'} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </motion.svg>
              </DropdownTriggerButton>
              <AnimatePresence>
                {showCatMenu && (
                  <DropdownMenu style={{ top: '40px', left: 0, minWidth: '160px' }}
                    items={[{ label: 'All Categories', onClick: () => { setCategoryFilter('All'); setShowCatMenu(false); } },
                      ...INCOME_CATEGORIES.map(c => ({ label: `${c} (${activeCatCounts.get(c) ?? 0})`, onClick: () => { setCategoryFilter(c); setShowCatMenu(false); } }))]} />
                )}
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
                {showStatMenu && (
                  <DropdownMenu style={{ top: '40px', left: 0, minWidth: '140px' }}
                    items={[{ label: 'All Statuses', onClick: () => { setStatusFilter('All'); setShowStatMenu(false); } },
                      ...(['received', 'pending', 'scheduled'] as IncomeStatus[]).map(s => ({ label: STATUS_CONFIG[s].label, onClick: () => { setStatusFilter(s); setShowStatMenu(false); } }))]} />
                )}
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
          {INCOME_CATEGORIES.map(cat => {
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
                <span style={{ position: 'relative', zIndex: 1, fontSize: '12px', fontFamily: font, color: accent ? cc.text : '#666', transition: 'color 0.18s ease' }}>{cat}</span>
                <span style={{ position: 'relative', zIndex: 1, fontSize: '10px', fontFamily: font, color: accent ? cc.text : '#aaa', lineHeight: 1, opacity: accent ? 0.92 : 1, transition: 'color 0.18s ease' }}>{count}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Table header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '11px 25px', color: '#888', fontSize: '13px', fontFamily: font, borderBottom: '1px solid rgba(208,213,221,0.2)', backgroundColor: 'rgba(248,248,249,0.5)' }}>
          <div style={{ width: '34px', flexShrink: 0 }}><Checkbox checked={allSelected} onChange={toggleAll} /></div>
          <div style={{ width: '18px', marginRight: '12px', flexShrink: 0 }} />
          {[
            { label: 'Source',    w: '220px', mr: '20px' },
            { label: 'Date',      w: '130px', mr: '18px' },
            { label: 'Category',  w: '154px', mr: '18px' },
            { label: 'Amount',    w: '118px', mr: '18px' },
            { label: 'Recurring', w: '100px', mr: '18px' },
            { label: 'Status',    w: '124px', mr: '0'    },
          ].map(col => (
            <div key={col.label} style={{ width: col.w, flexShrink: 0, marginRight: col.mr }}>{col.label}</div>
          ))}
        </div>

        {/* Table rows */}
        <AnimatePresence>
          {filtered.map((entry, i) => (
            <IncomeRow
              key={entry.id}
              entry={entry}
              index={i}
              checked={selectedRows.has(entry.id)}
              expanded={expandedRow === entry.id}
              onCheck={v => toggleRow(entry.id, v)}
              onToggleExpand={() => setExpandedRow(expandedRow === entry.id ? null : entry.id)}
              onDetails={() => setDetailEntry(entry)}
              onEdit={() => setEditEntry(entry)}
              onMarkReceived={() => handleMarkReceived(entry.id)}
            />
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ padding: '48px', textAlign: 'center', fontSize: '14px', fontFamily: font, color: '#888' }}>
            {searchQuery || categoryFilter !== 'All' || statusFilter !== 'All'
              ? 'No income entries match your filters.'
              : 'No income entries yet. Add your first income above.'}
          </motion.div>
        )}

        {/* Forecast footer (scheduled entries) */}
        {entries.some(e => e.status === 'scheduled') && (
          <div style={{ padding: '12px 25px', borderTop: '1px solid rgba(208,213,221,0.2)', backgroundColor: 'rgba(248,248,249,0.4)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="#888" strokeWidth="1.2"/><path d="M6.5 4v3l2 1.5" stroke="#888" strokeWidth="1.2" strokeLinecap="round"/></svg>
            <span style={{ fontSize: '12px', fontFamily: font, color: '#888' }}>
              Upcoming scheduled:{' '}
              <strong style={{ color: '#000', fontWeight: 500 }}>
                {entries.filter(e => e.status === 'scheduled').length} {entries.filter(e => e.status === 'scheduled').length === 1 ? 'payment' : 'payments'}&nbsp;·&nbsp;
                ${entries.filter(e => e.status === 'scheduled').reduce((s, e) => s + parseFloat(e.amount.replace(/[^0-9.]/g, '')), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
        {detailEntry && <IncomeDetailModal key="detail" entry={detailEntry} onClose={() => setDetailEntry(null)} onEdit={() => { setEditEntry(detailEntry); setDetailEntry(null); }} />}
      </AnimatePresence>
      <AnimatePresence>
        {editEntry && <IncomeFormModal key="edit" title="Edit Income" initialData={{ source: editEntry.source, amount: editEntry.amount, date: editEntry.date, category: editEntry.category, status: editEntry.status, recurring: editEntry.recurring ?? '', notes: editEntry.notes ?? '', contact: editEntry.contact ?? '' }} onSave={handleEdit} onClose={() => setEditEntry(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showAddModal && <IncomeFormModal key="add" title="Add Income" initialData={EMPTY_FORM} onSave={handleAdd} onClose={() => setShowAddModal(false)} />}
      </AnimatePresence>

      {/* Floating action bar */}
      <AnimatePresence>
        {selectedRows.size > 0 && (
          <FloatingActionBar
            key="fab"
            count={selectedRows.size}
            onClear={() => setSelectedRows(new Set())}
            onMarkReceived={() => handleMarkReceived()}
            onDelete={deleteSelected}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
