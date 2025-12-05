import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

const DashboardApp = () => {
    const navigate = useNavigate();
    const [totalRetirosAFacturar, setTotalRetirosAFacturar] = useState(0);

    const handleLogout = async () => {
        await logoutUser();
        navigate("/");
    };

    useEffect(() => {
        const cargarContador = async () => {
            // 🔍 Leer TODAS las empresas dentro de CUENTAS-CORRIENTES
            const snap = await getDocs(collection(db, "CUENTAS-CORRIENTES"));

            let total = 0;

            for (const empresaDoc of snap.docs) {
                // Cada empresa tiene el campo retirosAFacturar actualizado
                const data = empresaDoc.data();
                total += data.retirosAFacturar || 0;
            }

            setTotalRetirosAFacturar(total);
        };

        cargarContador();
    }, []);

    return (
        <div className="contenedor-del-dashboard">
            <div className="dashboard">

                {/* Tarjeta 1 */}
                <Link to="/registrar-clientes" className="link-tarjeta">
                    <div className="contenedor-registrar-cliente">
                        <img className="img-dashboard" src="/CargarDatos.png" alt="Carga de datos" />
                        <h2 className="titulo-tarjetas-dashboard">REGISTRAR CLIENTE</h2>
                    </div>
                </Link>

                {/* Tarjeta 2 */}
                <Link to="/visualizar-clientes" className="link-tarjeta">
                    <div className="contenedor-vizualizar-datos">
                        <img className="img-dashboard" src="/VisualizarDatos.png" alt="Visualizacion de datos" />
                        <h2 className="titulo-tarjetas-dashboard">VISUALIZAR CLIENTES</h2>
                    </div>
                </Link>

                {/* Tarjeta 3 */}
                <Link to="/enviar-mensaje" className="link-tarjeta">
                    <div className="contenedor-vizualizar-datos">
                        <img className="img-dashboard" src="/EnviarMensaje.png" alt="Enviar mensaje" />
                        <h2 className="titulo-tarjetas-dashboard">ENVIAR WHATSAPP</h2>
                    </div>
                </Link>

                {/* Tarjeta 4 — CUENTAS CORRIENTES + BADGE */}
                <Link to="/cuentas-corrientes" className="link-tarjeta dashboard-i">
                    <div className="contenedor-vizualizar-datos contenedor-cc-con-badge">
                        <img className="img-dashboard" src="/CuentasCorrientes.png" alt="Cuentas corrientes" />
                        <h2 className="titulo-tarjetas-dashboard">CUENTAS CORRIENTES</h2>

                    </div>
                </Link>
                <div className="espaciador-dashboard">
                </div>
                <div className="contenedor-de-i-en-dashboard">
                    {/* 🔥 Badge si hay retiros a facturar */}
                    {totalRetirosAFacturar > 0 && (
                        <div class="tooltip">
                            <div class="icon">i</div>
                            <div class="tooltiptext">{totalRetirosAFacturar} RETIROS SIN FACTURAR</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="contenedor-logout">
                <button id="btn-logout" className="boton-movimiento" onClick={handleLogout}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
                        <path fill="#aa6713" d="M5.64 4.22h14.14v14.14l-4.24-4.24l-5.66 5.66l-5.66-5.66l5.66-5.66zm12.02 2.12h-7.07l2.12 2.12l-5.66 5.66l2.83 2.83l5.66-5.66l2.12 2.12z" />
                    </svg>
                    <span className="salir">SALIR</span>
                </button>
            </div>
        </div>
    );
};

export default DashboardApp;
