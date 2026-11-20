// Barra de navegación superior. NavLink marca como "active" el enlace de la ruta actual.
import { NavLink } from 'react-router-dom';
import { MODULOS } from '../config/modulos.js';

export default function Navbar() {
  return (
    <header className="navbar">
      <span className="marca">Películas · Administración</span>
      <nav>
        <NavLink to="/" end>Inicio</NavLink>
        {Object.entries(MODULOS).map(([ruta, m]) => (
          <NavLink key={ruta} to={`/${ruta}`}>{m.titulo}</NavLink>
        ))}
        {/* PARTE 2: aquí se agregará el enlace a Media */}
      </nav>
    </header>
  );
}
