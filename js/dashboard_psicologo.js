// ── NOTIFICACIONES (TOAST) ────────────────────────────────────
function showToast(message, duration = 2500) {
  const existing = document.getElementById('mindspace-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'mindspace-toast';
  toast.className = 'toast-success';
  toast.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
         stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
    ${message}
  `;
  document.body.appendChild(toast);
  setTimeout(() => { toast.classList.add('hide'); setTimeout(() => toast.remove(), 400); }, duration);
}

// ── CONFIGURACIÓN DE FECHA Y SESIÓN ───────────────────────────
const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const now = new Date();

document.addEventListener("DOMContentLoaded", function() {
    const topbarDateEl = document.getElementById('topbarDate');
    if(topbarDateEl) topbarDateEl.textContent = `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;

    // Cargar sesión
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

    renderizarAgendaPsicologo();
    renderizarPacientesActivos();
    renderizarDisponibilidad();
    renderizarResumenPsicologo();
    renderizarWeekCal();
    cargarPerfilPsicologo();
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
  if (pEl) pEl.classList.add('active');
  
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (navEl) navEl.classList.add('active');
  
  if (page === 'patients') renderizarPacientesActivos();
  if (page === 'availability') renderizarDisponibilidad();
  if (page === 'dashboard') renderizarResumenPsicologo();
  if (page === 'agenda') renderizarWeekCal();

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

// ── COMPONENTES: AGENDA DEL PSICÓLOGO ────────────────────────
function generarBotonesAgenda(cita) {
    if (cita.estado === 'Pendiente') {
        return `
            <button class="btn btn-ghost btn-sm" onclick="rechazarCitaPsicologo('${cita.id}')" style="color:var(--error)">Rechazar</button>
            <button class="btn btn-primary btn-sm" onclick="aceptarCitaPsicologo('${cita.id}')">Confirmar</button>
        `;
    }
    if (cita.estado === 'Confirmada') {
        return `
            <button class="btn btn-ghost btn-sm" onclick="verPacienteDinamico('${cita.pacienteCorreo}', '${cita.pacienteNombre}')">Ver paciente</button>
            <button class="btn btn-primary btn-sm" onclick="verPacienteDinamico('${cita.pacienteCorreo}', '${cita.pacienteNombre}')">Notas</button>
        `;
    }
    return '';
}

function renderizarAgendaPsicologo() {
    const contenedor = document.getElementById('agendaHoyList');
    if (!contenedor) return;

    const userSession = JSON.parse(localStorage.getItem('mindspace_user'));
    if (!userSession) return;

    const todasLasCitas = JSON.parse(localStorage.getItem('mindspace_citas')) || [];
    const misCitas = todasLasCitas.filter(c => c.psicologo === userSession.nombre).reverse();

    contenedor.innerHTML = '';

    if (misCitas.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--muted);">
                <p>Tu agenda está libre por ahora.</p>
                <p style="font-size:13px; margin-top:8px;">Las citas que agenden los estudiantes aparecerán aquí.</p>
            </div>`;
        return;
    }

    misCitas.forEach(cita => {
        let badgeClass = 'status-pending';
        let dotClass = 'dot-yellow';

        if (cita.estado === 'Confirmada') { badgeClass = 'status-confirmed'; dotClass = 'dot-green'; }
        if (cita.estado === 'Cancelada' || cita.estado === 'Rechazada') { badgeClass = 'status-cancelled'; dotClass = 'dot-gray'; }

        const botonesAccion = generarBotonesAgenda(cita);

        const inicialPaciente = cita.pacienteNombre ? cita.pacienteNombre.charAt(0).toUpperCase() : 'P';

        const html = `
        <div class="agenda-row" style="animation: fadeSlide .3s ease; opacity: ${cita.estado === 'Cancelada' || cita.estado === 'Rechazada' ? '0.55' : '1'}; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 16px; border-bottom: 1px solid var(--border);">
            <div style="display:flex; align-items:center; gap:16px; flex: 1; min-width: 250px;">
                <div style="width: 80px; flex-shrink: 0;">
                    <strong style="color:var(--navy)">${cita.hora}</strong>
                    <p style="font-size:12px; color:var(--muted)">${cita.fecha}</p>
                </div>
                <div class="agenda-dot ${dotClass}" style="width:10px; height:10px; border-radius:50%;"></div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <div class="user-avatar" style="width:36px; height:36px; background:var(--teal-light); color:var(--teal); font-size:14px; display:flex; align-items:center; justify-content:center; border-radius:50%">${inicialPaciente}</div>
                    <div>
                        <h4 style="font-size:15px; margin:0;">${cita.pacienteNombre || 'Paciente'}</h4>
                        <p style="margin:0; font-size:13px; color:var(--muted)">${cita.modalidad} · Primera sesión</p>
                    </div>
                </div>
            </div>
            
            <div style="display:flex; align-items:center; gap:16px;">
                <span class="status-badge ${badgeClass}">${cita.estado}</span>
                <div class="agenda-actions" style="display:flex; gap:8px;">
                    ${botonesAccion}
                </div>
            </div>
        </div>`;
        
        contenedor.insertAdjacentHTML('beforeend', html);
    });
}

function aceptarCitaPsicologo(id) {
    let todasLasCitas = JSON.parse(localStorage.getItem('mindspace_citas')) || [];
    const index = todasLasCitas.findIndex(c => c.id === id);
    if(index !== -1) {
        todasLasCitas[index].estado = 'Confirmada';
        localStorage.setItem('mindspace_citas', JSON.stringify(todasLasCitas));
        renderizarAgendaPsicologo();
        renderizarPacientesActivos();
        renderizarResumenPsicologo();
        showToast('✓ Cita confirmada. Se ha notificado al estudiante.');
    }
}

function rechazarCitaPsicologo(id) {
    let todasLasCitas = JSON.parse(localStorage.getItem('mindspace_citas')) || [];
    const index = todasLasCitas.findIndex(c => c.id === id);
    if(index !== -1) {
        todasLasCitas[index].estado = 'Rechazada';
        localStorage.setItem('mindspace_citas', JSON.stringify(todasLasCitas));
        renderizarAgendaPsicologo();
        renderizarResumenPsicologo();
        showToast('Cita rechazada y notificada al paciente.');
    }
}

// ── RESUMEN (página de Inicio) ─────────────────────────────────
function renderizarResumenPsicologo() {
    const userSession = JSON.parse(localStorage.getItem('mindspace_user'));
    if (!userSession) return;

    const todasLasCitas = JSON.parse(localStorage.getItem('mindspace_citas')) || [];
    const misCitas = todasLasCitas.filter(c => c.psicologo === userSession.nombre);
    const activas = misCitas.filter(c => c.estado !== 'Cancelada' && c.estado !== 'Rechazada');

    const metricCitasHoy = document.getElementById('metricCitasHoy');
    if (metricCitasHoy) metricCitasHoy.textContent = activas.length;

    const pacientesUnicos = [...new Set(misCitas.filter(c => c.estado === 'Confirmada').map(c => c.pacienteCorreo))];
    const metricPacientes = document.getElementById('metricPacientes');
    if (metricPacientes) metricPacientes.textContent = pacientesUnicos.length;

    // Agenda de hoy (resumen)
    const agendaCont = document.getElementById('resumenAgendaHoy');
    if (agendaCont) {
        const proximas = activas.slice(-4).reverse();
        if (proximas.length === 0) {
            agendaCont.innerHTML = '<div style="text-align:center;padding:24px;color:var(--muted)">Aún no tienes citas agendadas.</div>';
        } else {
            agendaCont.innerHTML = proximas.map(cita => {
                let badgeClass = 'status-pending', dotClass = 'dot-yellow';
                if (cita.estado === 'Confirmada') { badgeClass = 'status-confirmed'; dotClass = 'dot-green'; }
                const inicial = cita.pacienteNombre ? cita.pacienteNombre.charAt(0).toUpperCase() : 'P';
                return `
                <div class="agenda-row">
                    <div class="agenda-dot ${dotClass}"></div>
                    <div class="agenda-time">${cita.hora}</div>
                    <div class="agenda-av" style="background:${cita.grad || 'var(--navy)'}">${cita.inicial || inicial}</div>
                    <div class="agenda-info"><h4>${cita.pacienteNombre || 'Paciente'}</h4><p>${cita.especialidad || ''} · ${cita.modalidad} · ${cita.precio || ''}</p></div>
                    <span class="status-badge ${badgeClass}">${cita.estado}</span>
                    <div class="agenda-actions">
                        ${generarBotonesAgenda(cita)}
                    </div>
                </div>`;
            }).join('');
        }
    }

    // Pacientes recientes (resumen)
    const pacCont = document.getElementById('resumenPacientesRecientes');
    if (pacCont) {
        const vistos = [];
        const recientes = [...misCitas].reverse().filter(c => {
            if (c.estado === 'Confirmada' && !vistos.includes(c.pacienteCorreo)) {
                vistos.push(c.pacienteCorreo);
                return true;
            }
            return false;
        }).slice(0, 4);

        if (recientes.length === 0) {
            pacCont.innerHTML = '<p style="text-align:center;color:var(--muted);font-size:13px">Aún no tienes pacientes confirmados.</p>';
        } else {
            pacCont.innerHTML = recientes.map(cita => {
                const checkins = JSON.parse(localStorage.getItem(`checkins_${cita.pacienteCorreo}`)) || [];
                const ultimoMood = checkins.length > 0 ? checkins[checkins.length - 1].emoji : '😐';
                const inicial = cita.pacienteNombre ? cita.pacienteNombre.charAt(0).toUpperCase() : 'P';
                return `
                <div class="patient-row" onclick="verPacienteDinamico('${cita.pacienteCorreo}', '${cita.pacienteNombre}')">
                    <div class="pat-av" style="background:${cita.grad || 'var(--navy)'}">${cita.inicial || inicial}</div>
                    <div class="pat-info"><h4>${cita.pacienteNombre}</h4><p>${cita.fecha} · ${cita.hora}</p></div>
                    <span class="pat-mood">${ultimoMood}</span>
                </div>`;
            }).join('');
        }
    }
}

// ── DISPONIBILIDAD ──────────────────────────────────────────────
const TIME_SLOTS = ['09:00 AM','10:30 AM','12:00 PM','02:00 PM','03:30 PM','05:00 PM'];
const DIAS_SEMANA = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
let _dispoActual = {};

function obtenerDisponibilidadGuardada(correo) {
    const data = JSON.parse(localStorage.getItem('disponibilidad_' + correo));
    if (data) return data;
    const def = {};
    DIAS_SEMANA.forEach(d => { def[d] = (d === 'Sáb' || d === 'Dom') ? [] : TIME_SLOTS.slice(); });
    return def;
}

function renderizarDisponibilidad() {
    const grid = document.getElementById('availGrid');
    if (!grid) return;
    const userSession = JSON.parse(localStorage.getItem('mindspace_user'));
    if (!userSession) return;

    _dispoActual = obtenerDisponibilidadGuardada(userSession.correo);

    // Citas activas (no canceladas/rechazadas) agrupadas por día de la semana + hora,
    // para marcar como "ocupado" cualquier bloque con una cita real encima.
    const todasLasCitas = JSON.parse(localStorage.getItem('mindspace_citas')) || [];
    const misCitas = todasLasCitas.filter(c => c.psicologo === userSession.nombre && c.estado !== 'Cancelada' && c.estado !== 'Rechazada');
    const citasPorDiaHora = {};
    misCitas.forEach(c => {
        const dia = (c.fecha || '').split(' ')[0]; // "Lun 13 jul" -> "Lun"
        citasPorDiaHora[dia + '|' + c.hora] = c;
    });

    grid.querySelectorAll('.avail-row-cell').forEach(el => el.remove());

    TIME_SLOTS.forEach(hora => {
        const timeLabel = document.createElement('div');
        timeLabel.className = 'avail-time avail-row-cell';
        timeLabel.textContent = hora;
        grid.appendChild(timeLabel);

        DIAS_SEMANA.forEach(dia => {
            const cell = document.createElement('div');
            const citaEnCelda = citasPorDiaHora[dia + '|' + hora];

            if (citaEnCelda) {
                cell.className = 'avail-slot avail-row-cell booked';
                cell.textContent = (citaEnCelda.pacienteNombre || 'Ocupado').split(' ')[0];
                cell.title = `${citaEnCelda.pacienteNombre} · ${citaEnCelda.fecha} · ${citaEnCelda.estado}`;
            } else {
                const disponible = (_dispoActual[dia] || []).includes(hora);
                cell.className = 'avail-slot avail-row-cell ' + (disponible ? 'available' : 'empty');
                cell.textContent = disponible ? 'Disp.' : '';
                cell.onclick = function () { toggleDisponibilidadSlot(dia, hora, cell); };
            }
            grid.appendChild(cell);
        });
    });
}

function toggleDisponibilidadSlot(dia, hora, cell) {
    if (!_dispoActual[dia]) _dispoActual[dia] = [];
    const idx = _dispoActual[dia].indexOf(hora);
    if (idx === -1) {
        _dispoActual[dia].push(hora);
        cell.classList.remove('empty');
        cell.classList.add('available');
        cell.textContent = 'Disp.';
    } else {
        _dispoActual[dia].splice(idx, 1);
        cell.classList.remove('available');
        cell.classList.add('empty');
        cell.textContent = '';
    }
}

function guardarDisponibilidad() {
    const userSession = JSON.parse(localStorage.getItem('mindspace_user'));
    if (!userSession) return;
    localStorage.setItem('disponibilidad_' + userSession.correo, JSON.stringify(_dispoActual));
    showToast('✓ Disponibilidad guardada. Los estudiantes ya pueden agendar en estos horarios.');
}

// ── MINI CALENDARIO SEMANAL (página "Mi agenda") ────────────────
let _weekOffset = 0;

function renderizarWeekCal() {
    const cont = document.getElementById('weekCal');
    if (!cont) return;
    const userSession = JSON.parse(localStorage.getItem('mindspace_user'));
    if (!userSession) return;

    const todasLasCitas = JSON.parse(localStorage.getItem('mindspace_citas')) || [];
    const misCitas = todasLasCitas.filter(c => c.psicologo === userSession.nombre && c.estado !== 'Cancelada' && c.estado !== 'Rechazada');
    const dispo = obtenerDisponibilidadGuardada(userSession.correo);

    const diasAbrevPorIndice = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

    const hoy = new Date();
    const offsetLunes = hoy.getDay() === 0 ? -6 : 1 - hoy.getDay();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() + offsetLunes + (_weekOffset * 7));

    let html = '';
    for (let i = 0; i < 7; i++) {
        const d = new Date(lunes);
        d.setDate(lunes.getDate() + i);
        const diaAbrev = diasAbrevPorIndice[d.getDay()];
        const label = diaAbrev + ' ' + d.getDate() + ' ' + meses[d.getMonth()];
        const esHoy = d.toDateString() === hoy.toDateString();

        const citasDia = misCitas.filter(c => c.fecha === label);
        const horasLibres = (dispo[diaAbrev] || []).filter(h => !citasDia.some(c => c.hora === h));

        const items = [];
        citasDia.forEach(c => items.push(`<div class="week-slot slot-booked" title="${c.pacienteNombre} · ${c.hora}">${(c.pacienteNombre || '').split(' ')[0]} ${c.hora}</div>`));
        horasLibres.forEach(h => items.push(`<div class="week-slot slot-available">Disp. ${h}</div>`));
        while (items.length < 3) items.push('<div class="week-slot slot-empty"></div>');

        html += `<div class="week-day"><div class="week-day-name">${diaAbrev}</div><div class="week-day-num${esHoy ? ' today' : ''}">${d.getDate()}</div>${items.slice(0, 3).join('')}</div>`;
    }
    cont.innerHTML = html;

    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    const rangoEl = document.getElementById('weekRangeLabel');
    if (rangoEl) {
        rangoEl.textContent = _weekOffset === 0
            ? 'Esta semana'
            : `${lunes.getDate()} ${meses[lunes.getMonth()]} – ${domingo.getDate()} ${meses[domingo.getMonth()]}`;
    }
}

function cambiarSemana(delta) {
    _weekOffset += delta;
    renderizarWeekCal();
}

function irASemanaActual() {
    _weekOffset = 0;
    renderizarWeekCal();
}

// ── PERFIL PROFESIONAL ───────────────────────────────────────────
function cargarPerfilPsicologo() {
    const userSession = JSON.parse(localStorage.getItem('mindspace_user'));
    if (!userSession) return;
    const perfil = JSON.parse(localStorage.getItem('perfil_psicologo_' + userSession.correo));
    if (!perfil) return;

    const setVal = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.value = val; };
    setVal('perfilNombre', perfil.nombre);
    setVal('perfilApellidos', perfil.apellidos);
    setVal('perfilColegiatura', perfil.colegiatura);
    setVal('perfilDistrito', perfil.distrito);
    setVal('perfilEspecialidades', perfil.especialidades);
    setVal('perfilExperiencia', perfil.experiencia);
    setVal('perfilModalidad', perfil.modalidad);
    setVal('perfilPrecio', perfil.precio);
    setVal('perfilBio', perfil.bio);
}

function guardarPerfilPsicologo() {
    const userSession = JSON.parse(localStorage.getItem('mindspace_user'));
    if (!userSession) return;

    // Partimos del perfil ya guardado para no perder campos que no están en este formulario
    // (inicial, gradiente de color, calificación, nº de reseñas).
    const perfilPrevio = JSON.parse(localStorage.getItem('perfil_psicologo_' + userSession.correo)) || {};

    const getVal = id => { const el = document.getElementById(id); return el ? el.value : ''; };
    const perfil = Object.assign({}, perfilPrevio, {
        nombre: getVal('perfilNombre'),
        apellidos: getVal('perfilApellidos'),
        colegiatura: getVal('perfilColegiatura'),
        distrito: getVal('perfilDistrito'),
        especialidades: getVal('perfilEspecialidades'),
        experiencia: getVal('perfilExperiencia'),
        modalidad: getVal('perfilModalidad'),
        precio: getVal('perfilPrecio'),
        bio: getVal('perfilBio')
    });
    localStorage.setItem('perfil_psicologo_' + userSession.correo, JSON.stringify(perfil));
    showToast('✓ Perfil guardado correctamente. Los cambios ya se ven en "Encontrar psicólogo".');
}

// ── COMPONENTES: PANEL DEL PACIENTE (CRUZAMIENTO DE DATOS) ────
let currentPatient = { correo: '', nombre: '' };
let patChartInstance = null; 

function renderizarPacientesActivos() {
    const contenedor = document.getElementById('patientsList');
    if (!contenedor) return;

    const todasLasCitas = JSON.parse(localStorage.getItem('mindspace_citas')) || [];
    const userSession = JSON.parse(localStorage.getItem('mindspace_user'));
    
    const pacientesVistos = [];
    const pacientesUnicos = todasLasCitas.filter(cita => {
        if (cita.estado === 'Confirmada' && cita.psicologo === userSession.nombre && !pacientesVistos.includes(cita.pacienteCorreo)) {
            pacientesVistos.push(cita.pacienteCorreo);
            return true;
        }
        return false;
    });

    if (pacientesUnicos.length === 0) {
        contenedor.innerHTML = '<p style="text-align:center; color:var(--muted); width:100%; grid-column:1/-1;">No tienes pacientes con sesiones confirmadas.</p>';
        return;
    }

    contenedor.innerHTML = ''; 
    pacientesUnicos.forEach(paciente => {
        const inicial = paciente.pacienteNombre.charAt(0).toUpperCase();
        const htmlCard = `
        <div class="patient-card" style="animation: cardAppear 0.3s ease; background: var(--white); padding: 20px; border-radius: var(--radius); box-shadow: var(--shadow); border: 1px solid var(--border);">
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 16px;">
                <div class="user-avatar" style="width: 48px; height: 48px; background: var(--teal-light); color: var(--teal); display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 50%;">${inicial}</div>
                <div>
                    <h3 style="font-size: 16px; color: var(--navy); margin: 0;">${paciente.pacienteNombre}</h3>
                    <p style="font-size: 13px; color: var(--muted); margin: 2px 0 0 0;">Estudiante Universitario</p>
                </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px; border-top: 1px solid var(--border); padding-top: 12px; margin-bottom: 16px;">
                <div><strong>Correo:</strong> ${paciente.pacienteCorreo}</div>
                <div><strong>Modalidad:</strong> ${paciente.modalidad}</div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="btn btn-primary btn-sm" style="flex: 1; justify-content:center;" onclick="verPacienteDinamico('${paciente.pacienteCorreo}', '${paciente.pacienteNombre}')">Ver Ficha Clínica</button>
            </div>
        </div>`;
        contenedor.insertAdjacentHTML('beforeend', htmlCard);
    });
}

window.verPacienteDinamico = function(correo, nombre) {
    currentPatient.correo = correo;
    currentPatient.nombre = nombre;

    const listCont = document.getElementById('patientsList');
    if(listCont) listCont.style.display = 'none';
    const detailView = document.getElementById('patientDetail');
    if (detailView) detailView.style.display = 'block';

    const headers = document.querySelectorAll('.patient-profile-header h2, .patient-profile-header h3');
    headers.forEach(h => h.textContent = nombre);

    const av = document.querySelector('.pat-profile-av');
    if (av) av.textContent = nombre.charAt(0).toUpperCase();

    // Subtítulo con la especialidad real de la cita más reciente con este paciente
    const userSession = JSON.parse(localStorage.getItem('mindspace_user')) || {};
    const todasLasCitas = JSON.parse(localStorage.getItem('mindspace_citas')) || [];
    const citasPaciente = todasLasCitas.filter(c => c.pacienteCorreo === correo && c.psicologo === userSession.nombre);
    const subtitleEl = document.getElementById('patProfileSubtitle');
    if (subtitleEl) {
        const especialidad = citasPaciente.length > 0 ? citasPaciente[citasPaciente.length - 1].especialidad : 'Paciente de MindSpace';
        subtitleEl.textContent = 'Paciente de MindSpace · ' + especialidad;
    }

    const checkinsPaciente = JSON.parse(localStorage.getItem(`checkins_${correo}`)) || [];
    const statMood = document.getElementById('patStatMood');
    if (statMood) statMood.textContent = checkinsPaciente.length > 0 ? checkinsPaciente[checkinsPaciente.length - 1].emoji : '😐';
    const statCheckins = document.getElementById('patStatCheckins');
    if (statCheckins) statCheckins.textContent = checkinsPaciente.length;

    const moodListEl = document.getElementById('moodHistoryList');
    if (moodListEl) {
        if (checkinsPaciente.length === 0) {
            moodListEl.innerHTML = '<p style="color:var(--muted);font-size:13px;padding:12px 0">Este paciente aún no registró check-ins.</p>';
        } else {
            moodListEl.innerHTML = [...checkinsPaciente].reverse().slice(0, 5).map(c =>
                `<div class="mood-history-row"><span class="mood-date">${c.fecha}${c.hora ? ' · ' + c.hora : ''}</span><span class="mood-emoji">${c.emoji}</span><span class="mood-note">${c.nota ? c.nota : c.etiqueta || ''}</span></div>`
            ).join('');
        }
    }

    const historyContainer = document.getElementById('notesHistory');
    const notas = JSON.parse(localStorage.getItem(`notas_clinicas_${correo}`)) || [];
    const statSesiones = document.getElementById('patStatSesiones');
    if (statSesiones) statSesiones.textContent = notas.length;
    if (historyContainer) {
        historyContainer.innerHTML = '';
        if (notas.length === 0) {
            historyContainer.innerHTML = '<p style="color:var(--muted); font-size:13px; padding:15px 0;">No hay notas registradas.</p>';
        } else {
            [...notas].reverse().forEach(n => {
                historyContainer.innerHTML += `<div class="note-item" style="animation: fadeSlide .3s ease"><div class="note-date">Sesión ${n.sesion} · ${n.fecha}</div><div class="note-text">${n.texto}</div></div>`;
            });
        }
    }
    
    const sesLabel = document.getElementById('noteSessionLabel');
    if (sesLabel) sesLabel.innerHTML = `Sesión ${notas.length + 1} · <span id="noteDateLabel">${new Date().toLocaleDateString()}</span>`;

    const ta = document.getElementById('noteTextarea');
    if (ta) ta.value = '';

    const canvas = document.getElementById('patChart');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const checkins = JSON.parse(localStorage.getItem(`checkins_${correo}`)) || [];
        
        const labels = checkins.length > 0 ? checkins.map(c => c.fecha) : ['-','-','-','-','-'];
        const data = checkins.length > 0 ? checkins.map(c => c.valor) : [3,3,3,3,3];

        if (patChartInstance) patChartInstance.destroy();

        patChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Estado Emocional', data: data, borderColor: '#028090', borderWidth: 2.5,
                    backgroundColor: 'rgba(2,128,144,0.06)', fill: true, tension: 0.3,
                    pointBackgroundColor: '#02C39A', pointRadius: 4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { min: 0, max: 5, ticks: { callback: v => ['', '😢', '😕', '😐', '🙂', '😊'][v] || '' } }
                }
            }
        });
    }

    window.scrollTo(0, 0);
    navigate('patients', null); 
};

window.hidePatient = function() {
    document.getElementById('patientDetail').style.display = 'none';
    document.getElementById('patientsList').style.display = 'grid'; 
};

window.guardarNotaClinicaDinamica = function() {
    if (!currentPatient.correo) return showToast('❌ Selecciona un paciente primero.');
    const textarea = document.getElementById('noteTextarea');
    if (!textarea || !textarea.value.trim()) return showToast('⚠ Escribe el contenido de la nota.');

    let notas = JSON.parse(localStorage.getItem(`notas_clinicas_${currentPatient.correo}`)) || [];
    notas.push({ sesion: notas.length + 1, fecha: new Date().toLocaleDateString(), texto: textarea.value.trim() });
    localStorage.setItem(`notas_clinicas_${currentPatient.correo}`, JSON.stringify(notas));

    textarea.value = '';
    verPacienteDinamico(currentPatient.correo, currentPatient.nombre);
    showToast('✓ Nota clínica guardada.');
};
