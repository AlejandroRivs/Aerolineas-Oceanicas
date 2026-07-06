const { useState, useEffect } = React;

// Mapa de colores e información de países
const PAISES_DATA = {
  "México": {
    color: "#059669",
    destinos: [
      { nombre: "Cancún", categoria: "Playa", desc: "Playas caribeñas de agua turquesa." },
      { nombre: "Teotihuacán", categoria: "Cultura", desc: "Pirámides ancestrales del Sol y la Luna." },
      { nombre: "San Miguel de Allende", categoria: "Cultura", desc: "Pueblo mágico con hermosa arquitectura colonial." }
    ],
    vuelos: [
      { id: 601, codigo_vuelo: 'OC-601', origen: 'San José, CR', destino_pais: 'México', destino_ciudad: 'Cancún', fecha_salida: '2026-07-11T12:00:00Z', fecha_llegada: '2026-07-11T14:30:00Z', duracion: 150, precio: 1100 }
    ],
    path: "M 100 100 L 160 120 L 150 160 L 80 140 Z" // Coordenadas simplificadas para dibujo SVG
  },
  "Colombia": {
    color: "#eab308",
    destinos: [
      { nombre: "Santuario de Las Lajas", categoria: "Montaña", desc: "Una joya arquitectónica construida sobre un cañón." },
      { nombre: "Parque Nacional Natural Tayrona", categoria: "Playa", desc: "Bahías de arena blanca rodeadas de selva tropical." },
      { nombre: "Catedral de Sal de Zipaquirá", categoria: "Cultura", desc: "Una iglesia subterránea tallada completamente en sal." }
    ],
    vuelos: [
      { id: 101, codigo_vuelo: 'OC-101', origen: 'Ciudad de México, MX', destino_pais: 'Colombia', destino_ciudad: 'Bogotá', fecha_salida: '2026-07-06T08:00:00Z', fecha_llegada: '2026-07-06T12:30:00Z', duracion: 270, precio: 1200 },
      { id: 301, codigo_vuelo: 'OC-301', origen: 'Buenos Aires, AR', destino_pais: 'Colombia', destino_ciudad: 'Medellín', fecha_salida: '2026-07-08T07:00:00Z', fecha_llegada: '2026-07-08T12:30:00Z', duracion: 390, precio: 2100 }
    ],
    path: "M 170 200 L 210 220 L 200 260 L 160 250 Z"
  },
  "Chile": {
    color: "#ef4444",
    destinos: [
      { nombre: "Torres del Paine", categoria: "Montaña", desc: "Imponentes montañas y glaciares en la Patagonia chilena." },
      { nombre: "Desierto de Atacama", categoria: "Montaña", desc: "El desierto no polar más árido de la Tierra." },
      { nombre: "Isla de Pascua", categoria: "Cultura", desc: "Famosa por sus enigmáticas estatuas de piedra Moái." }
    ],
    vuelos: [
      { id: 102, codigo_vuelo: 'OC-102', origen: 'Ciudad de México, MX', destino_pais: 'Chile', destino_ciudad: 'Santiago', fecha_salida: '2026-07-06T14:00:00Z', fecha_llegada: '2026-07-06T22:30:00Z', duracion: 510, precio: 2400 },
      { id: 401, codigo_vuelo: 'OC-401', origen: 'Río de Janeiro, BR', destino_pais: 'Chile', destino_ciudad: 'Santiago', fecha_salida: '2026-07-09T15:00:00Z', fecha_llegada: '2026-07-09T19:30:00Z', duracion: 330, precio: 1900 }
    ],
    path: "M 170 380 L 180 380 L 190 540 L 175 540 Z"
  },
  "Perú": {
    color: "#a855f7",
    destinos: [
      { nombre: "Machu Picchu", categoria: "Montaña", desc: "La legendaria ciudadela inca en las alturas de los Andes." },
      { nombre: "Líneas de Nazca", categoria: "Cultura", desc: "Geoglifos antiguos grabados en las arenas del desierto." },
      { nombre: "Lago Titicaca", categoria: "Montaña", desc: "El lago navegable más alto del mundo." }
    ],
    vuelos: [
      { id: 103, codigo_vuelo: 'OC-103', origen: 'Ciudad de México, MX', destino_pais: 'Perú', destino_ciudad: 'Lima', fecha_salida: '2026-07-06T09:30:00Z', fecha_llegada: '2026-07-06T15:45:00Z', duracion: 375, precio: 1800 },
      { id: 302, codigo_vuelo: 'OC-302', origen: 'Santiago, CL', destino_pais: 'Perú', destino_ciudad: 'Cusco', fecha_salida: '2026-07-08T13:00:00Z', fecha_llegada: '2026-07-08T16:30:00Z', duracion: 270, precio: 1600 }
    ],
    path: "M 155 265 L 195 285 L 175 360 L 135 320 Z"
  },
  "Brasil": {
    color: "#3b82f6",
    destinos: [
      { nombre: "Cristo Redentor", categoria: "Cultura", desc: "Estatua icónica que corona el cerro del Corcovado." },
      { nombre: "Cataratas del Iguazú", categoria: "Montaña", desc: "Uno de los sistemas de cascadas más grandes del mundo." },
      { nombre: "Playa de Copacabana", categoria: "Playa", desc: "Famosa playa en forma de media luna en Río de Janeiro." }
    ],
    vuelos: [
      { id: 201, codigo_vuelo: 'OC-201', origen: 'Bogotá, CO', destino_pais: 'Brasil', destino_ciudad: 'Río de Janeiro', fecha_salida: '2026-07-07T10:00:00Z', fecha_llegada: '2026-07-07T18:30:00Z', duracion: 390, precio: 2200 }
    ],
    path: "M 220 220 L 290 240 L 280 340 L 210 320 Z"
  },
  "Argentina": {
    color: "#06b6d4",
    destinos: [
      { nombre: "Glaciar Perito Moreno", categoria: "Montaña", desc: "Impresionante pared de hielo en la Patagonia." },
      { nombre: "Bariloche", categoria: "Montaña", desc: "Lagos cristalinos y montañas ideales para esquí." },
      { nombre: "Cataratas del Iguazú", categoria: "Montaña", desc: "Maravillosa vista de las cataratas compartidas con Brasil." }
    ],
    vuelos: [
      { id: 202, codigo_vuelo: 'OC-202', origen: 'Lima, PE', destino_pais: 'Argentina', destino_ciudad: 'Buenos Aires', fecha_salida: '2026-07-07T11:00:00Z', fecha_llegada: '2026-07-07T16:30:00Z', duracion: 270, precio: 1500 }
    ],
    path: "M 188 385 L 218 385 L 220 520 L 192 520 Z"
  },
  "Costa Rica": {
    color: "#f97316",
    destinos: [
      { nombre: "Volcán Arenal", categoria: "Montaña", desc: "Volcán activo rodeado de aguas termales." },
      { nombre: "Parque Manuel Antonio", categoria: "Playa", desc: "Playas paradisíacas con abundancia de perezosos y monos." },
      { nombre: "Monteverde", categoria: "Montaña", desc: "Reserva de bosque nuboso y tirolesas gigantes." }
    ],
    vuelos: [
      { id: 501, codigo_vuelo: 'OC-501', origen: 'Bogotá, CO', destino_pais: 'Costa Rica', destino_ciudad: 'San José', fecha_salida: '2026-07-10T09:00:00Z', fecha_llegada: '2026-07-10T11:15:00Z', duracion: 135, precio: 950 }
    ],
    path: "M 130 170 L 150 175 L 145 190 L 125 185 Z"
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
      
      // Buscar si el usuario actual tiene una plaza ocupada
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

  // Login simulando Google Auth API
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

                {/* Mapa SVG de América Latina */}
                <div className="xl:col-span-2 bg-white border border-slate-200 p-6 rounded-3xl shadow-md flex flex-col items-center justify-center relative min-h-[450px]">
                  <h3 className="absolute top-4 left-4 text-xs font-bold tracking-wider uppercase text-slate-400">
                    Seleccione un país de América Latina en el mapa
                  </h3>

                  <div className="w-full max-w-[320px] h-[400px]">
                    <svg viewBox="0 0 400 600" className="w-full h-full fill-current">
                      {Object.keys(PAISES_DATA).map((pais) => {
                        const info = PAISES_DATA[pais];
                        const isHovered = hoveredCountry === pais;
                        return (
                          <path 
                            key={pais}
                            d={info.path}
                            className="transition-all duration-200 cursor-pointer stroke-white stroke-2"
                            fill={isHovered ? '#60a5fa' : '#cbd5e1'}
                            onMouseEnter={() => setHoveredCountry(pais)}
                            onMouseLeave={() => setHoveredCountry(null)}
                            onClick={() => setSelectedCountry(pais)}
                          />
                        );
                      })}
                    </svg>
                  </div>

                  {hoveredCountry && (
                    <div className="absolute bottom-4 px-4 py-2 bg-[#162b4e] text-white font-extrabold rounded-xl shadow-lg text-sm animate-bounce">
                      {hoveredCountry}
                    </div>
                  )}
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
                      onClick={() => setSelectedCountry(null)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-2xl font-bold"
                    >
                      &times;
                    </button>
                    
                    <div>
                      <h3 className="text-2xl font-extrabold tracking-tight text-[#162b4e]">{selectedCountry}</h3>
                      <p className="text-xs text-slate-500">Guía de Destinos y Vuelos Disponibles</p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Lugares Más Turísticos</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {PAISES_DATA[selectedCountry]?.destinos.map((dest, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
                            <span className="text-[10px] uppercase font-bold text-blue-600">{dest.categoria}</span>
                            <h5 className="font-bold text-sm text-slate-800">{dest.nombre}</h5>
                            <p className="text-[10px] text-slate-500 leading-normal">{dest.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Vuelos Disponibles a {selectedCountry}</h4>
                      <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                        {vuelos.filter(v => v.destino_pais === selectedCountry).map((v) => {
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
                        {vuelos.filter(v => v.destino_pais === selectedCountry).length === 0 && (
                          <p className="text-xs text-slate-400">No hay vuelos programados para esta semana a este país.</p>
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

                {/* Bandeja de Casos (RBAC Matrix) */}
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

                          {/* Historial de Escalación */}
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
