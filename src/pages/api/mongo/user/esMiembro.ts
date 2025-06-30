import { NextApiRequest, NextApiResponse } from 'next';
import { PersonaAuthAdapter } from '@/models/PersonaAuthAdapter';

const personaAdapter = new PersonaAuthAdapter();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const result = await personaAdapter.esMiembro(id as string);
  res.status(200).json({ isMiembro: result });
}