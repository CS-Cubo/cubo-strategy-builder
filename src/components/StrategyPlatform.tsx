
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Sparkles, Plus, Settings, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PortfolioChart from "./PortfolioChart";

interface Project {
  id: number;
  name: string;
  impact: number;
  complexity: number;
  category: "Core" | "Adjacente" | "Transformacional";
  selected: boolean;
  description?: string;
}

const StrategyPlatform = () => {
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
    category: "Core" as const
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      selected: true
    };

    setProjects([...projects, newProject]);
    setCurrentProject({ name: "", impact: 5, complexity: 5, category: "Core" });
    
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
          description: "Implementação de analytics preditivos para otimização de processos"
        },
        {
          id: Date.now() + 2,
          name: "Automação de Processos Críticos",
          impact: 7,
          complexity: 5,
          category: "Core",
          selected: true,
          description: "Automatização de workflows operacionais principais"
        },
        {
          id: Date.now() + 3,
          name: "Hub de Inovação Digital",
          impact: 9,
          complexity: 8,
          category: "Adjacente",
          selected: true,
          description: "Centro de desenvolvimento de soluções digitais inovadoras"
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

    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório Estratégico - ${portfolioName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 2rem; color: #1f2937; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #22c55e; padding-bottom: 1rem; margin-bottom: 2rem; }
            .logo { font-size: 2rem; font-weight: 700; background: linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .projects-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
            .projects-table th, .projects-table td { border: 1px solid #e5e7eb; padding: 0.75rem; text-align: left; }
            .projects-table th { background-color: #f9fafb; font-weight: 600; }
            .category-core { background-color: #dbeafe; color: #1e40af; padding: 0.25rem 0.5rem; border-radius: 0.375rem; font-size: 0.75rem; }
            .category-adjacente { background-color: #e9d5ff; color: #581c87; padding: 0.25rem 0.5rem; border-radius: 0.375rem; font-size: 0.75rem; }
            .category-transformacional { background-color: #fce7f3; color: #831843; padding: 0.25rem 0.5rem; border-radius: 0.375rem; font-size: 0.75rem; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Cubo Estratégia</div>
            <div>
              <h1 style="margin: 0; color: #374151;">${portfolioName}</h1>
              <p style="margin: 0; color: #6b7280;">Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          
          <h3 style="color: #374151; margin-bottom: 1rem;">Projetos Selecionados</h3>
          <table class="projects-table">
            <thead>
              <tr>
                <th>Projeto</th>
                <th>Categoria</th>
                <th>Impacto</th>
                <th>Complexidade</th>
                <th>Descrição</th>
              </tr>
            </thead>
            <tbody>
              ${selectedProjects.map(p => `
                <tr>
                  <td>${p.name}</td>
                  <td><span class="category-${p.category.toLowerCase()}">${p.category}</span></td>
                  <td>${p.impact}</td>
                  <td>${p.complexity}</td>
                  <td>${p.description || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 0.875rem;">
            Relatório confidencial gerado pela Plataforma Cubo Estratégia
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
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={project.selected}
                        onChange={() => toggleProjectSelection(project.id)}
                        className="rounded border-gray-300 text-corporate-500 focus:ring-corporate-500"
                      />
                      <label className="text-sm text-gray-700 flex-1">
                        {project.name}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => setProjects([])}>
          Limpar Projetos
        </Button>
        <Button onClick={generateReport} className="bg-gradient-success">
          <FileText className="mr-2 h-4 w-4" />
          Gerar Relatório Final
        </Button>
      </div>
    </div>
  );
};

export default StrategyPlatform;
