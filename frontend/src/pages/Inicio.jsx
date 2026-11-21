// Pantalla de bienvenida con accesos directos a cada módulo
import { Link } from 'react-router-dom';
import { MODULOS } from '../config/modulos.js';

export default function Inicio() {
  return (
    <section>
      <h1>Panel de administración</h1>
      <p>Gestiona el catálogo de películas y series de la plataforma. Elige un módulo:</p>
      <div className="tarjetas">
        {Object.entries(MODULOS).map(([ruta, m]) => (
          <Link key={ruta} to={`/${ruta}`} className="tarjeta">{m.titulo}</Link>
        ))}
        <Link to="/medias" className="tarjeta">Media (películas y series)</Link>
      </div>
    </section>
  );
}
