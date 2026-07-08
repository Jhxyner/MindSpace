// ── CONFIGURACIÓN DE FECHA Y SESIÓN ───────────────────────────
const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const now = new Date();

document.addEventListener("DOMContentLoaded", function() {
    // 1. Mostrar fecha en el topbar
    const topbarDateEl = document.getElementById('topbarDate');
    if(topbarDateEl) topbarDateEl.textContent = `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;

    // 2. Cargar sesión de usuario
    const sessionData = localStorage.getItem('mindspace_user');
    if (sessionData) {
        const user = JSON.parse(sessionData);
        const primerNombre = user.nombre.split(' ')[0]; 
        const inicial = primerNombre.charAt(0).toUpperCase();

        const topbarTitle = document.querySelector('.topbar-left h2');
        if (topbarTitle) topbarTitle.innerHTML = `Buenos días, ${primerNombre} 👋`;

        const sidebarName = document.querySelector('.user-info h4');
        if (sidebarName) sidebarName.textContent = user.nombre;

        document.querySelectorAll('.user-avatar').forEach(avatar => {
            avatar.textContent = inicial;
        });
    }

    // 3. Renderizar componentes
    renderizarGraficoProgreso();
    renderizarMiniChart();
    renderizarCitasDelEstudiante();
    renderizarProximaCitaInicio();
    renderizarPsicologosInicio();
    renderizarPsicologosBusqueda();
    buildHeatmap();

    const modalPerfil = document.getElementById('modalPerfilPsicologo');
    if (modalPerfil) {
        modalPerfil.addEventListener('click', function (e) {
            if (e.target === this) cerrarModalPerfil();
        });
    }
});

// ── NOTIFICACIONES ─────────────────────────────────────────────
function toggleNotifications(e) {
  if (e) e.stopPropagation();
  const panel = document.getElementById('notifPanel');
  if (!panel) return;
  panel.classList.toggle('open');
  const dot = document.getElementById('notifDot');
  if (dot) dot.style.display = 'none';
}

document.addEventListener('click', function(e) {
  const panel = document.getElementById('notifPanel');
  if (panel && panel.classList.contains('open') && !e.target.closest('.notif-wrap')) {
    panel.classList.remove('open');
  }
});

// ── NAVEGACIÓN Y MENÚ ─────────────────────────────────────────
function navigate(page, navEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pEl = document.getElementById('page-' + page);
  if(pEl) pEl.classList.add('active');
  
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (navEl) navEl.classList.add('active');
  
  if (page === 'progress') buildHeatmap();
  if (page === 'companion' && typeof ensureCompanionStarted === 'function') ensureCompanionStarted();
  if (page === 'search') renderizarPsicologosBusqueda();
  if (page === 'dashboard') renderizarPsicologosInicio();
  closeSidebar();
  window.scrollTo(0, 0);
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

function setBottomActive(el) {
  document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

function cerrarSesion() {
  localStorage.removeItem('mindspace_user');
  window.location.href = 'index.html';
}

// ── COMPONENTES: GRÁFICOS DEL ESTUDIANTE ───────────────────────
let progressChartInstance = null;

function renderizarGraficoProgreso() {
    const progressChartCanvas = document.getElementById('progressChart');
    if(!progressChartCanvas) return;

    progressChartCanvas.parentElement.style.position = 'relative';
    progressChartCanvas.parentElement.style.height = '240px'; 
    progressChartCanvas.parentElement.style.width = '100%';

    const pCtx = progressChartCanvas.getContext('2d');
    const userSession = JSON.parse(localStorage.getItem('mindspace_user'));
    const checkins = userSession ? (JSON.parse(localStorage.getItem(`checkins_${userSession.correo}`)) || []) : [];

    const chartLabels = checkins.length > 0 ? checkins.map(c => c.fecha) : ['1', '2', '3', '4', '5'];
    const chartData = checkins.length > 0 ? checkins.map(c => c.valor) : [3, 4, 3, 5, 4];

    if (progressChartInstance) progressChartInstance.destroy();

    progressChartInstance = new Chart(pCtx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Estado emocional',
                data: chartData,
                borderColor: '#028090',
                borderWidth: 2.5,
                backgroundColor: 'rgba(2,128,144,0.10)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#02C39A',
                pointRadius: 2,
                pointHoverRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 }, color: '#94A3B8' } },
                y: { min: 0, max: 5, ticks: { font: { size: 10 }, callback: v => { const l = ['', '😢', '😕', '😐', '🙂', '😊']; return l[v] || '' } } }
            }
        }
    });
}

let miniChartInstance = null;

function renderizarMiniChart() {
    const canvas = document.getElementById('miniChart');
    if(!canvas) return;

    canvas.parentElement.style.position = 'relative';

    const ctx = canvas.getContext('2d');
    const userSession = JSON.parse(localStorage.getItem('mindspace_user'));
    const checkins = userSession ? (JSON.parse(localStorage.getItem(`checkins_${userSession.correo}`)) || []) : [];
    const recientes = checkins.slice(-7);

    const chartLabels = recientes.length > 0 ? recientes.map(c => c.fecha) : ['1', '2', '3', '4', '5'];
    const chartData = recientes.length > 0 ? recientes.map(c => c.valor) : [3, 4, 3, 5, 4];

    if (miniChartInstance) miniChartInstance.destroy();

    miniChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [{
                data: chartData,
                borderColor: '#028090',
                borderWidth: 2.5,
                backgroundColor: 'rgba(2,128,144,0.10)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#02C39A',
                pointRadius: 2,
                pointHoverRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { display: false, min: 0, max: 5 }
            }
        }
    });
}

function buildHeatmap() {
  const hm = document.getElementById('heatmap');
  if(!hm) return;
  hm.innerHTML = '';
  hm.style.maxWidth = '300px';
  hm.style.margin = '0 auto'; 
  hm.style.gap = '8px';

  const labels = document.querySelector('.hmap-labels');
  if (labels) {
      labels.style.maxWidth = '300px';
      labels.style.margin = '0 auto';
  }

  const userSession = JSON.parse(localStorage.getItem('mindspace_user'));
  const checkins = userSession ? (JSON.parse(localStorage.getItem(`checkins_${userSession.correo}`)) || []) : [];

  let levels = new Array(31).fill(0);
  checkins.slice(-31).forEach((c, index) => {
      let heatLevel = 0;
      if (c.valor === 2 || c.valor === 3) heatLevel = 1;
      if (c.valor === 4) heatLevel = 2;
      if (c.valor === 5) heatLevel = 3;
      levels[index] = heatLevel;
  });

  levels.forEach(l => {
    const d = document.createElement('div');
    d.className = 'hmap-day' + (l > 0 ? ' l' + l : '');
    hm.appendChild(d);
  });
}

// ── COMPONENTES: CITAS DEL ESTUDIANTE ─────────────────────────
function renderizarCitasDelEstudiante() {
    const contenedor = document.querySelector('#page-appointments .appt-list');
    if (!contenedor) return;

    const userSession = JSON.parse(localStorage.getItem('mindspace_user'));
    if (!userSession) return;

    const todasLasCitas = JSON.parse(localStorage.getItem('mindspace_citas')) || [];
    const misCitas = todasLasCitas.filter(c => c.pacienteCorreo === userSession.correo);

    contenedor.innerHTML = '';

    if (misCitas.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--muted);">
                <p>No tienes citas agendadas.</p>
                <button class="btn btn-secondary btn-sm" style="margin-top:12px" onclick="navigate('search',null)">Buscar un psicólogo</button>
            </div>`;
        return;
    }

    let htmlProximas = '<p style="font-size:12px;font-weight:700;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px">Próximas</p>';
    let htmlHistorial = '<p style="font-size:12px;font-weight:700;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin:16px 0 4px">Historial</p>';
    let countProximas = 0;
    let countHistorial = 0;

    [...misCitas].reverse().forEach(cita => {
        let isHistorial = cita.estado === 'Cancelada' || cita.estado === 'Completada' || cita.estado === 'Rechazada';
        
        let badgeClass = 'status-upcoming';
        if (cita.estado === 'Confirmada') badgeClass = 'status-done';
        if (cita.estado === 'Cancelada' || cita.estado === 'Rechazada') badgeClass = 'status-cancelled';

        let btnAccion = '';
        if (!isHistorial) {
            btnAccion = `<button class="btn btn-ghost btn-sm" onclick="cancelarCitaEstudiante('${cita.id}')">Cancelar</button>`;
        } else if (cita.estado === 'Completada') {
            btnAccion = `<button class="btn btn-ghost btn-sm">Ver notas</button>`;
        } else if (cita.estado === 'Cancelada' || cita.estado === 'Rechazada') {
            btnAccion = `<button class="btn btn-secondary btn-sm" onclick="navigate('search',null)">Reagendar</button>`;
        }

        const htmlCard = `
        <div class="appt-row" style="animation: fadeSlide .3s ease; opacity: ${isHistorial ? '0.7' : '1'}">
          <div class="appt-row-av" style="background:${cita.grad || 'var(--navy)'}">${cita.inicial || 'D'}</div>
          <div class="appt-row-info">
            <h4>${cita.psicologo}</h4>
            <p>${cita.fecha} · ${cita.hora} · ${cita.modalidad}</p>
          </div>
          <span class="status-badge ${badgeClass}">${cita.estado}</span>
          <div class="appt-row-actions">${btnAccion}</div>
        </div>`;

        if (isHistorial) {
            htmlHistorial += htmlCard;
            countHistorial++;
        } else {
            htmlProximas += htmlCard;
            countProximas++;
        }
    });

    if (countProximas > 0) contenedor.insertAdjacentHTML('beforeend', htmlProximas);
    if (countHistorial > 0) contenedor.insertAdjacentHTML('beforeend', htmlHistorial);
    
    const badgeSidebar = document.querySelector('.nav-item[onclick*="appointments"] .nav-badge');
    if (badgeSidebar) {
        badgeSidebar.style.display = countProximas > 0 ? 'flex' : 'none';
        badgeSidebar.textContent = countProximas;
    }
}

