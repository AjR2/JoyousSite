// API utility functions for caching
// File: /api/utils/cache.js

// Simple in-memory cache
const cache = {
    data: {},
    timestamps: {}
};

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Function to get data from cache
function getFromCache(key) {
    const timestamp = cache.timestamps[key];

    // Check if data exists and is not expired
    if (timestamp && Date.now() - timestamp < CACHE_EXPIRATION) {
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

module.exports = {
    getFromCache,
    setInCache,
    clearCache,
    clearCacheKey
};
