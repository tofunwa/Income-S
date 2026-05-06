import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeBuoy, BookOpen, Keyboard, Mail } from 'lucide-react';

import { SlidingTextSwapButton, CloseButton } from './interactionPrimitives';

const font = '"Approach TRIAL", sans-serif';

const cardStyle: React.CSSProperties = {
  border: '1px solid rgba(208,213,221,0.5)',
  borderRadius: '12px',
  padding: '18px',
  backgroundColor: '#FFFFFF',
};

const pillStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: '999px',
  fontSize: '11px',
  fontFamily: font,
  backgroundColor: 'rgba(0,0,0,0.04)',
  color: '#555',
};

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  border: '1px solid #D0D5DD',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: font,
  color: '#111',
  boxSizing: 'border-box',
  outline: 'none',
  boxShadow: '0px 1px 2px rgba(16,24,40,0.05)',
};

const sections = ['Overview', 'Shortcuts', 'Support'] as const;
type SectionId = (typeof sections)[number];

export const HelpPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('Overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showChangelog, setShowChangelog] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<'Getting Started' | 'Common Questions' | 'Contact Support' | null>('Getting Started');

  useEffect(() => {
    if (!showChangelog) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowChangelog(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showChangelog]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden', width: '100%' }}>
      <h1 style={{ fontSize: '24px', fontFamily: font, fontWeight: 400, margin: '0 0 24px 0', letterSpacing: '-0.48px', flexShrink: 0 }}>
        Help &amp; Support
      </h1>

      <div style={{ marginBottom: '20px', flexShrink: 0, maxWidth: '560px' }}>
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search help and FAQs"
          aria-label="Search help and FAQs"
          style={{
            ...inputStyle,
            width: '100%',
            maxWidth: '100%',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0, alignItems: 'stretch' }}>
        {/* Left rail — width matches Settings tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '160px', width: '160px', flexShrink: 0 }}>
          {sections.map(section => {
            const isActive = activeSection === section;
            return (
              <motion.button
                key={section}
                type="button"
                onClick={() => setActiveSection(section)}
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
                {section}
              </motion.button>
            );
          })}
        </div>

        <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeSection === 'Overview' && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ ...cardStyle, display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '999px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LifeBuoy size={18} color="#fff" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '14px', fontFamily: font, fontWeight: 500 }}>Getting started with Income S</div>
                    <span style={pillStyle}>Guide</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', fontFamily: font, color: '#555', lineHeight: 1.5 }}>
                    Track incomes and expenses, explore analytics, and keep contacts in one place. Use the left sidebar to jump between views,
                    and the period selector in Home to change the time window.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ ...cardStyle, flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={16} />
                    <span style={{ fontSize: '13px', fontFamily: font, fontWeight: 500 }}>Understanding analytics</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', fontFamily: font, color: '#666', lineHeight: 1.5 }}>
                    The Analytics view summarizes performance over the selected period. Look for trends in total income, tax, and net amounts
                    to quickly spot anomalies.
                  </p>
                </div>

                <div style={{ ...cardStyle, flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={16} />
                    <span style={{ fontSize: '13px', fontFamily: font, fontWeight: 500 }}>Working with contacts</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', fontFamily: font, color: '#666', lineHeight: 1.5 }}>
                    Use Contacts to see key companies you work with, their history, and totals paid this year. Open a contact from the table to
                    inspect details and recent activity.
                  </p>
                </div>
              </div>

              {/* FAQ accordion */}
              <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '13px', fontFamily: font, fontWeight: 500, marginBottom: '4px' }}>Quick answers</div>

                {[
                  {
                    id: 'Getting Started' as const,
                    title: 'Getting Started',
                    items: [
                      {
                        q: 'How to add a new income/expense',
                        a: 'Use the primary actions in the Home or Incomes/Expenses views to add a new transaction. Fill in amount, date, company, and category, then save to update your totals.',
                      },
                      {
                        q: 'How to categorize transactions (e.g. Exchange, Bill)',
                        a: 'When creating or editing a transaction, choose the most relevant tag (such as Exchange or Bill). Categories help Analytics summarize where money is coming from and going.',
                      },
                    ],
                  },
                  {
                    id: 'Common Questions' as const,
                    title: 'Common Questions',
                    items: [
                      {
                        q: 'How do recurring transactions work?',
                        a: 'Recurring transactions are marked with a frequency (for example Monthly). They repeat on a schedule so you can quickly spot fixed costs in Analytics.',
                      },
                      {
                        q: 'How to export data?',
                        a: 'Go to Settings → Data & Export and choose Export CSV or Export PDF. You can use these files to share a snapshot with your accountant or team.',
                      },
                      {
                        q: 'Why is my total not updating?',
                        a: 'Totals update when a transaction is successfully saved. If something looks off, check that the transaction date is within the selected period and that the type (income or expense) is correct.',
                      },
                    ],
                  },
                  {
                    id: 'Contact Support' as const,
                    title: 'Contact Support',
                    items: [],
                  },
                ].map(section => {
                  const isOpen = openAccordion === section.id;
                  return (
                    <div key={section.id} style={{ borderRadius: '8px', border: '1px solid rgba(208,213,221,0.5)', overflow: 'hidden' }}>
                      <motion.button
                        type="button"
                        onClick={() => setOpenAccordion(isOpen ? null : section.id)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: isOpen ? 'rgba(0,0,0,0.02)' : '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontFamily: font,
                          textAlign: 'left',
                        }}
                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>{section.title}</span>
                        <span style={{ fontSize: '14px' }}>{isOpen ? '−' : '+'}</span>
                      </motion.button>
                      <AnimatePresence initial={false}>
                        {isOpen && section.id !== 'Contact Support' && (
                          <motion.div
                            key="content"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            style={{ padding: '10px 12px', borderTop: '1px solid #F0F0F0', display: 'flex', flexDirection: 'column', gap: '8px' }}
                          >
                            {section.items.map(item => (
                              <div key={item.q}>
                                <div style={{ fontSize: '12px', fontFamily: font, fontWeight: 500, marginBottom: '2px' }}>{item.q}</div>
                                <div style={{ fontSize: '12px', fontFamily: font, color: '#666', lineHeight: 1.5 }}>{item.a}</div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                        {isOpen && section.id === 'Contact Support' && (
                          <motion.div
                            key="contact-content"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            style={{ padding: '10px 12px', borderTop: '1px solid #F0F0F0', display: 'flex', flexDirection: 'column', gap: '6px' }}
                          >
                            <div style={{ fontSize: '12px', fontFamily: font, color: '#666' }}>
                              Email us any time at{' '}
                              <a
                                href="mailto:support@incomes.co"
                                style={{ color: '#000', textDecoration: 'underline', transition: 'color 0.2s ease' }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = '#666'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = '#000'; }}
                              >
                                support@incomes.co
                              </a>
                              .
                            </div>
                            <div style={{ fontSize: '12px', fontFamily: font, color: '#666' }}>
                              For more options (including quick feedback), open the <span style={{ fontWeight: 500 }}>Support</span> tab.
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeSection === 'Shortcuts' && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Keyboard size={18} />
                <div style={{ fontSize: '14px', fontFamily: font, fontWeight: 500 }}>Keyboard hints</div>
              </div>
              <div style={{ height: '1px', backgroundColor: '#EEEEEE' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { key: '↑ / ↓', desc: 'Scroll through tables and lists.' },
                  { key: 'Tab', desc: 'Jump between interactive elements such as filters and inputs.' },
                  { key: 'Esc', desc: 'Close open menus, popovers, and dialogs.' },
                ].map(item => (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ flex: '1 1 180px', fontSize: '12px', fontFamily: font, color: '#666', lineHeight: 1.5, minWidth: 0 }}>
                      {item.desc}
                    </span>
                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: '12px',
                        fontFamily: font,
                        color: '#111',
                        borderRadius: '6px',
                        border: '1px solid #D0D5DD',
                        padding: '4px 8px',
                        backgroundColor: '#F9FAFB',
                        lineHeight: 1.25,
                      }}
                    >
                      {item.key}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === 'Support' && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Mail size={18} />
                  <div style={{ fontSize: '14px', fontFamily: font, fontWeight: 500 }}>Contact support</div>
                </div>
                <p style={{ margin: 0, fontSize: '12px', fontFamily: font, color: '#666', lineHeight: 1.5 }}>
                  Have a question or spotted something that looks off? Share as much context as you can (what you tried, what you expected,
                  and any screenshots) so we can respond quickly.
                </p>
                <div style={{ fontSize: '12px', fontFamily: font, color: '#666' }}>
                  Email us at{' '}
                  <a
                    href="mailto:support@incomes.co"
                    style={{ color: '#000', textDecoration: 'underline', transition: 'color 0.2s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#666'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#000'; }}
                  >
                    support@incomes.co
                  </a>
                  .
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <SlidingTextSwapButton
                    variant="secondary"
                    label="Email support"
                    onClick={() => { window.location.href = 'mailto:support@incomes.co'; }}
                  />
                  <SlidingTextSwapButton
                    variant="primary"
                    label="View docs"
                    onClick={() => { /* View docs placeholder */ }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                  <label style={{ fontSize: '12px', fontFamily: font, color: '#666' }}>Quick feedback</label>
                  <textarea
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    rows={3}
                    placeholder="Share what you were trying to do and what happened instead."
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #D0D5DD',
                      resize: 'vertical',
                      fontSize: '12px',
                      fontFamily: font,
                      boxSizing: 'border-box',
                    }}
                  />
                  <SlidingTextSwapButton
                    variant="primary"
                    label="Submit"
                    onClick={() => {
                      // Placeholder: send feedback somewhere
                      // eslint-disable-next-line no-console
                      console.log('Help feedback:', feedback);
                      setFeedback('');
                    }}
                    style={{ alignSelf: 'flex-start', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontFamily: font, fontWeight: 500 }}>Something not clear?</div>
                  <div style={{ fontSize: '12px', fontFamily: font, color: '#666', marginTop: '4px' }}>Use Settings &gt; Data &amp; Export to grab a quick CSV or PDF when you need to share data.</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

          {/* Footer — stays below scroll area */}
          <div
            style={{
              flexShrink: 0,
              marginTop: 'auto',
              paddingTop: '16px',
              borderTop: '1px solid #EEEEEE',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
              fontSize: '12px',
              fontFamily: font,
              color: '#777',
            }}
          >
            <span>Want to see what changed recently?</span>
            <button
              type="button"
              onClick={() => setShowChangelog(true)}
              style={{ border: 'none', background: 'none', padding: 0, fontSize: '12px', fontFamily: font, color: '#000', cursor: 'pointer', textDecoration: 'underline', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#666'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#000'; }}
            >
              What&apos;s new
            </button>
          </div>
        </div>
      </div>

      {showChangelog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowChangelog(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2 }}
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px 22px', maxWidth: '420px', width: '90%', boxShadow: '0px 24px 48px rgba(0,0,0,0.12)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '15px', fontFamily: font, fontWeight: 500 }}>Changelog</div>
              <CloseButton onClick={() => setShowChangelog(false)} size="sm" />
            </div>
            <div style={{ fontSize: '12px', fontFamily: font, color: '#666', marginBottom: '10px' }}>A few recent updates to Income S.</div>

            <div style={{ borderRadius: '8px', border: '1px solid rgba(208,213,221,0.6)', overflow: 'hidden' }}>
              {[
                { date: 'Feb 2026', title: 'Added profile editing', body: 'Update your name, role, and avatar from the profile menu.' },
                { date: 'Jan 2026', title: 'Improved analytics cards', body: 'Cleaner totals and better summaries for each period.' },
                { date: 'Dec 2025', title: 'Public beta launch', body: 'Opened Income S to early teams to track their cashflow.' },
              ].map((entry, idx) => (
                <div key={entry.title} style={{ padding: '10px 12px', borderTop: idx === 0 ? 'none' : '1px solid #F0F0F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontSize: '12px', fontFamily: font, fontWeight: 500 }}>{entry.title}</span>
                    <span style={{ fontSize: '11px', fontFamily: font, color: '#888' }}>{entry.date}</span>
                  </div>
                  <div style={{ fontSize: '12px', fontFamily: font, color: '#666' }}>{entry.body}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

