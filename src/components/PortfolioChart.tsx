
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Project {
  id: string;
  name: string;
  impact: number;
  complexity: number;
  category: string;
  expected_return?: string;
}

interface PortfolioChartProps {
  projects: Project[];
}

const CATEGORY_COLORS = {
  'Tecnologia': '#8B5CF6',
  'Marketing': '#EF4444', 
  'Operações': '#10B981',
  'Vendas': '#F59E0B',
  'RH': '#3B82F6',
  'Outro': '#6B7280'
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">Impacto: {data.impact}</p>
        <p className="text-sm text-gray-600">Complexidade: {data.complexity}</p>
        <p className="text-sm text-gray-600">Categoria: {data.category}</p>
        {data.expected_return && (
          <p className="text-sm text-gray-600">Retorno: {data.expected_return}</p>
        )}
      </div>
    );
  }
  return null;
};

const PortfolioChart = ({ projects }: PortfolioChartProps) => {
  const chartData = projects.map(project => ({
    ...project,
    x: project.complexity,
    y: project.impact,
    fill: CATEGORY_COLORS[project.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS['Outro']
  }));

  return (
    <div className="w-full h-80 relative">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          data={chartData}
          margin={{ top: 20, right: 30, bottom: 40, left: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number"
            dataKey="x"
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            label={{ value: 'Complexidade', position: 'insideBottom', offset: -20, style: { fontSize: '12px' } }}
            tick={{ fontSize: 11 }}
          />
          <YAxis 
            type="number"
            dataKey="y"
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            label={{ value: 'Impacto', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter dataKey="y" fill="#8884d8">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      
      {/* Quadrant Labels */}
      <div className="absolute top-6 left-12 text-xs text-gray-500 font-medium">
        Alto Impacto<br />Baixa Complexidade
      </div>
      <div className="absolute top-6 right-12 text-xs text-gray-500 font-medium">
        Alto Impacto<br />Alta Complexidade
      </div>
      <div className="absolute bottom-16 left-12 text-xs text-gray-500 font-medium">
        Baixo Impacto<br />Baixa Complexidade
      </div>
      <div className="absolute bottom-16 right-12 text-xs text-gray-500 font-medium">
        Baixo Impacto<br />Alta Complexidade
      </div>
    </div>
  );
};

export default PortfolioChart;
