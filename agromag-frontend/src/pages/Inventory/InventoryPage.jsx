import { useState, useEffect } from 'react';
import api from '../../api';
import { motion } from 'framer-motion';
import { DashboardCard } from '../../components/DashboardComponents';
import { Package, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

const InventoryPage = () => {
  const [insumos, setInsumos] = useState([]);
  const [formData, setFormData] = useState({
    nombreComercial: '',
    tipo: 'FERTILIZANTE',
    stockActual: '',
    umbralCritico: '',
    unidadMedida: 'Litros'
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasAlerted, setHasAlerted] = useState(false);

  const API_URL = '/inventory/bodega/insumos';

  const fetchInsumos = async () => {
    try {
      const res = await api.get(API_URL);
      setInsumos(res.data);
    } catch (err) {
      console.error('Error al cargar la bodega', err);
    }
  };

  useEffect(() => {
    fetchInsumos();
  }, []);

  useEffect(() => {
    const critical = insumos.filter((i) => Number(i.stockActual) <= Number(i.umbralCritico));
    if (critical.length > 0 && !hasAlerted) {
      setTimeout(() => {
        alert(`⚠️ ALERTA PROACTIVA DE INVENTARIO:\nTienes ${critical.length} insumo(s) con stock bajo o crítico. Por favor, revisa la lista y reabastece pronto.`);
        setHasAlerted(true);
      }, 500);
    }
  }, [insumos, hasAlerted]);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      nombreComercial: '',
      tipo: 'FERTILIZANTE',
      stockActual: '',
      umbralCritico: '',
      unidadMedida: 'Litros'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`${API_URL}/${editingId}`, formData);
        alert('📦 Insumo actualizado con éxito');
      } else {
        await api.post(API_URL, formData);
        alert('📦 Producto registrado en el inventario');
      }
      resetForm();
      fetchInsumos();
    } catch (err) {
      alert('❌ Error al registrar insumo');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (insumo) => {
    setEditingId(insumo.id);
    setFormData({
      nombreComercial: insumo.nombreComercial,
      tipo: insumo.tipo,
      stockActual: insumo.stockActual ?? '',
      umbralCritico: insumo.umbralCritico ?? '',
      unidadMedida: insumo.unidadMedida || 'Litros'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este insumo?')) return;
    try {
      await api.delete(`${API_URL}/${id}`);
      fetchInsumos();
    } catch (err) {
      alert('❌ No se pudo eliminar el insumo.');
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
            <p className="text-sm uppercase tracking-[0.24em] text-agro-emerald font-semibold">Inventario</p>
            <h1 className="mt-3 text-3xl font-display font-bold text-slate-900">Bodega y stock inteligente</h1>
            <p className="mt-2 max-w-2xl text-slate-600">Gestiona inventario con alertas visuales y controles claros.</p>
          </div>
          <button onClick={fetchInsumos} className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-agro-emerald hover:text-agro-forest">
            <RefreshCw className="h-4 w-4" /> Actualizar stock
          </button>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        <DashboardCard
          title={editingId ? 'Editar insumo' : 'Nuevo registro'}
          subtitle="Mantén tus niveles de inventario bajo control"
          action={editingId && (
            <button onClick={resetForm} className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Cancelar</button>
          )}
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm text-slate-700">
              Nombre del producto
              <input
                value={formData.nombreComercial}
                onChange={(e) => setFormData({ ...formData, nombreComercial: e.target.value })}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                placeholder="Semillas, fertilizante, pesticida"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-700">
                Categoría
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                >
                  <option value="FERTILIZANTE">Fertilizante</option>
                  <option value="PESTICIDA">Pesticida</option>
                  <option value="FUNGICIDA">Fungicida</option>
                </select>
              </label>
              <label className="block text-sm text-slate-700">
                Unidad de medida
                <select
                  value={formData.unidadMedida}
                  onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                >
                  <option value="Litros">Litros</option>
                  <option value="Kilogramos">Kilogramos</option>
                  <option value="Gramos">Gramos</option>
                </select>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-700">
                Stock disponible
                <input
                  type="number"
                  min="0"
                  value={formData.stockActual}
                  onChange={(e) => setFormData({ ...formData, stockActual: e.target.value })}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                  placeholder="0"
                />
              </label>
              <label className="block text-sm text-slate-700">
                Umbral crítico
                <input
                  type="number"
                  min="0"
                  value={formData.umbralCritico}
                  onChange={(e) => setFormData({ ...formData, umbralCritico: e.target.value })}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                  placeholder="0"
                />
              </label>
            </div>
            <button type="submit" disabled={loading} className="rounded-3xl bg-agro-emerald px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-agro-emerald/20 transition hover:bg-green-700">
              {loading ? 'Guardando...' : editingId ? 'Actualizar insumo' : 'Agregar insumo'}
            </button>
          </form>
        </DashboardCard>

        <DashboardCard title="Resumen rápido" subtitle="Estado actual del inventario">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3 text-slate-500">
                <Package className="h-5 w-5 text-agro-emerald" />
                <p className="text-sm font-semibold uppercase tracking-[0.24em]">Productos</p>
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-900">{insumos.length}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3 text-slate-500">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <p className="text-sm font-semibold uppercase tracking-[0.24em]">Atención</p>
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-900">{insumos.filter((i) => Number(i.stockActual) <= Number(i.umbralCritico)).length}</p>
            </div>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title="Lista de insumos" subtitle="Acciones rápidas para cada elemento">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-4 text-left font-semibold">Producto</th>
                <th className="px-4 py-4 text-left font-semibold">Categoría</th>
                <th className="px-4 py-4 text-left font-semibold">Stock</th>
                <th className="px-4 py-4 text-left font-semibold">Umbral</th>
                <th className="px-4 py-4 text-left font-semibold">Unidad</th>
                <th className="px-4 py-4 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {insumos.map((insumo) => {
                const critico = Number(insumo.stockActual) <= Number(insumo.umbralCritico);
                return (
                  <tr key={insumo.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-semibold text-slate-900">{insumo.nombreComercial}</td>
                    <td className="px-4 py-4">{insumo.tipo}</td>
                    <td className={`px-4 py-4 font-semibold ${critico ? 'text-rose-600' : 'text-emerald-700'}`}>{insumo.stockActual}</td>
                    <td className="px-4 py-4">{insumo.umbralCritico}</td>
                    <td className="px-4 py-4">{insumo.unidadMedida}</td>
                    <td className="px-4 py-4">
                      <button onClick={() => handleEdit(insumo)} className="mr-2 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200">Editar</button>
                      <button onClick={() => handleDelete(insumo.id)} className="rounded-2xl bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-200">Eliminar</button>
                    </td>
                  </tr>
                );
              })}
              {insumos.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500">No hay insumos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
};

export default InventoryPage;
