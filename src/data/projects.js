// All copy is verbatim from the approved static site. Do not edit wording.

// pixel-art cat head (shared by the WebGL voxel scene, the logo and the static fallback). E = eyes, N = nose
export const CAT_MAP = [
  '.##..........##.',
  '.###........###.',
  '.####......####.',
  '.##############.',
  '################',
  '################',
  '###EE######EE###',
  '###EE######EE###',
  '################',
  '#######NN#######',
  '################',
  '.##############.',
  '..############..',
  '....########....',
];

export const ABOUT_FILL = 'Desarrollador full stack con experiencia real. Me gusta dar forma a las ideas y transformarlas en realidad.';

export const ABOUT_INTRO = 'Gracias a mi afán por los videojuegos y mi curiosidad me decidí por DAM, mi carrera profesional se decantó por web pero nunca dejé del todo los videojuegos.';

export const TIMELINE = [
  { when: '2021 – 2023', title: 'Técnico Superior en DAM', place: 'Colegio Vivas · Vigo', text: 'Java, C# .NET, SQL, JavaScript y Python. Aquí empezó todo.' },
  { when: 'ago – nov 2023', title: 'Full Stack Developer · Prácticas FCT', place: 'Imatia Innovation · Vigo', text: 'Plataforma web con Spring Boot y Angular en un equipo Agile: servicios REST, integración con el frontend y revisiones de código con desarrolladores senior. Aprendí Ontimize, un framework sobre Spring, en menos de dos semanas.' },
  { when: '2024', title: 'Mención de honor · Xuventude Crea', place: 'Categoría de creación de videojuegos', text: 'Con DarkArise, un metroidvania en Unity, junto a Adrián Vila.', star: true },
  { when: 'abr 2025 – abr 2026', title: 'Full Stack Developer', place: 'GKN Automotive · Vigo', text: 'Construí de forma autónoma una aplicación web (React, API REST y PostgreSQL en Supabase) que eliminó el registro manual del inventario y agilizó mucho la búsqueda de repuestos para las máquinas de la fábrica. Del primer commit a producción en Vercel, con CI/CD. También di soporte de hardware al equipo de mantenimiento.' },
  { when: 'Ahora', title: 'Arroutada Studio', place: 'Mi marca indie', text: 'Donde viven Meowdo y Vestige, los dos en desarrollo.' },
];

