import React, { useState } from 'react';
const checkboxStyle: React.CSSProperties = {
  cursor: 'pointer',
  width: '14px',
  height: '14px',
  border: '1px solid rgba(208, 213, 221, 0.7)',
  borderRadius: '3px',
  appearance: 'none',
  WebkitAppearance: 'none',
  outline: 'none',
  flexShrink: 0,
  backgroundColor: '#FFF'
};
const PercentageBadge = ({
  value,
  isPositive = true
}: {
  value: string;
  isPositive?: boolean;
}) => <div style={{
  width: '59px',
  height: '26px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '8px 12px',
  gap: '7px',
  backgroundColor: isPositive ? 'rgba(21, 150, 0, 0.1)' : 'rgba(228, 44, 44, 0.1)',
  borderRadius: '10px',
  overflow: 'hidden'
}}>
    <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }}>
      <img src={isPositive ? "https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/292003e2-c325-4519-b04f-e6840a857962.svg" : "https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/d7f17ec3-c44a-4900-81cf-47524eaeccd4.svg"} alt="trend" style={{
      width: '7.5px',
      height: '10px'
    }} />
      <span style={{
      color: isPositive ? 'rgba(21, 150, 0, 1)' : 'rgba(228, 44, 44, 1)',
      fontSize: '14px',
      fontFamily: '"Approach TRIAL", sans-serif',
      fontWeight: 500,
      letterSpacing: '-0.28px'
    }}>{value}</span>
    </div>
  </div>;
const StatCard = ({
  title,
  amount,
  subtext,
  percentage,
  isPositive,
  icon
}: {
  title: string;
  amount: string;
  subtext: string;
  percentage: string;
  isPositive: boolean;
  icon: string;
}) => <div style={{
  borderColor: 'rgba(208, 213, 221, 0.5)',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderRadius: '8px',
  padding: '25px',
  flex: 1,
  minWidth: '240px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  backgroundColor: '#FFF'
}}>
    <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '24px'
  }}>
      <img src={icon} alt={title} style={{
      width: '10px',
      height: '10px'
    }} />
      <span style={{
      color: 'rgba(119, 119, 119, 1)',
      fontSize: '14px',
      fontWeight: 500,
      fontFamily: '"Approach TRIAL", sans-serif'
    }}>{title}</span>
    </div>
    <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  }}>
      <span style={{
      color: '#000',
      fontSize: '26px',
      fontFamily: '"Approach TRIAL", sans-serif'
    }}>{amount}</span>
      <PercentageBadge value={percentage} isPositive={isPositive} />
    </div>
    <span style={{
    marginTop: '12px',
    color: isPositive ? 'rgba(21, 150, 0, 1)' : 'rgba(228, 44, 44, 1)',
    fontSize: '12px',
    fontFamily: '"Approach TRIAL", sans-serif'
  }}>{subtext}</span>
  </div>;
