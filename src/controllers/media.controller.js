// CONTROLADOR de Media (películas y series): lógica de cada operación y reglas de negocio.
const { isValidObjectId } = require('mongoose');
const Media = require('../models/Media');
const Genero = require('../models/Genero');
const Director = require('../models/Director');
const Productora = require('../models/Productora');
const Tipo = require('../models/Tipo');

// ---------- Configuración ----------

// Solo estos campos se aceptan del body (así nadie puede enviar fechaCreacion, por ejemplo)
const CAMPOS = ['serial', 'titulo', 'sinopsis', 'url', 'imagenPortada', 'anioEstreno',
  'genero', 'director', 'productora', 'tipo'];

// Qué se muestra de cada relación al consultar (en lugar del simple _id)
const poblar = [
  { path: 'genero', select: 'nombre estado' },
  { path: 'director', select: 'nombres estado' },
  { path: 'productora', select: 'nombre estado' },
  { path: 'tipo', select: 'nombre' },
];

// Regla del caso: género, director y productora deben estar Activos; el tipo solo debe existir
const REFERENCIAS = [
  { campo: 'genero', Modelo: Genero, etiqueta: 'El género', exigeActivo: true },
  { campo: 'director', Modelo: Director, etiqueta: 'El director', exigeActivo: true },
  { campo: 'productora', Modelo: Productora, etiqueta: 'La productora', exigeActivo: true },
  { campo: 'tipo', Modelo: Tipo, etiqueta: 'El tipo', exigeActivo: false },
];

// ---------- Funciones auxiliares ----------

// Se queda solo con los campos permitidos del body
const tomarCampos = (body) =>
  Object.fromEntries(CAMPOS.filter((c) => body[c] !== undefined).map((c) => [c, body[c]]));

// Devuelve un mensaje de error si alguna relación enviada no sirve, o null si todo está bien
async function validarReferencias(datos) {
  for (const { campo, Modelo, etiqueta, exigeActivo } of REFERENCIAS) {
    if (datos[campo] === undefined) continue;
    if (!isValidObjectId(datos[campo])) return `${etiqueta} enviado no tiene un ID válido`;
    const doc = await Modelo.findById(datos[campo]);
    if (!doc) return `${etiqueta} indicado no existe`;
    if (exigeActivo && doc.estado !== 'Activo') return `${etiqueta} indicado está inactivo`;
  }
  return null;
}

// Genera el siguiente serial con formato MED-0001, MED-0002...
// Busca el número más alto ya usado (ignora los seriales personalizados) y le suma 1.
async function generarSerial() {
  const existentes = await Media.find({ serial: /^MED-\d+$/ }).select('serial').lean();
  const mayor = existentes.reduce((max, m) => Math.max(max, parseInt(m.serial.slice(4), 10)), 0);
  return `MED-${String(mayor + 1).padStart(4, '0')}`;
}

// ---------- Operaciones ----------

// Devuelve el siguiente serial libre, para que el formulario lo muestre ya relleno
const siguienteSerial = async (req, res) => {
  res.json({ serial: await generarSerial() });
};

// Lista las producciones (filtros opcionales: ?genero=ID&director=ID&productora=ID&tipo=ID)
const listar = async (req, res) => {
  const filtro = {};
  for (const c of ['genero', 'director', 'productora', 'tipo']) {
    if (req.query[c]) filtro[c] = req.query[c];
  }
  res.json(await Media.find(filtro).populate(poblar).sort({ fechaCreacion: -1 }));
};

// Consulta una producción por su _id
const obtener = async (req, res) => {
  const media = await Media.findById(req.params.id).populate(poblar);
  if (!media) return res.status(404).json({ mensaje: 'Media no encontrada' });
  res.json(media);
};

// Crea una producción, validando antes sus relaciones
const crear = async (req, res) => {
  const datos = tomarCampos(req.body);
  const error = await validarReferencias(datos);
  if (error) return res.status(400).json({ mensaje: error });
  // Si no se envía serial (o viene vacío), se genera automáticamente
  if (!String(datos.serial ?? '').trim()) datos.serial = await generarSerial();
  const media = await Media.create(datos);
  res.status(201).json(await media.populate(poblar));
};

// Edita una producción (solo se validan las relaciones que vengan en el body)
const editar = async (req, res) => {
  const datos = tomarCampos(req.body);
  const error = await validarReferencias(datos);
  if (error) return res.status(400).json({ mensaje: error });
  const media = await Media.findByIdAndUpdate(req.params.id, datos, {
    new: true,
    runValidators: true,
  }).populate(poblar);
  if (!media) return res.status(404).json({ mensaje: 'Media no encontrada' });
  res.json(media);
};

// Elimina una producción
const eliminar = async (req, res) => {
  const media = await Media.findByIdAndDelete(req.params.id);
  if (!media) return res.status(404).json({ mensaje: 'Media no encontrada' });
  res.json({ mensaje: 'Media eliminada', media });
};

module.exports = { listar, siguienteSerial, obtener, crear, editar, eliminar };
