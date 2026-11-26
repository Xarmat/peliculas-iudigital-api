// Escapa caracteres especiales para usar un texto en una expresión regular literal
const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Verifica en la base de datos si ya existe otro registro con el mismo valor
// en algún campo marcado como unique (sin distinguir mayúsculas/minúsculas).
async function buscarDuplicado(Modelo, body, idExcluir = null) {
  for (const [campo, schemaType] of Object.entries(Modelo.schema.paths)) {
    if (!schemaType.options?.unique) continue;
    const valor = body?.[campo];
    if (typeof valor !== 'string' || !valor.trim()) continue;

    const filtro = { [campo]: new RegExp(`^${escaparRegex(valor.trim())}$`, 'i') };
    if (idExcluir) filtro._id = { $ne: idExcluir };

    if (await Modelo.exists(filtro)) return campo;
  }
  return null;
}

// CONTROLADOR genérico de los catálogos (Género, Director, Productora y Tipo).
// Aquí vive la lógica de cada operación: consultar, crear y editar en la base de datos.
// No sabe nada de URLs ni métodos HTTP; eso lo define el archivo de rutas.
// Recibe un modelo y devuelve las funciones que lo manejan.
module.exports = (Modelo) => ({

  // Lista los registros (filtro opcional: ?estado=Activo o ?estado=Inactivo)
  listar: async (req, res) => {
    const filtro = req.query.estado ? { estado: req.query.estado } : {};
    res.json(await Modelo.find(filtro).sort({ fechaCreacion: -1 }));
  },

  // Consulta un registro por su _id
  obtener: async (req, res) => {
    const doc = await Modelo.findById(req.params.id);
    if (!doc) return res.status(404).json({ mensaje: 'No encontrado' });
    res.json(doc);
  },

  // Crea un registro con los datos del body
  crear: async (req, res) => {
    const campoDuplicado = await buscarDuplicado(Modelo, req.body);
    if (campoDuplicado) {
      return res.status(409).json({ mensaje: 'Valor duplicado', campo: [campoDuplicado] });
    }
    const doc = await Modelo.create(req.body);
    res.status(201).json(doc);
  },

  // Edita un registro (basta con enviar los campos a cambiar)
  editar: async (req, res) => {
    const campoDuplicado = await buscarDuplicado(Modelo, req.body, req.params.id);
    if (campoDuplicado) {
      return res.status(409).json({ mensaje: 'Valor duplicado', campo: [campoDuplicado] });
    }
    const doc = await Modelo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ mensaje: 'No encontrado' });
    res.json(doc);
  },
});
