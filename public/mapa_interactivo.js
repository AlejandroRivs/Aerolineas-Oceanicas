// URL con la cartografía vectorial real y detallada de Latinoamérica
const LATAM_GEO_JSON = "https://githubusercontent.com";

window.MapaInteractivo = function({ onSeleccionarPais }) {
  // 1. Estados nativos para el control de interactividad
  const [geometrias, setGeometrias] = React.useState([]);
  const [paisHover, setPaisHover] = React.useState(null);
  const [paisSeleccionado, setPaisSeleccionado] = React.useState(null);
  
  // 2. Estados y funciones para el control y medidor de zoom solicitado
  const [zoom, setZoom] = React.useState(1);
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.5, 4));  // Máximo 400%
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.5, 1)); // Mínimo 100%
  const handleReset = () => setZoom(1);

  // 3. Efecto para cargar los polígonos geográficos de América Latina
  React.useEffect(() => {
    fetch(LATAM_GEO_JSON)
      .then(res => res.json())
      .then(data => {
        setGeometrias(data.features);
      })
      .catch(err => console.error("Error cargando mapas geográficos:", err));
  }, []);

  // 4. Configuración matemática de proyección D3 adaptada a la silueta de tu foto
  const width = 500;
  const height = 500;
  const projection = d3.geoMercator()
    .center([-66, -16]) // Centrado geográfico de Centro y Sudamérica
    .scale(210)
    .translate([width / 2, height / 2]);

  const pathGenerator = d3.geoPath().projection(projection);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 font-sans">
      
      {/* BARRA SUPERIOR DE ESTADO UI */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
        <span className="text-xs font-black bg-[#162b4e] text-white px-4 py-2 rounded-full uppercase tracking-wider shadow-sm">
          Mapa de América Latina
        </span>
        
        <div className="text-right">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
            Destino: {paisHover || (paisSeleccionado ? paisSeleccionado.toUpperCase() : "NINGUNO")}
          </span>
          {/* MEDIDOR DIGITAL DE ZOOM EN TIEMPO REAL */}
          <span className="text-[11px] text-blue-600 font-extrabold mt-0.5 tracking-wide block">
            Escala: {(zoom * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* CONTENEDOR DEL VISUALIZADOR GEOGRÁFICO */}
      <div className="relative w-full overflow-hidden bg-white rounded-xl p-4 flex items-center justify-center min-h-[480px]">
        
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

        {/* COMPONENTE MAPA CON ESCALA TRANSFORME DINÁMICA */}
        <div className="w-full flex items-center justify-center overflow-hidden">
          <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full h-auto max-h-[500px] transition-transform duration-300 ease-out origin-center"
            style={{ transform: `scale(${zoom})` }}
          >
            <g>
              {geometrias.map((geo, i) => {
                const nombrePais = geo.properties.name || geo.properties.NAME;
                const esHovered = paisHover === nombrePais;
                const esSelected = paisSeleccionado === nombrePais;

                return (
                  <path
                    key={i}
                    d={pathGenerator(geo)}
                    className="transition-all duration-200 cursor-pointer"
                    fill={esSelected ? "#10b981" : esHovered ? "#3b82f6" : "#162b4e"} 
                    stroke="#ffffff"
                    strokeWidth={0.5 / zoom}
                    onMouseEnter={() => setPaisHover(nombrePais)}
                    onMouseLeave={() => setPaisHover(null)}
                    onClick={() => {
                      setPaisSeleccionado(nombrePais);
                      if (onSeleccionarPais) onSeleccionarPais(nombrePais);
                    }}
                  />
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* PIE DE PÁGINA DESCRIPTIVO */}
      <p className="text-center text-xs text-gray-400 mt-4 tracking-wide font-medium">
        Selecciona un país en el mapa interactivo para enfocar los vuelos directos.
      </p>
    </div>
  );
};
