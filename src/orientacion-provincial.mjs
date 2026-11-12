// Ayuda para elegir el servicio. Los enlaces a trabajos conservan su ubicación real.
export const orientacionProvincial = {
  '01': {
    title: 'Qué revisión necesitas en Álava',
    cards: [
      ['Una toma nueva en otra planta', 'Indica cuántas tomas funcionan ahora y dónde quieres añadir la nueva. Comparar el reparto actual con el recorrido previsto permite valorar el cable y los elementos de distribución.', '/alava/amurrio/', 'Preparar una ampliación de tomas en Amurrio'],
      ['El viento ha dañado la antena', 'Cuenta si fallan todas las televisiones y si desde el suelo se aprecia una pieza desplazada. El caso de Amurrio documenta cómo se encontró una antena caída antes de repararla.', '/alava/amurrio/#trabajos-locales', 'Ver la reparación de Amurrio'],
      ['Falla el audio del portero', 'Indica la marca, el síntoma y si afecta a una vivienda o a toda la comunidad. En Laudio está documentada la reparación de un grupo fónico Fermax PVT9696.', '/alava/llodio/#visita-portero-01036', 'Ver la intervención en Laudio'],
    ],
    fields: ['Municipio y concejo o núcleo', 'Antena o portero', 'Tomas o viviendas afectadas', 'Acceso a la instalación'],
  },
  '20': {
    title: 'Situaciones que revisamos en Gipuzkoa',
    cards: [
      ['Faltan cadenas aunque otras se ven bien', 'Apunta qué canales faltan y cuáles funcionan. En una vivienda de Udala se necesitaron dos antenas y el ajuste del amplificador multibanda; la solución se decide con las medidas de cada instalación.', '/gipuzkoa/arrasate-mondragon/#trabajos-locales', 'Consultar el montaje de Udala'],
      ['Mástil dañado después de fuertes vientos', 'Indica cuándo se perdió la televisión y si el mástil parece inclinado desde el suelo. El trabajo de Tolosa documenta una sustitución urgente de mástil y antenas.', '/gipuzkoa/tolosa/#trabajos-locales', 'Ver la intervención de Tolosa'],
      ['TDT y parabólica comparten la instalación', 'Aclara cuál de las dos señales falla y en qué tomas. En Deba puedes ver equipos de recepción y distribución, junto con una medición de TDT con Promax.', '/gipuzkoa/deba/#trabajos-locales', 'Ver los equipos y la medición de Deba'],
    ],
    fields: ['Municipio, barrio y dirección', 'TDT, satélite o portero', 'Canales o viviendas afectadas', 'Horario y acceso para la visita'],
  },
  '24': {
    title: 'Elegir la revisión de antena en León',
    cards: [
      ['Falla un portal o una escalera', 'Si la señal es comunitaria, identifica qué portales comparten el problema y quién puede dar acceso a los equipos. Una toma que funcione sirve como referencia para la revisión.', '/leon/leon/#preparar-visita', 'Organizar un aviso de comunidad en León'],
      ['No sabes si falla la TDT o el satélite', 'Anota qué receptor usas, la entrada seleccionada y el mensaje de la pantalla. Si las señales comparten cableado, interesa indicar si falla solo una de ellas o ambas.', '/leon/ponferrada/#preparar-visita', 'Distinguir el fallo antes de pedir visita en Ponferrada'],
      ['Una casa lleva tiempo sin utilizarse', 'Indica el núcleo, cuándo habrá alguien y qué parte de la instalación sigue funcionando. Comprobar las tomas existentes permite valorar qué material se puede conservar antes de presupuestar una renovación.', '/servicios/reparacion/', 'Cómo valoramos una reparación de antena'],
    ],
    fields: ['Municipio y núcleo exacto', 'Vivienda individual o comunidad', 'Servicio y canales que faltan', 'Fechas disponibles para abrir la vivienda'],
  },
  '39': {
    title: 'Trabajos y consultas de antena en Cantabria',
    cards: [
      ['Recepción que ha empeorado con los años', 'En la avenida Primero de Mayo de Castro Urdiales, la antena y los amplificadores antiguos daban mala recepción. Se renovó la antena TDT con amplificador de mástil y fuente.', '/cantabria/castro-urdiales/#trabajos-locales', 'Ver la renovación de Castro Urdiales'],
      ['No se reciben todas las cadenas', 'Anota cuáles faltan y si ocurre en todas las tomas. El caso de Los Corrales de Buelna muestra un cambio de antenas para recuperar los canales.', '/cantabria/los-corrales-de-buelna/#trabajos-locales', 'Consultar el trabajo de Los Corrales de Buelna'],
      ['La avería está en el portero comunitario', 'Indica si falla la llamada, el audio o la apertura y cuántas viviendas están afectadas. En Torrelavega se documenta la reparación de un grupo fónico Golmar Stadio.', '/cantabria/torrelavega/#visita-portero-39087', 'Ver la reparación del portero en Torrelavega'],
    ],
    fields: ['Municipio y dirección', 'Antena, satélite o portero', 'Síntoma y desde cuándo ocurre', 'Persona que facilita el acceso'],
  },
  '26': {
    title: 'Preparar la revisión de televisión en La Rioja',
    cards: [
      ['Varios vecinos pierden los mismos canales', 'Anota las plantas y escaleras afectadas y si hubo obras o cambios de equipos antes del fallo. La revisión necesita acceso al equipo común y a una toma donde se reproduzca el problema.', '/la-rioja/logrono/#preparar-visita', 'Preparar el aviso de una comunidad en Logroño'],
      ['Vuelves a una segunda vivienda', 'Comprueba qué entrada utiliza el televisor, qué canales conserva y si la incidencia aparece en otra toma. Facilita las fechas en que se podrá acceder a la casa.', '/la-rioja/haro/#preparar-visita', 'Preparar una revisión en Haro'],
      ['Solo falla una habitación', 'Prueba el mismo televisor y cable corto en una toma que funcione. Si el fallo se queda en la habitación, interesa revisar ese ramal antes de decidir qué equipo sustituir.', '/la-rioja/calahorra/', 'Consultar la revisión de tomas y cable en Calahorra'],
    ],
    fields: ['Municipio y dirección', 'Tomas o viviendas afectadas', 'Canales que fallan', 'Disponibilidad y acceso al equipo'],
  },
};

