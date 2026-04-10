/**
 * hlquery Node.js Client - Authentication Utilities
 * 
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 * 
 * This file is part of hlquery, released under the BSD License version 3.
 */

const crypto = require('crypto');

/**
 * Authentication utilities
 */
class Auth {
    /**
     * Generate MD5 hash for a token (utility function for token generation)
     * Note: Authentication only requires a token - no username/password needed
     */
    static generateToken(token) {
        return crypto.createHash('md5').update(token).digest('hex');
    }
    
    /**
     * Validate token format
     */
    static validateToken(token) {
        if (!token || typeof token !== 'string' || token.trim() === '') {
            throw new Error('Token must be a non-empty string');
        }
        return true;
    }
}

module.exports = Auth;
