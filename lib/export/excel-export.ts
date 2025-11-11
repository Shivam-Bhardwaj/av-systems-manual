import * as XLSX from 'xlsx'
import { SystemSpecification, Equipment, Speaker, Amplifier } from '@/lib/types'
import { format } from 'date-fns'

export async function exportToExcel(specification: SystemSpecification): Promise<Blob> {
  const workbook = XLSX.utils.book_new()

  // Project Summary Sheet
  const summaryData = [
    ['AV System Specification'],
    [''],
    ['Project Name:', specification.projectName],
    ['Document ID:', specification.id],
    ['Generated:', format(specification.createdAt, 'MMMM dd, yyyy')],
    [''],
    ['Venue Information'],
    ['Type:', specification.venue.type],
    ['Dimensions:', `${specification.venue.dimensions.length}m x ${specification.venue.dimensions.width}m x ${specification.venue.dimensions.height}m`],
    ['Volume:', `${(specification.venue.dimensions.length * specification.venue.dimensions.width * specification.venue.dimensions.height).toFixed(0)} m³`],
    ['Capacity:', `${specification.venue.capacity.seated} seated`],
    [''],
    ['Acoustic Targets'],
    ['RT60:', `${specification.venue.acoustics.targetRT60}s`],
    ['STI:', specification.venue.acoustics.targetSTI.toString()],
    ['Average SPL:', `${specification.venue.acoustics.targetSPL.average} dB`],
    ['Peak SPL:', `${specification.venue.acoustics.targetSPL.peak} dB`]
  ]

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  
  // Set column widths
  summarySheet['!cols'] = [
    { wch: 20 },
    { wch: 50 }
  ]
  
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Project Summary')

  // Equipment List Sheet
  const equipmentHeaders = [
    'Category',
    'Manufacturer',
    'Model',
    'Description',
    'Quantity',
    'Location',
    'Unit Price',
    'Total Price'
  ]

  const equipmentData: any[][] = [equipmentHeaders]

  // Add speakers
  specification.systems.audio.speakers.main.forEach(item => {
    equipmentData.push([
      'Speaker - Main',
      item.equipment.manufacturer,
      item.equipment.model,
      item.equipment.description,
      item.quantity,
      item.location || '',
      item.unitPrice,
      item.totalPrice
    ])
  })

  if (specification.systems.audio.speakers.subwoofer) {
    specification.systems.audio.speakers.subwoofer.forEach(item => {
      equipmentData.push([
        'Speaker - Subwoofer',
        item.equipment.manufacturer,
        item.equipment.model,
        item.equipment.description,
        item.quantity,
        item.location || '',
        item.unitPrice,
        item.totalPrice
      ])
    })
  }

  // Add amplifiers
  specification.systems.audio.amplifiers.forEach(item => {
    equipmentData.push([
      'Amplifier',
      item.equipment.manufacturer,
      item.equipment.model,
      item.equipment.description,
      item.quantity,
      item.location || '',
      item.unitPrice,
      item.totalPrice
    ])
  })

  // Add mixers
  specification.systems.audio.mixers.forEach(item => {
    equipmentData.push([
      'Mixer',
      item.equipment.manufacturer,
      item.equipment.model,
      item.equipment.description,
      item.quantity,
      item.location || '',
      item.unitPrice,
      item.totalPrice
    ])
  })

  // Add microphones
  specification.systems.audio.microphones.wired.forEach(item => {
    equipmentData.push([
      'Microphone - Wired',
      item.equipment.manufacturer,
      item.equipment.model,
      item.equipment.description,
      item.quantity,
      item.location || '',
      item.unitPrice,
      item.totalPrice
    ])
  })

  specification.systems.audio.microphones.wireless.forEach(item => {
    equipmentData.push([
      'Microphone - Wireless',
      item.equipment.manufacturer,
      item.equipment.model,
      item.equipment.description,
      item.quantity,
      item.location || '',
      item.unitPrice,
      item.totalPrice
    ])
  })

  // Add totals row
  equipmentData.push([])
  equipmentData.push([
    'TOTAL',
    '',
    '',
    '',
    '',
    '',
    '',
    specification.budget.equipment.total
  ])

  const equipmentSheet = XLSX.utils.aoa_to_sheet(equipmentData)
  
  // Format currency columns
  const range = XLSX.utils.decode_range(equipmentSheet['!ref'] || 'A1')
  for (let row = 1; row <= range.e.r; row++) {
    const unitPriceCell = XLSX.utils.encode_cell({ r: row, c: 6 })
    const totalPriceCell = XLSX.utils.encode_cell({ r: row, c: 7 })
    
    if (equipmentSheet[unitPriceCell]) {
      equipmentSheet[unitPriceCell].z = '"$"#,##0.00'
    }
    if (equipmentSheet[totalPriceCell]) {
      equipmentSheet[totalPriceCell].z = '"$"#,##0.00'
    }
  }

  // Set column widths
  equipmentSheet['!cols'] = [
    { wch: 20 }, // Category
    { wch: 15 }, // Manufacturer
    { wch: 20 }, // Model
    { wch: 40 }, // Description
    { wch: 10 }, // Quantity
    { wch: 20 }, // Location
    { wch: 12 }, // Unit Price
    { wch: 12 }  // Total Price
  ]

  XLSX.utils.book_append_sheet(workbook, equipmentSheet, 'Equipment List')

  // Cable Schedule Sheet
  const cableHeaders = [
    'Cable ID',
    'Type',
    'From',
    'To',
    'Cable Spec',
    'Length (m)',
    'Quantity',
    'Conduit'
  ]

  const cableData: any[][] = [cableHeaders]

  specification.installation.cableSchedule.forEach(cable => {
    cableData.push([
      cable.id,
      cable.type,
      cable.from,
      cable.to,
      cable.cableSpec,
      cable.length,
      cable.quantity,
      cable.conduit || ''
    ])
  })

  const cableSheet = XLSX.utils.aoa_to_sheet(cableData)
  
  cableSheet['!cols'] = [
    { wch: 12 }, // Cable ID
    { wch: 10 }, // Type
    { wch: 20 }, // From
    { wch: 20 }, // To
    { wch: 20 }, // Cable Spec
    { wch: 12 }, // Length
    { wch: 10 }, // Quantity
    { wch: 15 }  // Conduit
  ]

  XLSX.utils.book_append_sheet(workbook, cableSheet, 'Cable Schedule')

  // Rack Layout Sheet
  if (specification.installation.rackLayout && specification.installation.rackLayout.length > 0) {
    const rackHeaders = ['U Position', 'Height (U)', 'Equipment', 'Notes']
    const rackData: any[][] = [rackHeaders]

    specification.installation.rackLayout.forEach(unit => {
      rackData.push([
        unit.position,
        unit.height,
        `${unit.equipment.manufacturer} ${unit.equipment.model}`,
        unit.notes || ''
      ])
    })

    const rackSheet = XLSX.utils.aoa_to_sheet(rackData)
    
    rackSheet['!cols'] = [
      { wch: 12 },
      { wch: 12 },
      { wch: 30 },
      { wch: 30 }
    ]

    XLSX.utils.book_append_sheet(workbook, rackSheet, 'Rack Layout')
  }

  // Budget Summary Sheet
  const budgetData = [
    ['Budget Summary'],
    [''],
    ['Equipment Costs'],
    ['Audio Equipment:', specification.budget.equipment.audio],
    ['Video Equipment:', specification.budget.equipment.video],
    ['Control Equipment:', specification.budget.equipment.control],
    ['Equipment Subtotal:', specification.budget.equipment.total],
    [''],
    ['Installation Costs'],
    ['Labor:', specification.budget.installation.labor],
    ['Materials:', specification.budget.installation.materials],
    ['Installation Subtotal:', specification.budget.installation.total],
    [''],
    ['Other Costs'],
    ['Shipping:', specification.budget.other.shipping],
    ['Tax:', specification.budget.other.tax],
    ['Contingency:', specification.budget.other.contingency],
    ['Other Subtotal:', specification.budget.other.total],
    [''],
    ['GRAND TOTAL:', specification.budget.grandTotal]
  ]

  const budgetSheet = XLSX.utils.aoa_to_sheet(budgetData)
  
  // Format currency cells
  for (let row = 3; row < budgetData.length; row++) {
    const cell = XLSX.utils.encode_cell({ r: row, c: 1 })
    if (budgetSheet[cell] && typeof budgetSheet[cell].v === 'number') {
      budgetSheet[cell].z = '"$"#,##0.00'
    }
  }

  budgetSheet['!cols'] = [
    { wch: 25 },
    { wch: 15 }
  ]

  XLSX.utils.book_append_sheet(workbook, budgetSheet, 'Budget Summary')

  // Technical Specifications Sheet
  const techSpecHeaders = ['Parameter', 'Value', 'Unit', 'Notes']
  const techSpecData: any[][] = [
    techSpecHeaders,
    ['Room Volume', (specification.venue.dimensions.length * specification.venue.dimensions.width * specification.venue.dimensions.height).toFixed(0), 'm³', ''],
    ['Predicted RT60', specification.systems.audio.calculations.rt60Predicted.toFixed(2), 'seconds', ''],
    ['Predicted STI', specification.systems.audio.calculations.stiPredicted.toFixed(2), '', 'Speech Transmission Index'],
    ['Average SPL', specification.systems.audio.calculations.splAverage.toFixed(0), 'dB', 'At listener position'],
    ['Peak SPL', specification.systems.audio.calculations.splPeak.toFixed(0), 'dB', 'At listener position'],
    ['Total Amplifier Power', specification.systems.audio.calculations.totalPower.toFixed(0), 'watts', ''],
    ['Power Requirement', specification.installation.powerRequirements.totalLoad, 'watts', 'Including safety margin'],
    ['Recommended Breaker', specification.installation.powerRequirements.recommendedBreaker, 'amps', '']
  ]

  const techSpecSheet = XLSX.utils.aoa_to_sheet(techSpecData)
  
  techSpecSheet['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 10 },
    { wch: 30 }
  ]

  XLSX.utils.book_append_sheet(workbook, techSpecSheet, 'Technical Specs')

  // Write workbook to buffer
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  
  // Convert to Blob
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}
