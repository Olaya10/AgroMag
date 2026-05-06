import { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';
import { DashboardCard } from '../../componets/DashboardComponents';
import { BarChart3, FileText, Download, Activity } from 'lucide-react';

const ReportsPage = () => {
  const [cultivos, setCultivos] = useState([]);
  const [riegos, setRiegos] = useState([]);
  const [aplicaciones, setAplicaciones] = useState([]);
  const [reports, setReports] = useState([]);
  const [reportText, setReportText] = useState('');
  const [filterDays, setFilterDays] = useState('7');
  const [dateSearch, setDateSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: 'Usuario', role: 'PRODUCTOR' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cultivosRes, riegosRes, aplicacionesRes] = await Promise.all([
        axios.get('http://localhost:9000/api/finca/cultivos'),
        axios.get('http://localhost:9000/api/finca/riegos'),
        axios.get('http://localhost:9000/api/inventory/bodega/aplicaciones')
      ]);

      setCultivos(cultivosRes.data || []);
      setRiegos(riegosRes.data || []);
      setAplicaciones(aplicacionesRes.data || []);
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
      `Cultivos registrados: ${cultivos.length}`,
      `Riegos registrados: ${riegos.length}`,
      `Aplicaciones de insumos registrados: ${aplicaciones.length}`,
    ];
    summaryLines.forEach((line) => {
      doc.text(line, margin, y);
      y += lineHeight;
    });

    y += lineHeight;
    const makeSection = (title, items, renderItem) => {
      if (items.length === 0) return;
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

    makeSection('Cultivos', cultivos.slice(0, 10), (cultivo) => `• ${cultivo.nombre} — ${cultivo.descripcion || 'Sin descripción'}`);
    makeSection('Riegos recientes', riegos.slice(-10).reverse(), (riego) => `• ${formatDateTime(riego.fechaHora)} | Lote: ${riego.lote?.nombre || 'N/A'} | ${riego.cantidadAguaLitros} L | ${riego.observaciones || 'Sin observaciones'}`);
    makeSection('Aplicaciones de insumos', aplicaciones.slice(-10).reverse(), (app) => `• ${formatDateTime(app.fecha)} | Insumo: ${app.insumo?.nombreComercial || 'N/A'} | Lote ID: ${app.loteId} | Dosis: ${app.dosis}`);

    doc.save('Reporte-AgroMag.pdf');
  };

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
          <button
            onClick={downloadReport}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-3xl bg-agro-emerald px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-agro-emerald/20 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {loading ? 'Generando...' : 'Exportar PDF'}
          </button>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-4">
        <DashboardCard className="bg-gradient-to-br from-agro-emerald to-green-600 text-white shadow-lg shadow-agro-emerald/20" title="Resumen total" subtitle="Datos rápidos de tu operación">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.24em] opacity-80"><BarChart3 className="h-4 w-4" /> Datos totales</div>
            <div className="text-4xl font-bold">{cultivos.length + riegos.length + aplicaciones.length}</div>
            <p className="text-sm leading-6 text-white/80">Total de registros generados en AgroMag.</p>
          </div>
        </DashboardCard>
        <DashboardCard title="Cultivos" subtitle="Variedades detectadas">
          <div className="text-3xl font-semibold text-slate-900">{cultivos.length}</div>
        </DashboardCard>
        <DashboardCard title="Riegos" subtitle="Eventos registrados">
          <div className="text-3xl font-semibold text-slate-900">{riegos.length}</div>
        </DashboardCard>
        <DashboardCard title="Aplicaciones" subtitle="Insumos aplicados">
          <div className="text-3xl font-semibold text-slate-900">{aplicaciones.length}</div>
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
            {riegos.slice(-5).reverse().map((riego) => (
              <div key={riego.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{riego.lote?.nombre || 'Lote desconocido'}</p>
                    <p className="text-sm text-slate-500">{formatDateTime(riego.fechaHora)}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                    <Activity className="h-3.5 w-3.5" /> {riego.cantidadAguaLitros} L
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{riego.observaciones || 'Sin observaciones'}</p>
              </div>
            ))}
            {riegos.length === 0 && <p className="text-sm text-slate-500">No hay registros de riego aún.</p>}
          </div>
        </DashboardCard>

        <DashboardCard title="Últimas aplicaciones" subtitle="Últimos 5 movimientos registrados">
          <div className="space-y-4">
            {aplicaciones.slice(-5).reverse().map((app) => (
              <div key={app.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{app.insumo?.nombreComercial || 'Insumo sin nombre'}</p>
                    <p className="text-sm text-slate-500">{formatDateTime(app.fecha)}</p>
                  </div>
                  <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                    Dosis {app.dosis}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">Lote ID: {app.loteId}</p>
              </div>
            ))}
            {aplicaciones.length === 0 && <p className="text-sm text-slate-500">No hay aplicaciones registradas aún.</p>}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default ReportsPage;
