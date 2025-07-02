
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, DollarSign, TrendingUp, FileText, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: number;
  name: string;
  contractValue: number;
  estimatedROI: number;
  justification: string;
}

const ROICalculator = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState({
    name: "",
    contractValue: "",
    estimatedROI: "",
    justification: ""
  });
  const { toast } = useToast();

  const addProject = () => {
    if (!currentProject.name || !currentProject.contractValue || !currentProject.estimatedROI) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, valor do contrato e ROI estimado.",
        variant: "destructive"
      });
      return;
    }

    const newProject: Project = {
      id: Date.now(),
      name: currentProject.name,
      contractValue: parseFloat(currentProject.contractValue),
      estimatedROI: parseFloat(currentProject.estimatedROI),
      justification: currentProject.justification
    };

    setProjects([...projects, newProject]);
    setCurrentProject({ name: "", contractValue: "", estimatedROI: "", justification: "" });
    
    toast({
      title: "Projeto adicionado",
      description: "Projeto adicionado com sucesso ao portfólio.",
    });
  };

  const removeProject = (id: number) => {
    setProjects(projects.filter(p => p.id !== id));
    toast({
      title: "Projeto removido",
      description: "Projeto removido do portfólio.",
    });
  };

  const calculateTotals = () => {
    const totalInvested = projects.reduce((sum, p) => sum + p.contractValue, 0);
    const totalPotentialImpact = projects.reduce((sum, p) => sum + (p.contractValue * p.estimatedROI / 100), 0);
    return { totalInvested, totalPotentialImpact };
  };

  const { totalInvested, totalPotentialImpact } = calculateTotals();

  const generateReport = () => {
    if (projects.length === 0) {
      toast({
        title: "Nenhum projeto",
        description: "Adicione pelo menos um projeto para gerar o relatório.",
        variant: "destructive"
      });
      return;
    }

    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Análise ROI - Cubo Estratégia</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 2rem; color: #1f2937; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0ea5e9; padding-bottom: 1rem; margin-bottom: 2rem; }
            .logo { font-size: 2rem; font-weight: 700; background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .summary { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
            .summary-card { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 1.5rem; border-radius: 1rem; border-left: 4px solid #0ea5e9; }
            .summary-value { font-size: 2rem; font-weight: 700; color: #0369a1; }
            .projects-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
            .projects-table th, .projects-table td { border: 1px solid #e5e7eb; padding: 0.75rem; text-align: left; }
            .projects-table th { background-color: #f9fafb; font-weight: 600; }
            .impact-positive { color: #16a34a; font-weight: 600; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Cubo Estratégia</div>
            <div>
              <h1 style="margin: 0; color: #374151;">Relatório de Análise ROI</h1>
              <p style="margin: 0; color: #6b7280;">Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          
          <div class="summary">
            <div class="summary-card">
              <h3 style="margin: 0 0 0.5rem 0; color: #374151;">Total Investido</h3>
              <div class="summary-value">R$ ${totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card">
              <h3 style="margin: 0 0 0.5rem 0; color: #374151;">Impacto Potencial Total</h3>
              <div class="summary-value impact-positive">R$ ${totalPotentialImpact.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          <h3 style="color: #374151; margin-bottom: 1rem;">Projetos Analisados</h3>
          <table class="projects-table">
            <thead>
              <tr>
                <th>Nome do Projeto</th>
                <th>Valor do Contrato</th>
                <th>ROI Estimado (%)</th>
                <th>Impacto Potencial</th>
                <th>Justificativa</th>
              </tr>
            </thead>
            <tbody>
              ${projects.map(p => `
                <tr>
                  <td>${p.name}</td>
                  <td>R$ ${p.contractValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td>${p.estimatedROI}%</td>
                  <td class="impact-positive">R$ ${(p.contractValue * p.estimatedROI / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td>${p.justification || 'N/A'}</td>
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
      <div className="bg-gradient-innovation rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <Calculator className="h-10 w-10" />
          <div>
            <h1 className="text-3xl font-bold">Calculadora de Impacto (ROI)</h1>
            <p className="text-xl opacity-90">
              Mensure o potencial de retorno dos seus projetos de forma escalável.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-corporate-50 to-corporate-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Investido</p>
                  <p className="text-3xl font-bold text-corporate-900">
                    R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <DollarSign className="h-10 w-10 text-corporate-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-success-50 to-success-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Impacto Potencial Total</p>
                  <p className="text-3xl font-bold text-success-900">
                    R$ {totalPotentialImpact.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-success-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Project Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Adicionar Novo Projeto</span>
            </CardTitle>
            <CardDescription>
              Insira os dados do projeto para calcular o ROI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="projectName">Nome do Projeto</Label>
              <Input
                id="projectName"
                value={currentProject.name}
                onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })}
                placeholder="Ex: Implementação de CRM"
              />
            </div>
            
            <div>
              <Label htmlFor="contractValue">Valor do Contrato</Label>
              <Input
                id="contractValue"
                type="number"
                value={currentProject.contractValue}
                onChange={(e) => setCurrentProject({ ...currentProject, contractValue: e.target.value })}
                placeholder="100000"
              />
            </div>
            
            <div>
              <Label htmlFor="estimatedROI">ROI Estimado (%)</Label>
              <Input
                id="estimatedROI"
                type="number"
                value={currentProject.estimatedROI}
                onChange={(e) => setCurrentProject({ ...currentProject, estimatedROI: e.target.value })}
                placeholder="30"
              />
            </div>
            
            <div>
              <Label htmlFor="justification">Justificativa do ROI</Label>
              <Textarea
                id="justification"
                value={currentProject.justification}
                onChange={(e) => setCurrentProject({ ...currentProject, justification: e.target.value })}
                placeholder="Descreva os motivos que justificam este ROI..."
                rows={3}
              />
            </div>
            
            <Button onClick={addProject} className="w-full bg-gradient-innovation">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Projeto
            </Button>
          </CardContent>
        </Card>

        {/* Projects List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Projetos Atuais</CardTitle>
            <CardDescription>
              {projects.length === 0 ? "Nenhum projeto adicionado" : `${projects.length} projeto(s) no portfólio`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Adicione projetos para começar a análise</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {projects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProject(project.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Valor:</span>
                        <span className="ml-2 font-medium">
                          R$ {project.contractValue.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">ROI:</span>
                        <span className="ml-2 font-medium text-success-600">
                          {project.estimatedROI}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Impacto:</span>
                      <span className="ml-2 font-bold text-success-700">
                        R$ {(project.contractValue * project.estimatedROI / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {projects.length > 0 && (
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => setProjects([])}>
            Limpar Todos
          </Button>
          <Button onClick={generateReport} className="bg-gradient-success">
            <FileText className="mr-2 h-4 w-4" />
            Gerar Relatório
          </Button>
        </div>
      )}
    </div>
  );
};

export default ROICalculator;
