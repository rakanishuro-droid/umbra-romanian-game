import db from '@/lib/shared/kliv-database.js';

// Energy regeneration: 1 energy every 30 seconds
export async function regenerateEnergy(player: any) {
  if (!player) return;
  
  const now = Math.floor(Date.now() / 1000);
  const secondsPassed = now - (player._updated_at || now);
  const energyGained = Math.floor(secondsPassed / 30);
  
  if (energyGained > 0 && player.energy < player.max_energy) {
    const newEnergy = Math.min(player.max_energy, player.energy + energyGained);
    await db.update('players', { _row_id: `eq.${player._row_id}` }, {
      energy: newEnergy
    });
    return newEnergy - player.energy;
  }
  return 0;
}

// Health regeneration: 1 HP every 60 seconds
export async function regenerateHealth(player: any) {
  if (!player) return;
  
  const now = Math.floor(Date.now() / 1000);
  const secondsPassed = now - (player._updated_at || now);
  const healthGained = Math.floor(secondsPassed / 60);
  
  if (healthGained > 0 && player.health < player.max_health) {
    const newHealth = Math.min(player.max_health, player.health + healthGained);
    await db.update('players', { _row_id: `eq.${player._row_id}` }, {
      health: newHealth
    });
    return newHealth - player.health;
  }
  return 0;
}

// Check and release from jail/hospital
export async function checkTimers(player: any) {
  if (!player) return null;
  
  const now = Math.floor(Date.now() / 1000);
  let updates: any = {};
  let released = false;

  if (player.status === 'jail' && player.jail_until && now >= player.jail_until) {
    updates.status = 'free';
    updates.jail_until = 0;
    released = true;
  }

  if (player.status === 'hospital' && player.hospital_until && now >= player.hospital_until) {
    updates.status = 'free';
    updates.hospital_until = 0;
    released = true;
  }

  if (Object.keys(updates).length > 0) {
    await db.update('players', { _row_id: `eq.${player._row_id}` }, updates);
  }

  return released ? updates : null;
}

// Check level up and grant rewards
export async function checkLevelUp(player: any) {
  if (!player) return null;
  
  const newLevel = Math.floor(player.xp / 100) + 1;
  if (newLevel > player.level) {
    const updates: any = { level: newLevel };
    
    // Level up rewards
    const statPoints = newLevel % 5 === 0 ? 2 : 1; // Bonus stat point every 5 levels
    void statPoints; // Used for future stat allocation system
    updates.max_energy = player.max_energy + (newLevel % 3 === 0 ? 5 : 0); // +5 max energy every 3 levels
    updates.max_health = player.max_health + (newLevel % 3 === 0 ? 10 : 0); // +10 max HP every 3 levels
    
    // Bonus money at milestones
    if (newLevel % 10 === 0) {
      updates.money = (player.money || 0) + (newLevel * 500);
    }
    
    await db.update('players', { _row_id: `eq.${player._row_id}` }, updates);
    return { newLevel, rewards: updates };
  }
  return null;
}

// Travel between cities
export async function travelToCity(player: any, city: string) {
  if (!player) return null;
  
  const cityCosts: Record<string, number> = {
    'Bucuresti': 0,
    'Cluj-Napoca': 100,
    'Timisoara': 150,
    'Constanta': 200,
    'Iasi': 180,
    'Brasov': 120,
  };
  
  const cost = cityCosts[city] || 100;
  
  if (player.money < cost) {
    return { error: 'Nu ai destui bani pentru călătorie!' };
  }
  
  if (player.city === city) {
    return { error: 'Ești deja în acest oraș!' };
  }
  
  await db.update('players', { _row_id: `eq.${player._row_id}` }, {
    city: city,
    money: player.money - cost
  });
  
  return { success: true, city, cost };
}

// Bank interest: 1% daily
export async function applyBankInterest(player: any) {
  if (!player) return 0;
  
  const now = Math.floor(Date.now() / 1000);
  const daysPassed = (now - (player._updated_at || now)) / 86400;
  
  if (daysPassed >= 1 && player.bank > 0) {
    const interest = Math.floor(player.bank * 0.01 * Math.floor(daysPassed));
    if (interest > 0) {
      await db.update('players', { _row_id: `eq.${player._row_id}` }, {
        bank: player.bank + interest
      });
      return interest;
    }
  }
  return 0;
}
