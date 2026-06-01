/**
 * hlquery Node.js Client - Documents API
 * 
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 * 
 * This file is part of hlquery, released under the BSD License version 3.
 */

const Validator = require('../utils/Validator');
const Response = require('./Response');
const PDFParser = require('../utils/PDFParser');
const CSVParser = require('../utils/CSVParser');

/**
 * Documents API operations
 */
class Documents {
    constructor(request) {
        this.request = request;
    }

    _responseFromRequestError(error) {
        if (error && error.response) {
            return error.response;
        }
        throw error;
    }
    
    /**
     * List documents in a collection
     * 
     * @param {string} collectionName
     * @param {object} params Pagination parameters
     * @returns {Promise<Response>}
     */
    async list(collectionName, params = {}) {
        Validator.validateCollectionName(collectionName);
        Validator.validateSearchParams(params);
        
        const offset = params.offset !== undefined ? params.offset : (params.from !== undefined ? params.from : 0);
        const limit = params.limit !== undefined ? params.limit : (params.size !== undefined ? params.size : 10);
        
        return await this.request.execute('GET', `/collections/${encodeURIComponent(collectionName)}/documents`, null, {
            offset: offset,
            limit: limit
        });
    }
    
    /**
     * Get a single document by ID
     * 
     * @param {string} collectionName
     * @param {string} documentId
     * @returns {Promise<Response>}
     */
    async get(collectionName, documentId) {
        Validator.validateCollectionName(collectionName);
        Validator.validateDocumentId(documentId);
        
        return await this.request.execute('GET', `/collections/${encodeURIComponent(collectionName)}/documents/${encodeURIComponent(documentId)}`);
    }

    /**
     * Get alternate contextual phrases for a document.
     *
     * @param {string} collectionName
     * @param {string} documentId
     * @returns {Promise<Response>}
     */
    async context(collectionName, documentId) {
        Validator.validateCollectionName(collectionName);
        Validator.validateDocumentId(documentId);

        return await this.request.execute('GET', `/collections/${encodeURIComponent(collectionName)}/documents/${encodeURIComponent(documentId)}/context`);
    }
    
    /**
     * Add a document
     * 
     * @param {string} collectionName
     * @param {object} document
     * @returns {Promise<Response>}
     */
    async add(collectionName, document) {
        Validator.validateCollectionName(collectionName);
        Validator.validateDocumentFields(document);
        
        return await this.request.execute('POST', `/collections/${encodeURIComponent(collectionName)}/documents`, document);
    }

    /**
     * Parse a local PDF file into normalized text/metadata.
     *
     * @param {string} filePath
     * @param {object} options
     * @returns {Promise<object>}
     */
    async parsePDF(filePath, options = {}) {
        return await PDFParser.parseFile(filePath, options);
    }

    /**
     * Parse a local PDF and add it as a standard hlquery document.
     *
     * @param {string} collectionName
     * @param {string} filePath
     * @param {object} options
     * @returns {Promise<Response>}
     */
    async addPDF(collectionName, filePath, options = {}) {
        Validator.validateCollectionName(collectionName);

        const parsed = await this.parsePDF(filePath, options);
        const document = PDFParser.buildDocumentFromParsedPDF(parsed, options);

        Validator.validateDocumentFields(document);

        return await this.request.execute('POST', `/collections/${encodeURIComponent(collectionName)}/documents`, document);
    }

    /**
     * Parse a local CSV file into normalized text/metadata.
     *
     * @param {string} filePath
     * @param {object} options
     * @returns {Promise<object>}
     */
    async parseCSV(filePath, options = {}) {
        return CSVParser.parseFile(filePath, options);
    }

