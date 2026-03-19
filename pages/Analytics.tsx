
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Activity, Leaf } from 'lucide-react';

const data = [
  { name: 'Mon', logins: 400, registration: 240, amt: 2400 },
  { name: 'Tue', logins: 300, registration: 139, amt: 2210 },
  { name: 'Wed', logins: 200, registration: 980, amt: 2290 },
  { name: 'Thu', logins: 278, registration: 390, amt: 2000 },
  { name: 'Fri', logins: 189, registration: 480, amt: 2181 },
  { name: 'Sat', logins: 239, registration: 380, amt: 2500 },
  { name: 'Sun', logins: 349, registration: 430, amt: 2100 },
];

const carbonTrendData = [
  { name: 'Jan', averageScore: 65, totalSavings: 120 },
  { name: 'Feb', averageScore: 68, totalSavings: 150 },
  { name: 'Mar', averageScore: 72, totalSavings: 210 },
  { name: 'Apr', averageScore: 75, totalSavings: 280 },
  { name: 'May', averageScore: 82, totalSavings: 350 },
  { name: 'Jun', averageScore: 88, totalSavings: 420 },
];

const Analytics: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="text-emerald-600" /> System Analytics
        </h1>
        <p className="text-gray-600">Real-time usage and environmental impact metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Marketplace Carbon Trends */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-500" /> Marketplace Carbon Trends
            </h3>
            <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded font-bold">Monthly</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={carbonTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Line type="monotone" dataKey="averageScore" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="totalSavings" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Eco Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Savings (kg)</span>
            </div>
          </div>
        </div>

        {/* Registration Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" /> Registration Growth
            </h3>
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">Weekly</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="registration" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Login Activity */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" /> Auth Traffic
            </h3>
            <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded font-bold">Real-time</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                   cursor={{fill: '#f8fafc'}}
                   contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="logins" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-emerald-900 rounded-xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                  <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">Total Hits</div>
                  <div className="text-4xl font-bold mb-1">28,492</div>
                  <div className="text-sm text-emerald-200">Across all microservices</div>
              </div>
              <div>
                  <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">Security Events</div>
                  <div className="text-4xl font-bold mb-1">0</div>
                  <div className="text-sm text-emerald-200">Unauthorized attempts blocked</div>
              </div>
              <div>
                  <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">DB Latency</div>
                  <div className="text-4xl font-bold mb-1">12ms</div>
                  <div className="text-sm text-emerald-200">Average response time</div>
              </div>
          </div>
          <div className="absolute bottom-0 right-0 h-32 w-32 bg-emerald-800/50 rounded-full -mr-10 -mb-10 blur-xl"></div>
      </div>
    </div>
  );
};

export default Analytics;
