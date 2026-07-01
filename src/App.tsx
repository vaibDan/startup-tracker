import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  Upload, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Sun, 
  Moon, 
  Building2, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  X, 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown, 
  AlertCircle,
  FileSpreadsheet,
  UserCheck,
  MessageSquare,
  Network
} from 'lucide-react';
import type { Startup, Contact, RoleRelevance, OutreachStatus, ConnectionStatus, DMStatus } from './types';
import { seedStartups, seedContacts } from './seedData';
import './App.css';

const LOCAL_STORAGE_KEY_STARTUPS = 'indisight_startups';
const LOCAL_STORAGE_KEY_CONTACTS = 'indisight_contacts';
const THEME_KEY = 'indisight_theme';

// Initial state forms
const initialStartupFormState = {
  company: '',
  url: '',
  description: '',
  sector: '',
  investor: '',
  fundingStage: '',
  amount: '',
  teamSize: 1,
  hiring: false,
  relevance: 'High' as RoleRelevance,
  founderLinkedin: '',
  outreachStatus: 'Not Started' as OutreachStatus,
  lastContactDate: new Date().toISOString().split('T')[0],
  notes: ''
};

const initialContactFormState = {
  name: '',
  title: '',
  companyId: '',
  linkedin: '',
  connectionStatus: 'Not Connected' as ConnectionStatus,
  dmStatus: 'Not Messaged' as DMStatus,
  lastInteractionDate: new Date().toISOString().split('T')[0],
  notes: ''
};

const LinkedInIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

