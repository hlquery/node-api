/**
 * hlquery Node.js Client - Main Client Class
 * Elasticsearch-like API client for hlquery
 * 
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 * 
 * This file is part of hlquery, released under the BSD License version 3.
 */

const Request = require('./Request');
const Collections = require('./Collections');
const Documents = require('./Documents');
const Search = require('./Search');
const Keys = require('./Keys');
const Aliases = require('./Aliases');
const Overrides = require('./Overrides');
const Synonyms = require('./Synonyms');
const Stopwords = require('./Stopwords');
const System = require('./System');
const Modules = require('./Modules');
const Users = require('./Users');
const Analytics = require('./Analytics');
const { RouteCommand, ModuleRouteCommand } = require('./Route');
const Config = require('../utils/Config');

/**
 * Main hlquery client class
 */
class Client {
    constructor(baseUrl = null, options = {}) {
        const opts = Config.mergeDefaults(options);
        
        baseUrl = baseUrl || opts.base_url;
        baseUrl = Config.normalizeUrl(baseUrl);
        
        if (!Config.isValidUrl(baseUrl)) {
            throw new Error(`Invalid base URL: ${baseUrl}`);
        }
        
        this.request = new Request(
            baseUrl,
            opts.timeout,
            opts.token || null,
            opts.auth_method || 'bearer',
            opts
        );
        
        this._collections = new Collections(this.request);
        this._documents = new Documents(this.request);
        this._search = new Search(this.request, this._collections);
        this._keys = new Keys(this.request);
        this._aliases = new Aliases(this.request);
        this._overrides = new Overrides(this.request);
        this._synonyms = new Synonyms(this.request);
        this._stopwords = new Stopwords(this.request);
        this._system = new System(this.request);
        this._modules = new Modules(this.request);
        this._users = new Users(this.request);
        this._analytics = new Analytics(this.request);
    }
    
    /**
     * Set authentication token
     * 
     * @param {string} token
     * @param {string} method 'bearer' or 'api-key'
     * @returns {this}
     */
    setAuthToken(token, method = 'bearer') {
        this.request.setAuthToken(token, method);
        return this;
    }
    
    /**
     * Clear authentication
     * 
     * @returns {this}
     */
    clearAuth() {
        this.request.clearAuth();
        return this;
    }
    
    // ============================================================================
    // CLUSTER & NODE APIs
    // ============================================================================
    
    /**
     * Health check
     * 
     * @returns {Promise<Response>}
     */
    async health() {
        return await this._system.health();
    }
    
    /**
     * Get server stats
     * 
     * @returns {Promise<Response>}
     */
    async stats() {
        return await this._system.stats();
    }
    
    /**
     * Get protocol codes for API communication
     * Returns HTTP status codes and protocol information
     * 
     * @returns {Promise<Response>}
     */
    async etc() {
        return await this._system.etc();
    }
    
    /**
     * Get server info
     * 
     * @returns {Promise<Response>}
     */
    async info() {
        return await this._system.info();
    }

    /**
     * Get server status.
     *
     * @returns {Promise<Response>}
     */
    async status() {
        return await this._system.status();
    }

    /**
     * Get startup readiness state.
     *
     * @returns {Promise<Response>}
     */
    async startup() {
        return await this._system.startup();
    }

    /**
     * Get boot status readiness alias.
     *
     * @returns {Promise<Response>}
     */
    async bootStatus() {
        return await this._system.bootStatus();
    }

    async ready() {
        return await this._system.ready();
    }

    /**
     * Get metrics.
     *
     * @returns {Promise<Response>}
     */
    async metrics() {
        return await this._system.metrics();
    }

    /**
     * Get JSON metrics alias.
     *
     * @returns {Promise<Response>}
     */
    async metricsJson() {
        return await this._system.metricsJson();
    }

    async metricsHistory() {
        return await this._system.metricsHistory();
    }

    /**
     * Get live connections.
     *
     * @returns {Promise<Response>}
     */
    async connections() {
        return await this._system.connections();
    }

    /**
     * Get RocksDB stats.
     *
     * @returns {Promise<Response>}
     */
    async rocksdb() {
        return await this._system.rocksdb();
    }

    /**
     * Get internal RocksDB stats alias.
     *
     * @returns {Promise<Response>}
     */
    async rocksdbInternal() {
        return await this._system.rocksdbInternal();
    }

    /**
     * Get document count across collections.
     *
     * @returns {Promise<Response>}
     */
    async docTotal() {
        return await this._system.docTotal();
    }

