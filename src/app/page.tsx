import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Zap, 
  Shield, 
  DollarSign,
  Users,
  TrendingUp,
  Droplets,
  BarChart3,
  ArrowRight,
  Star,
  CheckCircle,
  Gamepad2,
  Coins,
  Target,
  Crown,
  Rocket,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';

const services = [
  {
    id: 1,
    title: 'Tournament Poker',
    description: 'Join exciting poker tournaments with guaranteed prize pools and instant blockchain payouts.',
    image: '/assets/services/tournaments.webp',
    gradient: 'from-purple-600 via-blue-600 to-cyan-500',
    icon: Trophy,
    features: ['Instant Payouts', 'Provably Fair', 'Global Players']
  },
  {
    id: 2,
    title: 'DeFi Integration',
    description: 'Stake tokens, provide liquidity, and earn passive income through our integrated DeFi ecosystem.',
    image: '/assets/services/defi.webp',
    gradient: 'from-blue-600 via-cyan-500 to-teal-500',
    icon: Droplets,
    features: ['Liquidity Pools', 'Yield Farming', 'Auto-Compound']
  },
  {
    id: 3,
    title: 'Advanced Analytics',
    description: 'Track your poker performance with comprehensive analytics and AI-powered insights.',
    image: '/assets/services/analytics.webp',
    gradient: 'from-violet-600 via-purple-600 to-pink-500',
    icon: BarChart3,
    features: ['ROI Tracking', 'AI Insights', 'Performance Metrics']
  },
  {
    id: 4,
    title: 'Staking Rewards',
    description: 'Stake SOLP tokens and earn rewards while supporting the SolCraft Poker ecosystem.',
    image: '/assets/services/staking.webp',
    gradient: 'from-orange-500 via-red-500 to-pink-500',
    icon: Coins,
    features: ['High APY', 'Flexible Terms', 'Compound Rewards']
  }
];

const stats = [
  { label: 'Active Players', value: '2,500+', icon: Users },
  { label: 'Total Prize Pool', value: '$125K+', icon: DollarSign },
  { label: 'Tournaments Daily', value: '50+', icon: Trophy },
  { label: 'Average ROI', value: '145%', icon: TrendingUp }
];

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Instant transactions powered by Solana blockchain technology',
    color: 'text-yellow-400'
  },
  {
    icon: Shield,
    title: 'Provably Fair',
    description: 'Transparent and verifiable game mechanics using smart contracts',
    color: 'text-green-400'
  },
  {
    icon: Target,
    title: 'Low Fees',
    description: 'Minimal transaction costs thanks to Solana\'s efficient network',
    color: 'text-blue-400'
  },
  {
    icon: Crown,
    title: 'Premium Experience',
    description: 'Professional-grade poker platform with advanced features',
    color: 'text-purple-400'
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="h-8 w-8 text-cyan-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              SolCraft Poker
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#services" className="text-gray-300 hover:text-white transition-colors">Services</Link>
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">Features</Link>
            <Link href="#ecosystem" className="text-gray-300 hover:text-white transition-colors">Ecosystem</Link>
            <Button 
              asChild
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
            >
              <Link href="/dashboard">Launch App</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <Badge variant="outline" className="mb-8 bg-white/5 border-cyan-500/30 text-cyan-300">
            <Star className="w-4 h-4 mr-2" />
            Powered by Solana Blockchain
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            The Future of{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Poker
            </span>{' '}
            is Here
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Experience blockchain-powered poker with instant payouts, provably fair games, 
            and revolutionary DeFi features. Join the next generation of online poker.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg" 
              asChild
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0 px-8 py-4 text-lg"
            >
              <Link href="/dashboard">
                Launch App
                <Rocket className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 px-8 py-4 text-lg"
            >
              View Tournaments
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <Icon className="w-8 h-8 mx-auto mb-4 text-cyan-400" />
                    <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                    <div className="text-gray-400">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Transform Your{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Poker Experience
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover our comprehensive suite of blockchain-powered poker services designed for the modern player
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={service.id} className="group relative overflow-hidden bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border-white/10 hover:border-cyan-500/30 transition-all duration-500">
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  <CardContent className="relative p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${service.gradient}`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">{service.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {service.features.map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="border-cyan-500/30 text-cyan-300">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                SolCraft Poker?
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built on cutting-edge blockchain technology for the ultimate poker experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 group-hover:border-cyan-500/30 transition-all duration-300">
                    <Icon className={`w-12 h-12 mx-auto mb-6 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                    <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Smart Contract Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border-white/10">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-6">Powered by Smart Contracts</h2>
              <p className="text-gray-300 mb-8 text-lg">
                Our platform runs on audited smart contracts deployed on Solana Devnet
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="text-left">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Tournament Contract
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Handles tournament creation, player registration, and prize distribution
                  </p>
                  <code className="text-xs bg-black/30 p-3 rounded-lg block text-cyan-300">
                    5sNPwvo4mEhSYaKCH9zsLbShnH9ukniZ1N2eeDkPJVXm
                  </code>
                </div>
                
                <div className="text-left">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Network Status
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Running on Solana Devnet for testing and development
                  </p>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    ● Live & Operational
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Ready to{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Play?
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Connect your Solana wallet and join thousands of players in the future of online poker
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg" 
              asChild
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0 px-8 py-4 text-lg"
            >
              <Link href="/dashboard">
                Launch App
                <Rocket className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 px-8 py-4 text-lg"
            >
              View Tournaments
              <Trophy className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Gamepad2 className="h-8 w-8 text-cyan-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              SolCraft Poker
            </span>
          </div>
          <p className="text-gray-400 mb-6">
            The future of blockchain-powered poker gaming
          </p>
          <div className="flex justify-center space-x-6">
            <Link href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Twitter</Link>
            <Link href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Discord</Link>
            <Link href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Telegram</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

