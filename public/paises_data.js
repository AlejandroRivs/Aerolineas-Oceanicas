window.COORDENADAS_CIUDADES = {
  "Cancún": [21.1619, -86.8515],
  "Ciudad de México": [19.4326, -99.1332],
  "Guadalajara": [20.6597, -103.3496],
  "Los Cabos": [22.8905, -109.9167],
  "Oaxaca": [17.0732, -96.7266],
  "Guanajuato": [21.019, -101.2574],
  "Playa del Carmen": [20.6296, -87.0739],
  "Mérida": [8.5983, -71.1449],
  "Monterrey": [25.6866, -100.3161],
  "San Pedro de Atacama": [-22.911, -68.1991],
  "Valparaíso": [-33.0472, -71.6127],
  "San Alfonso del Mar": [-33.3512, -71.6528],
  "Pucón": [-39.273, -71.9774],
  "Santiago": [-33.4489, -70.6693],
  "Torres del Paine": [-50.9423, -72.9344],
  "Bogotá": [4.711, -74.0721],
  "Cali": [3.4516, -76.532],
  "Leticia": [-4.2153, -69.9406],
  "Medellín": [6.2442, -75.5812],
  "Cartagena": [10.391, -75.4794],
  "Santa Marta": [11.2408, -74.199],
  "San Andrés": [12.5847, -81.7006],
  "Eje Cafetero": [4.6259, -75.7515],
  "Manaos": [-3.119, -60.0217],
  "Búzios": [-22.7558, -41.8878],
  "Río de Janeiro": [-22.9068, -43.1729],
  "Foz do Iguaçu": [-25.5478, -54.5881],
  "Fernando de Noronha": [-3.8548, -32.4234],
  "Natal": [-5.7945, -35.211],
  "Lençóis Maranhenses": [-2.4855, -43.1206],
  "Ciudad del Este": [-25.5097, -54.6111],
  "Antigua Guatemala": [14.5611, -90.7344],
  "Flores": [16.93, -89.89],
  "Lago Atitlán": [14.6907, -91.2017],
  "Semuc Champey": [15.5562, -89.9602],
  "La Libertad": [13.4883, -89.3217],
  "Santa Ana": [13.9942, -89.5597],
  "Suchitoto": [13.9372, -89.0275],
  "Ruta de las Flores": [13.8441, -89.8242],
  "Copán Ruinas": [14.8394, -89.1558],
  "Roatán": [16.3262, -86.5381],
  "Tela": [15.7744, -87.4522],
  "Útila": [16.1004, -86.8973],
  "Quito": [-0.1807, -78.4678],
  "Islas Galápagos": [-0.8293, -90.9821],
  "Cuenca": [-2.9001, -79.0059],
  "Montañita": [-1.8278, -80.7525],
  "Tena": [-0.9938, -77.8129],
  "León": [12.4379, -86.878],
  "Granada": [12.1264, -85.9575],
  "San Juan del Sur": [11.2529, -85.8703],
  "Isla de Ometepe": [11.5034, -85.6033],
  "Mendoza": [-32.8895, -68.8458],
  "Salta": [-24.7821, -65.4232],
  "Bariloche": [-41.1335, -71.3103],
  "Ushuaia": [-54.8019, -68.303],
  "Puerto Madryn": [-42.7692, -65.0385],
  "Buenos Aires": [-34.6037, -58.3816],
  "El Calafate": [-50.3381, -72.2647],
  "Copacabana": [-16.1667, -69.0833],
  "Sucre": [-19.0353, -65.2627],
  "Uyuni": [-20.4597, -66.825],
  "La Paz": [-16.4897, -68.1193],
  "Toro Toro": [-18.1333, -65.7667],
  "Asunción": [-25.2637, -57.5759],
  "Encarnación": [-27.3306, -55.8667],
  "Colonia del Sacramento": [-34.4698, -57.8436],
  "Cabo Polonio": [-34.3986, -53.8139],
  "Punta del Este": [-34.9631, -54.944],
  "Punta del Diablo": [-34.0436, -53.5398],
  "San Blas": [9.5735, -78.932],
  "Bocas del Toro": [9.3403, -82.2423],
  "Chiriquí": [8.4333, -82.4333],
  "Ciudad de Panamá": [8.9824, -79.5199],
  "Portobelo": [9.5539, -79.6547],
  "Jacó": [9.615, -84.6297],
  "Manuel Antonio": [9.3888, -84.1481],
  "La Fortuna": [10.4678, -84.6427],
  "Tortuguero": [10.5414, -83.5025],
  "Huaraz": [-9.5278, -77.5278],
  "Cusco": [-13.532, -71.9675],
  "Iquitos": [-3.7437, -73.2516],
  "Ica": [-14.0678, -75.7286],
  "Paracas": [-13.7333, -76.2667],
  "Arequipa": [-16.409, -71.5375],
  "Líneas de Nazca": [-14.739, -75.13],
  "Lima": [-12.0464, -77.0428],
  "Los Roques": [11.9463, -66.6713],
  "Canaima": [6.2407, -62.8533],
  "Mérida (Venezuela)": [8.5983, -71.1449],
  "La Habana": [23.1136, -82.3666],
  "Varadero": [23.1537, -81.2514],
  "Santo Domingo": [18.4861, -69.9312],
  "Punta Cana": [18.5601, -68.3725],
  "República Dominicana": [18.5601, -68.3725],
  "Dominica": [18.4861, -69.9312]
};

