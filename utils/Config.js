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
            agent: options.agent || null,
            http_agent: options.http_agent || null,
            https_agent: options.https_agent || null,
            headers: options.headers || {},
            max_response_bytes: options.max_response_bytes || 0,
            throw_on_error: options.throw_on_error || false,
            query_array_format: options.query_array_format || 'comma',
            signal: options.signal || null,
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
        if (url instanceof URL) {
            url = url.toString();
        }
        if (typeof url !== 'string') {
            url = String(url);
        }
        url = url.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'http://' + url;
        }
        return url.replace(/\/+$/, '');
    }
    
    /**
     * Validate URL
     */
    static isValidUrl(url) {
        try {
            const urlObj = new URL(url);
            return (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') &&
                Boolean(urlObj.hostname);
        } catch (e) {
            return false;
        }
    }
}

module.exports = Config;
