import { useState } from 'react';
import axios from 'axios';
import './App.css';
import LoginPage from './pages/Login/LoginPage';
import UserManagementPage from './pages/UserManagement/UserManagementPage';
import LoteManagementPage from './pages/Lote/LoteManagementPage';
import InventoryPage from './pages/Inventory/InventoryPage';
import OperationsPage from './pages/Operations/OperationsPage';

const sidebarItems = [
  { key: 'usuarios', label: 'Usuarios', roles: ['ADMIN'] },
  { key: 'lotes', label: 'Lotes', roles: ['ADMIN', 'PRODUCTOR'] },
  { key: 'insumos', label: 'Insumos', roles: ['ADMIN', 'PRODUCTOR'] },
  { key: 'operaciones', label: 'Operaciones', roles: ['ADMIN', 'PRODUCTOR', 'OPERARIO'] }
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
      : 'lotes';

  const [view, setView] = useState(defaultView || 'lotes');

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
    setView(normalizedUser.role === 'OPERARIO' ? 'operaciones' : normalizedUser.role === 'ADMIN' ? 'usuarios' : 'lotes');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('lotes');
    localStorage.removeItem('agroMagUser');
    setAuthToken(null);
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const allowedSidebar = sidebarItems.filter(item => item.roles.includes(currentUser.role));

  const renderSection = () => {
    switch (view) {
      case 'usuarios':
        return <UserManagementPage />;
      case 'lotes':
        return <LoteManagementPage />;
      case 'insumos':
        return <InventoryPage />;
      case 'operaciones':
        return <OperationsPage currentUser={currentUser} />;
      default:
        return <div className="empty-view">Selecciona una sección del menú.</div>;
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">🌿</div>
          <div>
            <h1>AgroMag</h1>
            <p>Gestión agrícola</p>
          </div>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-label">Secciones</p>
          {allowedSidebar.map(item => (
            <button
              key={item.key}
              className={`sidebar-item ${view === item.key ? 'active' : ''}`}
              onClick={() => setView(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <span className="sidebar-footer-title">Conectado como</span>
          <strong>{currentUser.name}</strong>
          <span className="sidebar-footer-role">{currentUser.role}</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Panel AgroMag</p>
            <h2>Hola, {currentUser.name}</h2>
          </div>
          <div className="topbar-actions">
            <div className="profile-card">
              <div className="avatar">{currentUser.name.split(' ').map((word) => word[0]).join('').slice(0, 2)}</div>
              <div>
                <span>{currentUser.name}</span>
                <small>{currentUser.role}</small>
              </div>
            </div>
            <button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button>
          </div>
        </header>

        <section className="content-area">
          {renderSection()}
        </section>
      </main>
    </div>
  );
}

export default App;
