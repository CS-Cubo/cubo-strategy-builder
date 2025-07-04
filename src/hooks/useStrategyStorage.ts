
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type StrategyProject = {
  id?: string;
  name: string;
  impact: number;
  complexity: number;
  category: "Core" | "Adjacente" | "Transformacional";
  selected: boolean;
  description?: string;
  expected_return?: string;
};

export type StrategySession = {
  id?: string;
  portfolio_name: string;
  context_history?: string;
  context_initiatives?: string;
};

export const useStrategyStorage = (sessionId: string | null) => {
  const [strategySessions, setStrategySessions] = useState<StrategySession[]>([]);
  const [projects, setProjects] = useState<StrategyProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (sessionId) {
      loadStrategySessions();
    }
  }, [sessionId]);

  const loadStrategySessions = async () => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      // Load strategy sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('strategy_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (sessionsError) {
        console.error('Error loading strategy sessions:', sessionsError);
        toast({
          title: "Erro ao carregar sessões",
          description: "Não foi possível carregar suas sessões estratégicas.",
          variant: "destructive"
        });
        return;
      }

      setStrategySessions(sessions || []);

      // Load projects for all sessions
      if (sessions && sessions.length > 0) {
        const sessionIds = sessions.map(s => s.id).filter(Boolean);
        const { data: projectsData, error: projectsError } = await supabase
          .from('strategy_projects')
          .select('*')
          .in('strategy_session_id', sessionIds)
          .order('created_at', { ascending: false });

        if (projectsError) {
          console.error('Error loading strategy projects:', projectsError);
        } else {
          // Map the data to match our StrategyProject type
          const mappedProjects: StrategyProject[] = (projectsData || []).map(project => ({
            id: project.id,
            name: project.name,
            impact: project.impact,
            complexity: project.complexity,
            category: project.category as "Core" | "Adjacente" | "Transformacional",
            selected: project.selected,
            description: project.description || undefined,
            expected_return: project.expected_return || undefined
          }));
          setProjects(mappedProjects);
        }
      }
    } catch (error) {
      console.error('Error loading strategy data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveStrategySession = async (session: StrategySession) => {
    if (!sessionId) return null;

    try {
      const sessionData = {
        session_id: sessionId,
        ...session
      };

      const { data, error } = await supabase
        .from('strategy_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.error('Error saving strategy session:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar a sessão estratégica.",
          variant: "destructive"
        });
        return null;
      }

      await loadStrategySessions(); // Refresh the list
      toast({
        title: "Sessão salva!",
        description: "Sua sessão estratégica foi salva com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error saving strategy session:', error);
      return null;
    }
  };

  const saveProject = async (project: StrategyProject, strategySessionId: string) => {
    if (!sessionId) return null;

    try {
      const projectData = {
        strategy_session_id: strategySessionId,
        name: project.name,
        impact: project.impact,
        complexity: project.complexity,
        category: project.category,
        selected: project.selected,
        description: project.description,
        expected_return: project.expected_return
      };

      const { data, error } = await supabase
        .from('strategy_projects')
        .insert(projectData)
        .select()
        .single();

      if (error) {
        console.error('Error saving strategy project:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar o projeto estratégico.",
          variant: "destructive"
        });
        return null;
      }

      await loadStrategySessions(); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error saving strategy project:', error);
      return null;
    }
  };

  const deleteStrategySession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('strategy_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        console.error('Error deleting strategy session:', error);
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir a sessão estratégica.",
          variant: "destructive"
        });
        return;
      }

      await loadStrategySessions(); // Refresh the list
      toast({
        title: "Sessão excluída!",
        description: "A sessão estratégica foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting strategy session:', error);
    }
  };

  return {
    strategySessions,
    projects,
    isLoading,
    saveStrategySession,
    saveProject,
    deleteStrategySession,
    loadStrategySessions
  };
};
