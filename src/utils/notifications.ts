import db from '@/lib/shared/kliv-database.js';

export async function createNotification(
  player_id: number,
  type: 'info' | 'warning' | 'success' | 'danger',
  title: string,
  message: string
) {
  await db.insert('notifications', {
    player_id,
    type,
    title,
    message,
    read: 0,
    created_at: Math.floor(Date.now() / 1000),
  });
}

export async function notifyAllPlayers(type: 'info' | 'warning' | 'success' | 'danger', title: string, message: string) {
  const players = await db.query('players', {});
  for (const player of players) {
    await createNotification(player._row_id, type, title, message);
  }
}

export async function notifyGangMembers(gang_id: number, type: 'info' | 'warning' | 'success' | 'danger', title: string, message: string) {
  const members = await db.query('gang_members', { gang_id: `eq.${gang_id}` });
  for (const member of members) {
    await createNotification(member.player_id, type, title, message);
  }
}
