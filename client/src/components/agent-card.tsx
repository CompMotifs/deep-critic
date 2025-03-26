interface AgentCardProps {
  agent: {
    agentName: string;
    feedback: string;
    confidence: number;
    keyPoints: string[];
  };
}

const AgentCard = ({ agent }: AgentCardProps) => {
  // Map agent names to colors and letters
  const agentStyles: Record<string, { color: string; letter: string; bgColor: string }> = {
    'Claude 3.7 Sonnet': { color: 'bg-[#8B5CF6]', letter: 'C', bgColor: 'bg-[#8B5CF6] bg-opacity-10' },
    'Claude 3 Opus': { color: 'bg-[#EC4899]', letter: 'O', bgColor: 'bg-[#EC4899] bg-opacity-10' },
    'o3-mini-high': { color: 'bg-[#10B981]', letter: 'M', bgColor: 'bg-[#10B981] bg-opacity-10' },
  };
  
  // Default style if agent name doesn't match
  const { color = 'bg-gray-500', letter = '?', bgColor = 'bg-gray-100' } = 
    agentStyles[agent.agentName] || {};
  
  // Convert the textColor for use in the chevron icon
  const textColor = color.replace('bg-', 'text-');
  
  // Format confidence for display
  const confidenceDisplay = `${Math.round(agent.confidence * 100)}%`;
  const confidenceLevel = agent.confidence > 0.8 ? 'High' : agent.confidence > 0.5 ? 'Medium' : 'Low';
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className={`px-4 py-3 flex justify-between items-center ${bgColor}`}>
        <div className="flex items-center">
          <span className={`w-8 h-8 rounded-full ${color} text-white flex items-center justify-center mr-3 text-sm font-medium`}>
            {letter}
          </span>
          <h4 className="font-medium text-gray-900">{agent.agentName}</h4>
        </div>
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-2">Confidence</span>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            {confidenceLevel} ({confidenceDisplay})
          </span>
        </div>
      </div>
      
      <div className="px-4 py-3 bg-white">
        <div className="text-sm text-gray-700 mb-4 whitespace-pre-line">
          {agent.feedback}
        </div>
        
        <div>
          <h5 className="text-sm font-medium text-gray-900 mb-2">Key Points</h5>
          <ul className="space-y-1">
            {agent.keyPoints?.map((point, index) => (
              <li key={index} className="flex items-start">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 ${textColor} mt-0.5 mr-1.5 flex-shrink-0`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <span className="text-xs text-gray-700">{point}</span>
              </li>
            ))}
            {(!agent.keyPoints || agent.keyPoints.length === 0) && (
              <li className="text-xs text-gray-500">No key points provided.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
