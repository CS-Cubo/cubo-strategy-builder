
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, DollarSign, Calendar, FileText, BarChart3, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ROIProject {
  id: number;
  projectName: string;
  projectDescription: string;
  investmentAmount: number;
  timeframe: number;
  expectedRevenue: number;
  expectedCosts: number;
  riskLevel: "Baixo" | "Médio" | "Alto";
  calculationModel: "Empresarial" | "Simples";
  results?: {
    roi: number;
    netProfit: number;
    breakEvenMonths: number;
    monthlyReturn: number;
    riskAdjustedROI: number;
  };
}

const ROICalculator = () => {
  const [projects, setProjects] = useState<ROIProject[]>([]);
  const [currentProject, setCurrentProject] = useState<Omit<ROIProject, 'id' | 'results'>>({
    projectName: "",
    projectDescription: "",
    investmentAmount: 0,
    timeframe: 12,
    expectedRevenue: 0,
    expectedCosts: 0,
    riskLevel: "Médio",
    calculationModel: "Empresarial"
  });

  const { toast } = useToast();

  const calculateROI = (project: Omit<ROIProject, 'id' | 'results'>) => {
    if (!project.projectName) {
      toast({
        title: "Nome do projeto obrigatório",
        description: "Insira o nome do projeto para continuar.",
        variant: "destructive"
      });
      return null;
    }

    if (project.investmentAmount <= 0) {
      toast({
        title: "Investimento inválido",
        description: "O valor do investimento deve ser maior que zero.",
        variant: "destructive"
      });
      return null;
    }

    if (project.calculationModel === "Empresarial") {
      const netProfit = project.expectedRevenue - project.expectedCosts - project.investmentAmount;
      const roi = ((netProfit / project.investmentAmount) * 100);
      const breakEvenMonths = project.investmentAmount / ((project.expectedRevenue - project.expectedCosts) / project.timeframe);
      const monthlyReturn = netProfit / project.timeframe;
      
      const riskFactors = {
        "Baixo": 0.95,
        "Médio": 0.85,
        "Alto": 0.70
      };
      
      const riskAdjustedROI = roi * riskFactors[project.riskLevel];

      return {
        roi,
        netProfit,
        breakEvenMonths: Math.max(0, breakEvenMonths),
        monthlyReturn,
        riskAdjustedROI
      };
    } else {
      // Modelo Simples: ROI = (Ganho - Investimento) / Investimento * 100
      const gain = project.expectedRevenue;
      const roi = ((gain - project.investmentAmount) / project.investmentAmount) * 100;
      const netProfit = gain - project.investmentAmount;
      const breakEvenMonths = project.timeframe / 2; // Simplified assumption
      const monthlyReturn = netProfit / project.timeframe;
      
      return {
        roi,
        netProfit,
        breakEvenMonths,
        monthlyReturn,
        riskAdjustedROI: roi // No risk adjustment in simple model
      };
    }
  };

  const addProject = () => {
    const results = calculateROI(currentProject);
    if (!results) return;

    const newProject: ROIProject = {
      ...currentProject,
      id: Date.now(),
      results
    };

    setProjects([...projects, newProject]);
    
    // Reset form
    setCurrentProject({
      projectName: "",
      projectDescription: "",
      investmentAmount: 0,
      timeframe: 12,
      expectedRevenue: 0,
      expectedCosts: 0,
      riskLevel: "Médio",
      calculationModel: "Empresarial"
    });

    toast({
      title: "Projeto adicionado!",
      description: "O projeto foi calculado e adicionado ao portfólio.",
    });
  };

  const removeProject = (id: number) => {
    setProjects(projects.filter(p => p.id !== id));
    toast({
      title: "Projeto removido",
      description: "O projeto foi removido do portfólio.",
    });
  };

  const generateReport = () => {
    if (projects.length === 0) {
      toast({
        title: "Adicione projetos primeiro",
        description: "Adicione pelo menos um projeto antes de gerar o relatório.",
        variant: "destructive"
      });
      return;
    }

    const totalInvestment = projects.reduce((sum, p) => sum + p.investmentAmount, 0);
    const totalNetProfit = projects.reduce((sum, p) => sum + (p.results?.netProfit || 0), 0);
    const averageROI = projects.reduce((sum, p) => sum + (p.results?.roi || 0), 0) / projects.length;
    const averagePayback = projects.reduce((sum, p) => sum + (p.results?.breakEvenMonths || 0), 0) / projects.length;

    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório Consolidado de ROI - ${projects.length} Projetos</title>
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
              border-bottom: 4px solid #0ea5e9; 
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
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 2rem;
              margin: 2rem 0;
            }
            .summary-card {
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              padding: 2rem;
              border-radius: 12px;
              border: 1px solid #e2e8f0;
              text-align: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .summary-value {
              font-size: 2rem;
              font-weight: 700;
              margin-bottom: 0.5rem;
            }
            .summary-label {
              font-size: 0.875rem;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              font-weight: 600;
            }
            .projects-table {
              width: 100%;
              border-collapse: collapse;
              margin: 2rem 0;
            }
            .projects-table th,
            .projects-table td {
              border: 1px solid #e5e7eb;
              padding: 1rem;
              text-align: left;
            }
            .projects-table th {
              background-color: #f9fafb;
              font-weight: 600;
            }
            .positive { color: #059669; }
            .negative { color: #dc2626; }
            .neutral { color: #0ea5e9; }
            .section {
              margin: 3rem 0;
              padding: 2rem;
              background: #f8fafc;
              border-radius: 12px;
              border-left: 4px solid #0ea5e9;
            }
            .model-badge {
              display: inline-block;
              padding: 0.25rem 0.75rem;
              border-radius: 9999px;
              font-size: 0.75rem;
              font-weight: 600;
              text-transform: uppercase;
            }
            .empresarial { background-color: #dbeafe; color: #1e40af; }
            .simples { background-color: #dcfce7; color: #166534; }
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
              <div style="text-align: right;">
                <h1 style="margin: 0; color: #374151; font-size: 2rem;">Relatório Consolidado de ROI</h1>
                <p style="margin: 0; color: #6b7280; font-size: 1.125rem;">
                  ${projects.length} Projetos | Gerado em: ${new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            
            <div class="summary-grid">
              <div class="summary-card">
                <div class="summary-value positive">
                  R$ ${totalInvestment.toLocaleString('pt-BR')}
                </div>
                <div class="summary-label">Investimento Total</div>
              </div>
              
              <div class="summary-card">
                <div class="summary-value ${totalNetProfit >= 0 ? 'positive' : 'negative'}">
                  R$ ${totalNetProfit.toLocaleString('pt-BR')}
                </div>
                <div class="summary-label">Lucro Líquido Total</div>
              </div>
              
              <div class="summary-card">
                <div class="summary-value ${averageROI >= 0 ? 'positive' : 'negative'}">
                  ${averageROI.toFixed(1)}%
                </div>
                <div class="summary-label">ROI Médio</div>
              </div>
              
              <div class="summary-card">
                <div class="summary-value neutral">
                  ${averagePayback.toFixed(1)} meses
                </div>
                <div class="summary-label">Payback Médio</div>
              </div>
            </div>

            <div class="section">
              <h2 style="color: #374151; margin-bottom: 1rem; font-size: 1.5rem;">📊 Detalhamento dos Projetos</h2>
              <table class="projects-table">
                <thead>
                  <tr>
                    <th>Projeto</th>
                    <th>Modelo</th>
                    <th>Investimento</th>
                    <th>ROI</th>
                    <th>Lucro Líquido</th>
                    <th>Payback</th>
                    <th>Risco</th>
                  </tr>
                </thead>
                <tbody>
                  ${projects.map(project => `
                    <tr>
                      <td>
                        <strong>${project.projectName}</strong>
                        ${project.projectDescription ? `<br><small style="color: #6b7280;">${project.projectDescription}</small>` : ''}
                      </td>
                      <td>
                        <span class="model-badge ${project.calculationModel.toLowerCase()}">
                          ${project.calculationModel}
                        </span>
                      </td>
                      <td>R$ ${project.investmentAmount.toLocaleString('pt-BR')}</td>
                      <td class="${(project.results?.roi || 0) >= 0 ? 'positive' : 'negative'}">
                        ${(project.results?.roi || 0).toFixed(1)}%
                      </td>
                      <td class="${(project.results?.netProfit || 0) >= 0 ? 'positive' : 'negative'}">
                        R$ ${(project.results?.netProfit || 0).toLocaleString('pt-BR')}
                      </td>
                      <td>${(project.results?.breakEvenMonths || 0).toFixed(1)} meses</td>
                      <td>${project.riskLevel}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div style="margin-top: 3rem; padding-top: 2rem; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 0.875rem;">
              <strong>Relatório confidencial gerado pela Calculadora de ROI - Cubo Estratégia</strong><br>
              Este documento contém projeções financeiras e deve ser tratado com confidencialidade.
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-corporate-600 via-corporate-700 to-innovation-600 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <Calculator className="h-10 w-10" />
          <div>
            <h1 className="text-3xl font-bold">Calculadora de ROI Empresarial</h1>
            <p className="text-xl opacity-90">
              Analise múltiplos projetos com diferentes modelos de cálculo de ROI.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Adicionar Novo Projeto</span>
            </CardTitle>
            <CardDescription>
              Insira as informações do projeto e selecione o modelo de cálculo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="calculationModel">Modelo de Cálculo *</Label>
                <Select 
                  value={currentProject.calculationModel} 
                  onValueChange={(value: "Empresarial" | "Simples") => setCurrentProject({ ...currentProject, calculationModel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Empresarial">Empresarial (Receitas - Custos - Investimento)</SelectItem>
                    <SelectItem value="Simples">Simples (Ganho - Investimento)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="projectName">Nome do Projeto *</Label>
                <Input
                  id="projectName"
                  value={currentProject.projectName}
                  onChange={(e) => setCurrentProject({ ...currentProject, projectName: e.target.value })}
                  placeholder="Ex: Implementação de CRM"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="projectDescription">Descrição do Projeto</Label>
                <Input
                  id="projectDescription"
                  value={currentProject.projectDescription}
                  onChange={(e) => setCurrentProject({ ...currentProject, projectDescription: e.target.value })}
                  placeholder="Breve descrição do projeto..."
                />
              </div>

              <div>
                <Label htmlFor="investment">Investimento Inicial (R$)</Label>
                <Input
                  id="investment"
                  type="number"
                  value={currentProject.investmentAmount || ""}
                  onChange={(e) => setCurrentProject({ ...currentProject, investmentAmount: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="timeframe">Prazo (meses)</Label>
                <Input
                  id="timeframe"
                  type="number"
                  value={currentProject.timeframe}
                  onChange={(e) => setCurrentProject({ ...currentProject, timeframe: Number(e.target.value) })}
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="revenue">
                  {currentProject.calculationModel === "Empresarial" ? "Receita Esperada (R$)" : "Ganho Esperado (R$)"}
                </Label>
                <Input
                  id="revenue"
                  type="number"
                  value={currentProject.expectedRevenue || ""}
                  onChange={(e) => setCurrentProject({ ...currentProject, expectedRevenue: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>

              {currentProject.calculationModel === "Empresarial" && (
                <div>
                  <Label htmlFor="costs">Custos Operacionais (R$)</Label>
                  <Input
                    id="costs"
                    type="number"
                    value={currentProject.expectedCosts || ""}
                    onChange={(e) => setCurrentProject({ ...currentProject, expectedCosts: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              )}

              <div className={currentProject.calculationModel === "Empresarial" ? "md:col-span-2" : ""}>
                <Label htmlFor="risk">Nível de Risco</Label>
                <Select 
                  value={currentProject.riskLevel} 
                  onValueChange={(value: "Baixo" | "Médio" | "Alto") => setCurrentProject({ ...currentProject, riskLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixo">Baixo</SelectItem>
                    <SelectItem value="Médio">Médio</SelectItem>
                    <SelectItem value="Alto">Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={addProject} className="w-full bg-gradient-to-r from-corporate-600 to-innovation-600" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Adicionar Projeto ao Portfólio
            </Button>
          </CardContent>
        </Card>

        {/* Projects List */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Projetos no Portfólio ({projects.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum projeto adicionado ainda.</p>
                  <p className="text-sm">Adicione projetos para começar a análise.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {projects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{project.projectName}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              project.calculationModel === "Empresarial" 
                                ? "bg-blue-100 text-blue-800" 
                                : "bg-green-100 text-green-800"
                            }`}>
                              {project.calculationModel}
                            </span>
                          </div>
                          {project.projectDescription && (
                            <p className="text-sm text-gray-600 mb-2">{project.projectDescription}</p>
                          )}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">ROI:</span>
                              <span className={`ml-1 font-medium ${
                                (project.results?.roi || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {project.results?.roi.toFixed(1)}%
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Payback:</span>
                              <span className="ml-1 font-medium text-blue-600">
                                {project.results?.breakEvenMonths.toFixed(1)} meses
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Investimento:</span>
                              <span className="ml-1 font-medium">
                                R$ {project.investmentAmount.toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Lucro:</span>
                              <span className={`ml-1 font-medium ${
                                (project.results?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                R$ {project.results?.netProfit.toLocaleString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => removeProject(project.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Report Generation Section */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  📊 Gerar Relatório Consolidado de ROI
                </h3>
                <p className="text-gray-600 mb-4">
                  Compile todos os projetos em um relatório profissional com análise 
                  comparativa, métricas consolidadas e detalhamento completo.
                </p>
                {projects.length > 0 && (
                  <div className="flex items-center justify-center mb-4 text-sm text-blue-700">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    <span className="font-medium">
                      {projects.length} projeto{projects.length > 1 ? 's' : ''} no portfólio | 
                      ROI médio: {(projects.reduce((sum, p) => sum + (p.results?.roi || 0), 0) / projects.length).toFixed(1)}%
                    </span>
                  </div>
                )}
                <Button 
                  onClick={generateReport} 
                  disabled={projects.length === 0}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg px-8 py-3 h-auto"
                  size="lg"
                >
                  <FileText className="mr-3 h-6 w-6" />
                  Gerar Relatório Consolidado
                </Button>
                {projects.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Adicione pelo menos um projeto para gerar o relatório
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ROICalculator;
