import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { DashboardCard } from '../../componets/DashboardComponents';
import { ImagePlus, Leaf, MapPin, Sparkles } from 'lucide-react';

const LoteManagementPage = ({ refreshFincas }) => {
  const [lotes, setLotes] = useState([]);
  const [cultivos, setCultivos] = useState([]);
  const [fincas, setFincas] = useState([]);
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
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:9000/api/finca/lotes';
  const CULTIVOS_URL = 'http://localhost:9000/api/finca/cultivos';
  const FINCAS_URL = 'http://localhost:9000/api/finca/fincas/active';

  const fetchLotes = async () => {
    try {
      const res = await axios.get(API_URL);
      setLotes(res.data);
    } catch (err) {
      console.error('Error al cargar lotes', err);
      alert('❌ Error al cargar lotes');
    }
  };

  const fetchCultivos = async () => {
    try {
      const res = await axios.get(CULTIVOS_URL);
      setCultivos(res.data);
    } catch (err) {
      console.error('Error al cargar cultivos', err);
      alert('❌ Error al cargar cultivos');
    }
  };

  const fetchFincas = async () => {
    try {
      const res = await axios.get(FINCAS_URL);
      setFincas(res.data);
    } catch (err) {
      console.error('Error al cargar fincas', err);
      alert('❌ Error al cargar fincas');
    }
  };

  useEffect(() => {
    fetchLotes();
    fetchCultivos();
    fetchFincas();
  }, [refreshFincas]);

  const resetForm = () => {
    setEditingId(null);
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

    if (!formData.nombre.trim()) {
      alert('❌ El nombre del lote es requerido');
      return;
    }

    if (!formData.finca) {
      alert('❌ Debes seleccionar una finca');
      return;
    }

    if (!formData.cultivo) {
      alert('❌ Debes seleccionar un cultivo');
      return;
    }

    setLoading(true);
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
        await axios.put(`${API_URL}/${editingId}`, payload);
        alert('🌳 Lote actualizado correctamente');
      } else {
        await axios.post(API_URL, payload);
        alert('🌳 Lote registrado correctamente en AgroMag');
      }

      resetForm();
      fetchLotes();
    } catch (err) {
      console.error(err);
      alert('❌ Error al guardar lote: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_1.45fr]">
        <DashboardCard
          title={editingId ? 'Editar lote' : 'Nuevo lote'}
          subtitle="Define los datos del lote con claridad y agrega una imagen representativa"
          action={
            editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Cancelar edición
              </button>
            )
          }
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-700">
                Nombre del lote
                <input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                  placeholder="Ej. Lote Central"
                  required
                />
              </label>
              <label className="block text-sm text-slate-700">
                Finca
                <select
                  value={formData.finca}
                  onChange={(e) => setFormData({ ...formData, finca: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                  required
                >
                  <option value="">Selecciona una finca</option>
                  {fincas.map((finca) => (
                    <option key={finca.id} value={finca.id}>{finca.nombre}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-700">
                Cultivo principal
                <select
                  value={formData.cultivo}
                  onChange={(e) => setFormData({ ...formData, cultivo: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                  required
                >
                  <option value="">Selecciona un cultivo</option>
                  {cultivos.map((cultivo) => (
                    <option key={cultivo.id} value={cultivo.id}>{cultivo.nombre}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-700">
                Extensión (ha)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.extensionHectareas}
                  onChange={(e) => setFormData({ ...formData, extensionHectareas: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                  placeholder="0.00"
                />
              </label>
              <label className="block text-sm text-slate-700">
                Etapa de desarrollo
                <select
                  value={formData.etapaDesarrollo}
                  onChange={(e) => setFormData({ ...formData, etapaDesarrollo: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                >
                  <option value="SIEMBRA">Siembra</option>
                  <option value="CRECIMIENTO">Crecimiento</option>
                  <option value="COSECHA">Cosecha</option>
                </select>
              </label>
            </div>

            <label className="block text-sm text-slate-700">
              Coordenadas / referencia
              <input
                value={formData.coordenadas}
                onChange={(e) => setFormData({ ...formData, coordenadas: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                placeholder="Ej. 10.1234, -84.5678"
              />
            </label>

            <label className="block text-sm text-slate-700">
              Observaciones
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                className="mt-2 h-28 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                placeholder="Detalles del manejo o próximas actividades"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-end">
              <label className="block text-sm text-slate-700">
                Imagen del lote
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
              <button
                type="submit"
                className="rounded-3xl bg-agro-emerald px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-agro-emerald/20 transition hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Guardando...' : editingId ? 'Actualizar lote' : 'Guardar lote'}
              </button>
            </div>

            {formData.imagenPreview && (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
                <img src={formData.imagenPreview} alt="Vista previa del lote" className="h-56 w-full object-cover" />
              </div>
            )}
          </form>
        </DashboardCard>

        <DashboardCard
          title="Lotes activos"
          subtitle="Monitorea la cartera actual y accede rápido a cada lote"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-4 font-semibold">Lote</th>
                  <th className="px-4 py-4 font-semibold">Finca</th>
                  <th className="px-4 py-4 font-semibold">Cultivo</th>
                  <th className="px-4 py-4 font-semibold">Etapa</th>
                  <th className="px-4 py-4 font-semibold">Extensión</th>
                  <th className="px-4 py-4 font-semibold">Estado</th>
                  <th className="px-4 py-4 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {lotes.map((lote) => (
                  <tr key={lote.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      {lote.imagen ? (
                        <img src={lote.imagen} alt={lote.nombre} className="h-12 w-12 rounded-xl object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
                          Sin imagen
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-900">{lote.nombre}</td>
                    <td className="px-4 py-4">{lote.finca?.nombre || 'Sin finca'}</td>
                    <td className="px-4 py-4">{lote.cultivo?.nombre || 'Sin cultivo'}</td>
                    <td className="px-4 py-4 text-slate-600">{lote.etapaDesarrollo}</td>
                    <td className="px-4 py-4">{lote.extensionHectareas ?? '-' } ha</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                        {lote.etapaDesarrollo}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => handleEdit(lote)}
                        className="mr-2 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
                {lotes.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                      No hay lotes registrados aún.
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

export default LoteManagementPage;