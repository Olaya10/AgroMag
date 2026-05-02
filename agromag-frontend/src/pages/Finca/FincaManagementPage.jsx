import { useState } from 'react';
import CultivoManagementPage from '../Cultivos/CultivoManagementPage';
import LoteManagementPage from '../Lote/LoteManagementPage';
import './FincaManagementStyles.css';

const FincaManagementPage = () => {
    const [activeTab, setActiveTab] = useState('cultivos');

    return (
        <div className="finca-management">
            <div className="finca-tabs-header">
                <h1>🌾 Gestión Integral de la Finca</h1>
                <p>Administra cultivos y lotes de manera profesional</p>
            </div>

            <div className="tabs-container">
                <div className="tabs-navigation">
                    <button
                        className={`tab-button ${activeTab === 'cultivos' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cultivos')}
                    >
                        🌱 Cultivos
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'lotes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('lotes')}
                    >
                        🌾 Lotes
                    </button>
                </div>

                <div className="tabs-content">
                    {activeTab === 'cultivos' && (
                        <div className="tab-panel">
                            <CultivoManagementPage />
                        </div>
                    )}
                    {activeTab === 'lotes' && (
                        <div className="tab-panel">
                            <LoteManagementPage />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FincaManagementPage;
