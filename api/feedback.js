import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Headers CORS comunes para todas las respuestas
  res.setHeader('Access-Control-Allow-Origin', '*'); // permite cualquier origen
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responder preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { respuesta, concepto, consigna } = req.body;

  // ✅ prompt especializado
  const prompt = `
Eres un experimentado facilitador de procesos grupales, en comunidades de práctica, 
y debes evaluar la respuesta de un aprendiz a una situación que debe demostrar ${concepto}.

Utilizando los siguientes criterios (basados en documentos validados de Google académico):

(2= incorrecto; 3= insuficiente; 4= regular; 5= bien, 6= Muy bien; 7= excelente)

1. Claridad: ¿La respuesta está bien redactada y es fácil de entender? (Puntúa desde 2 a 7).
2. Aplicación: ¿la respuesta se mantiene enfocada, demuestra manejo y conocimiento en línea con el tema y la pregunta inicial? (Puntúa desde 2 a 7).
3. Profundidad de análisis: ¿La respuesta demuestra comprensión, reflexión o análisis del tema? ((Puntúa desde 2 a 7).

Luego realiza lo siguiente:
- Escribe una retroalimentación breve y constructiva para el aprendiz.
- Sugiere 3 a 5 mejoras específicas que podría implementar, dependiendo de la evaluación obtenida (a menor evaluación, mayor número de mejoras).
- Si la respuesta contiene errores o conceptos imprecisos, corrígelos o acláralos brevemente.
- Si hay errores o conceptos imprecisos, corrígelos o acláralos.

Pregunta original o consigna:
${consigna}

✅ Intenta una respuesta que demuestre Empatía.

Respuesta del aprendiz:
${respuesta}

---

⚠️ Formatea SIEMPRE la salida en HTML con la siguiente estructura (no uses listas <ul>, <ol>, ni Markdown, SOLO este formato exacto):

<h3><strong style="color: #2670e0;">${concepto}</strong></h3>
<br>
<br>
<h5><strong>Respuesta del aprendiz:</strong></h5>
<p>${respuesta}</p>
</br>
<h5><strong>Evaluación:</strong></h5>
<p>
  <strong style="color: #2670e0;">Claridad (X):</strong> [Explicación]</br></br>
  <strong style="color: #2670e0;">Aplicación (X):</strong> [Explicación]</br></br> 
  <strong style="color: #2670e0;">Profundidad de análisis (X):</strong> [Explicación]</br></br>
  <strong style="color: #2670e0;">Retroalimentación breve y constructiva:</strong> [Texto]</br></br>
</p>

<h5><strong>Mejoras específicas:</strong></h5>
<p>
  <strong style="color: #2670e0;">1. [Título]:</strong> [Texto]</br></br>
  <strong style="color: #2670e0;">2. [Título]:</strong> [Texto]</br></br>
  <strong style="color: #2670e0;">3. [Título]:</strong> [Texto]</br></br>
  <strong style="color: #2670e0;">4. [Título]:</strong> [Texto opcional]</br></br>
  <strong style="color: #2670e0;">5. [Título]:</strong> [Texto opcional]</br></br>
</p>

<h5><strong>Corrección de errores:</strong></h5>
<p>[Conclusión general sobre la respuesta del aprendiz]</p> 
<p>[Texto con correcciones si aplica, si no escribe "No se encontraron errores"].</p>

⚠️ IMPORTANTE:
- Usa siempre este formato HTML.
- No agregues texto fuera de las etiquetas <h3>, <h4>, <h5>.
- No uses listas (<ul>, <ol>) ni viñetas, solo <h5> con saltos de línea <br>.
- No repitas el prompt ni des explicaciones adicionales.
`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.status(200).json({ feedback: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generando retroalimentación" });
  }
}
