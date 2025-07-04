
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if there's a saved session in localStorage
    const savedSessionId = localStorage.getItem('cubo_session_id');
    const savedAccessCode = localStorage.getItem('cubo_access_code');
    
    if (savedSessionId && savedAccessCode) {
      setSessionId(savedSessionId);
      setAccessCode(savedAccessCode);
    }
  }, []);

  const createOrLoadSession = async (code: string) => {
    if (!code.trim()) {
      toast({
        title: "Código necessário",
        description: "Digite um código de acesso para continuar.",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    
    try {
      // First, try to find existing session
      const { data: existingSession, error: findError } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('access_code', code.trim())
        .maybeSingle();

      if (findError) {
        console.error('Error finding session:', findError);
        toast({
          title: "Erro",
          description: "Erro ao buscar sessão. Tente novamente.",
          variant: "destructive"
        });
        return false;
      }

      let currentSessionId: string;

      if (existingSession) {
        // Load existing session
        currentSessionId = existingSession.id;
        toast({
          title: "Sessão carregada!",
          description: "Seus dados foram recuperados com sucesso.",
        });
      } else {
        // Create new session
        const { data: newSession, error: createError } = await supabase
          .from('user_sessions')
          .insert({ access_code: code.trim() })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating session:', createError);
          toast({
            title: "Erro",
            description: "Erro ao criar sessão. Tente novamente.",
            variant: "destructive"
          });
          return false;
        }

        currentSessionId = newSession.id;
        toast({
          title: "Nova sessão criada!",
          description: "Seus dados serão salvos automaticamente.",
        });
      }

      // Save to state and localStorage
      setSessionId(currentSessionId);
      setAccessCode(code.trim());
      localStorage.setItem('cubo_session_id', currentSessionId);
      localStorage.setItem('cubo_access_code', code.trim());
      
      return true;
    } catch (error) {
      console.error('Session error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearSession = () => {
    setSessionId(null);
    setAccessCode('');
    localStorage.removeItem('cubo_session_id');
    localStorage.removeItem('cubo_access_code');
    toast({
      title: "Sessão limpa",
      description: "Você pode inserir um novo código de acesso.",
    });
  };

  return {
    sessionId,
    accessCode,
    isLoading,
    createOrLoadSession,
    clearSession,
    hasSession: !!sessionId
  };
};
