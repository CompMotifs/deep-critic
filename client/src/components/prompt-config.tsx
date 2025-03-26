import { Textarea } from "@/components/ui/textarea";

interface PromptConfigProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  charCount: number;
  maxChars?: number;
}

const PromptConfig = ({ 
  prompt, 
  onPromptChange, 
  charCount, 
  maxChars = 500 
}: PromptConfigProps) => {
  
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxChars) {
      onPromptChange(e.target.value);
    }
  };
  
  return (
    <div className="mb-8">
      <h3 className="text-md font-medium text-gray-700 mb-2">Step 2: Enter Review Criteria</h3>
      <div className="relative">
        <Textarea
          id="review-prompt"
          value={prompt}
          onChange={handlePromptChange}
          rows={4}
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Example: Please review this document for logical consistency, factual accuracy, and strength of arguments. Identify key strengths and weaknesses."
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          {charCount}/{maxChars}
        </div>
      </div>
    </div>
  );
};

export default PromptConfig;
