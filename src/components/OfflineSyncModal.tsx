import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Trash2, 
  Play, 
  Clock, 
  Layers, 
  ShoppingBag, 
  BookOpen, 
  Sparkles,
  Zap,
  Download,
  ShieldAlert,
  ArrowRight,
  Server,
  HardDrive
} from 'lucide-react';
import { useOfflineSync } from '../lib/useOfflineSync';
import { Language } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const OfflineSyncModal: React.FC<Props> = ({ isOpen, onClose, lang }) => {
  const isRtl = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'queue' | 'conflicts'>('queue');
  const [isExporting, setIsExporting] = useState(false);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const {
    isOnline,
    isSimulatedOffline,
    isSyncing,
    syncProgress,
    pendingCount,
    conflictCount,
    lastSyncedAt,
    items,
    conflictItems,
    toggleSimulatedOffline,
    syncNow,
    retryItem,
    deleteItem,
    resolveForceLocal,
    resolveKeepServer,
    downloadBackup,
  } = useOfflineSync();

  if (!isOpen) return null;

  const handleBackup = async () => {
    setIsExporting(true);
    try {
      await downloadBackup();
    } finally {
      setIsExporting(false);
    }
  };

  const handleForceLocal = async (id: number) => {
    setResolvingId(id);
    try {
      await resolveForceLocal(id);
    } finally {
      setResolvingId(null);
    }
  };

  const handleKeepServer = async (id: number) => {
    setResolvingId(id);
    try {
      await resolveKeepServer(id);
    } finally {
      setResolvingId(null);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'CREATE_ORDER':
        return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
      case 'SETTLE_KHATA':
      case 'ADJUST_KHATA_CREDIT':
        return <BookOpen className="w-4 h-4 text-amber-400" />;
      case 'UPDATE_ORDER':
        return <Layers className="w-4 h-4 text-indigo-400" />;
      default:
        return <Database className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl ${
                isOnline 
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' 
                  : 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
              }`}>
                {isOnline ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>{isRtl ? 'محرك المزامنة وحماية البيانات دون اتصال' : 'IndexedDB Sync & Conflict Resolver'}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Dexie.js ACID
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {isOnline 
                    ? (isRtl ? 'المتجر متصل بالسحابة • فحص النزاعات التلقائي نشط' : 'Store Connected • Real-time cloud sync with conflict detection')
                    : (isRtl ? 'وضع عدم الاتصال • المعاملات محفوظة محلياً في المتصفح' : 'Offline Mode • Local transactions isolated in browser IndexedDB')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBackup}
                disabled={isExporting}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
                title="Export complete IndexedDB tables to JSON backup"
              >
                <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
                <span>{isExporting ? 'Exporting...' : (isRtl ? 'نسخ احتياطي' : 'Backup JSON')}</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sync Progress Bar (If Syncing) */}
          {syncProgress && (
            <div className="p-3 bg-indigo-950/60 border-b border-indigo-900/60 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-indigo-300">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>Syncing transaction {syncProgress.current} of {syncProgress.total}...</span>
                </span>
                <span className="font-mono text-[11px]">{Math.round((syncProgress.current / syncProgress.total) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
                  style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Network Bar & Mode Switch */}
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'}`} />
                <span className="font-bold text-slate-200">
                  {isOnline ? (isRtl ? 'متصل بالشبكة' : 'Network Active') : (isRtl ? 'غير متصل (محلي)' : 'Offline (Local)')}
                </span>
              </div>

              {lastSyncedAt && (
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isRtl ? 'آخر مزامنة:' : 'Last sync:'} {new Date(lastSyncedAt).toLocaleTimeString()}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Isolated Simulation Switch (Software pause only) */}
              <button
                onClick={toggleSimulatedOffline}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSimulatedOffline
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
                title="Pause background sync loop without throwing native browser network errors"
              >
                <Zap className={`w-3.5 h-3.5 ${isSimulatedOffline ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{isSimulatedOffline ? (isRtl ? 'إيقاف محاكاة انقطاع النت' : 'Stop Drop Simulation') : (isRtl ? 'محاكاة انقطاع النت (برج/قبو)' : 'Simulate Tower Drop')}</span>
              </button>

              {/* Force Sync button */}
              <button
                onClick={() => syncNow()}
                disabled={isSyncing || !isOnline}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-sm text-xs ${
                  isSyncing || !isOnline
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? (isRtl ? 'جارِ المزامنة...' : 'Syncing...') : (isRtl ? 'مزامنة الآن' : 'Sync Queue')}</span>
              </button>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="px-5 pt-3 pb-0 bg-slate-900 border-b border-slate-800 flex gap-2">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-4 py-2 text-xs font-black border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'queue'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isRtl ? 'طابور المزامنة' : 'Sync Queue'}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 font-mono text-slate-300">
                {items.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('conflicts')}
              className={`px-4 py-2 text-xs font-black border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'conflicts'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{isRtl ? 'نزاعات البيانات' : 'Conflicts'}</span>
              {conflictItems.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/30 text-amber-300 font-mono font-bold animate-pulse">
                  {conflictItems.length}
                </span>
              )}
            </button>
          </div>

          {/* Main Tab Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {activeTab === 'queue' ? (
              // TAB 1: SYNC QUEUE
              items.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-200">
                    {isRtl ? 'كافة السجلات متطابقة ومحدثة 100%' : 'All Local Ledgers In Sync'}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {isRtl
                      ? 'لا توجد طلبات معلقة في قائمة الانتظار. تتم مزامنة كافة المعاملات مع السحابة فوراً.'
                      : 'Zero pending mutations. When working in elevator shafts or basements, offline transactions queue here and replay automatically upon reconnecting.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-all ${
                        item.status === 'failed'
                          ? 'bg-rose-950/20 border-rose-900/50'
                          : item.status === 'syncing'
                          ? 'bg-indigo-950/20 border-indigo-800/50'
                          : 'bg-slate-950/70 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                          {getActionIcon(item.actionType)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white truncate">{item.summary}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              item.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : item.status === 'failed'
                                ? 'bg-rose-500/20 text-rose-300'
                                : item.status === 'syncing'
                                ? 'bg-indigo-500/20 text-indigo-300 animate-pulse'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                            <span className="font-mono">{new Date(item.timestamp).toLocaleTimeString()}</span>
                            {item.retryCount > 0 && (
                              <span className="text-slate-500">
                                • Retries: {item.retryCount}
                              </span>
                            )}
                            {item.lastError && (
                              <span className="text-rose-400 truncate max-w-xs">
                                • Error: {item.lastError}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {item.status === 'failed' && (
                          <button
                            onClick={() => item.id && retryItem(item.id)}
                            className="p-1.5 text-amber-400 hover:text-white rounded-lg hover:bg-slate-800"
                            title="Retry sync"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => item.id && deleteItem(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // TAB 2: CONFLICTS RESOLVER
              conflictItems.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-200">
                    {isRtl ? 'لا توجد نزاعات في البيانات' : 'No Data Conflicts Detected'}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {isRtl
                      ? 'كافة التعديلات غير المتصلة متوافقة تماماً مع أحدث إصدار على السحابة.'
                      : 'All offline write operations align cleanly with cloud timestamps. No manual reconciliation needed.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {isRtl
                        ? 'تم اكتشاف تعديلات على السحابة أحدث من التعديل المسجل دون اتصال. اختر إما فرض التعديل المحلي أو الاحتفاظ ببيانات السحابة.'
                        : 'Server record was modified while offline. Choose whether to Force Local (overwrite cloud) or Keep Server (discard offline change).'}
                    </span>
                  </div>

                  {conflictItems.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl border border-amber-500/40 bg-slate-950/90 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="font-bold text-white text-sm">{c.summary}</span>
                          <p className="text-xs text-amber-300 pt-0.5">{c.conflict?.reason || c.lastError}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          CONFLICT
                        </span>
                      </div>

                      {/* State Comparison Grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-slate-300">
                            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Local Mutation (Offline)</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono">
                            Queued: {c.conflict?.localQueuedAt ? new Date(c.conflict.localQueuedAt).toLocaleTimeString() : c.timestamp}
                          </p>
                          <pre className="text-[10px] text-indigo-300 bg-slate-950 p-2 rounded overflow-x-auto font-mono">
                            {JSON.stringify(c.conflict?.localState || c.payload, null, 2)}
                          </pre>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-slate-300">
                            <Server className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Cloud Server State</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono">
                            Updated: {c.conflict?.serverUpdatedAt ? new Date(c.conflict.serverUpdatedAt).toLocaleTimeString() : 'Recent'}
                          </p>
                          <pre className="text-[10px] text-emerald-300 bg-slate-950 p-2 rounded overflow-x-auto font-mono">
                            {JSON.stringify(c.conflict?.serverState || { note: 'Server modified independently' }, null, 2)}
                          </pre>
                        </div>
                      </div>

                      {/* Resolution Actions */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => c.id && handleKeepServer(c.id)}
                          disabled={resolvingId === c.id}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700"
                        >
                          {isRtl ? 'الاحتفاظ ببيانات السحابة (إلغاء المحلي)' : 'Keep Server (Discard Local)'}
                        </button>
                        
                        <button
                          onClick={() => c.id && handleForceLocal(c.id)}
                          disabled={resolvingId === c.id}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                        >
                          {isRtl ? 'فرض التعديل المحلي (استبدال السحابة)' : 'Force Local (Overwrite Cloud)'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Footer Callout */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                {isRtl
                  ? 'محمية بواسطة Dexie.js ACID: منع التحديثات الجزئية مع دعم التصدير الكامل'
                  : 'Dexie.js ACID Guarantee: Replays are wrapped in atomic transactions with zero risk of partial corruptions.'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
            >
              {isRtl ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
