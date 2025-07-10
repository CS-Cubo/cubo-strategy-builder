import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Trash2, Download, Lightbulb, Plus, Loader2 } from "lucide-react";
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
  const [isLoadingBenchmarks, setIsLoadingBenchmarks] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState<string>("");
  const [suggestedProjects, setSuggestedProjects] = useState<any[]>([]);
  
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

  const fetchBenchmarks = async () => {
    if (!contextHistory.trim()) {
      toast({
        title: "Erro",
        description: "Adicione o histórico e contexto antes de buscar benchmarks",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingBenchmarks(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-benchmarks', {
        body: {
          description: contextHistory,
          type: 'benchmark'
        }
      });

      if (error) throw error;

      setBenchmarkResults(data.text || "Não foi possível obter benchmarks no momento.");
      
      toast({
        title: "Benchmarks obtidos!",
        description: "Confira os resultados na gaveta lateral"
      });
    } catch (error) {
      console.error('Error fetching benchmarks:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar benchmarks",
        variant: "destructive"
      });
    } finally {
      setIsLoadingBenchmarks(false);
    }
  };

  const suggestProjects = async () => {
    if (!contextHistory.trim() || !contextInitiatives.trim()) {
      toast({
        title: "Erro",
        description: "Preencha o histórico e as iniciativas antes de sugerir projetos",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const combinedContext = `Histórico: ${contextHistory}\n\nIniciativas: ${contextInitiatives}`;
      
      const { data, error } = await supabase.functions.invoke('ai-benchmarks', {
        body: {
          description: combinedContext,
          type: 'suggestions'
        }
      });

      if (error) throw error;

      if (data.projects && Array.isArray(data.projects)) {
        setSuggestedProjects(data.projects);
        toast({
          title: "Projetos sugeridos!",
          description: `${data.projects.length} projetos foram sugeridos pela IA`
        });
      } else {
        throw new Error("Formato de resposta inválido");
      }
    } catch (error) {
      console.error('Error suggesting projects:', error);
      toast({
        title: "Erro",
        description: "Erro ao sugerir projetos",
        variant: "destructive"
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const addSuggestedProject = async (suggestedProject: any) => {
    if (!strategySessionId) {
      toast({
        title: "Erro",
        description: "Salve a configuração do portfolio primeiro",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('strategy_projects')
        .insert({
          strategy_session_id: strategySessionId,
          name: suggestedProject.name,
          expected_return: suggestedProject.expectedReturn || "",
          impact: suggestedProject.impact,
          complexity: suggestedProject.complexity,
          category: suggestedProject.category,
          description: suggestedProject.description || ""
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

      toast({
        title: "Sucesso",
        description: "Projeto adicionado!"
      });
    } catch (error) {
      console.error('Error adding suggested project:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar projeto",
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

  const getCategoryColors = (category: string) => {
    const colors = {
      'Core': { bg: '#dbeafe', text: '#1e40af', class: 'category-core' },
      'Adjacente': { bg: '#e9d5ff', text: '#581c87', class: 'category-adjacente' },
      'Transformacional': { bg: '#fce7f3', text: '#831843', class: 'category-transformacional' },
      'Tecnologia': { bg: '#8B5CF6', text: '#fff', class: 'category-tecnologia' },
      'Marketing': { bg: '#EF4444', text: '#fff', class: 'category-marketing' },
      'Operações': { bg: '#10B981', text: '#fff', class: 'category-operacoes' },
      'Vendas': { bg: '#F59E0B', text: '#fff', class: 'category-vendas' },
      'RH': { bg: '#3B82F6', text: '#fff', class: 'category-rh' },
      'Outro': { bg: '#6B7280', text: '#fff', class: 'category-outro' }
    };
    return colors[category as keyof typeof colors] || colors['Outro'];
  };

  const generateChartSVG = () => {
    const svgPoints = projects.map(project => {
      const x = (project.complexity / 10) * 90 + 5;
      const y = 95 - (project.impact / 10) * 90;
      const colorInfo = getCategoryColors(project.category);
      
      return `<circle cx="${x}%" cy="${y}%" r="8" fill="${colorInfo.bg}" opacity="0.8" stroke="#fff" stroke-width="2">
        <title>${project.name}</title>
      </circle>`;
    }).join('\n');

    return `<svg width="100%" height="400px" viewBox="0 0 100 100" preserveAspectRatio="none" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      ${Array.from({length: 9}, (_, i) => 
        `<line x1="${(i + 1) * 10}%" y1="0" x2="${(i + 1) * 10}%" y2="100" stroke="#e5e7eb" stroke-width="1"></line><line x1="0" y1="${(i + 1) * 10}%" x2="100" y2="${(i + 1) * 10}%" stroke="#e5e7eb" stroke-width="1"></line>`
      ).join('')}
      <text x="-45" y="8" style="font-size: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #64748b; font-weight: 600;" transform="rotate(-90)">IMPACTO</text>
      <text x="45" y="108" style="font-size: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #64748b; font-weight: 600;">COMPLEXIDADE</text>
      
      <g class="chart-group">
        ${svgPoints}
      </g>
    </svg>`;
  };

  const generateReport = () => {
    const avgImpact = projects.length > 0 ? (projects.reduce((sum, p) => sum + p.impact, 0) / projects.length).toFixed(1) : '0';
    const avgComplexity = projects.length > 0 ? (projects.reduce((sum, p) => sum + p.complexity, 0) / projects.length).toFixed(1) : '0';
    const highImpact = projects.filter(p => p.impact >= 8).length;
    const lowComplexity = projects.filter(p => p.complexity <= 4).length;
    const withReturn = projects.filter(p => p.expected_return && p.expected_return.trim()).length;
    
    const categoryCounts = projects.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const reportHTML = `<html><head>
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
            .overview {
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              padding: 2rem;
              border-radius: 12px;
              margin-bottom: 2rem;
              border-left: 4px solid #0ea5e9;
            }
            .overview-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 1.5rem;
              margin-top: 1rem;
            }
            .overview-card {
              background: white;
              padding: 1.5rem;
              border-radius: 8px;
              text-align: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .overview-value {
              font-size: 2rem;
              font-weight: bold;
              color: #0ea5e9;
              display: block;
            }
            .overview-label {
              color: #6b7280;
              font-size: 0.875rem;
              margin-top: 0.5rem;
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
            .category-tecnologia { background-color: #8B5CF6; color: #fff; padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; }
            .category-marketing { background-color: #EF4444; color: #fff; padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; }
            .category-operacoes { background-color: #10B981; color: #fff; padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; }
            .category-vendas { background-color: #F59E0B; color: #fff; padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; }
            .category-rh { background-color: #3B82F6; color: #fff; padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; }
            .category-outro { background-color: #6B7280; color: #fff; padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; }
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
            
            <div class="overview">
              <h2 style="margin: 0 0 1rem 0; color: #0ea5e9;">📊 Visão Geral do Portfólio Estratégico</h2>
              <div class="overview-grid">
                <div class="overview-card">
                  <span class="overview-value">${projects.length}</span>
                  <div class="overview-label">Projetos Selecionados</div>
                </div>
                <div class="overview-card">
                  <span class="overview-value">${avgImpact}</span>
                  <div class="overview-label">Impacto Médio</div>
                </div>
                <div class="overview-card">
                  <span class="overview-value">${avgComplexity}</span>
                  <div class="overview-label">Complexidade Média</div>
                </div>
                <div class="overview-card">
                  <span class="overview-value">${highImpact}</span>
                  <div class="overview-label">Alto Impacto (≥8)</div>
                </div>
                <div class="overview-card">
                  <span class="overview-value">${lowComplexity}</span>
                  <div class="overview-label">Baixa Complexidade (≤4)</div>
                </div>
                <div class="overview-card">
                  <span class="overview-value">${withReturn}</span>
                  <div class="overview-label">Com Retorno Definido</div>
                </div>
              </div>
              
              <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
                <h3 style="margin: 0 0 1rem 0; color: #374151;">Distribuição por Categoria:</h3>
                <div style="display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap;">
                  ${Object.entries(categoryCounts).map(([category, count]) => `
                    <div style="text-align: center;">
                      <div style="font-size: 1.5rem; font-weight: bold; color: #3b82f6;">${count}</div>
                      <div style="font-size: 0.875rem; color: #6b7280;">${category}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
            
            <div class="chart-section">
              <h2 style="color: #374151; margin-bottom: 1.5rem; font-size: 1.5rem;">Matriz Estratégica: Impacto vs Complexidade</h2>
              ${generateChartSVG()}
              <div class="legend">
                <div class="legend-item">
                  <div class="legend-dot" style="background-color: #8B5CF6;"></div>
                  <span>Tecnologia</span>
                </div>
                <div class="legend-item">
                  <div class="legend-dot" style="background-color: #EF4444;"></div>
                  <span>Marketing</span>
                </div>
                <div class="legend-item">
                  <div class="legend-dot" style="background-color: #10B981;"></div>
                  <span>Operações</span>
                </div>
                <div class="legend-item">
                  <div class="legend-dot" style="background-color: #F59E0B;"></div>
                  <span>Vendas</span>
                </div>
                <div class="legend-item">
                  <div class="legend-dot" style="background-color: #3B82F6;"></div>
                  <span>RH</span>
                </div>
                <div class="legend-item">
                  <div class="legend-dot" style="background-color: #6B7280;"></div>
                  <span>Outro</span>
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
                ${projects.map(project => {
                  const colorInfo = getCategoryColors(project.category);
                  return `
                  <tr>
                    <td style="font-weight: 600; color: #1f2937;">${project.name}</td>
                    <td><span class="${colorInfo.class}">${project.category}</span></td>
                    <td style="text-align: center; font-weight: 600; color: #059669;">${project.impact}</td>
                    <td style="text-align: center; font-weight: 600; color: #dc2626;">${project.complexity}</td>
                    <td style="font-weight: 600; color: #0ea5e9;">${project.expected_return || 'N/A'}</td>
                    <td style="color: #6b7280;">${project.description || 'N/A'}</td>
                  </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
            
            <div style="margin-top: 3rem; padding-top: 2rem; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 0.875rem;">
              <strong>Relatório confidencial gerado pela Plataforma Cubo Estratégia</strong><br>
              Este documento contém informações estratégicas sensíveis e deve ser tratado com confidencialidade.
            </div>
          </div>
        </body></html>`;

    // Create a new window with the report content
    const reportWindow = window.open('', '_blank');
    if (reportWindow) {
      reportWindow.document.write(reportHTML);
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
            <Drawer>
              <DrawerTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={suggestProjects}
                  disabled={isLoadingSuggestions}
                >
                  {isLoadingSuggestions ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Lightbulb className="w-4 h-4 mr-2" />
                  )}
                  Sugerir Projetos com IA
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Projetos Sugeridos pela IA</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                  {suggestedProjects.length === 0 ? (
                    <p className="text-gray-500 text-center">Nenhum projeto sugerido ainda. Clique no botão para obter sugestões.</p>
                  ) : (
                    suggestedProjects.map((project, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <h4 className="font-medium">{project.name}</h4>
                              <div className="flex gap-2 text-sm text-gray-600">
                                <Badge variant="outline">{project.category}</Badge>
                                <span>Impacto: {project.impact}</span>
                                <span>Complexidade: {project.complexity}</span>
                              </div>
                              <p className="text-sm text-gray-600">{project.description}</p>
                              {project.expectedReturn && (
                                <p className="text-sm text-blue-600">Retorno: {project.expectedReturn}</p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => addSuggestedProject(project)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Adicionar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </DrawerContent>
            </Drawer>

            <Drawer>
              <DrawerTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={fetchBenchmarks}
                  disabled={isLoadingBenchmarks}
                >
                  {isLoadingBenchmarks ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Lightbulb className="w-4 h-4 mr-2" />
                  )}
                  Buscar Benchmarks
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Benchmarks de Mercado</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 max-h-96 overflow-y-auto">
                  {benchmarkResults ? (
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm">{benchmarkResults}</pre>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">Nenhum benchmark disponível ainda. Clique no botão para buscar.</p>
                  )}
                </div>
              </DrawerContent>
            </Drawer>
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
                  <CardTitle className="text-lg">Adicionar Projeto</CardTitle>
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
