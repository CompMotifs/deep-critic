import { useState, useEffect } from "react";

export function useReviewForm(maxChars = 500) {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [charCount, setCharCount] = useState<number>(0);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  
  // Update character count when prompt changes
  useEffect(() => {
    setCharCount(prompt.length);
  }, [prompt]);
  
  // Validate form
  useEffect(() => {
    const valid = !!file && prompt.trim().length > 0 && selectedAgents.length > 0;
    setIsFormValid(valid);
  }, [file, prompt, selectedAgents]);
  
  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev => {
      if (prev.includes(agentId)) {
        // Remove agent if already selected
        return prev.filter(id => id !== agentId);
      } else {
        // Add agent if not selected
        return [...prev, agentId];
      }
    });
  };
  
  const resetForm = () => {
    setFile(null);
    setPrompt("");
    setSelectedAgents([]);
  };
  
  return {
    file,
    setFile,
    prompt,
    setPrompt,
    charCount,
    selectedAgents,
    toggleAgent,
    isFormValid,
    resetForm,
  };
}
