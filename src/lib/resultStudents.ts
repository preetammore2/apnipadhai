import { readdirSync } from 'fs';
import path from 'path';

export interface FolderStudent {
  id: string;
  name: string;
  district: string;
  photo: string;
  category: 'Rajasthan Police' | 'REET L1/L2';
}

const IMAGE_DIRS = {
  'Rajasthan Police': 'Rajasthan_Police',
  'REET L1/L2': 'REET_L1_L2',
} as const;

const SUPPORTED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heif', '.heic', '.avif']);

function parseFilename(filename: string): { name: string; district: string } {
  const base = path.basename(filename, path.extname(filename));
  const openIdx = base.indexOf('(');
  const closeIdx = base.indexOf(')', openIdx + 1);

  if (openIdx >= 0 && closeIdx > openIdx) {
    return {
      name: base.slice(0, openIdx).trim().replace(/\s+/g, ' '),
      district: base.slice(openIdx + 1, closeIdx).trim().replace(/\s+/g, ' '),
    };
  }

  return { name: base.trim(), district: '' };
}

function readFolderStudents(folder: (typeof IMAGE_DIRS)[keyof typeof IMAGE_DIRS]): FolderStudent[] {
  const dirPath = path.join(process.cwd(), 'public', 'images', folder);
  let files: string[] = [];
  try {
    files = readdirSync(dirPath);
  } catch {
    return [];
  }

  return files
    .filter((file) => SUPPORTED_EXT.has(path.extname(file).toLowerCase()))
    .map((file, index) => {
      const { name, district } = parseFilename(file);
      return {
        id: `${folder.toLowerCase()}-${index}`,
        name,
        district,
        photo: `/images/${folder}/${encodeURI(file)}`,
        category: (folder === 'Rajasthan_Police' ? 'Rajasthan Police' : 'REET L1/L2') as FolderStudent['category'],
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getFolderStudents(): {
  rajasthanPolice: FolderStudent[];
  reet: FolderStudent[];
} {
  return {
    rajasthanPolice: readFolderStudents(IMAGE_DIRS['Rajasthan Police']),
    reet: readFolderStudents(IMAGE_DIRS['REET L1/L2']),
  };
}
