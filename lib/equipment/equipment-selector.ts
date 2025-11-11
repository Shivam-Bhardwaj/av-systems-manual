import { 
  Equipment, 
  Speaker, 
  Amplifier, 
  Mixer, 
  Microphone,
  VenueSpecifications,
  EquipmentSelection 
} from '@/lib/types'
import equipmentDatabase from '@/data/equipment.json'
import { calculateSpeakerRequirements, calculateAmplifierPower } from '@/lib/acoustics/spl'

interface EquipmentRecommendation {
  speakers: {
    main: EquipmentSelection[]
    subwoofer?: EquipmentSelection[]
    monitor?: EquipmentSelection[]
  }
  amplifiers: EquipmentSelection[]
  mixers: EquipmentSelection[]
  microphones: {
    wired: EquipmentSelection[]
    wireless: EquipmentSelection[]
  }
}

/**
 * Select appropriate speakers based on venue requirements
 */
export function selectSpeakers(
  venue: VenueSpecifications,
  targetSPL: { average: number; peak: number }
): { main: EquipmentSelection[]; subwoofer?: EquipmentSelection[] } {
  const speakers = equipmentDatabase.speakers as Speaker[]
  const roomVolume = venue.dimensions.length * venue.dimensions.width * venue.dimensions.height
  
  // Filter speakers by venue size and type
  const candidateSpeakers = speakers.filter(speaker => {
    // Small rooms: point source or ceiling
    if (roomVolume < 100) {
      return speaker.type === 'point-source' || speaker.type === 'ceiling'
    }
    // Medium rooms: point source or column
    if (roomVolume < 500) {
      return speaker.type === 'point-source' || speaker.type === 'column'
    }
    // Large rooms: line array or high-power point source
    return speaker.type === 'line-array' || 
           (speaker.type === 'point-source' && speaker.maxSPL >= 130)
  })

  // Select best speaker based on SPL requirements and coverage
  let selectedSpeaker: Speaker | null = null
  let minSpeakers = Infinity
  
  for (const speaker of candidateSpeakers) {
    const result = calculateSpeakerRequirements(
      venue.dimensions,
      targetSPL,
      venue.acoustics.ambientNoise,
      speaker
    )
    
    if (result.meetsRequirement && result.speakersRequired < minSpeakers) {
      selectedSpeaker = speaker
      minSpeakers = result.speakersRequired
    }
  }
  
  if (!selectedSpeaker) {
    // Fallback to first suitable speaker
    selectedSpeaker = candidateSpeakers[0]
    minSpeakers = 2
  }
  
  const mainSpeakers: EquipmentSelection[] = [{
    equipment: selectedSpeaker,
    quantity: minSpeakers,
    location: 'Front of room',
    unitPrice: selectedSpeaker.price,
    totalPrice: selectedSpeaker.price * minSpeakers
  }]
  
  // Add subwoofer for music applications or large rooms
  const needsSubwoofer = venue.useCases.some(use => 
    use.toLowerCase().includes('music') || 
    use.toLowerCase().includes('performance')
  ) || roomVolume > 300
  
  if (needsSubwoofer) {
    const subwoofers = speakers.filter(s => s.type === 'subwoofer')
    const subwoofer = subwoofers[0]
    
    if (subwoofer) {
      const subQuantity = Math.ceil(minSpeakers / 4) // 1 sub per 4 mains
      return {
        main: mainSpeakers,
        subwoofer: [{
          equipment: subwoofer,
          quantity: subQuantity,
          location: 'Front of room',
          unitPrice: subwoofer.price,
          totalPrice: subwoofer.price * subQuantity
        }]
      }
    }
  }
  
  return { main: mainSpeakers }
}

/**
 * Select appropriate amplifiers based on speaker requirements
 */
export function selectAmplifiers(
  speakers: { speaker: Speaker; quantity: number }[]
): EquipmentSelection[] {
  const amplifiers = equipmentDatabase.amplifiers as Amplifier[]
  const powerRequirements = calculateAmplifierPower(speakers)
  
  // Find suitable amplifiers
  const suitableAmps = amplifiers.filter(amp => {
    const totalPowerAt8Ohms = amp.powerOutput.at8ohms * amp.channels
    return totalPowerAt8Ohms >= powerRequirements.recommendedAmplifierPower * 0.8
  })
  
  if (suitableAmps.length === 0) {
    throw new Error('No suitable amplifiers found for speaker configuration')
  }
  
  // Select most cost-effective amplifier
  const selectedAmp = suitableAmps.reduce((best, current) => 
    current.price < best.price ? current : best
  )
  
  // Calculate number of amplifiers needed
  const channelsPerAmp = selectedAmp.channels
  const ampsNeeded = Math.ceil(powerRequirements.channelsRequired / channelsPerAmp)
  
  return [{
    equipment: selectedAmp,
    quantity: ampsNeeded,
    location: 'Equipment rack',
    unitPrice: selectedAmp.price,
    totalPrice: selectedAmp.price * ampsNeeded
  }]
}

/**
 * Select appropriate mixer based on input requirements
 */
