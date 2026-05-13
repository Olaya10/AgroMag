import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../api';
import { DashboardCard } from '../../components/DashboardComponents';
import { ImagePlus, MapPin, Calendar } from 'lucide-react';

/**
 * Reusable sub-component to display a novelty entry
 */
const NoveltyCard = ({ evento, showLocation = false }) => {
  const formattedDate = evento.fecha 
    ? new Date(evento.fecha).toLocaleString('es-CO', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      }) 
    : 'Sin fecha';

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition-all hover:shadow-md hover:border-agro-emerald/30 group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-agro-emerald">
             <Calendar className="h-3.5 w-3.5" />
             <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{formattedDate}</p>
          </div>
          
          <h4 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-agro-emerald transition-colors">
            {evento.titulo}
          </h4>

          {showLocation && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 w-fit px-3 py-1 rounded-full">
              <MapPin className="h-3 w-3" />
              <span>{evento.lote?.finca?.nombre || 'Finca desconocida'}</span>
              <span className="text-slate-300">•</span>
              <span>{evento.lote?.nombre || 'Lote desconocido'}</span>
            </div>
          )}
          
          <p className="text-sm text-slate-600 leading-relaxed pt-1">
            {evento.descripcion}
          </p>
        </div>

        {evento.fotoUrl && (
          <div className="relative group/img flex-shrink-0">
            <img 
              src={evento.fotoUrl} 
              alt="Evidencia" 
              className="h-24 w-24 rounded-2xl object-cover shadow-sm ring-1 ring-slate-200" 
            />
          </div>
        )}
      </div>
    </div>
  );
};

