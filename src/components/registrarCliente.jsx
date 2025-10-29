import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "react-toastify";

const RegistrarCliente = () => {
    const [formData, setFormData] = useState({
        razonSocial: "",
        cuit: "",
        telefono: "",
        mail: ""
    });
    const [loading, setLoading] = useState(false);
    const [ultimoNumero, setUltimoNumero] = useState(0);
    const navigate = useNavigate();

    // 🔹 Obtener el último número de cliente (Cliente1, Cliente2, etc.)
    useEffect(() => {
        const obtenerUltimoCliente = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "CLIENTES"));
                const docs = querySnapshot.docs.map((doc) => doc.id);
                const numeros = docs
                    .map((id) => parseInt(id.replace("Cliente", "")))
                    .filter((n) => !isNaN(n));
                const maxNumero = numeros.length > 0 ? Math.max(...numeros) : 0;
                setUltimoNumero(maxNumero);
            } catch (error) {
                console.error("Error al obtener último cliente:", error);
                toast.error("Error al conectar con la base de datos 😕", {
                    style: {
                        background: "#8c7257",
                        color: "#ffebcc",
                        fontFamily: "Titillium Web, sans-serif",
                        fontWeight: "600",
                    },
                });
            }
        };
        obtenerUltimoCliente();
    }, []);

    // 🔹 Manejar cambios en los inputs
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    // 🔹 Enviar formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.razonSocial.trim() || !formData.cuit.trim() || formData.telefono === "") {
            toast.error("Completá todos los campos obligatorios ⚠️", {
                style: {
                    background: "#8c7257",
                    color: "#ffebcc",
                    fontFamily: "Titillium Web, sans-serif",
                    fontWeight: "600",
                },
            });
            return;
        }

        const nuevoId = `Cliente${ultimoNumero + 1}`;
        setLoading(true);

        try {
            await setDoc(doc(db, "CLIENTES", nuevoId), {
                "Razon Social": formData.razonSocial.trim(),
                "Cuit": Number(formData.cuit),
                "Telefono": Number(formData.telefono),
                "Mail": formData.mail.trim()
            });

            toast.success("✅ Registro de cliente exitoso", {
                style: {
                    background: "#ffebcc",
                    color: "#137CAA",
                    fontFamily: "Titillium Web, sans-serif",
                    fontWeight: "600",
                },
            });

            setTimeout(() => navigate("/visualizar-clientes"), 1500);
        } catch (error) {
            console.error("Error al registrar cliente:", error);
            toast.error("❌ Error al registrar. Vuelva a intentarlo.", {
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

    return (
        <div className="contenedor-formulario-clientes">
            <Link className="contenedor-back" to="/dashboard">
                <span className="volver">
                    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24">
                        <path fill="#137CAA" d="M3.97 12c0 4.41 3.62 8.03 8.03 8.03s8.03-3.62 8.03-8.03S16.41 3.97 12 3.97S3.97 7.59 3.97 12M2 12C2 6.46 6.46 2 12 2s10 4.46 10 10s-4.46 10-10 10S2 17.54 2 12m8.46-1V8L6.5 12l3.96 4v-3h7.04v-2" />
                    </svg>
                </span>
            </Link>

            <div className="formulario-clientes">
                <form className="formulario-cliente" onSubmit={handleSubmit}>
                    <div className="lado-izquierdo">
                        <div className="label-inputs">
                            <label htmlFor="razonSocial">RAZÓN SOCIAL *</label>
                            <input
                                id="razonSocial"
                                type="text"
                                value={formData.razonSocial}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="label-inputs">
                            <label htmlFor="cuit">CUIT *</label>
                            <input
                                id="cuit"
                                type="number"
                                value={formData.cuit}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="label-inputs">
                            <label htmlFor="telefono">NÚMERO DE TELÉFONO *</label>
                            <input
                                id="telefono"
                                type="number"
                                value={formData.telefono}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="label-inputs">
                            <label htmlFor="mail">MAIL</label>
                            <input
                                id="mail"
                                type="email"
                                value={formData.mail}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="lado-derecho">
                        <div className="contenedor-boton-formulario">
                            <img className="imgCargaDatos" src="/ImgCargaDatos.png" alt="" />
                            <button className="buttonFormulario" type="submit" disabled={loading}>
                                {loading ? "CARGANDO..." : "CARGAR DATOS"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistrarCliente;
