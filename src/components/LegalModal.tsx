import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  AlertCircle, 
  X, 
  CheckCircle2, 
  Scale, 
  Truck, 
  Store, 
  Building2, 
  CreditCard 
} from 'lucide-react';
import { Language } from '../types';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'terms' | 'privacy' | 'disclaimers';
  lang: Language;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms',
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'disclaimers'>(initialTab);
  const isRtl = lang === 'ar';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0B6E4F]/20 border border-[#0B6E4F]/30 flex items-center justify-center text-emerald-400">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">
                  {isRtl ? 'الشروط والأحكام والسياسات القانونية' : 'Legal Terms, Privacy & Disclaimers'}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {isRtl ? 'منصة ElShop لتجارة البقالة الذكية بالحي' : 'Powered by ElShop UAE Hyperlocal Commerce Platform'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-slate-800 bg-slate-950/50 px-5 pt-2 gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('terms')}
              className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === 'terms'
                  ? 'border-emerald-500 text-emerald-400 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isRtl ? 'الشروط والأحكام' : 'Terms & Conditions'}</span>
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === 'privacy'
                  ? 'border-emerald-500 text-emerald-400 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isRtl ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
            </button>
            <button
              onClick={() => setActiveTab('disclaimers')}
              className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === 'disclaimers'
                  ? 'border-emerald-500 text-emerald-400 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{isRtl ? 'إخلاء المسؤولية وحقوق المستهلك' : 'Consumer Rights & Disclaimers'}</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
            {activeTab === 'terms' && (
              <div className="space-y-3.5">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-start gap-3">
                  <Store className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-xs mb-1">
                      {isRtl ? '1. نموذج المتجر المستقل' : '1. Independent Store Merchant Relationship'}
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      {isRtl
                        ? 'تعمل كل بقالة أو متجر شريك ككيان تجاري مستقل مرخص في دولة الإمارات العربية المتحدة. توفر منصة ElShop البنية التحتية التقنية الرقمية ونظام إدارة الطلبات.'
                        : 'Each participating neighborhood Baqala or dark store operates as an independently licensed commercial entity in the UAE. ElShop provides the software infrastructure, WhatsApp ordering gateway, and digital Khata ledger management.'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-xs mb-1">
                      {isRtl ? '2. تسهيلات الدفتر الرقمي (الخانة / Store Credit)' : '2. Digital Khata (Store Credit) Terms'}
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      {isRtl
                        ? 'تُمنح تسهيلات الشراء الآجل (الخانة) لسكان الأبراج المعتمدين بتقدير من إدارة المتجر. يجب سداد الفواتير الشهرية عند استلام كشف الحساب عبر الواتساب.'
                        : 'Monthly store credit (Digital Khata) is offered at the sole discretion of the merchant to pre-approved residential tower residents. Accounts are settled monthly via 1-click WhatsApp payment links or cash.'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-start gap-3">
                  <Truck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-xs mb-1">
                      {isRtl ? '3. التوصيل السريع وتجميع طلبات الأبراج' : '3. Hyperlocal Delivery & Tower Elevator Turnaround'}
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      {isRtl
                        ? 'يتم التوصيل من المتجر المحلي مباشرة إلى شقتك في مدة تتراوح بين 15 إلى 25 دقيقة. يتم تجميع الطلبات لنفس البرج السكني لتقليل وقت استخدام المصعد وزيادة الكفاءة.'
                        : 'Doorstep orders originate from the neighborhood store located downstairs or adjacent to your tower, targeting 15–25 minute fulfillment. Tower batching enables runners to deliver multiple apartment orders per elevator trip.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-3.5">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-xs mb-1">
                      {isRtl ? 'الخصوصية وعدم مشاركة البيانات' : 'Zero-Spam & Data Protection Guarantee'}
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      {isRtl
                        ? 'نحن لا نبيع أو نشارك أرقام هواتف العملاء أو بياناتهم مع أي أطراف ثالثة أو شركات إعلانية. تُستخدم أرقام الهواتف فقط لتأكيد الطلب عبر الواتساب والتنسيق مع المندوب.'
                        : 'We never sell, rent, or monetize your contact information. Customer phone numbers and apartment addresses are strictly utilized for direct WhatsApp order confirmations, delivery coordination, and digital Khata statements.'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-xs mb-1">
                      {isRtl ? 'أمان التخزين المحلي' : 'Zero Tracking Cookies & Local Security'}
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      {isRtl
                        ? 'تُحفظ سلة المشتريات والملاحظات على جهازك محلياً دون الحاجة لتثبيت برامج تعقب أو إنشاء حسابات معقدة.'
                        : 'Your shopping cart state and language preferences are stored locally in your browser sandbox without invasive third-party tracking cookies or mandatory social media logins.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'disclaimers' && (
              <div className="space-y-3.5">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-start gap-3">
                  <Scale className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-xs mb-1">
                      {isRtl ? 'حماية المستهلك في دولة الإمارات' : 'UAE Federal Consumer Protection Law No. 15 of 2020'}
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      {isRtl
                        ? 'يحق للعميل فحص السلع الغذائية الطازجة عند الاستلام. في حال وجود أي منتج تالف أو منتهي الصلاحية، يتم استبداله فوراً أو إعادة قيمته نقداً أو رصيداً في الدفتر.'
                        : 'In compliance with UAE consumer protection regulations, customers have the right to inspect fresh grocery items upon delivery. Any defective, damaged, or expired item will be replaced immediately or credited to your account.'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-xs mb-1">
                      {isRtl ? 'سلامة المنتجات وتواريخ الصلاحية' : 'Freshness & Expiry Assurance'}
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      {isRtl
                        ? 'يراقب المتجر تواريخ انتهاء الصلاحية بشكل دوري عبر نظام رادار التواريخ الذكي، ويتم إزالة أي منتج منتهي من القائمة تلقائياً.'
                        : 'Stores utilize automated expiry monitoring to mark near-expiry stock on sale or return it to wholesalers, ensuring customers only receive fresh, quality-assured goods.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Built by ElShop UAE</span>
            </span>
            <button
              onClick={onClose}
              className="bg-[#0B6E4F] hover:bg-emerald-600 text-white font-bold px-4 py-1.5 rounded-xl transition-all"
            >
              {isRtl ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
