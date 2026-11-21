// RUTAS de los catálogos. Solo definen qué método y URL llaman a qué función del
// controlador; la lógica está en controllers/crud.controller.js.
// No incluye DELETE: el caso solo pide registrar y editar (se desactivan con estado = Inactivo).
const { Router } = require('express');
const crearControlador = require('../controllers/crud.controller');

module.exports = (Modelo) => {
  const controlador = crearControlador(Modelo);
  const router = Router();

  router.get('/', controlador.listar);        // GET  /api/<modulo>
  router.get('/:id', controlador.obtener);    // GET  /api/<modulo>/:id
  router.post('/', controlador.crear);        // POST /api/<modulo>
  router.put('/:id', controlador.editar);     // PUT  /api/<modulo>/:id

  return router;
};
