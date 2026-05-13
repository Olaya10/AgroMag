import { motion } from 'framer-motion';
import { Navbar, FeatureCard, GlowButton, ScrollReveal, Footer } from '../../componets/BaseComponents';
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
    <div className="min-h-screen bg-haverts-base overflow-hidden">
      {/* Navbar */}
      <Navbar onLoginClick={onStartLogin} />

      {/* Hero Section */}
      <section className="relative pt-20 pb-40 md:pt-32 md:pb-60">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-haverts-secondary/10 rounded-full blur-[120px] -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-haverts-accent/5 rounded-full blur-[120px] -ml-64 -mb-64" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
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
                className="inline-block mb-8"
              >
                <span className="badge-accent">✨ Bienvenido a AgroMag</span>
              </motion.div>

              <h1 className="text-6xl md:text-7xl font-display font-bold text-haverts-primary mb-8 leading-[0.9] tracking-[-0.03em]">
                Tu plataforma agrícola{' '}
                <span className="text-haverts-contrast">
                  inteligente
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-haverts-primary/70 mb-10 font-medium leading-relaxed max-w-lg">
                Controla cada cultivo con claridad, gestiona lotes con precisión y toma 
                decisiones más rápidas desde una única aplicación pensada para productores modernos.
              </p>

              <div className="flex flex-wrap gap-4">
                <GlowButton onClick={onStartLogin} className="group px-8 py-4 text-lg">
                  <span className="flex items-center gap-3">
                    Comenzar Ahora
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-6 h-6" />
                    </motion.span>
                  </span>
                </GlowButton>
                
                <button 
                  onClick={() => document.getElementById('features').scrollIntoView()}
                  className="px-8 py-4 rounded-xl font-bold text-haverts-primary border border-haverts-primary/10 hover:bg-haverts-primary/5 transition-all duration-300"
                >
                  Ver Características
                </button>
              </div>
            </motion.div>

            {/* Elemento Visual Derecho */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <div className="bg-white/40 backdrop-blur-xl p-10 rounded-[40px] border border-haverts-secondary/20 shadow-medium">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-haverts-primary flex items-center justify-center shadow-soft">
                      <Leaf className="w-8 h-8 text-haverts-base" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-haverts-primary text-2xl tracking-tight">AgroMag Dashboard</h3>
                      <p className="text-sm font-bold text-haverts-primary/50 uppercase tracking-widest">Premium Agri-Tech</p>
                    </div>
                  </div>

                  <p className="text-haverts-primary/80 text-lg mb-8 font-medium leading-relaxed">
                    "Cosecha más, organiza mejor y ten todo el control de tu finca desde un solo lugar."
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="text-center p-4 rounded-2xl bg-haverts-secondary/10 border border-haverts-secondary/10"
                      >
                        <div className="font-display font-bold text-haverts-primary text-2xl mb-1">
                          {stat.value}
                        </div>
                        <div className="text-[10px] font-bold text-haverts-primary/40 uppercase tracking-wider">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Decorative backgrounds */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-haverts-accent/20 rounded-full blur-3xl -z-10" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-haverts-contrast/10 rounded-full blur-3xl -z-10" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-white/30 backdrop-blur-sm border-y border-haverts-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-20">
            <h2 className="text-5xl font-display font-bold text-haverts-primary mb-6 tracking-tight">Características Poderosas</h2>
            <p className="text-xl text-haverts-primary/60 max-w-2xl mx-auto font-medium">
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
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, i) => (
              <FeatureCard key={i} {...feature} delay={i * 0.05} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <ScrollReveal>
            <div className="inline-block p-1 px-4 rounded-full bg-haverts-contrast/10 border border-haverts-contrast/20 text-haverts-contrast font-bold text-sm uppercase tracking-widest mb-8">
              Empieza Hoy
            </div>
            <h2 className="text-5xl md:text-6xl font-display font-bold text-haverts-primary mb-8 tracking-tight">¿Listo para Transformar tu Finca?</h2>
            <p className="text-xl text-haverts-primary/60 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              Únete a cientos de productores que ya optimizan su agricultura con AgroMag
            </p>
            <GlowButton onClick={onStartLogin} className="text-xl px-12 py-5" variant="contrast">
              Iniciar Sesión Ahora
            </GlowButton>
          </ScrollReveal>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-haverts-secondary/10 rounded-full blur-[100px] -translate-y-1/2 -ml-32" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-haverts-accent/10 rounded-full blur-[100px] -translate-y-1/2 -mr-32" />
      </section>

      {/* Footer */}
      <Footer />
    </div>
    );
};

export default HomePage;
