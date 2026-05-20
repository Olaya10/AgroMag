import { useState, useEffect } from 'react';
import api from '../../api';
import { DashboardCard } from '../../components/DashboardComponents';
import { PageHeader, Spinner, EmptyState, useConfirm, toast } from '../../components/UIComponents';
import { Package, AlertTriangle, RefreshCw } from 'lucide-react';

const InventoryPage = () => {
  const [insumos, setInsumos] = useState([]);
  const [formData, setFormData] = useState({
    nombreComercial: '', tipo: 'FERTILIZANTE',
    stockActual: '', umbralCritico: '', unidadMedida: 'Litros',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { confirm, ConfirmModal } = useConfirm();

  const API_URL = '/inventory/bodega/insumos';

  const fetchInsumos = async () => {
    try {
      const res = await api.get(API_URL);
      setInsumos(res.data);
    } catch (err) {
      console.error('Error al cargar la bodega', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInsumos(); }, []);

  // Alerta visual (no bloqueante) para stock crítico
  useEffect(() => {
    const critical = insumos.filter(
      i => Number(i.stockActual) <= Number(i.umbralCritico)
    );
    if (critical.length > 0) {
      toast.warning(
        `${critical.length} insumo(s) con stock bajo o crítico. Revisa la lista.`
      );
    }
  }, [insumos.length]);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      nombreComercial: '', tipo: 'FERTILIZANTE',
      stockActual: '', umbralCritico: '', unidadMedida: 'Litros',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`${API_URL}/${editingId}`, formData);
        toast.success('Insumo actualizado correctamente');
      } else {
        await api.post(API_URL, formData);
        toast.success('Producto registrado en el inventario');
      }
      resetForm();
      fetchInsumos();
    } catch {
      toast.error('Error al guardar el insumo');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (insumo) => {
    setEditingId(insumo.id);
    setFormData({
      nombreComercial: insumo.nombreComercial,
      tipo: insumo.tipo,
      stockActual: insumo.stockActual ?? '',
      umbralCritico: insumo.umbralCritico ?? '',
      unidadMedida: insumo.unidadMedida || 'Litros',
    });
    document.getElementById('inv-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDelete = async (id) => {
    const ok = await confirm('¿Eliminar este insumo del inventario?');
    if (!ok) return;
    try {
      await api.delete(`${API_URL}/${id}`);
      toast.success('Insumo eliminado');
      fetchInsumos();
    } catch {
      toast.error('No se pudo eliminar el insumo.');
    }
  };

  const inputCls = `w-full rounded-2xl border border-haverts-secondary/30 bg-white/60
                    px-4 py-3 text-sm text-haverts-primary font-medium outline-none
                    placeholder:text-haverts-primary/30
                    focus:border-haverts-primary focus:ring-2 focus:ring-haverts-primary/10
                    transition-all duration-200`;

  const criticalCount = insumos.filter(
    i => Number(i.stockActual) <= Number(i.umbralCritico)
  ).length;

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <ConfirmModal />

      <PageHeader
        label="Inventario"
        title="Bodega y stock inteligente"
        description="Gestiona inventario con alertas visuales y controles claros."
        action={
          <button onClick={fetchInsumos} className="btn-secondary gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualizar stock
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        {/* Formulario */}
        <DashboardCard
          title={editingId ? 'Editar insumo' : 'Nuevo registro'}
          subtitle="Mantén tus niveles de inventario bajo control"
          action={editingId && (
            <button onClick={resetForm} className="btn-ghost text-xs">Cancelar</button>
          )}
        >
          <form id="inv-form" className="space-y-4" onSubmit={handleSubmit}>
            <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
              Nombre del producto
              <input
                value={formData.nombreComercial} required
                onChange={e => setFormData({ ...formData, nombreComercial: e.target.value })}
                className={`mt-2 ${inputCls}`}
                placeholder="Semillas, fertilizante, pesticida"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
                Categoría
                <select
                  value={formData.tipo}
                  onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                  className={`mt-2 ${inputCls}`}
                >
                  <option value="FERTILIZANTE">Fertilizante</option>
                  <option value="PESTICIDA">Pesticida</option>
                  <option value="FUNGICIDA">Fungicida</option>
                </select>
              </label>
              <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
                Unidad de medida
                <select
                  value={formData.unidadMedida}
                  onChange={e => setFormData({ ...formData, unidadMedida: e.target.value })}
                  className={`mt-2 ${inputCls}`}
                >
                  <option value="Litros">Litros</option>
                  <option value="Kilogramos">Kilogramos</option>
                  <option value="Gramos">Gramos</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
                Stock disponible
                <input
                  type="number" min="0" value={formData.stockActual} required
                  onChange={e => setFormData({ ...formData, stockActual: e.target.value })}
                  className={`mt-2 ${inputCls}`} placeholder="0"
                />
              </label>
              <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
                Umbral crítico
                <input
                  type="number" min="0" value={formData.umbralCritico} required
                  onChange={e => setFormData({ ...formData, umbralCritico: e.target.value })}
                  className={`mt-2 ${inputCls}`} placeholder="0"
                />
              </label>
            </div>

            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Guardando...' : editingId ? 'Actualizar insumo' : 'Agregar insumo'}
            </button>
          </form>
        </DashboardCard>

        {/* Resumen */}
        <DashboardCard title="Resumen rápido" subtitle="Estado actual del inventario">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-haverts-secondary/20
                            bg-haverts-secondary/5 p-5">
              <div className="flex items-center gap-2.5 text-haverts-primary/60 mb-3">
                <Package className="h-5 w-5 text-haverts-primary" />
                <p className="text-xs font-bold uppercase tracking-[0.2em]">Productos</p>
              </div>
              <p className="text-3xl font-bold text-haverts-primary">{insumos.length}</p>
            </div>
            <div className={`rounded-2xl border p-5 transition-colors ${
              criticalCount > 0
                ? 'border-amber-200 bg-amber-50'
                : 'border-haverts-secondary/20 bg-haverts-secondary/5'
            }`}>
              <div className="flex items-center gap-2.5 mb-3">
                <AlertTriangle className={`h-5 w-5 ${criticalCount > 0 ? 'text-amber-500' : 'text-haverts-primary/30'}`} />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-haverts-primary/60">
                  Atención
                </p>
              </div>
              <p className={`text-3xl font-bold ${criticalCount > 0 ? 'text-amber-600' : 'text-haverts-primary'}`}>
                {criticalCount}
              </p>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Tabla */}
      <DashboardCard title="Lista de insumos" subtitle="Acciones rápidas para cada elemento">
        {insumos.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Bodega vacía"
            description="Registra el primer insumo usando el formulario de la izquierda."
          />
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="table-header">
                  <th className="table-th">Producto</th>
                  <th className="table-th">Categoría</th>
                  <th className="table-th">Stock</th>
                  <th className="table-th">Umbral</th>
                  <th className="table-th">Unidad</th>
                  <th className="table-th text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {insumos.map(insumo => {
                  const critico = Number(insumo.stockActual) <= Number(insumo.umbralCritico);
                  return (
                    <tr key={insumo.id} className="table-row">
                      <td className="table-td font-bold text-haverts-primary">
                        {insumo.nombreComercial}
                      </td>
                      <td className="table-td text-haverts-primary/70">{insumo.tipo}</td>
                      <td className={`table-td font-bold ${critico ? 'text-red-600' : 'text-haverts-primary'}`}>
                        {insumo.stockActual}
                        {critico && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full
                                           text-[9px] font-bold bg-red-100 text-red-600 uppercase">
                            Crítico
                          </span>
                        )}
                      </td>
                      <td className="table-td text-haverts-primary/70">{insumo.umbralCritico}</td>
                      <td className="table-td text-haverts-primary/70">{insumo.unidadMedida}</td>
                      <td className="table-td">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(insumo)}
                            className="px-3 py-1.5 rounded-xl bg-haverts-secondary/10
                                       text-haverts-primary text-xs font-bold
                                       hover:bg-haverts-secondary/20 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(insumo.id)}
                            className="btn-danger px-3 py-1.5 text-xs"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>
    </div>
  );
};

export default InventoryPage;
