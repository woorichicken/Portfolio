import { shot } from './images';
import type { Content } from './types';

// ko.ts 의 스페인어판. 숫자·인용은 ko.ts 와 같아야 한다 — 바꿀 때는 세 언어를 함께 바꾼다.

const es: Content = {
  meta: {
    title: 'Gyeonghun Jeong (SOLHUN) — un desarrollador que se ocupa de todo el proceso',
    description:
      'Portafolio de Gyeonghun Jeong, desarrollador en Lightsoft. De la solicitud a la especificación, el desarrollo, la revisión, el lanzamiento y el feedback: KITS, el CRM/ERP de consultoría laboral FAIR y CLI Manager.',
  },
  a11y: { skip: 'Ir al contenido', primaryNav: 'Menú principal', language: 'Elegir idioma', openImage: 'Ver imagen completa' },
  nav: { work: 'Proyectos', process: 'Cómo trabajo', timeline: 'Trayectoria', contact: 'Contacto' },
  hero: {
    name: 'Gyeonghun Jeong',
    role: 'Desarrollador en Lightsoft · creador de CLI Manager',
    lead: 'No me quedo solo en escribir código. Desde que llega una solicitud defino todo el recorrido —especificación, desarrollo, revisión, lanzamiento y feedback— y busco sin parar qué partes pueden funcionar mejor.',
    keywords: [
      { title: 'Todo el recorrido', body: 'Me encargo de cada paso, de la solicitud al feedback, para entender cómo fluye el trabajo de verdad.' },
      { title: 'Mejores procesos', body: 'Detecto dónde el feedback se pierde o se repite y lo convierto en una herramienta o una rutina.' },
      { title: 'Herramientas que se usan', body: 'Comparto lo que construyo con compañeros, diseñadores y clientes, y lo pulo hasta que lo usan.' },
    ],
    links: [
      { label: 'GitHub', href: 'https://github.com/woorichicken' },
      { label: 'Correo', href: 'mailto:solhun.jeong@gmail.com' },
    ],
  },
  stats: {
    title: 'Dos años en cifras',
    items: [
      { value: '19', label: 'proyectos de empresa con diseñadores y clientes' },
      { value: '6.583', label: 'commits en GitHub (2025–2026)' },
      { value: '#10', label: 'Product of the Day en Product Hunt — CLI Manager' },
      { value: '851', label: 'usuarios de Ddingsroom · premio en un concurso universitario' },
    ],
  },
  process: {
    title: 'Cómo trabajo',
    body: 'Documenté mi trabajo y cada proceso todo lo que pude, lo reuní en Lassorun —nuestra plataforma interna de documentación y QA— y seguí buscando qué partes podía mejorar la IA.',
    stages: [
      { name: 'Solicitud', who: 'Cliente' },
      { name: 'Plan y docs', who: 'Especificación · casos de prueba' },
      { name: 'Desarrollo', who: 'Agentes de IA' },
      { name: 'Revisión', who: 'Diseñador' },
      { name: 'Lanzamiento', who: 'Tiendas · web' },
      { name: 'Feedback', who: 'Usuarios · clientes' },
    ],
    loopBack: 'De vuelta a la solicitud: la retrospectiva se convierte en la documentación de la siguiente vuelta',
    toolsTitle: 'Herramientas que construí e integré en ese ciclo',
    tools: [
      'Lassorun — plataforma interna de docs y QA',
      'Automatización del desarrollo a partir de docs',
      'Páginas de revisión responsive · widget de feedback',
      'OTA y automatización de lanzamientos',
      'Bot de Slack · integración con Linear',
      'Retrospectivas · procedimientos por escrito',
    ],
    note: 'El «desarrollo» del centro es donde la IA más aceleró. Por eso dedico mi tiempo a lo que lo rodea: documentación, revisión y feedback.',
  },
  work: {
    title: 'Proyectos',
    intro: 'Trabajo con clientes en Lightsoft y proyectos que asumí por mi cuenta.',
    labels: { before: 'Antes', after: 'Después', lesson: 'Lo que aprendí', results: 'Resultados' },
    projects: [
      {
        id: 'kits',
        context: 'Lightsoft · cliente KITS EDU',
        name: 'KITS',
        tagline: 'Un servicio educativo, de las pruebas de nivel al estudio diario, en móvil, tableta y web',
        summary:
          'Cada pantalla se multiplica en la app, la web móvil, la web de escritorio, la web para docentes y la de administración. Ajustar las pantallas con la diseñadora y el cliente fue más trabajo que el propio código, así que rehicimos juntos un proceso de feedback que perdía puntos cuando las peticiones eran vagas o se acumulaban.',
        facts: [
          { label: 'Período', value: 'nov. 2025 – actualidad' },
          { label: 'Rol', value: 'Responsable de front-end y QA' },
          { label: 'Plataformas', value: 'App · web · docentes · admin' },
          { label: 'Con', value: 'Diseñadora · desarrolladores · CEO · cliente' },
        ],
        cover: shot('lw_kits-hero-phones', 'Varios teléfonos con la app de KITS'),
        improvements: [
          {
            title: 'Revisión responsive',
            before: 'Estirar y encoger la ventana de Chrome, una pantalla cada vez',
            after: 'Un tablero de revisión con 55 pantallas y 39 modales en vertical y horizontal a la vez. Cada pantalla tiene su caja de comentarios, y el comentario de la diseñadora pasa a ser una instrucción de trabajo tal cual.',
            metric: { value: '55 / 55', label: 'pantallas de tableta revisadas · 0 errores' },
          },
          {
            title: 'Enviar feedback',
            before: 'Sesenta notas de texto en un solo mensaje de Slack',
            after: 'Un widget para señalar el botón o el texto real en pantalla y reportarlo, añadido a las cuatro apps: app, web, docentes y admin.',
            metric: { value: '41', label: 'reportes de la diseñadora en un solo día' },
          },
          {
            title: 'Seguimiento',
            before: 'Un documento de revisión de 613 líneas actualizado a mano; había que preguntar para saber qué estaba corregido',
            after: 'Reporte → sistema interno → issue en Linear → aviso en Slack, todo automático. Al publicar un arreglo, Slack recibe qué cambió y un enlace al tablero.',
            metric: { value: '301+', label: 'reportes con estado controlado' },
          },
        ],
        metrics: [
          { value: '41 → 22', label: 'de 41 reportes en un día intenso, 22 cerrados en 3 horas' },
          { value: '94+', label: 'pantallas revisadas juntas en un solo tablero' },
        ],
        quotes: [
          { text: 'Pudimos comprobar que mucho ha mejorado desde la primera ronda de feedback. Esta vez hubo mucho menos que señalar…', who: 'Cliente — segunda revisión aprobada, jul. 2026' },
          { text: 'Nunca habíamos trabajado con un proveedor así.', who: 'Cliente — durante una reunión de revisión' },
        ],
        lesson: {
          title: 'El lugar pesa más que la herramienta',
          body: 'Nadie abrió el tablero mientras era un HTML local; empezó a usarse cuando tuvo una URL publicada. Construir una herramienta y que se use son cosas distintas: tiene que resultar cómoda dentro del flujo de trabajo del otro para convencer.',
        },
        gallery: [
          shot('kits_board_top', 'Parte superior del tablero de revisión', 'El tablero: capturas en vertical y horizontal y comentarios para cada pantalla'),
          shot('kits_picker_top', 'Modo de selección de elementos', 'Modo «señalar elemento»: apunta a cualquier cosa en pantalla y repórtala'),
          shot('kits_dp_top', 'Reportes recogidos en el sistema interno', 'Reportes ordenados automáticamente por pantalla, contenido y tipo'),
          shot('kits_bot_crop', 'Aviso en Slack tras un arreglo', 'Al publicar un arreglo, Slack recibe el cambio y el enlace al tablero'),
        ],
      },
      {
        id: 'fair',
        context: 'Contrato freelance · AX',
        name: 'CRM/ERP de consultoría laboral FAIR',
        tagline: 'Todo el proceso de consultoría de un despacho laboral —diagnóstico, diseño, ejecución, gestión del cambio y evaluación— en un solo lugar',
        summary:
          'Trabajé con los abogados laboralistas como un solo equipo. Pasamos a software un trabajo manual basado en listas y documentos y llevamos el proceso de consultoría a la IA (AX). También contrasta con la ley vigente los artículos que cita la IA.',
        facts: [
          { label: 'Período', value: 'feb. 2026 – actualidad' },
          { label: 'Rol', value: 'Planificación, desarrollo y operación' },
          { label: 'Apps', value: 'CRM · web pública · app de empleados' },
          { label: 'Con', value: 'Abogados laboralistas · usuarios de cada rol' },
        ],
        cover: shot('efm_v4', 'Un fotograma del vídeo de producto de FAIR que hice'),
        improvements: [
          {
            title: 'Todo lo que rodea al código',
            before: 'El desarrollo externalizado suele cubrir solo la construcción',
            after: 'Contrato (8 mar.) → especificación v2–v2.2 (13–17 abr.) → guías de administración y asesoría (17–26 may.) → entrega del sistema de diseño (8 jun.) → propuesta, vídeo de producto y tarjetas informativas (jul.–sep.), todo a mi cargo.',
          },
          {
            title: 'Pantallas por rol',
            before: 'Todos veían los mismos datos en la misma pantalla',
            after: 'Dirección, ejecutivos, asesores, responsables de casos y empleados ven datos y pantallas distintos. Diseñarlo y explicárselo a los abogados me enseñó muchísimo sobre recursos humanos y derecho laboral.',
          },
        ],
        metrics: [
          { value: '3', label: 'apps en producción — CRM · web pública · app de empleados' },
          { value: '1.086', label: 'commits · 164 PR fusionados' },
        ],
        lesson: {
          title: 'Trabajando solo, hay que forzar la mirada del usuario',
          body: 'Escribir la guía de uso destapó huecos en las pantallas, y hacer el vídeo me obligó a resumir en una frase a quién le ahorra trabajo este producto y cómo.',
        },
        gallery: [
          shot('efm_stages_c', 'Pantalla de etapas', 'Etapas: contrato → diagnóstico → diseño → ejecución → gestión del cambio → evaluación'),
          shot('efm_diag_c', 'Pantalla de diagnóstico AS-IS', 'Diagnóstico AS-IS: problemas y prioridad por área'),
          shot('efm_kpi_c', 'Pantalla de gestión del desempeño', 'Gestión del desempeño: los cambios de KPI pasan a ser solicitudes de aprobación'),
          shot('efm_att', 'Demo de asistencia en la web pública', 'Demo de control de asistencia en la web pública'),
        ],
      },
      {
        id: 'cli-manager',
        context: 'Producto personal · código abierto',
        name: 'CLI Manager',
        tagline: 'Una app de escritorio para gestionar varios agentes de programación con IA (CLI) desde una sola pantalla',
        summary:
          'Nació de mi propio caos: diez terminales abiertas y sin saber cuál era cuál. Diez meses y 56 versiones después es un producto público. Hice solo la planificación, el desarrollo, los lanzamientos, la landing y el marketing; salió como app de pago, generó sus primeros ingresos y luego pasó a código abierto.',
        facts: [
          { label: 'Período', value: 'nov. 2025 – actualidad' },
          { label: 'Rol', value: 'Creador en solitario' },
          { label: 'Plataforma', value: 'macOS (Electron)' },
          { label: 'Licencia', value: 'MIT, código abierto' },
        ],
        cover: shot('cli_main', 'Pantalla principal de CLI Manager'),
        improvements: [
          {
            title: 'v1.9 · AI Control API',
            before: 'En ejecuciones no interactivas, solo sabes que la IA se desvió cuando ya ha terminado',
            after: 'Una API local permite que otra IA abra sesiones y trabaje dentro de CLI Manager. Las sesiones de IA aparecen en verde para que puedas revisarlas e intervenir cuando quieras.',
          },
        ],
        metrics: [
          { value: '#10', label: 'Product of the Day en Product Hunt · 105 votos' },
          { value: '56', label: 'versiones en 10 meses' },
          { value: '1.200+ US$', label: 'ingresos iniciales → luego código abierto' },
          { value: '23 mil', label: 'visitas en la publicación de Reddit más vista' },
        ],
        quotes: [{ text: 'I picked this up today and am obsessed!!', who: 'Un usuario de Product Hunt' }],
        lesson: {
          title: 'El QA más barato',
          body: 'Los dos fallos de la última actualización tenían que ver con cómo se veía, no con lo que hacía. Usar mi propia herramienta a diario resultó ser el QA más barato que existe.',
        },
        gallery: [
          shot('cli_green', 'Sesiones de IA en verde', 'Un agente de IA real trabajando dentro de CLI Manager: las sesiones de IA van en verde'),
          shot('cli_ph', 'Página de Product Hunt', 'La página de Product Hunt: 105 votos'),
          shot('cli_loop', 'Loop Dashboard', 'Loop Dashboard de la v1.6'),
        ],
        links: [
          { label: 'Sitio web', href: 'https://climanager.solhun.com' },
          { label: 'GitHub', href: 'https://github.com/woorichicken/CLI_manager' },
          { label: 'Product Hunt', href: 'https://www.producthunt.com/products/cli-manager' },
        ],
      },
      {
        id: 'automation',
        context: 'Lightsoft · herramientas internas',
        name: 'Automatización interna del desarrollo',
        tagline: 'Symphony, un daemon que desarrolla issues a partir de la documentación y avisa a una persona cuando se atasca, y Lassorun, nuestra plataforma de docs y QA',
        summary:
          'Lo construí porque la gente vigilaba a mano los issues recurrentes: comprobar el avance, revisar, volver a pedir. Symphony toma un issue, los agentes de IA lo desarrollan a partir de la documentación y, si se atasca, avisa a una persona por Slack. Docs, casos de prueba y reportes fluyen por Lassorun.',
        facts: [
          { label: 'Período', value: 'may. 2026 – actualidad' },
          { label: 'Rol', value: 'Diseño, desarrollo y adopción en el equipo' },
          { label: 'Alcance', value: 'Symphony · Lassorun · widget de feedback' },
          { label: 'Con', value: 'CEO · desarrolladores internos' },
        ],
        cover: shot('sym_flow', 'Vista de flujo en la plataforma interna de docs y QA'),
        metrics: [
          { value: '44', label: 'comentarios tras compartir el vídeo de la demo' },
          { value: '798', label: 'commits en Symphony' },
        ],
        quotes: [
          { text: 'Al final me gustaría que se pudiera gestionar desde un panel, incluso sin ser desarrollador.', who: 'CEO — hilo de la demo, jul. 2026' },
          { text: 'La verdad es que pensé que solo lo usaríamos internamente y apenas cuidé la usabilidad. Incorporaré lo que comentas.', who: 'Yo — y en ese momento creé un flujo de alta de proyectos' },
        ],
        lesson: {
          title: 'Compartirlo con el equipo',
          body: 'En feb. 2026 convertí «cómo uso las herramientas de IA» en una sesión fija (3+ veces) y presenté nuestro flujo de automatización de pruebas E2E y unitarias. En mar. 2026 anuncié un flujo idea → aprobación en Slack → publicación automática, y una diseñadora subió su primera idea en 7 minutos. Tras la demo oficial de jul. 2026, Symphony pasó a trabajar en las webs de docentes y administración de KITS.',
        },
      },
      {
        id: 'purple',
        context: 'Lightsoft · cliente Purple Academy',
        name: 'Purple',
        tagline: 'App de administración de un LMS para aprender inglés: currículo, cuestionarios, clases y un programa de lectura',
        summary:
          'Un sistema de administración con 17 tipos de cuestionario × 16 tipos de pregunta sobre datos reales en producción. Las preguntas estaban atadas a cada cuestionario y no se podían reutilizar, así que lo rediseñé para que vivan por separado y se enlacen, y verifiqué paso a paso la migración de datos de producción, del diseño y el plan a la ejecución.',
        facts: [
          { label: 'Período', value: 'nov. 2025 – jun. 2026' },
          { label: 'Rol', value: 'Web de admin · modelo de datos · QA' },
          { label: 'Alcance', value: 'Currículo · cuestionarios · clases' },
          { label: 'Con', value: 'Líder de equipo · desarrolladores · cliente · diseñadora' },
        ],
        cover: shot('pur_class', 'Pantalla de clases del admin de Purple'),
        improvements: [
          {
            title: 'QA',
            before: 'Hacer clic pantalla por pantalla para encontrar errores',
            after: 'Una tabla que recorre cada tipo con crear → leer → actualizar → borrar y comprueba que los valores guardados vuelven intactos. También probé primero una herramienta de QA con IA y la compartí; dos compañeros la aplicaron enseguida en sus áreas.',
            metric: { value: '17×16', label: 'matriz de ida y vuelta CRUD, 5 h 41 min' },
          },
        ],
        metrics: [
          { value: '6.752', label: 'cuestionarios migrados en producción · 0 discrepancias' },
          { value: '137 días', label: 'canal dedicado, hasta el pago final' },
        ],
        lesson: {
          title: 'Avisar cuando el alcance cambia',
          body: 'Una tarea que estimé en 40 líneas acabó en 400 y no lo avisé a tiempo; el líder del equipo renegoció con el cliente por mí. Desde entonces anoto cada tarea como «estimación → medición».',
        },
        gallery: [
          shot('pur_matrix', 'Matriz CRUD de ida y vuelta', 'Matriz CRUD de ida y vuelta por tipo de cuestionario'),
          shot('pur_quiz', 'Editor de cuestionarios', 'Editor de cuestionarios: preguntas según el tipo'),
        ],
      },
      {
        id: 'porterx',
        context: 'Lightsoft · cliente · en la App Store',
        name: 'PorterX',
        tagline: 'Una app que conecta las rutas de los viajeros con encargos de compra locales',
        summary: 'El proyecto en el que más operación posterior al lanzamiento gestioné: pagos, reembolsos, revisión en tiendas y seguridad.',
        facts: [
          { label: 'Período', value: 'ago. 2025 – abr. 2026' },
          { label: 'Rol', value: 'Funciones de la app · diseño · operación' },
          { label: 'Plataformas', value: 'iOS · Android · admin' },
          { label: 'Con', value: 'Desarrollador · CEO · cliente' },
        ],
        cover: shot('ptx_home', 'Inicio de PorterX: emparejamiento de misiones'),
        improvements: [
          { title: 'Pagos', before: 'La liquidación se rompía cada vez que cambiaban las reglas de la pasarela', after: 'Cambié de pasarela cuatro veces, rediseñé la liquidación y terminé en compras dentro de la app.' },
          { title: 'Reembolsos', before: 'Usuarios que gastaban créditos y pedían el reembolso (no llegaban los avisos)', after: 'En 3 días: webhook de reembolsos y recuperación automática de créditos.' },
          { title: 'Lanzamientos', before: 'Dos rechazos de Apple, y cada arreglo exigía otra revisión', after: 'Pasamos a actualizaciones OTA para que los arreglos no esperen cada vez a la revisión.' },
          { title: 'Seguridad', before: 'Huecos de seguridad en código hecho deprisa con agentes de IA', after: 'Una auditoría completa a los cuatro meses bloqueó 4 problemas críticos.' },
        ],
        gallery: [
          shot('ptx_credit', 'Pantalla de misiones y créditos', 'Misiones y créditos'),
          shot('ptx_comm', 'Pantalla de comunidad', 'Comunidad (apodos difuminados)'),
        ],
      },
      {
        id: 'ncdigitec',
        context: 'Lightsoft · cliente · socio oficial de Samsung',
        name: 'NC Digitec',
        tagline: 'Rediseño de una tienda online de suscripciones (alquiler) de Samsung AI',
        summary:
          'Lideré el rediseño y llevé el ciclo de feedback de la diseñadora y el cliente. Preparé todo para que la diseñadora instalara la herramienta de feedback por su cuenta, agrupé los reportes y compartí lo publicado como lista: «6 reportes de ayer y hoy, resueltos». Continuaba el proceso de feedback pulido en KITS.',
        facts: [
          { label: 'Período', value: 'abr. 2026 – actualidad' },
          { label: 'Rol', value: 'Líder del rediseño · operación' },
          { label: 'Alcance', value: 'Inicio · productos · consulta de suscripción' },
          { label: 'Con', value: 'Diseñadora · CEO · cliente' },
        ],
        cover: shot('ncd_kv', 'Visual principal de la tienda'),
        improvements: [
          {
            title: 'Aplicar el feedback',
            before: 'Peticiones de cambio repartidas entre mensajería y documentos',
            after: 'Reportes dejados en la propia pantalla → aplicados por tandas → lista compartida de lo que cambió',
          },
        ],
        gallery: [
          shot('ncd_ux', 'Feedback dejado sobre la pantalla', 'Feedback dejado directamente sobre la pantalla (barra de navegación)'),
          shot('ncd_plan', 'Selección de plan de cuidado', 'Elegir un plan de cuidado'),
        ],
      },
      {
        id: 'content',
        context: 'Personal · código abierto',
        name: 'Automatización de contenidos',
        tagline: 'Un pipeline que va de recoger ideas a planificar, producir y publicar',
        summary:
          'Recoger publicaciones populares en X → dos agentes de IA debaten el tema (hasta 3 rondas) → investigación, verificación, texto, render y pie → publicación simultánea en Threads, X e Instagram. Cada día reunía datos de interacción y rehacía las mejores publicaciones desde otro ángulo. Lo publiqué como código abierto dejando vacías las claves de API.',
        facts: [
          { label: 'Período', value: 'mar. – abr. 2026' },
          { label: 'Rol', value: 'Diseño · desarrollo · operación' },
          { label: 'Canales', value: 'Threads · X · Instagram' },
          { label: 'Después', value: 'Creció hasta ser una plataforma interna de contenidos' },
        ],
        cover: shot('ct_coord', 'Tarjetas informativas creadas con el pipeline'),
        metrics: [
          { value: '780 mil', label: 'visitas en 3 semanas' },
          { value: '94 → 8.600', label: 'seguidores en Threads (máximo)' },
          { value: '100+', label: 'publicaciones · 50 con más de 1.500 visitas' },
        ],
        lesson: {
          title: 'Una herramienta que usa el equipo',
          body: 'Presenté los resultados internamente con la idea de «apúntalo, aunque sea breve, y la IA lo desarrollará». Después creció hasta una plataforma interna de contenidos con tarjetas automáticas, y ahora el equipo la usa en conjunto.',
        },
        gallery: [shot('cli_card', 'Tarjeta que presenta CLI Manager', 'Una tarjeta de presentación de CLI Manager hecha con el pipeline')],
      },
    ],
  },
  others: {
    title: 'Otros proyectos',
    intro: 'Participaciones más cortas y cosas que acaban de empezar.',
    items: [
      {
        name: 'Design Atlas',
        period: 'sep. 2026 · personal',
        body: 'Un diccionario de diseño con 893 términos de movimiento, efectos, componentes y UX en 34 áreas, cada uno con explicación en coreano e inglés, demo en vivo y código.',
        shot: shot('design_atlas', 'Portada de Design Atlas'),
        href: 'https://design.solhun.com',
      },
      { name: 'ZZAN24', period: 'sep. 2026', body: 'Trabajo de diseño, incluido el responsive.', shot: shot('zzan_tab', 'ZZAN24 en una tableta') },
      { name: 'Switch On', period: 'abr. 2026', body: 'Adaptación de un juego de mesa a BGA Studio · alfa y beta.', shot: shot('sw_board', 'Tablero de Switch On') },
      { name: 'Dolphin CRM', period: 'abr. 2026', body: 'Pedidos, posventa y stock de un negocio de lavavajillas: QA de productos, arreglos y analítica web.', shot: shot('dp_stats', 'Estadísticas de Dolphin CRM') },
      { name: 'Webzine Big Data Hub', period: 'abr. 2026', body: 'La revista web de un programa universitario y su admin de autores y puntos.', shot: shot('web_admin', 'Admin de la revista web') },
      { name: 'light-archive', period: 'feb. 2026', body: 'Plataforma interna de conocimiento y blog, archive.lightsoft.dev.', shot: shot('la_home', 'Inicio de light-archive') },
      { name: 'Motion Meme', period: 'mar. 2026 · 2.º en el hackatón interno', body: 'MVP de una red social basada en retos de memes.', shot: shot('lw_motion', 'Pantalla de Motion Meme') },
      { name: 'YouTube Manager', period: 'mar. 2026', body: 'Me sumé en la fase de producción para construir el sistema de otra empresa.', shot: shot('yt_plan', 'Pantalla de planificación de YouTube Manager') },
      { name: 'Web de Lightsoft', period: 'Interno', body: 'La web de la empresa y su escaparate de trabajos.', shot: shot('lw_work-1', 'Sección de trabajos de la web de Lightsoft') },
    ],
    contestsTitle: 'Concursos',
    contests: 'AI TOP 100 (final y campus) · concurso de vibe coding Litmers · Kakao PlayMCP · hackatón DataHub · propuesta para un concurso del Ministerio de Legislación de Corea',
  },
  early: {
    title: 'Antes de Lightsoft',
    intro: '2024–2025: cosas que empezaron por pequeñas molestias a mi alrededor.',
    items: [
      {
        name: 'DebateTimer.org',
        tag: 'Personal',
        body: 'El primer servicio que construí, para mi club de debate. Al añadir el formato propio de cada universidad —el estilo «visual» de Myongji, el «Todallae» de Sungshin— se extendió a clubes de otras universidades.',
        shot: shot('dt_templates', 'Selector de plantillas por formato de debate'),
      },
      {
        name: 'PrayNie',
        tag: 'Personal',
        body: 'Una plataforma con IA para recoger y compartir peticiones de oración en un grupo cristiano universitario. Nunca llegó a ser un servicio masivo: fue mi primera lección de que construir algo y lograr que se use son cosas distintas.',
        shot: shot('pray_mock', 'Página de inicio de PrayNie'),
      },
      {
        name: 'Ddingsroom',
        tag: 'Universidad · concurso',
        body: 'Un servicio de reserva de salas de estudio en el centro de estudiantes de la Universidad Myongji. Estuve en el equipo de back-end; tras ganar un premio en el concurso de SW creativo, pasó a ser un servicio oficial de la universidad.',
        shot: shot('dd_live', 'Pantalla de reservas de Ddingsroom, todavía en servicio'),
        metrics: [
          { value: '851', label: 'usuarios' },
          { value: '4.261', label: 'reservas' },
        ],
        note: 'Datos de abr. 2026',
      },
    ],
    devhoon: {
      name: 'DEV HOON',
      tag: 'Equipo de desarrollo universitario · desde abr. 2024',
      body: 'Con compañeros de la universidad acepté encargos bajo el nombre «DEV HOON». Dirigí la planificación y el desarrollo, y todas las reseñas en Kmong fueron de 5,0. Nuestro primer cliente fue un despacho laboral: empezó con la reconstrucción de su web en enero de 2025 y creció hasta una herramienta donde la IA completa los metadatos SEO.',
      history: [
        { date: '2025.01', text: 'Reconstrucción de la web de FAIR' },
        { date: '2025.02', text: 'Gestión de contenidos SEO con IA: avisos y boletín' },
        { date: '2025.09', text: 'Página de campaña para una fundación de responsabilidad social de aseguradoras de vida (sigue activa)' },
        { date: 'Otros', text: 'Encargos pequeños y trabajos de diseño que no se pueden mostrar (branding, material promocional)' },
      ],
      shots: [
        shot('early_devhoon-fairhr-website-2025-mockup', 'Portada de la web de FAIR (2025)', 'Portada de la web de FAIR (2025), nuestro primer cliente'),
        shot('early_kmong-fair-devhoon-profile', 'Perfil de vendedor en Kmong', 'Perfil en Kmong «DEV HOON, equipo universitario» · reseñas de 5,0'),
      ],
    },
  },
  timeline: {
    title: 'Trayectoria',
    items: [
      { date: '2024.04', text: 'Fundo el equipo universitario DEVHOON' },
      { date: '2025.01', text: 'Primer cliente: nueva web de FAIR · encargos en Kmong (reseñas de 5,0)' },
      { date: '2025.03', text: 'DebateTimer.org · PrayNie' },
      { date: '2025.06', text: 'Ddingsroom (equipo, back-end): premio en el concurso de SW creativo de Myongji' },
      { date: '2025.10', text: 'Entro en Lightsoft' },
      { date: '2025.11', text: 'Arrancan KITS, PorterX y Purple · lanzo CLI Manager (#10 en Product Hunt en diciembre)' },
      { date: '2026.02', text: 'Contrato del CRM/ERP de FAIR · plataforma interna de conocimiento light-archive' },
      { date: '2026.03', text: 'Automatización de contenidos (780 mil visitas en 3 semanas) · YouTube Manager · Motion Meme (2.º en el hackatón interno) · AI TOP 100' },
      { date: '2026.04', text: 'Tienda de suscripciones Samsung de NC Digitec · Dolphin CRM · Switch On · webzine Big Data Hub' },
      { date: '2026.07', text: 'Demo interna de Symphony · participación en Kakao PlayMCP' },
      { date: '2026.08', text: 'Lassorun (plataforma de docs y QA) · widget de feedback · reporte → Linear → Slack' },
      { date: '2026.09', text: 'ZZAN24 · plataforma de contenidos · CLI Manager v1.9 · Design Atlas' },
    ],
  },
  awards: {
    title: 'Premios y actividades',
    items: [
      { date: '2025.10', title: 'Mención de estímulo, 4.º Concurso de Programas de SW Creativo', org: 'Universidad Myongji', body: 'Ddingsroom, servicio de reserva de salas de estudio (back-end). Después pasó a ser un servicio oficial de la universidad.' },
      { date: '2025.12', title: 'Product Hunt #10 Product of the Day', org: 'Product Hunt', body: 'CLI Manager, 105 votos.' },
      { date: '2026.02', title: 'Charla interna: flujo de automatización de pruebas con IA', org: 'Lightsoft', body: 'Presenté nuestro flujo de pruebas E2E y unitarias automatizadas con casos reales.' },
      { date: '2026.03', title: '2.º puesto, hackatón interno', org: 'Lightsoft', body: 'Motion Meme, MVP de una red social basada en retos de memes.' },
      { date: '2026.07', title: 'Participación en el concurso Kakao PlayMCP', org: 'Kakao', body: 'World of AgentCraft, un servidor de juego en el que agentes de IA gestionan un asentamiento con herramientas MCP.' },
    ],
  },
  contact: {
    title: 'Contacto',
    body: 'Si quieres que trabajemos juntos, escríbeme por correo.',
    email: 'solhun.jeong@gmail.com',
    links: [
      { label: 'GitHub', href: 'https://github.com/woorichicken' },
      { label: 'Threads', href: 'https://www.threads.com/@aisolutiondev' },
    ],
    closing: 'Quiero seguir explorando todo el proceso y arreglando lo que encuentre por el camino.',
  },
  footer: { note: 'Los datos personales de las capturas están difuminados; los datos de clientes son de demostración.' },
  feedback: {
    title: 'Modo feedback',
    hint: 'Introduce la contraseña para mostrar el botón de feedback en este navegador.',
    placeholder: 'Contraseña',
    submit: 'Activar',
    cancel: 'Cerrar',
    wrong: 'La contraseña no coincide. Inténtalo de nuevo.',
  },
};

export default es;
