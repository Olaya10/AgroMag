import { useState, useEffect } from 'react';
import api from '../../api';
import { motion } from 'framer-motion';
import { DashboardCard } from '../../componets/DashboardComponents';
import { Users, Search, UserPlus, Edit3, Trash2 } from 'lucide-react';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'OPERARIO', cedula: '', edad: '', active: true });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = '/auth';

  const fetchUsers = async () => {
    try {
      const res = await api.get(`${API_URL}/usuarios-json`);
      setUsers(res.data);
    } catch (err) {
      console.error('Error al cargar usuarios', err);
    }
  };

  const ejecutarBusqueda = async (criterio) => {
    try {
      const res = await api.get(`${API_URL}/buscar?q=${criterio}`);
      setUsers(res.data);
    } catch (err) {
      console.error('Error en la búsqueda', err);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchTerm) {
        ejecutarBusqueda(searchTerm);
      } else {
        fetchUsers();
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', role: 'OPERARIO', cedula: '', edad: '', active: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...formData,
      cedula: Number(formData.cedula),
      edad: Number(formData.edad),
      active: formData.active
    };

    try {
      if (editingId) {
        await api.put(`${API_URL}/update-user/${editingId}`, payload);
        alert('✅ Usuario actualizado con éxito');
      } else {
        await api.post(`${API_URL}/register`, payload);
        alert('✨ Nuevo integrante registrado en AgroMag');
      }
      cancelEdit();
      fetchUsers();
    } catch (err) {
      alert(err.response?.data || '❌ Error en la operación');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Deseas eliminar a este trabajador?')) return;
    try {
      await api.delete(`${API_URL}/delete-user/${id}`);
      fetchUsers();
    } catch (err) {
      alert('No se pudo eliminar.');
    }
  };

  const handleToggleActive = async (id, active) => {
    try {
      await api.patch(`${API_URL}/users/${id}/active`, active);
      fetchUsers();
    } catch (err) {
      alert('No se pudo actualizar el estado del usuario.');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-medium rounded-3xl p-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-agro-emerald font-semibold">Personal</p>
            <h1 className="mt-3 text-3xl font-display font-bold text-slate-900">Gestiona al equipo de tu finca</h1>
            <p className="mt-2 max-w-2xl text-slate-600">Registra usuarios, edita perfiles y encuentra rápidamente al personal correcto.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-50 px-4 py-3 text-slate-700 shadow-soft">
            <Users className="h-5 w-5 text-agro-emerald" />
            <span className="text-sm font-semibold">{users.length} colaboradores</span>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1.1fr]">
        <DashboardCard
          title={editingId ? 'Editar usuario' : 'Registrar colaborador'}
          subtitle="Crea y ajusta perfiles de tu equipo"
          action={editingId && (
            <button onClick={cancelEdit} className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Cancelar</button>
          )}
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-slate-700">
                Nombre
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                />
              </label>
              <label className="block text-sm text-slate-700">
                Cédula
                <input
                  type="text"
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-slate-700">
                Edad
                <input
                  type="number"
                  min="0"
                  value={formData.edad}
                  onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                />
              </label>
              <label className="block text-sm text-slate-700">
                Correo electrónico
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-slate-700">
                Contraseña
                <input
                  type="password"
                  placeholder={editingId ? 'Nueva clave (opcional)' : 'Contraseña'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingId}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                />
              </label>
              <label className="block text-sm text-slate-700">
                Rol
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
                >
                  <option value="OPERARIO">Operario</option>
                  <option value="PRODUCTOR">Productor</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2 items-center">
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-agro-emerald focus:ring-agro-emerald"
                />
                Cuenta activa
              </label>
              <div className="text-sm text-slate-500">
                {editingId ? 'Marca para mantener la cuenta activa.' : 'Nueva cuenta creada como activa por defecto.'}
              </div>
            </div>
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-3xl bg-agro-emerald px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-agro-emerald/20 transition hover:bg-green-700 disabled:opacity-60">
              <UserPlus className="h-4 w-4" />
              {loading ? 'Guardando...' : editingId ? 'Actualizar usuario' : 'Registrar usuario'}
            </button>
          </form>
        </DashboardCard>

        <DashboardCard title="Búsqueda rápida" subtitle="Encuentra colaboradores por nombre o documento">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o cédula..."
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-5 text-slate-900 outline-none transition focus:border-agro-emerald focus:ring-2 focus:ring-agro-emerald/20"
            />
          </div>
          <p className="mt-4 text-sm text-slate-500">Pulsa en el botón de editar para cargar los datos en el formulario.</p>
        </DashboardCard>
      </div>

      <DashboardCard title="Colaboradores" subtitle="Lista completa de usuarios registrados">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-4 font-semibold">Nombre</th>
                <th className="px-4 py-4 font-semibold">Cédula</th>
                <th className="px-4 py-4 font-semibold">Edad</th>
                <th className="px-4 py-4 font-semibold">Email</th>
                <th className="px-4 py-4 font-semibold">Rol</th>
                <th className="px-4 py-4 font-semibold">Estado</th>
                <th className="px-4 py-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 font-semibold text-slate-900">{u.name}</td>
                  <td className="px-4 py-4">{u.cedula}</td>
                  <td className="px-4 py-4">{u.edad}</td>
                  <td className="px-4 py-4">{u.email}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">{u.role}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${u.active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {u.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-4 space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(u.id);
                        setFormData({
                          name: u.name,
                          email: u.email,
                          role: u.role,
                          password: '',
                          cedula: u.cedula ?? '',
                          edad: u.edad ?? '',
                          active: u.active ?? true
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(u.id, !u.active)}
                      className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold transition ${u.active ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                    >
                      {u.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(u.id)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Borrar
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500">No se encontraron resultados para su búsqueda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
};

export default UserManagementPage;
