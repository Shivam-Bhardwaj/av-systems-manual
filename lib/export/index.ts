export * from './pdf-export';
export * from './excel-export';
export * from './word-export';

import { SystemSpecification } from '@/lib/types';
import { exportToPDF } from './pdf-export';
import { exportToExcel } from './excel-export';
import { exportToWord } from './word-export';

export type ExportFormat = 'pdf' | 'excel' | 'word';

export async function exportSpecification(
  specification: SystemSpecification,
  format: ExportFormat
): Promise<{ blob: Blob; filename: string }> {
  let blob: Blob;
  let extension: string;

  switch (format) {
    case 'pdf':
      blob = await exportToPDF(specification);
      extension = 'pdf';
      break;
    case 'excel':
      blob = await exportToExcel(specification);
      extension = 'xlsx';
      break;
    case 'word':
      blob = await exportToWord(specification);
      extension = 'docx';
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }

  const filename = `${specification.projectName.replace(/[^a-zA-Z0-9]/g, '-')}-AV-Specification.${extension}`;

  return { blob, filename };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
