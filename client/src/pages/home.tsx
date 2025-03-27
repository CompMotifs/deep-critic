import { useState } from "react";
import FileUpload from "@/components/file-upload";
import PromptConfig from "@/components/prompt-config";
import AgentSelection from "@/components/agent-selection";
import LoadingState from "@/components/loading-state";
import ResultsDashboard from "@/components/results-dashboard";
import { Button } from "@/components/ui/button";
import { useReviewForm } from "@/hooks/use-review-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<"config" | "loading" | "results">("config");
  const [result, setResult] = useState<any>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  
  const {
    file,
    setFile,
    prompt,
    setPrompt,
    charCount,
    selectedAgents,
    toggleAgent,
    isFormValid,
    resetForm,
  } = useReviewForm();

  const reviewMutation = useMutation({
    mutationFn: async () => {
      if (!file) return;
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prompt", prompt);
      formData.append("agents", JSON.stringify(selectedAgents));
      
      const response = await fetch("/api/review", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || response.statusText);
      }
      
      return await response.json();
    },
    onMutate: () => {
      setStep("loading");
    },
    onSuccess: (data) => {
      if (data?.jobId) {
        setJobId(data.jobId);
        setStep("loading");
      } else {
        toast({
          title: "Error",
          description: "Invalid response from server",
          variant: "destructive",
        });
        setStep("config");
      }
    },
    onError: (error) => {
      toast({
        title: "Error submitting review",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setStep("config");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    reviewMutation.mutate();
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-10 w-10 text-primary-500" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path 
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" 
                />
              </svg>
              <h1 className="text-3xl font-bold text-gray-800">DeepCritic</h1>
            </div>
          </div>
          <p className="mt-2 text-gray-600 max-w-3xl">
            Get comprehensive document reviews from multiple AI models. Upload your PDF, customize your review criteria, and receive detailed insights.
          </p>
        </header>

        {step === "config" && (
          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
            
            <FileUpload
              file={file}
              onFileChange={setFile}
            />
            
            <PromptConfig
              prompt={prompt}
              onPromptChange={setPrompt}
              charCount={charCount}
            />
            
            <AgentSelection
              selectedAgents={selectedAgents}
              onToggleAgent={toggleAgent}
            />
            
            <div className="flex justify-end mt-6">
              <Button
                type="submit"
                size="lg"
                disabled={!isFormValid || reviewMutation.isPending}
                className="bg-primary text-white font-medium"
              >
                Start DeepCritic
              </Button>
            </div>
          </form>
        )}

        {step === "loading" && jobId && (
          <LoadingState 
            jobId={jobId}
            selectedAgents={selectedAgents}
            onAnalysisComplete={(analysisResult) => {
              setResult(analysisResult);
              setStep("results");
            }}
          />
        )}

        {step === "results" && result && (
          <ResultsDashboard 
            result={result}
            onBack={() => {
              setStep("config");
              setJobId(null);
              resetForm();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
