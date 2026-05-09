import { useState } from 'react';
import axios from 'axios';
import { DashboardLayout } from './componets/DashboardComponents';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Login/LoginPage';
import UserManagementPage from './pages/UserManagement/UserManagementPage';
import FincaManagementPage from './pages/Finca/FincaManagementPage';
import InventoryPage from './pages/Inventory/InventoryPage';
import OperationsPage from './pages/Operations/OperationsPage';
import ReportsPage from './pages/Reports/ReportsPage';
import NovedadesPage from './pages/Novedades/NovedadesPage';

const sidebarItems = [
  { key: 'usuarios', label: 'Usuarios', roles: ['ADMIN'] },
  { key: 'finca', label: 'Gestión de Finca', roles: ['ADMIN', 'PRODUCTOR'] },
  { key: 'insumos', label: 'Insumos', roles: ['ADMIN', 'PRODUCTOR'] },
  { key: 'operaciones', label: 'Operaciones', roles: ['ADMIN', 'PRODUCTOR', 'OPERARIO'] },
  { key: 'novedades', label: 'Eventos Imprevistos', roles: ['ADMIN', 'PRODUCTOR', 'OPERARIO'] },
  { key: 'reportes', label: 'Reportes', roles: ['ADMIN', 'PRODUCTOR'] }
];

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('agroMagUser');
      if (!savedUser) return null;
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser?.role) {
        parsedUser.role = parsedUser.role.toUpperCase();
      }
      if (parsedUser?.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
      }
      return parsedUser;
    } catch (error) {
      console.warn('Usuario guardado en localStorage inválido:', error);
      localStorage.removeItem('agroMagUser');
      return null;
    }
  });

  const defaultView = currentUser?.role === 'OPERARIO'
    ? 'operaciones'
    : currentUser?.role === 'ADMIN'
      ? 'usuarios'
      : 'finca';

  const [view, setView] = useState(defaultView || 'finca');
  const [showLogin, setShowLogin] = useState(false);

  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const handleLoginSuccess = (user) => {
    const normalizedUser = {
      ...user,
      role: user?.role ? user.role.toUpperCase() : 'OPERARIO',
    };
    setCurrentUser(normalizedUser);
    localStorage.setItem('agroMagUser', JSON.stringify(normalizedUser));
    setAuthToken(normalizedUser.token);
    setView(normalizedUser.role === 'OPERARIO' ? 'operaciones' : normalizedUser.role === 'ADMIN' ? 'usuarios' : 'finca');
  };

  const handleStartLogin = () => {
    setShowLogin(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('finca');
    setShowLogin(false);
    localStorage.removeItem('agroMagUser');
    setAuthToken(null);
  };

  if (!currentUser) {
    return showLogin ? (
      <LoginPage onLoginSuccess={handleLoginSuccess} onBack={() => setShowLogin(false)} />
    ) : (
      <HomePage onStartLogin={handleStartLogin} />
    );
  }

  const allowedSidebar = sidebarItems.filter(item => item.roles.includes(currentUser.role));

  const getPageTitle = () => {
    const titles = {
      usuarios: 'Gestión de Usuarios',
      finca: 'Gestión de Finca',
      insumos: 'Inventario de Insumos',
      operaciones: 'Operaciones',
      novedades: 'Eventos Imprevistos',
      reportes: 'Reportes y Análisis'
    };
    return titles[view] || 'Panel de Control';
  };

  const renderSection = () => {
    switch (view) {
      case 'usuarios':
        return <UserManagementPage />;
      case 'finca':
        return <FincaManagementPage />;
      case 'insumos':
        return <InventoryPage />;
      case 'operaciones':
        return <OperationsPage currentUser={currentUser} />;
      case 'novedades':
        return <NovedadesPage />;
      case 'reportes':
        return <ReportsPage />;
      default:
        return <div className="text-center py-12 text-slate-500">Selecciona una sección del menú.</div>;
    }
  };

  return (
    <DashboardLayout
      sidebarItems={allowedSidebar}
      activeItem={view}
      onSidebarItemClick={setView}
      user={currentUser}
      onLogout={handleLogout}
      title={getPageTitle()}
      subtitle={`Bienvenido, ${currentUser.name}`}
    >
      {renderSection()}
    </DashboardLayout>
  );
}

export default App;
