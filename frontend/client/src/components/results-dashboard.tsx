import { useState } from "react";
import { Button } from "@/components/ui/button";
import AgentCard from "@/components/agent-card";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ResultsDashboardProps {
  result: any;
  onBack: () => void;
}

const ResultsDashboard = ({ result, onBack }: ResultsDashboardProps) => {
  const [activeTab, setActiveTab] = useState("key-findings");
  
  const handleExportPDF = async () => {
    const element = document.getElementById('results-section');
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`DeepCritic_Review_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };
  
  return (
    <div id="results-section" className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center mb-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center text-gray-600 mr-4"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
              clipRule="evenodd" 
            />
          </svg>
          Back to Form
        </Button>
      </div>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Document Review Results</h2>
          <p className="text-sm text-gray-600 mt-1">
            {result.metadata?.documentTitle || "document.pdf"} • 
            Analyzed by {result.agentResults?.length || 0} agents
          </p>
        </div>
        <div>
          <Button
            onClick={handleExportPDF}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
            Export as PDF
          </Button>
        </div>
      </div>
      
      {/* Summary Section */}
      <div className="p-5 mb-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Executive Summary</h3>
        <div className="text-sm text-gray-700">
          {result.summary || "No summary available."}
        </div>
      </div>
      
      {/* Comparative Analysis Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button 
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "key-findings" 
                  ? "border-primary-500 text-primary-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("key-findings")}
            >
              Key Findings
            </button>
            <button 
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "strength-comparison" 
                  ? "border-primary-500 text-primary-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("strength-comparison")}
            >
              Strengths & Weaknesses
            </button>
            <button 
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "agent-comparison" 
                  ? "border-primary-500 text-primary-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("agent-comparison")}
            >
              Agent Comparison
            </button>
          </nav>
        </div>
        
        {/* Tab content */}
        <div className="pt-4">
          {/* Key Findings Tab */}
          {activeTab === "key-findings" && (
            <div>
              <ul className="space-y-2">
                {result.keyFindings?.map((finding: any, index: number) => (
                  <li key={index} className="flex items-start">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 ${finding.type === 'strength' ? 'text-primary-500' : 'text-amber-500'} mt-0.5 mr-2 flex-shrink-0`} 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      {finding.type === 'strength' ? (
                        <path 
                          fillRule="evenodd" 
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                          clipRule="evenodd" 
                        />
                      ) : (
                        <path 
                          fillRule="evenodd" 
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                          clipRule="evenodd" 
                        />
                      )}
                    </svg>
                    <span className="text-sm text-gray-700">{finding.text}</span>
                  </li>
                )) || (
                  <li className="text-sm text-gray-500">No key findings available.</li>
                )}
              </ul>
            </div>
          )}
          
          {/* Strengths & Weaknesses Tab */}
          {activeTab === "strength-comparison" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Strengths</h4>
                <ul className="space-y-2">
                  {result.strengths?.map((item: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                      <span className="text-sm text-gray-800">{item}</span>
                    </li>
                  )) || (
                    <li className="text-sm text-gray-500">No strengths identified.</li>
                  )}
                </ul>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Weaknesses</h4>
                <ul className="space-y-2">
                  {result.weaknesses?.map((item: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                      <span className="text-sm text-gray-800">{item}</span>
                    </li>
                  )) || (
                    <li className="text-sm text-gray-500">No weaknesses identified.</li>
                  )}
                </ul>
              </div>
            </div>
          )}
          
          {/* Agent Comparison Tab */}
          {activeTab === "agent-comparison" && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aspect</th>
                    {result.agentResults?.map((agent: any) => (
                      <th key={agent.agentName} className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {agent.agentName}
                      </th>
                    )) || <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No agents</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.comparisonAspects?.map((aspect: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {aspect.name}
                      </td>
                      {result.agentResults?.map((agent: any) => (
                        <td key={`${agent.agentName}-${index}`} className="px-6 py-4 text-sm text-gray-500">
                          {aspect.values[agent.agentName] || "N/A"}
                        </td>
                      ))}
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={result.agentResults?.length + 1 || 2} className="px-6 py-4 text-sm text-gray-500 text-center">
                        No comparison data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Individual Agent Feedback */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Detailed Agent Feedback</h3>
        
        <div className="space-y-6">
          {result.agentResults?.map((agent: any, index: number) => (
            <AgentCard key={index} agent={agent} />
          )) || (
            <p className="text-sm text-gray-500">No agent feedback available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
