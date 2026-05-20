import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '../../components/UIComponents';
import FincaManagement from './FincaManagement';
import CultivoManagementPage from '../Cultivos/CultivoManagementPage';
import LoteManagementPage from '../Lote/LoteManagementPage';

const TABS = [
  { key: 'fincas', label: '🏡 Fincas' },
  { key: 'cultivos', label: '🌱 Cultivos' },
  { key: 'lotes', label: '🌾 Lotes' }
];

const FincaManagementPage = () => {
  const [activeTab, setActiveTab] = useState('fincas');
  const [refreshLoteFincas, setRefreshLoteFincas] = useState(0);

  const handleChangeTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'lotes') {
      setRefreshLoteFincas((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        label="Fincas"
        title="Gestión integral de cultivos y lotes"
        description="Administra tus parcelas, cultivos y fincas con un flujo claro, unificado y visual."
        action={
          <div className="flex bg-haverts-secondary/15 p-1.5 rounded-2xl border border-haverts-secondary/20">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleChangeTab(tab.key)}
                className={`relative rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'text-haverts-base shadow-soft'
                    : 'text-haverts-primary/70 hover:text-haverts-primary'
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className="absolute inset-0 bg-haverts-primary rounded-xl"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        }
      />

      <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] border border-haverts-secondary/20 p-6 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'fincas' && <FincaManagement />}
            {activeTab === 'cultivos' && <CultivoManagementPage />}
            {activeTab === 'lotes' && <LoteManagementPage refreshFincas={refreshLoteFincas} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FincaManagementPage;
