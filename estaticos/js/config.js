// ==========================================================
// Configuración de servicios externos de la web.
//
// Aquí solo van identificadores PÚBLICOS: cualquiera puede verlos
// con F12 y no pasa nada. Nunca pongas aquí contraseñas ni claves
// secretas (esas necesitan un servidor).
// ==========================================================
const CONFIG = {
  // Dirección (endpoint) de tu formulario de Formspree.
  // La encuentras en formspree.io > tu formulario > "Integration".
  // Cambia TU_ID por el código de tu formulario, por ejemplo: https://formspree.io/f/abcdwxyz
  formspree: 'https://formspree.io/f/xgakzbll',
};

// Esta línea permite que build.js (Node) también lea este archivo.
if (typeof module !== 'undefined') module.exports = CONFIG;
