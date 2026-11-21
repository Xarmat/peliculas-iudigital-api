// Pantalla del módulo Media (películas y series): lista en tarjetas con filtros,
// formulario para crear/editar y eliminación con confirmación.
// El formulario solo ofrece géneros, directores y productoras ACTIVOS (regla del caso).
import { useEffect, useState } from 'react';
import { api, describirError } from '../services/api.js';
import './MediaPage.css';

// ---------- Configuración ----------

// Las 4 relaciones de una producción: qué campo es, de qué catálogo salen sus opciones
// y cómo se muestra cada opción. "conEstado" indica si ese catálogo maneja Activo/Inactivo.
const RELACIONES = [
  { campo: 'genero', label: 'Género', lista: 'generos', texto: (x) => x.nombre, conEstado: true },
  { campo: 'director', label: 'Director', lista: 'directores', texto: (x) => x.nombres, conEstado: true },
  { campo: 'productora', label: 'Productora', lista: 'productoras', texto: (x) => x.nombre, conEstado: true },
  { campo: 'tipo', label: 'Tipo', lista: 'tipos', texto: (x) => x.nombre, conEstado: false },
];

const FORMULARIO_VACIO = {
  serial: '', titulo: '', sinopsis: '', url: '', imagenPortada: '', anioEstreno: '',
  genero: '', director: '', productora: '', tipo: '',
};

