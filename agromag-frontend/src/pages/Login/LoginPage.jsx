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
        <div className="min-h-screen bg-haverts-base flex items-center justify-center p-4 relative overflow-hidden">
            {/* Fondos decorativos */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-haverts-secondary/10 rounded-full blur-[120px] -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-haverts-accent/5 rounded-full blur-[120px] -ml-64 -mb-64" />
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
                        className="mb-8 flex items-center gap-2 text-haverts-primary/60 hover:text-haverts-primary transition-colors font-bold uppercase tracking-widest text-xs"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Volver al inicio</span>
                    </motion.button>
                )}

                {/* Card principal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-white/40 backdrop-blur-xl p-10 rounded-[40px] border border-haverts-secondary/20 shadow-medium"
                >
                    {/* Logo y branding */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-center mb-8"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-haverts-primary flex items-center justify-center shadow-soft">
                            <Leaf className="w-8 h-8 text-haverts-base" />
                        </div>
                    </motion.div>

                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-display font-bold text-haverts-primary mb-2 tracking-tight">
                            AgroMag
                        </h1>
                        <div className="inline-block px-3 py-1 rounded-full bg-haverts-secondary/10 text-haverts-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                            Premium Agri-Tech
                        </div>
                        <p className="text-haverts-primary/60 font-medium">
                            {registerMode ? 'Crea tu cuenta profesional' : 'Bienvenido de nuevo'}
                        </p>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={registerMode ? handleRegisterSubmit : handleSubmit} className="space-y-5">
                        {/* Error message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 p-4 rounded-2xl bg-red-50/50 border border-red-200/50 backdrop-blur-sm"
                            >
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-sm font-medium text-red-700">{error}</p>
                            </motion.div>
                        )}

                        {registerMode && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="relative"
                                >
                                    <div className={`pointer-events-none absolute left-4 top-3.5 transition-opacity ${registerData.name ? 'opacity-0' : 'text-haverts-primary/40'}`}>
                                        <UserPlus className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Nombre completo"
                                        value={registerData.name}
                                        onChange={e => setRegisterData({ ...registerData, name: e.target.value })}
                                        required
                                        className="input-field pl-12"
                                    />
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="relative"
                                >
                                    <div className={`pointer-events-none absolute left-4 top-3.5 transition-opacity ${registerData.cedula ? 'opacity-0' : 'text-haverts-primary/40'}`}>
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Cédula"
                                        value={registerData.cedula}
                                        onChange={e => setRegisterData({ ...registerData, cedula: e.target.value })}
                                        required
                                        className="input-field pl-12"
                                    />
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="relative"
                                >
                                    <input
                                        type="number"
                                        placeholder="Edad"
                                        value={registerData.edad}
                                        onChange={e => setRegisterData({ ...registerData, edad: e.target.value })}
                                        required
                                        className="input-field px-4"
                                    />
                                </motion.div>
                            </>
                        )}

                        {/* Email input */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="relative"
                        >
                            <div className={`pointer-events-none absolute left-4 top-3.5 transition-opacity ${(registerMode ? registerData.email : loginData.email) ? 'opacity-0' : 'text-haverts-primary/40'}`}>
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                value={registerMode ? registerData.email : loginData.email}
                                onChange={e => registerMode 
                                    ? setRegisterData({ ...registerData, email: e.target.value }) 
                                    : setLoginData({ ...loginData, email: e.target.value })}
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
                            <div className={`pointer-events-none absolute left-4 top-3.5 transition-opacity ${(registerMode ? registerData.password : loginData.password) ? 'opacity-0' : 'text-haverts-primary/40'}`}>
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type="password"
                                placeholder="Contraseña"
                                value={registerMode ? registerData.password : loginData.password}
                                onChange={e => registerMode 
                                    ? setRegisterData({ ...registerData, password: e.target.value }) 
                                    : setLoginData({ ...loginData, password: e.target.value })}
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
                            className="w-full btn-primary py-4 mt-6 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <Leaf className="w-5 h-5" />
                                    </motion.div>
                                    Autenticando...
                                </span>
                            ) : (
                                registerMode ? 'Crear Cuenta' : 'Acceder al Portal'
                            )}
                        </motion.button>
                        
                        <div className="text-center mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setRegisterMode(!registerMode);
                                    setError('');
                                }}
                                className="text-sm font-bold text-haverts-primary/60 hover:text-haverts-primary transition uppercase tracking-wider"
                            >
                                {registerMode ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                            </button>
                        </div>
                    </form>

                    {/* Footer text */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-10 text-center text-[10px] text-haverts-primary/40 font-bold uppercase tracking-[0.2em]"
                    >
                        <p>
                            Sistema de Gestión Agrícola{' '}
                            <span className="text-haverts-primary">AgroMag v2.0</span>
                        </p>
                    </motion.div>
                </motion.div>

                {/* Decorative elements */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-haverts-accent/20 rounded-full blur-3xl -z-10 animate-pulse" />
            </motion.div>
        </div>
    );
};

export default LoginPage;