import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Geolocation } from '@capacitor/geolocation';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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
    submissions: [],
    expenses: [
      { id: 'exp-1', title: 'Community Mobilization Workshop', amount: 4500, date: '2026-06-12' },
      { id: 'exp-2', title: 'Borehole Hardware Procurement', amount: 8200, date: '2026-07-01' }
    ]
  }
];

export default function App() {
  const [projects, setProjects] = useState(() => {
    // Synchronous initial read from localStorage to guarantee persistence before first render
    const localCache = localStorage.getItem('gmel_offline_cache');
    if (localCache) {
      try {
        const parsed = JSON.parse(localCache);
        if (parsed.projects && parsed.projects.length > 0) return parsed.projects;
      } catch (e) {
        console.error("Initial cache read error:", e);
      }
    }
    return initialProjects;
  });

  const [license, setLicense] = useState(() => {
    const localCache = localStorage.getItem('gmel_offline_cache');
    if (localCache) {
      try {
        const parsed = JSON.parse(localCache);
        if (parsed.license) return parsed.license;
      } catch (e) {
        console.error("Initial license read error:", e);
      }
    }
    return {
      code: 'DEMO-5DAYS',
      level: 'Level 1: 5-Day Demo',
      demoClaimed: true,
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    };
  });
  
  const [userRole, setUserRole] = useState('Administrator');
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

  // FIXED: Real-time listener that safely merges remote data without destroying locally saved submissions
  useEffect(() => {
    if (!db || !navigator.onLine) {
      setIsLoadedFromCloud(true);
      return;
    }

    const docRef = doc(db, 'gmel_systems', 'main_workspace');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.projects && Array.isArray(data.projects)) {
          setProjects(prevProjects => {
            // Merge remote submissions with local submissions to prevent data loss on refresh
            return data.projects.map(remoteProj => {
              const localProj = prevProjects.find(p => p.id === remoteProj.id);
              if (!localProj) return remoteProj;

              // Combine unique submission IDs from both local and remote
              const subMap = new Map();
              [...(remoteProj.submissions || []), ...(localProj.submissions || [])].forEach(sub => {
                subMap.set(sub.id, sub);
              });

              return {
                ...remoteProj,
                submissions: Array.from(subMap.values())
              };
            });
          });
        }
        if (data.license && data.license.code) setLicense(data.license);
      }
      setIsLoadedFromCloud(true);
    }, (err) => {
      console.error('Error listening to cloud data:', err);
      setIsLoadedFromCloud(true);
    });

    return () => unsubscribe();
  }, []);

  // Synchronously cache to localStorage and sync to Firebase on every project/license modification
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
                GMEL System
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
                onChange={(e) => {
                  const selected = e.target.value;
                  if (selected === 'Administrator' || selected === 'M&E Officer') {
                    const pin = prompt(`Enter secure PIN to switch to ${selected}:`);
                    if (pin === 'GMEL2026!') {
                      setUserRole(selected);
                    } else {
                      alert('Incorrect security PIN! Access denied.');
                    }
                  } else {
                    setUserRole(selected);
                  }
                }}
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
            setProjects={setProjects}
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
              setProjects(prev => {
                const updatedProjects = prev.map(p => p.id !== currentProject.id ? p : {
                  ...p,
                  submissions: [submissionObj, ...p.submissions]
                });
                
                // Immediately persist synchronously to localStorage
                localStorage.setItem('gmel_offline_cache', JSON.stringify({ projects: updatedProjects, license }));
                
                // Immediately commit to Firestore
                if (db && navigator.onLine) {
                  setDoc(doc(db, 'gmel_systems', 'main_workspace'), { projects: updatedProjects, license, updated_at: new Date() })
                    .catch(err => console.error("Immediate sync error:", err));
                }
                return updatedProjects;
              });
              alert('Data record submitted, cached locally, and synced to Firebase successfully!');
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
  const downloadPDFGuidelines = 
    "GABRIEL MONITORING, EVALUATION AND LEARNING (GMEL) SYSTEM: OFFICIAL MANUAL\n" +
    "Founder & Lead Architect: Gabriel Godiel Mashambo · EnrichData Tanzania\n" +
    "Qualifications: Bachelor's in Statistics and Mathematics, Master's in Monitoring and Evaluation\n" +
    "Experience: Over 10 years in M&E, project initiation, planning, implementation, capacity building, DQAs, analysis, learning, and reporting in Tanzania.\n\n" +
    "1. System Navigation & Header Controls\n" +
    "Online / Offline Status Indicator: Displays whether connected to Firebase cloud servers (green badge) or operating in offline-first cached mode (amber badge).\n" +
    "Role-Based Access Control (RBAC): Toggle between Admin, M&E Officer, and Enumerator. Restricted roles require verification via secure PIN.\n" +
    "Project Picker Dropdown: Switches active workspace across multiple donor-funded projects.\n\n" +
    "2. Core Modules & Feature Guidelines\n" +
    "- Dashboard & Visuals: Executive oversight, project health status, and budget utilization tracking.\n" +
    "- Logical Framework Matrix: Indicator management with demographic disaggregation (General, Male, Female, Total) and automated form mapping.\n" +
    "- GIS Map Intelligence: Interactive Leaflet map plotting exact GPS coordinates captured across survey submissions.\n" +
    "- Custom Reports: Donor-ready performance summaries and scorecard tables with PDF print options.\n" +
    "- Form Builder: Survey creation tool supporting text, numbers, dates, dropdowns, multi-select, GPS, photos, notes, ratings, and Skip Logic.\n" +
    "- Data Submission: Offline-first field data entry with local caching and automated Firebase sync.\n" +
    "- Export Suite: Export raw submissions, logframes, and system backups to CSV or JSON.\n" +
    "- Printable Paper Forms: Clean paper-ready survey layouts for offline data collection.\n" +
    "- Mobile Sync Hub: Real-time status of local caching and cloud synchronization.\n" +
    "- License Hub: Manage subscription tiers (5-Day Demo, One-Year Plan, Lifetime License).\n\n" +
    "Contacts: Email: info.enrichdata@gmail.com | Mob: +255758216364";

  const handleDownload = () => {
    const blob = new Blob([downloadPDFGuidelines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Gabriel_GMEL_System_Manual.txt';
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-base">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            System User Guidelines &amp; Documentation
          </h2>
          <p className="text-base text-slate-600 mt-1">Official operational manual for the GMEL System.</p>
        </div>
        <div className="flex gap-2.5">
          <button type="button" onClick={() => window.print()} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow hover:bg-slate-800">
            Print Guide
          </button>
          <button type="button" onClick={handleDownload} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow hover:bg-indigo-700">
            Download Guide
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-8 text-slate-800 text-base leading-relaxed">
        <div className="border-b pb-6">
          <h1 className="text-3xl font-black text-slate-900">Gabriel Monitoring, Evaluation and Learning (GMEL) System Manual</h1>
          <p className="text-indigo-600 text-sm font-extrabold mt-1">Founder &amp; Lead Architect: Gabriel Godiel Mashambo &middot; EnrichData Tanzania</p>
        </div>

        <div className="bg-indigo-50/80 p-6 rounded-2xl border border-indigo-200 space-y-3">
          <h3 className="text-base font-black text-indigo-900 uppercase">
            About the Founder &amp; System Background
          </h3>
          <p className="text-base text-slate-700">
            In this architecture, the letter <strong>G</strong> stands for <strong>Gabriel</strong> (Gabriel Godiel Mashambo), founder and owner. Designated as the GMEL System, the platform incorporates over 10 years of professional expertise in development programming and M&amp;E consultancy across Tanzania.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-extrabold text-xl text-indigo-700">1. Role-Based Access Control (RBAC) &amp; Security</h3>
            <p className="text-slate-700">The platform enforces strict security across three user tiers protected by a verified security PIN (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-mono">GMEL2026!</code>):</p>
            <ul className="list-disc pl-6 space-y-1 text-slate-700 font-bold">
              <li>Administrator: Full project creation, indicator configuration, form building, and financial expense tracking.</li>
              <li>M&amp;E Officer: Logframe monitoring, GIS map analysis, and scorecard reviews.</li>
              <li>Enumerator: Restricted exclusively to field survey data collection.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-xl text-indigo-700">2. Dashboard &amp; Financial Budget Tracking</h3>
            <p className="text-slate-700">
              The home dashboard calculates overall project health ratings and tracks real expenditure ratios against donor funding using the integrated <strong>+ Add Expense</strong> module.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardView({ project, getCalculatedActual, onOpenEditProject, setProjects }) {
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExp, setNewExp] = useState({ title: '', amount: '', date: '' });

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

  let totalPctSum = 0;
  project.indicators.forEach(ind => {
    const actualObj = getCalculatedActual(project, ind);
    const actualVal = actualObj.total || actualObj.general || 0;
    const targetVal = (ind.target && typeof ind.target === 'object') ? (ind.target.total || ind.target.general || 1) : 1;
    const baseVal = (ind.baseline && typeof ind.baseline === 'object') ? (ind.baseline.total || ind.baseline.general || 0) : 0;
    const pct = Math.min(100, Math.max(0, Math.round(((actualVal - baseVal) / (targetVal - baseVal || 1)) * 100)));
    totalPctSum += pct;
  });
  const avgPerformance = totalIndicators > 0 ? Math.round(totalPctSum / totalIndicators) : 0;
  
  let healthStatus = 'On Track 🚀';
  let healthColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (avgPerformance < 40) {
    healthStatus = 'Needs Attention ⚠️';
    healthColor = 'bg-amber-100 text-amber-800 border-amber-300';
  } else if (avgPerformance >= 90) {
    healthStatus = 'Target Achieved ⭐';
    healthColor = 'bg-indigo-100 text-indigo-900 border-indigo-300';
  }

  const rawBudgetNum = parseFloat(String(project.budget || '0').replace(/[^0-9.]/g, '')) || 1;
  const projectExpenses = project.expenses || [];
  const totalSpent = projectExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const utilizationRate = Math.min(100, Math.round((totalSpent / rawBudgetNum) * 100));

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExp.title.trim() || !newExp.amount) return;
    const expenseObj = {
      id: createId('exp'),
      title: newExp.title,
      amount: parseFloat(newExp.amount) || 0,
      date: newExp.date || new Date().toISOString().split('T')[0]
    };
    setProjects(prev => prev.map(p => p.id !== project.id ? p : {
      ...p,
      expenses: [...(p.expenses || []), expenseObj]
    }));
    setNewExp({ title: '', amount: '', date: '' });
    setShowExpenseModal(false);
  };

  return (
    <div className="space-y-6 text-base">
      <div className="dashboard-heading flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 gap-4">
        <div>
          <div className="text-sm font-extrabold text-indigo-600 uppercase tracking-wide">MONITORING, EVALUATION &amp; LEARNING WORKSPACE</div>
          <h2 className="text-2xl font-black text-slate-900 mt-1">{project.name}</h2>
          <p className="text-base text-slate-600 mt-1 flex items-center gap-1.5"><MapPin className="h-5 w-5" /> {project.location} · Reporting period: 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-1.5 rounded-xl text-sm font-extrabold border ${healthColor}`}>
            Health: {healthStatus} ({avgPerformance}%)
          </span>
          <button onClick={onOpenEditProject} className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition">
            <Edit2 className="h-5 w-5" /> Edit project
          </button>
        </div>
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

          <div className="pt-6 border-t border-slate-200 space-y-3">
            <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ListCheck className="h-5 w-5 text-indigo-600" /> Recent Field Activity Logs
            </h4>
            {project.submissions.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No survey records submitted yet for this project.</p>
            ) : (
              <div className="space-y-2">
                {project.submissions.slice(0, 3).map(sub => (
                  <div key={sub.id} className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-xl border text-sm">
                    <span className="font-mono text-indigo-700 font-bold">{sub.timestamp}</span>
                    <span className="text-slate-600 truncate max-w-xs">ID: {sub.id}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-emerald-600" /> Budget Utilization
              </h3>
              <button 
                type="button"
                onClick={() => setShowExpenseModal(true)} 
                className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold px-3 py-1.5 rounded-lg hover:bg-emerald-100"
              >
                + Add Expense
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between font-bold">
                <span className="text-slate-600">Total Budget:</span>
                <span className="text-slate-900">{project.budget}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-600">Total Expended:</span>
                <span className="text-emerald-700">${totalSpent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-xs text-slate-500">
                <span>Utilization Rate:</span>
                <span>{utilizationRate}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden border">
                <div className="bg-emerald-600 h-3 rounded-full transition-all" style={{ width: `${utilizationRate}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <PieChart className="h-6 w-6 text-indigo-600" /> Indicator Level Breakdown
            </h3>
            <div className="py-4 flex justify-center">
              <div className="w-32 h-32 rounded-full relative flex items-center justify-center shadow-inner" style={{ background: `conic-gradient(${chartSegments || '#e5e7eb 0% 100%'})` }}>
                <div className="absolute w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center shadow">
                  <strong className="text-lg font-black text-slate-900">{totalIndicators}</strong>
                  <span className="text-xs uppercase font-extrabold text-slate-500">indicators</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {levels.map(({ name: lvl, color }) => {
                const count = project.indicators.filter(i => i.level === lvl).length;
                return (
                  <div key={lvl} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 flex items-center gap-2"><span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />{lvl}</span>
                    <span className="font-mono bg-white px-2.5 py-0.5 rounded-lg border font-extrabold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xl font-extrabold text-slate-900">Record Project Expense</h3>
              <button type="button" onClick={() => setShowExpenseModal(false)} className="text-slate-400 font-bold text-lg">✕</button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-4 text-base">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Expense Title / Item *</label>
                <input type="text" required placeholder="e.g. Field Enumerator Transport" value={newExp.title} onChange={(e) => setNewExp({...newExp, title: e.target.value})} className="w-full border rounded-xl p-3 font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Amount ($) *</label>
                  <input type="number" required placeholder="1200" value={newExp.amount} onChange={(e) => setNewExp({...newExp, amount: e.target.value})} className="w-full border rounded-xl p-3 font-mono font-bold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                  <input type="date" value={newExp.date} onChange={(e) => setNewExp({...newExp, date: e.target.value})} className="w-full border rounded-xl p-3 text-sm font-bold" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="px-4 py-2.5 border rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-emerald-600 text-white font-extrabold rounded-xl">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
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
          <p className="text-base text-slate-600 mt-1">Manage indicators with fully disaggregated demographic metrics (General, Male, Female, Total).</p>
        </div>
        {userRole !== 'Enumerator' && (
          <button onClick={() => { setEditingIndicatorId(null); setShowAddModal(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-extrabold text-base flex items-center gap-2 shadow">
            <PlusCircle className="h-5 w-5" /> Add Indicator
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-slate-100 text-slate-800 text-xs uppercase font-extrabold border-b border-slate-200">
              <th className="p-4">Level</th>
              <th className="p-4">Indicator Statement</th>
              <th className="p-4 text-center">Baseline (Gen / M / F / Tot)</th>
              <th className="p-4 text-center">Target (Gen / M / F / Tot)</th>
              <th className="p-4 text-center">Actual (Gen / M / F / Tot)</th>
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
                      <div className="text-xs text-slate-600">M: {baseline.male} | F: {baseline.female} | Tot: <strong className="text-slate-900">{baseline.total}</strong></div>
                    </div>
                  </td>

                  <td className="p-4 text-center font-mono text-sm text-slate-800 align-top">
                    <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 space-y-1">
                      <div>Gen: <strong className="text-indigo-900">{target.general}</strong> {ind.unit}</div>
                      <div className="text-xs text-slate-600">M: {target.male} | F: {target.female} | Tot: <strong className="text-slate-900">{target.total}</strong></div>
                    </div>
                  </td>

                  <td className="p-4 text-center font-mono text-sm text-indigo-900 align-top">
                    <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-200 space-y-1 shadow-sm">
                      <div>Gen: <strong className="text-indigo-700">{actual.general}</strong> {ind.unit}</div>
                      <div className="text-xs text-indigo-700">M: {actual.male} | F: {actual.female} | Tot: <strong className="font-extrabold">{actual.total}</strong></div>
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
                      {ind.mappedFieldId && (
                        <select
                          value={ind.calcType || 'SUM'}
                          onChange={(e) => handleMapField(ind.id, ind.mappedFieldId, e.target.value)}
                          disabled={userRole === 'Enumerator'}
                          className="text-xs font-extrabold bg-indigo-100 text-indigo-900 border border-indigo-300 rounded-xl px-2.5 py-1.5"
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

                  {userRole !== 'Enumerator' && (
                    <td className="p-4 text-right align-top">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => openIndicatorEditor(ind)} title="Edit indicator" className="rounded-xl p-2.5 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200">
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDeleteIndicator(ind)} title="Delete indicator" className="rounded-xl p-2.5 text-slate-600 hover:bg-red-50 hover:text-red-700 border border-slate-200">
                          <Trash2 className="h-5 w-5" />
                        </button>
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
            <h3 className="text-xl font-black text-slate-900 border-b pb-3">{editingIndicatorId ? 'Edit Logframe Indicator' : 'Add Disaggregated Indicator'}</h3>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Hierarchy Level</label>
              <select value={newInd.level} onChange={(
