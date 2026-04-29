import { useState, useEffect } from 'react';
import axios from 'axios';
import './OperationsStyles.css';

const OperationsPage = ({ currentUser }) => {
    const [lotes, setLotes] = useState([]);
    const [insumos, setInsumos] = useState([]);
    const [riegos, setRiegos] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);

    const [riegoData, setRiegoData] = useState({ loteId: '', cantidadAguaLitros: '', fechaHora: '', observaciones: '' });
    const [aplicacionData, setAplicacionData] = useState({ loteId: '', insumoId: '', dosis: '' });

    const fetchLotes = async () => {
        try {
            const res = await axios.get('http://localhost:9000/api/finca/lotes');
            setLotes(res.data);
        } catch (err) {
            console.error('Error al cargar lotes', err);
        }
    };

    const fetchInsumos = async () => {
        try {
            const res = await axios.get('http://localhost:9000/api/inventory/bodega/insumos');
            setInsumos(res.data);
        } catch (err) {
            console.error('Error al cargar insumos', err);
        }
    };

    const fetchRiegos = async () => {
        try {
            const res = await axios.get('http://localhost:9000/api/finca/riegos');
            setRiegos(res.data);
        } catch (err) {
            console.error('Error al cargar riegos', err);
        }
    };

    useEffect(() => {
        fetchLotes();
        fetchInsumos();
        fetchRiegos();
    }, []);

    const handleRiegoSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await axios.post('http://localhost:9000/api/finca/riegos', {
                fechaHora: riegoData.fechaHora || new Date().toISOString(),
                cantidadAguaLitros: Number(riegoData.cantidadAguaLitros),
                observaciones: riegoData.observaciones,
                lote: { id: Number(riegoData.loteId) }
            });
            alert('💧 Riego registrado correctamente');
            setRiegoData({ loteId: '', cantidadAguaLitros: '', fechaHora: '', observaciones: '' });
            fetchRiegos();
        } catch (err) {
            alert('❌ Error al registrar el riego');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAplicacionSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await axios.post('http://localhost:9000/api/inventory/bodega/aplicar', {
                loteId: Number(aplicacionData.loteId),
                operarioId: currentUser.id,
                dosis: Number(aplicacionData.dosis),
                insumo: { id: Number(aplicacionData.insumoId) }
            });
            alert('🌱 Aplicación de insumo registrada');
            setAplicacionData({ loteId: '', insumoId: '', dosis: '' });
            fetchInsumos();
        } catch (err) {
            alert('❌ Error al registrar la aplicación');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="operations-container">
            <div className="operations-header">
                <h2>Operaciones de Campo</h2>
                <p>Riegos y aplicaciones de insumos para controlar la finca.</p>
            </div>

            <div className="operations-grid">
                <div className="operations-card">
                    <h3>Registrar Riego</h3>
                    <p>Agrega el historial de riegos por lote.</p>
                    <form className="operations-form" onSubmit={handleRiegoSubmit}>
                        <select
                            required
                            value={riegoData.loteId}
                            onChange={(e) => setRiegoData({ ...riegoData, loteId: e.target.value })}
                        >
                            <option value="">Selecciona un lote</option>
                            {lotes.map((lote) => (
                                <option key={lote.id} value={lote.id}>{lote.nombre}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="Litros de agua"
                            value={riegoData.cantidadAguaLitros}
                            onChange={(e) => setRiegoData({ ...riegoData, cantidadAguaLitros: e.target.value })}
                            required
                        />
                        <input
                            type="datetime-local"
                            value={riegoData.fechaHora}
                            onChange={(e) => setRiegoData({ ...riegoData, fechaHora: e.target.value })}
                        />
                        <textarea
                            placeholder="Observaciones"
                            value={riegoData.observaciones}
                            onChange={(e) => setRiegoData({ ...riegoData, observaciones: e.target.value })}
                        />
                        <button type="submit" disabled={actionLoading}>{actionLoading ? 'Guardando...' : 'Registrar Riego'}</button>
                    </form>
                </div>

                <div className="operations-card">
                    <h3>Aplicar Insumo</h3>
                    <p>Registra la aplicación de fertilizantes, plaguicidas o fungicidas.</p>
                    <form className="operations-form" onSubmit={handleAplicacionSubmit}>
                        <select
                            required
                            value={aplicacionData.loteId}
                            onChange={(e) => setAplicacionData({ ...aplicacionData, loteId: e.target.value })}
                        >
                            <option value="">Selecciona un lote</option>
                            {lotes.map((lote) => (
                                <option key={lote.id} value={lote.id}>{lote.nombre}</option>
                            ))}
                        </select>
                        <select
                            required
                            value={aplicacionData.insumoId}
                            onChange={(e) => setAplicacionData({ ...aplicacionData, insumoId: e.target.value })}
                        >
                            <option value="">Selecciona un insumo</option>
                            {insumos.map((insumo) => (
                                <option key={insumo.id} value={insumo.id}>{insumo.nombreComercial}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="Dosis aplicada"
                            value={aplicacionData.dosis}
                            onChange={(e) => setAplicacionData({ ...aplicacionData, dosis: e.target.value })}
                            required
                        />
                        <button type="submit" disabled={actionLoading}>{actionLoading ? 'Guardando...' : 'Registrar Aplicación'}</button>
                    </form>
                </div>
            </div>

            <div className="operations-summary">
                <div className="summary-card">
                    <h4>Riegos recientes</h4>
                    <ul>
                        {riegos.slice(-5).reverse().map((riego) => (
                            <li key={riego.id}>
                                <span>{new Date(riego.fechaHora).toLocaleString()}</span>
                                <strong>{riego.lote?.nombre || 'Sin lote'}</strong>
                                <small>{riego.cantidadAguaLitros} L</small>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="summary-card">
                    <h4>Insumos disponibles</h4>
                    <ul>
                        {insumos.slice(0, 5).map((insumo) => (
                            <li key={insumo.id}>
                                <strong>{insumo.nombreComercial}</strong>
                                <span>{insumo.stockActual} {insumo.unidadMedida}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default OperationsPage;
