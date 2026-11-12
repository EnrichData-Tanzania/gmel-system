import React, { useState, useEffect, useRef } from 'react';
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
  Mail,
  BookOpen,
  GraduationCap,
  CheckSquare,
  Shield,
  Wifi,
  WifiOff,
  Map as MapIcon,
  FileDown
} from 'lucide-react';

// ==========================================
// FIREBASE CLOUD CONFIGURATION
// ==========================================
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID"
};

let db = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase init note:", e);
}

const createId = (prefix) => `${prefix}-${globalThis.crypto.randomUUID()}`;

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
      { 
        id: 'ind-1', 
        level: 'Outcome', 
        title: '% Water points functional during dry seasons', 
        baseline: { general: 0, male: 0, female: 0, total: 0 }, 
        target: { general: 77, male: 0, female: 0, total: 77 }, 
        unit: '%', 
        mappedFieldId: null, 
        calcType: 'PERCENTAGE' 
      },
      { 
        id: 'ind-2', 
        level: 'Output', 
        title: '# of new or rehabilitated water points', 
        baseline: { general: 0, male: 0, female: 0, total: 0 }, 
        target: { general: 100, male: 0, female: 0, total: 100 }, 
        unit: 'number', 
        mappedFieldId: null, 
        calcType: 'SUM' 
      }
    ],
    forms: [
      {
        id: 'form-1',
        title: 'Water Point Assessment Form',
        description: 'Record water point functionality and location.',
        fields: [
          { id: 'field-name', label: 'Water Point Name', type: 'text', required: true, skipLogic: null },
          { id: 'field-status', label: 'Functional Status', type: 'select', options: ['Functional', 'Broken Down'], required: true, skipLogic: null },
          { id: 'field-gps', label: 'GPS Location', type: 'location', required: true, skipLogic: null }
        ]
      }
    ],
    submissions: []
  }
];