    /**
     * Parse a local CSV and add it as a standard hlquery document.
     *
     * @param {string} collectionName
     * @param {string} filePath
     * @param {object} options
     * @returns {Promise<Response>}
     */
    async addCSV(collectionName, filePath, options = {}) {
        Validator.validateCollectionName(collectionName);

        const parsed = await this.parseCSV(filePath, options);
        const document = CSVParser.buildDocumentFromParsedCSV(parsed, options);

        Validator.validateDocumentFields(document);

        return await this.request.execute('POST', `/collections/${encodeURIComponent(collectionName)}/documents`, document);
    }
    
    /**
     * Update a document
     * 
     * @param {string} collectionName
     * @param {string} documentId
     * @param {object} document
     * @returns {Promise<Response>}
     */
    async update(collectionName, documentId, document) {
        Validator.validateCollectionName(collectionName);
        Validator.validateDocumentId(documentId);
        Validator.validateDocumentFields(document);
        
        return await this.request.execute('PUT', `/collections/${encodeURIComponent(collectionName)}/documents/${encodeURIComponent(documentId)}`, document);
    }
    
    /**
     * Delete a document
     * 
     * @param {string} collectionName
     * @param {string} documentId
     * @returns {Promise<Response>}
     */
    async delete(collectionName, documentId) {
        Validator.validateCollectionName(collectionName);
        Validator.validateDocumentId(documentId);
        
        return await this.request.execute('DELETE', `/collections/${encodeURIComponent(collectionName)}/documents/${encodeURIComponent(documentId)}`);
    }
    
    /**
     * Import documents (bulk)
     * 
     * @param {string} collectionName
     * @param {Array} documents
     * @returns {Promise<Response>}
     */
    async import(collectionName, documents) {
        Validator.validateCollectionName(collectionName);
        
        // Validate each document in the array
        if (!Array.isArray(documents)) {
            throw new Error('Documents import payload must be an array');
        }

        for (const doc of documents) {
            Validator.validateDocumentFields(doc);
        }
        
        // Server expects {documents: [...]} format; fall back to per-doc inserts if bulk route is unavailable.
        let bulkResponse;
        try {
            bulkResponse = await this.request.execute('POST', `/collections/${encodeURIComponent(collectionName)}/documents/import`, {
                documents: documents
            });
        } catch (error) {
            bulkResponse = this._responseFromRequestError(error);
        }

        if (bulkResponse && bulkResponse.getStatusCode && bulkResponse.getStatusCode() === 404) {
            let inserted = 0;
            for (const doc of documents) {
                let response;
                try {
                    response = await this.request.execute('POST', `/collections/${encodeURIComponent(collectionName)}/documents`, doc);
                } catch (error) {
                    response = this._responseFromRequestError(error);
                }
                const status = response.getStatusCode();
                if (status !== 201) {
                    return response;
                }
                inserted += 1;
            }

            return new Response(201, { imported: inserted, fallback: true });
        }

        return bulkResponse;
    }

    /**
     * Copy one document to a new ID within the same collection.
     *
     * @param {string} collectionName
     * @param {string} sourceId
     * @param {string} targetId
     * @returns {Promise<Response>}
     */
    async copy(collectionName, sourceId, targetId) {
        Validator.validateCollectionName(collectionName);
        Validator.validateDocumentId(sourceId);
        Validator.validateDocumentId(targetId);

        if (sourceId === targetId) {
            throw new Error('Source and target document ids must differ');
        }

        let targetCheck;
        try {
            targetCheck = await this.get(collectionName, targetId);
        } catch (error) {
            targetCheck = this._responseFromRequestError(error);
        }
        if (targetCheck.getStatusCode() === 200) {
            return targetCheck;
        }
        if (targetCheck.getStatusCode() !== 404) {
            return targetCheck;
        }

        let sourceResponse;
        try {
            sourceResponse = await this.get(collectionName, sourceId);
        } catch (error) {
            sourceResponse = this._responseFromRequestError(error);
        }
        if (sourceResponse.getStatusCode() !== 200) {
            return sourceResponse;
        }

        const doc = { ...sourceResponse.getBody(), id: targetId };
        delete doc.collection_id;
        delete doc.score;

        const imported = await this.import(collectionName, [doc]);
        return imported;
    }

