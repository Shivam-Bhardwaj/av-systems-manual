'use client'

import { useForm } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VenueType } from '@/lib/types'
import venueTemplates from '@/data/venue-templates.json'

interface RoomDimensionsFormData {
  venueType: VenueType
  length: number
  width: number
  height: number
  capacity: number
  ambientNoise?: number
}

interface RoomDimensionsFormProps {
  onSubmit: (data: RoomDimensionsFormData) => void
  initialValues?: Partial<RoomDimensionsFormData>
}

export function RoomDimensionsForm({ onSubmit, initialValues }: RoomDimensionsFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RoomDimensionsFormData>({
    defaultValues: initialValues || {
      venueType: 'conference-room-medium',
      length: 8,
      width: 5,
      height: 2.7,
      capacity: 20,
      ambientNoise: 40
    }
  })

  const selectedVenueType = watch('venueType')

  const handleVenueTypeChange = (value: VenueType) => {
    setValue('venueType', value)
    
    // Find template and apply typical dimensions
    const template = venueTemplates.templates.find(t => t.type === value)
    if (template) {
      setValue('length', template.typicalDimensions.length)
      setValue('width', template.typicalDimensions.width)
      setValue('height', template.typicalDimensions.height)
      setValue('capacity', template.capacity.seated)
      setValue('ambientNoise', template.acoustics.ambientNoise)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Dimensions & Type</CardTitle>
        <CardDescription>
          Enter the room specifications or select a venue type to use typical values
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="length">Length (m)</Label>
              <Input
                id="length"
                type="number"
                step="0.1"
                {...register('length', { 
                  required: 'Length is required',
                  min: { value: 1, message: 'Length must be at least 1m' },
                  max: { value: 100, message: 'Length must be less than 100m' }
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
                  min: { value: 1, message: 'Width must be at least 1m' },
                  max: { value: 100, message: 'Width must be less than 100m' }
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
                  min: { value: 2, message: 'Height must be at least 2m' },
                  max: { value: 20, message: 'Height must be less than 20m' }
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
                  min: { value: 1, message: 'Capacity must be at least 1' },
                  max: { value: 5000, message: 'Capacity must be less than 5000' }
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
                placeholder="40"
              />
              {errors.ambientNoise && <p className="text-sm text-red-500">{errors.ambientNoise.message}</p>}
            </div>
          </div>

          <Button type="submit" className="w-full">
            Calculate Requirements
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
