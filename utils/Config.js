/**
 * hlquery Node.js Client - Configuration Utilities
 * 
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 * 
 * This file is part of hlquery, released under the BSD License version 3.
 */

/**
 * Configuration management utilities
 */
class Config {
    static getDefaultBaseUrl() {
        return process.env.HLQ_BASE_URL || process.env.HLQUERY_BASE_URL || 'http://localhost:9200';
    }

    /**
     * Merge options with defaults
     */
    static mergeDefaults(options = {}) {
        return {
            base_url: options.base_url || Config.getDefaultBaseUrl(),
            timeout: options.timeout || 30000,
            token: options.token || null,
            auth_method: options.auth_method || 'bearer',
            ...options
        };
    }
    
    /**
     * Normalize URL
     */
    static normalizeUrl(url) {
        if (!url) {
            return Config.getDefaultBaseUrl();
        }
        url = url.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'http://' + url;
        }
        return url.replace(/\/$/, '');
    }
    
    /**
     * Validate URL
     */
    static isValidUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch (e) {
            return false;
        }
    }
}

module.exports = Config;
