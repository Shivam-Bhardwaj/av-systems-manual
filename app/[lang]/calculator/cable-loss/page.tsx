'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  calculateLowImpedanceLoss, 
  calculateDistributedSystemLoss,
  calculateMaxCableLength,
  CABLE_SPECS,
  type CableLossResult 
} from '@/lib/acoustics/cable-loss'

export default function CableLossCalculatorPage() {
  const [systemType, setSystemType] = useState<'low-impedance' | 'distributed'>('low-impedance')
  const [lowImpedanceData, setLowImpedanceData] = useState({
    cableLength: 30,
    speakerImpedance: 8,
    amplifierPower: 100,
    cableGauge: 14
  })
  const [distributedData, setDistributedData] = useState({
    cableLength: 50,
    systemVoltage: 70 as 70 | 100,
    totalPower: 200,
    cableGauge: 14
  })
  const [results, setResults] = useState<CableLossResult | null>(null)

  const handleCalculate = () => {
    let result: CableLossResult
    if (systemType === 'low-impedance') {
      result = calculateLowImpedanceLoss(
        lowImpedanceData.cableLength,
        lowImpedanceData.speakerImpedance,
        lowImpedanceData.amplifierPower,
        undefined,
        lowImpedanceData.cableGauge
      )
    } else {
      result = calculateDistributedSystemLoss(
        distributedData.cableLength,
        distributedData.systemVoltage,
        distributedData.totalPower,
        distributedData.cableGauge
      )
    }
    setResults(result)
  }

  const maxLength = systemType === 'low-impedance'
    ? calculateMaxCableLength(
        lowImpedanceData.speakerImpedance,
        lowImpedanceData.amplifierPower,
        5,
        lowImpedanceData.cableGauge
      )
    : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cable Loss Calculator</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Calculate voltage drop and power loss in speaker cables
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
            <CardDescription>
              Select system type and enter parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={systemType} onValueChange={(v) => setSystemType(v as 'low-impedance' | 'distributed')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="low-impedance">Low Impedance</TabsTrigger>
                <TabsTrigger value="distributed">70V/100V</TabsTrigger>
              </TabsList>

              <TabsContent value="low-impedance" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cableLength">Cable Length (m)</Label>
                  <Input
                    id="cableLength"
                    type="number"
                    step="0.1"
                    value={lowImpedanceData.cableLength}
                    onChange={(e) => setLowImpedanceData({ ...lowImpedanceData, cableLength: parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    One-way distance from amplifier to speaker
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="speakerImpedance">Speaker Impedance (Ω)</Label>
                  <Select 
                    value={lowImpedanceData.speakerImpedance.toString()} 
                    onValueChange={(v) => setLowImpedanceData({ ...lowImpedanceData, speakerImpedance: parseFloat(v) })}
                  >
                    <SelectTrigger id="speakerImpedance">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 Ω</SelectItem>
                      <SelectItem value="8">8 Ω</SelectItem>
                      <SelectItem value="16">16 Ω</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amplifierPower">Amplifier Power (W)</Label>
                  <Input
                    id="amplifierPower"
                    type="number"
                    step="1"
                    value={lowImpedanceData.amplifierPower}
                    onChange={(e) => setLowImpedanceData({ ...lowImpedanceData, amplifierPower: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cableGauge">Cable Gauge (AWG)</Label>
                  <Select 
                    value={lowImpedanceData.cableGauge.toString()} 
                    onValueChange={(v) => setLowImpedanceData({ ...lowImpedanceData, cableGauge: parseFloat(v) })}
                  >
                    <SelectTrigger id="cableGauge">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(CABLE_SPECS).map(gauge => (
                        <SelectItem key={gauge} value={gauge}>
                          {gauge} AWG
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {maxLength > 0 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm">
                      <strong>Max length for 5% loss:</strong> {maxLength.toFixed(1)}m
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="distributed" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="distCableLength">Cable Length (m)</Label>
                  <Input
                    id="distCableLength"
                    type="number"
                    step="0.1"
                    value={distributedData.cableLength}
                    onChange={(e) => setDistributedData({ ...distributedData, cableLength: parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    One-way distance from amplifier to furthest speaker
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="systemVoltage">System Voltage</Label>
                  <Select 
                    value={distributedData.systemVoltage.toString()} 
                    onValueChange={(v) => setDistributedData({ ...distributedData, systemVoltage: parseFloat(v) as 70 | 100 })}
                  >
                    <SelectTrigger id="systemVoltage">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="70">70V</SelectItem>
                      <SelectItem value="100">100V</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalPower">Total Power (W)</Label>
                  <Input
                    id="totalPower"
                    type="number"
                    step="1"
                    value={distributedData.totalPower}
                    onChange={(e) => setDistributedData({ ...distributedData, totalPower: parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Sum of all speaker tap settings × 1.25 (headroom)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distCableGauge">Cable Gauge (AWG)</Label>
                  <Select 
                    value={distributedData.cableGauge.toString()} 
                    onValueChange={(v) => setDistributedData({ ...distributedData, cableGauge: parseFloat(v) })}
                  >
                    <SelectTrigger id="distCableGauge">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(CABLE_SPECS).map(gauge => (
                        <SelectItem key={gauge} value={gauge}>
                          {gauge} AWG
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>

            <Button onClick={handleCalculate} className="w-full">
              Calculate Cable Loss
            </Button>
          </CardContent>
        </Card>

        <div>
          {results ? (
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  Cable loss analysis and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`p-4 rounded-lg ${results.acceptable ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
                  <p className={`font-semibold ${results.acceptable ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
                    {results.acceptable ? '✓ Loss Acceptable' : '⚠ Loss Too High'}
                  </p>
                  {!results.acceptable && (
                    <p className="text-sm mt-2">
                      Recommended: Use {results.recommendedGauge} AWG cable
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Resistance</p>
                    <p className="text-xl font-bold">{results.totalResistance.toFixed(3)} Ω</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Voltage Drop</p>
                    <p className="text-xl font-bold">{results.voltageDrop.toFixed(2)} V</p>
                    <p className="text-xs text-muted-foreground">({results.voltageDropPercent.toFixed(1)}%)</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Power Loss</p>
                    <p className="text-xl font-bold">{results.powerLoss.toFixed(1)} W</p>
                    <p className="text-xs text-muted-foreground">({results.powerLossPercent.toFixed(1)}%)</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Voltage at Speaker</p>
                    <p className="text-xl font-bold">{results.voltageAtSpeaker.toFixed(2)} V</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Power at Speaker</p>
                    <p className="text-xl font-bold">{results.powerAtSpeaker.toFixed(1)} W</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recommended Gauge</p>
                    <p className="text-xl font-bold">{results.recommendedGauge} AWG</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    Guidelines
                  </p>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Low impedance: Keep loss &lt; 5%</li>
                    <li>• Distributed systems: Keep voltage drop &lt; 3%</li>
                    <li>• Use larger gauge (lower AWG number) for longer runs</li>
                    <li>• Consider cable cost vs. power loss trade-offs</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  Enter cable parameters to calculate loss
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The calculator will determine:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                  <li>Voltage drop across the cable</li>
                  <li>Power loss due to cable resistance</li>
                  <li>Voltage and power delivered to speakers</li>
                  <li>Recommended cable gauge if loss is too high</li>
                  <li>Maximum cable length for acceptable loss</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

