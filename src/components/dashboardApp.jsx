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
            const snap = await getDocs(collection(db, "CUENTAS-CORRIENTES"));
            let total = 0;

            for (const empresaDoc of snap.docs) {
                total += empresaDoc.data().retirosAFacturar || 0;
            }

            setTotalRetirosAFacturar(total);
        };

        cargarContador();
    }, []);

    return (
        <div className="contenedor-del-dashboard">

            <div className="layout-dashboard">

                {/* ✅ ASIDE */}
                <aside className="aside-dashboard">
                    <nav>
                        <Link to="/registrar-clientes">REGISTRAR CLIENTES</Link>
                        <Link to="/visualizar-clientes">VISUALIZAR CLIENTES</Link>
                        <Link to="/enviar-mensaje">ENVIAR WHATSAPP</Link>

                        <Link to="/cuentas-corrientes" className="item-con-badge">
                            CUENTAS CORRIENTES
                            {totalRetirosAFacturar > 0 && (
                                <span className="badge">
                                    {totalRetirosAFacturar}
                                </span>
                            )}
                        </Link>
                    </nav>

                    <button className="btn-logout" onClick={handleLogout}>
                        SALIR
                    </button>
                </aside>

                {/* ✅ MAIN */}
                <main className="dashboard">
                    
                </main>

            </div>
        </div>
    );
};

export default DashboardApp;
