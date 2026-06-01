import { createPool } from '../config/database.js';

const pool = createPool();

// ── Backpack ──────────────────────────────────────────────────────────────────

export async function listBackpack(userId) {
  const [rows] = await pool.execute(
    `SELECT p.* FROM backpack b
     JOIN pokemon p ON p.id = b.pokemon_id
     WHERE b.user_id = ?
     ORDER BY b.added_at DESC`,
    [userId]
  );
  return rows;
}

export async function addToBackpack(userId, pokemonId) {
  const [inTeam] = await pool.execute(
    'SELECT id FROM team WHERE user_id = ? AND pokemon_id = ?',
    [userId, pokemonId]
  );
  if (inTeam.length > 0)
    throw Object.assign(new Error('Pokémon is already in your team'), { statusCode: 409 });

  try {
    await pool.execute(
      'INSERT INTO backpack (user_id, pokemon_id) VALUES (?, ?)',
      [userId, pokemonId]
    );
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      throw Object.assign(new Error('Pokémon already in backpack'), { statusCode: 409 });
    throw err;
  }
}

export async function removeFromBackpack(userId, pokemonId) {
  const [result] = await pool.execute(
    'DELETE FROM backpack WHERE user_id = ? AND pokemon_id = ?',
    [userId, pokemonId]
  );
  if (result.affectedRows === 0)
    throw Object.assign(new Error('Not found in backpack'), { statusCode: 404 });
}

// ── Team ──────────────────────────────────────────────────────────────────────

export async function listTeam(userId) {
  const [rows] = await pool.execute(
    `SELECT p.*, t.slot FROM team t
     JOIN pokemon p ON p.id = t.pokemon_id
     WHERE t.user_id = ?
     ORDER BY t.slot ASC`,
    [userId]
  );
  return rows;
}

export async function moveFromBackpackToTeam(userId, pokemonId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [teamRows] = await conn.execute(
      'SELECT COUNT(*) AS count FROM team WHERE user_id = ?',
      [userId]
    );
    if (teamRows[0].count >= 6)
      throw Object.assign(new Error('Team is full (max 6)'), { statusCode: 409 });

    const [inBackpack] = await conn.execute(
      'SELECT id FROM backpack WHERE user_id = ? AND pokemon_id = ?',
      [userId, pokemonId]
    );
    if (inBackpack.length === 0)
      throw Object.assign(new Error('Pokémon is not in your backpack'), { statusCode: 403 });

    const [slots] = await conn.execute(
      'SELECT slot FROM team WHERE user_id = ? ORDER BY slot',
      [userId]
    );
    const used = new Set(slots.map(r => r.slot));
    let nextSlot = 1;
    while (used.has(nextSlot)) nextSlot++;

    await conn.execute(
      'DELETE FROM backpack WHERE user_id = ? AND pokemon_id = ?',
      [userId, pokemonId]
    );
    await conn.execute(
      'INSERT INTO team (user_id, pokemon_id, slot) VALUES (?, ?, ?)',
      [userId, pokemonId, nextSlot]
    );

    await conn.commit();
    return { slot: nextSlot };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function moveFromTeamToBackpack(userId, pokemonId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      'DELETE FROM team WHERE user_id = ? AND pokemon_id = ?',
      [userId, pokemonId]
    );
    if (result.affectedRows === 0)
      throw Object.assign(new Error('Not found in team'), { statusCode: 404 });

    await conn.execute(
      'INSERT INTO backpack (user_id, pokemon_id) VALUES (?, ?)',
      [userId, pokemonId]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function removeFromTeam(userId, pokemonId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      'DELETE FROM team WHERE user_id = ? AND pokemon_id = ?',
      [userId, pokemonId]
    );
    if (result.affectedRows === 0)
      throw Object.assign(new Error('Not found in team'), { statusCode: 404 });

    await conn.execute(
      'INSERT INTO backpack (user_id, pokemon_id) VALUES (?, ?)',
      [userId, pokemonId]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
