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
  FileSpreadsheet
} from 'lucide-react';
import type { Startup, RoleRelevance, OutreachStatus } from './types';

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
import { seedStartups } from './seedData';
import './App.css';

const LOCAL_STORAGE_KEY = 'indisight_startups';
const THEME_KEY = 'indisight_theme';

const initialFormState = {
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

function App() {
  // --- STATE ---
  const [startups, setStartups] = useState<Startup[]>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse startups from localStorage, loading seed data.', e);
      }
    }
    return seedStartups;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'light' ? 'light' : 'dark';
  });

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedHiring, setSelectedHiring] = useState<'all' | 'hiring' | 'not_hiring'>('all');
  const [selectedRelevance, setSelectedRelevance] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');

  // Sorting State
  const [sortField, setSortField] = useState<keyof Startup | null>('company');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStartup, setEditingStartup] = useState<Startup | null>(null);
  const [formState, setFormState] = useState(initialFormState);
  const [formError, setFormError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- SIDE EFFECTS ---
  // Save startups to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(startups));
  }, [startups]);

  // Apply theme class/attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // --- UTILS / HANDLERS ---
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Get unique sectors dynamically from the startup data
  const uniqueSectors = Array.from(
    new Set(startups.map(s => s.sector.trim()).filter(Boolean))
  ).sort();

  // Handle Sort
  const handleSort = (field: keyof Startup) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Render Sort Icon
  const renderSortIcon = (field: keyof Startup) => {
    if (sortField !== field) {
      return <ChevronsUpDown size={14} className="sort-icon" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp size={14} className="sort-icon" /> 
      : <ChevronDown size={14} className="sort-icon" />;
  };

  // Delete startup
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the tracker?`)) {
      setStartups(prev => prev.filter(s => s.id !== id));
    }
  };

  // Edit click
  const handleEditClick = (startup: Startup) => {
    setEditingStartup(startup);
    setFormState({
      company: startup.company,
      url: startup.url,
      description: startup.description,
      sector: startup.sector,
      investor: startup.investor,
      fundingStage: startup.fundingStage,
      amount: startup.amount,
      teamSize: startup.teamSize,
      hiring: startup.hiring,
      relevance: startup.relevance,
      founderLinkedin: startup.founderLinkedin,
      outreachStatus: startup.outreachStatus,
      lastContactDate: startup.lastContactDate,
      notes: startup.notes
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Add click
  const handleAddClick = () => {
    setEditingStartup(null);
    setFormState({
      ...initialFormState,
      lastContactDate: new Date().toISOString().split('T')[0]
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Form input changes
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormState(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'teamSize') {
      setFormState(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormState(prev => ({ ...prev, [name]: value }));
    }
  };

  // Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Basic Validation
    if (!formState.company.trim()) {
      setFormError('Company name is required.');
      return;
    }
    if (!formState.sector.trim()) {
      setFormError('Sector is required.');
      return;
    }

    // Process and sanitize URL
    let formattedUrl = formState.url.trim();
    if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // Process and sanitize Linkedin URL
    let formattedLinkedin = formState.founderLinkedin.trim();
    if (formattedLinkedin && !/^https?:\/\//i.test(formattedLinkedin)) {
      formattedLinkedin = `https://${formattedLinkedin}`;
    }

    if (editingStartup) {
      // Edit
      setStartups(prev =>
        prev.map(s =>
          s.id === editingStartup.id
            ? { 
                ...s, 
                ...formState, 
                url: formattedUrl, 
                founderLinkedin: formattedLinkedin 
              }
            : s
        )
      );
    } else {
      // Add
      const newStartup: Startup = {
        id: Date.now().toString(),
        ...formState,
        url: formattedUrl,
        founderLinkedin: formattedLinkedin
      };
      setStartups(prev => [newStartup, ...prev]);
    }

    setIsModalOpen(false);
  };

  // --- EXPORT / IMPORT ENGINE ---
  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Company', 'URL', 'One-line description', 'Sector', 'Investor', 
      'Funding Stage', 'Amount', 'Team Size', 'Hiring?', 'Role Relevance', 
      'Founder LinkedIn', 'Outreach Status', 'Last Contact Date', 'Notes'
    ];

    const escapeCSV = (str: string | number | boolean | undefined) => {
      if (str === undefined || str === null) return '""';
      const value = String(str);
      const escaped = value.replace(/"/g, '""');
      return `"${escaped}"`;
    };

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

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `startup_intelligence_tracker_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Export (Backup)
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(startups, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `startup_intelligence_tracker_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  // JSON Import
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          // Simple validation check on schema of the first element
          const isValidSchema = parsed.length === 0 || (
            'company' in parsed[0] && 
            'sector' in parsed[0] && 
            'relevance' in parsed[0] && 
            'outreachStatus' in parsed[0]
          );

          if (isValidSchema) {
            // Generate clean IDs if missing
            const sanitized = parsed.map((item, idx) => ({
              ...initialFormState,
              ...item,
              id: item.id || `${Date.now()}_${idx}`
            }));
            
            if (window.confirm(`Found ${sanitized.length} startups. Overwrite existing tracking list?`)) {
              setStartups(sanitized);
            }
          } else {
            alert('Invalid JSON file format. Startup database schema mismatch.');
          }
        } else {
          alert('Invalid JSON structure. Needs to be a list/array of startups.');
        }
      } catch (err) {
        alert('Failed to parse file. Ensure it is a valid JSON database.');
        console.error(err);
      }
    };

    fileReader.readAsText(files[0]);
    // Reset file input value so same file can be selected again
    e.target.value = '';
  };

  // Trigger JSON Import click
  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  // --- DATA FILTERING & SORTING PIPELINE ---
  const filteredStartups = startups.filter(startup => {
    const matchesSearch = 
      startup.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.investor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSector = !selectedSector || startup.sector.trim().toLowerCase() === selectedSector.trim().toLowerCase();
    
    const matchesHiring = selectedHiring === 'all' 
      ? true 
      : selectedHiring === 'hiring' 
        ? startup.hiring 
        : !startup.hiring;

    const matchesRelevance = selectedRelevance === 'all' 
      ? true 
      : startup.relevance === selectedRelevance;

    return matchesSearch && matchesSector && matchesHiring && matchesRelevance;
  });

  const sortedStartups = [...filteredStartups].sort((a, b) => {
    if (!sortField) return 0;
    
    let valA = a[sortField];
    let valB = b[sortField];

    // Boolean sort helper
    if (typeof valA === 'boolean' && typeof valB === 'boolean') {
      return sortDirection === 'asc' 
        ? (valA === valB ? 0 : valA ? -1 : 1)
        : (valA === valB ? 0 : valA ? 1 : -1);
    }

    // Number sort helper
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    }

    // String sort helper (case insensitive)
    const strA = String(valA).toLowerCase();
    const strB = String(valB).toLowerCase();

    if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
    if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // --- STATS COMPUTATION ---
  const totalCount = startups.length;
  const highRelevanceCount = startups.filter(s => s.relevance === 'High').length;
  const hiringCount = startups.filter(s => s.hiring).length;
  const pipelineCount = startups.filter(
    s => s.outreachStatus !== 'Not Started' && s.outreachStatus !== 'Closed'
  ).length;

  return (
    <div className="app-container">
      {/* HEADER SECTION */}
      <header>
        <div className="brand-section">
          <h1>
            <FileSpreadsheet size={32} style={{ color: 'var(--primary)' }} />
            INDISIGHT
          </h1>
          <p>Indian early-stage startup intelligence tracker for DevOps/MLOps hiring</p>
        </div>
        <button 
          onClick={toggleTheme} 
          className="theme-toggle-btn"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* KPI STATS CARDS */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Building2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Startups</span>
            <span className="stat-value">{totalCount}</span>
          </div>
        </div>

        <div className="stat-card relevance-high">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">High Relevance</span>
            <span className="stat-value">{highRelevanceCount}</span>
          </div>
        </div>

        <div className="stat-card hiring">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Hiring Active</span>
            <span className="stat-value">{hiringCount}</span>
          </div>
        </div>

        <div className="stat-card pipeline">
          <div className="stat-icon">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Active Outreach</span>
            <span className="stat-value">{pipelineCount}</span>
          </div>
        </div>
      </section>

      {/* SEARCH AND FILTERS CONTROLS */}
      <section className="controls-container">
        <div className="filters-group">
          {/* SEARCH BAR */}
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search startup, description, investor, notes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* SECTOR FILTER */}
          <select
            value={selectedSector}
            onChange={e => setSelectedSector(e.target.value)}
            className="filter-select"
            aria-label="Filter by Sector"
          >
            <option value="">All Sectors</option>
            {uniqueSectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>

          {/* HIRING FILTER */}
          <select
            value={selectedHiring}
            onChange={e => setSelectedHiring(e.target.value as any)}
            className="filter-select"
            aria-label="Filter by Hiring Status"
          >
            <option value="all">All Hiring Status</option>
            <option value="hiring">Hiring (Yes)</option>
            <option value="not_hiring">Not Hiring (No)</option>
          </select>

          {/* RELEVANCE FILTER */}
          <select
            value={selectedRelevance}
            onChange={e => setSelectedRelevance(e.target.value as any)}
            className="filter-select"
            aria-label="Filter by Role Relevance"
          >
            <option value="all">All Relevance</option>
            <option value="High">High Relevance</option>
            <option value="Medium">Medium Relevance</option>
            <option value="Low">Low Relevance</option>
          </select>
        </div>

        {/* UTILITY ACTION BUTTONS */}
        <div className="actions-group">
          <button className="btn btn-primary" onClick={handleAddClick}>
            <Plus size={16} /> Add Startup
          </button>
          
          <button className="btn btn-secondary" onClick={handleExportCSV} title="Export current sheet to CSV">
            <Download size={16} /> Export CSV
          </button>

          <button className="btn btn-secondary" onClick={handleExportJSON} title="Backup database as JSON file">
            Backup JSON
          </button>

          <button className="btn btn-secondary" onClick={triggerImport} title="Restore database from backup JSON file">
            <Upload size={16} /> Import JSON
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportJSON} 
            accept=".json" 
            className="hidden-file-input" 
          />
        </div>
      </section>

      {/* SPREADSHEET DATAGRID */}
      <section className="table-card">
        <div className="table-wrapper">
          {sortedStartups.length > 0 ? (
            <table className="startup-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('company')}>
                    <div className="header-content">Company {renderSortIcon('company')}</div>
                  </th>
                  <th>URL</th>
                  <th>One-line description</th>
                  <th onClick={() => handleSort('sector')}>
                    <div className="header-content">Sector {renderSortIcon('sector')}</div>
                  </th>
                  <th>Investor</th>
                  <th onClick={() => handleSort('fundingStage')}>
                    <div className="header-content">Stage {renderSortIcon('fundingStage')}</div>
                  </th>
                  <th onClick={() => handleSort('amount')}>
                    <div className="header-content">Amount {renderSortIcon('amount')}</div>
                  </th>
                  <th onClick={() => handleSort('teamSize')}>
                    <div className="header-content">Team {renderSortIcon('teamSize')}</div>
                  </th>
                  <th onClick={() => handleSort('hiring')}>
                    <div className="header-content">Hiring? {renderSortIcon('hiring')}</div>
                  </th>
                  <th onClick={() => handleSort('relevance')}>
                    <div className="header-content">Relevance {renderSortIcon('relevance')}</div>
                  </th>
                  <th>Founder LinkedIn</th>
                  <th onClick={() => handleSort('outreachStatus')}>
                    <div className="header-content">Outreach {renderSortIcon('outreachStatus')}</div>
                  </th>
                  <th onClick={() => handleSort('lastContactDate')}>
                    <div className="header-content">Last Contact {renderSortIcon('lastContactDate')}</div>
                  </th>
                  <th>Notes</th>
                  <th style={{ cursor: 'default' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedStartups.map(startup => {
                  const relevanceClass = `relevance-${startup.relevance.toLowerCase()}`;
                  const outreachClass = `status-${startup.outreachStatus.toLowerCase().replace(' ', '-')}`;
                  
                  return (
                    <tr 
                      key={startup.id} 
                      className={`startup-row ${relevanceClass}`}
                    >
                      {/* Company Name */}
                      <td style={{ fontWeight: 600 }}>{startup.company}</td>
                      
                      {/* Web URL */}
                      <td>
                        {startup.url ? (
                          <a 
                            href={startup.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="cell-link"
                            title={startup.url}
                          >
                            Visit <ExternalLink size={12} style={{ display: 'inline', marginLeft: '2px' }} />
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>None</span>
                        )}
                      </td>
                      
                      {/* Description */}
                      <td className="text-truncate" title={startup.description}>
                        {startup.description || '-'}
                      </td>
                      
                      {/* Sector */}
                      <td>
                        <span className="badge badge-relevance-low">{startup.sector}</span>
                      </td>
                      
                      {/* Investor */}
                      <td className="text-truncate" title={startup.investor}>
                        {startup.investor || '-'}
                      </td>
                      
                      {/* Funding Stage */}
                      <td>{startup.fundingStage || '-'}</td>
                      
                      {/* Funding Amount */}
                      <td>{startup.amount || '-'}</td>
                      
                      {/* Team Size */}
                      <td>{startup.teamSize || '-'}</td>
                      
                      {/* Hiring Toggle */}
                      <td>
                        <span className={`badge ${startup.hiring ? 'badge-hiring' : 'badge-not-hiring'}`}>
                          {startup.hiring ? 'Yes' : 'No'}
                        </span>
                      </td>
                      
                      {/* Role Relevance */}
                      <td>
                        <span className={`badge badge-relevance-${startup.relevance.toLowerCase()}`}>
                          {startup.relevance}
                        </span>
                      </td>
                      
                      {/* Founder LinkedIn Link */}
                      <td style={{ textAlign: 'center' }}>
                        {startup.founderLinkedin ? (
                          <a 
                            href={startup.founderLinkedin} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="linkedin-btn"
                            title="LinkedIn Profile"
                            aria-label="Founder LinkedIn Profile"
                          >
                            <LinkedInIcon size={18} />
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>
                      
                      {/* Outreach Status */}
                      <td>
                        <span className={`status-badge ${outreachClass}`}>
                          {startup.outreachStatus}
                        </span>
                      </td>
                      
                      {/* Last Contact Date */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {startup.lastContactDate || '-'}
                      </td>
                      
                      {/* Notes Column */}
                      <td className="text-truncate notes-cell" title={startup.notes}>
                        {startup.notes || '-'}
                      </td>
                      
                      {/* Row Actions */}
                      <td>
                        <div className="row-actions">
                          <button 
                            onClick={() => handleEditClick(startup)} 
                            className="action-icon-btn"
                            title="Edit Startup"
                            aria-label="Edit Startup"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(startup.id, startup.company)} 
                            className="action-icon-btn delete-btn"
                            title="Delete Startup"
                            aria-label="Delete Startup"
                          >
                            <Trash2 size={14} />
                          </button>
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
              <h3>No startups found</h3>
              <p>Try adjusting your search criteria, removing filters, or add a new startup record.</p>
              {searchTerm || selectedSector || selectedHiring !== 'all' || selectedRelevance !== 'all' ? (
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSector('');
                    setSelectedHiring('all');
                    setSelectedRelevance('all');
                  }}
                >
                  Clear Filters
                </button>
              ) : null}
            </div>
          )}
        </div>
      </section>

      {/* ADD / EDIT DIALOG FORM */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingStartup ? `Edit ${formState.company || 'Startup'}` : 'Add New Startup'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="close-modal-btn" aria-label="Close dialog">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="modal-form">
              {formError && (
                <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Company & URL */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    name="company"
                    value={formState.company}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g. Keploy"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Website URL</label>
                  <input
                    type="text"
                    name="url"
                    value={formState.url}
                    onChange={handleFormChange}
                    placeholder="e.g. https://keploy.io"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="form-group form-group-full">
                <label className="form-label">One-line description</label>
                <input
                  type="text"
                  name="description"
                  value={formState.description}
                  onChange={handleFormChange}
                  placeholder="e.g. API testing platform that generates mock test data"
                  className="form-input"
                />
              </div>

              {/* Sector & Investor */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Sector *</label>
                  <input
                    type="text"
                    name="sector"
                    value={formState.sector}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g. DevOps / Testing"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Investor(s)</label>
                  <input
                    type="text"
                    name="investor"
                    value={formState.investor}
                    onChange={handleFormChange}
                    placeholder="e.g. Sequoia Spark, Boldcap"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Funding Stage & Amount */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Funding Stage</label>
                  <input
                    type="text"
                    name="fundingStage"
                    value={formState.fundingStage}
                    onChange={handleFormChange}
                    placeholder="e.g. Seed, Pre-Seed, Series A"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Funding Amount</label>
                  <input
                    type="text"
                    name="amount"
                    value={formState.amount}
                    onChange={handleFormChange}
                    placeholder="e.g. $3.2M, N/A"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Team Size & Founder Linkedin */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Team Size</label>
                  <input
                    type="number"
                    name="teamSize"
                    value={formState.teamSize}
                    onChange={handleFormChange}
                    min="1"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Founder LinkedIn URL</label>
                  <input
                    type="text"
                    name="founderLinkedin"
                    value={formState.founderLinkedin}
                    onChange={handleFormChange}
                    placeholder="e.g. https://linkedin.com/in/username"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Relevance & Outreach Status */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Role Relevance</label>
                  <select
                    name="relevance"
                    value={formState.relevance}
                    onChange={handleFormChange}
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
                    name="outreachStatus"
                    value={formState.outreachStatus}
                    onChange={handleFormChange}
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

              {/* Last Contact Date & Hiring Toggle */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Last Contact Date</label>
                  <input
                    type="date"
                    name="lastContactDate"
                    value={formState.lastContactDate}
                    onChange={handleFormChange}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      name="hiring"
                      checked={formState.hiring}
                      onChange={handleFormChange}
                    />
                    <div className="checkbox-custom">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Actively Hiring DevOps/MLOps?</span>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div className="form-group form-group-full">
                <label className="form-label">Outreach Notes / Context</label>
                <textarea
                  name="notes"
                  value={formState.notes}
                  onChange={handleFormChange}
                  placeholder="Key details like conversation snippets, tech stack (Kubernetes, AWS, Terraform, Docker), referral routes, hiring feedback..."
                  className="form-textarea"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingStartup ? 'Save Changes' : 'Add Startup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
