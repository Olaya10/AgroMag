import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { DashboardCard } from '../../componets/DashboardComponents';
import { Droplet, FlaskConical, CheckCircle2 } from 'lucide-react';

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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-medium rounded-3xl p-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-agro-emerald font-semibold">Operaciones</p>
            <h1 className="mt-3 text-3xl font-display font-bold text-slate-900">Riegos y aplicaciones en un solo lugar</h1>
            <p className="mt-2 max-w-2xl text-slate-600">Registra eventos de campo y mantén visible la operación diaria.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-4 shadow-soft">
              <div className="flex items-center gap-2 text-slate-700">
                <Droplet className="h-5 w-5 text-agro-emerald" />
                <span className="font-semibold">Riegos</span>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">{riegos.length}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 shadow-soft">
              <div className="flex items-center gap-2 text-slate-700">
                <FlaskConical className="h-5 w-5 text-slate-500" />
                <span className="font-semibold">Insumos</span>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">{insumos.length}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardCard title="Registrar riego" subtitle="Crea un nuevo registro de riego">
          <form className="space-y-4" onSubmit={handleRiegoSubmit}>
            <label className="block text-sm text-slate-700">
              Lote destino
              <select
                required
                value={riegoData.loteId}
                onChange={(e) => setRiegoData({ ...riegoData, loteId: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
              >
                <option value="">Selecciona un lote</option>
                {lotes.map((lote) => (
                  <option key={lote.id} value={lote.id}>{lote.nombre}</option>
                ))}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-700">
                Volumen (L)
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="Litros de agua"
                  value={riegoData.cantidadAguaLitros}
                  onChange={(e) => setRiegoData({ ...riegoData, cantidadAguaLitros: e.target.value })}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                />
              </label>
              <label className="block text-sm text-slate-700">
                Fecha y hora
                <input
                  type="datetime-local"
                  value={riegoData.fechaHora}
                  onChange={(e) => setRiegoData({ ...riegoData, fechaHora: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                />
              </label>
            </div>
            <label className="block text-sm text-slate-700">
              Observaciones
              <textarea
                placeholder="Registro opcional"
                value={riegoData.observaciones}
                onChange={(e) => setRiegoData({ ...riegoData, observaciones: e.target.value })}
                className="mt-2 h-28 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
              />
            </label>
            <button type="submit" disabled={actionLoading} className="rounded-3xl bg-agro-emerald px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-agro-emerald/20 transition hover:bg-green-700">
              {actionLoading ? 'Guardando...' : 'Registrar Riego'}
            </button>
          </form>
        </DashboardCard>

        <DashboardCard title="Aplicar insumo" subtitle="Registra una aplicación por lote">
          <form className="space-y-4" onSubmit={handleAplicacionSubmit}>
            <label className="block text-sm text-slate-700">
              Lote
              <select
                required
                value={aplicacionData.loteId}
                onChange={(e) => setAplicacionData({ ...aplicacionData, loteId: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
              >
                <option value="">Selecciona un lote</option>
                {lotes.map((lote) => (
                  <option key={lote.id} value={lote.id}>{lote.nombre}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-slate-700">
              Insumo
              <select
                required
                value={aplicacionData.insumoId}
                onChange={(e) => setAplicacionData({ ...aplicacionData, insumoId: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
              >
                <option value="">Selecciona un insumo</option>
                {insumos.map((insumo) => (
                  <option key={insumo.id} value={insumo.id}>{insumo.nombreComercial}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-slate-700">
              Dosis
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="Cantidad aplicada"
                value={aplicacionData.dosis}
                onChange={(e) => setAplicacionData({ ...aplicacionData, dosis: e.target.value })}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
              />
            </label>
            <button type="submit" disabled={actionLoading} className="rounded-3xl bg-agro-emerald px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-agro-emerald/20 transition hover:bg-green-700">
              {actionLoading ? 'Guardando...' : 'Registrar Aplicación'}
            </button>
          </form>
        </DashboardCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardCard title="Riegos recientes" subtitle="Últimos eventos registrados">
          <div className="space-y-4">
            {riegos.slice(-5).reverse().map((riego) => (
              <div key={riego.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{riego.lote?.nombre || 'Lote no disponible'}</p>
                    <p className="text-sm text-slate-500">{new Date(riego.fechaHora).toLocaleString()}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                    <Droplet className="h-4 w-4" /> {riego.cantidadAguaLitros} L
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{riego.observaciones || 'Sin observaciones'}</p>
              </div>
            ))}
            {riegos.length === 0 && <p className="text-sm text-slate-500">No hay registros de riegos aún.</p>}
          </div>
        </DashboardCard>

        <DashboardCard title="Insumos disponibles" subtitle="Stock reciente en la bodega">
          <div className="space-y-4">
            {insumos.slice(0, 5).map((insumo) => (
              <div key={insumo.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{insumo.nombreComercial}</p>
                    <p className="text-sm text-slate-500">{insumo.tipo}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {insumo.stockActual} {insumo.unidadMedida}
                  </span>
                </div>
              </div>
            ))}
            {insumos.length === 0 && <p className="text-sm text-slate-500">No hay insumos disponibles.</p>}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default OperationsPage;
