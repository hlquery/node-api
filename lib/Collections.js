/**
 * hlquery Node.js Client - Collections API
 * 
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 * 
 * This file is part of hlquery, released under the BSD License version 3.
 */

const Validator = require('../utils/Validator');
const Response = require('./Response');

/**
 * Collections API operations
 */
class Collections {
    constructor(request) {
        this.request = request;
    }
    
    /**
     * List all collections
     * 
     * @param {number} offset Pagination offset
     * @param {number} limit Number of results
     * @returns {Promise<Response>}
     */
    async list(offset = 0, limit = 10) {
        Validator.validatePagination(offset, limit);
        return await this.request.execute('GET', '/collections', null, {
            offset: offset,
            limit: limit
        });
    }
    
    /**
     * Get collection details
     * 
     * @param {string} name Collection name
     * @returns {Promise<Response>}
     */
    async get(name) {
        Validator.validateCollectionName(name);
        return await this.request.execute('GET', `/collections/${encodeURIComponent(name)}`);
    }

    /**
     * Get detected collection language information.
     *
     * @param {string} name Collection name
     * @returns {Promise<Response>}
     */
    async language(name) {
        Validator.validateCollectionName(name);
        return await this.request.execute('GET', `/collections/${encodeURIComponent(name)}/lang`);
    }
    
    /**
     * Create a new collection
     * 
     * @param {string} name Collection name
     * @param {object} schema Collection schema
     * @returns {Promise<Response>}
     */
    async create(name, schema) {
        Validator.validateCollectionName(name);
        if (schema && schema.name !== undefined && schema.name !== name) {
            throw new Error('Schema name must match the collection name argument');
        }

        // Merge schema with name at top level (server expects fields/searchable_fields at root)
        const requestBody = {
            ...schema,
            name: name
        };
        return await this.request.execute('POST', '/collections', requestBody);
    }
    
    /**
     * Delete a collection
     * 
     * @param {string} name Collection name
     * @returns {Promise<Response>}
     */
    async delete(name) {
        Validator.validateCollectionName(name);
        return await this.request.execute('DELETE', `/collections/${encodeURIComponent(name)}`);
    }
    
    /**
     * Update collection schema
     * 
     * @param {string} name Collection name
     * @param {object} schema Updated schema
     * @returns {Promise<Response>}
     */
    async update(name, schema) {
        Validator.validateCollectionName(name);
        return await this.request.execute('POST', `/collections/${encodeURIComponent(name)}/update`, schema);
    }
    
    /**
     * Get collection fields (formatted)
     * 
     * @param {string} name Collection name
     * @returns {Promise<Response>}
     */
    async getFields(name) {
        const response = await this.get(name);
        
        if (response.getStatusCode() !== 200) {
            return response;
        }
        
        const body = response.getBody();
        const allFields = [];
        const fieldTypes = {};

        if (Array.isArray(body.fields)) {
            for (const field of body.fields) {
                const fieldName = typeof field === 'string' ? field : field.name;
                if (!fieldName) {
                    continue;
                }
                if (!allFields.includes(fieldName)) {
                    allFields.push(fieldName);
                }
                if (!fieldTypes[fieldName]) {
                    fieldTypes[fieldName] = [];
                }
                if (field.type && !fieldTypes[fieldName].includes(field.type)) {
                    fieldTypes[fieldName].push(field.type);
                }
            }
        }
        
        // Collect searchable fields
        if (body.searchable_fields) {
            for (const field of body.searchable_fields) {
                if (!allFields.includes(field)) {
                    allFields.push(field);
                }
                if (!fieldTypes[field]) {
                    fieldTypes[field] = [];
                }
                fieldTypes[field].push('searchable');
            }
        }
        
        // Collect filterable fields
        if (body.filterable_fields) {
            for (const field of body.filterable_fields) {
                if (!allFields.includes(field)) {
                    allFields.push(field);
                }
                if (!fieldTypes[field]) {
                    fieldTypes[field] = [];
                }
                fieldTypes[field].push('filterable');
            }
        }
        
        // Collect sortable fields
        if (body.sortable_fields) {
            for (const field of body.sortable_fields) {
                if (!allFields.includes(field)) {
                    allFields.push(field);
                }
                if (!fieldTypes[field]) {
                    fieldTypes[field] = [];
                }
                fieldTypes[field].push('sortable');
            }
        }
        
        // Format fields
        const fields = allFields.map(field => ({
            name: field,
            type: fieldTypes[field].join(', ') || 'unknown'
        }));
        
        return new Response(200, {
            collection: name,
            fields: fields,
            field_count: fields.length,
            searchable_fields: body.searchable_fields || [],
            filterable_fields: body.filterable_fields || [],
            sortable_fields: body.sortable_fields || []
        });
    }
}

module.exports = Collections;
