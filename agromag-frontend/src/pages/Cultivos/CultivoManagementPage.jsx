import { useState, useEffect } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
// Corregido: "componets" a "components"
import { DashboardCard } from '../../components/DashboardComponents'; 
// Corregido: Se eliminaron ToggleLeft y ToggleRight que no se usaban
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
    temperaturaOptima: '', // Corregido el typo
    humedadOptima: '',     // Corregido el typo
    imagen: null,
    imagenPreview: null,
    activo: true
  });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const API_BASE_URL = '/cultivos';
  const API_URL = `${API_BASE_URL}/todos`;

  const fetchCultivos = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_URL);
      setCultivos(res.data);
    } catch (err) {
      console.error('Error al cargar cultivos', err);
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
      temperaturaOptima: '', // Corregido
      humedadOptima: '',     // Corregido
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
        temperaturaOptima: formData.temperaturaOptima, // Corregido
        humedadOptima: formData.humedadOptima,         // Corregido
        imagen: formData.imagen,
        activo: formData.activo
      };

      if (editingId) {
        await api.put(`${API_BASE_URL}/${editingId}`, payload);
      } else {
        await api.post(API_BASE_URL, payload);
      }

      resetForm();
      fetchCultivos();
    } catch (err) {
      console.error(err);
      alert('❌ Error al guardar cultivo');
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
      temperaturaOptima: cultivo.temperaturaOptima || '', // Corregido
      humedadOptima: cultivo.humedadOptima || '',         // Corregido
      imagen: cultivo.imagen || null,
      imagenPreview: cultivo.imagen || null,
      activo: cultivo.activo ?? true
    });
    setShowForm(true);
  };

  const handleToggleActive = async (id) => {
    try {
      await api.patch(`${API_BASE_URL}/${id}/active`);
      fetchCultivos();
    } catch (error) {
      console.error('Error toggling cultivo status:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cultivo?')) {
      try {
        await api.delete(`${API_BASE_URL}/${id}`);
        fetchCultivos();
      } catch (error) {
        console.error('Error al eliminar cultivo:', error);
      }
    }
  };

  const filteredCultivos = cultivos.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.descripcion && c.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && cultivos.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-agro-emerald"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-agro-emerald/10 rounded-2xl text-agro-emerald">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Catálogo de Cultivos</h2>
            <p className="text-sm text-slate-500 font-medium">Gestiona las variedades vegetales de tu finca</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 shadow-soft hover:shadow-medium ${
            showForm ? 'bg-slate-100 text-slate-600' : 'bg-agro-emerald text-white shadow-agro-emerald/20'
          }`}
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancelar' : 'Nuevo Cultivo'}
        </button>
      </div>

      <div className="relative group max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-agro-emerald transition-colors">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="Buscar cultivos por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl outline-none focus:border-agro-emerald focus:ring-4 focus:ring-agro-emerald/10 transition-all text-slate-700 font-medium shadow-sm"
        />
      </div>

      {/* Form Section */}
      <AnimatePresence>
        {showForm && (
          <motion.div
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre Común</label>
                    <input
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-agro-emerald transition-colors"
                      placeholder="Ej. Café Arábica"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Ciclo (Días)</label>
                    <input
                      type="number"
                      value={formData.diasCosecha}
                      onChange={(e) => setFormData({ ...formData, diasCosecha: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-agro-emerald transition-colors"
                      placeholder="120"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Estado Inicial</label>
                    <select
                      value={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'true' })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-agro-emerald transition-colors"
                    >
                      <option value={true}>Activo</option>
                      <option value={false}>Inactivo</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Temperatura Óptima</label>
                    <input
                      value={formData.temperaturaOptima} // Corregido
                      onChange={(e) => setFormData({ ...formData, temperaturaOptima: e.target.value })} // Corregido
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-agro-emerald transition-colors"
                      placeholder="18°C - 24°C"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Humedad Ideal</label>
                    <input
                      value={formData.humedadOptima} // Corregido
                      onChange={(e) => setFormData({ ...formData, humedadOptima: e.target.value })} // Corregido
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-agro-emerald transition-colors"
                      placeholder="60% - 80%"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Descripción y Cuidados</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-agro-emerald transition-colors resize-none"
                    placeholder="Detalles sobre el suelo, riego y particularidades de la variedad..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
                  <div className="flex-1 w-full space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Imagen Representativa</label>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl transition-colors hover:bg-slate-100">
                      {formData.imagenPreview ? (
                        <img src={formData.imagenPreview} className="w-16 h-16 rounded-xl object-cover shadow-sm" alt="Preview" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400">
                          <Leaf className="w-6 h-6" />
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-agro-emerald file:text-white hover:file:bg-green-700 cursor-pointer" />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-8 py-4 bg-agro-emerald text-white rounded-2xl font-bold shadow-lg shadow-agro-emerald/20 hover:shadow-xl transition-all disabled:opacity-50"
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
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Información</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Parámetros</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Estado</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCultivos.map((cultivo) => (
                <tr key={cultivo.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      {cultivo.imagen ? (
                        <img src={cultivo.imagen} className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" alt={cultivo.nombre} />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                          <Leaf className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-900 leading-tight">{cultivo.nombre}</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-[200px] truncate">{cultivo.descripcion || 'Sin descripción'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg uppercase tracking-tighter">⏱️ {cultivo.diasCosecha || '?'} días</span>
                      <span className="px-2 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-lg uppercase tracking-tighter">🌡️ {cultivo.temperaturaOptima || '-'}</span> {/* Corregido */}
                      <span className="px-2 py-1 bg-cyan-50 text-cyan-600 text-[10px] font-bold rounded-lg uppercase tracking-tighter">💧 {cultivo.humedadOptima || '-'}</span> {/* Corregido */}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={() => handleToggleActive(cultivo.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                        cultivo.activo 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${cultivo.activo ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                      {cultivo.activo ? 'ACTIVO' : 'INACTIVO'}
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(cultivo)}
                        className="p-2 text-slate-400 hover:text-agro-emerald hover:bg-agro-emerald/10 rounded-xl transition-all"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cultivo.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
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
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-400">No se encontraron cultivos</h3>
              <p className="text-slate-400 text-sm">Intenta con otro término de búsqueda o registra uno nuevo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CultivoManagementPage;