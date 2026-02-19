import React, { useState } from 'react';
import axios from 'axios';

const VibeCheck = () => {
  // --- DYNAMIC API CONFIGURATION ---
  // This looks for the Vercel environment variable first; defaults to localhost
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // --- USER STATE ---
  const [users, setUsers] = useState([
    { name: "Manu Sharma", role: "Senior Dev" },
    { name: "Ishika Agarwal", role: "UX Lead" },
    { name: "Gurveer Singh", role: "Product Owner" },
    { name: "Puja Rao", role: "Sales Rep" }
  ]);
  const [currentUser, setCurrentUser] = useState(users[0]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  
  // New state for custom dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // --- FORM STATE ---
  const [mood, setMood] = useState('😐');
  const [battery, setBattery] = useState(50);
  const [ventText, setVentText] = useState('');
  const [pressureSource, setPressureSource] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const moods = ['⛈️', '🌧️', '☁️', '😐', '🌤️', '☀️', '🔥'];
  
  const pressureOptions = [
    { label: "Deadlines", icon: "⏰" }, 
    { label: "Workload", icon: "📚" }, 
    { label: "Management", icon: "👔" }, 
    { label: "Pay/Comp", icon: "💰" }, 
    { label: "Team", icon: "🗣️" }, 
    { label: "Personal", icon: "🏠" },
    { label: "All Good", icon: "✅" }
  ];

  // --- HANDLERS ---
  const handleAddUser = () => {
    if (newUserName.trim()) {
      const newUser = { name: newUserName, role: "Team Member" };
      setUsers([...users, newUser]);
      setCurrentUser(newUser); 
      setNewUserName('');
      setIsAddingUser(false);
    }
  };

  const handleSubmit = async () => {
    if (!pressureSource) {
      alert("Please select a pressure source (or 'All Good') to continue.");
      return;
    }
    setIsLoading(true);
    try {
      // UPDATED: Now uses the dynamic API_URL variable
      await axios.post(`${API_URL}/api/submit-vibe`, {
        userName: currentUser.name, 
        role: currentUser.role, 
        mood, 
        battery, 
        ventText, 
        pressure_source: pressureSource, // Map your local state to the backend's expected key
  primary_driver: pressureSource
      });
      
      setTimeout(() => {
        setSubmitted(true);
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error("Connection Error:", error);
      setIsLoading(false);
      alert(`Failed to sync. Backend might be down at: ${API_URL}`);
    }
  };

  // --- 1. SUCCESS SCREEN ---
  if (submitted) {
    return (
      <div className="h-screen w-full bg-slate-900 flex items-center justify-center relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black opacity-80"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500 rounded-full blur-[150px] opacity-20 animate-pulse"></div>

        <div className="relative z-10 text-center p-12 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl max-w-md w-full transform transition-all hover:scale-105">
          <div className="text-8xl mb-6 animate-bounce drop-shadow-lg">🎉</div>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Vibe Logged!</h2>
          <p className="text-indigo-200 mb-8 font-medium">Have a great day, {currentUser.name.split(' ')[0]}!</p>
          <button 
            onClick={() => { setSubmitted(false); setVentText(''); setBattery(50); setPressureSource(''); }}
            className="w-full bg-white text-indigo-900 font-bold py-4 px-6 rounded-xl hover:bg-indigo-50 transition-all shadow-lg hover:shadow-indigo-500/50"
          >
            Check In Again
          </button>
        </div>
      </div>
    );
  }

  // --- 2. MAIN DASHBOARD ---
  return (
    <div className="h-screen w-full bg-slate-900 relative overflow-hidden font-sans text-slate-200 selection:bg-indigo-500 selection:text-white">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600 rounded-full blur-[150px] opacity-15 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[150px] opacity-15"></div>

      {/* GLASS CONTAINER */}
      <div className="relative z-10 w-full h-full bg-slate-800/40 backdrop-blur-2xl flex flex-col md:flex-row overflow-hidden">
        
        {/* === LEFT PANEL: VISUALS === */}
        <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col relative border-r border-white/5 bg-gradient-to-b from-white/5 via-transparent to-transparent">
          
          {/* --- TOP: IDENTITY CAPSULE (User Switcher) --- */}
          <div className="z-50 flex justify-between items-start">
            <div className={`group flex items-center gap-1 p-1 pr-2 rounded-full border transition-all duration-300 ${isAddingUser ? 'bg-slate-900/90 border-indigo-500 ring-2 ring-indigo-500/20' : 'bg-black/30 border-white/10 hover:border-white/20 hover:bg-black/40'}`}>
              
              {!isAddingUser ? (
                <>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>

                  <div className="relative">
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors outline-none"
                    >
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-xs font-bold text-white">{currentUser.name}</span>
                        <span className="text-[10px] text-indigo-300 font-medium">{currentUser.role}</span>
                      </div>
                      <svg className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>

                    {isDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10 cursor-default" onClick={() => setIsDropdownOpen(false)}></div>
                        
                        <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                           <div className="p-1">
                              {users.map((u) => (
                                <button
                                  key={u.name}
                                  onClick={() => {
                                    setCurrentUser(u);
                                    setIsDropdownOpen(false);
                                  }}
                                  className={`w-full text-left flex items-center gap-3 p-2 rounded-lg transition-colors group/item ${
                                    currentUser.name === u.name 
                                      ? 'bg-indigo-500/20 text-white' 
                                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                  }`}
                                >
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    currentUser.name === u.name ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'
                                  }`}>
                                    {u.name.charAt(0)}
                                  </div>
                                  <div className="flex flex-col leading-none">
                                    <span className="text-xs font-bold">{u.name}</span>
                                    <span className="text-[10px] opacity-70 mt-0.5">{u.role}</span>
                                  </div>
                                  {currentUser.name === u.name && (
                                    <span className="ml-auto text-indigo-400 text-xs">✓</span>
                                  )}
                                </button>
                              ))}
                           </div>
                           <div className="h-px bg-white/5 my-0"></div>
                           <button 
                             onClick={() => { setIsAddingUser(true); setIsDropdownOpen(false); }}
                             className="w-full text-left p-2.5 text-xs font-bold text-indigo-300 hover:bg-indigo-500/10 hover:text-indigo-200 transition-colors flex items-center gap-2"
                           >
                             <span className="w-5 h-5 rounded-full border border-dashed border-indigo-500/50 flex items-center justify-center text-indigo-400 ml-0.5">+</span>
                             Add New Member
                           </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200 pl-1">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                  <input 
                    type="text" 
                    autoFocus
                    placeholder="Name..."
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="bg-transparent text-white text-xs font-bold py-2 outline-none w-24 placeholder-slate-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
                  />
                  <div className="flex gap-1">
                    <button onClick={handleAddUser} className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors">✓</button>
                    <button onClick={() => setIsAddingUser(false)} className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors">✕</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* --- MIDDLE: BIG GREETING --- */}
          <div className="mt-16 relative z-10">
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-2 leading-[0.9] drop-shadow-2xl">
              HELLO,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 animate-gradient-x">
                {currentUser.name.split(' ')[0].toUpperCase()}.
              </span>
            </h1>
          </div>

          {/* --- CENTER: MOOD VISUAL --- */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="relative group cursor-pointer transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-indigo-500 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="text-[140px] md:text-[180px] transition-transform duration-300 scale-100 group-hover:scale-110 drop-shadow-2xl filter saturate-[1.2]">
                {mood}
              </div>
            </div>
            <p className="text-indigo-200/50 text-[10px] font-bold tracking-[0.3em] uppercase mt-2">Current Forecast</p>
          </div>

          {/* --- BOTTOM: BATTERY --- */}
          <div className="mt-auto pt-6">
            <div className="flex justify-between items-end mb-3">
              <span className="text-xs font-bold text-slate-400 tracking-widest">INTERNAL BATTERY</span>
              <span className={`text-2xl font-black font-mono ${battery < 30 ? 'text-red-400' : (battery > 70 ? 'text-emerald-400' : 'text-amber-400')}`}>
                {battery}%
              </span>
            </div>
            
            <div className="relative w-full h-12 flex items-center">
              <div className="absolute w-full h-3 bg-slate-700/50 rounded-full overflow-hidden border border-white/5 backdrop-blur-sm">
                <div 
                  className={`h-full transition-all duration-500 ease-out relative ${
                    battery < 30 ? 'bg-gradient-to-r from-red-600 to-red-400' : 
                    (battery > 70 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-indigo-600 to-purple-500')
                  }`} 
                  style={{ width: `${battery}%` }}
                >
                  <div className="absolute inset-0 bg-white/20"></div>
                </div>
              </div>

              <input 
                type="range" min="0" max="100" value={battery} 
                onChange={(e) => setBattery(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              
              <div 
                className="absolute h-6 w-6 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] border-2 border-slate-900 pointer-events-none transition-all duration-100 z-10"
                style={{ left: `calc(${battery}% - 12px)` }}
              ></div>
            </div>
          </div>
        </div>

        {/* === RIGHT PANEL: CONTROLS === */}
        <div className="w-full md:w-3/5 p-8 md:p-12 bg-slate-900/30 flex flex-col gap-10 overflow-y-auto custom-scrollbar">
          
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block flex items-center gap-2">
              <span className="w-1 h-1 bg-indigo-500 rounded-full"></span> Select Vibe
            </label>
            <div className="grid grid-cols-7 gap-3">
              {moods.map((m) => (
                <button 
                  key={m} 
                  onClick={() => setMood(m)}
                  className={`aspect-square rounded-2xl text-2xl md:text-3xl flex items-center justify-center transition-all duration-200 border border-transparent ${
                    mood === m 
                      ? 'bg-white/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)] scale-110 -translate-y-1' 
                      : 'bg-slate-800/50 hover:bg-slate-700 grayscale opacity-40 hover:opacity-100 hover:grayscale-0'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block flex items-center gap-2">
              <span className="w-1 h-1 bg-indigo-500 rounded-full"></span> Primary Driver <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {pressureOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setPressureSource(opt.label)}
                  className={`px-4 py-3 rounded-xl text-xs md:text-sm font-bold border transition-all duration-200 flex items-center gap-2 ${
                    pressureSource === opt.label 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg scale-105' 
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg opacity-80">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-[160px] flex flex-col">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block flex items-center gap-2">
              <span className="w-1 h-1 bg-indigo-500 rounded-full"></span> Notes <span className="text-slate-600 text-[10px] normal-case ml-1 border border-slate-700 px-1 rounded">AI Sentiment Analysis Active</span>
            </label>
            <textarea 
              className="flex-1 w-full p-5 bg-slate-800/50 border border-slate-700 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-slate-800/80 focus:shadow-[0_0_30px_rgba(99,102,241,0.1)] transition-all resize-none text-slate-200 placeholder-slate-600 text-sm leading-relaxed font-medium"
              placeholder={`Anything on ${currentUser.name.split(' ')[0]}'s mind?`}
              value={ventText}
              onChange={(e) => setVentText(e.target.value)}
            />
          </div>

          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full py-5 rounded-2xl font-bold text-lg tracking-wide shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${
              isLoading 
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-900/30 hover:shadow-indigo-900/50'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Syncing...
              </>
            ) : 'Update Status'}
          </button>

        </div>
      </div>
    </div>
  );
};

export default VibeCheck;