# 🧰 DB Ferretería

Aplicación web desarrollada para la gestión interna de una ferretería industrial.  
Permite **registrar, editar, visualizar y eliminar clientes** de forma sencilla mediante un sistema CRUD totalmente funcional.  

La interfaz fue diseñada para ofrecer una **experiencia clara, moderna y escalable**, con el objetivo de facilitar la administración de datos de clientes y permitir la futura incorporación de nuevos módulos (productos, proveedores, facturación, etc.).

---

## 🚀 Características principales

- **Registro de clientes:** carga de razón social, CUIT, teléfono y correo electrónico.  
- **Visualización de clientes:** tabla dinámica con buscador, copiado rápido de CUIT y email.  
- **Edición y eliminación:** modificaciones seguras con confirmaciones visuales.  
- **Notificaciones amigables:** mediante alertas visuales y confirmaciones interactivas.  
- **Autenticación segura:** acceso protegido a las rutas mediante Firebase Authentication.  
- **Diseño responsive:** adaptado para monitores grandes, notebooks y tablets.  

---

## 🧩 Tecnologías utilizadas

- ⚛️ **React** – Librería principal para la interfaz.  
- 🔥 **Firebase** – Base de datos en la nube y autenticación de usuarios.  
- 🧾 **React Toastify** – Sistema de notificaciones visuales.  
- 🎨 **CSS3** – Estilos personalizados con enfoque en claridad y contraste.  
- 📦 **Vercel** – Plataforma de despliegue para hosting del proyecto.  

---

## 🧠 Arquitectura

El proyecto se construyó con una arquitectura **modular y escalable**, permitiendo que en futuras versiones se integren nuevos componentes sin afectar el rendimiento o la estructura base.  
Actualmente, los módulos activos son:

- `RegistrarCliente.jsx` – Alta de clientes.  
- `VisualizarCliente.jsx` – Listado con buscador y herramientas de gestión.  
- `EditarCliente.jsx` – Modificación de datos existentes.  

---
