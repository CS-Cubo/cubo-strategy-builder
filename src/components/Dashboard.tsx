
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ROICalculator from './ROICalculator';
import StrategyPlatform from './StrategyPlatform';
import UserSessions from './UserSessions';
import { Calculator, Target, Users } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="w-full">
      <Tabs defaultValue="roi" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roi" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Calculadora de ROI
          </TabsTrigger>
          <TabsTrigger value="strategy" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Plataforma Estratégica
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Sessões de Usuários
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="roi" className="mt-6">
          <ROICalculator />
        </TabsContent>
        
        <TabsContent value="strategy" className="mt-6">
          <StrategyPlatform />
        </TabsContent>
        
        <TabsContent value="sessions" className="mt-6">
          <UserSessions />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
