// ── ACOMPAÑANTE VIRTUAL (chat rápido de contención emocional) ──────────
// No diagnostica: contiene, guía ejercicios breves de mindfulness y
// deriva a la sección "Encontrar psicólogo" cuando el tema lo amerita.

const COMPANION_SYSTEM_PROMPT = `Eres el "Acompañante Virtual" de MindSpace, una plataforma peruana de bienestar emocional para estudiantes universitarios. Tu rol es ACOMPAÑAR, nunca diagnosticar ni sustituir a un profesional de salud mental.

Reglas estrictas que debes seguir siempre:
1. No diagnostiques ni nombres trastornos o condiciones clínicas (evita frases como "tienes ansiedad generalizada" o "esto es depresión"). Valida con empatía lo que el usuario siente, en 2-4 frases, en español peruano neutro y cercano.
2. Si el usuario expresa ansiedad, estrés, nervios o angustia, guíalo de inmediato con UN ejercicio breve y concreto de respiración o mindfulness (por ejemplo, respiración 4-4-6 o grounding 5-4-3-2-1), explicado paso a paso en pocas líneas.
3. Cierra tu respuesta (cuando el tema sea emocional) recordándole amablemente: "Para hablar a profundidad sobre esto, te animo a agendar una cita con nuestros especialistas en la sección Encontrar psicólogo".
4. Si detectas señales de riesgo (autolesión, ideación suicida, crisis severa), prioriza su seguridad ante todo: dile que no está solo/a y qué debe contactar de inmediato a la Línea 113 opción 5 (Perú) o acudir a emergencias, además de la recomendación de agendar con un especialista.
5. Respuestas breves (máximo 120 palabras), cálidas, sin tecnicismos clínicos. No inventes precios ni datos de psicólogos específicos.

Mensaje del estudiante: `;

let companionMsgCounter = 0;
let companionStarted = false;

function ensureCompanionStarted() {
  if (companionStarted) return;
  companionStarted = true;
  addCompanionMessage('bot', 'Hola 🌿 Soy tu acompañante en MindSpace. Estoy aquí para escucharte sin juzgar. ¿Cómo te sientes en este momento?');
}

function handleCompanionKeyPress(event) {
  if (event.key === 'Enter') {
    sendCompanionMessage();
  }
}

async function sendCompanionMessage() {
  const inputEl = document.getElementById('companion-input');
  const messageText = inputEl.value.trim();
  if (!messageText) return;

  addCompanionMessage('user', messageText);
  inputEl.value = '';

  const typingId = addCompanionMessage('bot', 'Escribiendo...', true);

  try {
    const response = await fetch(GEMINI_MODEL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: COMPANION_SYSTEM_PROMPT + messageText }] }]
      })
    });

    const data = await response.json();
    document.getElementById(typingId).remove();

    if (data.error) {
      console.error('Error de API:', data.error);
      addCompanionMessage('bot', 'Error de la API: ' + data.error.message);
      return;
    }

    if (data.candidates && data.candidates.length > 0) {
      const respuesta = data.candidates[0].content.parts[0].text;
      addCompanionMessage('bot', respuesta);
    } else {
      addCompanionMessage('bot', 'Lo siento, tuve un problema procesando tu mensaje. ¿Puedes intentarlo de nuevo?');
    }
  } catch (error) {
    document.getElementById(typingId).remove();
    addCompanionMessage('bot', 'Error de conexión. Verifica tu internet.');
    console.error('Error de red:', error);
  }
}

function addCompanionMessage(sender, text, isTyping = false) {
  const container = document.getElementById('companion-messages');
  const msgDiv = document.createElement('div');
  const msgId = 'cmsg-' + Date.now() + '-' + (companionMsgCounter++);
  msgDiv.id = msgId;

  if (sender === 'user') {
    msgDiv.style.cssText = 'align-self: flex-end; background: var(--teal); color: #fff; padding: 10px 14px; border-radius: 12px 12px 2px 12px; max-width: 85%; box-shadow: 0 2px 4px rgba(2,128,144,0.2); white-space: pre-wrap;';
  } else {
    msgDiv.style.cssText = `align-self: flex-start; background: #fff; padding: 10px 14px; border-radius: 12px 12px 12px 2px; border: 1px solid #E2E8F0; color: var(--navy); max-width: 85%; box-shadow: 0 2px 4px rgba(0,0,0,0.02); white-space: pre-wrap; ${isTyping ? 'color: var(--muted); font-style: italic;' : ''}`;
  }

  msgDiv.textContent = text;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;

  return msgId;
}
