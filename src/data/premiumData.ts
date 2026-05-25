export const PREMIUM_PACKAGES = [
  {
    id: 'starter',
    name: 'Pachet Start',
    price: 4.99,
    currency: 'EUR',
    icon: '🎁',
    color: 'from-green-500 to-emerald-600',
    benefits: [
      { label: '$50,000 Bani', value: 50000 },
      { label: '500 XP Boost', value: 500 },
      { label: 'Energy Max +20', value: 20 },
      { label: 'Armor Light', value: 'armor_light' },
      { label: '3 Zile VIP', value: 3 }
    ],
    description: 'Perfect pentru început!',
    popular: false
  },
  {
    id: 'warrior',
    name: 'Pachet Războinic',
    price: 9.99,
    currency: 'EUR',
    icon: '⚔️',
    color: 'from-blue-500 to-cyan-600',
    benefits: [
      { label: '$150,000 Bani', value: 150000 },
      { label: '2,000 XP Boost', value: 2000 },
      { label: 'Energy Max +50', value: 50 },
      { label: 'Weapon Rare', value: 'weapon_rare' },
      { label: 'Armor Medium', value: 'armor_medium' },
      { label: '7 Zile VIP', value: 7 }
    ],
    description: 'Devino un războinic temut!',
    popular: true
  },
  {
    id: 'boss',
    name: 'Pachet Boss',
    price: 24.99,
    currency: 'EUR',
    icon: '👑',
    color: 'from-purple-500 to-pink-600',
    benefits: [
      { label: '$500,000 Bani', value: 500000 },
      { label: '10,000 XP Boost', value: 10000 },
      { label: 'Energy Max +100', value: 100 },
      { label: 'Weapon Legendary', value: 'weapon_legendary' },
      { label: 'Armor Heavy', value: 'armor_heavy' },
      { label: '30 Zile VIP', value: 30 },
      { label: 'Gang Creation Free', value: 'gang_free' }
    ],
    description: 'Calea rapidă spre putere absolută!',
    popular: false
  },
  {
    id: 'legend',
    name: 'Pachet Legendă',
    price: 49.99,
    currency: 'EUR',
    icon: '🏆',
    color: 'from-yellow-500 to-orange-600',
    benefits: [
      { label: '$2,000,000 Bani', value: 2000000 },
      { label: '50,000 XP Boost', value: 50000 },
      { label: 'Energy Max +200', value: 200 },
      { label: 'Weapon Godlike', value: 'weapon_godlike' },
      { label: 'Armor Ultimate', value: 'armor_ultimate' },
      { label: '90 Zile VIP', value: 90 },
      { label: 'Properties Discount 20%', value: 'property_discount' },
      { label: 'No Cooldowns 7 Days', value: 'no_cooldowns' }
    ],
    description: 'Statut de legendă instant!',
    popular: false
  }
];

export const PREMIUM_ITEMS = [
  {
    id: 'energy_boost',
    name: 'Energy Boost',
    price: 1.99,
    icon: '⚡',
    description: 'Refill complet energy',
    effect: 'energy_refill'
  },
  {
    id: 'health_boost',
    name: 'Health Boost',
    price: 0.99,
    icon: '❤️',
    description: 'Refill complet health',
    effect: 'health_refill'
  },
  {
    id: 'cooldown_reset',
    name: 'Reset Cooldowns',
    price: 2.99,
    icon: '🔄',
    description: 'Resetează toate cooldown-urile',
    effect: 'cooldown_reset'
  },
  {
    id: 'heat_reduce',
    name: 'Reduce Heat',
    price: 1.49,
    icon: '🔥',
    description: '-50% Heat instant',
    effect: 'heat_reduce_50'
  },
  {
    id: 'xp_boost_24h',
    name: 'XP Boost 24h',
    price: 4.99,
    icon: '📈',
    description: '+100% XP pentru 24 ore',
    effect: 'xp_boost_24h'
  },
  {
    id: 'money_boost_24h',
    name: 'Money Boost 24h',
    price: 5.99,
    icon: '💰',
    description: '+50% bani din crime pentru 24 ore',
    effect: 'money_boost_24h'
  },
  {
    id: 'vip_7days',
    name: 'VIP 7 Zile',
    price: 7.99,
    icon: '👑',
    description: 'Status VIP 7 zile',
    effect: 'vip_7days'
  },
  {
    id: 'vip_30days',
    name: 'VIP 30 Zile',
    price: 24.99,
    icon: '🏅',
    description: 'Status VIP 30 zile',
    effect: 'vip_30days'
  }
];

export const VIP_BENEFITS = [
  { icon: '💰', label: '+50% bani din crime' },
  { icon: '📈', label: '+100% XP' },
  { icon: '⚡', label: 'Regenerare energie dublă' },
  { icon: '🏪', label: '-20% prețuri shop' },
  { icon: '🏠', label: '-10% proprietăți' },
  { icon: '🎰', label: '+10% șanse casino' },
  { icon: '🛡️', label: '-25% cooldown-uri' },
  { icon: '👑', label: 'Badge VIP special' }
];
