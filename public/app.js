const { useState, useEffect, useRef } = React;
const { MapaInteractivo } = window;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("mapa");
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  // Estados de Vuelos y Mapa
  const [vuelos, setVuelos] = useState([]);
  const [bookingFlight, setBookingFlight] = useState(null);
  const [passengerData, setPassengerData] = useState({
    nombres_completos: "",
    fecha_nacimiento: "",
    genero: "",
    tipo_documento: "Pasaporte",
    numero_documento: "",
    pais_emision: "",
    fecha_vencimiento: "",
    contacto_email: "",
    contacto_telefono: "",
    asiento: "Indiferente",
    asistencia_especial: ""
  });
  const [reservasUsuario, setReservasUsuario] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastReservation, setLastReservation] = useState(null);

  // Estados de Parking
  const [parkingSlots, setParkingSlots] = useState([]);
  const [tarifaParking, setTarifaParking] = useState(20);
  const [nuevaTarifaInput, setNuevaTarifaInput] = useState("");
  const [qrStep, setQrStep] = useState(1); // 1: Entrada, 2: Plaza, 3: Salida
  const [selectedParkingSlot, setSelectedParkingSlot] = useState("");
  const [parkingStatusMsg, setParkingStatusMsg] = useState("");
  const [myOcupation, setMyOcupation] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = useRef(null);

  // Estados de Incidencias
  const [incidencias, setIncidencias] = useState([]);
  const [nuevaIncidenciaText, setNuevaIncidenciaText] = useState("");
  const [nuevaIncidenciaCategoria, setNuevaIncidenciaCategoria] = useState("");
  const [incidenciaMsg, setIncidenciaMsg] = useState("");
  const [escalarComentario, setEscalarComentario] = useState("");
  const [comentarioNormal, setComentarioNormal] = useState("");
  const [activeTicketForEscalation, setActiveTicketForEscalation] = useState("");
  const [activeTicketForComment, setActiveTicketForComment] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [googleClientId, setGoogleClientId] = useState(null);

  // Cargar sesión al iniciar
  useEffect(() => {
    fetchSession();
    fetchVuelos();
    fetchParking();
    fetchIncidencias();
    fetchConfig();
  }, []);

  // Re-inicializar iconos de Lucide al renderizar las pestañas
  useEffect(() => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }, [activeTab, user]);

  const fetchReservasUsuario = async () => {
    try {
      const res = await fetch('/api/reservas');
      if (res.ok) {
        const data = await res.json();
        setReservasUsuario(data);
      }
    } catch (e) {
      console.error('Error al obtener reservas:', e);
    }
  };

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

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      setGoogleClientId(data.googleClientId);
    } catch (e) {
      console.error('Error al obtener config pública:', e);
    }
  };

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.loggedIn) {
        setUser(data.user);
        // Cargar reservas tras cargar la sesión del usuario
        fetchReservasUsuario();
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
      console.log("Vuelos cargados en app.js:", data);
      setVuelos(data);
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

  // Restaurar el estado de parking desde el backend al cargar la página (fix recarga)
  useEffect(() => {
    if (user && parkingSlots.length > 0) {
      const mySlot = parkingSlots.find(s => s.usuario_id === user.id && s.estado === 'Ocupado');
      if (mySlot) {
        setMyOcupation(mySlot);
        setSelectedParkingSlot(mySlot.identificador_plaza);
        // Si ya tiene plaza ocupada y el paso es 1 (recarga), ir al paso 3 directamente
        setQrStep(prev => prev === 1 ? 3 : prev);
        setParkingStatusMsg(`Plaza ${mySlot.identificador_plaza} activa. Escanea el QR de salida para liberar tu espacio.`);
      } else {
        setMyOcupation(null);
        // Solo resetear si no está en medio de un flujo activo
        setQrStep(prev => prev === 3 && !mySlot ? 1 : prev);
      }
    }
  }, [user, parkingSlots]);

  // Manejador de Login con correo y contraseña
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        fetchParking();
        fetchIncidencias();
        fetchReservasUsuario();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error al iniciar sesión: " + err.message);
    }
  };

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
        fetchReservasUsuario();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGoogleLogin = async () => {
    // Si está configurada la llave de Google real, usamos el SDK oficial de Google
    if (googleClientId && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            try {
              const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential })
              });
              const data = await res.json();
              if (res.ok) {
                setUser(data.user);
                if (data.isNewUser) {
                  setShowWelcomePopup(true);
                }
                fetchParking();
                fetchIncidencias();
                fetchReservasUsuario();
              } else {
                alert(data.error);
              }
            } catch (err) {
              console.error('Error al verificar token con el backend:', err);
            }
          }
        });
        window.google.accounts.id.prompt();
      } catch (err) {
        console.error('Error al inicializar Google Sign-In:', err);
      }
    } else {
      // Fallback de simulación para desarrollo local
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
          setShowWelcomePopup(true);
          fetchParking();
          fetchIncidencias();
          fetchReservasUsuario();
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setMyOcupation(null);
    setReservasUsuario([]);
  };

  // Reservar Vuelo o Paquete (Abre el Formulario Ampliado de Pasajero)
  const handleBookFlight = (item) => {
    if (!user) {
      alert("Por favor inicia sesión primero.");
      return;
    }
    
    let flightOrPackage = null;
    if (item && item.vueloIda) {
      flightOrPackage = item;
    } else {
      flightOrPackage = vuelos.find(v => v.id === item);
    }
    
    if (!flightOrPackage) return;

    setBookingFlight(flightOrPackage);
    setPassengerData({
      nombres_completos: user.nombre ? user.nombre.replace(" (Mock)", "") : "",
      fecha_nacimiento: "",
      genero: "",
      tipo_documento: "Pasaporte",
      numero_documento: "",
      pais_emision: "",
      fecha_vencimiento: "",
      contacto_email: user.email || "",
      contacto_telefono: "",
      asiento: "Indiferente",
      asistencia_especial: ""
    });
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!bookingFlight) return;

    if (!passengerData.nombres_completos || !passengerData.fecha_nacimiento || !passengerData.genero ||
        !passengerData.tipo_documento || !passengerData.numero_documento || !passengerData.pais_emision ||
        !passengerData.fecha_vencimiento || !passengerData.contacto_email || !passengerData.contacto_telefono) {
      alert("Por favor complete todos los campos obligatorios.");
      return;
    }

    try {
      const isPackage = !!bookingFlight.vueloIda;
      const bodyParams = isPackage 
        ? { vueloIdaId: bookingFlight.vueloIda.id, vueloVueltaId: bookingFlight.vueloVuelta.id, datosPasajero: passengerData }
        : { vueloId: bookingFlight.id, datosPasajero: passengerData };

      const res = await fetch('/api/vuelos/reservar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyParams)
      });
      const data = await res.json();
      if (res.ok) {
        setLastReservation({
          ...data.reserva,
          vuelo: isPackage ? {
            codigo_vuelo: `${bookingFlight.vueloIda.codigo_vuelo} / ${bookingFlight.vueloVuelta.codigo_vuelo}`,
            origen: bookingFlight.vueloIda.origen,
            destino_ciudad: bookingFlight.vueloIda.destino_ciudad,
            fecha_salida: bookingFlight.vueloIda.fecha_salida,
            fecha_llegada: bookingFlight.vueloVuelta.fecha_salida
          } : bookingFlight,
          datos_pasajero: passengerData
        });
        setShowConfirmation(true);
        setBookingFlight(null);
        fetchSession();
        fetchVuelos();
        fetchReservasUsuario();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error al procesar la reserva: " + err.message);
    }
  };

  // Lógica de Escaneo de Cámara Real
  const startScanning = () => {
    if (!user) {
      alert("Inicie sesión primero.");
      return;
    }
    setScannerActive(true);
    setParkingStatusMsg("");
    
    setTimeout(() => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;
        
        const config = { fps: 15, qrbox: { width: 250, height: 250 } };
        
        html5QrCode.start(
          { facingMode: "environment" },
          config,
          async (decodedText) => {
            try {
              await html5QrCode.stop();
              setScannerActive(false);
            } catch (err) {
              console.error("Error al detener cámara:", err);
            }
            processQRData(decodedText);
          },
          (errorMessage) => {
            // Ignorar errores continuos de renderizado de frames
          }
        ).catch(err => {
          alert("No se pudo iniciar la cámara: " + err.message);
          setScannerActive(false);
        });
      } catch (err) {
        alert("Error de inicialización del escáner: " + err.message);
        setScannerActive(false);
      }
    }, 300);
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.error(err);
      }
      scannerRef.current = null;
    }
    setScannerActive(false);
  };

  // Procesamiento del valor del código QR (Plaza ID: A-1, A-2, etc.)
  const processQRData = async (plazaIdRaw) => {
    const plazaId = plazaIdRaw.trim();
    if (!plazaId) return;

    try {
      if (qrStep === 1) {
        // Solo acepta el QR de entrada general
        if (plazaId !== 'ACCESO_ENTRADA') {
          alert('Escanea el código QR de entrada del panel de proyección para iniciar.');
          return;
        }
        const res = await fetch('/api/parking/qr-entrada', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plazaId })
        });
        const data = await res.json();
        if (res.ok) {
          setParkingStatusMsg('Acceso autorizado. Dirígete a cualquier plaza libre y escanea el QR físico de tu espacio.');
          setQrStep(2);
        } else {
          alert('Error: ' + data.error);
        }
      } else if (qrStep === 2) {
        // Rechaza si alguien intenta escanear el QR de entrada de nuevo
        if (plazaId === 'ACCESO_ENTRADA') {
          alert('Ya iniciaste el acceso. Escanea el QR físico de la plaza que deseas ocupar.');
          return;
        }
        // El QR escaneado es la plaza elegida: aquí se registra y cobra
        const res = await fetch('/api/parking/qr-plaza', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plazaId })
        });
        const data = await res.json();
        if (res.ok) {
          setSelectedParkingSlot(plazaId);
          setParkingStatusMsg(`Plaza ${plazaId} registrada. Cobro de ${tarifaParking} MO realizado. Listo para cuando decidas salir.`);
          setQrStep(3);
          fetchParking();
          fetchSession();
        } else {
          alert('Error: ' + data.error);
        }
      } else if (qrStep === 3) {
        const plazaToRelease = (plazaId === 'ACCESO_SALIDA') ? selectedParkingSlot : plazaId;
        if (plazaToRelease !== selectedParkingSlot) {
          alert(`Plaza incorrecta para salida. Tu auto está registrado en la plaza ${selectedParkingSlot}.`);
          return;
        }
        const res = await fetch('/api/parking/qr-salida', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plazaId: plazaToRelease })
        });
        const data = await res.json();
        if (res.ok) {
          setParkingStatusMsg('Salida autorizada. Plaza liberada con éxito.');
          setQrStep(1);
          setSelectedParkingSlot('');
          setMyOcupation(null);
          fetchParking();
        } else {
          alert('Error: ' + data.error);
        }
      }
    } catch (e) {
      alert("Error al procesar el código QR: " + e.message);
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
    if (!nuevaIncidenciaText.trim() || !nuevaIncidenciaCategoria) return;
    try {
      const res = await fetch('/api/incidencias/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion: nuevaIncidenciaText, categoria: nuevaIncidenciaCategoria })
      });
      const data = await res.json();
      if (res.ok) {
        setNuevaIncidenciaText("");
        setNuevaIncidenciaCategoria("");
        setIncidenciaMsg("Caso reportado con éxito.");
        fetchIncidencias();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Comentar caso
  const handleComentarIncidencia = async (e, ticketCodigo) => {
    e.preventDefault();
    if (!comentarioNormal.trim()) return;
    try {
      const res = await fetch('/api/incidencias/comentar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCodigo, comentario: comentarioNormal })
      });
      if (res.ok) {
        setComentarioNormal("");
        setActiveTicketForComment("");
        fetchIncidencias();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Cerrar caso
  const handleCerrarIncidencia = async (ticketCodigo) => {
    try {
      const res = await fetch('/api/incidencias/cerrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCodigo })
      });
      if (res.ok) {
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-slate-50">
        <div className="w-12 h-12 border-4 border-[#162b4e] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#162b4e] font-semibold">Cargando Plataforma...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#162b4e]/40 p-4 font-sans">
        <div className="w-full max-w-md bg-[#162b4e] border border-blue-900/80 p-8 rounded-3xl shadow-2xl relative overflow-hidden text-white">
          {/* Glow effect */}
          <div className="absolute -top-16 -left-16 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/10 text-blue-400 border border-blue-500/30 mb-4">
              <i data-lucide="shield-check" className="w-8 h-8 text-emerald-400"></i>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Inicio de Sesión</h1>
            <p className="text-xs text-blue-200 mt-2">Ingrese sus credenciales de rol o use Google para acceder.</p>
          </div>

          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-blue-300 mb-2">Correo Electrónico</label>
              <input 
                type="email" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required 
                placeholder="usuario@oceanica.com" 
                className="w-full bg-slate-900/60 border border-blue-900/60 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500 transition duration-150 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-blue-300 mb-2">Contraseña</label>
              <input 
                type="password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required 
                placeholder="••••••••" 
                className="w-full bg-slate-900/60 border border-blue-900/60 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500 transition duration-150 text-sm"
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition duration-200 shadow-lg flex items-center justify-center space-x-2 text-sm"
            >
              <span>Ingresar</span>
            </button>
          </form>

          <div className="relative my-6 flex items-center">
            <div className="flex-grow border-t border-blue-900/60"></div>
            <span className="flex-shrink mx-4 text-xs text-blue-300 uppercase font-semibold">O</span>
            <div className="flex-grow border-t border-blue-900/60"></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full py-3 bg-white hover:bg-slate-100 text-[#162b4e] font-bold rounded-xl transition duration-150 text-xs shadow-md flex items-center justify-center space-x-2 border border-slate-200"
          >
            <svg className="w-4 h-4 fill-current text-rose-500" viewBox="0 0 24 24">
              <path d="M12.24 10.285V13.4h6.887c-.648 2.41-2.519 4.113-5.136 4.113-3.44 0-6.228-2.77-6.228-6.19 0-3.42 2.787-6.19 6.228-6.19 1.493 0 2.87.52 3.96 1.488l2.45-2.45c-1.724-1.616-3.99-2.6-6.41-2.6C7.14 1.666 3 5.807 3 10.909c0 5.103 4.14 9.243 9.24 9.243 5.34 0 9.07-3.754 9.07-9.224 0-.61-.065-1.196-.183-1.643H12.24z"/>
            </svg>
            <span>Acceder con Google</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#162b4e]/15 via-white to-blue-50/30 text-slate-800 flex flex-col font-sans">
      
      {/* Barra de Navegación Superior */}
      <header className="bg-[#162b4e] border-b border-blue-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
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
                  <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-200 text-[10px] font-bold border border-blue-800">
                    {user.rol}
                  </span>
                  <span className="font-bold text-xs text-emerald-400">
                    Saldo: {parseFloat(user.saldo).toLocaleString()} MO
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl border border-blue-850 bg-blue-950/50 flex items-center justify-center shadow-sm">
                 <i data-lucide="user" className="w-5 h-5 text-blue-200"></i>
              </div>
              <button 
                onClick={handleLogout}
                className="px-3.5 py-2 bg-[#D94E1F] hover:bg-[#b83f16] text-white text-xs font-bold rounded-xl transition duration-150 shadow"
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
        <aside className="w-full md:w-64 border-r border-blue-900 bg-[#162b4e] p-6 space-y-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-blue-200 block mb-4">Menú de Navegación</span>
            
            <button 
              onClick={() => setActiveTab("mapa")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition duration-150 ${
                activeTab === "mapa" ? "bg-slate-100 text-[#162b4e] border-l-4 border-[#162b4e] shadow-sm" : "hover:bg-blue-900/40 text-white hover:text-white"
              }`}
            >
              <i data-lucide="map" className={`w-4 h-4 ${activeTab === "mapa" ? "text-[#162b4e]" : "text-white"}`}></i>
              <span>Mapa & Vuelos</span>
            </button>

            <button 
              onClick={() => setActiveTab("parking")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition duration-150 ${
                activeTab === "parking" ? "bg-slate-100 text-[#162b4e] border-l-4 border-[#162b4e] shadow-sm" : "hover:bg-blue-900/40 text-white hover:text-white"
              }`}
            >
              <i data-lucide="square-parking" className={`w-4 h-4 ${activeTab === "parking" ? "text-[#162b4e]" : "text-white"}`}></i>
              <span>Aparcamiento QR</span>
            </button>

            <button 
              onClick={() => setActiveTab("incidencias")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition duration-150 ${
                activeTab === "incidencias" ? "bg-slate-100 text-[#162b4e] border-l-4 border-[#162b4e] shadow-sm" : "hover:bg-blue-900/40 text-white hover:text-white"
              }`}
            >
              <i data-lucide="ticket" className={`w-4 h-4 ${activeTab === "incidencias" ? "text-[#162b4e]" : "text-white"}`}></i>
              <span>Soporte</span>
            </button>

            {user && (
              <button 
                onClick={() => setActiveTab("reservas")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition duration-150 ${
                  activeTab === "reservas" ? "bg-slate-100 text-[#162b4e] border-l-4 border-[#162b4e] shadow-sm" : "hover:bg-blue-900/40 text-white hover:text-white"
                }`}
              >
                <i data-lucide="briefcase" className={`w-4 h-4 ${activeTab === "reservas" ? "text-[#162b4e]" : "text-white"}`}></i>
                <span>Mis Reservas</span>
              </button>
            )}

            {user && user.rol === 'Administrador' && (
              <button 
                onClick={() => setActiveTab("admin")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition duration-150 ${
                  activeTab === "admin" ? "bg-slate-100 text-[#162b4e] border-l-4 border-[#162b4e] shadow-sm" : "hover:bg-blue-900/40 text-white hover:text-white"
                }`}
              >
                <i data-lucide="shield" className={`w-4 h-4 ${activeTab === "admin" ? "text-[#162b4e]" : "text-white"}`}></i>
                <span>Consola Admin</span>
              </button>
            )}
          </div>

        </aside>

        {/* Área de Contenido Principal */}
        <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto">
          
          {/* TAB 1: MAPA INTERACTIVO Y VUELOS */}
          {activeTab === "mapa" && (
            <MapaInteractivo 
              userBalance={user ? user.saldo : 5000}
              vuelos={vuelos}
              handleBookFlight={handleBookFlight}
              user={user}
            />
          )}

          {/* TAB DE RESERVAS DEL USUARIO */}
          {activeTab === "reservas" && user && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-2xl font-black text-[#162b4e]">Mis Reservas</h2>
                  <p className="text-xs text-slate-400 mt-1">Historial y estado de tus vuelos programados.</p>
                </div>
                <button 
                  onClick={fetchReservasUsuario}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#162b4e] font-bold rounded-xl text-xs transition border border-slate-200"
                >
                  Actualizar historial
                </button>
              </div>

              {reservasUsuario.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-400 text-sm font-medium shadow-sm">
                  Aún no tienes ninguna reserva registrada.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {reservasUsuario.map((reserva) => {
                    const vuelo = reserva.vuelo || {};
                    const pasajero = reserva.datos_pasajero || {};
                    
                    return (
                      <div key={reserva.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md hover:shadow-lg transition relative overflow-hidden flex flex-col md:flex-row justify-between gap-6">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#162b4e]"></div>
                        
                        {/* Info del Vuelo */}
                        <div className="flex-1 space-y-4 md:border-r md:border-slate-100 md:pr-6">
                          <div>
                            <span className="text-[10px] font-black text-blue-600 tracking-widest uppercase bg-blue-50 px-2 py-0.5 rounded-full inline-block mb-2">
                              {vuelo.codigo_vuelo || 'Código'}
                            </span>
                            <div className="flex items-center space-x-2 text-[#162b4e]">
                              <span className="text-base font-bold">{vuelo.origen}</span>
                              <span className="text-sm text-slate-400">→</span>
                              <span className="text-base font-bold">{vuelo.destino_ciudad}</span>
                            </div>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">{vuelo.destino_pais}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Salida</span>
                              <span className="font-bold text-slate-700">{formatFecha(vuelo.fecha_salida)}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Regreso / Llegada</span>
                              <span className="font-bold text-slate-700">{formatFecha(vuelo.fecha_llegada)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Info del Pasajero */}
                        <div className="flex-1 space-y-3 md:border-r md:border-slate-100 md:pr-6">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Detalles del Pasajero</span>
                          {pasajero.nombres_completos ? (
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="col-span-2">
                                <span className="block text-[9px] uppercase font-bold text-slate-400">Nombre Completo</span>
                                <span className="font-bold text-slate-800">{pasajero.nombres_completos}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] uppercase font-bold text-slate-400">Documento</span>
                                <span className="font-bold text-slate-700">{pasajero.tipo_documento}: {pasajero.numero_documento}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] uppercase font-bold text-slate-400">Género / Nacimiento</span>
                                <span className="font-bold text-slate-700">{pasajero.genero} • {pasajero.fecha_nacimiento}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] uppercase font-bold text-slate-400">Teléfono</span>
                                <span className="font-bold text-slate-700">{pasajero.contacto_telefono}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] uppercase font-bold text-slate-400">Asiento</span>
                                <span className="font-bold text-slate-700">{pasajero.asiento}</span>
                              </div>
                              {pasajero.asistencia_especial && (
                                <div className="col-span-2">
                                  <span className="block text-[9px] uppercase font-bold text-slate-400">Asistencia Especial</span>
                                  <span className="font-bold text-amber-700">{pasajero.asistencia_especial}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 font-medium">No se registraron datos de pasajero adicionales.</span>
                          )}
                        </div>

                        {/* Info del Pago / Estado */}
                        <div className="flex flex-col justify-between items-end text-right min-w-[120px]">
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Monto Pagado</span>
                            <span className="font-black text-emerald-600 text-lg">{reserva.monto_pagado} MO</span>
                          </div>
                          <div className="mt-4 md:mt-0 text-right">
                            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Estado de Reserva</span>
                            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold inline-block">
                              {reserva.estado}
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: APARCAMIENTO QR */}
          {activeTab === "parking" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Control QR de Acceso */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-md space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#162b4e] flex items-center space-x-2">
                      <i data-lucide="qr-code" className="w-5 h-5 text-[#162b4e]"></i>
                      <span>Acceso QR de Parking</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Usa la cámara de tu dispositivo para el flujo de acceso QR.</p>
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
                    {scannerActive ? (
                      <div className="space-y-4">
                        <div id="reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-black"></div>
                        <button 
                          onClick={stopScanning}
                          className="w-full py-3 bg-[#D94E1F] hover:bg-[#b83f16] text-white font-bold rounded-xl transition duration-150 shadow-md text-xs uppercase"
                        >
                          Cancelar Escaneo
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {qrStep === 1 && (
                          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center space-y-1">
                            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Paso 1: Entrada al Parking</p>
                            <p className="text-[10px] text-slate-400 leading-normal">Escanea el QR de entrada del panel de proyeccion para habilitar el acceso.</p>
                          </div>
                        )}

                        {qrStep === 2 && (
                          <div className="bg-emerald-50 border-2 border-emerald-400 p-4 rounded-xl text-center space-y-2">
                            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Paso 2: Elige tu Plaza</p>
                            <p className="text-sm font-bold text-[#162b4e]">Acceso Autorizado</p>
                            <p className="text-[10px] text-emerald-700 font-semibold leading-normal">Dirígete a cualquier plaza disponible (verde) en el panel y escanea el QR físico de ese espacio. El cobro de {tarifaParking} MO se realizará al registrar tu plaza.</p>
                          </div>
                        )}

                        {qrStep === 3 && (
                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center space-y-1">
                            <p className="text-xs text-slate-500 font-semibold">Paso 3: Salida del Parking</p>
                            <p className="text-sm font-bold text-[#162b4e]">Plaza a Liberar: {selectedParkingSlot}</p>
                            <p className="text-[10px] text-slate-400 leading-normal">Escanea el código QR de la barrera de salida para liberar la plaza.</p>
                          </div>
                        )}

                        <button 
                          onClick={startScanning}
                          className="w-full py-3 bg-[#162b4e] hover:bg-[#0f1f3a] text-white font-bold rounded-xl transition duration-150 shadow-md text-xs uppercase"
                        >
                          {qrStep === 1 ? 'Iniciar Cámara - Entrada' : qrStep === 2 ? 'Iniciar Cámara - Seleccionar Plaza' : 'Iniciar Cámara - Salida'}
                        </button>


                      </div>
                    )}

                    {parkingStatusMsg && (
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-[#162b4e] leading-normal">
                        {parkingStatusMsg}
                      </div>
                    )}
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

          {/* TAB 3: SOPORTE */}
          {activeTab === "incidencias" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Crear Incidencia */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-md space-y-4 flex flex-col">
                  <div>
                    <h2 className="text-xl font-bold text-[#162b4e]">Centro de Ayuda</h2>
                    <p className="text-xs text-slate-400 mt-1">Soporte técnico y reporte de problemas operativos.</p>
                    <form onSubmit={handleCrearIncidencia} className="space-y-4 mt-6">
                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Categoría</label>
                        <select
                          required
                          value={nuevaIncidenciaCategoria}
                          onChange={e => setNuevaIncidenciaCategoria(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#162b4e] rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                        >
                          <option value="">Seleccione un módulo...</option>
                          <option value="Vuelos">Vuelos</option>
                          <option value="Reservas">Reservas</option>
                          <option value="Buscador Inteligente">Buscador Inteligente</option>
                          <option value="Aparcamiento QR">Aparcamiento QR</option>
                          <option value="General">General</option>
                        </select>
                      </div>

                      {/* Base de Conocimientos (Autoayuda) */}
                      {nuevaIncidenciaCategoria === 'Buscador Inteligente' && (
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-800">
                          <strong>💡 Sugerencia rápida:</strong> ¿Buscas saber la duración de tu paquete? Recuerda que el buscador automático empareja vuelos que coincidan exactamente con la cantidad de días que elegiste en el filtro.
                        </div>
                      )}
                      {nuevaIncidenciaCategoria === 'Aparcamiento QR' && (
                        <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs text-rose-800">
                          <strong>⚠️ Atención:</strong> Si tienes problemas en la barrera, este ticket será marcado como prioridad CRÍTICA y escalado de inmediato.
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Describa su incidencia</label>
                        <textarea 
                          rows="4"
                          required
                          value={nuevaIncidenciaText}
                          onChange={e => setNuevaIncidenciaText(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#162b4e] rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white text-xs"
                          placeholder="Detalle el problema con fecha y lugar..."
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
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-600 text-center mt-auto">
                      {incidenciaMsg}
                    </div>
                  )}
                </div>

                {/* Bandeja de Casos */}
                <div className="xl:col-span-2 bg-white border border-slate-200 p-6 rounded-3xl shadow-md space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#162b4e]">Mesa de Ayuda (Tickets)</h3>
                    <p className="text-xs text-slate-400 mt-1">Gestión y trazabilidad de incidencias.</p>
                  </div>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {incidencias.map((ticket) => {
                      const canEscalate = 
                        (user && user.rol === 'Servicio al Cliente' && ticket.estado_actual === 'Abierto') ||
                        (user && user.rol === 'Gerente' && ticket.estado_actual === 'Escalado a Gerente');
                      
                      const isOwner = user && ticket.cliente_id === user.id;
                      const canClose = ticket.estado_actual !== 'Cerrado' && (isOwner || (user && ['Servicio al Cliente', 'Gerente', 'Administrador'].includes(user.rol)));
                      const canComment = ticket.estado_actual !== 'Cerrado' && user;

                      const priorityColor = ticket.nivel_prioridad === 'Crítica' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                                           ticket.nivel_prioridad === 'Alta' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                           'bg-blue-100 text-blue-800 border-blue-300';

                      return (
                        <div key={ticket.ticket_codigo} className={`bg-slate-50 border ${ticket.nivel_prioridad === 'Crítica' ? 'border-rose-200' : 'border-slate-200'} p-5 rounded-2xl space-y-4`}>
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-xs font-bold text-[#162b4e] shadow-sm">
                                  {ticket.ticket_codigo}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${priorityColor}`}>
                                  {ticket.nivel_prioridad || 'Media'}
                                </span>
                                <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                  {ticket.categoria || 'General'}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-1 block">Creado: {new Date(ticket.fecha_creacion).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full border text-xs font-bold ${ticket.estado_actual === 'Cerrado' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-blue-50 border-blue-200 text-[#162b4e]'}`}>
                                {ticket.estado_actual}
                              </span>
                              {canClose && (
                                <button onClick={() => handleCerrarIncidencia(ticket.ticket_codigo)} className="text-[10px] font-bold text-rose-500 hover:text-rose-700 underline">
                                  Cerrar Ticket
                                </button>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-slate-700 leading-normal bg-white p-3 rounded-xl border border-slate-100 font-medium">
                            {ticket.descripcion_problema}
                          </p>

                          <div className="space-y-2 border-t border-slate-200/60 pt-3">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Historial de Trazabilidad</span>
                            {ticket.historial_estados?.map((log, idx) => (
                              <div key={idx} className={`bg-white p-2.5 rounded-lg border ${log.estado === 'Cerrado' ? 'border-emerald-200' : 'border-slate-150'} text-[10px] space-y-1 shadow-sm`}>
                                <div className="flex justify-between font-bold text-slate-600">
                                  <span>{log.estado} <span className="text-slate-400">({log.usuario_nombre})</span></span>
                                  <span className="text-slate-400 font-medium">{new Date(log.fecha).toLocaleString()}</span>
                                </div>
                                <p className="text-slate-600 font-medium break-words">"{log.comentario}"</p>
                              </div>
                            ))}
                          </div>

                          {canComment && (
                            <div className="pt-2">
                              {activeTicketForComment === ticket.ticket_codigo ? (
                                <form onSubmit={(e) => handleComentarIncidencia(e, ticket.ticket_codigo)} className="space-y-2">
                                  <input 
                                    type="text" 
                                    placeholder="Agrega una respuesta al cliente..." 
                                    value={comentarioNormal}
                                    onChange={e => setComentarioNormal(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                                  />
                                  <div className="flex justify-end space-x-2">
                                    <button 
                                      type="button" 
                                      onClick={() => setActiveTicketForComment("")}
                                      className="px-3 py-1.5 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold"
                                    >
                                      Cancelar
                                    </button>
                                    <button 
                                      type="submit" 
                                      className="px-3 py-1.5 bg-[#162b4e] text-white rounded-lg text-[10px] font-bold shadow hover:bg-[#0f1f3a]"
                                    >
                                      Enviar Respuesta
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <div className="flex space-x-2">
                                  <button 
                                    onClick={() => setActiveTicketForComment(ticket.ticket_codigo)}
                                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-[10px] transition shadow-sm"
                                  >
                                    Responder
                                  </button>
                                  
                                  {canEscalate && (
                                    <>
                                      {activeTicketForEscalation === ticket.ticket_codigo ? (
                                        <form onSubmit={handleEscalarIncidencia} className="flex-1 space-y-2 ml-2">
                                          <input 
                                            type="text" 
                                            placeholder="Motivo de escalación..." 
                                            value={escalarComentario}
                                            onChange={e => setEscalarComentario(e.target.value)}
                                            className="w-full bg-white border border-rose-200 rounded-lg px-3 py-1.5 text-[10px] text-slate-900 focus:outline-none"
                                          />
                                          <div className="flex justify-end space-x-2">
                                            <button 
                                              type="button" 
                                              onClick={() => setActiveTicketForEscalation("")}
                                              className="px-2 py-1 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold"
                                            >
                                              Cancelar
                                            </button>
                                            <button 
                                              type="submit" 
                                              className="px-2 py-1 bg-rose-500 text-white rounded-lg text-[10px] font-bold shadow"
                                            >
                                              Confirmar Escalar
                                            </button>
                                          </div>
                                        </form>
                                      ) : (
                                        <button 
                                          onClick={() => setActiveTicketForEscalation(ticket.ticket_codigo)}
                                          className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-xl text-[10px] transition shadow-sm border border-rose-200"
                                        >
                                          Escalar a Superior
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
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

      {/* POPUP DE BIENVENIDA */}
      {showWelcomePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl border border-blue-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 border border-blue-100">
              <i data-lucide="gift" className="w-8 h-8 text-[#162b4e]"></i>
            </div>
            <h3 className="text-2xl font-black text-[#162b4e] mb-2">¡Bienvenido a Bordo!</h3>
            <p className="text-sm text-slate-500 mb-6">Hemos depositado en tu Billetera Oceánica un bono inicial para que comiences tu aventura.</p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 w-full mb-6">
              <span className="block text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Bono Recibido</span>
              <span className="block text-3xl font-black text-[#162b4e]">+5,000 MO</span>
            </div>
            <button 
              onClick={() => setShowWelcomePopup(false)}
              className="w-full py-3 bg-[#162b4e] hover:bg-blue-900 text-white font-bold rounded-xl transition duration-200 shadow-md"
            >
              ¡Empezar a Explorar!
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE FORMULARIO DE RESERVA DETALLADO */}
      {bookingFlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-100 my-8">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-[#162b4e]">Datos del Pasajero y Reserva</h3>
                <p className="text-xs text-slate-400 mt-1">Vuelo: {bookingFlight.origen} → {bookingFlight.destino_ciudad} ({bookingFlight.codigo_vuelo})</p>
              </div>
              <button 
                onClick={() => setBookingFlight(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-6">
              {/* Sección 1: Datos del Pasajero */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600">1. Información del Pasajero</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Nombres y Apellidos Completos *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Tal como aparecen en su documento"
                      value={passengerData.nombres_completos}
                      onChange={e => setPassengerData({...passengerData, nombres_completos: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#162b4e] rounded-xl px-4 py-2.5 text-xs text-slate-950 focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Fecha de Nacimiento *</label>
                      <input 
                        type="date" 
                        required
                        value={passengerData.fecha_nacimiento}
                        onChange={e => setPassengerData({...passengerData, fecha_nacimiento: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#162b4e] rounded-xl px-3 py-2 text-xs text-slate-950 focus:outline-none focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Género *</label>
                      <select 
                        required
                        value={passengerData.genero}
                        onChange={e => setPassengerData({...passengerData, genero: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#162b4e] rounded-xl px-3 py-2.5 text-xs text-slate-950 focus:outline-none focus:bg-white"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 2: Documento de Identidad */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600">2. Documento de Identidad</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Tipo de Documento *</label>
                      <select 
                        required
                        value={passengerData.tipo_documento}
                        onChange={e => setPassengerData({...passengerData, tipo_documento: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#162b4e] rounded-xl px-3 py-2.5 text-xs text-slate-950 focus:outline-none focus:bg-white"
                      >
                        <option value="Pasaporte">Pasaporte</option>
                        <option value="DNI">DNI</option>
                        <option value="Identificación oficial">Identificación Oficial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Número de Documento *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Número"
                        value={passengerData.numero_documento}
                        onChange={e => setPassengerData({...passengerData, numero_documento: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#162b4e] rounded-xl px-4 py-2.5 text-xs text-slate-950 focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">País de Emisión *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ej. Guatemala"
                        value={passengerData.pais_emision}
                        onChange={e => setPassengerData({...passengerData, pais_emision: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#162b4e] rounded-xl px-4 py-2.5 text-xs text-slate-950 focus:outline-none focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Fecha de Vencimiento *</label>
                      <input 
                        type="date" 
                        required
                        value={passengerData.fecha_vencimiento}
                        onChange={e => setPassengerData({...passengerData, fecha_vencimiento: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#162b4e] rounded-xl px-3 py-2 text-xs text-slate-950 focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 3: Contacto */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600">3. Información de Contacto</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Correo Electrónico *</label>
                    <input 
                      type="email" 
                      required
                      placeholder="correo@ejemplo.com"
                      value={passengerData.contacto_email}
                      onChange={e => setPassengerData({...passengerData, contacto_email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#162b4e] rounded-xl px-4 py-2.5 text-xs text-slate-950 focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Teléfono Móvil (Internacional) *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="Ej. +502 4589 7412"
                      value={passengerData.contacto_telefono}
                      onChange={e => setPassengerData({...passengerData, contacto_telefono: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#162b4e] rounded-xl px-4 py-2.5 text-xs text-slate-950 focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 4: Preferencias (Opcionales) */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600">4. Preferencias de Vuelo (Opcionales)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Selección de Asiento</label>
                    <select 
                      value={passengerData.asiento}
                      onChange={e => setPassengerData({...passengerData, asiento: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#162b4e] rounded-xl px-3 py-2.5 text-xs text-slate-950 focus:outline-none focus:bg-white"
                    >
                      <option value="Indiferente">Indiferente</option>
                      <option value="Ventana">Ventana</option>
                      <option value="Pasillo">Pasillo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Asistencia Especial</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Silla de ruedas, ayuda visual o auditiva..."
                      value={passengerData.asistencia_especial}
                      onChange={e => setPassengerData({...passengerData, asistencia_especial: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#162b4e] rounded-xl px-4 py-2.5 text-xs text-slate-950 focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setBookingFlight(null)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-3 bg-[#162b4e] hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition shadow-md"
                >
                  Proceder con el Pago ({bookingFlight.precio_monedas || bookingFlight.precio || 0} MO)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE RESERVA REDISEÑADO */}
      {showConfirmation && lastReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
            {/* Top decorative gradient line */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-blue-600"></div>

            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100 mt-2">
              <i data-lucide="check-circle" className="w-8 h-8 text-emerald-500"></i>
            </div>
            
            <h3 className="text-2xl font-black text-[#162b4e] mb-1">Reserva Confirmada</h3>
            <p className="text-xs text-slate-400 mb-6">Su reservación ha sido procesada de manera exitosa y debitada de su saldo.</p>
            
            {/* Detalles del ticket */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 w-full text-left space-y-4 mb-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Código de Vuelo</span>
                  <span className="block font-extrabold text-sm text-[#162b4e]">{lastReservation.vuelo?.codigo_vuelo}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Transacción</span>
                  <span className="block font-bold text-xs text-slate-600">Confirmada</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Origen</span>
                  <span className="block font-bold text-xs text-[#162b4e]">{lastReservation.vuelo?.origen}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Destino</span>
                  <span className="block font-bold text-xs text-[#162b4e]">{lastReservation.vuelo?.destino_ciudad}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Salida</span>
                  <span className="block font-bold text-xs text-slate-700">{formatFecha(lastReservation.vuelo?.fecha_salida)}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Regreso / Llegada</span>
                  <span className="block font-bold text-xs text-slate-700">{formatFecha(lastReservation.vuelo?.fecha_llegada)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60">
                <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Pasajero Principal</span>
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800">{lastReservation.datos_pasajero?.nombres_completos}</span>
                  <span className="font-semibold text-slate-500">{lastReservation.datos_pasajero?.tipo_documento}: {lastReservation.datos_pasajero?.numero_documento}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Monto Debitado</span>
                <span className="text-base font-black text-emerald-600">{lastReservation.monto_pagado} MO</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setShowConfirmation(false);
                setLastReservation(null);
                setActiveTab("reservas");
              }}
              className="w-full py-3.5 bg-[#162b4e] hover:bg-blue-900 text-white font-bold rounded-xl transition duration-200 shadow-md text-xs uppercase tracking-wider"
            >
              Cerrar y Ver mis Reservas
            </button>
          </div>
        </div>
      )}
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
