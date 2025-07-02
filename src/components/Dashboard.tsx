
import { Calculator, BarChart3, TrendingUp, Users, DollarSign, Target, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashboardProps {
  onModuleChange: (module: string) => void;
}

const Dashboard = ({ onModuleChange }: DashboardProps) => {
  const stats = [
    {
      title: "Projetos Analisados",
      value: "1,234",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: Target
    },
    {
      title: "ROI Médio",
      value: "28.4%",
      change: "+4.2%",
      changeType: "positive" as const,
      icon: TrendingUp
    },
    {
      title: "Investimento Total",
      value: "R$ 12.5M",
      change: "+18.1%",
      changeType: "positive" as const,
      icon: DollarSign
    },
    {
      title: "Equipes Ativas",
      value: "48",
      change: "+2",
      changeType: "positive" as const,
      icon: Users
    }
  ];

  const modules = [
    {
      id: "roi-calculator",
      title: "Calculadora de ROI",
      description: "Calcule o retorno sobre investimento dos seus projetos com análise detalhada de impacto potencial.",
      icon: Calculator,
      gradient: "from-innovation-500 to-innovation-600",
      bgGradient: "from-innovation-50 to-innovation-100",
      features: ["Análise de investimentos", "Cálculo de ROI", "Relatórios detalhados"]
    },
    {
      id: "strategy-platform",
      title: "Plataforma Estratégica",
      description: "Construa portfólios estratégicos com sugestões de projetos geradas por inteligência artificial.",
      icon: BarChart3,
      gradient: "from-success-500 to-success-600",
      bgGradient: "from-success-50 to-success-100",
      features: ["Sugestões com IA", "Matriz Impacto vs Complexidade", "Portfólio estratégico"]
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-corporate-600 via-corporate-700 to-innovation-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.1&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;4&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4">
            Bem-vindo à Plataforma Cubo Estratégia
          </h1>
          <p className="text-xl opacity-90 mb-6 max-w-2xl">
            Análise estratégica inteligente para grandes corporações. 
            Calcule ROI, construa portfólios e tome decisões baseadas em dados.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => onModuleChange("roi-calculator")}
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
            >
              <Calculator className="mr-2 h-5 w-5" />
              Calcular ROI
            </Button>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => onModuleChange("strategy-platform")}
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Estratégia com IA
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="h-4 w-4 text-success-600 mr-1" />
                      <span className="text-sm font-medium text-success-600">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-corporate-100 to-corporate-200 p-3 rounded-xl">
                    <Icon className="h-6 w-6 text-corporate-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {modules.map((module, index) => {
          const Icon = module.icon;
          return (
            <Card 
              key={module.id} 
              className={`border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 bg-gradient-to-br ${module.bgGradient}`}
              onClick={() => onModuleChange(module.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className={`bg-gradient-to-r ${module.gradient} p-3 rounded-xl shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      Ferramenta avançada de análise
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {module.description}
                </p>
                <div className="space-y-2 mb-6">
                  {module.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-current rounded-full mr-3 opacity-60"></div>
                      {feature}
                    </div>
                  ))}
                </div>
                <Button 
                  className={`w-full bg-gradient-to-r ${module.gradient} hover:opacity-90 transition-opacity`}
                  size="lg"
                >
                  Acessar Módulo
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
