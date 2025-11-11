'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RT60Result, STIResult } from '@/lib/acoustics'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface AcousticResultsProps {
  rt60?: RT60Result
  sti?: STIResult
  targetRT60?: { min: number; max: number }
}

export function AcousticResults({ rt60, sti, targetRT60 }: AcousticResultsProps) {
  if (!rt60 && !sti) return null

  const getStatusIcon = (withinTarget: boolean | undefined) => {
    if (withinTarget === undefined) return null
    return withinTarget ? (
      <CheckCircle2 className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    )
  }

  const getSTIColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'fair': return 'text-yellow-600'
      case 'poor': return 'text-orange-600'
      case 'bad': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-4">
      {rt60 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>RT60 Reverberation Time</CardTitle>
              {getStatusIcon(rt60.withinTarget)}
            </div>
            <CardDescription>
              Recommended: {rt60.recommended.toFixed(2)}s
              {targetRT60 && ` (Target: ${targetRT60.min}-${targetRT60.max}s)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Sabine Method</h4>
                  <div className="space-y-1 text-sm">
                    <div>Average: {rt60.sabine.average.toFixed(2)}s</div>
                    <div className="text-xs text-muted-foreground">
                      500Hz: {rt60.sabine[500].toFixed(2)}s | 
                      1kHz: {rt60.sabine[1000].toFixed(2)}s | 
                      2kHz: {rt60.sabine[2000].toFixed(2)}s
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Eyring Method</h4>
                  <div className="space-y-1 text-sm">
                    <div>Average: {rt60.eyring.average.toFixed(2)}s</div>
                    <div className="text-xs text-muted-foreground">
                      500Hz: {rt60.eyring[500].toFixed(2)}s | 
                      1kHz: {rt60.eyring[1000].toFixed(2)}s | 
                      2kHz: {rt60.eyring[2000].toFixed(2)}s
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Frequency Analysis</h4>
                <div className="grid grid-cols-6 gap-2 text-xs">
                  {[125, 250, 500, 1000, 2000, 4000].map(freq => (
                    <div key={freq} className="text-center">
                      <div className="font-medium">{freq}Hz</div>
                      <div>{rt60.sabine[freq as keyof typeof rt60.sabine].toFixed(2)}s</div>
                    </div>
                  ))}
                </div>
              </div>

              {!rt60.withinTarget && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-md">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-900">Acoustic Treatment Needed</p>
                    <p className="text-yellow-700">
                      The current RT60 is outside the recommended range. Consider adding acoustic panels, 
                      curtains, or ceiling treatment to achieve optimal reverberation time.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {sti && (
        <Card>
          <CardHeader>
            <CardTitle>Speech Transmission Index (STI)</CardTitle>
            <CardDescription>
              Speech intelligibility prediction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-2xl font-bold">{sti.value.toFixed(2)}</div>
                  <div className={`text-sm font-medium ${getSTIColor(sti.rating)}`}>
                    {sti.rating.charAt(0).toUpperCase() + sti.rating.slice(1)} Intelligibility
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Scale: 0-1</div>
                  <div className="text-xs text-gray-500">Higher is better</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Contributing Factors</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Noise Impact</span>
                    <span>{(sti.modificationFactors.noise * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Reverberation Impact</span>
                    <span>{(sti.modificationFactors.reverberation * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>Guidelines:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>&gt; 0.75: Excellent - Suitable for critical listening</li>
                  <li>0.60 - 0.75: Good - Suitable for most applications</li>
                  <li>0.45 - 0.60: Fair - Acceptable for general PA</li>
                  <li>&lt; 0.45: Poor - Requires improvement</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
