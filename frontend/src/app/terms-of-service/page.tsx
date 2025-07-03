
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <>
      <PageHeader
        title="Terms of Service"
        description="Please read our Terms of Service carefully."
      />
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <FileText className="mr-2 h-6 w-6 text-primary" />
            Terms of Service for SolCraft
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
              You **must** replace this with actual Terms of Service drafted by a legal professional 
              before launching your application.
            </p>
          </div>

          <h2 className="font-semibold text-xl">1. Introduction</h2>
          <p>
            Welcome to SolCraft ("Platform", "we", "us", or "our"). These Terms of Service ("Terms") govern your access to and use of our website, mobile applications, and services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms.
          </p>

          <h2 className="font-semibold text-xl">2. Eligibility</h2>
          <p>
            You must be at least 18 years old to use our Services. By agreeing to these Terms, you represent and warrant to us that you are at least 18 years old.
          </p>

          <h2 className="font-semibold text-xl">3. Account Registration</h2>
          <p>
            To access certain features of our Services, you may be required to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
          </p>
          
          <h2 className="font-semibold text-xl">4. Use of Services</h2>
          <p>
            You agree to use the Services in compliance with all applicable local, state, national, and international laws, rules, and regulations. You are responsible for your conduct and any data, text, files, information, usernames, images, graphics, photos, profiles, audio and video clips, sounds, musical works, works of authorship, applications, links, and other content or materials (collectively, "Content") that you submit, post, or display on or via the Services.
          </p>

           <h2 className="font-semibold text-xl">5. Financial Disclaimers</h2>
            <p>
                SolCraft provides tools and information related to cryptocurrency and investments. However, we are not a financial advisor, broker, or fiduciary. All investment decisions are made solely by you. Investing in cryptocurrencies and related assets involves significant risk of loss. You should carefully consider whether such investments are suitable for you in light of your financial condition.
            </p>

          <h2 className="font-semibold text-xl">... (Further Sections) ...</h2>
          <p>
            Your full Terms of Service will include sections on: Prohibited Activities, Intellectual Property, Third-Party Links, Disclaimers, Limitation of Liability, Indemnification, Governing Law, Dispute Resolution, Changes to Terms, Termination, Contact Information, etc.
          </p>
          
          <p className="text-center font-bold py-4">
            [End of Placeholder Content - Consult a Legal Professional]
          </p>
        </CardContent>
      </Card>
    </>
  );
}
