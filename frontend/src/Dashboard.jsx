import React, { useState, useEffect, useRef } from 'react';
import Card from './components/Card';
import Button from './components/Button';
import Input from './components/Input';
import { UploadCloud, Trash2, Play, RefreshCw, LogOut, ExternalLink, HardDrive, Server, LayoutGrid, Search } from 'lucide-react';

export default function Dashboard({ onLogout }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadFilename, setUploadFilename] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Custom alerts/toasts
  const [toasts, setToasts] = useState([]);
  const fileInputRef = useRef(null);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      if (res.status === 401) {
        onLogout();
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProjects(data);
    } catch {
      showToast('Could not load projects.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Handle file drop/click uploads
  const triggerBrowse = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleUpload(file);
  };

  const handleUpload = async (file) => {
    if (!file.name.endsWith('.zip')) {
      showToast('Only .zip files are supported.', 'error');
      return;
    }

    setUploading(true);
    setUploadPercent(0);
    setUploadFilename(file.name);

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload');

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setUploadPercent(percent);
      }
    });

    xhr.addEventListener('load', () => {
      setUploading(false);
      if (xhr.status === 200) {
        showToast('Project deployed successfully!', 'success');
        loadProjects();
      } else {
        let errMessage = 'Upload failed';
        try {
          errMessage = JSON.parse(xhr.responseText).error || errMessage;
        } catch (_) {}
        showToast(errMessage, 'error');
      }
    });

    xhr.addEventListener('error', () => {
      setUploading(false);
      showToast('Upload failed due to network error.', 'error');
    });

    xhr.send(formData);
  };

  // Delete project
  const handleDelete = async (name) => {
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      showToast(`Project "${name}" deleted.`, 'info');
      setConfirmDelete(null);
      loadProjects();
    } catch {
      showToast('Failed to delete project.', 'error');
    }
  };

  // Restart PHP process
  const handleRestartPhp = async (name) => {
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(name)}/restart`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error();
      showToast(`PHP server for "${name}" restarted.`, 'success');
    } catch {
      showToast('Failed to restart PHP server.', 'error');
    }
  };

  // Helper bytes formatter
  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredProjects = projects.filter((p) => {
    const matchType = filter === 'all' || p.type === filter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const totalSize = projects.reduce((acc, p) => acc + (p.size || 0), 0);

  return (
    <div className="portfolio-container dashboard-wrapper">
      {/* ─── Header ─── */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            Project <span className="gradient-text">Workspace</span>
          </h1>
          <div className="stats-row">
            <div className="stat-chip">
              <LayoutGrid size={14} /> {projects.length} Projects
            </div>
            <div className="stat-chip">
              <HardDrive size={14} /> {formatBytes(totalSize)} Used
            </div>
            <div className="stat-chip">
              <Server size={14} className="text-emerald-500" /> Active Server
            </div>
          </div>
        </div>
        
        <Button variant="ghost" icon={<LogOut size={16} />} onClick={onLogout}>
          Sign Out
        </Button>
      </div>

      {/* ─── Upload Area ─── */}
      <div className="drop-zone-wrap">
        <div 
          className="drop-zone"
          onClick={triggerBrowse}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
          onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) handleUpload(file);
          }}
        >
          {uploading ? (
            <div className="upload-progress-container">
              <p className="font-semibold text-slate-700 text-sm">Uploading {uploadFilename}...</p>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${uploadPercent}%` }}></div>
              </div>
              <p className="text-xs text-slate-400 mt-2 font-bold">{uploadPercent}% completed</p>
            </div>
          ) : (
            <div>
              <div className="drop-icon-wrap">
                <UploadCloud size={28} />
              </div>
              <h3 className="text-slate-800 font-bold mb-1">Drag and drop your project `.zip` file</h3>
              <p className="text-xs text-slate-400 font-semibold">
                Or <span className="text-blue-500 underline cursor-pointer">browse from computer</span>
              </p>
            </div>
          )}
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".zip" 
          className="hidden" 
        />
      </div>

      {/* ─── Projects Filter and Grid ─── */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
          <div className="relative w-full max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={16} />
            </span>
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
            />
          </div>

          <div className="flex gap-2">
            {['all', 'static', 'php'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full border transition-all duration-200
                  ${filter === t 
                    ? 'bg-blue-500 border-transparent text-white shadow-md shadow-blue-100' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading project workspace...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="empty-state">
            <LayoutGrid size={48} className="opacity-25" />
            <p className="font-semibold text-slate-400">No projects match your filter.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {filteredProjects.map((p) => (
              <Card
                key={p.name}
                title={p.name}
                subtitle={`Storage: ${formatBytes(p.size)} | Deployed: ${p.uploadedAt ? new Date(p.uploadedAt).toLocaleDateString() : 'N/A'}`}
                badge={p.type.toUpperCase()}
                badgeVariant={p.type === 'php' ? 'secondary' : 'primary'}
                footer={
                  <div className="flex gap-2 w-full">
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="primary" size="sm" fullWidth icon={<ExternalLink size={14} />}>
                        Open
                      </Button>
                    </a>
                    
                    {p.type === 'php' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={<RefreshCw size={14} />} 
                        onClick={() => handleRestartPhp(p.name)}
                      >
                        Restart
                      </Button>
                    )}

                    <Button 
                      variant="danger" 
                      size="sm" 
                      icon={<Trash2 size={14} />} 
                      onClick={() => setConfirmDelete(p.name)}
                    />
                  </div>
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── Delete Confirmation Modal ─── */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-icon-danger">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Project</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-800">"{confirmDelete}"</strong>? This will permanently erase the codebase.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => handleDelete(confirmDelete)}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Toast Alerts ─── */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item toast-${t.type}`}>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
