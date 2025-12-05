import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

const CuentasCorrientes = () => {
    const [empresas, setEmpresas] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const navigate = useNavigate();

    // Obtener lista de empresas desde CUENTAS-CORRIENTES
    const obtenerEmpresas = useCallback(async () => {
        const snap = await getDocs(collection(db, "CUENTAS-CORRIENTES"));

        let lista = snap.docs.map(docSnap => ({
            id: docSnap.id,                 // ALTOS_DEL_PLATA
            nombre: docSnap.data().nombre, // "ALTOS DEL PLATA"
            retirosAFacturar: docSnap.data().retirosAFacturar || 0,
        }));

        // Ordenar A-Z
        lista.sort((a, b) => a.nombre.localeCompare(b.nombre));

        setEmpresas(lista);
    }, []);

    useEffect(() => {
        obtenerEmpresas();
    }, [obtenerEmpresas]);

    // Filtrar empresas por texto
    const empresasFiltradas = empresas.filter(emp =>
        emp.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="contenedor-visualizacion-clientes">
            <div className="contenedor-titulo">
                <h1 className="titulo">CUENTAS CORRIENTES</h1>
            </div>

            {/* Buscador */}
            <div className="contenedor-buscador">
                <div className="elementos-buscador">

                    {/* BOTÓN BACK */}
                    <Link className="contenedor-back" to="/dashboard">
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 24 24">
                                <path
                                    fill="#137CAA"
                                    d="M3.97 12c0 4.41 3.62 8.03 8.03 8.03s8.03-3.62 8.03-8.03S16.41 3.97 12 3.97S3.97 7.59 3.97 12M2 12C2 6.46 6.46 2 12 2s10 4.46 10 10s-4.46 10-10 10S2 17.54 2 12m8.46-1V8L6.5 12l3.96 4v-3h7.04v-2"
                                />
                            </svg>
                        </span>
                    </Link>

                    {/* INPUT BUSCAR */}
                    <div className="buscador-wrapper">
                        <input
                            id="buscador"
                            type="text"
                            placeholder="BUSCADOR"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24">
                            <path
                                fill="#aa6713"
                                d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5"
                            />
                        </svg>
                    </div>

                </div>
            </div>

            {/* TABLA DE CUENTAS CORRIENTES */}
            <div className="contenedor-tabla-clientes">
                <div className="scroll-tabla-clientes">
                    <table className="tabla-clientes">
                        <thead>
                            <tr>
                                <th>RAZÓN SOCIAL</th>
                                <th>RETIRO DE MATERIALES</th>
                            </tr>
                        </thead>

                        <tbody>
                            {empresasFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan="2">No se encontraron resultados</td>
                                </tr>
                            ) : (
                                empresasFiltradas.map((emp) => (
                                    <tr key={emp.id}>
                                        <td className="td-empresas-en-cuentas-corrientes">
                                            <div className="empresa-wrapper">
                                                {emp.nombre}
                                                {emp.retirosAFacturar > 0 && (
                                                    <span className="badge-retiros-empresa">
                                                        {emp.retirosAFacturar}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="boton-ver-remito">
                                            <button
                                                onClick={() =>
                                                    navigate(`/cuentas-corrientes/${emp.id}`)
                                                }
                                                className="btn-ver-remitos"
                                            >
                                                VER RETIRO DE MATERIALES
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CuentasCorrientes;
