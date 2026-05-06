import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownTriggerButton,
  SlidingTextSwapButton,
  interactionEase,
} from './interactionPrimitives';

const font = '"Approach TRIAL", sans-serif';

const TABS = ['General', 'Display', 'Notifications', 'Data & Export', 'Security'] as const;
type TabId = (typeof TABS)[number];

const cardStyle: React.CSSProperties = {
  border: '1px solid rgba(208,213,221,0.5)',
  borderRadius: '12px',
  padding: '18px',
  backgroundColor: '#FFFFFF',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '280px',
  padding: '10px 14px',
  border: '1px solid #D0D5DD',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: font,
  color: '#111',
  boxSizing: 'border-box',
  outline: 'none',
};

function useClickOutside(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [ref, cb]);
}

/** Defined at module scope so React does not remount every switch on parent re-render (which caused sibling “reboot” flashes). */
const SettingsToggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <motion.button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    whileTap={{ scale: 0.97 }}
    transition={{ duration: 0.24, ease: interactionEase }}
    animate={{ backgroundColor: checked ? '#000' : '#D0D5DD' }}
    style={{
      width: '36px',
      height: '20px',
      borderRadius: '999px',
      border: 'none',
      cursor: 'pointer',
      padding: '0 2px',
      boxSizing: 'border-box',
    }}
  >
    <motion.div
      animate={{ marginLeft: checked ? 16 : 0 }}
      transition={{ duration: 0.24, ease: interactionEase }}
      style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff' }}
    />
  </motion.button>
);

/** Matches Profile drawer “Saved!” toast after saving personal details. */
const SAVED_ICON_STROKE = 1.5;
const SAVED_CIRCLE_R = 10;
const SAVED_CIRCLE_LEN = 2 * Math.PI * SAVED_CIRCLE_R;

const SettingsSavedNotification: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
    >
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ color: '#159600' }}>
        <g transform="rotate(-90 12 12)">
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

/** Lucide file-text paths — line animations sped up vs stock Lucide animated. */
const ExportPdfIcon: React.FC<{ size?: number; hovered: boolean }> = ({ size = 16, hovered }) => {
  const lineTransition = (delay: number) => ({
    duration: 0.42,
    delay,
    ease: 'easeOut' as const,
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'inherit' }}>
      <motion.div
        style={{ display: 'flex' }}
        animate={{ scale: hovered ? 1.04 : 1 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 2v4a2 2 0 0 0 2 2h4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {[
            { d: 'M10 9H8', key: 'a' },
            { d: 'M16 13H8', key: 'b' },
            { d: 'M16 17H8', key: 'c' },
          ].map(({ d, key }, i) => (
            <motion.path
              key={key}
              d={d}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              initial={false}
              animate={hovered ? 'animate' : 'normal'}
              variants={{
                normal: { pathLength: 1, opacity: 1 },
                animate: {
                  pathLength: [1, 0, 1],
                  transition: lineTransition(0.05 + i * 0.09),
                },
              }}
            />
          ))}
        </svg>
      </motion.div>
    </div>
  );
};

/** Lucide file-down — paper outline draws first; arrow draws in with overlapping timing. */
const ExportCsvIcon: React.FC<{ size?: number; hovered: boolean }> = ({ size = 16, hovered }) => {
  const ease = 'easeInOut' as const;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'inherit' }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.path
          d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={hovered ? 'draw' : 'rest'}
          variants={{
            rest: { pathLength: 1, opacity: 1 },
            draw: {
              pathLength: [0, 1],
              transition: { pathLength: { duration: 0.34, ease, delay: 0 } },
            },
          }}
        />
        <motion.path
          d="M14 2v4a2 2 0 0 0 2 2h4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={hovered ? 'draw' : 'rest'}
          variants={{
            rest: { pathLength: 1, opacity: 1 },
            draw: {
              pathLength: [0, 1],
              transition: { pathLength: { duration: 0.3, ease, delay: 0.08 } },
            },
          }}
        />
        <motion.path
          d="M12 18v-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={hovered ? 'draw' : 'rest'}
          variants={{
            rest: { pathLength: 1, opacity: 1 },
            draw: {
              pathLength: [0, 1],
              opacity: [0.35, 1],
              transition: {
                pathLength: { duration: 0.26, ease, delay: 0.1 },
                opacity: { duration: 0.2, ease, delay: 0.1 },
              },
            },
          }}
        />
        <motion.path
          d="m9 15 3 3 3-3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={hovered ? 'draw' : 'rest'}
          variants={{
            rest: { pathLength: 1, opacity: 1 },
            draw: {
              pathLength: [0, 1],
              opacity: [0.35, 1],
              transition: {
                pathLength: { duration: 0.3, ease, delay: 0.155 },
                opacity: { duration: 0.22, ease, delay: 0.155 },
              },
            },
          }}
        />
      </svg>
    </div>
  );
};

