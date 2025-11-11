'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { calculateSpeakerRequirements, calculateAmplifierPower, type SPLCalculationResult } from '@/lib/acoustics/spl'
import { Speaker } from '@/lib/types/equipment'
import equipmentData from '@/data/equipment.json'
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function SPLCalculatorPage() {
  const [results, setResults] = useState<SPLCalculationResult | null>(null)
  const [formData, setFormData] = useState({
    length: 8,
    width: 5,
    height: 2.7,
    targetSPLAverage: 65,
    targetSPLPeak: 85,
    ambientNoise: 40,
    speakerId: '',
    mountingHeight: 3.0
  })

  const speakers = equipmentData.speakers as Speaker[]

  const handleCalculate = () => {
    if (!formData.speakerId) {
      alert('Please select a speaker')
      return
    }

    const speaker = speakers.find(s => s.id === formData.speakerId)
    if (!speaker) return

    const result = calculateSpeakerRequirements(
      { length: formData.length, width: formData.width, height: formData.height },
      { average: formData.targetSPLAverage, peak: formData.targetSPLPeak },
      formData.ambientNoise,
      speaker,
      formData.mountingHeight
    )

    setResults(result)
  }

  const coverageData = results?.coverage.map(point => ({
    x: point.x,
    y: point.y,
    z: point.spl
  })) || []

  const getSPLColor = (spl: number) => {
    if (spl >= formData.targetSPLAverage + 3) return '#10b981' // green
    if (spl >= formData.targetSPLAverage) return '#3b82f6' // blue
    if (spl >= formData.targetSPLAverage - 3) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SPL Calculator</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Calculate speaker requirements, coverage patterns, and amplifier power needs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Room & Requirements</CardTitle>
            <CardDescription>
              Enter room dimensions and target SPL levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="length">Length (m)</Label>
                <Input
                  id="length"
                  type="number"
                  step="0.1"
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">Width (m)</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.1"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (m)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetSPLAverage">Target Avg SPL (dB)</Label>
                <Input
                  id="targetSPLAverage"
                  type="number"
                  value={formData.targetSPLAverage}
                  onChange={(e) => setFormData({ ...formData, targetSPLAverage: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetSPLPeak">Target Peak SPL (dB)</Label>
                <Input
                  id="targetSPLPeak"
                  type="number"
                  value={formData.targetSPLPeak}
                  onChange={(e) => setFormData({ ...formData, targetSPLPeak: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ambientNoise">Ambient Noise (dBA)</Label>
                <Input
                  id="ambientNoise"
                  type="number"
                  value={formData.ambientNoise}
                  onChange={(e) => setFormData({ ...formData, ambientNoise: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mountingHeight">Mounting Height (m)</Label>
                <Input
                  id="mountingHeight"
                  type="number"
                  step="0.1"
                  value={formData.mountingHeight}
                  onChange={(e) => setFormData({ ...formData, mountingHeight: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="speaker">Speaker Model</Label>
              <Select value={formData.speakerId} onValueChange={(value) => setFormData({ ...formData, speakerId: value })}>
                <SelectTrigger id="speaker">
                  <SelectValue placeholder="Select speaker" />
                </SelectTrigger>
                <SelectContent>
                  {speakers.map((speaker) => (
                    <SelectItem key={speaker.id} value={speaker.id}>
                      {speaker.manufacturer} {speaker.model} - {speaker.sensitivity}dB @ 1W/1m
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleCalculate} className="w-full">
              Calculate SPL Requirements
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {results ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                  <CardDescription>Speaker and amplifier requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Speakers Required</p>
                      <p className="text-2xl font-bold">{results.speakersRequired}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Power per Speaker</p>
                      <p className="text-2xl font-bold">{Math.round(results.powerRequired)}W</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average SPL</p>
                      <p className="text-2xl font-bold">{results.averageSPL.toFixed(1)} dB</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">SPL Variance</p>
                      <p className="text-2xl font-bold">{results.variance.toFixed(1)} dB</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Min SPL</p>
                      <p className="text-2xl font-bold">{results.minSPL.toFixed(1)} dB</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Max SPL</p>
                      <p className="text-2xl font-bold">{results.maxSPL.toFixed(1)} dB</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${results.meetsRequirement ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
                    <p className={`font-semibold ${results.meetsRequirement ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
                      {results.meetsRequirement ? '✓ Requirements Met' : '⚠ Requirements Not Fully Met'}
                    </p>
                    {!results.meetsRequirement && (
                      <ul className="text-sm mt-2 space-y-1">
                        {results.minSPL < formData.targetSPLAverage && (
                          <li>• Minimum SPL below target</li>
                        )}
                        {results.variance > 6 && (
                          <li>• Coverage variance exceeds 6 dB</li>
                        )}
                      </ul>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Coverage Map</CardTitle>
                  <CardDescription>SPL distribution across the room</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart data={coverageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        dataKey="x" 
                        name="Width (m)"
                        domain={[0, formData.width]}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="y" 
                        name="Length (m)"
                        domain={[0, formData.length]}
                      />
                      <ZAxis 
                        type="number" 
                        dataKey="z" 
                        name="SPL (dB)"
                        range={[50, 100]}
                      />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload[0]) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-background border rounded-lg p-2 shadow-lg">
                                <p className="font-semibold">Position: ({data.x.toFixed(1)}m, {data.y.toFixed(1)}m)</p>
                                <p>SPL: {data.z.toFixed(1)} dB</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Scatter name="SPL Coverage" data={coverageData} fill="#3b82f6">
                        {coverageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getSPLColor(entry.z)} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span>≥ {formData.targetSPLAverage + 3} dB</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>{formData.targetSPLAverage} - {formData.targetSPLAverage + 3} dB</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span>{formData.targetSPLAverage - 3} - {formData.targetSPLAverage} dB</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span>&lt; {formData.targetSPLAverage - 3} dB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  Enter room specifications and select a speaker to calculate requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The calculator will determine:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                  <li>Number of speakers required for coverage</li>
                  <li>Power requirements per speaker</li>
                  <li>SPL distribution across the room</li>
                  <li>Coverage variance and uniformity</li>
                  <li>Amplifier power requirements</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

