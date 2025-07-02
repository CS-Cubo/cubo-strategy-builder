
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, DollarSign, Calendar, FileText, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ROIData {
  investmentAmount: number;
  timeframe: number;
  expectedRevenue: number;
  expectedCosts: number;
  riskLevel: "Baixo" | "Médio" | "Alto";
  projectName: string;
  projectDescription: string;
}

const ROICalculator = () => {
  const [data, setData] = useState<ROIData>({
    investmentAmount: 0,
    timeframe: 12,
    expectedRevenue: 0,
    expectedCosts: 0,
    riskLevel: "Médio",
    projectName: "",
    projectDescription: ""
  });

  const [results, setResults] = useState<{
    roi: number;
    netProfit: number;
    breakEvenMonths: number;
    monthlyReturn: number;
    riskAdjustedROI: number;
  } | null>(null);

  const { toast } = useToast();

  const calculateROI = () => {
    if (!data.projectName) {
      toast({
        title: "Nome do projeto obrigatório",
        description: "Insira o nome do projeto para continuar.",
        variant: "destructive"
      });
      return;
    }

    if (data.investmentAmount <= 0) {
      toast({
        title: "Investimento inválido",
        description: "O valor do investimento deve ser maior que zero.",
        variant: "destructive"
      });
      return;
    }

    const netProfit = data.expectedRevenue - data.expectedCosts - data.investmentAmount;
    const roi = ((netProfit / data.investmentAmount) * 100);
    const breakEvenMonths = data.investmentAmount / ((data.expectedRevenue - data.expectedCosts) / data.timeframe);
    const monthlyReturn = netProfit / data.timeframe;
    
    // Risk adjustment factors
    const riskFactors = {
      "Baixo": 0.95,
      "Médio": 0.85,
      "Alto": 0.70
    };
    
    const riskAdjustedROI = roi * riskFactors[data.riskLevel];

    setResults({
      roi,
      netProfit,
      breakEvenMonths: Math.max(0, breakEvenMonths),
      monthlyReturn,
      riskAdjustedROI
    });

    toast({
      title: "Cálculo realizado!",
      description: "Os resultados do ROI foram calculados com sucesso.",
    });
  };

  const generateReport = () => {
    if (!results) {
      toast({
        title: "Calcule primeiro",
        description: "Execute o cálculo de ROI antes de gerar o relatório.",
        variant: "destructive"
      });
      return;
    }

    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de ROI - ${data.projectName}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              margin: 2rem; 
              color: #1f2937; 
              line-height: 1.6;
              background: #fafafa;
            }
            .container {
              max-width: 1000px;
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
            .metrics-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 2rem;
              margin: 2rem 0;
            }
            .metric-card {
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              padding: 2rem;
              border-radius: 12px;
              border: 1px solid #e2e8f0;
              text-align: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .metric-value {
              font-size: 2rem;
              font-weight: 700;
              margin-bottom: 0.5rem;
            }
            .metric-label {
              font-size: 0.875rem;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.05em;
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
            .risk-badge {
              display: inline-block;
              padding: 0.5rem 1rem;
              border-radius: 9999px;
              font-size: 0.875rem;
              font-weight: 600;
              text-transform: uppercase;
            }
            .risk-baixo { background-color: #dcfce7; color: #166534; }
            .risk-medio { background-color: #fef3c7; color: #92400e; }
            .risk-alto { background-color: #fee2e2; color: #991b1b; }
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
                <h1 style="margin: 0; color: #374151; font-size: 2rem;">Análise de ROI</h1>
                <p style="margin: 0; color: #6b7280; font-size: 1.125rem;">Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            
            <div class="section">
              <h2 style="color: #374151; margin-bottom: 1rem; font-size: 1.5rem;">📊 Informações do Projeto</h2>
              <h3 style="font-size: 1.25rem; color: #1f2937; margin-bottom: 0.5rem;">${data.projectName}</h3>
              <p style="color: #6b7280; margin-bottom: 1rem;">${data.projectDescription || 'Nenhuma descrição fornecida'}</p>
              <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                <span><strong>Prazo:</strong> ${data.timeframe} meses</span>
                <span class="risk-badge risk-${data.riskLevel.toLowerCase()}">Risco ${data.riskLevel}</span>
              </div>
            </div>

            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value ${results.roi >= 0 ? 'positive' : 'negative'}">
                  ${results.roi.toFixed(1)}%
                </div>
                <div class="metric-label">ROI Bruto</div>
              </div>
              
              <div class="metric-card">
                <div class="metric-value ${results.riskAdjustedROI >= 0 ? 'positive' : 'negative'}">
                  ${results.riskAdjustedROI.toFixed(1)}%
                </div>
                <div class="metric-label">ROI Ajustado ao Risco</div>
              </div>
              
              <div class="metric-card">
                <div class="metric-value ${results.netProfit >= 0 ? 'positive' : 'negative'}">
                  R$ ${results.netProfit.toLocaleString('pt-BR')}
                </div>
                <div class="metric-label">Lucro Líquido</div>
              </div>
              
              <div class="metric-card">
                <div class="metric-value neutral">
                  ${results.breakEvenMonths.toFixed(1)}
                </div>
                <div class="metric-label">Payback (meses)</div>
              </div>
              
              <div class="metric-card">
                <div class="metric-value positive">
                  R$ ${results.monthlyReturn.toLocaleString('pt-BR')}
                </div>
                <div class="metric-label">Retorno Mensal</div>
              </div>
              
              <div class="metric-card">
                <div class="metric-value neutral">
                  R$ ${data.investmentAmount.toLocaleString('pt-BR')}
                </div>
                <div class="metric-label">Investimento Total</div>
              </div>
            </div>

            <div class="section">
              <h2 style="color: #374151; margin-bottom: 1rem; font-size: 1.5rem;">💰 Resumo Financeiro</h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div>
                  <h4 style="color: #059669; margin: 0.5rem 0;">Receitas Projetadas</h4>
                  <p style="font-size: 1.25rem; margin: 0;">R$ ${data.expectedRevenue.toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <h4 style="color: #dc2626; margin: 0.5rem 0;">Custos Operacionais</h4>
                  <p style="font-size: 1.25rem; margin: 0;">R$ ${data.expectedCosts.toLocaleString('pt-BR')}</p>
                </div>
              </div>
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
              Analise o retorno sobre investimento de seus projetos estratégicos.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Dados do Projeto</span>
            </CardTitle>
            <CardDescription>
              Insira as informações financeiras do seu projeto para calcular o ROI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="projectName">Nome do Projeto *</Label>
                <Input
                  id="projectName"
                  value={data.projectName}
                  onChange={(e) => setData({ ...data, projectName: e.target.value })}
                  placeholder="Ex: Implementação de CRM"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="projectDescription">Descrição do Projeto</Label>
                <Input
                  id="projectDescription"
                  value={data.projectDescription}
                  onChange={(e) => setData({ ...data, projectDescription: e.target.value })}
                  placeholder="Breve descrição do projeto..."
                />
              </div>

              <div>
                <Label htmlFor="investment">Investimento Inicial (R$)</Label>
                <Input
                  id="investment"
                  type="number"
                  value={data.investmentAmount || ""}
                  onChange={(e) => setData({ ...data, investmentAmount: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="timeframe">Prazo (meses)</Label>
                <Input
                  id="timeframe"
                  type="number"
                  value={data.timeframe}
                  onChange={(e) => setData({ ...data, timeframe: Number(e.target.value) })}
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="revenue">Receita Esperada (R$)</Label>
                <Input
                  id="revenue"
                  type="number"
                  value={data.expectedRevenue || ""}
                  onChange={(e) => setData({ ...data, expectedRevenue: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="costs">Custos Operacionais (R$)</Label>
                <Input
                  id="costs"
                  type="number"
                  value={data.expectedCosts || ""}
                  onChange={(e) => setData({ ...data, expectedCosts: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="risk">Nível de Risco</Label>
                <Select 
                  value={data.riskLevel} 
                  onValueChange={(value: "Baixo" | "Médio" | "Alto") => setData({ ...data, riskLevel: value })}
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

            <Button onClick={calculateROI} className="w-full bg-gradient-to-r from-corporate-600 to-innovation-600" size="lg">
              <Calculator className="mr-2 h-5 w-5" />
              Calcular ROI
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {results && (
            <>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Resultados da Análise</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-700">
                        {results.roi.toFixed(1)}%
                      </div>
                      <div className="text-sm text-green-600">ROI Bruto</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">
                        {results.riskAdjustedROI.toFixed(1)}%
                      </div>
                      <div className="text-sm text-blue-600">ROI Ajustado</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
                      <div className="text-lg font-bold text-purple-700">
                        R$ {results.netProfit.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-sm text-purple-600">Lucro Líquido</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                      <div className="text-lg font-bold text-orange-700">
                        {results.breakEvenMonths.toFixed(1)} meses
                      </div>
                      <div className="text-sm text-orange-600">Payback</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        Retorno Mensal Médio
                      </div>
                      <div className="text-2xl font-bold text-success-600">
                        R$ {results.monthlyReturn.toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <TrendingUp className="h-10 w-10 text-success-600" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Enhanced Report Generation Section */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  📊 Gerar Relatório Profissional de ROI
                </h3>
                <p className="text-gray-600 mb-4">
                  Compile todos os cálculos em um relatório detalhado e profissional 
                  com métricas completas, análise de risco e projeções financeiras.
                </p>
                {results && (
                  <div className="flex items-center justify-center mb-4 text-sm text-blue-700">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    <span className="font-medium">
                      ROI calculado: {results.roi.toFixed(1)}% | Payback: {results.breakEvenMonths.toFixed(1)} meses
                    </span>
                  </div>
                )}
                <Button 
                  onClick={generateReport} 
                  disabled={!results}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg px-8 py-3 h-auto"
                  size="lg"
                >
                  <FileText className="mr-3 h-6 w-6" />
                  Gerar Relatório Completo de ROI
                </Button>
                {!results && (
                  <p className="text-sm text-gray-500 mt-2">
                    Execute o cálculo de ROI primeiro para gerar o relatório
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
