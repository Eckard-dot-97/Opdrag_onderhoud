import * as collectionService from '../services/collection.service.js';

export async function list(req, res, next) {
  try {
    const items = await collectionService.listTeam(req.user.id);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function moveFromBackpack(req, res, next) {
  try {
    const { pokemon_id } = req.body;
    if (!pokemon_id) return res.status(400).json({ error: 'pokemon_id is required' });
    const result = await collectionService.moveFromBackpackToTeam(req.user.id, pokemon_id);
    res.status(201).json({ message: 'Moved to team', ...result });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    next(err);
  }
}

export async function moveToBackpack(req, res, next) {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id is required' });
    await collectionService.moveFromTeamToBackpack(req.user.id, id);
    res.json({ message: 'Moved to backpack' });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    next(err);
  }
}

export async function removeFromTeam(req, res, next) {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id is required' });
    await collectionService.removeFromTeam(req.user.id, id);
    res.json({ message: 'Removed from team' });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    next(err);
  }
}
