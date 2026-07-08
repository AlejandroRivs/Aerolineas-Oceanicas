// --- COMPONENTES SIMULADOS DE REACT-SIMPLE-MAPS ---
// Contexto para propagar la proyección cartográfica de forma limpia a cualquier profundidad del árbol
const MapContext = React.createContext();

window.ComposableMap = function ComposableMap({ projectionConfig, children, className }) {
  const width = 400;
  const height = 550;

  const scale = projectionConfig?.scale || 235;
  const center = projectionConfig?.center || [-67, -13];

  const projection = d3.geoMercator()
    .center(center)
    .scale(scale)
    .translate([width / 2, height / 2]);

  const pathGenerator = d3.geoPath().projection(projection);

  return (
    <MapContext.Provider value={{ pathGenerator }}>
      <svg viewBox={`0 0 ${width} ${height}`} className={className}>
        {children}
      </svg>
    </MapContext.Provider>
  );
};

window.Geographies = function Geographies({ children }) {
  const [geographies, setGeographies] = React.useState([]);

  React.useEffect(() => {
    const LATAM_ISO3 = [
      "ARG", "BOL", "BRA", "CHL", "COL", "CRI", "ECU", "SLV",
      "GTM", "HND", "MEX", "NIC", "PAN", "PRY", "PER", "URY", "VEN"
    ];

    fetch("https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
      .then(res => res.json())
      .then(data => {
        const latamFeatures = data.features.filter(f => LATAM_ISO3.includes(f.id));
        setGeographies(latamFeatures);
      })
      .catch(err => console.error("Error cargando GeoJSON del mapa:", err));
  }, []);

  return (
    <g>
      {children({ geographies })}
    </g>
  );
};

window.Geography = function Geography({ geography, onMouseEnter, onMouseLeave, onClick, style }) {
  const context = React.useContext(MapContext);
  const pathGenerator = context?.pathGenerator;

  const [isPressed, setIsPressed] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const d = pathGenerator ? pathGenerator(geography) : "";

  // Determinar los estilos basados en el estado del puntero
  let currentStyle = style?.default || {};
  if (isHovered) {
    currentStyle = { ...currentStyle, ...style?.hover };
  }
  if (isPressed) {
    currentStyle = { ...currentStyle, ...style?.pressed };
  }

  return (
    <path
      d={d}
      onMouseEnter={(e) => {
        setIsHovered(true);
        if (onMouseEnter) onMouseEnter(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        if (onMouseLeave) onMouseLeave(e);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={onClick}
      fill={currentStyle.fill}
      stroke={currentStyle.stroke}
      strokeWidth={currentStyle.strokeWidth}
      className="transition-all duration-200"
      style={{
        outline: currentStyle.outline || 'none',
        cursor: 'pointer'
      }}
    >
      <title>{geography.properties.name}</title>
    </path>
  );
};
