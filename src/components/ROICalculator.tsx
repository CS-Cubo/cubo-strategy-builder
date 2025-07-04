import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/hooks/useSession";
import { useROIStorage } from "@/hooks/useROIStorage";
import AccessCodeInput from "./AccessCodeInput";

const ROICalculator = () => {
  const { sessionId, accessCode, isLoading: sessionLoading, createOrLoadSession, clearSession, hasSession } = useSession();
  const { projects, saveProject, deleteProject, isLoading: storageLoading } = useROIStorage(sessionId);
  
  const [formData, setFormData] = useState({
    projectName: "",
    projectDescription: "",
    investmentAmount: 10000,
    timeframe: 12,
    expectedRevenue: 0,
    operationalCosts: 0,
    estimatedROI: 0,
    riskLevel: "Médio",
    calculationModel: "Conservador"
  });

  const [result, setResult] = useState<{
    roi: number;
    netProfit: number;
    breakEvenMonths: number;
    monthlyReturn: number;
    riskAdjustedROI: number;
  } | null>(null);

  const { toast } = useToast();

  const calculateROI = () => {
    const { investmentAmount, expectedRevenue, operationalCosts } = formData;

    const netProfit = expectedRevenue - operationalCosts;
    const roi = ((netProfit - investmentAmount) / investmentAmount) * 100;

    // Break-even point calculation (simplified)
    const monthlyRevenue = expectedRevenue / formData.timeframe;
    const monthlyCosts = operationalCosts / formData.timeframe;
    const breakEvenMonths = investmentAmount / (monthlyRevenue - monthlyCosts);

    // Monthly return
    const monthlyReturn = netProfit / formData.timeframe;

    // Risk-adjusted ROI (example: subtract risk percentage from ROI)
    let riskFactor = 0;
    switch (formData.riskLevel) {
      case "Alto":
        riskFactor = 0.2;
        break;
      case "Médio":
        riskFactor = 0.1;
        break;
      case "Baixo":
        riskFactor = 0.05;
        break;
      default:
        riskFactor = 0.1;
    }
    const riskAdjustedROI = roi * (1 - riskFactor);

    setResult({
      roi: roi,
      netProfit: netProfit,
      breakEvenMonths: breakEvenMonths,
      monthlyReturn: monthlyReturn,
      riskAdjustedROI: riskAdjustedROI
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Auto-save functionality
  useEffect(() => {
    if (hasSession && result && formData.projectName) {
      const projectData = {
        project_name: formData.projectName,
        project_description: formData.projectDescription,
        investment_amount: formData.investmentAmount,
        timeframe: formData.timeframe,
        expected_revenue: formData.expectedRevenue,
        expected_costs: formData.operationalCosts,
        estimated_roi: formData.estimatedROI,
        risk_level: formData.riskLevel,
        calculation_model: formData.calculationModel,
        roi_result: result.roi,
        net_profit: result.netProfit,
        break_even_months: result.breakEvenMonths,
        monthly_return: result.monthlyReturn,
        risk_adjusted_roi: result.riskAdjustedROI
      };

      // Debounce the save operation
      const timeoutId = setTimeout(() => {
        saveProject(projectData);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [result, formData, hasSession, saveProject]);

  const loadProject = (project: any) => {
    setFormData({
      projectName: project.project_name,
      projectDescription: project.project_description || "",
      investmentAmount: project.investment_amount,
      timeframe: project.timeframe || 12,
      expectedRevenue: project.expected_revenue || 0,
      operationalCosts: project.expected_costs || 0,
      estimatedROI: project.estimated_roi || 0,
      riskLevel: project.risk_level,
      calculationModel: project.calculation_model
    });

    if (project.roi_result) {
      setResult({
        roi: project.roi_result,
        netProfit: project.net_profit || 0,
        breakEvenMonths: project.break_even_months || 0,
        monthlyReturn: project.monthly_return || 0,
        riskAdjustedROI: project.risk_adjusted_roi || 0
      });
    }

    toast({
      title: "Projeto carregado!",
      description: `Projeto "${project.project_name}" foi carregado com sucesso.`,
    });
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

      {/* Saved Projects */}
      {projects.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Projetos Salvos</CardTitle>
            <CardDescription>
              Clique em um projeto para carregá-lo ou excluí-lo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {project.project_name}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => project.id && deleteProject(project.id)}
                      className="text-red-600 hover:text-red-800 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {project.project_description || "Sem descrição"}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-600">
                      ROI: {project.roi_result ? `${project.roi_result.toFixed(1)}%` : 'N/A'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadProject(project)}
                    >
                      Carregar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ROI Calculator Form */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Configuração do Projeto</CardTitle>
          <CardDescription>
            Insira os dados do seu projeto para calcular o ROI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="projectName">Nome do Projeto</Label>
            <Input
              type="text"
              id="projectName"
              value={formData.projectName}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="projectDescription">Descrição do Projeto</Label>
            <Textarea
              id="projectDescription"
              value={formData.projectDescription}
              onChange={handleInputChange}
              placeholder="Detalhes sobre o projeto..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="investmentAmount">Investimento Inicial (R$)</Label>
            <Input
              type="number"
              id="investmentAmount"
              value={formData.investmentAmount}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="timeframe">Período (meses)</Label>
            <Input
              type="number"
              id="timeframe"
              value={formData.timeframe}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="expectedRevenue">Receita Esperada (R$)</Label>
            <Input
              type="number"
              id="expectedRevenue"
              value={formData.expectedRevenue}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="operationalCosts">Custos Operacionais (R$)</Label>
            <Input
              type="number"
              id="operationalCosts"
              value={formData.operationalCosts}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="riskLevel">Nível de Risco</Label>
            <Select id="riskLevel" value={formData.riskLevel} onValueChange={(value) => setFormData({ ...formData, riskLevel: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível de risco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Baixo">Baixo</SelectItem>
                <SelectItem value="Médio">Médio</SelectItem>
                <SelectItem value="Alto">Alto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="calculationModel">Modelo de Cálculo</Label>
            <Select id="calculationModel" value={formData.calculationModel} onValueChange={(value) => setFormData({ ...formData, calculationModel: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o modelo de cálculo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Conservador">Conservador</SelectItem>
                <SelectItem value="Realista">Realista</SelectItem>
                <SelectItem value="Otimista">Otimista</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={calculateROI} className="w-full">
            Calcular ROI
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
            <CardDescription>
              Análise detalhada do retorno sobre investimento do projeto.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>ROI (Retorno sobre Investimento)</Label>
              <Input value={`${result.roi.toFixed(2)}%`} readOnly />
            </div>
            <div>
              <Label>Lucro Líquido</Label>
              <Input value={`R$ ${result.netProfit.toFixed(2)}`} readOnly />
            </div>
            <div>
              <Label>Ponto de Equilíbrio (Break-even)</Label>
              <Input value={`${result.breakEvenMonths.toFixed(1)} meses`} readOnly />
            </div>
            <div>
              <Label>Retorno Mensal</Label>
              <Input value={`R$ ${result.monthlyReturn.toFixed(2)}`} readOnly />
            </div>
            <div>
              <Label>ROI Ajustado ao Risco</Label>
              <Input value={`${result.riskAdjustedROI.toFixed(2)}%`} readOnly />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ROICalculator;
