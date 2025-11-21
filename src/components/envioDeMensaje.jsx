import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

const EnvioDeMensaje = () => {
    const [numero, setNumero] = useState("");

    const handleEnviar = () => {
        const numeroLimpio = numero.replace(/[^0-9]/g, ""); // solo números

        // Validación
        if (numeroLimpio.length !== 10) {
            toast.error("❌ Número inválido. Debe tener 10 dígitos.", {
                style: {
                    background: "#ffebcc",
                    color: "#137CAA",
                    fontFamily: "Titillium Web, sans-serif",
                    fontWeight: "600",
                },
            });
            return;
        }

        // Armamos número internacional
        const numeroFinal = `549${numeroLimpio}`;

        // Mensaje
        const mensaje = encodeURIComponent(
            "*Hola, me comunico de DH Ferretería Industrial*"
        );

        // URL final
        const url = `https://wa.me/${numeroFinal}?text=${mensaje}`;

        window.open(url, "_blank");
    };

    return (
        <div className="contenedor-formulario-whatsapp">
            <div className="contenedor-titulo">
                <h1 className="titulo">WHATSAPP</h1>
            </div>

            <Link className="contenedor-volver-de-whatsapp" to="/dashboard">
                <span className="volver">
                    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24">
                        <path fill="#137CAA" d="M3.97 12c0 4.41 3.62 8.03 8.03 8.03s8.03-3.62 8.03-8.03S16.41 3.97 12 3.97S3.97 7.59 3.97 12M2 12C2 6.46 6.46 2 12 2s10 4.46 10 10s-4.46 10-10 10S2 17.54 2 12m8.46-1V8L6.5 12l3.96 4v-3h7.04v-2" />
                    </svg>
                </span>
            </Link>

            <div className="contenedor-de-input">
                <div className="input-group">
                    <input
                        className="input-text"
                        name="text"
                        type="text"
                        placeholder="Type here"
                        autoComplete="off"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                    />

                    <label className="input-text-label" htmlFor="text">
                        INGRESAR NÚMERO
                    </label>
                </div>

                <div className="contenedor-de-envio">
                    <button className="cssbuttons-io-button" onClick={handleEnviar}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                            <path
                                fill="none"
                                stroke="#ffffffff"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M29 3L3 15l12 2.5M29 3L19 29l-4-11.5M29 3L15 17.5"
                            />
                        </svg>
                        <span>ENVIAR</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EnvioDeMensaje;
