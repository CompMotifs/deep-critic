import { Checkbox } from "@/components/ui/checkbox";

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
    description: "Fast, efficient analysis with good attention to detail",
    color: "bg-[#8B5CF6]",
    letter: "C"
  },
  {
    id: "opus",
    name: "Claude 3 Opus",
    description: "Most comprehensive and nuanced analysis",
    color: "bg-[#EC4899]",
    letter: "O"
  },
  {
    id: "mini",
    name: "o3-mini-high",
    description: "Quick high-level overview with good efficiency",
    color: "bg-[#10B981]",
    letter: "M"
  }
];

interface AgentSelectionProps {
  selectedAgents: string[];
  onToggleAgent: (agentId: string) => void;
}

const AgentSelection = ({ selectedAgents, onToggleAgent }: AgentSelectionProps) => {
  return (
    <div className="mb-8">
      <h3 className="text-md font-medium text-gray-700 mb-2">3. Select AI Agents</h3>
      
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
              <span className="text-sm">
                <span className="font-medium text-gray-900 block">{agent.name}</span>
                <span className="text-gray-500">{agent.description}</span>
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentSelection;
