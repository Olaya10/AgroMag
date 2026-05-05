import { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardCard } from '../../componets/DashboardComponents';
import FincaManagement from './FincaManagement';
import CultivoManagementPage from '../Cultivos/CultivoManagementPage';
import LoteManagementPage from '../Lote/LoteManagementPage';

const TABS = [
  { key: 'fincas', label: '🏡 Fincas' },
  { key: 'cultivos', label: '🌱 Cultivos' },
  { key: 'lotes', label: '🌾 Lotes' }
];

const FincaManagementPage = () => {
  const [activeTab, setActiveTab] = useState('cultivos');

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-medium rounded-3xl p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-agro-emerald font-semibold">Finca</p>
            <h1 className="mt-3 text-3xl font-display font-bold text-slate-900">Gestión integral de cultivos y lotes</h1>
            <p className="mt-2 max-w-2xl text-slate-600">Administra tus parcelas con un flujo claro, unificado y visual.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:w-fit">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-agro-emerald text-white shadow-lg shadow-agro-emerald/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <DashboardCard className="p-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="bg-slate-50 px-6 py-5 sm:px-8 sm:py-8"
        >
          {activeTab === 'fincas' ? <FincaManagement /> : activeTab === 'cultivos' ? <CultivoManagementPage /> : <LoteManagementPage />}
        </motion.div>
      </DashboardCard>
    </div>
  );
};

export default FincaManagementPage;
