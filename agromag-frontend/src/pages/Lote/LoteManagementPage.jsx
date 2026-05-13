import { useState, useEffect } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
// Corregido: "componets" a "components"
import { DashboardCard } from '../../components/DashboardComponents'; 
import { ImagePlus, MapPin, Plus, Edit, Trash2, Search, X, Layers, Leaf } from 'lucide-react';

const LoteManagementPage = ({ refreshFincas }) => {
  const [lotes, setLotes] = useState([]);
  const [cultivos, setCultivos] = useState([]);
  const [fincas, setFincas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    finca: '',
    cultivo: '',
    extensionHectareas: '',
    coordenadas: '',
    etapaDesarrollo: 'SIEMBRA',
    observaciones: '',
    imagen: null,
    imagenPreview: null
  });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const API_URL = '/lotes';
  const CULTIVOS_URL = '/cultivos';
  const FINCAS_URL = '/fincas/active';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lotesRes, cultivosRes, fincasRes] = await Promise.all([
        api.get(API_URL),
        api.get(CULTIVOS_URL),
        api.get(FINCAS_URL)
      ]);
      setLotes(lotesRes.data);
      setCultivos(cultivosRes.data);
      setFincas(fincasRes.data);
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshFincas]);

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      nombre: '',
      finca: '',
      cultivo: '',
      extensionHectareas: '',
      coordenadas: '',
      etapaDesarrollo: 'SIEMBRA',
      observaciones: '',
      imagen: null,
      imagenPreview: null
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
    if (!formData.nombre.trim() || !formData.finca || !formData.cultivo) return;

    setSaving(true);
    try {
      const payload = {
        nombre: formData.nombre,
        finca: { id: Number(formData.finca) },
        cultivo: { id: Number(formData.cultivo) },
        extensionHectareas: parseFloat(formData.extensionHectareas) || 0,
        coordenadas: formData.coordenadas,
        etapaDesarrollo: formData.etapaDesarrollo,
        observaciones: formData.observaciones,
        imagen: formData.imagen
      };

      if (editingId) {
        await api.put(`${API_URL}/${editingId}`, payload);
      } else {
        await api.post(API_URL, payload);
      }

      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      alert('❌ Error al guardar lote');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (lote) => {
    setEditingId(lote.id);
    setFormData({
      nombre: lote.nombre,
      finca: lote.finca?.id || '',
      cultivo: lote.cultivo?.id || '',
      extensionHectareas: lote.extensionHectareas || '',
      coordenadas: lote.coordenadas || '',
      etapaDesarrollo: lote.etapaDesarrollo || 'SIEMBRA',
      observaciones: lote.observaciones || '',
      imagen: lote.imagen || null,
      imagenPreview: lote.imagen || null
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este lote?')) {
      try {
        await api.delete(`${API_URL}/${id}`);
        fetchData();
      } catch (err) {
        console.error('Error deleting lote:', err);
      }
    }
  };

  const filteredLotes = lotes.filter(l => 
    l.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.finca?.nombre && l.finca.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.cultivo?.nombre && l.cultivo.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && lotes.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-agro-emerald"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-agro-emerald/10 rounded-2xl text-agro-emerald">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Gestión de Lotes</h2>
            <p className="text-sm text-slate-500 font-medium">Administra las divisiones productivas de tus fincas</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 shadow-soft hover:shadow-medium ${
            showForm ? 'bg-slate-100 text-slate-600' : 'bg-agro-emerald text-white shadow-agro-emerald/20'
          }`}
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancelar' : 'Nuevo Lote'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-agro-emerald transition-colors">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="Buscar por lote, finca o cultivo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-agro-emerald focus:ring-4 focus:ring-agro-emerald/10 transition-all text-slate-700 font-medium shadow-sm"
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
              title={editingId ? 'Actualizar Lote' : 'Registrar Lote'}
              subtitle="Define la ubicación y asigna un cultivo específico"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre del Lote</label>
                    <input
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-agro-emerald transition-colors"
                      placeholder="Ej. Sector Norte 01"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Finca Asignada</label>
                    <select
                      required
                      value={formData.finca}
                      onChange={(e) => setFormData({ ...formData, finca: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-agro-emerald transition-colors"
                    >
                      <option value="">Seleccionar Finca</option>
                      {fincas.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Cultivo</label>
                    <select
                      required
                      value={formData.cultivo}
                      onChange={(e) => setFormData({ ...formData, cultivo: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-agro-emerald transition-colors"
                    >
                      <option value="">Seleccionar Cultivo</option>
                      {cultivos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Extensión (ha)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.extensionHectareas}
                      onChange={(e) => setFormData({ ...formData, extensionHectareas: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-agro-emerald transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Etapa Actual</label>
                    <select
                      value={formData.etapaDesarrollo}
                      onChange={(e) => setFormData({ ...formData, etapaDesarrollo: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-agro-emerald transition-colors"
                    >
                      <option value="SIEMBRA">Siembra</option>
                      <option value="CRECIMIENTO">Crecimiento</option>
                      <option value="COSECHA">Cosecha</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Ubicación (GPS)</label>
                    <input
                      value={formData.coordenadas}
                      onChange={(e) => setFormData({ ...formData, coordenadas: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-agro-emerald transition-colors"
                      placeholder="Coordenadas"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Notas de Campo</label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-agro-emerald transition-colors resize-none"
                    placeholder="Alguna observación relevante..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
                  <div className="flex-1 w-full space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Foto del Terreno</label>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl transition-colors hover:bg-slate-100">
                      {formData.imagenPreview ? (
                        <img src={formData.imagenPreview} className="w-16 h-16 rounded-xl object-cover shadow-sm" alt="Preview" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400">
                          <ImagePlus className="w-6 h-6" />
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
                    {saving ? 'Guardando...' : editingId ? 'Actualizar Lote' : 'Guardar Lote'}
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
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Identificación</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Asignación</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Detalles</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLotes.map((lote) => (
                <tr key={lote.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      {lote.imagen ? (
                        <img src={lote.imagen} className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" alt={lote.nombre} />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                          <Layers className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-900 leading-tight">{lote.nombre}</h4>
                        <div className="flex items-center gap-1 text-slate-400 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span className="text-[10px] font-medium uppercase tracking-wider">{lote.coordenadas || 'Sin GPS'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400 font-medium">Finca:</span>
                        <span className="text-slate-700 font-bold">{lote.finca?.nombre || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400 font-medium">Cultivo:</span>
                        <span className="text-agro-emerald font-bold flex items-center gap-1">
                          <Leaf className="w-3 h-3" />
                          {lote.cultivo?.nombre || '-'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg uppercase tracking-tighter">{lote.etapaDesarrollo}</span>
                      <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-lg uppercase tracking-tighter">{lote.extensionHectareas} HA</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(lote)}
                        className="p-2 text-slate-400 hover:text-agro-emerald hover:bg-agro-emerald/10 rounded-xl transition-all"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(lote.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLotes.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-400">No se encontraron lotes</h3>
              <p className="text-slate-400 text-sm">Prueba con otro término o registra un nuevo lote.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoteManagementPage;