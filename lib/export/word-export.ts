import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx'
import { SystemSpecification } from '@/lib/types'
import { format } from 'date-fns'

export async function exportToWord(specification: SystemSpecification): Promise<Blob> {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Title Page
        new Paragraph({
          text: 'AV System Specification',
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        new Paragraph({
          text: specification.projectName,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 }
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: `Generated: ${format(specification.createdAt, 'MMMM dd, yyyy')}`,
              size: 24
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 800 },
          children: [
            new TextRun({
              text: `Document ID: ${specification.id}`,
              size: 20,
              color: '666666'
            })
          ]
        }),

        // Venue Information
        new Paragraph({
          text: 'Venue Information',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        }),

        // Venue Details Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph('Venue Type')],
                  width: { size: 30, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph(specification.venue.type)],
                  width: { size: 70, type: WidthType.PERCENTAGE }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Dimensions')] }),
                new TableCell({ 
                  children: [new Paragraph(`${specification.venue.dimensions.length}m x ${specification.venue.dimensions.width}m x ${specification.venue.dimensions.height}m`)] 
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Volume')] }),
                new TableCell({ 
                  children: [new Paragraph(`${(specification.venue.dimensions.length * specification.venue.dimensions.width * specification.venue.dimensions.height).toFixed(0)} m³`)] 
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Capacity')] }),
                new TableCell({ children: [new Paragraph(`${specification.venue.capacity.seated} seated`)] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Ambient Noise')] }),
                new TableCell({ children: [new Paragraph(`${specification.venue.acoustics.ambientNoise} dBA`)] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Target RT60')] }),
                new TableCell({ children: [new Paragraph(`${specification.venue.acoustics.targetRT60}s`)] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Target STI')] }),
                new TableCell({ children: [new Paragraph(specification.venue.acoustics.targetSTI.toString())] })
              ]
            })
          ]
        }),

        new Paragraph({ text: '', spacing: { after: 400 } }),

        // Use Cases
        new Paragraph({
          text: 'Use Cases',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        ...specification.venue.useCases.map(useCase => 
          new Paragraph({
            bullet: { level: 0 },
            text: useCase,
            spacing: { after: 100 }
          })
        ),

        new Paragraph({ text: '', spacing: { after: 400 } }),

        // Audio System Specification
        new Paragraph({
          text: 'Audio System Specification',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 600, after: 200 }
        }),

        // Speakers
        new Paragraph({
          text: 'Speakers',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        ...createEquipmentParagraphs(specification.systems.audio.speakers.main, 'Main Speakers'),
        ...(specification.systems.audio.speakers.subwoofer ? 
          createEquipmentParagraphs(specification.systems.audio.speakers.subwoofer, 'Subwoofers') : []),

        // Amplifiers
        new Paragraph({
          text: 'Amplifiers',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 100 }
        }),
        ...createEquipmentParagraphs(specification.systems.audio.amplifiers),

        // Mixers
        new Paragraph({
          text: 'Audio Mixers',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 100 }
        }),
        ...createEquipmentParagraphs(specification.systems.audio.mixers),

        // Microphones
        new Paragraph({
          text: 'Microphones',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 100 }
        }),
        ...(specification.systems.audio.microphones.wired.length > 0 ? [
          new Paragraph({
            text: 'Wired Microphones',
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 100 }
          }),
          ...createEquipmentParagraphs(specification.systems.audio.microphones.wired)
        ] : []),
        ...(specification.systems.audio.microphones.wireless.length > 0 ? [
          new Paragraph({
            text: 'Wireless Microphones',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 }
          }),
          ...createEquipmentParagraphs(specification.systems.audio.microphones.wireless)
        ] : []),

        // Acoustic Performance
        new Paragraph({
          text: 'Predicted Acoustic Performance',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 600, after: 200 }
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: 'Parameter', bold: true })],
                  width: { size: 50, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({ text: 'Value', bold: true })],
                  width: { size: 50, type: WidthType.PERCENTAGE }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('RT60 (Reverberation Time)')] }),
                new TableCell({ children: [new Paragraph(`${specification.systems.audio.calculations.rt60Predicted.toFixed(2)} seconds`)] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('STI (Speech Transmission Index)')] }),
                new TableCell({ children: [new Paragraph(specification.systems.audio.calculations.stiPredicted.toFixed(2))] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Average SPL')] }),
                new TableCell({ children: [new Paragraph(`${specification.systems.audio.calculations.splAverage.toFixed(0)} dB`)] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Peak SPL')] }),
                new TableCell({ children: [new Paragraph(`${specification.systems.audio.calculations.splPeak.toFixed(0)} dB`)] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Total Amplifier Power')] }),
                new TableCell({ children: [new Paragraph(`${specification.systems.audio.calculations.totalPower.toFixed(0)} watts`)] })
              ]
            })
          ]
        }),

        new Paragraph({ text: '', spacing: { after: 400 } }),

        // Budget Summary
        new Paragraph({
          text: 'Budget Summary',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 600, after: 200 }
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            // Equipment Costs
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: 'Equipment Costs', bold: true })],
                  columnSpan: 2,
                  shading: { fill: 'E0E0E0' }
                })
              ]
            }),
            createBudgetRow('Audio Equipment', specification.budget.equipment.audio),
            createBudgetRow('Video Equipment', specification.budget.equipment.video),
            createBudgetRow('Control Equipment', specification.budget.equipment.control),
            createBudgetRow('Equipment Subtotal', specification.budget.equipment.total, true),
            
            // Installation Costs
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: 'Installation Costs', bold: true })],
                  columnSpan: 2,
                  shading: { fill: 'E0E0E0' }
                })
              ]
            }),
            createBudgetRow('Labor', specification.budget.installation.labor),
            createBudgetRow('Materials', specification.budget.installation.materials),
            createBudgetRow('Installation Subtotal', specification.budget.installation.total, true),
            
            // Other Costs
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: 'Other Costs', bold: true })],
                  columnSpan: 2,
                  shading: { fill: 'E0E0E0' }
                })
              ]
            }),
            createBudgetRow('Shipping', specification.budget.other.shipping),
            createBudgetRow('Tax', specification.budget.other.tax),
            createBudgetRow('Contingency', specification.budget.other.contingency),
            
            // Grand Total
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: 'GRAND TOTAL', bold: true })],
                  shading: { fill: 'D0D0D0' }
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    text: `$${specification.budget.grandTotal.toFixed(2)}`,
                    bold: true
                  })],
                  shading: { fill: 'D0D0D0' }
                })
              ]
            })
          ]
        })
      ]
    }]
  })

  // Generate document
  const buffer = await Packer.toBuffer(doc)
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
}

