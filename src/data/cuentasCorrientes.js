const admin = require("firebase-admin");
const serviceAccount = require("../../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const empresas = [
  "ALTOS DEL PLATA",
  "BODEGA VISTALBA SA",
  "CORRALON LUJAN SA",
  "DON SEVERO SA",
  "PERMASUR S.A",
  "EXPRESO LUJAN S.A.",
  "FREEDOM",
  "KAIKEN S.A.",
  "GRUPO MONTE",
  "MAREF MINING",
  "MAREF SA",
  "PULENTA",
  "RICCITELLI WINE COMPANY",
  "MP CONSULTING GROUP",
  "OJO DE VINO",
  "PARQUE JARDIN",
  "SEATRADE",
  "SUPERIOR ENERGY SA",
  "STEFANINI GROUP",
  "TELEDRIFT ARGENTINA S.A.",
  "VIÑA DOÑA PAULA",
  "TELLZEN CORP SA",
  "UNITRANS SA",
  "VIALMANI",
  "VIÑAS DE VERTEX"
];

// Función para convertir nombre en ID válido
function toId(nombre) {
  return nombre
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")  // saca acentos
    .replace(/\./g, "")                               // saca puntos
    .replace(/\s+/g, "_")                             // espacio → _
    .toUpperCase();                                   // todo mayus
}

(async () => {
  for (const nombre of empresas) {
    const id = toId(nombre);

    await db.collection("CUENTAS-CORRIENTES").doc(id).set({
      nombre,
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Empresa agregada → ${id}`);
  }

  console.log("✔ Todas las empresas fueron cargadas con IDs personalizados.");
  process.exit(0);
})();
