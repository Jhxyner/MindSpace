// Funciones globales (fuera del DOMContentLoaded para que los onclick en el HTML las reconozcan)

// Mobile nav
function toggleMobileNav() {
  document.getElementById('mobileNav').classList.toggle('open');
}

// Modal handling
function openModal(tab, exactRole) {
  document.getElementById('modalOverlay').classList.add('active');
  switchTab(tab || 'register');
  document.body.style.overflow = 'hidden';
  
  // Auto-selecciona el rol si se especifica desde los botones del landing
  if (exactRole) {
    if (tab === 'register') document.getElementById('registerRole').value = exactRole;
    if (tab === 'login') document.getElementById('loginRole').value = exactRole;
  }
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modalOverlay')) {
    closeModal();
  }
}

function switchTab(tab) {
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
  document.getElementById('formLogin').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('formRegister').style.display = tab === 'register' ? 'block' : 'none';
}

// ── FUNCIONES DE REDIRECCIÓN Y SESIÓN ───────────────────────────

function handleRegister(e) {
  e.preventDefault();
  const role = document.getElementById('registerRole').value;
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  // 1. Traemos la "base de datos" de usuarios (o creamos una lista vacía si no existe)
  let usersDb = JSON.parse(localStorage.getItem('mindspace_db_users')) || [];

  // 2. Verificamos si el correo ya existe
  const userExists = usersDb.find(u => u.correo === email);
  if (userExists) {
      alert("Este correo ya está registrado. Intenta iniciar sesión.");
      return;
  }

  // 3. Creamos el nuevo usuario y lo agregamos a la base de datos
  const newUser = { rol: role, nombre: name, correo: email, password: password };
  usersDb.push(newUser);
  localStorage.setItem('mindspace_db_users', JSON.stringify(usersDb));

  // 4. Guardamos la sesión activa (el que acaba de entrar)
  localStorage.setItem('mindspace_user', JSON.stringify(newUser));

  // 5. Redirigimos al panel correspondiente
  window.location.href = role === 'estudiante' ? 'dashboard_estudiante.html' : 'dashboard_psicologo.html';
}

function handleLogin(e) {
  e.preventDefault();
  const role = document.getElementById('loginRole').value;
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  // 1. Traemos la base de datos de usuarios
  let usersDb = JSON.parse(localStorage.getItem('mindspace_db_users')) || [];

  // 2. Buscamos un usuario que coincida exactamente con rol, correo y contraseña
  const userFound = usersDb.find(u => u.rol === role && u.correo === email && u.password === password);

  if (userFound) {
      // 3. Si existe, guardamos su sesión activa y entramos
      localStorage.setItem('mindspace_user', JSON.stringify(userFound));
      window.location.href = role === 'estudiante' ? 'dashboard_estudiante.html' : 'dashboard_psicologo.html';
  } else {
      // Si no existe o se equivocó de clave/rol
      alert("Credenciales incorrectas o usuario no encontrado. Verifica tus datos.");
  }
}

// Inicialización de eventos al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
    // ── MINDSPACE DATABASE SEEDER (Para la presentación final) ──────────────────
const MINDSPACE_SEED_VERSION = 'v3';

