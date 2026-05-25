/**
 * hlquery Node.js Client - Input Validation
 * 
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 * 
 * This file is part of hlquery, released under the BSD License version 3.
 */

const { ValidationException } = require('../lib/Exceptions');

/**
 * Input validation utilities
 */
class Validator {
    /**
     * Validate collection name
     */
    static validateCollectionName(name) {
        if (!name || typeof name !== 'string' || name.trim() === '') {
            throw new ValidationException('Collection name must be a non-empty string');
        }
        
        // Check name length (matches server validation: 1-64 characters)
        if (name.length > 64) {
            throw new ValidationException('Collection name must be between 1 and 64 characters');
        }
        
        // Collection names should be URL-safe
        if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
            throw new ValidationException(
                'Collection name contains invalid characters. ' +
                'Use only letters, numbers, underscores, and hyphens'
            );
        }
        
        // Check if name starts with letter or underscore (matches server validation)
        const firstChar = name[0];
        if (!/[a-zA-Z]/.test(firstChar) && firstChar !== '_') {
            throw new ValidationException('Collection name must start with a letter or underscore');
        }
    }
    
    /**
     * Validate document ID
     */
    static validateDocumentId(id) {
        if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
            throw new ValidationException('Document ID must be a non-empty string or number');
        }
        
        // Convert to string for validation
        const idStr = String(id);
        
        // Check name length (matches server validation: 1-64 characters)
        if (idStr.length > 64) {
            throw new ValidationException('Document ID must be between 1 and 64 characters');
        }
        
        if (idStr.trim() === '') {
            throw new ValidationException('Document ID must be a non-empty string or number');
        }

        if (/[\x00-\x1F\x7F]/.test(idStr)) {
            throw new ValidationException('Document ID contains control characters');
        }
    }
    
    /**
     * Validate pagination parameters
     */
    static validatePagination(offset, limit) {
        if (offset !== undefined && (!Number.isInteger(offset) || offset < 0)) {
            throw new ValidationException('Offset must be a non-negative integer');
        }
        if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) {
            throw new ValidationException('Limit must be a positive integer');
        }
    }
    
    /**
     * Validate search parameters
     */
    static validateSearchParams(params = {}) {
        if (params === null || typeof params !== 'object' || Array.isArray(params)) {
            throw new ValidationException('Search parameters must be an object');
        }
        
        if (params.offset !== undefined && (!Number.isInteger(params.offset) || params.offset < 0)) {
            throw new ValidationException('Offset must be a non-negative integer');
        }
        if (params.limit !== undefined && (!Number.isInteger(params.limit) || params.limit < 1)) {
            throw new ValidationException('Limit must be a positive integer');
        }
        if (params.from !== undefined && (!Number.isInteger(params.from) || params.from < 0)) {
            throw new ValidationException('From must be a non-negative integer');
        }
        if (params.size !== undefined && (!Number.isInteger(params.size) || params.size < 1)) {
            throw new ValidationException('Size must be a positive integer');
        }
    }
    
    /**
     * Validate document field values.
     * 
     * @param {object} document - Document object to validate
     * @throws {ValidationException} If document contains invalid characters
     */
    static validateDocumentFields(document) {
        if (!document || typeof document !== 'object' || Array.isArray(document)) {
            return; // Skip validation for non-objects or arrays (will be validated per-item)
        }
        
        for (const key of Object.keys(document)) {
            if (key === '') {
                throw new ValidationException('Document field names must be non-empty strings');
            }
            if (/[\x00-\x1F\x7F]/.test(key)) {
                throw new ValidationException(`Field '${key}' contains control characters`);
            }
        }
    }
}

module.exports = Validator;
