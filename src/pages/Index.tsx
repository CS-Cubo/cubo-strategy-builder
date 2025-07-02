
import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import ROICalculator from "@/components/ROICalculator";
import StrategyPlatform from "@/components/StrategyPlatform";

const Index = () => {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderActiveModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard onModuleChange={setActiveModule} />;
      case "roi-calculator":
        return <ROICalculator />;
      case "strategy-platform":
        return <StrategyPlatform />;
      case "reports":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Relatórios</h2>
            <p className="text-gray-600">
              Módulo de relatórios em desenvolvimento. 
              Use os outros módulos para gerar relatórios específicos.
            </p>
          </div>
        );
      default:
        return <Dashboard onModuleChange={setActiveModule} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      <div className="flex">
        <Sidebar 
          activeModule={activeModule}
          onModuleChange={setActiveModule}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 lg:ml-80 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderActiveModule()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
