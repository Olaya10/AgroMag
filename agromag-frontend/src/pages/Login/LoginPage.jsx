import { useState } from 'react';
import axios from 'axios';
import './LoginStyles.css';

const LoginPage = ({ onLoginSuccess }) => {
    const [loginData, setLoginData] = useState({ email: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8080/auth/login', loginData);
            onLoginSuccess(res.data);
        } catch (err) {
            alert("Error: Credenciales incorrectas");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>AgroMag Login</h2>
                <form className="login-form" onSubmit={handleSubmit}>
                    <input
                        type="email" placeholder="Correo"
                        onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                        required
                    />
                    <input
                        type="password" placeholder="Contraseña"
                        onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                        required
                    />
                    <button type="submit" className="btn-login">Entrar al Sistema</button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;