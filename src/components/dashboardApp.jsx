import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";

const DashboardApp = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logoutUser();
        navigate("/");
    };
    return (
        <div className="contenedor-del-dashboard">
            <div className="dashboard">
                {/* Tarjeta 1 */}
                <Link to="/registrar-clientes" className="link-tarjeta">
                    <div className="contenedor-registrar-cliente">
                        <img className="img-dashboard" src="/CargarDatos.png" alt="Carga de datos" />
                        <h2 className="titulo-tarjetas-dashboard">
                            REGISTRAR CLIENTE
                        </h2>
                    </div>
                </Link>

                {/* Tarjeta 2 */}
                <Link to="/visualizar-clientes" className="link-tarjeta">
                    <div className="contenedor-vizualizar-datos">
                        <img className="img-dashboard" src="/VisualizarDatos.png" alt="Visualizacion de datos" />
                        <h2 className="titulo-tarjetas-dashboard">
                            VISUALIZAR CLIENTES
                        </h2>
                    </div>
                </Link>
            </div>
            <div className="contenedor-logout">
                <button id="btn-logout" className="boton-logout" onClick={handleLogout}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
                        <path fill="#aa6713" d="M5.64 4.22h14.14v14.14l-4.24-4.24l-5.66 5.66l-5.66-5.66l5.66-5.66zm12.02 2.12h-7.07l2.12 2.12l-5.66 5.66l2.83 2.83l5.66-5.66l2.12 2.12z" />
                    </svg>
                    <span className="salir">SALIR</span>
                </button>
            </div>
        </div>
    );
}

export default DashboardApp;
