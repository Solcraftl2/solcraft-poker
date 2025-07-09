
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight, Network, ShieldCheck, ArrowRightLeft, Coins, ListChecks, LockKeyhole, Rocket, Bot, Award, FileScan, PieChart, Users, GitFork, BarChart, Layers, Zap, Smile, Linkedin, Twitter, LogIn } from 'lucide-react';
import Image from 'next/image';
import type { RoadmapItemProps } from '@/lib/types';
import { roadmapItems } from '@/lib/mock-data';
import { useState } from 'react';
import { ConnectWalletDialogReal } from '@/components/shared/connect-wallet-dialog-real';
import { useRouter } from 'next/navigation';
// for the purpose
const RoadmapItem: React.FC<RoadmapItemProps> = ({ quarter, year, milestones, isOffset, isLast }) => {
  return (
    <div className={`relative flex items-start ${isOffset ? 'md:ml-[calc(50%+2rem)]' : 'md:mr-[calc(50%+2rem)]'} md:w-[calc(50%-2rem)] mb-12`}>
      {!isLast && (
        <div className={`hidden md:block absolute top-5 ${isOffset ? 'right-full mr-4' : 'left-full ml-4'} w-16 h-px bg-purple-500/50`}></div>
      )}
      <div className={`hidden md:block absolute top-5 ${isOffset ? 'right-[calc(100%+0.5rem)]' : 'left-[calc(100%+0.5rem)]'} w-4 h-4 bg-purple-500 rounded-full border-2 border-black`}></div>
      
      <div className="bg-purple-600/10 backdrop-blur-sm p-6 rounded-lg shadow-xl w-full">
        <h4 className="text-xl font-semibold text-purple-400 mb-3">{quarter} {year}</h4>
        <ul className="space-y-2">
          {milestones.map((milestone, index) => (
            <li key={index} className="text-sm text-gray-300 flex items-start">
              <GitFork className="h-4 w-4 mr-2 mt-0.5 text-purple-400 shrink-0" />
              {milestone}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const TokenomicsChart = () => {
  const data = [
    { name: "Liquidity", value: 35, color: "hsl(var(--primary))" },
    { name: "Presale", value: 20, color: "hsl(270,70%,60%)" },
    { name: "Staking", value: 15, color: "hsl(var(--chart-2))" }, // Accent - Teal/Green
    { name: "Team", value: 15, color: "hsl(240,60%,65%)" },
    { name: "Marketing", value: 15, color: "hsl(220,60%,70%)" }
  ];

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="relative w-56 h-56 md:w-64 md:h-64">
      <svg viewBox="0 0 160 160" className="transform -rotate-90 w-full h-full">
        {data.map((item, index) => {
          const strokeDashoffset = circumference - (item.value / 100) * circumference;
          const rotation = (accumulatedOffset / 100) * 360;
          accumulatedOffset += item.value;
          return (
            <circle
              key={item.name}
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke={item.color}
              strokeWidth="20"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(${rotation} 80 80)`}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <PieChart className="w-12 h-12 text-purple-400" />
      </div>
    </div>
  );
};


export default function LandingPage() {
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const router = useRouter();
  
  const handleLaunchApp = () => {
    setIsWalletDialogOpen(true);
  };
  
  const handleWalletConnect = (walletName: string) => {
    // Simulate wallet connection
    console.log(`Connecting to ${walletName}...`);
    setIsWalletDialogOpen(false);
    
    // Redirect to dashboard after successful connection
    router.push('/dashboard');
  };

  const featureCardBaseClass = "bg-purple-600/10 backdrop-blur-sm p-6 rounded-lg shadow-xl h-full flex flex-col";
  const featureCardTitleClass = "text-lg font-semibold mb-2 text-white flex items-center";
  const featureCardIconClass = "mr-3 h-6 w-6 text-purple-400";
  const featureCardDescriptionClass = "text-sm text-gray-300 flex-grow";


  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-body">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 py-4 md:py-6">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold font-headline">
             <span className="bg-gradient-to-r from-[#E573A5] to-[#73D2E5] text-transparent bg-clip-text">
              SolCraft
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-1 md:space-x-2 bg-gray-800/50 backdrop-blur-sm p-2 rounded-full">
            <Link href="#about-section" className="text-xs sm:text-sm hover:text-purple-400 transition-colors px-2 py-1 sm:px-3">
              About
            </Link>
            <Link href="#features-section" className="text-xs sm:text-sm hover:text-purple-400 transition-colors px-2 py-1 sm:px-3">
              Features
            </Link>
             <Link href="#launchpad-section" className="text-xs sm:text-sm hover:text-purple-400 transition-colors px-2 py-1 sm:px-3">
              Launchpad
            </Link>
            <Link href="#roadmap-section" className="text-xs sm:text-sm hover:text-purple-400 transition-colors px-2 py-1 sm:px-3">
              Roadmap
            </Link>
            <Link href="#tokenomics-section" className="text-xs sm:text-sm hover:text-purple-400 transition-colors px-2 py-1 sm:px-3">
              Tokenomics
            </Link>
            <Link href="#team-section" className="text-xs sm:text-sm hover:text-purple-400 transition-colors px-2 py-1 sm:px-3">
              Team
            </Link>
          </nav>
          <Button variant="outline" className="text-white border-purple-500 hover:bg-purple-600 hover:text-white text-xs sm:text-sm" onClick={handleLaunchApp}>
            Launch App
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section id="hero-section" className="container mx-auto px-4 md:px-6 py-20 md:py-32 flex flex-col md:flex-row items-start md:gap-12">
          <div className="md:w-1/2 text-left">
            <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="block text-purple-400">The New Era of the</span>
              <span className="block">Solana Blockchain Security and Scalability with Our Layer 2</span>
            </h1>
            <p className="max-w-xl text-base sm:text-lg md:text-xl text-gray-300 mb-10">
              We're supercharging Solana with an innovative Layer 2, offering unprecedented scalability, a secure cross-chain bridge, optimized swaps, and a launchpad for the tokens of the future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-3 rounded-lg font-semibold" asChild>
                <Link href="/dashboard">
                  Explore the features
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-purple-500 hover:bg-purple-600 hover:text-white text-lg px-8 py-3 rounded-lg font-semibold" onClick={handleLaunchApp}>
                Launch App
                <LogIn className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center items-center">
            <Image 
              src="[url=https://postimg.cc/Fk52M4cX][img]https://i.postimg.cc/Fk52M4cX/7.jpg[/img][/url]" 
              alt="Solcraft Platform Visual" 
              width={600} 
              height={400} 
              className="rounded-lg shadow-2xl"
              data-ai-hint="blockchain poker"
            />
          </div>
        </section>

        {/* About Us Section */}
        <section id="about-section" className="py-16 md:py-24 bg-gray-900/30">
          <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-headline text-3xl font-bold mb-6 text-purple-400">About Us – SolCraft</h2>
              <div className="text-gray-300 text-base sm:text-lg leading-relaxed space-y-4">
                <p>
                  SolCraft is an innovative Layer 2 solution built on the Solana blockchain, designed to unlock the full potential of DeFi, NFTs, and cross-chain interoperability. Our mission is to simplify access to blockchain technology while ensuring speed, scalability, and security for developers and users alike.
                </p>
                <p>
                  We are focused on creating powerful tools, launching scalable infrastructure, and supporting the next generation of decentralized applications. With a strong roadmap, transparent development, and community-driven governance, SolCraft is setting new standards for blockchain usability and performance.
                </p>
                <p>
                  Whether you're a builder, investor, or enthusiast — SolCraft is your gateway to a faster, smarter decentralized future.
                </p>
              </div>
            </div>
            <div className="hidden md:flex justify-center items-center">
               <Image 
                src="https://i.postimg.cc/D08nbfw0/7.jpg" 
                alt="Solcraft Layer Structure" 
                width={300} 
                height={300} 
                className="rounded-lg shadow-2xl opacity-70"
                data-ai-hint="blockchain layer structure"
              />
            </div>
          </div>
        </section>

        {/* Features Section (Cross-chain) */}
        <section id="features-section" className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-16 md:mb-24">
              <h2 className="font-headline text-3xl sm:text-4xl font-bold mb-4 text-center text-purple-400">Cross-Chain Transfers Made Easy</h2>
              <p className="text-center text-gray-400 max-w-3xl mx-auto mb-12">
                Seamlessly transfer assets between Solana, Ethereum, and other blockchains with SolCraft's secure, fast cross-chain bridge. Unlock the full potential of your digital assets with Layer 2 speed and security.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div className={featureCardBaseClass}>
                  <h3 className={featureCardTitleClass}><Network className={featureCardIconClass} />Expanding Network Support</h3>
                  <p className={featureCardDescriptionClass}>With an ever-growing list of supported blockchains, SolCraft is committed to making cross-chain transfers faster and more accessible.</p>
                </div>
                <div className={featureCardBaseClass}>
                  <h3 className={featureCardTitleClass}><ShieldCheck className={featureCardIconClass} />Robust Security, Every Step of the Way</h3>
                  <p className={featureCardDescriptionClass}>Our advanced security protocols ensure that every transfer is protected. Transfer your assets with confidence, knowing your funds are secure.</p>
                </div>
                <div className={featureCardBaseClass}>
                  <h3 className={featureCardTitleClass}><ArrowRightLeft className={featureCardIconClass} />Effortless Asset Movement</h3>
                  <p className={featureCardDescriptionClass}>Transfer assets easily between Solana and other blockchains with just a few clicks. Enjoy seamless connectivity and flexibility across supported networks.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SolCraft Launchpad Section */}
        <section id="launchpad-section" className="py-16 md:py-24 bg-gray-900/30">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="font-headline text-3xl sm:text-4xl font-bold mb-12 text-center text-purple-400">SolCraft Launchpad <br className="sm:hidden"/> Where Innovation Takes Flight</h2>
             <div className="grid md:grid-cols-3 gap-8">
                <div className={featureCardBaseClass}>
                  <h3 className={featureCardTitleClass}><BarChart className={featureCardIconClass} />Best Rate Execution</h3>
                  <p className={featureCardDescriptionClass}>Our intelligent routing algorithms scan multiple Solana DEXs to find the most advantageous swap path, maximizing your returns.</p>
                </div>
                <div className={featureCardBaseClass}>
                  <h3 className={featureCardTitleClass}><Layers className={featureCardIconClass} />Deep Liquidity Access</h3>
                  <p className={featureCardDescriptionClass}>Tap into aggregated liquidity pools. Swap large amounts with minimal price impact, ensuring efficient trading.</p>
                </div>
                <div className={featureCardBaseClass}>
                  <h3 className={featureCardTitleClass}><ShieldCheck className={featureCardIconClass} />Slippage Protection</h3>
                  <p className={featureCardDescriptionClass}>Advanced settings and optimized routing protect trades from unexpected price movements, ensuring you get expected token amounts.</p>
                </div>
                <div className={featureCardBaseClass}>
                  <h3 className={featureCardTitleClass}><Zap className={featureCardIconClass} />Blazing-Fast Swaps</h3>
                  <p className={featureCardDescriptionClass}>Leverage Solana Layer 2 speed. Swaps execute and confirm in milliseconds, not minutes.</p>
                </div>
                <div className={featureCardBaseClass}>
                  <h3 className={featureCardTitleClass}><Coins className={featureCardIconClass} />Minimal Fees</h3>
                  <p className={featureCardDescriptionClass}>Goodbye high gas costs. Transactions on our Layer 2 have negligible fees, making swapping accessible and profitable.</p>
                </div>
                <div className={featureCardBaseClass}>
                  <h3 className={featureCardTitleClass}><Smile className={featureCardIconClass} />User-Friendly Interface</h3>
                  <p className={featureCardDescriptionClass}>Our clean, intuitive interface makes token swapping straightforward, even for beginners. Connect and trade seamlessly.</p>
                </div>
              </div>
          </div>
        </section>
        
        {/* Features (Launchpad specific - as per original request for this section name) */}
        <section id="old-launchpad-features-section" className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="font-headline text-3xl sm:text-4xl font-bold mb-12 text-center text-purple-400">Your Launchpad for Secure, Scalable Growth</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className={featureCardBaseClass}>
                <h3 className={featureCardTitleClass}><ListChecks className={featureCardIconClass} />Integrated BuyBot for Accountability</h3>
                <p className={featureCardDescriptionClass}>The BuyBot is fully integrated to give you enhanced security and transparent project monitoring, ensuring your projects remain accountable and trustworthy.</p>
              </div>
              <div className={featureCardBaseClass}>
                <h3 className={featureCardTitleClass}><LockKeyhole className={featureCardIconClass} />Liquidity Locking for Stability</h3>
                <p className={featureCardDescriptionClass}>Ensure long-term success with liquidity locking. Protect your project and investors by securing funds within the SolCraft ecosystem.</p>
              </div>
              <div className={featureCardBaseClass}>
                <h3 className={featureCardTitleClass}><Rocket className={featureCardIconClass} />Secure Project Launchpad</h3>
                <p className={featureCardDescriptionClass}>Bring your projects to life with the SolCraft Launchpad. A secure environment where projects can grow, scale, and thrive within a trusted ecosystem.</p>
              </div>
            </div>
          </div>
        </section>

        {/* BuyBot Section */}
        <section id="buybot-section" className="py-16 md:py-24 bg-gray-900/30">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="font-headline text-3xl sm:text-4xl font-bold mb-12 text-center text-purple-400">Trade Smarter, Not Harder Meet the Integrated Layer 2 BuyBot</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className={featureCardBaseClass}>
                <h3 className={featureCardTitleClass}><Bot className={featureCardIconClass} />Smart Automated Trading</h3>
                <p className={featureCardDescriptionClass}>Let BuyBot do the heavy lifting for you. Automatically optimize trades with intelligent algorithms that maximize returns on every transaction.</p>
              </div>
              <div className={featureCardBaseClass}>
                <h3 className={featureCardTitleClass}><Award className={featureCardIconClass} />Maximize Your Rewards</h3>
                <p className={featureCardDescriptionClass}>Leverage BuyBot's optimization features to earn more on every trade. The Swap &amp; Reward Optimizer ensures you're always getting the best deal.</p>
              </div>
              <div className={featureCardBaseClass}>
                <h3 className={featureCardTitleClass}><FileScan className={featureCardIconClass} />Stay Protected with Anti-Rug Scoring</h3>
                <p className={featureCardDescriptionClass}>Trade confidently. BuyBot's anti-rug scoring system helps identify risky projects, protecting your investments.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section id="roadmap-section" className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex justify-center mb-16">
              <div className="bg-black/50 backdrop-blur-sm px-8 py-4 rounded-lg shadow-xl border border-purple-500/30">
                <h2 className="font-headline text-3xl sm:text-4xl font-bold text-center text-white">Roadmap</h2>
              </div>
            </div>
            <div className="relative">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-purple-500/30 transform -translate-x-1/2"></div>
              {roadmapItems.map((item, index) => (
                <RoadmapItem
                  key={index}
                  quarter={item.quarter}
                  year={item.year}
                  milestones={item.milestones}
                  isOffset={item.isOffset}
                  isLast={item.isLast}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Tokenomics Section */}
        <section id="tokenomics-section" className="py-16 md:py-24 bg-gray-900/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex justify-center mb-16">
               <div className="bg-black/50 backdrop-blur-sm px-8 py-4 rounded-lg shadow-xl border border-purple-500/30">
                <h2 className="font-headline text-3xl sm:text-4xl font-bold text-center text-white">Tokenomics</h2>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="flex justify-center items-center">
                <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-radial from-purple-600/50 via-purple-800/30 to-black rounded-full opacity-70 shadow-2xl shadow-purple-500/50 animate-pulse"></div>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <TokenomicsChart />
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm max-w-md">
                  {[
                    { name: "Liquidity", value: "35%", color: "bg-primary" },
                    { name: "Presale", value: "20%", color: "bg-purple-500" },
                    { name: "Staking", value: "15%", color: "bg-teal-500" }, // Matches chart --chart-2
                    { name: "Team", value: "15%", color: "bg-blue-600" },
                    { name: "Marketing", value: "15%", color: "bg-sky-500" },
                  ].map(item => (
                    <div key={item.name} className="flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-2 ${item.color}`}></span>
                      <span className="text-gray-300">{item.name}:</span>
                      <span className="ml-1 font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team-section" className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 text-center">
             <div className="flex justify-center mb-12">
               <div className="bg-black/50 backdrop-blur-sm px-8 py-4 rounded-lg shadow-xl border border-purple-500/30">
                <h2 className="font-headline text-3xl sm:text-4xl font-bold text-center text-white">Team</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {["Founder", "Dev", "Marketing", "Operations"].map((role) => (
                <div key={role} className={featureCardBaseClass}>
                  <Users className={`${featureCardIconClass} mx-auto mb-3 !mr-0`} />
                  <h3 className="text-xl font-semibold text-white mb-2">{role}</h3>
                  <p className={featureCardDescriptionClass}>
                    Dedicated professionals driving the SolCraft vision forward.
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-12 text-gray-400">More team details coming soon.</p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-12 bg-gray-900/50 text-gray-400 text-sm">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h5 className="font-semibold text-white mb-3 font-headline">SolCraft</h5>
              <p className="text-xs">Trading Infrastructure for the Next Era of Solana. Supercharging Solana with an innovative Layer 2.</p>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-3 font-headline">Legal</h5>
              <ul className="space-y-1 text-xs">
                <li><Link href="/terms-of-service" className="hover:text-purple-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-3 font-headline">Follow Us</h5>
              <div className="flex space-x-4">
                <a href="https://x.com/solcraftlayer2" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com/company/solcraft" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} SolCraft. All rights reserved.</p>
            <p className="text-xs mt-2">
              Contact: <a href="mailto:info@solcraftl2.com" className="hover:text-purple-400 transition-colors">info@solcraftl2.com</a> | 
              <a href="mailto:marketing@solcraftl2.com" className="ml-1 hover:text-purple-400 transition-colors">marketing@solcraftl2.com</a> | 
              <a href="mailto:team@solcraftl2.com" className="ml-1 hover:text-purple-400 transition-colors">team@solcraftl2.com</a>
            </p>
          </div>
        </div>
      </footer>

      {/* Wallet Connection Dialog */}
      <ConnectWalletDialogReal 
        open={isWalletDialogOpen}
        onOpenChange={setIsWalletDialogOpen}
        onConnect={handleWalletConnect}
      />
    </div>
  );
}
