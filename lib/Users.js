/**
 * hlquery Node.js Client - Users API
 *
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 *
 * This file is part of hlquery, released under the BSD License version 3.
 */

class Users {
    constructor(request) {
        this.request = request;
    }

    _validateName(name) {
        if (typeof name !== 'string' || name.trim() === '') {
            throw new Error('User name is required');
        }
    }

    async list() {
        return await this.request.execute('GET', '/users');
    }

    async get(name) {
        this._validateName(name);
        return await this.request.execute('GET', `/users/${encodeURIComponent(name)}`);
    }

    async create(params) {
        if (!params || typeof params !== 'object' || Array.isArray(params)) {
            throw new Error('User parameters must be an object');
        }
        this._validateName(params.name);
        return await this.request.execute('POST', '/users', params);
    }

    async update(name, params) {
        this._validateName(name);
        if (!params || typeof params !== 'object' || Array.isArray(params)) {
            throw new Error('User parameters must be an object');
        }
        return await this.request.execute('PUT', `/users/${encodeURIComponent(name)}`, params);
    }

    async delete(name) {
        this._validateName(name);
        return await this.request.execute('DELETE', `/users/${encodeURIComponent(name)}`);
    }
}

module.exports = Users;
