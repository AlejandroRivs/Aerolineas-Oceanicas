/**
 * server.js - Servidor principal de Aerolineas Oceanicas
 *
 * Responsabilidades:
 *   - Inicializar el servidor Koa y configurar middleware (sesiones, bodyparser, archivos estaticos).
 *   - Definir el Gatekeeper: capa de proteccion perimetral por contrasena antes de cualquier acceso.
 *   - Exponer las rutas de la API REST organizadas por modulo:
 *       - Autenticacion (correo/contrasena, Google OAuth, sesion)
 *       - Vuelos (listado, busqueda con filtros inteligentes, reservas)
 *       - Aparcamiento QR (entrada, plaza, salida, tarifa, reinicio de demo)
 *       - Incidencias / Escalacion (RBAC: Cliente, Servicio al Cliente, Gerente, Administrador)
 *       - Administracion (gestion de usuarios y transferencia de monedas desde la boveda)
 *   - Servir el frontend SPA (React) como archivos estaticos.
 *
 * Modo de operacion:
 *   El servidor detecta automaticamente si Supabase esta configurado.
 *   Si no lo esta, opera en modo Mock (base de datos en memoria para demostracion).
 */
require('dotenv').config();
const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');
const serve = require('koa-static');
const path = require('path');
const db = require('./database');
const { processMidnightParkingCharges } = require('./parkingJob');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = new Koa();
const router = new Router();

// Configuración de la sesión
app.keys = ['secret-key-oceanic-2026'];
const SESSION_CONFIG = {
  key: 'koa.sess',
  maxAge: 86400000,
  autoCommit: true,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: false,
  renew: false,
};
app.use(session(SESSION_CONFIG, app));
app.use(bodyParser());

// Middleware Gatekeeper (Protección perimetral por contraseña)
const GATEKEEPER_PASSWORD = process.env.GATEKEEPER_PASSWORD || 'OceanoSeguro2026';

async function gatekeeperMiddleware(ctx, next) {
  // Eximir las rutas públicas de verificación perimetral
  const publicPaths = [
    '/api/gatekeeper/verify',
    '/api/gatekeeper/status',
    '/gatekeeper.html',
    '/demo-qrs.html',
    '/api/parking/slots',
    '/api/parking/reset',
    '/favicon.ico'
  ];

  if (publicPaths.includes(ctx.path) || ctx.path.startsWith('/assets/')) {
    return await next();
  }

  if (ctx.session.gatekeeperPassed) {
    return await next();
  }

  // Si es una petición API, devolver JSON 401
  if (ctx.path.startsWith('/api/')) {
    ctx.status = 401;
    ctx.body = {
      error: 'Acceso denegado por el Gatekeeper.',
      code: 'GATEKEEPER_REQUIRED'
    };
    return;
  }

  // Si es navegación normal, redirigir a la página del Gatekeeper
  ctx.redirect('/gatekeeper.html');
}

app.use(gatekeeperMiddleware);

// --- RUTAS DEL GATEKEEPER ---

// Verificar contraseña
router.post('/api/gatekeeper/verify', async (ctx) => {
  const { password } = ctx.request.body;
  if (password === GATEKEEPER_PASSWORD) {
    ctx.session.gatekeeperPassed = true;
    ctx.status = 200;
    ctx.body = { success: true, message: 'Acceso perimetral concedido.' };
  } else {
    ctx.status = 401;
    ctx.body = { error: 'Contraseña incorrecta. Inténtelo de nuevo.' };
  }
});

// Comprobar estado de Gatekeeper
router.get('/api/gatekeeper/status', async (ctx) => {
  ctx.body = {
    passed: !!ctx.session.gatekeeperPassed
  };
});

// --- RUTAS DE AUTENTICACIÓN ---