export const ayudaMunicipal = {
  '24089': {
    title: 'Organizar una visita a una comunidad de León',
    blocks: [
      ['Identifica el alcance de la incidencia', 'Anota qué portales, escaleras y plantas han perdido la televisión. Si hay más de una antena o cabecera, indícalo sin cambiar sus ajustes. Pregunta si algún vecino conserva los mismos canales en ese momento: sirve como punto de comparación.'],
      ['Prepara los accesos que hacen falta', 'Coordina la apertura del cuarto de telecomunicaciones y de una vivienda afectada. Si el problema aparece a determinadas horas, comunícalo al solicitar la visita. Un registro de canales y horarios ayuda a describir una avería que puede no estar presente al llegar.'],
      ['Separa equipo común e instalación interior', 'La medición compara lo que entrega la cabecera con lo que llega a las tomas. La valoración debe concretar qué parte se propone reparar y a qué viviendas afecta. Si solo falla una toma, indica si se cambió durante una reforma reciente.'],
    ],
    request: 'necesito revisar la antena de una comunidad',
    fields: ['Calle y portal', 'Escaleras y plantas afectadas', 'Canales y horarios del fallo', 'Contacto para abrir la instalación'],
    related: ['/servicios/comunidades/', 'Cómo se revisa una antena comunitaria'],
  },
  '24115': {
    title: 'Distinguir TDT y satélite antes de una visita en Ponferrada',
    blocks: [
      ['Describe cómo veías esos canales', 'Indica si el cable va directamente al televisor o a un receptor externo conectado por HDMI. Anota el modelo del receptor y el texto exacto del aviso. «Sin señal» en una entrada HDMI y falta de señal de antena requieren comprobaciones diferentes.'],
      ['Anota qué parte sigue funcionando', 'Si recibes TDT y satélite, comprueba cuál falla y si ocurre en una toma o en todas. Cuando solo falla el satélite se revisa su recorrido, las conexiones, el LNB y la orientación según el montaje. Si fallan ambas señales, interesa identificar qué equipos y cables comparten.'],
      ['Si buscas una instalación nueva', 'Facilita los canales o el servicio que quieres recibir y cuántos receptores se usarán. La elección de parabólica, receptor y reparto depende de esa información. La valoración de recepción se hace para la dirección concreta y no se deduce solo del nombre del municipio.'],
    ],
    request: 'necesito revisar la recepción de TDT o satélite',
    fields: ['Dirección o núcleo', 'TDT o satélite', 'Receptor y mensaje de pantalla', 'Canales y tomas afectados'],
    related: ['/servicios/satelite/', 'Qué revisar en una instalación de satélite'],
  },
  '26089': {
    title: 'Si una comunidad de Logroño pierde canales después de una obra',
    blocks: [
      ['Identifica qué se modificó', 'Indica si se cambiaron tomas, cableado, repartidores o equipos de cabecera y en qué plantas se trabajó. Si tienes una relación del material instalado, puede ayudar a preparar la revisión. La coincidencia con una obra orienta la comprobación, pero no demuestra por sí sola la causa.'],
      ['Compara una toma anterior y una modificada', 'Pregunta si las viviendas donde no hubo cambios conservan la señal. Si el mismo televisor y cable corto funcionan en una toma antigua y fallan en la nueva, comunícalo. Durante la visita se puede medir antes y después del tramo modificado.'],
      ['Concreta quién puede abrir los registros', 'Coordina con la comunidad el acceso a los equipos y a una toma afectada. La propuesta de reparación debe señalar el tramo y los elementos que se van a revisar o sustituir, además de los puntos donde se comprobará la señal.'],
    ],
    request: 'necesito revisar una avería de TV después de una obra',
    fields: ['Portal y plantas afectadas', 'Cambios realizados y fecha aproximada', 'Tomas que siguen funcionando', 'Contacto para facilitar el acceso'],
    related: ['/servicios/comunidades/', 'Revisión de la distribución en comunidades'],
  },
  '26071': {
    title: 'Comprobar la televisión al volver a una vivienda en Haro',
    blocks: [
      ['Recupera la conexión que utilizabas', 'Si veías la televisión con un receptor externo, comprueba que está encendido y selecciona su entrada HDMI. Si usabas la antena conectada directamente, selecciona TV o Antena. Anota si faltan algunos canales o si la pantalla muestra que no recibe señal.'],
      ['Haz una comparación sencilla entre tomas', 'Si tienes más de una toma, prueba el mismo televisor con el mismo cable corto. Si solo falla una estancia, interesa revisar su conexión y su ramal. Si todas fallan, indica si la antena es individual o de la comunidad y si otros vecinos reciben señal.'],
      ['Prepara una visita con la casa accesible', 'Facilita los días en que habrá alguien, el número de tomas que quieres usar y si existe un receptor de satélite. Una foto de los equipos interiores accesibles ayuda a identificar el material. La disponibilidad y el plazo se confirman al organizar el desplazamiento.'],
    ],
    request: 'necesito revisar la televisión de una vivienda de temporada',
    fields: ['Dirección', 'Fechas con acceso a la vivienda', 'Canales y tomas que funcionan', 'Televisor o receptor utilizado'],
    related: ['/ayuda-antenas/#resintonizar', 'Cómo buscar canales en el televisor o receptor'],
  },
};
