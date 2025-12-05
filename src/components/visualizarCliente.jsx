import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "react-toastify";

const VisualizarCliente = () => {
    const [clientes, setClientes] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [copiadoId, setCopiadoId] = useState(null);
    const [copiadoMailId, setCopiadoMailId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const contenedor = document.querySelector(".scroll-tabla-clientes");
        if (!contenedor) return;

        const handleScroll = () => {
            if (contenedor.scrollTop > 0) {
                contenedor.classList.add("scrolled");
            } else {
                contenedor.classList.remove("scrolled");
            }
        };

        contenedor.addEventListener("scroll", handleScroll);
        return () => contenedor.removeEventListener("scroll", handleScroll);
    }, []);

    // ✅ Estilos memorizados (evitan warnings)
    const toastEstiloOk = useMemo(
        () => ({
            style: {
                background: "#ffebcc",
                color: "#137CAA",
                fontFamily: "Titillium Web, sans-serif",
                fontWeight: "600",
            },
        }),
        []
    );

    const toastEstiloError = useMemo(
        () => ({
            style: {
                background: "#8c7257",
                color: "#ffebcc",
                fontFamily: "Titillium Web, sans-serif",
                fontWeight: "600",
            },
        }),
        []
    );

    // 🔹 Obtener clientes
    const obtenerClientes = useCallback(async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "CLIENTES"));
            const lista = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // ✅ Ordenar A → Z por "Razon Social"
            lista.sort((a, b) => {
                const r1 = a["Razon Social"]?.toLowerCase() || "";
                const r2 = b["Razon Social"]?.toLowerCase() || "";
                return r1.localeCompare(r2);
            });

            setClientes(lista);
        } catch (error) {
            console.error("Error al obtener los clientes:", error);
            toast.error("Error al cargar los clientes 😕", toastEstiloError);
        }
    }, [toastEstiloError]);


    useEffect(() => {
        obtenerClientes();
    }, [obtenerClientes]);

    // 🔹 Eliminar cliente con confirmación visual
    const confirmarEliminacion = (id, razonSocial) => {
        toast(
            ({ closeToast }) => (
                <div style={{ textAlign: "center" }}>
                    <p>
                        ¿Eliminar <strong className="color-strong">{razonSocial}</strong>?
                    </p>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "1rem",
                            marginTop: "0.5rem",
                        }}
                    >
                        <button
                            onClick={async () => {
                                try {
                                    await deleteDoc(doc(db, "CLIENTES", id));
                                    setClientes((prev) => prev.filter((c) => c.id !== id));
                                    toast.success(`Cliente "${razonSocial}" eliminado ✅`, toastEstiloOk);
                                } catch (error) {
                                    console.error("Error al eliminar cliente:", error);
                                    toast.error("Error al eliminar el cliente 😕", toastEstiloError);
                                } finally {
                                    closeToast();
                                }
                            }}
                            style={{
                                backgroundColor: "#3cc612ff",
                                border: "none",
                                color: "#ffebcc",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "600",
                            }}
                        >
                            Sí
                        </button>
                        <button
                            onClick={closeToast}
                            style={{
                                backgroundColor: "#c61212ff",
                                border: "none",
                                color: "#ffebcc",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "600",
                            }}
                        >
                            No
                        </button>
                    </div>
                </div>
            ),
            {
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                style: {
                    background: "#ffebcc",
                    color: "#137CAA",
                    fontFamily: "Titillium Web, sans-serif",
                    fontWeight: "600",
                },
            }
        );
    };

    // 🔹 Copiar CUIT
    const copiarCuit = async (cuit, id) => {
        try {
            await navigator.clipboard.writeText(cuit);
            setCopiadoId(id);
            setTimeout(() => setCopiadoId(null), 1500);
        } catch {
            toast.error("No se pudo copiar el CUIT 😕", toastEstiloError);
        }
    };

    // 🔹 Copiar MAIL
    const copiarMail = async (mail, id) => {
        if (!mail || mail === "-") return;
        try {
            await navigator.clipboard.writeText(mail);
            setCopiadoMailId(id);
            setTimeout(() => setCopiadoMailId(null), 1500);
        } catch {
            toast.error("No se pudo copiar el mail 😕", toastEstiloError);
        }
    };

    // 🔹 Filtrado
    const clientesFiltrados = clientes.filter((cliente) => {
        const razonSocial = cliente["Razon Social"]?.toLowerCase() || "";
        const cuit = String(cliente["Cuit"] || "");
        const texto = busqueda.toLowerCase();
        return razonSocial.includes(texto) || cuit.includes(texto);
    });

    return (
        <div className="contenedor-visualizacion-clientes">
            <div className="contenedor-titulo">
                <h1 className="titulo">CLIENTES</h1>
            </div>

            <div className="contenedor-buscador">
                <div className="elementos-buscador">
                    <Link className="contenedor-back en-cuentas-corrientes" to="/dashboard">
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 24 24">
                                <path
                                    fill="#137CAA"
                                    d="M3.97 12c0 4.41 3.62 8.03 8.03 8.03s8.03-3.62 8.03-8.03S16.41 3.97 12 3.97S3.97 7.59 3.97 12M2 12C2 6.46 6.46 2 12 2s10 4.46 10 10s-4.46 10-10 10S2 17.54 2 12m8.46-1V8L6.5 12l3.96 4v-3h7.04v-2"
                                />
                            </svg>
                        </span>
                    </Link>

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

            <div className="contenedor-tabla-clientes">
                <div className="scroll-tabla-clientes">
                    <table className="tabla-clientes">
                        <thead>
                            <tr>
                                <th>RAZON SOCIAL</th>
                                <th>CUIT</th>
                                <th>TELEFONO</th>
                                <th>MAIL</th>
                                <th className="color-editar">EDITAR</th>
                                <th className="color-eliminar">ELIMINAR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientesFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="6">No se encontraron resultados</td>
                                </tr>
                            ) : (
                                clientesFiltrados.map((cliente) => (
                                    <tr key={cliente.id}>
                                        <td>{cliente["Razon Social"]}</td>

                                        {/* CUIT */}
                                        <td className="tabla-cuit">
                                            <span className="cuit-text">
                                                {cliente["Cuit"]}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    className="icono-copiar"
                                                    onClick={() => copiarCuit(cliente["Cuit"], cliente.id)}
                                                >
                                                    <path
                                                        fill="#aa6713"
                                                        d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12z"
                                                    />
                                                </svg>
                                            </span>
                                            {copiadoId === cliente.id && <span className="mensaje-copiado">¡Copiado!</span>}
                                        </td>

                                        {/* TELEFONO */}
                                        <td className="tabla-telefono">
                                            {cliente["Telefono"] === 0 ? (
                                                "-"
                                            ) : (
                                                <span className="telefono-text">
                                                    {cliente["Telefono"]}
                                                    <a
                                                        className="icono-whatsapp"
                                                        href={`https://wa.me/54${cliente["Telefono"]}?text=%2AHola!%20Te%20enviamos%20la%20factura%20de%20tu%20compra.%2A`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="#309918"><path fill-rule="evenodd" d="M12 4a8 8 0 0 0-6.895 12.06l.569.718l-.697 2.359l2.32-.648l.379.243A8 8 0 1 0 12 4M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10a9.96 9.96 0 0 1-5.016-1.347l-4.948 1.382l1.426-4.829l-.006-.007l-.033-.055A9.96 9.96 0 0 1 2 12" clip-rule="evenodd" /><path d="M16.735 13.492c-.038-.018-1.497-.736-1.756-.83a1 1 0 0 0-.34-.075c-.196 0-.362.098-.49.291c-.146.217-.587.732-.723.886c-.018.02-.042.045-.057.045c-.013 0-.239-.093-.307-.123c-1.564-.68-2.751-2.313-2.914-2.589c-.023-.04-.024-.057-.024-.057c.005-.021.058-.074.085-.101c.08-.079.166-.182.249-.283l.117-.14c.121-.14.175-.25.237-.375l.033-.066a.68.68 0 0 0-.02-.64c-.034-.069-.65-1.555-.715-1.711c-.158-.377-.366-.552-.655-.552c-.027 0 0 0-.112.005c-.137.005-.883.104-1.213.311c-.35.22-.94.924-.94 2.16c0 1.112.705 2.162 1.008 2.561l.041.06c1.161 1.695 2.608 2.951 4.074 3.537c1.412.564 2.081.63 2.461.63c.16 0 .288-.013.4-.024l.072-.007c.488-.043 1.56-.599 1.804-1.276c.192-.534.243-1.117.115-1.329c-.088-.144-.239-.216-.43-.308" /></g></svg>
                                                    </a>
                                                </span>
                                            )}
                                        </td>


                                        {/* MAIL */}
                                        <td className="tabla-mail">
                                            <span className="mail-text">
                                                {cliente["Mail"] === "" ? "-" : cliente["Mail"]}
                                                {cliente["Mail"] !== "" && (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="24"
                                                        height="24"
                                                        viewBox="0 0 24 24"
                                                        className="icono-copiar"
                                                        onClick={() => copiarMail(cliente["Mail"], cliente.id)}
                                                    >
                                                        <path
                                                            fill="#aa6713"
                                                            d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12z"
                                                        />
                                                    </svg>
                                                )}
                                            </span>
                                            {copiadoMailId === cliente.id && <span className="mensaje-copiado">¡Copiado!</span>}
                                        </td>

                                        {/* EDITAR */}
                                        <td>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="48"
                                                height="48"
                                                viewBox="0 0 24 24"
                                                className="icono-editar"
                                                onClick={() => navigate(`/editar-clientes?id=${cliente.id}`)}
                                            >
                                                <path
                                                    fill="#aa6713"
                                                    d="m21.7 13.35l-1 1l-2.05-2.05l1-1a.55.55 0 0 1 .77 0l1.28 1.28c.21.21.21.56 0 .77M12 18.94l6.06-6.06l2.05 2.05L14.06 21H12zM12 14c-4.42 0-8 1.79-8 4v2h6v-1.89l4-4c-.66-.08-1.33-.11-2-.11m0-10a4 4 0 0 0-4 4a4 4 0 0 0 4 4a4 4 0 0 0 4-4a4 4 0 0 0-4-4"
                                                />
                                            </svg>
                                        </td>

                                        {/* ELIMINAR */}
                                        <td>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="48"
                                                height="48"
                                                viewBox="0 0 24 24"
                                                className="icono-eliminar"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => confirmarEliminacion(cliente.id, cliente["Razon Social"])}
                                            >
                                                <path
                                                    fill="#c34d4b"
                                                    d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zm0 5h2v9H9zm4 0h2v9h-2z"
                                                />
                                            </svg>
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

export default VisualizarCliente;
