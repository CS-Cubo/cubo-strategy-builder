
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { TrendingUp, Search, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBenchmarkCache } from '@/hooks/useBenchmarkCache';
import { useClickCounter } from '@/hooks/useClickCounter';
import { useSession } from '@/hooks/useSession';
import { useROIStorage } from '@/hooks/useROIStorage';

const ROICalculator = () => {
  // Estados para Calculadora Simples
  const [simpleProjectName, setSimpleProjectName] = useState('');
  const [simpleContractValue, setSimpleContractValue] = useState<number>(0);
  const [simpleProjectDescription, setSimpleProjectDescription] = useState('');
  const [simpleExpectedROI, setSimpleExpectedROI] = useState<number>(0);
  const [simpleBenchmarkData, setSimpleBenchmarkData] = useState<string | null>(null);
  const [simpleBenchmarkLoading, setSimpleBenchmarkLoading] = useState(false);

  // Estados para Calculadora Estratégica
  const [strategicName, setStrategicName] = useState('');
  const [strategicDescription, setStrategicDescription] = useState('');
  const [strategicExpectedInvestment, setStrategicExpectedInvestment] = useState<number>(0);
  const [strategicExpectedReturn, setStrategicExpectedReturn] = useState<number>(0);
  const [strategicCashFlow, setStrategicCashFlow] = useState('');
  const [strategicScenario, setStrategicScenario] = useState('');
  const [strategicBenchmarkData, setStrategicBenchmarkData] = useState<string | null>(null);
  const [strategicBenchmarkLoading, setStrategicBenchmarkLoading] = useState(false);

  const { toast } = useToast();
  const { sessionId } = useSession();
  const { getCachedData, setCachedData } = useBenchmarkCache();
  const { incrementBenchmarkClicks } = useClickCounter(sessionId);
  const { projects, isLoading, saveProject, deleteProject } = useROIStorage(sessionId);

  useEffect(() => {
    if (sessionId) {
      console.log("Session ID:", sessionId);
    }
  }, [sessionId]);

  const fetchBenchmarkData = async (description: string, type: 'simple' | 'strategic') => {
    if (!description.trim()) {
      toast({
        title: "Descrição necessária",
        description: "Por favor, forneça uma descrição do projeto para obter benchmarks.",
        variant: "destructive"
      });
      return;
    }

    // Verificar cache primeiro
    const cachedData = getCachedData(description);
    if (cachedData) {
      if (type === 'simple') {
        setSimpleBenchmarkData(cachedData);
      } else {
        setStrategicBenchmarkData(cachedData);
      }
      return;
    }

    if (type === 'simple') {
      setSimpleBenchmarkLoading(true);
    } else {
      setStrategicBenchmarkLoading(true);
    }
    
    try {
      // Incrementar contador de cliques
      await incrementBenchmarkClicks();

      const { data, error } = await supabase.functions.invoke('ai-benchmarks', {
        body: { 
          description: description,
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
        if (type === 'simple') {
          setSimpleBenchmarkData(data.text);
        } else {
          setStrategicBenchmarkData(data.text);
        }
        // Salvar no cache
        setCachedData(description, data.text);
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
      if (type === 'simple') {
        setSimpleBenchmarkLoading(false);
      } else {
        setStrategicBenchmarkLoading(false);
      }
    }
  };

  const saveSimpleProject = async () => {
    if (!sessionId) {
      toast({
        title: "Sessão inválida",
        description: "Por favor, inicie uma sessão para salvar o projeto.",
        variant: "destructive"
      });
      return;
    }

    if (!simpleProjectName.trim()) {
      toast({
        title: "Nome necessário",
        description: "Por favor, insira o nome do projeto.",
        variant: "destructive"
      });
      return;
    }

    const projectData = {
      project_name: simpleProjectName,
      project_description: simpleProjectDescription,
      investment_amount: simpleContractValue,
      expected_revenue: simpleExpectedROI,
      risk_level: 'Baixo',
      calculation_model: 'Simples'
    };

    const result = await saveProject(projectData);
    if (result) {
      // Limpar formulário após salvar
      setSimpleProjectName('');
      setSimpleContractValue(0);
      setSimpleProjectDescription('');
      setSimpleExpectedROI(0);
      setSimpleBenchmarkData(null);
    }
  };

  const saveStrategicProject = async () => {
    if (!sessionId) {
      toast({
        title: "Sessão inválida",
        description: "Por favor, inicie uma sessão para salvar o projeto.",
        variant: "destructive"
      });
      return;
    }

    if (!strategicName.trim()) {
      toast({
        title: "Nome necessário",
        description: "Por favor, insira o nome do projeto.",
        variant: "destructive"
      });
      return;
    }

    const projectData = {
      project_name: strategicName,
      project_description: strategicDescription,
      investment_amount: strategicExpectedInvestment,
      expected_revenue: strategicExpectedReturn,
      risk_level: 'Alto',
      calculation_model: 'Estratégico'
    };

    const result = await saveProject(projectData);
    if (result) {
      // Limpar formulário após salvar
      setStrategicName('');
      setStrategicDescription('');
      setStrategicExpectedInvestment(0);
      setStrategicExpectedReturn(0);
      setStrategicCashFlow('');
      setStrategicScenario('');
      setStrategicBenchmarkData(null);
    }
  };

  const generateReport = () => {
    if (!projects.length) {
      toast({
        title: "Nenhum projeto",
        description: "Adicione pelo menos um projeto para gerar o relatório.",
        variant: "destructive"
      });
      return;
    }

    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de ROI - Projetos</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              margin: 2rem; 
              color: #1f2937; 
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #22c55e; 
              padding-bottom: 1rem; 
              margin-bottom: 2rem; 
            }
            .projects-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 1rem; 
            }
            .projects-table th, .projects-table td { 
              border: 1px solid #e5e7eb; 
              padding: 0.75rem; 
              text-align: left; 
            }
            .projects-table th { 
              background: #f9fafb; 
              font-weight: bold; 
            }
            @media print { 
              body { margin: 0; } 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório de ROI - Projetos</h1>
            <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          
          <h2>Projetos Analisados (${projects.length})</h2>
          <table class="projects-table">
            <thead>
              <tr>
                <th>Nome do Projeto</th>
                <th>Tipo</th>
                <th>Investimento</th>
                <th>Retorno Esperado</th>
                <th>Nível de Risco</th>
                <th>Descrição</th>
              </tr>
            </thead>
            <tbody>
              ${projects.map(project => `
                <tr>
                  <td>${project.project_name}</td>
                  <td>${project.calculation_model}</td>
                  <td>R$ ${project.investment_amount.toLocaleString('pt-BR')}</td>
                  <td>R$ ${(project.expected_revenue || 0).toLocaleString('pt-BR')}</td>
                  <td>${project.risk_level}</td>
                  <td>${project.project_description || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    reportWindow.document.write(html);
    reportWindow.document.close();
    setTimeout(() => {
      reportWindow.print();
    }, 500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calculadora ROI - Lado Esquerdo */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Calculadora de ROI</CardTitle>
            <CardDescription>
              Escolha entre cálculo simples ou estratégico para avaliar o retorno do seu investimento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="simple" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="simple">Simples</TabsTrigger>
                <TabsTrigger value="strategic">Estratégico</TabsTrigger>
              </TabsList>
              
              <TabsContent value="simple" className="space-y-4">
                <div>
                  <Label htmlFor="simpleProjectName">Nome do Projeto</Label>
                  <Input
                    id="simpleProjectName"
                    placeholder="Nome do projeto"
                    value={simpleProjectName}
                    onChange={(e) => setSimpleProjectName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="simpleContractValue">Valor do Contrato</Label>
                  <Input
                    type="number"
                    id="simpleContractValue"
                    placeholder="R$ 10.000"
                    value={simpleContractValue}
                    onChange={(e) => setSimpleContractValue(Number(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="simpleProjectDescription">Descrição do Projeto</Label>
                  <Textarea
                    id="simpleProjectDescription"
                    placeholder="Descreva seu projeto"
                    value={simpleProjectDescription}
                    onChange={(e) => setSimpleProjectDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={() => fetchBenchmarkData(simpleProjectDescription, 'simple')}
                  disabled={simpleBenchmarkLoading || !simpleProjectDescription.trim()}
                  className="w-full"
                >
                  {simpleBenchmarkLoading ? (
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

                {simpleBenchmarkData && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2 text-gray-900">Análise de Benchmarks:</h4>
                    <div 
                      className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: simpleBenchmarkData.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      }}
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="simpleExpectedROI">ROI Esperado (%)</Label>
                  <Input
                    type="number"
                    id="simpleExpectedROI"
                    placeholder="15"
                    value={simpleExpectedROI}
                    onChange={(e) => setSimpleExpectedROI(Number(e.target.value))}
                  />
                </div>
                
                <Button onClick={saveSimpleProject} className="w-full">
                  Salvar Projeto Simples
                </Button>
              </TabsContent>
              
              <TabsContent value="strategic" className="space-y-4">
                <div>
                  <Label htmlFor="strategicName">Nome</Label>
                  <Input
                    id="strategicName"
                    placeholder="Nome do projeto estratégico"
                    value={strategicName}
                    onChange={(e) => setStrategicName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="strategicDescription">Descrição</Label>
                  <Textarea
                    id="strategicDescription"
                    placeholder="Descrição detalhada do projeto estratégico"
                    value={strategicDescription}
                    onChange={(e) => setStrategicDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={() => fetchBenchmarkData(strategicDescription, 'strategic')}
                  disabled={strategicBenchmarkLoading || !strategicDescription.trim()}
                  className="w-full"
                >
                  {strategicBenchmarkLoading ? (
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

                {strategicBenchmarkData && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2 text-gray-900">Análise de Benchmarks:</h4>
                    <div 
                      className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: strategicBenchmarkData.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      }}
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="strategicExpectedInvestment">Investimento Esperado</Label>
                  <Input
                    type="number"
                    id="strategicExpectedInvestment"
                    placeholder="R$ 100.000"
                    value={strategicExpectedInvestment}
                    onChange={(e) => setStrategicExpectedInvestment(Number(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="strategicExpectedReturn">Retorno Esperado</Label>
                  <Input
                    type="number"
                    id="strategicExpectedReturn"
                    placeholder="R$ 150.000"
                    value={strategicExpectedReturn}
                    onChange={(e) => setStrategicExpectedReturn(Number(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="strategicCashFlow">Fluxos de Caixa</Label>
                  <Textarea
                    id="strategicCashFlow"
                    placeholder="Descrição dos fluxos de caixa esperados"
                    value={strategicCashFlow}
                    onChange={(e) => setStrategicCashFlow(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="strategicScenario">Cenário</Label>
                  <Textarea
                    id="strategicScenario"
                    placeholder="Descrição do cenário de investimento"
                    value={strategicScenario}
                    onChange={(e) => setStrategicScenario(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <Button onClick={saveStrategicProject} className="w-full">
                  Salvar Projeto Estratégico
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Projetos Salvos - Lado Direito */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Projetos Salvos ({projects.length})
            </CardTitle>
            <CardDescription>
              {!sessionId 
                ? "Insira um código de acesso no header para ver seus projetos salvos."
                : "Seus projetos ROI salvos aparecerão aqui automaticamente."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!sessionId ? (
              <p className="text-gray-600 text-center py-8">
                Insira um código de acesso no header para ver seus projetos salvos.
              </p>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Carregando projetos...</span>
              </div>
            ) : projects.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                Nenhum projeto salvo ainda. Adicione um projeto usando a calculadora ao lado.
              </p>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{project.project_name}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => project.id && deleteProject(project.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Tipo:</span> {project.calculation_model}
                      </div>
                      <div>
                        <span className="font-medium">Risco:</span> {project.risk_level}
                      </div>
                      <div>
                        <span className="font-medium">Investimento:</span> R$ {project.investment_amount.toLocaleString('pt-BR')}
                      </div>
                      <div>
                        <span className="font-medium">Retorno:</span> R$ {(project.expected_revenue || 0).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    {project.project_description && (
                      <p className="text-gray-600 text-sm mt-2">{project.project_description}</p>
                    )}
                  </div>
                ))}
                
                <Button onClick={generateReport} className="w-full mt-4">
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

export default ROICalculator;
