
'use client'; // Add this directive

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Users, Zap, Target, Eye, Cpu, Link2 } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About SolCraft"
        description="Pioneering the next generation of trading infrastructure on the Solana blockchain."
      />
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-8 w-8 text-primary" />
              <CardTitle className="font-headline text-2xl">Our Mission</CardTitle>
            </div>
            <CardDescription>
              To empower developers and users with a secure, scalable, and efficient Layer 2 solution on Solana, unlocking the full potential of decentralized finance, NFTs, and cross-chain interoperability.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We believe in a future where blockchain technology is seamlessly integrated into everyday applications. SolCraft is dedicated to removing barriers to entry, providing robust tools for builders, and fostering a vibrant ecosystem where innovation can thrive. Our focus is on delivering unparalleled performance and user experience.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
             <div className="flex items-center gap-3 mb-2">
              <Eye className="h-8 w-8 text-primary" />
              <CardTitle className="font-headline text-2xl">Our Vision</CardTitle>
            </div>
            <CardDescription>
              To be the leading Layer 2 platform on Solana, recognized for our cutting-edge technology, unwavering commitment to security, and our role in catalyzing the mass adoption of decentralized applications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We envision a multi-chain world where assets and data flow freely and securely. SolCraft aims to be a critical bridge in this world, connecting Solana to other major blockchains and providing the infrastructure needed for the next wave of digital innovation, from advanced DeFi protocols to immersive GameFi experiences.
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Cpu className="h-8 w-8 text-primary" />
              <CardTitle className="font-headline text-2xl">Our Technology</CardTitle>
            </div>
             <CardDescription>
              SolCraft leverages a state-of-the-art Layer 2 architecture designed for speed, low transaction costs, and enhanced security.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Scalability & Speed</h4>
                <p className="text-sm text-muted-foreground">Our L2 solution drastically increases transaction throughput while maintaining compatibility with Solana's core infrastructure.</p>
              </div>
            </div>
             <div className="flex items-start gap-3">
              <Link2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Cross-Chain Capabilities</h4>
                <p className="text-sm text-muted-foreground">Secure and efficient bridging technology to connect Solana with other leading blockchain networks, enabling seamless asset transfers.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Developer-Friendly Tools</h4>
                <p className="text-sm text-muted-foreground">Comprehensive SDKs, APIs, and a supportive environment to help developers build and deploy innovative dApps with ease.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
             <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-primary" />
              <CardTitle className="font-headline text-2xl">Meet The Team</CardTitle>
            </div>
            <CardDescription>
              The minds behind SolCraft. (More details coming soon!)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8 md:py-12">
            <Image
              src="https://placehold.co/400x300.png"
              alt="SolCraft Team - Innovators and Builders"
              width={400}
              height={300}
              className="rounded-lg shadow-lg mb-6"
              data-ai-hint="team collaboration technology"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300.png'; (e.target as HTMLImageElement).alt = 'Placeholder SolCraft Team';}}
            />
            <p className="text-lg text-muted-foreground">
              Our team consists of experienced blockchain developers, security experts, and visionaries passionate about decentralization. Full profiles and more information will be available soon!
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
