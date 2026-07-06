const db = require('./database');

async function processMidnightParkingCharges() {
  console.log('--- INICIANDO PROCESO DE FACTURACIÓN DE PARKING DE MEDIANOCHE (00:00 AM) ---');
  try {
    const slots = await db.getParkingSlots();
    const tarifa = await db.getTarifaParking();

    for (const slot of slots) {
      if (slot.estado === 'Ocupado' && slot.usuario_id) {
        const user = await db.getUsuarioById(slot.usuario_id);
        if (user) {
          if (parseFloat(user.saldo_monedas) >= tarifa) {
            const nuevoSaldo = parseFloat(user.saldo_monedas) - tarifa;
            await db.actualizarSaldo(user.id, nuevoSaldo);

            // Registrar transacción en la base de datos
            await db.crearTransaccion(
              user.id,
              'Reserva Parking',
              -tarifa,
              `Cargo automático diario - Plaza ${slot.identificador_plaza}`
            );
            console.log(`Cargo de ${tarifa} MO aplicado con éxito al usuario ${user.nombre} por plaza ${slot.identificador_plaza}.`);
          } else {
            console.warn(`Usuario ${user.nombre} tiene saldo insuficiente (${user.saldo_monedas} MO) para pagar la tarifa diaria de la plaza ${slot.identificador_plaza}.`);
            // El usuario no pagó, por lo que su estado de estacionamiento quedará impago.
            // La salida se bloqueará en el endpoint qrSalida.
          }
        }
      }
    }
    console.log('--- PROCESO DE FACTURACIÓN DE PARKING FINALIZADO ---');
    return { success: true, message: 'Facturación completada con éxito.' };
  } catch (error) {
    console.error('Error procesando cobros de parking a medianoche:', error);
    throw error;
  }
}

module.exports = { processMidnightParkingCharges };
