/**
 * hlquery Node.js Client - Search API
 * 
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 * 
 * This file is part of hlquery, released under the BSD License version 3.
 */

const Validator = require('../utils/Validator');

/**
 * Search API operations
 */
class Search {
    constructor(request, collections) {
        this.request = request;
        this.collections = collections;
        this.searchableFieldsCache = new Map();
    }
    
    /**
     * Search documents
     * 
     * @param {string} collectionName
     * @param {object} params Search parameters
     * @returns {Promise<Response>}
     */
    async search(collectionName, params = {}) {
        return await this._searchCollection(collectionName, params, false);
    }

    /**
     * Execute a collection-bound SQL SELECT through the search endpoint.
     *
     * @param {string} collectionName
     * @param {string} sql
     * @param {object} params
     * @returns {Promise<Response>}
     */
    async sql(collectionName, sql, params = {}) {
        Validator.validateCollectionName(collectionName);

        if (typeof sql !== 'string' || sql.trim() === '') {
            throw new Error('SQL query must be a non-empty string');
        }

        if (params === null || typeof params !== 'object' || Array.isArray(params)) {
            throw new Error('SQL params must be an object');
        }

        const queryParams = { ...params, sql };

        return await this.request.execute(
            'GET',
            `/collections/${encodeURIComponent(collectionName)}/documents/search`,
            null,
            queryParams
        );
    }

    /**
     * Search documents through the legacy /documents/search route.
     *
     * @param {string} collectionName
     * @param {object} params
     * @returns {Promise<Response>}
     */
    async searchLegacy(collectionName, params = {}) {
        return await this._searchCollection(collectionName, params, true);
    }

