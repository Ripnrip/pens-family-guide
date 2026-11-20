import type { L, Reviewable } from "./types.js";

export const VISIT_TYPES = [
  "first_visit",
  "routine_eeg",
  "sleep_deprived_eeg",
  "video_eeg",
  "adhd_testing",
  "neuropsych_eval",
] as const;
export type VisitType = (typeof VISIT_TYPES)[number];

export interface ChecklistItem {
  id: string;
  text: L;
}

export interface VisitPrep extends Reviewable {
  type: VisitType;
  icon: string;
  title: L;
  checklist: ChecklistItem[];
  bring: L<string[]>;
  expect: L<string[]>;
  kidVersion: L;
}

const COMMON_BRING: L<string[]> = {
  en: [
    "Insurance card and photo ID",
    "Referral, if your insurance plan requires one",
    "List of current medicines and doses (as written on the labels)",
    "A favorite toy, tablet, blanket or snack for waiting time",
  ],
  es: [
    "Tarjeta de seguro e identificación con foto",
    "Referido, si su plan de seguro lo exige",
    "Lista de medicamentos actuales y dosis (como aparecen en las etiquetas)",
    "Un juguete, tableta, cobija o merienda favorita para la espera",
  ],
};

export const VISITS: VisitPrep[] = [
  {
    id: "visit-first",
    type: "first_visit",
    clinicReview: "pending",
    icon: "👋",
    title: { en: "First visit", es: "Primera visita" },
    checklist: [
      { id: "forms", text: { en: "Fill out new-patient forms ahead of time (Patient Forms page or portal)", es: "Llene los formularios de paciente nuevo con anticipación (página de formularios o portal)" } },
      { id: "records", text: { en: "Ask past doctors to send records, imaging (MRI/CT) and EEG reports", es: "Pida a médicos anteriores que envíen expedientes, imágenes (MRI/CT) y reportes de EEG" } },
      { id: "notes", text: { en: "Write down your questions and what you have noticed (when, how often, how long)", es: "Escriba sus preguntas y lo que ha notado (cuándo, con qué frecuencia, cuánto dura)" } },
      { id: "video", text: { en: "If your child has spells, a short phone video of one can help the doctor", es: "Si su hijo tiene episodios, un video corto en el teléfono puede ayudar al médico" } },
      { id: "school", text: { en: "Bring school reports or teacher notes if learning or attention is a concern", es: "Traiga informes escolares o notas del maestro si le preocupa el aprendizaje o la atención" } },
    ],
    bring: COMMON_BRING,
    expect: {
      en: [
        "Check-in and paperwork",
        "A conversation about your child's history and your concerns",
        "A neurological exam: watching how your child moves, walks, talks and plays",
        "A plan for next steps, which may include tests",
      ],
      es: [
        "Registro y papeleo",
        "Una conversación sobre la historia de su hijo y sus preocupaciones",
        "Un examen neurológico: observar cómo su hijo se mueve, camina, habla y juega",
        "Un plan con los próximos pasos, que puede incluir pruebas",
      ],
    },
    kidVersion: {
      en: "Today you'll meet a doctor who knows a LOT about brains. They'll ask questions, watch you walk and play, and maybe check your reflexes with a tiny tap. No shots for this visit!",
      es: "Hoy conocerás a un doctor que sabe MUCHO sobre el cerebro. Te hará preguntas, te verá caminar y jugar, y quizás revise tus reflejos con un golpecito. ¡En esta visita no hay vacunas!",
    },
  },
  {
    id: "visit-routine-eeg",
    type: "routine_eeg",
    clinicReview: "pending",
    icon: "🧠",
    title: { en: "Routine EEG", es: "EEG de rutina" },
    checklist: [
      { id: "hair", text: { en: "Wash hair the night before or morning of; no conditioner, oils, gels or sprays", es: "Lave el cabello la noche anterior o esa mañana; sin acondicionador, aceites, geles ni lacas" } },
      { id: "braids", text: { en: "Take out braids, extensions and hair clips", es: "Quite trenzas, extensiones y ganchos del cabello" } },
      { id: "meds", text: { en: "Give regular medicines as usual unless the PENS team told you otherwise", es: "Dé los medicamentos de siempre a menos que el equipo de PENS le indique otra cosa" } },
      { id: "eat", text: { en: "Have a normal meal beforehand", es: "Que coma normalmente antes de la cita" } },
      { id: "story", text: { en: "Try the 'My EEG Day' story together", es: "Prueben juntos el cuento 'Mi día de EEG'" } },
    ],
    bring: COMMON_BRING,
    expect: {
      en: [
        "A technologist measures your child's head and marks spots with a washable pencil",
        "Small sensors are placed on the scalp with a sticky paste",
        "Your child rests quietly; they may be asked to breathe fast or look at flashing lights",
        "Afterward, the paste is cleaned off; some may stay in the hair until the next wash",
      ],
      es: [
        "Un técnico mide la cabeza de su hijo y marca puntos con un lápiz lavable",
        "Se colocan sensores pequeños en el cuero cabelludo con una pasta pegajosa",
        "Su hijo descansa tranquilo; quizás le pidan respirar rápido o mirar luces que parpadean",
        "Al final se limpia la pasta; un poco puede quedar en el cabello hasta el próximo lavado",
      ],
    },
    kidVersion: {
      en: "An EEG is like taking a picture of your brain's tiny messages. Stickers go on your head (they feel cool and squishy), and you rest like a statue. It doesn't hurt. Then you're done!",
      es: "Un EEG es como tomarle una foto a los mensajitos de tu cerebro. Te ponen calcomanías en la cabeza (se sienten frescas y blanditas) y descansas como una estatua. No duele. ¡Y listo!",
    },
  },
  {
    id: "visit-sleep-eeg",
    type: "sleep_deprived_eeg",
    clinicReview: "pending",
    icon: "🌙",
    title: { en: "Sleep-deprived EEG", es: "EEG con privación de sueño" },
    checklist: [
      { id: "sleep-plan", text: { en: "Follow the exact sleep instructions PENS gave you (how late to keep your child up, when to wake them)", es: "Siga exactamente las instrucciones de sueño que le dio PENS (hasta qué hora mantenerlo despierto y cuándo despertarlo)" } },
      { id: "no-nap", text: { en: "Keep your child awake on the drive (no car naps!)", es: "Mantenga a su hijo despierto en el carro (¡nada de siestas!)" } },
      { id: "no-caffeine", text: { en: "Avoid caffeine, soda and chocolate before the test", es: "Evite cafeína, refrescos y chocolate antes de la prueba" } },
      { id: "hair", text: { en: "Clean, dry hair with no conditioner, oils or products", es: "Cabello limpio y seco, sin acondicionador, aceites ni productos" } },
      { id: "comfort", text: { en: "Pack comfy clothes and a sleep buddy (blanket or stuffed animal)", es: "Lleve ropa cómoda y un compañero para dormir (cobija o peluche)" } },
      { id: "driver", text: { en: "Have a second adult drive if possible, so one can keep your child awake", es: "Si puede, que otro adulto maneje para que uno mantenga al niño despierto" } },
    ],
    bring: COMMON_BRING,
    expect: {
      en: [
        "Same setup as a routine EEG",
        "Lights are dimmed so your child can fall asleep during the recording",
        "Sleep helps the team see brain activity that may only show up during sleep",
        "Your child will likely be tired afterward",
      ],
      es: [
        "La misma preparación que un EEG de rutina",
        "Se bajan las luces para que su hijo se duerma durante la grabación",
        "El sueño ayuda al equipo a ver actividad cerebral que quizás solo aparece al dormir",
        "Es probable que su hijo esté cansado después",
      ],
    },
    kidVersion: {
      en: "This EEG is a special sleepy one! You stay up a little late, then at the visit you get to take a nap while the stickers listen to your brain dream.",
      es: "¡Este EEG es uno especial con sueñito! Te acuestas un poco tarde y en la visita tomas una siesta mientras las calcomanías escuchan a tu cerebro soñar.",
    },
  },
  {
    id: "visit-video-eeg",
    type: "video_eeg",
    clinicReview: "pending",
    icon: "🎥",
    title: { en: "Video EEG monitoring stay", es: "Estancia de monitoreo con video EEG" },
    checklist: [
      { id: "length", text: { en: "Confirm how long the recording will be and what time to arrive", es: "Confirme cuánto durará la grabación y a qué hora llegar" } },
      { id: "meds", text: { en: "Ask the team whether to give or change any medicines; only change if they tell you to", es: "Pregunte al equipo si debe dar o cambiar algún medicamento; solo cambie si se lo indican" } },
      { id: "clothes", text: { en: "Pack button-front or zip-up shirts (easier with wires on)", es: "Lleve camisas con botones o cierre (más fáciles con los cables)" } },
      { id: "fun", text: { en: "Pack quiet activities: books, coloring, downloaded shows, chargers", es: "Lleve actividades tranquilas: libros, colorear, programas descargados, cargadores" } },
      { id: "log", text: { en: "Be ready to note the time of any spells and press the event button if shown how", es: "Esté listo para anotar la hora de los episodios y presionar el botón de eventos si se lo enseñan" } },
      { id: "hair", text: { en: "Clean, dry hair with no products; no braids or extensions", es: "Cabello limpio y seco sin productos; sin trenzas ni extensiones" } },
    ],
    bring: COMMON_BRING,
    expect: {
      en: [
        "Sensors are placed and wrapped so they stay on for the whole recording",
        "A camera records video at the same time as the EEG",
        "Your child stays in the monitoring area; a parent or caregiver usually stays too",
        "The team reviews the recording and shares results at a follow-up",
      ],
      es: [
        "Se colocan los sensores y se envuelven para que queden puestos toda la grabación",
        "Una cámara graba video al mismo tiempo que el EEG",
        "Su hijo se queda en el área de monitoreo; normalmente un padre o cuidador también se queda",
        "El equipo revisa la grabación y comparte los resultados en una cita de seguimiento",
      ],
    },
    kidVersion: {
      en: "For a video EEG, you wear a cozy sticker hat for a while and a camera keeps you company. You can watch shows, color and read. Think of it like a brain sleepover!",
      es: "En un video EEG llevas un gorrito de calcomanías por un rato y una cámara te acompaña. Puedes ver programas, colorear y leer. ¡Es como una pijamada para tu cerebro!",
    },
  },
  {
    id: "visit-adhd",
    type: "adhd_testing",
    clinicReview: "pending",
    icon: "🎯",
    title: { en: "Computerized ADHD testing", es: "Prueba computarizada de TDAH" },
    checklist: [
      { id: "sleep", text: { en: "Get a good night's sleep before the test", es: "Que duerma bien la noche anterior" } },
      { id: "meds", text: { en: "Ask PENS whether to give ADHD medicine that day; follow their instructions", es: "Pregunte a PENS si debe dar el medicamento para el TDAH ese día; siga sus instrucciones" } },
      { id: "glasses", text: { en: "Bring glasses or hearing aids if your child uses them", es: "Traiga lentes o audífonos si su hijo los usa" } },
      { id: "forms", text: { en: "Complete any parent and teacher questionnaires you were sent", es: "Complete los cuestionarios para padres y maestros que le enviaron" } },
      { id: "breakfast", text: { en: "Eat a normal breakfast or meal", es: "Que coma un desayuno o comida normal" } },
    ],
    bring: COMMON_BRING,
    expect: {
      en: [
        "Your child sits at a computer and responds to simple targets on screen",
        "It measures attention and reaction over several minutes",
        "There are no right or wrong feelings; it isn't a school test",
        "Results are combined with history and questionnaires; the test alone doesn't decide",
      ],
      es: [
        "Su hijo se sienta frente a una computadora y responde a figuras sencillas en la pantalla",
        "Mide la atención y la reacción durante varios minutos",
        "No es un examen escolar; no hay que estudiar",
        "Los resultados se combinan con la historia y los cuestionarios; la prueba sola no decide",
      ],
    },
    kidVersion: {
      en: "It's a computer game about paying attention! You watch the screen and press a button when you see the right thing. Just do your best; there's nothing to study.",
      es: "¡Es un juego de computadora sobre prestar atención! Miras la pantalla y presionas un botón cuando ves lo correcto. Solo haz tu mejor esfuerzo; no hay nada que estudiar.",
    },
  },
  {
    id: "visit-neuropsych",
    type: "neuropsych_eval",
    clinicReview: "pending",
    icon: "🧩",
    title: { en: "Neuropsychology evaluation", es: "Evaluación de neuropsicología" },
    checklist: [
      { id: "time", text: { en: "Plan for a long visit; ask how many hours and whether there are multiple sessions", es: "Prepárese para una visita larga; pregunte cuántas horas dura y si hay varias sesiones" } },
      { id: "school", text: { en: "Gather report cards, IEP/504 plans and prior testing", es: "Reúna boletas de calificaciones, planes IEP/504 y evaluaciones anteriores" } },
      { id: "snacks", text: { en: "Pack snacks and water for breaks", es: "Lleve meriendas y agua para los descansos" } },
      { id: "sleep", text: { en: "Aim for a good night's sleep before", es: "Procure que duerma bien la noche anterior" } },
      { id: "glasses", text: { en: "Bring glasses or hearing aids if used", es: "Traiga lentes o audífonos si los usa" } },
    ],
    bring: COMMON_BRING,
    expect: {
      en: [
        "A parent interview about development, school and behavior",
        "Your child does puzzles, memory games, drawing and question activities with breaks",
        "A written report and a feedback visit to go over results and recommendations",
      ],
      es: [
        "Una entrevista con los padres sobre el desarrollo, la escuela y la conducta",
        "Su hijo hace rompecabezas, juegos de memoria, dibujos y preguntas, con descansos",
        "Un informe escrito y una cita para revisar resultados y recomendaciones",
      ],
    },
    kidVersion: {
      en: "You'll do puzzles, drawing and brain games with a friendly helper. Some are easy and some are tricky, and that's on purpose. You get breaks and snacks!",
      es: "Harás rompecabezas, dibujos y juegos para el cerebro con una persona amable. Algunos son fáciles y otros difíciles, y eso es a propósito. ¡Habrá descansos y meriendas!",
    },
  },
];
