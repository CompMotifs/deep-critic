import { useState } from "react";
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
  
  const promptTemplates = [
    {
      id: "academic",
      name: "Academic Review",
      text: "Please review this academic paper for methodological rigor, clarity of arguments, and contribution to the field. Identify strengths, weaknesses, and suggest improvements."
    },
    {
      id: "legal",
      name: "Legal Analysis",
      text: "Analyze this legal document for clarity, consistency, potential loopholes, and compliance with relevant regulations. Highlight areas that may require further clarification."
    },
    {
      id: "content",
      name: "Content Quality",
      text: "Evaluate this content for clarity, engagement, factual accuracy, and overall quality. Suggest improvements for structure, flow, and audience targeting."
    }
  ];
  
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxChars) {
      onPromptChange(e.target.value);
    }
  };
  
  const insertPromptTemplate = (templateId: string) => {
    const template = promptTemplates.find(t => t.id === templateId);
    if (template) {
      onPromptChange(template.text);
    }
  };
  
  return (
    <div className="mb-8">
      <h3 className="text-md font-medium text-gray-700 mb-2">2. Enter Review Criteria</h3>
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
      <div className="mt-2 flex flex-wrap gap-2">
        {promptTemplates.map(template => (
          <Button
            key={template.id}
            type="button"
            variant="outline"
            size="sm"
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded transition"
            onClick={() => insertPromptTemplate(template.id)}
          >
            {template.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PromptConfig;
