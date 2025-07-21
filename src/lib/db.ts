import Dexie, { type EntityTable } from 'dexie';
import type { WebApp, Category } from './types';

class LinkManagerDatabase extends Dexie {
  apps!: EntityTable<WebApp, 'id'>;
  categories!: EntityTable<Category, 'id'>;

  constructor() {
    super('LinkManagerDatabase');
    this.version(1).stores({
      apps: 'id, categoryId, order',
      categories: 'id, order',
    });
  }
}

export const db = new LinkManagerDatabase();
