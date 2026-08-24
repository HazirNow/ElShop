import React from 'react';
import { motion } from 'motion/react';

interface FintechSkeletonProps {
  mode?: 'merchant' | 'customer';
  isRtl?: boolean;
}

export const FintechSkeletonLoader: React.FC<FintechSkeletonProps> = ({
  mode = 'merchant',
  isRtl = false,
}) => {
  const shimmerVariant = {
    initial: { opacity: 0.55 },
    animate: {
      opacity: [0.45, 0.9, 0.45],
      transition: {
        duration: 1.6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  if (mode === 'customer') {
    return (
      <div
        className="w-full bg-[#f8fafc] text-slate-900 min-h-[700px] rounded-3xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Customer Top Bar Header Skeleton */}
        <div className="bg-[#0B6E4F] p-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <motion.div
              variants={shimmerVariant}
              initial="initial"
              animate="animate"
              className="w-11 h-11 rounded-2xl bg-white/20"
            />
            <div className="space-y-1.5">
              <motion.div
                variants={shimmerVariant}
                initial="initial"
                animate="animate"
                className="w-36 h-4 rounded-md bg-white/30"
              />
              <motion.div
                variants={shimmerVariant}
                initial="initial"
                animate="animate"
                className="w-24 h-3 rounded-md bg-white/20"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              variants={shimmerVariant}
              initial="initial"
              animate="animate"
              className="w-20 h-8 rounded-full bg-white/20"
            />
            <motion.div
              variants={shimmerVariant}
              initial="initial"
              animate="animate"
              className="w-24 h-8 rounded-full bg-amber-400/40"
            />
          </div>
        </div>

        {/* Khata Credit / Account Summary Pill */}
        <div className="bg-emerald-50/80 border-b border-emerald-100 p-3.5 px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              variants={shimmerVariant}
              initial="initial"
              animate="animate"
              className="w-8 h-8 rounded-xl bg-emerald-200/60"
            />
            <div className="space-y-1">
              <motion.div
                variants={shimmerVariant}
                initial="initial"
                animate="animate"
                className="w-32 h-3.5 rounded bg-emerald-200/70"
              />
              <motion.div
                variants={shimmerVariant}
                initial="initial"
                animate="animate"
                className="w-48 h-2.5 rounded bg-emerald-100"
              />
            </div>
          </div>
          <motion.div
            variants={shimmerVariant}
            initial="initial"
            animate="animate"
            className="w-28 h-6 rounded-lg bg-emerald-200/60"
          />
        </div>

        {/* Search & Category Pills */}
        <div className="p-4 bg-white border-b border-slate-100 space-y-3">
          <motion.div
            variants={shimmerVariant}
            initial="initial"
            animate="animate"
            className="w-full h-11 rounded-2xl bg-slate-100"
          />
          <div className="flex items-center gap-2 overflow-hidden">
            {[64, 96, 80, 110, 88].map((w, idx) => (
              <motion.div
                key={idx}
                variants={shimmerVariant}
                initial="initial"
                animate="animate"
                style={{ width: `${w}px` }}
                className="h-8 rounded-xl bg-slate-100 shrink-0"
              />
            ))}
          </div>
        </div>

        {/* Product Catalogue Grid Skeleton */}
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 flex-1">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div
              key={item}
              className="bg-white rounded-2xl border border-slate-150 p-3 shadow-xs flex flex-col justify-between space-y-3"
            >
              <motion.div
                variants={shimmerVariant}
                initial="initial"
                animate="animate"
                className="w-full h-28 rounded-xl bg-slate-100"
              />
              <div className="space-y-1.5">
                <motion.div
                  variants={shimmerVariant}
                  initial="initial"
                  animate="animate"
                  className="w-3/4 h-3.5 rounded bg-slate-200"
                />
                <motion.div
                  variants={shimmerVariant}
                  initial="initial"
                  animate="animate"
                  className="w-1/2 h-2.5 rounded bg-slate-100"
                />
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <motion.div
                  variants={shimmerVariant}
                  initial="initial"
                  animate="animate"
                  className="w-16 h-4 rounded bg-emerald-100"
                />
                <motion.div
                  variants={shimmerVariant}
                  initial="initial"
                  animate="animate"
                  className="w-8 h-8 rounded-xl bg-emerald-600/30"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Merchant Terminal Fintech Skeleton
  return (
    <div
      className="w-full bg-slate-900 text-slate-100 min-h-[750px] p-4 font-sans rounded-3xl shadow-xl flex flex-col border border-slate-800"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Merchant Header Bar Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <motion.div
            variants={shimmerVariant}
            initial="initial"
            animate="animate"
            className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700"
          />
          <div className="space-y-1.5">
            <motion.div
              variants={shimmerVariant}
              initial="initial"
              animate="animate"
              className="w-48 h-5 rounded-md bg-slate-800"
            />
            <motion.div
              variants={shimmerVariant}
              initial="initial"
              animate="animate"
              className="w-32 h-3.5 rounded-md bg-slate-800/80"
            />
          </div>
        </div>

        {/* Navigation Tabs Pill Skeleton */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          {[80, 88, 92, 90, 80].map((w, idx) => (
            <motion.div
              key={idx}
              variants={shimmerVariant}
              initial="initial"
              animate="animate"
              style={{ width: `${w}px` }}
              className="h-8 rounded-xl bg-slate-800/90 shrink-0"
            />
          ))}
        </div>
      </div>

      {/* Fintech Metrics / KPI Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
        {[
          { color: 'bg-emerald-950/40 border-emerald-800/40' },
          { color: 'bg-indigo-950/40 border-indigo-800/40' },
          { color: 'bg-amber-950/40 border-amber-800/40' },
          { color: 'bg-purple-950/40 border-purple-800/40' },
        ].map((card, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border ${card.color} bg-slate-900/60 shadow-sm space-y-2`}
          >
            <div className="flex items-center justify-between">
              <motion.div
                variants={shimmerVariant}
                initial="initial"
                animate="animate"
                className="w-20 h-3 rounded bg-slate-700/60"
              />
              <motion.div
                variants={shimmerVariant}
                initial="initial"
                animate="animate"
                className="w-5 h-5 rounded-lg bg-slate-800"
              />
            </div>
            <motion.div
              variants={shimmerVariant}
              initial="initial"
              animate="animate"
              className="w-28 h-6 rounded-md bg-slate-700/80"
            />
            <motion.div
              variants={shimmerVariant}
              initial="initial"
              animate="animate"
              className="w-36 h-2.5 rounded bg-slate-800"
            />
          </div>
        ))}
      </div>

      {/* Live Kanban Orders Board Columns Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 mt-2">
        {['Placed (New)', 'Accepted', 'Packed', 'Dispatched'].map((col, idx) => (
          <div
            key={idx}
            className="bg-slate-950/70 rounded-2xl border border-slate-800/90 p-3.5 flex flex-col space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <motion.div
                variants={shimmerVariant}
                initial="initial"
                animate="animate"
                className="w-24 h-4 rounded bg-slate-800"
              />
              <motion.div
                variants={shimmerVariant}
                initial="initial"
                animate="animate"
                className="w-6 h-5 rounded-full bg-slate-800"
              />
            </div>

            {/* Order Card Skeletons */}
            {[1, 2].map((ord) => (
              <div
                key={ord}
                className="bg-slate-900/90 rounded-xl border border-slate-800 p-3 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <motion.div
                    variants={shimmerVariant}
                    initial="initial"
                    animate="animate"
                    className="w-16 h-3.5 rounded bg-indigo-500/20"
                  />
                  <motion.div
                    variants={shimmerVariant}
                    initial="initial"
                    animate="animate"
                    className="w-12 h-3.5 rounded bg-emerald-500/20"
                  />
                </div>
                <motion.div
                  variants={shimmerVariant}
                  initial="initial"
                  animate="animate"
                  className="w-32 h-4 rounded bg-slate-800"
                />
                <motion.div
                  variants={shimmerVariant}
                  initial="initial"
                  animate="animate"
                  className="w-full h-8 rounded-lg bg-slate-800/80"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
