import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  iconType: 'user' | 'marker' | 'pin' | 'web' | 'cube';
  iconColor?: string;
}

const CONTACTS_PER_PAGE = 10;

const ICON_COLORS: Record<string, string> = {
  marker: 'rgba(255, 75, 75, 1)',
  web: 'rgba(67, 83, 255, 1)',
};

const initialContacts: Contact[] = [
  { id: 1, name: 'Brice Howard', email: 'brice@augment.llc', phone: '+1 555 123 4567', company: 'Augment LLC', iconType: 'user' },
  { id: 2, name: 'Denker Matthews', email: 'd.matthews@fierceex.com', phone: '+1 555 123 4567', company: 'FierceExchange Inc.', iconType: 'marker', iconColor: ICON_COLORS.marker },
  { id: 3, name: 'Dendocker Kenney', email: 'd.kenney@fierceex.com', phone: '+1 555 123 4567', company: 'FierceExchange Inc.', iconType: 'marker', iconColor: ICON_COLORS.marker },
  { id: 4, name: 'George Clooney', email: 'george.clooney@augment.llc', phone: '+1 555 234 5678', company: 'Augment LLC', iconType: 'pin' },
  { id: 5, name: 'Gaant Giant', email: 'gaant@webflow.com', phone: '+1 555 345 6789', company: 'Webflow', iconType: 'web', iconColor: ICON_COLORS.web },
  { id: 6, name: 'Harry Mants', email: 'harry.mants@cuboid.com', phone: '+1 555 456 7890', company: 'Cuboid', iconType: 'cube' },
  { id: 7, name: 'Holden Steinberg', email: 'holden@fierceex.com', phone: '+1 555 567 8901', company: 'FierceExchange Inc.', iconType: 'marker', iconColor: ICON_COLORS.marker },
  { id: 8, name: 'Larry Page', email: 'larrypage@cuboid.com', phone: '+1 555 678 9012', company: 'Cuboid', iconType: 'cube' },
  { id: 9, name: 'Loom Hat', email: 'loom.hat@cuboid.com', phone: '+1 555 789 0123', company: 'Cuboid', iconType: 'cube' },
  { id: 10, name: 'Menda Sage', email: 'menda.s@webflow.com', phone: '+1 555 890 1234', company: 'Webflow', iconType: 'web', iconColor: ICON_COLORS.web },
  { id: 11, name: 'Nina Carlson', email: 'nina.c@augment.llc', phone: '+1 555 901 2345', company: 'Augment LLC', iconType: 'user' },
  { id: 12, name: 'Oscar Blaine', email: 'oscar@fierceex.com', phone: '+1 555 012 3456', company: 'FierceExchange Inc.', iconType: 'pin' },
  { id: 13, name: 'Paula Rivers', email: 'paula.r@webflow.com', phone: '+1 555 111 2222', company: 'Webflow', iconType: 'web', iconColor: ICON_COLORS.web },
  { id: 14, name: 'Quinn Adler', email: 'quinn@cuboid.com', phone: '+1 555 222 3333', company: 'Cuboid', iconType: 'cube' },
  { id: 15, name: 'Rachel Voss', email: 'r.voss@augment.llc', phone: '+1 555 333 4444', company: 'Augment LLC', iconType: 'user' },
  { id: 16, name: 'Samuel Trent', email: 'strent@fierceex.com', phone: '+1 555 444 5555', company: 'FierceExchange Inc.', iconType: 'marker', iconColor: ICON_COLORS.marker },
  { id: 17, name: 'Tara Hobbs', email: 'tara.h@webflow.com', phone: '+1 555 555 6666', company: 'Webflow', iconType: 'web', iconColor: ICON_COLORS.web },
  { id: 18, name: 'Uma Patel', email: 'uma@cuboid.com', phone: '+1 555 666 7777', company: 'Cuboid', iconType: 'cube' },
  { id: 19, name: 'Victor Lund', email: 'vlund@augment.llc', phone: '+1 555 777 8888', company: 'Augment LLC', iconType: 'pin' },
  { id: 20, name: 'Wendy Cross', email: 'wendy@fierceex.com', phone: '+1 555 888 9999', company: 'FierceExchange Inc.', iconType: 'marker', iconColor: ICON_COLORS.marker },
  { id: 21, name: 'Xander Foe', email: 'xander@cuboid.com', phone: '+1 555 999 0000', company: 'Cuboid', iconType: 'cube' },
  { id: 22, name: 'Yara Bloom', email: 'yara@webflow.com', phone: '+1 555 100 2001', company: 'Webflow', iconType: 'web', iconColor: ICON_COLORS.web },
  { id: 23, name: 'Zach Monroe', email: 'zach@augment.llc', phone: '+1 555 200 3002', company: 'Augment LLC', iconType: 'user' },
  { id: 24, name: 'Abby Torres', email: 'abby.t@fierceex.com', phone: '+1 555 300 4003', company: 'FierceExchange Inc.', iconType: 'pin' },
  { id: 25, name: 'Blake Nguyen', email: 'blake@cuboid.com', phone: '+1 555 400 5004', company: 'Cuboid', iconType: 'cube' },
];

