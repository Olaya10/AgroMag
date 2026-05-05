import { motion } from 'framer-motion';
import { Navbar, FeatureCard, GlowButton, ScrollReveal } from '../../componets/BaseComponents';
import { 
  Leaf, 
  BarChart3, 
  Zap, 
  Shield, 
  Users, 
  TrendingUp,
  ArrowRight 
} from 'lucide-react';

const HomePage = ({ onStartLogin }) => {
  const features = [
    {
      icon: Leaf,
      title: 'Gestión Inteligente',
      description: 'Monitorea cultivos en tiempo real y recibe alertas automáticas'
    },
    {
      icon: BarChart3,
      title: 'Análisis Avanzado',
      description: 'Dashboards interactivos con datos precisos de tu producción'
    },
    {
      icon: Zap,
      title: 'Automatización',
      description: 'Optimiza tus operaciones con tareas automáticas y reportes'
    },
    {
      icon: Shield,
      title: 'Seguridad Premium',
      description: 'Tus datos protegidos con encriptación de grado empresarial'
    },
    {
      icon: Users,
      title: 'Colaboración',
      description: 'Gestiona tu equipo con roles y permisos personalizados'
    },
    {
      icon: TrendingUp,
      title: 'Crecimiento',
      description: 'Aumenta productividad y rentabilidad de tu finca'
    },
  ];

  const stats = [
    { value: '100%', label: 'Visibilidad' },
    { value: '24/7', label: 'Monitoreo' },
    { value: '99.9%', label: 'Uptime' },
  ];

  return (
    <div className="min-h-screen bg-agro-light overflow-hidden">
      {/* Navbar */}
      <Navbar onLoginClick={onStartLogin} />

      {/* Hero Section */}
      <section className="relative pt-20 pb-40 md:pt-32 md:pb-60">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-agro-emerald/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-agro-forest/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Texto Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block mb-6"
              >
                <span className="badge">✨ Bienvenido a AgroMag</span>
              </motion.div>

              <h1 className="section-title mb-6 leading-tight">
                Tu plataforma agrícola{' '}
                <span className="bg-gradient-to-r from-agro-forest via-agro-emerald to-green-600 bg-clip-text text-transparent">
                  inteligente
                </span>
              </h1>

              <p className="section-subtitle mb-8 text-slate-600">
                Controla cada cultivo con claridad, gestiona lotes con precisión y toma 
                decisiones más rápidas desde una única aplicación pensada para productores modernos.
              </p>

              <motion.div
                whileHover={{ x: 5 }}
                className="inline-flex gap-4"
              >
                <GlowButton onClick={onStartLogin} className="group">
                  <span className="flex items-center gap-2">
                    Comenzar Ahora
                    <motion.span
                      className="inline-block"
                      animate={{ x: [0, 8, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.span>
                  </span>
                </GlowButton>
              </motion.div>
            </motion.div>

            {/* Elemento Visual Derecho */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative"
              >
                <div className="card-glass p-8 backdrop-blur-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-agro-emerald to-green-600 flex items-center justify-center shadow-glow">
                      <Leaf className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-agro-forest text-xl">AgroMag</h3>
                      <p className="text-sm text-slate-600">Gestión Agrícola Inteligente</p>
                    </div>
                  </div>

                  <p className="text-slate-700 mb-6 font-light leading-relaxed">
                    Cosecha más, organiza mejor y ten todo el control de tu finca desde un solo lugar.
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    {stats.map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="text-center p-3 rounded-lg bg-white/40 backdrop-blur"
                      >
                        <div className="font-display font-bold text-agro-emerald text-lg">
                          {stat.value}
                        </div>
                        <div className="text-xs text-slate-600">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-agro-emerald/20 to-green-600/20 rounded-3xl blur-2xl -z-10 animate-glow-pulse" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <h2 className="section-title mb-4">Características Poderosas</h2>
            <p className="section-subtitle">
              Todo lo que necesitas para gestionar tu finca de forma inteligente
            </p>
          </ScrollReveal>

          {/* Bento Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => (
              <FeatureCard key={i} {...feature} delay={i * 0.05} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-agro-light relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 w-96 h-96 bg-agro-emerald/5 rounded-full blur-3xl -translate-x-1/2" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="section-title mb-6">¿Listo para Transformar tu Finca?</h2>
            <p className="section-subtitle mb-8 max-w-2xl mx-auto">
              Únete a cientos de productores que ya optimizan su agricultura con AgroMag
            </p>
            <GlowButton onClick={onStartLogin} className="text-lg px-8 py-4">
              Iniciar Sesión Ahora
            </GlowButton>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-600">
          <p>© 2026 AgroMag. Gestión agrícola inteligente para el futuro.</p>
        </div>
      </footer>
    </div>
    );
};

export default HomePage;
