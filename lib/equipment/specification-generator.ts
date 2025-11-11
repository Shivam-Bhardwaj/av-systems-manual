import {
  SystemSpecification,
  VenueSpecifications,
  AudioSystemSpec,
  VideoSystemSpec,
  ControlSystemSpec,
  InstallationSpec,
  BudgetSummary,
  CableRun,
  PowerCircuit,
  RackUnit,
  MountingDetail,
  Equipment,
  Speaker,
  Amplifier
} from '@/lib/types'
import { generateEquipmentRecommendation } from './equipment-selector'
import { calculateRT60, ABSORPTION_COEFFICIENTS, RoomSurface } from '@/lib/acoustics/rt60'
import { calculateSTI, STIParameters } from '@/lib/acoustics/sti'
import { calculateSystemDelays } from '@/lib/acoustics/delay'
import { calculateCoverageGrid } from '@/lib/acoustics/spl'

/**
 * Generate complete system specification
 */
export async function generateSystemSpecification(
  venue: VenueSpecifications,
  projectName: string
): Promise<SystemSpecification> {
  const id = `SPEC-${Date.now()}`
  
  // Generate equipment recommendations
  const equipment = generateEquipmentRecommendation(venue)
  
  // Prepare surfaces for acoustic calculations
  const surfaces = generateRoomSurfaces(venue)
  
  // Calculate acoustics
  const rt60Result = calculateRT60(
    venue.dimensions,
    surfaces,
    { seated: venue.capacity.seated, standing: venue.capacity.standing },
    { min: venue.acoustics.targetRT60 - 0.2, max: venue.acoustics.targetRT60 + 0.2 }
  )
  
  // Prepare speaker placements for coverage calculation
  const speakerPlacements = equipment.speakers.main.map((sel, index) => {
    const speaker = sel.equipment as Speaker
    const spacing = venue.dimensions.width / sel.quantity
    const positions = Array.from({ length: sel.quantity }, (_, i) => ({
      speaker,
      position: {
        x: (i + 0.5) * spacing,
        y: 1, // Front of room
        z: venue.dimensions.height - 0.5 // Near ceiling
      },
      aimPoint: {
        x: (i + 0.5) * spacing,
        y: venue.dimensions.length * 0.7,
        z: 1.2 // Seated ear height
      },
      tiltAngle: 0,
      panAngle: 0
    }))
    return positions
  }).flat()
  
  // Calculate coverage
  const coverage = calculateCoverageGrid(venue.dimensions, speakerPlacements)
  const splValues = coverage.map(p => p.spl)
  const avgSPL = splValues.reduce((a, b) => a + b) / splValues.length
  const minSPL = Math.min(...splValues)
  const maxSPL = Math.max(...splValues)
  
  // Estimate STI
  const stiParams: STIParameters = {
    rt60Values: {
      125: rt60Result.sabine[125],
      250: rt60Result.sabine[250],
      500: rt60Result.sabine[500],
      1000: rt60Result.sabine[1000],
      2000: rt60Result.sabine[2000],
      4000: rt60Result.sabine[4000],
      8000: rt60Result.sabine[4000] // Use 4kHz value
    },
    backgroundNoise: {
      125: venue.acoustics.ambientNoise + 10,
      250: venue.acoustics.ambientNoise + 5,
      500: venue.acoustics.ambientNoise,
      1000: venue.acoustics.ambientNoise,
      2000: venue.acoustics.ambientNoise,
      4000: venue.acoustics.ambientNoise + 5,
      8000: venue.acoustics.ambientNoise + 10
    },
    signalLevel: {
      125: avgSPL - 10,
      250: avgSPL - 5,
      500: avgSPL,
      1000: avgSPL,
      2000: avgSPL - 3,
      4000: avgSPL - 8,
      8000: avgSPL - 15
    },
    distance: venue.dimensions.length / 2
  }
  
  const stiResult = calculateSTI(stiParams)
  
  // Generate audio system specification
  const audioSpec: AudioSystemSpec = {
    speakers: equipment.speakers,
    amplifiers: equipment.amplifiers,
    mixers: equipment.mixers,
    microphones: equipment.microphones,
    processing: [], // TODO: Add DSP selection
    accessories: [], // TODO: Add stands, cables, etc.
    calculations: {
      totalPower: equipment.amplifiers.reduce((sum, amp) => {
        const a = amp.equipment as Amplifier
        return sum + (a.powerOutput.at8ohms * a.channels * amp.quantity)
      }, 0),
      coverageMap: coverage,
      rt60Predicted: rt60Result.recommended,
      stiPredicted: stiResult.value,
      splAverage: avgSPL,
      splPeak: maxSPL
    }
  }
  
  // Generate installation specification
  const installation = generateInstallationSpec(audioSpec, venue)
  
  // Calculate budget
  const budget = calculateBudget(audioSpec, installation)
  
  return {
    id,
    projectName,
    createdAt: new Date(),
    updatedAt: new Date(),
    venue,
    systems: {
      audio: audioSpec
      // TODO: Add video and control systems
    },
    installation,
    budget
  }
}