const ICON_SRCS = {
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

const SIDEBAR_ITEMS = [
  { name: 'Home', icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/897cc3fa-b773-4533-aecd-71e08afba466.svg' },
  { name: 'Analytics', icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/a24e3efe-6aeb-42d9-9ce7-150af97555c6.svg' },
  { name: 'Contacts', icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/79673c59-b5d8-4ec4-bb7c-6f770b5c3b6a.svg' },
  { name: 'Incomes', icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/c3db48b5-6414-41af-be2d-26babc8173c9.svg' },
  { name: 'Expenses', icon: 'https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/e3a0be5d-cbb3-4964-ab8a-637cace9ff30.svg' },
];

const ICON_TYPE_OPTIONS: { value: Contact['iconType']; label: string }[] = [
  { value: 'user', label: 'User' },
  { value: 'marker', label: 'Marker' },
  { value: 'pin', label: 'Pin' },
  { value: 'web', label: 'Web' },
  { value: 'cube', label: 'Cube' },
];

function ContactIcon({ contact }: { contact: Contact }) {
  const base: React.CSSProperties = {
    width: '20px', height: '20px', display: 'flex', justifyContent: 'center',
    alignItems: 'center', borderRadius: '3px', boxSizing: 'border-box',
    flexShrink: 0,
    backgroundColor: contact.iconColor ?? ICON_BG[contact.iconType].bg,
    border: ICON_BG[contact.iconType].border,
  };
  return (
    <div style={base}>
      <img src={ICON_SRCS[contact.iconType]} alt="" style={{ width: ICON_SIZES[contact.iconType] }} />
    </div>
  );
}

type SortOrder = 'asc' | 'desc';

const EMPTY_FORM = { name: '', email: '', phone: '', company: '', iconType: 'user' as Contact['iconType'] };

function ContactModal({
  contact,
  onSave,
  onClose,
  title,
}: {
  contact: typeof EMPTY_FORM;
  onSave: (c: typeof EMPTY_FORM) => void;
  onClose: () => void;
  title: string;
}) {
  const [form, setForm] = useState(contact);
  const set = (field: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', border: '1px solid rgba(208,213,221,0.8)',
    borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', color: '#000',
  };
  const labelStyle: React.CSSProperties = { fontSize: '12px', color: '#777', marginBottom: '4px', display: 'block' };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: '12px', padding: '28px 28px 24px',
          width: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600 }}>{title}</span>
          <motion.button
            onClick={onClose}
            initial="rest"
            animate="rest"
            whileHover="hover"
            variants={{ rest: { backgroundColor: 'rgba(0,0,0,0)' }, hover: { backgroundColor: 'rgba(0,0,0,0.04)' } }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '28px', height: '28px', background: 'none', border: 'none', borderRadius: '999px', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.svg
              width={20}
              height={20}
              viewBox="0 0 20 20"
              fill="none"
              variants={{ rest: { rotate: 0 }, hover: { rotate: 180 } }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: '50% 50%' }}
            >
              <path d="M6 6L14 14" stroke="#888" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M14 6L6 14" stroke="#888" strokeWidth="1.8" strokeLinecap="round" />
            </motion.svg>
          </motion.button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {(['name', 'email', 'phone', 'company'] as const).map(field => (
            <div key={field}>
              <label style={labelStyle}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input style={inputStyle} value={form[field]} onChange={set(field)}
                placeholder={field === 'phone' ? '+1 555 000 0000' : ''} />
            </div>
          ))}
          <div>
            <label style={labelStyle}>Icon Type</label>
            <select style={{ ...inputStyle, appearance: 'none' }} value={form.iconType} onChange={set('iconType')}>
              {ICON_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 18px', border: '1px solid rgba(208,213,221,0.8)', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '14px' }}
          >Cancel</button>
          <button
            onClick={() => form.name.trim() && onSave(form)}
            style={{ padding: '8px 18px', border: 'none', borderRadius: '8px', background: '#000', color: '#fff', cursor: 'pointer', fontSize: '14px' }}
          >Save</button>
        </div>
      </div>
    </div>
  );
}

export const ContactDirectory: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Contacts');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [actionMenuId, setActionMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActionMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Reset to page 1 when search changes
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const filteredContacts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = q
      ? contacts.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.company.toLowerCase().includes(q)
        )
      : [...contacts];
    return filtered.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [contacts, searchQuery, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / CONTACTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedContacts = filteredContacts.slice(
    (safePage - 1) * CONTACTS_PER_PAGE,
    safePage * CONTACTS_PER_PAGE,
  );

  const handleDelete = (id: number) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    setActionMenuId(null);
  };

  const handleAddSave = (form: typeof EMPTY_FORM) => {
    const id = Math.max(0, ...contacts.map(c => c.id)) + 1;
    const iconColor = form.iconType === 'marker' ? ICON_COLORS.marker : form.iconType === 'web' ? ICON_COLORS.web : undefined;
    setContacts(prev => [...prev, { ...form, id, iconColor }]);
    setShowAddModal(false);
  };

  const handleEditSave = (form: typeof EMPTY_FORM) => {
    if (!editingContact) return;
    const iconColor = form.iconType === 'marker' ? ICON_COLORS.marker : form.iconType === 'web' ? ICON_COLORS.web : undefined;
    setContacts(prev => prev.map(c => c.id === editingContact.id ? { ...c, ...form, iconColor } : c));
    setEditingContact(null);
  };

  const visiblePageNumbers = useMemo(() => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3, 4, '...', totalPages);
    }
    return pages;
  }, [totalPages]);

  const startEntry = filteredContacts.length === 0 ? 0 : (safePage - 1) * CONTACTS_PER_PAGE + 1;
  const endEntry = Math.min(safePage * CONTACTS_PER_PAGE, filteredContacts.length);

  return (
    <>
      {showAddModal && (
        <ContactModal
          title="Add Contact"
          contact={EMPTY_FORM}
          onSave={handleAddSave}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {editingContact && (
        <ContactModal
          title="Edit Contact"
          contact={{ name: editingContact.name, email: editingContact.email, phone: editingContact.phone, company: editingContact.company, iconType: editingContact.iconType }}
          onSave={handleEditSave}
          onClose={() => setEditingContact(null)}
        />
      )}

      <div style={{
        width: '100%', maxWidth: '1440px', minHeight: '1025.84px',
        backgroundColor: 'rgba(248, 248, 249, 1)', borderRadius: '15px',
        position: 'relative', margin: '0 auto',
        fontFamily: '"Approach TRIAL", sans-serif', display: 'flex',
      }}>
        {/* Sidebar */}
        <nav style={{ width: '290px', padding: '25px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '35px' }}>
            <div style={{
              width: '40px', height: '40px',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #D0D5DD 100%)',
              border: '0.3px solid #D0D5DD', borderRadius: '8px',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
            }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/3e44eca1-7927-444b-a212-74137f0d99ca.svg" alt="Income S" />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.18px' }}>Income S</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
            {SIDEBAR_ITEMS.map(item => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', borderRadius: '8px',
                  border: item.name === activeTab ? '1px solid rgba(208, 213, 221, 1)' : 'none',
                  backgroundColor: item.name === activeTab ? '#FFFFFF' : 'transparent',
                  boxShadow: item.name === activeTab ? '0px 1px 2px rgba(16, 24, 40, 0.05)' : 'none',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                }}
              >
                <img src={item.icon} alt="" style={{ width: '12px', height: '12px', opacity: item.name === activeTab ? 1 : 0.6 }} />
                <span style={{ fontSize: '14px', fontWeight: 500, color: item.name === activeTab ? '#000000' : 'rgba(136, 136, 136, 1)', letterSpacing: '-0.28px' }}>
                  {item.name}
                </span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderTop: '1px solid rgba(237, 237, 237, 1)', paddingTop: '20px' }}>
              <div style={{ height: '5px', background: '#D9D9D9', borderRadius: '4px', marginBottom: '10px', position: 'relative' }}>
                <div style={{ width: '60.1px', height: '100%', background: '#000000', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'rgba(136, 136, 136, 1)' }}>
                <span>1.25 / 5 GB</span>
                <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#000' }}>Upgrade</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '9px' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/e2d2b693-44f7-4b3e-832b-d5f561337297.svg" alt="" style={{ width: '16px' }} />
                <span style={{ fontSize: '14px', color: '#444444' }}>Help</span>
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/d5414a1f-dcce-410f-b866-bb09f78bbbbb.svg" alt="" style={{ width: '16px' }} />
                <span style={{ fontSize: '14px', color: '#444444' }}>Settings</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{
          flexGrow: 1, backgroundColor: '#FFFFFF', borderRadius: '15px',
          margin: '22px 25px 22px 0', position: 'relative', overflow: 'hidden',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.02)',
        }}>
          {/* Header */}
          <header style={{ padding: '28px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/f72eef72-f74d-4ee6-9e71-08f0eb338e12.svg" alt="" style={{ width: '12px' }} />
              <div style={{ fontSize: '14px', display: 'flex', gap: '12px' }}>
                <span style={{ color: 'rgba(119, 119, 119, 1)' }}>Income X</span>
                <span style={{ color: '#000' }}>/</span>
                <span style={{ color: '#000' }}>Contacts</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/4e6f4eda-2eac-4e23-b040-2b59ad74cc97.svg" alt="Notifications" style={{ height: '18px' }} />
                <div style={{ position: 'absolute', top: '0', right: '-2px', width: '8.6px', height: '8.6px', backgroundColor: 'rgba(243, 44, 44, 1)', borderRadius: '50%' }} />
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: '1px solid rgba(208, 213, 221, 0.5)', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/9b70a18a-1cba-47bf-ab51-397918a7b4b9.jpg" alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  <span style={{ fontSize: '14px' }}>Medina Mendes</span>
                </div>
                <img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/d2fa0a3f-366d-46c2-a058-b47c6e533cce.svg" alt="" style={{ width: '10px' }} />
              </button>
            </div>
          </header>

          <div style={{ padding: '0 25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 35px 0' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 400, margin: 0 }}>Contacts</h1>
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '9px 16px', background: '#000', color: '#fff',
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 500, fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
                Add Contact
              </button>
            </div>

            {/* Search & Sort Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: '1px solid rgba(208, 213, 221, 0.5)', borderRadius: '8px', boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)' }}>
                  <img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/26730748-e657-458c-ad9e-456c1b7d5ac5.svg" alt="" style={{ width: '12px' }} />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ border: 'none', outline: 'none', fontSize: '14px', color: '#444', width: '140px', fontFamily: 'inherit' }}
                  />
                  {searchQuery && (
                    <motion.button
                      onClick={() => setSearchQuery('')}
                      initial="rest"
                      animate="rest"
                      whileHover="hover"
                      variants={{ rest: { backgroundColor: 'rgba(0,0,0,0)' }, hover: { backgroundColor: 'rgba(0,0,0,0.04)' } }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      style={{ width: '24px', height: '24px', background: 'none', border: 'none', borderRadius: '999px', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <motion.svg
                        width={16}
                        height={16}
                        viewBox="0 0 16 16"
                        fill="none"
                        variants={{ rest: { rotate: 0 }, hover: { rotate: 180 } }}
                        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                        style={{ transformOrigin: '50% 50%' }}
                      >
                        <path d="M4 4L12 12" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M12 4L4 12" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
                      </motion.svg>
                    </motion.button>
                  )}
                </div>
                <button
                  onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: '1px solid rgba(208, 213, 221, 0.5)', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer', boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)' }}
                >
                  <img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/96019b21-aeb9-46f5-8ead-21280cb12e44.svg" alt="" style={{ width: '20px' }} />
                  <span style={{ fontSize: '14px', fontWeight: 500, fontFamily: '"Inter", sans-serif' }}>
                    Sort by: Name ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})
                  </span>
                  <img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/3285d6aa-5ca1-4e14-b1a0-bc7692cf8b98.svg" alt="" style={{ width: '20px' }} />
                </button>
              </div>
              <div style={{ fontSize: '14px', color: '#000' }}>
                Total Members: {contacts.length}
                {searchQuery && filteredContacts.length !== contacts.length && (
                  <span style={{ color: '#888', marginLeft: '6px' }}>({filteredContacts.length} results)</span>
                )}
              </div>
            </div>

            {/* Table Header */}
            <div style={{ display: 'flex', backgroundColor: 'rgba(238, 238, 238, 0.3)', padding: '12px 11px', borderRadius: '7px', marginBottom: '8px' }}>
              <div style={{ width: '50px', fontSize: '14px', color: 'rgba(119, 119, 119, 1)' }}>S/N</div>
              <div style={{ width: '240px', fontSize: '14px', color: 'rgba(119, 119, 119, 1)' }}>Name</div>
              <div style={{ width: '250px', fontSize: '14px', color: 'rgba(119, 119, 119, 1)' }}>Email</div>
              <div style={{ width: '180px', fontSize: '14px', color: 'rgba(119, 119, 119, 1)' }}>Phone</div>
              <div style={{ flexGrow: 1, fontSize: '14px', color: 'rgba(119, 119, 119, 1)' }}>Company Name</div>
              <div style={{ width: '40px' }} />
            </div>

            {/* Table Body */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {paginatedContacts.length === 0 ? (
                <div style={{ padding: '40px 11px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
                  No contacts match your search.
                </div>
              ) : (
                paginatedContacts.map((contact, idx) => (
                  <div
                    key={contact.id}
                    style={{ display: 'flex', alignItems: 'center', padding: '10px 11px', borderRadius: '4px', transition: 'background-color 0.15s', position: 'relative' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(248, 248, 249, 1)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ width: '50px', fontSize: '14px', color: '#444' }}>
                      {(safePage - 1) * CONTACTS_PER_PAGE + idx + 1}
                    </div>
                    <div style={{ width: '240px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <ContactIcon contact={contact} />
                      <span style={{ fontSize: '14px', color: '#000' }}>{contact.name}</span>
                    </div>
                    <div style={{ width: '250px', fontSize: '14px', color: '#000' }}>{contact.email}</div>
                    <div style={{ width: '180px', fontSize: '14px', color: '#000' }}>{contact.phone}</div>
                    <div style={{ flexGrow: 1 }}>
                      <button style={{ fontSize: '14px', color: '#000', background: 'none', border: 'none', padding: 0, textDecoration: 'underline', cursor: 'pointer' }}>
                        {contact.company}
                      </button>
                    </div>
                    {/* Row actions */}
                    <div style={{ width: '40px', display: 'flex', justifyContent: 'center', position: 'relative' }} ref={actionMenuId === contact.id ? menuRef : null}>
                      <button
                        onClick={() => setActionMenuId(id => id === contact.id ? null : contact.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', color: '#888', fontSize: '16px', lineHeight: 1 }}
                      >
                        ⋯
                      </button>
                      {actionMenuId === contact.id && (
                        <div style={{
                          position: 'absolute', right: 0, top: '28px', background: '#fff',
                          border: '1px solid rgba(208,213,221,0.8)', borderRadius: '8px',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '120px', overflow: 'hidden',
                        }}>
                          <button
                            onClick={() => { setEditingContact(contact); setActionMenuId(null); }}
                            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#000' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(248,248,249,1)')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(contact.id)}
                            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: 'rgba(220,38,38,1)' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(254,242,242,1)')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div style={{ marginTop: '40px', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0' }}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(136, 136, 136, 1)' }}>
                {filteredContacts.length === 0 ? 'No results' : `Showing ${startEntry} - ${endEntry} of ${filteredContacts.length}`}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  style={{ background: 'none', border: 'none', cursor: safePage === 1 ? 'default' : 'pointer', opacity: safePage === 1 ? 0.35 : 1, padding: 0 }}
                >
                  <img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/a2a9245b-19fc-4560-8251-41710a3feb7f.svg" alt="Prev" />
                </button>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {visiblePageNumbers.map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} style={{ fontSize: '12px', fontWeight: 500, padding: '0 5px', fontFamily: '"Poppins", sans-serif' }}>...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        style={{
                          width: '24px', height: '24px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                          backgroundColor: p === safePage ? '#444' : '#fff',
                          color: p === safePage ? '#fff' : '#404B52',
                          border: p === safePage ? 'none' : '1px solid rgba(208, 213, 221, 0.5)',
                        }}
                      >{p}</button>
                    )
                  )}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  style={{ background: 'none', border: 'none', cursor: safePage === totalPages ? 'default' : 'pointer', opacity: safePage === totalPages ? 0.35 : 1, padding: 0 }}
                >
                  <img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/99b777d8-0342-4115-995b-29532c27bb7c.svg" alt="Next" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
