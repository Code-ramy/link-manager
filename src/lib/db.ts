import Dexie, { type EntityTable } from 'dexie';
import type { WebApp, Category } from './types';

class LinkManagerDatabase extends Dexie {
  apps!: EntityTable<WebApp, 'id'>;
  categories!: EntityTable<Category, 'id'>;

  constructor() {
    super('LinkManagerDatabase');
    this.version(1).stores({
      apps: 'id, categoryId, order', // This will be migrated
      categories: 'id, order',
    });

    this.version(2).stores({
        apps: 'id, categoryId, globalOrder, categoryOrder',
        categories: 'id, order'
    }).upgrade(async tx => {
        // Migration logic
        const appsToMigrate = await tx.table('apps').toArray();
        const updatedApps = appsToMigrate.map(app => {
            const categoryId = app.categoryId;
            const order = app.order;
            const newApp = {
                ...app,
                globalOrder: order,
                categoryOrder: { [categoryId]: order }
            };
            delete newApp.order; // remove old property
            return newApp;
        });
        await tx.table('apps').clear();
        await tx.table('apps').bulkAdd(updatedApps);
    });
  }
}

export const db = new LinkManagerDatabase();
