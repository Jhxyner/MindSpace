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

// ── FUNCIONES DE REDIRECCIÓN ───────────────────────────
function handleLogin(e) {
  e.preventDefault();
  const role = document.getElementById('loginRole').value;
  if (role === 'estudiante') {
    window.location.href = 'dashboard_estudiante.html';
  } else {
    window.location.href = 'dashboard_psicologo.html';
  }
}

function handleRegister(e) {
  e.preventDefault();
  const role = document.getElementById('registerRole').value;
  if (role === 'estudiante') {
    window.location.href = 'dashboard_estudiante.html';
  } else {
    window.location.href = 'dashboard_psicologo.html';
  }
}

// Inicialización de eventos al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
    
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