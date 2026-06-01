import { createPool } from '../config/database.js';

const pool = createPool();
const BASE = process.env.POKEAPI_BASE_URL || 'https://pokeapi.co/api/v2';

export async function searchPokemon(query) {
  // Check local cache first
  const [cached] = await pool.execute(
    'SELECT * FROM pokemon WHERE name LIKE ?',
    [`%${query.toLowerCase()}%`]
  );
  if (cached.length > 0) return cached;

  // Fetch exact match from PokeAPI
  const res = await fetch(`${BASE}/pokemon/${query.toLowerCase()}`);
  if (!res.ok) return [];

  const data = await res.json();
  const pokemon = normalisePokemon(data);
  await upsertPokemon(pokemon);

  const [rows] = await pool.execute(
    'SELECT * FROM pokemon WHERE pokeapi_id = ?',
    [pokemon.pokeapi_id]
  );
  return rows;
}

export async function getPokemonByPokeapiId(pokeapiId) {
  const [rows] = await pool.execute(
    'SELECT * FROM pokemon WHERE pokeapi_id = ?',
    [pokeapiId]
  );
  if (rows[0]) return rows[0];

  const res = await fetch(`${BASE}/pokemon/${pokeapiId}`);
  if (!res.ok) return null;

  const data = await res.json();
  const pokemon = normalisePokemon(data);
  await upsertPokemon(pokemon);

  const [fresh] = await pool.execute(
    'SELECT * FROM pokemon WHERE pokeapi_id = ?',
    [pokeapiId]
  );
  return fresh[0] || null;
}

export async function getEvolutionChain(pokeapiId, userId) {
  // Fetch species
  const speciesRes = await fetch(`${BASE}/pokemon-species/${pokeapiId}`);
  if (!speciesRes.ok) return [];
  const species = await speciesRes.json();

  // Fetch evolution chain
  const chainRes = await fetch(species.evolution_chain.url);
  if (!chainRes.ok) return [];
  const chainData = await chainRes.json();

  // Flatten chain into names
  const names = [];
  let node = chainData.chain;
  while (node) {
    names.push(node.species.name);
    node = node.evolves_to[0] || null;
  }

  // Check which ones the user owns
  const [owned] = await pool.execute(
    `SELECT p.name FROM pokemon p
     LEFT JOIN backpack b ON b.pokemon_id = p.id AND b.user_id = ?
     LEFT JOIN team t     ON t.pokemon_id = p.id AND t.user_id = ?
     WHERE p.name IN (${names.map(() => '?').join(',')})
       AND (b.id IS NOT NULL OR t.id IS NOT NULL)`,
    [userId, userId, ...names]
  );
  const ownedNames = new Set(owned.map(o => o.name));

  return names.map(name => ({ name, owned: ownedNames.has(name) }));
}

function normalisePokemon(data) {
  return {
    pokeapi_id: data.id,
    name: data.name,
    sprite_url: data.sprites.front_default,
    types: JSON.stringify(data.types.map(t => t.type.name)),
    stats: JSON.stringify(
      Object.fromEntries(data.stats.map(s => [s.stat.name, s.base_stat]))
    ),
  };
}

async function upsertPokemon(p) {
  await pool.execute(
    `INSERT INTO pokemon (pokeapi_id, name, sprite_url, types, stats)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       sprite_url = VALUES(sprite_url),
       types      = VALUES(types),
       stats      = VALUES(stats)`,
    [p.pokeapi_id, p.name, p.sprite_url, p.types, p.stats]
  );
}
