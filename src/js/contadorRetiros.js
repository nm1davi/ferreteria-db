import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";

// Cuenta retiros A FACTURAR de una empresa y actualiza su documento
export async function actualizarContadorEmpresa(empresaId) {
    const refRetiros = collection(db, "CUENTAS-CORRIENTES", empresaId, "retiros");
    const snap = await getDocs(refRetiros);

    let contador = 0;
    snap.forEach((d) => {
        const estado = (d.data().estado || "").toLowerCase();
        if (estado === "a-facturar") contador++;
    });

    await updateDoc(doc(db, "CUENTAS-CORRIENTES", empresaId), {
        retirosAFacturar: contador
    });

    return contador;
}

// Cuenta retiros A FACTURAR totales de TODAS las empresas
export async function contarRetirosAFacturarTotales() {
    const empresasSnap = await getDocs(collection(db, "CUENTAS-CORRIENTES"));

    let total = 0;

    for (const emp of empresasSnap.docs) {
        const empresaId = emp.id;
        const retirosRef = collection(db, "CUENTAS-CORRIENTES", empresaId, "retiros");
        const retirosSnap = await getDocs(retirosRef);

        // 🔥 Recorremos retiros SIN forEach
        for (const d of retirosSnap.docs) {
            const estado = (d.data().estado || "").toLowerCase();
            if (estado === "a-facturar") total++;
        }
    }

    return total;
}