// Login con correo y contraseña
router.post('/api/auth/login', async (ctx) => {
  const { email, password } = ctx.request.body;

  try {
    const cred = await db.getCredencial(email, password);

    if (cred) {
      let user = await db.getUsuarioByGoogleId(cred.google_id);

      // Si estamos en base de datos real (Supabase) y el usuario no existe aún, lo creamos y configuramos con su rol/saldo específico
      if (!user && !db.useMock) {
        const names = {
          'mock_google_id_1': 'Juan Pérez',
          'mock_google_id_2': 'Carlos Agente',
          'mock_google_id_3': 'Marta Gerente',
          'mock_google_id_4': 'Alex Admin'
        };
        const roles = {
          'mock_google_id_1': 'Cliente',
          'mock_google_id_2': 'Servicio al Cliente',
          'mock_google_id_3': 'Gerente',
          'mock_google_id_4': 'Administrador'
        };
        const saldos = {
          'mock_google_id_1': 5000.00,
          'mock_google_id_2': 5000.00,
          'mock_google_id_3': 5000.00,
          'mock_google_id_4': 100000.00
        };

        try {
          user = await db.crearUsuario(cred.google_id, email, names[cred.google_id] || 'Usuario Oceanica', null);
          if (user) {
            const { data: updatedUser, error: updateErr } = await db.supabase
              .from('usuarios')
              .update({
                rol: roles[cred.google_id] || 'Cliente',
                saldo_monedas: saldos[cred.google_id] || 5000.00
              })
              .eq('id', user.id)
              .select()
              .single();

            if (!updateErr && updatedUser) {
              user = updatedUser;
            }
          }
        } catch (err) {
          console.error('Error al auto-aprovisionar usuario de rol en Supabase:', err.message);
        }
      }

      if (user) {
        ctx.session.user = {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          rol: user.rol,
          saldo: user.saldo_monedas,
          ciudadesVisitadas: user.ciudadesVisitadas || []
        };
        ctx.status = 200;
        ctx.body = { success: true, user: ctx.session.user };
        return;
      }
    }
  } catch (err) {
    console.error('Error durante el proceso de login:', err.message);
  }

  ctx.status = 401;
  ctx.body = { error: 'Credenciales inválidas. Por favor intente de nuevo.' };
});

// Login de simulación (para pruebas directas sin Google Auth)
router.post('/api/auth/mock-login', async (ctx) => {
  const { email } = ctx.request.body;
  
  // Buscar en usuarios mock predeterminados
  const user = await db.getUsuarioByGoogleId(email === 'admin@oceanica.com' ? 'mock_google_id_4' : 
                   email === 'gerente@oceanica.com' ? 'mock_google_id_3' :
                   email === 'servicio@oceanica.com' ? 'mock_google_id_2' : 'mock_google_id_1');
  
  if (user) {
    ctx.session.user = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
      saldo: user.saldo_monedas,
      ciudadesVisitadas: user.ciudadesVisitadas || []
    };
    ctx.status = 200;
    ctx.body = { success: true, user: ctx.session.user };
  } else {
    ctx.status = 400;
    ctx.body = { error: 'Usuario no encontrado.' };
  }
});

// Endpoint para obtener configuraciones públicas (como Google Client ID)
router.get('/api/config', async (ctx) => {
  ctx.body = {
    googleClientId: process.env.GOOGLE_CLIENT_ID || null
  };
});

// Autenticación de Google (Real verificando el JWT o Simulación de respaldo)
router.post('/api/auth/google', async (ctx) => {
  const { credential, token, email, name, picture } = ctx.request.body;

  try {
    let googleId, userEmail, userName, userAvatar;

    // Si viene la credencial JWT real de Google y está configurado el ID, la verificamos
    if (credential && process.env.GOOGLE_CLIENT_ID) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      googleId = payload['sub'];
      userEmail = payload['email'];
      userName = payload['name'];
      userAvatar = payload['picture'];
    } else {
      // Fallback para simulación (si no hay Google Client ID o en desarrollo local)
      googleId = 'google_simulated_' + (token || Math.random().toString(36).substring(2));
      userEmail = email || 'usuario@gmail.com';
      userName = name || 'Usuario Google';
      userAvatar = picture || null;
    }

    let user = await db.getUsuarioByGoogleId(googleId);
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await db.crearUsuario(googleId, userEmail, userName, userAvatar);
    }

    ctx.session.user = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
      saldo: user.saldo_monedas,
      ciudadesVisitadas: user.ciudadesVisitadas || []
    };

    ctx.status = 200;
    ctx.body = {
      success: true,
      user: ctx.session.user,
      isNewUser
    };
  } catch (error) {
    console.error('Error en autenticación de Google:', error.message);
    ctx.status = 400;
    ctx.body = { error: 'Error en la autenticación de Google: ' + error.message };
  }
});

