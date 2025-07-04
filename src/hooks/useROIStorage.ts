
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ROIProject {
  id?: string;
  project_name: string;
  project_description?: string;
  investment_amount: number;
  timeframe?: number;
  expected_revenue?: number;
  expected_costs?: number;
  estimated_roi?: number;
  risk_level: string;
  calculation_model: string;
  roi_result?: number;
  net_profit?: number;
  break_even_months?: number;
  monthly_return?: number;
  risk_adjusted_roi?: number;
}

export const useROIStorage = (sessionId: string | null) => {
  const [projects, setProjects] = useState<ROIProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (sessionId) {
      loadProjects();
    }
  }, [sessionId]);

  const loadProjects = async () => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('roi_projects')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading ROI projects:', error);
        toast({
          title: "Erro ao carregar projetos",
          description: "Não foi possível carregar seus projetos ROI.",
          variant: "destructive"
        });
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProject = async (project: ROIProject) => {
    if (!sessionId) return null;

    try {
      const projectData = {
        session_id: sessionId,
        ...project
      };

      const { data, error } = await supabase
        .from('roi_projects')
        .insert(projectData)
        .select()
        .single();

      if (error) {
        console.error('Error saving ROI project:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar o projeto ROI.",
          variant: "destructive"
        });
        return null;
      }

      await loadProjects(); // Refresh the list
      toast({
        title: "Projeto salvo!",
        description: "Seu projeto ROI foi salvo com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error saving project:', error);
      return null;
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!sessionId) return;

    try {
      const { error } = await supabase
        .from('roi_projects')
        .delete()
        .eq('id', projectId)
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error deleting ROI project:', error);
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o projeto.",
          variant: "destructive"
        });
        return;
      }

      await loadProjects(); // Refresh the list
      toast({
        title: "Projeto excluído!",
        description: "O projeto foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return {
    projects,
    isLoading,
    saveProject,
    deleteProject,
    loadProjects
  };
};
