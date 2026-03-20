'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, RefreshCw } from 'lucide-react';
import { isIframeUrl } from '@/lib/fileUtils';

type ChartNode = {
  _id: string;
  icao: string;
  fileUrl: string;
  originalName?: string;
  createdAt: string;
};

export default function AdminPanel() {
  const [charts, setCharts] = useState<ChartNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formIcao, setFormIcao] = useState('');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formName, setFormName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCharts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/charts');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCharts(data.charts || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharts();
  }, []);

  const resetForm = () => {
    setIsEditing(null);
    setFormIcao('');
    setFormFileUrl('');
    setFormName('');
    setError('');
  };

  const handleEdit = (chart: ChartNode) => {
    setIsEditing(chart._id);
    setFormIcao(chart.icao);
    setFormFileUrl(chart.fileUrl);
    setFormName(chart.originalName || '');
    
    // Smooth scroll to form if needed
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chart?')) return;
    
    try {
      const res = await fetch(`/api/charts/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setCharts(prev => prev.filter(c => c._id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const icao = formIcao.trim().toUpperCase();
    if (icao.length !== 4) {
      setError('ICAO must be exactly 4 letters.');
      return;
    }
    
    setSubmitting(true);
    try {
      if (isEditing) {
        const res = await fetch(`/api/charts/${isEditing}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ icao, fileUrl: formFileUrl, originalName: formName })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        setCharts(prev => prev.map(c => c._id === isEditing ? data.chart : c));
      } else {
        const res = await fetch('/api/charts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ icao, fileUrl: formFileUrl, originalName: formName })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        setCharts([data.chart, ...charts]);
      }
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Form Section */}
      <section className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-6">
          {isEditing ? 'Edit Chart' : 'Add New Chart'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">ICAO Code</label>
              <input 
                type="text" 
                required
                maxLength={4}
                value={formIcao}
                onChange={e => setFormIcao(e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-mono"
                placeholder="WIII"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Chart Name (Optional)</label>
              <input 
                type="text" 
                value={formName}
                onChange={e => setFormName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="SID HALIM 1A"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-1">File URL</label>
              <input 
                type="url" 
                required
                value={formFileUrl}
                onChange={e => setFormFileUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="https://example.com/chart.pdf"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

          <div className="flex items-center gap-3 pt-4 border-t border-slate-800 mt-4">
            <button 
              type="submit" 
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Update Chart' : 'Save Chart'}
            </button>
            
            {isEditing && (
              <button 
                type="button" 
                onClick={resetForm}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                disabled={submitting}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* List Section */}
      <section className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative min-h-[400px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Managed Charts</h2>
          <button 
            onClick={fetchCharts}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto text-left">
          <table className="w-full text-sm text-slate-300">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium rounded-tl-lg text-left">ICAO</th>
                <th className="px-4 py-3 font-medium text-left">Name</th>
                <th className="px-4 py-3 font-medium text-left">Type</th>
                <th className="px-4 py-3 font-medium text-right rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">Loading charts...</td>
                </tr>
              ) : charts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No charts available. Add some above.</td>
                </tr>
              ) : (
                charts.map(chart => {
                  const isIframe = isIframeUrl(chart.fileUrl);
                  return (
                    <tr key={chart._id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-emerald-400">{chart.icao}</td>
                      <td className="px-4 py-3">{chart.originalName || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${isIframe ? 'bg-indigo-500/10 text-indigo-400' : 'bg-blue-500/10 text-blue-400'}`}>
                          {isIframe ? 'Document/Frame' : 'Image'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(chart)}
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors inline-block"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <a 
                            href={chart.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors inline-block"
                            title="View File"
                          >
                            View
                          </a>
                          <button 
                            onClick={() => handleDelete(chart._id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors inline-block"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