function cancelarCitaEstudiante(id) {
    let todasLasCitas = JSON.parse(localStorage.getItem('mindspace_citas')) || [];
    const index = todasLasCitas.findIndex(c => c.id === id);
    if(index !== -1) {
        const nombrePsic = todasLasCitas[index].psicologo;
        todasLasCitas[index].estado = 'Cancelada';
        localStorage.setItem('mindspace_citas', JSON.stringify(todasLasCitas));
        renderizarCitasDelEstudiante();
        renderizarProximaCitaInicio();
        showToast('Cita con ' + nombrePsic + ' cancelada');
    }
}

// ── TARJETA "TU PRÓXIMA CITA" (Inicio) ─────────────────────────
function renderizarProximaCitaInicio() {
    const cont = document.getElementById('inicioProximaCita');
    if (!cont) return;

    const userSession = JSON.parse(localStorage.getItem('mindspace_user'));
    if (!userSession) return;

    const todasLasCitas = JSON.parse(localStorage.getItem('mindspace_citas')) || [];
    const misCitas = todasLasCitas.filter(c =>
        c.pacienteCorreo === userSession.correo &&
        c.estado !== 'Cancelada' && c.estado !== 'Completada' && c.estado !== 'Rechazada'
    );

    const metricEl = document.getElementById('metricCitas');
    if (metricEl) metricEl.textContent = misCitas.length;

    if (misCitas.length === 0) {
        cont.innerHTML = `
            <div style="text-align:center;padding:24px 0;color:var(--muted)">
                <p>No tienes citas próximas.</p>
                <button class="btn btn-secondary btn-sm" style="margin-top:10px" onclick="navigate('search',null)">Buscar un psicólogo</button>
            </div>`;
        return;
    }

    const cita = misCitas[misCitas.length - 1];

    cont.innerHTML = `
        <div class="appt-card">
          <div class="appt-avatar" style="background:${cita.grad || 'var(--navy)'}">${cita.inicial || 'D'}</div>
          <div class="appt-info">
            <h4>${cita.psicologo}</h4>
            <p>${cita.especialidad}</p>
            <div class="appt-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>${cita.fecha} · ${cita.hora}</div>
            <div class="appt-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>${cita.modalidad} · ${cita.precio}</div>
            <div class="appt-actions">
              <button class="btn btn-primary btn-sm" onclick="navigate('appointments',null)">Ver detalles</button>
              <button class="btn btn-ghost btn-sm" onclick="cancelarCitaEstudiante('${cita.id}')">Cancelar</button>
            </div>
          </div>
        </div>`;
}

