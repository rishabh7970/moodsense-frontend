import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
   CartesianGrid, PieChart, Pie, Legend, ReferenceLine, AreaChart, Area
} from 'recharts';

// --- CONFIGURATION ---
const DRIVER_MAP = {
  "Deadlines": { icon: "⏰", color: "#ef4444" },
  "Workload": { icon: "📚", color: "#f97316" },
  "Management": { icon: "👔", color: "#8b5cf6" },
  "Pay/Comp": { icon: "💰", color: "#eab308" },
  "Team": { icon: "🗣️", color: "#3b82f6" },
  "Personal": { icon: "🏠", color: "#ec4899" },
  "All Good": { icon: "✅", color: "#10b981" },
  "Unknown": { icon: "❓", color: "#475569" }
};


const HRDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [driverStats, setDriverStats] = useState([]); 
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [showTeamView, setShowTeamView] = useState(false);
  const [chartTab, setChartTab] = useState('energy'); 
  const [viewMode, setViewMode] = useState('overview'); // New: 'overview' or 'history'

  const refreshData = useCallback(() => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    axios.get(`${API_URL}/api/hr-dashboard`)
      .then(res => {
        const rawEmps = res.data.employees || [];
        const sortedEmps = [...rawEmps].sort((a, b) => 
          a.dept.localeCompare(b.dept) || a.name.localeCompare(b.name)
        );

        setEmployees(sortedEmps);
        setDeptData(res.data.department_data || []);

        const statsMap = {};
        rawEmps.forEach(e => {
          const driver = e.primary_driver || e.pressure_source || "Unknown"; 
          if (!statsMap[driver]) statsMap[driver] = 0;
          statsMap[driver] += 1;
        });

        const formattedStats = Object.keys(statsMap).map(key => ({
          name: key,
          value: statsMap[key],
          color: DRIVER_MAP[key]?.color || "#94a3b8" 
        }));

        setDriverStats(formattedStats);

        if (!selectedEmp && sortedEmps.length > 0) {
          const highRisk = sortedEmps.find(e => e.risk_status === 'High Risk');
          setSelectedEmp(highRisk || sortedEmps[0]);
        }
      })
      .catch(err => {
        console.error("Error fetching HR data:", err);
      });
  }, [selectedEmp]);

  useEffect(() => { 
    refreshData(); 
  }, [refreshData]);

  const handleAction = (action) => {
    if (!selectedEmp) return;
    alert(`⚡ Action Triggered: ${action} for ${selectedEmp.name}`);
  };

  // --- CUSTOM TOOLTIPS ---
  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-indigo-500/30 p-4 rounded-xl shadow-2xl backdrop-blur-md min-w-[200px]">
          <div className="flex justify-between items-start mb-2 border-b border-white/10 pb-2">
            <div>
              <p className="text-white font-black text-sm">{data.name}</p>
              <p className="text-indigo-300 text-[10px] uppercase font-bold tracking-wider">{data.dept}</p>
            </div>
            <span className="text-xl">{DRIVER_MAP[data.primary_driver]?.icon}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Energy:</span>
              <span className={`font-black font-mono ${data.avg_battery < 30 ? 'text-red-400' : 'text-emerald-400'}`}>
                {data.avg_battery}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl z-50">
          <p className="text-white text-xs font-bold flex items-center gap-2 mb-1">
            <span className="text-lg">{DRIVER_MAP[data.name]?.icon || '❓'}</span> 
            {data.name}
          </p>
          <div className="flex justify-between items-center gap-4">
             <span className="text-slate-400 text-xs">Impact</span>
             <span className="font-mono font-bold text-white text-sm">{data.value} Emps</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-screen w-full bg-slate-900 text-slate-200 font-sans overflow-hidden relative flex flex-col">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none"></div>
      
      <header className="relative z-10 px-6 py-4 flex justify-between items-center border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">🧠</div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight">MOOD<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">SENSE</span></h1>
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Admin Command</p>
          </div>
        </div>
        <button onClick={refreshData} className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg border border-white/10 transition-all hover:scale-105 active:scale-95">↻ Sync</button>
      </header>

      <div className="relative z-10 flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* LEFT PANEL: LIVE ROSTER */}
        <div className="lg:col-span-4 bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden flex flex-col shadow-2xl">
          <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Live Roster</h3>
              <span className="bg-indigo-500 text-white px-2 py-0.5 rounded text-[10px] font-bold">{employees.length} Active</span>
          </div>
          <div className="overflow-y-auto flex-1 p-2 custom-scrollbar space-y-1">
            {employees.map((emp) => (
              <div 
                key={emp.id} 
                onClick={() => { setSelectedEmp(emp); setViewMode('overview'); }}
                className={`group cursor-pointer p-3 rounded-xl transition-all duration-200 border border-transparent flex items-center gap-3 ${
                  selectedEmp?.id === emp.id ? 'bg-indigo-600/20 border-indigo-500/50 shadow-lg' : 'hover:bg-white/5'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                   selectedEmp?.id === emp.id ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'
                }`}>
                  {emp.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-center">
                     <span className={`font-bold text-sm ${selectedEmp?.id === emp.id ? 'text-white' : 'text-slate-300'}`}>{emp.name}</span>
                     <span className="text-xs">{DRIVER_MAP[emp.primary_driver]?.icon}</span>
                   </div>
                   <div className="w-full bg-slate-700/50 rounded-full h-1 mt-1.5 overflow-hidden">
                      <div className={`h-full rounded-full ${emp.avg_battery < 30 ? 'bg-red-500' : (emp.avg_battery > 70 ? 'bg-emerald-400' : 'bg-amber-400')}`} style={{width: `${emp.avg_battery}%`}}></div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: CONTENT */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
          
          {/* TEAM PULSE BOX */}
          <div className="h-[300px] bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-white/10 p-5 flex flex-col shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-2 relative z-20">
              <div>
                <h3 className="text-lg font-black text-white">Team Pulse</h3>
                <p className="text-slate-400 text-xs">Global metrics & drivers.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-slate-900/80 p-1 rounded-lg flex gap-1 border border-white/10">
                  <button onClick={() => setChartTab('energy')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${chartTab === 'energy' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>⚡ Energy</button>
                  <button onClick={() => setChartTab('drivers')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${chartTab === 'drivers' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>🎯 Drivers</button>
                </div>
                <button onClick={() => setShowTeamView(true)} className="w-9 h-9 flex items-center justify-center bg-slate-700/50 hover:bg-indigo-50 text-slate-300 hover:text-indigo-600 rounded-lg border border-white/10 transition-all active:scale-95 shadow-lg">⤢</button>
              </div>
            </div>
            <div className="flex-1 w-full min-h-0 relative z-10">
              {chartTab === 'energy' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip content={<CustomBarTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Bar dataKey="energy" radius={[4, 4, 4, 4]}>
                      {deptData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.energy < 40 ? '#f87171' : (entry.energy > 75 ? '#34d399' : '#818cf8')} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={driverStats} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="name" stroke="none">
                      {driverStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend verticalAlign="middle" align="right" layout="vertical" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* INDIVIDUAL INSIGHTS BOX */}
          <div className="flex-1 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-dashed border-slate-700/50 relative overflow-hidden">
            {selectedEmp ? (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-3xl font-black text-white">{selectedEmp.name}</h2>
                    <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">{selectedEmp.role} • {selectedEmp.dept}</p>
                  </div>
                  <div className="flex gap-2">
                     <button 
                        onClick={() => setViewMode(viewMode === 'overview' ? 'history' : 'overview')}
                        className="bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 px-3 py-1 rounded-full text-[10px] font-black uppercase hover:bg-indigo-500 hover:text-white transition-all"
                     >
                        {viewMode === 'overview' ? '📜 View Full History' : '⬅ Back to Stats'}
                     </button>
                  </div>
                </div>

                {viewMode === 'overview' ? (
                  // --- OVERVIEW MODE ---
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <div className="flex flex-col gap-3">
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-slate-800 border border-white/10 shadow-inner">
                           {DRIVER_MAP[selectedEmp.primary_driver]?.icon || '❓'}
                         </div>
                         <div>
                           <div className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Primary Driver</div>
                           <div className="text-lg font-black text-white leading-tight">{selectedEmp.primary_driver || "Unknown"}</div>
                         </div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase font-black mb-1">Energy Level</div>
                        <div className="flex items-end gap-2">
                           <span className={`text-3xl font-black ${selectedEmp.avg_battery < 30 ? 'text-red-400' : 'text-emerald-400'}`}>{selectedEmp.avg_battery}%</span>
                           <span className="text-[10px] text-slate-400 mb-1">Avg per week</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <button onClick={() => handleAction('Kudos')} className="flex-1 bg-white text-indigo-900 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 shadow-lg transition-transform active:scale-95">👏 Kudos</button>
                        <button onClick={() => handleAction('Meeting')} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 shadow-lg transition-transform active:scale-95">📅 Sync</button>
                      </div>
                    </div>
                    <div className="bg-black/40 rounded-2xl p-4 border border-white/5 relative group">
                        <div className="absolute top-4 left-4 text-[10px] font-black text-indigo-400 uppercase">Trajectory</div>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={selectedEmp.history || []}>
                             <defs>
                                <linearGradient id="colorBatt" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '10px'}} />
                             <Area type="monotone" dataKey="battery" stroke="#818cf8" strokeWidth={3} fill="url(#colorBatt)" />
                          </AreaChart>
                        </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  // --- HISTORY LIST MODE ---
                  <div className="flex-1 bg-black/30 rounded-2xl border border-white/5 overflow-hidden flex flex-col">
                    <div className="p-3 bg-white/5 border-b border-white/5 flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                       <span>Time Log</span>
                       <span>Energy</span>
                       <span>Driver</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                       {(selectedEmp.history || []).slice().reverse().map((entry, idx) => (
                         <div key={idx} className="bg-slate-800/50 p-3 rounded-xl border border-white/5 flex justify-between items-center group hover:bg-slate-800 transition-colors">
                            <div className="flex flex-col">
                               <span className="text-xs font-bold text-white">{new Date(entry.timestamp || Date.now()).toLocaleDateString()}</span>
                               <span className="text-[10px] text-slate-500">{new Date(entry.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div className="flex items-center gap-2">
                               <div className="w-16 bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-indigo-400 h-full" style={{width: `${entry.battery}%`}}></div>
                               </div>
                               <span className="text-xs font-mono font-bold text-indigo-300 w-8 text-right">{entry.battery}%</span>
                            </div>
                            <div className="flex items-center gap-2 min-w-[100px] justify-end">
                               <span className="text-xs text-slate-300">{entry.primary_driver || 'All Good'}</span>
                               <span>{DRIVER_MAP[entry.primary_driver]?.icon || '✅'}</span>
                            </div>
                         </div>
                       ))}
                       {(!selectedEmp.history || selectedEmp.history.length === 0) && (
                         <div className="h-full flex items-center justify-center text-slate-500 text-sm">No history logs found.</div>
                       )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                 <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-3xl opacity-50">👤</div>
                 <p className="font-bold uppercase text-xs tracking-widest">Select an employee to see deep insights</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL VIEW (TEAM OVERVIEW) */}
      {showTeamView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
           <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setShowTeamView(false)}></div>
           <div className="relative bg-slate-900 w-full max-w-6xl h-full rounded-3xl border border-white/10 p-8 flex flex-col shadow-2xl">
              <button onClick={() => setShowTeamView(false)} className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">✕</button>
              <h2 className="text-2xl font-black text-white mb-6">Global Driver Analysis</h2>
              <div className="flex-1 grid grid-cols-2 gap-8 min-h-0">
                 <div className="bg-slate-950/50 rounded-2xl p-6 border border-white/5 flex flex-col">
                    <h3 className="text-white font-bold mb-4">Sentiment Distribution</h3>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={driverStats} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" nameKey="name">
                             {driverStats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <Tooltip content={<CustomPieTooltip />} />
                          <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{paddingTop: '20px'}} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
                 <div className="bg-slate-950/50 rounded-2xl p-6 border border-white/5 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                       <h3 className="text-white font-bold">Energy Distribution</h3>
                       <div className="flex gap-4 text-[10px] font-bold uppercase text-slate-500">
                          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-400 rounded-full"></div>Burnout Risk</span>
                          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-400 rounded-full"></div>Optimal</span>
                       </div>
                    </div>
                    <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={employees} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                             <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                             <XAxis dataKey="name" stroke="#475569" angle={-45} textAnchor="end" height={80} tick={{fontSize: 10}} interval={0}/>
                             <YAxis stroke="#475569" domain={[0, 100]} />
                             <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'RISK', position: 'right', fill: '#ef4444', fontSize: 10 }} />
                             <ReferenceLine y={75} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'GOAL', position: 'right', fill: '#10b981', fontSize: 10 }} />
                             <Tooltip content={<CustomBarTooltip />} cursor={{fill: 'rgba(255,255,255,0.03)'}} />
                             <Bar dataKey="avg_battery" radius={[4, 4, 0, 0]}>
                                {employees.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.avg_battery < 30 ? '#ef4444' : (entry.avg_battery > 70 ? '#10b981' : '#f59e0b')} />
                                ))}
                             </Bar>
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;