// Cerrar sesión
router.post('/api/auth/logout', async (ctx) => {
  ctx.session.user = null;
  ctx.body = { success: true };
});

// Obtener sesión actual
router.get('/api/auth/session', async (ctx) => {
  if (ctx.session.user) {
    // Recargar saldo y datos actualizados de la base de datos
    const user = await db.getUsuarioById(ctx.session.user.id);
    if (user) {
      ctx.session.user.saldo = user.saldo_monedas;
      ctx.session.user.rol = user.rol;
      ctx.session.user.ciudadesVisitadas = user.ciudadesVisitadas || [];
    }
    ctx.body = { loggedIn: true, user: ctx.session.user };
  } else {
    ctx.body = { loggedIn: false };
  }
});

// --- RUTAS DE VUELOS ---

// Listar todos los vuelos
router.get('/api/vuelos', async (ctx) => {
  const vuelos = await db.getVuelos();
  ctx.body = vuelos;
});

// Buscar vuelos con Filtros Inteligentes
router.post('/api/vuelos/buscar', async (ctx) => {
  const { presupuesto, gusto, tiempoDisponible, soloNoVisitados } = ctx.request.body;
  const user = ctx.session.user;

  let vuelos = await db.getVuelos();

  // Filtrar por presupuesto
  if (presupuesto) {
    vuelos = vuelos.filter(v => parseFloat(v.precio_monedas) <= parseFloat(presupuesto));
  }

  // Filtrar por destinos no visitados (Lógica requerida)
  if (soloNoVisitados && user && user.ciudadesVisitadas) {
    vuelos = vuelos.filter(v => !user.ciudadesVisitadas.includes(v.destino_ciudad));
  }

  // Guardar historial en MongoDB (NoSQL)
  const searchRecord = {
    usuario_id: user ? user.id : null,
    filtros: { presupuesto, gusto, tiempoDisponible, soloNoVisitados },
    resultados_obtenidos: vuelos.map(v => v.codigo_vuelo),
    user_agent: ctx.headers['user-agent'],
    ip_address: ctx.ip
  };
  await db.registrarBusqueda(searchRecord);

  ctx.body = vuelos;
});

