import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { generarFacturaFinal } from "../services/facturasPdfService";

const GenerarFacturas = () => {
    const [factura, setFactura] = useState(null); // File | null
    const [retiros, setRetiros] = useState([]); // File[]

    const facturaInputRef = useRef(null);
    const retirosInputRef = useRef(null);

    const onSelectFactura = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // (opcional) validar tipo PDF
        if (
            file.type !== "application/pdf" &&
            !file.name.toLowerCase().endsWith(".pdf")
        ) {
            alert("La factura debe ser un PDF.");
            if (facturaInputRef.current) facturaInputRef.current.value = "";
            return;
        }

        setFactura(file);

        // Permite volver a seleccionar el mismo archivo si fuese necesario
        if (facturaInputRef.current) facturaInputRef.current.value = "";
    };

    const onSelectRetiros = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // filtrar solo pdf
        const pdfs = files.filter(
            (f) =>
                f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
        );

        if (pdfs.length !== files.length) {
            alert("Algunos archivos no eran PDF y fueron ignorados.");
        }

        // Evitar duplicados por nombre+tamaño (simple, efectivo)
        setRetiros((prev) => {
            const map = new Map(prev.map((f) => [`${f.name}-${f.size}`, f]));
            for (const f of pdfs) map.set(`${f.name}-${f.size}`, f);
            return Array.from(map.values());
        });

        // Reset input para permitir elegir los mismos nuevamente
        if (retirosInputRef.current) retirosInputRef.current.value = "";
    };

    const removeFactura = () => setFactura(null);

    const removeRetiro = (key) => {
        setRetiros((prev) => prev.filter((f) => `${f.name}-${f.size}` !== key));
    };

    const formatSize = (bytes) => {
        // 1024 exacto para evitar errores
        if (bytes < 1024) return `${bytes} B`;
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        const mb = kb / 1024;
        return `${mb.toFixed(1)} MB`;
    };

    const onProcesar = async () => {
        if (!factura) {
            alert("Seleccioná una factura PDF.");
            return;
        }

        try {
            const blob = await generarFacturaFinal({
                facturaFile: factura,
                retiroFiles: retiros,
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `FACTURA_FINAL_${Date.now()}.pdf`;
            a.click();
            URL.revokeObjectURL(url);

            // 🔥 RESET DE LA PANTALLA
            setFactura(null);
            setRetiros([]);

            if (facturaInputRef.current) facturaInputRef.current.value = "";
            if (retirosInputRef.current) retirosInputRef.current.value = "";

        } catch (err) {
            alert(err?.message || "Error generando PDF");
        }
    };


    return (
        <div className="contenedor-exportador-de-facturas">
            <Link className="contenedor-back" to="/dashboard">
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

            <div className="contenedor-de-facturas-y-retiros-pdf">
                {/* FACTURA */}
                <div className="lado-izquierdo-en-pdf">
                    <div className="label-inputs-en-pdf">
                        <label htmlFor="factura">SELECCIONAR FACTURA</label>

                        <div className="input-div">
                            <input
                                ref={facturaInputRef}
                                className="input"
                                name="factura"
                                id="factura"
                                type="file"
                                accept="application/pdf,.pdf"
                                onChange={onSelectFactura}
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                className="icon"
                            >
                                <polyline points="16 16 12 12 8 16" />
                                <line x1="12" y1="12" x2="12" y2="21" />
                                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                            </svg>
                        </div>

                        {/* LISTA FACTURA */}
                        <div className="lista-archivos">
                            {!factura ? (
                                <p className="archivo-vacio">No hay factura seleccionada.</p>
                            ) : (
                                <div className="archivo-item">
                                    <div className="archivo-info">
                                        <span className="archivo-nombre">{factura.name}</span>
                                        <span className="archivo-size">
                                            {formatSize(factura.size)}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className="archivo-trash"
                                        onClick={removeFactura}
                                        aria-label="Eliminar factura"
                                        title="Eliminar"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RETIROS */}
                <div className="lado-derecho-en-pdf">
                    <div className="label-inputs-en-pdf">
                        <label htmlFor="retiros">SELECCIONAR RETIRO/S</label>

                        <div className="input-div">
                            <input
                                ref={retirosInputRef}
                                className="input"
                                name="retiros"
                                id="retiros"
                                type="file"
                                accept="application/pdf,.pdf"
                                multiple
                                onChange={onSelectRetiros}
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                className="icon"
                            >
                                <polyline points="16 16 12 12 8 16" />
                                <line x1="12" y1="12" x2="12" y2="21" />
                                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                            </svg>
                        </div>

                        {/* LISTA RETIROS */}
                        <div className="lista-archivos">
                            {retiros.length === 0 ? (
                                <p className="archivo-vacio">No hay retiros seleccionados.</p>
                            ) : (
                                retiros.map((f) => {
                                    const key = `${f.name}-${f.size}`;
                                    return (
                                        <div key={key} className="archivo-item">
                                            <div className="archivo-info">
                                                <span className="archivo-nombre">{f.name}</span>
                                                <span className="archivo-size">
                                                    {formatSize(f.size)}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                className="archivo-trash"
                                                onClick={() => removeRetiro(key)}
                                                aria-label={`Eliminar ${f.name}`}
                                                title="Eliminar"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ACCIÓN */}
            <div className="acciones-pdf">
                <button className="boton-procesar" onClick={onProcesar}>
                    <svg className="icon-procesar" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#db0000" d="M13.54 22H10c-.25 0-.46-.18-.5-.42l-.37-2.65c-.63-.25-1.17-.59-1.69-.99l-2.49 1.01c-.22.08-.49 0-.61-.22l-2-3.46a.493.493 0 0 1 .12-.64l2.11-1.66L4.5 12l.07-1l-2.11-1.63a.493.493 0 0 1-.12-.64l2-3.46c.12-.22.39-.31.61-.22l2.49 1c.52-.39 1.06-.73 1.69-.98l.37-2.65c.04-.24.25-.42.5-.42h4c.25 0 .46.18.5.42l.37 2.65c.63.25 1.17.59 1.69.98l2.49-1c.22-.09.49 0 .61.22l2 3.46c.13.22.07.49-.12.64L19.43 11l.07 1v.19c-.5-.12-1-.19-1.5-.19c-.17 0-.34 0-.5.03c0-.62-.1-1.24-.3-1.83l2.11-1.55l-.75-1.3l-2.41 1.04a5.42 5.42 0 0 0-3.03-1.77L12.75 4h-1.5l-.37 2.61c-1.2.25-2.26.89-3.03 1.78L5.44 7.35l-.75 1.3L6.8 10.2a5.55 5.55 0 0 0 0 3.6l-2.12 1.56l.75 1.3l2.43-1.04c.77.88 1.82 1.52 3.01 1.76l.37 2.62h1.11c.26.75.65 1.42 1.19 2m2.42-9.64c.04-.12.04-.24.04-.36c0-2.21-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4c.12 0 .24 0 .36-.04a6.05 6.05 0 0 1 3.6-3.6M12 14c-1.1 0-2-.89-2-2s.9-2 2-2s2 .9 2 2s-.89 2-2 2m4 1v6l5-3z" /></svg>
                </button>
            </div>
        </div>
    );
};

export default GenerarFacturas;