const SidebarItem = ({
  icon,
  label,
  active = false,
  onClick
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => <button onClick={onClick} style={{
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  padding: '10px 12px',
  gap: '12px',
  backgroundColor: active ? 'rgba(255, 255, 255, 1)' : 'transparent',
  border: active ? '1px solid rgba(208, 213, 221, 1)' : 'none',
  borderRadius: '8px',
  boxShadow: active ? '0px 1px 2px rgba(16, 24, 40, 0.05)' : 'none',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.2s ease'
}}>
    <img src={icon} alt={label} style={{
    width: label === 'Analytics' ? '9px' : '12px',
    height: '12px'
  }} />
    <span style={{
    color: active ? '#000' : 'rgba(136, 136, 136, 1)',
    fontSize: '14px',
    fontWeight: 500,
    fontFamily: '"Approach TRIAL", sans-serif'
  }}>{label}</span>
  </button>;
const TransactionRow = ({
  logo,
  entity,
  date,
  desc,
  amount,
  status,
  isNegative = true
}: any) => <div style={{
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '12px 25px',
  borderBottom: '1px solid rgba(208, 213, 221, 0.2)',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease'
}} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(248, 248, 249, 0.5)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
    {/* Checkbox */}
    <div style={{
    width: '40px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center'
  }}>
      <input type="checkbox" style={checkboxStyle} />
    </div>
    {/* To/From */}
    <div style={{
    width: '196px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginRight: '72px'
  }}>
      <div style={{
      width: '20px',
      height: '20px',
      backgroundColor: logo.bg || '#FFF',
      border: logo.border || 'none',
      borderRadius: '3px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      flexShrink: 0
    }}>
        <img src={logo.src} alt="" style={{
        width: '12px'
      }} />
      </div>
      <span style={{
      fontSize: '14px',
      color: '#000',
      fontFamily: '"Approach TRIAL", sans-serif'
    }}>{entity}</span>
    </div>
    {/* Date */}
    <div style={{
    width: '100px',
    flexShrink: 0,
    marginRight: '72px'
  }}>
      <span style={{
      fontSize: '14px',
      color: '#000',
      fontFamily: '"Approach TRIAL", sans-serif'
    }}>{date}</span>
    </div>
    {/* Description */}
    <div style={{
    width: '110px',
    flexShrink: 0,
    marginRight: '60px'
  }}>
      <span style={{
      fontSize: '14px',
      color: '#000',
      fontFamily: '"Approach TRIAL", sans-serif'
    }}>{desc}</span>
    </div>
    {/* Amount */}
    <div style={{
    width: '90px',
    flexShrink: 0,
    marginRight: '60px'
  }}>
      <span style={{
      fontSize: '14px',
      color: isNegative ? 'rgba(228, 44, 44, 1)' : 'rgba(21, 150, 0, 1)',
      fontWeight: 500,
      fontFamily: '"Approach TRIAL", sans-serif'
    }}>{amount}</span>
    </div>
    {/* Status */}
    <div style={{
    width: '105px',
    flexShrink: 0
  }}>
      <button style={{
      padding: '6px 20px',
      backgroundColor: '#FFF',
      border: '1px solid rgba(21, 150, 0, 1)',
      borderRadius: '100px',
      color: 'rgba(21, 150, 0, 1)',
      fontSize: '14px',
      cursor: 'pointer',
      textDecoration: 'none',
      fontFamily: '"Approach TRIAL", sans-serif'
    }}>{status}</button>
    </div>
  </div>;

// ─── Statistics Bar Chart ───────────────────────────────────────────────────
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const chartData = [{
  earned: 820,
  spent: 480
}, {
  earned: 650,
  spent: 390
}, {
  earned: 900,
  spent: 520
}, {
  earned: 740,
  spent: 410
}, {
  earned: 980,
  spent: 600
}, {
  earned: 860,
  spent: 470
}, {
  earned: 1000,
  spent: 580
}, {
  earned: 780,
  spent: 430
}, {
  earned: 920,
  spent: 550
}, {
  earned: 690,
  spent: 360
}, {
  earned: 850,
  spent: 500
}, {
  earned: 760,
  spent: 440
}] as any[];
const Y_LABELS = [1000, 800, 600, 400, 200, 0];
const Y_MAX = 1000;
const StatisticsChart = () => {
  const chartHeight = 200;
  const yAxisWidth = 45;
  const leftGap = 20;
  const monthLabelGap = 10;
  return <div style={{
    width: '100%',
    position: 'relative'
  }}>
      <div style={{
      display: 'flex',
      width: '100%'
    }}>
        <div style={{
        width: `${yAxisWidth}px`,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: `${chartHeight}px`,
        paddingBottom: 0,
        boxSizing: 'border-box'
      }}>
          {Y_LABELS.map(v => <span key={v} style={{
          fontSize: '11px',
          color: '#888',
          fontFamily: '"Approach TRIAL", sans-serif',
          textAlign: 'right',
          display: 'block',
          lineHeight: 1
        }}>{v === 1000 ? '1,000' : v}</span>)}
        </div>

        <div style={{
        flex: 1,
        marginLeft: `${leftGap}px`,
        height: `${chartHeight}px`,
        position: 'relative',
        boxSizing: 'border-box'
      }}>
          {Y_LABELS.map((v, i) => {
          const topPct = i / (Y_LABELS.length - 1) * 100;
          return <div key={v} style={{
            position: 'absolute',
            top: `${topPct}%`,
            left: 0,
            right: 0,
            height: '1px',
            backgroundColor: '#F2F4F7',
            zIndex: 0,
            transform: i === 0 ? 'translateY(0.5px)' : i === Y_LABELS.length - 1 ? 'translateY(-0.5px)' : 'none'
          }} />;
        })}

          <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          zIndex: 1,
          paddingBottom: 0
        }}>
            {chartData.map((d, i) => <div key={i} style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '3px',
            flex: 1,
            justifyContent: 'center'
          }}>
                <div style={{
              width: '10px',
              height: `${d.earned / Y_MAX * chartHeight}px`,
              backgroundColor: '#377CF6',
              borderRadius: '3px 3px 0 0'
            }} />
                <div style={{
              width: '10px',
              height: `${d.spent / Y_MAX * chartHeight}px`,
              backgroundColor: '#95E0FB',
              borderRadius: '3px 3px 0 0'
            }} />
              </div>)}
          </div>
        </div>
      </div>

      <div style={{
      display: 'flex',
      marginTop: `${monthLabelGap}px`,
      paddingLeft: `${yAxisWidth + leftGap}px`,
      boxSizing: 'border-box'
    }}>
        {MONTHS.map(m => <div key={m} style={{
        flex: 1,
        textAlign: 'center',
        fontSize: '11px',
        color: '#888',
        fontFamily: '"Approach TRIAL", sans-serif'
      }}>{m}</div>)}
      </div>
    </div>;
};

