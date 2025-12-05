import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { toast } from "react-toastify";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import {
    GabaritoBold,
    TitilliumRegular,
    TitilliumBold,
    RobotoLight
} from "../../pdf/fonts.js";
import { logoImage } from "../../pdf/logoImage.js";

import autoTable from "jspdf-autotable";

export default function RetiroDetalle() {
    const { empresaId, retiroId } = useParams();

    const nombreEmpresa = useMemo(
        () => empresaId.replace(/_/g, " "),
        [empresaId]
    );

    const [cabeceraGuardada, setCabeceraGuardada] = useState(false);

    const [senores, setSenores] = useState(nombreEmpresa);
    const [indice, setIndice] = useState(0);
    const [quienRetira, setQuienRetira] = useState("");
    const [destinoDeMaterial, setDestinoDeMaterial] = useState("");
    const [ordenDeCompra, setOrdenDeCompra] = useState("");
    const [fechaCreacion, setFechaCreacion] = useState(null);

    const [items, setItems] = useState([]);
    const [cantidadInput, setCantidadInput] = useState("");
    const [descripcionInput, setDescripcionInput] = useState("");
    const [precioListaInput, setPrecioListaInput] = useState("");

    const [estado, setEstado] = useState("abierto");
    const [firma, setFirma] = useState(null);

    const [mostrarConfirmarFirma, setMostrarConfirmarFirma] = useState(false);
    const [mostrarQR, setMostrarQR] = useState(false);

    const remitoRef = useMemo(
        () => doc(db, "CUENTAS-CORRIENTES", empresaId, "retiros", retiroId),
        [empresaId, retiroId]
    );

    // ======================
    // 🔥 LECTURA EN TIEMPO REAL
    // ======================
    useEffect(() => {
        const unsubscribe = onSnapshot(remitoRef, (snap) => {
            if (!snap.exists()) return;

            const data = snap.data();

            setSenores(data.senores || nombreEmpresa);
            setIndice(data.indice ?? 0);;
            setQuienRetira(data.quienRetira || "");
            setDestinoDeMaterial(data.destinoDeMaterial || "");
            setOrdenDeCompra(data.ordenDeCompra || "");
            setItems(data.items || []);
            setEstado(data.estado || "abierto");
            setFirma(data.firma || null);

            if (data.fechaCreacion?.toDate) {
                setFechaCreacion(data.fechaCreacion.toDate());
            }
            if (data.estado === "esperando-firma") {
                setMostrarQR(true);
            }
        });

        return () => unsubscribe();
    }, [remitoRef, nombreEmpresa]);

    const totalGeneral = useMemo(
        () => items.reduce((acc, item) => acc + (item.precioTotal || 0), 0),
        [items]
    );

    const guardarCambio = async (nuevoEstado = estado) => {
        await updateDoc(remitoRef, {
            senores: senores.toUpperCase(),
            quienRetira: quienRetira.toUpperCase(),
            destinoDeMaterial: destinoDeMaterial.toUpperCase(),
            ordenDeCompra: ordenDeCompra.toUpperCase(),
            indice,
            items,
            estado: nuevoEstado,
            totalGeneral,
        });

        setCabeceraGuardada(true);
        toast.success("CABECERA GUARDADA");
    };

    const manejarAgregarItem = async () => {
        const cantidad = Number(cantidadInput);
        const precio = Number(precioListaInput);

        if (!cantidad || !precio || !descripcionInput.trim()) {
            toast.error("Todos los campos son obligatorios");
            return;
        }

        const precioUnitario = precio * (1 + indice);
        const precioTotal = precioUnitario * cantidad;

        const nuevoItem = {
            id: crypto.randomUUID(),
            cantidad,
            descripcion: descripcionInput.trim(),
            precioLista: precio,
            precioUnitario,
            precioTotal,
        };

        const nuevos = [...items, nuevoItem];
        setItems(nuevos);

        await updateDoc(remitoRef, {
            items: nuevos,
            totalGeneral: nuevos.reduce((acc, i) => acc + i.precioTotal, 0),
        });

        setCantidadInput("");
        setDescripcionInput("");
        setPrecioListaInput("");
    };

    const manejarEliminarItem = async (id) => {
        const nuevosItems = items.filter((i) => i.id !== id);
        setItems(nuevosItems);

        await updateDoc(remitoRef, {
            items: nuevosItems,
            totalGeneral: nuevosItems.reduce((acc, i) => acc + i.precioTotal, 0),
        });
    };

    const manejarSolicitarFirma = () => {
        setMostrarConfirmarFirma(true);
    };



    const generarPDF = () => {
        const pdf = new jsPDF("p", "pt", "a4");

        // ======================
        // 🔥 REGISTRO DE FUENTES
        // ======================
        pdf.addFileToVFS("Gabarito-Bold.ttf", GabaritoBold);
        pdf.addFont("Gabarito-Bold.ttf", "Gabarito", "bold");

        pdf.addFileToVFS("Titillium-Regular.ttf", TitilliumRegular);
        pdf.addFont("Titillium-Regular.ttf", "Titillium", "normal");

        pdf.addFileToVFS("Titillium-Bold.ttf", TitilliumBold);
        pdf.addFont("Titillium-Bold.ttf", "Titillium", "bold");

        pdf.addFileToVFS("Roboto-Light.ttf", RobotoLight);
        pdf.addFont("Roboto-Light.ttf", "Roboto", "light");

        const pageWidth = pdf.internal.pageSize.getWidth();

        // ======================
        // 🔥 LOGO
        // ======================
        if (logoImage) {
            pdf.addImage(logoImage, "PNG", 40, 40, 60, 60);
        }

        // ======================
        // 🔥 TÍTULO PRINCIPAL
        // ======================
        pdf.setFont("Gabarito", "bold");
        pdf.setFontSize(32);
        pdf.text("FERRETERÍA INDUSTRIAL", 120, 80);

        pdf.setFont("Gabarito", "bold");
        pdf.setFontSize(20);
        pdf.text("RETIRO DE MATERIALES", pageWidth / 2, 110, { align: "center" });

        // ======================
        // 🔥 ENCABEZADO (todo separado A MANO)
        // ======================
        pdf.setFont("Titillium", "normal");
        pdf.setFontSize(14);

        const leftLabelX = 40;
        const leftValueXSenores = 100;
        const leftValueXDestino = 175;
        const leftValueXOrdenCompra = 150;
        const leftValueXFecha = 415;
        const leftValueXQuienRetira = 450;

        const rightLabelX = pageWidth - 220;

        // 👇 CAMBIAMOS ESTE NOMBRE
        let yEnc = 150;

        // SEÑOR/ES
        pdf.text("Señor/es:", leftLabelX, yEnc);
        pdf.setFont("Titillium", "bold");
        pdf.text(senores.toUpperCase(), leftValueXSenores, yEnc);

        // FECHA
        pdf.setFont("Titillium", "normal");
        pdf.text("Fecha:", rightLabelX, yEnc);
        pdf.setFont("Titillium", "bold");
        pdf.text(fechaCreacion?.toLocaleDateString("es-AR"), leftValueXFecha, yEnc);

        // DESTINO
        yEnc += 25;
        pdf.setFont("Titillium", "normal");
        pdf.text("Destino de materiales:", leftLabelX, yEnc);

        pdf.setFont("Titillium", "bold");
        pdf.text(destinoDeMaterial.toUpperCase(), leftValueXDestino, yEnc);

        // QUIEN RETIRA
        pdf.setFont("Titillium", "normal");
        pdf.text("Quien retira:", rightLabelX, yEnc);

        pdf.setFont("Titillium", "bold");
        pdf.text(quienRetira.toUpperCase(), leftValueXQuienRetira, yEnc);

        // ORDEN DE COMPRA
        yEnc += 25;
        pdf.setFont("Titillium", "normal");
        pdf.text("Orden de compra:", leftLabelX, yEnc);

        pdf.setFont("Titillium", "bold");
        pdf.text(ordenDeCompra, leftValueXOrdenCompra, yEnc);

        // ======================
        // 🔥 TABLA
        // ======================
        const rows = items.map((it) => [
            it.cantidad,
            it.descripcion,
            "$ " + it.precioUnitario.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }),
            "$ " + it.precioTotal.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }),
        ]);


        autoTable(pdf, {
            startY: 230,
            head: [["CANTIDAD", "DESCRIPCIÓN", "P.UNITARIO", "P.TOTAL"]],
            body: rows,
            theme: "grid",
            headStyles: {
                fillColor: [0, 0, 0],
                textColor: 255,
                fontStyle: "bold",
                font: "Gabarito",
                halign: "center",
                fontSize: 10,
            },
            styles: {
                fontSize: 11,
                cellPadding: 6,
                font: "Roboto",
                fontStyle: "light",
            },
            columnStyles: {
                0: { halign: "center", cellWidth: 70, font: "Roboto", fontStyle: "light" },
                1: { halign: "left", cellWidth: 240, font: "Roboto", fontStyle: "light" },
                2: { halign: "right", cellWidth: 100, font: "Roboto", fontStyle: "light" },
                3: { halign: "right", cellWidth: 100, font: "Roboto", fontStyle: "light" },
            },
        });

        let y = pdf.lastAutoTable.finalY + 20;

        // ==========================
        // 🔥 + IVA + TOTAL
        // ==========================
        const yIva = pdf.lastAutoTable.finalY + 30;
        y = pdf.lastAutoTable.finalY + 40;

        const columnaTotalX = pageWidth - 60; // donde está el número TOTAL
        const columnaTituloX = pageWidth - 200;

        // +IVA debajo del total unitario
        pdf.setFont("Gabarito", "bold");
        pdf.text("+IVA", columnaTotalX, yIva, { align: "right" });

        // TOTAL
        y += 25;

        pdf.text("TOTAL", columnaTituloX, y, { align: "right" });
        pdf.text("$ " + totalGeneral.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }), columnaTotalX, y, {
            align: "right",
        });

        // ======================
        // 🔥 FIRMA + ACLARACIÓN
        // ======================
        let firmaY = y + 80;

        if (firma) {
            pdf.addImage(firma, "PNG", 60, firmaY - 40, 150, 60);
        }

        // Firma
        pdf.line(60, firmaY + 30, 240, firmaY + 30);
        pdf.setFont("Titillium", "bold");
        pdf.text("FIRMA", 150, firmaY + 50, { align: "center" });

        // Aclaración
        pdf.line(pageWidth - 260, firmaY + 30, pageWidth - 60, firmaY + 30);
        pdf.text("ACLARACIÓN", pageWidth - 150, firmaY + 50, { align: "center" });

        pdf.setFontSize(16);
        pdf.text(quienRetira.toUpperCase(), pageWidth - 150, firmaY + 15, {
            align: "center",
        });

        // ======================
        // 🔥 DESCARGAR
        // ======================
        pdf.save(`RETIRO-${retiroId}.pdf`);
    };

    // ======================
    // 🎯 MODO CERRADO
    // ======================
    if (estado === "cerrado" || firma) {
        return (
            <div className="contenedor-de-impresion">
                <div className="titulo-impresion-detalle">
                    <h1>RETIRO DE MATERIALES FIRMADO</h1>
                </div>
                <div className="contenedor-parrafo-boton">
                    <p>EL RETIRO DE MATERIAL YA FUE FIRMADO, CERRADO / FACTURADO</p>

                    <button className="btn-solicitar-firma" onClick={generarPDF}>
                        DESCARGAR PDF
                    </button>
                </div>
                <div className="conentedor-boton-volver-descarga-pdf">
                    <Link className="volver-impresion-pdf" to={`/cuentas-corrientes/${empresaId}`}>
                        VOLVER
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="contenedor-retiro-detalle">

            {/* ================= MODAL CONFIRMAR FIRMA ================= */}
            {mostrarConfirmarFirma && (
                <div className="modal-qr-backdrop">
                    <div className="modal-qr">
                        <h2>¿Solicitar firma?</h2>
                        <p>El retiro pasará a estado "esperando firma".</p>

                        <button
                            className="btn-confirmar"
                            onClick={async () => {
                                await updateDoc(remitoRef, { estado: "esperando-firma" });
                                toast.success("QR listo para firmar");
                                setMostrarConfirmarFirma(false);
                                setMostrarQR(true);
                            }}
                        >
                            Confirmar
                        </button>

                        <button
                            className="btn-cerrar-modal"
                            onClick={() => setMostrarConfirmarFirma(false)}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* ================= MODAL QR ================= */}
            {mostrarQR && (
                <div className="modal-qr-backdrop">
                    <div className="modal-qr">
                        <h2>ESCANEE Y FIRME</h2>
                        <p>Hay que escanear para firmar</p>

                        <div style={{ margin: "20px 0" }}>
                            <QRCodeCanvas
                                size={240}
                                value={`https://ferreteria-db.vercel.app/firmar/${empresaId}/${retiroId}}`}
                            />
                        </div>

                        <button
                            className="btn-cerrar-modal"
                            onClick={() => setMostrarQR(false)}
                        >
                            CERRAR
                        </button>
                    </div>
                </div>
            )}

            {/* ===== RESTO DEL COMPONENTE (TODO IGUAL) ===== */}

            {/* HEADER */}
            <div className="header-retiro">
                <Link
                    className="contenedor-back en-remitos"
                    to={`/cuentas-corrientes/${empresaId}`}
                >
                    <span className="volver">
                        <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24">
                            <path fill="#137CAA" d="M3.97 12c0 4.41 3.62 8.03 8.03 8.03s8.03-3.62 8.03-8.03S16.41 3.97 12 3.97S3.97 7.59 3.97 12M2 12C2 6.46 6.46 2 12 2s10 4.46 10 10s-4.46 10-10 10S2 17.54 2 12m8.46-1V8L6.5 12l3.96 4v-3h7.04v-2" />
                        </svg>
                    </span>
                </Link>

                <div className="contenedor-del-titulo-retiro">
                    <h1 className="titulo-retiro">
                        RETIRO DE MATERIALES <br />
                        <span className="nombre-empresa">{nombreEmpresa}</span>
                    </h1>
                </div>
            </div>

            {/* CABECERA */}
            <section className="cabecera-retiro">
                <div className="campo">
                    <label>SEÑOR/ES</label>
                    <input value={senores} onChange={(e) => setSenores(e.target.value.toUpperCase())} />
                </div>

                <div className="campo">
                    <label>FECHA</label>
                    <input disabled value={fechaCreacion ? fechaCreacion.toLocaleDateString("es-AR") : ""} />
                </div>

                <div className="campo">
                    <label>QUIEN RETIRA</label>
                    <input value={quienRetira} onChange={(e) => setQuienRetira(e.target.value.toUpperCase())} />
                </div>

                <div className="campo">
                    <label>DESTINO DE MATERIALES</label>
                    <input value={destinoDeMaterial} onChange={(e) => setDestinoDeMaterial(e.target.value.toUpperCase())} />
                </div>

                <div className="campo">
                    <label>ORDEN DE COMPRA</label>
                    <input value={ordenDeCompra} onChange={(e) => setOrdenDeCompra(e.target.value.toUpperCase())} />
                </div>

                <div className="campo">
                    <label>ÍNDICE</label>
                    <div className="indice-opciones">
                        <button className={indice === 0 ? "btn-indice activo" : "btn-indice"} onClick={() => setIndice(0)}>0 %</button>
                        <button className={indice === 0.1 ? "btn-indice activo" : "btn-indice"} onClick={() => setIndice(0.1)}>10 %</button>
                        <button className={indice === 0.15 ? "btn-indice activo" : "btn-indice"} onClick={() => setIndice(0.15)}>15 %</button>
                        <button className={indice === 0.2 ? "btn-indice activo" : "btn-indice"} onClick={() => setIndice(0.2)}>20 %</button>
                    </div>
                </div>

                <button className="btn-guardar-cabecera" onClick={() => guardarCambio()}>
                    GUARDAR CABECERA
                </button>
            </section>

            {/* CARGA ITEMS */}
            <section className="carga-items">
                <div className="campo">
                    <label>Cantidad</label>
                    <input
                        type="number"
                        value={cantidadInput}
                        onChange={(e) => setCantidadInput(e.target.value)}
                        disabled={!cabeceraGuardada}
                    />
                </div>

                <div className="campo">
                    <label>Descripción</label>
                    <input
                        value={descripcionInput}
                        onChange={(e) => setDescripcionInput(e.target.value.toUpperCase())}
                        disabled={!cabeceraGuardada}
                    />
                </div>

                <div className="campo">
                    <label>Precio lista</label>
                    <input
                        type="number"
                        value={precioListaInput}
                        onChange={(e) => setPrecioListaInput(e.target.value)}
                        disabled={!cabeceraGuardada}
                    />
                </div>

                <div>
                    <button
                        className="button"
                        onClick={manejarAgregarItem}
                        disabled={!cabeceraGuardada}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#eafcff" d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z" /></svg>
                    </button>
                </div>
            </section>

            {/* TABLA */}
            <section className="tabla-retiro">
                <h2>RETIRO DE MATERIALES</h2>

                <table>
                    <thead>
                        <tr>
                            <th>CANT</th>
                            <th>DESCRIPCIÓN</th>
                            <th>P. UNIT</th>
                            <th>P. TOTAL</th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id}>
                                <td>{item.cantidad}</td>
                                <td>{item.descripcion}</td>
                                <td>{item.precioUnitario.toLocaleString("es-AR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}</td>
                                <td>{item.precioTotal.toLocaleString("es-AR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}</td>
                                <td>
                                    <button className="btn-eliminar-item" onClick={() => manejarEliminarItem(item.id)}>
                                        🗑
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                    <tfoot>
                        <tr className="total-de-totales">
                            <td colSpan="2" style={{ textAlign: "right" }}>TOTAL</td>
                            <td></td>
                            <td style={{ fontWeight: "bold", textAlign: "center" }}>
                                {totalGeneral.toLocaleString("es-AR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </section>

            {/* BOTÓN SOLICITAR FIRMA */}
            {estado === "abierto" && (
                <div className="contenedor-solicitar-firma">
                    <button
                        className="btn-solicitar-firma en-retiro-de-material"
                        onClick={manejarSolicitarFirma}
                        disabled={items.length === 0}
                    >
                        SOLICITAR FIRMA
                    </button>
                </div>
            )}

        </div>
    );
}
