import { useState, useEffect } from 'react';
import axios from 'axios';
import './InventoryStyles.css';

const InventoryPage = () => {
    const [insumos, setInsumos] = useState([]);
    const [formData, setFormData] = useState({
        nombreComercial: '',
        tipo: 'FERTILIZANTE',
        stockActual: '',
        umbralCritico: '',
        unidadMedida: 'Litros'
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    // Gateway (9000) -> Inventory-Service (8082)
    const API_URL = 'http://localhost:9000/api/inventory/bodega/insumos';

    const fetchInsumos = async () => {
        try {
            const res = await axios.get(API_URL);
            setInsumos(res.data);
        } catch (err) {
            console.error("Error al cargar la bodega", err);
        }
    };

    useEffect(() => { fetchInsumos(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await axios.put(`${API_URL}/${editingId}`, formData);
                alert("📦 Insumo actualizado con éxito");
            } else {
                await axios.post(API_URL, formData);
                alert("📦 Producto registrado en el inventario");
            }
            setFormData({ nombreComercial: '', tipo: 'FERTILIZANTE', stockActual: '', umbralCritico: '', unidadMedida: 'Litros' });
            setEditingId(null);
            fetchInsumos();
        } catch (err) {
            alert("❌ Error al registrar insumo");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (insumo) => {
        setEditingId(insumo.id);
        setFormData({
            nombreComercial: insumo.nombreComercial,
            tipo: insumo.tipo,
            stockActual: insumo.stockActual ?? '',
            umbralCritico: insumo.umbralCritico ?? '',
            unidadMedida: insumo.unidadMedida || 'Litros'
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este insumo?')) return;
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchInsumos();
        } catch (err) {
            alert('❌ No se pudo eliminar el insumo.');
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ nombreComercial: '', tipo: 'FERTILIZANTE', stockActual: '', umbralCritico: '', unidadMedida: 'Litros' });
    };

    return (
        <div className="inventory-container">
            <div className="inventory-header">
                <h2>Control de Bodega e Insumos</h2>
                <p>Gestión de fertilizantes y químicos para AgroMag</p>
            </div>

            <div className="inventory-card">
                <form className="inventory-form" onSubmit={handleSubmit}>
                    <div className="inventory-grid">
                        <input
                            type="text" placeholder="Nombre del Producto"
                            value={formData.nombreComercial}
                            onChange={e => setFormData({ ...formData, nombreComercial: e.target.value })}
                            required
                        />
                        <select value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })}>
                            <option value="FERTILIZANTE">Fertilizante</option>
                            <option value="PESTICIDA">Pesticida</option>
                            <option value="FUNGICIDA">Fungicida</option>
                        </select>
                        <input
                            type="number" placeholder="Cantidad Inicial"
                            value={formData.stockActual}
                            onChange={e => setFormData({ ...formData, stockActual: e.target.value })}
                            required
                        />
                        <input
                            type="number" placeholder="Umbral de Alerta"
                            value={formData.umbralCritico}
                            onChange={e => setFormData({ ...formData, umbralCritico: e.target.value })}
                            required
                        />
                        <select value={formData.unidadMedida} onChange={e => setFormData({ ...formData, unidadMedida: e.target.value })}>
                            <option value="Litros">Litros</option>
                            <option value="Kilogramos">Kilogramos</option>
                            <option value="Gramos">Gramos</option>
                        </select>
                    </div>
                    <div className="inventory-actions">
                        <button type="submit" className="btn-inventory" disabled={loading}>
                            {loading ? 'Procesando...' : editingId ? 'Guardar Cambios' : 'Añadir a Bodega'}
                        </button>
                        {editingId && (
                            <button type="button" className="btn-secondary" onClick={cancelEdit}>
                                Cancelar edición
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="inventory-table-wrapper">
                <table className="inventory-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Stock</th>
                            <th>Unidad</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {insumos.map(i => {
                            const critico = i.stockActual <= i.umbralCritico;
                            return (
                                <tr key={i.id} className={critico ? 'row-critical' : ''}>
                                    <td><b>{i.nombreComercial}</b></td>
                                    <td>{i.tipo}</td>
                                    <td className={critico ? 'text-danger' : 'text-success'}>
                                        {i.stockActual}
                                    </td>
                                    <td>{i.unidadMedida}</td>
                                    <td>
                                        <span className={`stock-badge ${critico ? 'bg-danger' : 'bg-success'}`}>
                                            {critico ? 'REABASTECER' : 'DISPONIBLE'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-edit" onClick={() => handleEdit(i)}>Editar</button>
                                        <button className="btn-delete" onClick={() => handleDelete(i.id)}>Eliminar</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventoryPage;