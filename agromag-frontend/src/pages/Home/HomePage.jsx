import './HomePage.css';

const HomePage = ({ onStartLogin }) => {
    return (
        <div className="home-screen">
            <div className="home-topbar">
                <div className="home-brand-space">
                    <div className="brand-placeholder">
                        <span>Logo</span>
                        <p>Tu logo aquí</p>
                    </div>
                </div>
                <button className="home-login-button" onClick={onStartLogin}>
                    Iniciar Sesión
                </button>
            </div>

            <div className="home-hero">
                <div className="hero-copy">
                    <span className="hero-tag">Bienvenido a AgroMag</span>
                    <h1>Tu plataforma agrícola inteligente para gestionar finca, lotes y cultivos.</h1>
                    <p>
                        Controla cada cultivo con claridad, gestiona lotes con precisión y toma decisiones
                        más rápidas desde una única aplicación pensada para productores modernos.
                    </p>
                    <button className="hero-cta" onClick={onStartLogin}>
                        Comenzar Sesión
                    </button>
                </div>

                <div className="hero-visual">
                    <div className="hero-card">
                        <div className="hero-card-title">AgroMag</div>
                        <div className="hero-card-copy">
                            Cosecha más, organiza mejor y tiene todo el control de tu finca desde un solo lugar.
                        </div>
                        <div className="hero-stats">
                            <div>
                                <strong>🌱 100%</strong>
                                <span>Visibilidad de cultivos</span>
                            </div>
                            <div>
                                <strong>📊</strong>
                                <span>Decisiones basadas en datos</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
