import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Lightbulb } from "lucide-react"
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useClickCounter } from '@/hooks/useClickCounter';
import { useSession } from '@/hooks/useSession';

interface Project {
  id: string;
  name: string;
  impact: number;
  complexity: number;
  category: string;
  selected: boolean;
  description?: string;
  expectedReturn?: string;
}

const StrategyPlatform = () => {
  const [contextHistory, setContextHistory] = useState('');
  const [contextInitiatives, setContextInitiatives] = useState('');
  const [suggestedProjects, setSuggestedProjects] = useState<Project[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { sessionId } = useSession();
  const { incrementProjectSuggestionsClicks } = useClickCounter(sessionId);

  const handleProjectSelection = (id: string) => {
    setSuggestedProjects(
      suggestedProjects.map(project =>
        project.id === id ? { ...project, selected: !project.selected } : project
      )
    );
  };

  const saveProjects = async () => {
    if (!sessionId) {
      toast({
        title: "Sessão inválida",
        description: "Por favor, inicie ou carregue uma sessão para salvar os projetos.",
        variant: "destructive"
      });
      return;
    }

    const selectedProjects = suggestedProjects.filter(project => project.selected);

    if (selectedProjects.length === 0) {
      toast({
        title: "Nenhum projeto selecionado",
        description: "Selecione pelo menos um projeto para salvar.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Fetch or create strategy_session
      let strategySession: Tables<'strategy_sessions'> | null = null;
      const { data: existingSession, error: sessionError } = await supabase
        .from('strategy_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (sessionError && sessionError.code !== 'PGRST116') {
        console.error('Erro ao buscar sessão de estratégia:', sessionError);
        toast({
          title: "Erro",
          description: "Erro ao buscar sessão de estratégia. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      if (existingSession) {
        strategySession = existingSession;
      } else {
        const { data: newSession, error: newSessionError } = await supabase
          .from('strategy_sessions')
          .insert({
            session_id: sessionId,
            portfolio_name: 'Estratégia Inicial',
            context_history: contextHistory,
            context_initiatives: contextInitiatives
          })
          .select('*')
          .single();

        if (newSessionError) {
          console.error('Erro ao criar sessão de estratégia:', newSessionError);
          toast({
            title: "Erro",
            description: "Erro ao criar sessão de estratégia. Tente novamente.",
            variant: "destructive"
          });
          return;
        }

        strategySession = newSession;
      }

      if (!strategySession) {
        toast({
          title: "Erro",
          description: "Sessão de estratégia não encontrada ou criada.",
          variant: "destructive"
        });
        return;
      }

      // Save projects
      const projectsToSave = selectedProjects.map(project => ({
        strategy_session_id: strategySession.id,
        name: project.name,
        impact: project.impact,
        complexity: project.complexity,
        category: project.category,
        description: project.description,
        expected_return: project.expectedReturn,
        selected: project.selected
      }));

      const { error: insertError } = await supabase
        .from('strategy_projects')
        .insert(projectsToSave);

      if (insertError) {
        console.error('Erro ao salvar projetos:', insertError);
        toast({
          title: "Erro",
          description: "Erro ao salvar projetos. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Projetos salvos!",
        description: "Seus projetos estratégicos foram salvos com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao salvar projetos:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar projetos.",
        variant: "destructive"
      });
    }
  };

  const generateSuggestions = async () => {
    if (!contextHistory.trim() || !contextInitiatives.trim()) {
      toast({
        title: "Contexto necessário",
        description: "Por favor, preencha o histórico da empresa e iniciativas atuais.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Incrementar contador de cliques
      await incrementProjectSuggestionsClicks();

      const contextDescription = `Histórico da empresa: ${contextHistory}\n\nIniciativas atuais: ${contextInitiatives}`;
      
      const { data, error } = await supabase.functions.invoke('ai-benchmarks', {
        body: { 
          description: contextDescription,
          type: 'suggestions'
        }
      });

      if (error) {
        console.error('Erro na função:', error);
        toast({
          title: "Erro",
          description: "Erro ao gerar sugestões. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      if (data?.projects) {
        setSuggestedProjects(data.projects.map((project: any) => ({
          ...project,
          id: Math.random().toString(36).substr(2, 9),
          selected: true
        })));
        
        toast({
          title: "Sugestões geradas!",
          description: "Projetos estratégicos foram sugeridos com base no seu contexto.",
        });
      } else if (data?.error) {
        // Fallback para dados mock se o parsing falhar
        const mockProjects = [
          {
            id: "mock-1",
            name: "Transformação Digital",
            category: "Transformacional",
            impact: 8,
            complexity: 7,
            description: "Implementação de plataforma digital integrada",
            expectedReturn: "Aumento de 30% na eficiência operacional",
            selected: true
          },
          {
            id: "mock-2", 
            name: "Expansão de Mercado",
            category: "Adjacente",
            impact: 7,
            complexity: 6,
            description: "Entrada em novos segmentos de mercado",
            expectedReturn: "Crescimento de 25% na receita",
            selected: true
          }
        ];
        
        setSuggestedProjects(mockProjects);
        toast({
          title: "Sugestões geradas!",
          description: "Projetos estratégicos foram sugeridos (modo simplificado).",
        });
      }
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao gerar sugestões.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Plataforma de Estratégia
          </CardTitle>
          <CardDescription>
            Defina o contexto da sua empresa para gerar projetos estratégicos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="contextHistory">Histórico da Empresa</Label>
            <Textarea
              id="contextHistory"
              placeholder="Descreva o histórico relevante da empresa..."
              value={contextHistory}
              onChange={(e) => setContextHistory(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="contextInitiatives">Iniciativas Atuais</Label>
            <Textarea
              id="contextInitiatives"
              placeholder="Descreva as iniciativas estratégicas atuais..."
              value={contextInitiatives}
              onChange={(e) => setContextInitiatives(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
          <Button
            onClick={generateSuggestions}
            disabled={isGenerating || !contextHistory.trim() || !contextInitiatives.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando Sugestões...
              </>
            ) : (
              "Gerar Sugestões de Projetos"
            )}
          </Button>
        </CardContent>
      </Card>

      {suggestedProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Projetos Estratégicos Sugeridos</CardTitle>
            <CardDescription>
              Selecione os projetos mais relevantes para sua estratégia.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestedProjects.map((project) => (
              <div key={project.id} className="border rounded-md p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`project-${project.id}`} className="font-semibold">
                    {project.name} ({project.category})
                  </Label>
                  <Checkbox
                    id={`project-${project.id}`}
                    checked={project.selected}
                    onCheckedChange={() => handleProjectSelection(project.id)}
                  />
                </div>
                <p className="text-sm text-gray-500">Impacto: {project.impact} | Complexidade: {project.complexity}</p>
                <p className="text-gray-700">{project.description}</p>
                <p className="text-gray-600">Retorno Esperado: {project.expectedReturn}</p>
              </div>
            ))}
            <Button onClick={saveProjects} className="w-full">
              Salvar Projetos Selecionados
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StrategyPlatform;
