import {
  VenueSpecifications,
  SystemSpecification,
  AudioSystemSpec,
  EquipmentSelection,
} from '@/lib/types'
import { Equipment, Speaker, Amplifier, Mixer } from '@/lib/types/equipment'
import equipmentDatabase from '@/data/equipment.json'

export type SuggestionType = 
  | 'recommendation' 
  | 'warning' 
  | 'optimization' 
  | 'missing' 
  | 'bundle' 
  | 'placement'

export type SuggestionSeverity = 'info' | 'warning' | 'critical' | 'success'

export interface SystemSuggestion {
  id: string
  type: SuggestionType
  severity: SuggestionSeverity
  title: {
    hi: string
    en: string
  }
  description: {
    hi: string
    en: string
  }
  action?: {
    label: {
      hi: string
      en: string
    }
    equipment?: Equipment[]
    estimatedSavings?: number
  }
  relatedEquipment?: string[] // Equipment IDs
  category: 'audio' | 'video' | 'control' | 'power' | 'acoustics' | 'cost'
}

export interface IntuitionResult {
  suggestions: SystemSuggestion[]
  feasibility: {
    power: {
      totalLoad: number
      recommendedBreaker: number
      status: 'ok' | 'warning' | 'critical'
    }
    acoustics: {
      rt60Status: 'ok' | 'warning' | 'critical'
      stiStatus: 'ok' | 'warning' | 'critical'
      splStatus: 'ok' | 'warning' | 'critical'
    }
    compatibility: {
      issues: Array<{
        equipment1: string
        equipment2: string
        issue: string
      }>
    }
  }
  recommendations: {
    missingEquipment: Equipment[]
    costOptimizations: SystemSuggestion[]
    placementSuggestions: Array<{
      equipment: Equipment
      location: string
      reason: {
        hi: string
        en: string
      }
    }>
  }
}

/**
 * Generate system intuition - intelligent suggestions and recommendations
 */
export function generateSystemIntuition(
  venue: VenueSpecifications,
  specification?: SystemSpecification
): IntuitionResult {
  const suggestions: SystemSuggestion[] = []
  
  // Analyze venue and generate base recommendations
  const venueAnalysis = analyzeVenue(venue)
  
  // Check feasibility
  const feasibility = checkFeasibility(venue, specification)
  
  // Generate suggestions based on venue analysis
  suggestions.push(...generateVenueBasedSuggestions(venue, venueAnalysis))
  
  // Generate cost optimization suggestions
  if (specification) {
    suggestions.push(...generateCostOptimizations(venue, specification))
    suggestions.push(...generateMissingEquipmentSuggestions(venue, specification))
    suggestions.push(...generateDependentEquipmentSuggestions(specification))
  }
  
  // Generate placement suggestions
  const placementSuggestions = generatePlacementSuggestions(venue, specification)
  
  // Filter and prioritize suggestions
  const prioritizedSuggestions = prioritizeSuggestions(suggestions)
  
  return {
    suggestions: prioritizedSuggestions,
    feasibility,
    recommendations: {
      missingEquipment: venueAnalysis.missingEquipment,
      costOptimizations: suggestions.filter(s => s.type === 'optimization' || s.type === 'bundle'),
      placementSuggestions,
    },
  }
}

interface VenueAnalysis {
  roomVolume: number
  needsSubwoofer: boolean
  needsDelaySpeakers: boolean
  needsAcousticTreatment: boolean
  recommendedSpeakerType: 'point-source' | 'line-array' | 'column' | 'ceiling'
  missingEquipment: Equipment[]
  powerConcerns: boolean
}

function analyzeVenue(venue: VenueSpecifications): VenueAnalysis {
  const roomVolume = venue.dimensions.length * venue.dimensions.width * venue.dimensions.height
  const roomLength = venue.dimensions.length
  
  // Determine speaker type recommendation
  let recommendedSpeakerType: 'point-source' | 'line-array' | 'column' | 'ceiling' = 'point-source'
  if (roomVolume < 100) {
    recommendedSpeakerType = 'ceiling'
  } else if (roomVolume < 500) {
    recommendedSpeakerType = 'point-source'
  } else if (roomLength > 15) {
    recommendedSpeakerType = 'line-array'
  } else {
    recommendedSpeakerType = 'column'
  }
  
  // Check if subwoofer needed
  const needsSubwoofer = venue.useCases.some(use => 
    use.toLowerCase().includes('music') || 
    use.toLowerCase().includes('performance') ||
    use.toLowerCase().includes('entertainment')
  ) || roomVolume > 300
  
  // Check if delay speakers needed (long rooms)
  const needsDelaySpeakers = roomLength > 20 && venue.capacity.seated > 50
  
  // Check acoustic treatment needs
  const needsAcousticTreatment = 
    (venue.acoustics.targetRT60 < 0.8 && roomVolume > 200) ||
    venue.acoustics.ambientNoise > 50 ||
    (venue.architecturalConstraints?.some(c => 
      c.toLowerCase().includes('glass') || 
      c.toLowerCase().includes('concrete')
    ) ?? false)
  
  // Check power concerns
  const powerConcerns = venue.capacity.seated > 100
  
  return {
    roomVolume,
    needsSubwoofer,
    needsDelaySpeakers,
    needsAcousticTreatment,
    recommendedSpeakerType,
    missingEquipment: [],
    powerConcerns,
  }
}

function checkFeasibility(
  venue: VenueSpecifications,
  specification?: SystemSpecification
): IntuitionResult['feasibility'] {
  // Power feasibility
  let totalLoad = 0
  let recommendedBreaker = 0
  let powerStatus: 'ok' | 'warning' | 'critical' = 'ok'
  
  if (specification?.systems.audio) {
    const audioSpec = specification.systems.audio
    totalLoad = audioSpec.calculations.totalPower || 0
    
    // Add overhead for other equipment (20%)
    totalLoad = totalLoad * 1.2
    
    // Calculate recommended breaker (assume 230V single phase)
    recommendedBreaker = Math.ceil(totalLoad / (230 * 0.8)) // 80% derating
    
    if (recommendedBreaker > 32) {
      powerStatus = 'critical'
    } else if (recommendedBreaker > 16) {
      powerStatus = 'warning'
    }
  }
  
  // Acoustic feasibility
  const rt60Status = specification?.systems.audio?.calculations.rt60Predicted
    ? (Math.abs(specification.systems.audio.calculations.rt60Predicted - venue.acoustics.targetRT60) > 0.3
        ? 'critical'
        : Math.abs(specification.systems.audio.calculations.rt60Predicted - venue.acoustics.targetRT60) > 0.15
        ? 'warning'
        : 'ok')
    : 'ok'
  
  const stiStatus = specification?.systems.audio?.calculations.stiPredicted
    ? (specification.systems.audio.calculations.stiPredicted < venue.acoustics.targetSTI - 0.1
        ? 'critical'
        : specification.systems.audio.calculations.stiPredicted < venue.acoustics.targetSTI
        ? 'warning'
        : 'ok')
    : 'ok'
  
  const splStatus = specification?.systems.audio?.calculations.splAverage
    ? (specification.systems.audio.calculations.splAverage < venue.acoustics.targetSPL.average - 5
        ? 'critical'
        : specification.systems.audio.calculations.splAverage < venue.acoustics.targetSPL.average
        ? 'warning'
        : 'ok')
    : 'ok'
  
  // Compatibility checks
  const compatibilityIssues: IntuitionResult['feasibility']['compatibility']['issues'] = []
  
  if (specification?.systems.audio) {
    const audioSpec = specification.systems.audio
    
    // Check amplifier-speaker compatibility
    audioSpec.speakers.main.forEach(speakerSel => {
      const speaker = speakerSel.equipment as Speaker
      audioSpec.amplifiers.forEach(ampSel => {
        const amp = ampSel.equipment as Amplifier
        const ampPowerPerChannel = amp.powerOutput.at8ohms
        
        // Check if amplifier power matches speaker requirements
        if (ampPowerPerChannel < speaker.powerHandling.continuous * 0.5) {
          compatibilityIssues.push({
            equipment1: `${speaker.manufacturer} ${speaker.model}`,
            equipment2: `${amp.manufacturer} ${amp.model}`,
            issue: 'Amplifier power too low for speaker requirements',
          })
        }
        
        // Check impedance matching
        if (speaker.impedance < 4 && !amp.powerOutput.at2ohms) {
          compatibilityIssues.push({
            equipment1: `${speaker.manufacturer} ${speaker.model}`,
            equipment2: `${amp.manufacturer} ${amp.model}`,
            issue: 'Amplifier does not support low impedance speakers',
          })
        }
      })
    })
  }
  
  return {
    power: {
      totalLoad,
      recommendedBreaker,
      status: powerStatus,
    },
    acoustics: {
      rt60Status,
      stiStatus,
      splStatus,
    },
    compatibility: {
      issues: compatibilityIssues,
    },
  }
}

function generateVenueBasedSuggestions(
  venue: VenueSpecifications,
  analysis: VenueAnalysis
): SystemSuggestion[] {
  const suggestions: SystemSuggestion[] = []
  
  // Subwoofer recommendation
  if (analysis.needsSubwoofer) {
    suggestions.push({
      id: 'subwoofer-recommendation',
      type: 'recommendation',
      severity: 'info',
      title: {
        hi: 'सबवूफर की सिफारिश',
        en: 'Subwoofer Recommendation',
      },
      description: {
        hi: `इस स्थान के उपयोग के मामलों और आकार के आधार पर, एक सबवूफर जोड़ने से निम्न-आवृत्ति प्रदर्शन में सुधार होगा।`,
        en: `Based on this venue's use cases and size, adding a subwoofer will improve low-frequency performance.`,
      },
      category: 'audio',
    })
  }
  
  // Delay speakers recommendation
  if (analysis.needsDelaySpeakers) {
    suggestions.push({
      id: 'delay-speakers-recommendation',
      type: 'recommendation',
      severity: 'info',
      title: {
        hi: 'विलंब स्पीकर की सिफारिश',
        en: 'Delay Speakers Recommendation',
      },
      description: {
        hi: `कमरे की लंबाई ${venue.dimensions.length.toFixed(1)} मीटर है। पीछे की सीटों के लिए ध्वनि गुणवत्ता में सुधार के लिए विलंब स्पीकर जोड़ने पर विचार करें।`,
        en: `Room length is ${venue.dimensions.length.toFixed(1)}m. Consider adding delay speakers to improve sound quality for rear seats.`,
      },
      category: 'audio',
    })
  }
  
  // Acoustic treatment recommendation
  if (analysis.needsAcousticTreatment) {
    suggestions.push({
      id: 'acoustic-treatment-recommendation',
      type: 'recommendation',
      severity: 'warning',
      title: {
        hi: 'ध्वनिक उपचार की आवश्यकता',
        en: 'Acoustic Treatment Needed',
      },
      description: {
        hi: `लक्ष्य RT60 प्राप्त करने और ध्वनि गुणवत्ता में सुधार के लिए ध्वनिक पैनल जोड़ने की सिफारिश की जाती है।`,
        en: `Acoustic panels are recommended to achieve target RT60 and improve sound quality.`,
      },
      category: 'acoustics',
    })
  }
  
  // Power warning
  if (analysis.powerConcerns) {
    suggestions.push({
      id: 'power-warning',
      type: 'warning',
      severity: 'warning',
      title: {
        hi: 'बिजली आवश्यकताओं की जाँच करें',
        en: 'Check Power Requirements',
      },
      description: {
        hi: `बड़ी क्षमता के कारण, सुनिश्चित करें कि पर्याप्त बिजली सर्किट उपलब्ध हैं।`,
        en: `Due to large capacity, ensure sufficient power circuits are available.`,
      },
      category: 'power',
    })
  }
  
  return suggestions
}

function generateCostOptimizations(
  venue: VenueSpecifications,
  specification: SystemSpecification
): SystemSuggestion[] {
  const suggestions: SystemSuggestion[] = []
  
  // Check for bundle opportunities
  const audioSpec = specification.systems.audio
  if (audioSpec) {
    // Check if multiple amplifiers can be consolidated
    if (audioSpec.amplifiers.length > 1) {
      const totalChannels = audioSpec.amplifiers.reduce((sum, amp) => {
        const a = amp.equipment as Amplifier
        return sum + (a.channels * amp.quantity)
      }, 0)
      
      // Find a single amplifier that could replace multiple
      const amplifiers = equipmentDatabase.amplifiers as Amplifier[]
      const suitableAmps = amplifiers.filter(amp => amp.channels >= totalChannels)
      
      if (suitableAmps.length > 0) {
        const consolidatedAmp = suitableAmps.reduce((best, current) => 
          current.price < best.price ? current : best
        )
        
        const currentCost = audioSpec.amplifiers.reduce((sum, amp) => sum + amp.totalPrice, 0)
        const newCost = consolidatedAmp.price
        const savings = currentCost - newCost
        
        if (savings > 0) {
          suggestions.push({
            id: 'amplifier-consolidation',
            type: 'optimization',
            severity: 'success',
            title: {
              hi: 'एम्पलीफायर समेकन',
              en: 'Amplifier Consolidation',
            },
            description: {
              hi: `कई एम्पलीफायरों को एक ${consolidatedAmp.manufacturer} ${consolidatedAmp.model} से बदलकर ₹${savings.toLocaleString('en-IN')} बचाया जा सकता है।`,
              en: `Consolidating multiple amplifiers into a single ${consolidatedAmp.manufacturer} ${consolidatedAmp.model} could save ₹${savings.toLocaleString('en-IN')}.`,
            },
            action: {
              label: {
                hi: 'विकल्प देखें',
                en: 'View Alternative',
              },
              equipment: [consolidatedAmp],
              estimatedSavings: savings,
            },
            category: 'cost',
          })
        }
      }
    }
    
    // Check for display bundle opportunity (if video system exists)
    if (specification.systems.video && specification.systems.video.displays.length >= 2) {
      suggestions.push({
        id: 'display-bundle',
        type: 'bundle',
        severity: 'info',
        title: {
          hi: 'किफायती डिस्प्ले बंडल अपनाएँ',
          en: 'Adopt Cost-Effective Display Bundle',
        },
        description: {
          hi: `दो या अधिक डिस्प्ले के लिए, बंडल खरीद से 10-15% की बचत हो सकती है।`,
          en: `For two or more displays, bundle purchase could save 10-15%.`,
        },
        category: 'cost',
      })
    }
  }
  
  return suggestions
}

function generateMissingEquipmentSuggestions(
  venue: VenueSpecifications,
  specification: SystemSpecification
): SystemSuggestion[] {
  const suggestions: SystemSuggestion[] = []
  const audioSpec = specification.systems.audio
  
  if (!audioSpec) return suggestions
  
  // Check for DSP/Processing
  if (audioSpec.processing.length === 0 && venue.capacity.seated > 50) {
    suggestions.push({
      id: 'missing-dsp',
      type: 'missing',
      severity: 'warning',
      title: {
        hi: 'DSP प्रोसेसिंग की सिफारिश',
        en: 'DSP Processing Recommended',
      },
      description: {
        hi: `इस आकार के स्थान के लिए, ध्वनि प्रसंस्करण और रूम सुधार के लिए DSP जोड़ने पर विचार करें।`,
        en: `For a venue of this size, consider adding DSP for sound processing and room correction.`,
      },
      category: 'audio',
    })
  }
  
  // Check for backup microphones
  const totalMics = audioSpec.microphones.wired.length + audioSpec.microphones.wireless.length
  if (totalMics === 0 && venue.useCases.some(u => u.toLowerCase().includes('presentation'))) {
    suggestions.push({
      id: 'missing-microphones',
      type: 'missing',
      severity: 'critical',
      title: {
        hi: 'माइक्रोफोन जोड़ें',
        en: 'Add Microphones',
      },
      description: {
        hi: `प्रस्तुति उपयोग के मामलों के लिए माइक्रोफोन जोड़ना आवश्यक है।`,
        en: `Microphones are required for presentation use cases.`,
      },
      category: 'audio',
    })
  }
  
  return suggestions
}

