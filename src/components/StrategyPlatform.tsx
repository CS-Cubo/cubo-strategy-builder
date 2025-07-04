
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Sparkles, Plus, Settings, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PortfolioChart from "./PortfolioChart";
import { useSession } from "@/hooks/useSession";
import { useStrategyStorage } from "@/hooks/useStrategyStorage";
import AccessCodeInput from "./AccessCodeInput";

interface Project {
  id: number;
  name: string;
  impact: number;
  complexity: number;
  category: "Core" | "Adjacente" | "Transformacional";
  selected: boolean;
  description?: string;
  expectedReturn?: string;
}

const StrategyPlatform = () => {
  const { sessionId, accessCode, isLoading: sessionLoading, createOrLoadSession, clearSession, hasSession } = useSession();
  const { strategySession, saveStrategySession, isLoading: storageLoading } = useStrategyStorage(sessionId);
  
  const [portfolioName, setPortfolioName] = useState("Novo Portfólio de Inovação");
  const [context, setContext] = useState({
    history: "",
    initiatives: ""
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState({
    name: "",
    impact: 5,
    complexity: 5,
    category: "Core" as "Core" | "Adjacente" | "Transformacional",
    expectedReturn: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load data when strategy session is available
  useEffect(() => {
    if (strategySession) {
      setPortfolioName(strategySession.portfolio_name);
      setContext({
        history: strategySession.context_history || "",
        initiatives: strategySession.context_initiatives || ""
      });
      setProjects(strategySession.projects.map(p => ({
        id: p.id ? parseInt(p.id) : Date.now(),
        name: p.name,
        impact: p.impact,
        complexity: p.complexity,
        category: p.category,
        selected: p.selected,
        description: p.description,
        expectedReturn: p.expected_return
      })));
    }
  }, [strategySession]);

  // Auto-save functionality - debounced
  useEffect(() => {
    if (hasSession && (portfolioName !== "Novo Portfólio de Inovação" || context.history || context.initiatives || projects.length > 0)) {
      const timeoutId = setTimeout(() => {
        const sessionData = {
          id: strategySession?.id,
          portfolio_name: portfolioName,
          context_history: context.history,
          context_initiatives: context.initiatives,
          projects: projects.map(p => ({
            id: p.id.toString(),
            name: p.name,
            impact: p.impact,
            complexity: p.complexity,
            category: p.category,
            selected: p.selected,
            description: p.description,
            expected_return: p.expectedReturn
          }))
        };
        saveStrategySession(sessionData);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [portfolioName, context, projects, hasSession, saveStrategySession, strategySession?.id]);

  const addProject = () => {
    if (!currentProject.name) {
      toast({
        title: "Nome obrigatório",
        description: "Insira o nome do projeto.",
        variant: "destructive"
      });
      return;
    }

    const newProject: Project = {
      id: Date.now(),
      name: currentProject.name,
      impact: currentProject.impact,
      complexity: currentProject.complexity,
      category: currentProject.category,
      selected: true,
      expectedReturn: currentProject.expectedReturn
    };

    setProjects([...projects, newProject]);
    setCurrentProject({ name: "", impact: 5, complexity: 5, category: "Core", expectedReturn: "" });
    
    toast({
      title: "Projeto adicionado",
      description: "Projeto adicionado ao portfólio com sucesso.",
    });
  };

  const toggleProjectSelection = (id: number) => {
    setProjects(projects.map(p => 
      p.id === id ? { ...p, selected: !p.selected } : p
    ));
  };

  const updateProjectReturn = (id: number, expectedReturn: string) => {
    setProjects(projects.map(p => 
      p.id === id ? { ...p, expectedReturn } : p
    ));
  };

  const generateAISuggestions = async () => {
    if (!context.history && !context.initiatives) {
      toast({
        title: "Contexto necessário",
        description: "Adicione informações sobre histórico ou iniciativas da empresa.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulação de chamada para IA (substituir por integração real)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const suggestions: Project[] = [
        {
          id: Date.now() + 1,
          name: "Plataforma de Analytics Avançada",
          impact: 8,
          complexity: 7,
          category: "Transformacional",
          selected: true,
          description: "Implementação de analytics preditivos para otimização de processos",
          expectedReturn: ""
        },
        {
          id: Date.now() + 2,
          name: "Automação de Processos Críticos",
          impact: 7,
          complexity: 5,
          category: "Core",
          selected: true,
          description: "Automatização de workflows operacionais principais",
          expectedReturn: ""
        },
        {
          id: Date.now() + 3,
          name: "Hub de Inovação Digital",
          impact: 9,
          complexity: 8,
          category: "Adjacente",
          selected: true,
          description: "Centro de desenvolvimento de soluções digitais inovadoras",
          expectedReturn: ""
        }
      ];

      setProjects([...projects, ...suggestions]);
      
      toast({
        title: "Sugestões geradas!",
        description: `${suggestions.length} projetos foram sugeridos pela IA.`,
      });
    } catch (error) {
      toast({
        title: "Erro na geração",
        description: "Não foi possível gerar sugestões. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = () => {
    const selectedProjects = projects.filter(p => p.selected);
    
    if (selectedProjects.length === 0) {
      toast({
        title: "Nenhum projeto selecionado",
        description: "Selecione pelo menos um projeto para gerar o relatório.",
        variant: "destructive"
      });
      return;
    }

    // Create enhanced chart SVG for report
    const categoryColors = {
      Core: '#3b82f6',
      Adjacente: '#8b5cf6', 
      Transformacional: '#ec4899'
    };

    const chartDots = selectedProjects.map(project => {
      const cx = ((project.complexity - 1) / 9) * 90 + 5;
      const cy = 95 - (((project.impact - 1) / 9) * 90);
      
      return `
        <g class="chart-group">
          <circle cx="${cx}%" cy="${cy}%" r="8" fill="${categoryColors[project.category]}" opacity="0.8" stroke="#fff" stroke-width="2"/>
          <title>${project.name}</title>
        </g>
      `;
    }).join('');

    const gridLines = [];
    for (let i = 1; i <= 9; i++) {
      gridLines.push(`<line x1="${i * 10}%" y1="0" x2="${i * 10}%" y2="100" stroke="#e5e7eb" stroke-width="1"/>`);
      gridLines.push(`<line x1="0" y1="${i * 10}%" x2="100" y2="${i * 10}%" stroke="#e5e7eb" stroke-width="1"/>`);
    }

    const chartSvg = `
      <svg width="100%" height="400px" viewBox="0 0 100 100" preserveAspectRatio="none" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        ${gridLines.join('')}
        <text x="-45" y="8" style="font-size: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #64748b; font-weight: 600;" transform="rotate(-90)">IMPACTO</text>
        <text x="45" y="108" style="font-size: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #64748b; font-weight: 600;">COMPLEXIDADE</text>
        ${chartDots}
      </svg>
    `;

    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório Estratégico - ${portfolioName}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              margin: 2rem; 
              color: #1f2937; 
              line-height: 1.6;
              background: #fafafa;
            }
            .container {
              max-width: 1200px;
              margin: 0 auto;
              background: white;
              padding: 3rem;
              border-radius: 16px;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              border-bottom: 4px solid #22c55e; 
              padding-bottom: 2rem; 
              margin-bottom: 3rem; 
            }
            .logo { 
              font-size: 2.5rem; 
              font-weight: 700; 
              background: linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%); 
              -webkit-background-clip: text; 
              -webkit-text-fill-color: transparent; 
            }
            .chart-section {
              margin: 3rem 0;
              padding: 2rem;
              background: #f8fafc;
              border-radius: 12px;
              border: 1px solid #e2e8f0;
            }
            .projects-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 2rem; 
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            }
            .projects-table th, .projects-table td { 
              border: 1px solid #e5e7eb; 
              padding: 1rem; 
              text-align: left; 
            }
            .projects-table th { 
              background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); 
              font-weight: 700; 
              color: #374151;
              text-transform: uppercase;
              font-size: 0.875rem;
              letter-spacing: 0.05em;
            }
            .category-core { background-color: #dbeafe; color: #1e40af; padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; }
            .category-adjacente { background-color: #e9d5ff; color: #581c87; padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; }
            .category-transformacional { background-color: #fce7f3; color: #831843; padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; }
            .legend {
              display: flex;
              gap: 2rem;
              justify-content: center;
              margin-top: 1rem;
              flex-wrap: wrap;
            }
            .legend-item {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              font-size: 0.875rem;
              font-weight: 500;
            }
            .legend-dot {
              width: 16px;
              height: 16px;
              border-radius: 50%;
              border: 2px solid #fff;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            @media print { 
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .container { box-shadow: none; margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Cubo Estratégia</div>
              <div>
                <h1 style="margin: 0; color: #374151; font-size: 2rem;">${portfolioName}</h1>
                <p style="margin: 0; color: #6b7280; font-size: 1.125rem;">Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            
            <div class="chart-section">
              <h2 style="color: #374151; margin-bottom: 1.5rem; font-size: 1.5rem;">Matriz Estratégica: Impacto vs Complexidade</h2>
              ${chartSvg}
              <div class="legend">
                <div class="legend-item">
                  <div class="legend-dot" style="background-color: #3b82f6;"></div>
                  <span>Core</span>
                </div>
                <div class="legend-item">
                  <div class="legend-dot" style="background-color: #8b5cf6;"></div>
                  <span>Adjacente</span>
                </div>
                <div class="legend-item">
                  <div class="legend-dot" style="background-color: #ec4899;"></div>
                  <span>Transformacional</span>
                </div>
              </div>
            </div>
            
            <h2 style="color: #374151; margin-bottom: 1.5rem; font-size: 1.5rem;">Projetos Estratégicos Selecionados</h2>
            <table class="projects-table">
              <thead>
                <tr>
                  <th>Projeto</th>
                  <th>Categoria</th>
                  <th>Impacto</th>
                  <th>Complexidade</th>
                  <th>Retorno Esperado</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                ${selectedProjects.map(p => `
                  <tr>
                    <td style="font-weight: 600; color: #1f2937;">${p.name}</td>
                    <td><span class="category-${p.category.toLowerCase()}">${p.category}</span></td>
                    <td style="text-align: center; font-weight: 600; color: #059669;">${p.impact}</td>
                    <td style="text-align: center; font-weight: 600; color: #dc2626;">${p.complexity}</td>
                    <td style="font-weight: 600; color: #0ea5e9;">${p.expectedReturn || 'N/A'}</td>
                    <td style="color: #6b7280;">${p.description || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div style="margin-top: 3rem; padding-top: 2rem; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 0.875rem;">
              <strong>Relatório confidencial gerado pela Plataforma Cubo Estratégia</strong><br>
              Este documento contém informações estratégicas sensíveis e deve ser tratado com confidencialidade.
            </div>
          </div>
        </body>
      </html>
    `;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(reportContent);
      newWindow.document.close();
      newWindow.focus();
      setTimeout(() => newWindow.print(), 500);
    }
  };

  if (!hasSession) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-gradient-success rounded-2xl p-8 text-white">
          <div className="flex items-center space-x-4 mb-4">
            <BarChart3 className="h-10 w-10" />
            <div>
              <h1 className="text-3xl font-bold">Plataforma de Estratégia com IA</h1>
              <p className="text-xl opacity-90">
                Construa portfólios estratégicos com sugestões inteligentes.
              </p>
            </div>
          </div>
        </div>

        <AccessCodeInput
          onSubmit={createOrLoadSession}
          isLoading={sessionLoading}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-success rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <BarChart3 className="h-10 w-10" />
          <div>
            <h1 className="text-3xl font-bold">Plataforma de Estratégia com IA</h1>
            <p className="text-xl opacity-90">
              Construa portfólios estratégicos com sugestões inteligentes.
            </p>
          </div>
        </div>
      </div>

      {/* Access Code Status */}
      <AccessCodeInput
        onSubmit={createOrLoadSession}
        isLoading={sessionLoading}
        currentCode={accessCode}
        onClear={clearSession}
      />

      {/* Configuration */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configuração do Portfólio</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="portfolioName">Nome do Portfólio</Label>
            <Input
              id="portfolioName"
              value={portfolioName}
              onChange={(e) => setPortfolioName(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="history">Histórico e Contexto da Empresa</Label>
            <Textarea
              id="history"
              value={context.history}
              onChange={(e) => setContext({ ...context, history: e.target.value })}
              placeholder="Missão, visão, valores, SWOT, principais produtos..."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="initiatives">Iniciativas e Pilares Estratégicos</Label>
            <Textarea
              id="initiatives"
              value={context.initiatives}
              onChange={(e) => setContext({ ...context, initiatives: e.target.value })}
              placeholder="Ex: 1. Expandir para a América Latina. 2. Lançar produto para o público jovem."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg h-full">
            <CardHeader>
              <CardTitle>Visualização: Impacto vs Complexidade</CardTitle>
            </CardHeader>
            <CardContent>
              <PortfolioChart projects={projects.filter(p => p.selected)} />
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* AI Suggestions */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Button 
                onClick={generateAISuggestions}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                size="lg"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Gerando..." : "Sugerir Projetos com IA"}
              </Button>
            </CardContent>
          </Card>

          {/* Add Project */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Adicionar Projeto</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="projectName">Nome do Projeto</Label>
                <Input
                  id="projectName"
                  value={currentProject.name}
                  onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })}
                  placeholder="Nome do Projeto"
                />
              </div>
              
              <div>
                <Label htmlFor="expectedReturn">Retorno Esperado</Label>
                <Input
                  id="expectedReturn"
                  value={currentProject.expectedReturn}
                  onChange={(e) => setCurrentProject({ ...currentProject, expectedReturn: e.target.value })}
                  placeholder="Ex: R$ 2.5M, 15% ROI, 200% crescimento"
                />
              </div>
              
              <div>
                <Label>Impacto: {currentProject.impact}</Label>
                <Input
                  type="range"
                  min="1"
                  max="10"
                  value={currentProject.impact}
                  onChange={(e) => setCurrentProject({ ...currentProject, impact: parseInt(e.target.value) })}
                  className="w-full accent-innovation-500"
                />
              </div>
              
              <div>
                <Label>Complexidade: {currentProject.complexity}</Label>
                <Input
                  type="range"
                  min="1"
                  max="10"
                  value={currentProject.complexity}
                  onChange={(e) => setCurrentProject({ ...currentProject, complexity: parseInt(e.target.value) })}
                  className="w-full accent-corporate-500"
                />
              </div>
              
              <div>
                <Label>Categoria</Label>
                <Select 
                  value={currentProject.category} 
                  onValueChange={(value: "Core" | "Adjacente" | "Transformacional") => 
                    setCurrentProject({ ...currentProject, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Core">Core</SelectItem>
                    <SelectItem value="Adjacente">Adjacente</SelectItem>
                    <SelectItem value="Transformacional">Transformacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={addProject} className="w-full bg-gradient-to-r from-gray-700 to-gray-800">
                Adicionar Manualmente
              </Button>
            </CardContent>
          </Card>

          {/* Projects List */}
          {projects.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Projetos Atuais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {projects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          checked={project.selected}
                          onChange={() => toggleProjectSelection(project.id)}
                          className="rounded border-gray-300 text-corporate-500 focus:ring-corporate-500"
                        />
                        <label className="text-sm font-medium text-gray-700 flex-1">
                          {project.name}
                        </label>
                      </div>
                      <div className="pl-6">
                        <Input
                          placeholder="Retorno esperado..."
                          value={project.expectedReturn || ""}
                          onChange={(e) => updateProjectReturn(project.id, e.target.value)}
                          className="text-xs h-8"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Enhanced Actions Section */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-500">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                📈 Pronto para Gerar seu Relatório Estratégico?
              </h3>
              <p className="text-gray-600 text-lg">
                Compile todos os projetos selecionados em um relatório profissional completo 
                com gráficos interativos, análise de retorno esperado e matriz estratégica.
              </p>
              <div className="flex items-center mt-3 text-sm text-green-700">
                <FileText className="h-4 w-4 mr-2" />
                <span className="font-medium">
                  {projects.filter(p => p.selected).length} projetos selecionados para o relatório
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={() => setProjects([])} size="lg">
                Limpar Projetos
              </Button>
              <Button 
                onClick={generateReport} 
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg px-8 py-3 h-auto"
                size="lg"
                disabled={projects.filter(p => p.selected).length === 0}
              >
                <FileText className="mr-3 h-6 w-6" />
                Gerar Relatório Estratégico Completo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrategyPlatform;
