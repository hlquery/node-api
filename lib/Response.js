/**
 * hlquery Node.js Client - Response Handler
 * 
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 * 
 * This file is part of hlquery, released under the BSD License version 3.
 */

/**
 * Response wrapper for API responses
 */
class Response {
    constructor(statusCode, body, headers = {}, options = {}) {
        this.statusCode = statusCode;
        this.body = body;
        this.headers = headers;
        this.statusMessage = options.statusMessage || '';
        this.rawBody = options.rawBody || null;
        this.request = options.request || null;
        this.contentType = headers['content-type'] || headers['Content-Type'] || null;
        this.parsed = options.parsed !== undefined ? options.parsed : true;
    }
    
    getStatusCode() {
        return this.statusCode;
    }
    
    getBody() {
        return this.body;
    }
    
    getHeaders() {
        return this.headers;
    }

    getStatusMessage() {
        return this.statusMessage;
    }

    getRawBody() {
        return this.rawBody;
    }

    getRequest() {
        return this.request;
    }

    getContentType() {
        return this.contentType;
    }

    isParsed() {
        return this.parsed;
    }
    
    isSuccess() {
        return this.statusCode >= 200 && this.statusCode < 300;
    }
    
    isError() {
        return this.statusCode >= 400;
    }
    
    getError() {
        if (this.isError() && typeof this.body === 'object' && this.body !== null) {
            return this.body.error || this.body.message || 'Unknown error';
        }
        return null;
    }
    
    toArray() {
        return {
            status: this.statusCode,
            body: this.body,
            headers: this.headers
        };
    }
}

module.exports = Response;
