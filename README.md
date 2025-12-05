# 🧰 DB Ferretería – Sistema Interno Completo

Aplicación web desarrollada para la **gestión integral** de una ferretería industrial.  
El sistema incluye módulos de **clientes**, **cuentas corrientes**, **retiros de material**, **firma digital**, **notificaciones**, **PDF automático** y **panel administrativo**.

Diseñada con un enfoque **claro, moderno y escalable**, permitiendo incorporar nuevos módulos sin romper la estructura.

---

## 🚀 Características principales

### 🔹 Módulo de Clientes
- Registrar clientes (razón social, CUIT, teléfono, email).
- Editar y eliminar registros.
- Copiado rápido (CUIT, email).
- Buscador en tiempo real.
- Notificaciones visuales (Toastify).

### 🔹 Módulo de Cuentas Corrientes
- Listado de empresas con buscador.
- Vista por empresa.
- Indicadores visuales de retiros pendientes.
- Badges automáticos de **retiros A FACTURAR**.

### 🔹 Módulo de Retiros de Material
- Crear retiros con ID automático `RETIRO-0001`.
- Completar cabecera (destino, quien retira, orden de compra, índice, etc.).
- Carga de items: cantidad, descripción, precio, cálculo de totales.
- Estado de retiro:
  - **abierto**
  - **esperando-firma**
  - **a-facturar**
  - **facturado**
- Vista de detalle en tiempo real (Firestore onSnapshot).

### 🔹 Firma digital
- Generación automática de **QR** para firmar desde el celular.
- Pantalla exclusiva de firma.
- Al firmar:
  - Guarda la firma como PNG.
  - Cierra el retiro.
  - Cambia el estado a **a-facturar**.
  - Suma automáticamente al contador de pendientes.

### 🔹 Sistema de notificaciones globales
- Badge en Dashboard con cantidad total de retiros **A FACTURAR**.
- Badge individual por empresa.
- Contadores actualizados en tiempo real según:
  - firma
  - cambio de estado
  - reversiones (si vuelve de facturado a a-facturar).

### 🔹 Generación automática de PDF
- Plantilla profesional con:
  - logo
  - cabecera
  - tabla de items
  - firma digital incrustada
  - totales con IVA
- Descarga automática como `RETIRO-XXXX.pdf`.

---

## 🧩 Tecnologías utilizadas

- ⚛️ **React** (componentes + estados)
- 🔥 **Firebase Firestore** (DB en tiempo real)
- 🔐 **Firebase Auth** (acceso seguro)
- 🌐 **React Router DOM** (navegación)
- 🧾 **React Toastify** (notificaciones)
- 📝 **jspdf + jspdf-autotable** (PDF)
- ✍️ **Signature Pad** (firma digital)
- 📱 **QRCode.react** (códigos QR)
- 🎨 **CSS3** (estilos custom)
- 🖥️ **Vercel / Railway** (hosting)

---

## 🧠 Arquitectura general del proyecto

El sistema está compuesto por módulos independientes y escalables:

### 📁 **Clientes**
- `RegistrarCliente.jsx`
- `VisualizarClientes.jsx`
- `EditarCliente.jsx`

### 📁 **Cuentas Corrientes**
- `CuentasCorrientes.jsx`  
  → muestra empresas, badges, navegación

### 📁 **Retiros de Material**
- `RetirosCliente.jsx`  
  → lista retiros de una empresa  
- `RetiroDetalle.jsx`  
  → cabecera, items, agregar, eliminar, solicitar firma  
- `PantallaFirma.jsx`  
  → pantalla para firmar  
- `contadorRetiros.js`  
  → lógica global de actualización de contadores  

### 📁 **Dashboard**
- `DashboardApp.jsx`  
  → tarjetas principales, badge global de retiros pendientes  

---

## 🔄 Lógica del contador global de retiros
El sistema mantiene un contador **exacto y sincronizado** de todos los retiros pendientes:

### ✔ Cuando firma → suma 1  
### ✔ Cuando cambia a facturado → resta 1  
### ✔ Cuando revierte de facturado a a-facturar → suma 1  
### ✔ Si cambian estados repetidos → no suma ni resta  
### ✔ Todo actualizado con `increment()` en Firestore

Además, el contador global en Dashboard se calcula automáticamente sumando todos los retiros pendientes de todas las empresas.

---

## 🧾 Flujo de uso del sistema

1. El administrador crea un cliente o empresa.
2. En **Cuentas Corrientes** elige una empresa.
3. Crea un **Retiro de Material**.
4. Completa cabecera + items.
5. Solicita firma → se genera un QR.
6. Firma desde el celular → estado = “a-facturar”.
7. El retiro aparece en Dashboard y listado con badge.
8. Cuando se factura → estado = facturado (contador baja).
9. Si se equivocan → pueden volver a “a-facturar” (contador sube).
10. Puede descargarse un **PDF profesional** del retiro.

---

