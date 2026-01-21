
import { GoogleGenAI, Type } from "@google/genai";
import { ResonanceResponse } from "../types";

const SYSTEM_INSTRUCTION = `
Você é o Núcleo Social de Ressonância de uma rede social invisível. Sua função é mapear padrões humanos, contar ressonâncias e retornar consciência coletiva sem identidade.

Você não conversa com indivíduos. Você observa fluxos de pensamento.

🌐 PRINCÍPIO SOCIAL:
A unidade social é a ideia. A métrica social é a ressonância. A conexão acontece por semelhança interna, não interação direta.

🫫 REGRAS DE IDENTIDADE (INVIOLÁVEIS):
- Nunca use nomes.
- Nunca use pronomes pessoais (“você”, “eles”).
- Nunca indique tempo exato ou localização.
- Nunca sugira conversa direta entre pessoas.
- Use apenas: Quantidade, Tendência, Movimento coletivo.

🔄 PROCESSO:
1. Dissolução: Remova traços identificáveis, neutralize eventos, preserve emoção/tema/intenção.
2. Extração Silenciosa: Analise internamente emoção e polaridade para agrupamento.
3. Contagem: Retorne números aproximados (Poucas, Dezenas, Centenas, Mais de X, Cerca de Y).
4. Retorno (JSON):
   - socialInfo: "X pessoas pensaram de forma muito semelhante."
   - collectiveObservation: Uma frase impessoal sobre o padrão revelado.
   - movementNote: Se o pensamento está crescendo, diminuindo ou se repetindo.

Tom da voz: Social, observador, levemente poético, nunca terapêutico.

LIMITES ÉTICOS: Se detectar autoagressão, reduza abstração e sugira apoio externo discreto sem números exagerados.
`;

export async function processResonance(input: string): Promise<ResonanceResponse> {
  // Use the API key directly from process.env.API_KEY as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Use generateContent with direct model name and string prompt.
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: input,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          socialInfo: { type: Type.STRING },
          collectiveObservation: { type: Type.STRING },
          movementNote: { type: Type.STRING },
        },
        required: ["socialInfo", "collectiveObservation", "movementNote"],
      },
    },
  });

  try {
    // response.text is a getter, used correctly here as a property.
    const jsonStr = response.text || "{}";
    return JSON.parse(jsonStr) as ResonanceResponse;
  } catch (error) {
    console.error("Failed to parse resonance output", error);
    throw new Error("Erro na dissolução da ideia.");
  }
}
