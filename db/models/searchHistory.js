const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema({
  usuario_id: { type: Number, default: null },
  filtros: {
    presupuesto: Number,
    gusto: String,
    tiempoDisponible: Number,
    soloNoVisitados: Boolean
  },
  resultados_obtenidos: [String],
  user_agent: String,
  ip_address: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.models.SearchHistory || mongoose.model('SearchHistory', SearchHistorySchema);
