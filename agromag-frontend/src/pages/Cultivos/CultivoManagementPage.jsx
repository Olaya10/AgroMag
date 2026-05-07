import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { DashboardCard } from '../../componets/DashboardComponents';
import { Leaf, Layers, Sparkles, ToggleLeft, ToggleRight } from 'lucide-react';

const CultivoManagementPage = () => {
  const [cultivos, setCultivos] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    diasCosecha: '',
    temperapturOptima: '',
    humidadOptima: '',
    imagen: null,
    imagenPreview: null,
    activo: true
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:9000/api/cultivos';
  const API_URL = `${API_BASE_URL}/todos`;

  const fetchCultivos = async () => {
    try {
      const res = await axios.get(API_URL);
      setCultivos(res.data);
    } catch (err) {
      console.error('Error al cargar cultivos', err);
      alert('❌ Error al cargar cultivos');
    }
  };

  useEffect(() => {
    fetchCultivos();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      nombre: '',
      descripcion: '',
      diasCosecha: '',
      temperapturOptima: '',
      humidadOptima: '',
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
    if (!formData.nombre.trim()) {
      alert('❌ El nombre del cultivo es requerido');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        diasCosecha: parseInt(formData.diasCosecha, 10) || null,
        temperapturOptima: formData.temperapturOptima,
        humidadOptima: formData.humidadOptima,
        imagen: formData.imagen,
        activo: true
      };

      if (editingId) {
        await axios.put(`${API_BASE_URL}/${editingId}`, payload);
        alert('🌱 Cultivo actualizado correctamente');
      } else {
        await axios.post(API_BASE_URL, payload);
        alert('🌱 Cultivo registrado correctamente');
      }

      resetForm();
      fetchCultivos();
    } catch (err) {
      console.error(err);
      alert('❌ Error al guardar cultivo: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cultivo) => {
    setEditingId(cultivo.id);
    setFormData({
      nombre: cultivo.nombre,
      descripcion: cultivo.descripcion || '',
      diasCosecha: cultivo.diasCosecha ?? '',
      temperapturOptima: cultivo.temperapturOptima || '',
      humidadOptima: cultivo.humidadOptima || '',
      imagen: cultivo.imagen || null,
      imagenPreview: cultivo.imagen || null,
      activo: cultivo.activo ?? true
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleActive = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/${id}/active`);
      fetchCultivos();
    } catch (error) {
      console.error('Error toggling cultivo status:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cultivo?')) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        fetchCultivos();
      } catch (error) {
        console.error('Error al eliminar cultivo:', error);
        alert('❌ Error al eliminar cultivo: ' + (error.response?.data || error.message));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.3fr]">
        <DashboardCard
          title={editingId ? 'Editando cultivo' : 'Nuevo cultivo'}
          subtitle="Registra y ajusta información de cada variedad"
          action={
            editingId && (
              <button
                onClick={resetForm}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Cancelar editar
              </button>
            )
          }
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-slate-700">Nombre del cultivo</label>
                <input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                  placeholder="Ej. Maíz"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-slate-700">Días hasta cosecha</label>
                <input
                  type="number"
                  min="0"
                  value={formData.diasCosecha}
                  onChange={(e) => setFormData({ ...formData, diasCosecha: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                  placeholder="Ej. 120"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-slate-700">Temperatura óptima</label>
                <input
                  value={formData.temperapturOptima}
                  onChange={(e) => setFormData({ ...formData, temperapturOptima: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                  placeholder="Ej. 18-24°C"
                />
              </div>
              <div>
                <label className="text-sm text-slate-700">Humedad ideal</label>
                <input
                  value={formData.humidadOptima}
                  onChange={(e) => setFormData({ ...formData, humidadOptima: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                  placeholder="Ej. 60%"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-slate-700">Estado</label>
                <select
                  value={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'true' })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                >
                  <option value={true}>Activo</option>
                  <option value={false}>Inactivo</option>
                </select>
              </div>
            </div>

            <label className="block text-sm text-slate-700">
              Descripción
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="mt-2 h-28 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                placeholder="Notas sobre ciclo de cultivo y recomendaciones"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-end">
              <label className="block text-sm text-slate-700">
                Imagen del cultivo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-2 block w-full cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none"
                />
              </label>
              <button
                type="submit"
                className="rounded-3xl bg-agro-emerald px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-agro-emerald/20 transition hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Guardando...' : editingId ? 'Actualizar cultivo' : 'Registrar cultivo'}
              </button>
            </div>

            {formData.imagenPreview && (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
                <img src={formData.imagenPreview} alt="Vista previa cultivo" className="h-56 w-full object-cover" />
              </div>
            )}
          </form>
        </DashboardCard>

        <DashboardCard title="Cultivos registrados" subtitle="Visualiza y administra tus variedades activas">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-4 font-semibold">Imagen</th>
                  <th className="px-4 py-4 font-semibold">Cultivo</th>
                  <th className="px-4 py-4 font-semibold">Cosecha</th>
                  <th className="px-4 py-4 font-semibold">Temperatura</th>
                  <th className="px-4 py-4 font-semibold">Humedad</th>
                  <th className="px-4 py-4 font-semibold">Estado</th>
                  <th className="px-4 py-4 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {cultivos.map((cultivo) => (
                  <tr key={cultivo.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      {cultivo.imagen ? (
                        <img src={cultivo.imagen} alt={cultivo.nombre} className="h-12 w-12 rounded-xl object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
                          Sin imagen
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-900">{cultivo.nombre}</td>
                    <td className="px-4 py-4">{cultivo.diasCosecha ?? '-'}</td>
                    <td className="px-4 py-4">{cultivo.temperapturOptima || '-'}</td>
                    <td className="px-4 py-4">{cultivo.humidadOptima || '-'}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        cultivo.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {cultivo.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => handleEdit(cultivo)}
                        className="mr-2 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(cultivo.id)}
                        className={`mr-2 rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                          cultivo.activo
                            ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                      >
                        {cultivo.activo ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cultivo.id)}
                        className="rounded-2xl bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-200"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {cultivos.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                      No hay cultivos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default CultivoManagementPage;
