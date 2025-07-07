import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { TrendingUp, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBenchmarkCache } from '@/hooks/useBenchmarkCache';
import { useClickCounter } from '@/hooks/useClickCounter';
import { useSession } from '@/hooks/useSession';

interface CalculationResult {
  roi: number | null;
  netProfit: number | null;
  breakEvenMonths: number | null;
  monthlyReturn: number | null;
  riskAdjustedRoi: number | null;
}

const ROICalculator = () => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState<number>(10000);
  const [timeframe, setTimeframe] = useState<number>(12);
  const [expectedRevenue, setExpectedRevenue] = useState<number>(15000);
  const [expectedCosts, setExpectedCosts] = useState<number>(5000);
  const [riskLevel, setRiskLevel] = useState('Médio');
  const [calculationModel, setCalculationModel] = useState('Simples');
  const [benchmarkData, setBenchmarkData] = useState<string | null>(null);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);
  const [roiResult, setRoiResult] = useState<CalculationResult>({
    roi: null,
    netProfit: null,
    breakEvenMonths: null,
    monthlyReturn: null,
    riskAdjustedRoi: null,
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();
  const { sessionId } = useSession();
  const { getCachedData, setCachedData } = useBenchmarkCache();
  const { incrementBenchmarkClicks } = useClickCounter(sessionId);

  useEffect(() => {
    if (sessionId) {
      // console.log("Session ID:", sessionId);
    }
  }, [sessionId]);

  const calculateROI = async () => {
    setIsCalculating(true);

    // Validate inputs
    if (!projectName.trim()) {
      toast({
        title: "Nome do projeto necessário",
        description: "Por favor, insira o nome do projeto.",
        variant: "destructive"
      });
      setIsCalculating(false);
      return;
    }

    try {
      let calculatedROI: number;
      let calculatedNetProfit: number;
      let calculatedBreakEvenMonths: number;
      let calculatedMonthlyReturn: number;
      let calculatedRiskAdjustedRoi: number;

      // Perform calculations based on the selected model
      if (calculationModel === 'Simples') {
        calculatedNetProfit = expectedRevenue - expectedCosts - investmentAmount;
        calculatedROI = ((calculatedNetProfit / investmentAmount) * 100);
        calculatedBreakEvenMonths = investmentAmount / (calculatedNetProfit / timeframe);
        calculatedMonthlyReturn = calculatedNetProfit / timeframe;
        calculatedRiskAdjustedRoi = calculatedROI * getRiskAdjustmentFactor(riskLevel);
      } else {
        // Complex calculation logic here (can be expanded)
        calculatedNetProfit = expectedRevenue - expectedCosts - investmentAmount;
        calculatedROI = ((calculatedNetProfit / investmentAmount) * 100);
        calculatedBreakEvenMonths = investmentAmount / (calculatedNetProfit / timeframe);
        calculatedMonthlyReturn = calculatedNetProfit / timeframe;
        calculatedRiskAdjustedRoi = calculatedROI * getRiskAdjustmentFactor(riskLevel);
      }

      setRoiResult({
        roi: calculatedROI,
        netProfit: calculatedNetProfit,
        breakEvenMonths: calculatedBreakEvenMonths,
        monthlyReturn: calculatedMonthlyReturn,
        riskAdjustedRoi: calculatedRiskAdjustedRoi,
      });

      // Save to Supabase
      if (sessionId) {
        const { data, error } = await supabase
          .from('roi_projects')
          .insert([
            {
              session_id: sessionId,
              project_name: projectName,
              project_description: projectDescription,
              investment_amount: investmentAmount,
              timeframe: timeframe,
              expected_revenue: expectedRevenue,
              expected_costs: expectedCosts,
              risk_level: riskLevel,
              calculation_model: calculationModel,
              roi_result: calculatedROI,
              net_profit: calculatedNetProfit,
              break_even_months: calculatedBreakEvenMonths,
              monthly_return: calculatedMonthlyReturn,
              risk_adjusted_roi: calculatedRiskAdjustedRoi,
            },
          ]);

        if (error) {
          console.error('Erro ao salvar no Supabase:', error);
          toast({
            title: "Erro",
            description: "Erro ao salvar os resultados. Tente novamente.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Resultados salvos!",
            description: "Seus resultados foram salvos com sucesso.",
          });
        }
      } else {
        toast({
          title: "Atenção",
          description: "Resultados não estão sendo salvos. Insira um código de acesso.",
          variant: "warning"
        });
      }
    } catch (error) {
      console.error('Erro ao calcular o ROI:', error);
      toast({
        title: "Erro",
        description: "Erro ao calcular o ROI. Tente novamente.",
        variant: "destructive"
      });
      setRoiResult({
        roi: null,
        netProfit: null,
        breakEvenMonths: null,
        monthlyReturn: null,
        riskAdjustedRoi: null,
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const getRiskAdjustmentFactor = (risk: string): number => {
    switch (risk) {
      case 'Baixo':
        return 1.2;
      case 'Médio':
        return 1.0;
      case 'Alto':
        return 0.8;
      default:
        return 1.0;
    }
  };

  const fetchBenchmarkData = async () => {
    if (!projectDescription.trim()) {
      toast({
        title: "Descrição necessária",
        description: "Por favor, forneça uma descrição do projeto para obter benchmarks.",
        variant: "destructive"
      });
      return;
    }

    // Verificar cache primeiro
    const cachedData = getCachedData(projectDescription);
    if (cachedData) {
      setBenchmarkData(cachedData);
      return;
    }

    setBenchmarkLoading(true);
    
    try {
      // Incrementar contador de cliques
      await incrementBenchmarkClicks();

      const { data, error } = await supabase.functions.invoke('ai-benchmarks', {
        body: { 
          description: projectDescription,
          type: 'benchmark'
        }
      });

      if (error) {
        console.error('Erro na função:', error);
        toast({
          title: "Erro",
          description: "Erro ao buscar benchmarks. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      if (data?.text) {
        setBenchmarkData(data.text);
        // Salvar no cache
        setCachedData(projectDescription, data.text);
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível obter dados de benchmark.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao buscar benchmarks:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao buscar benchmarks.",
        variant: "destructive"
      });
    } finally {
      setBenchmarkLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Projeto</CardTitle>
          <CardDescription>
            Insira os detalhes do seu projeto para calcular o ROI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="projectName">Nome do Projeto</Label>
            <Input
              id="projectName"
              placeholder="Nome do projeto"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="projectDescription">Descrição do Projeto</Label>
            <Textarea
              id="projectDescription"
              placeholder="Descreva seu projeto"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Financial Inputs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Entradas Financeiras</CardTitle>
          <CardDescription>
            Insira os dados financeiros para calcular o ROI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="investmentAmount">Investimento Inicial</Label>
            <Input
              type="number"
              id="investmentAmount"
              placeholder="R$ 10.000"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="timeframe">Timeframe (Meses)</Label>
            <Slider
              id="timeframe"
              defaultValue={[12]}
              max={60}
              min={1}
              step={1}
              onValueChange={(value) => setTimeframe(value[0])}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {timeframe} meses
            </p>
          </div>
          <div>
            <Label htmlFor="expectedRevenue">Receita Esperada</Label>
            <Input
              type="number"
              id="expectedRevenue"
              placeholder="R$ 15.000"
              value={expectedRevenue}
              onChange={(e) => setExpectedRevenue(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="expectedCosts">Custos Esperados</Label>
            <Input
              type="number"
              id="expectedCosts"
              placeholder="R$ 5.000"
              value={expectedCosts}
              onChange={(e) => setExpectedCosts(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Risk and Model Section */}
      <Card>
        <CardHeader>
          <CardTitle>Risco e Modelo</CardTitle>
          <CardDescription>
            Selecione o nível de risco e o modelo de cálculo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="riskLevel">Nível de Risco</Label>
            <Select onValueChange={setRiskLevel}>
              <SelectTrigger id="riskLevel">
                <SelectValue placeholder="Médio" />
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
            <Select onValueChange={setCalculationModel}>
              <SelectTrigger id="calculationModel">
                <SelectValue placeholder="Simples" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Simples">Simples</SelectItem>
                {/* <SelectItem value="Complexo">Complexo</SelectItem> */}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={calculateROI} disabled={isCalculating} className="w-full">
            {isCalculating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculando...
              </>
            ) : (
              "Calcular ROI"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Benchmark Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Benchmarks de Mercado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="projectDescription">Descrição do Projeto</Label>
            <Textarea
              id="projectDescription"
              placeholder="Descreva seu projeto para obter benchmarks específicos do mercado..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
          
          <Button 
            onClick={fetchBenchmarkData}
            disabled={benchmarkLoading || !projectDescription.trim()}
            className="w-full"
          >
            {benchmarkLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Obter Benchmarks do Mercado
              </>
            )}
          </Button>

          {benchmarkData && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2 text-gray-900">Análise de Benchmarks:</h4>
              <div 
                className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: benchmarkData.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {roiResult.roi !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
            <CardDescription>
              Aqui estão os resultados do seu cálculo de ROI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>ROI</Label>
              <Input value={`${roiResult.roi?.toFixed(2)}%`} readOnly />
            </div>
            <div>
              <Label>Lucro Líquido</Label>
              <Input value={`R$ ${roiResult.netProfit?.toFixed(2)}`} readOnly />
            </div>
            <div>
              <Label>Meses para Break-Even</Label>
              <Input value={roiResult.breakEvenMonths?.toFixed(2)} readOnly />
            </div>
            <div>
              <Label>Retorno Mensal</Label>
              <Input value={`R$ ${roiResult.monthlyReturn?.toFixed(2)}`} readOnly />
            </div>
            <div>
              <Label>ROI Ajustado ao Risco</Label>
              <Input value={`${roiResult.riskAdjustedRoi?.toFixed(2)}%`} readOnly />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ROICalculator;
