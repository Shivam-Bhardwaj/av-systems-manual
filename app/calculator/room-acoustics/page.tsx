'use client'

import { useState } from 'react'
import { RoomDimensionsForm } from '@/components/forms/room-dimensions-form'
import { AcousticResults } from '@/components/calculators/acoustic-results'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateRT60, ABSORPTION_COEFFICIENTS, type RoomSurface } from '@/lib/acoustics/rt60'
import { calculateSTI, type STIParameters } from '@/lib/acoustics/sti'
import { estimateSTI } from '@/lib/acoustics/sti'
import standards from '@/data/standards.json'

export default function RoomAcousticsPage() {
  const [results, setResults] = useState<{
    rt60?: any
    sti?: any
    targetRT60?: { min: number; max: number }
  }>({})

  const handleCalculate = (data: any) => {
    // Get target RT60 for venue type
    const venueCategory = data.venueType.includes('conference') || data.venueType.includes('classroom') ? 'speech' : 'multipurpose'
    const venueSize = data.venueType.includes('small') ? 'conference-room' : 
                     data.venueType.includes('large') ? 'auditorium' : 
                     'classroom'
    
    const targetRT60 = venueCategory === 'speech' 
      ? standards.acoustic.rt60Targets.speech[venueSize as keyof typeof standards.acoustic.rt60Targets.speech]
      : standards.acoustic.rt60Targets.multipurpose.default

    // Create room surfaces based on typical materials
    const surfaces: RoomSurface[] = [
      {
        area: data.width * data.height,
        material: 'Front Wall - Gypsum',
        absorptionCoefficients: ABSORPTION_COEFFICIENTS['gypsum-board']
      },
      {
        area: data.width * data.height,
        material: 'Rear Wall - Gypsum',
        absorptionCoefficients: ABSORPTION_COEFFICIENTS['gypsum-board']
      },
      {
        area: data.length * data.height * 2,
        material: 'Side Walls - Gypsum',
        absorptionCoefficients: ABSORPTION_COEFFICIENTS['gypsum-board']
      },
      {
        area: data.length * data.width,
        material: 'Floor - Carpet',
        absorptionCoefficients: ABSORPTION_COEFFICIENTS['carpet-heavy']
      },
      {
        area: data.length * data.width,
        material: 'Ceiling - Acoustic Tile',
        absorptionCoefficients: ABSORPTION_COEFFICIENTS['acoustic-ceiling']
      }
    ]

    // Calculate RT60
    const rt60Result = calculateRT60(
      { length: data.length, width: data.width, height: data.height },
      surfaces,
      { seated: data.capacity, standing: 0 },
      targetRT60
    )

    // Estimate STI
    const snr = 85 - (data.ambientNoise || 40) // Assume 85 dB speech level
    const estimatedSTI = estimateSTI(rt60Result.recommended, snr)

    setResults({
      rt60: rt60Result,
      sti: {
        value: estimatedSTI,
        rating: estimatedSTI > 0.75 ? 'excellent' : 
                estimatedSTI > 0.60 ? 'good' : 
                estimatedSTI > 0.45 ? 'fair' : 'poor',
        modificationFactors: {
          noise: 0.1,
          reverberation: 0.2,
          level: 0,
          nonlinearity: 0
        }
      },
      targetRT60
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Room Acoustics Calculator</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Calculate RT60 reverberation time and speech intelligibility for your venue
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <RoomDimensionsForm onSubmit={handleCalculate} />
        </div>

        <div>
          {results.rt60 ? (
            <AcousticResults 
              rt60={results.rt60} 
              sti={results.sti} 
              targetRT60={results.targetRT60}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  Enter room dimensions to calculate acoustic parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The calculator will determine:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                  <li>RT60 reverberation time using Sabine and Eyring formulas</li>
                  <li>Frequency-dependent RT60 values</li>
                  <li>Speech Transmission Index (STI) estimate</li>
                  <li>Comparison with recommended values</li>
                  <li>Treatment recommendations if needed</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
