
import React, { useState } from 'react';
import { useSession } from '@/hooks/useSession';
import AccessCodeInput from '@/components/AccessCodeInput';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  const { sessionId, setSessionId } = useSession();

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Cubo Estratégia</h1>
            <p className="text-gray-600">Plataforma de ROI e Estratégia Empresarial</p>
          </div>
          <AccessCodeInput />
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Não possui um código?</strong> Você pode inserir qualquer código de sua preferência. 
              Seus projetos ficarão salvos e você poderá acessá-los novamente usando o mesmo código.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Dashboard />
      </div>
    </div>
  );
};

export default Index;
