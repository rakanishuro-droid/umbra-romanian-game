import { useState, useEffect } from 'react';
import db from '@/lib/shared/kliv-database.js';

// Check if player is admin
export async function checkAdminStatus(player: any): Promise<boolean> {
  if (!player) return false;
  
  // Level 20+ is admin
  if (player.level >= 20) return true;
  
  // Check for admin group membership
  try {
    const user = await db.query('users', { username: `eq.${player.username}` });
    if (user.length > 0 && user[0].groups && user[0].groups.includes('admin')) {
      return true;
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
  }
  
  return false;
}

// Log admin action
export async function logAdminAction(adminId: number, action: string, target: string, details: string) {
  await db.insert('admin_logs', {
    admin_id: adminId,
    action_type: action,
    target_type: target,
    target_id: 0,
    details: details,
    severity: 'info',
  });
}

// Get server stats
export async function getServerStats() {
  const players = await db.query('players', {});
  
  return {
    totalPlayers: players.length,
    activeToday: players.filter((p: any) => p.level > 5).length,
    totalCrimes: players.reduce((sum: number, p: any) => sum + (p.crimes_done || 0), 0),
    totalMoney: players.reduce((sum: number, p: any) => sum + (p.money || 0), 0),
    avgLevel: Math.round(players.reduce((sum: number, p: any) => sum + (p.level || 0), 0) / players.length) || 0,
    totalGangs: await db.query('gangs', {}).then((g: any[]) => g.length),
    totalBans: await db.query('banned_players', {}).then((b: any[]) => b.length),
  };
}
