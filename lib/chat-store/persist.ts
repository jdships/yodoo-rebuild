import {
  createStore,
  del,
  delMany,
  get,
  getMany,
  keys,
  setMany,
} from "idb-keyval";

let dbInitPromise: Promise<void> | null = null;
const stores: Record<string, ReturnType<typeof createStore> | undefined> = {};

const isClient = typeof window !== "undefined";
const DB_NAME = "yodoo-db";
const DB_VERSION = 2;

let storesReady = false;
let storesReadyResolve: () => void = () => {
  // Empty function for initialization
};
const storesReadyPromise = new Promise<void>((resolve) => {
  storesReadyResolve = resolve;
});

function initDatabase() {
  if (!isClient) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("chats")) {
        db.createObjectStore("chats");
      }
      if (!db.objectStoreNames.contains("messages")) {
        db.createObjectStore("messages");
      }
      if (!db.objectStoreNames.contains("sync")) {
        db.createObjectStore("sync");
      }
    };

    request.onsuccess = () => {
      request.result.close();
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

if (isClient) {
  const checkRequest = indexedDB.open(DB_NAME);

  checkRequest.onsuccess = () => {
    const db = checkRequest.result;
    if (db.version > DB_VERSION) {
      db.close();
      const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
      deleteRequest.onsuccess = () => {
        initDatabaseAndStores();
      };
      deleteRequest.onerror = () => {
        // Database deletion failed, continue with initialization
        initDatabaseAndStores();
      };
    } else {
      db.close();
      initDatabaseAndStores();
    }
  };

  checkRequest.onerror = () => {
    initDatabaseAndStores();
  };
}

function createStoresFromObjectStores(objectStores: string[]): void {
  if (objectStores.includes("chats")) {
    stores.chats = createStore(DB_NAME, "chats");
  }
  if (objectStores.includes("messages")) {
    stores.messages = createStore(DB_NAME, "messages");
  }
  if (objectStores.includes("sync")) {
    stores.sync = createStore(DB_NAME, "sync");
  }
}

function handleDatabaseRecreation(): void {
  const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
  deleteRequest.onsuccess = () => {
    dbInitPromise = initDatabase();
    dbInitPromise.then(() => {
      const reopenRequest = indexedDB.open(DB_NAME);
      reopenRequest.onsuccess = () => {
        const newObjectStores = Array.from(
          reopenRequest.result.objectStoreNames
        );
        createStoresFromObjectStores(newObjectStores);
        storesReady = true;
        storesReadyResolve();
        reopenRequest.result.close();
      };
      reopenRequest.onerror = () => {
        storesReady = true;
        storesReadyResolve();
      };
    });
  };
}

function initDatabaseAndStores(): void {
  dbInitPromise = initDatabase();

  dbInitPromise
    .then(() => {
      const openRequest = indexedDB.open(DB_NAME);

      openRequest.onsuccess = () => {
        const objectStores = Array.from(openRequest.result.objectStoreNames);

        if (objectStores.length === 0) {
          openRequest.result.close();
          handleDatabaseRecreation();
          return;
        }

        createStoresFromObjectStores(objectStores);
        storesReady = true;
        storesReadyResolve();
        openRequest.result.close();
      };

      openRequest.onerror = () => {
        storesReady = true;
        storesReadyResolve();
      };
    })
    .catch(() => {
      storesReady = true;
      storesReadyResolve();
    });
}

export async function ensureDbReady() {
  if (!isClient) {
    return;
  }
  if (dbInitPromise) {
    await dbInitPromise;
  }
  if (!storesReady) {
    await storesReadyPromise;
  }
}

export async function readFromIndexedDb<T>(
  table: "chats" | "messages" | "sync",
  key?: string
): Promise<T | T[]> {
  await ensureDbReady();

  if (!isClient) {
    return key ? (null as T) : [];
  }

  if (!stores[table]) {
    return key ? (null as T) : [];
  }

  try {
    const store = stores[table];
    if (key) {
      const result = await get<T>(key, store);
      return result as T;
    }

    const allKeys = await keys(store);
    if (allKeys.length > 0) {
      const results = await getMany<T>(allKeys as string[], store);
      return results.filter(Boolean);
    }

    return [];
  } catch {
    return key ? (null as T) : [];
  }
}

export async function writeToIndexedDb<T extends { id: string | number }>(
  table: "chats" | "messages" | "sync",
  data: T | T[]
): Promise<void> {
  await ensureDbReady();

  if (!isClient) {
    return;
  }

  if (!stores[table]) {
    return;
  }

  try {
    const store = stores[table];
    const entries: [IDBValidKey, T][] = Array.isArray(data)
      ? data.map((item) => [item.id, item])
      : [[data.id, data]];

    await setMany(entries, store);
  } catch {
    // Silently handle write errors
  }
}

export async function deleteFromIndexedDb(
  table: "chats" | "messages" | "sync",
  key?: string
): Promise<void> {
  await ensureDbReady();

  if (!isClient) {
    return;
  }

  const store = stores[table];
  if (!store) {
    return;
  }

  try {
    if (key) {
      await del(key, store);
    } else {
      const allKeys = await keys(store);
      await delMany(allKeys as string[], store);
    }
  } catch {
    // Silently handle delete errors
  }
}

export async function clearAllIndexedDbStores() {
  if (!isClient) {
    return;
  }

  await ensureDbReady();
  await deleteFromIndexedDb("chats");
  await deleteFromIndexedDb("messages");
  await deleteFromIndexedDb("sync");
}
