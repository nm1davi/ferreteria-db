import { Route, Routes } from 'react-router-dom';
import './App.css';
import './components/cuentasCorrientes/estadoCerrado.css';
import './components/cuentasCorrientes/pantallaFirma.css';
import Inicio from './components/inicio';
import DashboardApp from './components/dashboardApp';
import RegistrarCliente from './components/registrarCliente';
import VisualizarCliente from './components/visualizarCliente';
import EditarClientes from './components/editarClientes';
import EnvioDeMensaje from './components/envioDeMensaje';
import CuentasCorrientes from './components/cuentasCorrientes/cuentasCorrientes';
import RetiroClientes from './components/cuentasCorrientes/retiroClientes';
import RetiroDetalle from './components/cuentasCorrientes/retiroDetalle';
import PantallaFirma from './components/cuentasCorrientes/pantallaFirma';
import PrivateRoute from './components/priavateRoute';
import RouteWrapper from './components/routeWrapper';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Routes>

        {/* login */}
        <Route path='/' element={<Inicio />} />

        {/* rutas protegidas */}
        <Route
          path='dashboard'
          element={
            <PrivateRoute>
              <DashboardApp />
            </PrivateRoute>
          }
        />

        <Route
          path='registrar-clientes'
          element={
            <PrivateRoute>
              <RouteWrapper>
                <RegistrarCliente />
              </RouteWrapper>
            </PrivateRoute>
          }
        />

        <Route
          path='visualizar-clientes'
          element={
            <PrivateRoute>
              <RouteWrapper>
                <VisualizarCliente />
              </RouteWrapper>
            </PrivateRoute>
          }
        />

        <Route
          path='editar-clientes'
          element={
            <PrivateRoute>
              <RouteWrapper>
                <EditarClientes />
              </RouteWrapper>
            </PrivateRoute>
          }
        />

        <Route
          path='enviar-mensaje'
          element={
            <PrivateRoute>
              <RouteWrapper>
                <EnvioDeMensaje />
              </RouteWrapper>
            </PrivateRoute>
          }
        />

        {/* CUENTAS CORRIENTES */}
        <Route
          path='/cuentas-corrientes'
          element={
            <PrivateRoute>
              <RouteWrapper>
                <CuentasCorrientes />
              </RouteWrapper>
            </PrivateRoute>
          }
        />

        {/* Lista de retiros de un cliente */}
        <Route
          path='/cuentas-corrientes/:empresaId'
          element={
            <PrivateRoute>
              <RouteWrapper>
                <RetiroClientes />
              </RouteWrapper>
            </PrivateRoute>
          }
        />

        {/* Detalle del retiro */}
        <Route
          path='/cuentas-corrientes/:empresaId/:retiroId'
          element={
            <PrivateRoute>
              <RetiroDetalle />  {/* 🔥 el nuevo componente */}
            </PrivateRoute>
          }
        />

        <Route
          path="/firmar/:empresaId/:retiroId"
          element={<PantallaFirma />}
        />

      </Routes>

      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;
