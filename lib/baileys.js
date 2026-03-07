/**
 * Remueve un participante de un grupo de WhatsApp via Baileys.
 * El teléfono puede venir como "34651519762", "34651519762@c.us" o "34651519762@s.whatsapp.net".
 */
export async function removeFromGroup(phone, groupId) {
  const baileysUrl = process.env.BAILEYS_URL;
  const baileysSecret = process.env.BAILEYS_SECRET;

  if (!baileysUrl || !groupId) {
    throw new Error('BAILEYS_URL y groupId son requeridos');
  }

  // Normalizar número: solo dígitos + @s.whatsapp.net
  const clean = phone.replace(/[\s@c.us@s.whatsapp.net]/g, '').replace(/\D/g, '');
  const participant = `${clean}@s.whatsapp.net`;

  const res = await fetch(
    `${baileysUrl}/groups/removeParticipant?key=${baileysSecret}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, participant }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Baileys error ${res.status}: ${text}`);
  }

  return res.json();
}
