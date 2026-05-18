/**
 * hlquery Node.js Client - SAM API
 *
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 *
 * This file is part of hlquery, released under the BSD License version 3.
 */

const Validator = require('../utils/Validator');

/**
 * SAM API operations
 */
class SAM {
    constructor(request) {
        this.request = request;
    }

    _validateParams(params, label) {
        if (params === null || typeof params !== 'object' || Array.isArray(params)) {
            throw new Error(`${label} must be an object`);
        }
    }

    async search(collectionName, query, params = {}) {
        if (typeof query !== 'string' || query.trim() === '') {
            throw new Error('SAM query must be a non-empty string');
        }

        this._validateParams(params, 'SAM search params');

        const queryParams = {
            ...params,
            q: query
        };

        if (collectionName !== null && collectionName !== undefined && collectionName !== '') {
            Validator.validateCollectionName(collectionName);
            queryParams.collection = collectionName;
        } else if (!queryParams.all && !queryParams.collections) {
            throw new Error('Collection name is required unless all=true or collections is provided');
        }

        return await this.request.execute('GET', '/sam/search', null, queryParams);
    }

    async searchAll(query, params = {}) {
        this._validateParams(params, 'SAM search params');
        return await this.search(null, query, { ...params, all: true });
    }

    async rebuild(collectionName, params = {}) {
        Validator.validateCollectionName(collectionName);
        this._validateParams(params, 'SAM rebuild params');

        return await this.request.execute('POST', '/sam/rebuild', null, {
            ...params,
            collection: collectionName
        });
    }

    async status(collectionName = null, params = {}) {
        this._validateParams(params, 'SAM status params');

        const queryParams = { ...params };

        if (collectionName !== null && collectionName !== undefined && collectionName !== '') {
            Validator.validateCollectionName(collectionName);
            queryParams.collection = collectionName;
        }

        return await this.request.execute('GET', '/sam/status', null, queryParams);
    }

    async debug(collectionName = null, params = {}) {
        this._validateParams(params, 'SAM debug params');

        const queryParams = { ...params };

        if (collectionName !== null && collectionName !== undefined && collectionName !== '') {
            Validator.validateCollectionName(collectionName);
            queryParams.collection = collectionName;
        }

        return await this.request.execute('GET', '/sam/debug', null, queryParams);
    }

    async history(collectionName = null, limit = 100, params = {}) {
        this._validateParams(params, 'SAM history params');
        const safeLimit = Number(limit);
        if (!Number.isInteger(safeLimit) || safeLimit < 1) {
            throw new Error('SAM history limit must be a positive integer');
        }

        const queryParams = {
            ...params,
            limit: safeLimit
        };

        if (collectionName !== null && collectionName !== undefined && collectionName !== '') {
            Validator.validateCollectionName(collectionName);
            queryParams.collection = collectionName;
        }

        return await this.request.execute('GET', '/sam/history', null, queryParams);
    }

    async pause(pauseUntilMs, params = {}) {
        this._validateParams(params, 'SAM pause params');

        const pause = Number(pauseUntilMs);
        if (!Number.isFinite(pause) || pause < 0) {
            throw new Error('SAM pause value must be a non-negative unix millisecond timestamp, or 0 to clear');
        }

        return await this.request.execute('POST', '/sam/pause', null, {
            ...params,
            pause
        });
    }

    async clearPause(params = {}) {
        return await this.pause(0, params);
    }

    async listDocuments(collectionName, offset = 0, limit = 20, params = {}) {
        Validator.validateCollectionName(collectionName);
        this._validateParams(params, 'SAM document list params');
        const safeOffset = Number(offset);
        const safeLimit = Number(limit);

        if (!Number.isInteger(safeOffset) || safeOffset < 0) {
            throw new Error('SAM document offset must be a non-negative integer');
        }
        if (!Number.isInteger(safeLimit) || safeLimit < 1) {
            throw new Error('SAM document limit must be a positive integer');
        }

        return await this.request.execute('GET', '/sam/documents', null, {
            ...params,
            collection: collectionName,
            offset: safeOffset,
            limit: safeLimit
        });
    }

    async getDocument(collectionName, documentId, params = {}) {
        Validator.validateCollectionName(collectionName);
        Validator.validateDocumentId(documentId);
        this._validateParams(params, 'SAM document params');

        return await this.request.execute(
            'GET',
            `/sam/documents/${encodeURIComponent(collectionName)}/${encodeURIComponent(documentId)}`,
            null,
            params
        );
    }

    async openDocument(collectionName, documentId, interactionQuery = null, params = {}) {
        const queryParams = { ...params };

        if (interactionQuery !== null && interactionQuery !== undefined && interactionQuery !== '') {
            if (typeof interactionQuery !== 'string') {
                throw new Error('SAM interaction query must be a string');
            }
            queryParams.interaction_query = interactionQuery;
        }

        return await this.getDocument(collectionName, documentId, queryParams);
    }
}

module.exports = SAM;
