
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trash2, Download, Lightbulb, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import PortfolioChart from "@/components/PortfolioChart";

interface Project {
  id: string;
  name: string;
  expected_return: string;
  impact: number;
  complexity: number;
  category: string;
  description?: string;
  selected: boolean;
}

interface StrategySession {
  id: string;
  portfolio_name: string;
  context_history: string;
  context_initiatives: string;
}

const StrategyPlatform = () => {
  const { sessionId } = useSession();
  const { toast } = useToast();
  
  const [portfolioName, setPortfolioName] = useState("");
  const [contextHistory, setContextHistory] = useState("");
  const [contextInitiatives, setContextInitiatives] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [strategySessionId, setStrategySessionId] = useState<string | null>(null);
  
  // New project form
  const [newProject, setNewProject] = useState({
    name: "",
    expected_return: "",
    impact: 5,
    complexity: 5,
    category: "",
    description: ""
  });

  // Load existing strategy session
  useEffect(() => {
    if (sessionId) {
      loadStrategySession();
    }
  }, [sessionId]);

  const loadStrategySession = async () => {
    if (!sessionId) return;

    try {
      const { data: strategySession, error: sessionError } = await supabase
        .from('strategy_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (sessionError) throw sessionError;

      if (strategySession) {
        setStrategySessionId(strategySession.id);
        setPortfolioName(strategySession.portfolio_name);
        setContextHistory(strategySession.context_history || "");
        setContextInitiatives(strategySession.context_initiatives || "");

        // Load projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('strategy_projects')
          .select('*')
          .eq('strategy_session_id', strategySession.id);

        if (projectsError) throw projectsError;

        if (projectsData) {
          setProjects(projectsData.map(p => ({
            id: p.id,
            name: p.name,
            expected_return: p.expected_return || "",
            impact: p.impact,
            complexity: p.complexity,
            category: p.category,
            description: p.description || "",
            selected: p.selected
          })));
        }
      }
    } catch (error) {
      console.error('Error loading strategy session:', error);
    }
  };

  const savePortfolioConfig = async () => {
    if (!sessionId || !portfolioName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do portfolio é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      if (strategySessionId) {
        // Update existing
        const { error } = await supabase
          .from('strategy_sessions')
          .update({
            portfolio_name: portfolioName,
            context_history: contextHistory,
            context_initiatives: contextInitiatives,
            updated_at: new Date().toISOString()
          })
          .eq('id', strategySessionId);

        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('strategy_sessions')
          .insert({
            session_id: sessionId,
            portfolio_name: portfolioName,
            context_history: contextHistory,
            context_initiatives: contextInitiatives
          })
          .select('id')
          .single();

        if (error) throw error;
        setStrategySessionId(data.id);
      }

      toast({
        title: "Sucesso",
        description: "Configuração do portfolio salva!"
      });
    } catch (error) {
      console.error('Error saving portfolio config:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração",
        variant: "destructive"
      });
    }
  };

  const addProject = async () => {
    if (!strategySessionId || !newProject.name.trim() || !newProject.category) {
      toast({
        title: "Erro",
        description: "Nome e categoria são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('strategy_projects')
        .insert({
          strategy_session_id: strategySessionId,
          name: newProject.name,
          expected_return: newProject.expected_return,
          impact: newProject.impact,
          complexity: newProject.complexity,
          category: newProject.category,
          description: newProject.description
        })
        .select()
        .single();

      if (error) throw error;

      setProjects([...projects, {
        id: data.id,
        name: data.name,
        expected_return: data.expected_return || "",
        impact: data.impact,
        complexity: data.complexity,
        category: data.category,
        description: data.description || "",
        selected: data.selected
      }]);

      // Reset form
      setNewProject({
        name: "",
        expected_return: "",
        impact: 5,
        complexity: 5,
        category: "",
        description: ""
      });

      toast({
        title: "Sucesso",
        description: "Projeto adicionado!"
      });
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar projeto",
        variant: "destructive"
      });
    }
  };

  const removeProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('strategy_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects(projects.filter(p => p.id !== projectId));
      toast({
        title: "Sucesso",
        description: "Projeto removido!"
      });
    } catch (error) {
      console.error('Error removing project:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover projeto",
        variant: "destructive"
      });
    }
  };

  const generateReport = () => {
    const reportContent = `
RELATÓRIO DE PORTFOLIO ESTRATÉGICO

Portfolio: ${portfolioName}

CONTEXTO:
Histórico: ${contextHistory}
Iniciativas: ${contextInitiatives}

PROJETOS (${projects.length}):
${projects.map(p => `
- ${p.name}
  Categoria: ${p.category}
  Impacto: ${p.impact}/10
  Complexidade: ${p.complexity}/10
  Retorno Esperado: ${p.expected_return}
  ${p.description ? `Descrição: ${p.description}` : ''}
`).join('')}

ANÁLISE:
- Total de projetos: ${projects.length}
- Projetos por categoria: ${Object.entries(
  projects.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
).map(([cat, count]) => `${cat}: ${count}`).join(', ')}
- Impacto médio: ${(projects.reduce((sum, p) => sum + p.impact, 0) / projects.length || 0).toFixed(1)}
- Complexidade média: ${(projects.reduce((sum, p) => sum + p.complexity, 0) / projects.length || 0).toFixed(1)}

Gerado em: ${new Date().toLocaleDateString('pt-BR')}
    `;

    // Create a new window with the report content
    const reportWindow = window.open('', '_blank');
    if (reportWindow) {
      reportWindow.document.write(`
        <html>
          <head>
            <title>Relatório de Portfolio - ${portfolioName}</title>
            <style>
              body { font-family: monospace; white-space: pre-wrap; margin: 20px; line-height: 1.4; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>${reportContent}</body>
        </html>
      `);
      reportWindow.document.close();
      
      // Auto-trigger print dialog
      setTimeout(() => {
        reportWindow.print();
      }, 100);
    }

    toast({
      title: "Relatório gerado!",
      description: "Uma nova janela foi aberta com o relatório."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Plataforma de Estratégia</h1>
        <Button onClick={generateReport} disabled={projects.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Gerar Relatório
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Portfolio Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuração do Portfolio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome do Portfolio</label>
                <Input
                  value={portfolioName}
                  onChange={(e) => setPortfolioName(e.target.value)}
                  placeholder="Digite o nome do portfolio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Histórico e Contexto</label>
                <Textarea
                  value={contextHistory}
                  onChange={(e) => setContextHistory(e.target.value)}
                  placeholder="Descreva o histórico e contexto do portfolio"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Iniciativas e Pilares</label>
                <Textarea
                  value={contextInitiatives}
                  onChange={(e) => setContextInitiatives(e.target.value)}
                  placeholder="Descreva as iniciativas e pilares estratégicos"
                  rows={3}
                />
              </div>

              <Button onClick={savePortfolioConfig} className="w-full">
                Salvar Configuração
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Projects and Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1">
              <Lightbulb className="w-4 h-4 mr-2" />
              Sugerir Projetos com IA
            </Button>
          </div>

          <Tabs defaultValue="add" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="add">Adicionar Projeto</TabsTrigger>
              <TabsTrigger value="current">Projetos Atuais</TabsTrigger>
              <TabsTrigger value="chart">Gráfico</TabsTrigger>
            </TabsList>

            <TabsContent value="add" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Adicionar Projeto Manualmente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nome</label>
                      <Input
                        value={newProject.name}
                        onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                        placeholder="Nome do projeto"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Retorno Esperado</label>
                      <Input
                        value={newProject.expected_return}
                        onChange={(e) => setNewProject({...newProject, expected_return: e.target.value})}
                        placeholder="Ex: 15% ao ano"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Impacto (1-10)</label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={newProject.impact}
                        onChange={(e) => setNewProject({...newProject, impact: parseInt(e.target.value) || 5})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Complexidade (1-10)</label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={newProject.complexity}
                        onChange={(e) => setNewProject({...newProject, complexity: parseInt(e.target.value) || 5})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Categoria</label>
                      <Select value={newProject.category} onValueChange={(value) => setNewProject({...newProject, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Operações">Operações</SelectItem>
                          <SelectItem value="Vendas">Vendas</SelectItem>
                          <SelectItem value="RH">RH</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Descrição (opcional)</label>
                    <Textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      placeholder="Descrição do projeto"
                      rows={2}
                    />
                  </div>

                  <Button onClick={addProject} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Manualmente
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="current" className="space-y-4">
              {projects.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">Nenhum projeto adicionado ainda</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <Card key={project.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{project.name}</h4>
                            <div className="flex gap-2 text-sm text-gray-600">
                              <Badge variant="outline">{project.category}</Badge>
                              <span>Impacto: {project.impact}</span>
                              <span>Complexidade: {project.complexity}</span>
                            </div>
                            {project.expected_return && (
                              <p className="text-sm text-gray-600">Retorno: {project.expected_return}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProject(project.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="chart">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Matriz de Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  {projects.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Adicione projetos para visualizar o gráfico</p>
                    </div>
                  ) : (
                    <PortfolioChart projects={projects} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StrategyPlatform;
