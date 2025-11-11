'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  calculateDisplaySize,
  calculateViewingAngles,
  calculatePixelDensity,
  calculateBrightnessRequirements,
  calculateOptimalViewingDistance,
  type DisplaySizeResult,
  type ViewingAngleResult,
  type PixelDensityResult
} from '@/lib/acoustics/video'

export default function VideoCalculatorPage() {
  const [activeTab, setActiveTab] = useState('size')
  
  // Display size calculator
  const [sizeData, setSizeData] = useState({
    furthestDistance: 10,
    viewingRule: '6x' as '4x' | '6x' | '8x',
    aspectRatio: '16:9' as '16:9' | '16:10' | '4:3'
  })
  const [sizeResult, setSizeResult] = useState<DisplaySizeResult | null>(null)

  // Viewing angle calculator
  const [angleData, setAngleData] = useState({
    viewerX: 5,
    viewerY: 8,
    viewerZ: 1.2,
    displayX: 0,
    displayY: 0,
    displayZ: 2.5,
    displayWidth: 2.5,
    displayHeight: 1.4
  })
  const [angleResult, setAngleResult] = useState<ViewingAngleResult | null>(null)

  // Pixel density calculator
  const [pixelData, setPixelData] = useState({
    resolutionWidth: 1920,
    resolutionHeight: 1080,
    displayWidth: 2.5,
    displayHeight: 1.4,
    viewingDistance: 5
  })
  const [pixelResult, setPixelResult] = useState<PixelDensityResult | null>(null)

  // Brightness calculator
  const [brightnessData, setBrightnessData] = useState({
    ambientLight: 500,
    contrastRatio: 10
  })
  const [brightnessResult, setBrightnessResult] = useState<any>(null)

  const handleSizeCalculate = () => {
    const result = calculateDisplaySize(
      sizeData.furthestDistance,
      sizeData.viewingRule,
      sizeData.aspectRatio
    )
    setSizeResult(result)
  }

  const handleAngleCalculate = () => {
    const result = calculateViewingAngles(
      { x: angleData.viewerX, y: angleData.viewerY, z: angleData.viewerZ },
      { x: angleData.displayX, y: angleData.displayY, z: angleData.displayZ },
      { width: angleData.displayWidth, height: angleData.displayHeight }
    )
    setAngleResult(result)
  }

  const handlePixelCalculate = () => {
    const result = calculatePixelDensity(
      { width: pixelData.resolutionWidth, height: pixelData.resolutionHeight },
      { width: pixelData.displayWidth, height: pixelData.displayHeight },
      pixelData.viewingDistance
    )
    setPixelResult(result)
  }

  const handleBrightnessCalculate = () => {
    const result = calculateBrightnessRequirements(
      brightnessData.ambientLight,
      brightnessData.contrastRatio
    )
    setBrightnessResult(result)
  }

  const viewingDistanceResult = sizeResult
    ? calculateOptimalViewingDistance(
        { width: sizeResult.screenWidth, height: sizeResult.screenHeight },
        sizeResult.viewingRule
      )
    : null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Video Calculator</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Calculate display size, viewing angles, pixel density, and brightness requirements
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="size">Display Size</TabsTrigger>
          <TabsTrigger value="angles">Viewing Angles</TabsTrigger>
          <TabsTrigger value="pixels">Pixel Density</TabsTrigger>
          <TabsTrigger value="brightness">Brightness</TabsTrigger>
        </TabsList>

        <TabsContent value="size" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Display Size Calculator</CardTitle>
                <CardDescription>
                  Determine appropriate display size based on viewing distance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="furthestDistance">Furthest Viewer Distance (m)</Label>
                  <Input
                    id="furthestDistance"
                    type="number"
                    step="0.1"
                    value={sizeData.furthestDistance}
                    onChange={(e) => setSizeData({ ...sizeData, furthestDistance: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="viewingRule">Viewing Rule</Label>
                  <Select 
                    value={sizeData.viewingRule} 
                    onValueChange={(v) => setSizeData({ ...sizeData, viewingRule: v as '4x' | '6x' | '8x' })}
                  >
                    <SelectTrigger id="viewingRule">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4x">4× Height (Detailed viewing)</SelectItem>
                      <SelectItem value="6x">6× Height (General viewing)</SelectItem>
                      <SelectItem value="8x">8× Height (Passive viewing)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aspectRatio">Aspect Ratio</Label>
                  <Select 
                    value={sizeData.aspectRatio} 
                    onValueChange={(v) => setSizeData({ ...sizeData, aspectRatio: v as '16:9' | '16:10' | '4:3' })}
                  >
                    <SelectTrigger id="aspectRatio">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                      <SelectItem value="16:10">16:10 (Widescreen)</SelectItem>
                      <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSizeCalculate} className="w-full">
                  Calculate Display Size
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
              </CardHeader>
              <CardContent>
                {sizeResult ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Screen Width</p>
                        <p className="text-2xl font-bold">{sizeResult.screenWidth.toFixed(2)} m</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Screen Height</p>
                        <p className="text-2xl font-bold">{sizeResult.screenHeight.toFixed(2)} m</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Diagonal Size</p>
                        <p className="text-2xl font-bold">{sizeResult.diagonalInches}"</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Aspect Ratio</p>
                        <p className="text-2xl font-bold">{sizeResult.aspectRatio}</p>
                      </div>
                    </div>

                    {viewingDistanceResult && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm font-semibold mb-2">Viewing Distance Range</p>
                        <div className="space-y-1 text-sm">
                          <p>Minimum: {viewingDistanceResult.minDistance.toFixed(1)} m</p>
                          <p>Optimal: {viewingDistanceResult.optimalDistance.toFixed(1)} m</p>
                          <p>Maximum: {viewingDistanceResult.maxDistance.toFixed(1)} m</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Enter parameters and calculate to see results
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="angles" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Viewing Angle Calculator</CardTitle>
                <CardDescription>
                  Calculate viewing angles from viewer position to display
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">Viewer Position (m)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="X"
                      type="number"
                      step="0.1"
                      value={angleData.viewerX}
                      onChange={(e) => setAngleData({ ...angleData, viewerX: parseFloat(e.target.value) || 0 })}
                    />
                    <Input
                      placeholder="Y"
                      type="number"
                      step="0.1"
                      value={angleData.viewerY}
                      onChange={(e) => setAngleData({ ...angleData, viewerY: parseFloat(e.target.value) || 0 })}
                    />
                    <Input
                      placeholder="Z"
                      type="number"
                      step="0.1"
                      value={angleData.viewerZ}
                      onChange={(e) => setAngleData({ ...angleData, viewerZ: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Display Position (m)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="X"
                      type="number"
                      step="0.1"
                      value={angleData.displayX}
                      onChange={(e) => setAngleData({ ...angleData, displayX: parseFloat(e.target.value) || 0 })}
                    />
                    <Input
                      placeholder="Y"
                      type="number"
                      step="0.1"
                      value={angleData.displayY}
                      onChange={(e) => setAngleData({ ...angleData, displayY: parseFloat(e.target.value) || 0 })}
                    />
                    <Input
                      placeholder="Z"
                      type="number"
                      step="0.1"
                      value={angleData.displayZ}
                      onChange={(e) => setAngleData({ ...angleData, displayZ: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Display Size (m)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Width"
                      type="number"
                      step="0.1"
                      value={angleData.displayWidth}
                      onChange={(e) => setAngleData({ ...angleData, displayWidth: parseFloat(e.target.value) || 0 })}
                    />
                    <Input
                      placeholder="Height"
                      type="number"
                      step="0.1"
                      value={angleData.displayHeight}
                      onChange={(e) => setAngleData({ ...angleData, displayHeight: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <Button onClick={handleAngleCalculate} className="w-full">
                  Calculate Viewing Angles
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
              </CardHeader>
              <CardContent>
                {angleResult ? (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${angleResult.acceptable ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
                      <p className={`font-semibold ${angleResult.acceptable ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
                        {angleResult.acceptable ? '✓ Acceptable Viewing Angle' : '⚠ Viewing Angle Outside Ideal Range'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Horizontal Angle</p>
                        <p className="text-2xl font-bold">{angleResult.horizontalAngle.toFixed(1)}°</p>
                        <p className="text-xs text-muted-foreground">Ideal: ±30°, Max: ±45°</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Vertical Angle</p>
                        <p className="text-2xl font-bold">{angleResult.verticalAngle.toFixed(1)}°</p>
                        <p className="text-xs text-muted-foreground">Ideal: 0-15°, Max: 0-30°</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Distance</p>
                        <p className="text-2xl font-bold">{angleResult.distance.toFixed(2)} m</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Enter positions and calculate to see results
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pixels" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Pixel Density Calculator</CardTitle>
                <CardDescription>
                  Calculate pixel density and readability requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">Display Resolution (pixels)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Width"
                      type="number"
                      value={pixelData.resolutionWidth}
                      onChange={(e) => setPixelData({ ...pixelData, resolutionWidth: parseInt(e.target.value) || 0 })}
                    />
                    <Input
                      placeholder="Height"
                      type="number"
                      value={pixelData.resolutionHeight}
                      onChange={(e) => setPixelData({ ...pixelData, resolutionHeight: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Display Size (m)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Width"
                      type="number"
                      step="0.1"
                      value={pixelData.displayWidth}
                      onChange={(e) => setPixelData({ ...pixelData, displayWidth: parseFloat(e.target.value) || 0 })}
                    />
                    <Input
                      placeholder="Height"
                      type="number"
                      step="0.1"
                      value={pixelData.displayHeight}
                      onChange={(e) => setPixelData({ ...pixelData, displayHeight: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="viewingDistance">Viewing Distance (m)</Label>
                  <Input
                    id="viewingDistance"
                    type="number"
                    step="0.1"
                    value={pixelData.viewingDistance}
                    onChange={(e) => setPixelData({ ...pixelData, viewingDistance: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <Button onClick={handlePixelCalculate} className="w-full">
                  Calculate Pixel Density
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
              </CardHeader>
              <CardContent>
                {pixelResult ? (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${pixelResult.readable ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
                      <p className={`font-semibold ${pixelResult.readable ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
                        {pixelResult.readable ? '✓ Text Readable' : '⚠ Text May Be Difficult to Read'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Pixels per Inch</p>
                        <p className="text-2xl font-bold">{pixelResult.pixelsPerInch.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pixels per Meter</p>
                        <p className="text-2xl font-bold">{pixelResult.pixelsPerMeter.toFixed(0)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Min Pixel Pitch (LED)</p>
                        <p className="text-2xl font-bold">{pixelResult.minimumPixelPitch.toFixed(1)} mm</p>
                        <p className="text-xs text-muted-foreground">For LED walls at this viewing distance</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Enter parameters and calculate to see results
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="brightness" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Brightness Calculator</CardTitle>
                <CardDescription>
                  Calculate required display brightness based on ambient light
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ambientLight">Ambient Light Level (lux)</Label>
                  <Input
                    id="ambientLight"
                    type="number"
                    value={brightnessData.ambientLight}
                    onChange={(e) => setBrightnessData({ ...brightnessData, ambientLight: parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Typical: Office (500 lux), Bright room (1000 lux), Outdoor (10000+ lux)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contrastRatio">Desired Contrast Ratio</Label>
                  <Input
                    id="contrastRatio"
                    type="number"
                    value={brightnessData.contrastRatio}
                    onChange={(e) => setBrightnessData({ ...brightnessData, contrastRatio: parseFloat(e.target.value) || 10 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Typical: 10:1 for presentations, 3:1 minimum for readability
                  </p>
                </div>

                <Button onClick={handleBrightnessCalculate} className="w-full">
                  Calculate Brightness Requirements
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
              </CardHeader>
              <CardContent>
                {brightnessResult ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Required Brightness</p>
                        <p className="text-2xl font-bold">{brightnessResult.requiredBrightness.toFixed(0)} nits</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Foot-Lamberts</p>
                        <p className="text-2xl font-bold">{brightnessResult.footLamberts.toFixed(1)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Recommended Display Brightness</p>
                        <p className="text-2xl font-bold">{brightnessResult.recommendedDisplayBrightness} nits</p>
                        <p className="text-xs text-muted-foreground">Includes 20% headroom</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Enter parameters and calculate to see results
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

