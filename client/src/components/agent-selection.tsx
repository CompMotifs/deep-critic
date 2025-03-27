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
  // Anthropic Models
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
    id: "haiku",
    name: "Claude 3 Haiku",
    description: "Quick high-level overview with excellent efficiency. Best for simpler documents or time-sensitive reviews.",
    color: "bg-[#10B981]",
    letter: "H"
  },
  
  // OpenAI Models
  {
    id: "gpt4o",
    name: "GPT-4o",
    description: "OpenAI's most capable multimodal model. Excellent at understanding complex documents with charts and diagrams.",
    color: "bg-[#34D399]",
    letter: "G4"
  },
  {
    id: "gpt4",
    name: "GPT-4 Turbo",
    description: "Powerful analysis with a strong understanding of context and reasoning. Good for complex document analysis.",
    color: "bg-[#22C55E]",
    letter: "G4T"
  },
  {
    id: "gpt35",
    name: "GPT-3.5 Turbo",
    description: "Fast, efficient analysis for straightforward documents. Good cost-to-performance ratio.",
    color: "bg-[#16A34A]",
    letter: "G3"
  },
  
  // DeepSeek Models
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
  },
  
  // Mistral Models
  {
    id: "mistral-large",
    name: "Mistral Large",
    description: "Mistral's flagship model with strong reasoning and analytical capabilities.",
    color: "bg-[#A855F7]",
    letter: "ML"
  },
  {
    id: "mistral-medium",
    name: "Mistral Medium",
    description: "Well-balanced model for most document analysis tasks. Good performance at a lower cost.",
    color: "bg-[#9333EA]",
    letter: "MM"
  },
  
  // Llama Models
  {
    id: "llama-3",
    name: "Llama 3",
    description: "Meta's powerful open model with strong reasoning capabilities.",
    color: "bg-[#F97316]",
    letter: "L3"
  },
  {
    id: "llama-2",
    name: "Llama 2",
    description: "Reliable analysis from Meta's earlier model. Good for simpler document reviews.",
    color: "bg-[#EA580C]",
    letter: "L2"
  }
];

interface AgentSelectionProps {
  selectedAgents: string[];
  onToggleAgent: (agentId: string) => void;
}

const MAX_AGENTS = 6;

const AgentSelection = ({ selectedAgents, onToggleAgent }: AgentSelectionProps) => {
  
  const handleSelectAll = () => {
    // Only select up to MAX_AGENTS
    const availableSlots = MAX_AGENTS - selectedAgents.length;
    if (availableSlots <= 0) return;
    
    // Get agents that aren't already selected
    const unselectedAgents = agents
      .filter(agent => !selectedAgents.includes(agent.id))
      .slice(0, availableSlots);
      
    unselectedAgents.forEach(agent => {
      onToggleAgent(agent.id);
    });
  };

  const handleClearAll = () => {
    selectedAgents.forEach(agentId => {
      onToggleAgent(agentId);
    });
  };
  
  const handleToggleAgent = (agentId: string) => {
    // If agent is already selected, allow deselecting
    if (selectedAgents.includes(agentId)) {
      onToggleAgent(agentId);
      return;
    }
    
    // If not already selected, only allow selection if under the limit
    if (selectedAgents.length < MAX_AGENTS) {
      onToggleAgent(agentId);
    }
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-md font-medium text-gray-700">Step 3: Select AI Agents</h3>
          <p className="text-xs text-gray-500 mt-1">Select up to {MAX_AGENTS} agents for document analysis</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            type="button"
            onClick={handleClearAll}
            disabled={selectedAgents.length === 0}
          >
            Clear All
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
        {agents.map(agent => {
          const isSelected = selectedAgents.includes(agent.id);
          const isDisabled = !isSelected && selectedAgents.length >= MAX_AGENTS;
          
          return (
            <div 
              key={agent.id} 
              className={`relative border rounded-lg p-2 transition ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm cursor-pointer'
              }`}
            >
              <Checkbox
                id={`agent-${agent.id}`}
                checked={isSelected}
                onCheckedChange={() => handleToggleAgent(agent.id)}
                disabled={isDisabled}
                className="absolute top-2 right-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label 
                      htmlFor={`agent-${agent.id}`} 
                      className={`flex items-start ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span className="flex h-6 items-center">
                        <span className={`text-sm w-6 h-6 rounded-full flex items-center justify-center ${agent.color} text-white mr-2`}>
                          {agent.letter}
                        </span>
                      </span>
                      <div className="text-sm">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">{agent.name}</span>
                        </div>
                      </div>
                    </label>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="max-w-xs">{agent.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        })}
      </div>
      
      {selectedAgents.length >= MAX_AGENTS && (
        <p className="text-amber-600 text-xs mt-2">
          You've reached the maximum limit of {MAX_AGENTS} agents. Deselect an agent to select a different one.
        </p>
      )}
    </div>
  );
};

export default AgentSelection;
