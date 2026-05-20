import { useState, useEffect } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardCard } from '../../components/DashboardComponents';
import { PageHeader, Spinner, EmptyState, useConfirm, toast } from '../../components/UIComponents';
import { Leaf, Plus, Edit, Trash2, Search, X } from 'lucide-react';

const CultivoManagementPage = () => {
  const [cultivos, setCultivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    diasCosecha: '',
    temperaturaOptima: '',
    humedadOptima: '',
    imagen: null,
    imagenPreview: null,
    activo: true
  });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const { confirm, ConfirmModal } = useConfirm();

  const API_BASE_URL = '/cultivos';
  const API_URL = `${API_BASE_URL}/todos`;

  const fetchCultivos = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_URL);
      setCultivos(res.data);
    } catch (err) {
      console.error('Error al cargar cultivos', err);
      toast.error('Error al cargar catálogo de cultivos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCultivos();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      nombre: '',
      descripcion: '',
      diasCosecha: '',
      temperaturaOptima: '',
      humedadOptima: '',
      imagen: null,
      imagenPreview: null,
      activo: true
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imagen: reader.result,
          imagenPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;

    setSaving(true);
    try {
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        diasCosecha: parseInt(formData.diasCosecha, 10) || null,
        temperaturaOptima: formData.temperaturaOptima,
        humedadOptima: formData.humedadOptima,
        imagen: formData.imagen,
        activo: formData.activo
      };

      if (editingId) {
        await api.put(`${API_BASE_URL}/${editingId}`, payload);
        toast.success('Variedad de cultivo actualizada correctamente');
      } else {
        await api.post(API_BASE_URL, payload);
        toast.success('Nueva variedad de cultivo registrada');
      }

      resetForm();
      fetchCultivos();
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar cultivo');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cultivo) => {
    setEditingId(cultivo.id);
    setFormData({
      nombre: cultivo.nombre,
      descripcion: cultivo.descripcion || '',
      diasCosecha: cultivo.diasCosecha ?? '',
      temperaturaOptima: cultivo.temperaturaOptima || '',
      humedadOptima: cultivo.humedadOptima || '',
      imagen: cultivo.imagen || null,
      imagenPreview: cultivo.imagen || null,
      activo: cultivo.activo ?? true
    });
    setShowForm(true);
    document.getElementById('cultivo-form-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleToggleActive = async (id) => {
    try {
      await api.patch(`${API_BASE_URL}/${id}/active`);
      toast.success('Estado del cultivo actualizado');
      fetchCultivos();
    } catch (error) {
      console.error('Error toggling cultivo status:', error);
      toast.error('Error al actualizar estado del cultivo');
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm('¿Estás seguro de eliminar este cultivo?');
    if (!ok) return;

    try {
      await api.delete(`${API_BASE_URL}/${id}`);
      toast.success('Cultivo eliminado correctamente');
      fetchCultivos();
    } catch (error) {
      console.error('Error al eliminar cultivo:', error);
      toast.error('Error al eliminar cultivo');
    }
  };

  const filteredCultivos = cultivos.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.descripcion && c.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const inputCls = `w-full rounded-2xl border border-haverts-secondary/30 bg-white/60
                    px-4 py-3 text-sm text-haverts-primary font-medium outline-none
                    placeholder:text-haverts-primary/30
                    focus:border-haverts-primary focus:ring-2 focus:ring-haverts-primary/10
                    transition-all duration-200`;

  if (loading && cultivos.length === 0) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      <ConfirmModal />

      {/* Header & Search */}
      <PageHeader
        label="Cultivos"
        title="Catálogo de Cultivos"
        description="Gestiona las variedades vegetales de tu finca"
        action={
          <button
            onClick={() => showForm ? resetForm() : setShowForm(true)}
            className={showForm ? 'btn-secondary' : 'btn-primary'}
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? 'Cancelar' : 'Nuevo Cultivo'}
          </button>
        }
      />

      <div className="relative group max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-haverts-primary/30 group-focus-within:text-haverts-primary transition-colors">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="Buscar cultivos por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`pl-12 ${inputCls}`}
        />
      </div>

      {/* Form Section */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            id="cultivo-form-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <DashboardCard
              title={editingId ? 'Editar Variedad' : 'Registrar Nueva Variedad'}
              subtitle="Completa los parámetros óptimos para el ciclo de vida del cultivo"
              className="bg-white/90"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-haverts-primary/60 uppercase tracking-wider ml-1">Nombre Común</label>
                    <input
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className={inputCls}
                      placeholder="Ej. Café Arábica"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-haverts-primary/60 uppercase tracking-wider ml-1">Ciclo (Días)</label>
                    <input
                      type="number"
                      value={formData.diasCosecha}
                      onChange={(e) => setFormData({ ...formData, diasCosecha: e.target.value })}
                      className={inputCls}
                      placeholder="120"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-haverts-primary/60 uppercase tracking-wider ml-1">Estado Inicial</label>
                    <select
                      value={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'true' })}
                      className={inputCls}
                    >
                      <option value={true}>Activo</option>
                      <option value={false}>Inactivo</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-haverts-primary/60 uppercase tracking-wider ml-1">Temperatura Óptima</label>
                    <input
                      value={formData.temperaturaOptima}
                      onChange={(e) => setFormData({ ...formData, temperaturaOptima: e.target.value })}
                      className={inputCls}
                      placeholder="18°C - 24°C"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-haverts-primary/60 uppercase tracking-wider ml-1">Humedad Ideal</label>
                    <input
                      value={formData.humedadOptima}
                      onChange={(e) => setFormData({ ...formData, humedadOptima: e.target.value })}
                      className={inputCls}
                      placeholder="60% - 80%"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-haverts-primary/60 uppercase tracking-wider ml-1">Descripción y Cuidados</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={3}
                    className={`${inputCls} resize-none`}
                    placeholder="Detalles sobre el suelo, riego y particularidades de la variedad..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
                  <div className="flex-1 w-full space-y-2">
                    <label className="text-xs font-bold text-haverts-primary/60 uppercase tracking-wider ml-1">Imagen Representativa</label>
                    <div className="flex items-center gap-4 p-4 bg-white/40 border border-dashed border-haverts-secondary/40 rounded-2xl hover:bg-white/60 transition-colors">
                      {formData.imagenPreview ? (
                        <img src={formData.imagenPreview} className="w-16 h-16 rounded-xl object-cover shadow-sm" alt="Preview" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-haverts-secondary/10 flex items-center justify-center text-haverts-primary/30">
                          <Leaf className="w-6 h-6" />
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-haverts-primary/60 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-haverts-primary file:text-haverts-base hover:file:bg-haverts-primary/90 cursor-pointer" />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary w-full sm:w-auto"
                  >
                    {saving ? 'Guardando...' : editingId ? 'Actualizar Cultivo' : 'Crear Cultivo'}
                  </button>
                </div>
              </form>
            </DashboardCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List Section */}
      <div className="bg-white/50 backdrop-blur-sm rounded-[2rem] border border-haverts-secondary/20 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="table-header">
                <th className="table-th px-6">Información</th>
                <th className="table-th px-6">Parámetros</th>
                <th className="table-th px-6 text-center">Estado</th>
                <th className="table-th px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-haverts-secondary/10">
              {filteredCultivos.map((cultivo) => (
                <tr key={cultivo.id} className="group hover:bg-haverts-secondary/5 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      {cultivo.imagen ? (
                        <img src={cultivo.imagen} className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" alt={cultivo.nombre} />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-haverts-secondary/10 flex items-center justify-center text-haverts-secondary/30">
                          <Leaf className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-haverts-primary leading-tight">{cultivo.nombre}</h4>
                        <p className="text-xs text-haverts-primary/50 mt-1 max-w-[200px] truncate">{cultivo.descripcion || 'Sin descripción'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-haverts-secondary/20 text-haverts-primary text-[10px] font-bold rounded-lg uppercase tracking-tighter">⏱️ {cultivo.diasCosecha || '?'} días</span>
                      <span className="px-2 py-1 bg-haverts-accent text-haverts-primary text-[10px] font-bold rounded-lg uppercase tracking-tighter">🌡️ {cultivo.temperaturaOptima || '-'}</span>
                      <span className="px-2 py-1 bg-haverts-secondary/20 text-haverts-primary text-[10px] font-bold rounded-lg uppercase tracking-tighter">💧 {cultivo.humedadOptima || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={() => handleToggleActive(cultivo.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                        cultivo.activo 
                          ? 'bg-haverts-secondary/35 text-haverts-primary hover:bg-haverts-secondary/50' 
                          : 'bg-haverts-secondary/10 text-haverts-primary/50 hover:bg-haverts-secondary/20'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${cultivo.activo ? 'bg-haverts-primary animate-pulse' : 'bg-haverts-primary/30'}`} />
                      {cultivo.activo ? 'ACTIVO' : 'INACTIVO'}
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(cultivo)}
                        className="p-2 text-haverts-primary/40 hover:text-haverts-primary hover:bg-haverts-secondary/10 rounded-xl transition-all"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cultivo.id)}
                        className="p-2 text-haverts-primary/40 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCultivos.length === 0 && (
            <div className="py-20">
              <EmptyState
                icon={Leaf}
                title="No se encontraron cultivos"
                description="Intenta con otro término de búsqueda o registra uno nuevo."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CultivoManagementPage;