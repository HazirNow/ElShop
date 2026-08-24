import React from 'react';

export const AdminKpiSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 bg-slate-800 rounded"></div>
            <div className="w-8 h-8 rounded-xl bg-slate-800"></div>
          </div>
          <div className="h-7 w-28 bg-slate-800 rounded"></div>
          <div className="h-2.5 w-36 bg-slate-800 rounded"></div>
        </div>
      ))}
    </div>
  );
};

export const AdminTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 animate-pulse">
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div className="h-5 w-40 bg-slate-800 rounded"></div>
        <div className="h-8 w-48 bg-slate-800 rounded-xl"></div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-850 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800"></div>
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-slate-800 rounded"></div>
                <div className="h-3 w-24 bg-slate-800/60 rounded"></div>
              </div>
            </div>
            <div className="h-5 w-20 bg-slate-800 rounded-full"></div>
            <div className="h-4 w-16 bg-slate-800 rounded"></div>
            <div className="h-7 w-24 bg-slate-800 rounded-lg"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
