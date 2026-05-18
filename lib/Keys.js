/**
 * hlquery Node.js Client - API Keys
 * 
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 * 
 * This file is part of hlquery, released under the BSD License version 3.
 */

const Validator = require('../utils/Validator');

/**
 * API Keys management operations
 */
class Keys {
    constructor(request) {
        this.request = request;
    }
    
    /**
     * List all API keys
     * 
     * @returns {Promise<Response>}
     */
    async list() {
        return await this.request.execute('GET', '/keys');
    }
    
    /**
     * Get API key details
     * 
     * @param {string} id Key ID
     * @returns {Promise<Response>}
     */
    async get(id) {
        if (!id) {
            throw new Error('Key ID is required');
        }
        return await this.request.execute('GET', `/keys/${encodeURIComponent(id)}`);
    }
    
    /**
     * Create a new API key
     * 
     * @param {object} params Key parameters
     * @returns {Promise<Response>}
     */
    async create(params) {
        if (!params.collections || !Array.isArray(params.collections)) {
            throw new Error('Collections array is required');
        }
        if (!params.actions || !Array.isArray(params.actions)) {
            throw new Error('Actions array is required');
        }
        return await this.request.execute('POST', '/keys', params);
    }
    
    /**
     * Delete an API key
     * 
     * @param {string} id Key ID
     * @returns {Promise<Response>}
     */
    async delete(id) {
        if (!id) {
            throw new Error('Key ID is required');
        }
        return await this.request.execute('DELETE', `/keys/${encodeURIComponent(id)}`);
    }
    
    /**
     * Update an API key
     * 
     * @param {string} id Key ID
     * @param {object} params Updated parameters
     * @returns {Promise<Response>}
     */
    async update(id, params) {
        if (!id) {
            throw new Error('Key ID is required');
        }
        return await this.request.execute('PUT', `/keys/${encodeURIComponent(id)}`, params);
    }
}

module.exports = Keys;
