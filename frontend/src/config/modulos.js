// Configuración de los 4 catálogos. Cada pantalla se construye a partir de esta
// descripción: qué endpoint de la API usa, qué campos tiene y si maneja estado.
// La clave del objeto es también la ruta de la pantalla (/generos, /directores...).
export const MODULOS = {
  generos: {
    titulo: 'Géneros',
    singular: 'género',
    endpoint: 'generos',
    conEstado: true, // tiene campo estado (Activo / Inactivo)
    campos: [
      { name: 'nombre', label: 'Nombre', required: true },
      { name: 'descripcion', label: 'Descripción', tipo: 'textarea' },
    ],
  },
  directores: {
    titulo: 'Directores',
    singular: 'director',
    endpoint: 'directores',
    conEstado: true,
    campos: [{ name: 'nombres', label: 'Nombres', required: true }],
  },
  productoras: {
    titulo: 'Productoras',
    singular: 'productora',
    endpoint: 'productoras',
    conEstado: true,
    campos: [
      { name: 'nombre', label: 'Nombre', required: true },
      { name: 'slogan', label: 'Slogan' },
      { name: 'descripcion', label: 'Descripción', tipo: 'textarea' },
    ],
  },
  tipos: {
    titulo: 'Tipos',
    singular: 'tipo',
    endpoint: 'tipos',
    conEstado: false, // el caso de estudio no le pide estado a Tipo
    campos: [
      { name: 'nombre', label: 'Nombre', required: true },
      { name: 'descripcion', label: 'Descripción', tipo: 'textarea' },
    ],
  },
};