    async _searchCollection(collectionName, params = {}, useLegacyPath = false) {
        Validator.validateCollectionName(collectionName);
        Validator.validateSearchParams(params);
        
        const queryParams = {};
        
        // Handle structured query object (Elasticsearch-like)
        if (params.query) {
            if (params.query.q) {
                queryParams.q = params.query.q;
            }
            if (params.query.query_by) {
                queryParams.query_by = Array.isArray(params.query.query_by)
                    ? params.query.query_by.join(',')
                    : params.query.query_by;
            }
        }
        
        // Direct query parameters
        if (params.q) {
            queryParams.q = params.q;
        }
        
        // Fields to search in
        if (params.query_by) {
            queryParams.query_by = Array.isArray(params.query_by)
                ? params.query_by.join(',')
                : params.query_by;
        } else if (params.q && params.q !== '' && params.auto_detect_query_by !== false) {
            const cacheKey = collectionName;
            if (this.searchableFieldsCache.has(cacheKey)) {
                queryParams.query_by = this.searchableFieldsCache.get(cacheKey);
            } else {
                const collection = await this.collections.get(collectionName);
                if (collection.getStatusCode() === 200) {
                    const body = collection.getBody();
                    if (body.searchable_fields && body.searchable_fields.length > 0) {
                        queryParams.query_by = body.searchable_fields.join(',');
                        this.searchableFieldsCache.set(cacheKey, queryParams.query_by);
                    }
                }
            }
        }
        
        // Pagination
        if (params.from !== undefined) {
            queryParams.offset = params.from;
        } else if (params.offset !== undefined) {
            queryParams.offset = params.offset;
        }
        
        if (params.size !== undefined) {
            queryParams.limit = params.size;
        } else if (params.limit !== undefined) {
            queryParams.limit = params.limit;
        }
        
        // Page-based pagination
        if (params.page !== undefined) {
            queryParams.page = params.page;
        }
        if (params.per_page !== undefined) {
            queryParams.per_page = params.per_page;
        }
        
        // Filter
        if (params.filter_by) {
            queryParams.filter_by = params.filter_by;
        } else if (params.filter) {
            queryParams.filter_by = typeof params.filter === 'object'
                ? JSON.stringify(params.filter)
                : params.filter;
        }
        
        // Sort
        if (params.sort) {
            if (Array.isArray(params.sort)) {
                const sortFields = [];
                for (const sortItem of params.sort) {
                    if (typeof sortItem === 'object') {
                        for (const [field, order] of Object.entries(sortItem)) {
                            sortFields.push(order === 'desc' ? `-${field}` : field);
                        }
                    } else {
                        sortFields.push(sortItem);
                    }
                }
                queryParams.sort_by = sortFields.join(',');
            } else {
                queryParams.sort_by = params.sort;
            }
        } else if (params.sort_by) {
            queryParams.sort_by = Array.isArray(params.sort_by)
                ? params.sort_by.join(',')
                : params.sort_by;
        }
        
        // Facets
        if (params.facet_by) {
            queryParams.facet_by = Array.isArray(params.facet_by)
                ? params.facet_by.join(',')
                : params.facet_by;
        } else if (params.facets) {
            queryParams.facet_by = Array.isArray(params.facets)
                ? params.facets.join(',')
                : params.facets;
        }
        
        // Additional search parameters
        if (params.typo_tolerance !== undefined) {
            queryParams.typo_tolerance = params.typo_tolerance;
        }
        
        if (params.num_typos !== undefined) {
            queryParams.num_typos = params.num_typos;
        }
        
        // Highlighting parameters
        if (params.highlight !== undefined) {
            queryParams.highlight = params.highlight === true || params.highlight === 'true' ? 'true' : 'false';
        }
        
        if (params.highlight_fields !== undefined) {
            queryParams.highlight_fields = Array.isArray(params.highlight_fields)
                ? params.highlight_fields.join(',')
                : params.highlight_fields;
        }
        
        if (params.highlight_full_fields !== undefined) {
            queryParams.highlight_full_fields = Array.isArray(params.highlight_full_fields)
                ? params.highlight_full_fields.join(',')
                : params.highlight_full_fields;
        }
        
        // Determine HTTP method
        const method = params.body ? 'POST' : 'GET';
        const body = params.body || null;
        
        const path = useLegacyPath
            ? `/collections/${encodeURIComponent(collectionName)}/documents/search`
            : `/collections/${encodeURIComponent(collectionName)}/search`;

        return await this.request.execute(method, path, body, queryParams);
    }
    
    /**
     * Multi-search across multiple collections
     * 
     * @param {Array} searches Array of search requests
     * @param {string} method GET or POST
     * @returns {Promise<Response>}
     */
    async multiSearch(searches, method = 'POST') {
        method = String(method).toUpperCase();
        if (method !== 'GET' && method !== 'POST') {
            throw new Error('Multi-search method must be GET or POST');
        }

        return await this.request.execute(method, '/multi_search', { searches: searches });
    }

    /**
     * Global search across collections.
     *
     * @param {object} params
     * @returns {Promise<Response>}
     */
    async globalSearch(params = {}) {
        Validator.validateSearchParams(params);

        const method = params.body ? 'POST' : 'GET';
        const body = params.body || (method === 'POST' ? params : null);
        const queryParams = method === 'GET' ? params : {};

        return await this.request.execute(method, '/search', body, queryParams);
    }
    
