import { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagementStyles.css';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'OPERARIO' });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false); // Estado para evitar doble click
    const API_URL = 'http://localhost:8080/auth';

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/usuarios-json`);
            setUsers(res.data);
        } catch (err) {
            console.error("Error al cargar usuarios", err);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Bloqueamos el botón
        try {
            if (editingId) {
                await axios.put(`${API_URL}/update-user/${editingId}`, formData);
                alert("✅ Usuario actualizado con éxito");
            } else {
                await axios.post(`${API_URL}/register`, formData);
                alert("✨ Nuevo integrante registrado en AgroMag");
            }
            // Limpiar formulario y estados
            cancelEdit();
            fetchUsers();
        } catch (err) {
            // Captura el mensaje de "Email ya existe" del backend
            const mensajeError = err.response?.data || "❌ Error en la operación";
            alert(mensajeError);
        } finally {
            setLoading(false); // Desbloqueamos el botón
        }
    };

    const handleDelete = async (id) => {
        const confirmacion = window.confirm(
            "¡Atención! Estás a punto de eliminar a un trabajador de AgroMag.\n\nEsta acción no se puede deshacer. ¿Deseas continuar?"
        );

        if (confirmacion) {
            try {
                await axios.delete(`${API_URL}/delete-user/${id}`);
                fetchUsers();
            } catch (err) {
                alert("No se pudo eliminar el usuario.");
            }
        }
    };

    const cancelEdit = () => {
        setFormData({ name: '', email: '', password: '', role: 'OPERARIO' });
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
                        <button type="submit" className="btn-submit" disabled={loading}>
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

            <table className="user-table">
                <thead>
                    <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id}>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td><span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span></td>
                            <td>
                                <button
                                    className="btn-edit"
                                    onClick={() => {
                                        setEditingId(u.id);
                                        setFormData({ name: u.name, email: u.email, role: u.role, password: '' });
                                        window.scrollTo(0, 0); // Sube al formulario automáticamente
                                    }}
                                >
                                    Editar
                                </button>
                                <button className="btn-delete" onClick={() => handleDelete(u.id)}>Borrar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagementPage;