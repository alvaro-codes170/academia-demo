// ==========================================================
// Formulario de clase de prueba
//
// Sin JavaScript el formulario también funciona: se envía directo
// a Formspree con la validación básica del navegador.
// Con JavaScript lo mejoramos:
//   - avisos claros junto a cada campo
//   - casilla de tutor legal solo para menores de 14
//   - antispam (campo trampa) y bloqueo de envíos dobles
//   - estados "Enviando...", éxito y error sin perder lo escrito
// ==========================================================
(function () {
  const form = document.getElementById('formulario-prueba');
  if (!form) return;

  const boton = form.querySelector('.formulario__enviar');
  const textoBoton = boton.textContent;
  const exito = document.getElementById('estado-exito');
  const error = document.getElementById('estado-error');
  const edad = document.getElementById('edad');
  const bloqueTutor = document.getElementById('bloque-tutor');
  const tutor = document.getElementById('tutor');
  const trampa = document.getElementById('campo-web');
  // La dirección de Formspree sale de config.js (o, si faltara, del action del formulario)
  const endpoint = () => (typeof CONFIG !== 'undefined' && CONFIG.formspree) || form.action;
  const MENOR = 'Menor de 14 años';
  const TIEMPO_MAXIMO = 15000; // 15 s sin respuesta = error

  let enviando = false;
  let yaIntentado = false; // tras el primer intento, validamos al salir de cada campo

  // Desactivamos los globos de error del navegador: usamos los nuestros.
  form.noValidate = true;

  // ---------- Reglas de cada campo ----------
  // Cada regla devuelve el mensaje de error o "" si está bien.
  const soloDigitos = (v) => v.replace(/[\s+]/g, '');
  const reglas = {
    nombre: (v) => (v.trim().length < 3 ? 'Escribe tu nombre y apellidos.' : ''),
    email: (v) => {
      if (!v.trim()) return 'Escribe tu correo electrónico.';
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Este correo no parece correcto. Ejemplo: nombre@correo.com';
    },
    telefono: (v) => {
      if (!v.trim()) return 'Escribe un teléfono de contacto.';
      if (/[^\d\s+]/.test(v)) return 'El teléfono solo puede llevar números (sin letras ni guiones).';
      const n = soloDigitos(v).length;
      return n < 9 || n > 15 ? 'El teléfono debe tener al menos 9 cifras.' : '';
    },
    alumno: (v) => (v.trim().length < 2 ? 'Escribe el nombre del alumno o alumna.' : ''),
    edad: (v) => (v ? '' : 'Elige la edad o el curso.'),
    interes: (v) => (v ? '' : 'Elige qué te interesa.'),
    franja: () => (form.querySelector('input[name="Franja horaria"]:checked') ? '' : 'Elige una franja horaria.'),
    tutor: () => (edad.value === MENOR && !tutor.checked ? 'Para menores de 14 años, el padre, la madre o el tutor legal debe dar su consentimiento.' : ''),
    privacidad: () => (document.getElementById('privacidad').checked ? '' : 'Debes aceptar la política de privacidad para enviar la solicitud.'),
  };

  // El campo que recibe el foco y el aria-invalid de cada regla
  const campo = (nombre) => (nombre === 'franja' ? document.getElementById('franja-1') : document.getElementById(nombre));
  const marcaInvalido = (nombre) => (nombre === 'franja' ? document.getElementById('grupo-franja') : campo(nombre));

  function mostrarError(nombre, mensaje) {
    const p = document.getElementById('error-' + nombre);
    p.textContent = mensaje;
    const el = marcaInvalido(nombre);
    if (mensaje) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
  }

  function validarCampo(nombre) {
    const el = campo(nombre);
    const mensaje = reglas[nombre](el && 'value' in el ? el.value : '');
    mostrarError(nombre, mensaje);
    return mensaje === '';
  }

  function validarTodo() {
    let primero = null;
    for (const nombre of Object.keys(reglas)) {
      if (!validarCampo(nombre) && !primero) primero = nombre;
    }
    return primero; // null si todo está bien
  }

  // Validación en vivo tras el primer intento de envío
  Object.keys(reglas).forEach((nombre) => {
    const elementos = nombre === 'franja'
      ? form.querySelectorAll('input[name="Franja horaria"]')
      : [campo(nombre)];
    elementos.forEach((el) => {
      el.addEventListener(el.type === 'checkbox' || el.type === 'radio' || el.tagName === 'SELECT' ? 'change' : 'blur', () => {
        if (yaIntentado) validarCampo(nombre);
      });
    });
  });

  // ---------- Casilla del tutor: solo para menores de 14 ----------
  function actualizarTutor() {
    const esMenor = edad.value === MENOR;
    bloqueTutor.hidden = !esMenor;
    tutor.required = esMenor;
    if (!esMenor) {
      tutor.checked = false; // si no es menor, no se envía
      mostrarError('tutor', '');
    }
  }
  edad.addEventListener('change', actualizarTutor);
  actualizarTutor();

  // ---------- Si venimos de un curso (?interes=Inglés), lo preseleccionamos ----------
  const interesUrl = new URLSearchParams(location.search).get('interes');
  if (interesUrl) {
    const select = document.getElementById('interes');
    if ([...select.options].some((o) => o.value === interesUrl)) select.value = interesUrl;
  }

  // ---------- Estados del botón y de los mensajes ----------
  function ponerEstado(estado) {
    exito.hidden = estado !== 'exito';
    error.hidden = estado !== 'error';
    boton.disabled = estado === 'enviando';
    boton.textContent = estado === 'enviando' ? 'Enviando...' : textoBoton;
    form.setAttribute('aria-busy', estado === 'enviando' ? 'true' : 'false');
  }

  // ---------- Envío ----------
  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (enviando) return; // evita el doble envío aunque se pulse dos veces
    yaIntentado = true;
    exito.hidden = true;
    error.hidden = true;

    const primerError = validarTodo();
    if (primerError) {
      campo(primerError).focus();
      return;
    }

    // Antispam: si el campo trampa tiene algo, es un robot.
    // Fingimos que todo ha ido bien, pero no enviamos nada.
    if (trampa.value.trim() !== '') {
      ponerEstado('exito');
      return;
    }

    enviando = true;
    ponerEstado('enviando');

    const control = new AbortController();
    const temporizador = setTimeout(() => control.abort(), TIEMPO_MAXIMO);

    try {
      const destino = endpoint();
      if (destino.includes('TU_ID')) throw new Error('Falta configurar Formspree en config.js');
      if (!navigator.onLine) throw new Error('Sin conexión');

      const respuesta = await fetch(destino, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
        signal: control.signal,
      });
      if (!respuesta.ok) throw new Error('Respuesta ' + respuesta.status);

      // Solo si el envío ha ido bien vaciamos el formulario.
      form.reset();
      actualizarTutor();
      yaIntentado = false;
      ponerEstado('exito');
      exito.focus();
    } catch (e) {
      console.warn('Formulario no enviado:', e.message);
      // No tocamos los campos: lo escrito se conserva.
      ponerEstado('error');
      error.focus();
    } finally {
      clearTimeout(temporizador);
      enviando = false;
      boton.disabled = false;
    }
  });
})();
