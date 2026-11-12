import React, { useState, useEffect } from 'react';
import './App.css';
import { Geolocation } from '@capacitor/geolocation';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  BarChart3, 
  PlusCircle, 
  FileText, 
  Printer, 
  ListCheck, 
  TrendingUp, 
  Layers, 
  Database, 
  Building2,
  Download,
  Smartphone,
  PieChart,
  FileSpreadsheet,
  FileCode,
  DollarSign,
  Trash2,
  Edit2,
  MapPin,
  Camera,
  Star,
  FileText as NoteIcon,
  GitBranch,
  MoreHorizontal,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  BellRing,
  Mail
} from 'lucide-react';

// ==========================================
// FIREBASE CLOUD CONFIGURATION
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyDtzwOW94exkmt_JHthKInXU3NjdyVKoEs",
  authDomain: "online-shop-dcbea.firebaseapp.com",
  projectId: "online-shop-dcbea",
  storageBucket: "online-shop-dcbea.firebasestorage.app",
  messagingSenderId: "113310368595",
  appId: "1:113310368595:web:54144e4989d1aaae63d7a6"
};

let db = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase init note:", e);
}

const createId = (prefix) => `${prefix}-${globalThis.crypto.randomUUID()}`;

const isFieldVisible = (field, formData) => (
  !field.skipLogic
  || !field.skipLogic.fieldId
  || String(formData[field.skipLogic.fieldId] ?? '') === String(field.skipLogic.value ?? '')
);

// Default Initial M&E Projects
const initialProjects = [
  {
    id: 'proj-1',
    name: 'Sustainable Water Support',
    code: 'SWS-001',
    donor: 'WASH Fund',
    budget: '$30,000',
    location: 'Arusha Region',
    indicators: [
      { id: 'ind-1', level: 'Outcome', title: '% Water points functional during dry seasons', baseline: 0, target: 77, actual: 0, unit: '%', mappedFieldId: null, calcType: 'PERCENTAGE' },
      { id: 'ind-2', level: 'Output', title: '# of new or rehabilitated water points', baseline: 0, target: 100, actual: 0, unit: 'number', mappedFieldId: null, calcType: 'SUM' }
    ],
    forms: [
      {
        id: 'form-1',
        title: 'Water Point Assessment Form',
        description: 'Record water point functionality and location.',
        fields: [
          { id: 'field-name', label: 'Water Point Name', type: 'text', required: true },
          { id: 'field-status', label: 'Functional Status', type: 'select', options: ['Functional', 'Broken Down'], required: true },
          { id: 'field-gps', label: 'GPS Location', type: 'location', required: true }
        ]
      }
    ],
    submissions: []
  }
];

