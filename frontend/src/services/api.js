// Capa de comunicación con la API REST (EA1). Todas las pantallas usan estas
// funciones en vez de llamar a fetch directamente.

// Dirección base de la API. Se puede cambiar con VITE_API_URL en el archivo .env
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Función base: hace la petición, lee el JSON y, si la API responde con error
// (400, 404, 409...), lanza una excepción con el mensaje que envió el servidor.
async function peticion(ruta, opciones = {}) {
  const res = await fetch(`${BASE}${ruta}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  });
  const datos = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(datos?.mensaje || 'Error en la petición');
    error.status = res.status;
    // 400 trae "detalle" (lista de mensajes); 409 trae "campo" (cuál se repite)
    error.detalle = datos?.detalle || (datos?.campo ? [`Valor repetido en: ${datos.campo.join(', ')}`] : []);
    throw error;
  }
  return datos;
}

// Una función por operación de la API (recurso = 'generos', 'medias', etc.)
export const api = {
  listar: (recurso, query = '') => peticion(`/${recurso}${query}`),
  obtener: (recurso, id) => peticion(`/${recurso}/${id}`),
  crear: (recurso, cuerpo) => peticion(`/${recurso}`, { method: 'POST', body: JSON.stringify(cuerpo) }),
  editar: (recurso, id, cuerpo) => peticion(`/${recurso}/${id}`, { method: 'PUT', body: JSON.stringify(cuerpo) }),
  eliminar: (recurso, id) => peticion(`/${recurso}/${id}`, { method: 'DELETE' }),
  // Pide a la API el siguiente serial libre de Media (formato MED-0001)
  siguienteSerial: () => peticion('/medias/siguiente-serial'),
};

// Convierte cualquier error en { mensaje, detalle } listo para mostrar en pantalla.
// Si no hay status, es que ni siquiera se pudo llegar al servidor.
export function describirError(e) {
  if (!e.status) {
    return { mensaje: 'No se pudo conectar con la API. ¿Está encendido el servidor?', detalle: [] };
  }
  return { mensaje: e.message, detalle: e.detalle || [] };
}
