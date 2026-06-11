# MindSpace 🌱

> Democratizando el acceso a la salud mental para jóvenes universitarios en el Perú y Latinoamérica.

MindSpace es una plataforma web orientada a conectar estudiantes universitarios con psicólogos certificados. Permite a los jóvenes agendar citas, llevar un registro diario de sus emociones y acceder a recursos de bienestar, mientras ofrece a los profesionales un panel completo para gestionar su agenda, pacientes y notas clínicas.

## 🚀 Características Principales

### Para Estudiantes (Jóvenes Universitarios)
* **Búsqueda y Agendamiento:** Encuentra psicólogos filtrados por especialidad, precio y modalidad.
* **Check-in Emocional:** Registra tu estado de ánimo diario de manera rápida e intuitiva.
* **Progreso Emocional:** Visualiza tu evolución a través de gráficos interactivos y mapas de calor (Heatmaps).
* **Gestión de Citas:** Revisa tus próximas sesiones, historial de consultas y cancelaciones.
* **Recursos de Bienestar:** Acceso a artículos y técnicas sobre relajación, higiene del sueño, manejo del estrés y ansiedad.

### Para Psicólogos
* **Gestión de Agenda:** Calendario semanal interactivo para definir disponibilidad y revisar citas programadas.
* **Panel de Pacientes:** Lista detallada de pacientes activos con acceso rápido a su historial emocional reciente.
* **Perfil del Paciente y Notas:** Vista detallada de cada paciente, incluyendo gráficos de su estado de ánimo y un espacio exclusivo para guardar notas clínicas por sesión.
* **Métricas de Impacto:** Dashboard con resumen de citas del día, cantidad de pacientes activos y calificación promedio.

## 🛠️ Tecnologías Utilizadas

El frontend está desarrollado con tecnologías web enfocadas en un rendimiento óptimo, código limpio y fácil mantenimiento:
* **HTML5:** Estructura semántica.
* **CSS3:** Estilos responsivos usando Flexbox y CSS Grid. Implementación de Custom Properties (variables) para mantener una paleta de colores coherente.

## 📁 Estructura del Proyecto

```text
mindspace/
├── css/
│   ├── landing.css               # Estilos para la página principal
│   ├── dashboard_estudiante.css  # Estilos para el panel del estudiante
│   └── dashboard_psicologo.css   # Estilos para el panel del psicólogo
├── index.html        # Landing page (Inicio, registro e información)
├── dashboard_estudiante.html     # Vista y lógicas principales del estudiante
└── dashboard_psicologo.html      # Vista y lógicas principales del profesional