function inicializarBaseDeDatosMindSpace() {
  // Verificamos si ya se sembró esta versión de datos para no duplicar ni pisar cambios del usuario
  if (localStorage.getItem('mindspace_db_seeded') === MINDSPACE_SEED_VERSION) return;

  // 1. Cuentas de usuario iniciales (3 psicólogos + 4 estudiantes, todas con cuenta real)
  const usuariosSemilla = [
    { rol: 'estudiante', nombre: 'Sebastián Rueda', correo: 'sebastian@correo.com', password: '123' },
    { rol: 'estudiante', nombre: 'Andrea Mejía', correo: 'andrea@correo.com', password: '123' },
    { rol: 'estudiante', nombre: 'Roberto Huanca', correo: 'roberto@correo.com', password: '123' },
    { rol: 'estudiante', nombre: 'Claudia Ríos', correo: 'claudia@correo.com', password: '123' },
    { rol: 'psicologo', nombre: 'Dra. Valeria Espinoza Ríos', correo: 'valeria@mindspace.com', password: '123' },
    { rol: 'psicologo', nombre: 'Dr. Marcos Delgado Torres', correo: 'marcos@mindspace.com', password: '123' },
    { rol: 'psicologo', nombre: 'Dra. Luciana Paredes Vega', correo: 'luciana@mindspace.com', password: '123' }
  ];
  localStorage.setItem('mindspace_db_users', JSON.stringify(usuariosSemilla));

  // 1b. Perfiles profesionales (lo que ve el estudiante en "Encontrar psicólogo";
  // si el psicólogo edita su perfil, estos datos se actualizan solos)
  localStorage.setItem('perfil_psicologo_valeria@mindspace.com', JSON.stringify({
    nombre: 'Valeria', apellidos: 'Espinoza Ríos', colegiatura: 'CPPe-12345', distrito: 'San Isidro, Lima',
    especialidades: 'Ansiedad, Depresión, Estrés en jóvenes', experiencia: '8', modalidad: 'Virtual y presencial',
    precio: '90', bio: 'Psicóloga clínica con 8 años de experiencia especializada en el tratamiento de ansiedad y depresión en adultos jóvenes. Mi enfoque es cognitivo-conductual con elementos de mindfulness.',
    inicial: 'V', grad: 'linear-gradient(135deg,var(--teal),var(--mint))', calificacion: '4.9', resenas: '87'
  }));
  localStorage.setItem('perfil_psicologo_marcos@mindspace.com', JSON.stringify({
    nombre: 'Marcos', apellidos: 'Delgado Torres', colegiatura: 'CPPe-20981', distrito: 'Miraflores, Lima',
    especialidades: 'Estrés académico, Autoestima', experiencia: '5', modalidad: 'Solo virtual',
    precio: '70', bio: 'Psicólogo especializado en estrés académico y autoestima en estudiantes universitarios. Trabajo con un enfoque breve y orientado a soluciones prácticas.',
    inicial: 'M', grad: 'linear-gradient(135deg,var(--navy),var(--teal))', calificacion: '4.8', resenas: '54'
  }));
  localStorage.setItem('perfil_psicologo_luciana@mindspace.com', JSON.stringify({
    nombre: 'Luciana', apellidos: 'Paredes Vega', colegiatura: 'CPPe-18450', distrito: 'San Borja, Lima',
    especialidades: 'Relaciones, Duelo, Ansiedad', experiencia: '6', modalidad: 'Virtual y presencial',
    precio: '80', bio: 'Psicóloga con enfoque humanista, especializada en relaciones interpersonales, procesos de duelo y ansiedad. Creo en un espacio cálido y sin juicios para acompañar a cada paciente.',
    inicial: 'L', grad: 'linear-gradient(135deg,var(--mint),var(--teal))', calificacion: '4.7', resenas: '32'
  }));

  // 1c. Disponibilidad semanal de cada psicólogo (alimenta el agendamiento del estudiante)
  const disponibilidadCompleta = { Lun: ['09:00 AM','10:30 AM','12:00 PM','02:00 PM','03:30 PM','05:00 PM'], Mar: ['09:00 AM','10:30 AM','12:00 PM','02:00 PM','03:30 PM','05:00 PM'], Mié: ['09:00 AM','10:30 AM','12:00 PM','02:00 PM','03:30 PM','05:00 PM'], Jue: ['09:00 AM','10:30 AM','12:00 PM','02:00 PM','03:30 PM','05:00 PM'], Vie: ['09:00 AM','10:30 AM','12:00 PM','02:00 PM','03:30 PM','05:00 PM'], Sáb: [], Dom: [] };
  localStorage.setItem('disponibilidad_valeria@mindspace.com', JSON.stringify(disponibilidadCompleta));
  localStorage.setItem('disponibilidad_marcos@mindspace.com', JSON.stringify({
    Lun: ['02:00 PM','03:30 PM','05:00 PM'], Mar: ['02:00 PM','03:30 PM','05:00 PM'], Mié: [], Jue: ['02:00 PM','03:30 PM','05:00 PM'], Vie: ['02:00 PM','03:30 PM'], Sáb: [], Dom: []
  }));
  localStorage.setItem('disponibilidad_luciana@mindspace.com', JSON.stringify({
    Lun: ['09:00 AM','10:30 AM'], Mar: [], Mié: ['09:00 AM','10:30 AM','12:00 PM'], Jue: [], Vie: ['09:00 AM','10:30 AM','12:00 PM'], Sáb: ['09:00 AM','10:30 AM'], Dom: []
  }));

  // 2. Historial de Check-ins reales para Sebastián (para dibujar sus gráficas)
  const checkinsSebastian = [
    { fecha: '14/5', hora: '10:00', emoji: '😐', etiqueta: 'Regular', valor: 3, nota: 'Muchos trabajos finales acumulados.' },
    { fecha: '15/5', hora: '09:30', emoji: '😕', etiqueta: 'Mal', valor: 2, nota: 'Estresado y con dolor de cabeza por el parcial.' },
    { fecha: '16/5', hora: '11:15', emoji: '😐', etiqueta: 'Regular', valor: 3, nota: 'Un poco mejor tras descansar.' },
    { fecha: '17/5', hora: '20:00', emoji: '🙂', etiqueta: 'Bien', valor: 4, nota: 'Estudié en grupo y entendí todo.' },
    { fecha: '18/5', hora: '08:00', emoji: '😊', etiqueta: 'Muy bien', valor: 5, nota: '¡Saqué 18 en el examen! Me siento genial.' }
  ];
  localStorage.setItem('checkins_sebastian@correo.com', JSON.stringify(checkinsSebastian));

  // 3. Historial de Check-ins reales para Andrea
  const checkinsAndrea = [
    { fecha: '14/5', hora: '08:00', emoji: '😢', etiqueta: 'Muy mal', valor: 1, nota: 'Crisis de ansiedad antes de una exposición.' },
    { fecha: '15/5', hora: '12:00', emoji: '😕', etiqueta: 'Mal', valor: 2, nota: 'Aún con un poco de temor y desmotivación.' },
    { fecha: '16/5', hora: '15:00', emoji: '😐', etiqueta: 'Regular', valor: 3, nota: 'Hablé con un amigo y me tranquilicé.' },
    { fecha: '17/5', hora: '18:30', emoji: '🙂', etiqueta: 'Bien', valor: 4, nota: 'Salí a caminar y despejar la mente.' }
  ];
  localStorage.setItem('checkins_andrea@correo.com', JSON.stringify(checkinsAndrea));

  // 3b. Historial de Check-ins reales para Roberto
  const checkinsRoberto = [
    { fecha: '14/5', hora: '09:00', emoji: '😕', etiqueta: 'Mal', valor: 2, nota: 'Poca motivación para levantarme.' },
    { fecha: '15/5', hora: '09:00', emoji: '😕', etiqueta: 'Mal', valor: 2, nota: 'Sigo sin ánimo, cuesta concentrarme en clase.' },
    { fecha: '16/5', hora: '10:00', emoji: '😐', etiqueta: 'Regular', valor: 3, nota: 'Un poco mejor después de hablar con un amigo.' },
    { fecha: '17/5', hora: '09:30', emoji: '😐', etiqueta: 'Regular', valor: 3, nota: 'Día tranquilo, sin grandes cambios.' }
  ];
  localStorage.setItem('checkins_roberto@correo.com', JSON.stringify(checkinsRoberto));

  // 3c. Historial de Check-ins reales para Claudia
  const checkinsClaudia = [
    { fecha: '14/5', hora: '19:00', emoji: '🙂', etiqueta: 'Bien', valor: 4, nota: 'Buena semana, salió bien una entrega.' },
    { fecha: '15/5', hora: '18:30', emoji: '😊', etiqueta: 'Muy bien', valor: 5, nota: 'Reconcilié una amistad, me siento aliviada.' },
    { fecha: '16/5', hora: '20:00', emoji: '🙂', etiqueta: 'Bien', valor: 4, nota: 'Día normal, buen ánimo en general.' },
    { fecha: '17/5', hora: '19:15', emoji: '😊', etiqueta: 'Muy bien', valor: 5, nota: 'Muy contenta, salió bien la sesión de terapia.' }
  ];
  localStorage.setItem('checkins_claudia@correo.com', JSON.stringify(checkinsClaudia));

  // 4. Base de datos global de citas (todas con la Dra. Valeria, para el flujo psicólogo ↔ estudiante)
  const citasSemilla = [
    {
      id: 'seed_cita_1',
      pacienteCorreo: 'andrea@correo.com',
      pacienteNombre: 'Andrea Mejía',
      psicologo: 'Dra. Valeria Espinoza Ríos',
      psicologoCorreo: 'valeria@mindspace.com',
      especialidad: 'Ansiedad · Depresión · Estrés',
      fecha: 'Mar 19 may',
      hora: '10:30 AM',
      modalidad: 'Virtual',
      precio: 'S/ 90',
      inicial: 'A',
      grad: 'linear-gradient(135deg,var(--navy),var(--teal))',
      estado: 'Confirmada' // Esta ya sale confirmada para que aparezca en "Mis Pacientes"
    },
    {
      id: 'seed_cita_2',
      pacienteCorreo: 'sebastian@correo.com',
      pacienteNombre: 'Sebastián Rueda',
      psicologo: 'Dra. Valeria Espinoza Ríos',
      psicologoCorreo: 'valeria@mindspace.com',
      especialidad: 'Estrés académico',
      fecha: 'Jue 21 may',
      hora: '09:00 AM',
      modalidad: 'Virtual',
      precio: 'S/ 90',
      inicial: 'S',
      grad: 'linear-gradient(135deg,#028090,#02C39A)',
      estado: 'Pendiente' // Esta sale pendiente para que demuestres cómo el médico la acepta
    },
    {
      id: 'seed_cita_3',
      pacienteCorreo: 'roberto@correo.com',
      pacienteNombre: 'Roberto Huanca',
      psicologo: 'Dra. Valeria Espinoza Ríos',
      psicologoCorreo: 'valeria@mindspace.com',
      especialidad: 'Depresión',
      fecha: 'Mar 20 may',
      hora: '12:00 PM',
      modalidad: 'Presencial',
      precio: 'S/ 90',
      inicial: 'R',
      grad: 'linear-gradient(135deg,#02C39A,#028090)',
      estado: 'Confirmada'
    },
    {
      id: 'seed_cita_4',
      pacienteCorreo: 'claudia@correo.com',
      pacienteNombre: 'Claudia Ríos',
      psicologo: 'Dra. Valeria Espinoza Ríos',
      psicologoCorreo: 'valeria@mindspace.com',
      especialidad: 'Relaciones',
      fecha: 'Mar 20 may',
      hora: '4:00 PM',
      modalidad: 'Virtual',
      precio: 'S/ 90',
      inicial: 'C',
      grad: 'linear-gradient(135deg,#6366F1,#028090)',
      estado: 'Confirmada'
    }
  ];
  localStorage.setItem('mindspace_citas', JSON.stringify(citasSemilla));

  // 5. Notas clínicas previas escritas por la Dra. Valeria
  localStorage.setItem('notas_clinicas_andrea@correo.com', JSON.stringify([
    { sesion: 1, fecha: '12/5/2026', texto: 'La paciente manifiesta episodios agudos de ansiedad antes de evaluaciones. Se inicia entrenamiento en respiración diafragmática y reestructuración cognitiva leve.' }
  ]));
  localStorage.setItem('notas_clinicas_roberto@correo.com', JSON.stringify([
    { sesion: 1, fecha: '10/5/2026', texto: 'Paciente reporta ánimo bajo persistente y desmotivación académica. Se descartan señales de riesgo inmediato. Se propone registro diario de actividades placenteras.' }
  ]));
  localStorage.setItem('notas_clinicas_claudia@correo.com', JSON.stringify([
    { sesion: 1, fecha: '8/5/2026', texto: 'Paciente acude por conflictos en relaciones interpersonales. Buena disposición al trabajo terapéutico. Se trabajan habilidades de comunicación asertiva.' }
  ]));

  // Marcamos que la base de datos ya fue inicializada con esta versión
  localStorage.setItem('mindspace_db_seeded', MINDSPACE_SEED_VERSION);
}

