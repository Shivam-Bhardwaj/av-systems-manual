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

export default function Home({ params }: { params: { lang: string } }) {
  const calculators = [
    {
      title: 'Room Acoustics (RT60)',
      description: 'Calculate reverberation time and acoustic treatment requirements',
      href: '/calculator/room-acoustics',
      icon: Volume2,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      title: 'SPL Calculator',
      description: 'Determine speaker requirements and coverage patterns',
      href: '/calculator/spl',
      icon: Volume2,
      color: 'text-green-600 bg-green-50'
    },
    {
      title: 'Delay Calculator',
      description: 'Calculate delay times for distributed speaker systems',
      href: '/calculator/delay',
      icon: Clock,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      title: 'Cable Loss',
      description: 'Calculate voltage drop and power loss in speaker cables',
      href: '/calculator/cable-loss',
      icon: Wifi,
      color: 'text-orange-600 bg-orange-50'
    },
    {
      title: 'Video Calculator',
      description: 'Determine display size and viewing angles',
      href: `/${params.lang}/calculator/video`,
      icon: Monitor,
      color: 'text-pink-600 bg-pink-50'
    }
  ]

  const quickLinks = [
    {
      title: 'Generate Specification',
      description: 'Create a complete AV system specification document',
      href: `/${params.lang}/specification/generator`,
      icon: FileText
    },
    {
      title: 'Theory & Principles',
      description: 'Learn about acoustic principles and AV system design',
      href: '/reference/theory',
      icon: BookOpen
    },
    {
      title: 'Installation Guide',
      description: 'Best practices for system installation and commissioning',
      href: `/${params.lang}/reference/installation`,
      icon: Calculator
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">AV Systems Engineering Manual</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Professional tools for audio-visual system design, specification, and installation. 
          Calculate acoustic parameters, generate equipment specifications, and access engineering references.
        </p>
      </div>

      {/* Quick Start */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <CardTitle>Quick Start</CardTitle>
          </div>
          <CardDescription>
            Enter room dimensions to get instant AV system recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={`/${params.lang}/specification/generator`}>
            <Button size="lg" className="gap-2">
              Generate System Specification
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Calculators Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Engineering Calculators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {calculators.map((calc) => (
            <Link key={calc.href} href={calc.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${calc.color}`}>
                      <calc.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <CardTitle className="mt-4">{calc.title}</CardTitle>
                  <CardDescription>{calc.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <link.icon className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{link.title}</CardTitle>
                  </div>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Venue Types
            </CardTitle>
            <p className="text-2xl font-bold">25+</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Equipment Models
            </CardTitle>
            <p className="text-2xl font-bold">50+</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Acoustic Formulas
            </CardTitle>
            <p className="text-2xl font-bold">15+</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Export Formats
            </CardTitle>
            <p className="text-2xl font-bold">3</p>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}