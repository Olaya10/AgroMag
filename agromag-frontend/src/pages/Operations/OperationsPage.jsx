import { useState, useEffect, useMemo } from 'react';
import api from '../../api';
import { motion as Motion } from 'framer-motion';
import { DashboardCard } from '../../components/DashboardComponents';
import { PageHeader, toast, useConfirm, Spinner } from '../../components/UIComponents';
import { Droplet, FlaskConical, CheckCircle2, Pencil, Trash2, Copy, TrendingUp } from 'lucide-react';

const OperationsPage = ({ currentUser }) => {
  const isOperario = currentUser?.role?.toUpperCase() === 'OPERARIO';
  const { confirm, ConfirmModal } = useConfirm();

  const [fincas, setFincas] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [riegos, setRiegos] = useState([]);
  const [aplicaciones, setAplicaciones] = useState([]);
  const [cultivos, setCultivos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [filterRiegosFrom, setFilterRiegosFrom] = useState('');
  const [filterRiegosTo, setFilterRiegosTo] = useState('');
  const [filterAplicacionesFrom, setFilterAplicacionesFrom] = useState('');
  const [filterAplicacionesTo, setFilterAplicacionesTo] = useState('');

  // ---- RF36 – Control de ordenamiento -----------------
  const [sortDescRiegos, setSortDescRiegos] = useState(false);          // false = descendente (más nuevo primero)
  const [sortDescAplicaciones, setSortDescAplicaciones] = useState(false);

  const [riegoData, setRiegoData] = useState({ fincaId: '', loteId: '', cultivoId: '', cantidadAguaLitros: '', fechaHora: '', observaciones: '' });
  const [aplicacionData, setAplicacionData] = useState({ fincaId: '', loteId: '', insumoId: '', dosis: '', fecha: '' });

  const [editingRiegoId, setEditingRiegoId] = useState(null);
  const [editingRiegoData, setEditingRiegoData] = useState({ loteId: '', cultivoId: '', cantidadAguaLitros: '', fechaHora: '', observaciones: '' });

  const [editingAplicacionId, setEditingAplicacionId] = useState(null);
  const [editingAplicacionData, setEditingAplicacionData] = useState({ loteId: '', insumoId: '', dosis: '', fecha: '' });

  // ---- RF35 – Funciones de clonación --------------------
  const cloneRiego = (riego) => {
    // Copia los datos del riego al formulario de registro
    setRiegoData({
      fincaId: riego.lote?.finca?.id || '',
      loteId: riego.lote?.id || '',
      cultivoId: riego.cultivo?.id || '',
      cantidadAguaLitros: riego.cantidadAguaLitros || '',
      fechaHora: riego.fechaHora ? new Date(riego.fechaHora).toISOString().slice(0, 16) : '',
      observaciones: riego.observaciones || '',
    });
  };

  const cloneAplicacion = (app) => {
    setAplicacionData({
      fincaId: app.lote?.finca?.id || '',
      loteId: app.loteId || '',
      insumoId: app.insumo?.id || '',
      dosis: app.dosis || '',
      fecha: app.fecha ? new Date(app.fecha).toISOString().slice(0, 16) : '',
    });
  };

  const resetRiegosFilters = () => {
    setFilterRiegosFrom('');
    setFilterRiegosTo('');
  };

  const resetAplicacionesFilters = () => {
    setFilterAplicacionesFrom('');
    setFilterAplicacionesTo('');
  };

  const loadAllData = async () => {
    try {
      const [
        fincasRes,
        lotesRes,
        insumosRes,
        riegosRes,
        aplicacionesRes,
        cultivosRes,
        usuariosRes
      ] = await Promise.all([
        api.get('/fincas'),
        api.get('/lotes'),
        api.get('/inventory/bodega/insumos'),
        api.get('/riegos'),
        api.get('/inventory/bodega/aplicaciones'),
        api.get('/cultivos'),
        api.get('/auth/usuarios-json').catch(() => ({ data: [] }))
      ]);

      setFincas(fincasRes.data);
      setLotes(lotesRes.data);
      setInsumos(insumosRes.data);
      setRiegos(riegosRes.data);
      setAplicaciones(aplicacionesRes.data);
      setCultivos(cultivosRes.data);
      setUsuarios(usuariosRes.data);
    } catch (err) {
      console.error('Error al cargar datos de operaciones', err);
      toast.error('Error al cargar datos del servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const fetchRiegos = async () => {
    try {
      const res = await api.get('/riegos');
      setRiegos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAplicaciones = async () => {
    try {
      const res = await api.get('/inventory/bodega/aplicaciones');
      setAplicaciones(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInsumos = async () => {
    try {
      const res = await api.get('/inventory/bodega/insumos');
      setInsumos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getLotesByFinca = (fincaId) => {
    if (!fincaId) return [];
    return lotes.filter((lote) => lote.finca?.id === Number(fincaId));
  };

  const handleRiegoSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post('/riegos', {
        fechaHora: riegoData.fechaHora || new Date().toISOString().slice(0, 19),
        amount: Number(riegoData.cantidadAguaLitros),
        cantidadAguaLitros: Number(riegoData.cantidadAguaLitros),
        observaciones: riegoData.observaciones,
        lote: { id: Number(riegoData.loteId) },
        cultivo: riegoData.cultivoId ? { id: Number(riegoData.cultivoId) } : null
      });
      toast.success('💧 Riego registrado correctamente');
      setRiegoData({ fincaId: '', loteId: '', cultivoId: '', cantidadAguaLitros: '', fechaHora: '', observaciones: '' });
      fetchRiegos();
    } catch (error) {
      console.error('Error al registrar el riego', error);
      toast.error('Error al registrar el riego');
    } finally {
      setActionLoading(false);
    }
  };

  // Función declarada ANTES de usarla en los filtros
  const matchesDateRange = (dateValue, from, to) => {
    if (!dateValue) return true;
    const itemDate = new Date(dateValue);
    if (from && itemDate < new Date(from)) return false;
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      if (itemDate > toDate) return false;
    }
    return true;
  };

  const filteredRiegos = riegos.filter((riego) => matchesDateRange(riego.fechaHora, filterRiegosFrom, filterRiegosTo));
  const filteredAplicaciones = aplicaciones.filter((app) => matchesDateRange(app.fecha, filterAplicacionesFrom, filterAplicacionesTo));

  // ---- RF36 – Listas memoizadas con ordenamiento ----
  const sortedRiegos = useMemo(() => {
    const list = [...filteredRiegos];
    return sortDescRiegos ? list : list.slice().reverse();   // invertimos solo en la UI
  }, [filteredRiegos, sortDescRiegos]);

  const sortedAplicaciones = useMemo(() => {
    const list = [...filteredAplicaciones];
    return sortDescAplicaciones ? list : list.slice().reverse();
  }, [filteredAplicaciones, sortDescAplicaciones]);

  // ------------------------------------------------------------
  // RF44 – Volumen total de agua de los últimos 30 días
  // ------------------------------------------------------------
  const waterVolume30d = useMemo(() => {
    if (!Array.isArray(riegos) || riegos.length === 0) return 0;

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Sumamos sólo los riegos cuyo campo `fecha` o `fechaHora` está dentro del rango
    return riegos.reduce((total, r) => {
      const fecha = new Date(r.fecha ?? r.fechaHora ?? 0);
      if (fecha >= thirtyDaysAgo && fecha <= now) {
        // `cantidadAguaLitros` o fallback a `cantidad`
        const litros = Number(r.cantidadAguaLitros ?? r.cantidad ?? 0);
        return total + litros;
      }
      return total;
    }, 0);
  }, [riegos]);

  // ------------------------------------------------------------
  // RF45 – Top 3 insumos (por dosis total)
  // ------------------------------------------------------------
  const top3Insumos = useMemo(() => {
    if (!Array.isArray(aplicaciones) || aplicaciones.length === 0) return [];

    // 1️⃣ Agrupamos por nombre del insumo
    const grouped = aplicaciones.reduce((acc, app) => {
      const nombre = app.insumoNombre ?? app.insumo?.nombreComercial ?? 'Sin nombre';
      const dosis = Number(app.dosis ?? 0);
      if (!acc[nombre]) acc[nombre] = 0;
      acc[nombre] += dosis;
      return acc;
    }, {}); // <-- Le quitamos el `as Record...` para que no dé error en JSX

    // 2️⃣ Convertimos a array → [{nombre, totalDosis}]
    const array = Object.entries(grouped).map(([nombre, total]) => ({
      nombre,
      total,
    }));

    // 3️⃣ Ordenamos de mayor a menor y tomamos los 3 primeros
    return array
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  }, [aplicaciones]);

  const handleAplicacionSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post('/inventory/bodega/aplicar', {
        loteId: Number(aplicacionData.loteId),
        operarioId: currentUser?.id,
        dosis: Number(aplicacionData.dosis),
        insumo: { id: Number(aplicacionData.insumoId) },
        fecha: aplicacionData.fecha || new Date().toISOString().slice(0, 19)
      });
      toast.success('🌱 Aplicación de insumo registrada');
      setAplicacionData({ fincaId: '', loteId: '', insumoId: '', dosis: '', fecha: '' });
      fetchInsumos();
      fetchAplicaciones();
    } catch (error) {
      console.error('Error al registrar la aplicación', error);
      toast.error('Error al registrar la aplicación');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditRiegoClick = (riego) => {
    setEditingRiegoId(riego.id);
    setEditingRiegoData({
      loteId: riego.lote?.id || '',
      cultivoId: riego.cultivo?.id || '',
      cantidadAguaLitros: riego.cantidadAguaLitros || '',
      fechaHora: riego.fechaHora ? new Date(riego.fechaHora).toISOString().slice(0, 16) : '',
      observaciones: riego.observaciones || ''
    });
  };

  const handleUpdateRiego = async (id) => {
    setActionLoading(true);
    try {
      await api.put(`/riegos/${id}`, {
        fechaHora: editingRiegoData.fechaHora,
        cantidadAguaLitros: Number(editingRiegoData.cantidadAguaLitros),
        observaciones: editingRiegoData.observaciones,
        lote: { id: Number(editingRiegoData.loteId) },
        cultivo: editingRiegoData.cultivoId ? { id: Number(editingRiegoData.cultivoId) } : null
      });
      toast.success('Riego actualizado correctamente');
      setEditingRiegoId(null);
      fetchRiegos();
    } catch (error) {
      console.error('Error al actualizar el riego', error);
      toast.error('Error al actualizar el riego');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRiego = async (id) => {
    const ok = await confirm('¿Está seguro de eliminar este riego?');
    if (!ok) return;
    setActionLoading(true);
    try {
      await api.delete(`/riegos/${id}`);
      toast.success('Riego eliminado correctamente');
      fetchRiegos();
    } catch (error) {
      console.error('Error al eliminar el riego', error);
      toast.error('Error al eliminar el riego');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditAplicacionClick = (app) => {
    setEditingAplicacionId(app.id);
    setEditingAplicacionData({
      loteId: app.loteId || '',
      insumoId: app.insumo?.id || '',
      dosis: app.dosis || '',
      fecha: app.fecha ? new Date(app.fecha).toISOString().slice(0, 16) : ''
    });
  };

  const handleUpdateAplicacion = async (id) => {
    setActionLoading(true);
    try {
      await api.put(`/inventory/bodega/aplicaciones/${id}`, {
        loteId: Number(editingAplicacionData.loteId),
        operarioId: currentUser?.id,
        dosis: Number(editingAplicacionData.dosis),
        insumo: { id: Number(editingAplicacionData.insumoId) },
        fecha: editingAplicacionData.fecha
      });
      toast.success('Aplicación actualizada correctamente');
      setEditingAplicacionId(null);
      fetchInsumos();
      fetchAplicaciones();
    } catch (error) {
      console.error('Error al actualizar la aplicación', error);
      toast.error('Error al actualizar la aplicación');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAplicacion = async (id) => {
    const ok = await confirm('¿Está seguro de eliminar esta aplicación?');
    if (!ok) return;
    setActionLoading(true);
    try {
      await api.delete(`/inventory/bodega/aplicaciones/${id}`);
      toast.success('Aplicación eliminada correctamente');
      fetchInsumos();
      fetchAplicaciones();
    } catch (error) {
      console.error('Error al eliminar la aplicación', error);
      toast.error('Error al eliminar la aplicación');
    } finally {
      setActionLoading(false);
    }
  };

  const inputCls = `w-full rounded-2xl border border-haverts-secondary/30 bg-white/60
                    px-4 py-3 text-sm text-haverts-primary font-medium outline-none
                    placeholder:text-haverts-primary/30
                    focus:border-haverts-primary focus:ring-2 focus:ring-haverts-primary/10
                    transition-all duration-200`;

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <ConfirmModal />
      <PageHeader
        label="Operaciones"
        title="Riegos y aplicaciones en un solo lugar"
        description="Registra eventos de campo y mantén visible la operación diaria."
        action={
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-haverts-secondary/10 border border-haverts-secondary/20 p-4">
              <div className="flex items-center gap-2 text-haverts-primary/60 mb-2">
                <Droplet className="h-4 w-4 text-haverts-primary" />
                <span className="text-xs font-bold uppercase tracking-wider">Riegos</span>
              </div>
              <p className="text-2xl font-bold text-haverts-primary">{riegos.length}</p>
            </div>
            <div className="rounded-2xl bg-haverts-secondary/10 border border-haverts-secondary/20 p-4">
              <div className="flex items-center gap-2 text-haverts-primary/60 mb-2">
                <FlaskConical className="h-4 w-4 text-haverts-primary/60" />
                <span className="text-xs font-bold uppercase tracking-wider">Insumos</span>
              </div>
              <p className="text-2xl font-bold text-haverts-primary">{insumos.length}</p>
            </div>
          </div>
        }
      />

      {/* ==== KPIs (RF44, RF45) agregados de forma visual ==== */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white border border-haverts-secondary/20 p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-haverts-primary/60 uppercase tracking-wider mb-1">Volumen de agua (30 días)</p>
            <p className="text-3xl font-bold text-haverts-primary">{waterVolume30d.toFixed(1)} <span className="text-sm font-medium">Litros</span></p>
          </div>
          <TrendingUp className="h-10 w-10 text-haverts-primary/20" />
        </div>
        <div className="rounded-2xl bg-white border border-haverts-secondary/20 p-5 shadow-sm">
          <p className="text-xs font-bold text-haverts-primary/60 uppercase tracking-wider mb-3">Top 3 Insumos Más Usados</p>
          <div className="space-y-2">
            {top3Insumos.length > 0 ? top3Insumos.map((item, index) => (
              <div key={item.nombre} className="flex justify-between items-center text-sm">
                <span className="font-medium text-haverts-primary/80 truncate pr-4">
                  <span className="text-haverts-primary/40 mr-2">{index + 1}.</span>{item.nombre}
                </span>
                <span className="font-bold text-haverts-primary">{item.total} <span className="text-xs font-normal">dosis</span></span>
              </div>
            )) : <p className="text-xs text-haverts-primary/40">Sin datos registrados aún.</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Registrar Riego */}
        <DashboardCard title="Registrar riego" subtitle="Crea un nuevo registro de riego">
          <form className="space-y-4" onSubmit={handleRiegoSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
                Finca
                <select
                  required
                  value={riegoData.fincaId}
                  onChange={(e) => setRiegoData({ ...riegoData, fincaId: e.target.value, loteId: '' })}
                  className={`mt-2 ${inputCls}`}
                >
                  <option value="">Selecciona una finca</option>
                  {fincas.map((finca) => (
                    <option key={finca.id} value={finca.id}>{finca.nombre}</option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
                Lote destino
                <select
                  required
                  value={riegoData.loteId}
                  onChange={(e) => setRiegoData({ ...riegoData, loteId: e.target.value })}
                  disabled={!riegoData.fincaId}
                  className={`mt-2 ${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">{riegoData.fincaId ? 'Selecciona un lote' : 'Selecciona primero una finca'}</option>
                  {getLotesByFinca(riegoData.fincaId).map((lote) => (
                    <option key={lote.id} value={lote.id}>{lote.nombre}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
                Cultivo
                <select
                  required
                  value={riegoData.cultivoId}
                  onChange={(e) => setRiegoData({ ...riegoData, cultivoId: e.target.value })}
                  className={`mt-2 ${inputCls}`}
                >
                  <option value="">Selecciona un cultivo</option>
                  {cultivos.map((cultivo) => (
                    <option key={cultivo.id} value={cultivo.id}>{cultivo.nombre}</option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
                Volumen (L)
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="Litros de agua"
                  value={riegoData.cantidadAguaLitros}
                  onChange={(e) => setRiegoData({ ...riegoData, cantidadAguaLitros: e.target.value })}
                  required
                  className={`mt-2 ${inputCls}`}
                />
              </label>
            </div>
            <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
              Fecha y hora
              <input
                type="datetime-local"
                value={riegoData.fechaHora}
                onChange={(e) => setRiegoData({ ...riegoData, fechaHora: e.target.value })}
                className={`mt-2 ${inputCls}`}
              />
            </label>
            <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
              Observaciones
              <textarea
                placeholder="Registro opcional"
                value={riegoData.observaciones}
                onChange={(e) => setRiegoData({ ...riegoData, observaciones: e.target.value })}
                className={`mt-2 h-28 resize-none ${inputCls}`}
              />
            </label>
            <button type="submit" disabled={actionLoading} className="btn-primary w-full sm:w-auto">
              {actionLoading ? 'Guardando...' : 'Registrar Riego'}
            </button>
          </form>
        </DashboardCard>

        {/* Aplicar Insumo */}
        <DashboardCard title="Aplicar insumo" subtitle="Registra una aplicación por lote">
          <form className="space-y-4" onSubmit={handleAplicacionSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
                Finca
                <select
                  required
                  value={aplicacionData.fincaId}
                  onChange={(e) => setAplicacionData({ ...aplicacionData, fincaId: e.target.value, loteId: '' })}
                  className={`mt-2 ${inputCls}`}
                >
                  <option value="">Selecciona una finca</option>
                  {fincas.map((finca) => (
                    <option key={finca.id} value={finca.id}>{finca.nombre}</option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
                Lote
                <select
                  required
                  value={aplicacionData.loteId}
                  onChange={(e) => setAplicacionData({ ...aplicacionData, loteId: e.target.value })}
                  disabled={!aplicacionData.fincaId}
                  className={`mt-2 ${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">{aplicacionData.fincaId ? 'Selecciona un lote' : 'Selecciona primero una finca'}</option>
                  {getLotesByFinca(aplicacionData.fincaId).map((lote) => (
                    <option key={lote.id} value={lote.id}>{lote.nombre}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
              Insumo
              <select
                required
                value={aplicacionData.insumoId}
                onChange={(e) => setAplicacionData({ ...aplicacionData, insumoId: e.target.value })}
                className={`mt-2 ${inputCls}`}
              >
                <option value="">Selecciona un insumo</option>
                {insumos.map((insumo) => (
                  <option key={insumo.id} value={insumo.id}>{insumo.nombreComercial}</option>
                ))}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
                Fecha de aplicación
                <input
                  type="datetime-local"
                  value={aplicacionData.fecha}
                  onChange={(e) => setAplicacionData({ ...aplicacionData, fecha: e.target.value })}
                  required
                  className={`mt-2 ${inputCls}`}
                />
              </label>
              <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
                Dosis
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="Cantidad aplicada"
                  value={aplicacionData.dosis}
                  onChange={(e) => setAplicacionData({ ...aplicacionData, dosis: e.target.value })}
                  required
                  className={`mt-2 ${inputCls}`}
                />
              </label>
            </div>
            <button type="submit" disabled={actionLoading} className="btn-primary w-full sm:w-auto">
              {actionLoading ? 'Guardando...' : 'Registrar Aplicación'}
            </button>
          </form>
        </DashboardCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Riegos Recientes */}
        <DashboardCard title="Riegos recientes" subtitle="Últimos eventos registrados">
          <div className="mb-6 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
                Desde
                <input
                  type="date"
                  value={filterRiegosFrom}
                  onChange={(e) => setFilterRiegosFrom(e.target.value)}
                  className={`mt-1.5 ${inputCls}`}
                />
              </label>
              <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
                Hasta
                <input
                  type="date"
                  value={filterRiegosTo}
                  onChange={(e) => setFilterRiegosTo(e.target.value)}
                  className={`mt-1.5 ${inputCls}`}
                />
              </label>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={resetRiegosFilters}
                className="btn-secondary py-2 text-xs"
              >
                Limpiar filtros
              </button>
              <button
                type="button"
                onClick={() => setSortDescRiegos(!sortDescRiegos)}
                className="btn-secondary py-2 text-xs ml-2"
              >
                {sortDescRiegos ? 'Orden ascendente' : 'Orden descendente'}
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {sortedRiegos.slice(0, 5).map((riego) => (
              <div key={riego.id} className="rounded-2xl border border-haverts-secondary/20 bg-white/40 p-4">
                {!isOperario && editingRiegoId === riego.id ? (
                  <div className="space-y-3">
                    <div className="grid gap-2">
                      <select
                        value={editingRiegoData.loteId}
                        onChange={(e) => setEditingRiegoData({ ...editingRiegoData, loteId: e.target.value })}
                        className="w-full rounded-xl border border-haverts-secondary/30 p-2 text-xs outline-none bg-white"
                      >
                        <option value="">Selecciona un lote</option>
                        {lotes.map((lote) => (
                          <option key={lote.id} value={lote.id}>{lote.nombre} ({lote.finca?.nombre})</option>
                        ))}
                      </select>
                      <select
                        value={editingRiegoData.cultivoId}
                        onChange={(e) => setEditingRiegoData({ ...editingRiegoData, cultivoId: e.target.value })}
                        className="w-full rounded-xl border border-haverts-secondary/30 p-2 text-xs outline-none bg-white"
                      >
                        <option value="">Selecciona un cultivo</option>
                        {cultivos.map((cultivo) => (
                          <option key={cultivo.id} value={cultivo.id}>{cultivo.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <input
                        type="datetime-local"
                        value={editingRiegoData.fechaHora}
                        onChange={(e) => setEditingRiegoData({ ...editingRiegoData, fechaHora: e.target.value })}
                        className="w-full rounded-xl border border-haverts-secondary/30 p-2 text-xs outline-none bg-white"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="Litros"
                        value={editingRiegoData.amount || editingRiegoData.cantidadAguaLitros}
                        onChange={(e) => setEditingRiegoData({ ...editingRiegoData, cantidadAguaLitros: e.target.value, amount: e.target.value })}
                        className="w-full rounded-xl border border-haverts-secondary/30 p-2 text-xs outline-none bg-white"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Observaciones"
                      value={editingRiegoData.observaciones}
                      onChange={(e) => setEditingRiegoData({ ...editingRiegoData, observaciones: e.target.value })}
                      className="w-full rounded-xl border border-haverts-secondary/30 p-2 text-xs outline-none bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingRiegoId(null)} className="btn-secondary py-1.5 px-3 text-xs">Cancelar</button>
                      <button onClick={() => handleUpdateRiego(riego.id)} disabled={actionLoading} className="btn-primary py-1.5 px-3 text-xs">Guardar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-haverts-primary text-sm leading-snug">
                          {riego.lote?.nombre || 'Lote no disponible'}
                          {riego.cultivo?.nombre ? ` - ${riego.cultivo.nombre}` : ''}
                        </p>
                        <p className="text-[11px] text-haverts-primary/50 font-semibold">{new Date(riego.fechaHora).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="badge text-[10px] gap-1 py-1 px-2.5">
                          <Droplet className="h-3.5 w-3.5 text-haverts-primary" /> {riego.cantidadAguaLitros} L
                        </span>
                        {!isOperario && (
                          <div className="flex">
                            {/* Botón Clonar */}
                            <button
                              type="button"
                              onClick={() => cloneRiego(riego)}
                              className="p-1.5 text-haverts-primary/40 hover:text-haverts-primary rounded-lg transition"
                              title="Clonar"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleEditRiegoClick(riego)} className="p-1.5 text-haverts-primary/40 hover:text-haverts-primary rounded-lg transition" title="Editar">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleDeleteRiego(riego.id)} className="p-1.5 text-haverts-primary/40 hover:text-red-600 rounded-lg transition" title="Eliminar">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {riego.observaciones && <p className="mt-2 text-xs text-haverts-primary/70">{riego.observaciones}</p>}
                  </>
                )}
              </div>
            ))}
            {sortedRiegos.length === 0 && <p className="text-xs text-haverts-primary/40 font-bold text-center py-6">No hay registros de riegos.</p>}
          </div>
        </DashboardCard>

        {/* Aplicaciones Recientes */}
        <DashboardCard title="Aplicaciones recientes" subtitle="Últimos insumos aplicados">
          <div className="mb-6 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
                Desde
                <input
                  type="date"
                  value={filterAplicacionesFrom}
                  onChange={(e) => setFilterAplicacionesFrom(e.target.value)}
                  className={`mt-1.5 ${inputCls}`}
                />
              </label>
              <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
                Hasta
                <input
                  type="date"
                  value={filterAplicacionesTo}
                  onChange={(e) => setFilterAplicacionesTo(e.target.value)}
                  className={`mt-1.5 ${inputCls}`}
                />
              </label>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={resetAplicacionesFilters}
                className="btn-secondary py-2 text-xs"
              >
                Limpiar filtros
              </button>
              <button
                type="button"
                onClick={() => setSortDescAplicaciones(!sortDescAplicaciones)}
                className="btn-secondary py-2 text-xs ml-2"
              >
                {sortDescAplicaciones ? 'Orden asc.' : 'Orden desc.'}
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {isOperario && (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-haverts-secondary/20 bg-haverts-secondary/5 px-3.5 py-2">
                <span className="text-[11px] font-bold text-haverts-primary/70">Modo operario — solo lectura. Editar/eliminar requiere Productor o Administrador.</span>
              </div>
            )}
            {sortedAplicaciones.slice(0, 5).map((app) => {
              const loteInfo = lotes.find((lote) => lote.id === app.loteId);
              return (
                <div key={app.id} className="rounded-2xl border border-haverts-secondary/20 bg-white/40 p-4">
                  {!isOperario && editingAplicacionId === app.id ? (
                    <div className="space-y-3">
                      <div className="grid gap-2">
                        <select
                          value={editingAplicacionData.loteId}
                          onChange={(e) => setEditingAplicacionData({ ...editingAplicacionData, loteId: e.target.value })}
                          className="w-full rounded-xl border border-haverts-secondary/30 p-2 text-xs outline-none bg-white"
                        >
                          <option value="">Selecciona un lote</option>
                          {lotes.map((lote) => (
                            <option key={lote.id} value={lote.id}>{lote.nombre} ({lote.finca?.nombre})</option>
                          ))}
                        </select>
                        <select
                          value={editingAplicacionData.insumoId}
                          onChange={(e) => setEditingAplicacionData({ ...editingAplicacionData, insumoId: e.target.value })}
                          className="w-full rounded-xl border border-haverts-secondary/30 p-2 text-xs outline-none bg-white"
                        >
                          <option value="">Selecciona un insumo</option>
                          {insumos.map((insumo) => (
                            <option key={insumo.id} value={insumo.id}>{insumo.nombreComercial}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <input
                          type="datetime-local"
                          value={editingAplicacionData.fecha}
                          onChange={(e) => setEditingAplicacionData({ ...editingAplicacionData, fecha: e.target.value })}
                          className="w-full rounded-xl border border-haverts-secondary/30 p-2 text-xs outline-none bg-white"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="Dosis"
                          value={editingAplicacionData.dosis}
                          onChange={(e) => setEditingAplicacionData({ ...editingAplicacionData, dosis: e.target.value })}
                          className="w-full rounded-xl border border-haverts-secondary/30 p-2 text-xs outline-none bg-white"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingAplicacionId(null)} className="btn-secondary py-1.5 px-3 text-xs">Cancelar</button>
                        <button onClick={() => handleUpdateAplicacion(app.id)} disabled={actionLoading} className="btn-primary py-1.5 px-3 text-xs">Guardar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-haverts-primary text-sm leading-snug">{app.insumo?.nombreComercial || 'Insumo sin nombre'}</p>
                          <p className="text-[11px] text-haverts-primary/50 font-semibold">{new Date(app.fecha).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {app.operarioId && (
                            <span className="text-[10px] text-haverts-primary/40 font-bold uppercase">
                              Resp: {usuarios.find(u => u.id === app.operarioId)?.name || 'Usuario ' + app.operarioId}
                            </span>
                          )}
                          <span className="badge text-[10px] py-1 px-2.5">
                            Dosis {app.dosis}
                          </span>
                          {!isOperario && (
                            <div className="flex">
                              {/* Botón Clonar */}
                              <button
                                type="button"
                                onClick={() => cloneAplicacion(app)}
                                className="p-1.5 text-haverts-primary/40 hover:text-haverts-primary rounded-lg transition"
                                title="Clonar"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => handleEditAplicacionClick(app)} className="p-1.5 text-haverts-primary/40 hover:text-haverts-primary rounded-lg transition" title="Editar">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => handleDeleteAplicacion(app.id)} className="p-1.5 text-haverts-primary/40 hover:text-red-600 rounded-lg transition" title="Eliminar">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-haverts-primary/70">Finca: {loteInfo?.finca?.nombre || 'Finca desconocida'} — Lote: {loteInfo?.nombre || 'Lote desconocido'}</p>
                    </>
                  )}
                </div>
              );
            })}
            {sortedAplicaciones.length === 0 && <p className="text-xs text-haverts-primary/40 font-bold text-center py-6">No hay aplicaciones registradas.</p>}
          </div>
        </DashboardCard>

        {/* Insumos Disponibles */}
        <DashboardCard title="Insumos disponibles" subtitle="Stock reciente en la bodega">
          <div className="space-y-3">
            {insumos.slice(0, 5).map((insumo) => (
              <div key={insumo.id} className="rounded-2xl border border-haverts-secondary/20 bg-white/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-haverts-primary text-sm leading-snug">{insumo.nombreComercial}</p>
                    <p className="text-[11px] text-haverts-primary/50 font-semibold">{insumo.tipo}</p>
                  </div>
                  <span className="badge text-[10px] py-1 px-2.5 gap-1 font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5 text-haverts-primary" /> {insumo.stockActual} {insumo.unidadMedida}
                  </span>
                </div>
              </div>
            ))}
            {insumos.length === 0 && <p className="text-xs text-haverts-primary/40 font-bold text-center py-6">No hay insumos disponibles.</p>}
          </div>
        </DashboardCard>
      </div>

      {/* ==== RF38 – Vista Kanban de Lotes ==== */}
      <DashboardCard title="Lotes por etapa" subtitle="Kanban: Siembra | Crecimiento | Cosecha">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Columna Siembra */}
          <div className="bg-white/60 rounded-xl p-4 border border-haverts-secondary/20 shadow-sm">
            <h3 className="text-center font-bold text-haverts-primary mb-3">Siembra</h3>
            {lotes
              .filter(l => l.etapa === 'Siembra')
              .map(lote => (
                <div key={lote.id} className="mb-2 p-3 rounded-lg border border-haverts-secondary/30 bg-white shadow-sm">
                  <p className="font-bold text-sm text-haverts-primary">{lote.nombre}</p>
                  <p className="text-xs text-haverts-primary/60 mt-1">{lote.finca?.nombre}</p>
                </div>
              ))}
          </div>

          {/* Columna Crecimiento */}
          <div className="bg-white/60 rounded-xl p-4 border border-haverts-secondary/20 shadow-sm">
            <h3 className="text-center font-bold text-haverts-primary mb-3">Crecimiento</h3>
            {lotes
              .filter(l => l.etapa === 'Crecimiento')
              .map(lote => (
                <div key={lote.id} className="mb-2 p-3 rounded-lg border border-haverts-secondary/30 bg-white shadow-sm">
                  <p className="font-bold text-sm text-haverts-primary">{lote.nombre}</p>
                  <p className="text-xs text-haverts-primary/60 mt-1">{lote.finca?.nombre}</p>
                </div>
              ))}
          </div>

          {/* Columna Cosecha */}
          <div className="bg-white/60 rounded-xl p-4 border border-haverts-secondary/20 shadow-sm">
            <h3 className="text-center font-bold text-haverts-primary mb-3">Cosecha</h3>
            {lotes
              .filter(l => l.etapa === 'Cosecha')
              .map(lote => (
                <div key={lote.id} className="mb-2 p-3 rounded-lg border border-haverts-secondary/30 bg-white shadow-sm">
                  <p className="font-bold text-sm text-haverts-primary">{lote.nombre}</p>
                  <p className="text-xs text-haverts-primary/60 mt-1">{lote.finca?.nombre}</p>
                </div>
              ))}
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};

export default OperationsPage;