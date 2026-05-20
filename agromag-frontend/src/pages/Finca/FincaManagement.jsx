import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';
import { Spinner, EmptyState, useConfirm, toast } from '../../components/UIComponents';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, ImagePlus, Search, X, MapPin, Layers } from 'lucide-react';

const FincaManagement = () => {
  const [fincas, setFincas]           = useState([]);
  const [lotes, setLotes]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [editingFinca, setEditingFinca] = useState(null);
  const [searchTerm, setSearchTerm]   = useState('');
  const [saving, setSaving]           = useState(false);
  const { confirm, ConfirmModal }     = useConfirm();
  const [formData, setFormData]       = useState({
    nombre: '', ubicacion: '', tamanoHectareas: '',
    descripcion: '', imagen: '', imagenPreview: null, activo: true,
  });

  useEffect(() => { loadFincas(); }, []);

  const loadFincas = async () => {
    try {
      const [fincasRes, lotesRes] = await Promise.all([
        api.get('/fincas'), api.get('/lotes'),
      ]);
      setFincas(fincasRes.data);
      setLotes(lotesRes.data);
    } catch { console.error('Error cargando fincas'); }
    finally { setLoading(false); }
  };

  const getLotesForFinca = (id) => lotes.filter(l => l.finca?.id === id);

  const resetForm = () => {
    setEditingFinca(null);
    setShowForm(false);
    setFormData({
      nombre: '', ubicacion: '', tamanoHectareas: '',
      descripcion: '', imagen: '', imagenPreview: null, activo: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...formData, tamanoHectareas: parseFloat(formData.tamanoHectareas) };
      if (editingFinca) {
        await api.put(`/fincas/${editingFinca.id}`, data);
        toast.success('Finca actualizada correctamente');
      } else {
        await api.post('/fincas', data);
        toast.success('Finca registrada exitosamente');
      }
      loadFincas();
      resetForm();
    } catch { toast.error('Error al guardar la finca'); }
    finally { setSaving(false); }
  };

  const handleEdit = (finca) => {
    setEditingFinca(finca);
    setFormData({
      nombre: finca.nombre, ubicacion: finca.ubicacion,
      tamanoHectareas: finca.tamanoHectareas.toString(),
      descripcion: finca.descripcion || '',
      imagen: finca.imagen || '', imagenPreview: finca.imagen || null,
      activo: finca.activo,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const ok = await confirm('¿Eliminar esta finca? Los lotes asociados quedarán sin finca.');
    if (!ok) return;
    try {
      await api.delete(`/fincas/${id}`);
      toast.success('Finca eliminada');
      loadFincas();
    } catch { toast.error('Error al eliminar la finca'); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setFormData(prev => ({ ...prev, imagen: reader.result, imagenPreview: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleToggleActive = async (id) => {
    try {
      await api.patch(`/fincas/${id}/active`);
      loadFincas();
    } catch { toast.error('Error al cambiar el estado'); }
  };

  const filteredFincas = fincas.filter(f =>
    f.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputCls = `w-full rounded-2xl border border-haverts-secondary/30 bg-white/60
                    px-4 py-3 text-sm text-haverts-primary font-medium outline-none
                    placeholder:text-haverts-primary/30
                    focus:border-haverts-primary focus:ring-2 focus:ring-haverts-primary/10
                    transition-all duration-200`;

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <ConfirmModal />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-haverts-primary/30 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar fincas por nombre o ubicación..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`pl-11 ${inputCls}`}
          />
        </div>
        <button
          onClick={() => showForm ? resetForm() : setShowForm(true)}
          className={showForm ? 'btn-secondary' : 'btn-primary'}
        >
          {showForm ? <><X className="w-4 h-4" /> Cancelar</> : <><Plus className="w-4 h-4" /> Nueva Finca</>}
        </button>
      </div>

      {/* Formulario */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/50 backdrop-blur-sm rounded-3xl border
                            border-haverts-secondary/20 shadow-soft p-6 sm:p-8">
              <h3 className="text-lg font-bold text-haverts-primary mb-6">
                {editingFinca ? 'Editar Finca' : 'Registrar Nueva Finca'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-haverts-primary/50">
                      Nombre
                    </label>
                    <input
                      type="text" required value={formData.nombre}
                      onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                      className={inputCls} placeholder="Ej. Finca El Roble"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-haverts-primary/50">
                      Ubicación
                    </label>
                    <input
                      type="text" required value={formData.ubicacion}
                      onChange={e => setFormData({ ...formData, ubicacion: e.target.value })}
                      className={inputCls} placeholder="Municipio, departamento"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-haverts-primary/50">
                      Tamaño (hectáreas)
                    </label>
                    <input
                      type="number" step="0.01" required value={formData.tamanoHectareas}
                      onChange={e => setFormData({ ...formData, tamanoHectareas: e.target.value })}
                      className={inputCls} placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-haverts-primary/50">
                      Estado
                    </label>
                    <select
                      value={formData.activo}
                      onChange={e => setFormData({ ...formData, activo: e.target.value === 'true' })}
                      className={inputCls}
                    >
                      <option value={true}>Activo</option>
                      <option value={false}>Inactivo</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-haverts-primary/50">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={3} className={`${inputCls} resize-none`}
                    placeholder="Descripción y características de la finca..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-haverts-primary/50">
                    Imagen
                  </label>
                  <div className="flex items-center gap-4 p-4 bg-white/40 border border-dashed
                                  border-haverts-secondary/40 rounded-2xl hover:bg-white/60 transition-colors">
                    {formData.imagenPreview
                      ? <img src={formData.imagenPreview} alt="preview"
                             className="h-14 w-14 rounded-xl object-cover shadow-soft" />
                      : <div className="h-14 w-14 rounded-xl bg-haverts-secondary/10 flex items-center
                                        justify-center text-haverts-primary/30">
                          <ImagePlus className="w-6 h-6" />
                        </div>
                    }
                    <input type="file" accept="image/*" onChange={handleImageChange}
                           className="text-sm text-haverts-primary/60
                                      file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0
                                      file:text-sm file:font-bold file:bg-haverts-primary
                                      file:text-haverts-base hover:file:bg-haverts-primary/90
                                      cursor-pointer" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={saving} className="btn-primary">
                    {saving ? 'Guardando...' : editingFinca ? 'Actualizar Finca' : 'Crear Finca'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn-secondary">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de fincas — cards en lugar de tabla genérica */}
      {filteredFincas.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={searchTerm ? 'Sin resultados' : 'Sin fincas registradas'}
          description={searchTerm
            ? 'Prueba con otro término de búsqueda.'
            : 'Crea la primera finca usando el botón "Nueva Finca".'}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredFincas.map(finca => {
            const fincaLotes = getLotesForFinca(finca.id);
            return (
              <motion.div
                key={finca.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-white/50 backdrop-blur-sm rounded-3xl border border-haverts-secondary/20
                           shadow-soft hover:shadow-medium transition-all duration-200 overflow-hidden group"
              >
                {/* Imagen */}
                <div className="h-40 bg-haverts-secondary/5 relative overflow-hidden">
                  {finca.imagen ? (
                    <img src={finca.imagen} alt={finca.nombre}
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-haverts-secondary/30">
                      <Layers className="w-12 h-12" />
                    </div>
                  )}
                  {/* Badge estado */}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                                      text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm
                                      ${finca.activo
                                        ? 'bg-haverts-primary/90 text-haverts-base'
                                        : 'bg-black/40 text-white'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${finca.activo ? 'bg-haverts-accent' : 'bg-white/60'}`} />
                      {finca.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h4 className="font-bold text-haverts-primary text-lg tracking-tight mb-1">
                    {finca.nombre}
                  </h4>
                  <div className="flex items-center gap-1.5 text-haverts-primary/50 mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{finca.ubicacion}</span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <span className="badge">{finca.tamanoHectareas} ha</span>
                    <span className="badge">{fincaLotes.length} lotes</span>
                  </div>

                  {finca.descripcion && (
                    <p className="text-xs text-haverts-primary/60 leading-relaxed line-clamp-2 mb-4">
                      {finca.descripcion}
                    </p>
                  )}

                  {/* Acciones */}
                  <div className="flex items-center gap-2 pt-3 border-t border-haverts-secondary/10">
                    <button
                      onClick={() => handleEdit(finca)}
                      className="flex-1 btn-secondary py-2 text-xs"
                    >
                      <Edit className="w-3.5 h-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => handleToggleActive(finca.id)}
                      className={`p-2 rounded-xl transition-all ${
                        finca.activo
                          ? 'text-amber-600 hover:bg-amber-50'
                          : 'text-haverts-primary hover:bg-haverts-secondary/10'
                      }`}
                      title={finca.activo ? 'Desactivar' : 'Activar'}
                    >
                      {finca.activo ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(finca.id)}
                      className="p-2 rounded-xl text-haverts-primary/40 hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FincaManagement;