
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useClickCounter = (sessionId: string | null) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const incrementBenchmarkClicks = useCallback(async () => {
    if (!sessionId) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          benchmark_clicks: supabase.raw('benchmark_clicks + 1')
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Erro ao incrementar benchmark clicks:', error);
      }
    } catch (error) {
      console.error('Erro ao incrementar benchmark clicks:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [sessionId]);

  const incrementProjectSuggestionsClicks = useCallback(async () => {
    if (!sessionId) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          project_suggestions_clicks: supabase.raw('project_suggestions_clicks + 1')
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Erro ao incrementar project suggestions clicks:', error);
      }
    } catch (error) {
      console.error('Erro ao incrementar project suggestions clicks:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [sessionId]);

  return {
    incrementBenchmarkClicks,
    incrementProjectSuggestionsClicks,
    isUpdating
  };
};
