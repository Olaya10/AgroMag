import { useState } from 'react';
import axios from 'axios';
import './LoginStyles.css';

const LoginPage = ({ onLoginSuccess, onBack }) => {
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:9000/api/auth/login', loginData);
            onLoginSuccess(res.data);
        } catch (err) {
            alert("Error: Credenciales incorrectas");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-brand">
                    <div className="login-logo">🌿</div>
                    <div>
                        <h2>AgroMag</h2>
                        <p>Bienvenido de nuevo. Ingresa para administrar la finca.</p>
                    </div>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <input
                        type="email" placeholder="Correo electrónico"
                        value={loginData.email}
                        onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                        required
                    />
                    <input
                        type="password" placeholder="Contraseña"
                        value={loginData.password}
                        onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                        required
                    />
                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? 'Cargando...' : 'Entrar al Sistema'}
                    </button>
                </form>
                {onBack && (
                    <button type="button" className="btn-back" onClick={onBack}>
                        Volver a la pantalla principal
                    </button>
                )}
            </div>
        </div>
    );
};

export default LoginPage;