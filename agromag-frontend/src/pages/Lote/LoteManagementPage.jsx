import { useState, useEffect } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardCard } from '../../components/DashboardComponents';
import { PageHeader, Spinner, EmptyState, useConfirm, toast } from '../../components/UIComponents';
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
  const { confirm, ConfirmModal } = useConfirm();

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
      toast.error('Error al cargar datos de lotes');
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
        toast.success('Lote actualizado correctamente');
      } else {
        await api.post(API_URL, payload);
        toast.success('Lote registrado exitosamente');
      }

      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar lote');
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
    document.getElementById('lote-form-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDelete = async (id) => {
    const ok = await confirm('¿Estás seguro de eliminar este lote?');
    if (!ok) return;

    try {
      await api.delete(`${API_URL}/${id}`);
      toast.success('Lote eliminado correctamente');
      fetchData();
    } catch (err) {
      console.error('Error deleting lote:', err);
      toast.error('Error al eliminar lote');
    }
  };

  const filteredLotes = lotes.filter(l => 
    l.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.finca?.nombre && l.finca.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.cultivo?.nombre && l.cultivo.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const inputCls = `w-full rounded-2xl border border-haverts-secondary/30 bg-white/60
                    px-4 py-3 text-sm text-haverts-primary font-medium outline-none
                    placeholder:text-haverts-primary/30
                    focus:border-haverts-primary focus:ring-2 focus:ring-haverts-primary/10
                    transition-all duration-200`;

  if (loading && lotes.length === 0) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      <ConfirmModal />
      
      {/* Header & Actions */}
      <PageHeader
        label="Lotes"
        title="Gestión de Lotes"
        description="Administra las divisiones productivas de tus fincas"
        action={
          <button
            onClick={() => showForm ? resetForm() : setShowForm(true)}
            className={showForm ? 'btn-secondary' : 'btn-primary'}
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? 'Cancelar' : 'Nuevo Lote'}
          </button>
        }
      />

      {/* Search Bar */}
      <div className="relative group max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-haverts-primary/30 group-focus-within:text-haverts-primary transition-colors">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="Buscar por lote, finca o cultivo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`pl-12 ${inputCls}`}
        />
      </div>

      {/* Form Section */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            id="lote-form-container"
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
                    <label className="text-xs font-bold text-haverts-primary/60 uppercase tracking-wider ml-1">Nombre del Lote</label>
                    <input
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className={inputCls}
                      placeholder="Ej. Sector Norte 01"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-haverts-primary/60 uppercase tracking-wider ml-1">Finca Asignada</label>
                    <select
                      required
                      value={formData.finca}
                      onChange={(e) => setFormData({ ...formData, finca: e.target.value })}
                      className={inputCls}
                    >
                      <option value="">Seleccionar Finca</option>
                      {fincas.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-haverts-primary/60 uppercase tracking-wider ml-1">Cultivo</label>
                    <select
                      required
                      value={formData.cultivo}
                      onChange={(e) => setFormData({ ...formData, cultivo: e.target.value })}
                      className={inputCls}
                    >
                      <option value="">Seleccionar Cultivo</option>
                      {cultivos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-haverts-primary/60 uppercase tracking-wider ml-1">Extensión (ha)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.extensionHectareas}
                      onChange={(e) => setFormData({ ...formData, extensionHectareas: e.target.value })}
                      className={inputCls}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-haverts-primary/60 uppercase tracking-wider ml-1">Etapa Actual</label>
                    <select
                      value={formData.etapaDesarrollo}
                      onChange={(e) => setFormData({ ...formData, etapaDesarrollo: e.target.value })}
                      className={inputCls}
                    >
                      <option value="SIEMBRA">Siembra</option>
                      <option value="CRECIMIENTO">Crecimiento</option>
                      <option value="COSECHA">Cosecha</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-haverts-primary/60 uppercase tracking-wider ml-1">Ubicación (GPS)</label>
                    <input
                      value={formData.coordenadas}
                      onChange={(e) => setFormData({ ...formData, coordenadas: e.target.value })}
                      className={inputCls}
                      placeholder="Coordenadas"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-haverts-primary/60 uppercase tracking-wider ml-1">Notas de Campo</label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    rows={2}
                    className={`${inputCls} resize-none`}
                    placeholder="Alguna observación relevante..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
                  <div className="flex-1 w-full space-y-2">
                    <label className="text-xs font-bold text-haverts-primary/60 uppercase tracking-wider ml-1">Foto del Terreno</label>
                    <div className="flex items-center gap-4 p-4 bg-white/40 border border-dashed border-haverts-secondary/40 rounded-2xl hover:bg-white/60 transition-colors">
                      {formData.imagenPreview ? (
                        <img src={formData.imagenPreview} className="w-16 h-16 rounded-xl object-cover shadow-sm" alt="Preview" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-haverts-secondary/10 flex items-center justify-center text-haverts-primary/30">
                          <ImagePlus className="w-6 h-6" />
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
                    {saving ? 'Guardando...' : editingId ? 'Actualizar Lote' : 'Guardar Lote'}
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
                <th className="table-th px-6">Identificación</th>
                <th className="table-th px-6">Asignación</th>
                <th className="table-th px-6">Detalles</th>
                <th className="table-th px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-haverts-secondary/10">
              {filteredLotes.map((lote) => (
                <tr key={lote.id} className="group hover:bg-haverts-secondary/5 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      {lote.imagen ? (
                        <img src={lote.imagen} className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" alt={lote.nombre} />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-haverts-secondary/10 flex items-center justify-center text-haverts-secondary/30">
                          <Layers className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-haverts-primary leading-tight">{lote.nombre}</h4>
                        <div className="flex items-center gap-1 text-haverts-primary/45 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{lote.coordenadas || 'Sin GPS'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-haverts-primary/50 font-medium">Finca:</span>
                        <span className="text-haverts-primary font-bold">{lote.finca?.nombre || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-haverts-primary/50 font-medium">Cultivo:</span>
                        <span className="text-haverts-primary font-bold flex items-center gap-1">
                          <Leaf className="w-3 h-3 text-haverts-secondary" />
                          {lote.cultivo?.nombre || '-'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-haverts-secondary/20 text-haverts-primary text-[10px] font-bold rounded-lg uppercase tracking-tighter">{lote.etapaDesarrollo}</span>
                      <span className="px-2 py-1 bg-haverts-accent text-haverts-primary text-[10px] font-bold rounded-lg uppercase tracking-tighter">{lote.extensionHectareas} HA</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(lote)}
                        className="p-2 text-haverts-primary/40 hover:text-haverts-primary hover:bg-haverts-secondary/10 rounded-xl transition-all"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(lote.id)}
                        className="p-2 text-haverts-primary/40 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
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
            <div className="py-20">
              <EmptyState
                icon={Layers}
                title="No se encontraron lotes"
                description="Prueba con otro término o registra un nuevo lote."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoteManagementPage;