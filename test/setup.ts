// masukan ini di jest-e2e.json jika di gunakan, fungsi menghapus test.sqlite saat testing, tetapi saya menemukan cara baru yaitu menambahkan dropSchema: process.env.NODE_ENV === 'test', di app.module

// tambahkan ini di jest-e2e.json
// "setupFilesAfterEnv": ["<rootDir>/setup.ts"]

import { rm } from 'fs/promises';
import { join } from 'path';
global.beforeEach(async () => {
  try {
    await rm(join(__dirname, '..', 'test.sqlite'));
  } catch (error) {
    console.log('error: ', error);
  }
});
