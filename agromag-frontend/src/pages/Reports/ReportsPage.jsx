import { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import './ReportsStyles.css';

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
    const date = new Date(dateString);
    return date.toLocaleString();
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
    <div className="reports-container">
      <div className="reports-header">
        <div>
          <p className="section-label">Reportes Profesionales</p>
          <h2>Genera y descarga reportes completos de tus operaciones</h2>
          <p className="section-description">
            Descarga resúmenes en PDF de cultivos, riegos y aplicaciones de insumos.
          </p>
        </div>
        <button className="btn-report-download" onClick={downloadReport} disabled={loading}>
          {loading ? 'Cargando...' : 'Descargar reporte PDF'}
        </button>
      </div>

      <div className="reports-grid">
        <article className="report-card highlight">
          <span>Resumen General</span>
          <strong>{cultivos.length + riegos.length + aplicaciones.length}</strong>
          <p>Sumario de información registrada en tu finca.</p>
        </article>
        <article className="report-card">
          <span>Cultivos</span>
          <strong>{cultivos.length}</strong>
          <p>Tipos de cultivo disponibles en el sistema.</p>
        </article>
        <article className="report-card">
          <span>Riegos</span>
          <strong>{riegos.length}</strong>
          <p>Eventos de riego guardados por lote.</p>
        </article>
        <article className="report-card">
          <span>Aplicaciones</span>
          <strong>{aplicaciones.length}</strong>
          <p>Insuficiencias de insumos procesadas.</p>
        </article>
      </div>

      <div className="reports-details">
        <section className="detail-panel">
          <div className="detail-header">
            <h3>Últimos riegos</h3>
            <span>{Math.min(riegos.length, 5)} eventos recientes</span>
          </div>
          <ul>
            {riegos.slice(-5).reverse().map((riego) => (
              <li key={riego.id}>
                <div>
                  <strong>{riego.lote?.nombre || 'Lote no disponible'}</strong>
                  <span>{formatDateTime(riego.fechaHora)}</span>
                </div>
                <div>
                  <small>{riego.cantidadAguaLitros} L</small>
                  <small>{riego.observaciones || 'Sin observaciones'}</small>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="detail-panel">
          <div className="detail-header">
            <h3>Últimas aplicaciones</h3>
            <span>{Math.min(aplicaciones.length, 5)} registros recientes</span>
          </div>
          <ul>
            {aplicaciones.slice(-5).reverse().map((app) => (
              <li key={app.id}>
                <div>
                  <strong>{app.insumo?.nombreComercial || 'Insumo no disponible'}</strong>
                  <span>{formatDateTime(app.fecha)}</span>
                </div>
                <div>
                  <small>Lote ID: {app.loteId}</small>
                  <small>Dosis: {app.dosis}</small>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default ReportsPage;
