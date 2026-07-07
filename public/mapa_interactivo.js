const { useState, useEffect } = React;
const { ComposableMap, Geographies, Geography } = window;

window.MapaInteractivo = function MapaInteractivo({ userBalance, vuelos, handleBookFlight, user }) {
  // Estados del Buscador Inteligente
  const [presupuesto, setPresupuesto] = useState(5000);
  const [gusto, setGusto] = useState('Todos');
  const [tiempoDisponible, setTiempoDisponible] = useState(72); // En horas
  const [vuelosFiltrados, setVuelosFiltrados] = useState([]);
  const [paisSeleccionado, setPaisSeleccionado] = useState(null);
  const [paisHover, setPaisHover] = useState(null);
  const [soloNoVisitados, setSoloNoVisitados] = useState(false);

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

    // ALGORITMO: Filtrar por Gusto, Presupuesto, No Visitados y calcular Tiempo Neto de Estancia
    const resultado = mapped.filter(vuelo => {
      const cumpleGusto = gusto === 'Todos' || vuelo.categoria_gustos === gusto;
      const cumplePresupuesto = vuelo.precio_monedas_oceanicas <= presupuesto;
      
      // El tiempo de vuelo es ida y vuelta (multiplicado por 2)
      const tiempoVueloTotal = vuelo.tiempo_vuelo_horas * 2;
      const cumpleTiempo = tiempoDisponible > tiempoVueloTotal;
      
      // Filtrar por no visitados
      const esNoVisitado = !soloNoVisitados || !user || !user.ciudadesVisitadas || !user.ciudadesVisitadas.includes(vuelo.ciudad_destino);

      return cumpleGusto && cumplePresupuesto && cumpleTiempo && esNoVisitado;
    }).map(vuelo => {
      const tiempoVueloTotal = vuelo.tiempo_vuelo_horas * 2;
      const tiempoNetoVisita = tiempoDisponible - tiempoVueloTotal;

      return {
        ...vuelo,
        tiempoNetoVisita,
        riesgoRetrasoHoras: (tiempoVueloTotal * 0.15).toFixed(1)
      };
    });

    setVuelosFiltrados(resultado);
  };

  useEffect(() => {
    ejecutarBuscadorInteligente();
  }, [presupuesto, gusto, tiempoDisponible, soloNoVisitados, vuelos, user]);

  return (
    <div className="space-y-6">
      {/* Contenedor Principal */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-3">
        
        {/* PANEL IZQUIERDO: FILTROS INTELIGENTES */}
        <div className="p-6 bg-[#162b4e] text-white flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-wide mb-2 flex items-center space-x-2">
              <i data-lucide="sliders-horizontal" className="w-5 h-5 text-blue-300"></i>
              <span>Buscador Inteligente</span>
            </h2>
            <p className="text-xs text-blue-200 mb-6">Aerolíneas Oceánicas — Encuentra tu destino ideal</p>
            
            <div className="space-y-5">
              {/* Filtro Gustos */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">¿Qué te gustaría experimentar?</label>
                <select 
                  value={gusto} 
                  onChange={(e) => setGusto(e.target.value)}
                  className="w-full bg-blue-950 border border-blue-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                >
                  <option value="Todos">Cualquier experiencia</option>
                  <option value="Playa">Playa 🏖️</option>
                  <option value="Montaña">Montaña 🏔️</option>
                  <option value="Desierto">Desierto 🌵</option>
                  <option value="Historia">Historia 🏛️</option>
                  <option value="Selva">Selva 🌴</option>
                </select>
              </div>

              {/* Filtro Presupuesto */}
              <div>
                <div className="flex justify-between text-xs font-semibold uppercase text-gray-300 mb-2">
                  <span>Presupuesto Máximo</span>
                  <span className="text-green-400 font-bold">{presupuesto} MO</span>
                </div>
                <input 
                  type="range" min="200" max="5000" step="50"
                  value={presupuesto}
                  onChange={(e) => setPresupuesto(parseInt(e.target.value))}
                  className="w-full accent-green-400 bg-blue-950 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Filtro Tiempo Disponible */}
              <div>
                <div className="flex justify-between text-xs font-semibold uppercase text-gray-300 mb-2">
                  <span>Tiempo Total de Viaje</span>
                  <span className="text-blue-300 font-bold">{tiempoDisponible} Horas</span>
                </div>
                <input 
                  type="range" min="12" max="168" step="4"
                  value={tiempoDisponible}
                  onChange={(e) => setTiempoDisponible(parseInt(e.target.value))}
                  className="w-full accent-blue-400 bg-blue-950 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Filtro Sólo No Visitados */}
              <div className="flex items-center space-x-3 py-2 border-t border-blue-900/50 mt-4">
                <input 
                  type="checkbox" 
                  id="soloNoVisitadosMap" 
                  checked={soloNoVisitados}
                  onChange={e => setSoloNoVisitados(e.target.checked)}
                  className="w-4 h-4 rounded border-blue-800 text-blue-600 focus:ring-blue-500 bg-blue-950"
                />
                <label htmlFor="soloNoVisitadosMap" className="text-xs font-semibold text-gray-300 cursor-pointer select-none">
                  Mostrar sólo destinos no visitados
                </label>
              </div>
            </div>
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
            <div className="flex items-center space-x-3 text-right">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                {paisHover ? `Destino: ${paisHover}` : 'Pasa el cursor para explorar'}
              </span>
              {paisSeleccionado && (
                <span className="text-[11px] bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-bold animate-pulse">
                  📍 Vuelos a {paisSeleccionado} enfocados
                </span>
              )}
            </div>
          </div>

          {/* Renderizado de la Región Geográfica */}
          <div className="w-full h-96 flex items-center justify-center my-auto pt-6">
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
                    <span className="text-sm">⚠️</span>
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
    </div>
  );
};
