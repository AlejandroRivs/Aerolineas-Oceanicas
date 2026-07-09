const { useState, useEffect, useRef } = React;
const { ComposableMap, Geographies, Geography } = window;

window.MapaInteractivo = function MapaInteractivo({ userBalance, vuelos, handleBookFlight, user }) {
  console.log("Vuelos recibidos en MapaInteractivo:", vuelos);
  // Estados del Buscador Inteligente
  const [presupuesto, setPresupuesto] = useState(userBalance || 5000);
  const [gusto, setGusto] = useState('Todos');
  const [diasDisponibles, setDiasDisponibles] = useState(3);
  const [diaSalida, setDiaSalida] = useState('2026-07-09');
  const [vuelosFiltrados, setVuelosFiltrados] = useState([]);
  const [paisSeleccionado, setPaisSeleccionado] = useState(null);
  const [paisHover, setPaisHover] = useState(null);
  const [soloNoVisitados, setSoloNoVisitados] = useState(false);
  const [paisesVisitados, setPaisesVisitados] = useState(['Chile']);
  const [modalPaisesOpen, setModalPaisesOpen] = useState(false);

  // Estados de Pestañas y Búsqueda General
  const [searchTab, setSearchTab] = useState('inteligente'); // 'inteligente' o 'general'
  const [origenInteligente, setOrigenInteligente] = useState('Guatemala');
  const [origenGeneral, setOrigenGeneral] = useState('Todos');
  const [destinoGeneral, setDestinoGeneral] = useState('Todos');
  const [fechaSalidaGeneral, setFechaSalidaGeneral] = useState('');
  const [fechaLlegadaGeneral, setFechaLlegadaGeneral] = useState('');

  useEffect(() => {
    if (userBalance !== undefined) {
      setPresupuesto(userBalance);
    }
  }, [userBalance]);

  // Estados y funciones para el control y medidor de zoom solicitado
  const [zoom, setZoom] = useState(1.25);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const mapContainerRef = useRef(null);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.5, 4));  // Máximo 400%
  const handleZoomOut = () => {
    setZoom(z => {
      const nextZoom = Math.max(z - 0.5, 1);
      if (nextZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return nextZoom;
    });
  };
  const handleReset = () => {
    setZoom(1.25);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (zoom <= 1) return; // Sólo arrastrar si hay zoom
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleNativeWheel = (e) => {
      e.preventDefault();
      const zoomFactor = 0.15;
      setZoom(z => {
        let nextZoom = z;
        if (e.deltaY < 0) {
          nextZoom = Math.min(z + zoomFactor, 4);
        } else {
          nextZoom = Math.max(z - zoomFactor, 1);
        }
        if (nextZoom === 1) {
          setPosition({ x: 0, y: 0 });
        }
        return nextZoom;
      });
    };

    container.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleNativeWheel);
    };
  }, []);

  const mapName = (name) => {
    if (!name) return "";
    const norm = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (norm === "mexico") return "México";
    if (norm === "brasil" || norm === "brazil") return "Brasil";
    if (norm === "peru") return "Perú";
    if (norm === "costa rica") return "Costa Rica";
    if (norm === "colombia") return "Colombia";
    if (norm === "chile") return "Chile";
    if (norm === "argentina") return "Argentina";
    return name;
  };

  const ejecutarBuscadorInteligente = () => {
    const mapped = vuelos.map(v => {
      const horas = (v.duracion_vuelo_minutos || v.duracion || 180) / 60;
      let cat = "Historia";
      let atractivo = "Atracción Turística";
      
      const paisInfo = window.PAISES_DATA[v.destino_pais];
      if (paisInfo && paisInfo.destinos) {
        const matchedDest = paisInfo.destinos.find(d => 
          d.ciudad.toLowerCase() === v.destino_ciudad.toLowerCase() ||
          v.destino_ciudad.toLowerCase().includes(d.ciudad.toLowerCase())
        );
        if (matchedDest) {
          cat = matchedDest.categoria;
          atractivo = matchedDest.nombre;
        }
      }
      
      if (cat === "Cultura") cat = "Historia";

      if (v.destino_ciudad === "San Pedro de Atacama") {
        cat = "Desierto";
        atractivo = "Valle de la Luna";
      } else if (v.destino_ciudad === "Manaos") {
        cat = "Selva";
        atractivo = "Río Amazonas";
      } else if (v.destino_ciudad === "Cancún") {
        cat = "Playa";
        atractivo = "Playa Delfines";
      } else if (v.destino_ciudad === "Cusco") {
        cat = "Montaña";
        atractivo = "Machu Picchu";
      }

      return {
        ...v,
        pais_destino: v.destino_pais,
        ciudad_destino: v.destino_ciudad,
        atractivo_turistico: atractivo,
        categoria_gustos: cat,
        precio_monedas_oceanicas: v.precio_monedas || v.precio || 0,
        tiempo_vuelo_horas: horas
      };
    });

    const activeOrigin = searchTab === 'inteligente' ? origenInteligente : origenGeneral;
    
    const matchesActiveOrigin = (str) => {
      if (!str) return false;
      if (activeOrigin === 'Todos') return true;
      const cleanStr = str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const cleanOrigin = activeOrigin.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return cleanStr.includes(cleanOrigin);
    };

    const vuelosIdaCandidates = mapped.filter(v => {
      return matchesActiveOrigin(v.origen);
    });

    const vuelosVueltaCandidates = mapped.filter(v => {
      return matchesActiveOrigin(v.destino_ciudad) || matchesActiveOrigin(v.destino_pais);
    });

    const paquetes = [];

    vuelosIdaCandidates.forEach(ida => {
      vuelosVueltaCandidates.forEach(vuelta => {
        const origenVueltaLimpio = vuelta.origen.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const destinoPaisIdaLimpio = ida.destino_pais.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (origenVueltaLimpio.includes(destinoPaisIdaLimpio)) {
          const fechaIda = new Date(ida.fecha_salida);
          const fechaVuelta = new Date(vuelta.fecha_salida);
          const diffMs = fechaVuelta.getTime() - fechaIda.getTime();
          const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

          if (diffDays === Number(diasDisponibles)) {
            const totalPrice = ida.precio_monedas_oceanicas + vuelta.precio_monedas_oceanicas;
            const tiempoDisponible = Number(diasDisponibles) * 24;
            const tiempoVueloTotal = (ida.tiempo_vuelo_horas + vuelta.tiempo_vuelo_horas);
            const tiempoNetoVisita = tiempoDisponible - tiempoVueloTotal;

            paquetes.push({
              id: `${ida.id}-${vuelta.id}`,
              vueloIda: ida,
              vueloVuelta: vuelta,
              precioTotal: totalPrice,
              tiempoNetoVisita,
              riesgoRetrasoHoras: (tiempoVueloTotal * 0.15).toFixed(1),
              pais_destino: ida.pais_destino,
              ciudad_destino: ida.ciudad_destino,
              categoria_gustos: ida.categoria_gustos,
              atractivo_turistico: ida.atractivo_turistico,
              fecha_salida: ida.fecha_salida,
              fecha_llegada: vuelta.fecha_salida
            });
          }
        }
      });
    });

    let resultado = [];

    if (searchTab === 'inteligente') {
      resultado = paquetes.filter(pkg => {
        const cumpleGusto = gusto === 'Todos' || pkg.categoria_gustos === gusto;
        const cumplePresupuesto = pkg.precioTotal <= presupuesto;
        
        const diaVuelo = pkg.fecha_salida ? pkg.fecha_salida.split('T')[0] : '';
        const cumpleFecha = diaVuelo === diaSalida;
        
        const esNoVisitado = !soloNoVisitados || !paisesVisitados.includes(pkg.pais_destino);

        return cumpleGusto && cumplePresupuesto && cumpleFecha && esNoVisitado;
      });
    } else {
      resultado = paquetes.filter(pkg => {
        const cumpleDestino = destinoGeneral === 'Todos' || 
          pkg.ciudad_destino.includes(destinoGeneral) || 
          pkg.pais_destino.includes(destinoGeneral);
        
        const diaSalidaVuelo = pkg.fecha_salida ? pkg.fecha_salida.split('T')[0] : '';
        const cumpleSalida = !fechaSalidaGeneral || diaSalidaVuelo === fechaSalidaGeneral;
        
        const diaLlegadaVuelo = pkg.fecha_llegada ? pkg.fecha_llegada.split('T')[0] : '';
        const cumpleLlegada = !fechaLlegadaGeneral || diaLlegadaVuelo === fechaLlegadaGeneral;

        return cumpleDestino && cumpleSalida && cumpleLlegada;
      });
    }

    resultado.sort((a, b) => a.precioTotal - b.precioTotal);

    setVuelosFiltrados(resultado);
  };

  useEffect(() => {
    ejecutarBuscadorInteligente();
  }, [presupuesto, gusto, diasDisponibles, diaSalida, soloNoVisitados, paisesVisitados, searchTab, origenInteligente, origenGeneral, destinoGeneral, fechaSalidaGeneral, fechaLlegadaGeneral, vuelos, user]);

  // Obtener lugares de origen únicos de los vuelos
  const origenesDisponibles = Array.from(new Set(vuelos.map(v => v.origen).filter(Boolean)));
  // Obtener destinos únicos de los vuelos
  const destinosDisponibles = Array.from(new Set([
    ...vuelos.map(v => v.destino_ciudad).filter(Boolean),
    ...vuelos.map(v => v.destino_pais).filter(Boolean)
  ]));

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return 'No especificada';
    try {
      const d = new Date(fechaStr);
      const pad = (n) => String(n).padStart(2, '0');
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch (e) {
      return fechaStr;
    }
  };

  const renderVuelosCards = (vuelosList, isFloating = false) => {
    return (
      <div className={`grid grid-cols-1 ${isFloating ? '' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6 overflow-y-auto pb-16 pr-2 w-full max-h-full p-4`}>
        {vuelosList.map((pkg) => {
          const ida = pkg.vueloIda;
          const vuelta = pkg.vueloVuelta;
          const esAhorro = pkg.precioTotal <= (presupuesto * 0.7);

          return (
            <div key={pkg.id} className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between shadow-lg hover:shadow-xl transition duration-200 relative text-slate-800 min-h-[380px]">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#162b4e] to-emerald-500 rounded-t-3xl"></div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-black text-blue-600 tracking-widest uppercase bg-blue-50 px-2 py-0.5 rounded-full mb-1.5 inline-block">Paquete de Vuelo</span>
                    <h4 className="text-sm font-black text-[#162b4e] leading-tight">{pkg.ciudad_destino}, {pkg.pais_destino}</h4>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{pkg.atractivo_turistico} • <span className="italic font-medium">{pkg.categoria_gustos}</span></p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Precio Total</span>
                    <span className="font-black text-emerald-600 text-base">{pkg.precioTotal} MO</span>
                    {esAhorro && (
                      <span className="block text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5 mt-1 text-center font-mono">
                        Bajo el presupuesto
                      </span>
                    )}
                  </div>
                </div>

                {/* Vuelo Ida */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400">
                    <span className="text-blue-800 font-bold uppercase tracking-wider">Vuelo Ida</span>
                    <span>{ida.codigo_vuelo}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-700">
                    <span className="font-semibold">{ida.origen.split(',')[0]} → {ida.destino_ciudad}</span>
                    <span className="font-bold">{formatFecha(ida.fecha_salida)}</span>
                  </div>
                </div>

                {/* Vuelo Regreso */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400">
                    <span className="text-blue-800 font-bold uppercase tracking-wider">Vuelo Regreso</span>
                    <span>{vuelta.codigo_vuelo}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-700">
                    <span className="font-semibold">{vuelta.origen.split(',')[0]} → {vuelta.destino_ciudad}</span>
                    <span className="font-bold">{formatFecha(vuelta.fecha_salida)}</span>
                  </div>
                </div>

                {/* Datos estancia */}
                <div className="grid grid-cols-2 gap-2 bg-blue-50/20 rounded-2xl p-3 border border-blue-150/40 text-xs">
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-400">Estancia Neta</span>
                    <span className="font-bold text-[#162b4e]">{pkg.tiempoNetoVisita.toFixed(1)} h libres</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-400">Colchón Retrasos</span>
                    <span className="font-bold text-amber-600">+{pkg.riesgoRetrasoHoras}h colchón</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => handleBookFlight(pkg)}
                  className="w-full py-2.5 bg-[#162b4e] hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition duration-200 shadow-md"
                >
                  Reservar Paquete
                </button>
              </div>
            </div>
          );
        })}

        {vuelosList.length === 0 && (
          <div className="col-span-full py-8 text-center max-w-md mx-auto space-y-5">
            <p className="text-slate-400 text-xs font-bold leading-normal">
              No hay vuelos exactos para los parámetros actuales.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3.5 text-left">
              <span className="block text-[10px] uppercase font-black text-slate-500 tracking-wider">Sugerencias de Flexibilidad</span>
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => setPresupuesto(p => Math.min(userBalance || 5000, p + 500))}
                  disabled={presupuesto >= (userBalance || 5000)}
                  className="w-full py-2 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white text-[#162b4e] font-bold rounded-xl text-xs transition border border-slate-200 text-left px-4 flex justify-between"
                >
                  <span>Aumentar presupuesto</span>
                  <span className="text-emerald-600">+500 MO</span>
                </button>
                <button 
                  onClick={() => setDiasDisponibles(d => d + 1)}
                  className="w-full py-2 bg-white hover:bg-slate-100 text-[#162b4e] font-bold rounded-xl text-xs transition border border-slate-200 text-left px-4 flex justify-between"
                >
                  <span>Ampliar días de viaje</span>
                  <span className="text-blue-600">+1 día</span>
                </button>
                <button 
                  onClick={() => setGusto("Todos")}
                  className="w-full py-2 bg-white hover:bg-slate-100 text-[#162b4e] font-bold rounded-xl text-xs transition border border-slate-200 text-left px-4"
                >
                  Cambiar experiencia a "Cualquiera"
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Contenedor Principal */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-3">
        
        {/* PANEL IZQUIERDO: BUSCADORES DE VUELOS */}
        <div className="p-6 bg-[#162b4e] text-white flex flex-col justify-between">
          <div>
            {/* Cabecera del Panel */}
            <div className="mb-6">
              <h2 className="text-xl font-black tracking-wide mb-1 flex items-center space-x-2">
                <i data-lucide="plane-takeoff" className="w-5 h-5 text-blue-300"></i>
                <span>Buscador de Vuelos</span>
              </h2>
              <p className="text-[11px] text-blue-200">Aerolíneas Oceánicas — Explora a tu propio ritmo</p>
            </div>

            {/* Selectores de Pestañas */}
            <div className="flex border-b border-blue-900/60 mb-5 text-xs font-bold uppercase tracking-wider">
              <button 
                type="button" 
                onClick={() => setSearchTab('inteligente')}
                className={`flex-1 pb-3 text-center transition-all ${searchTab === 'inteligente' ? 'text-emerald-400 border-b-2 border-emerald-400 font-extrabold' : 'text-blue-300 hover:text-white'}`}
              >
                Inteligente
              </button>
              <button 
                type="button" 
                onClick={() => setSearchTab('general')}
                className={`flex-1 pb-3 text-center transition-all ${searchTab === 'general' ? 'text-emerald-400 border-b-2 border-emerald-400 font-extrabold' : 'text-blue-300 hover:text-white'}`}
              >
                General
              </button>
            </div>

            {/* RENDERIZADO CONDICIONAL DE ENTRADAS SEGÚN LA PESTAÑA */}
            {searchTab === 'inteligente' ? (
              <div className="space-y-4">
                {/* País / Lugar de Salida */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">Origen / Lugar de salida</label>
                  <select 
                    value={origenInteligente} 
                    onChange={(e) => setOrigenInteligente(e.target.value)}
                    className="w-full bg-blue-950 border border-blue-800 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                  >
                    <option value="Guatemala">Guatemala</option>
                    <option value="México">México</option>
                    <option value="Costa Rica">Costa Rica</option>
                  </select>
                </div>

                {/* Filtro Gustos */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">¿Qué te gustaría experimentar?</label>
                  <select 
                    value={gusto} 
                    onChange={(e) => setGusto(e.target.value)}
                    className="w-full bg-blue-950 border border-blue-800 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                  >
                    <option value="Todos">Cualquier experiencia</option>
                    <option value="Playa">Playa</option>
                    <option value="Montaña">Montaña</option>
                    <option value="Desierto">Desierto</option>
                    <option value="Historia">Historia</option>
                    <option value="Selva">Selva</option>
                  </select>
                </div>

                {/* Filtro Presupuesto */}
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase text-gray-300 mb-1.5">
                    <span>Presupuesto Máximo</span>
                    <span className="text-green-400 font-bold">{presupuesto} MO</span>
                  </div>
                  <input 
                    type="range" min="0" max={userBalance || 5000} step="50"
                    value={presupuesto}
                    onChange={(e) => setPresupuesto(parseInt(e.target.value))}
                    className="w-full accent-green-400 bg-blue-950 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Filtro Tiempo Disponible */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">Días disponibles para viajar</label>
                  <input 
                    type="number" min="1" max="30"
                    value={diasDisponibles}
                    onChange={(e) => setDiasDisponibles(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-blue-950 border border-blue-800 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                  />
                </div>

                {/* Filtro Calendario de Salida */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">Día planificado de salida</label>
                  <div className="grid grid-cols-5 gap-1 bg-blue-950 p-1 rounded-xl border border-blue-900">
                    {[
                      { label: 'Jue 9', value: '2026-07-09' },
                      { label: 'Vie 10', value: '2026-07-10' },
                      { label: 'Sáb 11', value: '2026-07-11' },
                      { label: 'Dom 12', value: '2026-07-12' },
                      { label: 'Lun 13', value: '2026-07-13' }
                    ].map(day => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => setDiaSalida(day.value)}
                        className={`py-1.5 text-[9px] font-black rounded-lg transition-all ${
                          diaSalida === day.value 
                            ? 'bg-emerald-500 text-slate-950 shadow' 
                            : 'text-gray-400 hover:text-white hover:bg-blue-900/50'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtro Sólo No Visitados */}
                <div className="flex items-center justify-between py-2 border-t border-blue-900/50 mt-2">
                  <div className="flex items-center space-x-2.5">
                    <input 
                      type="checkbox" 
                      id="soloNoVisitadosMap" 
                      checked={soloNoVisitados}
                      onChange={e => {
                        const checked = e.target.checked;
                        setSoloNoVisitados(checked);
                        if (checked) {
                          setModalPaisesOpen(true);
                        }
                      }}
                      className="w-3.5 h-3.5 rounded border-blue-800 text-blue-600 focus:ring-blue-500 bg-blue-950"
                    />
                    <label htmlFor="soloNoVisitadosMap" className="text-[10px] font-bold text-gray-300 cursor-pointer select-none">
                      Destinos no visitados
                    </label>
                  </div>
                  {soloNoVisitados && (
                    <button 
                      type="button"
                      onClick={() => setModalPaisesOpen(true)}
                      className="text-[9px] bg-blue-900/60 hover:bg-blue-850 text-blue-300 px-2 py-0.5 rounded font-bold border border-blue-800/80 transition"
                    >
                      Editar
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Lugar de Salida (Buscador General) */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">Origen / Lugar de salida</label>
                  <select 
                    value={origenGeneral} 
                    onChange={(e) => setOrigenGeneral(e.target.value)}
                    className="w-full bg-blue-950 border border-blue-800 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                  >
                    <option value="Todos">Cualquier origen</option>
                    {origenesDisponibles.map(ori => (
                      <option key={ori} value={ori}>{ori}</option>
                    ))}
                  </select>
                </div>

                {/* Lugar de Llegada (Buscador General) */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">Destino / Lugar de llegada</label>
                  <select 
                    value={destinoGeneral} 
                    onChange={(e) => setDestinoGeneral(e.target.value)}
                    className="w-full bg-blue-950 border border-blue-800 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                  >
                    <option value="Todos">Cualquier destino</option>
                    {destinosDisponibles.map(dest => (
                      <option key={dest} value={dest}>{dest}</option>
                    ))}
                  </select>
                </div>

                {/* Fecha de Salida (Buscador General) */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">Fecha de salida</label>
                  <input 
                    type="date"
                    value={fechaSalidaGeneral}
                    onChange={(e) => setFechaSalidaGeneral(e.target.value)}
                    className="w-full bg-blue-950 border border-blue-800 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 text-white scheme-dark"
                  />
                </div>

                {/* Fecha de Llegada (Buscador General) */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">Fecha de llegada</label>
                  <input 
                    type="date"
                    value={fechaLlegadaGeneral}
                    onChange={(e) => setFechaLlegadaGeneral(e.target.value)}
                    className="w-full bg-blue-950 border border-blue-800 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 text-white scheme-dark"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Saldo de Bienvenida en Pantalla */}
          <div className="mt-8 bg-blue-950/60 p-4 rounded-xl border border-blue-900 flex justify-between items-center">
            <span className="text-xs text-gray-300 font-medium">Tu Billetera Oceánica:</span>
            <span className="text-xl font-black text-green-400">{userBalance} MO</span>
          </div>
        </div>

        {/* PANEL CENTRAL: MAPA INTERACTIVO SVG O RESULTADOS GENERALES */}
        {searchTab === 'inteligente' ? (
          <div className="p-6 lg:col-span-2 flex flex-col justify-between bg-[#162b4e]/5 relative border-l border-slate-100 min-h-[450px]">
            <div className="w-full grid grid-cols-1 md:grid-cols-3 items-center gap-4 mb-6 pt-2 pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-2 justify-start">
                <span className="text-xs font-bold bg-[#162b4e] text-white px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                  Mapa de América Latina
                </span>
                {paisSeleccionado && (
                  <button 
                    onClick={() => setPaisSeleccionado(null)}
                    className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-full shadow-sm transition"
                  >
                    Limpiar selección
                  </button>
                )}
              </div>
              <div className="flex justify-center text-center">
                <span className="text-sm font-extrabold text-[#162b4e] uppercase tracking-wider">
                  Destino: <span className="text-blue-600 text-base md:text-xl font-black transition-all block md:inline mt-0.5 md:mt-0">{paisHover || (paisSeleccionado ? paisSeleccionado.toUpperCase() : "Pasa el cursor")}</span>
                </span>
              </div>
              <div className="flex items-center justify-end pr-6">
                <span className="text-[11px] text-blue-600 font-extrabold tracking-wide bg-blue-50 px-2.5 py-1 rounded shadow-sm">
                  Escala: {(zoom * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            
            <div className="relative w-full h-[480px] flex items-center justify-center my-auto pt-6 overflow-hidden bg-[#c5daeb] rounded-3xl border border-[#b0cde3] shadow-inner">
              {/* BOTONES FLOTANTES DE ZOOM */}
              <div className="absolute bottom-4 right-4 z-20 flex flex-col space-y-1.5 bg-white/90 backdrop-blur-sm p-1.5 rounded-xl border border-gray-200 shadow-md">
                <button 
                  onClick={handleZoomIn} 
                  className="w-8 h-8 flex items-center justify-center bg-[#162b4e] hover:bg-blue-600 text-white font-bold rounded-lg transition-colors shadow-sm text-lg"
                  title="Acercar mapa"
                >
                  +
                </button>
                <button 
                  onClick={handleZoomOut} 
                  className="w-8 h-8 flex items-center justify-center bg-[#162b4e] hover:bg-blue-600 text-white font-bold rounded-lg transition-colors shadow-sm text-lg"
                  title="Alejar mapa"
                >
                  -
                </button>
                <button 
                  onClick={handleReset} 
                  className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs rounded-lg transition-all border border-gray-200"
                  title="Restaurar escala base"
                >
                  Reset
                </button>
              </div>
 
              {/* Contenedor SVG con transform de escala y traslación para movimiento */}
              <div 
                ref={mapContainerRef}
                className="w-full flex items-center justify-center overflow-hidden origin-center select-none" 
                style={{ 
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`, 
                  cursor: zoom > 1.25 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                  transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
              >
                <ComposableMap
                  projectionConfig={{
                    scale: 235,
                    center: [-67, -13]
                  }}
                  className="w-full h-auto select-none max-h-[380px] drop-shadow-lg"
                >
                  <Geographies>
                    {({ geographies }) =>
                      geographies.map(geo => {
                        const nombrePais = mapName(geo.properties.name || geo.properties.NAME);
                        const esHovered = paisHover === nombrePais;
                        const esSelected = paisSeleccionado === nombrePais;

                        return (
                          <Geography
                            key={geo.id || geo.rsmKey}
                            geography={geo}
                            onMouseEnter={() => setPaisHover(nombrePais)}
                            onMouseLeave={() => setPaisHover(null)}
                            onClick={() => {
                              setPaisSeleccionado(esSelected ? null : nombrePais);
                            }}
                            style={{
                              default: {
                                fill: esSelected ? "#10b981" : "#162b4e",
                                stroke: "#1e293b",
                                strokeWidth: 0.6,
                                outline: "none",
                                transition: "all 200ms ease"
                              },
                              hover: {
                                fill: esSelected ? "#10b981" : "#3b82f6",
                                stroke: "#ffffff",
                                strokeWidth: 1.0,
                                outline: "none",
                                cursor: "pointer",
                                transition: "all 100ms ease"
                              },
                              pressed: {
                                fill: "#059669",
                                stroke: "#ffffff",
                                strokeWidth: 1.0,
                                outline: "none"
                              }
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>
                </ComposableMap>
              </div>

              {/* VENTANA FLOTANTE PARA PAÍS SELECCIONADO EN EL MAPA */}
              {paisSeleccionado && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white w-full max-w-4xl h-[85%] rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col">
                    <button 
                      onClick={() => setPaisSeleccionado(null)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                    >
                      ✕
                    </button>
                    <div className="mb-4 border-b border-slate-100 pb-4">
                      <span className="text-[10px] font-black text-blue-600 tracking-widest uppercase block mb-1">Destino Seleccionado</span>
                      <h3 className="text-2xl font-black text-[#162b4e]">{paisSeleccionado.toUpperCase()}</h3>
                      <p className="text-sm text-slate-500 mt-1">{vuelosFiltrados.filter(v => v.pais_destino === paisSeleccionado).length} vuelos disponibles con tus filtros.</p>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      {renderVuelosCards(vuelosFiltrados.filter(v => v.pais_destino === paisSeleccionado), true)}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-center text-xs text-slate-500 font-medium mt-4">
              Selecciona un país en el mapa interactivo para enfocar los vuelos directos.
            </div>
          </div>
        ) : (
          <div className="p-6 lg:col-span-2 flex flex-col bg-white relative border-l border-slate-100 min-h-[450px] overflow-hidden">
            <div className="mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#162b4e]">Resultados de Búsqueda General</h3>
              <p className="text-xs text-slate-500">{vuelosFiltrados.length} opciones encontradas</p>
            </div>
            <div className="flex-1 overflow-hidden">
              {renderVuelosCards(vuelosFiltrados, false)}
            </div>
          </div>
        )}
      </div>

      {/* VENTANA EMERGENTE (MODAL) PARA SELECCIONAR PAÍSES VISITADOS */}
      {modalPaisesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-[#162b4e] text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Destinos Visitados</h3>
                <p className="text-xs text-blue-200">Marca los países que ya has visitado para excluirlos</p>
              </div>
              <button 
                onClick={() => setModalPaisesOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-950/50 hover:bg-blue-950 text-white font-bold transition"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[300px] overflow-y-auto">
              {Object.keys(window.PAISES_DATA || {}).map(pais => {
                const isVisited = paisesVisitados.includes(pais);
                return (
                  <label key={pais} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-200/60 cursor-pointer select-none transition">
                    <input 
                      type="checkbox"
                      checked={isVisited}
                      onChange={() => {
                        if (isVisited) {
                          setPaisesVisitados(paisesVisitados.filter(p => p !== pais));
                        } else {
                          setPaisesVisitados([...paisesVisitados, pais]);
                        }
                      }}
                      className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400 bg-white"
                    />
                    <span className="text-sm font-bold text-slate-700">{pais}</span>
                  </label>
                );
              })}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setModalPaisesOpen(false)}
                className="px-5 py-2.5 bg-[#162b4e] hover:bg-blue-950 text-white text-xs font-bold rounded-xl transition duration-150 shadow"
              >
                Confirmar y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
