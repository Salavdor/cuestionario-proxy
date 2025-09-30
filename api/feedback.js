// api/feedback.js
import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = "gemini-1.5-flash"; // 👈 usa un modelo válido
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { planteamiento, consigna, respuesta, concepto } = req.body;

    if (!planteamiento || !consigna || !respuesta || !concepto) {
      return res.status(400).json({ error: "Faltan campos requeridos en el body" });
    }

    // 🔹 Aquí armamos el prompt
    const prompt = `
Eres un experimentado facilitador de procesos grupales, en comunidades de práctica, 
y debes evaluar la respuesta de un aprendiz a una situación que debe demostrar ${concepto}.

Utilizando los siguientes criterios (2= incorrecto; 3= insuficiente; 4= regular; 5= bien; 6= Muy bien; 7= excelente):
1. Claridad
2. Aplicación
3. Profundidad de análisis

Luego realiza:
- Retroalimentación breve y constructiva
- 3 a 5 mejoras específicas
- Corrección de errores si los hay

Planteamiento de la situación:
${planteamiento}

Pregunta original o consigna:
${consigna}

Respuesta del aprendiz:
${respuesta}

⚠️ Formatea SIEMPRE la salida en HTML EXACTAMENTE así:
<h3><strong style="color: #2670e0;">${concepto}</strong></h3>
<br><br>
<h5><strong>Planteamiento:</strong></h5>
<p>${planteamiento}</p>
<br>
<h5><strong>Consigna:</strong></h5>
<p>${consigna}</p>
<br>
<h5><strong>Respuesta del aprendiz:</strong></h5>
<p>${respuesta}</p>
<br>
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
`;

    // 🔹 Llamada a la API
    const result = await client.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // 🔹 El texto generado está en result.response.candidates[0].content.parts[0].text
    const feedback =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return res.status(200).json({ feedback });
  } catch (error) {
    console.error("❌ Error en el servidor Gemini:", error);
    return res.status(500).json({ error: "Error procesando la solicitud" });
  }
}
