
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
  projects: StrategyProject[];
};

export const useStrategyStorage = (sessionId: string | null) => {
  const [currentSession, setCurrentSession] = useState<StrategySession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (sessionId) {
      loadStrategyData();
    }
  }, [sessionId]);

  const loadStrategyData = async () => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      // Load the most recent strategy session
      const { data: sessions, error: sessionsError } = await supabase
        .from('strategy_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (sessionsError) {
        console.error('Error loading strategy sessions:', sessionsError);
        toast({
          title: "Erro ao carregar sessão",
          description: "Não foi possível carregar sua sessão estratégica.",
          variant: "destructive"
        });
        return;
      }

      if (sessions && sessions.length > 0) {
        const session = sessions[0];
        
        // Load projects for this session
        const { data: projectsData, error: projectsError } = await supabase
          .from('strategy_projects')
          .select('*')
          .eq('strategy_session_id', session.id)
          .order('created_at', { ascending: false });

        if (projectsError) {
          console.error('Error loading strategy projects:', projectsError);
        }

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

        setCurrentSession({
          id: session.id,
          portfolio_name: session.portfolio_name,
          context_history: session.context_history || undefined,
          context_initiatives: session.context_initiatives || undefined,
          projects: mappedProjects
        });
      }
    } catch (error) {
      console.error('Error loading strategy data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveStrategySession = async (sessionData: Partial<StrategySession>) => {
    if (!sessionId) return null;

    try {
      // First save or update the strategy session
      let strategySessionId = currentSession?.id;
      
      if (strategySessionId) {
        // Update existing session
        const { error: updateError } = await supabase
          .from('strategy_sessions')
          .update({
            portfolio_name: sessionData.portfolio_name || 'Novo Portfólio',
            context_history: sessionData.context_history,
            context_initiatives: sessionData.context_initiatives
          })
          .eq('id', strategySessionId);

        if (updateError) {
          console.error('Error updating strategy session:', updateError);
          return null;
        }
      } else {
        // Create new session
        const { data: newSession, error: createError } = await supabase
          .from('strategy_sessions')
          .insert({
            session_id: sessionId,
            portfolio_name: sessionData.portfolio_name || 'Novo Portfólio',
            context_history: sessionData.context_history,
            context_initiatives: sessionData.context_initiatives
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating strategy session:', createError);
          return null;
        }

        strategySessionId = newSession.id;
      }

      // Save projects if provided
      if (sessionData.projects && sessionData.projects.length > 0) {
        // Delete existing projects for this session
        await supabase
          .from('strategy_projects')
          .delete()
          .eq('strategy_session_id', strategySessionId);

        // Insert new projects
        const projectsToInsert = sessionData.projects.map(project => ({
          strategy_session_id: strategySessionId,
          name: project.name,
          impact: project.impact,
          complexity: project.complexity,
          category: project.category,
          selected: project.selected,
          description: project.description,
          expected_return: project.expected_return
        }));

        const { error: projectsError } = await supabase
          .from('strategy_projects')
          .insert(projectsToInsert);

        if (projectsError) {
          console.error('Error saving strategy projects:', projectsError);
        }
      }

      await loadStrategyData(); // Refresh data
      return strategySessionId;
    } catch (error) {
      console.error('Error saving strategy session:', error);
      return null;
    }
  };

  return {
    strategySession: currentSession,
    isLoading,
    saveStrategySession,
    loadStrategyData
  };
};
