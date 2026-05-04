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
  const [loading, setLoading] = useState(false);

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
    fetchData();
  }, []);

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
