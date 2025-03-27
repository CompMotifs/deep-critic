import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t mt-auto py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 mb-4">
            Find this tool useful? Consider supporting the project or sharing your feedback to report issues.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Button variant="default">
              Support this project
            </Button>
            <Button variant="outline">
              Give Feedback
            </Button>
          </div>
          
          <div className="flex justify-center space-x-4 text-sm text-gray-500 mb-4">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
          </div>
          
          <p className="text-gray-400 text-sm">
            © 2025 DeepCritic. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;