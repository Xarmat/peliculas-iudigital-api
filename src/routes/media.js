// RUTAS de Media. Solo conectan método + URL con las funciones del controlador;
// la lógica y las validaciones están en controllers/media.controller.js.
const { Router } = require('express');
const media = require('../controllers/media.controller');

const router = Router();

router.get('/', media.listar);           // GET    /api/medias
// OJO: esta ruta debe ir ANTES de '/:id', si no Express tomaría "siguiente-serial" como un id
router.get('/siguiente-serial', media.siguienteSerial); // GET /api/medias/siguiente-serial
router.get('/:id', media.obtener);       // GET    /api/medias/:id
router.post('/', media.crear);           // POST   /api/medias
router.put('/:id', media.editar);        // PUT    /api/medias/:id
router.delete('/:id', media.eliminar);   // DELETE /api/medias/:id

module.exports = router;
