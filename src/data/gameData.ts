export const INITIAL_PROPERTIES = [
  // RESIDENCES
  { property_id: 'apartment_small', name: 'Garsonieră', type: 'residence', price: 5000, level_req: 3, base_income: 50, defense_bonus: 5, description: 'Garsonieră modestă.' },
  { property_id: 'apartment_medium', name: 'Apartament 2 Camere', type: 'residence', price: 15000, level_req: 5, base_income: 120, defense_bonus: 10, description: 'Apartament confortabil.' },
  { property_id: 'house_villa', name: 'Vilă', type: 'residence', price: 50000, level_req: 8, base_income: 300, defense_bonus: 20, description: 'Vilă luxoasă.' },
  { property_id: 'mansion', name: 'Mansiune', type: 'residence', price: 200000, level_req: 12, base_income: 800, defense_bonus: 40, description: 'Mansiune impresionantă.' },
  
  // BUSINESSES
  { property_id: 'shop_small', name: 'Magazin Alimentar', type: 'business', price: 10000, level_req: 4, base_income: 100, defense_bonus: 5, description: 'Magazin mic.' },
  { property_id: 'restaurant', name: 'Restaurant', type: 'business', price: 30000, level_req: 6, base_income: 250, defense_bonus: 10, description: 'Restaurant profitabil.' },
  { property_id: 'club', name: 'Club Nocturn', type: 'business', price: 80000, level_req: 10, base_income: 500, defense_bonus: 20, description: 'Club exclusivist.' },
  { property_id: 'casino_front', name: 'Casino', type: 'business', price: 250000, level_req: 15, base_income: 1200, defense_bonus: 35, description: 'Casino de fițe.' },
  
  // SAFEHOUSES
  { property_id: 'safehouse_basic', name: 'Buncăr Simplu', type: 'safehouse', price: 20000, level_req: 5, base_income: 0, defense_bonus: 30, description: 'Ascunzătoare de bază.' },
  { property_id: 'safehouse_pro', name: 'Buncăr Fortificat', type: 'safehouse', price: 100000, level_req: 10, base_income: 0, defense_bonus: 60, description: 'Fortăreață.' },
  { property_id: 'safehouse_elite', name: 'Compund Secret', type: 'safehouse', price: 500000, level_req: 15, base_income: 0, defense_bonus: 100, description: 'Bază militară.' },
];

export const INITIAL_MISSIONS = [
  { mission_id: 'crime_starter', title: 'Criminal Începător', description: 'Fă 5 crime de buzunărit', type: 'crime', target_type: 'pickpocket', target_value: 5, level_req: 1, rewards: { xp: 50, money: 200 } },
  { mission_id: 'car_jacker', title: 'Furt Auto', description: 'Fă 3 jafuri de mașini', type: 'crime', target_type: 'carjack', target_value: 3, level_req: 2, rewards: { xp: 100, money: 500 } },
  { mission_id: 'bank_robber', title: 'Jaf Bancar', description: 'Fă un jaf de bancă', type: 'crime', target_type: 'bank_heist', target_value: 1, level_req: 8, rewards: { xp: 500, money: 5000 } },
  { mission_id: 'killer', title: 'Asasin', description: 'Fă 3 asasinate', type: 'crime', target_type: 'contract_kill', target_value: 3, level_req: 10, rewards: { xp: 800, money: 10000 } },
  { mission_id: 'level_5', title: 'Veteran', description: 'Ajunge la nivel 5', type: 'level', target_type: 'level', target_value: 5, level_req: 1, rewards: { xp: 200, money: 1000 } },
  { mission_id: 'level_10', title: 'Elite', description: 'Ajunge la nivel 10', type: 'level', target_type: 'level', target_value: 10, level_req: 5, rewards: { xp: 1000, money: 10000 } },
  { mission_id: 'rich', title: 'Îmbogățit', description: 'Accumulează $50,000 cash', type: 'money', target_type: 'money', target_value: 50000, level_req: 3, rewards: { xp: 300, money: 5000 } },
  { mission_id: 'pvp_winner', title: 'Războinic', description: 'Câștigă 5 lupte PvP', type: 'pvp', target_type: 'pvp_wins', target_value: 5, level_req: 4, rewards: { xp: 400, money: 2000 } },
  { mission_id: 'gang_leader', title: 'Şef de Gască', description: 'Creează o gască', type: 'gang', target_type: 'gang_create', target_value: 1, level_req: 5, rewards: { xp: 500, money: 3000 } },
];

export const INITIAL_ACHIEVEMENTS = [
  { achievement_id: 'first_crime', title: 'Prima Crimă', description: 'Fă prima ta crimă', requirement_type: 'crimes_done', requirement_value: 1, reward_xp: 20, reward_money: 100, icon: '🔪' },
  { achievement_id: 'crime_master', title: 'Maestru al Crimei', description: 'Fă 100 crime', requirement_type: 'crimes_done', requirement_value: 100, reward_xp: 500, reward_money: 5000, icon: '🎯' },
  { achievement_id: 'killer', title: 'Asasin', description: 'Fă 10 asasinate', requirement_type: 'contract_kill', requirement_value: 10, reward_xp: 1000, reward_money: 10000, icon: '💀' },
  { achievement_id: 'millionaire', title: 'Milionar', description: 'Ai $1,000,000 total', requirement_type: 'total_wealth', requirement_value: 1000000, reward_xp: 2000, reward_money: 50000, icon: '💰' },
  { achievement_id: 'gang_boss', title: 'Şef de Mafie', description: 'Condu o gască de 10 membri', requirement_type: 'gang_size', requirement_value: 10, reward_xp: 1500, reward_money: 20000, icon: '👑' },
  { achievement_id: 'level_20', title: 'Veteran', description: 'Ajunge la nivel 20', requirement_type: 'level', requirement_value: 20, reward_xp: 3000, reward_money: 30000, icon: '⭐' },
  { achievement_id: 'pvp_king', title: 'Regele PvP', description: 'Câștigă 50 lupte', requirement_type: 'pvp_wins', requirement_value: 50, reward_xp: 2000, reward_money: 15000, icon: '⚔️' },
  { achievement_id: 'property_owner', title: 'Proprietar', description: 'Deține 5 proprietăți', requirement_type: 'properties', requirement_value: 5, reward_xp: 1000, reward_money: 10000, icon: '🏠' },
];
