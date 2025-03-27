import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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
  
  const paperReviewTemplate = "Please review this academic paper for methodological rigor, clarity of arguments, and contribution to the field. Identify strengths, weaknesses, and suggest improvements.";
  
  const ideaCritiqueTemplate = "Please analyze this idea for innovation, feasibility, market potential, and possible implementation challenges. Provide constructive feedback and suggestions for improvement.";
  
  return (
    <div className="mb-8">
      <h3 className="text-md font-medium text-gray-700 mb-2"><span className="font-bold">Step 2:</span> Enter Review Criteria</h3>
      <div className="relative">
        <Textarea
          id="review-prompt"
          value={prompt}
          onChange={handlePromptChange}
          rows={4}
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Describe what you want DeepCritic to focus on, or select a template below. Be specific about aspects you want analyzed."
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          {charCount}/{maxChars}
        </div>
      </div>
      
      <div className="mt-2 flex flex-wrap gap-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => onPromptChange(paperReviewTemplate)}
          className="text-xs"
        >
          Paper review
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => onPromptChange(ideaCritiqueTemplate)}
          className="text-xs"
        >
          Critique idea
        </Button>
      </div>
    </div>
  );
};

export default PromptConfig;