// Reservar un vuelo o un paquete (Ida + Vuelta)
router.post('/api/vuelos/reservar', async (ctx) => {
  const { vueloId, vueloIdaId, vueloVueltaId, datosPasajero } = ctx.request.body;
  const user = ctx.session.user;

  if (!user) {
    ctx.status = 401;
    ctx.body = { error: 'Inicie sesión para reservar.' };
    return;
  }

  try {
    if (vueloIdaId && vueloVueltaId) {
      const vueloIda = await db.getVueloById(vueloIdaId);
      const vueloVuelta = await db.getVueloById(vueloVueltaId);
      if (!vueloIda || !vueloVuelta) {
        ctx.status = 404;
        ctx.body = { error: 'Uno de los vuelos del paquete no fue encontrado.' };
        return;
      }

      const totalMonto = (vueloIda.precio_monedas || 0) + (vueloVuelta.precio_monedas || 0);
      const userObj = await db.getUsuarioById(user.id);
      if (!userObj || parseFloat(userObj.saldo_monedas) < totalMonto) {
        ctx.status = 400;
        ctx.body = { error: 'Saldo insuficiente para el paquete de vuelos.' };
        return;
      }

      // Crear reservas para ambos vuelos
      const reservaIda = await db.crearReserva(user.id, vueloIda.id, vueloIda.precio_monedas, datosPasajero);
      const reservaVuelta = await db.crearReserva(user.id, vueloVuelta.id, vueloVuelta.precio_monedas, datosPasajero);

      const userUpdated = await db.getUsuarioById(user.id);
      ctx.session.user.saldo = userUpdated.saldo_monedas;
      ctx.session.user.ciudadesVisitadas = userUpdated.ciudadesVisitadas || [];

      ctx.body = { 
        success: true, 
        reserva: {
          id: `${reservaIda.id}-${reservaVuelta.id}`,
          usuario_id: user.id,
          vuelo_id: vueloIda.id,
          monto_pagado: totalMonto,
          estado: 'Confirmado',
          datos_pasajero: datosPasajero
        }, 
        nuevoSaldo: userUpdated.saldo_monedas 
      };
    } else {
      const vuelo = await db.getVueloById(vueloId);
      if (!vuelo) {
        ctx.status = 404;
        ctx.body = { error: 'Vuelo no encontrado.' };
        return;
      }

      const reserva = await db.crearReserva(user.id, vuelo.id, vuelo.precio_monedas, datosPasajero);
      const userUpdated = await db.getUsuarioById(user.id);
      ctx.session.user.saldo = userUpdated.saldo_monedas;
      ctx.session.user.ciudadesVisitadas = userUpdated.ciudadesVisitadas || [];

      ctx.body = { success: true, reserva, nuevoSaldo: userUpdated.saldo_monedas };
    }
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
});

// Obtener reservas del usuario actual
router.get('/api/reservas', async (ctx) => {
  const user = ctx.session.user;
  if (!user) {
    ctx.status = 401;
    ctx.body = { error: 'Inicie sesión para ver sus reservas.' };
    return;
  }
  try {
    const reservas = await db.getReservasUsuario(user.id);
    ctx.body = reservas;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

// --- RUTAS DE APARCAMIENTO (PARKING) ---

// Obtener ocupación del parking
router.get('/api/parking/slots', async (ctx) => {
  const slots = await db.getParkingSlots();
  const tarifa = await db.getTarifaParking();
  ctx.body = { slots, tarifa };
});

// Modificar tarifa del parking (Rol: Gerente o Administrador)
router.post('/api/parking/tarifa', async (ctx) => {
  const { tarifa } = ctx.request.body;
  const user = ctx.session.user;

  if (!user || (user.rol !== 'Gerente' && user.rol !== 'Administrador')) {
    ctx.status = 403;
    ctx.body = { error: 'Acceso denegado. Se requiere rol de Gerente o Administrador.' };
    return;
  }

  await db.actualizarTarifaParking(parseFloat(tarifa));
  ctx.body = { success: true, tarifa: parseFloat(tarifa) };
});

// QR de Entrada
router.post('/api/parking/qr-entrada', async (ctx) => {
  const { plazaId } = ctx.request.body;
  const user = ctx.session.user;

  if (!user) {
    ctx.status = 401;
    ctx.body = { error: 'Inicie sesión para usar el estacionamiento.' };
    return;
  }

  try {
    const slot = await db.qrEntrada(user.id, plazaId);
    ctx.body = { success: true, slot };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
});

// QR de Plaza (Confirmación física en lugar de estacionamiento)
router.post('/api/parking/qr-plaza', async (ctx) => {
  const { plazaId } = ctx.request.body;
  const user = ctx.session.user;

  if (!user) {
    ctx.status = 401;
    ctx.body = { error: 'Inicie sesión.' };
    return;
  }

  try {
    const res = await db.qrPlaza(user.id, plazaId);
    ctx.body = res;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
});

// QR de Salida (Liberación si el pago está exitoso)
router.post('/api/parking/qr-salida', async (ctx) => {
  const { plazaId } = ctx.request.body;
  const user = ctx.session.user;

  if (!user) {
    ctx.status = 401;
    ctx.body = { error: 'Inicie sesión.' };
    return;
  }

  try {
    const res = await db.qrSalida(user.id, plazaId);
    ctx.body = res;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
});

// Simulación de Medianoche (00:00 AM)
router.post('/api/parking/simulate-midnight', async (ctx) => {
  try {
    const res = await processMidnightParkingCharges();
    ctx.body = res;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Error simulando cobros de medianoche.' };
  }
});



// Reinicio global de la demostración de parking
router.post('/api/parking/reset', async (ctx) => {
  try {
    const res = await db.resetAllParking();
    ctx.body = res;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Error al reiniciar el estacionamiento.' };
  }
});

// --- RUTAS DE INCIDENCIAS (ESCALACIÓN - RBAC) ---

// Listar incidencias
router.get('/api/incidencias', async (ctx) => {
  const escalaciones = await db.getEscalaciones();
  ctx.body = escalaciones;
});

// Crear incidencia
router.post('/api/incidencias/crear', async (ctx) => {
  const { descripcion, categoria } = ctx.request.body;
  const user = ctx.session.user;

  if (!user) {
    ctx.status = 401;
    ctx.body = { error: 'Inicie sesión.' };
    return;
  }

  let nivelPrioridad = 'Media';
  if (categoria === 'Aparcamiento QR') {
    nivelPrioridad = 'Crítica';
  } else if (categoria === 'Reservas' || categoria === 'Vuelos') {
    nivelPrioridad = 'Alta';
  }

  const ticketCodigo = 'INC-2026-' + Math.floor(1000 + Math.random() * 9000);
  const incidencia = {
    ticket_codigo: ticketCodigo,
    cliente_id: user.id,
    fecha_creacion: new Date().toISOString(),
    categoria: categoria || 'General',
    descripcion_problema: descripcion,
    estado_actual: 'Abierto',
    nivel_prioridad: nivelPrioridad,
    historial_estados: [
      {
        estado: 'Abierto',
        asignado_a_rol: 'Servicio al Cliente',
        usuario_nombre: user.nombre,
        comentario: 'Reporte inicial de incidencia por el cliente.',
        fecha: new Date().toISOString()
      }
    ]
  };

  await db.registrarEscalacion(incidencia);
  ctx.body = { success: true, incidencia };
});

// Escalar incidencia (RBAC Matrix)
router.post('/api/incidencias/escalar', async (ctx) => {
  const { ticketCodigo, comentario } = ctx.request.body;
  const user = ctx.session.user;

  if (!user) {
    ctx.status = 401;
    ctx.body = { error: 'Inicie sesión.' };
    return;
  }

  const escalaciones = await db.getEscalaciones();
  const ticket = escalaciones.find(t => t.ticket_codigo === ticketCodigo);

  if (!ticket) {
    ctx.status = 404;
    ctx.body = { error: 'Incidencia no encontrada.' };
    return;
  }

  // Matriz de escalación del negocio
  let nuevoEstado = '';
  let nuevoRolAsignado = '';

  if (user.rol === 'Servicio al Cliente') {
    nuevoEstado = 'Escalado a Gerente';
    nuevoRolAsignado = 'Gerente';
  } else if (user.rol === 'Gerente') {
    nuevoEstado = 'Escalado a Administrador';
    nuevoRolAsignado = 'Administrador';
  } else {
    ctx.status = 403;
    ctx.body = { error: 'Su rol no tiene privilegios para realizar esta escalación.' };
    return;
  }

  await db.actualizarEstadoEscalacion(ticketCodigo, nuevoEstado, nuevoRolAsignado, user.nombre, comentario);
  ctx.body = { success: true, nuevoEstado };
});

// Comentar incidencia
router.post('/api/incidencias/comentar', async (ctx) => {
  const { ticketCodigo, comentario } = ctx.request.body;
  const user = ctx.session.user;

  if (!user) {
    ctx.status = 401;
    ctx.body = { error: 'Inicie sesión.' };
    return;
  }

  const escalaciones = await db.getEscalaciones();
  const ticket = escalaciones.find(t => t.ticket_codigo === ticketCodigo);

  if (!ticket) {
    ctx.status = 404;
    ctx.body = { error: 'Incidencia no encontrada.' };
    return;
  }

  // Mantiene el estado actual y el rol asignado; solo agrega el comentario al historial
  const currentState = ticket.estado_actual;
  const currentAssignedRole = ticket.historial_estados[ticket.historial_estados.length - 1].asignado_a_rol;
  
  await db.actualizarEstadoEscalacion(ticketCodigo, currentState, currentAssignedRole, user.nombre, comentario);
  ctx.body = { success: true };
});

// Cerrar incidencia
router.post('/api/incidencias/cerrar', async (ctx) => {
  const { ticketCodigo, comentario } = ctx.request.body;
  const user = ctx.session.user;

  if (!user) {
    ctx.status = 401;
    ctx.body = { error: 'Inicie sesión.' };
    return;
  }

  await db.actualizarEstadoEscalacion(ticketCodigo, 'Cerrado', 'Ninguno', user.nombre, comentario || 'Incidencia cerrada por el usuario.');
  ctx.body = { success: true };
});

// Modificar Rol (Solo Administrador)
router.post('/api/usuarios/rol', async (ctx) => {
  const { usuarioId, nuevoRol } = ctx.request.body;
  const user = ctx.session.user;

  if (!user || user.rol !== 'Administrador') {
    ctx.status = 403;
    ctx.body = { error: 'Solo el Administrador puede cambiar los roles de los usuarios.' };
    return;
  }

  const updatedUser = await db.actualizarRol(usuarioId, nuevoRol);
  ctx.body = { success: true, usuario: updatedUser };
});

// Obtener todos los usuarios (Solo Administrador)
router.get('/api/admin/usuarios', async (ctx) => {
  const user = ctx.session.user;
  if (!user || user.rol !== 'Administrador') {
    ctx.status = 403;
    ctx.body = { error: 'Acceso denegado. Solo administradores.' };
    return;
  }
  try {
    const usuarios = await db.getUsuariosAdmin();
    ctx.body = { success: true, usuarios };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

// Transferir monedas a un usuario (Solo Administrador)
router.post('/api/admin/transferir-monedas', async (ctx) => {
  const user = ctx.session.user;
  if (!user || user.rol !== 'Administrador') {
    ctx.status = 403;
    ctx.body = { error: 'Acceso denegado. Solo administradores pueden usar la bóveda.' };
    return;
  }

  const { usuarioId, cantidad, justificacion } = ctx.request.body;
  if (!usuarioId || !cantidad || !justificacion) {
    ctx.status = 400;
    ctx.body = { error: 'Faltan parámetros requeridos.' };
    return;
  }

  try {
    const res = await db.transferirMonedas(user.id, usuarioId, parseFloat(cantidad), justificacion);
    // Actualizar el saldo del admin en la sesión actual
    if (ctx.session.user) {
      ctx.session.user.saldo = res.nuevoSaldoAdmin;
    }
    ctx.body = { success: true, message: 'Transferencia exitosa', nuevoSaldoAdmin: res.nuevoSaldoAdmin };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
});

app.use(router.routes()).use(router.allowedMethods());

// Servir archivos estáticos del frontend
app.use(serve(path.join(__dirname, 'public')));

// Fallback a index.html para soportar navegación SPA
app.use(async (ctx, next) => {
  if (ctx.status === 404 && !ctx.path.startsWith('/api/')) {
    ctx.type = 'html';
    ctx.body = require('fs').createReadStream(path.join(__dirname, 'public', 'index.html'));
  } else {
    await next();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de Aerolíneas Oceánicas corriendo en http://localhost:${PORT}`);
});
