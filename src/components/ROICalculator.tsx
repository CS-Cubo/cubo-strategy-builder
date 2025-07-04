
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calculator, Trash2, HelpCircle, Plus, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/hooks/useSession";
import { useROIStorage } from "@/hooks/useROIStorage";
import AccessCodeInput from "./AccessCodeInput";

interface SimpleProject {
  id?: string;
  projectName: string;
  contractValue: number;
  projectDescription: string;
  expectedROI: number;
  calculatedReturn?: number;
}

interface StrategicProject {
  id?: string;
  projectName: string;
  projectDescription: string;
  expectedInvestment: number;
  expectedReturn: number;
  cashFlowPeriod: number;
  scenario: "Conservador" | "Realista" | "Otimista";
  npv?: number;
  irr?: number;
  paybackPeriod?: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

const ROICalculator = () => {
  const { sessionId, accessCode, isLoading: sessionLoading, createOrLoadSession, clearSession, hasSession } = useSession();
  const { projects: dbProjects, saveProject, deleteProject, isLoading: storageLoading } = useROIStorage(sessionId);
  
  const [activeTab, setActiveTab] = useState("simple");
  const [simpleProjects, setSimpleProjects] = useState<SimpleProject[]>([]);
  const [strategicProjects, setStrategicProjects] = useState<StrategicProject[]>([]);
  
  const [simpleForm, setSimpleForm] = useState<SimpleProject>({
    projectName: "",
    contractValue: 0,
    projectDescription: "",
    expectedROI: 0
  });

  const [strategicForm, setStrategicForm] = useState<StrategicProject>({
    projectName: "",
    projectDescription: "",
    expectedInvestment: 0,
    expectedReturn: 0,
    cashFlowPeriod: 12,
    scenario: "Realista"
  });

  const { toast } = useToast();

  // Load projects from database when they become available
  useEffect(() => {
    if (dbProjects && dbProjects.length > 0) {
      const simple: SimpleProject[] = [];
      const strategic: StrategicProject[] = [];

      dbProjects.forEach(project => {
        if (project.calculation_model === "Simples") {
          simple.push({
            id: project.id,
            projectName: project.project_name,
            contractValue: Number(project.investment_amount),
            projectDescription: project.project_description || "",
            expectedROI: Number(project.estimated_roi || 0),
            calculatedReturn: Number(project.expected_revenue || 0)
          });
        } else if (project.calculation_model === "Estratégico") {
          strategic.push({
            id: project.id,
            projectName: project.project_name,
            projectDescription: project.project_description || "",
            expectedInvestment: Number(project.investment_amount),
            expectedReturn: Number(project.expected_revenue || 0),
            cashFlowPeriod: Number(project.timeframe || 12),
            scenario: (project.risk_level === "Baixo" ? "Conservador" : 
                     project.risk_level === "Médio" ? "Realista" : "Otimista") as "Conservador" | "Realista" | "Otimista",
            npv: Number(project.net_profit || 0),
            irr: Number(project.roi_result || 0),
            paybackPeriod: Number(project.break_even_months || 0)
          });
        }
      });

      setSimpleProjects(simple);
      setStrategicProjects(strategic);
    }
  }, [dbProjects]);

  const calculateSimpleROI = () => {
    if (!simpleForm.projectName) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome do projeto é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    const calculatedReturn = (simpleForm.contractValue * simpleForm.expectedROI) / 100;
    const newProject = {
      ...simpleForm,
      calculatedReturn,
      id: Date.now().toString()
    };
    
    setSimpleProjects(prev => [...prev, newProject]);
    
    // Save to database
    if (hasSession) {
      const projectData = {
        project_name: newProject.projectName,
        project_description: newProject.projectDescription,
        investment_amount: newProject.contractValue,
        expected_revenue: calculatedReturn,
        estimated_roi: newProject.expectedROI,
        calculation_model: "Simples",
        risk_level: "Baixo",
        roi_result: newProject.expectedROI
      };
      saveProject(projectData);
    }

    // Reset form
    setSimpleForm({
      projectName: "",
      contractValue: 0,
      projectDescription: "",
      expectedROI: 0
    });

    toast({
      title: "Projeto adicionado!",
      description: "Projeto calculado e adicionado à lista.",
    });
  };

  const calculateStrategicROI = () => {
    if (!strategicForm.projectName) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome do projeto é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    // Apply scenario adjustments
    let adjustedReturn = strategicForm.expectedReturn;
    switch (strategicForm.scenario) {
      case "Conservador":
        adjustedReturn = strategicForm.expectedReturn * 0.85;
        break;
      case "Otimista":
        adjustedReturn = strategicForm.expectedReturn * 1.15;
        break;
      default: // Realista
        adjustedReturn = strategicForm.expectedReturn;
    }

    // Simple NPV calculation (assuming monthly cash flows)
    const monthlyReturn = adjustedReturn / strategicForm.cashFlowPeriod;
    const discountRate = 0.01; // 1% monthly discount rate
    
    let npv = -strategicForm.expectedInvestment;
    for (let i = 1; i <= strategicForm.cashFlowPeriod; i++) {
      npv += monthlyReturn / Math.pow(1 + discountRate, i);
    }

    // Simple IRR approximation
    const totalReturn = adjustedReturn - strategicForm.expectedInvestment;
    const irr = (Math.pow(adjustedReturn / strategicForm.expectedInvestment, 1 / (strategicForm.cashFlowPeriod / 12)) - 1) * 100;

    // Payback period calculation
    const paybackPeriod = strategicForm.expectedInvestment / monthlyReturn;

    const newProject = {
      ...strategicForm,
      npv,
      irr,
      paybackPeriod,
      id: Date.now().toString()
    };
    
    setStrategicProjects(prev => [...prev, newProject]);

    // Save to database
    if (hasSession) {
      const projectData = {
        project_name: newProject.projectName,
        project_description: newProject.projectDescription,
        investment_amount: newProject.expectedInvestment,
        expected_revenue: adjustedReturn,
        estimated_roi: newProject.irr || 0,
        calculation_model: "Estratégico",
        risk_level: newProject.scenario === "Conservador" ? "Baixo" : newProject.scenario === "Realista" ? "Médio" : "Alto",
        roi_result: newProject.irr,
        net_profit: npv,
        break_even_months: paybackPeriod,
        timeframe: newProject.cashFlowPeriod
      };
      saveProject(projectData);
    }

    // Reset form
    setStrategicForm({
      projectName: "",
      projectDescription: "",
      expectedInvestment: 0,
      expectedReturn: 0,
      cashFlowPeriod: 12,
      scenario: "Realista"
    });

    toast({
      title: "Projeto adicionado!",
      description: "Análise estratégica calculada e adicionada à lista.",
    });
  };

  const removeSimpleProject = (id: string) => {
    setSimpleProjects(prev => prev.filter(p => p.id !== id));
    if (hasSession) {
      deleteProject(id);
    }
  };

  const removeStrategicProject = (id: string) => {
    setStrategicProjects(prev => prev.filter(p => p.id !== id));
    if (hasSession) {
      deleteProject(id);
    }
  };

  const generateReport = () => {
    const allProjects = [...simpleProjects, ...strategicProjects];
    
    if (allProjects.length === 0) {
      toast({
        title: "Nenhum projeto encontrado",
        description: "Adicione pelo menos um projeto para gerar o relatório.",
        variant: "destructive"
      });
      return;
    }

    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório ROI - ${new Date().toLocaleDateString('pt-BR')}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              margin: 2rem; 
              color: #1f2937; 
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              margin-bottom: 2rem; 
              padding-bottom: 1rem; 
              border-bottom: 2px solid #22c55e; 
            }
            .section { margin-bottom: 2rem; }
            .project { 
              background: #f8fafc; 
              padding: 1rem; 
              margin: 1rem 0; 
              border-radius: 8px; 
              border-left: 4px solid #22c55e; 
            }
            .project h3 { margin: 0 0 0.5rem 0; color: #059669; }
            .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1rem 0; }
            .metric { background: white; padding: 1rem; border-radius: 6px; text-align: center; }
            .metric .value { font-size: 1.5rem; font-weight: bold; color: #059669; }
            .metric .label { font-size: 0.875rem; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório de ROI</h1>
            <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          </div>
          
          ${simpleProjects.length > 0 ? `
          <div class="section">
            <h2>Projetos Simples</h2>
            ${simpleProjects.map(project => `
              <div class="project">
                <h3>${project.projectName}</h3>
                <p><strong>Descrição:</strong> ${project.projectDescription}</p>
                <div class="metrics">
                  <div class="metric">
                    <div class="value">${formatCurrency(project.contractValue)}</div>
                    <div class="label">Valor do Contrato</div>
                  </div>
                  <div class="metric">
                    <div class="value">${project.expectedROI}%</div>
                    <div class="label">ROI Esperado</div>
                  </div>
                  <div class="metric">
                    <div class="value">${formatCurrency(project.calculatedReturn || 0)}</div>
                    <div class="label">Retorno Calculado</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          ${strategicProjects.length > 0 ? `
          <div class="section">
            <h2>Projetos Estratégicos</h2>
            ${strategicProjects.map(project => `
              <div class="project">
                <h3>${project.projectName}</h3>
                <p><strong>Descrição:</strong> ${project.projectDescription}</p>
                <p><strong>Cenário:</strong> ${project.scenario}</p>
                <div class="metrics">
                  <div class="metric">
                    <div class="value">${formatCurrency(project.expectedInvestment)}</div>
                    <div class="label">Investimento</div>
                  </div>
                  <div class="metric">
                    <div class="value">${formatCurrency(project.npv || 0)}</div>
                    <div class="label">NPV</div>
                  </div>
                  <div class="metric">
                    <div class="value">${(project.irr || 0).toFixed(1)}%</div>
                    <div class="label">TIR</div>
                  </div>
                  <div class="metric">
                    <div class="value">${(project.paybackPeriod || 0).toFixed(1)} meses</div>
                    <div class="label">Payback</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          ` : ''}
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
            <Calculator className="h-10 w-10" />
            <div>
              <h1 className="text-3xl font-bold">Calculadora de ROI</h1>
              <p className="text-xl opacity-90">
                Calcule o retorno sobre investimento dos seus projetos.
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
    <TooltipProvider>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-success rounded-2xl p-8 text-white">
          <div className="flex items-center space-x-4 mb-4">
            <Calculator className="h-10 w-10" />
            <div>
              <h1 className="text-3xl font-bold">Calculadora de ROI</h1>
              <p className="text-xl opacity-90">
                Calcule o retorno sobre investimento dos seus projetos.
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculator Forms */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Calculadora de ROI</CardTitle>
                <CardDescription>
                  Escolha entre análise simples ou estratégica para seus projetos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="simple">Simples</TabsTrigger>
                    <TabsTrigger value="strategic">Estratégico</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="simple" className="space-y-4">
                    <div>
                      <Label htmlFor="simple-name">Nome do Projeto</Label>
                      <Input
                        id="simple-name"
                        value={simpleForm.projectName}
                        onChange={(e) => setSimpleForm({...simpleForm, projectName: e.target.value})}
                        placeholder="Nome do projeto"
                      />
                    </div>
                    <div>
                      <Label htmlFor="simple-value">Valor do Contrato</Label>
                      <Input
                        id="simple-value"
                        type="number"
                        value={simpleForm.contractValue}
                        onChange={(e) => setSimpleForm({...simpleForm, contractValue: Number(e.target.value)})}
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="simple-description">Descrição do Projeto</Label>
                      <Textarea
                        id="simple-description"
                        value={simpleForm.projectDescription}
                        onChange={(e) => setSimpleForm({...simpleForm, projectDescription: e.target.value})}
                        placeholder="Descreva o projeto..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="simple-roi">Expected ROI (%)</Label>
                      <Input
                        id="simple-roi"
                        type="number"
                        value={simpleForm.expectedROI}
                        onChange={(e) => setSimpleForm({...simpleForm, expectedROI: Number(e.target.value)})}
                        placeholder="0"
                      />
                    </div>
                    <Button onClick={calculateSimpleROI} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Projeto
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="strategic" className="space-y-4">
                    <div>
                      <Label htmlFor="strategic-name">Nome do Projeto</Label>
                      <Input
                        id="strategic-name"
                        value={strategicForm.projectName}
                        onChange={(e) => setStrategicForm({...strategicForm, projectName: e.target.value})}
                        placeholder="Nome do projeto"
                      />
                    </div>
                    <div>
                      <Label htmlFor="strategic-description">Descrição do Projeto</Label>
                      <Textarea
                        id="strategic-description"
                        value={strategicForm.projectDescription}
                        onChange={(e) => setStrategicForm({...strategicForm, projectDescription: e.target.value})}
                        placeholder="Descreva o projeto..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="strategic-investment">Investimento Esperado</Label>
                      <Input
                        id="strategic-investment"
                        type="number"
                        value={strategicForm.expectedInvestment}
                        onChange={(e) => setStrategicForm({...strategicForm, expectedInvestment: Number(e.target.value)})}
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="strategic-return">Retorno Esperado</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs p-3 bg-gray-800 text-white rounded-lg shadow-lg">
                            <p>O retorno esperado deve ser o valor total que você espera receber do projeto durante todo o período, incluindo receitas e ganhos.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="strategic-return"
                        type="number"
                        value={strategicForm.expectedReturn}
                        onChange={(e) => setStrategicForm({...strategicForm, expectedReturn: Number(e.target.value)})}
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="strategic-period">Fluxos de Caixa (Período em meses)</Label>
                      <Input
                        id="strategic-period"
                        type="number"
                        value={strategicForm.cashFlowPeriod}
                        onChange={(e) => setStrategicForm({...strategicForm, cashFlowPeriod: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>Cenário</Label>
                      <Select value={strategicForm.scenario} onValueChange={(value: "Conservador" | "Realista" | "Otimista") => setStrategicForm({...strategicForm, scenario: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Conservador">Conservador (-15%)</SelectItem>
                          <SelectItem value="Realista">Realista (0%)</SelectItem>
                          <SelectItem value="Otimista">Otimista (+15%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={calculateStrategicROI} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Projeto
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Projects Panel */}
          <div className="space-y-6">
            {/* Simple Projects */}
            {simpleProjects.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Projetos Simples</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {simpleProjects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm truncate">{project.projectName}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSimpleProject(project.id!)}
                          className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>Contrato: {formatCurrency(project.contractValue)}</p>
                        <p>ROI: {project.expectedROI}%</p>
                        <p className="font-medium text-green-600">
                          Retorno: {formatCurrency(project.calculatedReturn || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Strategic Projects */}
            {strategicProjects.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Projetos Estratégicos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {strategicProjects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm truncate">{project.projectName}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStrategicProject(project.id!)}
                          className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>Investimento: {formatCurrency(project.expectedInvestment)}</p>
                        <p>Cenário: {project.scenario}</p>
                        <div className="flex items-center space-x-1">
                          <span>NPV: {formatCurrency(project.npv || 0)}</span>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs p-3 bg-gray-800 text-white rounded-lg shadow-lg">
                              <p>Valor Presente Líquido: diferença entre entradas e saídas de caixa descontadas a uma taxa de 1% ao mês.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>TIR: {(project.irr || 0).toFixed(1)}%</span>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3 w-3" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs p-3 bg-gray-800 text-white rounded-lg shadow-lg">
                              <p>Taxa Interna de Retorno: taxa que torna o NPV igual a zero. Calculada com base no retorno esperado ajustado pelo cenário.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p>Payback: {(project.paybackPeriod || 0).toFixed(1)} meses</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Report Button */}
            {(simpleProjects.length > 0 || strategicProjects.length > 0) && (
              <Button onClick={generateReport} className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ROICalculator;
