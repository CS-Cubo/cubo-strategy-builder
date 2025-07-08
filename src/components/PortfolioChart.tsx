
import React from 'react';

interface Project {
  id: number;
  name: string;
  impact: number;
  complexity: number;
  category: "Core" | "Adjacente" | "Transformacional";
  selected: boolean;
}

interface PortfolioChartProps {
  projects: Project[];
}

const PortfolioChart = ({ projects }: PortfolioChartProps) => {
  const categoryColors = {
    Core: '#3b82f6',
    Adjacente: '#8b5cf6', 
    Transformacional: '#ec4899'
  };

  const chartDots = projects.map(project => {
    const cx = ((project.complexity - 1) / 9) * 80 + 10; // Adjusted for margin
    const cy = 90 - (((project.impact - 1) / 9) * 80); // Adjusted for margin
    
    return (
      <g key={project.id} className="chart-group">
        <circle 
          cx={`${cx}%`} 
          cy={`${cy}%`} 
          r="8" 
          fill={categoryColors[project.category]} 
          className="hover:r-10 transition-all duration-200 cursor-pointer drop-shadow-md stroke-white stroke-2"
        />
        <title>{`${project.name}\nImpacto: ${project.impact}\nComplexidade: ${project.complexity}`}</title>
      </g>
    );
  });

  // Create grid lines
  const gridLines = [];
  for (let i = 1; i <= 9; i++) {
    // Vertical lines (complexity)
    gridLines.push(
      <line 
        key={`v-${i}`}
        x1={`${10 + (i * 8)}%`} 
        y1="10%" 
        x2={`${10 + (i * 8)}%`} 
        y2="90%" 
        stroke="#e5e7eb" 
        strokeWidth="1"
        strokeDasharray="2,2"
      />
    );
    // Horizontal lines (impact)
    gridLines.push(
      <line 
        key={`h-${i}`}
        x1="10%" 
        y1={`${10 + (i * 8)}%`} 
        x2="90%" 
        y2={`${10 + (i * 8)}%`} 
        stroke="#e5e7eb" 
        strokeWidth="1"
        strokeDasharray="2,2"
      />
    );
  }

  // Axis tick marks and labels
  const tickMarks = [];
  for (let i = 1; i <= 10; i++) {
    // X-axis ticks (complexity)
    tickMarks.push(
      <g key={`x-tick-${i}`}>
        <line 
          x1={`${2 + (i * 8)}%`} 
          y1="90%" 
          x2={`${2 + (i * 8)}%`} 
          y2="92%" 
          stroke="#6b7280" 
          strokeWidth="1"
        />
        <text 
          x={`${2 + (i * 8)}%`} 
          y="96%" 
          textAnchor="middle" 
          fontSize="10" 
          fill="#6b7280"
        >
          {i}
        </text>
      </g>
    );
    
    // Y-axis ticks (impact)
    tickMarks.push(
      <g key={`y-tick-${i}`}>
        <line 
          x1="8%" 
          y1={`${98 - (i * 8)}%`} 
          x2="10%" 
          y2={`${98 - (i * 8)}%`} 
          stroke="#6b7280" 
          strokeWidth="1"
        />
        <text 
          x="6%" 
          y={`${99 - (i * 8)}%`} 
          textAnchor="middle" 
          fontSize="10" 
          fill="#6b7280" 
          dominantBaseline="middle"
        >
          {i}
        </text>
      </g>
    );
  }

  return (
    <div className="w-full h-96 border rounded-lg p-6 relative bg-gradient-to-br from-slate-50 to-slate-100">
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="overflow-visible">
        {/* Main axes */}
        <line x1="10%" y1="90%" x2="90%" y2="90%" stroke="#374151" strokeWidth="2" />
        <line x1="10%" y1="90%" x2="10%" y2="10%" stroke="#374151" strokeWidth="2" />
        
        {/* Grid lines */}
        {gridLines}
        
        {/* Tick marks and numbers */}
        {tickMarks}
        
        {/* Axis labels */}
        <text 
          x="50%" 
          y="99%" 
          textAnchor="middle" 
          fontSize="12" 
          fill="#374151" 
          fontWeight="600"
        >
          Complexidade
        </text>
        
        <text 
          x="2%" 
          y="50%" 
          textAnchor="middle" 
          fontSize="12" 
          fill="#374151" 
          fontWeight="600"
          transform="rotate(-90 2 50)"
        >
          Impacto
        </text>
        
        {/* Quadrant labels */}
        <text x="75%" y="25%" fontSize="10" fill="#6b7280" fontWeight="500" textAnchor="middle">
          Alto Impacto
          <tspan x="75%" dy="12">Alta Complexidade</tspan>
        </text>
        <text x="25%" y="25%" fontSize="10" fill="#6b7280" fontWeight="500" textAnchor="middle">
          Alto Impacto
          <tspan x="25%" dy="12">Baixa Complexidade</tspan>
        </text>
        <text x="25%" y="80%" fontSize="10" fill="#6b7280" fontWeight="500" textAnchor="middle">
          Baixo Impacto
          <tspan x="25%" dy="12">Baixa Complexidade</tspan>
        </text>
        <text x="75%" y="80%" fontSize="10" fill="#6b7280" fontWeight="500" textAnchor="middle">
          Baixo Impacto
          <tspan x="75%" dy="12">Alta Complexidade</tspan>
        </text>
        
        {/* Data points */}
        {chartDots}
      </svg>
      
      {/* Legend */}
      <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-6 text-sm">
        {Object.entries(categoryColors).map(([category, color]) => (
          <div key={category} className="flex items-center">
            <div 
              style={{ backgroundColor: color }} 
              className="w-4 h-4 rounded-full mr-2 shadow-sm border-2 border-white"
            />
            <span className="text-gray-700 font-medium">{category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioChart;
