
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
    const cx = ((project.complexity - 1) / 9) * 90 + 5;
    const cy = 95 - (((project.impact - 1) / 9) * 90);
    
    return (
      <g key={project.id} className="chart-group">
        <circle 
          cx={`${cx}%`} 
          cy={`${cy}%`} 
          r="6" 
          fill={categoryColors[project.category]} 
          className="hover:r-8 transition-all duration-200 cursor-pointer drop-shadow-sm"
        />
        <title>{project.name}</title>
      </g>
    );
  });

  const gridLines = [];
  for (let i = 1; i <= 9; i++) {
    // Vertical lines
    gridLines.push(
      <line 
        key={`v-${i}`}
        x1={`${i * 10}%`} 
        y1="0" 
        x2={`${i * 10}%`} 
        y2="100" 
        stroke="#e5e7eb" 
        strokeWidth="0.5"
      />
    );
    // Horizontal lines
    gridLines.push(
      <line 
        key={`h-${i}`}
        x1="0" 
        y1={`${i * 10}%`} 
        x2="100" 
        y2={`${i * 10}%`} 
        stroke="#e5e7eb" 
        strokeWidth="0.5"
      />
    );
  }

  return (
    <div className="w-full h-96 border rounded-lg p-4 relative bg-gradient-to-br from-gray-50 to-gray-100">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Grid lines */}
        {gridLines}
        
        {/* Axis labels */}
        <text 
          x="-45" 
          y="8" 
          style={{ fontSize: '4px', fontFamily: 'sans-serif', fill: '#6b7280' }} 
          transform="rotate(-90)"
        >
          Impacto
        </text>
        <text 
          x="45" 
          y="108" 
          style={{ fontSize: '4px', fontFamily: 'sans-serif', fill: '#6b7280' }}
        >
          Complexidade
        </text>
        
        {/* Data points */}
        {chartDots}
      </svg>
      
      {/* Legend */}
      <div className="absolute -bottom-12 right-0 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {Object.entries(categoryColors).map(([category, color]) => (
          <div key={category} className="flex items-center">
            <div 
              style={{ backgroundColor: color }} 
              className="w-3 h-3 rounded-full mr-1.5 shadow-sm"
            />
            <span className="text-gray-600">{category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioChart;
