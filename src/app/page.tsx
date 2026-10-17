'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [activePage, setActivePage] = useState<'home' | 'analytics' | 'features'>('home');
  const [activeTab, setActiveTab] = useState<'overview' | 'diagnostics' | 'vitals'>('overview');
  
  // Doctor Filter State
  const [selectedDoctor, setSelectedDoctor] = useState('All Doctors');

  // Chat Widget State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Hello! I am Clinova AI. How can I assist you with clinical intelligence or patient management today?' },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  // Notification State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Critical ECG Alert', desc: 'Patient #89214 showing ventricular arrhythmia pattern.', time: '2m ago', type: 'critical' },
    { id: 2, title: 'EHR Sync Complete', desc: '142 patient records synced with Metro Health System.', time: '15m ago', type: 'info' },
    { id: 3, title: 'Lab Results Ready', desc: 'Blood panel results available for Patient #44012.', time: '1h ago', type: 'success' },
  ]);

  // Auth & Search States
  const [patientSearch, setPatientSearch] = useState('');

  // Datasets from Excel / API States
  const [patientsList, setPatientsList] = useState([
    { id: '#89214', name: 'Eleanor Vance', age: 48, condition: 'Arrhythmia Risk', status: 'critical', doctor: 'Dr. Rivera', hr: '112 bpm', bp: '168/94', risk: 91 },
    { id: '#44012', name: 'Marcus Chen', age: 62, condition: 'Glucose Stabilization', status: 'stable', doctor: 'Dr. Rivera', hr: '78 bpm', bp: '120/80', risk: 42 },
    { id: '#31098', name: 'Sophia Patel', age: 34, condition: 'Post-Op Recovery', status: 'stable', doctor: 'Dr. Thorne', hr: '72 bpm', bp: '118/76', risk: 31 },
    { id: '#77120', name: 'James Wilson', age: 55, condition: 'Hypertension Monitoring', status: 'critical', doctor: 'Dr. Thorne', hr: '88 bpm', bp: '158/92', risk: 76 },
  ]);
  const [appointments, setAppointments] = useState([
    { id: 1, patient: 'Eleanor Vance', doctor: 'Dr. Rivera', date: '2026-10-18', time: '10:00 AM', type: 'Cardiology Review', status: 'Confirmed' },
    { id: 2, patient: 'Marcus Chen', doctor: 'Dr. Rivera', date: '2026-10-18', time: '11:30 AM', type: 'Metabolic Check', status: 'Pending' },
    { id: 3, patient: 'Sophia Patel', doctor: 'Dr. Thorne', date: '2026-10-18', time: '09:15 AM', type: 'Post-Op Review', status: 'Confirmed' },
    { id: 4, patient: 'James Wilson', doctor: 'Dr. Thorne', date: '2026-10-18', time: '02:00 PM', type: 'Hypertension Follow-up', status: 'Confirmed' },
  ]);
  const [diagnosticLogs, setDiagnosticLogs] = useState([]);
  const [vitalsData, setVitalsData] = useState([]);

  // Fetch real Excel data from API route on mount
  useEffect(() => {
    async function fetchHospitalData() {
      try {
        const res = await fetch('/api/hospital-data');
        const data = await res.json();
        
        if (data) {
          if (data.patients && data.patients.length > 0) setPatientsList(data.patients);
          if (data.appointments && data.appointments.length > 0) setAppointments(data.appointments);
          if (data.diagnosticLogs) setDiagnosticLogs(data.diagnosticLogs);
          if (data.vitalsStream) setVitalsData(data.vitalsStream);
        }
      } catch (err) {
        console.error('Error loading data from Excel files:', err);
      }
    }
    fetchHospitalData();
  }, []);

  const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patient: 'Eleanor Vance',
    doctor: 'Dr. Rivera',
    date: '2026-10-18',
    time: '09:00 AM',
    type: 'General Checkup',
  });

  // AI Diagnostic Analyzer State
  const [diagnosticForm, setDiagnosticForm] = useState({
    patientId: '#89214',
    symptoms: 'Chest discomfort, mild shortness of breath',
    heartRate: '115',
    bloodPressure: '145/95',
  });
  const [diagnosticResult, setDiagnosticResult] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Filtered Lists per Selected Doctor
  const filteredPatients = patientsList.filter((patient: any) => {
    const matchesDoctor = selectedDoctor === 'All Doctors' || patient.doctor === selectedDoctor;
    const matchesSearch = patient.name?.toLowerCase().includes(patientSearch.toLowerCase()) || patient.id?.includes(patientSearch);
    return matchesDoctor && matchesSearch;
  });

  const filteredAppointments = appointments.filter((app: any) => {
    return selectedDoctor === 'All Doctors' || app.doctor === selectedDoctor;
  });

  // Export CSV Report Handler
  const handleExportReport = () => {
    const csvHeader = 'Patient ID,Name,Age,Condition,Status,Physician\n';
    const csvRows = filteredPatients
      .map((p: any) => `"${p.id}","${p.name}",${p.age},"${p.condition}","${p.status}","${p.doctor}"`)
      .join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Clinova_${selectedDoctor.replace(/\s+/g, '_')}_Report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };


