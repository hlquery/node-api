/**
 * hlquery Node.js Client - Analytics API
 *
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 *
 * This file is part of hlquery, released under the BSD License version 3.
 */

const Validator = require('../utils/Validator');

class Analytics {
    constructor(request) {
        this.request = request;
    }

    async click(payload) {
        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            throw new Error('Analytics click payload must be an object');
        }

        Validator.validateCollectionName(payload.collection);

        const documentId = payload.doc_id !== undefined ? payload.doc_id : payload.document_id;
        Validator.validateDocumentId(documentId);

        return await this.request.execute('POST', '/analytics/click', payload);
    }
}

module.exports = Analytics;
