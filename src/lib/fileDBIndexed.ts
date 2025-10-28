// fileDBIndexed utility for storing files locally in the browser
const DB_NAME = 'JobApplicationsDB';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

export interface StoredDocument {
  id: string;
  applicationId: string;
  type: 'resume' | 'coverLetter';
  fileName: string;
  fileSize: number;
  fileType: string;
  lastModified: number;
  blob: Blob;
}

class IndexedDBService {
  private db: IDBDatabase | null = null;

  async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('applicationId', 'applicationId', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  async saveDocument(file: File, applicationId: string, type: 'resume' | 'coverLetter'): Promise<StoredDocument> {
    const db = await this.initDB();
    const id = `${applicationId}-${type}`;

    const document: StoredDocument = {
      id,
      applicationId,
      type,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      lastModified: file.lastModified,
      blob: file,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(document);

      request.onsuccess = () => resolve(document);
      request.onerror = () => reject(request.error);
    });
  }

  async getDocument(applicationId: string, type: 'resume' | 'coverLetter'): Promise<StoredDocument | null> {
    const db = await this.initDB();
    const id = `${applicationId}-${type}`;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getApplicationDocuments(applicationId: string): Promise<StoredDocument[]> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('applicationId');
      const request = index.getAll(applicationId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteDocument(applicationId: string, type: 'resume' | 'coverLetter'): Promise<void> {
    const db = await this.initDB();
    const id = `${applicationId}-${type}`;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteApplicationDocuments(applicationId: string): Promise<void> {
    const documents = await this.getApplicationDocuments(applicationId);
    const deletePromises = documents.map(doc => 
      this.deleteDocument(applicationId, doc.type)
    );
    await Promise.all(deletePromises);
  }
}

export const indexedDBService = new IndexedDBService();

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};