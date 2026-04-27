import { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagementStyles.css';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'OPERARIO', cedula: '', edad: '' });
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    const API_URL = 'http://localhost:9000/api/auth';

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/usuarios-json`);
            setUsers(res.data);
        } catch (err) {
            console.error("Error al cargar usuarios", err);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm) {
                ejecutarBusqueda(searchTerm);
            } else {
                fetchUsers();
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const ejecutarBusqueda = async (criterio) => {
        try {
            const res = await axios.get(`${API_URL}/buscar?q=${criterio}`);
            setUsers(res.data);
        } catch (err) {
            console.error("Error en la búsqueda", err);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            ...formData,
            cedula: Number(formData.cedula),
            edad: Number(formData.edad)
        };
        try {
            if (editingId) {
                await axios.put(`${API_URL}/update-user/${editingId}`, payload);
                alert("✅ Usuario actualizado con éxito");
            } else {
                await axios.post(`${API_URL}/register`, payload);
                alert("✨ Nuevo integrante registrado en AgroMag");
            }
            cancelEdit();
            fetchUsers();
        } catch (err) {
            alert(err.response?.data || "❌ Error en la operación");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Deseas eliminar a este trabajador?")) {
            try {
                await axios.delete(`${API_URL}/delete-user/${id}`);
                fetchUsers();
            } catch (err) {
                alert("No se pudo eliminar.");
            }
        }
    };

    const cancelEdit = () => {
        setFormData({ name: '', email: '', password: '', role: 'OPERARIO', cedula: '', edad: '' });
        setEditingId(null);
    };

    return (
        <div className="admin-container">
            <div className="form-section">
                <h3>{editingId ? "📝 Editar Usuario" : "👤 Registrar Personal de Finca"}</h3>
                <form onSubmit={handleSubmit} className="form-grid">
                    <input
                        type="text" placeholder="Nombre completo"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <input
                        type="text" placeholder="Cédula"
                        value={formData.cedula}
                        onChange={e => setFormData({ ...formData, cedula: e.target.value })}
                        required
                    />
                    <input
                        type="number" placeholder="Edad"
                        value={formData.edad}
                        onChange={e => setFormData({ ...formData, edad: e.target.value })}
                        required
                        min="0"
                    />
                    <input
                        type="email" placeholder="Correo electrónico"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <input
                        type="password"
                        placeholder={editingId ? "Nueva clave (opcional)" : "Contraseña"}
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        required={!editingId}
                    />
                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                        <option value="OPERARIO">Operario</option>
                        <option value="PRODUCTOR">Productor</option>
                        <option value="ADMIN">Administrador</option>
                    </select>

                    <div className="button-group">
                        <button type="submit" className={`btn-submit ${editingId ? 'btn-update' : ''}`} disabled={loading}>
                            {loading ? "Procesando..." : (editingId ? "Guardar Cambios" : "Registrar")}
                        </button>
                        {editingId && (
                            <button type="button" className="btn-cancel" onClick={cancelEdit}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="search-container">
                <input 
                    type="text" 
                    className="search-input"
                    placeholder="🔍 Buscar por nombre o identificación..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <table className="user-table">
                <thead>
                    <tr><th>Nombre</th><th>Cédula</th><th>Edad</th><th>Email</th><th>Rol</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id}>
                            <td><b>{u.name}</b></td>
                            <td>{u.cedula}</td>
                            <td>{u.edad}</td>
                            <td>{u.email}</td>
                            <td><span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span></td>
                            <td className="actions-cell">
                                <button
                                    className="btn-edit"
                                    onClick={() => {
                                        setEditingId(u.id);
                                        setFormData({ name: u.name, email: u.email, role: u.role, password: '', cedula: u.cedula ?? '', edad: u.edad ?? '' });
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                >
                                    Editar
                                </button>
                                <button className="btn-delete" onClick={() => handleDelete(u.id)}>Borrar</button>
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && (
                        <tr>
                            <td colSpan="6" className="empty-message">
                                No se encontraron resultados para su búsqueda.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagementPage;