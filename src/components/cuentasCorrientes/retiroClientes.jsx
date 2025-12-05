import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    setDoc,
    serverTimestamp,
    increment
} from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function RetirosCliente() {
    const { empresaId } = useParams();
    const nombreEmpresa = empresaId.replace(/_/g, " ");

    const [retiros, setRetiros] = useState([]);
    const navigate = useNavigate();

    // 🔹 Cargar retiros existentes
    useEffect(() => {
        const cargarRetiros = async () => {
            const ref = collection(db, "CUENTAS-CORRIENTES", empresaId, "retiros");
            const snap = await getDocs(ref);

            const list = snap.docs.map(docSnap => ({
                id: docSnap.id,
                ...docSnap.data()
            }));

            setRetiros(list);
        };

        cargarRetiros();
    }, [empresaId]);

    // 🔹 Crear retiro con ID personalizado
    const crearRetiro = async () => {
        const empresaRef = doc(db, "CUENTAS-CORRIENTES", empresaId);

        // Leer contador actual
        const empresaSnap = await getDoc(empresaRef);
        let contador = empresaSnap.data().contadorRetiros || 0;

        // Incrementar
        contador += 1;

        // Actualizar contador
        await updateDoc(empresaRef, {
            contadorRetiros: contador
        });

        // ID formateado
        const idRetiro = `RETIRO-${String(contador).padStart(4, "0")}`;

        // Crear el documento dentro de la subcolección "retiros"
        const refRetiro = doc(
            db,
            "CUENTAS-CORRIENTES",
            empresaId,
            "retiros",
            idRetiro
        );

        await setDoc(refRetiro, {
            estado: "abierto",
            fechaCreacion: serverTimestamp(),
            fechaCierre: null,
            totalParcial: 0
        });

        // Redirigir al detalle
        navigate(`/cuentas-corrientes/${empresaId}/${idRetiro}`);
    };

    // 🔹 Cambiar estado (A FACTURAR / FACTURADO) y actualizar contador de la empresa
    // 🔹 Cambiar estado (A FACTURAR / FACTURADO) y actualizar contador de la empresa
    const cambiarEstadoRetiro = async (retiro, nuevoEstado) => {

        const estadoActual = retiro.estado || "abierto";

        if (estadoActual === nuevoEstado) return;

        const retiroRef = doc(
            db,
            "CUENTAS-CORRIENTES",
            empresaId,
            "retiros",
            retiro.id
        );

        const empresaRef = doc(db, "CUENTAS-CORRIENTES", empresaId);

        // ==============================
        // 🔥 REGLA FINAL DEL CONTADOR
        // ==============================

        if (nuevoEstado === "a-facturar") {
            // SIEMPRE SUMA +1
            await updateDoc(empresaRef, { retirosAFacturar: increment(1) });
        }

        if (estadoActual === "a-facturar" && nuevoEstado === "facturado") {
            // SI VIENE DE A-FACTURAR Y PASA A FACTURADO → RESTA
            await updateDoc(empresaRef, { retirosAFacturar: increment(-1) });
        }

        // ==============================
        // 🔥 ACTUALIZAR RETIRO
        // ==============================
        await updateDoc(retiroRef, { estado: nuevoEstado });

        // ==============================
        // 🔥 ACTUALIZAR LISTADO LOCAL
        // ==============================
        setRetiros(prev =>
            prev.map(r =>
                r.id === retiro.id ? { ...r, estado: nuevoEstado } : r
            )
        );
    };

    return (
        <div className="contenedor-de-retiros">
            <div className="contenedor-titulo">
                <h1 className="titulo-nombre-empresa">
                    RETIRO DE MATERIALES <br />
                    <span className="nombre-empresa">{nombreEmpresa}</span>
                </h1>
            </div>

            <div className="contenedor-back-y-retiros">
                <Link className="contenedor-back en-retiros" to="/cuentas-corrientes">
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 24 24">
                            <path
                                fill="#137CAA"
                                d="M3.97 12c0 4.41 3.62 8.03 8.03 8.03s8.03-3.62 8.03-8.03S16.41 3.97 12 3.97S3.97 7.59 3.97 12M2 12C2 6.46 6.46 2 12 2s10 4.46 10 10s-4.46 10-10 10S2 17.54 2 12m8.46-1V8L6.5 12l3.96 4v-3h7.04v-2"
                            />
                        </svg>
                    </span>
                </Link>

                <div className="contenedor-de-retiros-individuales">
                    <div className="caja-scroll">

                        {retiros.length === 0 && (
                            <div className="contenedor-no-hay-retiros">
                                <p className="no-hay-retiro">NO HAY RETIROS DE MATERIALES CARGADOS</p>
                            </div>
                        )}

                        {retiros.map(retiro => {
                            const fecha = retiro.fechaCreacion
                                ? retiro.fechaCreacion.toDate()
                                : null;

                            const fechaFormateada = fecha
                                ? fecha.toLocaleDateString("es-AR", {
                                    day: "2-digit",
                                    month: "2-digit"
                                })
                                : "";

                            const estadoMayus = (retiro.estado || "").toUpperCase();

                            return (
                                <div
                                    className={
                                        "retiro-item" +
                                        (retiro.estado === "a-facturar" ? " retiro-a-facturar" : "")
                                    }
                                    key={retiro.id}
                                >
                                    <Link to={`/cuentas-corrientes/${empresaId}/${retiro.id}`}>
                                        <span className="retiro-texto">
                                            {retiro.id} — {estadoMayus}
                                        </span>

                                        <span className="retiro-fecha">{fechaFormateada}</span>
                                    </Link>

                                    {(retiro.estado=== "a-facturar" || retiro.estado === "facturado") && (
                                        <div className="contenedor-select-estado-retiro">
                                            <select
                                                value={retiro.estado}
                                                onChange={(e) =>
                                                    cambiarEstadoRetiro(retiro, e.target.value)
                                                }
                                            >
                                                <option value="a-facturar">A FACTURAR</option>
                                                <option value="facturado">FACTURADO</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* Botón agregar retiro */}
            <div className="contenedor-agregar">
                <button onClick={crearRetiro} className="boton-agregar-retiro">
                    AGREGAR RETIRO DE MATERIAL
                </button>
            </div>

        </div>
    );
}
