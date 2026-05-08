import { useState } from 'react';
import api from '../../api';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Mail, Leaf, AlertCircle, UserPlus, ShieldCheck } from 'lucide-react';

const LoginPage = ({ onLoginSuccess, onBack }) => {
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerMode, setRegisterMode] = useState(false);
    const [registerData, setRegisterData] = useState({ name: '', cedula: '', edad: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', loginData);
            onLoginSuccess(res.data);
        } catch (err) {
            setError('Credenciales incorrectas. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/register', {
                ...registerData,
                role: 'OPERARIO',
                active: true,
            });

            const loginRes = await api.post('/auth/login', {
                email: registerData.email,
                password: registerData.password,
            });
            onLoginSuccess(loginRes.data);
        } catch (err) {
            setError('No se pudo registrar. Verifica los datos e intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-agro-light via-white to-agro-soft flex items-center justify-center p-4 relative overflow-hidden">
            {/* Fondos decorativos */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-agro-emerald/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-agro-forest/10 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md"
            >
                {/* Botón volver */}
                {onBack && (
                    <motion.button
                        whileHover={{ x: -5 }}
                        onClick={onBack}
                        className="mb-6 flex items-center gap-2 text-slate-600 hover:text-agro-forest transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Volver</span>
                    </motion.button>
                )}

                {/* Card principal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="card-glass p-8 sm:p-10"
                >
                    {/* Logo y branding */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-center mb-8"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-agro-emerald to-green-600 flex items-center justify-center shadow-glow">
                            <Leaf className="w-8 h-8 text-white" />
                        </div>
                    </motion.div>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-display font-bold text-agro-forest mb-2">
                            AgroMag
                        </h1>
                        <p className="text-slate-600 font-light">
                            Bienvenido de nuevo
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            Ingresa para administrar tu finca
                        </p>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Error message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200"
                            >
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-700">{error}</p>
                            </motion.div>
                        )}

                        {/* Email input */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="relative"
                        >
                            <div className="absolute left-4 top-3.5 text-slate-400">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                value={loginData.email}
                                onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                                required
                                className="input-field pl-12"
                            />
                        </motion.div>

                        {/* Password input */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="relative"
                        >
                            <div className="absolute left-4 top-3.5 text-slate-400">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type="password"
                                placeholder="Contraseña"
                                value={loginData.password}
                                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                                required
                                className="input-field pl-12"
                            />
                        </motion.div>

                        {/* Submit button */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <Leaf className="w-5 h-5" />
                                    </motion.div>
                                    Cargando...
                                </span>
                            ) : (
                                'Entrar al Sistema'
                            )}
                        </motion.button>
                    </form>

                    {/* Footer text */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-6 text-center text-sm text-slate-600"
                    >
                        <p>
                            Plataforma de gestión agrícola inteligente{' '}
                            <span className="text-agro-emerald font-semibold">AgroMag</span>
                        </p>
                    </motion.div>
                </motion.div>

                {/* Glow effect */}
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-agro-emerald/20 rounded-full blur-3xl animate-glow-pulse -z-10" />
            </motion.div>
        </div>
    );
};

export default LoginPage;