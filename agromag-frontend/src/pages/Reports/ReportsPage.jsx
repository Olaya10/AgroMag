import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';
import api from '../../api';
import { DashboardCard } from '../../components/DashboardComponents';
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
      alert('No se pudo cargar la información de reportes. Intenta nuevamente.');
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
      alert('Escribe el contenido del reporte antes de guardarlo.');
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
    } catch (error) {
      console.error('Error descargando el excel', error);
      alert('No se pudo generar el reporte Excel. Verifica que el microservicio esté activo.');
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
    } catch (error) {
      console.error('Error descargando el PDF', error);
      alert('No se pudo generar el reporte PDF desde el servidor.');
    } finally {
      setLoading(false);
    }
  };

  if (!metrics && loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-agro-emerald border-t-transparent"></div>
      </div>
    );
  }

  if (!metrics) {
    return <div className="p-8 text-center text-slate-500">Cargando métricas...</div>;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-medium rounded-3xl p-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-agro-emerald font-semibold">Reportes</p>
            <h1 className="mt-3 text-3xl font-display font-bold text-slate-900">Visión analítica de campo</h1>
            <p className="mt-2 max-w-2xl text-slate-600">Extrae información clave de cultivos, riegos y aplicaciones para decisiones más rápidas.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={downloadReport}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-3xl border border-agro-emerald px-6 py-3 text-sm font-semibold text-agro-emerald transition hover:bg-agro-emerald/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {loading ? 'Generando...' : 'Exportar PDF (Local)'}
            </button>
            <button
              onClick={downloadPdf}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-3xl bg-agro-emerald px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-agro-emerald/20 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {loading ? 'Generando...' : 'Exportar PDF (Microservicio)'}
            </button>
            <button
              onClick={() => downloadExcel('inventory')}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-3xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              Excel Inventario
            </button>
            <button
              onClick={() => downloadExcel('lotes')}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-3xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              Excel Lotes
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-4">
        <DashboardCard className="bg-gradient-to-br from-agro-emerald to-green-600 text-white shadow-lg shadow-agro-emerald/20" title="Resumen total" subtitle="Datos rápidos de tu operación">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.24em] opacity-80"><BarChart3 className="h-4 w-4" /> Registros Globales</div>
            <div className="text-4xl font-bold">{metrics.totalRegistros}</div>
            <p className="text-sm leading-6 text-white/80">Total de registros generados en AgroMag.</p>
          </div>
        </DashboardCard>
        
        <DashboardCard title="Humedad Actual" subtitle="Promedio estimado en campo">
          <div className="flex items-center gap-3">
            <div className="text-4xl font-semibold text-slate-900">65%</div>
            <span className="text-sm text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-lg">+2% óptimo</span>
          </div>
          <p className="mt-3 text-sm text-slate-500">Sensor virtual Lote Principal</p>
        </DashboardCard>
        
        <DashboardCard title="Alertas Pendientes" subtitle="Stock crítico en inventario">
          <div className="flex items-center gap-3">
            <div className="text-4xl font-semibold text-rose-600">
              {metrics.alertasPendientes}
            </div>
            <span className="text-sm text-rose-600 font-semibold bg-rose-50 px-2 py-1 rounded-lg">Requiere atención</span>
          </div>
          <p className="mt-3 text-sm text-slate-500">Insumos bajo el umbral mínimo</p>
        </DashboardCard>

        <DashboardCard title="Última Aplicación" subtitle="Movimiento más reciente">
          {metrics.ultimaAplicacion ? (
            <div className="space-y-2">
              <div className="text-xl font-semibold text-slate-900 truncate">
                {metrics.ultimaAplicacion.insumoNombre}
              </div>
              <div className="text-sm text-slate-600">
                Dosis: <span className="font-semibold">{metrics.ultimaAplicacion.dosis}</span>
              </div>
              <p className="text-xs text-slate-500">
                {new Date(metrics.ultimaAplicacion.fecha).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Sin aplicaciones</p>
          )}
        </DashboardCard>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-medium rounded-3xl p-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-blue-600 font-semibold">Análisis de Riego</p>
            <h2 className="mt-3 text-2xl font-display font-bold text-slate-900">Agua Programada vs Ejecutada</h2>
            <p className="mt-2 text-slate-600">Comparativa dinámica de los últimos 7 riegos (Ejecutado vs Meta de 150L)</p>
          </div>
        </div>
        
        <div className="flex items-end gap-4 h-64 mt-4 w-full overflow-x-auto pb-4 border-b border-slate-200">
          {metrics.riegosRecientesChart && metrics.riegosRecientesChart.map((riego, index) => {
            const ejecutado = riego.ejecutado || 0;
            const programado = riego.programado || 150; 
            const pctEjecutado = Math.min((ejecutado / Math.max(ejecutado, programado)) * 100, 100);
            const pctProgramado = Math.min((programado / Math.max(ejecutado, programado)) * 100, 100);
            
            return (
              <div key={riego.id || index} className="flex flex-col items-center gap-2 flex-1 min-w-[60px]">
                <div className="flex gap-2 items-end h-48 w-full justify-center">
                  <div className="relative w-8 bg-blue-500 rounded-t-sm transition-all duration-500 hover:bg-blue-600 group" style={{ height: `${pctEjecutado}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {ejecutado}L
                    </div>
                  </div>
                  <div className="relative w-8 bg-slate-200 rounded-t-sm transition-all duration-500 hover:bg-slate-300 group" style={{ height: `${pctProgramado}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {programado}L
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 text-center truncate w-full">
                  {riego.fechaCorta}
                </div>
              </div>
            );
          })}
          {(!metrics.riegosRecientesChart || metrics.riegosRecientesChart.length === 0) && (
            <div className="w-full h-full flex items-center justify-center text-slate-400">No hay datos de riego para graficar.</div>
          )}
        </div>
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
            <span className="text-sm text-slate-600">Ejecutado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-200 rounded-sm"></div>
            <span className="text-sm text-slate-600">Programado (Meta)</span>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-3">
        <DashboardCard title="Costos Consolidados" subtitle="Inversión en insumos">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Fertilizantes</span>
              <span className="font-semibold text-slate-900">${metrics.costosConsolidados?.fertilizantes?.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Pesticidas</span>
              <span className="font-semibold text-slate-900">${metrics.costosConsolidados?.pesticidas?.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Otros</span>
              <span className="font-semibold text-slate-900">${metrics.costosConsolidados?.otros?.toLocaleString()}</span>
            </div>
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-900">Total Invertido</span>
              <span className="font-bold text-rose-600">${metrics.costosConsolidados?.total?.toLocaleString()}</span>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Proyección de Cosecha" subtitle="Rentabilidad estimada">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Ingreso Bruto Est.</span>
              <span className="font-semibold text-emerald-600">+${metrics.rentabilidadEstimada?.ingresoBruto?.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Costos Operativos</span>
              <span className="font-semibold text-rose-600">-${metrics.rentabilidadEstimada?.costosOperativos?.toLocaleString()}</span>
            </div>
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-900">Utilidad Neta</span>
              <span className="font-bold text-emerald-600">${metrics.rentabilidadEstimada?.utilidadNeta?.toLocaleString()}</span>
            </div>
            <div className="mt-2 text-xs text-center text-slate-500 bg-slate-50 py-2 rounded-lg">
              ROI Estimado: <strong className={Number(metrics.rentabilidadEstimada?.roi) >= 0 ? "text-emerald-600" : "text-rose-600"}>{metrics.rentabilidadEstimada?.roi}%</strong>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Calendario Agrícola" subtitle={`Sugerencias para ${metrics.calendarioAgricola?.mesActual}`}>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mt-2">
            <p className="text-sm leading-6 text-blue-900">
              💡 {metrics.calendarioAgricola?.sugerencia}
            </p>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Ajusta estas sugerencias según las características específicas de tu región y tipo de cultivo activo.
          </p>
        </DashboardCard>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-medium rounded-3xl p-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-agro-emerald font-semibold">Reportes escritos</p>
            <h2 className="mt-3 text-2xl font-display font-bold text-slate-900">Notas del productor y administrador</h2>
            <p className="mt-2 max-w-2xl text-slate-600">Productor y administrador pueden escribir reportes libres. Filtra por días o busca por fecha.</p>
            <p className="mt-1 text-sm text-slate-500">Autor actual: <strong>{currentUser.name}</strong> — Rol: <strong>{currentUser.role}</strong></p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={saveReport}
              className="inline-flex items-center gap-2 rounded-3xl bg-agro-emerald px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-agro-emerald/20 transition hover:bg-green-700"
            >
              <FileText className="h-4 w-4" /> Guardar reporte
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => {
              setReportText('');
              setTimeout(() => document.querySelector('textarea').focus(), 100);
            }}
            className="inline-flex items-center gap-3 rounded-3xl bg-gradient-to-r from-agro-emerald to-green-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-agro-emerald/30 transition hover:from-green-600 hover:to-agro-emerald hover:shadow-2xl"
          >
            <FileText className="h-5 w-5" /> Crear Nuevo Reporte
          </button>
        </div>

        <textarea
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          rows={5}
          className="mt-6 w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
          placeholder="Escribe aquí tu reporte..."
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Filtrar por días</span>
            <select
              value={filterDays}
              onChange={(e) => setFilterDays(e.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
            >
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
              <option value="all">Todos los reportes</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Buscar por fecha</span>
            <input
              type="search"
              value={dateSearch}
              onChange={(e) => setDateSearch(e.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
              placeholder="Buscar por fecha (YYYY-MM-DD)"
            />
          </label>
        </div>

        <div className="mt-8 space-y-4">
          {filteredReports.length === 0 ? (
            <p className="text-sm text-slate-500">No hay reportes disponibles con los filtros seleccionados.</p>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{report.author}</p>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      <span>{formatDateTime(report.createdAt)}</span>
                      <span className="inline-flex rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">{report.authorRole || 'PRODUCTOR'}</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-agro-emerald/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-agro-emerald">
                    Reporte libre
                  </span>
                </div>
                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-700">{report.text}</p>
              </div>
            ))
          )}
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardCard title="Últimos riegos" subtitle="Últimos 5 eventos registrados">
          <div className="space-y-4">
            {metrics.ultimosRiegos && metrics.ultimosRiegos.map((riego) => (
              <div key={riego.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{riego.loteNombre}</p>
                    <p className="text-sm text-slate-500">{formatDateTime(riego.fecha)}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                    <Activity className="h-3.5 w-3.5" /> {riego.cantidad} L
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{riego.observaciones}</p>
              </div>
            ))}
            {(!metrics.ultimosRiegos || metrics.ultimosRiegos.length === 0) && <p className="text-sm text-slate-500">No hay registros de riego aún.</p>}
          </div>
        </DashboardCard>

        <DashboardCard title="Últimas aplicaciones" subtitle="Últimos 5 movimientos registrados">
          <div className="space-y-4">
            {metrics.ultimasAplicaciones && metrics.ultimasAplicaciones.map((app) => (
              <div key={app.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{app.insumoNombre}</p>
                    <p className="text-sm text-slate-500">{formatDateTime(app.fecha)}</p>
                  </div>
                  <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                    Dosis {app.dosis}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">Finca: {app.fincaNombre} — Lote: {app.loteNombre}</p>
              </div>
            ))}
            {(!metrics.ultimasAplicaciones || metrics.ultimasAplicaciones.length === 0) && <p className="text-sm text-slate-500">No hay aplicaciones registradas aún.</p>}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default ReportsPage;
