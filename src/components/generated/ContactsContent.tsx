import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidingTextSwapButton,
  DropdownTriggerButton,
  DropdownMenu,
  CloseButton,
} from './interactionPrimitives';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  iconType: 'user' | 'marker' | 'pin' | 'web' | 'cube';
  iconColor?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const font = '"Approach TRIAL", sans-serif';
const ease = [0.16, 1, 0.3, 1] as const;

const CONTACTS_PER_PAGE = 10;

const ICON_COLORS = {
  marker: 'rgba(255, 75, 75, 1)',
  web: 'rgba(67, 83, 255, 1)',
};

const ICON_SRCS: Record<Contact['iconType'], string> = {
  user: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/280c609f-b06e-494b-bc78-cf50fb611894.svg',
  marker: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/3f8045ef-16ea-4123-8164-4fda51f87114.svg',
  pin: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/be1edca6-465d-4190-aff2-4d1263dea7ce.svg',
  web: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/d17c6e3f-0576-4777-8b1b-6852d6d58e96.svg',
  cube: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/fd703331-ef95-4f73-b346-295a30833029.svg',
};

const ICON_SIZES: Record<Contact['iconType'], string> = {
  user: '12px', marker: '10px', pin: '12px', web: '14px', cube: '13px',
};

const ICON_BG: Record<Contact['iconType'], { bg?: string; border?: string }> = {
  user: { bg: '#fff', border: '1px solid #000' },
  marker: {},
  pin: { bg: '#fff', border: '1px solid #000' },
  web: {},
  cube: { bg: '#fff', border: '1px solid #000' },
};

const ICON_TYPE_OPTIONS: { value: Contact['iconType']; label: string }[] = [
  { value: 'user', label: 'User' },
  { value: 'marker', label: 'Marker' },
  { value: 'pin', label: 'Pin' },
  { value: 'web', label: 'Web' },
  { value: 'cube', label: 'Cube' },
];

const EMPTY_FORM = {
  name: '', email: '', phone: '', company: '',
  iconType: 'user' as Contact['iconType'],
};

type SortOptionId =
  | 'name-asc' | 'name-desc'
  | 'email-asc' | 'email-desc'
  | 'company-asc' | 'company-desc';

const SORT_OPTIONS: { id: SortOptionId; label: string }[] = [
  { id: 'name-asc', label: 'Name (A → Z)' },
  { id: 'name-desc', label: 'Name (Z → A)' },
  { id: 'email-asc', label: 'Email (A → Z)' },
  { id: 'email-desc', label: 'Email (Z → A)' },
  { id: 'company-asc', label: 'Company (A → Z)' },
  { id: 'company-desc', label: 'Company (Z → A)' },
];

function sortContactsList(list: Contact[], sortOption: SortOptionId): Contact[] {
  const m = sortOption.match(/^(name|email|company)-(asc|desc)$/);
  if (!m) return [...list];
  const field = m[1] as 'name' | 'email' | 'company';
  const dir = m[2] as 'asc' | 'desc';
  return [...list].sort((a, b) => {
    const va = field === 'name' ? a.name : field === 'email' ? a.email : a.company;
    const vb = field === 'name' ? b.name : field === 'email' ? b.email : b.company;
    const cmp = va.localeCompare(vb, undefined, { sensitivity: 'base' });
    return dir === 'asc' ? cmp : -cmp;
  });
}

// ─── Initial data ─────────────────────────────────────────────────────────────