function generateDependentEquipmentSuggestions(
  specification: SystemSpecification
): SystemSuggestion[] {
  const suggestions: SystemSuggestion[] = []
  const audioSpec = specification.systems.audio
  
  if (!audioSpec) return suggestions
  
  // If DSP is added, suggest compatible amplifiers
  const hasDSP = audioSpec.processing.some(p => 
    p.equipment.category === 'processing'
  )
  
  if (hasDSP && audioSpec.amplifiers.length > 0) {
    suggestions.push({
      id: 'dsp-amp-compatibility',
      type: 'recommendation',
      severity: 'info',
      title: {
        hi: 'DSP-एम्पलीफायर अनुकूलता',
        en: 'DSP-Amplifier Compatibility',
      },
      description: {
        hi: `DSP जोड़ा गया है। सुनिश्चित करें कि एम्पलीफायर DSP आउटपुट के साथ संगत हैं।`,
        en: `DSP has been added. Ensure amplifiers are compatible with DSP outputs.`,
      },
      category: 'audio',
    })
  }
  
  return suggestions
}

function generatePlacementSuggestions(
  venue: VenueSpecifications,
  specification?: SystemSpecification
): IntuitionResult['recommendations']['placementSuggestions'] {
  const suggestions: IntuitionResult['recommendations']['placementSuggestions'] = []
  
  if (!specification?.systems.audio) return suggestions
  
  const audioSpec = specification.systems.audio
  const roomLength = venue.dimensions.length
  const roomWidth = venue.dimensions.width
  
  // Suggest acoustic panel placements
  if (venue.acoustics.targetRT60 < 0.8) {
    // Note: Acoustic panels would typically be in accessories, but for now
    // we'll create a generic suggestion without specific equipment
    // In a real implementation, this would reference an accessories database
    suggestions.push({
      equipment: {
        id: 'acoustic-panel-suggestion',
        category: 'accessory',
        manufacturer: 'Recommended',
        model: 'Acoustic Panels',
        description: 'Acoustic treatment panels',
        price: 0,
        weight: 0,
        dimensions: { width: 0, height: 0, depth: 0 },
        warranty: 0,
      } as Equipment,
      location: 'Rear wall and side walls',
      reason: {
        hi: `लक्ष्य RT60 प्राप्त करने के लिए पीछे की दीवार और साइड की दीवारों पर ध्वनिक पैनल रखें।`,
        en: `Place acoustic panels on rear wall and side walls to achieve target RT60.`,
      },
    })
  }
  
  // Suggest delay speaker placement for long rooms
  if (roomLength > 20 && audioSpec.speakers.delay === undefined) {
    const speakers = equipmentDatabase.speakers as Speaker[]
    const delayCandidates = speakers.filter(s => 
      s.type === 'point-source' && s.maxSPL >= 120
    )
    
    if (delayCandidates.length > 0) {
      suggestions.push({
        equipment: delayCandidates[0],
        location: `Mid-room at ${(roomLength * 0.6).toFixed(1)}m from front`,
        reason: {
          hi: `लंबे कमरे में पीछे की सीटों के लिए ध्वनि गुणवत्ता में सुधार के लिए मध्य-कमरे में विलंब स्पीकर रखें।`,
          en: `Place delay speakers mid-room to improve sound quality for rear seats in long rooms.`,
        },
      })
    }
  }
  
  return suggestions
}

function prioritizeSuggestions(suggestions: SystemSuggestion[]): SystemSuggestion[] {
  // Sort by severity: critical > warning > info > success
  const severityOrder: Record<SuggestionSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
    success: 3,
  }
  
  return suggestions.sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity]
    if (severityDiff !== 0) return severityDiff
    
    // Within same severity, prioritize by type
    const typeOrder: Record<SuggestionType, number> = {
      missing: 0,
      warning: 1,
      recommendation: 2,
      optimization: 3,
      bundle: 4,
      placement: 5,
    }
    
    return typeOrder[a.type] - typeOrder[b.type]
  })
}

