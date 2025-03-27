import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Logo from "@/components/logo";
import Footer from "@/components/footer";

const About: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost" className="font-medium">
              ← Back to Home
            </Button>
          </Link>
          <Logo />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-3xl mx-auto prose">
          <h1>Why We Built This Tool</h1>
          
          <p className="text-lg font-medium text-gray-800 mb-6">
            DeepCritic: Accelerating Science Through Multi-Model Collaboration
          </p>
          
          <p>
            We are a team of UK and US scientists and engineers from the CompMotifs initiative, 
            aiming to accelerate science through computation - Danyal Akarca, Jeff Gerold, 
            Kristina Kordova, Wojtek Treyde and Inga Van den Bossche.
          </p>
          
          <p>
            We wanted to build a tool to help us estimate uncertainty in our own scientific work
            and the work of others.
          </p>
          
          <p>
            While we could work on specific technical approaches such as training models to predict 
            uncertainties or estimating confidence scores for epistemic knowledge in models, we took 
            a different approach - estimating uncertainty through the focused collaboration and 
            competition of models.
          </p>
          
          <h2>Our Approach</h2>
          <p>
            DeepCritic brings together multiple state-of-the-art AI models from different providers
            to analyze documents collaboratively. By comparing insights across diverse models, users
            can identify:
          </p>
          
          <ul>
            <li>Areas of consensus - where multiple models agree, indicating higher confidence</li>
            <li>Areas of disagreement - highlighting potential uncertainties or complex topics</li>
            <li>Unique perspectives - specialized insights that a single model might miss</li>
          </ul>
          
          <h2>Applications in Science</h2>
          <p>
            This approach has particular value in scientific research, where understanding the
            reliability and limitations of findings is crucial. Our tool helps:
          </p>
          
          <ul>
            <li>Researchers identify potential weaknesses in their methodologies before publication</li>
            <li>Reviewers perform more thorough evaluations of scientific papers</li>
            <li>Readers assess the strength of evidence and key limitations of published work</li>
          </ul>
          
          <h2>Future Development</h2>
          <p>
            We continue to refine DeepCritic, working to expand the range of available models,
            improve analysis techniques, and develop specialized prompt templates for different
            scientific disciplines. We welcome feedback from the scientific community to guide
            these efforts.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;