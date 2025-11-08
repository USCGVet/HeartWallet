/**
 * tests/unit/storage.test.js
 *
 * Unit tests for storage wrapper functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  save,
  load,
  remove,
  clear,
  getAllKeys
} from '../../src/core/storage.js';

describe('storage.js', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Reset the mock storage
    const mockStorage = {};
    chrome.storage.local.get.mockImplementation((keys) => {
      if (keys === null) {
        return Promise.resolve({ ...mockStorage });
      }
      if (typeof keys === 'string') {
        return Promise.resolve({ [keys]: mockStorage[keys] });
      }
      return Promise.resolve({});
    });

    chrome.storage.local.set.mockImplementation((items) => {
      Object.assign(mockStorage, items);
      return Promise.resolve();
    });

    chrome.storage.local.remove.mockImplementation((keys) => {
      if (Array.isArray(keys)) {
        keys.forEach(key => delete mockStorage[key]);
      } else {
        delete mockStorage[keys];
      }
      return Promise.resolve();
    });

    chrome.storage.local.clear.mockImplementation(() => {
      Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
      return Promise.resolve();
    });
  });

  describe('save', () => {
    it('should save data to storage', async () => {
      await save('testKey', 'testValue');

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        testKey: 'testValue'
      });
    });

    it('should save objects to storage', async () => {
      const testObj = { foo: 'bar', num: 42 };
      await save('testObj', testObj);

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        testObj: testObj
      });
    });

    it('should handle errors when saving', async () => {
      chrome.storage.local.set.mockRejectedValueOnce(new Error('Storage error'));

      await expect(save('testKey', 'testValue')).rejects.toThrow('Failed to save data');
    });
  });

  describe('load', () => {
    it('should load data from storage', async () => {
      // Setup: save data first
      await save('testKey', 'testValue');

      // Test: load the data
      const result = await load('testKey');

      expect(result).toBe('testValue');
      expect(chrome.storage.local.get).toHaveBeenCalledWith('testKey');
    });

    it('should return null for non-existent keys', async () => {
      const result = await load('nonExistentKey');

      expect(result).toBeNull();
    });

    it('should load objects from storage', async () => {
      const testObj = { foo: 'bar', num: 42 };
      await save('testObj', testObj);

      const result = await load('testObj');

      expect(result).toEqual(testObj);
    });

    it('should handle errors when loading', async () => {
      chrome.storage.local.get.mockRejectedValueOnce(new Error('Storage error'));

      await expect(load('testKey')).rejects.toThrow('Failed to load data');
    });
  });

  describe('remove', () => {
    it('should remove data from storage', async () => {
      // Setup: save data first
      await save('testKey', 'testValue');

      // Test: remove the data
      await remove('testKey');

      expect(chrome.storage.local.remove).toHaveBeenCalledWith('testKey');

      // Verify it's gone
      const result = await load('testKey');
      expect(result).toBeNull();
    });

    it('should handle errors when removing', async () => {
      chrome.storage.local.remove.mockRejectedValueOnce(new Error('Storage error'));

      await expect(remove('testKey')).rejects.toThrow('Failed to remove data');
    });
  });

  describe('clear', () => {
    it('should clear all storage', async () => {
      // Setup: save multiple items
      await save('key1', 'value1');
      await save('key2', 'value2');
      await save('key3', 'value3');

      // Test: clear all
      await clear();

      expect(chrome.storage.local.clear).toHaveBeenCalled();

      // Verify all are gone
      const result1 = await load('key1');
      const result2 = await load('key2');
      const result3 = await load('key3');

      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(result3).toBeNull();
    });

    it('should handle errors when clearing', async () => {
      chrome.storage.local.clear.mockRejectedValueOnce(new Error('Storage error'));

      await expect(clear()).rejects.toThrow('Failed to clear storage');
    });
  });

  describe('getAllKeys', () => {
    it('should return all storage keys', async () => {
      // Setup: save multiple items
      await save('key1', 'value1');
      await save('key2', 'value2');
      await save('key3', 'value3');

      // Test: get all keys
      const keys = await getAllKeys();

      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
      expect(keys.length).toBe(3);
    });

    it('should return empty array for empty storage', async () => {
      const keys = await getAllKeys();

      expect(keys).toEqual([]);
    });

    it('should handle errors when getting keys', async () => {
      chrome.storage.local.get.mockRejectedValueOnce(new Error('Storage error'));

      await expect(getAllKeys()).rejects.toThrow('Failed to get storage keys');
    });
  });

  describe('integration tests', () => {
    it('should handle save, load, and remove workflow', async () => {
      // Save
      await save('workflow', 'test');
      let result = await load('workflow');
      expect(result).toBe('test');

      // Update
      await save('workflow', 'updated');
      result = await load('workflow');
      expect(result).toBe('updated');

      // Remove
      await remove('workflow');
      result = await load('workflow');
      expect(result).toBeNull();
    });

    it('should handle multiple keys independently', async () => {
      await save('key1', 'value1');
      await save('key2', 'value2');

      expect(await load('key1')).toBe('value1');
      expect(await load('key2')).toBe('value2');

      await remove('key1');

      expect(await load('key1')).toBeNull();
      expect(await load('key2')).toBe('value2');
    });
  });
});
