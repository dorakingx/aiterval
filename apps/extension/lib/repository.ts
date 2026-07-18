import { browser } from "wxt/browser";
import { StorageRepository, type KeyValueStore } from "@aiterval/core";

const store: KeyValueStore = {
  async get(key) {
    return (await browser.storage.local.get(key))[key];
  },
  async set(key, value) {
    await browser.storage.local.set({ [key]: value });
  },
  async remove(key) {
    await browser.storage.local.remove(key);
  },
};
export const repository = new StorageRepository(store);
