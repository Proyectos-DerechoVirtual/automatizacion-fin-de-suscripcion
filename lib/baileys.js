/**
 * Remueve un participante de una comunidad de WhatsApp y todos sus subgrupos via Baileys.
 * El teléfono puede venir como "34651519762", "+34651519762", "34651519762@c.us", etc.
 */
export async function removeFromCommunity(phone, communityId) {
  const baileysUrl = process.env.BAILEYS_URL;
  const baileysSecret = process.env.BAILEYS_SECRET;

  if (!baileysUrl || !communityId) {
    throw new Error('BAILEYS_URL y communityId son requeridos');
  }

  // Normalizar número: solo dígitos + @s.whatsapp.net
  const clean = phone.replace(/[^0-9]/g, '');
  const participant = `${clean}@s.whatsapp.net`;

  const res = await fetch(
    `${baileysUrl}/community/removeParticipant?key=${baileysSecret}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ communityId, participant }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Baileys error ${res.status}: ${text}`);
  }

  return res.json();
}
