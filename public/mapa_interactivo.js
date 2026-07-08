const { useState, useEffect, useRef } = React;
const { ComposableMap, Geographies, Geography } = window;

window.MapaInteractivo = function MapaInteractivo({ userBalance, vuelos, handleBookFlight, user }) {
  console.log("Vuelos recibidos en MapaInteractivo:", vuelos);
  // Estados del Buscador Inteligente
  const [presupuesto, setPresupuesto] = useState(userBalance || 5000);
  const [gusto, setGusto] = useState('Todos');
  const [diasDisponibles, setDiasDisponibles] = useState(3);
  const [diaSalida, setDiaSalida] = useState('2026-07-08');
  const [vuelosFiltrados, setVuelosFiltrados] = useState([]);
  const [paisSeleccionado, setPaisSeleccionado] = useState(null);
  const [paisHover, setPaisHover] = useState(null);
  const [soloNoVisitados, setSoloNoVisitados] = useState(false);
  const [paisesVisitados, setPaisesVisitados] = useState(['Chile']);
  const [modalPaisesOpen, setModalPaisesOpen] = useState(false);

  // Estados de Pestañas y Búsqueda General
  const [searchTab, setSearchTab] = useState('inteligente'); // 'inteligente' o 'general'
  const [origenInteligente, setOrigenInteligente] = useState('Todos');
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
  const [zoom, setZoom] = useState(1);
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
    setZoom(1);
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
    // Mapear los vuelos de la base de datos a la estructura del buscador
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

      // Mapeos específicos para consistencia de gustos
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

    const tiempoDisponible = (parseInt(diasDisponibles) || 0) * 24;

    let resultado = [];

    if (searchTab === 'inteligente') {
      resultado = mapped.filter(vuelo => {
        // Filtrar por lugar de salida (Buscador Inteligente)
        const cumpleOrigen = origenInteligente === 'Todos' || (vuelo.origen && vuelo.origen.includes(origenInteligente));
        
        const cumpleGusto = gusto === 'Todos' || vuelo.categoria_gustos === gusto;
        const cumplePresupuesto = vuelo.precio_monedas_oceanicas <= presupuesto;
        
        // El tiempo de vuelo es ida y vuelta (multiplicado por 2)
        const tiempoVueloTotal = vuelo.tiempo_vuelo_horas * 2;
        const cumpleTiempo = tiempoDisponible > tiempoVueloTotal;

        // Filtrar por el día seleccionado en el calendario (YYYY-MM-DD)
        const diaVuelo = vuelo.fecha_salida ? vuelo.fecha_salida.split('T')[0] : '';
        const cumpleFecha = diaVuelo === diaSalida;
        
        // Filtrar por no visitados (según países gestionados en la ventana emergente)
        const esNoVisitado = !soloNoVisitados || !paisesVisitados.includes(vuelo.pais_destino);

        return cumpleOrigen && cumpleGusto && cumplePresupuesto && cumpleTiempo && cumpleFecha && esNoVisitado;
      }).map(vuelo => {
        const tiempoVueloTotal = vuelo.tiempo_vuelo_horas * 2;
        const tiempoNetoVisita = tiempoDisponible - tiempoVueloTotal;

        return {
          ...vuelo,
          tiempoNetoVisita,
          riesgoRetrasoHoras: (tiempoVueloTotal * 0.15).toFixed(1)
        };
      });
    } else {
      // Buscador General
      resultado = mapped.filter(vuelo => {
        const cumpleOrigen = origenGeneral === 'Todos' || (vuelo.origen && vuelo.origen.includes(origenGeneral));
        const cumpleDestino = destinoGeneral === 'Todos' || (vuelo.destino_ciudad && vuelo.destino_ciudad.includes(destinoGeneral)) || (vuelo.destino_pais && vuelo.destino_pais.includes(destinoGeneral));
        
        const diaSalidaVuelo = vuelo.fecha_salida ? vuelo.fecha_salida.split('T')[0] : '';
        const cumpleSalida = !fechaSalidaGeneral || diaSalidaVuelo === fechaSalidaGeneral;
        
        const diaLlegadaVuelo = vuelo.fecha_llegada ? vuelo.fecha_llegada.split('T')[0] : '';
        const cumpleLlegada = !fechaLlegadaGeneral || diaLlegadaVuelo === fechaLlegadaGeneral;

        return cumpleOrigen && cumpleDestino && cumpleSalida && cumpleLlegada;
      }).map(vuelo => {
        const tiempoVueloTotal = vuelo.tiempo_vuelo_horas * 2;
        // Asignar estancia neta si hay datos válidos (sino 0)
        let tiempoNetoVisita = 0;
        if (vuelo.fecha_salida && vuelo.fecha_llegada) {
          const salidaMs = new Date(vuelo.fecha_salida).getTime();
          const llegadaMs = new Date(vuelo.fecha_llegada).getTime();
          tiempoNetoVisita = Math.max(0, (llegadaMs - salidaMs) / (1000 * 60 * 60) - tiempoVueloTotal);
        }

        return {
          ...vuelo,
          tiempoNetoVisita,
          riesgoRetrasoHoras: (tiempoVueloTotal * 0.15).toFixed(1)
        };
      });
    }

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
                    <option value="Todos">Cualquier origen</option>
                    {origenesDisponibles.map(ori => (
                      <option key={ori} value={ori}>{ori}</option>
                    ))}
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
                      { label: 'Mié 8', value: '2026-07-08' },
                      { label: 'Jue 9', value: '2026-07-09' },
                      { label: 'Vie 10', value: '2026-07-10' },
                      { label: 'Sáb 11', value: '2026-07-11' },
                      { label: 'Dom 12', value: '2026-07-12' }
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

        {/* PANEL CENTRAL: MAPA INTERACTIVO SVG (WHITENED / LIGHT MODE) */}
        <div className="p-6 lg:col-span-2 flex flex-col justify-between bg-white relative border-l border-slate-100 min-h-[450px]">
          <div className="w-full flex justify-between items-center mb-6 pt-2 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
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
            <div className="flex items-center space-x-3 text-right col-span-2">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                Destino: {paisHover || (paisSeleccionado ? paisSeleccionado.toUpperCase() : "Pasa el cursor para explorar")}
              </span>
              <span className="text-[11px] text-blue-600 font-extrabold tracking-wide">
                Escala: {(zoom * 100).toFixed(0)}%
              </span>
              {paisSeleccionado && (
                <span className="text-[11px] bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-bold animate-pulse">
                  Vuelos a {paisSeleccionado} enfocados
                </span>
              )}
            </div>
          </div>

          {/* Renderizado de la Región Geográfica con Zoom */}
          <div className="relative w-full h-96 flex items-center justify-center my-auto pt-6 overflow-hidden">
            
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
                cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
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
          </div>
          
          <div className="text-center text-xs text-slate-400 font-medium">
            Selecciona un país en el mapa interactivo para enfocar los vuelos directos.
          </div>
        </div>

      </div>

      {/* PANEL DE RECOMENDACIONES (ALGORITMO EN ACCIÓN - BRIGHT THEME) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            {paisSeleccionado ? `Vuelos sugeridos para: ${paisSeleccionado}` : 'Sugerencias personalizadas según tus filtros:'}
          </h3>
          <span className="text-xs bg-blue-50 text-[#162b4e] font-bold px-2.5 py-1 rounded-lg border border-blue-100">
            {vuelosFiltrados.filter(v => !paisSeleccionado || v.pais_destino === paisSeleccionado).length} opciones encontradas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[400px] overflow-y-auto pr-2">
          {vuelosFiltrados
            .filter(v => !paisSeleccionado || v.pais_destino === paisSeleccionado)
            .map((vuelo, index) => (
              <div key={index} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition duration-200">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-bold text-slate-800">{vuelo.ciudad_destino}, {vuelo.pais_destino}</h4>
                      <p className="text-xs text-blue-600 font-semibold">{vuelo.atractivo_turistico} • <span className="italic text-slate-500">{vuelo.categoria_gustos}</span></p>
                    </div>
                    <span className="font-extrabold text-[#162b4e] text-lg">{vuelo.precio_monedas_oceanicas} MO</span>
                  </div>

                  {/* Datos Calculados por el Algoritmo */}
                  <div className="bg-white border border-slate-100 rounded-xl p-3 space-y-1.5 text-xs text-slate-600 shadow-inner">
                    <div className="flex justify-between">
                      <span>Vuelo (Ida/Vuelta):</span>
                      <span className="font-semibold text-slate-700">{(vuelo.tiempo_vuelo_horas * 2).toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-1">
                      <span>Estancia Neta:</span>
                      <span className="font-bold text-emerald-600">{vuelo.tiempoNetoVisita.toFixed(1)} horas libres</span>
                    </div>
                  </div>

                  {/* Margen de advertencia por retrasos */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-700 leading-normal flex items-start space-x-1.5">
                    <span>Colchón para retrasos estimado: <strong>+{vuelo.riesgoRetrasoHoras}h</strong> recomendado.</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-end">
                  <button 
                    onClick={() => handleBookFlight(vuelo.id)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition duration-150 shadow"
                  >
                    Reservar Vuelo
                  </button>
                </div>
              </div>
            ))}

          {vuelosFiltrados.filter(v => !paisSeleccionado || v.pais_destino === paisSeleccionado).length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-400 text-sm font-medium">
              No se encontraron combinaciones de vuelos que respeten tu presupuesto y el tiempo mínimo neto de estancia.
            </div>
          )}
        </div>
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
