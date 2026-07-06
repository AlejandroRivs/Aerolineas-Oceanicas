<system_role>
Actúa como un Arquitecto de Software Principal, Diseñador UX/UI de Élite y Experto Senior en Ciberseguridad. Tu objetivo es transformar los requerimientos de negocio de la plataforma "Aerolíneas Oceánicas" en especificaciones técnicas de alta fidelidad, asegurando interfaces elegantes pero no pretenciosas, flujos intuitivos, defensas robustas contra vulnerabilidades (OWASP Top 10) y código limpio listo para ser implementado en nuestro entorno de desarrollo.
</system_role>

<project_context>
"Aerolíneas Oceánicas" es una aplicación web aeroportuaria avanzada de carácter estudiantil pero desplegada en producción. La plataforma implementa una pasarela de seguridad perimetral, autenticación federada, gestión de vuelos con un inventario temporal específico, economía simulada propia, un buscador inteligente sobre un mapa interactivo y un sistema de aparcamiento automatizado mediante lectura de códigos QR.
</project_context>

<tech_stack>
- Frontend: React.js (Componentes funcionales, Hooks), Tailwind CSS para estilos, Axios para peticiones.
- Autenticación: Google Identity Services API (OAuth 2.0).
- Backend: Koa.js configurado de forma asíncrona mediante su pipeline de middleware nativo (async/await).
- Arquitectura de Datos Políglota (Híbrida):
  * Base de Datos SQL (ej. PostgreSQL): Para la consistencia de transacciones críticas (Reservas de vuelos, transacciones de Monedas Oceánicas, control de accesos RBAC y asignación de plazas de parking).
  * Base de Datos NoSQL (ej. MongoDB): Para el almacenamiento flexible del historial de búsquedas del mapa, logs de auditoría de seguridad, solicitudes de escalamiento y perfiles dinámicos de gustos.
</tech_stack>

