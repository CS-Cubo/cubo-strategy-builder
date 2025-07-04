
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StrategyProject {
  id?: string;
  name: string;
  impact: number;
  complexity: number;
  category: "Core" | "Adjacente" | "Transformacional";
  selected: boolean;
  description?: string;
  expected_return?: string;
}

interface StrategySession {
  id?: string;
  portfolio_name: string;
  context_history?: string;
  context_initiatives?: string;
  projects: StrategyProject[];
}

export const useStrategyStorage = (sessionId: string | null) => {
  const [strategySession, setStrategySession] = useState<StrategySession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (sessionId) {
      loadStrategySession();
    }
  }, [sessionId]);

  const loadStrategySession = async () => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      // Load strategy session
      const { data: sessionData, error: sessionError } = await supabase
        .from('strategy_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (sessionError) {
        console.error('Error loading strategy session:', sessionError);
        return;
      }

      if (sessionData) {
        // Load projects for this strategy session
        const { data: projectsData, error: projectsError } = await supabase
          .from('strategy_projects')
          .select('*')
          .eq('strategy_session_id', sessionData.id)
          .order('created_at', { ascending: true });

        if (projectsError) {
          console.error('Error loading strategy projects:', projectsError);
          return;
        }

        setStrategySession({
          id: sessionData.id,
          portfolio_name: sessionData.portfolio_name,
          context_history: sessionData.context_history,
          context_initiatives: sessionData.context_initiatives,
          projects: projectsData || []
        });
      }
    } catch (error) {
      console.error('Error loading strategy session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveStrategySession = async (session: StrategySession) => {
    if (!sessionId) return;

    try {
      let strategySessionId = session.id;

      // Create or update strategy session
      if (strategySessionId) {
        const { error: updateError } = await supabase
          .from('strategy_sessions')
          .update({
            portfolio_name: session.portfolio_name,
            context_history: session.context_history,
            context_initiatives: session.context_initiatives,
            updated_at: new Date().toISOString()
          })
          .eq('id', strategySessionId);

        if (updateError) {
          console.error('Error updating strategy session:', updateError);
          return;
        }
      } else {
        const { data: newSession, error: createError } = await supabase
          .from('strategy_sessions')
          .insert({
            session_id: sessionId,
            portfolio_name: session.portfolio_name,
            context_history: session.context_history,
            context_initiatives: session.context_initiatives
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating strategy session:', createError);
          return;
        }

        strategySessionId = newSession.id;
      }

      // Delete existing projects and insert new ones
      await supabase
        .from('strategy_projects')
        .delete()
        .eq('strategy_session_id', strategySessionId);

      if (session.projects.length > 0) {
        const projectsToInsert = session.projects.map(project => ({
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
          return;
        }
      }

      await loadStrategySession(); // Refresh the data
      toast({
        title: "Portfólio salvo!",
        description: "Seu portfólio estratégico foi salvo com sucesso.",
      });
    } catch (error) {
      console.error('Error saving strategy session:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o portfólio estratégico.",
        variant: "destructive"
      });
    }
  };

  return {
    strategySession,
    isLoading,
    saveStrategySession,
    loadStrategySession
  };
};
