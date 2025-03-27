import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useJobWebSocket } from "@/hooks/use-job-websocket";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoadingStateProps {
  jobId: string;
  selectedAgents: string[];
  onAnalysisComplete?: (result: any) => void;
  onCancel?: () => void;
}

type Agent = {
  id: string;
  name: string;
  status: "waiting" | "processing" | "completed" | "failed";
  color: string;
  letter: string;
};

// Agent configuration mapping - using friendly display names
const agentConfig: Record<string, { name: string, color: string, letter: string }> = {
  "claude": {
    name: "Claude 3.7 Sonnet",
    color: "text-[#8B5CF6]",
    letter: "C"
  },
  "opus": {
    name: "Claude 3 Opus",
    color: "text-[#EC4899]",
    letter: "O"
  },
  "mini": {
    name: "o3-mini-high",
    color: "text-[#10B981]",
    letter: "M"
  },
  "deepseek-lite": {
    name: "DeepSeek Lite",
    color: "text-[#3B82F6]",
    letter: "D"
  },
  "deepseek-coder": {
    name: "DeepSeek Coder",
    color: "text-[#6366F1]",
    letter: "DC"
  }
};

const LoadingState = ({ jobId, selectedAgents, onAnalysisComplete, onCancel }: LoadingStateProps) => {
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState("Preparing document for analysis");
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const [completedModels, setCompletedModels] = useState<string[]>([]);
  const [remainingModels, setRemainingModels] = useState<string[]>([...selectedAgents]);
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
  
  // Show connection error if applicable
  useEffect(() => {
    if (error) {
      toast({
        title: "Connection Error",
        description: "Lost connection to the server. Status updates may be delayed.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Update UI based on WebSocket updates
  useEffect(() => {
    if (jobStatus) {
      setProgress(jobStatus.progress);
      setCurrentStage(jobStatus.stage);
      
      if (jobStatus.estimatedTimeRemaining !== undefined) {
        setTimeRemaining(jobStatus.estimatedTimeRemaining);
      }
      
      // Update current model and completed/remaining models if available
      if (jobStatus.currentModel) {
        setCurrentModel(jobStatus.currentModel);
      }
      
      if (jobStatus.completedModels) {
        setCompletedModels(jobStatus.completedModels);
      }
      
      if (jobStatus.remainingModels) {
        setRemainingModels(jobStatus.remainingModels);
      }
      
      // If we have per-agent status, update that too
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

  // Format time remaining in a friendly way
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) {
      const minutes = Math.ceil(seconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.ceil((seconds % 3600) / 60);
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };
  
  const handleCancel = () => {
    if (onCancel) {
      // Ask for confirmation before canceling
      if (window.confirm("Are you sure you want to cancel this analysis? All progress will be lost.")) {
        onCancel();
      }
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Analyzing Your Document</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={18} className="mr-1" />
          Cancel
        </Button>
      </div>
      
      <div className="space-y-8">
        {/* Overall Progress Section */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-500">{Math.round(progress * 100)}%</span>
          </div>
          <Progress className="w-full bg-gray-200 rounded-full h-2.5" value={progress * 100} />
          <div className="mt-2 flex flex-col sm:flex-row sm:justify-between text-sm text-gray-600">
            <div className="mb-1 sm:mb-0">
              <span className="font-medium">Current Stage: </span>
              <span>{currentStage}</span>
            </div>
            <div>
              <span className="font-medium">Estimated Time: </span>
              <span>{formatTimeRemaining(timeRemaining)}</span>
            </div>
          </div>
        </div>
        
        {/* Currently Processing Section */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h3 className="text-md font-medium text-blue-800 mb-3">Currently Processing</h3>
          {currentModel ? (
            <div className="flex items-center">
              <div className="relative w-8 h-8 mr-3">
                <svg className="animate-spin w-8 h-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div>
                <p className="font-medium text-blue-900">
                  {agentConfig[currentModel]?.name || currentModel}
                </p>
                <p className="text-xs text-blue-700">
                  Analyzing document content...
                </p>
              </div>
            </div>
          ) : (
            <p className="text-blue-700">Preparing to start analysis...</p>
          )}
        </div>
        
        {/* Agent Status Section */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-md font-medium text-gray-700 mb-3">Agent Status</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map(agent => (
              <div key={agent.id} className="flex items-center p-3 rounded-lg border border-gray-200">
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
                      : agent.status === "failed"
                      ? 'bg-red-500 text-white'
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
                     agent.status === "failed" ? "Analysis failed" :
                     "Waiting in queue..."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Connection Status */}
        {!connected && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            Attempting to connect to the server for real-time updates...
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingState;
