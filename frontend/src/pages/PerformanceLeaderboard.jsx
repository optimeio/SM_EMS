import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { 
  Trophy, 
  Award, 
  Search
} from 'lucide-react';

const PerformanceLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/performance/leaderboard');
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to load leaderboard', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = leaderboard.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'All' || emp.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  const getRankBadge = (index) => {
    switch (index) {
      case 0:
        return (
          <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 border border-amber-300/80 flex items-center justify-center font-bold text-sm shrink-0 tabular-nums">
            1
          </span>
        );
      case 1:
        return (
          <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 border border-slate-300/80 flex items-center justify-center font-bold text-sm shrink-0 tabular-nums">
            2
          </span>
        );
      case 2:
        return (
          <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center font-bold text-sm shrink-0 tabular-nums">
            3
          </span>
        );
      default:
        return (
          <span className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 border border-slate-200/60 flex items-center justify-center font-semibold text-sm shrink-0 tabular-nums">
            {index + 1}
          </span>
        );
    }
  };

  const departments = ['Marketing', 'Telecalling', 'IT'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Performance Rankings</h1>
          <p className="text-sm text-slate-500 mt-1">Workforce rankings and cumulative points awarded for completed tasks.</p>
        </div>
      </div>

      <div className="card-saas grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <div className="md:col-span-2 relative">
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search leaderboard by employee name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-saas w-full pl-10 text-sm"
          />
        </div>

        <div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="input-saas text-sm w-full"
          >
            <option value="All">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent"></div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="card-saas text-center py-16 space-y-3">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No leaderboard records found</h3>
          <p className="text-xs text-slate-500">Complete tasks to accumulate performance points.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredData.map((emp, index) => (
            <div
              key={emp._id}
              className="card-saas flex items-center justify-between p-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center gap-4">
                {getRankBadge(index)}

                <div className="flex items-center gap-3.5">
                  {emp.profilePhoto ? (
                    <img
                      src={emp.profilePhoto}
                      alt={emp.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                      {emp.name[0]}
                    </div>
                  )}

                  <div>
                    <div className="font-bold text-base text-slate-900 flex items-center gap-2">
                      {emp.name}
                      <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 font-semibold">
                        {emp.employeeId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {emp.designation} • <span className="text-slate-700 font-semibold">{emp.department}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-lg font-bold text-sm tabular-nums">
                  <Award className="w-4 h-4 text-amber-600" />
                  {emp.totalPoints} Pts
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PerformanceLeaderboard;
