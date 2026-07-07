const { useState, useEffect, useRef } = React;

const COORDENADAS_CIUDADES = {
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
  "Dominica": [18.4861, -69.9312],
};;

const getCoords = (cityName) => {
  if (!cityName) return [0, 0];
  const cleanName = cityName.trim();
  if (COORDENADAS_CIUDADES[cleanName]) return COORDENADAS_CIUDADES[cleanName];
  const partBeforeComma = cleanName.split(',')[0].trim();
  if (COORDENADAS_CIUDADES[partBeforeComma]) return COORDENADAS_CIUDADES[partBeforeComma];
  return [0, 0];
};

// Mapa de colores e información de países con coordenadas SVG realistas
const PAISES_DATA = {
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
    // Trazado de mapa realista de México
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
    // Trazado de mapa realista de Colombia
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
    // Trazado de mapa realista de Chile (delgada faja costera)
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
    // Trazado de mapa realista de Perú
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
    // Trazado de mapa realista de Brasil
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
    // Trazado de mapa realista de Argentina
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
    // Trazado de mapa realista de Costa Rica (Centroamérica)
    path: "M 135,175 L 165,185 L 160,200 L 140,215 L 130,195 Z"
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("mapa");

  // Estados de Vuelos y Mapa
  const [vuelos, setVuelos] = useState([]);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null); // Nuevo estado de filtro por destino interactivo
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [filtroPresupuesto, setFiltroPresupuesto] = useState("");
  const [filtroGusto, setFiltroGusto] = useState("");
  const [filtroTiempo, setFiltroTiempo] = useState("");
  const [filtroNoVisitados, setFiltroNoVisitados] = useState(false);

  // Estados de Parking
  const [parkingSlots, setParkingSlots] = useState([]);
  const [tarifaParking, setTarifaParking] = useState(20);
  const [nuevaTarifaInput, setNuevaTarifaInput] = useState("");
  const [qrStep, setQrStep] = useState(1); // 1: Entrada, 2: Plaza, 3: Salida
  const [selectedParkingSlot, setSelectedParkingSlot] = useState("");
  const [parkingStatusMsg, setParkingStatusMsg] = useState("");
  const [myOcupation, setMyOcupation] = useState(null);

  // Estados de Incidencias
  const [incidencias, setIncidencias] = useState([]);
  const [nuevaIncidenciaText, setNuevaIncidenciaText] = useState("");
  const [incidenciaMsg, setIncidenciaMsg] = useState("");
  const [escalarComentario, setEscalarComentario] = useState("");
  const [activeTicketForEscalation, setActiveTicketForEscalation] = useState("");

  // Referencias para el Mapa de Leaflet
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({ markers: {}, routes: [] });

  useEffect(() => {
    // Si no estamos en la pestaña del mapa o no existe el ref del contenedor DOM, limpiar todo
    if (activeTab !== "mapa" || !mapRef.current) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    // Inicializar mapa si no existe
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [-15, -62],
        zoom: 3.2,
        zoomControl: true,
      });

      // Capa premium oscura (CartoDB Dark Matter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const mapInstance = mapInstanceRef.current;

    // Limpiar marcadores y polilíneas anteriores
    Object.values(layersRef.current.markers).forEach(marker => mapInstance.removeLayer(marker));
    layersRef.current.routes.forEach(route => mapInstance.removeLayer(route));
    layersRef.current.markers = {};
    layersRef.current.routes = [];

    // Determinar qué vuelos mostrar (resultados filtrados o todos si no se ha buscado)
    const vuelosAMostrar = resultadosBusqueda && resultadosBusqueda.length > 0 ? resultadosBusqueda : vuelos;

    // Pintar los vuelos y conectar ciudades
    vuelosAMostrar.forEach(v => {
      const originCoords = getCoords(v.origen);
      const destCoords = getCoords(v.destino_ciudad);

      if (originCoords[0] === 0 || destCoords[0] === 0) return;

      // 1. Agregar o recuperar marcador de Origen
      const originKey = `origin-${v.origen}`;
      if (!layersRef.current.markers[originKey]) {
        const originIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div class="marker-pin origin" title="${v.origen}"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        const m = L.marker(originCoords, { icon: originIcon }).addTo(mapInstance);
        m.bindTooltip(`<b>Origen:</b> ${v.origen}`, { permanent: false, direction: 'top' });
        layersRef.current.markers[originKey] = m;
      }

      // 2. Agregar o recuperar marcador de Destino
      const destKey = `dest-${v.destino_ciudad}`;
      if (!layersRef.current.markers[destKey]) {
        const destIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div class="marker-pin" title="${v.destino_ciudad}"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        const m = L.marker(destCoords, { icon: destIcon }).addTo(mapInstance);
        
        // Habilitar selección de país al hacer click en el marcador
        m.on('click', () => {
          setSelectedCountry(v.destino_pais);
        });

        m.bindTooltip(`<b>Destino:</b> ${v.destino_ciudad} (${v.destino_pais})`, { permanent: false, direction: 'top' });
        layersRef.current.markers[destKey] = m;
      }

      // 3. Dibujar ruta aérea (línea)
      const polyline = L.polyline([originCoords, destCoords], {
        color: '#06b6d4',
        weight: 2,
        opacity: 0.6,
        dashArray: '5, 5',
        lineCap: 'round'
      }).addTo(mapInstance);

      // Crear Popup interactivo en la ruta
      const popupContent = `
        <div class="space-y-3 text-slate-100 min-w-[200px]">
          <div class="flex justify-between items-center">
            <span class="bg-blue-900/50 border border-blue-700 text-blue-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
              ${v.codigo_vuelo}
            </span>
            <span class="text-[10px] text-slate-400 font-bold">${new Date(v.fecha_salida).toLocaleDateString()}</span>
          </div>
          <div>
            <h4 class="font-extrabold text-sm text-white">${v.destino_ciudad}</h4>
            <p class="text-[10px] text-slate-400">Origen: ${v.origen}</p>
            <p class="text-[10px] text-emerald-400 font-bold mt-1">Precio: ${parseFloat(v.precio_monedas || v.precio).toLocaleString()} MO</p>
            <p class="text-[9px] text-slate-400">Asientos: ${v.asientos_disponibles || 0}</p>
          </div>
          <button 
            id="book-btn-${v.id}"
            class="w-full mt-2 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-lg text-xs transition duration-150 shadow-md"
          >
            Reservar Vuelo
          </button>
        </div>
      `;

      polyline.bindPopup(popupContent);
      layersRef.current.routes.push(polyline);
    });

    // Escuchar el evento de apertura de popups para enlazar el click del botón de reservar
    const handlePopupOpen = (e) => {
      const popup = e.popup;
      if (!popup) return;
      
      const matches = popup.getContent().match(/id="book-btn-(\d+)"/);
      if (matches && matches[1]) {
        const vueloId = Number(matches[1]);
        const btn = document.getElementById(`book-btn-${vueloId}`);
        if (btn) {
          btn.onclick = () => {
            handleBookFlight(vueloId);
            mapInstance.closePopup();
          };
        }
      }
    };

    mapInstance.on('popupopen', handlePopupOpen);

    return () => {
      mapInstance.off('popupopen', handlePopupOpen);
    };

  }, [activeTab, resultadosBusqueda, vuelos]);

  // Cargar sesión al iniciar
  useEffect(() => {
    fetchSession();
    fetchVuelos();
    fetchParking();
    fetchIncidencias();
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.loggedIn) {
        setUser(data.user);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchVuelos = async () => {
    try {
      const res = await fetch('/api/vuelos');
      const data = await res.json();
      setVuelos(data);
      setResultadosBusqueda(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchParking = async () => {
    try {
      const res = await fetch('/api/parking/slots');
      const data = await res.json();
      setParkingSlots(data.slots || []);
      setTarifaParking(data.tarifa || 20);
      
      if (user) {
        const mySlot = (data.slots || []).find(s => s.usuario_id === user.id && s.estado === 'Ocupado');
        setMyOcupation(mySlot || null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchIncidencias = async () => {
    try {
      const res = await fetch('/api/incidencias');
      const data = await res.json();
      setIncidencias(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) {
      const mySlot = parkingSlots.find(s => s.usuario_id === user.id && s.estado === 'Ocupado');
      setMyOcupation(mySlot || null);
    }
  }, [user, parkingSlots]);

  // Manejador de Login de simulación
  const handleLogin = async (roleEmail) => {
    try {
      const res = await fetch('/api/auth/mock-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: roleEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        fetchParking();
        fetchIncidencias();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGoogleLoginSimulated = async () => {
    const tokenSimulado = Math.random().toString(36).substring(2);
    const email = prompt("Ingrese su correo de Google simulado:", "viajero@gmail.com");
    if (!email) return;
    const name = email.split('@')[0];
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenSimulado, email, name, picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}` })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        alert(`¡Bono de Bienvenida Inyectado! Has recibido 5,000 Monedas Oceánicas.`);
        fetchParking();
        fetchIncidencias();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setMyOcupation(null);
  };

  // Búsqueda inteligente de vuelos
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/vuelos/buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presupuesto: filtroPresupuesto,
          gusto: filtroGusto,
          tiempoDisponible: filtroTiempo,
          soloNoVisitados: filtroNoVisitados
        })
      });
      const data = await res.json();
      setResultadosBusqueda(data);
      setBusquedaRealizada(true);
    } catch (e) {
      console.error(e);
    }
  };

  // Reservar Vuelo
  const handleBookFlight = async (vueloId) => {
    if (!user) {
      alert("Por favor inicia sesión primero.");
      return;
    }
    try {
      const res = await fetch('/api/vuelos/reservar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vueloId })
      });
      const data = await res.json();
      if (res.ok) {
        alert("¡Vuelo reservado con éxito!");
        fetchSession();
        fetchVuelos();
        setSelectedCountry(null);
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Simulación de Parking QR
  const handleQRAction = async () => {
    if (!user) {
      alert("Inicie sesión primero.");
      return;
    }
    
    try {
      if (qrStep === 1) {
        if (!selectedParkingSlot) {
          alert("Seleccione una plaza para simular el escaneo.");
          return;
        }
        const res = await fetch('/api/parking/qr-entrada', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plazaId: selectedParkingSlot })
        });
        const data = await res.json();
        if (res.ok) {
          setParkingStatusMsg(`Paso 1 Completado: Auto ingresado en la plaza ${selectedParkingSlot}. Cobro inicial de ${tarifaParking} MO realizado.`);
          setQrStep(2);
          fetchParking();
          fetchSession();
        } else {
          alert(data.error);
        }
      } else if (qrStep === 2) {
        const res = await fetch('/api/parking/qr-plaza', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plazaId: selectedParkingSlot })
        });
        const data = await res.json();
        if (res.ok) {
          setParkingStatusMsg(`Paso 2 Completado: ${data.message} Listo para cuando decida salir.`);
          setQrStep(3);
        } else {
          alert(data.error);
        }
      } else if (qrStep === 3) {
        const res = await fetch('/api/parking/qr-salida', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plazaId: selectedParkingSlot })
        });
        const data = await res.json();
        if (res.ok) {
          setParkingStatusMsg(`Paso 3 Completado: Salida autorizada. Plaza liberada con éxito.`);
          setQrStep(1);
          setSelectedParkingSlot("");
          setMyOcupation(null);
          fetchParking();
        } else {
          alert(data.error);
        }
      }
    } catch (e) {
      alert("Error en el flujo QR: " + e.message);
    }
  };

  // Simular cobros automáticos de medianoche (00:00 AM)
  const handleSimulateMidnight = async () => {
    try {
      const res = await fetch('/api/parking/simulate-midnight', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert("Simulación de 00:00 AM ejecutada. Los cargos de parking diarios han sido procesados en el servidor.");
        fetchParking();
        fetchSession();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Actualizar tarifa del parking (Gerente/Admin)
  const handleUpdateTarifa = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/parking/tarifa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tarifa: nuevaTarifaInput })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Tarifa diaria actualizada con éxito a ${data.tarifa} MO.`);
        fetchParking();
        setNuevaTarifaInput("");
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Crear reporte de soporte
  const handleCrearIncidencia = async (e) => {
    e.preventDefault();
    if (!nuevaIncidenciaText.trim()) return;
    try {
      const res = await fetch('/api/incidencias/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion: nuevaIncidenciaText })
      });
      const data = await res.json();
      if (res.ok) {
        setNuevaIncidenciaText("");
        setIncidenciaMsg("Caso reportado con éxito.");
        fetchIncidencias();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Escalar caso (Servicio / Gerente)
  const handleEscalarIncidencia = async (e) => {
    e.preventDefault();
    if (!escalarComentario.trim()) return;
    try {
      const res = await fetch('/api/incidencias/escalar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCodigo: activeTicketForEscalation, comentario: escalarComentario })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Incidencia escalada con éxito a: ${data.nuevoEstado}`);
        setEscalarComentario("");
        setActiveTicketForEscalation("");
        fetchIncidencias();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Cambiar rol de usuario (Administrador)
  const handleCambiarRol = async (usuarioId, nuevoRol) => {
    try {
      const res = await fetch('/api/usuarios/rol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId, nuevoRol })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Rol actualizado correctamente.");
        fetchSession();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Algoritmo de Tiempo Neto de Estancia
  const getStayDetails = (duracionMinutos) => {
    if (!filtroTiempo) return null;
    const totalMinutos = parseFloat(filtroTiempo) * 60;
    const vueloMinutos = duracionMinutos * 2; // ida y vuelta
    const netoMinutos = totalMinutos - vueloMinutos;
    const netoHoras = (netoMinutos / 60).toFixed(1);
    
    const ratio = (vueloMinutos / totalMinutos) * 100;
    const tieneAdvertencia = ratio > 40;

    return {
      horas: netoHoras,
      porcentaje: ratio.toFixed(0),
      advertencia: tieneAdvertencia
    };
  };

  // Filtrado de vuelos dentro del Modal por Destino específico
  const getVuelosParaMostrarEnModal = () => {
    if (!selectedCountry) return [];
    
    // Filtrar vuelos que coincidan con el país
    let filtered = vuelos.filter(v => v.destino_pais === selectedCountry);

    // Si hay un destino turístico específico seleccionado, filtrar por la ciudad de ese destino
    if (selectedDestination) {
      const destObj = PAISES_DATA[selectedCountry]?.destinos.find(d => d.nombre === selectedDestination);
      if (destObj) {
        filtered = filtered.filter(v => 
          v.destino_ciudad.toLowerCase().includes(destObj.ciudad.toLowerCase()) ||
          destObj.ciudad.toLowerCase().includes(v.destino_ciudad.toLowerCase())
        );
      }
    }
    return filtered;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-slate-50">
        <div className="w-12 h-12 border-4 border-[#162b4e] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#162b4e] font-semibold">Cargando Plataforma...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Barra de Navegación Superior */}
      <header className="bg-[#162b4e] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-extrabold text-lg text-[#162b4e] shadow-md">
            AO
          </div>
          <div>
            <span className="font-extrabold text-lg block tracking-wide text-white leading-tight">AEROLÍNEAS OCEÁNICAS</span>
            <span className="text-xs text-blue-200 font-medium tracking-wider uppercase">Plataforma Aeroportuaria</span>
          </div>
        </div>

        {/* Estatus del Usuario */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <span className="font-bold text-sm block text-white">{user.nombre}</span>
                <div className="flex items-center justify-end space-x-2">
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold border border-white/10">
                    {user.rol}
                  </span>
                  <span className="font-bold text-xs text-emerald-300">
                    💰 {parseFloat(user.saldo).toLocaleString()} MO
                  </span>
                </div>
              </div>
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.nombre}`} 
                alt="Avatar" 
                className="w-10 h-10 rounded-xl border border-white/20 bg-slate-900 shadow-sm"
              />
              <button 
                onClick={handleLogout}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition duration-150 shadow"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleGoogleLoginSimulated}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-[#162b4e] font-bold rounded-xl transition duration-150 text-xs shadow-md flex items-center space-x-2 border border-slate-200"
              >
                <svg className="w-4 h-4 fill-current text-rose-500" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V13.4h6.887c-.648 2.41-2.519 4.113-5.136 4.113-3.44 0-6.228-2.77-6.228-6.19 0-3.42 2.787-6.19 6.228-6.19 1.493 0 2.87.52 3.96 1.488l2.45-2.45c-1.724-1.616-3.99-2.6-6.41-2.6C7.14 1.666 3 5.807 3 10.909c0 5.103 4.14 9.243 9.24 9.243 5.34 0 9.07-3.754 9.07-9.224 0-.61-.065-1.196-.183-1.643H12.24z"/>
                </svg>
                <span>Acceder con Google</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Tabs / Menú Lateral y Contenedor Principal */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Barra Lateral de Navegación */}
        <aside className="w-full md:w-64 border-r border-slate-200 bg-white p-6 space-y-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#162b4e] block mb-4">Menú de Navegación</span>
            
            <button 
              onClick={() => setActiveTab("mapa")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition duration-150 ${
                activeTab === "mapa" ? "bg-slate-100 text-[#162b4e] border-l-4 border-[#162b4e] shadow-sm" : "hover:bg-slate-50 text-slate-600 hover:text-[#162b4e]"
              }`}
            >
              <i data-lucide="map" className="w-4 h-4 text-[#162b4e]"></i>
              <span>Mapa & Vuelos</span>
            </button>

            <button 
              onClick={() => setActiveTab("parking")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition duration-150 ${
                activeTab === "parking" ? "bg-slate-100 text-[#162b4e] border-l-4 border-[#162b4e] shadow-sm" : "hover:bg-slate-50 text-slate-600 hover:text-[#162b4e]"
              }`}
            >
              <i data-lucide="square-parking" className="w-4 h-4 text-[#162b4e]"></i>
              <span>Aparcamiento QR</span>
            </button>

            <button 
              onClick={() => setActiveTab("incidencias")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition duration-150 ${
                activeTab === "incidencias" ? "bg-slate-100 text-[#162b4e] border-l-4 border-[#162b4e] shadow-sm" : "hover:bg-slate-50 text-slate-600 hover:text-[#162b4e]"
              }`}
            >
              <i data-lucide="ticket" className="w-4 h-4 text-[#162b4e]"></i>
              <span>Soporte / Escalación</span>
            </button>

            {user && user.rol === 'Administrador' && (
              <button 
                onClick={() => setActiveTab("admin")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition duration-150 ${
                  activeTab === "admin" ? "bg-slate-100 text-[#162b4e] border-l-4 border-[#162b4e] shadow-sm" : "hover:bg-slate-50 text-slate-600 hover:text-[#162b4e]"
                }`}
              >
                <i data-lucide="shield" className="w-4 h-4 text-[#162b4e]"></i>
                <span>Consola Admin</span>
              </button>
            )}
          </div>

          {/* Selector de Roles Simulado */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Simulador de Roles (RBAC)</span>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handleLogin('cliente@oceanica.com')} className="px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold shadow-sm">Cliente</button>
              <button onClick={() => handleLogin('servicio@oceanica.com')} className="px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold shadow-sm">Servicio</button>
              <button onClick={() => handleLogin('gerente@oceanica.com')} className="px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold shadow-sm">Gerente</button>
              <button onClick={() => handleLogin('admin@oceanica.com')} className="px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold shadow-sm">Admin</button>
            </div>
          </div>
        </aside>

        {/* Área de Contenido Principal */}
        <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto">
          
          {/* TAB 1: MAPA INTERACTIVO Y VUELOS */}
          {activeTab === "mapa" && (
            <div className="space-y-8">
              
              {/* Buscador y Mapa */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Formulario de Búsqueda */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-md flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-4 text-[#162b4e] flex items-center space-x-2">
                      <i data-lucide="sliders-horizontal" className="w-5 h-5 text-[#162b4e]"></i>
                      <span>Buscador Inteligente</span>
                    </h2>
                    <form onSubmit={handleSearch} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Presupuesto Máximo (MO)</label>
                        <input 
                          type="number" 
                          value={filtroPresupuesto}
                          onChange={e => setFiltroPresupuesto(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#162b4e] rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white"
                          placeholder="Ej. 2000"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Tiempo Disponible (Horas)</label>
                        <input 
                          type="number" 
                          value={filtroTiempo}
                          onChange={e => setFiltroTiempo(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#162b4e] rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white"
                          placeholder="Ej. 48"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Categoría / Gusto</label>
                        <select 
                          value={filtroGusto}
                          onChange={e => setFiltroGusto(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#162b4e] rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:bg-white"
                        >
                          <option value="">Cualquiera</option>
                          <option value="Playa">Playa</option>
                          <option value="Cultura">Cultura</option>
                          <option value="Montaña">Montaña</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-3 py-2">
                        <input 
                          type="checkbox" 
                          id="unvisited" 
                          checked={filtroNoVisitados}
                          onChange={e => setFiltroNoVisitados(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-white"
                        />
                        <label htmlFor="unvisited" className="text-xs font-medium text-slate-600 select-none">
                          Mostrar sólo destinos no visitados
                        </label>
                      </div>

                      <button 
                        type="submit" 
                        className="w-full py-3 bg-[#162b4e] hover:bg-[#0f1f3a] text-white font-bold rounded-xl transition duration-150 shadow-md"
                      >
                        Filtrar Destinos
                      </button>
                    </form>
                  </div>

                  {user && (
                    <div className="mt-6 pt-4 border-t border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Destinos Visitados por ti</span>
                      <div className="flex flex-wrap gap-1.5">
                        {user.ciudadesVisitadas && user.ciudadesVisitadas.length > 0 ? (
                          user.ciudadesVisitadas.map((city, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs text-slate-600">
                              ✓ {city}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">Ningún destino visitado aún.</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Mapa Interactivo Leaflet.js */}
                <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden relative min-h-[450px] flex">
                  <div ref={mapRef} className="w-full z-10" style={{ height: '450px', minHeight: '450px' }}></div>
                  <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-300 uppercase tracking-wider z-20 pointer-events-none shadow-md">
                    Rutas de Vuelo Interactivas
                  </div>
                </div>

              </div>

              {/* Resultados de Búsqueda Inteligente */}
              {busquedaRealizada && (
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-md space-y-4">
                  <h3 className="text-lg font-bold text-[#162b4e]">Resultados del Filtro Inteligente</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resultadosBusqueda.map((v) => {
                      const stay = getStayDetails(v.duracion_vuelo_minutos || v.duracion);
                      return (
                        <div key={v.id} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <span className="bg-blue-50 text-[#162b4e] border border-blue-200 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                                {v.codigo_vuelo}
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(v.fecha_salida).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="font-bold text-lg text-slate-800">{v.destino_ciudad} ({v.destino_pais})</h4>
                            <p className="text-xs text-slate-500 mt-1">Origen: {v.origen}</p>
                            
                            {stay && (
                              <div className="mt-4 p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                                <p className="text-xs text-emerald-600 font-bold">Estancia Estimada: {stay.horas} hrs</p>
                                <p className="text-[10px] text-slate-500">El vuelo consume {stay.porcentaje}% del tiempo total.</p>
                                {stay.advertencia && (
                                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-700 font-medium">
                                    ⚠️ El viaje aéreo consume gran parte de tu tiempo disponible. Alto riesgo por retrasos aeroportuarios.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-200/60">
                            <span className="font-extrabold text-[#162b4e] text-lg">{v.precio_monedas || v.precio} MO</span>
                            <button 
                              onClick={() => handleBookFlight(v.id)}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition duration-150"
                            >
                              Reservar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {resultadosBusqueda.length === 0 && (
                      <p className="text-slate-500 text-sm">No se encontraron vuelos que coincidan con sus filtros.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Modal de Detalle de País */}
              {selectedCountry && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-white border border-slate-200 w-full max-w-2xl p-8 rounded-3xl relative shadow-2xl space-y-6">
                    <button 
                      onClick={() => { setSelectedCountry(null); setSelectedDestination(null); }}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-2xl font-bold"
                    >
                      &times;
                    </button>
                    
                    <div>
                      <h3 className="text-2xl font-extrabold tracking-tight text-[#162b4e]">{selectedCountry}</h3>
                      <p className="text-xs text-slate-500">Haz clic en un destino turístico para filtrar los vuelos directos correspondientes.</p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Lugares Más Turísticos (Haz clic para seleccionar)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {PAISES_DATA[selectedCountry]?.destinos.map((dest, idx) => {
                          const isSelected = selectedDestination === dest.nombre;
                          return (
                            <div 
                              key={idx} 
                              onClick={() => setSelectedDestination(isSelected ? null : dest.nombre)}
                              className={`p-4 rounded-xl space-y-1 cursor-pointer transition-all duration-150 border ${
                                isSelected 
                                  ? 'bg-blue-50 border-blue-500 shadow-md ring-2 ring-blue-500/20' 
                                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                              }`}
                            >
                              <span className="text-[10px] uppercase font-bold text-blue-600">{dest.categoria}</span>
                              <h5 className="font-bold text-sm text-slate-800">{dest.nombre}</h5>
                              <p className="text-[10px] text-slate-500 leading-normal">{dest.desc}</p>
                              {isSelected && <span className="text-[9px] text-blue-600 font-bold block mt-1">✓ Destino Seleccionado</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {selectedDestination ? `Vuelos Disponibles a ${selectedDestination}` : `Todos los Vuelos a ${selectedCountry}`}
                      </h4>
                      <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                        {getVuelosParaMostrarEnModal().map((v) => {
                          const stay = getStayDetails(v.duracion_vuelo_minutos || v.duracion);
                          return (
                            <div key={v.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="bg-blue-50 text-[#162b4e] border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                    {v.codigo_vuelo}
                                  </span>
                                  <span className="font-bold text-sm text-slate-800">{v.destino_city || v.destino_ciudad}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">Salida: {new Date(v.fecha_salida).toLocaleString()}</p>
                                {stay && (
                                  <p className="text-[10px] text-emerald-600 mt-1 font-bold">Estancia neta: {stay.horas} hrs</p>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                                <span className="font-bold text-[#162b4e]">{v.precio_monedas || v.precio} MO</span>
                                <button 
                                  onClick={() => handleBookFlight(v.id)}
                                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition duration-150"
                                >
                                  Reservar
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {getVuelosParaMostrarEnModal().length === 0 && (
                          <p className="text-xs text-slate-400">No hay vuelos programados específicos para este destino en la ventana temporal.</p>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: APARCAMIENTO QR */}
          {activeTab === "parking" && (
            <div className="space-y-8">
              
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Control QR simulador */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-md space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#162b4e] flex items-center space-x-2">
                      <i data-lucide="qr-code" className="w-5 h-5 text-[#162b4e]"></i>
                      <span>Simulador QR de Acceso</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Proceda con el escaneo de 3 pasos de código QR.</p>
                  </div>

                  {/* Pasos */}
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className={`text-center flex-1 py-1 rounded-lg text-xs font-bold ${qrStep === 1 ? 'bg-blue-100 text-[#162b4e]' : 'text-slate-400'}`}>1. Entrada</div>
                    <div className="text-slate-300 font-bold">→</div>
                    <div className={`text-center flex-1 py-1 rounded-lg text-xs font-bold ${qrStep === 2 ? 'bg-blue-100 text-[#162b4e]' : 'text-slate-400'}`}>2. Plaza</div>
                    <div className="text-slate-300 font-bold">→</div>
                    <div className={`text-center flex-1 py-1 rounded-lg text-xs font-bold ${qrStep === 3 ? 'bg-blue-100 text-[#162b4e]' : 'text-slate-400'}`}>3. Salida</div>
                  </div>

                  <div className="space-y-4">
                    {qrStep === 1 && (
                      <div className="space-y-4">
                        <label className="block text-xs font-bold uppercase text-slate-500">Seleccione Plaza a ocupar</label>
                        <select 
                          value={selectedParkingSlot}
                          onChange={e => setSelectedParkingSlot(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none"
                        >
                          <option value="">Elegir plaza...</option>
                          {parkingSlots.filter(s => s.estado === 'Libre').map(s => (
                            <option key={s.identificador_plaza} value={s.identificador_plaza}>{s.identificador_plaza}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {qrStep === 2 && (
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center space-y-2">
                        <p className="text-xs text-slate-500">Confirme escaneo físico de plaza</p>
                        <p className="text-sm font-bold text-[#162b4e]">Plaza Seleccionada: {selectedParkingSlot}</p>
                      </div>
                    )}

                    {qrStep === 3 && (
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center space-y-2">
                        <p className="text-xs text-slate-500">Listo para salida del vehículo</p>
                        <p className="text-xs text-slate-400 leading-normal">Se validará que su pago esté procesado de forma exitosa.</p>
                      </div>
                    )}

                    <button 
                      onClick={handleQRAction}
                      className="w-full py-3 bg-[#162b4e] hover:bg-[#0f1f3a] text-white font-bold rounded-xl transition duration-150 shadow-md text-xs uppercase"
                    >
                      {qrStep === 1 ? 'Escanear QR de Entrada' : qrStep === 2 ? 'Escanear QR de Plaza' : 'Escanear QR de Salida'}
                    </button>

                    {parkingStatusMsg && (
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-[#162b4e] leading-normal">
                        {parkingStatusMsg}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-amber-600 block mb-2">Simulación de Tiempos del Servidor</span>
                    <button 
                      onClick={handleSimulateMidnight}
                      className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 font-bold rounded-xl border border-amber-500/20 text-xs transition"
                    >
                      Simular Ciclo Diario (00:00 AM)
                    </button>
                  </div>
                </div>

                {/* Mapa del Estacionamiento */}
                <div className="xl:col-span-2 bg-white border border-slate-200 p-6 rounded-3xl shadow-md space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-[#162b4e]">Estado del Parking</h3>
                      <p className="text-xs text-slate-400 mt-1">Tarifa: {tarifaParking} Monedas Oceánicas / Día</p>
                    </div>

                    {user && (user.rol === 'Gerente' || user.rol === 'Administrador') && (
                      <form onSubmit={handleUpdateTarifa} className="flex items-center space-x-2">
                        <input 
                          type="number" 
                          placeholder="Nueva Tarifa" 
                          value={nuevaTarifaInput}
                          onChange={e => setNuevaTarifaInput(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-950 focus:outline-none w-28"
                        />
                        <button type="submit" className="px-3 py-1.5 bg-[#162b4e] text-white font-bold rounded-lg text-xs hover:bg-[#0f1f3a] transition">
                          Guardar
                        </button>
                      </form>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {parkingSlots.map((slot) => {
                      const isOcupado = slot.estado === 'Ocupado';
                      const isMine = user && slot.usuario_id === user.id;
                      return (
                        <div 
                          key={slot.identificador_plaza} 
                          className={`border p-6 rounded-2xl text-center space-y-2 flex flex-col justify-between transition-all duration-150 ${
                            isMine ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' :
                            isOcupado ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <span className="font-extrabold text-lg block">{slot.identificador_plaza}</span>
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full inline-block border ${
                            isOcupado ? 'bg-rose-100/50 border-rose-200' : 'bg-slate-100 border-slate-200'
                          }`}>
                            {isOcupado ? 'Ocupado' : 'Libre'}
                          </span>
                          {isMine && <span className="text-[10px] font-bold block text-emerald-600">Tu Vehículo</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: SOPORTE / ESCALACIÓN */}
          {activeTab === "incidencias" && (
            <div className="space-y-8">
              
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Crear Incidencia */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-md space-y-4 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#162b4e]">Reportar Incidencia</h2>
                    <p className="text-xs text-slate-400 mt-1">Soporte técnico y reporte de problemas operativos.</p>
                    <form onSubmit={handleCrearIncidencia} className="space-y-4 mt-6">
                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Describa su incidencia</label>
                        <textarea 
                          rows="4"
                          value={nuevaIncidenciaText}
                          onChange={e => setNuevaIncidenciaText(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#162b4e] rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white text-xs"
                          placeholder="Detalle el problema con fecha y lugar de estacionamiento o vuelo..."
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="w-full py-3 bg-[#162b4e] hover:bg-[#0f1f3a] text-white font-bold rounded-xl transition duration-150 text-xs shadow"
                      >
                        Enviar Reporte
                      </button>
                    </form>
                  </div>
                  {incidenciaMsg && (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-600 text-center">
                      {incidenciaMsg}
                    </div>
                  )}
                </div>

                {/* Bandeja de Casos */}
                <div className="xl:col-span-2 bg-white border border-slate-200 p-6 rounded-3xl shadow-md space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#162b4e]">Bandeja de Incidencias Operativas</h3>
                    <p className="text-xs text-slate-400 mt-1">Matriz de Escalación de Roles (Cliente → Soporte → Gerente → Administrador)</p>
                  </div>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {incidencias.map((ticket) => {
                      const canEscalate = 
                        (user && user.rol === 'Servicio al Cliente' && ticket.estado_actual === 'Abierto') ||
                        (user && user.rol === 'Gerente' && ticket.estado_actual === 'Escalado a Gerente');

                      return (
                        <div key={ticket.ticket_codigo} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-xs font-bold text-[#162b4e] block w-max shadow-sm">
                                {ticket.ticket_codigo}
                              </span>
                              <span className="text-[10px] text-slate-400 mt-1 block">Creado: {new Date(ticket.fecha_creacion).toLocaleString()}</span>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#162b4e] text-xs font-bold">
                              {ticket.estado_actual}
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 leading-normal bg-white p-3 rounded-xl border border-slate-100">
                            {ticket.descripcion_problema}
                          </p>

                          <div className="space-y-2 border-t border-slate-200/60 pt-3">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Historial de Trazabilidad</span>
                            {ticket.historial_estados?.map((log, idx) => (
                              <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-150 text-[10px] space-y-1 shadow-sm">
                                <div className="flex justify-between font-bold text-slate-600">
                                  <span>{log.estado} ({log.usuario_nombre})</span>
                                  <span className="text-slate-400 font-medium">{new Date(log.fecha).toLocaleDateString()}</span>
                                </div>
                                <p className="text-slate-500 italic">"{log.comentario}"</p>
                              </div>
                            ))}
                          </div>

                          {canEscalate && (
                            <div className="pt-2">
                              {activeTicketForEscalation === ticket.ticket_codigo ? (
                                <form onSubmit={handleEscalarIncidencia} className="space-y-2">
                                  <input 
                                    type="text" 
                                    placeholder="Agrega un comentario de escalamiento..." 
                                    value={escalarComentario}
                                    onChange={e => setEscalarComentario(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                                  />
                                  <div className="flex justify-end space-x-2">
                                    <button 
                                      type="button" 
                                      onClick={() => setActiveTicketForEscalation("")}
                                      className="px-3 py-1.5 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold"
                                    >
                                      Cancelar
                                    </button>
                                    <button 
                                      type="submit" 
                                      className="px-3 py-1.5 bg-amber-500 text-slate-950 rounded-lg text-[10px] font-bold shadow"
                                    >
                                      Confirmar Escalar caso
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <button 
                                  onClick={() => setActiveTicketForEscalation(ticket.ticket_codigo)}
                                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow"
                                >
                                  Escalar caso
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: CONSOLA DE ADMINISTRACIÓN */}
          {activeTab === "admin" && user && user.rol === 'Administrador' && (
            <div className="space-y-8 bg-white border border-slate-200 p-6 rounded-3xl shadow-md">
              <div>
                <h2 className="text-xl font-bold text-[#162b4e] flex items-center space-x-2">
                  <i data-lucide="shield-alert" className="w-6 h-6 text-[#162b4e]"></i>
                  <span>Consola de Administración de Infraestructura</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Control técnico absoluto y revocación de accesos.</p>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800">Modificar Roles de Usuario (Simulado)</h3>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white border border-slate-200 rounded-xl gap-4 shadow-sm">
                      <div>
                        <span className="font-bold text-xs block text-slate-800">Juan Pérez</span>
                        <span className="text-[10px] text-slate-400">cliente@oceanica.com</span>
                      </div>
                      <select 
                        onChange={(e) => handleCambiarRol(1, e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900 focus:outline-none"
                        defaultValue="Cliente"
                      >
                        <option value="Cliente">Cliente</option>
                        <option value="Servicio al Cliente">Servicio al Cliente</option>
                        <option value="Gerente">Gerente</option>
                        <option value="Administrador">Administrador</option>
                      </select>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white border border-slate-200 rounded-xl gap-4 shadow-sm">
                      <div>
                        <span className="font-bold text-xs block text-slate-800">Carlos Agente</span>
                        <span className="text-[10px] text-slate-400">servicio@oceanica.com</span>
                      </div>
                      <select 
                        onChange={(e) => handleCambiarRol(2, e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900 focus:outline-none"
                        defaultValue="Servicio al Cliente"
                      >
                        <option value="Cliente">Cliente</option>
                        <option value="Servicio al Cliente">Servicio al Cliente</option>
                        <option value="Gerente">Gerente</option>
                        <option value="Administrador">Administrador</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-2">Auditoría de Seguridad y Logs NoSQL (MongoDB)</h3>
                  <p className="text-xs text-slate-400 mb-4">Registro en tiempo real del historial de búsquedas del mapa y parámetros de filtrado.</p>
                  <div className="space-y-3">
                    <button 
                      onClick={async () => {
                        const res = await fetch('/api/vuelos/buscar', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({})
                        });
                        alert("Historial auditado e insertado exitosamente.");
                      }}
                      className="px-4 py-2 bg-[#162b4e] hover:bg-[#0f1f3a] text-white font-bold rounded-xl text-xs transition shadow"
                    >
                      Verificar Inserción Log NoSQL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <span>© 2026 Aerolíneas Oceánicas S.A. Todos los derechos reservados.</span>
        <div className="flex space-x-4">
          <span className="hover:text-slate-600 cursor-pointer font-medium">Seguridad</span>
          <span className="hover:text-slate-600 cursor-pointer font-medium">Términos de Uso</span>
          <span className="hover:text-slate-600 cursor-pointer font-medium">Privacidad</span>
        </div>
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Re-inicializar iconos de Lucide al cargar el DOM
setTimeout(() => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}, 500);