// Ejecutamos la función automáticamente al cargar el script
inicializarBaseDeDatosMindSpace();
  // Navbar scroll
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // Cerrar modal con la tecla Escape
  document.addEventListener('keydown', e => { 
    if (e.key === 'Escape') closeModal(); 
  });

  // Interacción de botones de estado de ánimo (Hero section)
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Animaciones al hacer scroll (Intersection Observer)
  const observerOptions = { threshold: 0.15 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { 
      if (e.isIntersecting) {
        e.target.classList.add('visible'); 
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

});

// ── CHATBOT IA (OPENAI INTEGRATION) ─────────────────────────────────

// ⚠️ REEMPLAZA ESTO CON TU API KEY REAL PARA LA PRESENTACIÓN ⚠️
const OPENAI_API_KEY = 'AQ.Ab8RN6K3g46cPl2slYYQ2qjzGGpIVxnxP-bOQFE-izUopQCrog'; 

function toggleChat() {
  const windowEl = document.getElementById('chat-window');
  const btnEl = document.getElementById('chat-toggle-btn');
  if (windowEl.style.display === 'none' || windowEl.style.display === '') {
    windowEl.style.display = 'flex';
    btnEl.style.transform = 'scale(0.8)';
  } else {
    windowEl.style.display = 'none';
    btnEl.style.transform = 'scale(1)';
  }
}

function handleChatKeyPress(event) {
  if (event.key === 'Enter') {
    sendChatMessage();
  }
}

async function sendChatMessage() {
  const inputEl = document.getElementById('chat-input');
  const messageText = inputEl.value.trim();
  if (!messageText) return;

  // 1. Mostrar el mensaje del usuario
  addMessageToChat('user', messageText);
  inputEl.value = '';

  // 2. Mostrar "Escribiendo..."
  const typingId = addMessageToChat('bot', 'Escribiendo...', true);

  // 3. Preparar el Prompt exacto
  const contextoMindSpace = `Eres el Asistente Virtual de MindSpace, una plataforma web peruana de salud mental para jóvenes universitarios. Responde de forma amable, concisa y en español peruano neutro. Nunca inventes precios específicos, di que varían según el profesional. Anima al usuario a registrarse. \n\nPregunta del usuario: ${messageText}`;

  // 4. Estructura HTTP basada en la documentación oficial de ai.google.dev
  try {
    const response = await fetch(GEMINI_MODEL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // La guía oficial recomienda enviar la clave en este header:
        'x-goog-api-key': GEMINI_API_KEY 
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: contextoMindSpace }]
        }]
      })
    });

    const data = await response.json();
    document.getElementById(typingId).remove();
    
    // Captura de errores devueltos por la API de Google
    if (data.error) {
        console.error('Error de API:', data.error);
        addMessageToChat('bot', 'Error de la API: ' + data.error.message);
        return;
    }

    // Extracción de la respuesta
    if (data.candidates && data.candidates.length > 0) {
      const respuestaIA = data.candidates[0].content.parts[0].text;
      addMessageToChat('bot', respuestaIA);
    } else {
      addMessageToChat('bot', 'Lo siento, tuve un problema procesando tu solicitud.');
    }
    
  } catch (error) {
    document.getElementById(typingId).remove();
    addMessageToChat('bot', 'Error de conexión. Verifica tu internet.');
    console.error('Error de red:', error);
  }
}

let chatMsgCounter = 0;

function addMessageToChat(sender, text, isTyping = false) {
  const chatMessages = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  const msgId = 'msg-' + Date.now() + '-' + (chatMsgCounter++);
  msgDiv.id = msgId;
  
  if (sender === 'user') {
    msgDiv.style.cssText = 'align-self: flex-end; background: var(--teal); color: #fff; padding: 10px 14px; border-radius: 12px 12px 2px 12px; max-width: 85%; box-shadow: 0 2px 4px rgba(2,128,144,0.2);';
  } else {
    msgDiv.style.cssText = `align-self: flex-start; background: #fff; padding: 10px 14px; border-radius: 12px 12px 12px 2px; border: 1px solid #E2E8F0; color: var(--navy); max-width: 85%; box-shadow: 0 2px 4px rgba(0,0,0,0.02); ${isTyping ? 'color: var(--muted); font-style: italic;' : ''}`;
  }
  
  msgDiv.textContent = text;
  chatMessages.appendChild(msgDiv);
  
  // Auto-scroll al fondo
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  return msgId;
}
