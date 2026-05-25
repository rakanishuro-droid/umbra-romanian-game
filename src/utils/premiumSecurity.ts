import db from '@/lib/shared/kliv-database.js';

/**
 * PREMIUM SECURITY SYSTEM - Test Mode
 * 
 * Pentru a preveni abuzurile până la implementarea plăților reale:
 * 1. Toate achizițiile sunt loggate
 * 2. Se cere confirmare explicită
 * 3. Doar adminii pot acorda monede premium
 * 4. Limitări de utilizare
 */

export const PREMIUM_CONFIG = {
  TEST_MODE: true,
  REQUIRE_CONFIRMATION: true,
  ADMIN_ONLY_CREDITS: true,
  LOG_ALL_PURCHASES: true,
  WARNING_MESSAGE: '⚠️ TEST MODE - Achizițiile sunt doar pentru testare',
};

/**
 * Verifică dacă jucătorul are suficiente credite premium
 */
export const checkPremiumCredits = async (playerId: number, cost: number): Promise<{ hasCredits: boolean; currentCredits: number }> => {
  try {
    const player = await db.query('players', { _row_id: `eq.${playerId}` });
    if (player.length === 0) return { hasCredits: false, currentCredits: 0 };
    
    const currentCredits = player[0].premium_credits || 0;
    return {
      hasCredits: currentCredits >= cost,
      currentCredits
    };
  } catch (error) {
    console.error('Error checking premium credits:', error);
    return { hasCredits: false, currentCredits: 0 };
  }
};

/**
 * Procesează o achiziție premium (temporar - test mode)
 */
export const processPremiumPurchase = async (
  playerId: number,
  packageType: string,
  cost: number
): Promise<{ success: boolean; message: string; newCredits?: number }> => {
  try {
    // Verifică creditele
    const { hasCredits, currentCredits } = await checkPremiumCredits(playerId, cost);
    
    if (!hasCredits) {
      return {
        success: false,
        message: `Credite insuficiente! Ai ${currentCredits} credite, ai nevoie de ${cost} credite.`
      };
    }

    // Confirmare explicită
    if (PREMIUM_CONFIG.REQUIRE_CONFIRMATION) {
      const confirmation = confirm(
        `${PREMIUM_CONFIG.WARNING_MESSAGE}\n\n` +
        `Ești sigur că vrei să cumperi pachetul "${packageType}" pentru ${cost} credite?\n\n` +
        `Credite curente: ${currentCredits}\n` +
        `Credite după achiziție: ${currentCredits - cost}\n\n` +
        `Această acțiune va fi loggată și nu poate fi anulată.`
      );
      
      if (!confirmation) {
        return { success: false, message: 'Achiziție anulată.' };
      }
    }

    // Procesează achiziția
    const newCredits = currentCredits - cost;
    await db.update('players', { _row_id: `eq.${playerId}` }, { premium_credits: newCredits });

    // Loghează achiziția
    if (PREMIUM_CONFIG.LOG_ALL_PURCHASES) {
      await db.insert('premium_purchases_log', {
        player_id: playerId,
        package_type: packageType,
        cost: cost,
        credits_before: currentCredits,
        credits_after: newCredits,
        test_mode: true,
        timestamp: Math.floor(Date.now() / 1000),
      });
    }

    return {
      success: true,
      message: `Achiziție reușită! Ai rămas cu ${newCredits} credite.`,
      newCredits
    };
  } catch (error) {
    console.error('Error processing premium purchase:', error);
    return { success: false, message: 'Eroare la procesarea achiziției.' };
  }
};

/**
 * Acordă credite premium (doar admini)
 */
export const grantPremiumCredits = async (
  adminPlayerId: number,
  targetPlayerId: number,
  amount: number,
  reason: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Verifică dacă requester-ul este admin
    const adminPlayer = await db.query('players', { _row_id: `eq.${adminPlayerId}` });
    if (adminPlayer.length === 0 || adminPlayer[0].level < 20) {
      return { success: false, message: 'Nu ai permisiunea să acorzi credite premium.' };
    }

    // Confirmare admin
    const confirmation = confirm(
      `⚠️ ADMIN ACTION - Grant Premium Credits\n\n` +
      `Vrei să acorzi ${amount} credite premium jucătorului #${targetPlayerId}?\n\n` +
      `Motiv: ${reason}\n\n` +
      `Această acțiune va fi loggată.`
    );
    
    if (!confirmation) {
      return { success: false, message: 'Acțiune anulată.' };
    }

    // Acordă creditele
    const targetPlayer = await db.query('players', { _row_id: `eq.${targetPlayerId}` });
    if (targetPlayer.length === 0) {
      return { success: false, message: 'Jucătorul nu există.' };
    }

    const currentCredits = targetPlayer[0].premium_credits || 0;
    const newCredits = currentCredits + amount;
    
    await db.update('players', { _row_id: `eq.${targetPlayerId}` }, { premium_credits: newCredits });

    // Loghează acțiunea admin
    await db.insert('admin_logs', {
      admin_id: adminPlayerId,
      action_type: 'grant_premium_credits',
      target_type: 'player',
      target_id: targetPlayerId,
      details: `Acordat ${amount} credite premium. Motiv: ${reason}`,
      severity: 'info',
    });

    return {
      success: true,
      message: `Ai acordat ${amount} credite premium jucătorului #${targetPlayerId}.`
    };
  } catch (error) {
    console.error('Error granting premium credits:', error);
    return { success: false, message: 'Eroare la acordarea creditelor.' };
  }
};

/**
 * Obține log-ul achizițiilor premium
 */
export const getPremiumPurchaseLog = async (playerId?: number): Promise<any[]> => {
  try {
    let query = 'premium_purchases_log';
    let filters = {};
    
    if (playerId) {
      filters = { player_id: `eq.${playerId}` };
    }
    
    return await db.query(query, filters);
  } catch (error) {
    console.error('Error getting premium purchase log:', error);
    return [];
  }
};

/**
 * Verifică statusul premium al jucătorului
 */
export const checkPremiumStatus = async (playerId: number): Promise<{
  isPremium: boolean;
  vipLevel: number;
  vipExpires: number;
  premiumCredits: number;
}> => {
  try {
    const player = await db.query('players', { _row_id: `eq.${playerId}` });
    if (player.length === 0) {
      return { isPremium: false, vipLevel: 0, vipExpires: 0, premiumCredits: 0 };
    }

    const p = player[0];
    const now = Math.floor(Date.now() / 1000);
    
    return {
      isPremium: p.vip_status === 1 && p.vip_expires > now,
      vipLevel: p.vip_level || 0,
      vipExpires: p.vip_expires || 0,
      premiumCredits: p.premium_credits || 0,
    };
  } catch (error) {
    console.error('Error checking premium status:', error);
    // Returnăm valori default în caz de eroare
    return { isPremium: false, vipLevel: 0, vipExpires: 0, premiumCredits: 0 };
  }
};

/**
 * Afișează avertismente premium
 */
export const showPremiumWarning = () => {
  if (PREMIUM_CONFIG.TEST_MODE) {
    console.warn(`
    ╔════════════════════════════════════════════════════════════╗
    ║  ⚠️  PREMIUM SYSTEM - TEST MODE                           ║
    ║  - Achizițiile sunt doar pentru testare                    ║
    ║  - Toate acțiunile sunt loggate                            ║
    ║  - Creditele sunt acordate doar de admini                  ║
    ║  - Nu există plăți reale momentan                         ║
    ╚════════════════════════════════════════════════════════════╝
    `);
  }
};