    /**
     * Ping server.
     *
     * @returns {Promise<Response>}
     */
    async ping() {
        return await this._system.ping();
    }

    /**
     * Run integrity checks.
     *
     * @returns {Promise<Response>}
     */
    async integrity() {
        return await this._system.integrity();
    }

    /**
     * Run consistency checks.
     *
     * @returns {Promise<Response>}
     */
    async consistency() {
        return await this._system.consistency();
    }

    /**
     * Run self-check endpoint.
     *
     * @returns {Promise<Response>}
     */
    async selfCheck() {
        return await this._system.selfCheck();
    }

    /**
     * Get storage status.
     *
     * @returns {Promise<Response>}
     */
    async storageStatus() {
        return await this._system.storageStatus();
    }

    async searchConfig() {
        return await this._system.searchConfig();
    }

    async updateCounters(params = {}) {
        return await this._system.updateCounters(params);
    }

    async debugCounters() {
        return await this._system.debugCounters();
    }

    async repair(params = {}) {
        return await this._system.repair(params);
    }

    /**
     * Execute a top-level SQL query through GET /sql.
     *
     * @param {string} sql
     * @param {object} params
     * @returns {Promise<Response>}
     */
    async sql(sql, params = {}) {
        return await this._system.sql(sql, params);
    }

    /**
     * Execute a top-level SQL statement through POST /sql.
     *
     * @param {string} sql
     * @returns {Promise<Response>}
     */
    async execSql(sql) {
        return await this._system.execSql(sql);
    }
    
    /**
     * Get cluster health status
     * 
     * @returns {Promise<Response>}
     */
    async clusterHealth() {
        return await this.request.execute('GET', '/cluster/health');
    }
    
    /**
     * Get cluster statistics
     * 
     * @returns {Promise<Response>}
     */
    async clusterStats() {
        return await this.request.execute('GET', '/cluster/stats');
    }
    
    /**
     * Get list of nodes in the cluster
     * 
     * @returns {Promise<Response>}
     */
    async clusterNodes() {
        return await this.request.execute('GET', '/cluster/nodes');
    }

    /**
     * List configured cluster links
     *
     * @returns {Promise<Response>}
     */
    async links() {
        return await this.request.execute('GET', '/links');
    }

    /**
     * Ping configured cluster links
     *
     * @returns {Promise<Response>}
     */
    async linksPing() {
        return await this.request.execute('GET', '/links/ping');
    }

    /**
     * Add a cluster link (in-memory only)
     *
     * @param {string} endpointOrHost
     * @param {number|null} port
     * @returns {Promise<Response>}
     */
    async linksConnect(endpointOrHost, port = null) {
        const body = (port === null) ? { endpoint: endpointOrHost } : { host: endpointOrHost, port };
        return await this.request.execute('POST', '/links/connect', body);
    }

    /**
     * Remove a cluster link (in-memory only)
     *
     * @param {string} endpointOrHost
     * @param {number|null} port
     * @returns {Promise<Response>}
     */
    async linksDisconnect(endpointOrHost, port = null) {
        const body = (port === null) ? { endpoint: endpointOrHost } : { host: endpointOrHost, port };
        return await this.request.execute('POST', '/links/disconnect', body);
    }
    
    /**
     * Flush all data to disk
     * 
     * @returns {Promise<Response>}
     */
    async flush() {
        return await this.request.execute('POST', '/flush');
    }
    
    // ============================================================================
    // COLLECTIONS API
    // ============================================================================
    
    /**
     * Get collections API instance
     * 
     * @returns {Collections}
     */
    collections() {
        return this._collections;
    }
    
    /**
     * List all collections
     * 
     * @param {number} offset
     * @param {number} limit
     * @returns {Promise<Response>}
     */
    async listCollections(offset = 0, limit = 10) {
        return await this._collections.list(offset, limit);
    }

    /**
     * List collections across all configured nodes
     *
     * @returns {Promise<Response>}
     */
    async listCollectionsDistributed() {
        return await this.request.execute('GET', '/collections/distributed');
    }
    
    /**
     * Get collection details
     * 
     * @param {string} name
     * @returns {Promise<Response>}
     */
    async getCollection(name) {
        return await this._collections.get(name);
    }

    async getCollectionLanguage(name) {
        return await this._collections.language(name);
    }
    
    /**
     * Get collection fields (formatted)
     * 
     * @param {string} name
     * @returns {Promise<Response>}
     */
    async getCollectionFields(name) {
        return await this._collections.getFields(name);
    }

