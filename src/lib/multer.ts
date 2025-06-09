import multer from 'multer';
import { NextApiRequest } from 'next';

// Configuración de multer para manejar archivos en memoria
const storage = multer.memoryStorage();

// Filtro para solo permitir imágenes
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Verificar que sea una imagen
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  }
});

// Middleware helper para Next.js
export const runMiddleware = (req: any, res: any, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

// Interfaz extendida para NextApiRequest con archivos
export interface NextApiRequestWithFiles extends NextApiRequest {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}