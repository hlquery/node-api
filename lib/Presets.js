/**
 * hlquery Node.js Client - Search presets API
 */

const { requireNonEmptyString } = require('./Route');

class Presets {
    constructor(request) {
        this.request = request;
    }

    async list() {
        return await this.request.execute('GET', '/presets');
    }

    async get(name) {
        requireNonEmptyString(name, 'Preset name');
        return await this.request.execute('GET', `/presets/${encodeURIComponent(name)}`);
    }

    async create(name, preset) {
        requireNonEmptyString(name, 'Preset name');
        return await this.request.execute('POST', `/presets/${encodeURIComponent(name)}`, preset);
    }

    async update(name, preset) {
        requireNonEmptyString(name, 'Preset name');
        return await this.request.execute('PUT', `/presets/${encodeURIComponent(name)}`, preset);
    }

    async upsert(name, preset) {
        return await this.update(name, preset);
    }

    async delete(name) {
        requireNonEmptyString(name, 'Preset name');
        return await this.request.execute('DELETE', `/presets/${encodeURIComponent(name)}`);
    }
}

module.exports = Presets;
