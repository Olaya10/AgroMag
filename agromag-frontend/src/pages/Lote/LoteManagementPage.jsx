import { useState, useEffect } from 'react';
import axios from 'axios';
import './LoteManagementStyles.css';

const LoteManagementPage = () => {
    const [lotes, setLotes] = useState([]);
    const [cultivos, setCultivos] = useState([]);
    const [formData, setFormData] = useState({
        nombre: '',
        cultivo: null,
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

    const fetchLotes = async () => {
        try {
            const res = await axios.get(API_URL);
            setLotes(res.data);
        } catch (err) {
            console.error("Error al cargar lotes", err);
            alert("❌ Error al cargar lotes");
        }
    };

    const fetchCultivos = async () => {
        try {
            const res = await axios.get(CULTIVOS_URL);
            setCultivos(res.data);
        } catch (err) {
            console.error("Error al cargar cultivos", err);
            alert("❌ Error al cargar cultivos");
        }
    };

    useEffect(() => {
        fetchLotes();
        fetchCultivos();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({
                    ...formData,
                    imagen: reader.result,
                    imagenPreview: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.nombre.trim()) {
            alert("❌ El nombre del lote es requerido");
            return;
        }

        if (!formData.cultivo) {
            alert("❌ Debes seleccionar un cultivo");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                nombre: formData.nombre,
                cultivo: { id: formData.cultivo },
                extensionHectareas: parseFloat(formData.extensionHectareas),
                coordenadas: formData.coordenadas,
                etapaDesarrollo: formData.etapaDesarrollo,
                observaciones: formData.observaciones,
                imagen: formData.imagen
            };

            if (editingId) {
                await axios.put(`${API_URL}/${editingId}`, payload);
                alert("🌳 Lote actualizado correctamente");
            } else {
                await axios.post(API_URL, payload);
                alert("🌳 Lote registrado correctamente en AgroMag");
            }

            resetForm();
            fetchLotes();
        } catch (err) {
            console.error(err);
            alert("❌ Error al guardar lote: " + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (lote) => {
        setEditingId(lote.id);
        setFormData({
            nombre: lote.nombre,
            cultivo: lote.cultivo?.id || null,
            extensionHectareas: lote.extensionHectareas,
            coordenadas: lote.coordenadas || '',
            etapaDesarrollo: lote.etapaDesarrollo,
            observaciones: lote.observaciones || '',
            imagen: lote.imagen || null,
            imagenPreview: lote.imagen || null
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este lote?')) return;
        try {
            await axios.delete(`${API_URL}/${id}`);
            alert("✅ Lote eliminado");
            fetchLotes();
        } catch (err) {
            alert('❌ No se pudo eliminar el lote.');
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            nombre: '',
            cultivo: null,
            extensionHectareas: '',
            coordenadas: '',
            etapaDesarrollo: 'SIEMBRA',
            observaciones: '',
            imagen: null,
            imagenPreview: null
        });
    };

    return (
        <div className="lote-container">
            <div className="lote-header">
                <div className="header-content">
                    <h2>🌾 Gestión de Lotes</h2>
                    <p>Administra los lotes de tu finca y asigna cultivos</p>
                </div>
            </div>

            <div className="lote-content">
                {/* Formulario */}
                <div className="lote-card form-card">
                    <div className="form-header">
                        <h3>{editingId ? '✏️ Editar Lote' : '➕ Registrar Nuevo Lote'}</h3>
                    </div>

                    <form className="lote-form" onSubmit={handleSubmit}>
                        <div className="form-section">
                            <label>Nombre del Lote *</label>
                            <input
                                type="text"
                                placeholder="Ej: Lote Norte, Lote Sur..."
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-section">
                            <label>Cultivo a Plantar *</label>
                            <select
                                value={formData.cultivo || ''}
                                onChange={e => setFormData({ ...formData, cultivo: e.target.value ? parseInt(e.target.value) : null })}
                                required
                            >
                                <option value="">-- Selecciona un cultivo --</option>
                                {cultivos.map(cultivo => (
                                    <option key={cultivo.id} value={cultivo.id}>{cultivo.nombre}</option>
                                ))}
                            </select>
                            {cultivos.length === 0 && (
                                <small style={{color: '#ff6b6b'}}>⚠️ Debes crear cultivos primero</small>
                            )}
                        </div>

                        <div className="form-row">
                            <div className="form-section">
                                <label>Extensión (Hectáreas) *</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="Ej: 2.5"
                                    value={formData.extensionHectareas}
                                    onChange={e => setFormData({ ...formData, extensionHectareas: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-section">
                                <label>Etapa de Desarrollo</label>
                                <select
                                    value={formData.etapaDesarrollo}
                                    onChange={e => setFormData({ ...formData, etapaDesarrollo: e.target.value })}
                                >
                                    <option value="SIEMBRA">Siembra</option>
                                    <option value="VEGETATIVA">Vegetativa</option>
                                    <option value="FLORACION">Floración</option>
                                    <option value="COSECHA">Cosecha</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-section">
                            <label>Coordenadas GPS</label>
                            <input
                                type="text"
                                placeholder="Ej: 4.5895, -74.3085"
                                value={formData.coordenadas}
                                onChange={e => setFormData({ ...formData, coordenadas: e.target.value })}
                            />
                        </div>

                        <div className="form-section">
                            <label>Observaciones</label>
                            <textarea
                                placeholder="Notas adicionales del lote..."
                                value={formData.observaciones}
                                onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
                                rows="3"
                            />
                        </div>

                        <div className="form-section">
                            <label>Imagen del Lote</label>
                            <div className="image-upload">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    id="imagen-input"
                                />
                                <label htmlFor="imagen-input" className="file-label">
                                    📷 Seleccionar imagen
                                </label>
                            </div>
                            {formData.imagenPreview && (
                                <div className="image-preview">
                                    <img src={formData.imagenPreview} alt="Preview" />
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-submit" disabled={loading || cultivos.length === 0}>
                                {loading ? '⏳ Guardando...' : editingId ? '✓ Actualizar' : '✓ Registrar'}
                            </button>
                            {editingId && (
                                <button type="button" className="btn-cancel" onClick={resetForm}>
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Listado de lotes */}
                <div className="lotes-list">
                    <h3>📋 Lotes Registrados</h3>
                    {lotes.length === 0 ? (
                        <div className="empty-state">
                            <p>😴 No hay lotes registrados aún</p>
                            <p className="sub-text">Comienza registrando un lote en el formulario</p>
                        </div>
                    ) : (
                        <div className="lotes-grid">
                            {lotes.map(lote => (
                                <div key={lote.id} className="lote-item">
                                    {lote.imagen && (
                                        <div className="lote-image">
                                            <img src={lote.imagen} alt={lote.nombre} />
                                        </div>
                                    )}
                                    <div className="lote-info">
                                        <h4>{lote.nombre}</h4>
                                        <div className="lote-cultivo">
                                            🌱 <strong>{lote.cultivo?.nombre || 'Sin cultivo'}</strong>
                                        </div>
                                        <div className="lote-details">
                                            <span>📏 {lote.extensionHectareas} Ha</span>
                                            <span className={`status-badge ${lote.etapaDesarrollo.toLowerCase()}`}>
                                                {lote.etapaDesarrollo}
                                            </span>
                                        </div>
                                        {lote.coordenadas && (
                                            <div className="lote-coords">
                                                📍 {lote.coordenadas}
                                            </div>
                                        )}
                                        {lote.observaciones && (
                                            <div className="lote-obs">
                                                📝 {lote.observaciones}
                                            </div>
                                        )}
                                    </div>
                                    <div className="lote-actions">
                                        <button className="btn-edit" onClick={() => handleEdit(lote)}>
                                            ✎ Editar
                                        </button>
                                        <button className="btn-delete" onClick={() => handleDelete(lote.id)}>
                                            🗑️ Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoteManagementPage;