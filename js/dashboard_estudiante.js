// Date Formatting
const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const now = new Date();
document.getElementById('topbarDate').textContent = `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;

// Navigation Logic
function navigate(page, navEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (navEl) navEl.classList.add('active');
  if (page === 'progress') buildHeatmap();
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

// Mood Selection Handlers
function selectMood(btn) {
  btn.closest('.mood-row').querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function selectFullMood(btn) {
  document.querySelectorAll('#fullMoods .mood-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

// Period Tabs Interaction
document.querySelectorAll('.period-tab').forEach(tab => {
  tab.addEventListener('click', function () {
    this.closest('.period-tabs,.card').querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
  });
});

// Initialize Charts
document.addEventListener("DOMContentLoaded", function() {
    
    // Mini Chart Initialization
    const miniChartCanvas = document.getElementById('miniChart');
    if (miniChartCanvas) {
        const mCtx = miniChartCanvas.getContext('2d');
        new Chart(mCtx, {
            type: 'line',
            data: {
                labels: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
                datasets: [{
                    data: [3, 2, 3, 4, 3, 4, 4],
                    borderColor: '#028090',
                    borderWidth: 2.5,
                    backgroundColor: 'rgba(2,128,144,0.08)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#028090',
                    pointRadius: 3,
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
    }

    // Progress Chart Initialization
    const progressChartCanvas = document.getElementById('progressChart');
    if(progressChartCanvas) {
         const pCtx = progressChartCanvas.getContext('2d');
         new Chart(pCtx, {
            type: 'line',
            data: {
                labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
                datasets: [{
                    label: 'Estado emocional',
                    data: [3, 3, 4, 2, 3, 4, 4, 3, 2, 3, 4, 5, 4, 3, 4, 4, 3, 4, 4, 4],
                    borderColor: '#028090',
                    borderWidth: 2.5,
                    backgroundColor: 'rgba(2,128,144,0.10)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#02C39A',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => {
                                const l = ['', 'Muy mal', 'Mal', 'Regular', 'Bien', 'Muy bien'];
                                return l[ctx.parsed.y] || ctx.parsed.y
                            }
                        }
                    }
                },
                scales: {
                    x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 }, color: '#94A3B8' } },
                    y: {
                        min: 0,
                        max: 5,
                        grid: { color: 'rgba(0,0,0,0.04)' },
                        ticks: {
                            font: { size: 10 },
                            color: '#94A3B8',
                            callback: v => {
                                const l = ['', '😢', '😕', '😐', '🙂', '😊'];
                                return l[v] || ''
                            }
                        }
                    }
                }
            }
        });
    }
});


// Heatmap Generation
function buildHeatmap() {
  const hm = document.getElementById('heatmap');
  if(!hm) return;
  hm.innerHTML = '';
  const levels = [0, 0, 1, 2, 3, 2, 3, 3, 2, 1, 2, 3, 4, 3, 2, 3, 3, 4, 3, 2, 1, 2, 3, 3, 4, 4, 3, 2, 3, 0, 0];
  levels.forEach(l => {
    const d = document.createElement('div');
    d.className = 'hmap-day' + (l > 0 ? ' l' + l : '');
    hm.appendChild(d);
  });
}