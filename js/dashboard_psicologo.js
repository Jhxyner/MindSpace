
// ── HE-02: showToast — reemplaza window.alert() con notificación in-app ───────
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

// Date Formatting
const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const now = new Date();

document.addEventListener("DOMContentLoaded", function() {
    const topbarDateEl = document.getElementById('topbarDate');
    if (topbarDateEl) {
        topbarDateEl.textContent = `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
    }
});

// Navigation Logic
function navigate(page, navEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  if (navEl) navEl.classList.add('active');
  
  // Si navegamos a disponibilidad, construir el grid si no existe
  if (page === 'availability') {
      buildAvailGrid();
  }
  
  closeSidebar();
  window.scrollTo(0, 0);
}

// Sidebar Controls
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

// Bottom Navigation Styling
function setBottomActive(el) {
  document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

// Patient Detail Views
function showPatient() {
  document.getElementById('patientsList').style.display = 'none';
  document.getElementById('patientDetail').style.display = 'block';
  buildPatChart(); // Renderizar el gráfico cuando se muestra el detalle
}

function hidePatient() {
  document.getElementById('patientsList').style.display = 'block';
  document.getElementById('patientDetail').style.display = 'none';
}

// Patient Chart Initialization
function buildPatChart() {
  const ctx = document.getElementById('patChart');
  // Evitar instanciar múltiples veces el mismo gráfico
  if (!ctx || ctx._chartInstance) return;
  
  const c = new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: {
        labels: ['1', '5', '10', '15', '17', '18', '19', '20'],
        datasets: [{
            data: [3, 2, 3, 4, 3, 2, 3, 4],
            borderColor: '#028090',
            borderWidth: 2,
            backgroundColor: 'rgba(2,128,144,0.08)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#02C39A',
            pointRadius: 4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#94A3B8' } },
            y: { display: false, min: 0, max: 5 }
        }
    }
  });
  ctx._chartInstance = true;
}

// Availability Grid Logic
const bookedSlots = ['0-1', '0-3', '1-0', '1-1', '1-2', '3-0', '4-1'];
const availSlots = ['0-0', '0-2', '0-4', '1-3', '2-0', '2-1', '3-1', '3-2', '4-0'];

function buildAvailGrid() {
  const grid = document.getElementById('availGrid');
  // Evitar construir la cuadrícula si ya está generada
  if (!grid || grid.children.length > 8) return;
  
  const times = ['8:00', '9:00', '10:00', '11:00', '12:00', '2:00', '3:00', '4:00'];
  
  times.forEach((t, ri) => {
    const tEl = document.createElement('div');
    tEl.className = 'avail-time';
    tEl.textContent = t;
    grid.appendChild(tEl);
    
    for (let di = 0; di < 7; di++) {
      const key = `${ri}-${di}`;
      const slot = document.createElement('div');
      
      const isBooked = bookedSlots.includes(key);
      const isAvail = availSlots.includes(key);
      
      slot.className = 'avail-slot ' + (isBooked ? 'booked' : isAvail ? 'available' : 'empty');
      slot.textContent = isBooked ? 'Ocupado' : isAvail ? 'Disp.' : '';
      
      if (!isBooked) {
        slot.addEventListener('click', function () {
          this.classList.toggle('available');
          this.classList.toggle('empty');
          this.textContent = this.classList.contains('available') ? 'Disp.' : '';
        });
      }
      grid.appendChild(slot);
    }
  });
}
