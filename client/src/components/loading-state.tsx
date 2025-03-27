import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { useJobWebSocket } from "@/hooks/use-job-websocket";

interface LoadingStateProps {
  jobId: string;
  selectedAgents: string[];
  onAnalysisComplete?: (result: any) => void;
}

type Agent = {
  id: string;
  name: string;
  status: "waiting" | "processing" | "completed" | "failed";
  color: string;
  letter: string;
};

// Agent configuration mapping
const agentConfig: Record<string, { name: string, color: string, letter: string }> = {
  "claude-3.7-sonnet": {
    name: "Claude 3.7 Sonnet",
    color: "text-[#8B5CF6]",
    letter: "C"
  },
  "claude-3-opus": {
    name: "Claude 3 Opus",
    color: "text-[#EC4899]",
    letter: "O"
  },
  "gpt-4o": {
    name: "GPT-4o",
    color: "text-[#10B981]",
    letter: "G"
  },
  "deepseek": {
    name: "DeepSeek",
    color: "text-[#3B82F6]",
    letter: "D"
  }
};

const LoadingState = ({ jobId, selectedAgents, onAnalysisComplete }: LoadingStateProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState("Initializing analysis");
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [agents, setAgents] = useState<Agent[]>(() => 
    selectedAgents.map(id => ({
      id,
      name: agentConfig[id]?.name || id,
      status: "waiting",
      color: agentConfig[id]?.color || "text-gray-500",
      letter: agentConfig[id]?.letter || id.charAt(0).toUpperCase()
    }))
  );
  
  // Use WebSocket for real-time updates
  const { connected, jobStatus, error } = useJobWebSocket(jobId);
  
  // Update UI based on WebSocket updates
  useEffect(() => {
    if (jobStatus) {
      setProgress(jobStatus.progress);
      setCurrentStage(jobStatus.stage);
      
      if (jobStatus.estimatedTimeRemaining !== undefined) {
        setTimeRemaining(jobStatus.estimatedTimeRemaining);
      }
      
      // If we have per-agent status, update that too (assuming it's in the jobStatus data)
      if (jobStatus.agentStatuses) {
        setAgents(prevAgents => 
          prevAgents.map(agent => ({
            ...agent,
            status: jobStatus.agentStatuses?.[agent.id] || agent.status
          }))
        );
      }
      
      // If analysis is complete, call the completion handler
      if (jobStatus.status === 'completed' && jobStatus.result && onAnalysisComplete) {
        onAnalysisComplete(jobStatus.result);
      }
    }
  }, [jobStatus, onAnalysisComplete]);
  
  // Update time remaining countdown
  useEffect(() => {
    if (progress >= 1) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [progress]);
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Processing Your Document</h2>
      
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-500">{Math.round(progress * 100)}%</span>
          </div>
          <Progress className="w-full bg-gray-200 rounded-full h-2.5" value={progress * 100} />
          <p className="mt-2 text-sm text-gray-600">
            <span>{currentStage}</span> •&nbsp;
            <span>About {timeRemaining > 60 
              ? `${Math.ceil(timeRemaining / 60)} minutes` 
              : `${timeRemaining} seconds`} remaining
            </span>
          </p>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-md font-medium text-gray-700 mb-3">Agent Status</h3>
          
          <div className="space-y-3">
            {agents.map(agent => (
              <div key={agent.id} className="flex items-center">
                <div className="relative w-8 h-8 mr-3">
                  {agent.status === "processing" ? (
                    <>
                      <span className={`absolute inset-0 text-sm flex items-center justify-center rounded-full ${agent.color.replace('text-', 'bg-')} text-white`}>
                        {agent.letter}
                      </span>
                      <svg className={`animate-spin absolute inset-0 w-8 h-8 ${agent.color}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </>
                  ) : (
                    <span className={`text-sm flex items-center justify-center rounded-full ${agent.status === "completed" 
                      ? `${agent.color.replace('text-', 'bg-')} text-white` 
                      : 'bg-gray-200 text-gray-600'} w-8 h-8`}>
                      {agent.letter}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">{agent.name}</p>
                  <p className="text-xs text-gray-500">
                    {agent.status === "processing" ? "Processing document..." : 
                     agent.status === "completed" ? "Analysis complete" : 
                     "Waiting in queue..."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