const INITIAL_CONTACTS: Contact[] = [
  { id: 1,  name: 'Brice Howard',     email: 'brice@augment.llc',          phone: '+1 555 123 4567', company: 'Augment LLC',          iconType: 'user' },
  { id: 2,  name: 'Denker Matthews',  email: 'd.matthews@fierceex.com',    phone: '+1 555 123 4567', company: 'FierceExchange Inc.',  iconType: 'marker', iconColor: ICON_COLORS.marker },
  { id: 3,  name: 'Dendocker Kenney', email: 'd.kenney@fierceex.com',      phone: '+1 555 123 4567', company: 'FierceExchange Inc.',  iconType: 'marker', iconColor: ICON_COLORS.marker },
  { id: 4,  name: 'George Clooney',   email: 'george.clooney@augment.llc', phone: '+1 555 234 5678', company: 'Augment LLC',          iconType: 'pin' },
  { id: 5,  name: 'Gaant Giant',      email: 'gaant@webflow.com',          phone: '+1 555 345 6789', company: 'Webflow',              iconType: 'web',    iconColor: ICON_COLORS.web },
  { id: 6,  name: 'Harry Mants',      email: 'harry.mants@cuboid.com',     phone: '+1 555 456 7890', company: 'Cuboid',               iconType: 'cube' },
  { id: 7,  name: 'Holden Steinberg', email: 'holden@fierceex.com',        phone: '+1 555 567 8901', company: 'FierceExchange Inc.',  iconType: 'marker', iconColor: ICON_COLORS.marker },
  { id: 8,  name: 'Larry Page',       email: 'larrypage@cuboid.com',       phone: '+1 555 678 9012', company: 'Cuboid',               iconType: 'cube' },
  { id: 9,  name: 'Loom Hat',         email: 'loom.hat@cuboid.com',        phone: '+1 555 789 0123', company: 'Cuboid',               iconType: 'cube' },
  { id: 10, name: 'Menda Sage',       email: 'menda.s@webflow.com',        phone: '+1 555 890 1234', company: 'Webflow',              iconType: 'web',    iconColor: ICON_COLORS.web },
  { id: 11, name: 'Nina Carlson',     email: 'nina.c@augment.llc',         phone: '+1 555 901 2345', company: 'Augment LLC',          iconType: 'user' },
  { id: 12, name: 'Oscar Blaine',     email: 'oscar@fierceex.com',         phone: '+1 555 012 3456', company: 'FierceExchange Inc.',  iconType: 'pin' },
  { id: 13, name: 'Paula Rivers',     email: 'paula.r@webflow.com',        phone: '+1 555 111 2222', company: 'Webflow',              iconType: 'web',    iconColor: ICON_COLORS.web },
  { id: 14, name: 'Quinn Adler',      email: 'quinn@cuboid.com',           phone: '+1 555 222 3333', company: 'Cuboid',               iconType: 'cube' },
  { id: 15, name: 'Rachel Voss',      email: 'r.voss@augment.llc',         phone: '+1 555 333 4444', company: 'Augment LLC',          iconType: 'user' },
  { id: 16, name: 'Samuel Trent',     email: 'strent@fierceex.com',        phone: '+1 555 444 5555', company: 'FierceExchange Inc.',  iconType: 'marker', iconColor: ICON_COLORS.marker },
  { id: 17, name: 'Tara Hobbs',       email: 'tara.h@webflow.com',         phone: '+1 555 555 6666', company: 'Webflow',              iconType: 'web',    iconColor: ICON_COLORS.web },
  { id: 18, name: 'Uma Patel',        email: 'uma@cuboid.com',             phone: '+1 555 666 7777', company: 'Cuboid',               iconType: 'cube' },
  { id: 19, name: 'Victor Lund',      email: 'vlund@augment.llc',          phone: '+1 555 777 8888', company: 'Augment LLC',          iconType: 'pin' },
  { id: 20, name: 'Wendy Cross',      email: 'wendy@fierceex.com',         phone: '+1 555 888 9999', company: 'FierceExchange Inc.',  iconType: 'marker', iconColor: ICON_COLORS.marker },
  { id: 21, name: 'Xander Foe',       email: 'xander@cuboid.com',          phone: '+1 555 999 0000', company: 'Cuboid',               iconType: 'cube' },
  { id: 22, name: 'Yara Bloom',       email: 'yara@webflow.com',           phone: '+1 555 100 2001', company: 'Webflow',              iconType: 'web',    iconColor: ICON_COLORS.web },
  { id: 23, name: 'Zach Monroe',      email: 'zach@augment.llc',           phone: '+1 555 200 3002', company: 'Augment LLC',          iconType: 'user' },
  { id: 24, name: 'Abby Torres',      email: 'abby.t@fierceex.com',        phone: '+1 555 300 4003', company: 'FierceExchange Inc.',  iconType: 'pin' },
  { id: 25, name: 'Blake Nguyen',     email: 'blake@cuboid.com',           phone: '+1 555 400 5004', company: 'Cuboid',               iconType: 'cube' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ContactIcon({ contact }: { contact: Contact }) {
  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: '20px', height: '20px', display: 'flex', justifyContent: 'center',
        alignItems: 'center', borderRadius: '3px', boxSizing: 'border-box', flexShrink: 0,
        backgroundColor: contact.iconColor ?? ICON_BG[contact.iconType].bg,
        border: ICON_BG[contact.iconType].border,
      }}
    >
      <img src={ICON_SRCS[contact.iconType]} alt="" style={{ width: ICON_SIZES[contact.iconType] }} />
    </motion.div>
  );
}

