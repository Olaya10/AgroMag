import { useState, useEffect } from 'react';
import { DashboardLayout } from './components/DashboardComponents';
import useDarkMode from './hooks/useDarkMode';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import api from './api';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Login/LoginPage';
import UserManagementPage from './pages/UserManagement/UserManagementPage';
import FincaManagementPage from './pages/Finca/FincaManagementPage';
import InventoryPage from './pages/Inventory/InventoryPage';
import OperationsPage from './pages/Operations/OperationsPage';
import ReportsPage from './pages/Reports/ReportsPage';
import NovedadesPage from './pages/Novedades/NovedadesPage';

const sidebarItems = [
  { key: 'home', label: 'Inicio', roles: ['ADMIN', 'PRODUCTOR', 'OPERARIO'] },
  { key: 'usuarios', label: 'Usuarios', roles: ['ADMIN'] },
  { key: 'finca', label: 'Gestión de Finca', roles: ['ADMIN', 'PRODUCTOR'] },
  { key: 'insumos', label: 'Insumos', roles: ['ADMIN', 'PRODUCTOR'] },
  { key: 'operaciones', label: 'Operaciones', roles: ['ADMIN', 'PRODUCTOR', 'OPERARIO'] },
  { key: 'novedades', label: 'Eventos Imprevistos', roles: ['ADMIN', 'PRODUCTOR', 'OPERARIO'] },
  { key: 'reportes', label: 'Reportes', roles: ['ADMIN', 'PRODUCTOR'] }
];

function App() {
  const { currentUser, login, logout } = useAuth();
  const [view, setView] = useState('home');
  const [showLogin, setShowLogin] = useState(false);
  
  // ==== RF44-46 – Data for dashboard KPIs ====
  const [operacionesData, setOperacionesData] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(false);

  // ==== RF49 – Toggle Dark Mode (Usando el Custom Hook) ====
  const [isDark, toggleDarkMode] = useDarkMode();

  // ==== RF44-46 – Fetch operations data (riegos + aplicaciones) ====
  const fetchOperaciones = async () => {
    try {
      setCargandoDatos(true);
      const [riegosRes, aplicacionesRes] = await Promise.all([
        api.get('/riegos'),
        api.get('/inventory/bodega/aplicaciones') // 
      ]);
      // Transformar datos de riegos
      const riegosTransformados = (riegosRes.data || []).map(riego => ({
        id: riego.id,
        fecha: riego.fechaHora ? riego.fechaHora.split('T')[0] : new Date().toISOString().split('T')[0],
        volumenAgua: riego.cantidadAguaLitros || 0,
        lote: riego.lote?.nombre || 'Sin lote'
      }));

      // Transformar datos de aplicaciones
      const aplicacionesTransformadas = (aplicacionesRes.data || []).map(app => ({
        id: app.id,
        fecha: app.fecha ? app.fecha.split('T')[0] : new Date().toISOString().split('T')[0],
        insumo: {
          nombre: app.insumo?.nombreComercial || app.insumo?.nombre || 'Desconocido',
          categoria: app.insumo?.tipo || 'Sin categoría'
        },
        cantidad: app.dosis || 0,
        lote: app.loteId
      }));

      // Combinar todos los datos
      const datosCompletos = [...riegosTransformados, ...aplicacionesTransformadas];
      setOperacionesData(datosCompletos);
    } catch (error) {
      console.error('Error al obtener operaciones:', error);
      setOperacionesData([]);
    } finally {
      setCargandoDatos(false);
    }
  };

  // Set default view to Home after login
  useEffect(() => {
    if (currentUser) {
      setView('home');
      fetchOperaciones();
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
    setView('home');
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
      home: 'Resumen General',
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
      case 'home':
        // No renderizamos <HomePage /> porque esa es la Landing Page pública.
        // Dejamos vacío o un placeholder, ya que los gráficos KPI están en DashboardLayout.
        return null;
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
      data={operacionesData}
      fetchData={fetchOperaciones}
    >
      {/* ==== RF49 – Toggle Dark Mode ==== */}
      <div className="flex items-center gap-2 justify-end mb-4">
        <button
          type="button"
          onClick={toggleDarkMode}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition-all duration-200
                     bg-haverts-secondary/15 border border-haverts-secondary/30
                     hover:bg-haverts-secondary/25 hover:border-haverts-secondary/50
                     dark:bg-haverts-secondary/25 dark:border-haverts-secondary/40
                     dark:hover:bg-haverts-secondary/35"
          title="Alternar modo oscuro/claro"
        >
          {isDark ? (
            <>
              <Sun className="h-4 w-4 text-haverts-accent" />
              <span className="hidden sm:inline">Claro</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-haverts-primary" />
              <span className="hidden sm:inline">Oscuro</span>
            </>
          )}
        </button>
      </div>

      {renderSection()}
    </DashboardLayout>
  );
}

export default App;