    /**
     * Copy a collection into a new name (schema + documents).
     *
     * @param {string} sourceName
     * @param {string} targetName
     * @param {object} options
     * @returns {Promise<Response>}
     */
    async copyCollection(sourceName, targetName, options = {}) {
        const batchSize = Number.isInteger(options.batch_size) ? options.batch_size
            : (Number.isInteger(options.batchSize) ? options.batchSize : 500);

        const sourceResponse = await this._collections.get(sourceName);
        if (sourceResponse.getStatusCode() !== 200) {
            return sourceResponse;
        }

        const source = sourceResponse.getBody();
        const schema = {};

        if (source && source.fields && typeof source.fields === 'object' && !Array.isArray(source.fields) && Object.keys(source.fields).length > 0) {
            const fieldNames = Object.keys(source.fields).sort();
            schema.fields = fieldNames.map(name => ({ name, type: typeof source.fields[name] === 'string' ? source.fields[name] : 'string' }));
        } else if (source && Array.isArray(source.searchable_fields) && source.searchable_fields.length > 0) {
            schema.searchable_fields = source.searchable_fields;
        } else {
            schema.searchable_fields = ['title', 'content'];
        }

        if (source && Array.isArray(source.filterable_fields)) {
            schema.filterable_fields = source.filterable_fields;
        }
        if (source && Array.isArray(source.sortable_fields)) {
            schema.sortable_fields = source.sortable_fields;
        }

        if (source && source.metadata && typeof source.metadata === 'object' && !Array.isArray(source.metadata)) {
            for (const [key, value] of Object.entries(source.metadata)) {
                if (typeof key === 'string' && key.startsWith('_')) {
                    schema[key] = value;
                }
            }
        }

        const createResponse = await this._collections.create(targetName, schema);
        if (createResponse.getStatusCode() !== 201) {
            return createResponse;
        }

        let offset = 0;

        while (true) {
            const listResponse = await this._documents.list(sourceName, { offset, limit: batchSize });
            if (listResponse.getStatusCode() !== 200) {
                return listResponse;
            }

            const body = listResponse.getBody() || {};
            const documents = Array.isArray(body.documents) ? body.documents : [];
            if (documents.length === 0) {
                break;
            }

            const importResponse = await this._documents.import(targetName, documents);
            if (!importResponse.isSuccess || !importResponse.isSuccess()) {
                return importResponse;
            }

            offset += documents.length;
        }

        return createResponse;
    }
    
    // ============================================================================
    // DOCUMENTS API
    // ============================================================================
    
    /**
     * Get documents API instance
     * 
     * @returns {Documents}
     */
    documents() {
        return this._documents;
    }
    
    /**
     * List documents in a collection
     * 
     * @param {string} collectionName
     * @param {object} params
     * @returns {Promise<Response>}
     */
    async listDocuments(collectionName, params = {}) {
        return await this._documents.list(collectionName, params);
    }
    
    /**
     * Get a document by ID
     * 
     * @param {string} collectionName
     * @param {string} documentId
     * @returns {Promise<Response>}
     */
    async getDocument(collectionName, documentId) {
        return await this._documents.get(collectionName, documentId);
    }

    async getDocumentContext(collectionName, documentId) {
        return await this._documents.context(collectionName, documentId);
    }

    /**
     * Copy a document to a new ID within the same collection.
     *
     * @param {string} collectionName
     * @param {string} sourceId
     * @param {string} targetId
     * @returns {Promise<Response>}
     */
    async copyDocument(collectionName, sourceId, targetId) {
        return await this._documents.copy(collectionName, sourceId, targetId);
    }

    /**
     * Fetch most-recent documents (by timestamp desc).
     *
     * @param {string} collectionName
     * @param {number} limit
     * @param {number} offset
     * @returns {Promise<Response>}
     */
    async recentDocuments(collectionName, limit = 20, offset = 0) {
        return await this._documents.recent(collectionName, limit, offset);
    }

    /**
     * Export documents from a collection.
     *
     * @param {string} collectionName
     * @param {object} params
     * @returns {Promise<Response>}
     */
    async exportDocuments(collectionName, params = {}) {
        return await this._documents.export(collectionName, params);
    }

    /**
     * Compute facet counts for a collection.
     *
     * @param {string} collectionName
     * @param {object} params
     * @returns {Promise<Response>}
     */
    async facetCounts(collectionName, params = {}) {
        return await this._documents.facetCounts(collectionName, params);
    }

    async maybeDocuments(collectionName, params = {}) {
        return await this._documents.maybe(collectionName, params);
    }

    async updateDocumentsByQuery(collectionName, body = {}) {
        return await this._documents.updateByQuery(collectionName, body);
    }

