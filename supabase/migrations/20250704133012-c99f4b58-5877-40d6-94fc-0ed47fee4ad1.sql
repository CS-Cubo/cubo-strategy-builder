
-- Create a table to store user sessions based on access codes
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  access_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table to store ROI projects
CREATE TABLE public.roi_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE NOT NULL,
  project_name TEXT NOT NULL,
  project_description TEXT,
  investment_amount NUMERIC NOT NULL,
  timeframe INTEGER,
  expected_revenue NUMERIC,
  expected_costs NUMERIC,
  estimated_roi NUMERIC,
  risk_level TEXT NOT NULL,
  calculation_model TEXT NOT NULL,
  roi_result NUMERIC,
  net_profit NUMERIC,
  break_even_months NUMERIC,
  monthly_return NUMERIC,
  risk_adjusted_roi NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table to store strategic platform data
CREATE TABLE public.strategy_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE NOT NULL,
  portfolio_name TEXT NOT NULL,
  context_history TEXT,
  context_initiatives TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table to store strategic projects
CREATE TABLE public.strategy_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_session_id UUID REFERENCES public.strategy_sessions(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  impact INTEGER NOT NULL,
  complexity INTEGER NOT NULL,
  category TEXT NOT NULL,
  selected BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  expected_return TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_user_sessions_access_code ON public.user_sessions(access_code);
CREATE INDEX idx_roi_projects_session_id ON public.roi_projects(session_id);
CREATE INDEX idx_strategy_sessions_session_id ON public.strategy_sessions(session_id);
CREATE INDEX idx_strategy_projects_strategy_session_id ON public.strategy_projects(strategy_session_id);

-- Since this is a public system without authentication, we'll disable RLS
-- but keep the tables in the public schema for API access
