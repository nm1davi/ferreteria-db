import { PDFDocument } from "pdf-lib";
import { pdfFirstPageToPngDataUrl } from "./pdfRasterize";
import { logoImage } from "../js/logo";

function dataUrlToUint8Array(dataUrl) {
    const base64 = dataUrl.split(",")[1];
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

export async function generarFacturaFinal({ facturaFile, retiroFiles }) {
    if (!facturaFile) throw new Error("Falta seleccionar la factura.");
    if (!retiroFiles) retiroFiles = [];

    // 1) Rasterizar página 1 de ARCA a PNG (evita blanco)
    const facturaPngDataUrl = await pdfFirstPageToPngDataUrl(facturaFile, 2);
    const facturaPngBytes = dataUrlToUint8Array(facturaPngDataUrl);

    // 2) Crear PDF final
    const outPdf = await PDFDocument.create();

    // A4 en puntos
    const A4 = [595.28, 841.89];
    const page = outPdf.addPage(A4);
    const { width, height } = page.getSize();

    // 3) Insertar imagen de la factura ocupando toda la hoja
    const facturaImg = await outPdf.embedPng(facturaPngBytes);
    page.drawImage(facturaImg, {
        x: 0,
        y: 0,
        width,
        height,
    });

    // 4) Insertar LOGO arriba-izquierda
    // logoImage debe ser data:image/png;base64,...
    const logoBytes = dataUrlToUint8Array(logoImage);
    const logoImg = await outPdf.embedPng(logoBytes);

    // Ajustes finos (los cambiás hasta que quede perfecto)
    const logoWidth = 241;   // tamaño
    const logoHeight = 50;
    const marginLeft = 20.1;  // separación del borde
    const marginTop = 47.66;

    page.drawImage(logoImg, {
        x: marginLeft,
        y: height - marginTop - logoHeight, // arriba-izquierda
        width: logoWidth,
        height: logoHeight,
    });

    // 5) Merge retiros
    for (const retiroFile of retiroFiles) {
        const retiroBytes = await retiroFile.arrayBuffer();
        const retiroPdf = await PDFDocument.load(retiroBytes, { ignoreEncryption: true });

        const indices = retiroPdf.getPages().map((_, idx) => idx);
        const pages = await outPdf.copyPages(retiroPdf, indices);
        pages.forEach((p) => outPdf.addPage(p));
    }

    // 6) Exportar
    const finalBytes = await outPdf.save();
    return new Blob([finalBytes], { type: "application/pdf" });
}
