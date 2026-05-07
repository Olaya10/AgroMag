import { useState, useEffect } from 'react';
import axios from 'axios';
import { DashboardCard } from '../../componets/DashboardComponents';
import { ImagePlus } from 'lucide-react';

const NovedadesPage = () => {
  const [fincas, setFincas] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [novedades, setNovedades] = useState([]);
  const [allNovedades, setAllNovedades] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [novedadData, setNovedadData] = useState({ fincaId: '', loteId: '', titulo: '', descripcion: '', fotoUrl: '' });
  const [novedadUploadLabel, setNovedadUploadLabel] = useState('Adjunta foto (opcional)');

  const fetchFincas = async () => {
    try {
      const res = await axios.get('http://localhost:9000/api/fincas');
      setFincas(res.data);
    } catch (err) {
      console.error('Error al cargar fincas', err);
    }
  };

  const fetchLotes = async () => {
    try {
      const res = await axios.get('http://localhost:9000/api/lotes');
      setLotes(res.data);
    } catch (err) {
      console.error('Error al cargar lotes', err);
    }
  };

  const getLotesByFinca = (fincaId) => {
    if (!fincaId) return [];
    return lotes.filter((lote) => lote.finca?.id === Number(fincaId));
  };

  const fetchNovedadesForLote = async (loteId) => {
    if (!loteId) {
      setNovedades([]);
      return;
    }
    try {
      const res = await axios.get(`http://localhost:9000/api/novedades/lote/${loteId}`);
      setNovedades(res.data);
    } catch (err) {
      console.error('Error al cargar eventos del lote', err);
      setNovedades([]);
    }
  };

  const fetchAllNovedades = async () => {
    try {
      const allNov = [];
      for (const lote of lotes) {
        try {
          const res = await axios.get(`http://localhost:9000/api/novedades/lote/${lote.id}`);
          allNov.push(...res.data);
        } catch (err) {
          console.warn(`No se pudieron cargar novedades del lote ${lote.id}`);
        }
      }
      setAllNovedades(allNov);
    } catch (err) {
      console.error('Error al cargar todas las novedades', err);
    }
  };

  useEffect(() => {
    fetchFincas();
    fetchLotes();
    fetchAllNovedades();
  }, []);

  useEffect(() => {
    if (lotes.length > 0) {
      fetchAllNovedades();
    }
  }, [lotes]);

  useEffect(() => {
    if (novedadData.loteId) {
      fetchNovedadesForLote(novedadData.loteId);
    }
  }, [novedadData.loteId]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNovedadData((prev) => ({ ...prev, fotoUrl: reader.result }));
      setNovedadUploadLabel(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleNovedadSubmit = async (e) => {
    e.preventDefault();
    if (!novedadData.loteId) {
      alert('Selecciona un lote para registrar la novedad.');
      return;
    }
    setActionLoading(true);
    try {
      await axios.post('http://localhost:9000/api/novedades', {
        titulo: novedadData.titulo,
        descripcion: novedadData.descripcion,
        fotoUrl: novedadData.fotoUrl,
        lote: { id: Number(novedadData.loteId) }
      });
      alert('Novedad registrada correctamente');
      setNovedadData({ fincaId: '', loteId: '', titulo: '', descripcion: '', fotoUrl: '' });
      setNovedadUploadLabel('Adjunta foto (opcional)');
      fetchNovedadesForLote(novedadData.loteId);
      fetchAllNovedades();
    } catch (error) {
      console.error('Error al registrar la novedad', error);
      alert('❌ Error al registrar la novedad');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <DashboardCard title="Eventos imprevistos" subtitle="Registra notas y fotos por lote">
        <form className="space-y-4" onSubmit={handleNovedadSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-slate-700">
              Finca
              <select
                value={novedadData.fincaId}
                onChange={(e) => setNovedadData({ ...novedadData, fincaId: e.target.value, loteId: '' })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
              >
                <option value="">Selecciona una finca</option>
                {fincas.map((finca) => (
                  <option key={finca.id} value={finca.id}>{finca.nombre}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-slate-700">
              Lote
              <select
                required
                value={novedadData.loteId}
                onChange={(e) => setNovedadData({ ...novedadData, loteId: e.target.value })}
                disabled={!novedadData.fincaId}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">{novedadData.fincaId ? 'Selecciona un lote' : 'Selecciona primero una finca'}</option>
                {getLotesByFinca(novedadData.fincaId).map((lote) => (
                  <option key={lote.id} value={lote.id}>{lote.nombre}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-slate-700">
              Título de la novedad
              <input
                type="text"
                placeholder="Breve descripción"
                value={novedadData.titulo}
                onChange={(e) => setNovedadData({ ...novedadData, titulo: e.target.value })}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Foto opcional
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <ImagePlus className="h-5 w-5 text-slate-400" />
                <span className="text-sm text-slate-500">{novedadUploadLabel}</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="novedad-foto" />
                <label htmlFor="novedad-foto" className="ml-auto rounded-full bg-agro-emerald px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 cursor-pointer">Seleccionar</label>
              </div>
            </label>
          </div>
          <label className="block text-sm text-slate-700">
            Descripción
            <textarea
              placeholder="Detalle la situación encontrada"
              value={novedadData.descripcion}
              onChange={(e) => setNovedadData({ ...novedadData, descripcion: e.target.value })}
              required
              className="mt-2 h-28 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
            />
          </label>
          <button type="submit" disabled={actionLoading} className="rounded-3xl bg-agro-emerald px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-agro-emerald/20 transition hover:bg-green-700">
            {actionLoading ? 'Guardando...' : 'Registrar Novedad'}
          </button>
        </form>

        {novedades.length > 0 ? (
          <div className="mt-6 space-y-4">
            {novedades.slice(-3).reverse().map((evento) => (
              <div key={evento.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{evento.titulo}</p>
                    <p className="text-xs text-slate-500">{new Date(evento.fecha).toLocaleString()}</p>
                  </div>
                  {evento.fotoUrl && (
                    <img src={evento.fotoUrl} alt="Foto de novedad" className="h-16 w-16 rounded-2xl object-cover" />
                  )}
                </div>
                <p className="mt-3 text-sm text-slate-600">{evento.descripcion}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-slate-500">Selecciona un lote para revisar eventos recientes.</p>
        )}
      </DashboardCard>

      <DashboardCard title="Novedades recientes" subtitle="Eventos imprevistos registrados en la finca">
        {allNovedades.length > 0 ? (
          <div className="space-y-4">
            {allNovedades.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((evento) => {
              const loteInfo = lotes.find((lote) => lote.id === evento.lote?.id);
              return (
                <div key={evento.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{evento.titulo}</p>
                      <p className="text-xs text-slate-500">{new Date(evento.fecha).toLocaleString()}</p>
                      <p className="mt-2 text-xs font-medium text-slate-700">
                        📍 {loteInfo?.finca?.nombre || 'Finca desconocida'} — {loteInfo?.nombre || 'Lote desconocido'}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">{evento.descripcion}</p>
                    </div>
                    {evento.fotoUrl && (
                      <img src={evento.fotoUrl} alt="Foto de novedad" className="h-20 w-20 rounded-2xl object-cover flex-shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No hay novedades registradas aún.</p>
        )}
      </DashboardCard>
    </div>
  );
};

export default NovedadesPage;