export default function App() {
  const [projects, setProjects] = useState(initialProjects);
  const [license, setLicense] = useState({
    code: 'DEMO-5DAYS',
    level: 'Level 1: 5-Day Demo',
    demoClaimed: true,
    activatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  });
  
  const [userRole, setUserRole] = useState('Administrator'); // 'Administrator', 'M&E Officer', 'Enumerator'
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoadedFromCloud, setIsLoadedFromCloud] = useState(false);

  const [activeProjectId, setActiveProjectId] = useState('proj-1');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    async function fetchCloudData() {
      try {
        if (!db || !navigator.onLine) {
          const localCache = localStorage.getItem('gmel_offline_cache');
          if (localCache) {
            const parsed = JSON.parse(localCache);
            if (parsed.projects) setProjects(parsed.projects);
            if (parsed.license) setLicense(parsed.license);
          }
          setIsLoadedFromCloud(true);
          return;
        }
        const docRef = doc(db, 'gmel_systems', 'main_workspace');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.projects) setProjects(data.projects);
          if (data.license && data.license.code) setLicense(data.license);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setIsLoadedFromCloud(true);
      }
    }
    fetchCloudData();
  }, []);

  useEffect(() => {
    if (!isLoadedFromCloud) return;
    localStorage.setItem('gmel_offline_cache', JSON.stringify({ projects, license }));
    if (!db || !isOnline) return;

    async function saveCloudData() {
      try {
        const docRef = doc(db, 'gmel_systems', 'main_workspace');
        await setDoc(docRef, { projects, license, updated_at: new Date() });
      } catch (err) {
        console.error('Error saving to Firebase:', err);
      }
    }
    saveCloudData();
  }, [projects, license, isLoadedFromCloud, isOnline]);

  useEffect(() => {
    const handleInstallAvailable = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener('beforeinstallprompt', handleInstallAvailable);
    return () => window.removeEventListener('beforeinstallprompt', handleInstallAvailable);
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };
  
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [selectedPrintFormId, setSelectedPrintFormId] = useState('');
  
  const [newProj, setNewProj] = useState({ name: '', code: '', donor: '', budget: '', location: '' });
  const [editProj, setEditProj] = useState({ name: '', code: '', donor: '', budget: '', location: '' });

  const currentProject = projects.find(p => p.id === activeProjectId) || projects[0] || { id: '', name: 'No Projects', code: '', indicators: [], forms: [], submissions: [] };

  const isExpired = license.expiresAt && new Date() > new Date(license.expiresAt);

  if (!isLoadedFromCloud) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans text-white text-base">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-base text-slate-300">Loading GMEL System Workspace...</p>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-white text-base">
        <div className="max-w-xl w-full">
          <div className="text-center mb-6">
            <div className="bg-red-600 p-4 rounded-2xl w-fit mx-auto shadow-lg mb-3">
              <AlertTriangle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">DEMO PERIOD HAS EXPIRED</h1>
            <p className="text-base text-slate-300 mt-2">Your 5-day evaluation trial has ended. Please enter an activation code to continue.</p>
          </div>
          <LicenseActivationView license={license} setLicense={setLicense} isGateway={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen bg-white text-slate-900 flex flex-col font-sans text-base border-t-4 border-indigo-600">
      <header className="app-header bg-slate-900 text-white shadow-lg sticky top-0 z-50 print:hidden">
        <div className="header-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
          <div className="brand flex items-center space-x-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-inner">
              <Layers className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                GMEL <span className="text-xs bg-indigo-500/30 text-indigo-300 font-mono px-2.5 py-1 rounded border border-indigo-400/30">SYSTEM</span>
              </h1>
            </div>
          </div>

          <div className="project-toolbar flex items-center space-x-3 sm:space-x-4">
            <div className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${isOnline ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-amber-950 text-amber-300 border-amber-800'}`}>
              {isOnline ? <Wifi className="h-4 w-4 text-emerald-400" /> : <WifiOff className="h-4 w-4 text-amber-400" />}
              <span>{isOnline ? 'Online (Synced)' : 'Offline (Cached)'}</span>
            </div>

            <div className="flex items-center space-x-1 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300">
              <Shield className="h-4 w-4 text-indigo-400" />
              <select 
                value={userRole} 
                onChange={(e) => setUserRole(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
              >
                <option value="Administrator" className="bg-slate-800">Role: Admin</option>
                <option value="M&E Officer" className="bg-slate-800">Role: M&amp;E Officer</option>
                <option value="Enumerator" className="bg-slate-800">Role: Enumerator</option>
              </select>
            </div>

            <div className="project-picker flex items-center space-x-2 bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 shadow-sm">
              <Building2 className="h-5 w-5 text-indigo-400" />
              <label htmlFor="project-select" className="text-sm text-slate-300 font-semibold">Project:</label>
              <select 
                id="project-select"
                value={activeProjectId} 
                onChange={(e) => setActiveProjectId(e.target.value)}
                className="bg-transparent text-base font-bold text-white focus:outline-none cursor-pointer max-w-[140px] sm:max-w-[200px] truncate"
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
                className="install-app-button bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 transition"
              >
                <Download className="h-5 w-5" />
                <span>Install</span>
              </button>
            )}

            {userRole === 'Administrator' && (
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
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 p-2.5 rounded-xl font-bold text-sm flex items-center gap-1 transition"
              >
                <Edit2 className="h-5 w-5 text-amber-400" />
              </button>
            )}

            <button 
              onClick={() => setActiveTab('mobile')}
              className={`p-2.5 rounded-xl border text-sm font-bold flex items-center gap-1.5 transition ${activeTab === 'mobile' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}
            >
              <Smartphone className="h-5 w-5" />
              <span className="hidden md:inline">Sync</span>
            </button>

            <button 
              onClick={() => setActiveTab('guidelines')}
              className={`p-2.5 rounded-xl border text-sm font-bold flex items-center gap-1.5 transition ${activeTab === 'guidelines' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}
            >
              <BookOpen className="h-5 w-5" />
              <span className="hidden md:inline">Guide</span>
            </button>

            <button 
              onClick={() => setActiveTab('license')}
              className={`p-2.5 rounded-xl border text-sm font-bold flex items-center gap-1.5 transition ${activeTab === 'license' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}
            >
              <KeyRound className="h-5 w-5" />
              <span className="hidden md:inline">License</span>
            </button>

            {userRole === 'Administrator' && (
              <button 
                onClick={() => setShowAddProjectModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-extrabold text-sm flex items-center gap-2 transition shadow-md"
              >
                <PlusCircle className="h-5 w-5" />
                New Project
              </button>
            )}
          </div>
        </div>

        <div className="desktop-nav app-nav bg-slate-800 border-t border-slate-700 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-2 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard & Visuals', icon: BarChart3 },
              { id: 'logframe', label: 'Logframe Matrix', icon: TrendingUp },
              { id: 'map', label: 'GIS Map View', icon: MapIcon },
              { id: 'reports', label: 'Custom Reports', icon: FileText },
              ...(userRole !== 'Enumerator' ? [{ id: 'builder', label: 'Form Builder', icon: FileText }] : []),
              { id: 'entry', label: 'Data Submission', icon: ListCheck },
              { id: 'export', label: 'Export Suite', icon: Download },
              { id: 'print', label: 'Print Forms', icon: Printer }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-5 py-3.5 text-base font-bold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'border-indigo-500 text-indigo-300 bg-slate-900/90 shadow-sm' 
                      : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="app-main flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 bg-white text-base">
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
        {activeTab === 'logframe' && <LogframeView project={currentProject} getCalculatedActual={getCalculatedActual} setProjects={setProjects} userRole={userRole} />}
        {activeTab === 'map' && <GISMapView project={currentProject} />}
        {activeTab === 'reports' && <CustomReportsView project={currentProject} getCalculatedActual={getCalculatedActual} />}
        {activeTab === 'builder' && userRole !== 'Enumerator' && (
          <FormBuilderView 
            project={currentProject} 
            setProjects={setProjects} 
            onUpdateForm={(formId, updatedForm) => {
              setProjects(prev => prev.map(p => p.id !== currentProject.id ? p : {
                ...p,
                forms: p.forms.map(f => f.id === formId ? updatedForm : f)
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
              alert('Data record submitted and cached/synced successfully!');
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
            project={currentProject}
            getCalculatedActual={getCalculatedActual}
            onExportSubmissions={() => exportCSV(currentProject.submissions, `${currentProject.code}_submissions.csv`)}
            onExportLogframe={() => exportCSV(currentProject.indicators, `${currentProject.code}_logframe.csv`)}
            onExportBackup={() => {
              const blob = new Blob([JSON.stringify({ projects, license }, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = 'gmel_system_backup.json'; a.click();
            }} 
          />
        )}
        {activeTab === 'mobile' && <MobileSyncView project={currentProject} isOnline={isOnline} />}
        {activeTab === 'print' && <PrintableFormsView project={currentProject} selectedFormId={selectedPrintFormId} setSelectedFormId={setSelectedPrintFormId} />}
        {activeTab === 'guidelines' && <UserGuidelinesView />}
        {activeTab === 'license' && <LicenseActivationView license={license} setLicense={setLicense} />}
      </main>

      <nav className="mobile-nav print:hidden" aria-label="Main navigation">
        {[
          { id: 'dashboard', label: 'Home', icon: BarChart3 },
          { id: 'logframe', label: 'Indicators', icon: TrendingUp },
          { id: 'map', label: 'Map', icon: MapIcon },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'more', label: 'More', icon: MoreHorizontal }
        ].map(item => {
          const Icon = item.icon;
          const selected = item.id === 'more'
            ? showMobileMenu || ['builder', 'entry', 'export', 'mobile', 'guidelines', 'license'].includes(activeTab)
            : activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
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
            ...(userRole !== 'Enumerator' ? [{ id: 'builder', label: 'Form builder', icon: FileText }] : []),
            { id: 'export', label: 'Export data', icon: Download },
            { id: 'mobile', label: 'Mobile sync', icon: Smartphone },
            { id: 'guidelines', label: 'User Guidelines', icon: BookOpen },
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

      {showAddProjectModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="h-6 w-6 text-indigo-600" /> Create New M&amp;E Project
              </h3>
              <button onClick={() => setShowAddProjectModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
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
            }} className="space-y-4 text-base">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Project Name *</label>
                <input type="text" required placeholder="e.g. Sustainable Water Support" value={newProj.name} onChange={(e) => setNewProj({...newProj, name: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 text-base" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Project Code *</label>
                  <input type="text" required placeholder="e.g. SWS-2026" value={newProj.code} onChange={(e) => setNewProj({...newProj, code: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 text-base font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Total Budget</label>
                  <input type="text" placeholder="e.g. $300,000" value={newProj.budget} onChange={(e) => setNewProj({...newProj, budget: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 text-base" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Donor / Partner</label>
                <input type="text" placeholder="e.g. USAID" value={newProj.donor} onChange={(e) => setNewProj({...newProj, donor: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 text-base" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Location / Target Region</label>
                <input type="text" placeholder="e.g. Arusha Region" value={newProj.location} onChange={(e) => setNewProj({...newProj, location: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 text-base" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setShowAddProjectModal(false)} className="px-5 py-2.5 text-base font-bold text-slate-600 border border-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-base bg-indigo-600 text-white font-extrabold rounded-xl hover:bg-indigo-700">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditProjectModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Edit2 className="h-6 w-6 text-indigo-600" /> Edit Project Details
              </h3>
              <button onClick={() => setShowEditProjectModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              setProjects(prev => prev.map(p => p.id === currentProject.id ? { ...p, ...editProj } : p));
              setShowEditProjectModal(false);
            }} className="space-y-4 text-base">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Project Name</label>
                <input type="text" required value={editProj.name} onChange={(e) => setEditProj({...editProj, name: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 text-base font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Project Code</label>
                  <input type="text" required value={editProj.code} onChange={(e) => setEditProj({...editProj, code: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 text-base font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Total Budget</label>
                  <input type="text" value={editProj.budget} onChange={(e) => setEditProj({...editProj, budget: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 text-base" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Donor / Partner</label>
                <input type="text" value={editProj.donor} onChange={(e) => setEditProj({...editProj, donor: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 text-base" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Location</label>
                <input type="text" value={editProj.location} onChange={(e) => setEditProj({...editProj, location: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 text-base" />
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
                  className="px-4 py-2.5 text-sm font-extrabold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 flex items-center gap-1.5"
                >
                  <Trash2 className="h-4 w-4" /> Delete Project
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowEditProjectModal(false)} className="px-4 py-2.5 text-base font-bold text-slate-600 border border-slate-300 rounded-xl">Cancel</button>
                  <button type="submit" className="px-4 py-2.5 text-base bg-indigo-600 text-white font-extrabold rounded-xl hover:bg-indigo-700">Save Changes</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getCalculatedActual(project, ind) {
  const defaultVal = { general: 0, male: 0, female: 0, total: 0 };
  if (!ind.mappedFieldId) return ind.baseline || defaultVal;

  const values = project.submissions.map(sub => {
    const val = sub.data[ind.mappedFieldId];
    if (Array.isArray(val)) return val.length;
    return Number(val);
  }).filter(v => !isNaN(v));

  if (values.length === 0) return ind.baseline || defaultVal;

  let computedVal = 0;
  if (ind.calcType === 'AVG') computedVal = Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1));
  else if (ind.calcType === 'COUNT') computedVal = values.length;
  else if (ind.calcType === 'MAX') computedVal = Math.max(...values);
  else if (ind.calcType === 'PERCENTAGE') computedVal = Number(((values.filter(v => v > 0).length / values.length) * 100).toFixed(0));
  else computedVal = values.reduce((a, b) => a + b, 0);

  return {
    general: computedVal,
    male: 0,
    female: 0,
    total: computedVal
  };
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

function GISMapView({ project }) {
  const mapRef = useRef(null);

  useEffect(() => {
    const gpsPoints = [];
    project.submissions.forEach(sub => {
      Object.entries(sub.data).forEach(([key, val]) => {
        if (typeof val === 'string' && val.includes(',') && val.split(',').length === 2) {
          const [lat, lng] = val.split(',').map(n => parseFloat(n.trim()));
          if (!isNaN(lat) && !isNaN(lng)) {
            gpsPoints.push({ lat, lng, subId: sub.id, timestamp: sub.timestamp });
          }
        }
      });
    });

    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => initMap(gpsPoints);
      document.body.appendChild(script);

      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
    } else {
      initMap(gpsPoints);
    }

    function initMap(points) {
      if (!mapRef.current) return;
      if (mapRef.current._leaflet_id) {
        mapRef.current._leaflet_id = null;
        mapRef.current.innerHTML = '';
      }

      const defaultLat = points.length > 0 ? points[0].lat : -3.3869;
      const defaultLng = points.length > 0 ? points[0].lng : 36.6829;

      const map = window.L.map(mapRef.current).setView([defaultLat, defaultLng], 10);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      points.forEach(pt => {
        window.L.marker([pt.lat, pt.lng])
          .addTo(map)
          .bindPopup(`<b>Submission:</b> ${pt.subId}<br/><b>Time:</b> ${pt.timestamp}<br/><b>GPS:</b> ${pt.lat}, ${pt.lng}`);
      });
    }
  }, [project]);

  return (
    <div className="space-y-6 text-base">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <MapIcon className="h-7 w-7 text-indigo-600" /> Geospatial GIS Map Intelligence
        </h2>
        <p className="text-base text-slate-600 mt-1">Interactive map plotting all GPS coordinates captured across survey submissions for {project.name}.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div ref={mapRef} className="w-full h-[550px] rounded-xl border border-slate-300 z-10"></div>
      </div>
    </div>
  );
}

function UserGuidelinesView() {
  const downloadPDFGuidelines = () => {
    const guidelineText = `GABRIEL MONITORING, EVALUATION AND LEARNING (GMEL) SYSTEM: END-USER GUIDELINE\n\nFounder & M&E Specialist: Gabriel Godiel Mashambo\nQualifications: Bachelor's in Statistics and Mathematics, Master's in Monitoring and Evaluation\nExperience: Over 10 years in M&E, project initiation, planning, implementation, capacity building, DQAs, analysis, learning, and reporting in Tanzania.`;
    const blob = new Blob([guidelineText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Gabriel_MEL_System_Guidelines.txt';
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-base">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <BookOpen className="h-7 w-7 text-indigo-600" /> System User Guidelines &amp; Documentation
          </h2>
          <p className="text-base text-slate-600 mt-1">Official manual for the Gabriel Monitoring, Evaluation and Learning System.</p>
        </div>
        <div className="flex gap-2.5">
          <button onClick={() => window.print()} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow hover:bg-slate-800">
            <Printer className="h-5 w-5" /> Print Guide
          </button>
          <button onClick={downloadPDFGuidelines} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow hover:bg-indigo-700">
            <Download className="h-5 w-5" /> Download Guide
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6 text-slate-800 text-base leading-relaxed">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-black text-slate-900">Gabriel Monitoring, Evaluation and Learning (GMEL) System Manual</h1>
          <p className="text-indigo-600 text-sm font-bold mt-1">Founder &amp; Lead Architect: Gabriel Godiel Mashambo · EnrichData Tanzania</p>
        </div>

        <div className="bg-indigo-50/80 p-6 rounded-2xl border border-indigo-200 space-y-3">
          <h3 className="text-base font-black text-indigo-900 uppercase flex items-center gap-2.5">
            <GraduationCap className="h-6 w-6 text-indigo-600" /> About the Founder &amp; System Background
          </h3>
          <p className="text-base text-slate-700">
            In this architecture, the letter <strong>G</strong> stands for <strong>Gabriel</strong> (Gabriel Godiel Mashambo), founder and owner. Designated as the [GMEL System](url?id=5), the platform incorporates over 10 years of professional expertise in development programming and M&amp;E consultancy across Tanzania.
          </p>
        </div>
      </div>
    </div>
  );
}

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
    <div className="space-y-6 text-base">
      <div className="dashboard-heading flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="text-sm font-extrabold text-indigo-600 uppercase tracking-wide">GABRIEL MONITORING, EVALUATION &amp; LEARNING WORKSPACE</div>
          <h2 className="text-2xl font-black text-slate-900 mt-1">{project.name}</h2>
          <p className="text-base text-slate-600 mt-1 flex items-center gap-1.5"><MapPin className="h-5 w-5" /> {project.location} · Reporting period: 2026</p>
        </div>
        <button onClick={onOpenEditProject} className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition">
          <Edit2 className="h-5 w-5" /> Edit project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-extrabold text-slate-500 uppercase">Project Code</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono mt-1">{project.code}</h3>
          </div>
          <Building2 className="h-10 w-10 text-indigo-600 bg-indigo-50 p-2.5 rounded-xl border border-indigo-100" />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-extrabold text-slate-500 uppercase">Donor Funding</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{project.budget}</h3>
            <p className="text-sm text-slate-600 truncate max-w-[150px] font-bold">{project.donor}</p>
          </div>
          <DollarSign className="h-10 w-10 text-emerald-600 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100" />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-extrabold text-slate-500 uppercase">Active Indicators</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{project.indicators.length}</h3>
          </div>
          <TrendingUp className="h-10 w-10 text-blue-600 bg-blue-50 p-2.5 rounded-xl border border-blue-100" />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-extrabold text-slate-500 uppercase">Total Submissions</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{project.submissions.length}</h3>
          </div>
          <Database className="h-10 w-10 text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-100" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-indigo-600" /> Indicator Target vs. Calculated Progress
            </h3>
          </div>
          <div className="space-y-5 pt-2">
            {project.indicators.map(ind => {
              const actualObj = getCalculatedActual(project, ind);
              const actualVal = actualObj.total || actualObj.general || 0;
              const targetVal = (ind.target && typeof ind.target === 'object') ? (ind.target.total || ind.target.general || 1) : 1;
              const baseVal = (ind.baseline && typeof ind.baseline === 'object') ? (ind.baseline.total || ind.baseline.general || 0) : 0;
              const pct = Math.min(100, Math.max(0, Math.round(((actualVal - baseVal) / (targetVal - baseVal || 1)) * 100)));

              return (
                <div key={ind.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex justify-between items-start text-sm font-bold">
                    <span className="text-slate-900 text-base font-bold">{ind.title}</span>
                    <span className="bg-indigo-100 text-indigo-900 font-mono px-3 py-1 rounded-lg border border-indigo-200 text-sm">
                      {actualVal} / {targetVal} {ind.unit} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden flex border border-slate-300">
                    <div className="bg-indigo-600 h-4 rounded-full transition-all duration-500" style={{ width: `${Math.max(0, pct)}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <PieChart className="h-6 w-6 text-indigo-600" /> Indicator Level Breakdown
            </h3>
            <div className="py-6 flex justify-center">
              <div className="w-36 h-36 rounded-full relative flex items-center justify-center shadow-inner" style={{ background: `conic-gradient(${chartSegments || '#e5e7eb 0% 100%'})` }}>
                <div className="absolute w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center shadow">
                  <strong className="text-xl font-black text-slate-900">{totalIndicators}</strong>
                  <span className="text-xs uppercase font-extrabold text-slate-500">indicators</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogframeView({ project, getCalculatedActual, setProjects, userRole }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIndicatorId, setEditingIndicatorId] = useState(null);
  
  const [newInd, setNewInd] = useState({ 
    level: 'Output', 
    title: '', 
    baseline: { general: 0, male: 0, female: 0, total: 0 },
    target: { general: 100, male: 0, female: 0, total: 100 },
    unit: 'Units' 
  });

  const handleAddIndicator = () => {
    if (!newInd.title.trim()) return;
    const baseTotal = (Number(newInd.baseline.general) || 0) + (Number(newInd.baseline.male) || 0) + (Number(newInd.baseline.female) || 0);
    const targetTotal = (Number(newInd.target.general) || 0) + (Number(newInd.target.male) || 0) + (Number(newInd.target.female) || 0);

    const indicatorObj = { 
      ...newInd, 
      baseline: { ...newInd.baseline, total: baseTotal || newInd.baseline.general },
      target: { ...newInd.target, total: targetTotal || newInd.target.general },
      id: createId('ind'), 
      mappedFieldId: null, 
      calcType: 'SUM' 
    };

    setProjects(prev => prev.map(p => p.id !== project.id ? p : { ...p, indicators: [...p.indicators, indicatorObj] }));
    setShowAddModal(false);
    setNewInd({ level: 'Output', title: '', baseline: { general: 0, male: 0, female: 0, total: 0 }, target: { general: 100, male: 0, female: 0, total: 100 }, unit: 'Units' });
  };

  const openIndicatorEditor = (ind) => {
    setNewInd({
      level: ind.level,
      title: ind.title,
      baseline: typeof ind.baseline === 'object' ? ind.baseline : { general: ind.baseline || 0, male: 0, female: 0, total: ind.baseline || 0 },
      target: typeof ind.target === 'object' ? ind.target : { general: ind.target || 100, male: 0, female: 0, total: ind.target || 100 },
      unit: ind.unit
    });
    setEditingIndicatorId(ind.id);
    setShowAddModal(true);
  };

  const handleSaveIndicator = () => {
    if (!newInd.title.trim()) return;
    const baseTotal = (Number(newInd.baseline.general) || 0) + (Number(newInd.baseline.male) || 0) + (Number(newInd.baseline.female) || 0);
    const targetTotal = (Number(newInd.target.general) || 0) + (Number(newInd.target.male) || 0) + (Number(newInd.target.female) || 0);

    const updatedData = {
      ...newInd,
      baseline: { ...newInd.baseline, total: baseTotal || newInd.baseline.general },
      target: { ...newInd.target, total: targetTotal || newInd.target.general }
    };

    if (!editingIndicatorId) {
      handleAddIndicator();
      return;
    }

    setProjects(prev => prev.map(p => p.id !== project.id ? p : {
      ...p,
      indicators: p.indicators.map(ind => ind.id === editingIndicatorId ? { ...ind, ...updatedData, title: updatedData.title.trim() } : ind)
    }));
    setEditingIndicatorId(null);
    setShowAddModal(false);
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
    <div className="space-y-6 text-base">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Logical Framework (Logframe) Matrix</h2>
          <p className="text-base text-slate-600 mt-1">Manage indicators with disaggregated demographic metrics.</p>
        </div>
        {userRole !== 'Enumerator' && (
          <button onClick={() => { setEditingIndicatorId(null); setShowAddModal(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-extrabold text-base flex items-center gap-2 shadow">
            <PlusCircle className="h-5 w-5" /> Add Indicator
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1050px]">
          <thead>
            <tr className="bg-slate-100 text-slate-800 text-xs uppercase font-extrabold border-b border-slate-200">
              <th className="p-4">Level</th>
              <th className="p-4">Indicator Statement</th>
              <th className="p-4 text-center">Baseline</th>
              <th className="p-4 text-center">Target</th>
              <th className="p-4 text-center">Actual</th>
              <th className="p-4">Automated Data Mapping</th>
              {userRole !== 'Enumerator' && <th className="p-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-base">
            {project.indicators.map((ind) => {
              const actual = getCalculatedActual(project, ind);
              const baseline = typeof ind.baseline === 'object' ? ind.baseline : { general: ind.baseline || 0, male: 0, female: 0, total: ind.baseline || 0 };
              const target = typeof ind.target === 'object' ? ind.target : { general: ind.target || 0, male: 0, female: 0, total: ind.target || 0 };

              const availableFields = project.forms.flatMap(f => f.fields.map(field => ({
                fieldId: field.id, label: `${f.title} → ${field.label}`
              })));

              return (
                <tr key={ind.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold align-top">
                    <span className="inline-block px-3 py-1 rounded-lg text-sm font-extrabold border bg-indigo-50 text-indigo-900 border-indigo-200">{ind.level}</span>
                  </td>
                  <td className="p-4 font-bold text-slate-900 align-top max-w-xs">{ind.title}</td>
                  
                  <td className="p-4 text-center font-mono text-sm text-slate-700 align-top">
                    <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 space-y-1">
                      <div>Gen: <strong className="text-slate-900">{baseline.general}</strong> {ind.unit}</div>
                    </div>
                  </td>

                  <td className="p-4 text-center font-mono text-sm text-slate-800 align-top">
                    <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 space-y-1">
                      <div>Gen: <strong className="text-indigo-900">{target.general}</strong> {ind.unit}</div>
                    </div>
                  </td>

                  <td className="p-4 text-center font-mono text-sm text-indigo-900 align-top">
                    <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-200 space-y-1 shadow-sm">
                      <div>Gen: <strong className="text-indigo-700">{actual.general}</strong> {ind.unit}</div>
                    </div>
                  </td>

                  <td className="p-4 align-top">
                    <div className="flex flex-col gap-2">
                      <select
                        value={ind.mappedFieldId || ''}
                        onChange={(e) => handleMapField(ind.id, e.target.value || null, ind.calcType || 'SUM')}
                        disabled={userRole === 'Enumerator'}
                        className="text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 shadow-sm"
                      >
                        <option value="">Manual Entry (No Form Linked)</option>
                        {availableFields.map(f => (<option key={f.fieldId} value={f.fieldId}>🔗 {f.label}</option>))}
                      </select>
                    </div>
                  </td>

                  {userRole !== 'Enumerator' && (
                    <td className="p-4 text-right align-top">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => openIndicatorEditor(ind)} className="rounded-xl p-2.5 text-slate-600 hover:bg-indigo-50 border border-slate-200"><Edit2 className="h-5 w-5" /></button>
                        <button onClick={() => handleDeleteIndicator(ind)} className="rounded-xl p-2.5 text-slate-600 hover:bg-red-50 border border-slate-200"><Trash2 className="h-5 w-5" /></button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-8 space-y-5 text-base my-8">
            <h3 className="text-xl font-black text-slate-900 border-b pb-3">{editingIndicatorId ? 'Edit Indicator' : 'Add Indicator'}</h3>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Statement</label>
              <input type="text" value={newInd.title} onChange={(e) => setNewInd({...newInd, title: e.target.value})} className="w-full border rounded-xl p-3 text-base font-bold" />
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-base border rounded-xl font-bold">Cancel</button>
              <button onClick={handleSaveIndicator} className="px-5 py-2.5 text-base bg-indigo-600 text-white font-extrabold rounded-xl shadow">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LicenseActivationView({ license, setLicense, isGateway = false }) {
  const [inputCode, setInputCode] = useState('');
  const activateCode = (codeToActivate) => {
    const code = codeToActivate.trim().toUpperCase();
    let newLicenseData = null;
    if (code === 'DEMO-5DAYS') {
      newLicenseData = { code, level: 'Level 1: 5-Day Demo', demoClaimed: true, expiresAt: new Date(Date.now() + 5*24*60*60*1000).toISOString() };
    } else if (code === 'ANNUAL-2026') {
      newLicenseData = { code, level: 'Level 2: One-Year Plan', demoClaimed: true, expiresAt: new Date(Date.now() + 365*24*60*60*1000).toISOString() };
    } else if (code === 'LIFETIME-GMEL') {
      newLicenseData = { code, level: 'Level 3: Lifetime License', demoClaimed: true, expiresAt: null };
    } else {
      alert('Invalid code.');
      return;
    }
    setLicense(newLicenseData);
    alert(`Activation successful! Tier: ${newLicenseData.level}`);
  };

  return (
    <div className={`mx-auto space-y-6 text-base ${isGateway ? 'max-w-xl text-slate-900' : 'max-w-3xl'}`}>
      <form onSubmit={(e) => { e.preventDefault(); activateCode(inputCode); }} className="space-y-3 pt-2">
        <label className="block text-sm font-bold text-slate-800">Enter Activation Code:</label>
        <div className="flex gap-3">
          <input type="text" required placeholder="e.g. ANNUAL-2026" value={inputCode} onChange={(e) => setInputCode(e.target.value)} className="flex-1 border rounded-xl p-3 text-base font-mono bg-white uppercase font-bold" />
          <button type="submit" className="bg-indigo-600 text-white font-extrabold px-6 py-3 rounded-xl text-base shadow">Activate</button>
        </div>
      </form>
    </div>
  );
}

function CustomReportsView({ project, getCalculatedActual }) {
  return (
    <div className="space-y-6 text-base">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Custom Reports &amp; Scorecard</h2>
        </div>
        <button onClick={() => window.print()} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow hover:bg-indigo-700">
          <FileDown className="h-5 w-5" /> Export / Print PDF Report
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <h1 className="text-3xl font-black text-slate-900">{project.name}</h1>
      </div>
    </div>
  );
}

// ==========================================
// FORM BUILDER WITH SKIP LOGIC INTEGRATION
// ==========================================
function FormBuilderView({ project, setProjects, onUpdateForm, onDeleteForm }) {
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [fields, setFields] = useState([{ id: 'field-1', label: 'Beneficiary Full Name', type: 'text', required: true, options: [], skipLogic: null }]);

  const [editingFormId, setEditingFormId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editFields, setEditFields] = useState([]);

  const addField = (type) => {
    setFields([...fields, {
      id: createId('field'),
      label: `New ${type.toUpperCase()} Question`,
      type,
      required: false,
      options: type === 'select' || type === 'multiselect' ? ['Option 1', 'Option 2'] : [],
      skipLogic: null
    }]);
  };

  const addEditField = (type) => {
    setEditFields([...editFields, {
      id: createId('field'),
      label: `New ${type.toUpperCase()} Question`,
      type,
      required: false,
      options: type === 'select' || type === 'multiselect' ? ['Option 1', 'Option 2'] : [],
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
    alert('Custom form published successfully with Skip Logic rules!');
  };

  const handleUpdateSavedForm = (formId) => {
    if (!editTitle.trim()) {
      alert('Form title cannot be empty.');
      return;
    }
    const updatedForm = {
      id: formId,
      title: editTitle,
      description: editDesc,
      fields: editFields
    };
    onUpdateForm(formId, updatedForm);
    setEditingFormId(null);
    alert('Form updated successfully!');
  };

  return (
    <div className="space-y-6 text-base">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-black text-slate-900">Advanced Form Generator</h2>
        <p className="text-base text-slate-600 mt-1">Design surveys with multi-select, mandatory toggles, and Skip Logic for {project.name}.</p>
      </div>

      {project.forms.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-lg font-extrabold text-slate-900 border-b pb-3">Active Project Forms ({project.forms.length})</h3>
          <div className="grid grid-cols-1 gap-5">
            {project.forms.map(form => (
              <div key={form.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                {editingFormId === form.id ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="font-extrabold text-indigo-700 text-lg">Editing Form</h4>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingFormId(null)} className="px-4 py-2 text-sm border rounded-xl bg-white font-bold">Cancel</button>
                        <button onClick={() => handleUpdateSavedForm(form.id)} className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-xl font-extrabold">Save Form</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Form Title</label>
                      <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full border rounded-xl p-3 text-base font-bold bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                      <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="w-full border rounded-xl p-3 text-sm bg-white h-20" />
                    </div>

                    <div className="space-y-3 pt-2">
                      <h5 className="font-extrabold text-slate-800 text-sm">Form Questions ({editFields.length})</h5>
                      {editFields.map((field, fIdx) => (
                        <div key={field.id} className="p-4 bg-white rounded-xl border space-y-3">
                          <div className="flex items-center gap-3">
                            <input 
                              type="text" 
                              value={field.label} 
                              onChange={(e) => {
                                const updated = [...editFields];
                                updated[fIdx].label = e.target.value;
                                setEditFields(updated);
                              }}
                              className="flex-1 border rounded-lg px-3 py-2 text-sm font-bold"
                            />
                            <span className="text-xs bg-indigo-50 text-indigo-800 font-extrabold px-2.5 py-1 rounded uppercase">{field.type}</span>
                            <label className="flex items-center gap-1 text-xs font-bold text-slate-700">
                              <input 
                                type="checkbox" 
                                checked={field.required}
                                onChange={(e) => {
                                  const updated = [...editFields];
                                  updated[fIdx].required = e.target.checked;
                                  setEditFields(updated);
                                }}
                              /> Required
                            </label>
                            <button onClick={() => setEditFields(editFields.filter(f => f.id !== field.id))} className="text-red-600 text-xs font-bold p-1.5 bg-red-50 rounded border border-red-200">Remove</button>
                          </div>

                          {(field.type === 'select' || field.type === 'multiselect') && (
                            <div className="text-sm space-y-1">
                              <label className="font-bold text-xs text-slate-600">Options (comma-separated):</label>
                              <input 
                                type="text" 
                                value={field.options.join(', ')} 
                                onChange={(e) => {
                                  const updated = [...editFields];
                                  updated[fIdx].options = e.target.value.split(',').map(s => s.trim());
                                  setEditFields(updated);
                                }}
                                className="w-full border rounded-lg p-2 text-xs bg-white"
                              />
                            </div>
                          )}

                          <div className="pt-2 border-t text-xs space-y-1">
                            <label className="font-extrabold text-slate-700 flex items-center gap-1">
                              <GitBranch className="h-3.5 w-3.5 text-indigo-600" /> Skip Logic:
                            </label>
                            <div className="flex gap-2">
                              <select 
                                value={field.skipLogic?.fieldId || ''}
                                onChange={(e) => {
                                  const parentId = e.target.value;
                                  const updated = [...editFields];
                                  if (!parentId) {
                                    updated[fIdx].skipLogic = null;
                                  } else {
                                    updated[fIdx].skipLogic = { fieldId: parentId, value: updated[fIdx].skipLogic?.value || '' };
                                  }
                                  setEditFields(updated);
                                }}
                                className="border rounded px-2 py-1 bg-white flex-1"
                              >
                                <option value="">-- No Skip Logic (Always Show) --</option>
                                {editFields.slice(0, fIdx).map(prev => (
                                  <option key={prev.id} value={prev.id}>Depends on: {prev.label}</option>
                                ))}
                              </select>
                              {field.skipLogic && (
                                <input 
                                  type="text" 
                                  placeholder="Trigger value..."
                                  value={field.skipLogic.value}
                                  onChange={(e) => {
                                    const updated = [...editFields];
                                    updated[fIdx].skipLogic.value = e.target.value;
                                    setEditFields(updated);
                                  }}
                                  className="border rounded px-2 py-1 w-40"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="flex flex-wrap gap-2 pt-2">
                        <button onClick={() => addEditField('text')} className="px-3 py-1.5 text-xs font-bold bg-slate-100 rounded border">+ Short Text</button>
                        <button onClick={() => addEditField('select')} className="px-3 py-1.5 text-xs font-bold bg-slate-100 rounded border">+ Dropdown</button>
                        <button onClick={() => addEditField('multiselect')} className="px-3 py-1.5 text-xs font-bold bg-slate-100 rounded border">+ Multi-Select</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-slate-900 text-lg">{form.title}</h4>
                        {form.description && <p className="text-sm text-slate-600 mt-1">{form.description}</p>}
                      </div>
                      <span className="text-xs bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full font-mono font-bold">{form.fields.length} Fields</span>
                    </div>

                    <div className="flex justify-end items-center gap-2 pt-3 border-t">
                      <button 
                        onClick={() => {
                          setEditingFormId(form.id);
                          setEditTitle(form.title);
                          setEditDesc(form.description || '');
                          setEditFields(JSON.parse(JSON.stringify(form.fields)));
                        }} 
                        className="text-sm font-bold text-indigo-700 hover:bg-indigo-50 flex items-center gap-1.5 bg-white px-4 py-2 rounded-xl border shadow-sm transition"
                      >
                        <Edit2 className="h-4 w-4" /> Edit Form &amp; Skip Logic
                      </button>
                      <button onClick={() => onDeleteForm(form.id)} className="text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-1.5 bg-white px-4 py-2 rounded-xl border border-red-200 transition">
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE NEW FORM WITH INTEGRATED SKIP LOGIC */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b pb-3">Create New Custom Form</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Form Name</label>
              <input type="text" placeholder="e.g. Beneficiary Monitoring Survey" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full border rounded-xl p-3 text-base bg-white font-bold" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Instructions / Description</label>
              <textarea placeholder="Guidelines for enumerators..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="w-full border rounded-xl p-3 text-base h-24" />
            </div>
          </div>

          <hr className="border-slate-200" />

          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Form Questions ({fields.length})</h3>
            {fields.map((field, idx) => (
              <div key={field.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm font-extrabold text-slate-500 font-mono">Question {idx + 1}</span>
                  <input 
                    type="text" 
                    value={field.label} 
                    onChange={(e) => {
                      const updated = [...fields];
                      updated[idx].label = e.target.value;
                      setFields(updated);
                    }} 
                    className="flex-1 bg-white border rounded-xl px-4 py-2 text-base font-bold shadow-sm" 
                  />
                  <span className="text-xs bg-indigo-100 text-indigo-900 font-extrabold px-3 py-1 rounded-lg uppercase">{field.type}</span>
                  
                  <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 cursor-pointer bg-white px-3 py-1.5 rounded-xl border">
                    <input 
                      type="checkbox" 
                      checked={field.required}
                      onChange={(e) => {
                        const updated = [...fields];
                        updated[idx].required = e.target.checked;
                        setFields(updated);
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    Required
                  </label>

                  <button onClick={() => setFields(fields.filter(f => f.id !== field.id))} className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded-xl border border-red-200">Remove</button>
                </div>

                {(field.type === 'select' || field.type === 'multiselect') && (
                  <div className="pl-6 text-sm space-y-1.5">
                    <label className="font-bold text-slate-700">Options (comma separated):</label>
                    <input 
                      type="text" 
                      value={field.options.join(', ')} 
                      onChange={(e) => {
                        const updated = [...fields];
                        updated[idx].options = e.target.value.split(',').map(s => s.trim());
                        setFields(updated);
                      }}
                      className="w-full border rounded-xl p-2.5 bg-white text-sm"
                    />
                  </div>
                )}

                {/* Skip Logic Builder for New Form Questions */}
                <div className="pl-6 pt-2 border-t text-xs space-y-1">
                  <label className="font-extrabold text-slate-700 flex items-center gap-1">
                    <GitBranch className="h-3.5 w-3.5 text-indigo-600" /> Skip Logic (Conditional Display):
                  </label>
                  <div className="flex gap-2">
                    <select 
                      value={field.skipLogic?.fieldId || ''}
                      onChange={(e) => {
                        const parentId = e.target.value;
                        const updated = [...fields];
                        if (!parentId) {
                          updated[idx].skipLogic = null;
                        } else {
                          updated[idx].skipLogic = { fieldId: parentId, value: updated[idx].skipLogic?.value || '' };
                        }
                        setFields(updated);
                      }}
                      className="border rounded px-2.5 py-1.5 bg-white flex-1 font-bold"
                    >
                      <option value="">-- Always Show (No Skip Logic) --</option>
                      {fields.slice(0, idx).filter(p => p.type === 'select' || p.type === 'multiselect').map(prev => (
                        <option key={prev.id} value={prev.id}>Depends on: {prev.label}</option>
                      ))}
                    </select>
                    {field.skipLogic && (
                      <input 
                        type="text" 
                        placeholder="Trigger value..."
                        value={field.skipLogic.value}
                        onChange={(e) => {
                          const updated = [...fields];
                          updated[idx].skipLogic.value = e.target.value;
                          setFields(updated);
                        }}
                        className="border rounded px-2.5 py-1.5 w-44 font-bold"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleSaveForm} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-2xl shadow-md transition text-base">
            Publish Form To Project
          </button>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md space-y-4 h-fit">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300">Add Question Type</h3>
          <div className="grid grid-cols-1 gap-2.5">
            {[
              { type: 'text', label: 'Short Text', icon: FileText },
              { type: 'number', label: 'Numeric Quantity', icon: DollarSign },
              { type: 'date', label: 'Date Picker', icon: FileText },
              { type: 'select', label: 'Dropdown Select', icon: GitBranch },
              { type: 'multiselect', label: 'Multi-Select Checkboxes', icon: CheckSquare },
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
                  className="flex items-center space-x-3 bg-slate-800 hover:bg-slate-700 p-3 rounded-xl border border-slate-700 text-sm font-bold transition text-left"
                >
                  <Icon className="h-5 w-5 text-indigo-400" />
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

function DataEntryView({ project, onSubmitForm, onDeleteSubmission, onClearAllSubmissions }) {
  const [selectedFormId, setSelectedFormId] = useState(project.forms[0]?.id || '');
  const [formData, setFormData] = useState({});

  const activeForm = project.forms.find(f => f.id === selectedFormId);

  const handleCaptureGPS = async (fieldId) => {
    try {
      const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 });
      const coords = `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`;
      setFormData(prev => ({ ...prev, [fieldId]: coords }));
      alert(`GPS captured: ${coords}`);
    } catch (error) {
      alert(`Unable to retrieve location.`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeForm) return;
    onSubmitForm(activeForm.id, formData);
    setFormData({});
  };

  return (
    <div className="space-y-8 text-base">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-black text-slate-900">Field Data Entry Submission</h2>
          <div className="mt-4">
            <select value={selectedFormId} onChange={(e) => { setSelectedFormId(e.target.value); setFormData({}); }} className="w-full border rounded-xl p-3 text-base font-bold bg-white">
              {project.forms.map(f => (<option key={f.id} value={f.id}>{f.title}</option>))}
            </select>
          </div>
        </div>

        {activeForm ? (
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <h3 className="font-extrabold text-slate-900 text-xl border-b pb-3">{activeForm.title}</h3>
            {activeForm.fields.map(field => {
              if (field.skipLogic) {
                const parentVal = formData[field.skipLogic.fieldId];
                if (Array.isArray(parentVal)) {
                  if (!parentVal.includes(field.skipLogic.value)) return null;
                } else if (parentVal !== field.skipLogic.value) {
                  return null;
                }
              }

              return (
                <div key={field.id} className="space-y-2">
                  <label className="block text-sm font-bold text-slate-800">{field.label} {field.required && '*'}</label>
                  {field.type === 'text' || field.type === 'number' || field.type === 'date' ? (
                    <input type={field.type} required={field.required} value={formData[field.id] || ''} onChange={(e) => setFormData({...formData, [field.id]: e.target.value})} className="w-full border rounded-xl p-3 font-bold" />
                  ) : field.type === 'select' ? (
                    <select required={field.required} value={formData[field.id] || ''} onChange={(e) => setFormData({...formData, [field.id]: e.target.value})} className="w-full border rounded-xl p-3 font-bold bg-white">
                      <option value="">-- Select --</option>
                      {(field.options || []).map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                    </select>
                  ) : field.type === 'multiselect' ? (
                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border">
                      {(field.options || []).map(opt => {
                        const currentArr = formData[field.id] || [];
                        return (
                          <label key={opt} className="flex items-center gap-2 text-sm font-bold text-slate-800 cursor-pointer">
                            <input type="checkbox" checked={currentArr.includes(opt)} onChange={(e) => {
                              let updated = [...currentArr];
                              if (e.target.checked) updated.push(opt);
                              else updated = updated.filter(o => o !== opt);
                              setFormData({...formData, [field.id]: updated});
                            }} className="w-4 h-4 text-indigo-600 rounded" />
                            {opt}
                          </label>
                        );
                      })}
                    </div>
                  ) : field.type === 'location' ? (
                    <div className="flex gap-3">
                      <input type="text" readOnly required={field.required} value={formData[field.id] || ''} placeholder="Lat, Lng" className="flex-1 border rounded-xl p-3 font-mono bg-slate-50" />
                      <button type="button" onClick={() => handleCaptureGPS(field.id)} className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-extrabold flex items-center gap-2"><MapPin className="h-5 w-5" /> GPS</button>
                    </div>
                  ) : field.type === 'note' ? (
                    <textarea required={field.required} value={formData[field.id] || ''} onChange={(e) => setFormData({...formData, [field.id]: e.target.value})} className="w-full border rounded-xl p-3 h-28" />
                  ) : field.type === 'rating' ? (
                    <div className="flex items-center gap-3">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} type="button" onClick={() => setFormData({...formData, [field.id]: String(star)})} className={`p-3 rounded-xl border font-bold flex items-center gap-1 ${Number(formData[field.id]) >= star ? 'bg-amber-400 text-slate-900 border-amber-500' : 'bg-slate-50 text-slate-500'}`}>
                          <Star className="h-5 w-5 fill-current" /> {star}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
            <button type="submit" className="w-full bg-indigo-600 text-white font-extrabold py-4 rounded-2xl shadow-md">Submit Data Record</button>
          </form>
        ) : null}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <h3 className="text-lg font-extrabold text-slate-900">Submitted Field Data Logs ({project.submissions.length})</h3>
        {project.submissions.map(sub => (
          <div key={sub.id} className="p-4 bg-slate-50 rounded-xl border flex justify-between items-center">
            <span className="font-mono text-sm text-indigo-700 font-bold">{sub.timestamp}</span>
            <button onClick={() => onDeleteSubmission(sub.id)} className="text-red-600 p-2 bg-red-50 rounded-xl border border-red-200"><Trash2 className="h-5 w-5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExportSuiteView({ project, getCalculatedActual, onExportSubmissions, onExportLogframe, onExportBackup }) {
  return (
    <div className="space-y-6 text-base">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-black text-slate-900">Export Suite &amp; Reporting Hub</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
          <h3 className="font-extrabold text-slate-900 text-lg">Submissions CSV</h3>
          <button onClick={onExportSubmissions} className="w-full bg-emerald-600 text-white font-extrabold py-3 rounded-xl mt-4">Export CSV</button>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
          <h3 className="font-extrabold text-slate-900 text-lg">Logframe CSV</h3>
          <button onClick={onExportLogframe} className="w-full bg-indigo-600 text-white font-extrabold py-3 rounded-xl mt-4">Export Logframe</button>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
          <h3 className="font-extrabold text-slate-900 text-lg">PDF Report</h3>
          <button onClick={() => window.print()} className="w-full bg-amber-600 text-white font-extrabold py-3 rounded-xl mt-4">Download PDF</button>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
          <h3 className="font-extrabold text-slate-900 text-lg">JSON Backup</h3>
          <button onClick={onExportBackup} className="w-full bg-slate-900 text-white font-extrabold py-3 rounded-xl mt-4">Download JSON</button>
        </div>
      </div>
    </div>
  );
}

function MobileSyncView({ project, isOnline }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6 text-base">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-black text-slate-900">Mobile App Sync &amp; Offline Hub</h2>
      </div>
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-5">
        <p className="text-base text-slate-700">{isOnline ? 'Online mode active. Syncing automatically with Firebase.' : 'Offline mode active. Data is cached locally.'}</p>
      </div>
    </div>
  );
}

function PrintableFormsView({ project, selectedFormId, setSelectedFormId }) {
  const activeForm = project.forms.find(f => f.id === selectedFormId) || project.forms[0];
  return (
    <div className="space-y-6 text-base">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center print:hidden">
        <h2 className="text-2xl font-black text-slate-900">Printable Paper Form Layout</h2>
        <button onClick={() => window.print()} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"><Printer className="h-5 w-5" /> Print</button>
      </div>
      {activeForm && (
        <div className="bg-white p-12 rounded-3xl border border-slate-300 shadow-md max-w-3xl mx-auto print:border-none print:p-0">
          <h1 className="text-3xl font-black text-slate-900 uppercase">{project.name}</h1>
          <h2 className="text-xl font-extrabold text-slate-900 mt-2">{activeForm.title}</h2>
        </div>
      )}
    </div>
  );
}
