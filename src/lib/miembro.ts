export async function isMiembro(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const res = await fetch(`/api/mongo/user/esMiembro?id=${userId}`);
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.isMiembro;
  } catch (error) {
    console.error('Error verificando si el usuario es miembro:', error);
    return false;
  }
}