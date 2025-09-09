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

  const { respuesta } = req.body;

  // ✅ Aquí va el nuevo prompt especializado en empatía
  const prompt = `
Eres un experimentado facilitador de procesos grupales en comunidades de práctica.
Debes evaluar la respuesta de un aprendiz a una situación que debe demostrar EMPATÍA.

Criterios de evaluación (puntaje de 2 a 7, basado en documentos validados en Google Académico):
1. Claridad: ¿La respuesta está bien redactada y es fácil de entender?
2. Aplicación: ¿La respuesta se mantiene enfocada, demuestra manejo y conocimiento en línea con el tema y la pregunta inicial?
3. Profundidad de análisis: ¿La respuesta demuestra comprensión, reflexión o análisis del tema?

Luego realiza lo siguiente:
- Asigna puntaje a cada criterio (2 a 7).
- Escribe una retroalimentación breve y constructiva.
- Sugiere de 3 a 5 mejoras específicas, dependiendo de la evaluación obtenida (a menor puntaje, más mejoras).
- Si hay errores o conceptos imprecisos, corrígelos o acláralos.

Pregunta original:
Mariano dice en una reunión de equipo:
"A veces siento que no soy parte del grupo, como si mis ideas no contaran tanto."

✅ Intenta una respuesta que demuestre Empatía.

Respuesta del aprendiz:
${respuesta}
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
