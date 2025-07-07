
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader
        title="Privacy Policy"
        description="Understand how we collect, use, and protect your data."
      />
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <ShieldCheck className="mr-2 h-6 w-6 text-primary" />
            Privacy Policy for SolCraft
          </CardTitle>
          <CardDescription>
            Last Updated: [Insert Date]
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 prose dark:prose-invert max-w-none">
          <div className="p-6 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
            <h3 className="font-semibold text-lg mb-2">Placeholder Content</h3>
            <p className="text-sm">
              The content below is a placeholder and **not** legally binding. 
              You **must** replace this with an actual Privacy Policy drafted by a legal professional 
              before launching your application, ensuring compliance with GDPR, CCPA, and other relevant regulations.
            </p>
          </div>

          <h2 className="font-semibold text-xl">1. Introduction</h2>
          <p>
            SolCraft ("Platform", "we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Services.
          </p>

          <h2 className="font-semibold text-xl">2. Information We Collect</h2>
          <p>
            We may collect personal information that you provide directly to us, such as when you create an account, use our services, or communicate with us. This may include:
          </p>
          <ul className="list-disc pl-6">
            <li>Identity Data (e.g., name, username)</li>
            <li>Contact Data (e.g., email address)</li>
            <li>Financial Data (e.g., transaction history - if applicable and how it's handled)</li>
            <li>Technical Data (e.g., IP address, browser type)</li>
            <li>Usage Data (e.g., information about how you use our Services)</li>
          </ul>

          <h2 className="font-semibold text-xl">3. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6">
            <li>Provide, operate, and maintain our Services</li>
            <li>Improve, personalize, and expand our Services</li>
            <li>Understand and analyze how you use our Services</li>
            <li>Develop new products, services, features, and functionality</li>
            <li>Communicate with you, either directly or through one of our partners</li>
            <li>Process your transactions (if applicable)</li>
            <li>Prevent fraud and ensure security</li>
          </ul>

          <h2 className="font-semibold text-xl">... (Further Sections) ...</h2>
          <p>
            Your full Privacy Policy will include sections on: Sharing Your Information, Data Security, Data Retention, Your Data Protection Rights (e.g., GDPR, CCPA), Use of Cookies and Tracking Technologies, Children's Privacy, Changes to This Policy, Contact Us, etc.
          </p>

          <p className="text-center font-bold py-4">
            [End of Placeholder Content - Consult a Legal Professional]
          </p>
        </CardContent>
      </Card>
    </>
  );
}
