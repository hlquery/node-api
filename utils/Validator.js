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
        
        // Document IDs should be URL-safe: alphanumeric, underscores, and hyphens only
        if (!/^[a-zA-Z0-9_-]+$/.test(idStr)) {
            throw new ValidationException(
                'Document ID contains invalid characters. ' +
                'Use only letters, numbers, underscores, and hyphens'
            );
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
     * Validate document field values for invalid characters
     * Commas are not allowed in string field values as they're reserved for internal parsing
     * 
     * @param {object} document - Document object to validate
     * @throws {ValidationException} If document contains invalid characters
     */
    static validateDocumentFields(document) {
        if (!document || typeof document !== 'object' || Array.isArray(document)) {
            return; // Skip validation for non-objects or arrays (will be validated per-item)
        }
        
        for (const [key, value] of Object.entries(document)) {
            // Skip the 'id' field as it has its own validation
            if (key === 'id') continue;
            
            // Check string values for commas
            if (typeof value === 'string' && value.includes(',')) {
                throw new ValidationException(
                    `Field '${key}' contains invalid character: comma (,). ` +
                    `Commas are not allowed in field values. Use underscores (_) or spaces instead, or use arrays for multiple values.`
                );
            }
            
            // Check array values - ensure they don't contain strings with commas
            if (Array.isArray(value)) {
                for (const item of value) {
                    if (typeof item === 'string' && item.includes(',')) {
                        throw new ValidationException(
                            `Field '${key}' contains invalid character: comma (,). ` +
                            `Array items cannot contain commas. Use underscores (_) or spaces instead.`
                        );
                    }
                }
            }
        }
    }
}

module.exports = Validator;
