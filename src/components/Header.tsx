
import { Calculator, TrendingUp, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-corporate p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-2xl bg-gradient-corporate bg-clip-text text-transparent tracking-tight">
                  Cubo
                </span>
                <span className="ml-2 text-2xl font-light text-gray-700">
                  Estratégia
                </span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calculator className="h-4 w-4" />
              <span>Plataforma Integrada de Análise Estratégica</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
