import { useState, useEffect } from 'react';
import { DashboardLayout } from './components/DashboardComponents';
import { useAuth } from './context/AuthContext';
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
  const { currentUser, login, logout } = useAuth();
  const [view, setView] = useState('finca');
  const [showLogin, setShowLogin] = useState(false);

  // Ajustar la vista por defecto basada en el rol del usuario cuando éste inicia sesión
  useEffect(() => {
    if (currentUser) {
      const defaultView = currentUser.role === 'OPERARIO'
        ? 'operaciones'
        : currentUser.role === 'ADMIN'
          ? 'usuarios'
          : 'finca';
      setView(defaultView);
    }
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    login(user);
    setShowLogin(false);
  };

  const handleStartLogin = () => {
    setShowLogin(true);
  };

  const handleLogout = () => {
    logout();
    setView('finca');
    setShowLogin(false);
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
        return <div className="text-center py-12 text-haverts-primary/50 font-semibold">Selecciona una sección del menú.</div>;
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
