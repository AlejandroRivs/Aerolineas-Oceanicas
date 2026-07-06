const { Pool } = require('pg');
const { MongoClient } = require('mongodb');

// Estado en memoria para el Fallback Mock DB
const mockDb = {
  usuarios: [
    { id: 1, google_id: 'mock_google_id_1', email: 'cliente@oceanica.com', nombre: 'Juan Pérez (Mock)', avatar: null, saldo_monedas: 5000.00, rol: 'Cliente', ciudadesVisitadas: ['Santiago'] },
    { id: 2, google_id: 'mock_google_id_2', email: 'servicio@oceanica.com', nombre: 'Carlos Agente (Mock)', avatar: null, saldo_monedas: 5000.00, rol: 'Servicio al Cliente', ciudadesVisitadas: [] },
    { id: 3, google_id: 'mock_google_id_3', email: 'gerente@oceanica.com', nombre: 'Marta Gerente (Mock)', avatar: null, saldo_monedas: 5000.00, rol: 'Gerente', ciudadesVisitadas: [] },
    { id: 4, google_id: 'mock_google_id_4', email: 'admin@oceanica.com', nombre: 'Alex Admin (Mock)', avatar: null, saldo_monedas: 100000.00, rol: 'Administrador', ciudadesVisitadas: [] }
  ],
  vuelos: [
    { id: 101, codigo_vuelo: 'OC-101', origen: 'Ciudad de México, MX', destino_pais: 'Colombia', destino_ciudad: 'Bogotá', fecha_salida: '2026-07-06T08:00:00Z', fecha_llegada: '2026-07-06T12:30:00Z', duracion_vuelo_minutos: 270, precio_monedas: 1200.00, asientos_disponibles: 150 },
    { id: 102, codigo_vuelo: 'OC-102', origen: 'Ciudad de México, MX', destino_pais: 'Chile', destino_ciudad: 'Santiago', fecha_salida: '2026-07-06T14:00:00Z', fecha_llegada: '2026-07-06T22:30:00Z', duracion_vuelo_minutos: 510, precio_monedas: 2400.00, asientos_disponibles: 120 },
    { id: 103, codigo_vuelo: 'OC-103', origen: 'Ciudad de México, MX', destino_pais: 'Perú', destino_ciudad: 'Lima', fecha_salida: '2026-07-06T09:30:00Z', fecha_llegada: '2026-07-06T15:45:00Z', duracion_vuelo_minutos: 375, precio_monedas: 1800.00, asientos_disponibles: 180 },
    { id: 201, codigo_vuelo: 'OC-201', origen: 'Bogotá, CO', destino_pais: 'Brasil', destino_ciudad: 'Río de Janeiro', fecha_salida: '2026-07-07T10:00:00Z', fecha_llegada: '2026-07-07T18:30:00Z', duracion_vuelo_minutos: 390, precio_monedas: 2200.00, asientos_disponibles: 140 },
    { id: 202, codigo_vuelo: 'OC-202', origen: 'Lima, PE', destino_pais: 'Argentina', destino_ciudad: 'Buenos Aires', fecha_salida: '2026-07-07T11:00:00Z', fecha_llegada: '2026-07-07T16:30:00Z', duracion_vuelo_minutos: 270, precio_monedas: 1500.00, asientos_disponibles: 160 },
    { id: 301, codigo_vuelo: 'OC-301', origen: 'Buenos Aires, AR', destino_pais: 'Colombia', destino_ciudad: 'Medellín', fecha_salida: '2026-07-08T07:00:00Z', fecha_llegada: '2026-07-08T12:30:00Z', duracion_vuelo_minutos: 390, precio_monedas: 2100.00, asientos_disponibles: 110 },
    { id: 302, codigo_vuelo: 'OC-302', origen: 'Santiago, CL', destino_pais: 'Perú', destino_ciudad: 'Cusco', fecha_salida: '2026-07-08T13:00:00Z', fecha_llegada: '2026-07-08T16:30:00Z', duracion_vuelo_minutos: 270, precio_monedas: 1600.00, asientos_disponibles: 95 },
    { id: 401, codigo_vuelo: 'OC-401', origen: 'Río de Janeiro, BR', destino_pais: 'Chile', destino_ciudad: 'Santiago', fecha_salida: '2026-07-09T15:00:00Z', fecha_llegada: '2026-07-09T19:30:00Z', duracion_vuelo_minutos: 330, precio_monedas: 1900.00, asientos_disponibles: 130 },
    { id: 501, codigo_vuelo: 'OC-501', origen: 'Bogotá, CO', destino_pais: 'Costa Rica', destino_ciudad: 'San José', fecha_salida: '2026-07-10T09:00:00Z', fecha_llegada: '2026-07-10T11:15:00Z', duracion_vuelo_minutos: 135, precio_monedas: 950.00, asientos_disponibles: 80 },
    { id: 601, codigo_vuelo: 'OC-601', origen: 'San José, CR', destino_pais: 'México', destino_ciudad: 'Cancún', fecha_salida: '2026-07-11T12:00:00Z', fecha_llegada: '2026-07-11T14:30:00Z', duracion_vuelo_minutos: 150, precio_monedas: 1100.00, asientos_disponibles: 190 }
  ],
  reservas: [],
  transacciones: [],
  parking: {
    'A-1': { identificador_plaza: 'A-1', estado: 'Libre', usuario_id: null, fecha_entrada: null, ultimo_cargo: null },
    'A-2': { identificador_plaza: 'A-2', estado: 'Libre', usuario_id: null, fecha_entrada: null, ultimo_cargo: null },
    'B-1': { identificador_plaza: 'B-1', estado: 'Libre', usuario_id: null, fecha_entrada: null, ultimo_cargo: null },
    'B-2': { identificador_plaza: 'B-2', estado: 'Libre', usuario_id: null, fecha_entrada: null, ultimo_cargo: null }
  },
  searchHistory: [],
  ticketEscalations: [
    {
      id: 'INC-2026-9874',
      ticket_codigo: 'INC-2026-9874',
      cliente_id: 1,
      fecha_creacion: '2026-07-06T10:00:00Z',
      descripcion_problema: 'Cargo duplicado en reserva de estacionamiento plaza A-1',
      estado_actual: 'Abierto',
      nivel_prioridad: 'Alta',
      historial_estados: [
        {
          estado: 'Abierto',
          asignado_a_rol: 'Servicio al Cliente',
          usuario_nombre: 'Carlos Agente (Mock)',
          comentario: 'Revisión inicial del caso.',
          fecha: '2026-07-06T10:15:00Z'
        }
      ]
    }
  ]
};

