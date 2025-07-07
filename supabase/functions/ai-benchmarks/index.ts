
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BenchmarkRequest {
  description: string;
  type: 'benchmark' | 'suggestions';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, type }: BenchmarkRequest = await req.json();
    const apiKey = Deno.env.get('GOOGLE_API_KEY');

    if (!apiKey) {
      throw new Error('Google API key not configured');
    }

    let prompt = '';
    if (type === 'benchmark') {
      prompt = `Com base na seguinte descrição de projeto, forneça um resumo estruturado de benchmarks de ROI para iniciativas semelhantes. A resposta deve ser em português e bem formatada. 

IMPORTANTE: Inclua fontes específicas e confiáveis com links reais sempre que possível. Procure por:
- Notícias recentes de empresas que implementaram projetos similares
- Relatórios de consultorias (McKinsey, BCG, Deloitte, etc.)
- Estudos de caso publicados em revistas de negócios
- Dados de associações setoriais
- Relatórios governamentais ou de órgãos reguladores

Para cada informação relevante, inclua:
1. Faixa de ROI comum (ex: 15-25%)
2. Fatores que influenciam esse ROI
3. Exemplos de casos de sucesso similares COM FONTES ESPECÍFICAS
4. Timeframe típico de retorno
5. Riscos e considerações
6. **FONTES E LINKS**: Para cada benchmark mencionado, cite a fonte específica com link quando disponível

Descrição do projeto: "${description}"

Formate a resposta de forma clara e organizada, destacando as fontes em negrito e incluindo links clicáveis quando possível.`;
    } else {
      prompt = `Com base no histórico e contexto fornecido, sugira 3-5 projetos estratégicos inovadores que se alinhem com os objetivos da empresa. Para cada projeto, forneça:

1. Nome do projeto
2. Categoria (Core, Adjacente, ou Transformacional)
3. Impacto esperado (escala 1-10)
4. Complexidade de implementação (escala 1-10)
5. Descrição breve
6. Potencial de retorno

Contexto da empresa: "${description}"

Responda em formato JSON válido com a seguinte estrutura:
{
  "projects": [
    {
      "name": "Nome do Projeto",
      "category": "Core|Adjacente|Transformacional",
      "impact": 8,
      "complexity": 6,
      "description": "Descrição do projeto",
      "expectedReturn": "Descrição do retorno esperado"
    }
  ]
}`;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No response from AI');
    }

    let responseData;
    if (type === 'suggestions') {
      try {
        responseData = JSON.parse(text);
      } catch {
        // If JSON parsing fails, return a structured error
        responseData = {
          error: "Failed to parse AI response",
          rawText: text
        };
      }
    } else {
      responseData = { text };
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in ai-benchmarks function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        type: 'api_error'
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
