/**
 * hlquery Node.js Client - Runtime Modules API
 *
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 *
 * This file is part of hlquery, released under the BSD License version 3.
 */

const { ModuleRouteCommand, cleanRoute } = require('./Route');

function requireNonEmptyString(value, label) {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(`${label} must be a non-empty string`);
    }
}

/**
 * Runtime module discovery and dynamic route calls.
 */
class Modules {
    constructor(request) {
        this.request = request;
    }

    list() {
        return this.request.execute('GET', '/modules');
    }

    syntax(name, queryParams = {}) {
        return this.module(name).syntax(queryParams);
    }

    module(name) {
        return new ModuleRouteCommand(this.request, name);
    }

    route(name, route = '') {
        return this.module(name).route(route);
    }

    call(name, route = '', method = 'GET', body = null, queryParams = {}, options = {}) {
        requireNonEmptyString(name, 'Module name');
        requireNonEmptyString(method, 'HTTP method');

        const suffix = cleanRoute(route);
        const path = suffix
            ? `/modules/${encodeURIComponent(name)}/${suffix}`
            : `/modules/${encodeURIComponent(name)}`;

        return this.request.execute(method.toUpperCase(), path, body, queryParams, options);
    }
}

module.exports = Modules;
