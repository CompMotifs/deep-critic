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
      setResult(data);
      setStep("results");
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
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" 
                  clipRule="evenodd" 
                />
              </svg>
              <h1 className="text-3xl font-bold text-gray-800">DeepCritic</h1>
            </div>
            <nav>
              <ul className="flex space-x-6">
                <li><a href="#" className="text-gray-600 hover:text-primary-500">Home</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary-500">History</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary-500">Help</a></li>
              </ul>
            </nav>
          </div>
          <p className="mt-2 text-gray-600 max-w-3xl">
            Get comprehensive document reviews from multiple AI models. Upload your PDF, customize your review criteria, and receive detailed insights.
          </p>
        </header>

        {step === "config" && (
          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Review Configuration</h2>
            
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
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!isFormValid || reviewMutation.isPending}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                DeepCritic Search
              </Button>
            </div>
          </form>
        )}

        {step === "loading" && (
          <LoadingState progress={reviewMutation.isPending ? 0.45 : 1} />
        )}

        {step === "results" && result && (
          <ResultsDashboard 
            result={result}
            onBack={() => {
              setStep("config");
              resetForm();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