function SettingsSelect<T extends string>({
  value,
  options,
  onChange,
  maxWidth = '280px',
  /** Full width of the settings column (General). Display theme uses a fixed-width control in a row. */
  fullWidth = true,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  maxWidth?: string;
  fullWidth?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  const label = options.find(o => o.value === value)?.label ?? value;
  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        maxWidth,
        ...(fullWidth ? { width: '100%' } : { width: maxWidth, flexShrink: 0 }),
      }}
    >
      <DropdownTriggerButton
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: '14px',
          color: '#111',
        }}
      >
        <span style={{ fontFamily: font, textAlign: 'left', flex: 1, minWidth: 0 }}>{label}</span>
        <motion.svg
          width={10}
          height={10}
          viewBox="0 0 10 10"
          fill="none"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ flexShrink: 0 }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="#666" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </DropdownTriggerButton>
      <AnimatePresence>
        {open && (
          <DropdownMenu
            motionPreset="emphasized"
            style={{ top: 'calc(100% + 6px)', left: 0, right: 0, minWidth: '100%' }}
            items={options.map(o => ({
              label: o.label,
              onClick: () => {
                onChange(o.value);
                setOpen(false);
              },
            }))}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export const SettingsPage: React.FC<{ onToast?: (msg: string) => void; onChangePasswordClick?: () => void }> = ({
  onToast,
  onChangePasswordClick,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('General');
  const [toast, setToast] = useState<null | { type: 'saved' } | { type: 'text'; message: string }>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [exportCsvHover, setExportCsvHover] = useState(false);
  const [exportPdfHover, setExportPdfHover] = useState(false);

  const showToast = (message: string) => {
    setToast({ type: 'text', message });
    onToast?.(message);
  };

  const showSavedToast = () => {
    setToast({ type: 'saved' });
    onToast?.('Saved!');
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // General
  const [currency, setCurrency] = useState('USD');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [language, setLanguage] = useState('English');

  // Display
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
  const [compactView, setCompactView] = useState(false);

  // Notifications
  const [notifNewTx, setNotifNewTx] = useState(true);
  const [notifLowBalance, setNotifLowBalance] = useState(true);
  const [notifMonthly, setNotifMonthly] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

  const handleSave = () => {
    showSavedToast();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <h1 style={{ fontSize: '24px', fontFamily: font, fontWeight: 400, margin: '0 0 24px 0', letterSpacing: '-0.48px' }}>Settings</h1>

      <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '160px', flexShrink: 0 }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab;
            return (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                whileHover={isActive ? {} : { backgroundColor: 'rgba(0,0,0,0.04)' }}
                whileTap={{ scale: 0.97 }}
                animate={{ backgroundColor: isActive ? 'rgba(0,0,0,0.04)' : 'transparent' }}
                transition={{ duration: 0.15 }}
                style={{
                  padding: '10px 14px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontFamily: font,
                  color: isActive ? '#000' : '#666',
                  fontWeight: isActive ? 500 : 400,
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                {tab}
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
          {activeTab === 'General' && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div>
                <div style={{ fontSize: '14px', fontFamily: font, fontWeight: 500, color: '#000' }}>General</div>
                <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginTop: '2px' }}>Currency, date format, and language.</div>
              </div>
              <div style={{ height: '1px', backgroundColor: '#EEEEEE' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '6px', display: 'block' }}>Currency</label>
                  <SettingsSelect
                    value={currency}
                    onChange={setCurrency}
                    options={[
                      { value: 'USD', label: 'USD' },
                      { value: 'NGN', label: 'NGN' },
                      { value: 'EUR', label: 'EUR' },
                      { value: 'GBP', label: 'GBP' },
                    ]}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '6px', display: 'block' }}>Date format</label>
                  <SettingsSelect
                    value={dateFormat}
                    onChange={setDateFormat}
                    options={[
                      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                    ]}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '6px', display: 'block' }}>Language</label>
                  <SettingsSelect value={language} onChange={setLanguage} options={[{ value: 'English', label: 'English' }]} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Display' && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div>
                <div style={{ fontSize: '14px', fontFamily: font, fontWeight: 500, color: '#000' }}>Display</div>
                <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginTop: '2px' }}>Theme and density.</div>
              </div>
              <div style={{ height: '1px', backgroundColor: '#EEEEEE' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontFamily: font, fontWeight: 500, color: '#111' }}>Dark mode</div>
                    <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginTop: '2px' }}>System / Light / Dark</div>
                  </div>
                  <SettingsSelect
                    value={theme}
                    onChange={setTheme}
                    maxWidth="120px"
                    fullWidth={false}
                    options={[
                      { value: 'system', label: 'System' },
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                    ]}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontFamily: font, fontWeight: 500, color: '#111' }}>Compact view</div>
                    <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginTop: '2px' }}>Smaller fonts and tables</div>
                  </div>
                  <SettingsToggle checked={compactView} onChange={setCompactView} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Notifications' && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div>
                <div style={{ fontSize: '14px', fontFamily: font, fontWeight: 500, color: '#000' }}>Notifications</div>
                <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginTop: '2px' }}>Email and push preferences.</div>
              </div>
              <div style={{ height: '1px', backgroundColor: '#EEEEEE' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'New transaction', desc: 'When a new transaction is recorded', value: notifNewTx, set: setNotifNewTx },
                  { label: 'Low balance', desc: 'When balance falls below a threshold', value: notifLowBalance, set: setNotifLowBalance },
                  { label: 'Monthly summary', desc: 'End-of-month email summary', value: notifMonthly, set: setNotifMonthly },
                ].map(({ label, desc, value, set }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontFamily: font, fontWeight: 500, color: '#111' }}>{label}</div>
                      <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginTop: '2px' }}>{desc}</div>
                    </div>
                    <SettingsToggle checked={value} onChange={set} />
                  </div>
                ))}
                <div style={{ height: '1px', backgroundColor: '#EEEEEE', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontFamily: font, fontWeight: 500, color: '#111' }}>Push notifications</div>
                    <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginTop: '2px' }}>Browser push (if enabled)</div>
                  </div>
                  <SettingsToggle checked={pushEnabled} onChange={setPushEnabled} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Data & Export' && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div>
                <div style={{ fontSize: '14px', fontFamily: font, fontWeight: 500, color: '#000' }}>Data & Export</div>
                <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginTop: '2px' }}>Export or import your data.</div>
              </div>
              <div style={{ height: '1px', backgroundColor: '#EEEEEE' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => showToast('Exporting as CSV…')}
                    onMouseEnter={() => setExportCsvHover(true)}
                    onMouseLeave={() => setExportCsvHover(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 16px',
                      border: '1px solid #D0D5DD',
                      borderRadius: '8px',
                      background: '#fff',
                      fontSize: '14px',
                      fontFamily: font,
                      cursor: 'pointer',
                      color: '#111',
                    }}
                  >
                    <ExportCsvIcon size={16} hovered={exportCsvHover} />
                    <span>Export CSV</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => showToast('Exporting as PDF…')}
                    onMouseEnter={() => setExportPdfHover(true)}
                    onMouseLeave={() => setExportPdfHover(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 18px',
                      border: 'none',
                      borderRadius: '8px',
                      background: '#000',
                      color: '#fff',
                      fontSize: '14px',
                      fontFamily: font,
                      cursor: 'pointer',
                      boxShadow: '0px 1px 2px rgba(16,24,40,0.05)',
                    }}
                  >
                    <ExportPdfIcon size={16} hovered={exportPdfHover} />
                    <span>Export PDF</span>
                  </motion.button>
                </div>
                <div>
                  <motion.button whileTap={{ scale: 0.98 }} disabled style={{ padding: '9px 20px', border: '1px solid #D0D5DD', borderRadius: '8px', background: '#f5f5f5', fontSize: '14px', fontFamily: font, color: '#999', cursor: 'not-allowed' }}>Import data (coming soon)</motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Security' && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontFamily: font, fontWeight: 500, color: '#000' }}>Password</div>
                  <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginTop: '2px' }}>Change your account password.</div>
                </div>
                <div style={{ height: '1px', backgroundColor: '#EEEEEE' }} />
                <SlidingTextSwapButton
                  variant="secondary"
                  label="Change Password"
                  onClick={() => (onChangePasswordClick ? onChangePasswordClick() : setShowPasswordDialog(true))}
                  style={{ alignSelf: 'flex-start' }}
                />
              </div>
              <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontFamily: font, fontWeight: 500, color: '#000' }}>Active sessions</div>
                  <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginTop: '2px' }}>Devices where you're signed in.</div>
                </div>
                <div style={{ height: '1px', backgroundColor: '#EEEEEE' }} />
                <div style={{ border: '1px solid rgba(208,213,221,0.5)', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: font }}>
                    <thead>
                      <tr style={{ backgroundColor: 'rgba(248,248,249,0.8)' }}>
                        <th style={{ textAlign: 'left', padding: '12px 14px', fontWeight: 500, color: '#666' }}>Device</th>
                        <th style={{ textAlign: 'left', padding: '12px 14px', fontWeight: 500, color: '#666' }}>Location</th>
                        <th style={{ textAlign: 'left', padding: '12px 14px', fontWeight: 500, color: '#666' }}>Last active</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderTop: '1px solid #EEEEEE' }}>
                        <td style={{ padding: '12px 14px', color: '#111' }}>Chrome on Windows</td>
                        <td style={{ padding: '12px 14px', color: '#666' }}>Current session</td>
                        <td style={{ padding: '12px 14px', color: '#666' }}>Just now</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #EEEEEE' }}>
        <SlidingTextSwapButton variant="primary" label="Save Changes" onClick={handleSave} style={{ padding: '10px 24px' }} />
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.type === 'saved' ? 'saved' : toast.message}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '28px',
              padding: '8px 13px',
              backgroundColor: '#FFFFFF',
              color: '#333',
              fontSize: '13px',
              fontFamily: font,
              borderRadius: '9999px',
              border: toast.type === 'saved' ? '1px solid #159600' : '1px solid rgba(208,213,221,0.85)',
              boxShadow: '0px 8px 28px rgba(0,0,0,0.07)',
              maxWidth: 'min(320px, calc(100vw - 48px))',
              zIndex: 150,
            }}
          >
            {toast.type === 'saved' ? <SettingsSavedNotification /> : toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {showPasswordDialog && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowPasswordDialog(false)}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '90%', boxShadow: '0px 24px 48px rgba(0,0,0,0.12)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '18px', fontFamily: font, fontWeight: 500, marginBottom: '20px' }}>Change Password</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div style={{ width: '100%' }}>
                <label style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '6px', display: 'block' }}>Current password</label>
                <input type="password" placeholder="••••••••" style={{ ...inputStyle, width: '100%', maxWidth: '100%' }} />
              </div>
              <div style={{ width: '100%' }}>
                <label style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '6px', display: 'block' }}>New password</label>
                <input type="password" placeholder="••••••••" style={{ ...inputStyle, width: '100%', maxWidth: '100%' }} />
              </div>
              <div style={{ width: '100%' }}>
                <label style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '6px', display: 'block' }}>Confirm new password</label>
                <input type="password" placeholder="••••••••" style={{ ...inputStyle, width: '100%', maxWidth: '100%' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <SlidingTextSwapButton
                variant="secondary"
                label="Cancel"
                onClick={() => setShowPasswordDialog(false)}
              />
              <SlidingTextSwapButton
                variant="primary"
                label="Update"
                onClick={() => {
                  setShowPasswordDialog(false);
                  showToast('Password updated!');
                }}
                style={{ padding: '9px 20px' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