window.getCoords = (cityName) => {
  if (!cityName) return [0, 0];
  const cleanName = cityName.trim();
  if (window.COORDENADAS_CIUDADES[cleanName]) return window.COORDENADAS_CIUDADES[cleanName];
  const partBeforeComma = cleanName.split(',')[0].trim();
  if (window.COORDENADAS_CIUDADES[partBeforeComma]) return window.COORDENADAS_CIUDADES[partBeforeComma];
  return [0, 0];
};

window.PAISES_DATA = {
  "México": {
    color: "#059669",
    destinos: [
      { nombre: "Cancún", ciudad: "Cancún", categoria: "Playa", desc: "Playas caribeñas de agua turquesa." },
      { nombre: "Teotihuacán", ciudad: "Bogotá", categoria: "Cultura", desc: "Pirámides ancestrales del Sol y la Luna." },
      { nombre: "San Miguel de Allende", ciudad: "Cancún", categoria: "Cultura", desc: "Pueblo mágico con hermosa arquitectura colonial." }
    ],
    vuelos: [
      { id: 601, codigo_vuelo: 'OC-601', origen: 'San José, CR', destino_pais: 'México', destino_ciudad: 'Cancún', fecha_salida: '2026-07-11T12:00:00Z', fecha_llegada: '2026-07-11T14:30:00Z', duracion: 150, precio: 1100 }
    ],
    path: "M 30,120 L 70,80 L 130,100 L 180,120 L 200,150 L 175,170 C 160,165 140,160 120,155 L 95,170 C 85,175 70,160 60,140 Z"
  },
  "Colombia": {
    color: "#eab308",
    destinos: [
      { nombre: "Santuario de Las Lajas", ciudad: "Bogotá", categoria: "Montaña", desc: "Una joya arquitectónica construida sobre un cañón." },
      { nombre: "Parque Nacional Natural Tayrona", ciudad: "Bogotá", categoria: "Playa", desc: "Bahías de arena blanca rodeadas de selva tropical." },
      { nombre: "Catedral de Sal de Zipaquirá", ciudad: "Bogotá", categoria: "Cultura", desc: "Una iglesia subterránea tallada completamente en sal." }
    ],
    vuelos: [
      { id: 101, codigo_vuelo: 'OC-101', origen: 'Ciudad de México, MX', destino_pais: 'Colombia', destino_ciudad: 'Bogotá', fecha_salida: '2026-07-06T08:00:00Z', fecha_llegada: '2026-07-06T12:30:00Z', duracion: 270, precio: 1200 },
      { id: 301, codigo_vuelo: 'OC-301', origen: 'Buenos Aires, AR', destino_pais: 'Colombia', destino_ciudad: 'Medellín', fecha_salida: '2026-07-08T07:00:00Z', fecha_llegada: '2026-07-08T12:30:00Z', duracion: 390, precio: 2100 }
    ],
    path: "M 175,225 C 190,210 205,215 215,220 L 230,240 C 220,255 210,265 195,265 L 180,250 Z"
  },
  "Chile": {
    color: "#ef4444",
    destinos: [
      { nombre: "Torres del Paine", ciudad: "Santiago", categoria: "Montaña", desc: "Imponentes montañas y glaciares en la Patagonia chilena." },
      { nombre: "Desierto de Atacama", ciudad: "Santiago", categoria: "Montaña", desc: "El desierto no polar más árido de la Tierra." },
      { nombre: "Isla de Pascua", ciudad: "Santiago", categoria: "Cultura", desc: "Famosa por sus enigmáticas estatuas de piedra Moái." }
    ],
    vuelos: [
      { id: 102, codigo_vuelo: 'OC-102', origen: 'Ciudad de México, MX', destino_pais: 'Chile', destino_ciudad: 'Santiago', fecha_salida: '2026-07-06T14:00:00Z', fecha_llegada: '2026-07-06T22:30:00Z', duracion: 510, precio: 2400 },
      { id: 401, codigo_vuelo: 'OC-401', origen: 'Río de Janeiro, BR', destino_pais: 'Chile', destino_ciudad: 'Santiago', fecha_salida: '2026-07-09T15:00:00Z', fecha_llegada: '2026-07-09T19:30:00Z', duracion: 330, precio: 1900 }
    ],
    path: "M 180,380 L 190,380 L 188,440 L 182,500 L 175,560 L 168,560 L 174,480 Z"
  },
  "Perú": {
    color: "#a855f7",
    destinos: [
      { nombre: "Machu Picchu", ciudad: "Cusco", categoria: "Montaña", desc: "La legendaria ciudadela inca en las alturas de los Andes." },
      { nombre: "Líneas de Nazca", ciudad: "Lima", categoria: "Cultura", desc: "Geoglifos antiguos grabados en las arenas del desierto." },
      { nombre: "Lago Titicaca", ciudad: "Cusco", categoria: "Montaña", desc: "El lago navegable más alto del mundo." }
    ],
    vuelos: [
      { id: 103, codigo_vuelo: 'OC-103', origen: 'Ciudad de México, MX', destino_pais: 'Perú', destino_ciudad: 'Lima', fecha_salida: '2026-07-06T09:30:00Z', fecha_llegada: '2026-07-06T15:45:00Z', duracion: 375, precio: 1800 },
      { id: 302, codigo_vuelo: 'OC-302', origen: 'Santiago, CL', destino_pais: 'Perú', destino_ciudad: 'Cusco', fecha_salida: '2026-07-08T13:00:00Z', fecha_llegada: '2026-07-08T16:30:00Z', duracion: 270, precio: 1600 }
    ],
    path: "M 160,250 L 185,270 L 205,290 C 190,310 185,330 170,345 L 150,305 C 155,285 160,265 160,250 Z"
  },
  "Brasil": {
    color: "#3b82f6",
    destinos: [
      { nombre: "Cristo Redentor", ciudad: "Río de Janeiro", categoria: "Cultura", desc: "Estatua icónica que corona el cerro del Corcovado." },
      { nombre: "Cataratas del Iguazú", ciudad: "Río de Janeiro", categoria: "Montaña", desc: "Uno de los sistemas de cascadas más grandes del mundo." },
      { nombre: "Playa de Copacabana", ciudad: "Río de Janeiro", categoria: "Playa", desc: "Famosa playa en forma de media luna en Río de Janeiro." }
    ],
    vuelos: [
      { id: 201, codigo_vuelo: 'OC-201', origen: 'Bogotá, CO', destino_pais: 'Brasil', destino_ciudad: 'Río de Janeiro', fecha_salida: '2026-07-07T10:00:00Z', fecha_llegada: '2026-07-07T18:30:00Z', duracion: 390, precio: 2200 }
    ],
    path: "M 220,220 C 245,215 285,225 320,245 C 330,270 335,290 310,335 C 285,370 255,360 230,330 C 210,310 212,285 220,220 Z"
  },
  "Argentina": {
    color: "#06b6d4",
    destinos: [
      { nombre: "Glaciar Perito Moreno", ciudad: "Buenos Aires", categoria: "Montaña", desc: "Impresionante pared de hielo en la Patagonia." },
      { nombre: "Bariloche", ciudad: "Buenos Aires", categoria: "Montaña", desc: "Lagos cristalinos y montañas ideales para esquí." },
      { nombre: "Cataratas del Iguazú", ciudad: "Buenos Aires", categoria: "Montaña", desc: "Maravillosa vista de las cataratas compartidas con Brasil." }
    ],
    vuelos: [
      { id: 202, codigo_vuelo: 'OC-202', origen: 'Lima, PE', destino_pais: 'Argentina', destino_ciudad: 'Buenos Aires', fecha_salida: '2026-07-07T11:00:00Z', fecha_llegada: '2026-07-07T16:30:00Z', duracion: 270, precio: 1500 }
    ],
    path: "M 190,380 L 225,380 L 220,440 L 200,520 L 180,560 L 178,500 L 188,440 Z"
  },
  "Costa Rica": {
    color: "#f97316",
    destinos: [
      { nombre: "Volcán Arenal", ciudad: "San José", categoria: "Montaña", desc: "Volcán activo rodeado de aguas termales." },
      { nombre: "Parque Manuel Antonio", ciudad: "San José", categoria: "Playa", desc: "Playas paradisíacas con abundancia de perezosos y monos." },
      { nombre: "Monteverde", ciudad: "San José", categoria: "Montaña", desc: "Reserva de bosque nuboso y tirolesas gigantes." }
    ],
    vuelos: [
      { id: 501, codigo_vuelo: 'OC-501', origen: 'Bogotá, CO', destino_pais: 'Costa Rica', destino_ciudad: 'San José', fecha_salida: '2026-07-10T09:00:00Z', fecha_llegada: '2026-07-10T11:15:00Z', duracion: 135, precio: 950 }
    ],
    path: "M 135,175 L 165,185 L 160,200 L 140,215 L 130,195 Z"
  }
};
