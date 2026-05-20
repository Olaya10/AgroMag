import { useState, useEffect } from 'react';
import api from '../../api';
import { motion } from 'framer-motion';
import { DashboardCard } from '../../components/DashboardComponents';
import { PageHeader, Spinner, EmptyState, useConfirm, toast } from '../../components/UIComponents';
import { Users, Search, UserPlus, Edit3, Trash2 } from 'lucide-react';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'OPERARIO',
    cedula: '', edad: '', active: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { confirm, ConfirmModal } = useConfirm();

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/usuarios-json');
      setUsers(res.data);
    } catch (err) {
      console.error('Error al cargar usuarios', err);
    } finally {
      setLoading(false);
    }
  };

  const ejecutarBusqueda = async (criterio) => {
    try {
      const res = await api.get(`/auth/buscar?q=${criterio}`);
      setUsers(res.data);
    } catch (err) {
      console.error('Error en la búsqueda', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchTerm) ejecutarBusqueda(searchTerm);
      else fetchUsers();
    }, 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', role: 'OPERARIO', cedula: '', edad: '', active: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...formData,
      cedula: Number(formData.cedula),
      edad: Number(formData.edad),
    };
    try {
      if (editingId) {
        await api.put(`/auth/update-user/${editingId}`, payload);
        toast.success('Usuario actualizado correctamente');
      } else {
        await api.post('/auth/register', payload);
        toast.success('Nuevo colaborador registrado en AgroMag');
      }
      cancelEdit();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data || 'Error en la operación');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm('¿Deseas eliminar a este colaborador? Esta acción no se puede deshacer.');
    if (!ok) return;
    try {
      await api.delete(`/auth/delete-user/${id}`);
      toast.success('Colaborador eliminado');
      fetchUsers();
    } catch {
      toast.error('No se pudo eliminar el colaborador.');
    }
  };

  const handleToggleActive = async (id, active) => {
    try {
      await api.patch(`/auth/users/${id}/active`, active);
      fetchUsers();
    } catch {
      toast.error('No se pudo actualizar el estado.');
    }
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setFormData({
      name: u.name, email: u.email, role: u.role,
      password: '', cedula: u.cedula ?? '', edad: u.edad ?? '',
      active: u.active ?? true,
    });
    // Scroll suave al formulario sin window.scrollTo disruptivo
    document.getElementById('user-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const inputCls = `w-full rounded-2xl border border-haverts-secondary/30 bg-white/60
                    px-4 py-3 text-sm text-haverts-primary font-medium outline-none
                    placeholder:text-haverts-primary/30
                    focus:border-haverts-primary focus:ring-2 focus:ring-haverts-primary/10
                    transition-all duration-200`;

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <ConfirmModal />

      <PageHeader
        label="Personal"
        title="Gestiona al equipo de tu finca"
        description="Registra usuarios, edita perfiles y encuentra rápidamente al personal correcto."
        action={
          <div className="flex items-center gap-2 rounded-2xl bg-haverts-secondary/10
                          px-4 py-3 border border-haverts-secondary/20">
            <Users className="h-5 w-5 text-haverts-primary/60" />
            <span className="text-sm font-bold text-haverts-primary">
              {users.length} colaboradores
            </span>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1.1fr]">
        {/* Formulario */}
        <DashboardCard
          title={editingId ? 'Editar usuario' : 'Registrar colaborador'}
          subtitle="Crea y ajusta perfiles de tu equipo"
          action={editingId && (
            <button onClick={cancelEdit} className="btn-ghost text-xs">
              Cancelar
            </button>
          )}
        >
          <form id="user-form" className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
                Nombre
                <input
                  type="text" value={formData.name} required
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={`mt-2 ${inputCls}`}
                  placeholder="Nombre completo"
                />
              </label>
              <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
                Cédula
                <input
                  type="text" value={formData.cedula} required
                  onChange={e => setFormData({ ...formData, cedula: e.target.value })}
                  className={`mt-2 ${inputCls}`}
                  placeholder="Número de documento"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
                Edad
                <input
                  type="number" min="0" value={formData.edad} required
                  onChange={e => setFormData({ ...formData, edad: e.target.value })}
                  className={`mt-2 ${inputCls}`}
                  placeholder="Años"
                />
              </label>
              <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
                Correo electrónico
                <input
                  type="email" value={formData.email} required
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className={`mt-2 ${inputCls}`}
                  placeholder="correo@ejemplo.com"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
                Contraseña
                <input
                  type="password"
                  placeholder={editingId ? 'Nueva clave (opcional)' : 'Contraseña'}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required={!editingId}
                  className={`mt-2 ${inputCls}`}
                />
              </label>
              <label className="block text-xs font-bold text-haverts-primary/60 uppercase tracking-wider">
                Rol
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className={`mt-2 ${inputCls}`}
                >
                  <option value="OPERARIO">Operario</option>
                  <option value="PRODUCTOR">Productor</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </label>
            </div>
            <label className="flex items-center gap-3 text-sm text-haverts-primary/70 font-medium">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                className="h-4 w-4 rounded border-haverts-secondary/40 accent-haverts-primary"
              />
              Cuenta activa
            </label>
            <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
              <UserPlus className="h-4 w-4" />
              {saving ? 'Guardando...' : editingId ? 'Actualizar usuario' : 'Registrar usuario'}
            </button>
          </form>
        </DashboardCard>

        {/* Búsqueda */}
        <DashboardCard
          title="Búsqueda rápida"
          subtitle="Encuentra colaboradores por nombre o documento"
        >
          <div className="relative">
            <Search className={`pointer-events-none absolute left-4 top-3.5 h-5 w-5
                               transition-opacity duration-200
                               ${searchTerm ? 'opacity-0' : 'text-haverts-primary/30'}`} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o cédula..."
              className={`pl-12 ${inputCls}`}
            />
          </div>
          <p className="mt-4 text-sm text-haverts-primary/50">
            Pulsa <span className="font-bold">Editar</span> para cargar los datos en el formulario.
          </p>
        </DashboardCard>
      </div>

      {/* Tabla de colaboradores */}
      <DashboardCard title="Colaboradores" subtitle="Lista completa de usuarios registrados">
        {users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Sin colaboradores"
            description="Registra el primer miembro de tu equipo usando el formulario."
          />
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="table-header">
                  <th className="table-th">Nombre</th>
                  <th className="table-th">Cédula</th>
                  <th className="table-th">Edad</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Rol</th>
                  <th className="table-th">Estado</th>
                  <th className="table-th text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="table-row">
                    <td className="table-td font-bold text-haverts-primary">{u.name}</td>
                    <td className="table-td text-haverts-primary/70">{u.cedula}</td>
                    <td className="table-td text-haverts-primary/70">{u.edad}</td>
                    <td className="table-td text-haverts-primary/70">{u.email}</td>
                    <td className="table-td">
                      <span className="badge text-[10px] uppercase tracking-wider">
                        {u.role}
                      </span>
                    </td>
                    <td className="table-td">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[10px]
                                        font-bold uppercase tracking-wider
                                        ${u.active
                                          ? 'bg-haverts-secondary/20 text-haverts-primary'
                                          : 'bg-red-100 text-red-600'}`}>
                        {u.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(u)}
                          className="p-2 rounded-xl text-haverts-primary/40
                                     hover:text-haverts-primary hover:bg-haverts-secondary/10
                                     transition-all" title="Editar"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(u.id, !u.active)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all
                                      ${u.active
                                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                        : 'bg-haverts-secondary/10 text-haverts-primary hover:bg-haverts-secondary/20'}`}
                        >
                          {u.active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-2 rounded-xl text-haverts-primary/40
                                     hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>
    </div>
  );
};

export default UserManagementPage;
