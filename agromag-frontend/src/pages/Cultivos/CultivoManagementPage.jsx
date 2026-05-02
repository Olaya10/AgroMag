import { useState, useEffect } from 'react';
import axios from 'axios';
import './CultivoManagementStyles.css';

const CultivoManagementPage = () => {
    const [cultivos, setCultivos] = useState([]);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        diasCosecha: '',
        temperapturOptima: '',
        humidadOptima: '',
        imagen: null,
        imagenPreview: null
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_URL = 'http://localhost:9000/api/finca/cultivos';

    const fetchCultivos = async () => {
        try {
            const res = await axios.get(API_URL);
            setCultivos(res.data);
        } catch (err) {
            console.error("Error al cargar cultivos", err);
            alert("❌ Error al cargar cultivos");
        }
    };

    useEffect(() => { fetchCultivos(); }, []);

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
            alert("❌ El nombre del cultivo es requerido");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                diasCosecha: parseInt(formData.diasCosecha) || null,
                temperapturOptima: formData.temperapturOptima,
                humidadOptima: formData.humidadOptima,
                imagen: formData.imagen,
                activo: true
            };

            if (editingId) {
                await axios.put(`${API_URL}/${editingId}`, payload);
                alert("🌱 Cultivo actualizado correctamente");
            } else {
                await axios.post(API_URL, payload);
                alert("🌱 Cultivo registrado correctamente");
            }
            
            resetForm();
            fetchCultivos();
        } catch (err) {
            console.error(err);
            alert("❌ Error al guardar cultivo: " + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (cultivo) => {
        setEditingId(cultivo.id);
        setFormData({
            nombre: cultivo.nombre,
            descripcion: cultivo.descripcion || '',
            diasCosecha: cultivo.diasCosecha || '',
            temperapturOptima: cultivo.temperapturOptima || '',
            humidadOptima: cultivo.humidadOptima || '',
            imagen: cultivo.imagen || null,
            imagenPreview: cultivo.imagen || null
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este cultivo?')) return;
        try {
            await axios.delete(`${API_URL}/${id}`);
            alert("✅ Cultivo eliminado");
            fetchCultivos();
        } catch (err) {
            alert('❌ No se pudo eliminar el cultivo.');
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            nombre: '',
            descripcion: '',
            diasCosecha: '',
            temperapturOptima: '',
            humidadOptima: '',
            imagen: null,
            imagenPreview: null
        });
    };

    return (
        <div className="cultivo-container">
            <div className="cultivo-header">
                <div className="header-content">
                    <h2>🌱 Gestión de Cultivos</h2>
                    <p>Administra los tipos de cultivos disponibles en tu sistema AgroMag</p>
                </div>
            </div>

            <div className="cultivo-content">
                {/* Formulario */}
                <div className="cultivo-card form-card">
                    <div className="form-header">
                        <h3>{editingId ? '✏️ Editar Cultivo' : '➕ Registrar Nuevo Cultivo'}</h3>
                    </div>

                    <form className="cultivo-form" onSubmit={handleSubmit}>
                        <div className="form-section">
                            <label>Nombre del Cultivo *</label>
                            <input
                                type="text"
                                placeholder="Ej: Mango, Banano, Yuca, Plátano..."
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-section">
                            <label>Descripción</label>
                            <textarea
                                placeholder="Describe características del cultivo..."
                                value={formData.descripcion}
                                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                rows="3"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-section">
                                <label>Días para Cosecha (aproximado)</label>
                                <input
                                    type="number"
                                    placeholder="Ej: 120"
                                    value={formData.diasCosecha}
                                    onChange={e => setFormData({ ...formData, diasCosecha: e.target.value })}
                                />
                            </div>

                            <div className="form-section">
                                <label>Temperatura Óptima (°C)</label>
                                <input
                                    type="text"
                                    placeholder="Ej: 25-30°C"
                                    value={formData.temperapturOptima}
                                    onChange={e => setFormData({ ...formData, temperapturOptima: e.target.value })}
                                />
                            </div>

                            <div className="form-section">
                                <label>Humedad Óptima (%)</label>
                                <input
                                    type="text"
                                    placeholder="Ej: 60-80%"
                                    value={formData.humidadOptima}
                                    onChange={e => setFormData({ ...formData, humidadOptima: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <label>Imagen del Cultivo</label>
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
                            <button type="submit" className="btn-submit" disabled={loading}>
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

                {/* Listado de cultivos */}
                <div className="cultivos-list">
                    <h3>📋 Cultivos Registrados</h3>
                    {cultivos.length === 0 ? (
                        <div className="empty-state">
                            <p>😴 No hay cultivos registrados aún</p>
                            <p className="sub-text">Comienza registrando un cultivo en el formulario</p>
                        </div>
                    ) : (
                        <div className="cultivos-grid">
                            {cultivos.map(cultivo => (
                                <div key={cultivo.id} className="cultivo-item">
                                    {cultivo.imagen && (
                                        <div className="cultivo-image">
                                            <img src={cultivo.imagen} alt={cultivo.nombre} />
                                        </div>
                                    )}
                                    <div className="cultivo-info">
                                        <h4>{cultivo.nombre}</h4>
                                        {cultivo.descripcion && <p className="desc">{cultivo.descripcion}</p>}
                                        <div className="cultivo-details">
                                            {cultivo.diasCosecha && <span>⏱️ {cultivo.diasCosecha} días</span>}
                                            {cultivo.temperapturOptima && <span>🌡️ {cultivo.temperapturOptima}</span>}
                                            {cultivo.humidadOptima && <span>💧 {cultivo.humidadOptima}</span>}
                                        </div>
                                    </div>
                                    <div className="cultivo-actions">
                                        <button className="btn-edit" onClick={() => handleEdit(cultivo)}>
                                            ✎ Editar
                                        </button>
                                        <button className="btn-delete" onClick={() => handleDelete(cultivo.id)}>
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

export default CultivoManagementPage;