const handleRunDiagnostic = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setDiagnosticResult(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      const hr = parseInt(diagnosticForm.heartRate, 10) || 0;
      
      let riskLevel = '';
      let recommendation = '';

      if (hr > 100) {
        riskLevel = `High Risk (${Math.min(96, Math.floor(75 + hr * 0.15))}% Confidence)`;
        recommendation = `Elevated heart rate (${hr} BPM) detected for ${diagnosticForm.patientId || 'patient'}. Immediate EKG telemetry review and cardiologist consultation recommended for suspected tachyarrhythmia.`;
      } else if (hr >= 60 && hr <= 100) {
        riskLevel = 'Low Risk (92% Confidence)';
        recommendation = `Normal sinus rhythm (${hr} BPM) recorded for ${diagnosticForm.patientId || 'patient'}. Patient vitals are stable; routine observation advised.`;
      } else if (hr < 60 && hr > 0) {
        riskLevel = 'Moderate Risk - Bradycardia (84% Confidence)';
        recommendation = `Low heart rate (${hr} BPM) detected for ${diagnosticForm.patientId || 'patient'}. Evaluate for sinus bradycardia or medication side-effects.`;
      } else {
        riskLevel = 'Invalid Input';
        recommendation = 'Please enter a valid heart rate value in BPM.';
      }

      setDiagnosticResult({
        riskLevel,
        recommendation,
        timestamp: new Date().toLocaleTimeString(),
      });
    }, 1000);
  };








  

  // Handle New Appointment Submission (Reception Desk Sync)
  const handleScheduleAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppointment.date) {
      alert('Please select a valid date for the appointment.');
      return;
    }

    const created = {
      id: appointments.length + 1,
      patient: newAppointment.patient,
      doctor: newAppointment.doctor,
      date: newAppointment.date,
      time: newAppointment.time,
      type: newAppointment.type,
      status: 'Confirmed',
    };

    setAppointments([created, ...appointments]);
    setIsAppointmentsOpen(false);
    alert(`Appointment successfully created at reception and updated to ${newAppointment.doctor}'s schedule!`);
  };

  // Real Gemini Chat Integration Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isGenerating) return;

    const userMsg = chatInput.trim();
    const updatedMessages = [...chatMessages, { role: 'user', text: userMsg }];
    
    setChatMessages(updatedMessages);
    setChatInput('');
    setIsGenerating(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setChatMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setChatMessages((prev) => [...prev, { role: 'assistant', text: `Error: ${data.error || 'Failed to get a response.'}` }]);
      }
    } catch (err) {
      setChatMessages((prev) => [...prev, { role: 'assistant', text: 'Network error connecting to Clinova AI backend.' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070A0F] text-slate-100 flex flex-col font-sans overflow-x-hidden justify-between">
      
      {/* High Clarity Intro Video Overlay */}
      {showIntro && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <video
            autoPlay
            muted
            playsInline
            onEnded={() => setShowIntro(false)}
            className="w-full h-full object-contain"
          >
            <source src="/intro.mp4.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <button
            onClick={() => setShowIntro(false)}
            className="absolute top-6 right-6 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-lg text-sm border border-slate-700 backdrop-blur font-semibold shadow-xl"
          >
            Skip Intro ✕
          </button>
        </div>
      )}

      {/* Hero Background Ambient Video */}
      <video autoPlay loop muted playsInline className="fixed inset-0 w-full h-full object-contain z-0 opacity-80 pointer-events-none">
        <source src="/hero-bg.mp4.mp4" type="video/mp4" />
      </video>

      <div className="fixed inset-0 bg-gradient-to-b from-[#070A0F]/90 via-[#070A0F]/80 to-[#070A0F] z-0 pointer-events-none" />

      {/* Header Navigation */}
      <header className="relative z-10 border-b border-slate-800/80 bg-[#0A0D14]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActivePage('home')}>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-lg shadow-lg shadow-cyan-500/10">
              C
            </div>
            <div>
              <span className="font-bold text-white tracking-wide text-base">Clinova</span>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-none">Clinical Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm font-medium relative">
            <button
              onClick={() => setIsAppointmentsOpen(true)}
              className="px-3 py-2 text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors text-xs font-semibold flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Reception Desk</span>
            </button>

            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notifications.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />}
            </button>
          </div>
        </div>
      </header>

      {/* Floating Side Navigation */}
      <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4 bg-[#101522]/90 border border-slate-800 p-3 rounded-2xl backdrop-blur-md shadow-2xl">
        <button
          onClick={() => setActivePage('home')}
          title="Home"
          className={`p-3 rounded-xl transition-all duration-300 ${
            activePage === 'home' 
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(34,211,238,0.8)] scale-105' 
              : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 hover:shadow-[0_0_12px_rgba(34,211,238,0.4)] hover:scale-105'
          }`}
        >
          🏠
        </button>
        <button
          onClick={() => setActivePage('analytics')}
          title="Doctor Workspace"
          className={`p-3 rounded-xl transition-all duration-300 ${
            activePage === 'analytics' 
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(34,211,238,0.8)] scale-105' 
              : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 hover:shadow-[0_0_12px_rgba(34,211,238,0.4)] hover:scale-105'
          }`}
        >
          🩺
        </button>
        <button
          onClick={() => setActivePage('features')}
          title="Capabilities"
          className={`p-3 rounded-xl transition-all duration-300 ${
            activePage === 'features' 
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(34,211,238,0.8)] scale-105' 
              : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 hover:shadow-[0_0_12px_rgba(34,211,238,0.4)] hover:scale-105'
          }`}
        >
          ⚡
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 py-12">
        {activePage === 'home' && (
          <section className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto my-auto py-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-6">
              ✨ Real-Time Doctor Portals & Reception Desk Sync
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Personalized dashboards & live schedule updates for every physician
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mb-8 leading-relaxed">
              Appointments booked at the reception desk update directly to the assigned doctor&apos;s live schedule view in real time.
            </p>
            <button
              onClick={() => setActivePage('analytics')}
              className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/20 text-sm"
            >
              Open Doctor Workspace
            </button>
          </section>
        )}

        {activePage === 'analytics' && (
          <div className="w-full max-w-[1600px] mx-auto space-y-6">
            
            {/* Doctor Selector Banner */}
            <div className="bg-[#101522] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-lg">
                  {selectedDoctor === 'All Doctors' ? '🏥' : '🩺'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedDoctor === 'All Doctors' ? 'Hospital-Wide Overview' : `${selectedDoctor}'s Physician Portal`}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedDoctor === 'All Doctors' ? 'Aggregated hospital metrics and general appointments' : `Active patient caseload and upcoming schedule for ${selectedDoctor}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-400 font-semibold uppercase">Switch Physician:</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-cyan-400 text-xs rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:border-cyan-500"
                >
                  <option value="All Doctors">🏥 All Doctors (Overview)</option>
                  <option value="Dr. Rivera">Dr. Rivera (Cardiology)</option>
                  <option value="Dr. Thorne">Dr. Thorne (Internal Medicine)</option>
                </select>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-5">
              {[
                { title: 'Assigned Patients', value: filteredPatients.length.toString(), trend: 'Active in queue', icon: '📊' },
                { title: 'Critical Alerts', value: filteredPatients.filter((p: any) => p.status === 'critical').length.toString(), trend: 'Requires attention', icon: '⚠️' },
                { title: 'Upcoming Appointments', value: filteredAppointments.length.toString(), trend: 'Synced from reception', icon: '📅' },
                { title: 'AI Risk Flags', value: filteredPatients.filter((p: any) => Number(p.risk) > 70).length.toString(), trend: 'High risk tier', icon: '🛡️' },
              ].map((stat, idx) => (
                <div 
                  key={idx} 
                  className="bg-[#101522] border border-slate-800/80 rounded-2xl p-5 shadow-lg transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">{stat.title}</span>
                    <span className="text-base">{stat.icon}</span>
                  </div>
                  <div className="text-3xl font-extrabold text-white tracking-tight mb-2">{stat.value}</div>
                  <div className="text-xs font-medium text-cyan-400">{stat.trend}</div>
                </div>
              ))}
            </div>

            {/* BAR CHART & DONUT CHART SECTION */}
            <div className="grid grid-cols-12 gap-6">
              
              {/* Weekly Admissions Bar Chart */}
              <div className="col-span-12 lg:col-span-7 bg-[#101522] border border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Weekly Admissions Overview</h3>
                    <p className="text-xs text-slate-400">Emergency vs Scheduled Admissions</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-300"><span className="w-3 h-3 bg-slate-600 rounded-sm"></span> Emergency</span>
                    <span className="flex items-center gap-1.5 text-slate-300"><span className="w-3 h-3 bg-cyan-500 rounded-sm"></span> Scheduled</span>
                  </div>
                </div>

                <div className="h-48 flex items-end justify-between gap-4 pt-6 px-2 border-b border-slate-800">
                  {[
                    { day: 'Mon', h1: '60%', h2: '45%' },
                    { day: 'Tue', h1: '80%', h2: '55%' },
                    { day: 'Wed', h1: '65%', h2: '48%' },
                    { day: 'Thu', h1: '95%', h2: '60%' },
                    { day: 'Fri', h1: '75%', h2: '52%' }
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <div className="w-full flex items-end justify-center gap-1.5 h-full">
                        <div style={{ height: bar.h1 }} className="w-4 bg-slate-700/80 rounded-t-md hover:bg-slate-600 transition-colors"></div>
                        <div style={{ height: bar.h2 }} className="w-4 bg-cyan-500 rounded-t-md hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"></div>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnosis Mix Donut Chart */}
              <div className="col-span-12 lg:col-span-5 bg-[#101522] border border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">Diagnosis Mix</h3>
                    <p className="text-xs text-slate-400">Current cohort distribution</p>
                  </div>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">Last 30 days</span>
                </div>

                <div className="flex items-center justify-around py-2">
                  <div className="relative w-32 h-32 rounded-full border-8 border-cyan-500/20 border-t-cyan-400 border-r-amber-400 border-b-rose-400 flex items-center justify-center shadow-xl">
                    <div className="text-center">
                      <span className="text-lg font-bold text-white">{filteredPatients.length}</span>
                      <p className="text-[10px] text-slate-400">cases</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {[
                      { label: 'Arrhythmia', color: 'bg-amber-400' },
                      { label: 'Hypertension', color: 'bg-rose-400' },
                      { label: 'Heart Failure', color: 'bg-cyan-400' },
                      { label: 'Post-Op', color: 'bg-blue-500' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                        <span className="text-slate-300">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Main Tabs Workspace */}
            <div className="bg-[#101522] border border-slate-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {selectedDoctor === 'All Doctors' ? 'General Hospital Schedule & Queue' : `${selectedDoctor}'s Schedule & Patient Queue`}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExportReport}
                    className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 hover:text-white font-semibold"
                  >
                    <span>📥 Export CSV</span>
                  </button>

                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-medium">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                    >
                      Patients & Schedule
                    </button>
                    <button
                      onClick={() => setActiveTab('diagnostics')}
                      className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'diagnostics' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                    >
                      AI Diagnostics
                    </button>
                    <button
                      onClick={() => setActiveTab('vitals')}
                      className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'vitals' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                    >
                      Vitals Monitor
                    </button>
                  </div>
                </div>
              </div>

              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Patients Table */}
                  <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-white">Assigned Patients</h4>
                      <input
                        type="text"
                        placeholder="Search patient..."
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            <th className="pb-3">Patient</th>
                            <th className="pb-3">Condition</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3">AI Risk</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {filteredPatients.length === 0 ? (
                            <tr><td colSpan={4} className="py-6 text-center text-slate-500">No patients assigned.</td></tr>
                          ) : (
                            filteredPatients.map((p: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                                <td className="py-3 font-medium text-white">{p.name} <span className="text-[10px] text-slate-400 block">{p.id}</span></td>
                                <td className="py-3 text-slate-300">{p.condition}</td>
                                <td className="py-3">
                                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${p.status === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'}`}>
                                    {p.status}
                                  </span>
                                </td>
                                <td className="py-3 font-bold text-white">{p.risk}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Upcoming Schedule & Appointments */}
                  <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-white">Upcoming Schedules & Appointments</h4>
                        <span className="text-xs text-cyan-400 font-bold">{filteredAppointments.length} queued</span>
                      </div>

                      <div className="space-y-3 max-h-72 overflow-y-auto">
                        {filteredAppointments.length === 0 ? (
                          <p className="text-xs text-slate-500 py-6 text-center">No upcoming appointments scheduled.</p>
                        ) : (
                          
                          
                          filteredAppointments.map((app: any, idx: number) => (
  <div key={app.id || idx} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1.5 shadow-md">
                              
                              <div className="flex justify-between font-semibold text-white">
                                <span>{app.patient}</span>
                                <span className="text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded">{app.time}</span>
                              </div>
                              <div className="flex justify-between text-slate-400 text-[11px]">
                                <span>{app.type} ({app.doctor})</span>
                                <span className="text-slate-500">{app.date}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setIsAppointmentsOpen(true)}
                      className="w-full mt-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 font-semibold rounded-xl text-xs transition-colors"
                    >
                      + Reception: Book New Appointment
                    </button>
                  </div>

                </div>
              )}

              {activeTab === 'diagnostics' && (
                <div className="space-y-6 max-w-2xl mx-auto py-4">
                  <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-2xl">
                    <h4 className="font-bold text-white text-sm mb-1">AI Diagnostic Risk Analyzer</h4>
                    <p className="text-xs text-slate-400 mb-6">Run predictive risk modeling for {selectedDoctor}.</p>
                    
                    <form onSubmit={handleRunDiagnostic} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Patient ID</label>
                          <select
                            value={diagnosticForm.patientId}
                            onChange={(e) => setDiagnosticForm({...diagnosticForm, patientId: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          >
                            {filteredPatients.map((p: any) => <option key={p.id} value={p.id}>{p.id} — {p.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Heart Rate (BPM)</label>
                          <input
                            type="text"
                            value={diagnosticForm.heartRate}
                            onChange={(e) => setDiagnosticForm({...diagnosticForm, heartRate: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isAnalyzing}
                        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl text-xs shadow-lg hover:opacity-90 transition-opacity"
                      >
                        {isAnalyzing ? 'Running AI Diagnostics...' : 'Run Risk Assessment'}
                      </button>
                    </form>

                    {diagnosticResult && (
                      <div className="mt-6 p-4 bg-slate-900 border border-cyan-500/30 rounded-xl text-xs space-y-2">
                        <div className="font-bold text-cyan-400">Analysis Results: {diagnosticResult.riskLevel}</div>
                        <p className="text-slate-300">{diagnosticResult.recommendation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'vitals' && (
                <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-2xl text-center space-y-4">
                  <h4 className="font-bold text-white text-sm">Real-Time Vitals Stream (Telemetry)</h4>
                  <p className="text-xs text-slate-400">Connected to live patient monitor stream datasets.</p>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-cyan-400 text-xs">
                    ECG Status: STABLE 📊 | SPO2: 98% | RESP: 16 bpm
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* Floating AI Chat Assistant Toggle */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl hover:scale-105 transition-all shadow-cyan-500/30"
        >
          💬
        </button>

        {isChatOpen && (
          <div className="absolute bottom-20 right-0 w-96 h-[480px] bg-[#101522] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
              <span className="font-bold text-xs text-white">Clinova AI Assistant</span>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`p-3 rounded-xl max-w-[85%] ${msg.role === 'user' ? 'bg-cyan-500 text-slate-950 ml-auto font-medium' : 'bg-slate-900 text-slate-200 border border-slate-800'}`}>
                  {msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Ask clinical AI..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button type="submit" disabled={isGenerating} className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs">
                Send
              </button>
            </form>
          </div>
        )}
      </div>
      





      {/* Reception Desk Modal */}
      {isAppointmentsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101522] border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1">Reception Desk — Book Appointment</h3>
            <p className="text-xs text-slate-400 mb-6">New bookings sync immediately to the selected physician's schedule.</p>

            <form onSubmit={handleScheduleAppointment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold uppercase mb-1">Patient Name</label>
                <input
                  type="text"
                  value={newAppointment.patient}
                  onChange={(e) => setNewAppointment({...newAppointment, patient: e.target.value})}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold uppercase mb-1">Assign Physician</label>
                <select
                  value={newAppointment.doctor}
                  onChange={(e) => setNewAppointment({...newAppointment, doctor: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Dr. Rivera">Dr. Rivera (Cardiology)</option>
                  <option value="Dr. Thorne">Dr. Thorne (Internal Medicine)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold uppercase mb-1">Date</label>
                  <input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold uppercase mb-1">Time</label>
                  <input
                    type="text"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold uppercase mb-1">Consultation Type</label>
                <input
                  type="text"
                  value={newAppointment.type}
                  onChange={(e) => setNewAppointment({...newAppointment, type: e.target.value})}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAppointmentsOpen(false)}
                  className="px-4 py-2 bg-slate-900 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl"
                >
                  Book & Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}