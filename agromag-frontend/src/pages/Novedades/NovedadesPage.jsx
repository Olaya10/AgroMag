import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../api';
import { DashboardCard } from '../../components/DashboardComponents';
import { PageHeader, Spinner, EmptyState, toast } from '../../components/UIComponents';
import { ImagePlus, MapPin, Calendar, Sparkles } from 'lucide-react';

const NoveltyCard = ({ evento, showLocation = false }) => {
  const formattedDate = evento.fecha
    ? new Date(evento.fecha).toLocaleString('es-CO', {
        dateStyle: 'medium', timeStyle: 'short',
      })
    : 'Sin fecha';

  return (
    <div className="rounded-2xl border border-haverts-secondary/20 bg-white/40
                    p-5 transition-all duration-200
                    hover:shadow-soft hover:border-haverts-primary/20 group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-haverts-primary/50">
            <Calendar className="h-3.5 w-3.5" />
            <p className="text-[10px] font-bold uppercase tracking-wider">{formattedDate}</p>
          </div>
          <h4 className="font-bold text-haverts-primary text-base leading-tight
                         group-hover:text-haverts-primary/80 transition-colors">
            {evento.titulo}
          </h4>
          {showLocation && (
            <div className="flex items-center gap-1.5 text-xs font-semibold
                            text-haverts-primary/60 bg-haverts-secondary/10
                            w-fit px-3 py-1 rounded-full border border-haverts-secondary/20">
              <MapPin className="h-3 w-3" />
              <span>{evento.lote?.finca?.nombre || 'Finca desconocida'}</span>
              <span className="text-haverts-secondary">·</span>
              <span>{evento.lote?.nombre || 'Lote desconocido'}</span>
            </div>
          )}
          <p className="text-sm text-haverts-primary/70 leading-relaxed pt-0.5">
            {evento.descripcion}
          </p>
        </div>
        {evento.fotoUrl && (
          <img
            src={evento.fotoUrl}
            alt="Evidencia"
            className="h-24 w-24 rounded-2xl object-cover flex-shrink-0
                       ring-1 ring-haverts-secondary/20 shadow-soft"
          />
        )}
      </div>
    </div>
  );
};

