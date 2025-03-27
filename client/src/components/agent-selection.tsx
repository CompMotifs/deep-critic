import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

type Agent = {
  id: string;
  name: string;
  description: string;
  color: string;
  letter: string;
};

const agents: Agent[] = [
  {
    id: "claude",
    name: "Claude 3.7 Sonnet",
    description: "Fast and efficient analysis with strong performance across tasks. Good balance of speed and quality.",
    color: "bg-[#8B5CF6]",
    letter: "C"
  },
  {
    id: "opus",
    name: "Claude 3 Opus",
    description: "Most comprehensive and nuanced analysis. Highest quality but slower processing time.",
    color: "bg-[#EC4899]",
    letter: "O"
  },
  {
    id: "mini",
    name: "o3-mini-high",
    description: "Quick high-level overview with excellent efficiency. Best for simpler documents or time-sensitive reviews.",
    color: "bg-[#10B981]",
    letter: "M"
  },
  {
    id: "deepseek-lite",
    name: "DeepSeek Lite",
    description: "Comprehensive document analysis with DeepSeek's AI technology. Good for general purpose reviews.",
    color: "bg-[#3B82F6]",
    letter: "D"
  },
  {
    id: "deepseek-coder",
    name: "DeepSeek Coder",
    description: "Specialized for technical document and code review. Ideal for analyzing technical papers and software documentation.",
    color: "bg-[#6366F1]",
    letter: "DC"
  }
];

interface AgentSelectionProps {
  selectedAgents: string[];
  onToggleAgent: (agentId: string) => void;
}

const AgentSelection = ({ selectedAgents, onToggleAgent }: AgentSelectionProps) => {
  
  const handleSelectAll = () => {
    agents.forEach(agent => {
      if (!selectedAgents.includes(agent.id)) {
        onToggleAgent(agent.id);
      }
    });
  };

  const handleClearAll = () => {
    selectedAgents.forEach(agentId => {
      onToggleAgent(agentId);
    });
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-medium text-gray-700">Step 3: Select AI Agents</h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            type="button"
            onClick={handleSelectAll}
          >
            Select All
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            type="button"
            onClick={handleClearAll}
          >
            Clear All
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
        {agents.map(agent => (
          <div key={agent.id} className="relative border rounded-lg p-4 hover:shadow-sm transition cursor-pointer">
            <Checkbox
              id={`agent-${agent.id}`}
              checked={selectedAgents.includes(agent.id)}
              onCheckedChange={() => onToggleAgent(agent.id)}
              className="absolute top-3 right-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label 
              htmlFor={`agent-${agent.id}`} 
              className="flex items-start cursor-pointer"
            >
              <span className="flex h-6 items-center">
                <span className={`text-lg w-8 h-8 rounded-full flex items-center justify-center ${agent.color} text-white mr-3`}>
                  {agent.letter}
                </span>
              </span>
              <div className="text-sm">
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">{agent.name}</span>
                  <button 
                    className="ml-1 text-gray-400 hover:text-gray-600" 
                    title={agent.description}
                  >
                    <Info size={14} />
                  </button>
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentSelection;