let useMock = true;
let pgPool = null;
let mongoClient = null;
let mongoDb = null;

// Intentar configurar base de datos real si existen variables de entorno
if (process.env.DATABASE_URL) {
  try {
    pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
    useMock = false;
    console.log('Base de datos SQL (PostgreSQL) configurada.');
  } catch (e) {
    console.warn('Error inicializando Pool PostgreSQL, usando mock db.', e);
  }
}

if (process.env.MONGODB_URI) {
  try {
    mongoClient = new MongoClient(process.env.MONGODB_URI);
    mongoClient.connect().then(() => {
      mongoDb = mongoClient.db(process.env.MONGODB_DB_NAME || 'oceanicas');
      console.log('Base de datos NoSQL (MongoDB) conectada.');
    });
  } catch (e) {
    console.warn('Error inicializando MongoDB client, usando mock db.', e);
  }
}

// Interfaces unificadas de base de datos
const db = {
  // --- USUARIOS ---
  async getUsuarioByGoogleId(googleId) {
    if (useMock) {
      return mockDb.usuarios.find(u => u.google_id === googleId) || null;
    }
    const res = await pgPool.query('SELECT * FROM usuarios WHERE google_id = $1', [googleId]);
    return res.rows[0] || null;
  },

  async getUsuarioById(id) {
    if (useMock) {
      return mockDb.usuarios.find(u => u.id === Number(id)) || null;
    }
    const res = await pgPool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async crearTransaccion(usuarioId, tipo, monto, descripcion) {
    if (useMock) {
      mockDb.transacciones.push({
        id: mockDb.transacciones.length + 1,
        usuario_id: Number(usuarioId),
        tipo,
        monto,
        descripcion,
        fecha_transaccion: new Date().toISOString()
      });
      return;
    }
    await pgPool.query(
      `INSERT INTO transacciones (usuario_id, tipo, monto, descripcion)
       VALUES ($1, $2, $3, $4)`,
      [usuarioId, tipo, monto, descripcion]
    );
  },

  async crearUsuario(googleId, email, nombre, avatar) {
    if (useMock) {
      const nuevoId = mockDb.usuarios.length + 1;
      const nuevoUsuario = {
        id: nuevoId,
        google_id: googleId,
        email,
        nombre,
        avatar,
        saldo_monedas: 5000.00,
        rol: 'Cliente',
        ciudadesVisitadas: []
      };
      mockDb.usuarios.push(nuevoUsuario);
      mockDb.transacciones.push({
        id: mockDb.transacciones.length + 1,
        usuario_id: nuevoId,
        tipo: 'Bono Bienvenida',
        monto: 5000.00,
        descripcion: 'Inyección inicial por registro de nuevo usuario',
        fecha_transaccion: new Date().toISOString()
      });
      return nuevoUsuario;
    }

    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const insertUser = await client.query(
        `INSERT INTO usuarios (google_id, email, nombre, avatar, saldo_monedas, rol)
         VALUES ($1, $2, $3, $4, 5000.00, 'Cliente') RETURNING *`,
        [googleId, email, nombre, avatar]
      );
      const user = insertUser.rows[0];
      await client.query(
        `INSERT INTO transacciones (usuario_id, tipo, monto, descripcion)
         VALUES ($1, 'Bono Bienvenida', 5000.00, 'Inyección inicial por registro de nuevo usuario')`,
        [user.id]
      );
      await client.query('COMMIT');
      return user;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  async actualizarSaldo(usuarioId, nuevoSaldo) {
    if (useMock) {
      const user = mockDb.usuarios.find(u => u.id === Number(usuarioId));
      if (user) user.saldo_monedas = nuevoSaldo;
      return user;
    }
    const res = await pgPool.query('UPDATE usuarios SET saldo_monedas = $1 WHERE id = $2 RETURNING *', [nuevoSaldo, usuarioId]);
    return res.rows[0];
  },

  async actualizarRol(usuarioId, nuevoRol) {
    if (useMock) {
      const user = mockDb.usuarios.find(u => u.id === Number(usuarioId));
      if (user) user.rol = nuevoRol;
      return user;
    }
    const res = await pgPool.query('UPDATE usuarios SET rol = $1 WHERE id = $2 RETURNING *', [nuevoRol, usuarioId]);
    return res.rows[0];
  },

  // --- VUELOS ---
  async getVuelos() {
    if (useMock) {
      return mockDb.vuelos;
    }
    const res = await pgPool.query('SELECT * FROM vuelos');
    return res.rows;
  },

  async getVueloById(id) {
    if (useMock) {
      return mockDb.vuelos.find(v => v.id === Number(id)) || null;
    }
    const res = await pgPool.query('SELECT * FROM vuelos WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async actualizarItinerario(vueloId, fechaSalida, fechaLlegada, precio) {
    if (useMock) {
      const vuelo = mockDb.vuelos.find(v => v.id === Number(vueloId));
      if (vuelo) {
        if (fechaSalida) vuelo.fecha_salida = fechaSalida;
        if (fechaLlegada) vuelo.fecha_llegada = fechaLlegada;
        if (precio) vuelo.precio_monedas = parseFloat(precio);
      }
      return vuelo;
    }
    const res = await pgPool.query(
      `UPDATE vuelos 
       SET fecha_salida = COALESCE($1, fecha_salida), 
           fecha_llegada = COALESCE($2, fecha_llegada), 
           precio_monedas = COALESCE($3, precio_monedas) 
       WHERE id = $4 RETURNING *`,
      [fechaSalida, fechaLlegada, precio, vueloId]
    );
    return res.rows[0];
  },

  async crearReserva(usuarioId, vueloId, monto) {
    if (useMock) {
      const user = mockDb.usuarios.find(u => u.id === Number(usuarioId));
      const vuelo = mockDb.vuelos.find(v => v.id === Number(vueloId));
      if (!user || !vuelo) throw new Error('Usuario o Vuelo no encontrado.');
      if (user.saldo_monedas < monto) throw new Error('Saldo insuficiente.');

      user.saldo_monedas -= monto;
      if (!user.ciudadesVisitadas.includes(vuelo.destino_ciudad)) {
        user.ciudadesVisitadas.push(vuelo.destino_ciudad);
      }
      const nuevaReserva = {
        id: mockDb.reservas.length + 1,
        usuario_id: usuarioId,
        vuelo_id: vueloId,
        fecha_reserva: new Date().toISOString(),
        monto_pagado: monto,
        estado: 'Confirmado'
      };
      mockDb.reservas.push(nuevaReserva);
      mockDb.transacciones.push({
        id: mockDb.transacciones.length + 1,
        usuario_id: usuarioId,
        tipo: 'Compra Vuelo',
        monto: -monto,
        descripcion: `Compra de vuelo ${vuelo.codigo_vuelo} a ${vuelo.destino_ciudad}`,
        fecha_transaccion: new Date().toISOString()
      });
      return nuevaReserva;
    }

    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      // Obtener saldo con lock
      const userQuery = await client.query('SELECT saldo_monedas FROM usuarios WHERE id = $1 FOR UPDATE', [usuarioId]);
      const user = userQuery.rows[0];
      if (!user || parseFloat(user.saldo_monedas) < parseFloat(monto)) {
        throw new Error('Saldo insuficiente o usuario no existe.');
      }
      const nuevoSaldo = parseFloat(user.saldo_monedas) - parseFloat(monto);
      await client.query('UPDATE usuarios SET saldo_monedas = $1 WHERE id = $2', [nuevoSaldo, usuarioId]);
      
      const insertReserva = await client.query(
        `INSERT INTO reservas (usuario_id, vuelo_id, monto_pagado, estado)
         VALUES ($1, $2, $3, 'Confirmado') RETURNING *`,
        [usuarioId, vueloId, monto]
      );

      // Registrar transacción
      await client.query(
        `INSERT INTO transacciones (usuario_id, tipo, monto, descripcion)
         VALUES ($1, 'Compra Vuelo', $2, $3)`,
        [usuarioId, -monto, `Reserva de vuelo ID ${vueloId}`]
      );

      await client.query('COMMIT');
      return insertReserva.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  // --- PARKING ---
  async getParkingSlots() {
    if (useMock) {
      return Object.values(mockDb.parking);
    }
    const res = await pgPool.query('SELECT * FROM parking_slots');
    return res.rows;
  },

  async actualizarTarifaParking(nuevaTarifa) {
    // Si es mock se almacena en memoria global
    global.tarifaParking = nuevaTarifa || 20.00;
    return global.tarifaParking;
  },

  async getTarifaParking() {
    return global.tarifaParking || 20.00;
  },

  async qrEntrada(usuarioId, plazaId) {
    const tarifa = await this.getTarifaParking();
    if (useMock) {
      const user = mockDb.usuarios.find(u => u.id === Number(usuarioId));
      if (!user) throw new Error('Usuario no encontrado.');
      if (user.saldo_monedas < tarifa) throw new Error('Saldo insuficiente para el primer día de parking.');

      const slot = mockDb.parking[plazaId];
      if (!slot) throw new Error('Plaza no encontrada.');
      if (slot.estado === 'Ocupado') throw new Error('La plaza ya está ocupada.');

      user.saldo_monedas -= tarifa;
      slot.estado = 'Ocupado';
      slot.usuario_id = usuarioId;
      slot.fecha_entrada = new Date().toISOString();
      slot.ultimo_cargo = new Date().toISOString();

      mockDb.transacciones.push({
        id: mockDb.transacciones.length + 1,
        usuario_id: usuarioId,
        tipo: 'Reserva Parking',
        monto: -tarifa,
        descripcion: `Cargo inicial de entrada al parking - Plaza ${plazaId}`,
        fecha_transaccion: new Date().toISOString()
      });
      return slot;
    }

    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const userRes = await client.query('SELECT saldo_monedas FROM usuarios WHERE id = $1 FOR UPDATE', [usuarioId]);
      const user = userRes.rows[0];
      if (!user || parseFloat(user.saldo_monedas) < tarifa) {
        throw new Error('Saldo insuficiente o usuario no encontrado.');
      }
      
      const slotRes = await client.query('SELECT * FROM parking_slots WHERE identificador_plaza = $1 FOR UPDATE', [plazaId]);
      const slot = slotRes.rows[0];
      if (!slot || slot.estado === 'Ocupado') {
        throw new Error('Plaza no disponible o inexistente.');
      }

      const nuevoSaldo = parseFloat(user.saldo_monedas) - tarifa;
      await client.query('UPDATE usuarios SET saldo_monedas = $1 WHERE id = $2', [nuevoSaldo, usuarioId]);
      
      const updateSlot = await client.query(
        `UPDATE parking_slots 
         SET estado = 'Ocupado', usuario_id = $1, fecha_entrada = NOW(), ultimo_cargo = NOW() 
         WHERE identificador_plaza = $2 RETURNING *`,
        [usuarioId, plazaId]
      );

      await client.query(
        `INSERT INTO transacciones (usuario_id, tipo, monto, descripcion)
         VALUES ($1, 'Reserva Parking', $2, $3)`,
        [usuarioId, -tarifa, `Cargo inicial de entrada - Plaza ${plazaId}`]
      );

      await client.query('COMMIT');
      return updateSlot.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  async qrPlaza(usuarioId, plazaId) {
    if (useMock) {
      const slot = mockDb.parking[plazaId];
      if (!slot) throw new Error('Plaza no encontrada.');
      if (slot.usuario_id !== Number(usuarioId)) {
        throw new Error('Esta plaza no está reservada por este usuario.');
      }
      return { success: true, message: `Plaza ${plazaId} vinculada y confirmada físicamente.` };
    }
    const res = await pgPool.query(
      'SELECT * FROM parking_slots WHERE identificador_plaza = $1 AND usuario_id = $2',
      [plazaId, usuarioId]
    );
    if (res.rows.length === 0) {
      throw new Error('Vinculación física no válida.');
    }
    return { success: true, message: `Plaza ${plazaId} confirmada.` };
  },

  async qrSalida(usuarioId, plazaId) {
    if (useMock) {
      const slot = mockDb.parking[plazaId];
      if (!slot) throw new Error('Plaza no encontrada.');
      if (slot.usuario_id !== Number(usuarioId)) {
        throw new Error('El usuario no coincide con la ocupación de esta plaza.');
      }
      
      // Liberar plaza
      slot.estado = 'Libre';
      slot.usuario_id = null;
      slot.fecha_entrada = null;
      slot.ultimo_cargo = null;

      return { success: true, message: 'Salida exitosa y plaza liberada.' };
    }

    const res = await pgPool.query(
      `UPDATE parking_slots 
       SET estado = 'Libre', usuario_id = NULL, fecha_entrada = NULL, ultimo_cargo = NULL
       WHERE identificador_plaza = $1 AND usuario_id = $2 RETURNING *`,
      [plazaId, usuarioId]
    );
    if (res.rows.length === 0) {
      throw new Error('No se pudo validar la salida o el usuario no está al día.');
    }
    return { success: true, message: 'Salida exitosa y plaza liberada.' };
  },

  // --- MONGO DB MOCKS / WRAPPERS ---
  async registrarBusqueda(searchRecord) {
    if (mongoDb) {
      await mongoDb.collection('search_history').insertOne(searchRecord);
    } else {
      mockDb.searchHistory.push({
        _id: 'mock_search_' + Date.now(),
        ...searchRecord,
        timestamp: new Date().toISOString()
      });
    }
  },

  async getHistorialBusquedas() {
    if (mongoDb) {
      return await mongoDb.collection('search_history').find().toArray();
    }
    return mockDb.searchHistory;
  },

  async registrarEscalacion(incidencia) {
    if (mongoDb) {
      await mongoDb.collection('ticket_escalations').insertOne(incidencia);
    } else {
      mockDb.ticketEscalations.push(incidencia);
    }
  },

  async getEscalaciones() {
    if (mongoDb) {
      return await mongoDb.collection('ticket_escalations').find().toArray();
    }
    return mockDb.ticketEscalations;
  },

  async actualizarEstadoEscalacion(ticketId, nuevoEstado, rolAsignado, usuarioNombre, comentario) {
    const logItem = {
      estado: nuevoEstado,
      asignado_a_rol: rolAsignado,
      usuario_nombre: usuarioNombre,
      comentario: comentario,
      fecha: new Date().toISOString()
    };

    if (mongoDb) {
      await mongoDb.collection('ticket_escalations').updateOne(
        { ticket_codigo: ticketId },
        {
          $set: { estado_actual: nuevoEstado },
          $push: { historial_estados: logItem }
        }
      );
    } else {
      const ticket = mockDb.ticketEscalations.find(t => t.ticket_codigo === ticketId);
      if (ticket) {
        ticket.estado_actual = nuevoEstado;
        ticket.historial_estados.push(logItem);
      }
    }
  }
};

module.exports = db;
