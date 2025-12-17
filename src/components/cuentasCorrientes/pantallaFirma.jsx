import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, serverTimestamp, increment } from "firebase/firestore";
import { db } from "../../lib/firebase";
import SignaturePad from "signature_pad";

export default function PantallaFirma() {
    const { empresaId, retiroId } = useParams();
    const navigate = useNavigate();

    const [retiro, setRetiro] = useState(null);

    const canvasRef = useRef(null);
    const padRef = useRef(null);

    useEffect(() => {
        const cargar = async () => {
            const ref = doc(db, "CUENTAS-CORRIENTES", empresaId, "retiros", retiroId);
            const snap = await getDoc(ref);
            if (snap.exists()) setRetiro(snap.data());
        };
        cargar();
    }, [empresaId, retiroId]);

    useEffect(() => {
        if (!retiro) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = 300;
        canvas.height = 200;

        padRef.current = new SignaturePad(canvas, {
            backgroundColor: "rgba(255,255,255,1)",
            penColor: "black",
        });

    }, [retiro]);

    const borrarFirma = () => padRef.current.clear();

    const confirmarFirma = async () => {
        if (padRef.current.isEmpty()) {
            alert("Debe firmar antes de confirmar.");
            return;
        }

        const imagen = padRef.current.toDataURL("image/png");

        const retiroRef = doc(db, "CUENTAS-CORRIENTES", empresaId, "retiros", retiroId);
        const empresaRef = doc(db, "CUENTAS-CORRIENTES", empresaId);

        // 🔹 Leer estado anterior
        const snap = await getDoc(retiroRef);
        const estadoAnterior = snap.data().estado || "abierto";

        // 🔹 Guardar firma + estado a-facturar
        await updateDoc(retiroRef, {
            firma: imagen,
            estado: "a-facturar",
            fechaCierre: serverTimestamp(),
        });

        // 🔥 SUMAR 1 SOLO si antes NO estaba a-facturar
        if (estadoAnterior !== "a-facturar") {
            await updateDoc(empresaRef, {
                retirosAFacturar: increment(1)
            });
        }

        navigate(`/cuentas-corrientes/${empresaId}`);
    };




    if (!retiro) return <div>Cargando...</div>;
    const totalGeneral = Number(retiro.totalGeneral ?? 0);
    const iva21 = totalGeneral * 0.21;
    const totalMasIva = totalGeneral + iva21;

    const formatoMoneda = (n) =>
        n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });


    return (
        <div className="contenedor-de-todo-en-la-firma">
            <div className="contenedor-titulo-de-la-firma">
                <h2>DETALLE DE RETIRO</h2>
            </div>

            {/* ========= TABLA RESUMEN ========= */}
            <div className="contenedor-tabla-de-retiro-en-firma">
                <table className="tabla-informacio-cabecera-en-firma">
                    <tbody>
                        <tr>
                            <td><strong>Señor/es:</strong></td>
                            <td className="td-variable">{retiro.senores}</td>
                        </tr>
                        <tr>
                            <td><strong>Quien retira:</strong></td>
                            <td className="td-variable">{retiro.quienRetira}</td>
                        </tr>
                        <tr>
                            <td><strong>Destino:</strong></td>
                            <td className="td-variable">{retiro.destinoDeMaterial}</td>
                        </tr>
                        <tr>
                            <td><strong>Orden de compra:</strong></td>
                            <td className="td-variable">{retiro.ordenDeCompra}</td>
                        </tr>
                        <tr>
                            <td><strong>Fecha:</strong></td>
                            <td className="td-variable">
                                {retiro.fechaCreacion?.toDate
                                    ? retiro.fechaCreacion.toDate().toLocaleDateString("es-AR")
                                    : "-"}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* ========= MINI TABLA DE ITEMS ========= */}
                <h3 className="titulo-de-items-en-firma">QUE RETIRA</h3>
                <table className="tabla-de-items-en-firma">
                    <thead>
                        <tr>
                            <th>Cant</th>
                            <th>Descripción</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {retiro.items?.map((item) => (
                            <tr key={item.id}>
                                <td className="td-variable-en-tabla-de-items">
                                    {item.cantidad}
                                </td>
                                <td className="td-variable-en-tabla-de-items description">
                                    {item.descripcion}
                                </td>
                                <td className="td-variable-en-tabla-de-items">
                                    ${" "}
                                    {item.precioTotal.toLocaleString("es-AR", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <h3 className="total-en-firma-de-retiro">
                    <span>
                        ${" "}
                        {retiro.totalGeneral?.toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}
                    </span>
                </h3>
                <h3 className="iva-en-firma">
                    + IVA
                </h3>

                <h3 className="total-mas-iva-en-firma">
                    TOTAL:{" "}
                    <span>${" "}{formatoMoneda(totalMasIva)}</span>
                </h3>
            </div>

            {/* ========= FIRMA ========= */}
            <div className="contenedor-de-la-firma-en-firma">
                <h2 className="firmar-aqui-en-firma">FIRME AQUÍ</h2>

                <canvas
                    key="canvas-fijo"
                    ref={canvasRef}
                    className="firma-digital"
                />

                <div className="contenedor-de-botones-en-firma">
                    <button className="botones-de-firma borrar" onClick={borrarFirma}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="#8a0000" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10s10-4.47 10-10S17.53 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m3.59-13L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z" /></svg>
                    </button>
                    <button className="botones-de-firma aceptar" onClick={confirmarFirma}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="#2c8a00" d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
