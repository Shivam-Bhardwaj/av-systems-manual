import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function InstallationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Installation Guide</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Best practices for AV system installation, wiring, and commissioning
        </p>
      </div>

      <Tabs defaultValue="planning" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="speakers">Speakers</TabsTrigger>
          <TabsTrigger value="cabling">Cabling</TabsTrigger>
          <TabsTrigger value="racks">Racks</TabsTrigger>
          <TabsTrigger value="commissioning">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="planning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pre-Installation Checklist</CardTitle>
              <CardDescription>Essential steps before beginning installation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Site Survey Completed</p>
                    <p className="text-xs text-muted-foreground">Verify dimensions, power availability, structural elements</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Equipment Staged & Inventoried</p>
                    <p className="text-xs text-muted-foreground">Check all items against packing list</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Coordination with Other Trades</p>
                    <p className="text-xs text-muted-foreground">HVAC, electrical, IT infrastructure</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Safety Equipment Ready</p>
                    <p className="text-xs text-muted-foreground">Ladders, lifts, PPE, fall protection</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Installation Drawings Approved</p>
                    <p className="text-xs text-muted-foreground">Speaker locations, cable paths, rack layouts</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Power Requirements</CardTitle>
              <CardDescription>Electrical infrastructure planning</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h4 className="text-lg font-semibold">Circuit Planning</h4>
              <table className="w-full text-sm mt-2">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Load Type</th>
                    <th className="text-left py-2">Circuit Type</th>
                    <th className="text-left py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Audio Racks</td>
                    <td className="py-2">Dedicated 20A</td>
                    <td className="py-2">Isolated ground recommended</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Video Displays</td>
                    <td className="py-2">Dedicated 20A</td>
                    <td className="py-2">One circuit per 2-3 displays</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Control Systems</td>
                    <td className="py-2">UPS Protected</td>
                    <td className="py-2">Critical for system stability</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Powered Speakers</td>
                    <td className="py-2">Standard 20A</td>
                    <td className="py-2">Calculate total load</td>
                  </tr>
                </tbody>
              </table>

              <div className="bg-yellow-50 p-4 rounded-lg mt-4 flex gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Derating Factor</p>
                  <p>Always apply 80% derating to circuit capacity for continuous loads</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="speakers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Speaker Mounting Guidelines</CardTitle>
              <CardDescription>Proper techniques for different speaker types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Wall-Mounted Speakers</h4>
                <ul className="text-sm space-y-2">
                  <li>• Mount at ear level when seated (typically 1.2m)</li>
                  <li>• Use appropriate wall anchors for weight</li>
                  <li>• Angle down 10-15° towards listening area</li>
                  <li>• Maintain symmetry for stereo pairs</li>
                  <li>• Install safety cable for speakers over 10kg</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Ceiling Speakers</h4>
                <ul className="text-sm space-y-2">
                  <li>• Use tile bridges or C-rings for suspended ceilings</li>
                  <li>• Maintain consistent spacing pattern</li>
                  <li>• Edge-to-edge spacing = 2 × mounting height</li>
                  <li>• Consider HVAC locations to avoid conflicts</li>
                  <li>• Back boxes recommended for fire-rated ceilings</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Flown/Rigged Speakers</h4>
                <ul className="text-sm space-y-2">
                  <li>• Must use rated rigging hardware</li>
                  <li>• Calculate all load angles and forces</li>
                  <li>• 5:1 safety factor minimum</li>
                  <li>• Secondary safety attachment required</li>
                  <li>• Professional rigger recommended</li>
                </ul>
              </div>

              <div className="bg-red-50 p-4 rounded-lg flex gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Safety Critical</p>
                  <p>Never exceed manufacturer&apos;s weight ratings. Always use safety cables for overhead mounting.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Speaker Aiming & Coverage</CardTitle>
              <CardDescription>Optimizing acoustic coverage</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h4 className="text-lg font-semibold">Aiming Procedure</h4>
              <ol className="text-sm space-y-2 mt-2">
                <li>1. Identify the furthest listening position</li>
                <li>2. Aim speaker axis at ear height at 2/3 room depth</li>
                <li>3. Verify coverage with laser pointer or inclinometer</li>
                <li>4. Check for first reflections from walls/ceiling</li>
                <li>5. Adjust to minimize overlap between adjacent speakers</li>
              </ol>

              <h4 className="text-lg font-semibold mt-4">Coverage Overlap</h4>
              <p className="text-sm text-muted-foreground">
                Plan for -6dB overlap between adjacent speakers for smooth coverage. 
                This typically occurs at the -6dB coverage angle of each speaker.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cabling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cable Selection Guide</CardTitle>
              <CardDescription>Choosing the right cable for each application</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Application</th>
                    <th className="text-left py-2">Cable Type</th>
                    <th className="text-left py-2">Max Distance</th>
                    <th className="text-left py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">8Ω Speakers</td>
                    <td className="py-2">12-14 AWG</td>
                    <td className="py-2">50-100 ft</td>
                    <td className="py-2">Lower gauge for longer runs</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">70V/100V</td>
                    <td className="py-2">16-18 AWG</td>
                    <td className="py-2">500-1000 ft</td>
                    <td className="py-2">Plenum rated if required</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Microphones</td>
                    <td className="py-2">22-24 AWG Shielded</td>
                    <td className="py-2">200 ft</td>
                    <td className="py-2">Star-quad for EMI rejection</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Line Level</td>
                    <td className="py-2">22 AWG Shielded</td>
                    <td className="py-2">100 ft</td>
                    <td className="py-2">Balanced preferred</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Digital Audio</td>
                    <td className="py-2">Cat6 STP</td>
                    <td className="py-2">300 ft</td>
                    <td className="py-2">Dante/AVB certified</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cable Installation Best Practices</CardTitle>
              <CardDescription>Professional installation techniques</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">General Guidelines</h4>
                <ul className="text-sm space-y-1">
                  <li>• Maintain minimum bend radius (8× cable diameter)</li>
                  <li>• Use cable support every 4-5 feet</li>
                  <li>• Leave 10% slack for service loops</li>
                  <li>• Label both ends with permanent markers</li>
                  <li>• Test continuity before termination</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Separation Requirements</h4>
                <table className="w-full text-sm mt-2">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cable Type</th>
                      <th className="text-left py-2">From AC Power</th>
                      <th className="text-left py-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">Speaker (70V)</td>
                      <td className="py-2">No separation</td>
                      <td className="py-2">Class 3 wiring</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Microphone</td>
                      <td className="py-2">12" minimum</td>
                      <td className="py-2">Use conduit if closer</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Control/Data</td>
                      <td className="py-2">6" minimum</td>
                      <td className="py-2">Cross at 90° if needed</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Termination</h4>
                <ul className="text-sm space-y-1">
                  <li>• Strip only required length</li>
                  <li>• Tin stranded wire ends</li>
                  <li>• Use proper crimping tools</li>
                  <li>• Heat shrink all connections</li>
                  <li>• Perform continuity test</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="racks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rack Build Standards</CardTitle>
              <CardDescription>Professional equipment rack assembly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Layout Principles</h4>
                <ul className="text-sm space-y-1">
                  <li>• Heavy equipment at bottom</li>
                  <li>• Power amplifiers need ventilation space</li>
                  <li>• Group equipment by function</li>
                  <li>• Leave 1U between heat-generating equipment</li>
                  <li>• Patch panels at convenient height</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Power Distribution</h4>
                <ul className="text-sm space-y-1">
                  <li>• Install power sequencer/conditioner</li>
                  <li>• Separate analog and digital power</li>
                  <li>• Use outlet strips rated for load</li>
                  <li>• Route power opposite signal cables</li>
                  <li>• Ground all equipment to star point</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Cable Management</h4>
                <ul className="text-sm space-y-1">
                  <li>• Use horizontal and vertical lacing bars</li>
                  <li>• Service loops behind equipment</li>
                  <li>• Velcro ties, not zip ties</li>
                  <li>• Separate AC, audio, and control</li>
                  <li>• Label every cable</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg flex gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Thermal Management</p>
                  <p>Calculate total BTU load. Provide adequate ventilation or cooling for racks over 500W.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissioning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Commissioning Checklist</CardTitle>
              <CardDescription>Systematic testing and optimization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Initial Power-Up</h4>
                <ul className="text-sm space-y-1">
                  <li>☐ Verify all connections before power</li>
                  <li>☐ Check power sequencing order</li>
                  <li>☐ Monitor for unusual heat/smell/noise</li>
                  <li>☐ Verify all equipment powers on</li>
                  <li>☐ Check for ground loops (hum/buzz)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Audio Testing</h4>
                <ul className="text-sm space-y-1">
                  <li>☐ Pink noise through each speaker</li>
                  <li>☐ Verify correct polarity</li>
                  <li>☐ Measure SPL at key positions</li>
                  <li>☐ Set amplifier gains properly</li>
                  <li>☐ Configure DSP/EQ settings</li>
                  <li>☐ Test all microphone positions</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">System Tuning</h4>
                <ul className="text-sm space-y-1">
                  <li>☐ Measure and document RT60</li>
                  <li>☐ Perform STI measurements</li>
                  <li>☐ Set delay times for zones</li>
                  <li>☐ EQ for flat response ±3dB</li>
                  <li>☐ Set limiters for speaker protection</li>
                  <li>☐ Create and test presets</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Documentation</h4>
                <ul className="text-sm space-y-1">
                  <li>☐ As-built drawings</li>
                  <li>☐ Test measurement results</li>
                  <li>☐ Equipment settings/passwords</li>
                  <li>☐ Warranty information</li>
                  <li>☐ Maintenance schedule</li>
                  <li>☐ Training materials</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Measurement Tools</CardTitle>
              <CardDescription>Essential test equipment for commissioning</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Tool</th>
                    <th className="text-left py-2">Purpose</th>
                    <th className="text-left py-2">Key Features</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">SPL Meter</td>
                    <td className="py-2">Level calibration</td>
                    <td className="py-2">Type 2 minimum, C-weighting</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">RTA/FFT Analyzer</td>
                    <td className="py-2">Frequency response</td>
                    <td className="py-2">1/3 octave minimum resolution</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Impedance Meter</td>
                    <td className="py-2">Speaker line testing</td>
                    <td className="py-2">70V/100V capable</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Cable Tester</td>
                    <td className="py-2">Verify connections</td>
                    <td className="py-2">XLR, TRS, RJ45 capable</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">STI Meter</td>
                    <td className="py-2">Intelligibility testing</td>
                    <td className="py-2">IEC 60268-16 compliant</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
