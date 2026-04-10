/**
 * hlquery Node.js Client - Ranking Helpers
 */

const DEFAULT_WEIGHTS = {
    popularity_log: 1.15,
    hit_log: 0.95,
    popularity_sqrt: 0.25,
    hit_log_sqrt: 0.15,
};

function computeRankSignal(popularity, hitLog, weights = {}) {
    const w = { ...DEFAULT_WEIGHTS };

    for (const key of Object.keys(weights)) {
        if (Object.prototype.hasOwnProperty.call(w, key) && typeof weights[key] === 'number') {
            w[key] = weights[key];
        }
    }

    return (
        Math.log(popularity + 1) * w.popularity_log
        + Math.log(hitLog + 1) * w.hit_log
        + Math.sqrt(popularity) * w.popularity_sqrt
        + Math.sqrt(hitLog) * w.hit_log_sqrt
    );
}

function attachRankSort(params, field = 'rank_signal', direction = 'desc') {
    if (!params || typeof params !== 'object') {
        return;
    }

    direction = direction.toLowerCase();
    if (direction !== 'asc' && direction !== 'desc') {
        direction = 'desc';
    }

    const sortInstruction = `${field}:${direction}`;

    if (typeof params.sort_by === 'string' && params.sort_by.trim()) {
        params.sort_by = `${params.sort_by},${sortInstruction}`;
    } else {
        params.sort_by = sortInstruction;
    }
}

module.exports = {
    computeRankSignal,
    attachRankSort
};