function App() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'startups' | 'contacts'>('startups');
  
  const [startups, setStartups] = useState<Startup[]>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY_STARTUPS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse startups from localStorage.', e);
      }
    }
    return seedStartups;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY_CONTACTS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse contacts from localStorage.', e);
      }
    }
    return seedContacts;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'light' ? 'light' : 'dark';
  });

  // --- Search & Filter State ---
  // Startups Filters
  const [startupSearch, setStartupSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedHiring, setSelectedHiring] = useState<'all' | 'hiring' | 'not_hiring'>('all');
  const [selectedRelevance, setSelectedRelevance] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');

  // Contacts Filters
  const [contactSearch, setContactSearch] = useState('');
  const [selectedContactCompany, setSelectedContactCompany] = useState('');
  const [selectedConnectionStatus, setSelectedConnectionStatus] = useState<'all' | ConnectionStatus>('all');
  const [selectedDMStatus, setSelectedDMStatus] = useState<'all' | DMStatus>('all');

  // --- Sorting State ---
  const [startupSortField, setStartupSortField] = useState<keyof Startup | null>('company');
  const [startupSortDir, setStartupSortDir] = useState<'asc' | 'desc'>('asc');
  
  const [contactSortField, setContactSortField] = useState<keyof Contact | null>('name');
  const [contactSortDir, setContactSortDir] = useState<'asc' | 'desc'>('asc');

  // --- Modal Form State ---
  const [isStartupModalOpen, setIsStartupModalOpen] = useState(false);
  const [editingStartup, setEditingStartup] = useState<Startup | null>(null);
  const [startupForm, setStartupForm] = useState(initialStartupFormState);

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactForm, setContactForm] = useState(initialContactFormState);

  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LOCAL STORAGE SYNCHRONIZATION ---
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_STARTUPS, JSON.stringify(startups));
  }, [startups]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_CONTACTS, JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // --- THEME HANDLER ---
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // --- SORT HANDLERS ---
  const handleStartupSort = (field: keyof Startup) => {
    if (startupSortField === field) {
      setStartupSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setStartupSortField(field);
      setStartupSortDir('asc');
    }
  };

  const handleContactSort = (field: keyof Contact) => {
    if (contactSortField === field) {
      setContactSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setContactSortField(field);
      setContactSortDir('asc');
    }
  };

  const renderSortIcon = (activeField: string | null, targetField: string, dir: 'asc' | 'desc') => {
    if (activeField !== targetField) {
      return <ChevronsUpDown size={14} className="sort-icon" />;
    }
    return dir === 'asc' 
      ? <ChevronUp size={14} className="sort-icon" /> 
      : <ChevronDown size={14} className="sort-icon" />;
  };

  // --- DELETE HANDLERS ---
  const handleDeleteStartup = (id: string, name: string) => {
    const linkedContacts = contacts.filter(c => c.companyId === id);
    let confirmMsg = `Are you sure you want to delete "${name}"?`;
    
    if (linkedContacts.length > 0) {
      confirmMsg = `WARNING: Deleting "${name}" will unlink ${linkedContacts.length} contacts associated with this company. Proceed anyway?`;
    }

    if (window.confirm(confirmMsg)) {
      setStartups(prev => prev.filter(s => s.id !== id));
      // Cascade delete or clear link? Cleanest is cascading reference cleanup (setting companyId to empty)
      setContacts(prev => prev.map(c => c.companyId === id ? { ...c, companyId: '' } : c));
    }
  };

  const handleDeleteContact = (id: string, name: string) => {
    if (window.confirm(`Remove outreach contact "${name}"?`)) {
      setContacts(prev => prev.filter(c => c.id !== id));
    }
  };

  // --- FORM OPEN ACTIONS ---
  const handleAddStartupClick = () => {
    setEditingStartup(null);
    setStartupForm({
      ...initialStartupFormState,
      lastContactDate: new Date().toISOString().split('T')[0]
    });
    setFormError('');
    setIsStartupModalOpen(true);
  };

  const handleEditStartupClick = (startup: Startup) => {
    setEditingStartup(startup);
    setStartupForm({ ...startup });
    setFormError('');
    setIsStartupModalOpen(true);
  };

  const handleAddContactClick = () => {
    setEditingContact(null);
    setContactForm({
      ...initialContactFormState,
      companyId: startups[0]?.id || '', // Default to first company if available
      lastInteractionDate: new Date().toISOString().split('T')[0]
    });
    setFormError('');
    setIsContactModalOpen(true);
  };

  const handleEditContactClick = (contact: Contact) => {
    setEditingContact(contact);
    setContactForm({ ...contact });
    setFormError('');
    setIsContactModalOpen(true);
  };

  // --- SUBMITS ---
  const handleStartupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!startupForm.company.trim()) {
      setFormError('Company name is required.');
      return;
    }
    if (!startupForm.sector.trim()) {
      setFormError('Sector is required.');
      return;
    }

    let url = startupForm.url.trim();
    if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;

    let linkedin = startupForm.founderLinkedin.trim();
    if (linkedin && !/^https?:\/\//i.test(linkedin)) linkedin = `https://${linkedin}`;

    const updatedData = { ...startupForm, url, founderLinkedin: linkedin };

    if (editingStartup) {
      setStartups(prev => prev.map(s => s.id === editingStartup.id ? { ...s, ...updatedData } : s));
    } else {
      const newStartup: Startup = { id: Date.now().toString(), ...updatedData };
      setStartups(prev => [newStartup, ...prev]);
    }
    setIsStartupModalOpen(false);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!contactForm.name.trim()) {
      setFormError('Contact name is required.');
      return;
    }

    let linkedin = contactForm.linkedin.trim();
    if (linkedin && !/^https?:\/\//i.test(linkedin)) linkedin = `https://${linkedin}`;

    const updatedData = { ...contactForm, linkedin };

    if (editingContact) {
      setContacts(prev => prev.map(c => c.id === editingContact.id ? { ...c, ...updatedData } : c));
    } else {
      const newContact: Contact = { id: `c_${Date.now()}`, ...updatedData };
      setContacts(prev => [newContact, ...prev]);
    }
    setIsContactModalOpen(false);
  };

  // --- IMPORTS & EXPORTS ---
  const handleExportStartupsCSV = () => {
    const headers = [
      'Company', 'URL', 'Description', 'Sector', 'Investor', 
      'Funding Stage', 'Amount', 'Team Size', 'Hiring?', 'Relevance', 
      'Founder LinkedIn', 'Outreach Status', 'Last Contact Date', 'Notes'
    ];
    const escapeCSV = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const csvRows = [
      headers.join(','),
      ...startups.map(s => [
        escapeCSV(s.company),
        escapeCSV(s.url),
        escapeCSV(s.description),
        escapeCSV(s.sector),
        escapeCSV(s.investor),
        escapeCSV(s.fundingStage),
        escapeCSV(s.amount),
        escapeCSV(s.teamSize),
        escapeCSV(s.hiring ? 'Yes' : 'No'),
        escapeCSV(s.relevance),
        escapeCSV(s.founderLinkedin),
        escapeCSV(s.outreachStatus),
        escapeCSV(s.lastContactDate),
        escapeCSV(s.notes)
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `indisight_startups_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExportContactsCSV = () => {
    const headers = [
      'Name', 'Title', 'Company', 'LinkedIn', 'Connection Status', 
      'DM Status', 'Last Interaction Date', 'Notes'
    ];
    const escapeCSV = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const csvRows = [
      headers.join(','),
      ...contacts.map(c => {
        const companyName = startups.find(s => s.id === c.companyId)?.company || 'Unlinked';
        return [
          escapeCSV(c.name),
          escapeCSV(c.title),
          escapeCSV(companyName),
          escapeCSV(c.linkedin),
          escapeCSV(c.connectionStatus),
          escapeCSV(c.dmStatus),
          escapeCSV(c.lastInteractionDate),
          escapeCSV(c.notes)
        ].join(',');
      })
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `indisight_contacts_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Full Database JSON Backup Export
  const handleExportFullJSON = () => {
    const backupData = {
      startups,
      contacts
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `indisight_full_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // Full Database JSON Restore Import
  const handleImportFullJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          const hasStartups = Array.isArray(parsed.startups);
          const hasContacts = Array.isArray(parsed.contacts);

          if (hasStartups || hasContacts) {
            if (window.confirm('Restore dataset from this backup file? Existing data will be overwritten.')) {
              if (hasStartups) setStartups(parsed.startups);
              if (hasContacts) setContacts(parsed.contacts);
            }
          } else {
            alert('Invalid backup schema. File must contain startups and/or contacts lists.');
          }
        }
      } catch (err) {
        alert('Failed to parse backup JSON. Ensure the file integrity is correct.');
        console.error(err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // --- FILTERS & SORTS PIPELINE ---
  // 1. Sector Lists
  const uniqueSectors = Array.from(new Set(startups.map(s => s.sector.trim()).filter(Boolean))).sort();

  // 2. Startups Query logic
  const filteredStartups = startups.filter(s => {
    const matchSearch = 
      s.company.toLowerCase().includes(startupSearch.toLowerCase()) ||
      s.description.toLowerCase().includes(startupSearch.toLowerCase()) ||
      s.notes.toLowerCase().includes(startupSearch.toLowerCase()) ||
      s.sector.toLowerCase().includes(startupSearch.toLowerCase());

    const matchSector = !selectedSector || s.sector === selectedSector;
    const matchHiring = selectedHiring === 'all' ? true : selectedHiring === 'hiring' ? s.hiring : !s.hiring;
    const matchRelevance = selectedRelevance === 'all' ? true : s.relevance === selectedRelevance;

    return matchSearch && matchSector && matchHiring && matchRelevance;
  });

  const sortedStartups = [...filteredStartups].sort((a, b) => {
    if (!startupSortField) return 0;
    const valA = a[startupSortField];
    const valB = b[startupSortField];

    if (typeof valA === 'boolean' && typeof valB === 'boolean') {
      return startupSortDir === 'asc' ? (valA === valB ? 0 : valA ? -1 : 1) : (valA === valB ? 0 : valA ? 1 : -1);
    }
    if (typeof valA === 'number' && typeof valB === 'number') {
      return startupSortDir === 'asc' ? valA - valB : valB - valA;
    }
    return startupSortDir === 'asc'
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  // 3. Contacts Query logic
  const filteredContacts = contacts.filter(c => {
    const company = startups.find(s => s.id === c.companyId);
    const companyName = company?.company || '';
    
    const matchSearch = 
      c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.title.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.notes.toLowerCase().includes(contactSearch.toLowerCase()) ||
      companyName.toLowerCase().includes(contactSearch.toLowerCase());

    const matchCompany = !selectedContactCompany || c.companyId === selectedContactCompany;
    const matchConn = selectedConnectionStatus === 'all' ? true : c.connectionStatus === selectedConnectionStatus;
    const matchDM = selectedDMStatus === 'all' ? true : c.dmStatus === selectedDMStatus;

    return matchSearch && matchCompany && matchConn && matchDM;
  });

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (!contactSortField) return 0;
    const valA = a[contactSortField];
    const valB = b[contactSortField];

    return contactSortDir === 'asc'
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  // --- STATS PANELS ---
  // Startup KPI
  const statsStartups = {
    total: startups.length,
    high: startups.filter(s => s.relevance === 'High').length,
    hiring: startups.filter(s => s.hiring).length,
    outreach: startups.filter(s => s.outreachStatus !== 'Not Started' && s.outreachStatus !== 'Closed').length
  };

  // Contacts KPI
  const statsContacts = {
    total: contacts.length,
    connected: contacts.filter(c => c.connectionStatus === 'Connected').length,
    replied: contacts.filter(c => c.dmStatus === 'Replied').length,
    followup: contacts.filter(c => c.dmStatus === 'Pitch Sent' || c.dmStatus === 'Followed Up').length
  };

  return (
    <div className="app-container">
      {/* HEADER BAR */}
      <header>
        <div className="brand-section">
          <h1>
            <FileSpreadsheet size={32} />
            INDISIGHT
          </h1>
          <p>DevOps/MLOps Hiring Intelligence & Outreach Planner</p>
        </div>

        <div className="header-controls">
          {/* TAB BUTTONS */}
          <div className="nav-tabs">
            <button 
              className={`nav-tab-btn ${activeTab === 'startups' ? 'active' : ''}`}
              onClick={() => setActiveTab('startups')}
            >
              <Building2 size={16} /> Startups
            </button>
            <button 
              className={`nav-tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
              onClick={() => setActiveTab('contacts')}
            >
              <Users size={16} /> Contacts & Outreach
            </button>
          </div>

          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn"
            title="Toggle theme"
            aria-label="Toggle theme color"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* DYNAMIC METRICS DASHBOARD */}
      {activeTab === 'startups' ? (
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><Building2 size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Total Startups</span>
              <span className="stat-value">{statsStartups.total}</span>
            </div>
          </div>
          <div className="stat-card relevance-high">
            <div className="stat-icon"><TrendingUp size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">High Relevance</span>
              <span className="stat-value">{statsStartups.high}</span>
            </div>
          </div>
          <div className="stat-card hiring">
            <div className="stat-icon"><Users size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Actively Hiring</span>
              <span className="stat-value">{statsStartups.hiring}</span>
            </div>
          </div>
          <div className="stat-card pipeline">
            <div className="stat-icon"><CheckCircle2 size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Active Pipelines</span>
              <span className="stat-value">{statsStartups.outreach}</span>
            </div>
          </div>
        </section>
      ) : (
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><Users size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Total Contacts</span>
              <span className="stat-value">{statsContacts.total}</span>
            </div>
          </div>
          <div className="stat-card relevance-high">
            <div className="stat-icon"><UserCheck size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Connections</span>
              <span className="stat-value">{statsContacts.connected}</span>
            </div>
          </div>
          <div className="stat-card pipeline">
            <div className="stat-icon"><MessageSquare size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Replies Received</span>
              <span className="stat-value">{statsContacts.replied}</span>
            </div>
          </div>
          <div className="stat-card hiring">
            <div className="stat-icon"><Network size={24} /></div>
            <div className="stat-info">
              <span className="stat-label">Follow-ups Active</span>
              <span className="stat-value">{statsContacts.followup}</span>
            </div>
          </div>
        </section>
      )}

      {/* FILTER & GLOBAL ACTIONS BAR */}
      <section className="controls-container">
        {activeTab === 'startups' ? (
          <div className="filters-group">
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search startups..."
                value={startupSearch}
                onChange={e => setStartupSearch(e.target.value)}
                className="search-input"
              />
            </div>
            
            <select
              value={selectedSector}
              onChange={e => setSelectedSector(e.target.value)}
              className="filter-select"
            >
              <option value="">All Sectors</option>
              {uniqueSectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={selectedHiring}
              onChange={e => setSelectedHiring(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">All Hiring Status</option>
              <option value="hiring">Hiring (Yes)</option>
              <option value="not_hiring">Not Hiring (No)</option>
            </select>

            <select
              value={selectedRelevance}
              onChange={e => setSelectedRelevance(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">All Relevance</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        ) : (
          <div className="filters-group">
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={contactSearch}
                onChange={e => setContactSearch(e.target.value)}
                className="search-input"
              />
            </div>

            <select
              value={selectedContactCompany}
              onChange={e => setSelectedContactCompany(e.target.value)}
              className="filter-select"
            >
              <option value="">All Companies</option>
              {startups.map(s => <option key={s.id} value={s.id}>{s.company}</option>)}
            </select>

            <select
              value={selectedConnectionStatus}
              onChange={e => setSelectedConnectionStatus(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">All Connection States</option>
              <option value="Not Connected">Not Connected</option>
              <option value="Request Sent">Request Sent</option>
              <option value="Connected">Connected</option>
            </select>

            <select
              value={selectedDMStatus}
              onChange={e => setSelectedDMStatus(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">All DM Statuses</option>
              <option value="Not Messaged">Not Messaged</option>
              <option value="Pitch Sent">Pitch Sent</option>
              <option value="Replied">Replied</option>
              <option value="Followed Up">Followed Up</option>
            </select>
          </div>
        )}

        <div className="actions-group">
          {activeTab === 'startups' ? (
            <>
              <button className="btn btn-primary" onClick={handleAddStartupClick}>
                <Plus size={16} /> Add Startup
              </button>
              <button className="btn btn-secondary" onClick={handleExportStartupsCSV}>
                <Download size={16} /> Export Startups CSV
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={handleAddContactClick}>
                <Plus size={16} /> Add Contact
              </button>
              <button className="btn btn-secondary" onClick={handleExportContactsCSV}>
                <Download size={16} /> Export Contacts CSV
              </button>
            </>
          )}

          <button className="btn btn-secondary" onClick={handleExportFullJSON} title="Backup entire database to JSON">
            Backup JSON
          </button>
          
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} title="Restore database from JSON">
            <Upload size={16} /> Restore JSON
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportFullJSON} 
            accept=".json" 
            style={{ display: 'none' }} 
          />
        </div>
      </section>

      {/* SHEET DATAGRID TABLE */}
      <section className="table-card">
        <div className="table-wrapper">
          {activeTab === 'startups' ? (
            sortedStartups.length > 0 ? (
              <table className="startup-table">
                <thead>
                  <tr>
                    <th onClick={() => handleStartupSort('company')}>
                      <div className="header-content">Company {renderSortIcon(startupSortField, 'company', startupSortDir)}</div>
                    </th>
                    <th>URL</th>
                    <th>One-line description</th>
                    <th onClick={() => handleStartupSort('sector')}>
                      <div className="header-content">Sector {renderSortIcon(startupSortField, 'sector', startupSortDir)}</div>
                    </th>
                    <th>Investor</th>
                    <th onClick={() => handleStartupSort('fundingStage')}>
                      <div className="header-content">Stage {renderSortIcon(startupSortField, 'fundingStage', startupSortDir)}</div>
                    </th>
                    <th onClick={() => handleStartupSort('amount')}>
                      <div className="header-content">Amount {renderSortIcon(startupSortField, 'amount', startupSortDir)}</div>
                    </th>
                    <th onClick={() => handleStartupSort('teamSize')}>
                      <div className="header-content">Team {renderSortIcon(startupSortField, 'teamSize', startupSortDir)}</div>
                    </th>
                    <th onClick={() => handleStartupSort('hiring')}>
                      <div className="header-content">Hiring? {renderSortIcon(startupSortField, 'hiring', startupSortDir)}</div>
                    </th>
                    <th onClick={() => handleStartupSort('relevance')}>
                      <div className="header-content">Relevance {renderSortIcon(startupSortField, 'relevance', startupSortDir)}</div>
                    </th>
                    <th>Founder LinkedIn</th>
                    <th onClick={() => handleStartupSort('outreachStatus')}>
                      <div className="header-content">Outreach {renderSortIcon(startupSortField, 'outreachStatus', startupSortDir)}</div>
                    </th>
                    <th onClick={() => handleStartupSort('lastContactDate')}>
                      <div className="header-content">Last Contact {renderSortIcon(startupSortField, 'lastContactDate', startupSortDir)}</div>
                    </th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStartups.map(s => (
                    <tr key={s.id} className={`startup-row relevance-${s.relevance.toLowerCase()}`}>
                      <td style={{ fontWeight: 600 }}>{s.company}</td>
                      <td>
                        {s.url ? (
                          <a href={s.url} target="_blank" rel="noreferrer" className="cell-link">
                            Visit <ExternalLink size={12} style={{ display: 'inline', marginLeft: '2px' }} />
                          </a>
                        ) : '-'}
                      </td>
                      <td className="text-truncate" title={s.description}>{s.description || '-'}</td>
                      <td><span className="badge badge-relevance-low">{s.sector}</span></td>
                      <td className="text-truncate" title={s.investor}>{s.investor || '-'}</td>
                      <td>{s.fundingStage || '-'}</td>
                      <td>{s.amount || '-'}</td>
                      <td>{s.teamSize || '-'}</td>
                      <td>
                        <span className={`badge ${s.hiring ? 'badge-hiring' : 'badge-not-hiring'}`}>
                          {s.hiring ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-relevance-${s.relevance.toLowerCase()}`}>
                          {s.relevance}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {s.founderLinkedin ? (
                          <a href={s.founderLinkedin} target="_blank" rel="noreferrer" className="linkedin-btn">
                            <LinkedInIcon size={18} />
                          </a>
                        ) : '-'}
                      </td>
                      <td>
                        <span className={`status-badge status-${s.outreachStatus.toLowerCase().replace(' ', '-')}`}>
                          {s.outreachStatus}
                        </span>
                      </td>
                      <td>{s.lastContactDate || '-'}</td>
                      <td className="text-truncate notes-cell" title={s.notes}>{s.notes || '-'}</td>
                      <td>
                        <div className="row-actions">
                          <button onClick={() => handleEditStartupClick(s)} className="action-icon-btn"><Edit2 size={14} /></button>
                          <button onClick={() => handleDeleteStartup(s.id, s.company)} className="action-icon-btn delete-btn"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <Search size={48} className="empty-state-icon" />
                <h3>No startups found</h3>
              </div>
            )
          ) : (
            // Contacts Log View Table
            sortedContacts.length > 0 ? (
              <table className="startup-table">
                <thead>
                  <tr>
                    <th onClick={() => handleContactSort('name')}>
                      <div className="header-content">Name {renderSortIcon(contactSortField, 'name', contactSortDir)}</div>
                    </th>
                    <th onClick={() => handleContactSort('title')}>
                      <div className="header-content">Title {renderSortIcon(contactSortField, 'title', contactSortDir)}</div>
                    </th>
                    <th>Company</th>
                    <th>LinkedIn</th>
                    <th onClick={() => handleContactSort('connectionStatus')}>
                      <div className="header-content">Connection {renderSortIcon(contactSortField, 'connectionStatus', contactSortDir)}</div>
                    </th>
                    <th onClick={() => handleContactSort('dmStatus')}>
                      <div className="header-content">DM Status {renderSortIcon(contactSortField, 'dmStatus', contactSortDir)}</div>
                    </th>
                    <th onClick={() => handleContactSort('lastInteractionDate')}>
                      <div className="header-content">Last Contact {renderSortIcon(contactSortField, 'lastInteractionDate', contactSortDir)}</div>
                    </th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedContacts.map(c => {
                    const company = startups.find(s => s.id === c.companyId);
                    
                    return (
                      <tr key={c.id} className="startup-row">
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td>{c.title || '-'}</td>
                        <td style={{ fontWeight: 500 }}>
                          {company ? (
                            <span className="badge badge-relevance-low">{company.company}</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unlinked</span>
                          )}
                        </td>
                        <td>
                          {c.linkedin ? (
                            <a href={c.linkedin} target="_blank" rel="noreferrer" className="linkedin-btn">
                              <LinkedInIcon size={18} />
                            </a>
                          ) : '-'}
                        </td>
                        <td>
                          <span className={`status-badge conn-${c.connectionStatus.toLowerCase().replace(' ', '-')}`}>
                            {c.connectionStatus}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge dm-${c.dmStatus.toLowerCase().replace(' ', '-')}`}>
                            {c.dmStatus}
                          </span>
                        </td>
                        <td>{c.lastInteractionDate}</td>
                        <td className="text-truncate notes-cell" title={c.notes}>{c.notes || '-'}</td>
                        <td>
                          <div className="row-actions">
                            <button onClick={() => handleEditContactClick(c)} className="action-icon-btn"><Edit2 size={14} /></button>
                            <button onClick={() => handleDeleteContact(c.id, c.name)} className="action-icon-btn delete-btn"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <Search size={48} className="empty-state-icon" />
                <h3>No contacts found</h3>
              </div>
            )
          )}
        </div>
      </section>

      {/* STARTUP MODAL FORM */}
      {isStartupModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingStartup ? `Edit ${startupForm.company}` : 'Add New Startup'}</h2>
              <button onClick={() => setIsStartupModalOpen(false)} className="close-modal-btn"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleStartupSubmit} className="modal-form">
              {formError && (
                <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={startupForm.company}
                    onChange={e => setStartupForm({ ...startupForm, company: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Website URL</label>
                  <input
                    type="text"
                    value={startupForm.url}
                    onChange={e => setStartupForm({ ...startupForm, url: e.target.value })}
                    placeholder="https://example.com"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group form-group-full">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  value={startupForm.description}
                  onChange={e => setStartupForm({ ...startupForm, description: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Sector *</label>
                  <input
                    type="text"
                    required
                    value={startupForm.sector}
                    onChange={e => setStartupForm({ ...startupForm, sector: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Investor</label>
                  <input
                    type="text"
                    value={startupForm.investor}
                    onChange={e => setStartupForm({ ...startupForm, investor: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Funding Stage</label>
                  <input
                    type="text"
                    value={startupForm.fundingStage}
                    onChange={e => setStartupForm({ ...startupForm, fundingStage: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input
                    type="text"
                    value={startupForm.amount}
                    onChange={e => setStartupForm({ ...startupForm, amount: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Team Size</label>
                  <input
                    type="number"
                    value={startupForm.teamSize}
                    onChange={e => setStartupForm({ ...startupForm, teamSize: parseInt(e.target.value) || 0 })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Founder LinkedIn</label>
                  <input
                    type="text"
                    value={startupForm.founderLinkedin}
                    onChange={e => setStartupForm({ ...startupForm, founderLinkedin: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Relevance</label>
                  <select
                    value={startupForm.relevance}
                    onChange={e => setStartupForm({ ...startupForm, relevance: e.target.value as any })}
                    className="form-select"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Outreach Status</label>
                  <select
                    value={startupForm.outreachStatus}
                    onChange={e => setStartupForm({ ...startupForm, outreachStatus: e.target.value as any })}
                    className="form-select"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="Messaged">Messaged</option>
                    <option value="Replied">Replied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Last Contact Date</label>
                  <input
                    type="date"
                    value={startupForm.lastContactDate}
                    onChange={e => setStartupForm({ ...startupForm, lastContactDate: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={startupForm.hiring}
                      onChange={e => setStartupForm({ ...startupForm, hiring: e.target.checked })}
                    />
                    <div className="checkbox-custom">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Actively Hiring?</span>
                  </label>
                </div>
              </div>

              <div className="form-group form-group-full">
                <label className="form-label">Notes</label>
                <textarea
                  value={startupForm.notes}
                  onChange={e => setStartupForm({ ...startupForm, notes: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsStartupModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONTACT MODAL FORM */}
      {isContactModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingContact ? `Edit ${contactForm.name}` : 'Add Outreach Contact'}</h2>
              <button onClick={() => setIsContactModalOpen(false)} className="close-modal-btn"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleContactSubmit} className="modal-form">
              {formError && (
                <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="e.g. Prashant Ghildiyal"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Title / Role</label>
                  <input
                    type="text"
                    value={contactForm.title}
                    onChange={e => setContactForm({ ...contactForm, title: e.target.value })}
                    placeholder="e.g. Co-Founder & CTO"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Link to Company</label>
                  <select
                    value={contactForm.companyId}
                    onChange={e => setContactForm({ ...contactForm, companyId: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Select a company...</option>
                    {startups.map(s => <option key={s.id} value={s.id}>{s.company}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">LinkedIn URL</label>
                  <input
                    type="text"
                    value={contactForm.linkedin}
                    onChange={e => setContactForm({ ...contactForm, linkedin: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Connection Status</label>
                  <select
                    value={contactForm.connectionStatus}
                    onChange={e => setContactForm({ ...contactForm, connectionStatus: e.target.value as any })}
                    className="form-select"
                  >
                    <option value="Not Connected">Not Connected</option>
                    <option value="Request Sent">Request Sent</option>
                    <option value="Connected">Connected</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">DM Status</label>
                  <select
                    value={contactForm.dmStatus}
                    onChange={e => setContactForm({ ...contactForm, dmStatus: e.target.value as any })}
                    className="form-select"
                  >
                    <option value="Not Messaged">Not Messaged</option>
                    <option value="Pitch Sent">Pitch Sent</option>
                    <option value="Replied">Replied</option>
                    <option value="Followed Up">Followed Up</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Last Interaction Date</label>
                  <input
                    type="date"
                    value={contactForm.lastInteractionDate}
                    onChange={e => setContactForm({ ...contactForm, lastInteractionDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group form-group-full">
                <label className="form-label">Outreach Notes / Chat Snippets</label>
                <textarea
                  value={contactForm.notes}
                  onChange={e => setContactForm({ ...contactForm, notes: e.target.value })}
                  placeholder="Paste details of messages exchanged, connection updates, referral details..."
                  className="form-textarea"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsContactModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
