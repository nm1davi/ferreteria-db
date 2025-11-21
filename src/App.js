import { Route, Routes } from 'react-router-dom';
import './App.css';
import Inicio from './components/inicio';
import DashboardApp from './components/dashboardApp';
import RegistrarCliente from './components/registrarCliente';
import VisualizarCliente from './components/visualizarCliente';
import EditarClientes from './components/editarClientes';
import EnvioDeMensaje from './components/envioDeMensaje';
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