function CompanyInfoPopover({
  contact,
  allContacts,
  onFilterToCompany,
  popoverRef,
}: {
  contact: Contact;
  allContacts: Contact[];
  onFilterToCompany: () => void;
  popoverRef: React.RefObject<HTMLDivElement | null>;
}) {
  const companyContacts = allContacts.filter(c => c.company === contact.company);
  return (
    <motion.div
      ref={popoverRef}
      initial={{ opacity: 0, scale: 0.96, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -4 }}
      transition={{ duration: 0.16 }}
      style={{
        position: 'absolute',
        left: 0,
        top: '30px',
        width: '280px',
        background: '#fff',
        border: '1px solid rgba(208,213,221,0.8)',
        borderRadius: '10px',
        boxShadow: '0px 8px 24px rgba(0,0,0,0.08)',
        zIndex: 80,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#F8F8F9', border: '1px solid rgba(208,213,221,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ transform: 'scale(1.6)', transformOrigin: 'center' }}>
              <ContactIcon contact={contact} />
            </div>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontFamily: font, fontWeight: 600, color: '#000', letterSpacing: '-0.28px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.company}</div>
            <div style={{ fontSize: '12px', fontFamily: font, color: '#666', marginTop: '2px', lineHeight: 1.4 }}>
              {companyContacts.length} contact{companyContacts.length === 1 ? '' : 's'} · Primary: {contact.name}
            </div>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: '#EEEEEE', marginBottom: '12px' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: 'Primary email', value: contact.email },
            { label: 'Primary phone', value: contact.phone },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <span style={{ fontSize: '12px', fontFamily: font, color: '#888' }}>{label}</span>
              <span style={{ fontSize: '12px', fontFamily: font, color: '#000', fontWeight: 500, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: '#EEEEEE' }} />
      <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'flex-end' }}>
        <SlidingTextSwapButton label="Filter to company" variant="secondary" onClick={onFilterToCompany} style={{ padding: '8px 12px' }} />
      </div>
    </motion.div>
  );
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

// Animated modal overlay (reusing the same pattern as CompanyTransactionList)
const Overlay: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => {
  useEscapeKey(onClose, true);
  return (
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
      style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '32px', maxWidth: '460px', width: '90%', boxShadow: '0px 24px 48px rgba(0,0,0,0.12)', position: 'relative' }}
    >
      <CloseButton onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px' }} />
      {children}
    </motion.div>
  </motion.div>
);
};

type ContactFormData = typeof EMPTY_FORM;

