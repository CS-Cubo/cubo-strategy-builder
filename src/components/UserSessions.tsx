
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Calendar, BarChart3, Lightbulb, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserSession {
  id: string;
  access_code: string;
  created_at: string;
  benchmark_clicks: number;
  project_suggestions_clicks: number;
  roi_projects_count?: number;
  strategy_sessions_count?: number;
}

const UserSessions = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      // Buscar sessões básicas
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (sessionsError) {
        console.error('Erro ao carregar sessões:', sessionsError);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as sessões.",
          variant: "destructive"
        });
        return;
      }

      // Para cada sessão, buscar contadores de projetos
      const sessionsWithCounts = await Promise.all(
        (sessionsData || []).map(async (session) => {
          // Contar projetos ROI
          const { count: roiCount } = await supabase
            .from('roi_projects')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);

          // Contar sessões estratégicas
          const { count: strategyCount } = await supabase
            .from('strategy_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);

          return {
            ...session,
            roi_projects_count: roiCount || 0,
            strategy_sessions_count: strategyCount || 0
          };
        })
      );

      setSessions(sessionsWithCounts);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar sessões.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.access_code.toLowerCase().includes(searchCode.toLowerCase())
  );

  const totalUsers = sessions.length;
  const totalBenchmarkClicks = sessions.reduce((sum, session) => sum + (session.benchmark_clicks || 0), 0);
  const totalProjectSuggestionClicks = sessions.reduce((sum, session) => sum + (session.project_suggestions_clicks || 0), 0);
  const totalROIProjects = sessions.reduce((sum, session) => sum + (session.roi_projects_count || 0), 0);
  const totalStrategyProjects = sessions.reduce((sum, session) => sum + (session.strategy_sessions_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Projetos ROI</p>
                <p className="text-2xl font-bold">{totalROIProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Projetos Estratégicos</p>
                <p className="text-2xl font-bold">{totalStrategyProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Benchmarks</p>
                <p className="text-2xl font-bold">{totalBenchmarkClicks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-4 w-4 text-pink-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Sugestões IA</p>
                <p className="text-2xl font-bold">{totalProjectSuggestionClicks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Sessões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Sessões de Usuários
          </CardTitle>
          <CardDescription>
            Lista de todas as sessões criadas pelos usuários
          </CardDescription>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="searchCode">Buscar por código</Label>
              <Input
                id="searchCode"
                placeholder="Digite um código para buscar..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
              />
            </div>
            <Button onClick={loadSessions} variant="outline" className="mt-6">
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando sessões...</span>
            </div>
          ) : filteredSessions.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              {searchCode ? 'Nenhuma sessão encontrada com esse código.' : 'Nenhuma sessão encontrada.'}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-lg">Código: {session.access_code}</h4>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Criado em: {new Date(session.created_at).toLocaleDateString('pt-BR')} às {new Date(session.created_at).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Projetos ROI</p>
                      <p className="text-xl font-bold text-green-600">{session.roi_projects_count || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Projetos Estratégicos</p>
                      <p className="text-xl font-bold text-purple-600">{session.strategy_sessions_count || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Cliques Benchmark</p>
                      <p className="text-xl font-bold text-orange-600">{session.benchmark_clicks || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Sugestões IA</p>
                      <p className="text-xl font-bold text-pink-600">{session.project_suggestions_clicks || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">ID da Sessão</p>
                      <p className="text-xs text-gray-500 font-mono">{session.id.substring(0, 8)}...</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSessions;
