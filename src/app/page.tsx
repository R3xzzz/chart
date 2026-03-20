'use client';

import { useState } from 'react';
import { Search, PlaneTakeoff, PlaneLanding, AlertCircle, FileText, ShieldCheck } from 'lucide-react';
import ChartCard from '@/components/ChartCard';
import ChartViewerModal from '@/components/ChartViewerModal';
import SkeletonCard from '@/components/SkeletonCard';
import AdminPanel from '@/components/AdminPanel';

type ChartClientNode = {
  _id: string;
  icao: string;
  fileUrl: string;
  originalName?: string;
  createdAt: string;
};

export default function Home() {
  const [depInput, setDepInput] = useState('');
  const [arrInput, setArrInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [depCharts, setDepCharts] = useState<ChartClientNode[]>([]);
  const [arrCharts, setArrCharts] = useState<ChartClientNode[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerData, setViewerData] = useState<{ url: string | null; title: string }>({ url: null, title: '' });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let dep = depInput.trim().toUpperCase();
    let arr = arrInput.trim().toUpperCase();

    // Flexible inputs parsing logic ex "WIII WSSS" or "WIII-WSSS"
    if (dep && !arr && (dep.match(/[\s-]+/))) {
      const parts = dep.split(/[\s-]+/).filter(Boolean);
      if (parts.length >= 2) {
        dep = parts[0];
        arr = parts[1];
        setDepInput(dep);
        setArrInput(arr);
      }
    }

    if (!dep && !arr) {
      setError('Please enter at least one ICAO code.');
      return;
    }

    const ICAO_REGEX = /^[A-Z]{4}$/;
    if (dep && !ICAO_REGEX.test(dep)) {
      setError('Departure ICAO must be exactly 4 letters.');
      return;
    }
    if (arr && !ICAO_REGEX.test(arr)) {
      setError('Arrival ICAO must be exactly 4 letters.');
      return;
    }

    setError('');
    setLoading(true);
    setHasSearched(true);
    
    setDepCharts([]);
    setArrCharts([]);

    try {
      const url = new URL('/api/charts/route', window.location.origin);
      if (dep) url.searchParams.append('dep', dep);
      if (arr) url.searchParams.append('arr', arr);

      const res = await fetch(url.toString());
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch charts');

      setDepCharts(data.departureCharts || []);
      setArrCharts(data.arrivalCharts || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openViewer = (chart: ChartClientNode) => {
    setViewerData({
      url: chart.fileUrl,
      title: chart.originalName || `Chart for ${chart.icao}`
    });
    setViewerOpen(true);
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center w-full">
      <section className="w-full bg-slate-900 border-b border-slate-800 pt-16 pb-12 px-4 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-6">
          <PlaneTakeoff className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-white tracking-tight">Chart Viewer</h1>
        </div>
        
        <form onSubmit={handleSearch} className="w-full max-w-2xl bg-slate-950 p-2 sm:p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <PlaneTakeoff className="w-5 h-5 text-slate-500" />
            </div>
            <input 
              type="text" 
              placeholder="Departure (e.g. WIII)" 
              value={depInput}
              onChange={(e) => setDepInput(e.target.value.toUpperCase())}
              className="w-full bg-slate-900 border border-slate-800 text-white text-lg rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600 uppercase"
              maxLength={9}
            />
          </div>
          
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <PlaneLanding className="w-5 h-5 text-slate-500" />
            </div>
            <input 
              type="text" 
              placeholder="Arrival (e.g. WSSS)" 
              value={arrInput}
              onChange={(e) => setArrInput(e.target.value.toUpperCase())}
              className="w-full bg-slate-900 border border-slate-800 text-white text-lg rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-600 uppercase"
              maxLength={4}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 py-3 font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </section>

      <section className="w-full max-w-7xl mx-auto p-4 sm:p-6 flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 mt-4 mb-8">
        
        {/* Departure Charts */}
        <div className="flex-1 flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <PlaneTakeoff className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold text-slate-100">Departure</h2>
            </div>
            {depInput && !loading && <span className="bg-slate-800 text-blue-400 px-3 py-1 rounded-full text-sm font-mono tracking-wider font-bold">{depInput}</span>}
          </div>
          
          <div className="flex-1 bg-slate-900/40 rounded-2xl border border-slate-800/50 p-4 sm:p-6 min-h-[400px]">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <SkeletonCard key={`dep-skel-${i}`} />)}
              </div>
            ) : hasSearched && depCharts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3 py-10 opacity-60">
                <FileText className="w-12 h-12 opacity-40" />
                <p>No charts found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {depCharts.map(chart => (
                  <ChartCard 
                    key={chart._id}
                    icao={chart.icao}
                    fileUrl={chart.fileUrl}
                    originalName={chart.originalName}
                    onClick={() => openViewer(chart)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Arrival Charts */}
        <div className="flex-1 flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <PlaneLanding className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl font-semibold text-slate-100">Arrival</h2>
            </div>
            {arrInput && !loading && <span className="bg-slate-800 text-emerald-400 px-3 py-1 rounded-full text-sm font-mono tracking-wider font-bold">{arrInput}</span>}
          </div>
          
          <div className="flex-1 bg-slate-900/40 rounded-2xl border border-slate-800/50 p-4 sm:p-6 min-h-[400px]">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <SkeletonCard key={`arr-skel-${i}`} />)}
              </div>
            ) : hasSearched && arrCharts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3 py-10 opacity-60">
                <FileText className="w-12 h-12 opacity-40" />
                <p>No charts found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {arrCharts.map(chart => (
                  <ChartCard 
                    key={chart._id}
                    icao={chart.icao}
                    fileUrl={chart.fileUrl}
                    originalName={chart.originalName}
                    onClick={() => openViewer(chart)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      </section>

      {/* Admin Panel Integrated into Public View */}
      <section className="w-full bg-slate-900 border-t border-slate-800 py-12 px-4 shadow-inner mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
            <h2 className="text-2xl font-bold text-white tracking-tight">Chart Management Dashboard</h2>
          </div>
          <p className="text-slate-400 mb-8 max-w-2xl">
            You can add new charts and manage existing ones below. Ensure the URL links directly to the PDF or Image file.
          </p>
          
          <AdminPanel />
        </div>
      </section>

      <ChartViewerModal 
        isOpen={viewerOpen} 
        onClose={() => setViewerOpen(false)} 
        fileUrl={viewerData.url} 
        title={viewerData.title} 
      />
    </main>
  );
}