function ContactModal({
  title,
  initialData,
  onSave,
  onClose,
}: {
  title: string;
  initialData: ContactFormData;
  onSave: (data: ContactFormData) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ContactFormData>(initialData);
  const set = (field: keyof ContactFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1px solid rgba(208,213,221,0.9)',
    borderRadius: '8px', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', fontFamily: font, color: '#000',
    transition: 'border-color 0.15s',
  };

  return (
    <Overlay onClose={onClose}>
      <div style={{ fontSize: '17px', fontFamily: font, fontWeight: 500, marginBottom: '20px', letterSpacing: '-0.34px' }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {(['name', 'email', 'phone', 'company'] as const).map(field => (
          <div key={field}>
            <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '5px' }}>
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </div>
            <input
              style={inputStyle}
              value={form[field]}
              onChange={set(field)}
              placeholder={field === 'phone' ? '+1 555 000 0000' : ''}
              onFocus={e => (e.currentTarget.style.borderColor = '#000')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(208,213,221,0.9)')}
            />
          </div>
        ))}
        <div>
          <div style={{ fontSize: '12px', fontFamily: font, color: '#888', marginBottom: '5px' }}>Icon Type</div>
          <select
            style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
            value={form.iconType}
            onChange={set('iconType')}
          >
            {ICON_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
        <SlidingTextSwapButton label="Cancel" variant="secondary" onClick={onClose} />
        <SlidingTextSwapButton
          label="Save"
          variant="primary"
          disabled={!form.name.trim()}
          onClick={() => form.name.trim() && onSave(form)}
        />
      </div>
    </Overlay>
  );
}

// ─── Main ContactsContent ─────────────────────────────────────────────────────

export const ContactsContent: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOptionId>('name-asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [actionMenuId, setActionMenuId] = useState<number | null>(null);
  const [companyPopoverId, setCompanyPopoverId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const companyPopoverRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const [pageHover, setPageHover] = useState<number | null>(null);
  const [addHover, setAddHover] = useState(false);
  const [rowDotsHoverId, setRowDotsHoverId] = useState<number | null>(null);
  const [prevHover, setPrevHover] = useState(false);
  const [nextHover, setNextHover] = useState(false);
  const [menuItemHover, setMenuItemHover] = useState<string | null>(null);

  // Close action menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActionMenuId(null);
      }
      if (companyPopoverRef.current && !companyPopoverRef.current.contains(e.target as Node)) {
        setCompanyPopoverId(null);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setActionMenuId(null);
      setCompanyPopoverId(null);
      setShowSortMenu(false);
      setShowAddModal(false);
      setEditingContact(null);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Reset page on search change
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const list = q
      ? contacts.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.company.toLowerCase().includes(q)
        )
      : [...contacts];
    return sortContactsList(list, sortOption);
  }, [contacts, searchQuery, sortOption]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / CONTACTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageContacts = filtered.slice((safePage - 1) * CONTACTS_PER_PAGE, safePage * CONTACTS_PER_PAGE);

  const handleDelete = (id: number) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    setActionMenuId(null);
  };

  const resolveIconColor = (iconType: Contact['iconType']) =>
    iconType === 'marker' ? ICON_COLORS.marker : iconType === 'web' ? ICON_COLORS.web : undefined;

  const handleAddSave = (form: ContactFormData) => {
    const id = Math.max(0, ...contacts.map(c => c.id)) + 1;
    setContacts(prev => [...prev, { ...form, id, iconColor: resolveIconColor(form.iconType) }]);
    setShowAddModal(false);
  };

  const handleEditSave = (form: ContactFormData) => {
    if (!editingContact) return;
    setContacts(prev =>
      prev.map(c => c.id === editingContact.id
        ? { ...c, ...form, iconColor: resolveIconColor(form.iconType) }
        : c
      )
    );
    setEditingContact(null);
  };

  const pageNumbers = useMemo<(number | '...')[]>(() => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);
    return [1, 2, 3, 4, '...', totalPages];
  }, [totalPages]);

  const startEntry = filtered.length === 0 ? 0 : (safePage - 1) * CONTACTS_PER_PAGE + 1;
  const endEntry = Math.min(safePage * CONTACTS_PER_PAGE, filtered.length);

  return (
    <>
      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <ContactModal
            key="add"
            title="Add Contact"
            initialData={EMPTY_FORM}
            onSave={handleAddSave}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editingContact && (
          <ContactModal
            key="edit"
            title="Edit Contact"
            initialData={{ name: editingContact.name, email: editingContact.email, phone: editingContact.phone, company: editingContact.company, iconType: editingContact.iconType }}
            onSave={handleEditSave}
            onClose={() => setEditingContact(null)}
          />
        )}
      </AnimatePresence>

      <motion.div
        key="contacts"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.3, ease }}
        style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
      >
        {/* Page title + Add button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontFamily: font, fontWeight: 400, margin: 0, letterSpacing: '-0.48px' }}>
            Contacts
          </h1>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddModal(true)}
            onMouseEnter={() => setAddHover(true)}
            onMouseLeave={() => setAddHover(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 15px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 400, fontFamily: font }}
          >
            <motion.svg width="17" height="17" viewBox="0 0 24 24" fill="none" animate={{ rotate: addHover ? 180 : 0 }} transition={{ type: 'spring', stiffness: 100, damping: 15 }}>
              <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
            Add Contact
          </motion.button>
        </div>

        {/* Search + Sort bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px', border: '1px solid rgba(208,213,221,0.5)', borderRadius: '8px', boxShadow: '0px 1px 2px rgba(16,24,40,0.05)' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, color: searchQuery.trim() ? '#444' : '#98A2B3' }}>
                <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.4" />
                <path d="M8.5 8.5L11 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search contacts…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '14px', color: '#444', width: '160px', fontFamily: font }}
              />
              {searchQuery && (
                <CloseButton onClick={() => setSearchQuery('')} size="sm" iconColor="#aaa" />
              )}
            </div>
            {/* Sort */}
            <div ref={sortMenuRef} style={{ position: 'relative' }}>
              <DropdownTriggerButton
                onClick={() => setShowSortMenu(v => !v)}
                style={{ padding: '9px 14px', boxShadow: '0px 1px 2px rgba(16,24,40,0.05)' }}
              >
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/96019b21-aeb9-46f5-8ead-21280cb12e44.svg" alt="" style={{ width: '18px', flexShrink: 0 }} />
                <span style={{ fontSize: '14px', fontFamily: font, color: '#000', whiteSpace: 'nowrap' }}>
                  <span style={{ fontWeight: 400 }}>Sort by: </span>
                  <span style={{ fontWeight: 600 }}>
                    {SORT_OPTIONS.find(o => o.id === sortOption)?.label ?? ''}
                  </span>
                </span>
                <motion.img
                  animate={{ rotate: showSortMenu ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/3285d6aa-5ca1-4e14-b1a0-bc7692cf8b98.svg"
                  alt=""
                  style={{ width: '18px', flexShrink: 0 }}
                />
              </DropdownTriggerButton>
              <AnimatePresence>
                {showSortMenu && (
                  <DropdownMenu
                    key="contacts-sort"
                    style={{ top: '42px', left: 0, minWidth: '220px' }}
                    items={SORT_OPTIONS.map(o => ({
                      label: o.label,
                      onClick: () => {
                        setSortOption(o.id);
                        setShowSortMenu(false);
                      },
                    }))}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
          <div style={{ fontSize: '14px', fontFamily: font, color: '#000' }}>
            Total: {contacts.length}
            {searchQuery && filtered.length !== contacts.length && (
              <span style={{ color: '#888', marginLeft: '6px' }}>({filtered.length} match{filtered.length !== 1 ? 'es' : ''})</span>
            )}
          </div>
        </div>

        {/* Table header */}
        <div style={{ display: 'flex', backgroundColor: 'rgba(248,248,249,1)', padding: '12px 14px', borderRadius: '7px', marginBottom: '6px' }}>
          <div style={{ width: '46px', fontSize: '14px', fontFamily: font, color: 'rgba(119,119,119,1)' }}>S/N</div>
          <div style={{ width: '260px', fontSize: '14px', fontFamily: font, color: 'rgba(119,119,119,1)' }}>Name</div>
          <div style={{ width: '260px', fontSize: '14px', fontFamily: font, color: 'rgba(119,119,119,1)' }}>Email</div>
          <div style={{ width: '190px', fontSize: '14px', fontFamily: font, color: 'rgba(119,119,119,1)' }}>Phone</div>
          <div style={{ flexGrow: 1, paddingLeft: '38px', fontSize: '14px', fontFamily: font, color: 'rgba(119,119,119,1)' }}>Company</div>
          <div style={{ width: '36px' }} />
        </div>

        {/* Table body */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <AnimatePresence>
            {pageContacts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ padding: '48px 14px', textAlign: 'center', color: '#888', fontSize: '14px', fontFamily: font }}
              >
                No contacts match your search.
              </motion.div>
            ) : (
              pageContacts.map((contact, idx) => (
                <motion.div
                  key={contact.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: idx * 0.03, ease: 'easeOut' }}
                  style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderRadius: '4px', position: 'relative', borderBottom: '1px solid rgba(238,238,238,1)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(248,248,249,0.7)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ width: '46px', fontSize: '14px', fontFamily: font, color: '#888' }}>
                    {(safePage - 1) * CONTACTS_PER_PAGE + idx + 1}
                  </div>
                  <div style={{ width: '260px', display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
                    <div onClick={() => setCompanyPopoverId(id => id === contact.id ? null : contact.id)} style={{ cursor: 'pointer', display: 'inline-flex' }}>
                      <ContactIcon contact={contact} />
                    </div>
                    <span style={{ fontSize: '14px', fontFamily: font, color: '#000' }}>{contact.name}</span>
                    <AnimatePresence>
                      {companyPopoverId === contact.id && (
                        <CompanyInfoPopover
                          contact={contact}
                          allContacts={contacts}
                          popoverRef={companyPopoverRef}
                          onFilterToCompany={() => { setSearchQuery(contact.company); setCompanyPopoverId(null); }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                  <div style={{ width: '260px', fontSize: '14px', fontFamily: font, color: '#444' }}>{contact.email}</div>
                  <div style={{ width: '190px', paddingRight: '26px', fontSize: '14px', fontFamily: font, color: '#444' }}>{contact.phone}</div>
                  <div style={{ flexGrow: 1, position: 'relative', paddingLeft: '38px' }}>
                    <button
                      onClick={() => setCompanyPopoverId(id => id === contact.id ? null : contact.id)}
                      style={{ fontSize: '14px', fontFamily: font, color: '#000', background: 'none', border: 'none', padding: 0, textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      {contact.company}
                    </button>
                  </div>

                  {/* Row action menu */}
                  <div
                    style={{ width: '36px', display: 'flex', justifyContent: 'center', position: 'relative' }}
                    ref={actionMenuId === contact.id ? menuRef : null}
                  >
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setActionMenuId(id => id === contact.id ? null : contact.id)}
                      onMouseEnter={() => setRowDotsHoverId(contact.id)}
                      onMouseLeave={() => setRowDotsHoverId(null)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', color: '#999', fontSize: '16px', lineHeight: 1 }}
                    >
                      <motion.span
                        initial={false}
                        animate={rowDotsHoverId === contact.id ? { opacity: [1, 0, 1] } : { opacity: 1 }}
                        transition={{ duration: 0.6, times: [0, 0.2, 1] }}
                      >
                        ⋯
                      </motion.span>
                    </motion.button>

                    <AnimatePresence>
                      {actionMenuId === contact.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.97 }}
                          transition={{ duration: 0.15, ease }}
                          style={{ position: 'absolute', right: 0, top: '28px', background: '#fff', border: '1px solid rgba(208,213,221,0.8)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', zIndex: 50, minWidth: '120px', overflow: 'hidden' }}
                        >
                          <motion.button
                            onClick={() => { setEditingContact(contact); setActionMenuId(null); }}
                            onMouseEnter={() => setMenuItemHover(`edit-${contact.id}`)}
                            onMouseLeave={() => setMenuItemHover(null)}
                            style={{ position: 'relative', overflow: 'hidden', display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontFamily: font, color: '#000', borderBottom: '1px solid rgba(238,238,238,1)' }}
                          >
                            <motion.span initial={false} animate={{ scaleX: menuItemHover === `edit-${contact.id}` ? 1 : 0 }} transition={{ duration: 0.22, ease }} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(248,248,249,1)', transformOrigin: 'left', zIndex: 0 }} />
                            <span style={{ position: 'relative', zIndex: 1 }}>Edit</span>
                          </motion.button>
                          <motion.button
                            onClick={() => handleDelete(contact.id)}
                            onMouseEnter={() => setMenuItemHover(`delete-${contact.id}`)}
                            onMouseLeave={() => setMenuItemHover(null)}
                            style={{ position: 'relative', overflow: 'hidden', display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontFamily: font, color: 'rgba(220,38,38,1)' }}
                          >
                            <motion.span initial={false} animate={{ scaleX: menuItemHover === `delete-${contact.id}` ? 1 : 0 }} transition={{ duration: 0.22, ease }} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(248,248,249,1)', transformOrigin: 'left', zIndex: 0 }} />
                            <span style={{ position: 'relative', zIndex: 1 }}>Delete</span>
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        <div style={{ paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(238,238,238,1)', marginTop: '8px', flexShrink: 0 }}>
          <span style={{ fontSize: '14px', fontFamily: font, color: '#888' }}>
            {filtered.length === 0 ? 'No results' : `Showing ${startEntry}–${endEntry} of ${filtered.length}`}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <motion.button
              onMouseEnter={() => setPrevHover(true)}
              onMouseLeave={() => setPrevHover(false)}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              style={{ width: '22px', height: '22px', border: '1px solid rgba(208,213,221,0.5)', borderRadius: '8px', background: '#fff', cursor: safePage === 1 ? 'default' : 'pointer', opacity: safePage === 1 ? 0.3 : 1, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
            >
              <motion.div
                initial={false}
                animate={{ scaleY: prevHover && safePage !== 1 ? 1 : 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'absolute', inset: '-1px', backgroundColor: '#F8F8F9', zIndex: 0, transformOrigin: 'bottom', borderRadius: '8px' }}
              />
              <span style={{ position: 'relative', zIndex: 2, display: 'inline-flex' }}>
                <motion.svg animate={{ x: safePage === 1 ? 0 : (prevHover ? -1.5 : 0) }} transition={{ duration: 0.18, ease }} width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M9.5 4L5.5 8L9.5 12" stroke="#404B52" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </span>
            </motion.button>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {pageNumbers.map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} style={{ fontSize: '12px', color: '#888', fontFamily: font, padding: '0 4px' }}>…</span>
                ) : (
                  <motion.button
                    key={p}
                    onMouseEnter={() => setPageHover(p)}
                    onMouseLeave={() => setPageHover(null)}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setCurrentPage(p)}
                    style={{ width: '26px', height: '26px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, fontFamily: font, cursor: 'pointer', background: p === safePage ? '#444' : '#fff', position: 'relative', overflow: 'hidden', border: p === safePage ? 'none' : '1px solid rgba(208,213,221,0.5)', color: p === safePage ? '#fff' : '#404B52' }}
                  >
                    <motion.div
                      initial={false}
                      animate={{ scaleY: pageHover === p && p !== safePage ? 1 : 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      style={{ position: 'absolute', inset: '-1px', backgroundColor: '#F8F8F9', zIndex: 0, transformOrigin: 'bottom', borderRadius: '8px' }}
                    />
                    <span style={{ position: 'relative', zIndex: 2 }}>{p}</span>
                  </motion.button>
                )
              )}
            </div>
            <motion.button
              onMouseEnter={() => setNextHover(true)}
              onMouseLeave={() => setNextHover(false)}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              style={{ width: '22px', height: '22px', border: '1px solid rgba(208,213,221,0.5)', borderRadius: '8px', background: '#fff', cursor: safePage === totalPages ? 'default' : 'pointer', opacity: safePage === totalPages ? 0.3 : 1, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
            >
              <motion.div
                initial={false}
                animate={{ scaleY: nextHover && safePage !== totalPages ? 1 : 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'absolute', inset: '-1px', backgroundColor: '#F8F8F9', zIndex: 0, transformOrigin: 'bottom', borderRadius: '8px' }}
              />
              <span style={{ position: 'relative', zIndex: 2, display: 'inline-flex' }}>
                <motion.svg animate={{ x: safePage === totalPages ? 0 : (nextHover ? 1.5 : 0) }} transition={{ duration: 0.18, ease }} width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6.5 4L10.5 8L6.5 12" stroke="#404B52" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
};
