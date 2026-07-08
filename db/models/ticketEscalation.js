const mongoose = require('mongoose');

const HistorialEstadoSchema = new mongoose.Schema({
  estado: String,
  asignado_a_rol: String,
  usuario_nombre: String,
  comentario: String,
  fecha: { type: Date, default: Date.now }
});

const TicketEscalationSchema = new mongoose.Schema({
  ticket_codigo: { type: String, required: true, unique: true },
  cliente_id: Number,
  fecha_creacion: { type: Date, default: Date.now },
  descripcion_problema: String,
  estado_actual: String,
  nivel_prioridad: String,
  historial_estados: [HistorialEstadoSchema]
});

module.exports = mongoose.models.TicketEscalation || mongoose.model('TicketEscalation', TicketEscalationSchema);
