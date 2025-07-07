
-- Adicionar colunas para contar cliques nos botões de benchmark e sugestões de projetos
ALTER TABLE public.user_sessions 
ADD COLUMN benchmark_clicks INTEGER DEFAULT 0,
ADD COLUMN project_suggestions_clicks INTEGER DEFAULT 0;
