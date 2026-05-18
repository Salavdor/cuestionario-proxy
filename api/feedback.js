// api/feedback.js
import { GoogleGenAI } from "@google/genai";

// 1. 🔹 FORZAR EL RUNTIME EDGE (Esto elimina el timeout de 10s y el error 500 de Vercel)
export const config = {
  runtime: "edge",
};

const MODEL_NAME = "gemini-2.5-flash";

// 2. 🔹 IMPORTANTE: Pasamos la API key explícitamente desde process.env
// En entornos Edge de Vercel, a veces el SDK no lee automáticamente el contexto global.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req) {
  // CORS Headers para Edge Runtime
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // En Edge Runtime, las peticiones usan el estándar Web API (req.method, no req.method directo de Express)
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), { status: 405, headers });
  }

  try {
    // En Edge Runtime, el body se lee de forma asíncrona usando req.json()
    const { planteamiento, consigna, respuesta, concepto } = await req.json();

    if (!planteamiento || !consigna || !respuesta || !concepto) {
      return new Response(JSON.stringify({ error: "Faltan campos requeridos en el body" }), { status: 400, headers });
    }

    // 🔹 Armar el prompt (Tu lógica idéntica)
    const prompt = `
Eres un experimentado facilitador de procesos grupales en comunidades de práctica, 
y debes evaluar la respuesta de un aprendiz a una situación que debe demostrar ${concepto}.

Criterios: 2= incorrecto; 3= insuficiente; 4= regular; 5= bien; 6= Muy bien; 7= excelente:
1. Claridad
2. Aplicación
3. Profundidad de análisis

Luego realiza:
- Retroalimentación breve y constructiva
- 3 a 5 mejoras específicas
- Corrección de errores si los hay

Planteamiento:
${planteamiento}

Consigna:
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

    // 🔹 Llamada a la API usando la sintaxis oficial para la versión ^1.21.0
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const feedback = response.text || "⚠️ No se pudo generar una respuesta.";

    // Retornamos usando la Web API estándar de Response (requerida por Edge)
    headers["Content-Type"] = "application/json";
    return new Response(JSON.stringify({ feedback }), { status: 200, headers });

  } catch (error) {
    console.error("❌ Error en el servidor Gemini:", error);
    headers["Content-Type"] = "application/json";
    return new Response(
      JSON.stringify({ error: "Error procesando la solicitud", detalle: error.message }), 
      { status: 500, headers }
    );
  }
}
