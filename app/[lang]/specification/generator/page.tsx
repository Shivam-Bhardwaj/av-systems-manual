'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { generateSystemSpecification } from '@/lib/equipment/specification-generator'
import { exportSpecification, downloadBlob } from '@/lib/export'
import { VenueSpecifications, VenueType, VenueCategory } from '@/lib/types'
import { FileText, FileSpreadsheet, File, Lightbulb, AlertTriangle, CheckCircle, Info, Zap, AlertCircle } from 'lucide-react'
import { SystemSuggestion } from '@/lib/intuition'
import venueTemplates from '@/data/venue-templates.json'

interface SpecificationFormData {
  projectName: string
  venueType: VenueType
  length: number
  width: number
  height: number
  capacity: number
  ambientNoise: number
  useCases: string[]
  notes?: string
}

export default function SpecificationGeneratorPage() {
  const [specification, setSpecification] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [useCaseInput, setUseCaseInput] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SpecificationFormData>({
    defaultValues: {
      projectName: '',
      venueType: 'conference-room-medium',
      length: 8,
      width: 5,
      height: 2.7,
      capacity: 20,
      ambientNoise: 40,
      useCases: [],
      notes: ''
    }
  })

  const selectedVenueType = watch('venueType')
  const useCases = watch('useCases')

  const handleVenueTypeChange = (value: VenueType) => {
    setValue('venueType', value)
    const template = venueTemplates.templates.find(t => t.type === value)
    if (template) {
      setValue('length', template.typicalDimensions.length)
      setValue('width', template.typicalDimensions.width)
      setValue('height', template.typicalDimensions.height)
      setValue('capacity', template.capacity.seated)
      setValue('ambientNoise', template.acoustics.ambientNoise)
      setValue('useCases', template.useCases)
    }
  }

  const addUseCase = () => {
    if (useCaseInput.trim() && !useCases.includes(useCaseInput.trim())) {
      setValue('useCases', [...useCases, useCaseInput.trim()])
      setUseCaseInput('')
    }
  }

  const removeUseCase = (index: number) => {
    setValue('useCases', useCases.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: SpecificationFormData) => {
    setIsGenerating(true)
    try {
      // Determine category from venue type
      let category: VenueCategory = 'corporate'
      if (data.venueType.includes('classroom') || data.venueType.includes('lecture') || data.venueType.includes('auditorium')) {
        category = 'education'
      } else if (data.venueType.includes('sanctuary') || data.venueType.includes('chapel')) {
        category = 'worship'
      } else if (data.venueType.includes('theater') || data.venueType.includes('nightclub')) {
        category = 'entertainment'
      } else if (data.venueType.includes('hotel') || data.venueType.includes('restaurant') || data.venueType.includes('retail')) {
        category = 'hospitality'
      }

      // Get target values from template
      const template = venueTemplates.templates.find(t => t.type === data.venueType)
      const targetRT60 = template?.acoustics.targetRT60 || 0.6
      const targetSTI = template?.acoustics.targetSTI || 0.7
      const targetSPL = template?.acoustics.targetSPL || { average: 65, peak: 85 }

      const venue: VenueSpecifications = {
        type: data.venueType,
        category,
        dimensions: {
          length: data.length,
          width: data.width,
          height: data.height
        },
        capacity: {
          seated: data.capacity,
          standing: 0
        },
        acoustics: {
          ambientNoise: data.ambientNoise,
          targetRT60,
          targetSTI,
          targetSPL
        },
        useCases: data.useCases,
        architecturalConstraints: []
      }

      const spec = await generateSystemSpecification(venue, data.projectName || 'Untitled Project')
      setSpecification(spec)
    } catch (error) {
      console.error('Error generating specification:', error)
      alert('Error generating specification. Please check your inputs.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExport = async (format: 'pdf' | 'excel' | 'word') => {
    if (!specification) return

    try {
      const { blob, filename } = await exportSpecification(specification, format)
      downloadBlob(blob, filename)
    } catch (error) {
      console.error('Error exporting:', error)
      alert('Error exporting specification')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Specification Generator</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Generate complete AV system specifications with equipment recommendations and installation details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>
                Enter venue details to generate a complete system specification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    {...register('projectName', { required: 'Project name is required' })}
                    placeholder="e.g., Main Conference Room AV System"
                  />
                  {errors.projectName && (
                    <p className="text-sm text-red-500">{errors.projectName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venueType">Venue Type</Label>
                  <Select value={selectedVenueType} onValueChange={handleVenueTypeChange}>
                    <SelectTrigger id="venueType">
                      <SelectValue placeholder="Select venue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conference-room-small">Small Conference Room (4-8 people)</SelectItem>
                      <SelectItem value="conference-room-medium">Medium Conference Room (10-20 people)</SelectItem>
                      <SelectItem value="conference-room-large">Large Conference Room (20-40 people)</SelectItem>
                      <SelectItem value="boardroom">Boardroom</SelectItem>
                      <SelectItem value="training-room">Training Room</SelectItem>
                      <SelectItem value="classroom-small">Small Classroom (20-30 students)</SelectItem>
                      <SelectItem value="classroom-large">Large Classroom (30-50 students)</SelectItem>
                      <SelectItem value="lecture-hall">Lecture Hall (50-150 students)</SelectItem>
                      <SelectItem value="auditorium">Auditorium (150-500 seats)</SelectItem>
                      <SelectItem value="sanctuary-small">Small Sanctuary (150-300 seats)</SelectItem>
                      <SelectItem value="sanctuary-medium">Medium Sanctuary (300-600 seats)</SelectItem>
                      <SelectItem value="hotel-ballroom">Hotel Ballroom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold mb-4">Room Dimensions</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="length">Length (m)</Label>
                      <Input
                        id="length"
                        type="number"
                        step="0.1"
                        {...register('length', { 
                          required: 'Length is required',
                          min: { value: 1, message: 'Length must be at least 1m' }
                        })}
                      />
                      {errors.length && <p className="text-sm text-red-500">{errors.length.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="width">Width (m)</Label>
                      <Input
                        id="width"
                        type="number"
                        step="0.1"
                        {...register('width', { 
                          required: 'Width is required',
                          min: { value: 1, message: 'Width must be at least 1m' }
                        })}
                      />
                      {errors.width && <p className="text-sm text-red-500">{errors.width.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (m)</Label>
                      <Input
                        id="height"
                        type="number"
                        step="0.1"
                        {...register('height', { 
                          required: 'Height is required',
                          min: { value: 2, message: 'Height must be at least 2m' }
                        })}
                      />
                      {errors.height && <p className="text-sm text-red-500">{errors.height.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Seating Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        {...register('capacity', { 
                          required: 'Capacity is required',
                          min: { value: 1, message: 'Capacity must be at least 1' }
                        })}
                      />
                      {errors.capacity && <p className="text-sm text-red-500">{errors.capacity.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ambientNoise">Ambient Noise Level (dBA)</Label>
                      <Input
                        id="ambientNoise"
                        type="number"
                        {...register('ambientNoise', { 
                          min: { value: 20, message: 'Noise level must be at least 20 dBA' },
                          max: { value: 80, message: 'Noise level must be less than 80 dBA' }
                        })}
                      />
                      {errors.ambientNoise && <p className="text-sm text-red-500">{errors.ambientNoise.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="useCases">Use Cases</Label>
                  <div className="flex gap-2">
                    <Input
                      id="useCases"
                      value={useCaseInput}
                      onChange={(e) => setUseCaseInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addUseCase()
                        }
                      }}
                      placeholder="e.g., Video conferencing, Presentations"
                    />
                    <Button type="button" onClick={addUseCase} variant="outline">
                      Add
                    </Button>
                  </div>
                  {useCases.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {useCases.map((useCase, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm"
                        >
                          {useCase}
                          <button
                            type="button"
                            onClick={() => removeUseCase(index)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Any special requirements or constraints..."
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isGenerating}>
                  {isGenerating ? 'Generating Specification...' : 'Generate Specification'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {specification ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    System Intuition & Recommendations
                  </CardTitle>
                  <CardDescription>
                    Intelligent suggestions based on your venue specifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {specification.intuition ? (
                    <div className="space-y-6">
                      {/* Feasibility Status */}
                      <div>
                        <h3 className="font-semibold mb-3">Feasibility Status</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className={`p-3 rounded-lg border ${
                            specification.intuition.feasibility.power.status === 'ok' 
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                              : specification.intuition.feasibility.power.status === 'warning'
                              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <Zap className="h-4 w-4" />
                              <span className="text-sm font-medium">Power</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Load: {specification.intuition.feasibility.power.totalLoad.toFixed(0)}W
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Breaker: {specification.intuition.feasibility.power.recommendedBreaker}A
                            </p>
                          </div>
                          <div className={`p-3 rounded-lg border ${
                            specification.intuition.feasibility.acoustics.rt60Status === 'ok' 
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                              : specification.intuition.feasibility.acoustics.rt60Status === 'warning'
                              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">Acoustics</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              RT60: {specification.intuition.feasibility.acoustics.rt60Status}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              STI: {specification.intuition.feasibility.acoustics.stiStatus}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Suggestions */}
                      {specification.intuition.suggestions.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3">Suggestions</h3>
                          <div className="space-y-2">
                            {specification.intuition.suggestions.slice(0, 5).map((suggestion: SystemSuggestion) => {
                              const getIcon = () => {
                                switch (suggestion.severity) {
                                  case 'critical':
                                    return <AlertTriangle className="h-4 w-4 text-red-500" />
                                  case 'warning':
                                    return <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                  case 'success':
                                    return <CheckCircle className="h-4 w-4 text-green-500" />
                                  default:
                                    return <Info className="h-4 w-4 text-blue-500" />
                                }
                              }
                              
                              const getBgColor = () => {
                                switch (suggestion.severity) {
                                  case 'critical':
                                    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                  case 'warning':
                                    return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                                  case 'success':
                                    return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                  default:
                                    return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                }
                              }

                              return (
                                <div key={suggestion.id} className={`p-3 rounded-lg border ${getBgColor()}`}>
                                  <div className="flex items-start gap-2">
                                    {getIcon()}
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{suggestion.title.en}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {suggestion.description.en}
                                      </p>
                                      {suggestion.action?.estimatedSavings && (
                                        <p className="text-xs font-semibold text-green-600 dark:text-green-400 mt-1">
                                          Estimated savings: ${suggestion.action.estimatedSavings.toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          {specification.intuition.suggestions.length > 5 && (
                            <p className="text-xs text-muted-foreground mt-2">
                              +{specification.intuition.suggestions.length - 5} more suggestions
                            </p>
                          )}
                        </div>
                      )}

                      {/* Compatibility Issues */}
                      {specification.intuition.feasibility.compatibility.issues.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3 text-red-600 dark:text-red-400">Compatibility Issues</h3>
                          <div className="space-y-2">
                            {specification.intuition.feasibility.compatibility.issues.map((issue: { equipment1: string; equipment2: string; issue: string }, idx: number) => (
                              <div key={idx} className="p-3 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                                <p className="text-sm font-medium">{issue.equipment1} ↔ {issue.equipment2}</p>
                                <p className="text-xs text-muted-foreground mt-1">{issue.issue}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recommendations available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Specification Generated</CardTitle>
                  <CardDescription>
                    Download in your preferred format
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleExport('pdf')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as PDF
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleExport('excel')}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export as Excel
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleExport('word')}
                  >
                    <File className="h-4 w-4 mr-2" />
                    Export as Word
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Project</p>
                    <p className="font-semibold">{specification.projectName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Venue Type</p>
                    <p className="font-semibold">{specification.venue.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Equipment Cost</p>
                    <p className="font-semibold">${specification.budget.equipment.total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Installation Cost</p>
                    <p className="font-semibold">${specification.budget.installation.total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Grand Total</p>
                    <p className="text-xl font-bold">${specification.budget.grandTotal.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Fill out the form to generate a complete AV system specification including:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                  <li>Equipment recommendations</li>
                  <li>Acoustic calculations</li>
                  <li>Installation specifications</li>
                  <li>Budget estimates</li>
                  <li>Exportable documentation</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