// ─── Spend Breakdown ────────────────────────────────────────────────────────
const spendCategories = [{
  label: 'Shipping Costs',
  val: '-$125',
  pct: '17.2%',
  trend: '-3.5%',
  color: '#1A3A8F',
  trendColor: '#159600'
}, {
  label: 'Deliveries',
  val: '-$110',
  pct: '15.1%',
  trend: '+4.0%',
  color: '#2D5BFF',
  trendColor: '#E42C2C'
}, {
  label: 'Web. Maintenance',
  val: '-$70',
  pct: '9.6%',
  trend: '+0.0%',
  color: '#4C7EFF',
  trendColor: 'rgba(0,0,0,0.35)'
}, {
  label: 'Software Licenses',
  val: '-$95',
  pct: '13.1%',
  trend: '+2.1%',
  color: '#5BB8E8',
  trendColor: '#E42C2C'
}, {
  label: 'Advertising',
  val: '-$140',
  pct: '19.3%',
  trend: '+6.2%',
  color: '#77D4F5',
  trendColor: '#E42C2C'
}, {
  label: 'Office Supplies',
  val: '-$85',
  pct: '11.7%',
  trend: '-1.2%',
  color: '#95E0FB',
  trendColor: '#159600'
}, {
  label: 'Miscellaneous',
  val: '-$102',
  pct: '14.0%',
  trend: '+0.8%',
  color: '#B8C4D4',
  trendColor: '#E42C2C'
}] as any[];
const buildConicGradient = (categories: typeof spendCategories) => {
  const total = categories.reduce((sum, c) => sum + Math.abs(parseFloat(c.pct)), 0);
  let cursor = 0;
  const stops: string[] = [];
  categories.forEach(c => {
    const share = Math.abs(parseFloat(c.pct)) / total * 360;
    stops.push(`${c.color} ${cursor.toFixed(1)}deg ${(cursor + share).toFixed(1)}deg`);
    cursor += share;
  });
  return `conic-gradient(${stops.join(', ')})`;
};
const SpendBreakdown = () => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? spendCategories : spendCategories.slice(0, 3);
  return <div style={{
    flex: '1',
    minWidth: '300px',
    height: '356px',
    backgroundColor: '#FFF',
    border: '1px solid rgba(208, 213, 221, 0.5)',
    borderRadius: '8px',
    padding: '25px',
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  }}>
      <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    }}>
        <h3 style={{
        fontSize: '18px',
        margin: 0,
        fontWeight: 500,
        fontFamily: '"Approach TRIAL", sans-serif'
      }}>
          Spend Breakdown
        </h3>
        <button style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 16px',
        border: '1px solid rgba(208, 213, 221, 0.5)',
        borderRadius: '8px',
        background: '#FFF',
        cursor: 'pointer',
        fontSize: '14px',
        fontFamily: '"Approach TRIAL", sans-serif'
      }}>
          Month&nbsp;<img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/75edc13f-6ea6-4659-b53b-40b5db2828b7.svg" alt="" style={{
          width: '20px'
        }} />
        </button>
      </div>

      <div style={{
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '14px'
    }}>
        <div style={{
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: buildConicGradient(spendCategories),
        position: 'relative'
      }}>
          <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '48px',
          height: '48px',
          backgroundColor: '#FFF',
          borderRadius: '50%'
        }} />
        </div>
      </div>

      <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '11px',
      flex: 1
    }}>
        {visible.map((item, idx) => <div key={idx} style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '13px',
        alignItems: 'center'
      }}>
            <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          width: '130px'
        }}>
              <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: item.color,
            flexShrink: 0
          }} />
              <span style={{
            whiteSpace: 'nowrap',
            fontFamily: '"Approach TRIAL", sans-serif',
            color: '#000'
          }}>{item.label}</span>
            </div>
            <span style={{
          width: '40px',
          fontFamily: '"Approach TRIAL", sans-serif',
          color: '#000'
        }}>{item.val}</span>
            <span style={{
          color: '#888',
          fontFamily: '"Approach TRIAL", sans-serif'
        }}>({item.pct})</span>
            <span style={{
          color: item.trendColor,
          fontFamily: '"Approach TRIAL", sans-serif'
        }}>{item.trend}</span>
          </div>)}
      </div>

      <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '10px'
    }}>
        <button onClick={() => setShowAll(v => !v)} style={{
        background: 'none',
        border: 'none',
        color: '#888',
        cursor: 'pointer',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: 0,
        fontFamily: '"Approach TRIAL", sans-serif'
      }}>
          {showAll ? 'Show Less' : 'View All'}
          <span style={{
          fontSize: '13px',
          color: '#888'
        }}>›</span>
        </button>
      </div>
    </div>;
};

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('Analytics');
  const [selectAll, setSelectAll] = useState(false);
  return <div style={{
    width: '100%',
    minHeight: '1025px',
    backgroundColor: 'rgba(248, 248, 249, 1)',
    display: 'flex',
    padding: '20px',
    boxSizing: 'border-box',
    fontFamily: '"Approach TRIAL", sans-serif'
  }}>
      {/* Sidebar */}
      <aside style={{
      width: '280px',
      display: 'flex',
      flexDirection: 'column',
      padding: '5px 25px 25px 5px',
      boxSizing: 'border-box'
    }}>
        <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '40px',
        paddingLeft: '20px'
      }}>
          <div style={{
          width: '40px',
          height: '40px',
          background: 'linear-gradient(180deg, #FFF 0%, #D0D5DD 100%)',
          border: '0.3px solid #D0D5DD',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
            <img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/eaac6762-ce46-4eac-8deb-fa819d044d4d.svg" alt="logo" style={{
            width: '100%'
          }} />
          </div>
          <span style={{
          fontSize: '18px',
          fontWeight: 600,
          letterSpacing: '-0.18px'
        }}>Income S</span>
        </div>

        <nav style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flex: 1
      }}>
          <SidebarItem icon="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/3e2e1d86-1cbc-47c5-9e15-c0f340498dac.svg" label="Home" active={activeTab === 'Home'} onClick={() => setActiveTab('Home')} />
          <SidebarItem icon="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/5e903e62-af65-46cb-8ed7-be32ecc8d5a5.svg" label="Analytics" active={activeTab === 'Analytics'} onClick={() => setActiveTab('Analytics')} />
          <SidebarItem icon="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/56eea5ec-06c8-424c-8eec-d9fb8efe2ff1.svg" label="Contacts" active={activeTab === 'Contacts'} onClick={() => setActiveTab('Contacts')} />
          <SidebarItem icon="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/d24a365a-1cc3-44e5-9772-a5d160a7c77b.svg" label="Incomes" active={activeTab === 'Incomes'} onClick={() => setActiveTab('Incomes')} />
          <SidebarItem icon="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/09865831-8cca-4411-86bc-cf580009140b.svg" label="Expenses" active={activeTab === 'Expenses'} onClick={() => setActiveTab('Expenses')} />
        </nav>

        <div style={{
        marginTop: 'auto'
      }}>
          <div style={{
          marginBottom: '24px'
        }}>
            <div style={{
            height: '5px',
            backgroundColor: '#D9D9D9',
            borderRadius: '4px',
            position: 'relative',
            marginBottom: '10px'
          }}>
              <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '26%',
              backgroundColor: '#000',
              borderRadius: '4px'
            }} />
            </div>
            <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px',
            color: '#888'
          }}>
              <span>1.25 / 5 GB</span>
              <button style={{
              background: 'none',
              border: 'none',
              color: '#000',
              cursor: 'pointer',
              fontSize: '14px',
              padding: 0
            }}>Upgrade</button>
            </div>
          </div>
          <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          paddingLeft: '9px',
          borderTop: '1px solid #EDECEC',
          paddingTop: '24px'
        }}>
            <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#444',
            fontSize: '14px'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/8d21a089-3648-4b0b-99ce-f3af2e439dbc.svg" alt="" style={{
              width: '16px'
            }} /> Help
            </button>
            <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#444',
            fontSize: '14px'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/deafcef4-a0ac-4007-aada-51af75df9490.svg" alt="" style={{
              width: '16px'
            }} /> Settings
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
      flex: 1,
      backgroundColor: '#FFF',
      borderRadius: '15px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
        {/* Header */}
        <header style={{
        padding: '18px 25px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
          <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
            <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/39cdd312-9b61-4a52-baa5-7b9ec969cff9.svg" alt="icon" style={{
              width: '9px'
            }} />
              <div style={{
              fontSize: '14px',
              display: 'flex',
              gap: '12px'
            }}>
                <span style={{
                color: '#777'
              }}>Income X</span>
                <span style={{
                color: '#000'
              }}>/</span>
                <span style={{
                color: '#000'
              }}>Analytics</span>
              </div>
            </div>
            <h1 style={{
            fontSize: '24px',
            fontWeight: 400,
            margin: '20px 0 0 0'
          }}>Analytics</h1>
          </div>

          <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '40px'
        }}>
            <button style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            position: 'relative'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/4d4b8f58-ca87-408a-8268-c53dd3ee41de.svg" alt="notifications" />
              <div style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '8.6px',
              height: '8.6px',
              backgroundColor: '#F32C2C',
              borderRadius: '50%'
            }} />
            </button>
            <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px',
            border: '1px solid rgba(208, 213, 221, 0.5)',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/758bcb6e-70a9-48ca-8ed8-3ee60dea88c5.jpg" alt="avatar" style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%'
            }} />
              <span style={{
              fontSize: '14px'
            }}>Medina Mendes</span>
              <img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/f036a57f-9442-4d88-b666-e0b74ab96814.svg" alt="dropdown" />
            </div>
          </div>
        </header>

        <div style={{
        padding: '25px',
        overflowY: 'auto'
      }}>
          {/* Stats Grid */}
          <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
            <StatCard title="Earned" amount="$1000.00" subtext="$100 more than November" percentage="10%" isPositive={true} icon="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/014a0924-f3b1-4d18-8028-7cf395eea7e4.svg" />
            <StatCard title="Spent" amount="$600.24" subtext="$100 more than November" percentage="10%" isPositive={false} icon="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/1e97b8bd-d214-47a4-847e-275e7626a8df.svg" />
            <StatCard title="Saved" amount="$200.07" subtext="$20 more than November" percentage="8%" isPositive={true} icon="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/cb4ca95a-8ffa-47f1-b6df-79cb827735bd.svg" />
            <StatCard title="Invested" amount="$199.69" subtext="+$20 more than November" percentage="10%" isPositive={true} icon="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/0e540694-ffe6-472d-839e-5cc1179fe992.svg" />
          </div>

          {/* Charts Row */}
          <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
            {/* Statistics Chart */}
            <div style={{
            flex: '2',
            minWidth: '600px',
            backgroundColor: '#FFF',
            border: '1px solid rgba(208, 213, 221, 0.5)',
            borderRadius: '8px',
            padding: '25px',
            boxSizing: 'border-box',
            position: 'relative'
          }}>
              <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
                <h3 style={{
                fontSize: '18px',
                margin: 0,
                fontWeight: 500,
                fontFamily: '"Approach TRIAL", sans-serif'
              }}>Statistics</h3>
                <div style={{
                display: 'flex',
                gap: '15px',
                alignItems: 'center'
              }}>
                  <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontFamily: '"Approach TRIAL", sans-serif'
                }}>
                    <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#377CF6'
                  }} /> Earned
                  </div>
                  <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontFamily: '"Approach TRIAL", sans-serif'
                }}>
                    <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#95E0FB'
                  }} /> Spent
                  </div>
                  <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 16px',
                  border: '1px solid rgba(208, 213, 221, 0.5)',
                  borderRadius: '8px',
                  background: '#FFF',
                  cursor: 'pointer',
                  fontFamily: '"Approach TRIAL", sans-serif',
                  fontSize: '14px'
                }}>
                    Yearly&nbsp;<img src="https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/65bc4581-aeec-47ac-8a0f-79e059030bb7.svg" alt="" style={{
                    width: '20px'
                  }} />
                  </button>
                </div>
              </div>
              <StatisticsChart />
            </div>

            {/* Spend Breakdown */}
            <SpendBreakdown />
          </div>

          {/* Transactions Table */}
          <section style={{
          border: '1px solid rgba(208, 213, 221, 0.5)',
          borderRadius: '8px',
          backgroundColor: '#FFF'
        }}>
            <div style={{
            padding: '25px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
              <h3 style={{
              fontSize: '18px',
              margin: 0,
              fontWeight: 500,
              fontFamily: '"Approach TRIAL", sans-serif'
            }}>Latest Transactions</h3>
            </div>

            {/* Table Header */}
            <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 25px',
            color: '#666',
            fontSize: '14px',
            borderBottom: '1px solid rgba(208, 213, 221, 0.2)'
          }}>
              {/* Select-all checkbox */}
              <div style={{
              width: '40px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center'
            }}>
                <input type="checkbox" checked={selectAll} onChange={e => setSelectAll(e.target.checked)} style={checkboxStyle} />
              </div>
              <div style={{
              width: '196px',
              flexShrink: 0,
              marginRight: '72px'
            }}>To/From:</div>
              <div style={{
              width: '100px',
              flexShrink: 0,
              marginRight: '72px'
            }}>Date</div>
              <div style={{
              width: '110px',
              flexShrink: 0,
              marginRight: '60px'
            }}>Description</div>
              <div style={{
              width: '90px',
              flexShrink: 0,
              marginRight: '60px'
            }}>Amount</div>
              <div style={{
              width: '105px',
              flexShrink: 0
            }}>Status</div>
            </div>

            {/* Rows */}
            <TransactionRow logo={{
            src: "https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/96120dbc-a72e-4677-944b-003188314ee2.svg",
            border: "1px solid #000"
          }} entity="Augment LLC" date="6 Dec, 2023" desc="Internet Bill" amount="-$24.00" status="Success" />
            <TransactionRow logo={{
            src: "https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/c378731f-4693-44ef-91b6-91bd4b9b0237.svg",
            bg: "#FF4B4B"
          }} entity="FierceExchance Inc" date="5 Dec, 2023" desc="Trade: Buy" amount="+360.00" status="Success" isNegative={false} />
            <TransactionRow logo={{
            src: "https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/0a2481b0-a334-4fd4-9747-ac07982d8209.svg",
            bg: "#FF4B4B"
          }} entity="FierceExchance Inc" date="5 Dec, 2023" desc="Trade: Sell" amount="-$340.00" status="Success" />
            <TransactionRow logo={{
            src: "https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/3f03dafd-eab5-41f6-9943-013a0267566d.svg",
            border: "1px solid #000"
          }} entity="Augment LLC" date="4 Dec, 2024" desc="Service Fee" amount="-$15.00" status="Success" />
            <TransactionRow logo={{
            src: "https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/bd04d485-acd2-4959-a448-f1aaced9fc81.svg",
            bg: "#4353FF"
          }} entity="Gaant Giant" date="3 Dec, 2023" desc="Webflow" amount="-$49.00" status="Success" />
            <TransactionRow logo={{
            src: "https://storage.googleapis.com/storage.magicpath.ai/user/367784284687310848/figma-assets/98e93cea-45e7-4de5-a10c-41ce726abdc2.svg",
            border: "1px solid #000"
          }} entity="Harry Mants" date="2 Dec, 2023" desc="Cuboid" amount="-$32.00" status="Success" />
          </section>
        </div>
      </main>
    </div>;
};