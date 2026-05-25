/**
 * hlquery Node.js Client - Fluent Route API
 *
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 *
 * This file is part of hlquery, released under the BSD License version 3.
 */

function requireNonEmptyString(value, label) {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(`${label} must be a non-empty string`);
    }
}

function cleanRoute(route) {
    if (route === null || route === undefined) {
        return '';
    }

    if (Array.isArray(route)) {
        return route
            .map(segment => {
                requireNonEmptyString(String(segment), 'Route segment');
                return encodeURIComponent(String(segment).replace(/^\/+|\/+$/g, ''));
            })
            .filter(Boolean)
            .join('/');
    }

    return String(route).replace(/^\/+|\/+$/g, '');
}

function joinPath(basePath, route) {
    const base = String(basePath || '').replace(/\/+$/g, '');
    const suffix = cleanRoute(route);

    if (!suffix) {
        return base || '/';
    }

    if (!base || base === '/') {
        return `/${suffix}`;
    }

    return `${base}/${suffix}`;
}

/**
 * Small Redis-style command builder for dynamic hlquery routes.
 */
class RouteCommand {
    constructor(request, path) {
        this.request = request;
        this.path = path || '/';
    }

    route(route) {
        return new RouteCommand(this.request, joinPath(this.path, route));
    }

    async call(method, body = null, queryParams = {}, options = {}) {
        requireNonEmptyString(method, 'HTTP method');
        return await this.request.execute(method.toUpperCase(), this.path, body, queryParams, options);
    }

    async get(queryParams = {}, options = {}) {
        return await this.call('GET', null, queryParams, options);
    }

    async post(body = null, queryParams = {}, options = {}) {
        return await this.call('POST', body, queryParams, options);
    }

    async put(body = null, queryParams = {}, options = {}) {
        return await this.call('PUT', body, queryParams, options);
    }

    async patch(body = null, queryParams = {}, options = {}) {
        return await this.call('PATCH', body, queryParams, options);
    }

    async delete(queryParams = {}, options = {}) {
        return await this.call('DELETE', null, queryParams, options);
    }

    async del(queryParams = {}, options = {}) {
        return await this.delete(queryParams, options);
    }
}

/**
 * Fluent command builder rooted at /modules/{name}.
 */
class ModuleRouteCommand extends RouteCommand {
    constructor(request, name) {
        requireNonEmptyString(name, 'Module name');
        super(request, `/modules/${encodeURIComponent(name)}`);
        this.name = name;
    }

    async syntax(queryParams = {}, options = {}) {
        return await this.route('syntax').get(queryParams, options);
    }
}

module.exports = {
    RouteCommand,
    ModuleRouteCommand,
    cleanRoute,
    joinPath
};