export default function MediaPage() {
  // ---------- Estado de la pantalla ----------
  const [medias, setMedias] = useState([]);
  const [catalogos, setCatalogos] = useState({ generos: [], directores: [], productoras: [], tipos: [] });
  const [filtros, setFiltros] = useState({ genero: '', tipo: '' });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);       // { mensaje, detalle } o null
  const [aviso, setAviso] = useState('');
  const [form, setForm] = useState(FORMULARIO_VACIO);
  const [editando, setEditando] = useState(null); // la producción que se edita (null = creando)
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // ---------- Carga de datos (GET) ----------

  // Los 4 catálogos se piden una sola vez, al abrir la pantalla
  useEffect(() => {
    Promise.all(RELACIONES.map((r) => api.listar(r.lista)))
      .then((resultados) => {
        const c = {};
        RELACIONES.forEach((r, i) => { c[r.lista] = resultados[i]; });
        setCatalogos(c);
      })
      .catch((e) => setError(describirError(e)));
  }, []);

  // La lista de producciones se pide al abrir y cada vez que cambian los filtros
  const cargarMedias = async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams();
      if (filtros.genero) params.set('genero', filtros.genero);
      if (filtros.tipo) params.set('tipo', filtros.tipo);
      const consulta = params.toString();
      setMedias(await api.listar('medias', consulta ? `?${consulta}` : ''));
    } catch (e) {
      setError(describirError(e));
    } finally {
      setCargando(false);
    }
  };
  useEffect(() => { cargarMedias(); }, [filtros]);

  // ---------- Opciones de las listas desplegables ----------

  // Solo catálogos activos. Al editar, si la producción ya tiene un registro inactivo,
  // se agrega igual a la lista (marcado como inactivo) para que se vea el valor actual.
  const opcionesDe = (rel) => {
    const todos = catalogos[rel.lista];
    const validos = rel.conEstado ? todos.filter((x) => x.estado === 'Activo') : todos;
    const actual = editando?.[rel.campo];
    if (actual && !validos.some((x) => x._id === actual._id)) return [...validos, actual];
    return validos;
  };

  // ---------- Manejo del formulario ----------
  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const nuevo = async () => {
    setForm(FORMULARIO_VACIO);
    setEditando(null);
    setError(null);
    setAviso('');
    setMostrarForm(true);
    // Se pide a la API el siguiente serial libre y se coloca en la casilla (el admin puede cambiarlo)
    try {
      const { serial } = await api.siguienteSerial();
      setForm((f) => ({ ...f, serial }));
    } catch {
      /* si falla, la casilla queda vacía y la API generará el serial al guardar */
    }
  };

  const editar = (media) => {
    // Texto: se copia tal cual. Relaciones: la API las devuelve como objeto, aquí se guarda solo su _id.
    const valores = {
      serial: media.serial, titulo: media.titulo, sinopsis: media.sinopsis ?? '', url: media.url,
      imagenPortada: media.imagenPortada ?? '', anioEstreno: media.anioEstreno,
    };
    RELACIONES.forEach((r) => { valores[r.campo] = media[r.campo]?._id ?? ''; });
    setForm(valores);
    setEditando(media);
    setError(null);
    setAviso('');
    setMostrarForm(true);
  };

  const cancelar = () => {
    setMostrarForm(false);
    setEditando(null);
    setForm(FORMULARIO_VACIO);
  };

  // ---------- Crear (POST) o editar (PUT) ----------
  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      if (editando) {
        // Solo se envían las relaciones que cambiaron: así se puede editar una producción
        // cuyo género (o director, o productora) ya fue desactivado, sin que la API la rechace.
        const cuerpo = { ...form };
        RELACIONES.forEach(({ campo }) => {
          if (form[campo] === editando[campo]?._id) delete cuerpo[campo];
        });
        await api.editar('medias', editando._id, cuerpo);
        setAviso('Producción actualizada correctamente.');
      } else {
        await api.crear('medias', form);
        setAviso('Producción creada correctamente.');
      }
      cancelar();
      await cargarMedias();
    } catch (err) {
      setError(describirError(err)); // el formulario queda abierto para corregir
    } finally {
      setGuardando(false);
    }
  };

  // ---------- Eliminar (DELETE) ----------
  const eliminar = async (media) => {
    if (!window.confirm(`¿Eliminar "${media.titulo}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.eliminar('medias', media._id);
      setAviso('Producción eliminada correctamente.');
      setError(null);
      await cargarMedias();
    } catch (err) {
      setError(describirError(err));
    }
  };

  // ---------- Pantalla ----------
  return (
    <section>
      <div className="encabezado">
        <h1>Media (películas y series)</h1>
        {!mostrarForm && <button onClick={nuevo}>Nueva producción</button>}
      </div>

      {aviso && <div className="aviso">{aviso}</div>}
      {error && (
        <div className="error">
          <strong>{error.mensaje}</strong>
          {error.detalle.length > 0 && <ul>{error.detalle.map((d, i) => <li key={i}>{d}</li>)}</ul>}
        </div>
      )}

      {/* Formulario de creación / edición */}
      {mostrarForm && (
        <form className="formulario" onSubmit={guardar}>
          <h2>{editando ? 'Editar producción' : 'Nueva producción'}</h2>

          <div className="fila">
            <label>Serial
              <input name="serial" value={form.serial} onChange={cambiar} required={Boolean(editando)} placeholder="Se genera automáticamente" />
              <small className="nota">Se genera automáticamente, pero puedes cambiarlo. Debe ser único.</small>
            </label>
            <label>Año de estreno
              <input name="anioEstreno" type="number" min="1888" value={form.anioEstreno} onChange={cambiar} required />
            </label>
          </div>

          <label>Título
            <input name="titulo" value={form.titulo} onChange={cambiar} required />
          </label>
          <label>Sinopsis
            <textarea name="sinopsis" value={form.sinopsis} onChange={cambiar} rows="3" />
          </label>
          <label>URL de la película
            <input name="url" value={form.url} onChange={cambiar} required />
          </label>
          <label>Imagen de portada (URL)
            <input name="imagenPortada" value={form.imagenPortada} onChange={cambiar} />
          </label>

          {/* Listas desplegables generadas desde RELACIONES */}
          <div className="fila">
            {RELACIONES.map((rel) => {
              const opciones = opcionesDe(rel);
              return (
                <label key={rel.campo}>{rel.label}
                  <select name={rel.campo} value={form[rel.campo]} onChange={cambiar} required>
                    <option value="">Selecciona...</option>
                    {opciones.map((x) => (
                      <option key={x._id} value={x._id}>
                        {rel.texto(x)}{x.estado === 'Inactivo' ? ' (inactivo)' : ''}
                      </option>
                    ))}
                  </select>
                  {opciones.length === 0 && <small className="ayuda">No hay opciones activas. Créalas primero en su módulo.</small>}
                </label>
              );
            })}
          </div>

          <div className="botones">
            <button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar'}</button>
            <button type="button" className="secundario" onClick={cancelar}>Cancelar</button>
          </div>
        </form>
      )}

      {/* Filtros: se envían a la API como ?genero=ID&tipo=ID */}
      <div className="filtros">
        <label>Filtrar por género
          <select value={filtros.genero} onChange={(e) => setFiltros({ ...filtros, genero: e.target.value })}>
            <option value="">Todos</option>
            {catalogos.generos.map((g) => <option key={g._id} value={g._id}>{g.nombre}</option>)}
          </select>
        </label>
        <label>Filtrar por tipo
          <select value={filtros.tipo} onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}>
            <option value="">Todos</option>
            {catalogos.tipos.map((t) => <option key={t._id} value={t._id}>{t.nombre}</option>)}
          </select>
        </label>
      </div>

      {/* Lista de producciones en tarjetas */}
      {cargando ? (
        <p>Cargando...</p>
      ) : medias.length === 0 ? (
        <p>No hay producciones para mostrar.</p>
      ) : (
        <div className="media-grid">
          {medias.map((m) => (
            <article className="media-card" key={m._id}>
              {/* Si no hay portada, o la imagen falla, se queda el texto "Sin portada" */}
              <div className="portada">
                <span>Sin portada</span>
                {m.imagenPortada && (
                  <img
                    src={m.imagenPortada}
                    alt={`Portada de ${m.titulo}`}
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
              </div>
              <div className="media-info">
                <h3>{m.titulo} <small>({m.anioEstreno})</small></h3>
                <span className="etiqueta">{m.tipo?.nombre ?? '—'}</span>
                {m.sinopsis && <p className="sinopsis">{m.sinopsis}</p>}
                <dl className="datos">
                  <dt>Género</dt><dd>{m.genero?.nombre ?? '—'}</dd>
                  <dt>Director</dt><dd>{m.director?.nombres ?? '—'}</dd>
                  <dt>Productora</dt><dd>{m.productora?.nombre ?? '—'}</dd>
                  <dt>Serial</dt><dd>{m.serial}</dd>
                </dl>
              </div>
              <div className="acciones">
                <a className="boton-enlace" href={m.url} target="_blank" rel="noopener noreferrer">Ver</a>
                <button className="secundario" onClick={() => editar(m)}>Editar</button>
                <button className="peligro" onClick={() => eliminar(m)}>Eliminar</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
