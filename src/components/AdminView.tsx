import React from 'react';
import { AppState, Language } from '../types';
import { AdminDashboard } from './AdminDashboard';

interface AdminViewProps {
  state: AppState;
  lang?: Language;
  onRefresh: () => void;
  onLogout?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ state, lang = 'en', onRefresh, onLogout }) => {
  return (
    <AdminDashboard
      state={state}
      lang={lang}
      onRefresh={onRefresh}
      onLogout={onLogout}
    />
  );
};