const NovedadesPage = () => {
  const [fincas, setFincas]           = useState([]);
  const [lotes, setLotes]             = useState([]);
  const [novedadesLote, setNovedadesLote] = useState([]);
  const [allNovedades, setAllNovedades]   = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [lotesLoading, setLotesLoading]   = useState(false);
  const [novedadData, setNovedadData]     = useState({
    fincaId: '', loteId: '', titulo: '', descripcion: '', fotoUrl: '',
  });
  const [novedadUploadLabel, setNovedadUploadLabel] = useState('Adjunta foto (opcional)');

  const fetchFincas = async () => {
    try {
      const res = await api.get('/fincas');
      setFincas(res.data || []);
    } catch (err) { console.error('Error al cargar fincas', err); }
  };

  const fetchLotesByFinca = async (fincaId) => {
    if (!fincaId) { setLotes([]); return; }
    setLotesLoading(true);
    try {
      const res = await api.get(`/lotes/finca/${fincaId}`);
      setLotes(Array.isArray(res.data) ? res.data : []);
    } catch { setLotes([]); }
    finally { setLotesLoading(false); }
  };

  const fetchNovedadesForLote = async (loteId) => {
    if (!loteId) { setNovedadesLote([]); return; }
    try {
      const res = await api.get(`/novedades/lote/${loteId}`);
      setNovedadesLote(Array.isArray(res.data) ? res.data : []);
    } catch { setNovedadesLote([]); }
  };

  const fetchAllNovedades = useCallback(async () => {
    try {
      const res = await api.get('/novedades');
      setAllNovedades(Array.isArray(res.data) ? res.data : []);
    } catch { setAllNovedades([]); }
  }, []);

  useEffect(() => { fetchFincas(); fetchAllNovedades(); }, [fetchAllNovedades]);
  useEffect(() => { fetchNovedadesForLote(novedadData.loteId); }, [novedadData.loteId]);

  const handleFincaChange = (e) => {
    const fincaId = e.target.value;
    setNovedadData(prev => ({ ...prev, fincaId, loteId: '' }));
    fetchLotesByFinca(fincaId);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.warning('La imagen supera el límite de 10MB.');
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
      toast.warning('Selecciona un lote para registrar la novedad.');
      return;
    }
    setActionLoading(true);
    const savedLoteId = novedadData.loteId;
    try {
      await api.post('/novedades', {
        titulo: novedadData.titulo,
        descripcion: novedadData.descripcion,
        fotoUrl: novedadData.fotoUrl || null,
        lote: { id: Number(savedLoteId) },
      });
      toast.success('Novedad registrada correctamente');
      setNovedadUploadLabel('Adjunta foto (opcional)');
      fetchNovedadesForLote(savedLoteId);
      fetchAllNovedades();
      setNovedadData(prev => ({ ...prev, titulo: '', descripcion: '', fotoUrl: '' }));
    } catch (error) {
      const msg = error.response?.data;
      toast.error(typeof msg === 'string' ? msg : 'Error al registrar la novedad');
    } finally {
      setActionLoading(false);
    }
  };

  const sortedAllNovedades = useMemo(
    () => [...allNovedades].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
    [allNovedades]
  );

  const inputCls = `w-full rounded-2xl border border-haverts-secondary/30 bg-white/60
                    px-4 py-3.5 text-sm text-haverts-primary font-medium outline-none
                    placeholder:text-haverts-primary/30
                    focus:border-haverts-primary focus:ring-2 focus:ring-haverts-primary/10
                    transition-all duration-200`;

  return (
    <div className="space-y-6">
      <PageHeader
        label="Campo"
        title="Eventos Imprevistos"
        description="Registra notas, observaciones y fotos de eventos no planificados por lote."
      />

      <DashboardCard title="Registrar novedad" subtitle="Documenta lo que ocurre en campo">
        <form className="space-y-5" onSubmit={handleNovedadSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em]
                                text-haverts-primary/50">
                Finca
              </label>
              <select
                value={novedadData.fincaId}
                onChange={handleFincaChange}
                className={inputCls}
              >
                <option value="">Selecciona una finca</option>
                {fincas.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em]
                                text-haverts-primary/50">
                Lote
              </label>
              <select
                required value={novedadData.loteId}
                onChange={e => setNovedadData(prev => ({ ...prev, loteId: e.target.value }))}
                disabled={!novedadData.fincaId || lotesLoading}
                className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">
                  {lotesLoading ? 'Cargando lotes...'
                    : novedadData.fincaId ? 'Selecciona un lote' : 'Primero selecciona finca'}
                </option>
                {lotes.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em]
                                text-haverts-primary/50">
                Título
              </label>
              <input
                type="text" required value={novedadData.titulo}
                placeholder="Ej: Presencia de plagas, rotura de manguera..."
                onChange={e => setNovedadData(prev => ({ ...prev, titulo: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em]
                                text-haverts-primary/50">
                Foto de evidencia
              </label>
              <div className="flex items-center gap-3 rounded-2xl
                              border border-haverts-secondary/30 bg-white/60 p-3">
                <ImagePlus className="h-5 w-5 text-haverts-primary/30 flex-shrink-0" />
                <span className="text-sm text-haverts-primary/50 truncate flex-1">
                  {novedadUploadLabel}
                </span>
                <input type="file" accept="image/*" onChange={handleFileChange}
                       className="hidden" id="novedad-foto" />
                <label htmlFor="novedad-foto" className="btn-primary px-4 py-2 text-xs cursor-pointer">
                  Elegir
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.18em]
                              text-haverts-primary/50">
              Descripción detallada
            </label>
            <textarea
              required value={novedadData.descripcion}
              placeholder="Explique detalladamente la situación encontrada..."
              onChange={e => setNovedadData(prev => ({ ...prev, descripcion: e.target.value }))}
              className={`${inputCls} h-28 resize-none`}
            />
          </div>

          <button type="submit" disabled={actionLoading} className="btn-primary">
            {actionLoading ? 'Registrando...' : 'Registrar Evento'}
          </button>
        </form>

        {novedadesLote.length > 0 && (
          <div className="mt-8 pt-8 border-t border-haverts-secondary/10 space-y-4">
            <h3 className="text-sm font-bold text-haverts-primary">
              Eventos recientes en este lote
            </h3>
            <div className="grid gap-3">
              {novedadesLote.slice(-3).reverse().map(ev => (
                <NoveltyCard key={ev.id} evento={ev} />
              ))}
            </div>
          </div>
        )}
      </DashboardCard>

      <DashboardCard title="Historial de Novedades" subtitle="Todos los eventos registrados">
        {sortedAllNovedades.length > 0 ? (
          <div className="space-y-4">
            {sortedAllNovedades.map(ev => (
              <NoveltyCard key={ev.id} evento={ev} showLocation />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Sparkles}
            title="Sin novedades"
            description="Los eventos imprevistos que registres aparecerán aquí."
          />
        )}
      </DashboardCard>
    </div>
  );
};

export default NovedadesPage;
