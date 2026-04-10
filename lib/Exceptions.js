/**
 * hlquery Node.js Client - Exceptions
 * 
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 * 
 * This file is part of hlquery, released under the BSD License version 3.
 */

/**
 * Base exception class for hlquery client
 */
class HlqueryException extends Error {
    constructor(message) {
        super(message);
        this.name = 'HlqueryException';
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Exception thrown when authentication fails
 */
class AuthenticationException extends HlqueryException {
    constructor(message) {
        super(message);
        this.name = 'AuthenticationException';
    }
}

/**
 * Exception thrown when a request fails
 */
class RequestException extends HlqueryException {
    constructor(message, statusCode = 0, responseBody = null) {
        super(message);
        this.name = 'RequestException';
        this.statusCode = statusCode;
        this.responseBody = responseBody;
    }
}

/**
 * Exception thrown when validation fails
 */
class ValidationException extends HlqueryException {
    constructor(message) {
        super(message);
        this.name = 'ValidationException';
    }
}

/**
 * Exception thrown when a collection operation fails
 */
class CollectionException extends HlqueryException {
    constructor(message) {
        super(message);
        this.name = 'CollectionException';
    }
}

/**
 * Exception thrown when a document operation fails
 */
class DocumentException extends HlqueryException {
    constructor(message) {
        super(message);
        this.name = 'DocumentException';
    }
}

/**
 * Exception thrown when a search operation fails
 */
class SearchException extends HlqueryException {
    constructor(message) {
        super(message);
        this.name = 'SearchException';
    }
}

/**
 * Exception thrown when demo mode is enabled and write operations are blocked
 */
class DemoModeException extends HlqueryException {
    constructor(message) {
        super(message);
        this.name = 'DemoModeException';
    }
}

module.exports = {
    HlqueryException,
    AuthenticationException,
    RequestException,
    ValidationException,
    CollectionException,
    DocumentException,
    SearchException,
    DemoModeException
};
