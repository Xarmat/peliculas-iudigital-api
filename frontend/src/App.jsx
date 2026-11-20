// Componente raíz: barra de navegación + definición de las rutas de la aplicación
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Inicio from './pages/Inicio.jsx';
import CatalogoPage from './components/CatalogoPage.jsx';
import { MODULOS } from './config/modulos.js';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="contenedor">
        <Routes>
          <Route path="/" element={<Inicio />} />

          {/* Una ruta por catálogo, generada desde config/modulos.js.
              La "key" hace que React reinicie la pantalla al cambiar de módulo. */}
          {Object.entries(MODULOS).map(([ruta, modulo]) => (
            <Route key={ruta} path={`/${ruta}`} element={<CatalogoPage key={ruta} modulo={modulo} />} />
          ))}

          {/* PARTE 2: aquí se agregará la ruta de Media */}

          <Route path="*" element={<p>Página no encontrada.</p>} />
        </Routes>
      </main>
    </>
  );
}
