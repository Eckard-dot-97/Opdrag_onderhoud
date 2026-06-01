import * as collectionService from '../services/collection.service.js';

export async function list(req, res, next) {
  try {
    const items = await collectionService.listBackpack(req.user.id);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function add(req, res, next) {
  try {
    const { pokemon_id } = req.body;
    if (!pokemon_id) return res.status(400).json({ error: 'pokemon_id is required' });
    await collectionService.addToBackpack(req.user.id, pokemon_id);
    res.status(201).json({ message: 'Added to backpack' });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id is required' });
    await collectionService.removeFromBackpack(req.user.id, id);
    res.json({ message: 'Removed from backpack' });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    next(err);
  }
}
