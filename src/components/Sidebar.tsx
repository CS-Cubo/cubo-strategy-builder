
import { Calculator, BarChart3, TrendingUp, Home, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ activeModule, onModuleChange, isOpen, onClose }: SidebarProps) => {
  const modules = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: Home,
      description: "Visão geral",
      gradient: "from-corporate-500 to-corporate-600"
    },
    {
      id: "roi-calculator",
      name: "Calculadora ROI",
      icon: Calculator,
      description: "Análise de investimentos",
      gradient: "from-innovation-500 to-innovation-600"
    },
    {
      id: "strategy-platform",
      name: "Plataforma Estratégica",
      icon: BarChart3,
      description: "Portfólio com IA",
      gradient: "from-success-500 to-success-600"
    },
    {
      id: "reports",
      name: "Relatórios",
      icon: FileText,
      description: "Análises detalhadas",
      gradient: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-gray-200/50 shadow-lg z-50 transition-transform duration-300 ease-in-out w-80",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-corporate p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl bg-gradient-corporate bg-clip-text text-transparent">
                  Cubo Estratégia
                </h2>
                <p className="text-sm text-gray-500">Plataforma Corporativa</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;
              
              return (
                <Button
                  key={module.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-auto p-4 rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-gradient-to-r from-corporate-50 to-corporate-100 border-l-4 border-corporate-500 shadow-sm" 
                      : "hover:bg-gray-50 hover:shadow-sm"
                  )}
                  onClick={() => {
                    onModuleChange(module.id);
                    onClose();
                  }}
                >
                  <div className="flex items-center space-x-4 w-full">
                    <div className={cn(
                      "p-2 rounded-lg bg-gradient-to-r",
                      isActive ? module.gradient : "bg-gray-100"
                    )}>
                      <Icon className={cn(
                        "h-5 w-5",
                        isActive ? "text-white" : "text-gray-600"
                      )} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={cn(
                        "font-medium",
                        isActive ? "text-corporate-900" : "text-gray-900"
                      )}>
                        {module.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {module.description}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200/50">
            <div className="bg-gradient-to-r from-corporate-50 to-innovation-50 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <Sparkles className="h-5 w-5 text-corporate-600" />
                <div>
                  <div className="font-medium text-sm text-gray-900">
                    Powered by AI
                  </div>
                  <div className="text-xs text-gray-500">
                    Análises inteligentes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