// media.type: 'img' | 'sprite' | 'stock' | 'split' | 'moon' | 'orbit'
// links: { href, label } or { text } for a plain span
export const PROJECT_GROUPS = [
  {
    label: 'Web y apps',
    range: '01 — 04',
    projects: [
      {
        num: '01', title: 'Motto Archery', sup: '2026',
        media: { type: 'img', src: 'img/motto-3d.jpg', alt: 'Web de Motto Archery con el soporte para arcos compuestos en 3D', cap: 'En producción' },
        kind: 'Web para una marca real',
        text: 'Web de Motto Archery, una marca de soportes para arcos compuestos. Enseña el soporte en 3D, con un selector de modelo y color que se sincroniza con toda la página y enlaces de pedido con el mensaje ya escrito.',
        tags: ['React', 'Vite', 'GSAP', 'three.js', 'R3F'],
        links: [
          { href: 'https://gabriel-motto.github.io/motto-archery-3d/', label: 'Ver web ↗' },
          { href: 'https://github.com/Gabriel-motto/motto-archery-3d', label: 'Código ↗' },
        ],
      },
      {
        num: '02', title: 'Stock-Web', sup: '2025–26',
        media: { type: 'stock', cap: 'GKN Automotive' },
        kind: 'Proyecto profesional · copia pública',
        text: 'Copia, con datos de ejemplo, de la app de repuestos que construí en GKN Automotive: encontrar rápido todas las ubicaciones de una pieza para el mantenimiento de las máquinas.',
        tags: ['React', 'Chakra UI', 'Supabase', 'PostgreSQL', 'Vercel'],
        links: [
          { href: 'https://gabriel-motto.github.io/WebStockCopy/#/machines', label: 'Ver demo ↗' },
          { href: 'https://github.com/Gabriel-motto/WebStockCopy', label: 'Código ↗' },
        ],
      },
      {
        num: '03', title: 'Antifta Studio', sup: '2026',
        media: { type: 'img', src: 'img/antifta.jpg', alt: 'Web de Antifta Studio con sus pelucas de cosplay', cap: 'En producción' },
        kind: 'Web · estudio de cosplay',
        text: 'Web de Antifta Studio, un estudio de pelucas personalizadas para cosplay. Galería de trabajos con visor a pantalla completa, el proceso y los servicios, con animaciones de scroll y encargos directos por Instagram.',
        tags: ['React', 'Vite', 'GSAP', 'Lenis', 'Vercel'],
        links: [
          { href: 'https://antiftastudio.vercel.app', label: 'Ver web ↗' },
          { text: 'Repositorio privado' },
        ],
      },
      {
        num: '04', title: 'Meowdo', sup: 'App',
        media: { type: 'sprite', src: 'img/cat-happy@2x.png', alt: 'El gato pixel-art de Meowdo', cap: 'En desarrollo' },
        kind: 'App móvil · Arroutada Studio',
        text: 'Tareas, notas y calendario en una pizarra de corcho personalizable. Cada tarea completada da monedas que suben de nivel a un gato pixel-art. El gato no existe, pero se toma muy en serio tu productividad. Con widgets de Android y recordatorios.',
        tags: ['React Native', 'Expo', 'TypeScript', 'Zustand'],
        links: [{ text: 'Repositorio privado' }],
      },
    ],
  },
  {
    label: 'Videojuegos · la parte divertida',
    range: '05 — 07',
    projects: [
      {
        num: '05', title: 'Vestige', sup: 'WIP',
        media: { type: 'split', left: 'Paz', right: 'Apoca­lipsis' },
        kind: 'Roguelite 2D · Unity 6 · en desarrollo',
        text: 'Mi nuevo proyecto y el más ambicioso, un videojuego roguelite 2D estilo pixel art con vistas a ser mi primer juego en Steam. Un mundo donde las acciones de un pasado pacífico son la ruina de un futuro caótico.',
        tags: ['Unity', 'C#'],
        links: [{ text: 'Repositorio privado' }],
      },
      {
        num: '06', title: 'DarkArise', sup: '★ 2024',
        media: { type: 'moon', cap: 'Mención 2024' },
        kind: 'Metroidvania · Unity · en pausa',
        text: 'Videojuego creado por mí y continuado junto a Adrián Vila para el concurso Xuventude Crea 2024, donde recibimos mención de honor tras 2 meses de aprendizaje y desarrollo.',
        tags: ['Unity', 'C#'],
        links: [{ href: 'https://github.com/Gabriel-motto/DarkArise', label: 'Código ↗' }],
      },
      {
        num: '07', title: 'BlueMoon', sup: '2023',
        media: { type: 'orbit', cap: 'libGDX + Box2D' },
        kind: 'Juego 2D · Java',
        text: 'Proyecto académico hecho en libGDX y Box2D, con físicas, colisiones y un jefe final. Un minijuego al estilo roguelite con 3 tipos de enemigos y objetos potenciadores.',
        tags: ['Java', 'libGDX', 'Box2D'],
        links: [{ href: 'https://github.com/Gabriel-motto/BlueMoon', label: 'Código ↗' }],
      },
    ],
  },
];

// Marquee rows: [text, accent?]. Each row is rendered twice so the track can loop.
export const MARQUEES = [
  { dir: -1, items: [['Java'], ['Spring Boot'], ['React', true], ['Angular'], ['APIs REST'], ['TypeScript']] },
  { dir: 1, items: [['PostgreSQL'], ['Supabase'], ['MySQL'], ['Vercel', true], ['MongoDB'], ['Git']] },
  { dir: -1, items: [['React Native'], ['Unity', true], ['C#'], ['three.js'], ['GSAP'], ['libGDX']] },
];

// items: [text, smallNote?]
export const STACK = [
  { title: 'Backend', items: [['Java'], ['Spring Boot · Spring Security'], ['APIs REST'], ['Node.js', '(básico)']] },
  { title: 'Frontend', items: [['React · Angular'], ['JavaScript ES6+ · TypeScript'], ['HTML5 · CSS3 · Bootstrap'], ['Vite · GSAP · three.js']] },
  { title: 'Datos y despliegue', items: [['PostgreSQL · MySQL · MongoDB'], ['Supabase'], ['Git · GitHub · CI/CD'], ['Vercel · Docker', '(básico)']] },
  { title: 'Y además', items: [['React Native · Expo'], ['Unity · C# · libGDX'], ['Agile/Scrum · SOLID · testing'], ['Español nativo · inglés B2']] },
];

export const EMAIL = 'gabrielmottocomesa@gmail.com';