function createEquipmentParagraphs(items: any[], subtitle?: string): Paragraph[] {
  const paragraphs: Paragraph[] = []
  
  if (subtitle) {
    paragraphs.push(new Paragraph({
      text: subtitle,
      heading: HeadingLevel.HEADING_3,
      spacing: { after: 100 }
    }))
  }

  items.forEach((item, index) => {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 50 },
        children: [
          new TextRun({ 
            text: `${item.quantity}x ${item.equipment.manufacturer} ${item.equipment.model}`,
            bold: true
          })
        ]
      }),
      new Paragraph({
        spacing: { after: 50 },
        indent: { left: 360 },
        children: [
          new TextRun({ text: item.equipment.description })
        ]
      }),
      new Paragraph({
        spacing: { after: 50 },
        indent: { left: 360 },
        children: [
          new TextRun({ 
            text: `Location: ${item.location || 'TBD'} | Unit Price: $${item.unitPrice.toFixed(2)}`,
            size: 20,
            color: '666666'
          })
        ]
      })
    )
    
    if (index < items.length - 1) {
      paragraphs.push(new Paragraph({ text: '', spacing: { after: 100 } }))
    }
  })

  return paragraphs
}

function createBudgetRow(label: string, amount: number, bold: boolean = false): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ text: label, bold })],
        width: { size: 70, type: WidthType.PERCENTAGE }
      }),
      new TableCell({
        children: [new Paragraph({ 
          text: `$${amount.toFixed(2)}`,
          bold,
          alignment: AlignmentType.RIGHT
        })],
        width: { size: 30, type: WidthType.PERCENTAGE }
      })
    ]
  })
}
