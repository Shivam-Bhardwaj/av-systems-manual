import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Calculator, 
  FileText, 
  BookOpen, 
  Volume2,
  Monitor,
  Wifi,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react'

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const calculators = [
    {
      title: 'Room Acoustics (RT60)',
      description: 'Calculate reverberation time and acoustic treatment requirements',
      href: `/${lang}/calculator/room-acoustics`,
      icon: Volume2,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      title: 'SPL Calculator',
      description: 'Determine speaker requirements and coverage patterns',
      href: `/${lang}/calculator/spl`,
      icon: Volume2,
      color: 'text-green-600 bg-green-50'
    },
    {
      title: 'Delay Calculator',
      description: 'Calculate delay times for distributed speaker systems',
      href: `/${lang}/calculator/delay`,
      icon: Clock,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      title: 'Cable Loss',
      description: 'Calculate voltage drop and power loss in speaker cables',
      href: `/${lang}/calculator/cable-loss`,
      icon: Wifi,
      color: 'text-orange-600 bg-orange-50'
    },
    {
      title: 'Video Calculator',
      description: 'Determine display size and viewing angles',
      href: `/${lang}/calculator/video`,
      icon: Monitor,
      color: 'text-pink-600 bg-pink-50'
    }
  ]

  const quickLinks = [
    {
      title: 'Generate Specification',
      description: 'Create a complete AV system specification document',
      href: `/${lang}/specification/generator`,
      icon: FileText
    },
    {
      title: 'Theory & Principles',
      description: 'Learn about acoustic principles and AV system design',
      href: `/${lang}/reference/theory`,
      icon: BookOpen
    },
    {
      title: 'Installation Guide',
      description: 'Best practices for system installation and commissioning',
      href: `/${lang}/reference/installation`,
      icon: Calculator
    }
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight px-2">AV Systems Engineering Manual</h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
          Professional tools for audio-visual system design, specification, and installation. 
          Calculate acoustic parameters, generate equipment specifications, and access engineering references.
        </p>
      </div>

      {/* Quick Start */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl">Quick Start</CardTitle>
              <CardDescription className="text-base mt-1">
                Enter room dimensions to get instant AV system recommendations
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Link href={`/${lang}/specification/generator`} className="inline-block">
            <Button size="lg" className="gap-3 w-full sm:w-auto shadow-lg hover:shadow-xl hover:scale-105 transition-transform">
              <span className="text-lg">Generate System Specification</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Calculators Grid */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 px-2 sm:px-0">Engineering Calculators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {calculators.map((calc) => (
            <Link key={calc.href} href={calc.href} className="block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg">
              <Card className="hover:shadow-xl transition-all cursor-pointer h-full border-2 hover:border-primary/50 hover:scale-105 active:scale-95 group min-h-[180px]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-4 rounded-xl ${calc.color} shadow-md group-hover:shadow-lg group-hover:scale-110 transition-transform`}>
                      <calc.icon className="h-8 w-8" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold">{calc.title}</CardTitle>
                  <CardDescription className="text-sm mt-2">{calc.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 px-2 sm:px-0">Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg">
              <Card className="hover:shadow-xl transition-all cursor-pointer h-full border-2 hover:border-primary/50 hover:scale-105 active:scale-95 group min-h-[140px]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <link.icon className="h-6 w-6 text-primary flex-shrink-0" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-bold flex-1">{link.title}</CardTitle>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardDescription className="text-sm ml-14">{link.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 px-2 sm:px-0">Platform Capabilities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Venue Types
              </CardTitle>
              <p className="text-2xl sm:text-3xl font-bold mt-2">25+</p>
            </CardHeader>
          </Card>
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Volume2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Equipment Models
              </CardTitle>
              <p className="text-2xl sm:text-3xl font-bold mt-2">50+</p>
            </CardHeader>
          </Card>
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Acoustic Formulas
              </CardTitle>
              <p className="text-2xl sm:text-3xl font-bold mt-2">15+</p>
            </CardHeader>
          </Card>
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Export Formats
              </CardTitle>
              <p className="text-2xl sm:text-3xl font-bold mt-2">3</p>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}