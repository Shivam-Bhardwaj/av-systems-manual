import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TheoryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Theory & Principles</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Understanding the fundamental principles of acoustics and AV system design
        </p>
      </div>

      <Tabs defaultValue="acoustics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="acoustics">Acoustics</TabsTrigger>
          <TabsTrigger value="audio">Audio Systems</TabsTrigger>
          <TabsTrigger value="video">Video Systems</TabsTrigger>
          <TabsTrigger value="standards">Standards</TabsTrigger>
        </TabsList>

        <TabsContent value="acoustics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>RT60 - Reverberation Time</CardTitle>
              <CardDescription>Understanding room acoustics and decay time</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h4 className="text-lg font-semibold">Definition</h4>
              <p className="text-sm text-muted-foreground">
                RT60 is the time it takes for sound to decay by 60 decibels after the source has stopped. 
                It&apos;s the primary metric for characterizing a room&apos;s acoustic properties.
              </p>

              <h4 className="text-lg font-semibold mt-4">Sabine Formula</h4>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                RT60 = 0.161 × V / A
              </div>
              <ul className="text-sm space-y-1 mt-2">
                <li>V = Room volume (m³)</li>
                <li>A = Total absorption (sabins)</li>
                <li>0.161 = Constant (metric units)</li>
              </ul>

              <h4 className="text-lg font-semibold mt-4">Eyring Formula</h4>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                RT60 = 0.161 × V / (-S × ln(1 - α))
              </div>
              <ul className="text-sm space-y-1 mt-2">
                <li>S = Total surface area (m²)</li>
                <li>α = Average absorption coefficient</li>
                <li>More accurate for highly absorptive rooms</li>
              </ul>

              <h4 className="text-lg font-semibold mt-4">Target RT60 Values</h4>
              <table className="w-full text-sm mt-2">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Application</th>
                    <th className="text-left py-2">RT60 Range (s)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Conference Room</td>
                    <td className="py-2">0.4 - 0.6</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Classroom</td>
                    <td className="py-2">0.4 - 0.7</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Lecture Hall</td>
                    <td className="py-2">0.6 - 1.0</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Music Venue</td>
                    <td className="py-2">1.5 - 2.5</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>STI - Speech Transmission Index</CardTitle>
              <CardDescription>Measuring speech intelligibility</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h4 className="text-lg font-semibold">Overview</h4>
              <p className="text-sm text-muted-foreground">
                STI measures how well speech can be understood in a room, considering both noise and reverberation. 
                Values range from 0 (unintelligible) to 1 (perfect intelligibility).
              </p>

              <h4 className="text-lg font-semibold mt-4">STI Scale</h4>
              <table className="w-full text-sm mt-2">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">STI Value</th>
                    <th className="text-left py-2">Rating</th>
                    <th className="text-left py-2">Application</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">&gt; 0.75</td>
                    <td className="py-2">Excellent</td>
                    <td className="py-2">Critical listening, recording</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">0.60 - 0.75</td>
                    <td className="py-2">Good</td>
                    <td className="py-2">Classrooms, conference rooms</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">0.45 - 0.60</td>
                    <td className="py-2">Fair</td>
                    <td className="py-2">General PA, public spaces</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">&lt; 0.45</td>
                    <td className="py-2">Poor</td>
                    <td className="py-2">Needs improvement</td>
                  </tr>
                </tbody>
              </table>

              <h4 className="text-lg font-semibold mt-4">Factors Affecting STI</h4>
              <ul className="text-sm space-y-2 mt-2">
                <li><strong>Reverberation:</strong> Higher RT60 reduces STI</li>
                <li><strong>Background Noise:</strong> Lower SNR reduces STI</li>
                <li><strong>Direct-to-Reverberant Ratio:</strong> More direct sound improves STI</li>
                <li><strong>Speaker Coverage:</strong> Even coverage improves overall STI</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sound Pressure Level (SPL)</CardTitle>
              <CardDescription>Understanding acoustic power and coverage</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h4 className="text-lg font-semibold">Basic Formula</h4>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                SPL = Sensitivity + 10×log₁₀(Power) - 20×log₁₀(Distance)
              </div>
              
              <h4 className="text-lg font-semibold mt-4">Key Concepts</h4>
              <ul className="text-sm space-y-2 mt-2">
                <li><strong>Sensitivity:</strong> SPL produced by 1W at 1m (dB SPL)</li>
                <li><strong>Power:</strong> Amplifier output power (watts)</li>
                <li><strong>Distance:</strong> Distance from speaker (meters)</li>
                <li><strong>Inverse Square Law:</strong> SPL drops 6dB per distance doubling</li>
              </ul>

              <h4 className="text-lg font-semibold mt-4">Target SPL Levels</h4>
              <table className="w-full text-sm mt-2">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Application</th>
                    <th className="text-left py-2">Average SPL</th>
                    <th className="text-left py-2">Peak SPL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Speech Only</td>
                    <td className="py-2">65 dB</td>
                    <td className="py-2">85 dB</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Background Music</td>
                    <td className="py-2">75 dB</td>
                    <td className="py-2">90 dB</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Foreground Music</td>
                    <td className="py-2">85 dB</td>
                    <td className="py-2">105 dB</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Concert/Club</td>
                    <td className="py-2">95 dB</td>
                    <td className="py-2">115 dB</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Speaker Types & Applications</CardTitle>
              <CardDescription>Choosing the right speaker for your application</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Point Source Speakers</h4>
                  <p className="text-sm text-muted-foreground">Traditional cone speakers in enclosures</p>
                  <ul className="text-sm mt-1">
                    <li>Best for: Small to medium rooms</li>
                    <li>Coverage: 60-120° horizontal</li>
                    <li>Advantages: Cost-effective, versatile</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">Line Arrays</h4>
                  <p className="text-sm text-muted-foreground">Vertical arrays of multiple drivers</p>
                  <ul className="text-sm mt-1">
                    <li>Best for: Large venues, long-throw applications</li>
                    <li>Coverage: Narrow vertical, wide horizontal</li>
                    <li>Advantages: Even coverage over distance</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">Column Speakers</h4>
                  <p className="text-sm text-muted-foreground">Tall, slim speakers with multiple drivers</p>
                  <ul className="text-sm mt-1">
                    <li>Best for: Reverberant spaces, architectural integration</li>
                    <li>Coverage: Controlled vertical dispersion</li>
                    <li>Advantages: Reduced ceiling/floor reflections</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">Ceiling Speakers</h4>
                  <p className="text-sm text-muted-foreground">Flush-mounted or pendant speakers</p>
                  <ul className="text-sm mt-1">
                    <li>Best for: Distributed systems, low-profile installation</li>
                    <li>Coverage: Wide dispersion</li>
                    <li>Advantages: Aesthetically pleasing, even coverage</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>70V/100V Systems</CardTitle>
              <CardDescription>Distributed audio systems for commercial applications</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h4 className="text-lg font-semibold">When to Use</h4>
              <ul className="text-sm space-y-1 mt-2">
                <li>Multiple speakers on long cable runs (&gt;100ft)</li>
                <li>Different power taps needed for zones</li>
                <li>Background music and paging systems</li>
                <li>Large distributed systems</li>
              </ul>

              <h4 className="text-lg font-semibold mt-4">Advantages</h4>
              <ul className="text-sm space-y-1 mt-2">
                <li>Reduced cable gauge requirements</li>
                <li>Easy power distribution</li>
                <li>Flexible system expansion</li>
                <li>Individual speaker volume control</li>
              </ul>

              <h4 className="text-lg font-semibold mt-4">Power Calculation</h4>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                Amplifier Power = Sum of all tap settings × 1.25
              </div>
              <p className="text-sm mt-2">Always add 25% headroom for transformer losses</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Display Sizing</CardTitle>
              <CardDescription>Calculating appropriate display size for viewing distance</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h4 className="text-lg font-semibold">4/6/8 Rule</h4>
              <p className="text-sm text-muted-foreground">
                Maximum viewing distances based on content type:
              </p>
              <ul className="text-sm space-y-1 mt-2">
                <li><strong>4× height:</strong> Detailed viewing (CAD, spreadsheets)</li>
                <li><strong>6× height:</strong> General viewing (presentations)</li>
                <li><strong>8× height:</strong> Passive viewing (digital signage)</li>
              </ul>

              <h4 className="text-lg font-semibold mt-4">Minimum Display Height</h4>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                Height = Furthest Viewer Distance / 6
              </div>

              <h4 className="text-lg font-semibold mt-4">Viewing Angles</h4>
              <table className="w-full text-sm mt-2">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Angle Type</th>
                    <th className="text-left py-2">Ideal</th>
                    <th className="text-left py-2">Maximum</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Horizontal</td>
                    <td className="py-2">±30°</td>
                    <td className="py-2">±45°</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Vertical</td>
                    <td className="py-2">0-15°</td>
                    <td className="py-2">0-30°</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="standards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Industry Standards</CardTitle>
              <CardDescription>Key standards and guidelines for AV systems</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">AVIXA Standards</h4>
                  <ul className="text-sm mt-1 space-y-1">
                    <li><strong>ANSI/AVIXA 102.01:2017</strong> - Audio Coverage Uniformity</li>
                    <li><strong>ANSI/AVIXA 501.01:2021</strong> - Display Image Size</li>
                    <li><strong>AVIXA 2M-2010</strong> - AV Design Reference Manual</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">Acoustic Standards</h4>
                  <ul className="text-sm mt-1 space-y-1">
                    <li><strong>IEC 60268-16</strong> - STI Measurement</li>
                    <li><strong>ISO 3382</strong> - Room Acoustic Measurements</li>
                    <li><strong>ANSI S12.60</strong> - Classroom Acoustics</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">Safety Standards</h4>
                  <ul className="text-sm mt-1 space-y-1">
                    <li><strong>NEC Article 640</strong> - Audio System Installations</li>
                    <li><strong>NEC Article 725</strong> - Class 2 & 3 Circuits</li>
                    <li><strong>IEC 60065</strong> - Audio/Video Safety</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
