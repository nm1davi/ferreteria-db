import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "react-toastify";

const EditarClientes = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const id = searchParams.get("id"); // Ejemplo: "Cliente2"

    const [formData, setFormData] = useState({
        "Razon Social": "",
        "Cuit": "",
        "Telefono": "",
        "Mail": "",
    });

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);

    // 🔹 Cargar datos del cliente al montar
    useEffect(() => {
        const obtenerCliente = async () => {
            try {
                const docRef = doc(db, "CLIENTES", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setFormData(docSnap.data());
                } else {
                    toast.error("El cliente no existe ⚠️", {
                        style: {
                            background: "#8c7257",
                            color: "#ffebcc",
                            fontFamily: "Titillium Web, sans-serif",
                            fontWeight: "600",
                        },
                    });
                    navigate("/visualizar-clientes");
                }
            } catch (error) {
                console.error("Error al obtener cliente:", error);
                toast.error("Error al cargar el cliente 😕", {
                    style: {
                        background: "#8c7257",
                        color: "#ffebcc",
                        fontFamily: "Titillium Web, sans-serif",
                        fontWeight: "600",
                    },
                });
            } finally {
                setLoading(false);
            }
        };

        if (id) obtenerCliente();
    }, [id, navigate]);

    // 🔹 Actualizar el estado cuando cambia un input
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id === "razonSocial"
                ? "Razon Social"
                : id === "cuit"
                    ? "Cuit"
                    : id === "telefono"
                        ? "Telefono"
                        : "Mail"]: value,
        });
    };

    // 🔹 Guardar los cambios
    const handleSubmit = async (e) => {
        e.preventDefault();
        setGuardando(true);

        try {
            await updateDoc(doc(db, "CLIENTES", id), {
                "Razon Social": formData["Razon Social"],
                "Cuit": Number(formData["Cuit"]),
                "Telefono": Number(formData["Telefono"]),
                "Mail": formData["Mail"],
            });

            toast.success("✅ Cliente actualizado correctamente", {
                style: {
                    background: "#ffebcc",
                    color: "#137CAA",
                    fontFamily: "Titillium Web, sans-serif",
                    fontWeight: "600",
                },
            });

            setTimeout(() => navigate("/visualizar-clientes"), 1500);
        } catch (error) {
            console.error("Error al actualizar cliente:", error);
            toast.error("❌ Error al actualizar. Vuelva a intentarlo.", {
                style: {
                    background: "#8c7257",
                    color: "#ffebcc",
                    fontFamily: "Titillium Web, sans-serif",
                    fontWeight: "600",
                },
            });
        } finally {
            setGuardando(false);
        }
    };

    if (loading)
        return (
            <p
                style={{
                    textAlign: "center",
                    color: "#137CAA",
                    fontFamily: "Titillium Web, sans-serif",
                    fontWeight: "600",
                    fontSize: "1.2rem",
                }}
            >
                Cargando cliente...
            </p>
        );

    return (
        <div className="contenedor-formulario-clientes">
            <Link className="contenedor-back" to="/visualizar-clientes">
                <span className="volver">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="96"
                        height="96"
                        viewBox="0 0 24 24"
                    >
                        <path
                            fill="#137CAA"
                            d="M3.97 12c0 4.41 3.62 8.03 8.03 8.03s8.03-3.62 8.03-8.03S16.41 3.97 12 3.97S3.97 7.59 3.97 12M2 12C2 6.46 6.46 2 12 2s10 4.46 10 10s-4.46 10-10 10S2 17.54 2 12m8.46-1V8L6.5 12l3.96 4v-3h7.04v-2"
                        />
                    </svg>
                </span>
            </Link>

            <div className="formulario-clientes">
                <form className="formulario-editar-cliente" onSubmit={handleSubmit}>
                    <div className="lado-izquierdo">
                        <div className="label-inputs">
                            <label htmlFor="razonSocial">RAZÓN SOCIAL</label>
                            <input
                                id="razonSocial"
                                type="text"
                                value={formData["Razon Social"]}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="label-inputs">
                            <label htmlFor="cuit">CUIT</label>
                            <input
                                id="cuit"
                                type="number"
                                value={formData["Cuit"]}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="label-inputs">
                            <label htmlFor="telefono">NÚMERO DE TELÉFONO</label>
                            <input
                                id="telefono"
                                type="number"
                                value={formData["Telefono"]}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="label-inputs">
                            <label htmlFor="mail">MAIL</label>
                            <input
                                id="mail"
                                type="email"
                                value={formData["Mail"]}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="lado-derecho">
                        <div className="contenedor-boton-formulario-editar">
                            <img
                                className="imgCargaDatos"
                                src="/ImgEditarDatos.png"
                                alt="editar"
                            />
                            <button
                                className="buttonFormulario"
                                disabled={guardando}
                            >
                                {guardando ? "GUARDANDO..." : "EDITAR DATOS"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditarClientes;