    /**
     * Vector search
     * 
     * @param {string} collectionName
     * @param {object} params Vector search parameters:
     *   - vector_query: Array of floats or JSON string
     *   - vectorQuery: Array/object alias for vector_query
     *   - vector: Array of floats or JSON string (alias for vector_query)
     *   - embedding: Array of floats or JSON string (alias for vector_query)
     *   - field_name/field/fieldName: Field name to search in (default: 'embedding')
     *   - limit/topk/top_k/k/per_page: Number of results
     *   - threshold: Similarity threshold (default: 0.0)
     *   - normalize: Normalize vectors (default: true)
     *   - output_fields/outputFields, include_vector/includeVector, include_distance/includeDistance
     *   - radius/max_distance, range_filter/min_distance
     *   - query_params/queryParams/params, filter/filter_by/filterBy
     * @returns {Promise<Response>}
     */
    async vectorSearch(collectionName, params = {}) {
        Validator.validateCollectionName(collectionName);
        
        const queryParams = {};
        let forcePost = false;
        
        // Handle vector query
        if (params.vector_query) {
            queryParams.vector_query = Array.isArray(params.vector_query)
                ? JSON.stringify(params.vector_query)
                : params.vector_query;
        } else if (params.vectorQuery) {
            queryParams.vector_query = Array.isArray(params.vectorQuery) || typeof params.vectorQuery === 'object'
                ? JSON.stringify(params.vectorQuery)
                : params.vectorQuery;
        } else if (params.vector) {
            queryParams.vector_query = Array.isArray(params.vector)
                ? JSON.stringify(params.vector)
                : params.vector;
        } else if (params.embedding) {
            queryParams.vector_query = Array.isArray(params.embedding)
                ? JSON.stringify(params.embedding)
                : params.embedding;
        }
        
        if (params.field_name || params.field || params.fieldName) {
            queryParams.field_name = params.field_name || params.field || params.fieldName;
        }
        
        if (params.limit !== undefined || params.topk !== undefined || params.top_k !== undefined || params.topK !== undefined ||
            params.k !== undefined || params.per_page !== undefined) {
            queryParams.limit = params.limit ?? params.topk ?? params.top_k ?? params.topK ?? params.k ?? params.per_page;
        }
        
        if (params.threshold !== undefined) {
            queryParams.threshold = params.threshold;
        }
        
        if (params.normalize !== undefined) {
            queryParams.normalize = params.normalize ? 'true' : 'false';
        }

        if (params.output_fields !== undefined || params.outputFields !== undefined) {
            const outputFields = params.output_fields ?? params.outputFields;
            queryParams.output_fields = Array.isArray(outputFields)
                ? outputFields.join(',')
                : outputFields;
        }

        if (params.include_vector !== undefined || params.includeVector !== undefined) {
            const includeVector = params.include_vector ?? params.includeVector;
            queryParams.include_vector = includeVector ? 'true' : 'false';
        }

        if (params.include_distance !== undefined || params.includeDistance !== undefined) {
            const includeDistance = params.include_distance ?? params.includeDistance;
            queryParams.include_distance = includeDistance ? 'true' : 'false';
        }

        if (params.filter_by !== undefined) {
            queryParams.filter_by = params.filter_by;
        } else if (params.filterBy !== undefined) {
            queryParams.filter_by = params.filterBy;
        } else if (params.filter !== undefined) {
            queryParams.filter_by = typeof params.filter === 'object'
                ? JSON.stringify(params.filter)
                : params.filter;
        }

        if (params.radius !== undefined) {
            queryParams.radius = params.radius;
        }
        if (params.max_distance !== undefined || params.maxDistance !== undefined) {
            queryParams.max_distance = params.max_distance ?? params.maxDistance;
        }
        if (params.range_filter !== undefined || params.rangeFilter !== undefined) {
            queryParams.range_filter = params.range_filter ?? params.rangeFilter;
        }
        if (params.min_distance !== undefined || params.minDistance !== undefined) {
            queryParams.min_distance = params.min_distance ?? params.minDistance;
        }

        if (params.query_params !== undefined || params.queryParams !== undefined || params.params !== undefined ||
            params.vector_queries !== undefined || params.vectorQueries !== undefined || params.vectorQuery !== undefined) {
            forcePost = true;
        }
        
        const path = `/collections/${encodeURIComponent(collectionName)}/vector_search`;
        const method = params.body || forcePost ? 'POST' : 'GET';
        const body = params.body || (forcePost ? params : null);
        
        return await this.request.execute(method, path, body, queryParams);
    }
}

module.exports = Search;