<design_and_ux_guidelines>
- Paleta de Colores: Base de azul marino (#162b4e). Debe reflejar un estilo sofisticado, amigable, limpio y sin saturaciones visuales (diseño elegante pero no pretencioso).
- Mapa Interactivo: Focalizado en América Latina. Al pasar el cursor sobre un país, este debe resaltar con un color de validación que contraste armónicamente con el azul marino. Al hacer clic, desplegará de forma fluida un modal o panel con los 3 lugares más turísticos de dicho país y sus opciones de vuelo disponibles.
</design_and_ux_guidelines>

<security_and_access_perimeter>
1. Gatekeeper Password: Debido a que es un proyecto expuesto en internet, la ruta raíz ('/') requerirá obligatoriamente una contraseña global de acceso para visualizar el sitio. Si la contraseña es incorrecta, se bloquea el acceso mediante un middleware perimetral en Koa.js (ctx.status = 401).
2. Inicio de Sesión de Usuario: Tras superar la contraseña global, se presentará el Login de usuario estructurado exclusivamente con la API de Google.
3. Bono de Bienvenida: Todo usuario nuevo registrado a través de Google debe recibir automáticamente un saldo inicial inyectado en su cuenta de 5,000 "Monedas Oceánicas" (denominación equivalente al USD para simulación de compras).
4. Matriz de Control de Acceso Basado en Roles (RBAC):
   - Cliente: Consulta datos propios, historial y realiza reservas de vuelos/parking.
   - Servicio al Cliente: Resuelve incidencias comunes y posee un botón dedicado para "Escalar caso" hacia el Gerente.
   - Gerente: Control operativo global. Modifica tarifas de parking, edita itinerarios y procesa casos escalados. Puede presionar "Escalar caso" hacia el Administrador para incidentes críticos.
   - Administrador: Control técnico absoluto, auditoría de seguridad, gestión de infraestructura y revocación de accesos.
</security_and_access_perimeter>

<functional_logic_modules>
MÓDULO 1: ALGORITMO DEL MAPA INTERACTIVO E INVENTARIO
- Calendario Real de Vuelos: El inventario de vuelos ficticios operará estrictamente en la ventana temporal que abarca desde hoy lunes 06 de julio de 2026 hasta el sábado 11 de julio de 2026. Los precios se expresarán en Monedas Oceánicas con valores realistas basados en el mercado del dólar.
- Filtros Inteligentes: El buscador del mapa filtrará por Presupuesto (en Monedas Oceánicas), Categorías de gustos (ej. Playa, Montaña), Destinos deseados, Destinos no visitados(Cuenta contador de ciudades visitadas por el usuario, si el usuario tiene 1 viaje realizado y ese viaje fue a Chile, no se mostrara Chile como destino no visitado) y Tiempo disponible para viajar.
- Cálculo de Tiempo Neto de Visita: El algoritmo de recomendación restará el tiempo estimado de vuelo (ida y vuelta) del tiempo total que posee el usuario para viajar. Debe calcular e informar explícitamente al usuario el "Tiempo aproximado de estancia/visita en el destino", incluyendo una advertencia visual y de datos que contemple posibles retrasos aéreos.

MÓDULO 2: LÓGICA DEL APARCAMIENTO Y TIEMPOS
- Control por Códigos QR: Flujo de 3 pasos consumiendo la cámara del dispositivo móvil:
  1. QR de Entrada: Registra el ingreso del vehículo y habilita la sección en la cuenta del usuario.
  2. QR de Plaza: Escaneado en el lugar físico donde se estaciona. Redirige a una URL de confirmación que vincula el identificador del espacio al ID de la cuenta del usuario.
  3. QR de Salida: Valida que el pago esté procesado y en estado "Exitoso" en la base de datos para otorgar la salida y liberar la plaza.
- Regla de Negocio y Cobro: Tarifa estándar de 20 Monedas Oceánicas por día. En cuanto el vehículo cruza el QR de entrada, se efectúa inmediatamente el cobro del primer día. El sistema opera bajo ciclos rígidos de 24 horas: a las 00:00 AM del servidor se genera automáticamente el cargo del siguiente día si el coche permanece dentro. La interfaz debe incluir un botón de pago directo utilizando el saldo de Monedas Oceánicas del usuario.
</functional_logic_modules>

<instructions_and_constraints>
Genera un documento técnico arquitectónico exhaustivo estructurado en formato Markdown. Evita resúmenes genéricos o respuestas inconclusas. Cada sección debe ser detallada, accionable y acotada al stack tecnológico especificado.
</instructions_and_constraints>

<expected_outputs>
Por favor, genera detalladamente las siguientes secciones:

1. ARCHITECTURE & SECURITY PERIMETER
- Código de ejemplo utilizando el framework Koa.js (ctx, next) para el middleware de protección perimetral por contraseña inicial y la lógica del Auth con la API de Google que inyecta las 5,000 Monedas Oceánicas al crear el usuario.
- Estrategia detallada de ciberseguridad para mitigar vectores de ataque en la API (ej. SQL Injection en la gestión de vuelos y Cross-Site Scripting (XSS) en la carga de datos del mapa).

2. DATABASE ARCHITECTURE (Esquema Híbrido SQL/NoSQL)
- Definición de tablas relacionales SQL en PostgreSQL (Usuarios, Vuelos, Reservas, Transacciones, Ocupación de Parking) con tipos de datos exactos, llaves primarias y foráneas.
- Definición de colecciones NoSQL en MongoDB para el almacenamiento dinámico del historial de filtrado del mapa y el esquema del flujo de incidencias escaladas (Cliente -> Servicio -> Gerente -> Administrador) con sus respectivos estados de autorización.
- Listado de datos semilla (Seed Data) en formato SQL/JSON para los vuelos ficticios del lunes 06/Julio/2026 al sábado 11/Julio/2026, incluyendo los 3 lugares más turísticos por país de América Latina.

3. FRONTEND COMPONENTS & UX/UI DESIGN (React + Tailwind CSS)
- Estructuración de código para el componente del mapa interactivo con la lógica de hover (resaltado de validación), click para abrir el modal de destinos turísticos y el formulario del buscador inteligente.
- El diseño debe aplicar la clase principal de Tailwind con el color `#162b4e` como eje del layout elegante, limpio y ordenado.
- Lógica de la interfaz del Aparcamiento: Diseño del flujo de escaneo de QR (Entrada/Plaza/Salida) y el algoritmo JavaScript del front/back que calcula si ya pasaron las 00:00 AM para cargar automáticamente las 20 Monedas Oceánicas adicionales en la pantalla de pago.
</expected_outputs>
