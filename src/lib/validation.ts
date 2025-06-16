/**
 * Valida si un string es un ObjectId válido de MongoDB
 * @param id - String a validar
 * @returns boolean - true si es un ObjectId válido
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}