/**
 * Generate room surfaces for acoustic calculations
 */
function generateRoomSurfaces(venue: VenueSpecifications): RoomSurface[] {
  const { length, width, height } = venue.dimensions
  
  // Default surface materials based on venue type
  const isHardRoom = venue.category === 'corporate' || venue.category === 'education'
  
  return [
    {
      area: width * height,
      material: 'Front Wall',
      absorptionCoefficients: isHardRoom ? 
        ABSORPTION_COEFFICIENTS['gypsum-board'] :
        ABSORPTION_COEFFICIENTS['curtains-heavy']
    },
    {
      area: width * height,
      material: 'Rear Wall',
      absorptionCoefficients: ABSORPTION_COEFFICIENTS['acoustic-ceiling'] // Assume treatment
    },
    {
      area: length * height * 2,
      material: 'Side Walls',
      absorptionCoefficients: ABSORPTION_COEFFICIENTS['gypsum-board']
    },
    {
      area: length * width,
      material: 'Floor',
      absorptionCoefficients: isHardRoom ? 
        ABSORPTION_COEFFICIENTS['carpet-heavy'] :
        ABSORPTION_COEFFICIENTS['wood-floor']
    },
    {
      area: length * width,
      material: 'Ceiling',
      absorptionCoefficients: ABSORPTION_COEFFICIENTS['acoustic-ceiling']
    }
  ]
}

/**
 * Generate installation specification
 */
