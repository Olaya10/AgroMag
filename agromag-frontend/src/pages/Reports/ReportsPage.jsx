import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';
import api from '../../api';
import { DashboardCard } from '../../components/DashboardComponents';
import { PageHeader, Spinner, toast } from '../../components/UIComponents';
import { BarChart3, FileText, Download, Activity } from 'lucide-react';

const ReportsPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [reports, setReports] = useState([]);
  const [reportText, setReportText] = useState('');
  const [filterDays, setFilterDays] = useState('7');
  const [dateSearch, setDateSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: 'Usuario', role: 'PRODUCTOR' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/dashboard-metrics');
      setMetrics(response.data);
    } catch (error) {
      console.error('Error cargando los datos de reporte', error);
      toast.error('No se pudo cargar la información de reportes. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedReports = localStorage.getItem('agroMagReports');
    if (storedReports) {
      try {
        setReports(JSON.parse(storedReports));
      } catch (error) {
        console.warn('No se pudieron cargar los reportes guardados:', error);
      }
    }

    try {
      const storedUser = localStorage.getItem('agroMagUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser({
          name: parsedUser.name || 'Usuario',
          role: parsedUser.role ? parsedUser.role.toUpperCase() : 'PRODUCTOR'
        });
      }
    } catch (error) {
      console.warn('No se pudo cargar el usuario actual:', error);
    }

    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('agroMagReports', JSON.stringify(reports));
  }, [reports]);

  const saveReport = () => {
    const trimmed = reportText.trim();
    if (!trimmed) {
      toast.warning('Escribe el contenido del reporte antes de guardarlo.');
      return;
    }

    const newReport = {
      id: Date.now(),
      text: trimmed,
      createdAt: new Date().toISOString(),
      author: currentUser.name || 'Usuario',
      authorRole: currentUser.role || 'PRODUCTOR'
    };

    setReports([newReport, ...reports]);
    setReportText('');
    toast.success('📝 Reporte guardado en memoria local.');
  };

  const filteredReports = reports.filter((report) => {
    if (filterDays !== 'all') {
      const days = Number(filterDays);
      const diffDays = (new Date() - new Date(report.createdAt)) / (1000 * 60 * 60 * 24);
      if (diffDays > days) {
        return false;
      }
    }

    if (dateSearch.trim()) {
      const searchValue = dateSearch.trim();
      const reportDate = new Date(report.createdAt).toISOString().split('T')[0];
      return reportDate.includes(searchValue);
    }

    return true;
  });

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const downloadReport = () => {
    if (!metrics) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    const lineHeight = 18;
    let y = margin;

    doc.setFontSize(18);
    doc.text('Reporte AgroMag', margin, y);
    doc.setFontSize(11);
    doc.setTextColor('#555');
    doc.text(`Fecha: ${new Date().toLocaleString()}`, margin, y + 24);
    y += 48;

    doc.setFontSize(13);
    doc.setTextColor('#2c3e50');
    doc.text('Resumen ejecutivo', margin, y);
    y += lineHeight;
    doc.setFontSize(10);
    doc.setTextColor('#333');
    const summaryLines = [
      `Total Registros Globales: ${metrics.totalRegistros}`,
      `Alertas Pendientes: ${metrics.alertasPendientes}`,
      `Costo Total: $${metrics.costosConsolidados?.total?.toLocaleString()}`,
      `Ingreso Bruto Estimado: $${metrics.rentabilidadEstimada?.ingresoBruto?.toLocaleString()}`,
      `Utilidad Neta: $${metrics.rentabilidadEstimada?.utilidadNeta?.toLocaleString()}`,
      `ROI Estimado: ${metrics.rentabilidadEstimada?.roi}%`,
    ];
    summaryLines.forEach((line) => {
      doc.text(line, margin, y);
      y += lineHeight;
    });

    y += lineHeight;
    const makeSection = (title, items, renderItem) => {
      if (!items || items.length === 0) return;
      if (y > 730) {
        doc.addPage();
        y = margin;
      }
      doc.setFontSize(12);
      doc.setTextColor('#2c3e50');
      doc.text(title, margin, y);
      y += lineHeight;
      doc.setFontSize(10);
      doc.setTextColor('#333');
      items.forEach((item) => {
        const text = renderItem(item);
        const wrapped = doc.splitTextToSize(text, 520);
        wrapped.forEach((line) => {
          if (y > 750) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += lineHeight;
        });
        y += 4;
      });
      y += lineHeight;
    };

    makeSection('Riegos recientes', metrics.ultimosRiegos, (riego) => `• ${formatDateTime(riego.fecha)} | Lote: ${riego.loteNombre} | ${riego.cantidad} L | ${riego.observaciones}`);
    makeSection('Aplicaciones de insumos', metrics.ultimasAplicaciones, (app) => {
      return `• ${formatDateTime(app.fecha)} | Insumo: ${app.insumoNombre} | Finca: ${app.fincaNombre} | Lote: ${app.loteNombre} | Dosis: ${app.dosis}`;
    });

    doc.save('Reporte-AgroMag.pdf');
  };

  const downloadExcel = async (type) => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/${type}/excel`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('📊 Excel descargado correctamente');
    } catch (error) {
      console.error('Error descargando el excel', error);
      toast.error('No se pudo generar el reporte Excel. Verifica que el microservicio esté activo.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/lotes/pdf', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reporte_lotes.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('📄 PDF de microservicio descargado');
    } catch (error) {
      console.error('Error descargando el PDF', error);
      toast.error('No se pudo generar el reporte PDF desde el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full rounded-2xl border border-haverts-secondary/30 bg-white/60
                    px-4 py-3 text-sm text-haverts-primary font-medium outline-none
                    placeholder:text-haverts-primary/30
                    focus:border-haverts-primary focus:ring-2 focus:ring-haverts-primary/10
                    transition-all duration-200`;

  if (!metrics && loading) return <Spinner />;

  if (!metrics) {
    return <div className="p-8 text-center text-haverts-primary/50 font-bold">Cargando métricas...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        label="Reportes"
        title="Visión analítica de campo"
        description="Extrae información clave de cultivos, riegos y aplicaciones para decisiones más rápidas."
        action={
          <div className="flex flex-wrap gap-2.5">
            <button onClick={downloadReport} disabled={loading} className="btn-secondary text-xs py-2 px-4 gap-2">
              <Download className="h-4 w-4" />
              PDF Local
            </button>
            <button onClick={downloadPdf} disabled={loading} className="btn-primary text-xs py-2 px-4 gap-2">
              <Download className="h-4 w-4" />
              PDF Microservicio
            </button>
            <button onClick={() => downloadExcel('inventory')} disabled={loading} className="btn-primary text-xs py-2 px-4 gap-2">
              <Download className="h-4 w-4" /> Excel Inventario
            </button>
            <button onClick={() => downloadExcel('lotes')} disabled={loading} className="btn-primary text-xs py-2 px-4 gap-2">
              <Download className="h-4 w-4" /> Excel Lotes
            </button>
          </div>
        }
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
          className="bg-haverts-primary text-haverts-base shadow-soft" 
          title="Resumen total" 
          subtitle="Datos rápidos de tu operación"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.24em] opacity-80">
              <BarChart3 className="h-4 w-4" /> Registros Globales
            </div>
            <div className="text-4xl font-bold">{metrics.totalRegistros}</div>
            <p className="text-xs leading-relaxed text-haverts-base/80">Total de registros generados en AgroMag.</p>
          </div>
        </DashboardCard>
        
        <DashboardCard title="Humedad Actual" subtitle="Promedio estimado en campo">
          <div className="flex items-center gap-3">
            <div className="text-4xl font-bold text-haverts-primary">65%</div>
            <span className="text-xs text-haverts-primary font-bold bg-haverts-secondary/20 px-2 py-1 rounded-lg">+2% óptimo</span>
          </div>
          <p className="mt-3 text-xs text-haverts-primary/50 font-semibold">Sensor virtual Lote Principal</p>
        </DashboardCard>
        
        <DashboardCard title="Alertas Pendientes" subtitle="Stock crítico en inventario">
          <div className="flex items-center gap-3">
            <div className="text-4xl font-bold text-red-600">
              {metrics.alertasPendientes}
            </div>
            <span className="text-xs text-red-700 font-bold bg-red-50 px-2 py-1 rounded-lg">Requiere atención</span>
          </div>
          <p className="mt-3 text-xs text-haverts-primary/50 font-semibold">Insumos bajo el umbral mínimo</p>
        </DashboardCard>

        <DashboardCard title="Última Aplicación" subtitle="Movimiento más reciente">
          {metrics.ultimaAplicacion ? (
            <div className="space-y-1">
              <div className="text-lg font-bold text-haverts-primary truncate">
                {metrics.ultimaAplicacion.insumoNombre}
              </div>
              <div className="text-xs text-haverts-primary/60 font-semibold">
                Dosis: <span className="font-bold text-haverts-primary">{metrics.ultimaAplicacion.dosis}</span>
              </div>
              <p className="text-[10px] text-haverts-primary/40 font-bold uppercase mt-1">
                {new Date(metrics.ultimaAplicacion.fecha).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="text-xs text-haverts-primary/50 font-semibold">Sin aplicaciones</p>
          )}
        </DashboardCard>
      </div>

      {/* Riego Chart Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/40 backdrop-blur-sm border border-haverts-secondary/20 rounded-[2rem] p-6 sm:p-8"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-haverts-primary/50">Análisis de Riego</p>
            <h2 className="text-xl font-bold text-haverts-primary mt-1">Agua Programada vs Ejecutada</h2>
            <p className="text-xs text-haverts-primary/60 mt-1 font-semibold">Comparativa dinámica de los últimos 7 riegos (Ejecutado vs Meta de 150L)</p>
          </div>
        </div>
        
        <div className="flex items-end gap-4 h-64 mt-4 w-full overflow-x-auto pb-4 border-b border-haverts-secondary/15">
          {metrics.riegosRecientesChart && metrics.riegosRecientesChart.map((riego, index) => {
            const ejecutado = riego.ejecutado || 0;
            const programado = riego.programado || 150; 
            const pctEjecutado = Math.min((ejecutado / Math.max(ejecutado, programado)) * 100, 100);
            const pctProgramado = Math.min((programado / Math.max(ejecutado, programado)) * 100, 100);
            
            return (
              <div key={riego.id || index} className="flex flex-col items-center gap-2 flex-1 min-w-[70px]">
                <div className="flex gap-2 items-end h-48 w-full justify-center">
                  <div className="relative w-8 bg-haverts-primary rounded-t-lg transition-all duration-300 hover:opacity-90 group" style={{ height: `${pctEjecutado}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-haverts-primary text-haverts-base text-[10px] font-bold px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {ejecutado}L
                    </div>
                  </div>
                  <div className="relative w-8 bg-haverts-secondary/20 rounded-t-lg transition-all duration-300 hover:bg-haverts-secondary/30 group" style={{ height: `${pctProgramado}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-haverts-secondary text-haverts-primary text-[10px] font-bold px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {programado}L
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-haverts-primary/50 text-center truncate w-full">
                  {riego.fechaCorta}
                </div>
              </div>
            );
          })}
          {(!metrics.riegosRecientesChart || metrics.riegosRecientesChart.length === 0) && (
            <div className="w-full h-full flex items-center justify-center text-haverts-primary/40 font-semibold">No hay datos de riego para graficar.</div>
          )}
        </div>
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-haverts-primary rounded-md"></div>
            <span className="text-xs font-bold text-haverts-primary/70">Ejecutado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-haverts-secondary/20 rounded-md"></div>
            <span className="text-xs font-bold text-haverts-primary/70">Programado (Meta)</span>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Costos Consolidados */}
        <DashboardCard title="Costos Consolidados" subtitle="Inversión en insumos">
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-haverts-primary/60 font-semibold">Fertilizantes</span>
              <span className="font-bold text-haverts-primary">${metrics.costosConsolidados?.fertilizantes?.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-haverts-primary/60 font-semibold">Pesticidas</span>
              <span className="font-bold text-haverts-primary">${metrics.costosConsolidados?.pesticidas?.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-haverts-primary/60 font-semibold">Otros</span>
              <span className="font-bold text-haverts-primary">${metrics.costosConsolidados?.otros?.toLocaleString()}</span>
            </div>
            <div className="pt-4 border-t border-haverts-secondary/20 flex items-center justify-between text-sm">
              <span className="font-bold text-haverts-primary">Total Invertido</span>
              <span className="font-bold text-red-600">${metrics.costosConsolidados?.total?.toLocaleString()}</span>
            </div>
          </div>
        </DashboardCard>

        {/* Proyección de Cosecha */}
        <DashboardCard title="Proyección de Cosecha" subtitle="Rentabilidad estimada">
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-haverts-primary/60 font-semibold">Ingreso Bruto Est.</span>
              <span className="font-bold text-haverts-primary">+${metrics.rentabilidadEstimada?.ingresoBruto?.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-haverts-primary/60 font-semibold">Costos Operativos</span>
              <span className="font-bold text-red-600">-${metrics.rentabilidadEstimada?.costosOperativos?.toLocaleString()}</span>
            </div>
            <div className="pt-4 border-t border-haverts-secondary/20 flex items-center justify-between text-sm">
              <span className="font-bold text-haverts-primary">Utilidad Neta</span>
              <span className="font-bold text-haverts-primary">${metrics.rentabilidadEstimada?.utilidadNeta?.toLocaleString()}</span>
            </div>
            <div className="mt-2 text-xs text-center font-bold text-haverts-primary/70 bg-haverts-secondary/15 py-2.5 rounded-2xl">
              ROI Estimado: <strong className="text-haverts-primary">{metrics.rentabilidadEstimada?.roi}%</strong>
            </div>
          </div>
        </DashboardCard>

        {/* Calendario Agrícola */}
        <DashboardCard title="Calendario Agrícola" subtitle={`Sugerencias para ${metrics.calendarioAgricola?.mesActual || 'Mes Actual'}`}>
          <div className="bg-haverts-secondary/15 border border-haverts-secondary/25 rounded-2xl p-4 mt-2">
            <p className="text-xs leading-relaxed text-haverts-primary font-semibold">
              💡 {metrics.calendarioAgricola?.sugerencia}
            </p>
          </div>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-haverts-primary/45">
            Ajusta estas sugerencias según las características específicas de tu región y tipo de cultivo activo.
          </p>
        </DashboardCard>
      </div>

      {/* Reportes Escritos */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/40 backdrop-blur-sm border border-haverts-secondary/20 rounded-[2rem] p-6 sm:p-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-haverts-primary/50">Reportes escritos</p>
            <h2 className="text-xl font-bold text-haverts-primary mt-1">Notas del productor y administrador</h2>
            <p className="text-xs text-haverts-primary/60 mt-1 font-semibold">Productor y administrador pueden escribir reportes libres. Filtra por días o busca por fecha.</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-haverts-primary/50">Autor actual: <strong className="text-haverts-primary">{currentUser.name}</strong> — Rol: <strong className="text-haverts-primary">{currentUser.role}</strong></p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveReport}
              className="btn-primary py-2.5 text-xs px-4 flex items-center gap-2"
            >
              <FileText className="h-4 w-4" /> Guardar reporte
            </button>
          </div>
        </div>

        <textarea
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          rows={4}
          className={`mt-6 ${inputCls} resize-none`}
          placeholder="Escribe aquí tu reporte..."
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">Filtrar por días</span>
            <select
              value={filterDays}
              onChange={(e) => setFilterDays(e.target.value)}
              className={`mt-1.5 ${inputCls}`}
            >
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
              <option value="all">Todos los reportes</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">Buscar por fecha</span>
            <input
              type="search"
              value={dateSearch}
              onChange={(e) => setDateSearch(e.target.value)}
              className={`mt-1.5 ${inputCls}`}
              placeholder="Buscar por fecha (YYYY-MM-DD)"
            />
          </label>
        </div>

        <div className="mt-8 space-y-4">
          {filteredReports.length === 0 ? (
            <p className="text-xs font-bold text-haverts-primary/40 text-center py-8">No hay reportes disponibles con los filtros seleccionados.</p>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="rounded-2xl border border-haverts-secondary/20 bg-white/40 p-5 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-haverts-primary text-sm">{report.author}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-haverts-primary/50 mt-1">
                      <span>{formatDateTime(report.createdAt)}</span>
                      <span className="badge text-[9px] py-0.5 px-2 font-bold">{report.authorRole || 'PRODUCTOR'}</span>
                    </div>
                  </div>
                  <span className="badge text-[10px] py-1 px-3">
                    Reporte libre
                  </span>
                </div>
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-haverts-primary/80 font-medium">{report.text}</p>
              </div>
            ))
          )}
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Últimos Riegos */}
        <DashboardCard title="Últimos riegos" subtitle="Últimos 5 eventos registrados">
          <div className="space-y-3 pt-2">
            {metrics.ultimosRiegos && metrics.ultimosRiegos.map((riego) => (
              <div key={riego.id} className="rounded-2xl border border-haverts-secondary/20 bg-white/40 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-haverts-primary text-sm">{riego.loteNombre}</p>
                    <p className="text-[11px] text-haverts-primary/50 font-semibold">{formatDateTime(riego.fecha)}</p>
                  </div>
                  <span className="badge text-[10px] py-1 px-2.5 gap-1 font-bold">
                    <Activity className="h-3.5 w-3.5" /> {riego.cantidad} L
                  </span>
                </div>
                {riego.observaciones && <p className="mt-2 text-xs text-haverts-primary/70">{riego.observaciones}</p>}
              </div>
            ))}
            {(!metrics.ultimosRiegos || metrics.ultimosRiegos.length === 0) && <p className="text-xs font-bold text-haverts-primary/40 text-center py-6">No hay registros de riego aún.</p>}
          </div>
        </DashboardCard>

        {/* Últimas Aplicaciones */}
        <DashboardCard title="Últimas aplicaciones" subtitle="Últimos 5 movimientos registrados">
          <div className="space-y-3 pt-2">
            {metrics.ultimasAplicaciones && metrics.ultimasAplicaciones.map((app) => (
              <div key={app.id} className="rounded-2xl border border-haverts-secondary/20 bg-white/40 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-haverts-primary text-sm">{app.insumoNombre}</p>
                    <p className="text-[11px] text-haverts-primary/50 font-semibold">{formatDateTime(app.fecha)}</p>
                  </div>
                  <span className="badge text-[10px] py-1 px-2.5 font-bold">
                    Dosis {app.dosis}
                  </span>
                </div>
                <p className="mt-2 text-xs text-haverts-primary/70 font-semibold">Finca: {app.fincaNombre} — Lote: {app.loteNombre}</p>
              </div>
            ))}
            {(!metrics.ultimasAplicaciones || metrics.ultimasAplicaciones.length === 0) && <p className="text-xs font-bold text-haverts-primary/40 text-center py-6">No hay aplicaciones registradas aún.</p>}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default ReportsPage;