export function selectMixer(
  venue: VenueSpecifications,
  microphoneCount: number
): EquipmentSelection {
  const mixers = equipmentDatabase.mixers as Mixer[]
  
  // Determine mixer requirements
  const minMicInputs = microphoneCount + 2 // Add headroom
  const minAuxSends = venue.capacity.seated > 100 ? 4 : 2
  const needsDigital = venue.capacity.seated > 50 || 
                      venue.useCases.some(u => u.includes('recording'))
  
  // Filter suitable mixers
  const suitableMixers = mixers.filter(mixer => 
    mixer.inputs.mic >= minMicInputs &&
    mixer.outputs.aux >= minAuxSends &&
    (!needsDigital || mixer.type === 'digital')
  )
  
  if (suitableMixers.length === 0) {
    throw new Error('No suitable mixer found for requirements')
  }
  
  // Select most appropriate mixer
  const selectedMixer = suitableMixers.reduce((best, current) => {
    const bestScore = best.inputs.mic + best.outputs.aux * 2
    const currentScore = current.inputs.mic + current.outputs.aux * 2
    return currentScore > bestScore || (currentScore === bestScore && current.price < best.price) 
      ? current : best
  })
  
  return {
    equipment: selectedMixer,
    quantity: 1,
    location: 'Control position',
    unitPrice: selectedMixer.price,
    totalPrice: selectedMixer.price
  }
}

/**
 * Select microphones based on use cases
 */
export function selectMicrophones(
  venue: VenueSpecifications
): { wired: EquipmentSelection[]; wireless: EquipmentSelection[] } {
  const microphones = equipmentDatabase.microphones as Microphone[]
  const wired: EquipmentSelection[] = []
  const wireless: EquipmentSelection[] = []
  
  // Determine microphone needs based on use cases
  const needsHandheld = venue.useCases.some(u => 
    u.toLowerCase().includes('presentation') || 
    u.toLowerCase().includes('performance')
  )
  
  const needsLavalier = venue.useCases.some(u => 
    u.toLowerCase().includes('presentation') || 
    u.toLowerCase().includes('lecture')
  )
  
  const needsCeiling = venue.useCases.some(u => 
    u.toLowerCase().includes('conference') || 
    u.toLowerCase().includes('meeting')
  )
  
  // Select handheld microphones
  if (needsHandheld) {
    const wirelessHandhelds = microphones.filter(m => 
      m.type === 'dynamic' && m.wireless
    )
    
    if (wirelessHandhelds.length > 0) {
      const quantity = venue.capacity.seated > 100 ? 2 : 1
      wireless.push({
        equipment: wirelessHandhelds[0],
        quantity,
        location: 'Presenter area',
        unitPrice: wirelessHandhelds[0].price,
        totalPrice: wirelessHandhelds[0].price * quantity
      })
    } else {
      // Fallback to wired
      const wiredHandhelds = microphones.filter(m => 
        m.type === 'dynamic' && !m.wireless
      )
      if (wiredHandhelds.length > 0) {
        wired.push({
          equipment: wiredHandhelds[0],
          quantity: 2,
          location: 'Presenter area',
          unitPrice: wiredHandhelds[0].price,
          totalPrice: wiredHandhelds[0].price * 2
        })
      }
    }
  }
  
  // Select lavalier microphones
  if (needsLavalier) {
    const lavaliers = microphones.filter(m => m.type === 'lavalier')
    if (lavaliers.length > 0) {
      wireless.push({
        equipment: lavaliers[0],
        quantity: 1,
        location: 'Presenter',
        unitPrice: lavaliers[0].price,
        totalPrice: lavaliers[0].price
      })
    }
  }
  
  // Select ceiling microphones for conferencing
  if (needsCeiling) {
    const ceilingMics = microphones.filter(m => 
      m.type === 'boundary' || m.polarPattern === 'omnidirectional'
    )
    if (ceilingMics.length > 0) {
      const quantity = Math.ceil(venue.dimensions.length * venue.dimensions.width / 50)
      wired.push({
        equipment: ceilingMics[0],
        quantity,
        location: 'Ceiling grid',
        unitPrice: ceilingMics[0].price,
        totalPrice: ceilingMics[0].price * quantity
      })
    }
  }
  
  return { wired, wireless }
}

/**
 * Generate complete equipment recommendation
 */
export function generateEquipmentRecommendation(
  venue: VenueSpecifications
): EquipmentRecommendation {
  // Calculate required SPL
  const targetSPL = venue.acoustics.targetSPL || {
    average: 75,
    peak: 95
  }
  
  // Select speakers
  const speakers = selectSpeakers(venue, targetSPL)
  
  // Prepare speaker list for amplifier selection
  const speakerList = speakers.main.map(s => ({
    speaker: s.equipment as Speaker,
    quantity: s.quantity
  }))
  
  if (speakers.subwoofer) {
    speakerList.push(...speakers.subwoofer.map(s => ({
      speaker: s.equipment as Speaker,
      quantity: s.quantity
    })))
  }
  
  // Select amplifiers
  const amplifiers = selectAmplifiers(speakerList)
  
  // Select microphones
  const microphones = selectMicrophones(venue)
  
  // Calculate total microphone inputs needed
  const totalMics = microphones.wired.reduce((sum, m) => sum + m.quantity, 0) +
                   microphones.wireless.reduce((sum, m) => sum + m.quantity, 0)
  
  // Select mixer
  const mixer = selectMixer(venue, totalMics)
  
  return {
    speakers,
    amplifiers,
    mixers: [mixer],
    microphones
  }
}
