// Orientaciones de servicio. No describen intervenciones realizadas.
export const ayudaBurgos = {
  '09059': {
    title: 'Preparar una revisión de antena colectiva en Burgos',
    blocks: [
      ['Qué viviendas comparar', 'Anota un canal que falle y otro que funcione. Pregunta a un vecino de otra planta y, si hay varias escaleras, a uno de otro portal. Indica si ocurre a la vez. Esa comparación permite preparar la revisión de la cabecera compartida o de un ramal concreto; no basta con que dos televisores muestren «sin señal» para atribuirlo a la antena.'],
      ['Qué acceso necesita la visita', 'Coordina con el administrador o presidente el acceso al cuarto de telecomunicaciones y a una vivienda afectada. Si se cambió un amplificador o se reformó una toma justo antes del fallo, facilita ese dato. No hace falta que los vecinos modifiquen los ajustes de la cabecera.'],
      ['Qué debe aclarar la valoración', 'La propuesta debe indicar si la actuación afecta al equipo común, a una derivación o a la instalación de una vivienda, qué material se sustituye y dónde se comprobará la señal después. Así la comunidad puede valorar el alcance de la reparación.'],
    ],
    request: 'necesito revisar la antena colectiva',
    fields: ['Calle y portal', 'Plantas o escaleras afectadas', 'Canales y horario del fallo', 'Contacto para acceder a la cabecera'],
    related: ['/servicios/comunidades/', 'Cómo revisamos una antena comunitaria'],
  },
  '09219': {
    title: 'Si has cambiado de televisor en Miranda de Ebro',
    blocks: [
      ['Identifica de dónde venía la imagen', 'Si antes veías la televisión mediante un decodificador conectado por HDMI, selecciona esa entrada y enciende el decodificador. Si el cable coaxial llega directamente al televisor, usa el modo Antena o TDT. Una búsqueda de canales terrestres no sustituye a la selección de un equipo externo.'],
      ['Compara sin cambiar varias cosas a la vez', 'Si conservas el televisor anterior, pruébalo en la misma toma y con el mismo cable corto. Si funciona, revisa primero la configuración y compatibilidad del nuevo. Si fallan los dos, prueba una toma que sepas que funciona. El resultado orienta la visita, aunque no sustituye a una medición.'],
      ['Si solo faltan los canales UHD', 'Anota el modelo exacto del aparato. Una pantalla 4K no confirma por sí sola que su sintonizador reciba DVB-T2 con HEVC/H.265. Consulta esas características en el manual y utiliza la guía de sintonización antes de decidir cambiar la antena.'],
    ],
    request: 'necesito ayuda con la recepción del televisor',
    fields: ['Dirección', 'Modelo del televisor o receptor', 'Canales que faltan', 'Resultado con otro televisor en la misma toma'],
    related: ['/ayuda-antenas/#tdt-uhd', 'Comprobar el equipo y la recepción de UHD'],
  },
  '09018': {
    title: 'Qué concretar al reformar la instalación de TV en Aranda',
    blocks: [
      ['Dibuja las tomas que vas a utilizar', 'Indica las habitaciones y plantas que necesitan televisión, dónde entra el cable exterior y dónde quedará el reparto. Si vas a cerrar paredes, conviene revisar antes los tubos disponibles y el recorrido del coaxial. Añadir tomas cambia la distribución y requiere comprobar la señal que llega a cada punto.'],
      ['Aclara si quieres TDT, satélite o ambas', 'Para TDT basta con concretar las tomas y los canales que quieres recibir. Si también quieres satélite, indica el servicio y cuántos receptores usarás a la vez. Esa información permite valorar antenas, reparto y compatibilidad de las tomas sin dar por hecho que todos los equipos pueden compartir el mismo cable.'],
      ['Qué comparar en el presupuesto', 'Comprueba qué incluye de cable exterior e interior, tomas, repartidores, soporte, amplificación y mano de obra. Pide que se distinga el material que se conserva del que se cambia y que se concrete la comprobación en las tomas que vas a usar.'],
    ],
    request: 'quiero valorar la instalación de antena para una reforma',
    fields: ['Dirección o núcleo', 'Habitaciones y plantas con TV', 'TDT, satélite o ambas', 'Cableado y soporte existentes'],
    related: ['/servicios/instalacion/', 'Cómo valoramos una instalación nueva de antena'],
  },
  '09194': {
    title: 'Cómo describir una avería intermitente en Lerma',
    blocks: [
      ['Anota cuándo aparece y cuándo desaparece', 'Indica los canales afectados, una hora aproximada y si el corte coincide con lluvia o viento. Comprueba si ocurre simultáneamente en otra toma. Si la avería no está presente al llegar, esas referencias ayudan a elegir qué puntos comparar durante la revisión.'],
      ['Describe el montaje sin subir a la cubierta', 'Una fotografía que ya tengas, tomada desde el suelo, puede mostrar si el mástil está en una pared o sobre el tejado. Indica cómo se accede a la instalación y si observas una pieza desplazada. No muevas la antena para hacer la prueba: la orientación se valora midiendo la señal.'],
      ['Concreta el núcleo y el acceso a la vivienda', 'Si el aviso corresponde a una pedanía o una casa que solo se abre algunos días, envía el nombre del núcleo, la ubicación y cuándo habrá alguien. El desplazamiento se organiza desde Bilbao y el plazo se confirma para esa dirección.'],
    ],
    request: 'necesito revisar cortes intermitentes de televisión',
    fields: ['Municipio y núcleo', 'Canales y horas de los cortes', 'Tomas afectadas', 'Disponibilidad para abrir la vivienda'],
    related: ['/ayuda-antenas/#pixelacion', 'Qué comprobar cuando la imagen se congela'],
  },
};
