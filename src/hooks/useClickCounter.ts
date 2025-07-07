
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
      // Primeiro buscar o valor atual
      const { data: currentData, error: fetchError } = await supabase
        .from('user_sessions')
        .select('benchmark_clicks')
        .eq('id', sessionId)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar benchmark clicks:', fetchError);
        return;
      }

      const currentClicks = currentData?.benchmark_clicks || 0;

      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          benchmark_clicks: currentClicks + 1
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
      // Primeiro buscar o valor atual
      const { data: currentData, error: fetchError } = await supabase
        .from('user_sessions')
        .select('project_suggestions_clicks')
        .eq('id', sessionId)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar project suggestions clicks:', fetchError);
        return;
      }

      const currentClicks = currentData?.project_suggestions_clicks || 0;

      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          project_suggestions_clicks: currentClicks + 1
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