// ── PSICÓLOGOS: DATOS EN VIVO DESDE EL DASHBOARD DEL PSICÓLOGO ────────
function escAttr(str) {
    return String(str == null ? '' : str).replace(/'/g, "\\'");
}

function modalidadAFiltro(modalidad) {
    if (!modalidad) return 'ambas';
    var m = modalidad.toLowerCase();
    if (m.indexOf('virtual') !== -1 && m.indexOf('presencial') !== -1) return 'ambas';
    if (m.indexOf('virtual') !== -1) return 'virtual';
    if (m.indexOf('presencial') !== -1) return 'presencial';
    return 'ambas';
}

function obtenerPsicologosConPerfil() {
    const users = JSON.parse(localStorage.getItem('mindspace_db_users')) || [];
    const psicologos = users.filter(u => u.rol === 'psicologo');

    return psicologos.map(p => {
        const perfil = JSON.parse(localStorage.getItem('perfil_psicologo_' + p.correo)) || {};
        const dispo = JSON.parse(localStorage.getItem('disponibilidad_' + p.correo));
        const totalSlots = dispo ? Object.values(dispo).reduce((sum, arr) => sum + (arr ? arr.length : 0), 0) : 6;

        return {
            correo: p.correo,
            nombre: p.nombre,
            inicial: perfil.inicial || p.nombre.replace(/^(Dra?\.)\s*/i, '').charAt(0).toUpperCase(),
            grad: perfil.grad || 'linear-gradient(135deg,var(--teal),var(--mint))',
            distrito: perfil.distrito || 'Lima',
            especialidades: perfil.especialidades || 'Bienestar general',
            experiencia: perfil.experiencia || '5',
            modalidad: perfil.modalidad || 'Virtual y presencial',
            precio: perfil.precio || '80',
            bio: perfil.bio || 'Aún no ha completado su biografía profesional.',
            calificacion: perfil.calificacion || '4.8',
            resenas: perfil.resenas || '10',
            disponibilidadEtiqueta: totalSlots > 0 ? 'esta semana' : 'próxima semana'
        };
    });
}

function crearPsyCardHTML(p, detallado) {
    const especialidadesPill = p.especialidades.split(',').map(s => s.trim()).join(' · ');
    const agendarArgs = `'${escAttr(p.nombre)}','${escAttr(p.correo)}','${escAttr(p.inicial)}','${escAttr(especialidadesPill)}','S/ ${escAttr(p.precio)}','${escAttr(p.grad)}','${escAttr(p.modalidad)}'`;

    const header = `
      <div class="psy-header">
        <div class="psy-av" style="background:${p.grad}">${p.inicial}</div>
        <div class="psy-meta">
          <h3>${p.nombre}</h3>
          <p>${p.distrito.split(',')[0]} · ${p.modalidad}</p>
          <div class="psy-stars">★★★★★</div>
          <span class="psy-reviews">${p.calificacion} · ${p.resenas} reseñas</span>
        </div>
      </div>
      <span class="pill">${especialidadesPill}</span>`;

    const acciones = `
      <div class="psy-actions">
        <button class="btn btn-secondary btn-sm" onclick="verPerfilPsicologo('${escAttr(p.correo)}')">Ver perfil</button>
        <button class="btn btn-primary btn-sm" onclick="agendarCita(${agendarArgs})">${detallado ? 'Agendar cita' : 'Agendar'}</button>
      </div>`;

    if (!detallado) {
        return `<div class="psy-card">${header}<div class="psy-price">S/ ${p.precio} <span>/ sesión</span></div>${acciones}</div>`;
    }

    return `
    <div class="psy-card" data-especialidad="${especialidadesPill.toLowerCase()}" data-precio="${p.precio}" data-modalidad="${modalidadAFiltro(p.modalidad)}" data-disponibilidad="${p.disponibilidadEtiqueta}" data-nombre="${p.nombre.toLowerCase()}">
      ${header}
      <div class="psy-details">
        <div class="psy-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>${p.experiencia} años de experiencia</div>
        <div class="psy-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>${p.modalidad}</div>
        <div class="psy-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Disponible ${p.disponibilidadEtiqueta}</div>
      </div>
      <div class="psy-price">S/ ${p.precio} <span>/ sesión</span></div>
      ${acciones}
    </div>`;
}

function renderizarPsicologosInicio() {
    const cont = document.getElementById('psyGridInicio');
    if (!cont) return;
    const psicologos = obtenerPsicologosConPerfil()
        .sort((a, b) => parseFloat(b.calificacion) - parseFloat(a.calificacion))
        .slice(0, 2);
    cont.innerHTML = psicologos.map(p => crearPsyCardHTML(p, false)).join('');
}

function renderizarPsicologosBusqueda() {
    const cont = document.getElementById('psyGridSearch');
    if (!cont) return;
    const psicologos = obtenerPsicologosConPerfil();
    cont.innerHTML = psicologos.map(p => crearPsyCardHTML(p, true)).join('');
    if (typeof filtrarPsicologos === 'function') filtrarPsicologos();
}

function verPerfilPsicologo(correo) {
    const p = obtenerPsicologosConPerfil().find(x => x.correo === correo);
    if (!p) return;

    document.getElementById('vpAvatar').textContent = p.inicial;
    document.getElementById('vpAvatar').style.background = p.grad;
    document.getElementById('vpNombre').textContent = p.nombre;
    document.getElementById('vpDistrito').textContent = p.distrito;
    document.getElementById('vpRating').textContent = '★ ' + p.calificacion + ' · ' + p.resenas + ' reseñas';
    document.getElementById('vpBio').textContent = p.bio;
    document.getElementById('vpExperiencia').textContent = p.experiencia + ' años de experiencia';
    document.getElementById('vpModalidad').textContent = p.modalidad;
    document.getElementById('vpEspecialidades').textContent = p.especialidades;
    document.getElementById('vpDisponibilidad').textContent = p.disponibilidadEtiqueta;
    document.getElementById('vpPrecio').textContent = 'S/ ' + p.precio;

    const especialidadesPill = p.especialidades.split(',').map(s => s.trim()).join(' · ');
    document.getElementById('vpAgendarBtn').onclick = function () {
        cerrarModalPerfil();
        agendarCita(p.nombre, p.correo, p.inicial, especialidadesPill, 'S/ ' + p.precio, p.grad, p.modalidad);
    };

    document.getElementById('modalPerfilPsicologo').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function cerrarModalPerfil() {
    document.getElementById('modalPerfilPsicologo').style.display = 'none';
    document.body.style.overflow = '';
}

// ── INTERACCIÓN: BOTONES DE ESTADO DE ÁNIMO ───────────────────────────

// Para los botones pequeños de la pestaña "Inicio"
window.selectMood = function(btn) {
    document.querySelectorAll('#dashMoods .mood-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
};

// Para los botones grandes de la pestaña "¿Cómo estás hoy?"
window.selectFullMood = function(btn) {
    document.querySelectorAll('#fullMoods .mood-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
};
