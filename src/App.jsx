import React, { useState, useEffect } from 'react';
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
  GraduationCap
} from 'lucide-react';

const createId = (prefix) => `${prefix}-${globalThis.crypto.randomUUID()}`;

// Default Initial Projects with Disaggregated Data Structure
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
        target: { general: 100, male: 40, female: 60, total: 100 }, 
        unit: 'points', 
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
    code: 'DEMO-5DAYS',
    level: 'Level 1: 5-Day Demo',
    demoClaimed: true,
    activatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  });

  const [activeProjectId, setActiveProjectId] = useState('proj-1');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [selectedPrintFormId, setSelectedPrintFormId] = useState('');
  
  const [newProj, setNewProj] = useState({ name: '', code: '', donor: '', budget: '', location: '' });
  const [editProj, setEditProj] = useState({ name: '', code: '', donor: '', budget: '', location: '' });

  const currentProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const isExpired = license.expiresAt && new Date() > new Date(license.expiresAt);

  if (isExpired) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-white text-base">
        <div className="max-w-xl w-full">
          <div className="text-center mb-6">
            <div className="bg-red-600 p-4 rounded-2xl w-fit mx-auto shadow-lg mb-3">
              <AlertTriangle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">DEMO PERIOD HAS EXPIRED</h1>
            <p className="text-base text-slate-300 mt-2">Your trial period has ended. Please enter a valid activation code to continue.</p>
          </div>
          <LicenseActivationView license={license} setLicense={setLicense} isGateway={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans text-base border-t-4 border-indigo-600">
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-inner">
              <Layers className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                GMEL <span className="text-xs bg-indigo-500/30 text-indigo-300 font-mono px-2.5 py-1 rounded border border-indigo-400/30">SYSTEM</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-2 bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 shadow-sm">
              <Building2 className="h-5 w-5 text-indigo-400" />
              <label htmlFor="project-select" className="text-sm text-slate-300 font-semibold">Project:</label>
              <select 
                id="project-select"
                value={activeProjectId} 
                onChange={(e) => setActiveProjectId(e.target.value)}
                className="bg-transparent text-base font-bold text-white focus:outline-none cursor-pointer max-w-[170px] sm:max-w-[240px] truncate"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-800 text-white">{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

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
              title="Edit Project"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 p-2.5 rounded-xl font-bold text-sm flex items-center gap-1 transition"
            >
              <Edit2 className="h-5 w-5 text-amber-400" />
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

            <button 
              onClick={() => setShowAddProjectModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-extrabold text-sm flex items-center gap-2 transition shadow-md"
            >
              <PlusCircle className="h-5 w-5" />
              New Project
            </button>
          </div>
        </div>

        <div className="bg-slate-800 border-t border-slate-700 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-2 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard & Visuals', icon: BarChart3 },
              { id: 'logframe', label: 'Logframe Matrix', icon: TrendingUp },
              { id: 'reports', label: 'Custom Reports', icon: FileText },
              { id: 'builder', label: 'Form Builder', icon: FileText },
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 bg-white text-base">
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
              alert('Data record submitted successfully!');
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
        {activeTab === 'print' && <PrintableFormsView project={currentProject} selectedFormId={selectedPrintFormId} setSelectedFormId={setSelectedPrintFormId} />}
        {activeTab === 'guidelines' && <UserGuidelinesView />}
        {activeTab === 'license' && <LicenseActivationView license={license} setLicense={setLicense} />}
      </main>

      {/* Modals */}
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

// Helper to compute disaggregated actual values
function getCalculatedActual(project, ind) {
  const defaultVal = { general: 0, male: 0, female: 0, total: 0 };
  if (!ind.mappedFieldId) return ind.baseline || defaultVal;

  const values = project.submissions.map(sub => Number(sub.data[ind.mappedFieldId])).filter(v => !isNaN(v));
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

function UserGuidelinesView() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 text-base">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <BookOpen className="h-7 w-7 text-indigo-600" /> System User Guidelines
          </h2>
          <p className="text-base text-slate-600 mt-1">Gabriel Monitoring, Evaluation and Learning System.</p>
        </div>
        <button onClick={() => window.print()} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow hover:bg-slate-800">
          <Printer className="h-5 w-5" /> Print Guide
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6 text-slate-800 text-base leading-relaxed">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-black text-slate-900">GMEL System Manual</h1>
          <p className="text-indigo-600 text-sm font-bold mt-1">Founder &amp; Lead Architect: Gabriel Godiel Mashambo · EnrichData Tanzania</p>
        </div>

        <div className="bg-indigo-50/80 p-6 rounded-2xl border border-indigo-200 space-y-3">
          <h3 className="text-base font-black text-indigo-900 uppercase flex items-center gap-2.5">
            <GraduationCap className="h-6 w-6 text-indigo-600" /> System Background
          </h3>
          <p className="text-base text-slate-700">
            Designated as the <em>Gabriel Monitoring, Evaluation and Learning System</em>, the platform incorporates professional expertise in development programming and M&amp;E consultancy across Tanzania.
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
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="text-sm font-extrabold text-indigo-600 uppercase tracking-wide">WORKSPACE</div>
          <h2 className="text-2xl font-black text-slate-900 mt-1">{project.name}</h2>
          <p className="text-base text-slate-600 mt-1 flex items-center gap-1.5"><MapPin className="h-5 w-5" /> {project.location}</p>
        </div>
        <button onClick={onOpenEditProject} className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition">
          <Edit2 className="h-5 w-5" /> Edit Project
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
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 border-b pb-3">
            <BarChart3 className="h-6 w-6 text-indigo-600" /> Indicator Progress
          </h3>
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
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 border-b pb-3">
              <PieChart className="h-6 w-6 text-indigo-600" /> Level Breakdown
            </h3>
            <div className="py-6 flex justify-center">
              <div className="w-36 h-36 rounded-full relative flex items-center justify-center shadow-inner" style={{ background: `conic-gradient(${chartSegments || '#e5e7eb 0% 100%'})` }}>
                <div className="absolute w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center shadow">
                  <strong className="text-xl font-black text-slate-900">{totalIndicators}</strong>
                  <span className="text-xs uppercase font-extrabold text-slate-500">indicators</span>
                </div>
              </div>
            </div>
            <div className="space-y-2.5 text-sm">
              {levels.map(({ name: lvl, color }) => {
                const count = project.indicators.filter(i => i.level === lvl).length;
                return (
                  <div key={lvl} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 flex items-center gap-2.5"><span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: color }} />{lvl} level</span>
                    <span className="font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-300 font-extrabold">{count}</span>
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

function LogframeView({ project, getCalculatedActual, setProjects }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIndicatorId, setEditingIndicatorId] = useState(null);
  
  const [newInd, setNewInd] = useState({ 
    level: 'Output', 
    title: '', 
    baseline: { general: 0, male: 0, female: 0, total: 0 },
    target: { general: 100, male: 40, female: 60, total: 100 },
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
    setNewInd({ level: 'Output', title: '', baseline: { general: 0, male: 0, female: 0, total: 0 }, target: { general: 100, male: 40, female: 60, total: 100 }, unit: 'Units' });
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
    setNewInd({ level: 'Output', title: '', baseline: { general: 0, male: 0, female: 0, total: 0 }, target: { general: 100, male: 40, female: 60, total: 100 }, unit: 'Units' });
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
          <p className="text-base text-slate-600 mt-1">Manage indicators with disaggregated demographic metrics (General, Male, Female, Total).</p>
        </div>
        <button onClick={() => { setEditingIndicatorId(null); setShowAddModal(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-extrabold text-base flex items-center gap-2 shadow">
          <PlusCircle className="h-5 w-5" /> Add Indicator
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1050px]">
          <thead>
            <tr className="bg-slate-100 text-slate-800 text-xs uppercase font-extrabold border-b border-slate-200">
              <th className="p-4">Level</th>
              <th className="p-4">Indicator Statement</th>
              <th className="p-4 text-center">Baseline (Gen / M / F / Tot)</th>
              <th className="p-4 text-center">Target (Gen / M / F / Tot)</th>
              <th className="p-4 text-center">Actual (Gen / M / F / Tot)</th>
              <th className="p-4">Automated Data Mapping</th>
              <th className="p-4 text-right">Actions</th>
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
                        className="text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 shadow-sm"
                      >
                        <option value="">Manual Entry (No Form Linked)</option>
                        {availableFields.map(f => (<option key={f.fieldId} value={f.fieldId}>🔗 {f.label}</option>))}
                      </select>
                      {ind.mappedFieldId && (
                        <select
                          value={ind.calcType || 'SUM'}
                          onChange={(e) => handleMapField(ind.id, ind.mappedFieldId, e.target.value)}
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
              <select value={newInd.level} onChange={(e) => setNewInd({...newInd, level: e.target.value})} className="w-full border rounded-xl p-3 text-base font-bold bg-white">
                <option value="Impact">Impact</option><option value="Outcome">Outcome</option><option value="Output">Output</option><option value="Activity">Activity</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Indicator Statement</label>
              <input type="text" placeholder="e.g. Number of schools or households trained" value={newInd.title} onChange={(e) => setNewInd({...newInd, title: e.target.value})} className="w-full border rounded-xl p-3 text-base font-bold" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Unit of Measure</label>
              <input type="text" value={newInd.unit} onChange={(e) => setNewInd({...newInd, unit: e.target.value})} className="w-full border rounded-xl p-3 text-base font-bold" />
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-sm font-extrabold text-slate-800">Baseline Disaggregation (General, Male, Female)</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-600 block mb-1">General</span>
                  <input type="number" value={newInd.baseline.general} onChange={(e) => setNewInd({...newInd, baseline: {...newInd.baseline, general: parseFloat(e.target.value) || 0}})} className="w-full border rounded-xl p-2.5 text-sm font-mono bg-white" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-600 block mb-1">Male</span>
                  <input type="number" value={newInd.baseline.male} onChange={(e) => setNewInd({...newInd, baseline: {...newInd.baseline, male: parseFloat(e.target.value) || 0}})} className="w-full border rounded-xl p-2.5 text-sm font-mono bg-white" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-600 block mb-1">Female</span>
                  <input type="number" value={newInd.baseline.female} onChange={(e) => setNewInd({...newInd, baseline: {...newInd.baseline, female: parseFloat(e.target.value) || 0}})} className="w-full border rounded-xl p-2.5 text-sm font-mono bg-white" />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-sm font-extrabold text-slate-800">Target Disaggregation (General, Male, Female)</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-600 block mb-1">General</span>
                  <input type="number" value={newInd.target.general} onChange={(e) => setNewInd({...newInd, target: {...newInd.target, general: parseFloat(e.target.value) || 0}})} className="w-full border rounded-xl p-2.5 text-sm font-mono bg-white" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-600 block mb-1">Male</span>
                  <input type="number" value={newInd.target.male} onChange={(e) => setNewInd({...newInd, target: {...newInd.target, male: parseFloat(e.target.value) || 0}})} className="w-full border rounded-xl p-2.5 text-sm font-mono bg-white" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-600 block mb-1">Female</span>
                  <input type="number" value={newInd.target.female} onChange={(e) => setNewInd({...newInd, target: {...newInd.target, female: parseFloat(e.target.value) || 0}})} className="w-full border rounded-xl p-2.5 text-sm font-mono bg-white" />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button onClick={() => { setShowAddModal(false); setEditingIndicatorId(null); }} className="px-5 py-2.5 text-base border rounded-xl font-bold">Cancel</button>
              <button onClick={handleSaveIndicator} className="px-5 py-2.5 text-base bg-indigo-600 text-white font-extrabold rounded-xl shadow">Save Indicator</button>
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
      alert('Invalid activation code.');
      return;
    }

    setLicense(newLicenseData);
    setInputCode('');
    alert(`Activation successful! Tier: ${newLicenseData.level}`);
  };

  const isExpired = license.expiresAt && new Date() > new Date(license.expiresAt);
  const daysRemaining = license.expiresAt ? Math.ceil((new Date(license.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className={`mx-auto space-y-6 text-base ${isGateway ? 'max-w-xl text-slate-900' : 'max-w-3xl'}`}>
      {!isGateway && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <KeyRound className="h-7 w-7 text-indigo-600" /> System License &amp; Activation
          </h2>
          <p className="text-base text-slate-600 mt-1">Manage your subscription tier and activation keys.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl border shadow-sm bg-white border-slate-200 text-slate-900 flex flex-col justify-between">
          <div>
            <span className="text-xs font-black uppercase text-indigo-600 tracking-wider">Level 1</span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">5-Day Demo</h3>
          </div>
          <div className="mt-5 pt-4 border-t">
            <button onClick={() => activateCode('DEMO-5DAYS')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold py-3 px-3 rounded-xl shadow transition">
              Activate Demo
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl border shadow-sm bg-white border-slate-200 text-slate-900 flex flex-col justify-between">
          <div>
            <span className="text-xs font-black uppercase text-emerald-600 tracking-wider">Level 2</span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">One-Year Plan</h3>
          </div>
          <div className="mt-5 pt-4 border-t">
            <a href="mailto:info.enrichdata@gmail.com?subject=One-Year%20Plan" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold py-3 px-3 rounded-xl shadow transition flex items-center justify-center gap-2 text-center">
              <Mail className="h-5 w-5" /> Request Plan
            </a>
          </div>
        </div>

        <div className="p-6 rounded-2xl border shadow-sm bg-white border-slate-200 text-slate-900 flex flex-col justify-between">
          <div>
            <span className="text-xs font-black uppercase text-amber-600 tracking-wider">Level 3</span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">Lifetime</h3>
          </div>
          <div className="mt-5 pt-4 border-t">
            <a href="mailto:info.enrichdata@gmail.com?subject=Lifetime%20License" className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm font-extrabold py-3 px-3 rounded-xl shadow transition flex items-center justify-center gap-2 text-center">
              <Mail className="h-5 w-5" /> Request License
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomReportsView({ project, getCalculatedActual }) {
  return (
    <div className="space-y-6 text-base">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Custom Reports &amp; Scorecard</h2>
          <p className="text-base text-slate-600 mt-1">Donor-ready summary report for {project.name}.</p>
        </div>
        <button onClick={() => window.print()} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow hover:bg-slate-800 print:hidden">
          <Printer className="h-5 w-5" /> Print Report
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="border-b pb-4 flex justify-between items-start">
          <div>
            <span className="text-xs font-mono bg-indigo-100 text-indigo-800 px-3 py-1 rounded-lg font-bold">{project.code}</span>
            <h1 className="text-3xl font-black text-slate-900 mt-1.5">{project.name}</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase font-extrabold">Donor Partner</p>
            <p className="text-base font-bold text-slate-900">{project.donor}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormBuilderView({ project, setProjects, onRenameForm, onDeleteForm }) {
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [fields, setFields] = useState([{ id: 'field-1', label: 'Beneficiary Full Name', type: 'text', required: true, options: [] }]);

  const handleSaveForm = () => {
    if (!formTitle.trim()) return;
    const newForm = {
      id: createId('form'),
      title: formTitle,
      description: formDesc,
      fields
    };
    setProjects(prev => prev.map(p => p.id !== project.id ? p : { ...p, forms: [...p.forms, newForm] }));
    setFormTitle('');
    setFormDesc('');
    setFields([{ id: 'field-1', label: 'Beneficiary Full Name', type: 'text', required: true, options: [] }]);
    alert('Form published!');
  };

  return (
    <div className="space-y-6 text-base">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-black text-slate-900">Advanced Form Generator</h2>
        <p className="text-base text-slate-600 mt-1">Design surveys for {project.name}.</p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <h3 className="text-lg font-extrabold text-slate-900 border-b pb-3">Create New Custom Form</h3>
        <input type="text" placeholder="Form Name" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full border rounded-xl p-3 text-base font-bold" />
        <button onClick={handleSaveForm} className="bg-emerald-600 text-white font-extrabold px-6 py-3 rounded-xl">Publish Form</button>
      </div>
    </div>
  );
}

function DataEntryView({ project, onSubmitForm, onDeleteSubmission, onClearAllSubmissions }) {
  const [selectedFormId, setSelectedFormId] = useState(project.forms[0]?.id || '');
  const [formData, setFormData] = useState({});
  const activeForm = project.forms.find(f => f.id === selectedFormId);

  return (
    <div className="space-y-8 text-base">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-black text-slate-900">Field Data Entry Submission</h2>
          <select value={selectedFormId} onChange={(e) => setSelectedFormId(e.target.value)} className="w-full border rounded-xl p-3 mt-3 font-bold bg-white">
            {project.forms.map(f => (<option key={f.id} value={f.id}>{f.title}</option>))}
          </select>
        </div>

        {activeForm && (
          <form onSubmit={(e) => { e.preventDefault(); onSubmitForm(activeForm.id, formData); setFormData({}); }} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <h3 className="font-extrabold text-slate-900 text-xl border-b pb-3">{activeForm.title}</h3>
            {activeForm.fields.map(field => (
              <div key={field.id} className="space-y-2">
                <label className="block text-sm font-bold text-slate-800">{field.label}</label>
                <input type="text" value={formData[field.id] || ''} onChange={(e) => setFormData({...formData, [field.id]: e.target.value})} className="w-full border rounded-xl p-3 font-bold" />
              </div>
            ))}
            <button type="submit" className="w-full bg-indigo-600 text-white font-extrabold py-4 rounded-2xl shadow-md">Submit Data Record</button>
          </form>
        )}
      </div>
    </div>
  );
}

function ExportSuiteView({ onExportSubmissions, onExportLogframe, onExportBackup }) {
  return (
    <div className="space-y-6 text-base">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-black text-slate-900">GMEL Data Export Suite</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-lg">Raw Submissions</h3>
          <button onClick={onExportSubmissions} className="w-full bg-emerald-600 text-white font-extrabold py-3 rounded-xl shadow-md">Export CSV</button>
        </div>
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
        <button onClick={() => window.print()} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
          <Printer className="h-5 w-5" /> Print Form
        </button>
      </div>
      {activeForm && (
        <div className="bg-white p-12 rounded-3xl border border-slate-300 shadow-md max-w-3xl mx-auto print:border-none print:shadow-none">
          <h1 className="text-3xl font-black text-slate-900 uppercase">{project.name}</h1>
          <h2 className="text-xl font-extrabold text-slate-900 border-b pb-1 mt-4">{activeForm.title}</h2>
        </div>
      )}
    </div>
  );
}