const NovedadesPage = () => {
  const [fincas, setFincas] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [novedadesLote, setNovedadesLote] = useState([]);
  const [allNovedades, setAllNovedades] = useState([]);
  
  const [actionLoading, setActionLoading] = useState(false);
  const [lotesLoading, setLotesLoading] = useState(false);
  
  const [novedadData, setNovedadData] = useState({ 
    fincaId: '', 
    loteId: '', 
    titulo: '', 
    descripcion: '', 
    fotoUrl: '' 
  });
  const [novedadUploadLabel, setNovedadUploadLabel] = useState('Adjunta foto (opcional)');

  // Data fetching
  const fetchFincas = async () => {
    try {
      const res = await api.get('/fincas');
      setFincas(res.data || []);
    } catch (err) {
      console.error('Error al cargar fincas', err);
    }
  };

  const fetchLotesByFinca = async (fincaId) => {
    if (!fincaId) {
      setLotes([]);
      return;
    }
    setLotesLoading(true);
    try {
      const res = await api.get(`/lotes/finca/${fincaId}`);
      setLotes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error al cargar lotes de la finca', err);
      setLotes([]);
    } finally {
      setLotesLoading(false);
    }
  };

  const fetchNovedadesForLote = async (loteId) => {
    if (!loteId) {
      setNovedadesLote([]);
      return;
    }
    try {
      const res = await api.get(`/novedades/lote/${loteId}`);
      setNovedadesLote(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error al cargar eventos del lote', err);
      setNovedadesLote([]);
    }
  };

  const fetchAllNovedades = useCallback(async () => {
    try {
      const res = await api.get('/novedades');
      setAllNovedades(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error al cargar todas las novedades', err);
      setAllNovedades([]);
    }
  }, []);

  // Lifecycle
  useEffect(() => {
    fetchFincas();
    fetchAllNovedades();
  }, [fetchAllNovedades]);

  useEffect(() => {
    if (novedadData.loteId) {
      fetchNovedadesForLote(novedadData.loteId);
    } else {
      setNovedadesLote([]);
    }
  }, [novedadData.loteId]);

  // Handlers
  const handleFincaChange = (e) => {
    const fincaId = e.target.value;
    setNovedadData(prev => ({ ...prev, fincaId, loteId: '' }));
    fetchLotesByFinca(fincaId);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('⚠️ La imagen es demasiado grande. El límite es 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNovedadData(prev => ({ ...prev, fotoUrl: reader.result }));
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
    const savedLoteId = novedadData.loteId;
    
    try {
      await api.post('/novedades', {
        titulo: novedadData.titulo,
        descripcion: novedadData.descripcion,
        fotoUrl: novedadData.fotoUrl || null,
        lote: { id: Number(savedLoteId) }
      });
      
      alert('Novedad registrada correctamente');
      setNovedadUploadLabel('Adjunta foto (opcional)');
      
      // Update lists
      fetchNovedadesForLote(savedLoteId);
      fetchAllNovedades();
      
      // Clear specific form fields but keep context
      setNovedadData(prev => ({ ...prev, titulo: '', descripcion: '', fotoUrl: '' }));
      
    } catch (error) {
      console.error('Error al registrar la novedad', error);
      const msg = error.response?.data || 'Error desconocido';
      alert(`❌ ${typeof msg === 'string' ? msg : 'Error al registrar la novedad'}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Memoized sorted list
  const sortedAllNovedades = useMemo(() => {
    return [...allNovedades].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [allNovedades]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DashboardCard title="Eventos imprevistos" subtitle="Registra notas y fotos por lote">
        <form className="space-y-6" onSubmit={handleNovedadSubmit}>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Finca</label>
              <select
                value={novedadData.fincaId}
                onChange={handleFincaChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-4 focus:ring-agro-emerald/10 appearance-none"
              >
                <option value="">Selecciona una finca</option>
                {fincas.map((finca) => (
                  <option key={finca.id} value={finca.id}>{finca.nombre}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Lote</label>
              <select
                required
                value={novedadData.loteId}
                onChange={(e) => setNovedadData(prev => ({ ...prev, loteId: e.target.value }))}
                disabled={!novedadData.fincaId || lotesLoading}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-4 focus:ring-agro-emerald/10 disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
              >
                <option value="">
                  {lotesLoading ? 'Cargando lotes...' : (novedadData.fincaId ? 'Selecciona un lote' : 'Primero selecciona finca')}
                </option>
                {lotes.map((lote) => (
                  <option key={lote.id} value={lote.id}>{lote.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Título</label>
              <input
                type="text"
                placeholder="Ej: Presencia de plagas, rotura de manguera..."
                value={novedadData.titulo}
                onChange={(e) => setNovedadData(prev => ({ ...prev, titulo: e.target.value }))}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-4 focus:ring-agro-emerald/10"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Foto de evidencia</label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <ImagePlus className="h-5 w-5 text-slate-400" />
                <span className="text-sm text-slate-500 truncate flex-1">{novedadUploadLabel}</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="novedad-foto" />
                <label htmlFor="novedad-foto" className="rounded-xl bg-agro-emerald px-4 py-2 text-xs font-bold text-white hover:bg-green-700 cursor-pointer shadow-sm transition-transform active:scale-95">
                  Elegir
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Descripción detallada</label>
            <textarea
              placeholder="Explique detalladamente la situación encontrada..."
              value={novedadData.descripcion}
              onChange={(e) => setNovedadData(prev => ({ ...prev, descripcion: e.target.value }))}
              required
              className="h-32 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-4 focus:ring-agro-emerald/10"
            />
          </div>

          <button 
            type="submit" 
            disabled={actionLoading} 
            className="w-full sm:w-auto rounded-2xl bg-agro-emerald px-10 py-4 text-sm font-bold text-white shadow-xl shadow-agro-emerald/20 transition-all hover:bg-green-700 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            {actionLoading ? 'Registrando...' : 'Registrar Evento'}
          </button>
        </form>

        {novedadesLote.length > 0 && (
          <div className="mt-10 pt-10 border-t border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 px-1">Eventos recientes en este lote</h3>
            <div className="grid gap-4">
              {novedadesLote.slice(-3).reverse().map((evento) => (
                <NoveltyCard key={evento.id} evento={evento} />
              ))}
            </div>
          </div>
        )}
      </DashboardCard>

      <DashboardCard title="Historial de Novedades" subtitle="Todos los eventos registrados en la finca">
        {sortedAllNovedades.length > 0 ? (
          <div className="space-y-5">
            {sortedAllNovedades.map((evento) => (
              <NoveltyCard key={evento.id} evento={evento} showLocation={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-500">No hay novedades registradas aún.</p>
          </div>
        )}
      </DashboardCard>
    </div>
  );
};

export default NovedadesPage;
