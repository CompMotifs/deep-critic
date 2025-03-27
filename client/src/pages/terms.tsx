import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Logo from "@/components/logo";

const Terms: React.FC = () => {
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
          <h1>Terms of Service</h1>
          <p className="text-sm text-gray-500">Last updated: March 27, 2025</p>
          
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the DeepCritic service ("Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using the Service.
          </p>
          
          <h2>2. Use of Service</h2>
          <p>
            DeepCritic provides document analysis and feedback using artificial intelligence. You may use the Service for:
          </p>
          <ul>
            <li>Analyzing academic papers, research documents, and other written works</li>
            <li>Receiving automated feedback and critique on documents</li>
            <li>Comparing analyses from multiple AI models</li>
          </ul>
          
          <h2>3. User Accounts</h2>
          <p>
            Some features of the Service may require registration. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
          </p>
          
          <h2>4. Content</h2>
          <p>
            You retain all rights to the documents you upload. By using the Service, you grant us a limited license to process and analyze your documents solely for the purpose of providing the Service.
          </p>
          
          <h2>5. Prohibited Uses</h2>
          <p>
            You may not use the Service for any illegal or unauthorized purpose, including but not limited to:
          </p>
          <ul>
            <li>Uploading content that infringes on intellectual property rights</li>
            <li>Attempting to interfere with or compromise the system integrity or security</li>
            <li>Using the Service to spread harmful or malicious content</li>
          </ul>
          
          <h2>6. Intellectual Property</h2>
          <p>
            The Service, including its software, design, and content created by us, is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used without our prior written permission.
          </p>
          
          <h2>7. Limitation of Liability</h2>
          <p>
            The Service is provided "as is" without warranties of any kind. In no event shall DeepCritic be liable for any damages arising out of the use or inability to use the Service.
          </p>
          
          <h2>8. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will provide notice of significant changes by updating the date at the top of these terms.
          </p>
          
          <h2>9. Governing Law</h2>
          <p>
            These terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of law provisions.
          </p>
          
          <h2>10. Contact</h2>
          <p>
            For questions about these Terms of Service, please contact us at terms@deepcritic.com.
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

export default Terms;