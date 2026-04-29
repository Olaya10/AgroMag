import { useState, useEffect } from 'react';
import axios from 'axios';
import './LoteManagementStyles.css';

const LoteManagementPage = () => {
    const [lotes, setLotes] = useState([]);
    const [formData, setFormData] = useState({
        nombre: '',
        tipoCultivo: 'Mango Tomy',
        extensionHectareas: '',
        coordenadas: '',
        etapaDesarrollo: 'SIEMBRA'
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    // Gateway (9000) -> Finca-Service (8081)
    const API_URL = 'http://localhost:9000/api/finca/lotes';

    const fetchLotes = async () => {
        try {
            const res = await axios.get(API_URL);
            setLotes(res.data);
        } catch (err) {
            console.error("Error al cargar lotes", err);
        }
    };

    useEffect(() => { fetchLotes(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await axios.put(`${API_URL}/${editingId}`, formData);
                alert("🌳 Lote actualizado correctamente");
            } else {
                await axios.post(API_URL, formData);
                alert("🌳 Lote registrado correctamente en AgroMag");
            }
            setFormData({ nombre: '', tipoCultivo: 'Mango Tomy', extensionHectareas: '', coordenadas: '', etapaDesarrollo: 'SIEMBRA' });
            setEditingId(null);
            fetchLotes();
        } catch (err) {
            alert("❌ Error al conectar con Finca-Service");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (lote) => {
        setEditingId(lote.id);
        setFormData({
            nombre: lote.nombre,
            tipoCultivo: lote.tipoCultivo,
            extensionHectareas: lote.extensionHectareas,
            coordenadas: lote.coordenadas || '',
            etapaDesarrollo: lote.etapaDesarrollo
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este lote?')) return;
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchLotes();
        } catch (err) {
            alert('❌ No se pudo eliminar el lote.');
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ nombre: '', tipoCultivo: 'Mango Tomy', extensionHectareas: '', coordenadas: '', etapaDesarrollo: 'SIEMBRA' });
    };

    return (
        <div className="finca-container">
            <div className="finca-header">
                <h2>Gestión de Lotes y Cultivos</h2>
                <p>Administración de predios para la Finca</p>
            </div>

            <div className="finca-card">
                <form className="finca-form" onSubmit={handleSubmit}>
                    <div className="finca-grid">
                        <input
                            type="text" placeholder="Nombre del Lote"
                            value={formData.nombre}
                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                            required
                        />
                        <select value={formData.tipoCultivo} onChange={e => setFormData({ ...formData, tipoCultivo: e.target.value })}>
                            <option value="Mango Tomy">Mango Tomy</option>
                            <option value="Mango Hilacha">Mango Hilacha</option>
                            <option value="Mango Keitt">Mango Keitt</option>
                        </select>
                        <input
                            type="number" step="0.1" placeholder="Extensión (Ha)"
                            value={formData.extensionHectareas}
                            onChange={e => setFormData({ ...formData, extensionHectareas: e.target.value })}
                            required
                        />
                        <input
                            type="text" placeholder="Coordenadas GPS"
                            value={formData.coordenadas}
                            onChange={e => setFormData({ ...formData, coordenadas: e.target.value })}
                        />
                        <select value={formData.etapaDesarrollo} onChange={e => setFormData({ ...formData, etapaDesarrollo: e.target.value })}>
                            <option value="SIEMBRA">Etapa: Siembra</option>
                            <option value="VEGETATIVA">Etapa: Vegetativa</option>
                            <option value="FLORACION">Etapa: Floración</option>
                            <option value="COSECHA">Etapa: Cosecha</option>
                        </select>
                    </div>
                    <button type="submit" className="btn-finca" disabled={loading}>
                        {loading ? 'Guardando...' : 'Registrar Nuevo Lote'}
                    </button>
                </form>
            </div>

            <div className="table-container">
                <table className="finca-table">
                    <thead>
                        <tr>
                            <th>Lote</th>
                            <th>Variedad</th>
                            <th>Área</th>
                            <th>Estado</th>
                            <th>Ubicación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lotes.map(l => (
                            <tr key={l.id}>
                                <td><b>{l.nombre}</b></td>
                                <td>{l.tipoCultivo}</td>
                                <td>{l.extensionHectareas} Ha</td>
                                <td><span className={`status-pill ${l.etapaDesarrollo.toLowerCase()}`}>{l.etapaDesarrollo}</span></td>
                                <td>{l.coordenadas || 'No asignada'}</td>
                                <td>
                                    <button className="btn-edit" onClick={() => handleEdit(l)}>Editar</button>
                                    <button className="btn-delete" onClick={() => handleDelete(l.id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LoteManagementPage;