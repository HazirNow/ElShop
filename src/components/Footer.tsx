import React, { useState } from 'react';
import { 
  Building2, 
  Clock, 
  Shield, 
  Sparkles, 
  Store as StoreIcon, 
  Lock, 
  Bike, 
  ShieldCheck, 
  ChevronDown, 
  ExternalLink, 
  ArrowUpRight, 
  Phone, 
  Mail, 
  Heart,
  Globe,
  FileText,
  CreditCard,
  QrCode,
  BookOpen,
  Terminal,
  Layers,
  KeyRound,
  CheckCircle2,
  LockKeyhole
} from 'lucide-react';
import { ElShopLogo } from './ElShopLogo';
import { Language, Role } from '../types';

interface FooterProps {
  onOpenLogin: (role?: Role) => void;
  onOpenMerchantOnboarding: () => void;
  onOpenLegal: (tab: 'terms' | 'privacy' | 'disclaimers') => void;
  lang?: Language;
  onToggleLang?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenLogin,
  onOpenMerchantOnboarding,
  onOpenLegal,
  lang = 'en',
  onToggleLang,
}) => {
  const isRtl = lang === 'ar';
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);

  return (
    <footer 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className="bg-slate-950 border-t border-slate-900 text-slate-400 font-sans relative z-20"
      id="main-saas-footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-16 pb-12 space-y-12">
        
        {/* Main 6-Column Grid (Brand + 5 SaaS Navigation Columns) */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-10">
          
          {/* Col 1: Brand & Mission (Spans 2 cols on md/lg) */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <ElShopLogo size="md" variant="white" showCountry />
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              {isRtl
                ? 'نظام التشغيل الرائد للبقالات والمتاجر المحلية في الأبراج السكنية بدولة الإمارات. دفتر حسابات رقمي، كتالوج متصل، وتوصيل فوري بدون عمولات.'
                : 'The all-in-one hyperlocal retail OS empowering UAE neighborhood baqalas and residential dark stores with digital Khata credit tabs, real-time inventory, and zero-commission direct deliveries.'}
            </p>

            {/* Value Highlights Pill */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>0% Commission SaaS</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>15-Min Elevator Dispatch</span>
              </span>
            </div>

            <div className="pt-2 flex items-center gap-3 text-xs text-slate-500">
              <span>Dubai & Abu Dhabi • UAE</span>
              <span>•</span>
              <span>24/7 Merchant SLA</span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              {isRtl ? 'المنتج والحلول' : 'Product'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  {isRtl ? 'الميزات والخواص' : 'Core Features'}
                </a>
              </li>
              <li>
                <a href="#calculator" className="hover:text-white transition-colors">
                  {isRtl ? 'حاسبة أرباح البقالة' : 'Baqala ROI Calculator'}
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  {isRtl ? 'خطط الأسعار' : 'SaaS Pricing (299 AED)'}
                </a>
              </li>
              <li>
                <button 
                  onClick={onOpenMerchantOnboarding}
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 text-xs text-left"
                >
                  <span>{isRtl ? 'شهر تجريبي مجاناً' : '1-Month Free Trial'}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </li>
              <li>
                <a href="#elevator-kit" className="hover:text-white transition-colors">
                  {isRtl ? 'ملصقات مصاعد الأبراج' : 'Elevator QR Kit'}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources (NEW Enterprise SaaS Column) */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              {isRtl ? 'المصادر والتوثيق' : 'Resources'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#faq" className="hover:text-white transition-colors flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-indigo-400" />
                  <span>{isRtl ? 'مركز المساعدة' : 'Help Center'}</span>
                </a>
              </li>
              <li>
                <a href="#api" className="hover:text-white transition-colors flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-emerald-400" />
                  <span>{isRtl ? 'توثيق API والمزامنة' : 'API & Webhooks'}</span>
                </a>
              </li>
              <li>
                <a href="#changelog" className="hover:text-white transition-colors flex items-center gap-1">
                  <Layers className="w-3 h-3 text-amber-400" />
                  <span>{isRtl ? 'سجل التحديثات v2.4' : 'Changelog (v2.4)'}</span>
                </a>
              </li>
              <li>
                <a href="#playbook" onClick={onOpenMerchantOnboarding} className="hover:text-white transition-colors">
                  {isRtl ? 'دليل نجاح البقالة' : 'Merchant Playbook'}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              {isRtl ? 'الشركة' : 'Company'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  {isRtl ? 'عن إل شوب' : 'About ElShop OS'}
                </a>
              </li>
              <li>
                <a href="#social-proof" className="hover:text-white transition-colors">
                  {isRtl ? 'قصص نجاح المتاجر' : 'Case Studies'}
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  {isRtl ? 'الأسئلة الشائعة' : 'Baqala FAQ'}
                </a>
              </li>
              <li>
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <span>{isRtl ? 'الوظائف' : 'Careers'}</span>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded font-bold">Hiring</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              {isRtl ? 'الشروط والامتثال' : 'Legal'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-white transition-colors text-left"
                >
                  {isRtl ? 'شروط الخدمة' : 'Terms of Service'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-white transition-colors text-left"
                >
                  {isRtl ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('disclaimers')}
                  className="hover:text-white transition-colors text-left"
                >
                  {isRtl ? 'حماية المستهلك ودفتر الحساب' : 'Khata & Consumer Rights'}
                </button>
              </li>
              <li>
                <span className="text-slate-500 text-[11px] block">
                  UAE E-Commerce Compliant
                </span>
              </li>
            </ul>
          </div>

          {/* Col 6: Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              {isRtl ? 'الدعم والمساعدة' : 'Support'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://wa.me/971500000000" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
                  <span>{isRtl ? 'واتساب 24/7' : '24/7 WhatsApp'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="mailto:support@elshop.ae" className="hover:text-white transition-colors">
                  support@elshop.ae
                </a>
              </li>
              <li>
                <a href="#onboarding" onClick={onOpenMerchantOnboarding} className="hover:text-white transition-colors">
                  {isRtl ? 'حجز تدريب POS' : 'Book POS Training'}
                </a>
              </li>
              <li>
                <span className="text-slate-500 text-[11px]">
                  Dubai Internet City
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Security & Compliance Trust Bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              {isRtl ? 'معايير الأمان والامتثال:' : 'Enterprise Security:'}
            </span>
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-[11px]">
              <LockKeyhole className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-[11px]">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>PCI-DSS Level 1 Ready</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-[11px]">
              <Building2 className="w-3.5 h-3.5 text-teal-400" />
              <span>UAE CBUAE Standards</span>
            </div>
          </div>
        </div>

        {/* Bottom Operational Row with Language Toggle & Staff Portal Trigger */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          
          <div className="flex flex-wrap items-center gap-4">
            <span>© {new Date().getFullYear()} ElShop Technologies FZ-LLC. All rights reserved.</span>
            {onToggleLang && (
              <button
                onClick={onToggleLang}
                className="hover:text-slate-200 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors text-slate-300"
                title="Toggle English / Arabic layout"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === 'en' ? 'العربية (RTL)' : 'English (LTR)'}</span>
              </button>
            )}
          </div>

          {/* Discreet Staff Portal Anchor (Pre-selects Admin Login Modal) */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenLogin('admin')}
                id="footer-staff-portal-btn"
                className="text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-sm"
                title="Open HQ Admin & Internal Operations Portal"
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span>{isRtl ? 'بوابة الموظفين والشركاء' : 'Staff Portal'}</span>
              </button>

              <button
                onClick={() => setShowStaffDropdown(!showStaffDropdown)}
                className="text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 p-1.5 rounded-xl text-[11px] transition-all"
                title="Quick Role Picker"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showStaffDropdown ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Dropdown Menu for Quick Role Navigation */}
            {showStaffDropdown && (
              <div 
                className="absolute bottom-full right-0 mb-2 w-60 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1 animate-fade-in"
                id="footer-staff-dropdown-menu"
              >
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  {isRtl ? 'دخول الكوادر التشغيلية' : 'Internal Operations Access'}
                </div>

                <button
                  onClick={() => {
                    setShowStaffDropdown(false);
                    onOpenLogin('admin');
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Multi-Tenant HQ Admin</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">Admin</span>
                </button>

                <button
                  onClick={() => {
                    setShowStaffDropdown(false);
                    onOpenLogin('merchant');
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <StoreIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Store Merchant POS</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">PIN: 1234</span>
                </button>

                <button
                  onClick={() => {
                    setShowStaffDropdown(false);
                    onOpenLogin('rider');
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Bike className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Rider Courier App</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">PIN: 5678</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </footer>
  );
};
