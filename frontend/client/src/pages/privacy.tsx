import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Logo from "@/components/logo";

const Privacy: React.FC = () => {
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
          <h1>Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last updated: March 27, 2025</p>
          
          <h2>1. Introduction</h2>
          <p>
            This Privacy Policy describes how DeepCritic ("we", "our", or "us") collects, uses, and shares your personal information when you use our document analysis service at deepcritic.com ("Service").
          </p>
          
          <h2>2. Information We Collect</h2>
          <p>
            When you use our Service, we may collect the following types of information:
          </p>
          <ul>
            <li><strong>Document Content:</strong> The documents you upload for analysis</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our Service</li>
            <li><strong>Device Information:</strong> Information about the device you use to access our Service</li>
          </ul>
          
          <h2>3. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Provide, maintain, and improve our Service</li>
            <li>Process and analyze documents as requested</li>
            <li>Respond to your requests and support needs</li>
            <li>Monitor and analyze usage patterns and trends</li>
          </ul>
          
          <h2>4. Data Retention</h2>
          <p>
            We retain your documents and analysis results for a limited period to provide the Service. You can request deletion of your data at any time.
          </p>
          
          <h2>5. Data Sharing</h2>
          <p>
            We do not sell your personal information or document content. We may share information with:
          </p>
          <ul>
            <li>Service providers that help us deliver our Service</li>
            <li>Legal authorities when required by law</li>
          </ul>
          
          <h2>6. Your Rights</h2>
          <p>
            Depending on your location, you may have rights regarding your personal information, including:
          </p>
          <ul>
            <li>Access to your data</li>
            <li>Correction of inaccurate data</li>
            <li>Deletion of your data</li>
            <li>Objection to certain processing</li>
          </ul>
          
          <h2>7. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
          </p>
          
          <h2>8. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at privacy@deepcritic.com.
          </p>
        </div>
      </main>
      
      <footer className="bg-gray-50 border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © 2025 DeepCritic. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Privacy;