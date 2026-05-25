// Required signature:
export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { userId, packageId } = body;
    
    // Get player
    const playerResponse = await fetch(`${req.headers.get('x-database-url')}/rest/players?_created_by=eq.${userId}`, {
      headers: {
        'Authorization': `Bearer ${req.headers.get('x-database-token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!playerResponse.ok) {
      return Response.json({ error: 'Player not found' }, { status: 404 });
    }
    
    const players = await playerResponse.json();
    if (players.length === 0) {
      return Response.json({ error: 'Player not found' }, { status: 404 });
    }
    
    const player = players[0];
    
    // Apply package benefits
    let updates: any = {
      vip_status: 1,
      vip_expires: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
      money: player.money + 500000,
      xp: player.xp + 10000,
      max_energy: player.max_energy + 100,
      xp_boost_active: 1,
      xp_boost_expires: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24h
      money_boost_active: 1,
      money_boost_expires: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24h
    };
    
    // Add premium item
    await fetch(`${req.headers.get('x-database-url')}/rest/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${req.headers.get('x-database-token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        player_id: player._row_id,
        item_type: 'weapon',
        item_id: 'weapon_legendary',
        name: 'Weapon Legendary',
        attack_bonus: 25,
        defense_bonus: 0,
        speed_bonus: 5,
        crime_bonus: 10,
        equipped: 0
      })
    });
    
    // Update player
    await fetch(`${req.headers.get('x-database-url')}/rest/players?_row_id=eq.${player._row_id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${req.headers.get('x-database-token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    return Response.json({ 
      success: true, 
      message: 'Package activated successfully!',
      benefits: updates 
    });
    
  } catch (error) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
