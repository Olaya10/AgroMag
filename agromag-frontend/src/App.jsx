import { useState } from 'react';
import LoginPage from './pages/Login/LoginPage';
import UserManagementPage from './pages/UserManagement/UserManagementPage';
import LoteManagementPage from './pages/Lote/LoteManagementPage';
import InventoryPage from './pages/Inventory/InventoryPage';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('agroMagUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Estado para controlar qué sección ve el Productor/Operario
  const [view, setView] = useState('lotes');

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('agroMagUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('lotes');
    localStorage.removeItem('agroMagUser');
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div>
      {/* Navbar Principal */}
      <nav style={{ padding: '15px 40px', background: '#2e7d32', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
        <h2 style={{ margin: 0, letterSpacing: '1px' }}>🌿 AgroMag</h2>

        {/* Menú de navegación para Productor y Operario */}
        {currentUser.role !== 'ADMIN' && (
          <div style={{ display: 'flex', gap: '20px' }}>
            <button
              onClick={() => setView('lotes')}
              style={navButtonStyle(view === 'lotes')}>
              Finca y Lotes
            </button>
            <button
              onClick={() => setView('inventario')}
              style={navButtonStyle(view === 'inventario')}>
              Bodega (Insumos)
            </button>
          </div>
        )}

        <div>
          <span style={{ marginRight: '20px' }}>
            Bienvenido, <b>{currentUser.name}</b> <small>({currentUser.role})</small>
          </span>
          <button onClick={handleLogout} style={{ background: '#f1f8e9', color: '#2e7d32', border: 'none', borderRadius: '4px', padding: '7px 15px', cursor: 'pointer', fontWeight: 'bold' }}>
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Contenido Dinámico */}
      <div style={{ padding: '20px' }}>

        {/* ROL ADMIN: Solo gestión de usuarios */}
        {currentUser.role === 'ADMIN' && <UserManagementPage />}

        {/* OTROS ROLES: Navegación por pestañas */}
        {currentUser.role !== 'ADMIN' && (
          <>
            {view === 'lotes' ? (
              <LoteManagementPage />
            ) : (
              <InventoryPage />
            )}
          </>
        )}

      </div>
    </div>
  );
}

// Estilo auxiliar para los botones del menú
const navButtonStyle = (isActive) => ({
  background: isActive ? '#1b5e20' : 'transparent',
  color: 'white',
  border: '1px solid white',
  borderRadius: '4px',
  padding: '8px 15px',
  cursor: 'pointer',
  fontWeight: isActive ? 'bold' : 'normal',
  transition: '0.3s'
});

export default App;