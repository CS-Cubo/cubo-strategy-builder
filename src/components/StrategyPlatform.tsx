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
import { Loader2, Lightbulb, Plus, FileText } from "lucide-react"
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useClickCounter } from '@/hooks/useClickCounter';
import { useSession } from '@/hooks/useSession';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PortfolioChart from './PortfolioChart';

interface Project {
  id: string;
  name: string;
  impact: number;
  complexity: number;
  category: "Core" | "Adjacente" | "Transformacional";
  selected: boolean;
  description?: string;
  expectedReturn?: string;
}

const StrategyPlatform = () => {
  const [portfolioName, setPortfolioName] = useState('');
  const [contextHistory, setContextHistory] = useState('');
  const [contextInitiatives, setContextInitiatives] = useState('');
  
  const [newProject, setNewProject] = useState({
    name: '',
    expectedReturn: '',
    impact: 1,
    complexity: 1,
    category: 'Core' as "Core" | "Adjacente" | "Transformacional"
  });

  const [suggestedProjects, setSuggestedProjects] = useState<Project[]>([]);
  const [currentProjects, setCurrentProjects] = useState<Project[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { sessionId } = useSession();
  const { incrementProjectSuggestionsClicks } = useClickCounter(sessionId);

  useEffect(() => {
    if (sessionId) {
      loadExistingData();
    }
  }, [sessionId]);

  const loadExistingData = async () => {
    if (!sessionId) return;

    try {
      const { data: sessions, error: sessionError } = await supabase
        .from('strategy_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (sessionError) {
        console.error('Error loading strategy sessions:', sessionError);
        return;
      }

      if (sessions && sessions.length > 0) {
        const session = sessions[0];
        setPortfolioName(session.portfolio_name || '');
        setContextHistory(session.context_history || '');
        setContextInitiatives(session.context_initiatives || '');

        const { data: projects, error: projectsError } = await supabase
          .from('strategy_projects')
          .select('*')
          .eq('strategy_session_id', session.id);

        if (projectsError) {
          console.error('Error loading projects:', projectsError);
          return;
        }

        if (projects) {
          const mappedProjects = projects.map(p => ({
            id: p.id,
            name: p.name,
            impact: p.impact,
            complexity: p.complexity,
            category: p.category as "Core" | "Adjacente" | "Transformacional",
            selected: p.selected,
            description: p.description || '',
            expectedReturn: p.expected_return || ''
          }));
          setCurrentProjects(mappedProjects);
        }
      }
    } catch (error) {
      console.error('Error loading existing data:', error);
    }
  };

  const handleProjectSelection = (id: string) => {
    setSuggestedProjects(
      suggestedProjects.map(project =>
        project.id === id ? { ...project, selected: !project.selected } : project
      )
    );
  };

  const addManualProject = () => {
    if (!newProject.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira o nome do projeto.",
        variant: "destructive"
      });
      return;
    }

    const project: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProject.name,
      impact: newProject.impact,
      complexity: newProject.complexity,
      category: newProject.category,
      selected: true,
      expectedReturn: newProject.expectedReturn,
      description: ''
    };

    setCurrentProjects([...currentProjects, project]);
    setNewProject({
      name: '',
      expectedReturn: '',
      impact: 1,
      complexity: 1,
      category: 'Core'
    });

    toast({
      title: "Projeto adicionado!",
      description: "O projeto foi adicionado ao seu portfólio.",
    });
  };

  const saveConfiguration = async () => {
    if (!sessionId) {
      toast({
        title: "Sessão inválida",
        description: "Por favor, inicie uma sessão para salvar.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: existingSession } = await supabase
        .from('strategy_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (existingSession) {
        const { error: updateError } = await supabase
          .from('strategy_sessions')
          .update({
            portfolio_name: portfolioName,
            context_history: contextHistory,
            context_initiatives: contextInitiatives
          })
          .eq('id', existingSession.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('strategy_sessions')
          .insert({
            session_id: sessionId,
            portfolio_name: portfolioName,
            context_history: contextHistory,
            context_initiatives: contextInitiatives
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Configuração salva!",
        description: "As configurações do portfólio foram salvas.",
      });

    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações.",
        variant: "destructive"
      });
    }
  };

  const generateSuggestions = async () => {
    if (!contextHistory.trim() || !contextInitiatives.trim()) {
      toast({
        title: "Contexto necessário",
        description: "Por favor, preencha o histórico e iniciativas.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
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
          description: "Projetos estratégicos foram sugeridos.",
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

  const saveSuggestedProjects = async () => {
    const selectedProjects = suggestedProjects.filter(p => p.selected);
    if (selectedProjects.length === 0) {
      toast({
        title: "Nenhum projeto selecionado",
        description: "Selecione pelo menos um projeto.",
        variant: "destructive"
      });
      return;
    }

    setCurrentProjects([...currentProjects, ...selectedProjects]);
    setSuggestedProjects([]);
    
    toast({
      title: "Projetos adicionados!",
      description: "Os projetos selecionados foram adicionados ao portfólio.",
    });
  };

  const generateReport = () => {
    toast({
      title: "Relatório em desenvolvimento",
      description: "Funcionalidade de relatório será implementada em breve.",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full p-4">
      {/* Left Column - Configuration */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="w-4 h-4" />
              Configuração do Portfólio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="portfolioName" className="text-sm">Nome do Portfólio</Label>
              <Input
                id="portfolioName"
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
                placeholder="Ex: Estratégia Digital 2024"
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contextHistory" className="text-sm">Histórico e Contexto</Label>
              <Textarea
                id="contextHistory"
                value={contextHistory}
                onChange={(e) => setContextHistory(e.target.value)}
                placeholder="Descreva o histórico relevante da empresa..."
                rows={2}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contextInitiatives" className="text-sm">Iniciativas e Pilares</Label>
              <Textarea
                id="contextInitiatives"
                value={contextInitiatives}
                onChange={(e) => setContextInitiatives(e.target.value)}
                placeholder="Descreva as iniciativas estratégicas e pilares..."
                rows={2}
                className="text-sm"
              />
            </div>
            <Button onClick={saveConfiguration} className="w-full text-sm" size="sm">
              Salvar Configuração
            </Button>
          </CardContent>
        </Card>

        {/* Portfolio Chart */}
        {currentProjects.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Matriz de Portfólio</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <PortfolioChart projects={currentProjects.map(p => ({
                id: parseInt(p.id, 36),
                name: p.name,
                impact: p.impact,
                complexity: p.complexity,
                category: p.category,
                selected: p.selected
              }))} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Column - Projects */}
      <div className="space-y-4">
        {/* AI Suggestions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Sugerir Projetos com IA</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={generateSuggestions}
              disabled={isGenerating || !contextHistory.trim() || !contextInitiatives.trim()}
              className="w-full mb-3 text-sm"
              size="sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Gerando Sugestões...
                </>
              ) : (
                "Gerar Sugestões de Projetos"
              )}
            </Button>

            {suggestedProjects.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Projetos Sugeridos:</h4>
                {suggestedProjects.map((project) => (
                  <div key={project.id} className="border rounded-md p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{project.name}</span>
                      <Checkbox
                        checked={project.selected}
                        onCheckedChange={() => handleProjectSelection(project.id)}
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      Impacto: {project.impact} | Complexidade: {project.complexity}
                    </p>
                    <p className="text-xs text-gray-700">{project.description}</p>
                  </div>
                ))}
                <Button onClick={saveSuggestedProjects} className="w-full text-sm" size="sm">
                  Adicionar Projetos Selecionados
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual Project Addition */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="w-4 h-4" />
              Adicionar Projeto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="projectName" className="text-sm">Nome</Label>
              <Input
                id="projectName"
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                placeholder="Nome do projeto"
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="expectedReturn" className="text-sm">Retorno Esperado</Label>
              <Input
                id="expectedReturn"
                value={newProject.expectedReturn}
                onChange={(e) => setNewProject({...newProject, expectedReturn: e.target.value})}
                placeholder="Ex: 25% ROI em 12 meses"
                className="text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="impact" className="text-sm">Impacto (1-10)</Label>
                <Input
                  id="impact"
                  type="number"
                  min="1"
                  max="10"
                  value={newProject.impact}
                  onChange={(e) => setNewProject({...newProject, impact: parseInt(e.target.value) || 1})}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="complexity" className="text-sm">Complexidade (1-10)</Label>
                <Input
                  id="complexity"
                  type="number"
                  min="1"
                  max="10"
                  value={newProject.complexity}
                  onChange={(e) => setNewProject({...newProject, complexity: parseInt(e.target.value) || 1})}
                  className="text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="category" className="text-sm">Categoria</Label>
              <Select value={newProject.category} onValueChange={(value: "Core" | "Adjacente" | "Transformacional") => setNewProject({...newProject, category: value})}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Core">Core</SelectItem>
                  <SelectItem value="Adjacente">Adjacente</SelectItem>
                  <SelectItem value="Transformacional">Transformacional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addManualProject} className="w-full text-sm" size="sm">
              Adicionar Manualmente
            </Button>
          </CardContent>
        </Card>

        {/* Current Projects */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Projetos Atuais</CardTitle>
            <CardDescription className="text-sm">
              {currentProjects.length} projeto(s) no portfólio
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentProjects.length === 0 ? (
              <p className="text-gray-500 text-center py-3 text-sm">
                Nenhum projeto adicionado ainda
              </p>
            ) : (
              <div className="space-y-2">
                {currentProjects.map((project) => (
                  <div key={project.id} className="border rounded-md p-2">
                    <div className="font-medium text-sm">{project.name}</div>
                    <div className="text-xs text-gray-600">
                      {project.category} | Impacto: {project.impact} | Complexidade: {project.complexity}
                    </div>
                    {project.expectedReturn && (
                      <div className="text-xs text-gray-700">
                        Retorno: {project.expectedReturn}
                      </div>
                    )}
                  </div>
                ))}
                <Button onClick={generateReport} className="w-full mt-3 text-sm" size="sm">
                  <FileText className="mr-2 h-3 w-3" />
                  Gerar Relatório
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StrategyPlatform;
