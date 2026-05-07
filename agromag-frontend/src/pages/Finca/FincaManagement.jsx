import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight, ImagePlus } from 'lucide-react';

const FincaManagement = () => {
  const [fincas, setFincas] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFinca, setEditingFinca] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    tamanoHectareas: '',
    descripcion: '',
    imagen: '',
    imagenPreview: null,
    activo: true
  });

  useEffect(() => {
    loadFincas();
  }, []);

  const loadFincas = async () => {
    try {
      const [fincasResponse, lotesResponse] = await Promise.all([
        axios.get('http://localhost:9000/api/fincas'),
        axios.get('http://localhost:9000/api/lotes')
      ]);
      setFincas(fincasResponse.data);
      setLotes(lotesResponse.data);
    } catch (error) {
      console.error('Error loading fincas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLotesForFinca = (fincaId) => {
    return lotes.filter(lote => lote.finca && lote.finca.id === fincaId);
  };

  const resetForm = () => {
    setEditingFinca(null);
    setShowForm(false);
    setFormData({
      nombre: '',
      ubicacion: '',
      tamanoHectareas: '',
      descripcion: '',
      imagen: '',
      imagenPreview: null,
      activo: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        tamanoHectareas: parseFloat(formData.tamanoHectareas)
      };

      if (editingFinca) {
        await axios.put(`http://localhost:9000/api/fincas/${editingFinca.id}`, data);
      } else {
        await axios.post('http://localhost:9000/api/fincas', data);
      }

      loadFincas();
      resetForm();
    } catch (error) {
      console.error('Error saving finca:', error);
    }
  };

  const handleEdit = (finca) => {
    setEditingFinca(finca);
    setFormData({
      nombre: finca.nombre,
      ubicacion: finca.ubicacion,
      tamanoHectareas: finca.tamanoHectareas.toString(),
      descripcion: finca.descripcion || '',
      imagen: finca.imagen || '',
      imagenPreview: finca.imagen || null,
      activo: finca.activo
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta finca?')) {
      try {
        await axios.delete(`http://localhost:9000/api/fincas/${id}`);
        loadFincas();
      } catch (error) {
        console.error('Error deleting finca:', error);
      }
    }
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

  const handleToggleActive = async (id) => {
    try {
      await axios.patch(`http://localhost:9000/api/fincas/${id}/active`);
      loadFincas();
    } catch (error) {
      console.error('Error toggling finca status:', error);
    }
  };

  const filteredFincas = fincas.filter(finca =>
    finca.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    finca.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agro-emerald"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Gestión de Fincas</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-agro-emerald text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Finca
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar fincas por nombre o ubicación..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-agro-emerald focus:border-transparent"
        />
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold mb-4">
            {editingFinca ? 'Editar Finca' : 'Nueva Finca'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-agro-emerald focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-agro-emerald focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tamaño (Hectáreas)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tamanoHectareas}
                  onChange={(e) => setFormData({...formData, tamanoHectareas: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-agro-emerald focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Estado
                </label>
                <select
                  value={formData.activo}
                  onChange={(e) => setFormData({...formData, activo: e.target.value === 'true'})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-agro-emerald focus:border-transparent"
                >
                  <option value={true}>Activo</option>
                  <option value={false}>Inactivo</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-agro-emerald focus:border-transparent"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-end">
              <label className="block text-sm font-medium text-slate-700">
                Imagen de la finca
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-agro-emerald/10 text-agro-emerald">
                    <ImagePlus className="h-6 w-6" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file:mr-4 file:rounded-full file:border-0 file:bg-agro-emerald file:px-4 file:py-2 file:text-sm file:text-white"
                  />
                </div>
              </label>
            </div>
            {formData.imagenPreview && (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
                <img src={formData.imagenPreview} alt="Vista previa finca" className="h-56 w-full object-cover" />
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-agro-emerald text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                {editingFinca ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Imagen
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Tamaño (ha)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Lotes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredFincas.map((finca) => {
              const fincaLotes = getLotesForFinca(finca.id);
              return (
                <tr key={finca.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {finca.imagen ? (
                      <img src={finca.imagen} alt={finca.nombre} className="h-12 w-12 rounded-xl object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
                        Sin imagen
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {finca.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {finca.ubicacion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {finca.tamanoHectareas} ha
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {fincaLotes.length > 0 ? (
                      <div className="space-y-1">
                        {fincaLotes.slice(0, 2).map(lote => (
                          <div key={lote.id} className="text-xs bg-slate-100 px-2 py-1 rounded">
                            {lote.nombre} ({lote.extensionHectareas} ha)
                          </div>
                        ))}
                        {fincaLotes.length > 2 && (
                          <div className="text-xs text-slate-400">
                            +{fincaLotes.length - 2} más...
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Sin lotes</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      finca.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {finca.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(finca)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(finca.id)}
                      className={finca.activo ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}
                    >
                      {finca.activo ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(finca.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredFincas.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            {searchTerm ? 'No se encontraron fincas que coincidan con la búsqueda' : 'No hay fincas registradas'}
          </div>
        )}
      </div>
    </div>
  );
};

export default FincaManagement;