function generateInstallationSpec(
  audioSpec: AudioSystemSpec,
  venue: VenueSpecifications
): InstallationSpec {
  // Calculate rack layout
  const rackUnits: RackUnit[] = []
  let currentU = 1
  
  // Add amplifiers to rack
  audioSpec.amplifiers.forEach(amp => {
    const equipment = amp.equipment as Amplifier
    const height = 2 // Most amps are 2U
    
    for (let i = 0; i < amp.quantity; i++) {
      rackUnits.push({
        position: currentU,
        height,
        equipment: amp.equipment,
        notes: `Channel ${i + 1}`
      })
      currentU += height + 1 // 1U spacing
    }
  })
  
  // Add mixers (if rack-mountable)
  audioSpec.mixers.forEach(mixer => {
    if (mixer.location === 'Equipment rack') {
      rackUnits.push({
        position: currentU,
        height: 4, // Typical mixer height
        equipment: mixer.equipment
      })
      currentU += 5
    }
  })
  
  // Generate cable schedule
  const cableSchedule: CableRun[] = []
  let cableId = 1
  
  // Speaker cables
  audioSpec.speakers.main.forEach((speaker, idx) => {
    for (let i = 0; i < speaker.quantity; i++) {
      cableSchedule.push({
        id: `SPK-${cableId++}`,
        type: 'audio',
        from: 'Amplifier Rack',
        to: `${speaker.location} Speaker ${i + 1}`,
        cableSpec: '12AWG Speaker Cable',
        length: Math.ceil(venue.dimensions.length * 1.5), // Add slack
        quantity: 1
      })
    }
  })
  
  // Microphone cables
  audioSpec.microphones.wired.forEach(mic => {
    for (let i = 0; i < mic.quantity; i++) {
      cableSchedule.push({
        id: `MIC-${cableId++}`,
        type: 'audio',
        from: mic.location || 'Microphone',
        to: 'Mixer',
        cableSpec: 'XLR Microphone Cable',
        length: Math.ceil(venue.dimensions.length),
        quantity: 1
      })
    }
  })
  
  // Calculate power requirements
  const totalLoad = audioSpec.amplifiers.reduce((sum, amp) => {
    const a = amp.equipment as Amplifier
    return sum + (a.powerConsumption || 500) * amp.quantity
  }, 0) + 500 // Add 500W for other equipment
  
  const recommendedBreaker = Math.ceil(totalLoad / 120 / 0.8 / 10) * 10 // Round up to nearest 10A
  
  const powerCircuits: PowerCircuit[] = [
    {
      name: 'Audio Equipment',
      voltage: 120,
      amperage: recommendedBreaker,
      phase: '1ph',
      outlets: 6,
      location: 'Equipment Rack',
      loads: audioSpec.amplifiers.map(a => a.equipment.id)
    }
  ]
  
  // Generate mounting details
  const mountingDetails: MountingDetail[] = []
  
  audioSpec.speakers.main.forEach(speaker => {
    const s = speaker.equipment as Speaker
    for (let i = 0; i < speaker.quantity; i++) {
      mountingDetails.push({
        equipment: speaker.equipment,
        location: `${speaker.location} Position ${i + 1}`,
        mountType: s.type === 'ceiling' ? 'Ceiling tile bridge' : 'Wall bracket',
        height: venue.dimensions.height - 0.5,
        angle: 15, // Typical down-tilt
        hardware: s.weight > 20 ? 'Heavy-duty bracket with safety cable' : 'Standard bracket'
      })
    }
  })
  
  // Estimate labor hours
  const speakerInstallHours = audioSpec.speakers.main.reduce((sum, s) => 
    sum + s.quantity * 2, 0
  )
  const cableRunHours = cableSchedule.length * 0.5
  const rackBuildHours = rackUnits.length * 0.5
  const commissioningHours = 8
  const trainingHours = 4
  
  return {
    rackLayout: rackUnits,
    cableSchedule,
    powerRequirements: {
      circuits: powerCircuits,
      totalLoad,
      recommendedBreaker
    },
    mountingDetails,
    laborHours: {
      installation: speakerInstallHours + cableRunHours + rackBuildHours,
      programming: 0, // No complex programming for basic audio
      commissioning: commissioningHours,
      training: trainingHours
    }
  }
}

/**
 * Calculate project budget
 */
function calculateBudget(
  audioSpec: AudioSystemSpec,
  installation: InstallationSpec
): BudgetSummary {
  // Calculate equipment costs
  const audioEquipmentCost = 
    [...audioSpec.speakers.main, ...(audioSpec.speakers.subwoofer || [])]
      .reduce((sum, s) => sum + s.totalPrice, 0) +
    audioSpec.amplifiers.reduce((sum, a) => sum + a.totalPrice, 0) +
    audioSpec.mixers.reduce((sum, m) => sum + m.totalPrice, 0) +
    audioSpec.microphones.wired.reduce((sum, m) => sum + m.totalPrice, 0) +
    audioSpec.microphones.wireless.reduce((sum, m) => sum + m.totalPrice, 0)
  
  // Calculate installation costs
  const laborRate = 100 // $/hour
  const laborCost = (
    installation.laborHours.installation +
    installation.laborHours.programming +
    installation.laborHours.commissioning +
    installation.laborHours.training
  ) * laborRate
  
  // Estimate materials (cables, connectors, hardware)
  const materialsCost = installation.cableSchedule.length * 50 + // Average $50 per cable run
                       installation.mountingDetails.length * 75   // Average $75 per mount
  
  // Calculate other costs
  const subtotal = audioEquipmentCost + laborCost + materialsCost
  const shipping = subtotal * 0.05
  const tax = subtotal * 0.08
  const contingency = subtotal * 0.10
  
  return {
    equipment: {
      audio: audioEquipmentCost,
      video: 0,
      control: 0,
      total: audioEquipmentCost
    },
    installation: {
      labor: laborCost,
      materials: materialsCost,
      total: laborCost + materialsCost
    },
    other: {
      shipping,
      tax,
      contingency,
      total: shipping + tax + contingency
    },
    grandTotal: subtotal + shipping + tax + contingency
  }
}
