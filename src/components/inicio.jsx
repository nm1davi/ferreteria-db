import { useState } from "react";
import { loginUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Inicio = () => {
    const [showPass, setShowPass] = useState(false);
    const [usuario, setUsuario] = useState("");
    const [contraseña, setContraseña] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            await loginUser(usuario, contraseña);
            toast.success("Bienvenido a DB Ferretería 🔧", {
                style: {
                    background: "#ffebcc",
                    color: "#137CAA",
                    fontFamily: "Titillium Web, sans-serif",
                    fontWeight: "600",
                },
            });
            setTimeout(() => navigate("/dashboard"), 1500);
        } catch (error) {
            toast.error("Datos inválidos, revíselos ⚠️", {
                style: {
                    background: "#8c7257",
                    color: "#ffebcc",
                    fontFamily: "Titillium Web, sans-serif",
                    fontWeight: "600",
                },
            });
        }
    };

    return (
        <div className="contenedor-del-inicio">
            <div className="contenedor-del-formulario">
                <form className="formulario" onSubmit={handleLogin}>
                    <div className="header-form">
                        <img className="imagen-logo" src="/LOGO-EMPRESA.png" alt="logo" />
                    </div>

                    <div className="body-form">
                        <input
                            id="usuario"
                            type="email"
                            placeholder="USUARIO"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                        />

                        <div className="input-wrapper">
                            <input
                                id="contraseña"
                                type={showPass ? "text" : "password"}
                                placeholder="CONTRASEÑA"
                                value={contraseña}
                                onChange={(e) => setContraseña(e.target.value)}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPass(!showPass)}
                                aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPass ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                        <path fill="#137CAA" d="M12 9a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-4.5c5 0 9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S2.73 16.39 1 12c1.73-4.39 6-7.5 11-7.5M3.18 12a9.821 9.821 0 0 0 17.64 0a9.821 9.821 0 0 0-17.64 0" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                        <path fill="#137CAA" d="M2 4.27L3.28 3L21 20.72L19.73 22l-2.56-2.56C15.94 20 14.01 20.5 12 20.5C7 20.5 2.73 17.39 1 12c.83-2.37 2.31-4.34 4.16-5.8L2 4.27M12 7.5c5 0 9.27 3.11 11 7.5c-.72 1.82-1.87 3.4-3.34 4.68L17.82 18c1.23-1 2.23-2.29 2.94-3.77C19.22 10.93 15.08 8.5 12 8.5c-.83 0-1.63.09-2.39.26L8.46 7.62C9.58 7.52 10.78 7.5 12 7.5m0 2.7c.54 0 1.05.13 1.5.36L9.94 9.08c.65-.26 1.35-.38 2.06-.38Z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="footer-form">
                        <button className="boton-movimiento" type="submit">
                            <div className="svg-wrapper-1">
                                <div className="svg-wrapper">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                        <path fill="#137CAA" d="M5.64 4.22h14.14v14.14l-4.24-4.24l-5.66 5.66l-5.66-5.66l5.66-5.66zm12.02 2.12h-7.07l2.12 2.12l-5.66 5.66l2.83 2.83l5.66-5.66l2.12 2.12z" />
                                    </svg>
                                </div>
                            </div>
                            <span>INGRESAR</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Inicio;
