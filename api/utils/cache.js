// API utility functions for caching
// File: /api/utils/cache.js

import config from './config.js';

// Simple in-memory cache
const cache = {
    data: {},
    timestamps: {}
};

// Function to get data from cache
function getFromCache(key, ttl = config.cache.defaultTTL) {
    const timestamp = cache.timestamps[key];

    // Check if data exists and is not expired
    if (timestamp && Date.now() - timestamp < ttl) {
        return cache.data[key];
    }

    return null;
}

// Function to set data in cache
function setInCache(key, data) {
    cache.data[key] = data;
    cache.timestamps[key] = Date.now();
}

// Function to clear cache
function clearCache() {
    cache.data = {};
    cache.timestamps = {};
}

// Function to clear specific key from cache
function clearCacheKey(key) {
    delete cache.data[key];
    delete cache.timestamps[key];
}

export {
    getFromCache,
    setInCache,
    clearCache,
    clearCacheKey
};
