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
  credenciales: [
    { id: 1, email: 'cliente@oceanica.com', password: 'cliente123', google_id: 'mock_google_id_1' },
    { id: 2, email: 'servicio@oceanica.com', password: 'servicio123', google_id: 'mock_google_id_2' },
    { id: 3, email: 'gerente@oceanica.com', password: 'gerente123', google_id: 'mock_google_id_3' },
    { id: 4, email: 'admin@oceanica.com', password: 'admin123', google_id: 'mock_google_id_4' }
  ],
  vuelos: [
  {
    "id": 1001,
    "codigo_vuelo": "OC-1002",
    "origen": "Ciudad de México, MX",
    "destino_pais": "México",
    "destino_ciudad": "Cancún",
    "fecha_salida": "2026-07-06T08:00:00.000Z",
    "fecha_llegada": "2026-07-06T11:00:00.000Z",
    "duracion_vuelo_minutos": 180,
    "precio_monedas": 450,
    "asientos_disponibles": 150
  },
  {
    "id": 1002,
    "codigo_vuelo": "OC-1003",
    "origen": "Ciudad de México, MX",
    "destino_pais": "México",
    "destino_ciudad": "Ciudad de México",
    "fecha_salida": "2026-07-06T08:30:00.000Z",
    "fecha_llegada": "2026-07-06T12:30:00.000Z",
    "duracion_vuelo_minutos": 240,
    "precio_monedas": 380,
    "asientos_disponibles": 150
  },
  {
    "id": 1003,
    "codigo_vuelo": "OC-1004",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Chile",
    "destino_ciudad": "San Pedro de Atacama",
    "fecha_salida": "2026-07-06T09:00:00.000Z",
    "fecha_llegada": "2026-07-06T15:00:00.000Z",
    "duracion_vuelo_minutos": 360,
    "precio_monedas": 580,
    "asientos_disponibles": 150
  },
  {
    "id": 1004,
    "codigo_vuelo": "OC-1005",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Colombia",
    "destino_ciudad": "Bogotá",
    "fecha_salida": "2026-07-06T09:30:00.000Z",
    "fecha_llegada": "2026-07-06T12:30:00.000Z",
    "duracion_vuelo_minutos": 180,
    "precio_monedas": 340,
    "asientos_disponibles": 150
  },
  {
    "id": 1005,
    "codigo_vuelo": "OC-1006",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Brasil",
    "destino_ciudad": "Manaos",
    "fecha_salida": "2026-07-06T10:00:00.000Z",
    "fecha_llegada": "2026-07-06T16:00:00.000Z",
    "duracion_vuelo_minutos": 360,
    "precio_monedas": 720,
    "asientos_disponibles": 150
  },
  {
    "id": 1006,
    "codigo_vuelo": "OC-1007",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Guatemala",
    "destino_ciudad": "Antigua Guatemala",
    "fecha_salida": "2026-07-06T10:30:00.000Z",
    "fecha_llegada": "2026-07-06T12:30:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 250,
    "asientos_disponibles": 150
  },
  {
    "id": 1007,
    "codigo_vuelo": "OC-1008",
    "origen": "Ciudad de México, MX",
    "destino_pais": "El Salvador",
    "destino_ciudad": "La Libertad",
    "fecha_salida": "2026-07-06T11:00:00.000Z",
    "fecha_llegada": "2026-07-06T13:00:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 270,
    "asientos_disponibles": 150
  },
  {
    "id": 1008,
    "codigo_vuelo": "OC-1009",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Honduras",
    "destino_ciudad": "Copán Ruinas",
    "fecha_salida": "2026-07-06T11:30:00.000Z",
    "fecha_llegada": "2026-07-06T13:30:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 290,
    "asientos_disponibles": 150
  },
  {
    "id": 1009,
    "codigo_vuelo": "OC-1010",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Ecuador",
    "destino_ciudad": "Quito",
    "fecha_salida": "2026-07-06T12:00:00.000Z",
    "fecha_llegada": "2026-07-06T16:00:00.000Z",
    "duracion_vuelo_minutos": 240,
    "precio_monedas": 410,
    "asientos_disponibles": 150
  },
  {
    "id": 1010,
    "codigo_vuelo": "OC-1011",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Nicaragua",
    "destino_ciudad": "León",
    "fecha_salida": "2026-07-06T12:30:00.000Z",
    "fecha_llegada": "2026-07-06T15:30:00.000Z",
    "duracion_vuelo_minutos": 180,
    "precio_monedas": 310,
    "asientos_disponibles": 150
  },
  {
    "id": 1011,
    "codigo_vuelo": "OC-1012",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Argentina",
    "destino_ciudad": "Mendoza",
    "fecha_salida": "2026-07-06T13:00:00.000Z",
    "fecha_llegada": "2026-07-06T22:00:00.000Z",
    "duracion_vuelo_minutos": 540,
    "precio_monedas": 740,
    "asientos_disponibles": 150
  },
  {
    "id": 1012,
    "codigo_vuelo": "OC-1013",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Bolivia",
    "destino_ciudad": "Copacabana",
    "fecha_salida": "2026-07-06T13:45:00.000Z",
    "fecha_llegada": "2026-07-06T18:45:00.000Z",
    "duracion_vuelo_minutos": 300,
    "precio_monedas": 520,
    "asientos_disponibles": 150
  },
  {
    "id": 1013,
    "codigo_vuelo": "OC-1014",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Paraguay",
    "destino_ciudad": "Asunción",
    "fecha_salida": "2026-07-06T14:15:00.000Z",
    "fecha_llegada": "2026-07-06T20:15:00.000Z",
    "duracion_vuelo_minutos": 360,
    "precio_monedas": 460,
    "asientos_disponibles": 150
  },
  {
    "id": 1014,
    "codigo_vuelo": "OC-1015",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Uruguay",
    "destino_ciudad": "Colonia del Sacramento",
    "fecha_salida": "2026-07-06T15:00:00.000Z",
    "fecha_llegada": "2026-07-06T23:00:00.000Z",
    "duracion_vuelo_minutos": 480,
    "precio_monedas": 680,
    "asientos_disponibles": 150
  },
  {
    "id": 1015,
    "codigo_vuelo": "OC-1016",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Panamá",
    "destino_ciudad": "San Blas",
    "fecha_salida": "2026-07-06T16:20:00.000Z",
    "fecha_llegada": "2026-07-06T18:20:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 390,
    "asientos_disponibles": 150
  },
  {
    "id": 1016,
    "codigo_vuelo": "OC-1017",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Costa Rica",
    "destino_ciudad": "Jacó",
    "fecha_salida": "2026-07-06T17:00:00.000Z",
    "fecha_llegada": "2026-07-06T19:00:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 420,
    "asientos_disponibles": 150
  },
  {
    "id": 1017,
    "codigo_vuelo": "OC-1018",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Perú",
    "destino_ciudad": "Huaraz",
    "fecha_salida": "2026-07-06T18:30:00.000Z",
    "fecha_llegada": "2026-07-06T23:30:00.000Z",
    "duracion_vuelo_minutos": 300,
    "precio_monedas": 590,
    "asientos_disponibles": 150
  },
  {
    "id": 1018,
    "codigo_vuelo": "OC-1019",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Venezuela",
    "destino_ciudad": "Los Roques",
    "fecha_salida": "2026-07-06T19:45:00.000Z",
    "fecha_llegada": "2026-07-07T00:45:00.000Z",
    "duracion_vuelo_minutos": 300,
    "precio_monedas": 790,
    "asientos_disponibles": 150
  },
  {
    "id": 1019,
    "codigo_vuelo": "OC-1020",
    "origen": "Ciudad de México, MX",
    "destino_pais": "México",
    "destino_ciudad": "Monterrey",
    "fecha_salida": "2026-07-06T21:15:00.000Z",
    "fecha_llegada": "2026-07-07T00:15:00.000Z",
    "duracion_vuelo_minutos": 180,
    "precio_monedas": 360,
    "asientos_disponibles": 150
  },
  {
    "id": 1020,
    "codigo_vuelo": "OC-1021",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Colombia",
    "destino_ciudad": "Cali",
    "fecha_salida": "2026-07-06T22:30:00.000Z",
    "fecha_llegada": "2026-07-07T01:30:00.000Z",
    "duracion_vuelo_minutos": 180,
    "precio_monedas": 330,
    "asientos_disponibles": 150
  },
  {
    "id": 1021,
    "codigo_vuelo": "OC-1022",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Perú",
    "destino_ciudad": "Cusco",
    "fecha_salida": "2026-07-07T06:00:00.000Z",
    "fecha_llegada": "2026-07-07T11:00:00.000Z",
    "duracion_vuelo_minutos": 300,
    "precio_monedas": 620,
    "asientos_disponibles": 150
  },
  {
    "id": 1022,
    "codigo_vuelo": "OC-1023",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Perú",
    "destino_ciudad": "Iquitos",
    "fecha_salida": "2026-07-07T06:30:00.000Z",
    "fecha_llegada": "2026-07-07T12:30:00.000Z",
    "duracion_vuelo_minutos": 360,
    "precio_monedas": 680,
    "asientos_disponibles": 150
  },
  {
    "id": 1023,
    "codigo_vuelo": "OC-1024",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Perú",
    "destino_ciudad": "Ica",
    "fecha_salida": "2026-07-07T07:00:00.000Z",
    "fecha_llegada": "2026-07-07T12:00:00.000Z",
    "duracion_vuelo_minutos": 300,
    "precio_monedas": 590,
    "asientos_disponibles": 150
  },
  {
    "id": 1024,
    "codigo_vuelo": "OC-1025",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Cuba",
    "destino_ciudad": "La Habana",
    "fecha_salida": "2026-07-07T07:35:00.000Z",
    "fecha_llegada": "2026-07-07T10:35:00.000Z",
    "duracion_vuelo_minutos": 180,
    "precio_monedas": 410,
    "asientos_disponibles": 150
  },
  {
    "id": 1025,
    "codigo_vuelo": "OC-1026",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Ecuador",
    "destino_ciudad": "Islas Galápagos",
    "fecha_salida": "2026-07-07T08:15:00.000Z",
    "fecha_llegada": "2026-07-07T13:15:00.000Z",
    "duracion_vuelo_minutos": 300,
    "precio_monedas": 850,
    "asientos_disponibles": 150
  },
  {
    "id": 1026,
    "codigo_vuelo": "OC-1027",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Uruguay",
    "destino_ciudad": "Cabo Polonio",
    "fecha_salida": "2026-07-07T09:00:00.000Z",
    "fecha_llegada": "2026-07-07T17:00:00.000Z",
    "duracion_vuelo_minutos": 480,
    "precio_monedas": 670,
    "asientos_disponibles": 150
  },
  {
    "id": 1027,
    "codigo_vuelo": "OC-1028",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Panamá",
    "destino_ciudad": "Bocas del Toro",
    "fecha_salida": "2026-07-07T10:20:00.000Z",
    "fecha_llegada": "2026-07-07T12:20:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 340,
    "asientos_disponibles": 150
  },
  {
    "id": 1028,
    "codigo_vuelo": "OC-1029",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Colombia",
    "destino_ciudad": "Leticia",
    "fecha_salida": "2026-07-07T11:15:00.000Z",
    "fecha_llegada": "2026-07-07T15:15:00.000Z",
    "duracion_vuelo_minutos": 240,
    "precio_monedas": 480,
    "asientos_disponibles": 150
  },
  {
    "id": 1029,
    "codigo_vuelo": "OC-1030",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Guatemala",
    "destino_ciudad": "Flores",
    "fecha_salida": "2026-07-07T12:00:00.000Z",
    "fecha_llegada": "2026-07-07T14:00:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 280,
    "asientos_disponibles": 150
  },
  {
    "id": 1030,
    "codigo_vuelo": "OC-1031",
    "origen": "Ciudad de México, MX",
    "destino_pais": "El Salvador",
    "destino_ciudad": "Santa Ana",
    "fecha_salida": "2026-07-07T13:30:00.000Z",
    "fecha_llegada": "2026-07-07T15:30:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 240,
    "asientos_disponibles": 150
  },
  {
    "id": 1031,
    "codigo_vuelo": "OC-1032",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Honduras",
    "destino_ciudad": "Roatán",
    "fecha_salida": "2026-07-07T14:45:00.000Z",
    "fecha_llegada": "2026-07-07T16:45:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 460,
    "asientos_disponibles": 150
  },
  {
    "id": 1032,
    "codigo_vuelo": "OC-1033",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Nicaragua",
    "destino_ciudad": "Granada",
    "fecha_salida": "2026-07-07T15:15:00.000Z",
    "fecha_llegada": "2026-07-07T17:15:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 295,
    "asientos_disponibles": 150
  },
  {
    "id": 1033,
    "codigo_vuelo": "OC-1034",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Costa Rica",
    "destino_ciudad": "Manuel Antonio",
    "fecha_salida": "2026-07-07T16:00:00.000Z",
    "fecha_llegada": "2026-07-07T18:00:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 440,
    "asientos_disponibles": 150
  },
  {
    "id": 1034,
    "codigo_vuelo": "OC-1035",
    "origen": "Ciudad de México, MX",
    "destino_pais": "México",
    "destino_ciudad": "Guadalajara",
    "fecha_salida": "2026-07-07T17:30:00.000Z",
    "fecha_llegada": "2026-07-07T20:30:00.000Z",
    "duracion_vuelo_minutos": 180,
    "precio_monedas": 350,
    "asientos_disponibles": 150
  },
  {
    "id": 1035,
    "codigo_vuelo": "OC-1036",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Brasil",
    "destino_ciudad": "Búzios",
    "fecha_salida": "2026-07-07T18:10:00.000Z",
    "fecha_llegada": "2026-07-08T01:10:00.000Z",
    "duracion_vuelo_minutos": 420,
    "precio_monedas": 710,
    "asientos_disponibles": 150
  },
  {
    "id": 1036,
    "codigo_vuelo": "OC-1037",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Chile",
    "destino_ciudad": "Valparaíso",
    "fecha_salida": "2026-07-07T19:40:00.000Z",
    "fecha_llegada": "2026-07-08T01:40:00.000Z",
    "duracion_vuelo_minutos": 360,
    "precio_monedas": 630,
    "asientos_disponibles": 150
  },
  {
    "id": 1037,
    "codigo_vuelo": "OC-1038",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Argentina",
    "destino_ciudad": "Salta",
    "fecha_salida": "2026-07-07T20:20:00.000Z",
    "fecha_llegada": "2026-07-08T05:20:00.000Z",
    "duracion_vuelo_minutos": 540,
    "precio_monedas": 760,
    "asientos_disponibles": 150
  },
  {
    "id": 1038,
    "codigo_vuelo": "OC-1039",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Bolivia",
    "destino_ciudad": "Sucre",
    "fecha_salida": "2026-07-07T21:50:00.000Z",
    "fecha_llegada": "2026-07-08T02:50:00.000Z",
    "duracion_vuelo_minutos": 300,
    "precio_monedas": 490,
    "asientos_disponibles": 150
  },
  {
    "id": 1039,
    "codigo_vuelo": "OC-1040",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Dominica",
    "destino_ciudad": "Santo Domingo",
    "fecha_salida": "2026-07-07T22:15:00.000Z",
    "fecha_llegada": "2026-07-08T02:15:00.000Z",
    "duracion_vuelo_minutos": 240,
    "precio_monedas": 430,
    "asientos_disponibles": 150
  },
  {
    "id": 1040,
    "codigo_vuelo": "OC-1041",
    "origen": "Ciudad de México, MX",
    "destino_pais": "México",
    "destino_ciudad": "Los Cabos",
    "fecha_salida": "2026-07-07T23:00:00.000Z",
    "fecha_llegada": "2026-07-08T02:00:00.000Z",
    "duracion_vuelo_minutos": 180,
    "precio_monedas": 510,
    "asientos_disponibles": 150
  },
  {
    "id": 1041,
    "codigo_vuelo": "OC-1042",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Brasil",
    "destino_ciudad": "Río de Janeiro",
    "fecha_salida": "2026-07-08T06:15:00.000Z",
    "fecha_llegada": "2026-07-08T13:15:00.000Z",
    "duracion_vuelo_minutos": 420,
    "precio_monedas": 750,
    "asientos_disponibles": 150
  },
  {
    "id": 1042,
    "codigo_vuelo": "OC-1043",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Brasil",
    "destino_ciudad": "Foz do Iguaçu",
    "fecha_salida": "2026-07-08T07:00:00.000Z",
    "fecha_llegada": "2026-07-08T13:00:00.000Z",
    "duracion_vuelo_minutos": 360,
    "precio_monedas": 710,
    "asientos_disponibles": 150
  },
  {
    "id": 1043,
    "codigo_vuelo": "OC-1044",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Bolivia",
    "destino_ciudad": "Uyuni",
    "fecha_salida": "2026-07-08T08:30:00.000Z",
    "fecha_llegada": "2026-07-08T13:30:00.000Z",
    "duracion_vuelo_minutos": 300,
    "precio_monedas": 640,
    "asientos_disponibles": 150
  },
  {
    "id": 1044,
    "codigo_vuelo": "OC-1045",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Argentina",
    "destino_ciudad": "Bariloche",
    "fecha_salida": "2026-07-08T09:15:00.000Z",
    "fecha_llegada": "2026-07-08T17:15:00.000Z",
    "duracion_vuelo_minutos": 480,
    "precio_monedas": 780,
    "asientos_disponibles": 150
  },
  {
    "id": 1045,
    "codigo_vuelo": "OC-1046",
    "origen": "Ciudad de México, MX",
    "destino_pais": "México",
    "destino_ciudad": "Oaxaca",
    "fecha_salida": "2026-07-08T10:00:00.000Z",
    "fecha_llegada": "2026-07-08T14:00:00.000Z",
    "duracion_vuelo_minutos": 240,
    "precio_monedas": 390,
    "asientos_disponibles": 150
  },
  {
    "id": 1046,
    "codigo_vuelo": "OC-1047",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Ecuador",
    "destino_ciudad": "Cuenca",
    "fecha_salida": "2026-07-08T11:20:00.000Z",
    "fecha_llegada": "2026-07-08T15:20:00.000Z",
    "duracion_vuelo_minutos": 240,
    "precio_monedas": 420,
    "asientos_disponibles": 150
  },
  {
    "id": 1047,
    "codigo_vuelo": "OC-1048",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Chile",
    "destino_ciudad": "San Alfonso del Mar",
    "fecha_salida": "2026-07-08T12:45:00.000Z",
    "fecha_llegada": "2026-07-08T18:45:00.000Z",
    "duracion_vuelo_minutos": 360,
    "precio_monedas": 640,
    "asientos_disponibles": 150
  },
  {
    "id": 1048,
    "codigo_vuelo": "OC-1049",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Colombia",
    "destino_ciudad": "Medellín",
    "fecha_salida": "2026-07-08T14:00:00.000Z",
    "fecha_llegada": "2026-07-08T17:00:00.000Z",
    "duracion_vuelo_minutos": 180,
    "precio_monedas": 360,
    "asientos_disponibles": 150
  },
  {
    "id": 1049,
    "codigo_vuelo": "OC-1050",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Venezuela",
    "destino_ciudad": "Canaima",
    "fecha_salida": "2026-07-08T15:30:00.000Z",
    "fecha_llegada": "2026-07-08T20:30:00.000Z",
    "duracion_vuelo_minutos": 300,
    "precio_monedas": 880,
    "asientos_disponibles": 150
  },
  {
    "id": 1050,
    "codigo_vuelo": "OC-1051",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Costa Rica",
    "destino_ciudad": "La Fortuna",
    "fecha_salida": "2026-07-08T16:15:00.000Z",
    "fecha_llegada": "2026-07-08T18:15:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 460,
    "asientos_disponibles": 150
  },
  {
    "id": 1051,
    "codigo_vuelo": "OC-1052",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Guatemala",
    "destino_ciudad": "Semuc Champey",
    "fecha_salida": "2026-07-08T17:00:00.000Z",
    "fecha_llegada": "2026-07-08T19:00:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 290,
    "asientos_disponibles": 150
  },
  {
    "id": 1052,
    "codigo_vuelo": "OC-1053",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Belice",
    "destino_ciudad": "San Pedro",
    "fecha_salida": "2026-07-08T18:30:00.000Z",
    "fecha_llegada": "2026-07-08T20:30:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 490,
    "asientos_disponibles": 150
  },
  {
    "id": 1053,
    "codigo_vuelo": "OC-1054",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Honduras",
    "destino_ciudad": "Tela",
    "fecha_salida": "2026-07-08T19:15:00.000Z",
    "fecha_llegada": "2026-07-08T21:15:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 320,
    "asientos_disponibles": 150
  },
  {
    "id": 1054,
    "codigo_vuelo": "OC-1055",
    "origen": "Ciudad de México, MX",
    "destino_pais": "El Salvador",
    "destino_ciudad": "Suchitoto",
    "fecha_salida": "2026-07-08T20:00:00.000Z",
    "fecha_llegada": "2026-07-08T22:00:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 230,
    "asientos_disponibles": 150
  },
  {
    "id": 1055,
    "codigo_vuelo": "OC-1056",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Nicaragua",
    "destino_ciudad": "San Juan del Sur",
    "fecha_salida": "2026-07-08T21:00:00.000Z",
    "fecha_llegada": "2026-07-09T00:00:00.000Z",
    "duracion_vuelo_minutos": 180,
    "precio_monedas": 315,
    "asientos_disponibles": 150
  },
  {
    "id": 1056,
    "codigo_vuelo": "OC-1057",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Panamá",
    "destino_ciudad": "Chiriquí",
    "fecha_salida": "2026-07-08T21:45:00.000Z",
    "fecha_llegada": "2026-07-08T23:45:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 370,
    "asientos_disponibles": 150
  },
  {
    "id": 1057,
    "codigo_vuelo": "OC-1058",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Perú",
    "destino_ciudad": "Paracas",
    "fecha_salida": "2026-07-08T22:15:00.000Z",
    "fecha_llegada": "2026-07-09T03:15:00.000Z",
    "duracion_vuelo_minutos": 300,
    "precio_monedas": 540,
    "asientos_disponibles": 150
  },
  {
    "id": 1058,
    "codigo_vuelo": "OC-1059",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Brasil",
    "destino_ciudad": "Fernando de Noronha",
    "fecha_salida": "2026-07-08T22:45:00.000Z",
    "fecha_llegada": "2026-07-09T06:45:00.000Z",
    "duracion_vuelo_minutos": 480,
    "precio_monedas": 980,
    "asientos_disponibles": 150
  },
  {
    "id": 1059,
    "codigo_vuelo": "OC-1060",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Chile",
    "destino_ciudad": "Pucón",
    "fecha_salida": "2026-07-08T23:15:00.000Z",
    "fecha_llegada": "2026-07-09T05:15:00.000Z",
    "duracion_vuelo_minutos": 360,
    "precio_monedas": 690,
    "asientos_disponibles": 150
  },
  {
    "id": 1060,
    "codigo_vuelo": "OC-1061",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Argentina",
    "destino_ciudad": "Ushuaia",
    "fecha_salida": "2026-07-08T23:45:00.000Z",
    "fecha_llegada": "2026-07-09T09:45:00.000Z",
    "duracion_vuelo_minutos": 600,
    "precio_monedas": 920,
    "asientos_disponibles": 150
  },
  {
    "id": 1061,
    "codigo_vuelo": "OC-1062",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Colombia",
    "destino_ciudad": "Cartagena",
    "fecha_salida": "2026-07-09T06:00:00.000Z",
    "fecha_llegada": "2026-07-09T09:00:00.000Z",
    "duracion_vuelo_minutos": 180,
    "precio_monedas": 390,
    "asientos_disponibles": 150
  },
  {
    "id": 1062,
    "codigo_vuelo": "OC-1063",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Colombia",
    "destino_ciudad": "Santa Marta",
    "fecha_salida": "2026-07-09T07:15:00.000Z",
    "fecha_llegada": "2026-07-09T10:15:00.000Z",
    "duracion_vuelo_minutos": 180,
    "precio_monedas": 420,
    "asientos_disponibles": 150
  },
  {
    "id": 1063,
    "codigo_vuelo": "OC-1064",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Chile",
    "destino_ciudad": "Santiago",
    "fecha_salida": "2026-07-09T08:30:00.000Z",
    "fecha_llegada": "2026-07-09T14:30:00.000Z",
    "duracion_vuelo_minutos": 360,
    "precio_monedas": 610,
    "asientos_disponibles": 150
  },
  {
    "id": 1064,
    "codigo_vuelo": "OC-1065",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Panamá",
    "destino_ciudad": "Ciudad de Panamá",
    "fecha_salida": "2026-07-09T09:45:00.000Z",
    "fecha_llegada": "2026-07-09T11:45:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 320,
    "asientos_disponibles": 150
  },
  {
    "id": 1065,
    "codigo_vuelo": "OC-1066",
    "origen": "Ciudad de México, MX",
    "destino_pais": "México",
    "destino_ciudad": "Guanajuato",
    "fecha_salida": "2026-07-09T11:00:00.000Z",
    "fecha_llegada": "2026-07-09T15:00:00.000Z",
    "duracion_vuelo_minutos": 240,
    "precio_monedas": 370,
    "asientos_disponibles": 150
  },
  {
    "id": 1066,
    "codigo_vuelo": "OC-1067",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Perú",
    "destino_ciudad": "Arequipa",
    "fecha_salida": "2026-07-09T12:15:00.000Z",
    "fecha_llegada": "2026-07-09T17:15:00.000Z",
    "duracion_vuelo_minutos": 300,
    "precio_monedas": 530,
    "asientos_disponibles": 150
  },
  {
    "id": 1067,
    "codigo_vuelo": "OC-1068",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Ecuador",
    "destino_ciudad": "Montañita",
    "fecha_salida": "2026-07-09T13:30:00.000Z",
    "fecha_llegada": "2026-07-09T17:30:00.000Z",
    "duracion_vuelo_minutos": 240,
    "precio_monedas": 380,
    "asientos_disponibles": 150
  },
  {
    "id": 1068,
    "codigo_vuelo": "OC-1069",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Bolivia",
    "destino_ciudad": "La Paz",
    "fecha_salida": "2026-07-09T14:45:00.000Z",
    "fecha_llegada": "2026-07-09T19:45:00.000Z",
    "duracion_vuelo_minutos": 300,
    "precio_monedas": 510,
    "asientos_disponibles": 150
  },
  {
    "id": 1069,
    "codigo_vuelo": "OC-1070",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Paraguay",
    "destino_ciudad": "Encarnación",
    "fecha_salida": "2026-07-09T15:30:00.000Z",
    "fecha_llegada": "2026-07-09T21:30:00.000Z",
    "duracion_vuelo_minutos": 360,
    "precio_monedas": 490,
    "asientos_disponibles": 150
  },
  {
    "id": 1070,
    "codigo_vuelo": "OC-1071",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Uruguay",
    "destino_ciudad": "Punta del Este",
    "fecha_salida": "2026-07-09T16:20:00.000Z",
    "fecha_llegada": "2026-07-10T00:20:00.000Z",
    "duracion_vuelo_minutos": 480,
    "precio_monedas": 730,
    "asientos_disponibles": 150
  },
  {
    "id": 1071,
    "codigo_vuelo": "OC-1072",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Brasil",
    "destino_ciudad": "Natal",
    "fecha_salida": "2026-07-09T17:45:00.000Z",
    "fecha_llegada": "2026-07-10T00:45:00.000Z",
    "duracion_vuelo_minutos": 420,
    "precio_monedas": 780,
    "asientos_disponibles": 150
  },
  {
    "id": 1072,
    "codigo_vuelo": "OC-1073",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Argentina",
    "destino_ciudad": "Puerto Madryn",
    "fecha_salida": "2026-07-09T18:30:00.000Z",
    "fecha_llegada": "2026-07-10T03:30:00.000Z",
    "duracion_vuelo_minutos": 540,
    "precio_monedas": 810,
    "asientos_disponibles": 150
  },
  {
    "id": 1073,
    "codigo_vuelo": "OC-1074",
    "origen": "Ciudad de México, MX",
    "destino_pais": "México",
    "destino_ciudad": "Playa del Carmen",
    "fecha_salida": "2026-07-09T19:15:00.000Z",
    "fecha_llegada": "2026-07-09T22:15:00.000Z",
    "duracion_vuelo_minutos": 180,
    "precio_monedas": 460,
    "asientos_disponibles": 150
  },
  {
    "id": 1074,
    "codigo_vuelo": "OC-1075",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Colombia",
    "destino_ciudad": "San Andrés",
    "fecha_salida": "2026-07-09T20:00:00.000Z",
    "fecha_llegada": "2026-07-09T23:00:00.000Z",
    "duracion_vuelo_minutos": 180,
    "precio_monedas": 440,
    "asientos_disponibles": 150
  },
  {
    "id": 1075,
    "codigo_vuelo": "OC-1076",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Guatemala",
    "destino_ciudad": "Lago Atitlán",
    "fecha_salida": "2026-07-09T20:45:00.000Z",
    "fecha_llegada": "2026-07-09T22:45:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 290,
    "asientos_disponibles": 150
  },
  {
    "id": 1076,
    "codigo_vuelo": "OC-1077",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Honduras",
    "destino_ciudad": "Útila",
    "fecha_salida": "2026-07-09T21:15:00.000Z",
    "fecha_llegada": "2026-07-09T23:15:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 430,
    "asientos_disponibles": 150
  },
  {
    "id": 1077,
    "codigo_vuelo": "OC-1078",
    "origen": "Ciudad de México, MX",
    "destino_pais": "El Salvador",
    "destino_ciudad": "Ruta de las Flores",
    "fecha_salida": "2026-07-09T22:00:00.000Z",
    "fecha_llegada": "2026-07-10T00:00:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 250,
    "asientos_disponibles": 150
  },
  {
    "id": 1078,
    "codigo_vuelo": "OC-1079",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Nicaragua",
    "destino_ciudad": "Isla de Ometepe",
    "fecha_salida": "2026-07-09T22:30:00.000Z",
    "fecha_llegada": "2026-07-10T01:30:00.000Z",
    "duracion_vuelo_minutos": 180,
    "precio_monedas": 340,
    "asientos_disponibles": 150
  },
  {
    "id": 1079,
    "codigo_vuelo": "OC-1080",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Costa Rica",
    "destino_ciudad": "Tortuguero",
    "fecha_salida": "2026-07-09T23:00:00.000Z",
    "fecha_llegada": "2026-07-10T01:00:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 495,
    "asientos_disponibles": 150
  },
  {
    "id": 1080,
    "codigo_vuelo": "OC-1081",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Cuba",
    "destino_ciudad": "Varadero",
    "fecha_salida": "2026-07-09T23:30:00.000Z",
    "fecha_llegada": "2026-07-10T02:30:00.000Z",
    "duracion_vuelo_minutos": 180,
    "precio_monedas": 520,
    "asientos_disponibles": 150
  },
  {
    "id": 1081,
    "codigo_vuelo": "OC-1082",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Argentina",
    "destino_ciudad": "Buenos Aires",
    "fecha_salida": "2026-07-10T05:30:00.000Z",
    "fecha_llegada": "2026-07-10T14:30:00.000Z",
    "duracion_vuelo_minutos": 540,
    "precio_monedas": 820,
    "asientos_disponibles": 150
  },
  {
    "id": 1082,
    "codigo_vuelo": "OC-1083",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Argentina",
    "destino_ciudad": "El Calafate",
    "fecha_salida": "2026-07-10T07:00:00.000Z",
    "fecha_llegada": "2026-07-10T17:00:00.000Z",
    "duracion_vuelo_minutos": 600,
    "precio_monedas": 950,
    "asientos_disponibles": 150
  },
  {
    "id": 1083,
    "codigo_vuelo": "OC-1084",
    "origen": "Ciudad de México, MX",
    "destino_pais": "República Dominicana",
    "destino_ciudad": "Punta Cana",
    "fecha_salida": "2026-07-10T09:15:00.000Z",
    "fecha_llegada": "2026-07-10T13:15:00.000Z",
    "duracion_vuelo_minutos": 240,
    "precio_monedas": 530,
    "asientos_disponibles": 150
  },
  {
    "id": 1084,
    "codigo_vuelo": "OC-1085",
    "origen": "Ciudad de México, MX",
    "destino_pais": "México",
    "destino_ciudad": "Mérida",
    "fecha_salida": "2026-07-10T11:30:00.000Z",
    "fecha_llegada": "2026-07-10T14:30:00.000Z",
    "duracion_vuelo_minutos": 180,
    "precio_monedas": 410,
    "asientos_disponibles": 150
  },
  {
    "id": 1085,
    "codigo_vuelo": "OC-1086",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Perú",
    "destino_ciudad": "Líneas de Nazca",
    "fecha_salida": "2026-07-10T13:00:00.000Z",
    "fecha_llegada": "2026-07-10T18:00:00.000Z",
    "duracion_vuelo_minutos": 300,
    "precio_monedas": 570,
    "asientos_disponibles": 150
  },
  {
    "id": 1086,
    "codigo_vuelo": "OC-1087",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Brasil",
    "destino_ciudad": "Lençóis Maranhenses",
    "fecha_salida": "2026-07-10T14:15:00.000Z",
    "fecha_llegada": "2026-07-10T21:15:00.000Z",
    "duracion_vuelo_minutos": 420,
    "precio_monedas": 830,
    "asientos_disponibles": 150
  },
  {
    "id": 1087,
    "codigo_vuelo": "OC-1088",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Chile",
    "destino_ciudad": "Torres del Paine",
    "fecha_salida": "2026-07-10T16:00:00.000Z",
    "fecha_llegada": "2026-07-10T23:00:00.000Z",
    "duracion_vuelo_minutos": 420,
    "precio_monedas": 890,
    "asientos_disponibles": 150
  },
  {
    "id": 1088,
    "codigo_vuelo": "OC-1089",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Colombia",
    "destino_ciudad": "Eje Cafetero",
    "fecha_salida": "2026-07-10T17:30:00.000Z",
    "fecha_llegada": "2026-07-10T20:30:00.000Z",
    "duracion_vuelo_minutos": 180,
    "precio_monedas": 380,
    "asientos_disponibles": 150
  },
  {
    "id": 1089,
    "codigo_vuelo": "OC-1090",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Ecuador",
    "destino_ciudad": "Tena",
    "fecha_salida": "2026-07-10T18:45:00.000Z",
    "fecha_llegada": "2026-07-10T22:45:00.000Z",
    "duracion_vuelo_minutos": 240,
    "precio_monedas": 440,
    "asientos_disponibles": 150
  },
  {
    "id": 1090,
    "codigo_vuelo": "OC-1091",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Venezuela",
    "destino_ciudad": "Mérida",
    "fecha_salida": "2026-07-10T19:30:00.000Z",
    "fecha_llegada": "2026-07-11T00:30:00.000Z",
    "duracion_vuelo_minutos": 300,
    "precio_monedas": 620,
    "asientos_disponibles": 150
  },
  {
    "id": 1091,
    "codigo_vuelo": "OC-1092",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Bolivia",
    "destino_ciudad": "Toro Toro",
    "fecha_salida": "2026-07-10T20:15:00.000Z",
    "fecha_llegada": "2026-07-11T01:15:00.000Z",
    "duracion_vuelo_minutos": 300,
    "precio_monedas": 480,
    "asientos_disponibles": 150
  },
  {
    "id": 1092,
    "codigo_vuelo": "OC-1093",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Paraguay",
    "destino_ciudad": "Ciudad del Este",
    "fecha_salida": "2026-07-10T21:00:00.000Z",
    "fecha_llegada": "2026-07-11T03:00:00.000Z",
    "duracion_vuelo_minutos": 360,
    "precio_monedas": 410,
    "asientos_disponibles": 150
  },
  {
    "id": 1093,
    "codigo_vuelo": "OC-1094",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Uruguay",
    "destino_ciudad": "Punta del Diablo",
    "fecha_salida": "2026-07-10T21:45:00.000Z",
    "fecha_llegada": "2026-07-11T05:45:00.000Z",
    "duracion_vuelo_minutos": 480,
    "precio_monedas": 660,
    "asientos_disponibles": 150
  },
  {
    "id": 1094,
    "codigo_vuelo": "OC-1095",
    "origen": "Ciudad de México, MX",
    "destino_pais": "Panamá",
    "destino_ciudad": "Portobelo",
    "fecha_salida": "2026-07-10T22:30:00.000Z",
    "fecha_llegada": "2026-07-11T00:30:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 310,
    "asientos_disponibles": 150
  },
  {
    "id": 2001,
    "codigo_vuelo": "OC-2001",
    "origen": "México",
    "destino_pais": "México",
    "destino_ciudad": "México",
    "fecha_salida": "2026-07-11T12:00:00.000Z",
    "fecha_llegada": "2026-07-11T15:00:00.000Z",
    "duracion_vuelo_minutos": 180,
    "precio_monedas": 420,
    "asientos_disponibles": 150
  },
  {
    "id": 2002,
    "codigo_vuelo": "OC-2002",
    "origen": "Perú",
    "destino_pais": "México",
    "destino_ciudad": "México",
    "fecha_salida": "2026-07-11T14:00:00.000Z",
    "fecha_llegada": "2026-07-11T19:00:00.000Z",
    "duracion_vuelo_minutos": 300,
    "precio_monedas": 580,
    "asientos_disponibles": 150
  },
  {
    "id": 2003,
    "codigo_vuelo": "OC-2003",
    "origen": "Chile",
    "destino_pais": "México",
    "destino_ciudad": "México",
    "fecha_salida": "2026-07-11T15:30:00.000Z",
    "fecha_llegada": "2026-07-11T21:30:00.000Z",
    "duracion_vuelo_minutos": 360,
    "precio_monedas": 540,
    "asientos_disponibles": 150
  },
  {
    "id": 2004,
    "codigo_vuelo": "OC-2004",
    "origen": "Colombia",
    "destino_pais": "México",
    "destino_ciudad": "México",
    "fecha_salida": "2026-07-11T10:00:00.000Z",
    "fecha_llegada": "2026-07-11T13:00:00.000Z",
    "duracion_vuelo_minutos": 180,
    "precio_monedas": 320,
    "asientos_disponibles": 150
  },
  {
    "id": 2005,
    "codigo_vuelo": "OC-2005",
    "origen": "Brasil",
    "destino_pais": "México",
    "destino_ciudad": "México",
    "fecha_salida": "2026-07-11T17:00:00.000Z",
    "fecha_llegada": "2026-07-11T23:00:00.000Z",
    "duracion_vuelo_minutos": 360,
    "precio_monedas": 680,
    "asientos_disponibles": 150
  },
  {
    "id": 2006,
    "codigo_vuelo": "OC-2006",
    "origen": "Guatemala",
    "destino_pais": "México",
    "destino_ciudad": "México",
    "fecha_salida": "2026-07-11T11:00:00.000Z",
    "fecha_llegada": "2026-07-11T13:00:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 230,
    "asientos_disponibles": 150
  },
  {
    "id": 2007,
    "codigo_vuelo": "OC-2007",
    "origen": "Costa Rica",
    "destino_pais": "México",
    "destino_ciudad": "México",
    "fecha_salida": "2026-07-11T16:00:00.000Z",
    "fecha_llegada": "2026-07-11T18:00:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 390,
    "asientos_disponibles": 150
  },
  {
    "id": 2008,
    "codigo_vuelo": "OC-2008",
    "origen": "Perú",
    "destino_pais": "México",
    "destino_ciudad": "México",
    "fecha_salida": "2026-07-10T14:00:00.000Z",
    "fecha_llegada": "2026-07-10T19:00:00.000Z",
    "duracion_vuelo_minutos": 300,
    "precio_monedas": 580,
    "asientos_disponibles": 150
  },
  {
    "id": 2009,
    "codigo_vuelo": "OC-2009",
    "origen": "México",
    "destino_pais": "México",
    "destino_ciudad": "México",
    "fecha_salida": "2026-07-10T12:00:00.000Z",
    "fecha_llegada": "2026-07-10T15:00:00.000Z",
    "duracion_vuelo_minutos": 180,
    "precio_monedas": 420,
    "asientos_disponibles": 150
  },
  {
    "id": 2010,
    "codigo_vuelo": "OC-2010",
    "origen": "Guatemala",
    "destino_pais": "México",
    "destino_ciudad": "México",
    "fecha_salida": "2026-07-10T11:00:00.000Z",
    "fecha_llegada": "2026-07-10T13:00:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 230,
    "asientos_disponibles": 150
  },
  {
    "id": 3001,
    "codigo_vuelo": "OC-3001",
    "origen": "México",
    "destino_pais": "Guatemala",
    "destino_ciudad": "Guatemala",
    "fecha_salida": "2026-07-11T12:00:00.000Z",
    "fecha_llegada": "2026-07-11T14:30:00.000Z",
    "duracion_vuelo_minutos": 150,
    "precio_monedas": 380,
    "asientos_disponibles": 150
  },
  {
    "id": 3002,
    "codigo_vuelo": "OC-3002",
    "origen": "Perú",
    "destino_pais": "Guatemala",
    "destino_ciudad": "Guatemala",
    "fecha_salida": "2026-07-11T15:00:00.000Z",
    "fecha_llegada": "2026-07-11T20:30:00.000Z",
    "duracion_vuelo_minutos": 330,
    "precio_monedas": 520,
    "asientos_disponibles": 150
  },
  {
    "id": 3003,
    "codigo_vuelo": "OC-3003",
    "origen": "Costa Rica",
    "destino_pais": "Guatemala",
    "destino_ciudad": "Guatemala",
    "fecha_salida": "2026-07-11T10:00:00.000Z",
    "fecha_llegada": "2026-07-11T12:30:00.000Z",
    "duracion_vuelo_minutos": 150,
    "precio_monedas": 310,
    "asientos_disponibles": 150
  },
  {
    "id": 4001,
    "codigo_vuelo": "OC-4001",
    "origen": "México",
    "destino_pais": "Costa Rica",
    "destino_ciudad": "Costa Rica",
    "fecha_salida": "2026-07-11T09:00:00.000Z",
    "fecha_llegada": "2026-07-11T11:00:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 360,
    "asientos_disponibles": 150
  },
  {
    "id": 4002,
    "codigo_vuelo": "OC-4002",
    "origen": "Perú",
    "destino_pais": "Costa Rica",
    "destino_ciudad": "Costa Rica",
    "fecha_salida": "2026-07-11T13:00:00.000Z",
    "fecha_llegada": "2026-07-11T18:00:00.000Z",
    "duracion_vuelo_minutos": 300,
    "precio_monedas": 490,
    "asientos_disponibles": 150
  },
  {
    "id": 1901,
    "codigo_vuelo": "OC-1901",
    "origen": "México",
    "destino_pais": "México",
    "destino_ciudad": "Cancún",
    "fecha_salida": "2026-07-08T08:00:00.000Z",
    "fecha_llegada": "2026-07-08T11:00:00.000Z",
    "duracion_vuelo_minutos": 180,
    "precio_monedas": 450,
    "asientos_disponibles": 150
  },
  {
    "id": 1902,
    "codigo_vuelo": "OC-1902",
    "origen": "México",
    "destino_pais": "Perú",
    "destino_ciudad": "Cusco",
    "fecha_salida": "2026-07-08T07:00:00.000Z",
    "fecha_llegada": "2026-07-08T12:00:00.000Z",
    "duracion_vuelo_minutos": 300,
    "precio_monedas": 600,
    "asientos_disponibles": 150
  },
  {
    "id": 1903,
    "codigo_vuelo": "OC-1903",
    "origen": "México",
    "destino_pais": "Chile",
    "destino_ciudad": "San Pedro de Atacama",
    "fecha_salida": "2026-07-08T06:00:00.000Z",
    "fecha_llegada": "2026-07-08T12:00:00.000Z",
    "duracion_vuelo_minutos": 360,
    "precio_monedas": 580,
    "asientos_disponibles": 150
  },
  {
    "id": 5001,
    "codigo_vuelo": "OC-5001",
    "origen": "Guatemala",
    "destino_pais": "México",
    "destino_ciudad": "Cancún",
    "fecha_salida": "2026-07-08T09:00:00.000Z",
    "fecha_llegada": "2026-07-08T11:30:00.000Z",
    "duracion_vuelo_minutos": 150,
    "precio_monedas": 220,
    "asientos_disponibles": 150
  },
  {
    "id": 5002,
    "codigo_vuelo": "OC-5002",
    "origen": "Guatemala",
    "destino_pais": "Perú",
    "destino_ciudad": "Cusco",
    "fecha_salida": "2026-07-08T10:00:00.000Z",
    "fecha_llegada": "2026-07-08T15:30:00.000Z",
    "duracion_vuelo_minutos": 330,
    "precio_monedas": 450,
    "asientos_disponibles": 150
  },
  {
    "id": 5003,
    "codigo_vuelo": "OC-5003",
    "origen": "Guatemala",
    "destino_pais": "Costa Rica",
    "destino_ciudad": "Jacó",
    "fecha_salida": "2026-07-08T08:00:00.000Z",
    "fecha_llegada": "2026-07-08T10:30:00.000Z",
    "duracion_vuelo_minutos": 150,
    "precio_monedas": 190,
    "asientos_disponibles": 150
  },
  {
    "id": 6001,
    "codigo_vuelo": "OC-6001",
    "origen": "Costa Rica",
    "destino_pais": "México",
    "destino_ciudad": "Cancún",
    "fecha_salida": "2026-07-08T08:30:00.000Z",
    "fecha_llegada": "2026-07-08T10:30:00.000Z",
    "duracion_vuelo_minutos": 120,
    "precio_monedas": 240,
    "asientos_disponibles": 150
  },
  {
    "id": 6002,
    "codigo_vuelo": "OC-6002",
    "origen": "Costa Rica",
    "destino_pais": "Perú",
    "destino_ciudad": "Cusco",
    "fecha_salida": "2026-07-08T11:00:00.000Z",
    "fecha_llegada": "2026-07-08T16:00:00.000Z",
    "duracion_vuelo_minutos": 300,
    "precio_monedas": 480,
    "asientos_disponibles": 150
  }
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

const supabase = require('./db/supabase');
const connectMongoose = require('./db/mongoose');
const SearchHistory = require('./db/models/searchHistory');
const TicketEscalation = require('./db/models/ticketEscalation');

let useMock = true;
let useMongo = false;

if (supabase) {
  useMock = false;
  console.log('Base de datos SQL (Supabase SDK) configurada.');
} else {
  console.log('Iniciando en modo MOCK para base de datos relacional.');
}

if (process.env.MONGODB_URI) {
  connectMongoose()
    .then(() => {
      useMongo = true;
    })
    .catch((err) => {
      console.warn('No se pudo conectar a MongoDB vía Mongoose, usando mock db en memoria.', err.message);
    });
}

// Interfaces unificadas de base de datos
const db = {
  useMock: true, // Se sobreescribirá dinámicamente abajo o se leerá directamente
  supabase: supabase,
  // --- CREDENCIALES ---
  async getCredencial(email, password) {
    if (useMock) {
      return mockDb.credenciales.find(c => c.email === email && c.password === password) || null;
    }
    const { data, error } = await supabase
      .from('credenciales')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // --- USUARIOS ---
  async getUsuarioByGoogleId(googleId) {
    if (useMock) {
      return mockDb.usuarios.find(u => u.google_id === googleId) || null;
    }
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('google_id', googleId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getUsuarioById(id) {
    if (useMock) {
      return mockDb.usuarios.find(u => u.id === Number(id)) || null;
    }
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
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
    const { error } = await supabase
      .from('transacciones')
      .insert([{ usuario_id: usuarioId, tipo, monto, descripcion }]);
    if (error) throw error;
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

    const { data: user, error: userErr } = await supabase
      .from('usuarios')
      .insert([{ google_id: googleId, email, nombre, avatar, saldo_monedas: 5000.00, rol: 'Cliente' }])
      .select()
      .single();
    if (userErr) throw userErr;

    const { error: txErr } = await supabase
      .from('transacciones')
      .insert([{ usuario_id: user.id, tipo: 'Bono Bienvenida', monto: 5000.00, descripcion: 'Inyección inicial por registro de nuevo usuario' }]);
    if (txErr) throw txErr;

    return user;
  },

  async actualizarSaldo(usuarioId, nuevoSaldo) {
    if (useMock) {
      const user = mockDb.usuarios.find(u => u.id === Number(usuarioId));
      if (user) user.saldo_monedas = nuevoSaldo;
      return user;
    }
    const { data, error } = await supabase
      .from('usuarios')
      .update({ saldo_monedas: nuevoSaldo })
      .eq('id', usuarioId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async actualizarRol(usuarioId, nuevoRol) {
    if (useMock) {
      const user = mockDb.usuarios.find(u => u.id === Number(usuarioId));
      if (user) user.rol = nuevoRol;
      return user;
    }
    const { data, error } = await supabase
      .from('usuarios')
      .update({ rol: nuevoRol })
      .eq('id', usuarioId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- VUELOS ---
  async getVuelos() {
    if (useMock) {
      return mockDb.vuelos;
    }
    const { data, error } = await supabase
      .from('vuelos')
      .select('*');
    if (error) throw error;
    return data;
  },

  async getVueloById(id) {
    if (useMock) {
      return mockDb.vuelos.find(v => v.id === Number(id)) || null;
    }
    const { data, error } = await supabase
      .from('vuelos')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
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
    const updates = {};
    if (fechaSalida) updates.fecha_salida = fechaSalida;
    if (fechaLlegada) updates.fecha_llegada = fechaLlegada;
    if (precio) updates.precio_monedas = precio;

    const { data, error } = await supabase
      .from('vuelos')
      .update(updates)
      .eq('id', vueloId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async crearReserva(usuarioId, vueloId, monto, datosPasajero) {
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
        estado: 'Confirmado',
        datos_pasajero: datosPasajero
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

    const { data: user, error: userErr } = await supabase
      .from('usuarios')
      .select('saldo_monedas')
      .eq('id', usuarioId)
      .single();
    if (userErr || !user) throw new Error('Usuario no encontrado.');

    if (parseFloat(user.saldo_monedas) < parseFloat(monto)) {
      throw new Error('Saldo insuficiente.');
    }

    const nuevoSaldo = parseFloat(user.saldo_monedas) - parseFloat(monto);
    const { error: updateErr } = await supabase
      .from('usuarios')
      .update({ saldo_monedas: nuevoSaldo })
      .eq('id', usuarioId);
    if (updateErr) throw updateErr;

    const { data: reserva, error: resErr } = await supabase
      .from('reservas')
      .insert([{ usuario_id: usuarioId, vuelo_id: vueloId, monto_pagado: monto, estado: 'Confirmado', datos_pasajero: datosPasajero }])
      .select()
      .single();
    if (resErr) throw resErr;

    const { error: txErr } = await supabase
      .from('transacciones')
      .insert([{ usuario_id: usuarioId, tipo: 'Compra Vuelo', monto: -monto, descripcion: `Reserva de vuelo ID ${vueloId}` }]);
    if (txErr) throw txErr;

    return reserva;
  },

  async getReservasUsuario(usuarioId) {
    if (useMock) {
      return mockDb.reservas
        .filter(r => r.usuario_id === Number(usuarioId))
        .map(r => {
          const vuelo = mockDb.vuelos.find(v => v.id === r.vuelo_id);
          return {
            ...r,
            vuelo
          };
        });
    }
    const { data, error } = await supabase
      .from('reservas')
      .select('*, vuelo:vuelos(*)')
      .eq('usuario_id', usuarioId);
    if (error) throw error;
    return data;
  },

  // --- PARKING ---
  async getParkingSlots() {
    if (useMock) {
      return Object.values(mockDb.parking);
    }
    const { data, error } = await supabase
      .from('parking_slots')
      .select('*');
    if (error) throw error;
    return data;
  },

  async actualizarTarifaParking(nuevaTarifa) {
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

    const { data: user, error: userErr } = await supabase
      .from('usuarios')
      .select('saldo_monedas')
      .eq('id', usuarioId)
      .single();
    if (userErr || !user) throw new Error('Usuario no encontrado o inexistente.');
    if (parseFloat(user.saldo_monedas) < tarifa) {
      throw new Error('Saldo insuficiente para el primer día de parking.');
    }

    const { data: slot, error: slotErr } = await supabase
      .from('parking_slots')
      .select('*')
      .eq('identificador_plaza', plazaId)
      .single();
    if (slotErr || !slot) throw new Error('Plaza no encontrada.');
    if (slot.estado === 'Ocupado') throw new Error('La plaza ya está ocupada.');

    const nuevoSaldo = parseFloat(user.saldo_monedas) - tarifa;
    const { error: updateU } = await supabase
      .from('usuarios')
      .update({ saldo_monedas: nuevoSaldo })
      .eq('id', usuarioId);
    if (updateU) throw updateU;

    const { data: updatedSlot, error: updateSlotErr } = await supabase
      .from('parking_slots')
      .update({
        estado: 'Ocupado',
        usuario_id: usuarioId,
        fecha_entrada: new Date().toISOString(),
        ultimo_cargo: new Date().toISOString()
      })
      .eq('identificador_plaza', plazaId)
      .select()
      .single();
    if (updateSlotErr) throw updateSlotErr;

    const { error: txErr } = await supabase
      .from('transacciones')
      .insert([{
        usuario_id: usuarioId,
        tipo: 'Reserva Parking',
        monto: -tarifa,
        descripcion: `Cargo inicial de entrada - Plaza ${plazaId}`
      }]);
    if (txErr) throw txErr;

    return updatedSlot;
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
    const { data, error } = await supabase
      .from('parking_slots')
      .select('*')
      .eq('identificador_plaza', plazaId)
      .eq('usuario_id', usuarioId)
      .maybeSingle();
    if (error || !data) {
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
      slot.estado = 'Libre';
      slot.usuario_id = null;
      slot.fecha_entrada = null;
      slot.ultimo_cargo = null;
      return { success: true, message: 'Salida exitosa y plaza liberada.' };
    }
    const { data, error } = await supabase
      .from('parking_slots')
      .update({
        estado: 'Libre',
        usuario_id: null,
        fecha_entrada: null,
        ultimo_cargo: null
      })
      .eq('identificador_plaza', plazaId)
      .eq('usuario_id', usuarioId)
      .select()
      .maybeSingle();
    if (error || !data) {
      throw new Error('No se pudo validar la salida o el usuario no está al día.');
    }
    return { success: true, message: 'Salida exitosa y plaza liberada.' };
  },

  // --- MONGO DB MOCKS / WRAPPERS ---
  async registrarBusqueda(searchRecord) {
    if (useMongo) {
      try {
        const doc = new SearchHistory(searchRecord);
        await doc.save();
      } catch (err) {
        console.error('Error al registrar búsqueda en MongoDB:', err.message);
      }
    } else {
      mockDb.searchHistory.push({
        _id: 'mock_search_' + Date.now(),
        ...searchRecord,
        timestamp: new Date().toISOString()
      });
    }
  },

  async getHistorialBusquedas() {
    if (useMongo) {
      try {
        return await SearchHistory.find().lean();
      } catch (err) {
        console.error('Error al obtener búsquedas de MongoDB:', err.message);
        return [];
      }
    }
    return mockDb.searchHistory;
  },

  async registrarEscalacion(incidencia) {
    if (useMongo) {
      try {
        const doc = new TicketEscalation(incidencia);
        await doc.save();
      } catch (err) {
        console.error('Error al registrar escalación en MongoDB:', err.message);
      }
    } else {
      mockDb.ticketEscalations.push(incidencia);
    }
  },

  async getEscalaciones() {
    if (useMongo) {
      try {
        return await TicketEscalation.find().lean();
      } catch (err) {
        console.error('Error al obtener incidencias de MongoDB:', err.message);
        return [];
      }
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

    if (useMongo) {
      try {
        await TicketEscalation.updateOne(
          { ticket_codigo: ticketId },
          {
            $set: { estado_actual: nuevoEstado },
            $push: { historial_estados: logItem }
          }
        );
      } catch (err) {
        console.error('Error al actualizar estado de escalación en MongoDB:', err.message);
      }
    } else {
      const ticket = mockDb.ticketEscalations.find(t => t.ticket_codigo === ticketId);
      if (ticket) {
        ticket.estado_actual = nuevoEstado;
        ticket.historial_estados.push(logItem);
      }
    }
  }
};

db.useMock = useMock;
db.useMongo = useMongo;

module.exports = db;
