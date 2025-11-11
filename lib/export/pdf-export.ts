import jsPDF from 'jspdf'
import { SystemSpecification } from '@/lib/types'
import { format } from 'date-fns'

export async function exportToPDF(specification: SystemSpecification): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPosition = margin

  // Helper function to check page overflow
  const checkPageOverflow = (additionalHeight: number) => {
    if (yPosition + additionalHeight > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
    }
  }

  // Title Page
  doc.setFontSize(24)
  doc.text('AV System Specification', pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 15

  doc.setFontSize(18)
  doc.text(specification.projectName, pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 20

  doc.setFontSize(12)
  doc.text(`Generated: ${format(specification.createdAt, 'MMMM dd, yyyy')}`, pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 10

  doc.text(`Document ID: ${specification.id}`, pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 30

  // Venue Information
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('Venue Information', margin, yPosition)
  yPosition += 10

  doc.setFontSize(11)
  doc.setFont(undefined, 'normal')
  const venueInfo = [
    `Type: ${specification.venue.type}`,
    `Dimensions: ${specification.venue.dimensions.length}m x ${specification.venue.dimensions.width}m x ${specification.venue.dimensions.height}m`,
    `Volume: ${(specification.venue.dimensions.length * specification.venue.dimensions.width * specification.venue.dimensions.height).toFixed(0)} m³`,
    `Capacity: ${specification.venue.capacity.seated} seated`,
    `Ambient Noise: ${specification.venue.acoustics.ambientNoise} dBA`,
    `Target RT60: ${specification.venue.acoustics.targetRT60}s`,
    `Target STI: ${specification.venue.acoustics.targetSTI}`
  ]

  venueInfo.forEach(line => {
    doc.text(line, margin, yPosition)
    yPosition += 6
  })

  yPosition += 10

  // Use Cases
  doc.setFont(undefined, 'bold')
  doc.text('Use Cases:', margin, yPosition)
  yPosition += 6

  doc.setFont(undefined, 'normal')
  specification.venue.useCases.forEach(useCase => {
    doc.text(`• ${useCase}`, margin + 5, yPosition)
    yPosition += 6
  })

  // Audio System
  checkPageOverflow(60)
  yPosition += 10
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('Audio System Specification', margin, yPosition)
  yPosition += 10

  // Speakers
  doc.setFontSize(14)
  doc.text('Speakers', margin, yPosition)
  yPosition += 8

  doc.setFontSize(11)
  doc.setFont(undefined, 'normal')
  
  if (specification.systems.audio.speakers.main) {
    specification.systems.audio.speakers.main.forEach(speaker => {
      checkPageOverflow(15)
      doc.text(`${speaker.quantity}x ${speaker.equipment.manufacturer} ${speaker.equipment.model}`, margin + 5, yPosition)
      yPosition += 5
      doc.setFontSize(10)
      doc.text(`${speaker.equipment.description} - $${speaker.unitPrice.toFixed(2)} each`, margin + 10, yPosition)
      yPosition += 5
      doc.text(`Location: ${speaker.location}`, margin + 10, yPosition)
      yPosition += 7
      doc.setFontSize(11)
    })
  }

  // Amplifiers
  checkPageOverflow(30)
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('Amplifiers', margin, yPosition)
  yPosition += 8

  doc.setFontSize(11)
  doc.setFont(undefined, 'normal')
  specification.systems.audio.amplifiers.forEach(amp => {
    checkPageOverflow(15)
    doc.text(`${amp.quantity}x ${amp.equipment.manufacturer} ${amp.equipment.model}`, margin + 5, yPosition)
    yPosition += 5
    doc.setFontSize(10)
    doc.text(`${amp.equipment.description} - $${amp.unitPrice.toFixed(2)} each`, margin + 10, yPosition)
    yPosition += 7
    doc.setFontSize(11)
  })

  // Mixers
  checkPageOverflow(30)
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('Audio Mixers', margin, yPosition)
  yPosition += 8

  doc.setFontSize(11)
  doc.setFont(undefined, 'normal')
  specification.systems.audio.mixers.forEach(mixer => {
    checkPageOverflow(15)
    doc.text(`${mixer.quantity}x ${mixer.equipment.manufacturer} ${mixer.equipment.model}`, margin + 5, yPosition)
    yPosition += 5
    doc.setFontSize(10)
    doc.text(`${mixer.equipment.description} - $${mixer.unitPrice.toFixed(2)}`, margin + 10, yPosition)
    yPosition += 7
    doc.setFontSize(11)
  })

  // Microphones
  checkPageOverflow(30)
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('Microphones', margin, yPosition)
  yPosition += 8

  doc.setFontSize(11)
  doc.setFont(undefined, 'normal')
  
  if (specification.systems.audio.microphones.wired.length > 0) {
    doc.text('Wired:', margin + 5, yPosition)
    yPosition += 6
    specification.systems.audio.microphones.wired.forEach(mic => {
      checkPageOverflow(10)
      doc.text(`${mic.quantity}x ${mic.equipment.manufacturer} ${mic.equipment.model}`, margin + 10, yPosition)
      yPosition += 5
    })
  }

  if (specification.systems.audio.microphones.wireless.length > 0) {
    yPosition += 3
    doc.text('Wireless:', margin + 5, yPosition)
    yPosition += 6
    specification.systems.audio.microphones.wireless.forEach(mic => {
      checkPageOverflow(10)
      doc.text(`${mic.quantity}x ${mic.equipment.manufacturer} ${mic.equipment.model}`, margin + 10, yPosition)
      yPosition += 5
    })
  }

  // Acoustic Performance
  checkPageOverflow(40)
  yPosition += 10
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('Predicted Acoustic Performance', margin, yPosition)
  yPosition += 10

  doc.setFontSize(11)
  doc.setFont(undefined, 'normal')
  const acousticData = [
    `RT60: ${specification.systems.audio.calculations.rt60Predicted.toFixed(2)}s`,
    `STI: ${specification.systems.audio.calculations.stiPredicted.toFixed(2)}`,
    `Average SPL: ${specification.systems.audio.calculations.splAverage.toFixed(0)} dB`,
    `Peak SPL: ${specification.systems.audio.calculations.splPeak.toFixed(0)} dB`,
    `Total Amplifier Power: ${specification.systems.audio.calculations.totalPower.toFixed(0)}W`
  ]

  acousticData.forEach(line => {
    doc.text(line, margin, yPosition)
    yPosition += 6
  })

  // Installation Requirements
  checkPageOverflow(50)
  yPosition += 10
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('Installation Requirements', margin, yPosition)
  yPosition += 10

  doc.setFontSize(14)
  doc.text('Power Requirements', margin, yPosition)
  yPosition += 8

  doc.setFontSize(11)
  doc.setFont(undefined, 'normal')
  doc.text(`Total Load: ${specification.installation.powerRequirements.totalLoad}W`, margin + 5, yPosition)
  yPosition += 6
  doc.text(`Recommended Breaker: ${specification.installation.powerRequirements.recommendedBreaker}A`, margin + 5, yPosition)
  yPosition += 10

  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('Labor Hours', margin, yPosition)
  yPosition += 8

  doc.setFontSize(11)
  doc.setFont(undefined, 'normal')
  const laborData = [
    `Installation: ${specification.installation.laborHours.installation} hours`,
    `Programming: ${specification.installation.laborHours.programming} hours`,
    `Commissioning: ${specification.installation.laborHours.commissioning} hours`,
    `Training: ${specification.installation.laborHours.training} hours`
  ]

  laborData.forEach(line => {
    doc.text(line, margin + 5, yPosition)
    yPosition += 6
  })

  // Budget Summary
  doc.addPage()
  yPosition = margin

  doc.setFontSize(20)
  doc.setFont(undefined, 'bold')
  doc.text('Budget Summary', margin, yPosition)
  yPosition += 15

  // Equipment Costs
  doc.setFontSize(14)
  doc.text('Equipment Costs', margin, yPosition)
  yPosition += 10

  doc.setFontSize(11)
  doc.setFont(undefined, 'normal')
  const equipmentCosts = [
    ['Audio Equipment:', `$${specification.budget.equipment.audio.toFixed(2)}`],
    ['Video Equipment:', `$${specification.budget.equipment.video.toFixed(2)}`],
    ['Control Equipment:', `$${specification.budget.equipment.control.toFixed(2)}`],
    ['', ''],
    ['Equipment Subtotal:', `$${specification.budget.equipment.total.toFixed(2)}`]
  ]

  equipmentCosts.forEach(([label, value]) => {
    if (label) {
      doc.text(label, margin + 5, yPosition)
      doc.text(value, pageWidth - margin - 40, yPosition, { align: 'right' })
    }
    yPosition += label ? 6 : 3
  })

  yPosition += 5

  // Installation Costs
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('Installation Costs', margin, yPosition)
  yPosition += 10

  doc.setFontSize(11)
  doc.setFont(undefined, 'normal')
  const installationCosts = [
    ['Labor:', `$${specification.budget.installation.labor.toFixed(2)}`],
    ['Materials:', `$${specification.budget.installation.materials.toFixed(2)}`],
    ['', ''],
    ['Installation Subtotal:', `$${specification.budget.installation.total.toFixed(2)}`]
  ]

  installationCosts.forEach(([label, value]) => {
    if (label) {
      doc.text(label, margin + 5, yPosition)
      doc.text(value, pageWidth - margin - 40, yPosition, { align: 'right' })
    }
    yPosition += label ? 6 : 3
  })

  yPosition += 5

  // Other Costs
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('Other Costs', margin, yPosition)
  yPosition += 10

  doc.setFontSize(11)
  doc.setFont(undefined, 'normal')
  const otherCosts = [
    ['Shipping:', `$${specification.budget.other.shipping.toFixed(2)}`],
    ['Tax:', `$${specification.budget.other.tax.toFixed(2)}`],
    ['Contingency:', `$${specification.budget.other.contingency.toFixed(2)}`]
  ]

  otherCosts.forEach(([label, value]) => {
    doc.text(label, margin + 5, yPosition)
    doc.text(value, pageWidth - margin - 40, yPosition, { align: 'right' })
    yPosition += 6
  })

  yPosition += 10

  // Grand Total
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('Grand Total:', margin, yPosition)
  doc.text(`$${specification.budget.grandTotal.toFixed(2)}`, pageWidth - margin - 40, yPosition, { align: 'right' })

  // Return as blob
  return doc.output('blob')
}