    async deleteDocumentsByQuery(collectionName, body = {}) {
        return await this._documents.deleteByQuery(collectionName, body);
    }
    
    // ============================================================================
    // SEARCH API
    // ============================================================================
    
    /**
     * Get search API instance
     * 
     * @returns {Search}
     */
    searchApi() {
        return this._search;
    }

    /**
     * Get aliases API instance
     *
     * @returns {Aliases}
     */
    aliases() {
        return this._aliases;
    }

    /**
     * Get overrides API instance
     *
     * @returns {Overrides}
     */
    overrides() {
        return this._overrides;
    }

    /**
     * Get synonyms API instance
     *
     * @returns {Synonyms}
     */
    synonyms() {
        return this._synonyms;
    }

    /**
     * Get stopwords API instance
     *
     * @returns {Stopwords}
     */
    stopwords() {
        return this._stopwords;
    }

    /**
     * Get system API instance
     *
     * @returns {System}
     */
    system() {
        return this._system;
    }
    
    /**
     * Get API keys instance
     * 
     * @returns {Keys}
     */
    keys() {
        return this._keys;
    }

    /**
     * Get runtime modules API instance
     *
     * @returns {Modules}
     */
    modules() {
        return this._modules;
    }

    /**
     * Get users API instance.
     *
     * @returns {Users}
     */
    users() {
        return this._users;
    }

    /**
     * Get analytics API instance.
     *
     * @returns {Analytics}
     */
    analytics() {
        return this._analytics;
    }

    async analyticsClick(payload) {
        return await this._analytics.click(payload);
    }

    /**
     * Build a Redis-style dynamic module command.
     *
     * @param {string} name
     * @returns {ModuleRouteCommand}
     */
    module(name) {
        return new ModuleRouteCommand(this.request, name);
    }

    /**
     * Build a Redis-style top-level route command.
     *
     * @param {string|Array<string>} route
     * @returns {RouteCommand}
     */
    route(route) {
        return new RouteCommand(this.request, '/').route(route);
    }
    
    /**
     * Search documents
     * 
     * @param {string} collectionName
     * @param {object} params
     * @returns {Promise<Response>}
     */
    async search(collectionName, params = {}) {
        return await this._search.search(collectionName, params);
    }

    /**
     * Execute a collection-bound SQL SELECT query.
     *
     * @param {string} collectionName
     * @param {string} sql
     * @param {object} params
     * @returns {Promise<Response>}
     */
    async sqlSearch(collectionName, sql, params = {}) {
        return await this._search.sql(collectionName, sql, params);
    }
    
    /**
     * Vector search
     * 
     * @param {string} collectionName
     * @param {object} params
     * @returns {Promise<Response>}
     */
    async vectorSearch(collectionName, params = {}) {
        return await this._search.vectorSearch(collectionName, params);
    }

    /**
     * Global search across collections.
     *
     * @param {object} params
     * @returns {Promise<Response>}
     */
    async globalSearch(params = {}) {
        return await this._search.globalSearch(params);
    }
    
    /**
     * Execute arbitrary HTTP request
     * 
     * @param {string} method HTTP method
     * @param {string} path API path
     * @param {object|string|null} body Request body
     * @param {object} queryParams Query parameters
     * @returns {Promise<Response>}
     */
    async executeRequest(method, path, body = null, queryParams = {}, options = {}) {
        return await this.request.execute(method, path, body, queryParams, options);
    }
    
    // ============================================================================
    // ELASTICSEARCH-LIKE ALIASES
    // ============================================================================
    
    /**
     * Alias for listCollections() - Elasticsearch compatibility
     * 
     * @param {object} params
     * @returns {Promise<Response>}
     */
    async indices(params = {}) {
        return await this.listCollections(
            params.offset || 0,
            params.limit || 10
        );
    }
    
    /**
     * Alias for getCollection() or getDocument() - Elasticsearch compatibility
     * 
     * @param {object} params
     * @returns {Promise<Response>}
     */
    async get(params) {
        if (params.index && params.id) {
            return await this.getDocument(params.index, params.id);
        } else if (params.index) {
            return await this.getCollection(params.index);
        }
        throw new Error('Invalid parameters for get()');
    }
    
    /**
     * Alias for listCollections() - Elasticsearch cat API
     * 
     * @param {string} type
     * @param {object} params
     * @returns {Promise<Response>}
     */
    async cat(type = 'indices', params = {}) {
        if (type === 'indices') {
            return await this.indices(params);
        }
        throw new Error(`Unsupported cat type: ${type}`);
    }
}

module.exports = Client;
