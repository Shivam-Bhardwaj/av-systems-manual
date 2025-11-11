'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { calculateSystemDelays, calculateSpeedOfSound, type DelayZone } from '@/lib/acoustics/delay'
import { Plus, Trash2 } from 'lucide-react'

interface DelaySpeaker {
  name: string
  x: number
  y: number
  z: number
}

export default function DelayCalculatorPage() {
  const [mainSpeaker, setMainSpeaker] = useState({ x: 0, y: 0, z: 3.0 })
  const [delaySpeakers, setDelaySpeakers] = useState<DelaySpeaker[]>([
    { name: 'Delay Zone 1', x: 5, y: 8, z: 3.0 }
  ])
  const [temperature, setTemperature] = useState(20)
  const [additionalDelay, setAdditionalDelay] = useState(10)
  const [results, setResults] = useState<{ zones: DelayZone[]; speedOfSound: number; maxDelay: number } | null>(null)

  const handleCalculate = () => {
    const result = calculateSystemDelays(
      mainSpeaker,
      delaySpeakers.map(speaker => ({
        name: speaker.name,
        position: { x: speaker.x, y: speaker.y, z: speaker.z }
      })),
      temperature,
      additionalDelay
    )
    setResults(result)
  }

  const addDelaySpeaker = () => {
    setDelaySpeakers([...delaySpeakers, { name: `Delay Zone ${delaySpeakers.length + 1}`, x: 5, y: 10, z: 3.0 }])
  }

  const removeDelaySpeaker = (index: number) => {
    setDelaySpeakers(delaySpeakers.filter((_, i) => i !== index))
  }

  const updateDelaySpeaker = (index: number, field: keyof DelaySpeaker, value: string | number) => {
    const updated = [...delaySpeakers]
    updated[index] = { ...updated[index], [field]: value }
    setDelaySpeakers(updated)
  }

  const speedOfSound = calculateSpeedOfSound(temperature)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Delay Calculator</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Calculate delay times for distributed speaker systems to ensure coherent sound
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Main Speaker Position</CardTitle>
              <CardDescription>
                Position of the primary sound source
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mainX">X (m)</Label>
                  <Input
                    id="mainX"
                    type="number"
                    step="0.1"
                    value={mainSpeaker.x}
                    onChange={(e) => setMainSpeaker({ ...mainSpeaker, x: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mainY">Y (m)</Label>
                  <Input
                    id="mainY"
                    type="number"
                    step="0.1"
                    value={mainSpeaker.y}
                    onChange={(e) => setMainSpeaker({ ...mainSpeaker, y: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mainZ">Z (m)</Label>
                  <Input
                    id="mainZ"
                    type="number"
                    step="0.1"
                    value={mainSpeaker.z}
                    onChange={(e) => setMainSpeaker({ ...mainSpeaker, z: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delay Speakers</CardTitle>
              <CardDescription>
                Positions of delay/fill speakers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {delaySpeakers.map((speaker, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Delay Zone {index + 1}</Label>
                    {delaySpeakers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDelaySpeaker(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Zone name"
                      value={speaker.name}
                      onChange={(e) => updateDelaySpeaker(index, 'name', e.target.value)}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="X (m)"
                        type="number"
                        step="0.1"
                        value={speaker.x}
                        onChange={(e) => updateDelaySpeaker(index, 'x', parseFloat(e.target.value) || 0)}
                      />
                      <Input
                        placeholder="Y (m)"
                        type="number"
                        step="0.1"
                        value={speaker.y}
                        onChange={(e) => updateDelaySpeaker(index, 'y', parseFloat(e.target.value) || 0)}
                      />
                      <Input
                        placeholder="Z (m)"
                        type="number"
                        step="0.1"
                        value={speaker.z}
                        onChange={(e) => updateDelaySpeaker(index, 'z', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addDelaySpeaker} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Delay Speaker
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Environment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value) || 20)}
                />
                <p className="text-xs text-muted-foreground">
                  Speed of sound: {speedOfSound.toFixed(1)} m/s
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalDelay">Additional Delay (ms)</Label>
                <Input
                  id="additionalDelay"
                  type="number"
                  step="0.1"
                  value={additionalDelay}
                  onChange={(e) => setAdditionalDelay(parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Precedence effect delay (typically 10-20ms)
                </p>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleCalculate} className="w-full">
            Calculate Delays
          </Button>
        </div>

        <div>
          {results ? (
            <Card>
              <CardHeader>
                <CardTitle>Delay Settings</CardTitle>
                <CardDescription>
                  Configure delay processors with these values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Speed of Sound</p>
                      <p className="text-xl font-bold">{results.speedOfSound.toFixed(1)} m/s</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Max Delay</p>
                      <p className="text-xl font-bold">{results.maxDelay.toFixed(1)} ms</p>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Zone</TableHead>
                        <TableHead>Distance (m)</TableHead>
                        <TableHead>Delay Time (ms)</TableHead>
                        <TableHead>Delay Distance (m)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.zones.map((zone, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{zone.name}</TableCell>
                          <TableCell>{zone.distanceFromMain.toFixed(2)}</TableCell>
                          <TableCell className="font-mono">{zone.delayTime.toFixed(1)}</TableCell>
                          <TableCell className="font-mono">{zone.delayDistance.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                      Configuration Notes
                    </p>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Set delay times in milliseconds on your DSP or delay processor</li>
                      <li>• Ensure all delay speakers are time-aligned with main speakers</li>
                      <li>• Verify levels after setting delays - adjust if needed</li>
                      <li>• Test with pink noise or music to verify coherence</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  Enter speaker positions and calculate delay settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The calculator will determine:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                  <li>Delay time for each speaker zone</li>
                  <li>Distance-based acoustic delay</li>
                  <li>Precedence effect compensation</li>
                  <li>Speed of sound at given temperature</li>
                  <li>Recommended delay processor settings</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