    /**
     * Convenience helper to fetch most-recent documents (by timestamp desc).
     *
     * @param {string} collectionName
     * @param {number} limit
     * @param {number} offset
     * @returns {Promise<Response>}
     */
    async recent(collectionName, limit = 20, offset = 0) {
        Validator.validateCollectionName(collectionName);
        Validator.validatePagination(offset, limit);

        const sql = `select * from ${collectionName} order by timestamp desc limit ${limit} offset ${offset}`;
        return await this.request.execute(
            'GET',
            `/collections/${encodeURIComponent(collectionName)}/documents/search`,
            null,
            { sql }
        );
    }

    /**
     * Compute facet counts for a collection.
     *
     * @param {string} collectionName
     * @param {object} params
     * @returns {Promise<Response>}
     */
    async facetCounts(collectionName, params = {}) {
        Validator.validateCollectionName(collectionName);
        Validator.validateSearchParams(params);

        const method = params.body ? 'POST' : 'GET';
        const body = params.body || (method === 'POST' ? params : null);
        const queryParams = method === 'GET' ? params : {};

        return await this.request.execute(
            method,
            `/collections/${encodeURIComponent(collectionName)}/documents/facet_counts`,
            body,
            queryParams
        );
    }

    /**
     * Export documents from a collection.
     *
     * @param {string} collectionName
     * @param {object} params
     * @returns {Promise<Response>}
     */
    async export(collectionName, params = {}) {
        Validator.validateCollectionName(collectionName);
        Validator.validateSearchParams(params);

        const method = params.body ? 'POST' : 'GET';
        const body = params.body || (method === 'POST' ? params : null);
        const queryParams = method === 'GET' ? params : {};

        return await this.request.execute(
            method,
            `/collections/${encodeURIComponent(collectionName)}/documents/export`,
            body,
            queryParams
        );
    }

    /**
     * Request query suggestions for a collection.
     *
     * @param {string} collectionName
     * @param {object} params
     * @returns {Promise<Response>}
     */
    async maybe(collectionName, params = {}) {
        Validator.validateCollectionName(collectionName);
        Validator.validateSearchParams(params);

        const method = params.body ? 'POST' : 'GET';
        const body = params.body || (method === 'POST' ? params : null);
        const queryParams = method === 'GET' ? params : {};

        return await this.request.execute(
            method,
            `/collections/${encodeURIComponent(collectionName)}/documents/maybe`,
            body,
            queryParams
        );
    }

    /**
     * Update documents matching a query.
     *
     * @param {string} collectionName
     * @param {object} body
     * @returns {Promise<Response>}
     */
    async updateByQuery(collectionName, body = {}) {
        Validator.validateCollectionName(collectionName);
        Validator.validateDocumentFields(body);

        return await this.request.execute('POST', `/collections/${encodeURIComponent(collectionName)}/documents/_update_by_query`, body);
    }

    /**
     * Delete documents matching a query.
     *
     * @param {string} collectionName
     * @param {object} body
     * @returns {Promise<Response>}
     */
    async deleteByQuery(collectionName, body = {}) {
        Validator.validateCollectionName(collectionName);
        Validator.validateDocumentFields(body);

        return await this.request.execute('POST', `/collections/${encodeURIComponent(collectionName)}/documents/_delete_by_query`, body);
    }
    
    /**
     * Delete documents by filter
     * 
     * @param {string} collectionName
     * @param {string} filter
     * @returns {Promise<Response>}
     */
    async deleteByFilter(collectionName, filter) {
        Validator.validateCollectionName(collectionName);
        
        return await this.request.execute('DELETE', `/collections/${encodeURIComponent(collectionName)}/documents`, null, {
            filter_by: filter
        });
    }
}

module.exports = Documents;