export default function App() {
  const [projects, setProjects] = useState(initialProjects);
  const [license, setLicense] = useState({
    code: '',
    level: '',
    demoClaimed: false,
    activatedAt: null,
    expiresAt: null
  });
  const [isLoadedFromCloud, setIsLoadedFromCloud] = useState(false);

  const [activeProjectId, setActiveProjectId] = useState('proj-1');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);

  // 1. Fetch live data & license from Firebase Firestore on app load
  useEffect(() => {
    async function fetchCloudData() {
      try {
        if (!db) {
          setIsLoadedFromCloud(true);
          return;
        }
        const docRef = doc(db, 'gmel_systems', 'main_workspace');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.projects) setProjects(data.projects);
          if (data.license && data.license.code) {
            setLicense(data.license);
          }
        }
      } catch (err) {
        console.error('Error loading from Firebase, using defaults:', err);
      } finally {
        setIsLoadedFromCloud(true);
      }
    }
    fetchCloudData();
  }, []);

  // 2. Sync state changes & license to Firebase Firestore automatically
  useEffect(() => {
    if (!isLoadedFromCloud || !db) return;

    async function saveCloudData() {
      try {
        const docRef = doc(db, 'gmel_systems', 'main_workspace');
        await setDoc(docRef, { projects, license, updated_at: new Date() });
      } catch (err) {
        console.error('Error saving to Firebase:', err);
      }
    }
    saveCloudData();
  }, [projects, license, isLoadedFromCloud]);

  useEffect(() => {
    const handleInstallAvailable = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const handleInstalled = () => setInstallPrompt(null);

    window.addEventListener('beforeinstallprompt', handleInstallAvailable);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallAvailable);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };
  
  // Modals & Selectors
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [selectedPrintFormId, setSelectedPrintFormId] = useState('');
  
  // Project Form State
  const [newProj, setNewProj] = useState({ name: '', code: '', donor: '', budget: '', location: '' });
  const [editProj, setEditProj] = useState({ name: '', code: '', donor: '', budget: '', location: '' });

  const currentProject = projects.find(p => p.id === activeProjectId) || projects[0] || { id: '', name: 'No Projects', code: '', indicators: [], forms: [], submissions: [] };

  // Check if license is valid or expired
  const isExpired = license.expiresAt && new Date() > new Date(license.expiresAt);
  const hasValidLicense = Boolean(license.code && !isExpired);

  // If data is still loading from cloud, show loading screen
  if (!isLoadedFromCloud) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans text-white">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-sm text-slate-400">Loading GMEL System Workspace from Cloud...</p>
        </div>
      </div>
    );
  }

  // IF NO VALID LICENSE, LOCK APP AND SHOW ACTIVATION / PAYMENT GATEWAY SCREEN
  if (!hasValidLicense) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-white">
        <div className="max-w-xl w-full">
          <div className="text-center mb-6">
            <div className="bg-indigo-600 p-3 rounded-2xl w-fit mx-auto shadow-lg mb-3">
              <Layers className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">GMEL M&amp;E SYSTEM ACCESS GATEWAY</h1>
            <p className="text-sm text-slate-400 mt-1">Please select a subscription plan or activate your license to proceed.</p>
          </div>
          
          <LicenseActivationView license={license} setLicense={setLicense} isGateway={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen bg-white text-slate-900 flex flex-col font-sans border-t-4 border-indigo-600">
      {/* Top Header Bar */}
      <header className="app-header bg-slate-900 text-white shadow-lg sticky top-0 z-50 print:hidden">
        <div className="header-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="brand flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-inner">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                GMEL <span className="text-xs bg-indigo-500/30 text-indigo-300 font-mono px-2 py-0.5 rounded border border-indigo-400/30">SYSTEM</span>
              </h1>
            </div>
          </div>

          <div className="project-toolbar flex items-center space-x-2 sm:space-x-3">
            <div className="project-picker flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 shadow-sm">
              <Building2 className="h-4 w-4 text-indigo-400" />
              <label htmlFor="project-select" className="text-xs text-slate-300 font-medium">Project:</label>
              <select 
                id="project-select"
                value={activeProjectId} 
                onChange={(e) => setActiveProjectId(e.target.value)}
                className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer max-w-[150px] sm:max-w-[220px] truncate"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-800 text-white">{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            {installPrompt && (
              <button
                type="button"
                onClick={handleInstallApp}
                aria-label="Install G-MEL app"
                title="Install G-MEL app"
                className="install-app-button bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1 transition"
              >
                <Download className="h-4 w-4" />
                <span>Install</span>
              </button>
            )}

            <button 
              onClick={() => {
                setEditProj({
                  name: currentProject.name,
                  code: currentProject.code,
                  donor: currentProject.donor,
                  budget: currentProject.budget,
                  location: currentProject.location
                });
                setShowEditProjectModal(true);
              }}
              title="Rename or Delete Current Project"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 p-2 rounded-lg font-bold text-xs flex items-center gap-1 transition"
            >
              <Edit2 className="h-4 w-4 text-amber-400" />
            </button>

            <button 
              onClick={() => setShowAddProjectModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-md"
            >
              <PlusCircle className="h-4 w-4" />
              New Project
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="desktop-nav app-nav bg-slate-800 border-t border-slate-700 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard & Visuals', icon: BarChart3 },
              { id: 'logframe', label: 'Logframe Matrix', icon: TrendingUp },
              { id: 'reports', label: 'Custom Reports', icon: FileText },
              { id: 'builder', label: 'Form Builder', icon: FileText },
              { id: 'entry', label: 'Data Submission', icon: ListCheck },
              { id: 'export', label: 'Export Suite', icon: Download },
              { id: 'mobile', label: 'Mobile App Sync', icon: Smartphone },
              { id: 'print', label: 'Print Forms', icon: Printer },
              { id: 'license', label: 'License & Activation', icon: KeyRound }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'border-indigo-500 text-indigo-300 bg-slate-900/80 shadow-sm' 
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="app-main flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 bg-white">
        {activeTab === 'dashboard' && (
          <DashboardView 
            project={currentProject} 
            getCalculatedActual={getCalculatedActual} 
            onOpenEditProject={() => {
              setEditProj({
                name: currentProject.name,
                code: currentProject.code,
                donor: currentProject.donor,
                budget: currentProject.budget,
                location: currentProject.location
              });
              setShowEditProjectModal(true);
            }} 
          />
        )}
        {activeTab === 'logframe' && <LogframeView project={currentProject} getCalculatedActual={getCalculatedActual} setProjects={setProjects} />}
        {activeTab === 'reports' && <CustomReportsView project={currentProject} getCalculatedActual={getCalculatedActual} />}
        {activeTab === 'builder' && (
          <FormBuilderView 
            project={currentProject} 
            setProjects={setProjects} 
            onRenameForm={(formId, title, desc) => {
              setProjects(prev => prev.map(p => p.id !== currentProject.id ? p : {
                ...p,
                forms: p.forms.map(f => f.id === formId ? { ...f, title, description: desc } : f)
              }));
            }} 
            onDeleteForm={(formId) => {
              if (!window.confirm('Delete this form?')) return;
              setProjects(prev => prev.map(p => p.id !== currentProject.id ? p : {
                ...p,
                forms: p.forms.filter(f => f.id !== formId)
              }));
            }} 
          />
        )}
        {activeTab === 'entry' && (
          <DataEntryView 
            project={currentProject} 
            onSubmitForm={(formId, data) => {
              const submissionObj = { id: createId('sub'), formId, timestamp: new Date().toLocaleString(), data };
              setProjects(prev => prev.map(p => p.id !== currentProject.id ? p : {
                ...p,
                submissions: [submissionObj, ...p.submissions]
              }));
              alert('Data record submitted and synced to Firebase successfully!');
            }} 
            onDeleteSubmission={(subId) => {
              setProjects(prev => prev.map(p => p.id !== currentProject.id ? p : {
                ...p,
                submissions: p.submissions.filter(s => s.id !== subId)
              }));
            }} 
            onClearAllSubmissions={() => {
              if (!window.confirm('Clear all submissions?')) return;
              setProjects(prev => prev.map(p => p.id !== currentProject.id ? p : { ...p, submissions: [] }));
            }} 
          />
        )}
        {activeTab === 'export' && (
          <ExportSuiteView 
            onExportSubmissions={() => exportCSV(currentProject.submissions, `${currentProject.code}_submissions.csv`)}
            onExportLogframe={() => exportCSV(currentProject.indicators, `${currentProject.code}_logframe.csv`)}
            onExportBackup={() => {
              const blob = new Blob([JSON.stringify({ projects, license }, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = 'gmel_system_backup.json'; a.click();
            }} 
          />
        )}
        {activeTab === 'mobile' && <MobileSyncView project={currentProject} />}
        {activeTab === 'print' && <PrintableFormsView project={currentProject} selectedFormId={selectedPrintFormId} setSelectedFormId={setSelectedPrintFormId} />}
        {activeTab === 'license' && <LicenseActivationView license={license} setLicense={setLicense} />}
      </main>

      <nav className="mobile-nav print:hidden" aria-label="Main navigation">
        {[
          { id: 'dashboard', label: 'Home', icon: BarChart3 },
          { id: 'logframe', label: 'Indicators', icon: TrendingUp },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'print', label: 'Print', icon: Printer },
          { id: 'more', label: 'More', icon: MoreHorizontal }
        ].map(item => {
          const Icon = item.icon;
          const selected = item.id === 'more'
            ? showMobileMenu || ['builder', 'entry', 'export', 'mobile', 'license'].includes(activeTab)
            : activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.id === 'more' ? 'More sections' : item.label}
              aria-current={selected ? 'page' : undefined}
              onClick={() => {
                if (item.id === 'more') {
                  setShowMobileMenu(value => !value);
                } else {
                  setActiveTab(item.id);
                  setShowMobileMenu(false);
                }
              }}
              className={`mobile-nav-item${selected ? ' is-active' : ''}`}
            >
              <Icon aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      {showMobileMenu && (
        <div className="mobile-more-menu print:hidden">
          {[
            { id: 'entry', label: 'Collect data', icon: ListCheck },
            { id: 'builder', label: 'Form builder', icon: FileText },
            { id: 'export', label: 'Export data', icon: Download },
            { id: 'mobile', label: 'Mobile sync', icon: Smartphone },
            { id: 'license', label: 'License & Activation', icon: KeyRound }
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setShowMobileMenu(false);
                }}
                className="mobile-more-item"
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* CREATE NEW PROJECT MODAL */}
      {showAddProjectModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600" /> Create New M&amp;E Project
              </h3>
              <button onClick={() => setShowAddProjectModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newProj.name.trim() || !newProj.code.trim()) return;
              const projectObj = {
                ...newProj,
                id: createId('proj'),
                indicators: [],
                forms: [],
                submissions: []
              };
              setProjects(prev => [...prev, projectObj]);
              setActiveProjectId(projectObj.id);
              setShowAddProjectModal(false);
              setNewProj({ name: '', code: '', donor: '', budget: '', location: '' });
            }} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Name *</label>
                <input type="text" required placeholder="e.g. Sustainable Water Support" value={newProj.name} onChange={(e) => setNewProj({...newProj, name: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Code *</label>
                  <input type="text" required placeholder="e.g. SWS-2026" value={newProj.code} onChange={(e) => setNewProj({...newProj, code: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Budget</label>
                  <input type="text" placeholder="e.g. $300,000" value={newProj.budget} onChange={(e) => setNewProj({...newProj, budget: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Donor / Partner</label>
                <input type="text" placeholder="e.g. USAID" value={newProj.donor} onChange={(e) => setNewProj({...newProj, donor: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location / Target Region</label>
                <input type="text" placeholder="e.g. Arusha Region" value={newProj.location} onChange={(e) => setNewProj({...newProj, location: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setShowAddProjectModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROJECT MODAL */}
      {showEditProjectModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-indigo-600" /> Edit Project Details
              </h3>
              <button onClick={() => setShowEditProjectModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              setProjects(prev => prev.map(p => p.id === currentProject.id ? { ...p, ...editProj } : p));
              setShowEditProjectModal(false);
            }} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Name</label>
                <input type="text" required value={editProj.name} onChange={(e) => setEditProj({...editProj, name: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Code</label>
                  <input type="text" required value={editProj.code} onChange={(e) => setEditProj({...editProj, code: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Budget</label>
                  <input type="text" value={editProj.budget} onChange={(e) => setEditProj({...editProj, budget: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Donor / Partner</label>
                <input type="text" value={editProj.donor} onChange={(e) => setEditProj({...editProj, donor: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                <input type="text" value={editProj.location} onChange={(e) => setEditProj({...editProj, location: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" />
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={() => {
                    if (projects.length <= 1) {
                      alert('You must keep at least one project.');
                      return;
                    }
                    if (!window.confirm(`Delete project "${currentProject.name}"?`)) return;
                    const remaining = projects.filter(p => p.id !== currentProject.id);
                    setProjects(remaining);
                    setActiveProjectId(remaining[0].id);
                    setShowEditProjectModal(false);
                  }} 
                  className="px-3 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete Project
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowEditProjectModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Save Changes</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// HELPER CALCULATOR FUNCTION
function getCalculatedActual(project, ind) {
  if (!ind.mappedFieldId) return ind.baseline || 0;
  const values = project.submissions.map(sub => Number(sub.data[ind.mappedFieldId])).filter(v => !isNaN(v));
  if (values.length === 0) return ind.baseline || 0;

  if (ind.calcType === 'AVG') return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  if (ind.calcType === 'COUNT') return values.length;
  if (ind.calcType === 'MAX') return Math.max(...values);
  if (ind.calcType === 'PERCENTAGE') return ((values.filter(v => v > 0).length / values.length) * 100).toFixed(0);
  return values.reduce((a, b) => a + b, 0); // Default SUM
}

function exportCSV(dataArray, filename) {
  if (!dataArray || dataArray.length === 0) {
    alert('No data available to export.');
    return;
  }
  const csvContent = "data:text/csv;charset=utf-8," + [
    Object.keys(dataArray[0]).join(","),
    ...dataArray.map(item => Object.values(item).map(v => typeof v === 'object' ? JSON.stringify(v) : `"${v}"`).join(","))
  ].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// DASHBOARD COMPONENT
function DashboardView({ project, getCalculatedActual, onOpenEditProject }) {
  const levels = [
    { name: 'Impact', color: '#b7791f' },
    { name: 'Outcome', color: '#5265d8' },
    { name: 'Output', color: '#12977a' },
    { name: 'Activity', color: '#8291a7' }
  ];
  const totalIndicators = project.indicators.length;
  let chartPosition = 0;
  const chartSegments = levels.map(level => {
    const count = project.indicators.filter(indicator => indicator.level === level.name).length;
    const percentage = totalIndicators ? (count / totalIndicators) * 100 : 0;
    const segment = `${level.color} ${chartPosition}% ${chartPosition + percentage}%`;
    chartPosition += percentage;
    return segment;
  }).join(', ');

  return (
    <div className="space-y-6">
      <div className="dashboard-heading flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="text-xs font-bold text-indigo-600 uppercase">MONITORING &amp; EVALUATION WORKSPACE</div>
          <h2 className="text-xl font-black text-slate-900 mt-0.5">{project.name}</h2>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1"><MapPin className="h-4 w-4" /> {project.location} · Reporting period: 2026</p>
        </div>
        <button onClick={onOpenEditProject} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition">
          <Edit2 className="h-4 w-4" /> Edit project
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Project Code</p>
            <h3 className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">{project.code}</h3>
          </div>
          <Building2 className="h-9 w-9 text-indigo-600 bg-indigo-50 p-2 rounded-xl border border-indigo-100" />
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Donor Funding</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{project.budget}</h3>
            <p className="text-xs text-slate-600 truncate max-w-[130px] font-medium">{project.donor}</p>
          </div>
          <DollarSign className="h-9 w-9 text-emerald-600 bg-emerald-50 p-2 rounded-xl border border-emerald-100" />
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Active Indicators</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{project.indicators.length}</h3>
          </div>
          <TrendingUp className="h-9 w-9 text-blue-600 bg-blue-50 p-2 rounded-xl border border-blue-100" />
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Total Submissions</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{project.submissions.length}</h3>
          </div>
          <Database className="h-9 w-9 text-amber-600 bg-amber-50 p-2 rounded-xl border border-amber-100" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" /> Indicator Target vs. Calculated Progress
            </h3>
          </div>
          <div className="space-y-5 pt-2">
            {project.indicators.map(ind => {
              const actual = Number(getCalculatedActual(project, ind));
              const target = ind.target || 1;
              const pct = Math.min(100, Math.max(0, Math.round(((actual - ind.baseline) / (target - ind.baseline || 1)) * 100)));
              return (
                <div key={ind.id} className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-start text-xs font-bold">
                    <span className="text-slate-800 text-sm font-semibold">{ind.title}</span>
                    <span className="bg-indigo-100 text-indigo-900 font-mono px-2.5 py-1 rounded-md border border-indigo-200">
                      {actual} / {target} {ind.unit} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden flex border border-slate-300">
                    <div className="bg-indigo-600 h-3.5 rounded-full transition-all duration-500" style={{ width: `${Math.max(0, pct)}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <PieChart className="h-5 w-5 text-indigo-600" /> Indicator Level Breakdown
            </h3>
            <div className="py-6 flex justify-center">
              <div className="w-32 h-32 rounded-full relative flex items-center justify-center shadow-inner" style={{ background: `conic-gradient(${chartSegments || '#e5e7eb 0% 100%'})` }}>
                <div className="absolute w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center shadow">
                  <strong className="text-base font-extrabold text-slate-900">{totalIndicators}</strong>
                  <span className="text-[10px] uppercase font-bold text-slate-500">indicators</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              {levels.map(({ name: lvl, color }) => {
                const count = project.indicators.filter(i => i.level === lvl).length;
                return (
                  <div key={lvl} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800 flex items-center gap-2"><span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />{lvl} level</span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-300 font-bold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// LOGFRAME COMPONENT
function LogframeView({ project, getCalculatedActual, setProjects }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIndicatorId, setEditingIndicatorId] = useState(null);
  const [newInd, setNewInd] = useState({ level: 'Output', title: '', baseline: 0, target: 100, unit: 'Units' });

  const handleAddIndicator = () => {
    if (!newInd.title.trim()) return;
    const indicatorObj = { ...newInd, id: createId('ind'), actual: newInd.baseline, mappedFieldId: null, calcType: 'SUM' };
    setProjects(prev => prev.map(p => p.id !== project.id ? p : { ...p, indicators: [...p.indicators, indicatorObj] }));
    setShowAddModal(false);
    setNewInd({ level: 'Output', title: '', baseline: 0, target: 100, unit: 'Units' });
  };

  const openIndicatorEditor = (indicator) => {
    setNewInd({
      level: indicator.level,
      title: indicator.title,
      baseline: indicator.baseline,
      target: indicator.target,
      unit: indicator.unit
    });
    setEditingIndicatorId(indicator.id);
    setShowAddModal(true);
  };

  const handleSaveIndicator = () => {
    if (!newInd.title.trim()) return;
    if (!editingIndicatorId) {
      handleAddIndicator();
      return;
    }

    setProjects(prev => prev.map(p => p.id !== project.id ? p : {
      ...p,
      indicators: p.indicators.map(ind => ind.id === editingIndicatorId ? { ...ind, ...newInd, title: newInd.title.trim() } : ind)
    }));
    setEditingIndicatorId(null);
    setShowAddModal(false);
    setNewInd({ level: 'Output', title: '', baseline: 0, target: 100, unit: 'Units' });
  };

  const handleDeleteIndicator = (indicator) => {
    if (!window.confirm(`Delete the indicator "${indicator.title}"?`)) return;
    setProjects(prev => prev.map(p => p.id !== project.id ? p : {
      ...p,
      indicators: p.indicators.filter(ind => ind.id !== indicator.id)
    }));
  };

  const handleMapField = (indicatorId, fieldId, calcType) => {
    setProjects(prev => prev.map(p => p.id !== project.id ? p : {
      ...p,
      indicators: p.indicators.map(ind => ind.id !== indicatorId ? ind : { ...ind, mappedFieldId: fieldId, calcType })
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Logical Framework (Logframe) Matrix</h2>
          <p className="text-sm text-slate-500">Indicators update automatically as linked field submissions arrive.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2">
          <PlusCircle className="h-4 w-4" /> Add Indicator
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
              <th className="p-4">Level</th>
              <th className="p-4">Indicator Statement</th>
              <th className="p-4 text-center">Baseline</th>
              <th className="p-4 text-center">Target</th>
              <th className="p-4 text-center">Calculated Actual</th>
              <th className="p-4 text-center">Progress</th>
              <th className="p-4">Automated Data Mapping</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {project.indicators.map((ind) => {
              const actual = getCalculatedActual(project, ind);
              const pct = Math.min(100, Math.round(((actual - ind.baseline) / (ind.target - ind.baseline || 1)) * 100));
              const availableFields = project.forms.flatMap(f => f.fields.map(field => ({
                fieldId: field.id, label: `${f.title} → ${field.label}`
              })));

              return (
                <tr key={ind.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold">
                    <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold border bg-indigo-50 text-indigo-800 border-indigo-200">{ind.level}</span>
                  </td>
                  <td className="p-4 font-semibold text-slate-900">{ind.title}</td>
                  <td className="p-4 text-center font-mono text-slate-600">{ind.baseline} {ind.unit}</td>
                  <td className="p-4 text-center font-mono font-bold text-slate-800">{ind.target} {ind.unit}</td>
                  <td className="p-4 text-center font-mono font-extrabold text-indigo-700 bg-indigo-50/80">{actual} {ind.unit}</td>
                  <td className="p-4 text-center">
                    <div className="w-28 mx-auto">
                      <div className="text-xs font-bold mb-1 text-slate-700">{pct}%</div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden border border-slate-300">
                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${Math.max(0, pct)}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={ind.mappedFieldId || ''}
                        onChange={(e) => handleMapField(ind.id, e.target.value || null, ind.calcType || 'SUM')}
                        className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 shadow-sm"
                      >
                        <option value="">Manual Entry (No Form Linked)</option>
                        {availableFields.map(f => (<option key={f.fieldId} value={f.fieldId}>🔗 {f.label}</option>))}
                      </select>
                      {ind.mappedFieldId && (
                        <select
                          value={ind.calcType || 'SUM'}
                          onChange={(e) => handleMapField(ind.id, ind.mappedFieldId, e.target.value)}
                          className="text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 rounded-lg px-2 py-1.5"
                        >
                          <option value="SUM">SUM</option>
                          <option value="AVG">AVG</option>
                          <option value="COUNT">COUNT</option>
                          <option value="MAX">MAX</option>
                          <option value="PERCENTAGE">PERCENTAGE (%)</option>
                        </select>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openIndicatorEditor(ind)} title="Edit indicator" className="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteIndicator(ind)} title="Delete indicator" className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">{editingIndicatorId ? 'Edit Logframe Indicator' : 'Add New Logframe Indicator'}</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hierarchy Level</label>
              <select value={newInd.level} onChange={(e) => setNewInd({...newInd, level: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm">
                <option value="Impact">Impact</option><option value="Outcome">Outcome</option><option value="Output">Output</option><option value="Activity">Activity</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Indicator Statement</label>
              <input type="text" placeholder="e.g. Number of households trained" value={newInd.title} onChange={(e) => setNewInd({...newInd, title: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="block text-xs font-bold mb-1">Baseline</label><input type="number" value={newInd.baseline} onChange={(e) => setNewInd({...newInd, baseline: parseFloat(e.target.value) || 0})} className="w-full border rounded-lg p-2.5 text-sm" /></div>
              <div><label className="block text-xs font-bold mb-1">Target</label><input type="number" value={newInd.target} onChange={(e) => setNewInd({...newInd, target: parseFloat(e.target.value) || 0})} className="w-full border rounded-lg p-2.5 text-sm" /></div>
              <div><label className="block text-xs font-bold mb-1">Unit</label><input type="text" value={newInd.unit} onChange={(e) => setNewInd({...newInd, unit: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm" /></div>
            </div>
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <button onClick={() => { setShowAddModal(false); setEditingIndicatorId(null); }} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
              <button onClick={handleSaveIndicator} className="px-4 py-2 text-sm bg-indigo-600 text-white font-bold rounded-lg">Save Indicator</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// LICENSE & ACTIVATION COMPONENT
function LicenseActivationView({ license, setLicense, isGateway = false }) {
  const [inputCode, setInputCode] = useState('');

  const activateCode = (codeToActivate) => {
    const code = codeToActivate.trim().toUpperCase();
    let newLicenseData = null;

    if (code === 'DEMO-5DAYS') {
      if (license.demoClaimed || license.code === 'DEMO-5DAYS') {
        alert('❌ This workspace has already claimed the 5-day demo. Please upgrade to an Annual or Lifetime plan.');
        return;
      }
      newLicenseData = {
        code,
        level: 'Level 1: 5-Day Demo',
        demoClaimed: true,
        activatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      };
    } else if (code === 'ANNUAL-2026') {
      newLicenseData = {
        code,
        level: 'Level 2: One-Year Plan',
        demoClaimed: true,
        activatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };
    } else if (code === 'LIFETIME-GMEL') {
      newLicenseData = {
        code,
        level: 'Level 3: Pay-Once Lifetime License',
        demoClaimed: true,
        activatedAt: new Date().toISOString(),
        expiresAt: null
      };
    } else {
      alert('Invalid activation code. Please enter a valid code or request one after payment.');
      return;
    }

    setLicense(newLicenseData);
    setInputCode('');
    alert(`Activation successful! Tier: ${newLicenseData.level}`);
  };

  const handleActivate = (e) => {
    e.preventDefault();
    activateCode(inputCode);
  };

  const isExpired = license.expiresAt && new Date() > new Date(license.expiresAt);
  const daysRemaining = license.expiresAt ? Math.ceil((new Date(license.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className={`mx-auto space-y-6 ${isGateway ? 'max-w-xl text-slate-900' : 'max-w-3xl'}`}>
      {!isGateway && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-indigo-600" /> System License &amp; Activation
          </h2>
          <p className="text-sm text-slate-500">Manage your subscription tier and system activation keys.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${!isExpired && license.code === 'DEMO-5DAYS' ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200 text-slate-900'}`}>
          <div>
            <span className="text-xs font-bold uppercase text-indigo-600">Level 1</span>
            <h3 className="text-base font-bold text-slate-900 mt-1">5-Day Demo</h3>
            <p className="text-xs text-slate-600 mt-2">Trial code for testing features.</p>
          </div>
          <div className="mt-4 pt-3 border-t">
            <button 
              onClick={() => activateCode('DEMO-5DAYS')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow transition flex items-center justify-center gap-1.5"
            >
              🚀 Activate Free Demo
            </button>
          </div>
        </div>

        <div className="p-5 rounded-2xl border shadow-sm bg-white border-slate-200 text-slate-900 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-emerald-600">Level 2</span>
            <h3 className="text-base font-bold text-slate-900 mt-1">One-Year Plan</h3>
            <p className="text-xs text-slate-600 mt-2">Full access for 365 days.</p>
          </div>
          <div className="mt-4 pt-3 border-t">
            <a 
              href="mailto:support@enrichdata.or.tz?subject=Request%20Annual%20License%20Key"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow transition flex items-center justify-center gap-1.5 text-center"
            >
              <Mail className="h-4 w-4" /> Request via Email
            </a>
          </div>
        </div>

        <div className="p-5 rounded-2xl border shadow-sm bg-white border-slate-200 text-slate-900 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-amber-600">Level 3</span>
            <h3 className="text-base font-bold text-slate-900 mt-1">Pay-Once Lifetime</h3>
            <p className="text-xs text-slate-600 mt-2">Permanent license, never expires.</p>
          </div>
          <div className="mt-4 pt-3 border-t">
            <a 
              href="mailto:support@enrichdata.or.tz?subject=Request%20Lifetime%20License%20Key"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow transition flex items-center justify-center gap-1.5 text-center"
            >
              <Mail className="h-4 w-4" /> Request via Email
            </a>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-2xl shadow-sm border space-y-5 ${isGateway ? 'bg-white text-slate-900' : 'bg-white border-slate-200'}`}>
        {!isGateway && (
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Current Active License Status</h3>
              <p className="text-xs text-slate-500 mt-0.5">Key: <span className="font-mono font-bold text-indigo-700">{license.code || 'None'}</span></p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${isExpired ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
              {isExpired ? <AlertTriangle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              {isExpired ? 'Expired' : 'Active'}
            </span>
          </div>
        )}

        <form onSubmit={handleActivate} className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-slate-700">Have an Activation Code? Enter it here:</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              required
              placeholder="e.g. ANNUAL-2026 or LIFETIME-GMEL"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="flex-1 border rounded-lg p-2.5 text-sm font-mono bg-white uppercase shadow-sm text-slate-900"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm shadow">
              Activate Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// CUSTOM REPORTS COMPONENT
function CustomReportsView({ project, getCalculatedActual }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Custom Reports &amp; Scorecard</h2>
          <p className="text-sm text-slate-500">Donor-ready summary report for {project.name}.</p>
        </div>
        <button onClick={() => window.print()} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow hover:bg-slate-800 print:hidden">
          <Printer className="h-4 w-4" /> Print Report
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="border-b pb-4 flex justify-between items-start">
          <div>
            <span className="text-xs font-mono bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded font-bold">{project.code}</span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">{project.name}</h1>
            <p className="text-sm text-slate-600 mt-0.5"><MapPin className="h-4 w-4 inline mr-1" /> {project.location}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase font-bold">Donor Partner</p>
            <p className="text-sm font-bold text-slate-900">{project.donor}</p>
            <p className="text-xs text-emerald-600 font-bold mt-1">Budget: {project.budget}</p>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-600" /> Executive Indicator Performance Scorecard
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-xs uppercase font-bold border-b">
                  <th className="p-3">Level</th>
                  <th className="p-3">Indicator Statement</th>
                  <th className="p-3 text-center">Baseline</th>
                  <th className="p-3 text-center">Target</th>
                  <th className="p-3 text-center">Actual</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {project.indicators.map(ind => {
                  const actual = Number(getCalculatedActual(project, ind));
                  const target = ind.target || 1;
                  const pct = Math.min(100, Math.round(((actual - ind.baseline) / (target - ind.baseline || 1)) * 100));
                  return (
                    <tr key={ind.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold"><span className="px-2 py-0.5 bg-indigo-50 text-indigo-800 rounded text-xs border">{ind.level}</span></td>
                      <td className="p-3 font-semibold text-slate-900">{ind.title}</td>
                      <td className="p-3 text-center font-mono text-slate-600">{ind.baseline} {ind.unit}</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-800">{ind.target} {ind.unit}</td>
                      <td className="p-3 text-center font-mono font-extrabold text-indigo-700">{actual} {ind.unit}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${pct >= 100 ? 'bg-emerald-100 text-emerald-800' : pct >= 50 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                          {pct}% Achieved
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// FORM BUILDER COMPONENT
function FormBuilderView({ project, setProjects, onRenameForm, onDeleteForm }) {
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [fields, setFields] = useState([{ id: 'field-1', label: 'Beneficiary Full Name', type: 'text', required: true, options: [], skipLogic: null }]);

  const [editingFormId, setEditingFormId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const addField = (type) => {
    setFields([...fields, {
      id: createId('field'),
      label: `New ${type.toUpperCase()} Question`,
      type,
      required: false,
      options: type === 'select' ? ['Option 1', 'Option 2'] : [],
      skipLogic: null
    }]);
  };

  const handleSaveForm = () => {
    if (!formTitle.trim()) {
      alert('Please enter a title for the form.');
      return;
    }
    const formId = createId('form');
    const fieldIds = new Map(fields.map(field => [field.id, createId('field')]));
    const newForm = {
      id: formId,
      title: formTitle,
      description: formDesc,
      fields: fields.map(field => ({
        ...field,
        id: fieldIds.get(field.id),
        skipLogic: field.skipLogic ? { ...field.skipLogic, fieldId: fieldIds.get(field.skipLogic.fieldId) } : null
      }))
    };
    setProjects(prev => prev.map(p => p.id !== project.id ? p : { ...p, forms: [...p.forms, newForm] }));
    setFormTitle('');
    setFormDesc('');
    setFields([{ id: 'field-1', label: 'Beneficiary Full Name', type: 'text', required: true, options: [], skipLogic: null }]);
    alert('Custom form published and saved to Firebase!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Advanced Form Generator</h2>
        <p className="text-sm text-slate-500">Design surveys with GPS, Photos, Notes, Ratings, and Skip Logic for {project.name}.</p>
      </div>

      {project.forms.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b pb-2">Active Project Forms ({project.forms.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.forms.map(form => (
              <div key={form.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                {editingFormId === form.id ? (
                  <div className="space-y-2">
                    <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full border rounded p-1.5 text-sm font-bold bg-white" />
                    <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="w-full border rounded p-1.5 text-xs bg-white h-14" />
                    <div className="flex justify-end gap-2 pt-1">
                      <button onClick={() => setEditingFormId(null)} className="px-2.5 py-1 text-xs border rounded bg-white">Cancel</button>
                      <button onClick={() => { onRenameForm(form.id, editTitle, editDesc); setEditingFormId(null); }} className="px-2.5 py-1 text-xs text-white bg-indigo-600 rounded">Save</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-900 text-sm">{form.title}</h4>
                        <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded font-mono text-slate-600 font-bold">{form.fields.length} Fields</span>
                      </div>
                      {form.description && <p className="text-xs text-slate-500 mt-1">{form.description}</p>}
                    </div>
                    <div className="flex justify-end items-center gap-2 pt-2 border-t mt-2">
                      <button onClick={() => { setEditingFormId(form.id); setEditTitle(form.title); setEditDesc(form.description || ''); }} className="text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center gap-1 bg-white px-2 py-1 rounded border">
                        <Edit2 className="h-3 w-3" /> Rename
                      </button>
                      <button onClick={() => onDeleteForm(form.id)} className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1 bg-red-50 px-2 py-1 rounded border border-red-200">
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b pb-2">Create New Custom Form</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Form Name</label>
              <input type="text" placeholder="e.g. Beneficiary Monitoring Survey" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm bg-white font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Instructions / Description</label>
              <textarea placeholder="Guidelines for enumerators..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm h-20" />
            </div>
          </div>

          <hr className="border-slate-200" />

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Form Questions ({fields.length})</h3>
            {fields.map((field, idx) => (
              <div key={field.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-500 font-mono">Question {idx + 1}</span>
                  <input 
                    type="text" 
                    value={field.label} 
                    onChange={(e) => {
                      const updated = [...fields];
                      updated[idx].label = e.target.value;
                      setFields(updated);
                    }} 
                    className="flex-1 bg-white border rounded-lg px-3 py-1.5 text-sm font-semibold shadow-sm" 
                  />
                  <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-1 rounded uppercase">{field.type}</span>
                  <button onClick={() => setFields(fields.filter(f => f.id !== field.id))} className="text-xs text-red-600 font-bold bg-red-50 p-1.5 rounded border border-red-200">Remove</button>
                </div>

                {field.type === 'select' && (
                  <div className="pl-6 text-xs space-y-1">
                    <label className="font-bold text-slate-600">Dropdown Options (comma separated):</label>
                    <input 
                      type="text" 
                      value={field.options.join(', ')} 
                      onChange={(e) => {
                        const updated = [...fields];
                        updated[idx].options = e.target.value.split(',').map(s => s.trim());
                        setFields(updated);
                      }}
                      className="w-full border rounded p-1 bg-white"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <button onClick={handleSaveForm} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition">
            Publish Form To Project
          </button>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md space-y-4 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Add Question Type</h3>
          <div className="grid grid-cols-1 gap-2">
            {[
              { type: 'text', label: 'Short Text', icon: FileText },
              { type: 'number', label: 'Numeric Quantity', icon: DollarSign },
              { type: 'date', label: 'Date Picker', icon: FileText },
              { type: 'select', label: 'Dropdown Select', icon: GitBranch },
              { type: 'location', label: 'GPS Location', icon: MapPin },
              { type: 'photo', label: 'Photo / Image Capture', icon: Camera },
              { type: 'note', label: 'Long Note / Observation', icon: NoteIcon },
              { type: 'rating', label: '1-5 Star Rating', icon: Star }
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.type}
                  onClick={() => addField(tool.type)}
                  className="flex items-center space-x-2.5 bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl border border-slate-700 text-xs font-semibold transition text-left"
                >
                  <Icon className="h-4 w-4 text-indigo-400" />
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// DATA ENTRY COMPONENT
function DataEntryView({ project, onSubmitForm, onDeleteSubmission, onClearAllSubmissions }) {
  const [selectedFormId, setSelectedFormId] = useState(project.forms[0]?.id || '');
  const [formData, setFormData] = useState({});

  const activeForm = project.forms.find(f => f.id === selectedFormId);

  const handleCaptureGPS = async (fieldId) => {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000
      });
      const coords = `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`;
      setFormData(prev => ({ ...prev, [fieldId]: coords }));
      alert(`GPS captured successfully: ${coords}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      alert(`Unable to retrieve location. ${message}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeForm) return;
    onSubmitForm(activeForm.id, formData);
    setFormData({});
  };

  return (
    <div className="space-y-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Field Data Entry Submission</h2>
          <p className="text-sm text-slate-500">Record field survey responses synced directly to Firebase.</p>

          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Form</label>
            <select 
              value={selectedFormId} 
              onChange={(e) => { setSelectedFormId(e.target.value); setFormData({}); }}
              className="w-full border rounded-lg p-2.5 text-sm font-bold bg-white"
            >
              {project.forms.map(f => (<option key={f.id} value={f.id}>{f.title}</option>))}
            </select>
          </div>
        </div>

        {activeForm ? (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
            <h3 className="font-bold text-slate-900 text-lg border-b pb-2">{activeForm.title}</h3>
            {activeForm.fields.map(field => {
              return (
                <div key={field.id} className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>

                  {field.type === 'number' || field.type === 'text' || field.type === 'date' ? (
                    <input 
                      type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                      required={field.required}
                      value={formData[field.id] || ''}
                      onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
                      className="w-full border rounded-lg p-2.5 text-sm bg-white shadow-sm"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      required={field.required}
                      value={formData[field.id] || ''}
                      onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
                      className="w-full border rounded-lg p-2.5 text-sm bg-white shadow-sm"
                    >
                      <option value="">-- Select Option --</option>
                      {(field.options || []).map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                    </select>
                  ) : field.type === 'location' ? (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        readOnly
                        required={field.required}
                        placeholder="Latitude, Longitude"
                        value={formData[field.id] || ''}
                        className="flex-1 border rounded-lg p-2.5 text-sm bg-slate-50 font-mono"
                      />
                      <button 
                        type="button"
                        onClick={() => handleCaptureGPS(field.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                      >
                        <MapPin className="h-4 w-4" /> Capture GPS
                      </button>
                    </div>
                  ) : field.type === 'photo' ? (
                    <input 
                      type="file" 
                      accept="image/*"
                      required={field.required}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) setFormData({...formData, [field.id]: file.name});
                      }}
                      className="w-full border rounded-lg p-2 text-sm bg-white"
                    />
                  ) : field.type === 'note' ? (
                    <textarea 
                      required={field.required}
                      placeholder="Enter detailed observations..."
                      value={formData[field.id] || ''}
                      onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
                      className="w-full border rounded-lg p-2.5 text-sm h-24 bg-white"
                    />
                  ) : field.type === 'rating' ? (
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({...formData, [field.id]: String(star)})}
                          className={`p-2 rounded-lg border text-sm font-bold flex items-center gap-1 transition ${
                            Number(formData[field.id]) >= star 
                              ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-sm' 
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        >
                          <Star className="h-4 w-4 fill-current" /> {star}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition mt-6">
              Submit Data Record to Cloud
            </button>
          </form>
        ) : (
          <p className="text-center text-slate-500 font-medium">No active forms available.</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-600" /> Submitted Field Data Logs ({project.submissions.length})
          </h3>
          {project.submissions.length > 0 && (
            <button onClick={onClearAllSubmissions} className="text-xs text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-300 font-bold">
              Clear All Submissions
            </button>
          )}
        </div>
        {project.submissions.length === 0 ? (
          <p className="text-slate-500 text-sm italic">No entries recorded yet for this project.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b">
                <tr>
                  <th className="py-3 px-4">Ref</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Field Responses</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {project.submissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-xs text-indigo-700 font-bold">{sub.id}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{sub.timestamp}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(sub.data).map(([k, v]) => (
                          <span key={k} className="bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-md border font-medium">
                            <strong>{k}:</strong> {v}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => onDeleteSubmission(sub.id)} className="text-red-600 hover:text-red-800 p-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// EXPORT SUITE COMPONENT
function ExportSuiteView({ onExportSubmissions, onExportLogframe, onExportBackup }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">GMEL Data Export Suite</h2>
        <p className="text-sm text-slate-500">Export field submissions, indicators, and backups.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between">
          <div>
            <div className="bg-emerald-50 p-3 rounded-xl w-fit mb-3 border border-emerald-200"><FileSpreadsheet className="h-6 w-6 text-emerald-600" /></div>
            <h3 className="font-bold text-slate-900">Raw Field Submissions</h3>
            <p className="text-xs text-slate-600 mt-1">Download CSV containing GPS, photos, and ratings.</p>
          </div>
          <button onClick={onExportSubmissions} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm shadow-md">Export CSV</button>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between">
          <div>
            <div className="bg-indigo-50 p-3 rounded-xl w-fit mb-3 border border-indigo-200"><TrendingUp className="h-6 w-6 text-indigo-600" /></div>
            <h3 className="font-bold text-slate-900">Logframe Report</h3>
            <p className="text-xs text-slate-600 mt-1">Export calculated indicator targets and progress.</p>
          </div>
          <button onClick={onExportLogframe} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm shadow-md">Export Logframe CSV</button>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between">
          <div>
            <div className="bg-amber-50 p-3 rounded-xl w-fit mb-3 border border-amber-200"><FileCode className="h-6 w-6 text-amber-600" /></div>
            <h3 className="font-bold text-slate-900">Full System Backup</h3>
            <p className="text-xs text-slate-600 mt-1">Download JSON backup of all projects and data.</p>
          </div>
          <button onClick={onExportBackup} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-sm shadow-md">Download JSON</button>
        </div>
      </div>
    </div>
  );
}

// MOBILE SYNC COMPONENT
function MobileSyncView({ project }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Mobile App Sync &amp; API Hub</h2>
        <p className="text-sm text-slate-500">Pair mobile devices for offline enumerations.</p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200"><Smartphone className="h-7 w-7 text-emerald-600" /></div>
          <div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">CLOUD SYNC ACTIVE (FIREBASE)</span>
            <h3 className="text-base font-bold text-slate-900 mt-1">Connected to Firebase Firestore</h3>
          </div>
        </div>
        <p className="text-sm text-slate-600">Your M&amp;E system is synced to Firebase. Any changes, indicators, or survey submissions made on mobile devices, Chrome, or Edge update instantly across all your devices.</p>
        <div className="p-3 bg-slate-50 rounded-xl border text-xs font-semibold text-slate-800">
          Current Project: <span className="font-mono text-indigo-700">{project.name} ({project.code})</span>
        </div>
      </div>
    </div>
  );
}

// PRINTABLE FORMS VIEW COMPONENT
function PrintableFormsView({ project, selectedFormId, setSelectedFormId }) {
  const activeForm = project.forms.find(f => f.id === selectedFormId) || project.forms[0];
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Printable Paper Form Layout</h2>
          <p className="text-sm text-slate-500">Generates clean paper-ready survey sheets.</p>
        </div>
        <div className="print-actions flex items-center gap-3">
          <select value={selectedFormId || activeForm?.id || ''} onChange={(e) => setSelectedFormId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm font-semibold bg-white">
            {project.forms.map(f => (<option key={f.id} value={f.id}>{f.title}</option>))}
          </select>
          <button onClick={() => window.print()} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow hover:bg-slate-800">
            <Printer className="h-4 w-4" /> Print Form
          </button>
        </div>
      </div>
      {activeForm ? (
        <div className="bg-white p-10 rounded-2xl border border-slate-300 shadow-md max-w-3xl mx-auto print:border-none print:shadow-none print:p-0">
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase">{project.name}</h1>
              <p className="text-sm font-semibold text-slate-600">Official Field Monitoring Survey Paper Form</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p><strong>Code:</strong> {project.code}</p>
              <p><strong>Ref:</strong> {activeForm.id}</p>
            </div>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-1">{activeForm.title}</h2>
            {activeForm.description && <p className="text-xs text-slate-500 mt-1 italic">{activeForm.description}</p>}
          </div>
          <div className="space-y-6">
            {activeForm.fields.map((field, idx) => (
              <div key={field.id} className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-slate-800">
                  <span>{idx + 1}. {field.label} {field.required && '*'}</span>
                  <span className="text-xs text-slate-500 font-normal">[{field.type.toUpperCase()}]</span>
                </div>
                <div className="h-10 border border-slate-400 rounded-md bg-white"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-slate-500">No form available to print.</p>
      )}
    </div>
  );
}
