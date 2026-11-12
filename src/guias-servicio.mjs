export const guiasServicio = {
  reparacion: {
    heading: 'Localizar la avería antes de sustituir equipos',
    photo: 'amplificador-de-senal',
    blocks: [
      ['Una toma o toda la vivienda', 'Comparamos dónde se ve y dónde falla la televisión. Si el mismo aparato funciona en otra habitación, revisamos la toma y el recorrido del coaxial hacia el punto afectado. Si fallan todas las tomas, interesa comprobar también la señal que entra a la vivienda.'],
      ['Recepción, cable o amplificación', 'Revisamos antena, conexiones y equipos. La medición con Promax permite comparar el nivel y la calidad de señal en los puntos necesarios para localizar el fallo. Después valoramos reparar una conexión, cambiar cable o sustituir el equipo afectado.'],
      ['Qué debe quedar explicado', 'Te indicamos qué parte causa el problema, qué intervención proponemos y qué elementos se pueden aprovechar. La valoración depende de las comprobaciones en la instalación.']
    ],
    local: 'Si se pierde señal en una toma, la comparamos con otra que funcione. Si falla toda la vivienda, revisamos la entrada y los equipos compartidos por las tomas. Medimos con Promax donde hace falta para localizar la pérdida antes de proponer cable, antena o amplificador.',
    cases: [['/bizkaia/bilbao/#caso-pixelacion-bilbao', 'Bilbao: canales que desaparecían a ciertas horas'], ['/bizkaia/bermeo/#trabajos-locales','Bermeo: cable, vientos y amplificador']],
    questions: [['¿Hay que cambiar siempre la antena?', 'Depende del diagnóstico. Si el fallo está en un conector, un tramo de cable o un equipo de amplificación, puede ser suficiente intervenir en esa parte.'], ['¿Qué datos ayudan al pedir una visita?', 'Qué canales fallan, desde cuándo ocurre, qué tomas están afectadas y si algún vecino tiene el mismo problema.']]
  },
  instalacion: {
    heading: 'Planificar la antena y el recorrido hasta las tomas',
    photo: 'tdt-en-tejado',
    blocks: [
      ['Ubicación y soporte', 'Revisamos el punto de montaje, el soporte disponible y el acceso a la instalación. La ubicación se valora por las condiciones de recepción y de montaje de la vivienda.'],
      ['Cable y habitaciones', 'Indica cuántas tomas quieres usar y dónde están. Si existe coaxial, comprobamos su estado y medimos en las tomas para decidir qué puede conservarse. El recorrido del cable y el reparto forman parte de la valoración.'],
      ['Comprobar la instalación', 'Con el medidor de campo profesional Promax comprobamos la señal en los puntos necesarios. El presupuesto concreta antena, soportes, cable y equipos que requiere el montaje, según la situación encontrada.']
    ],
    local: 'Para instalar una antena revisamos dónde montarla, el estado del soporte y el recorrido hacia las habitaciones. Si existe coaxial, comprobamos qué se puede reutilizar. La medición con Promax ayuda a valorar la recepción y la señal que llega a las tomas.',
    cases: [['/bizkaia/bermeo/#trabajos-locales','Bermeo: intervención en antena, cableado y sujeción'], ['/bizkaia/gernika-lumo/#trabajos-locales','Gernika-Lumo: montaje exterior fotografiado']],
    questions: [['¿Se puede aprovechar el cable anterior?', 'Se valora después de revisar el recorrido, su estado y la señal que llega a las tomas. La decisión forma parte del presupuesto.'], ['¿Qué indicar en una reforma?', 'Las habitaciones que tendrán televisión, las tomas existentes y si hay un recorrido previsto desde la cubierta.']]
  },
  comunidades: {
    heading: 'Separar el fallo común del problema de una vivienda',
    photo: 'bilbao-cabecera-modular',
    blocks: [
      ['Delimitar las viviendas afectadas', 'Pregunta si se pierden los mismos canales en varias viviendas, plantas o escaleras. Ese dato ayuda a organizar la visita y a distinguir un fallo general de un problema en una parte de la distribución.'],
      ['Cabecera y red de reparto', 'Comparamos señal a la entrada y salida de los equipos comunes y en tomas representativas. Se revisan amplificación, conexiones y tramos compartidos para localizar dónde aparece la pérdida.'],
      ['Acceso y propuesta para la comunidad', 'Coordina quién puede abrir el cuarto de telecomunicaciones y facilitar el acceso a las zonas necesarias. La valoración debe explicar qué equipo o tramo se interviene y qué partes se conservan.']
    ],
    local: 'En una comunidad comparamos el fallo de las viviendas afectadas con la señal de la cabecera y el reparto. Las medidas con Promax ayudan a localizar si la pérdida está en un equipo común o en un ramal. Antes de la visita conviene coordinar el acceso a los equipos.',
    cases: [['/bizkaia/bilbao/#instalaciones-comunitarias','Bilbao: instalaciones comunitarias en Arbolantxa y Cortes'], ['/gipuzkoa/deba/#trabajos-locales','Deba: equipos de amplificación y distribución']],
    questions: [['¿Qué preguntar a los vecinos?', 'Si pierden los mismos canales y en qué plantas o escaleras ocurre. Conviene identificar también alguna toma que siga funcionando.'], ['¿Debe acudir el administrador?', 'Lo necesario es coordinar el acceso a los equipos comunes y una persona de contacto para explicar la intervención que se propone.']]
  },
  satelite: {
    heading: 'Valorar la recepción por satélite en tu instalación',
    photo: 'mastil-varias-antenas',
    blocks: [
      ['Instalación nueva o fallo existente', 'Indica qué servicio quieres recibir, qué receptor utilizas y si ya existe una parabólica. Si es una avería, concreta si han desaparecido todos los canales o solo algunos.'],
      ['Parabólica y recorrido de señal', 'Revisamos orientación, soporte, conexiones y cableado, además del equipo de recepción. La comprobación permite valorar dónde intervenir y qué elementos de la instalación existente se pueden aprovechar.'],
      ['Servicio y presupuesto', 'El montaje se valora para la dirección y el equipo concretos. Si buscas una alternativa a la TDT, explícalo al consultar para estudiar la opción que corresponda. El presupuesto debe concretar qué equipos y trabajos incluye.']
    ],
    local: 'Para una parabólica necesitamos saber qué servicio quieres ver y qué receptor tienes. Revisamos la recepción, el soporte y el recorrido del cable. Si fallan TDT y satélite, comprobamos qué elementos comparten antes de valorar la sustitución de equipos.',
    cases: [['/leon/villablino/#trabajos-locales','Villablino: TDT, tres parabólicas y central amplificadora de TV y SAT'], ['/bizkaia/amorebieta-etxano/#trabajos-locales','Amorebieta-Etxano: instalación de parabólica para Astra 19,2° Este'], ['/gipuzkoa/deba/#trabajos-locales','Deba: instalación con televisión terrestre y satélite']],
    questions: [['¿Sirve cualquier receptor?', 'La elección depende del servicio que quieres recibir. Indica el modelo del equipo al pedir la valoración.'], ['¿Y si también falla la TDT?', 'Cuéntanos si las dos señales llegan por la misma instalación y qué tomas están afectadas, para orientar la revisión de los elementos compartidos.']]
  }
};
