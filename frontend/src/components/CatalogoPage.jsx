// Pantalla genérica para los catálogos (Género, Director, Productora y Tipo).
// Recibe el "modulo" (ver config/modulos.js) y muestra la lista, el formulario
// para crear/editar y los mensajes de éxito o error. Los catálogos no se eliminan:
// el caso de estudio solo pide registrar y editar (se desactivan con el estado).
import { useEffect, useState } from 'react';
import { api, describirError } from '../services/api.js';

// Formulario en blanco: un valor vacío por cada campo del módulo (y estado Activo si aplica)
const formularioVacio = (modulo) => {
  const base = {};
  modulo.campos.forEach((c) => { base[c.name] = ''; });
  if (modulo.conEstado) base.estado = 'Activo';
  return base;
};

// Muestra las fechas ISO que envía la API en formato legible
const formatearFecha = (iso) => (iso ? new Date(iso).toLocaleString('es-CO') : '');

export default function CatalogoPage({ modulo }) {
  // ---------- Estado de la pantalla ----------
  const [items, setItems] = useState([]);          // registros traídos de la API
  const [cargando, setCargando] = useState(true);  // true mientras se espera la lista
  const [error, setError] = useState(null);        // { mensaje, detalle } o null
  const [aviso, setAviso] = useState('');          // mensaje de éxito
  const [form, setForm] = useState(formularioVacio(modulo));
  const [editandoId, setEditandoId] = useState(null); // null = creando, id = editando
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // ---------- Consultar (GET) ----------
  const cargar = async () => {
    setCargando(true);
    try {
      setItems(await api.listar(modulo.endpoint));
      setError(null);
    } catch (e) {
      setError(describirError(e));
    } finally {
      setCargando(false);
    }
  };

  // Al abrir la pantalla (o cambiar de módulo) se carga la lista
  useEffect(() => { cargar(); }, [modulo.endpoint]);

  // ---------- Manejo del formulario ----------
  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const nuevo = () => {
    setForm(formularioVacio(modulo));
    setEditandoId(null);
    setError(null);
    setAviso('');
    setMostrarForm(true);
  };

  const editar = (item) => {
    // Se rellena el formulario con los datos actuales del registro
    const valores = {};
    modulo.campos.forEach((c) => { valores[c.name] = item[c.name] ?? ''; });
    if (modulo.conEstado) valores.estado = item.estado;
    setForm(valores);
    setEditandoId(item._id);
    setError(null);
    setAviso('');
    setMostrarForm(true);
  };

  const cancelar = () => {
    setMostrarForm(false);
    setEditandoId(null);
    setForm(formularioVacio(modulo));
  };

  // ---------- Crear (POST) o editar (PUT) ----------
  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      if (editandoId) {
        await api.editar(modulo.endpoint, editandoId, form);
        setAviso('Registro actualizado correctamente.');
      } else {
        await api.crear(modulo.endpoint, form);
        setAviso('Registro creado correctamente.');
      }
      cancelar();
      await cargar();
    } catch (err) {
      setError(describirError(err)); // el formulario queda abierto para corregir
    } finally {
      setGuardando(false);
    }
  };

  // ---------- Pantalla ----------
  return (
    <section>
      <div className="encabezado">
        <h1>{modulo.titulo}</h1>
        {!mostrarForm && <button onClick={nuevo}>Nuevo {modulo.singular}</button>}
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
          <h2>{editandoId ? `Editar ${modulo.singular}` : `Nuevo ${modulo.singular}`}</h2>
          {modulo.campos.map((c) => (
            <label key={c.name}>
              {c.label}
              {c.tipo === 'textarea' ? (
                <textarea name={c.name} value={form[c.name]} onChange={cambiar} rows="3" />
              ) : (
                <input name={c.name} value={form[c.name]} onChange={cambiar} required={c.required} />
              )}
            </label>
          ))}
          {modulo.conEstado && (
            <label>
              Estado
              <select name="estado" value={form.estado} onChange={cambiar}>
                <option>Activo</option>
                <option>Inactivo</option>
              </select>
            </label>
          )}
          <div className="botones">
            <button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar'}</button>
            <button type="button" className="secundario" onClick={cancelar}>Cancelar</button>
          </div>
        </form>
      )}

      {/* Tabla con los registros */}
      {cargando ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <p>No hay registros todavía.</p>
      ) : (
        <div className="tabla-scroll">
          <table>
            <thead>
              <tr>
                {modulo.campos.map((c) => <th key={c.name}>{c.label}</th>)}
                {modulo.conEstado && <th>Estado</th>}
                <th>Creación</th>
                <th>Actualización</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  {modulo.campos.map((c) => <td key={c.name}>{item[c.name]}</td>)}
                  {modulo.conEstado && (
                    <td><span className={`estado ${item.estado.toLowerCase()}`}>{item.estado}</span></td>
                  )}
                  <td>{formatearFecha(item.fechaCreacion)}</td>
                  <td>{formatearFecha(item.fechaActualizacion)}</td>
                  <td><button className="secundario" onClick={() => editar(item)}>Editar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
