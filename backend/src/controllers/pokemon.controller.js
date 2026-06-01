import * as pokeapiService from '../services/pokeapi.service.js';

export async function search(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'Query parameter q is required' });
    const results = await pokeapiService.searchPokemon(q);
    res.json(results);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const pokemon = await pokeapiService.getPokemonByPokeapiId(req.params.pokeapiId);
    if (!pokemon) return res.status(404).json({ error: 'Pokémon not found' });
    res.json(pokemon);
  } catch (err) {
    next(err);
  }
}

export async function getEvolutionChain(req, res, next) {
  try {
    const chain = await pokeapiService.getEvolutionChain(
      req.params.pokeapiId,
      req.user.id
    );
    res.json(chain);
  } catch (err) {
    next(err);
  }
}
