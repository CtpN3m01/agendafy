import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, secret } = req.body;

  if (!token || !secret) {
    return res.status(400).json({ error: 'Token and secret required' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    return res.status(200).json({ 
      success: true, 
      decoded,
      secret: secret.substring(0, 10) + '...'
    });
  } catch (error) {
    return res.status(200).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Invalid token',
      secret: secret.substring(0, 10) + '...'
    });
  }
}
