
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Key, Loader2 } from 'lucide-react';

interface AccessCodeInputProps {
  onSubmit: (code: string) => Promise<boolean>;
  isLoading: boolean;
  currentCode?: string;
  onClear?: () => void;
}

const AccessCodeInput = ({ onSubmit, isLoading, currentCode, onClear }: AccessCodeInputProps) => {
  const [code, setCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(code);
  };

  if (currentCode) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Key className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Sessão ativa: <span className="font-bold text-green-700">{currentCode}</span>
                </p>
                <p className="text-xs text-gray-600">Seus dados estão sendo salvos automaticamente</p>
              </div>
            </div>
            <Button variant="outline" onClick={onClear} size="sm">
              Trocar Código
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Key className="h-5 w-5" />
          <span>Código de Acesso</span>
        </CardTitle>
        <CardDescription>
          Digite seu código para salvar e recuperar seus dados. Se é a primeira vez, será criada uma nova sessão.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="accessCode">Seu Código de Acesso</Label>
            <Input
              id="accessCode"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Digite seu código único..."
              disabled={isLoading}
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={isLoading || !code.trim()} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Conectando...
              </>
            ) : (
              'Conectar'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AccessCodeInput;
