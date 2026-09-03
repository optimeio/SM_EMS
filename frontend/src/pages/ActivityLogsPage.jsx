import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { History, Search, Clock, Shield } from 'lucide-react';

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/activity-logs');
      setLogs(data);
    } catch (err) {
      console.error('Failed to load activity logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    return (
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Audit Log</h1>
          <p className="text-sm text-slate-500 mt-1">Chronological stream of system activities, personnel updates, and task status changes.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card-saas p-4">
        <div className="relative">
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search audit stream by action or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-saas w-full pl-10 text-sm"
          />
        </div>
      </div>

      {/* Activity Timeline */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent"></div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="card-saas text-center py-16 space-y-3">
          <History className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No activity logs recorded</h3>
          <p className="text-xs text-slate-500">System actions will automatically be recorded here.</p>
        </div>
      ) : (
        <div className="card-saas p-6">
          <div className="relative border-l border-slate-200 ml-4 space-y-6 py-1">
            {filteredLogs.map((log) => (
              <div key={log._id} className="relative pl-6 group">
                {/* Timeline Dot */}
                <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-slate-900 ring-4 ring-white"></div>
                
                {/* Event Card */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-1.5 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-sm font-bold text-slate-900">{log.action}</span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-normal leading-relaxed">{log.description}</p>
                  
                  {/* Actor Tag */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500 font-medium font-mono uppercase">
                      {log.performedBy}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogsPage;
