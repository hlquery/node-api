/**
 * hlquery Node.js Client - HTTP Request Handler
 * 
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 * 
 * This file is part of hlquery, released under the BSD License version 3.
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const { RequestException, AuthenticationException, DemoModeException } = require('./Exceptions');
const Response = require('./Response');

/**
 * HTTP request handler
 */
class Request {
    constructor(baseUrl, timeout = 30000, authToken = null, authMethod = 'bearer') {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.timeout = timeout;
        this.authToken = authToken;
        this.authMethod = authMethod;
    }
    
    setAuthToken(token, method = 'bearer') {
        this.authToken = token;
        this.authMethod = method;
    }
    
    clearAuth() {
        this.authToken = null;
    }
    
    /**
     * Make HTTP request
     * 
     * @param {string} method HTTP method
     * @param {string} path API path
     * @param {object|string|null} body Request body
     * @param {object} queryParams Query parameters
     * @returns {Promise<Response>}
     * @throws {RequestException}
     */
    async execute(method, path, body = null, queryParams = {}) {
        const url = new URL(this.baseUrl + path);
        
        // Add query parameters
        Object.keys(queryParams).forEach(key => {
            const value = queryParams[key];
            if (value === undefined || value === null) {
                return;
            }

            if (Array.isArray(value)) {
                url.searchParams.append(key, value.join(','));
                return;
            }

            if (typeof value === 'object') {
                url.searchParams.append(key, JSON.stringify(value));
                return;
            }

            url.searchParams.append(key, value);
        });
        
        const headers = {
            'Accept': 'application/json'
        };
        
        // Prepare body string if present
        let bodyStr = null;
        if (body !== null && body !== undefined) {
            bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
            headers['Content-Type'] = 'application/json';
            headers['Content-Length'] = Buffer.byteLength(bodyStr);
        }
        
        // Add authentication header if token is set
        if (this.authToken !== null) {
            if (this.authMethod === 'api-key') {
                headers['X-API-Key'] = this.authToken;
            } else {
                headers['Authorization'] = `Bearer ${this.authToken}`;
            }
        }
        
        const options = {
            method: method,
            headers: headers,
            timeout: this.timeout
        };
        
        const client = url.protocol === 'https:' ? https : http;
        
        return new Promise((resolve, reject) => {
            const req = client.request(url, options, (res) => {
                const responseHeaders = {};
                Object.keys(res.headers).forEach(key => {
                    responseHeaders[key.toLowerCase()] = res.headers[key];
                });
                
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    let decoded;
                    try {
                        decoded = data ? JSON.parse(data) : null;
                    } catch (e) {
                        // If JSON parsing fails, return raw response
                        decoded = data;
                    }
                    
                    // Check for demo mode errors
                    if (res.statusCode === 403 && decoded && typeof decoded === 'object') {
                        const errorMsg = decoded.error || decoded.message || '';
                        if (errorMsg.includes('Demo mode is enabled') || 
                            errorMsg.includes('Operation not allowed') ||
                            errorMsg.includes('Write operations are not allowed')) {
                            return reject(new DemoModeException(
                                `Demo mode is enabled on the server. Write operations are blocked. Only search and read operations are permitted. Server message: ${decoded.message || decoded.error}`
                            ));
                        }
                        // Check if server rejected token because auth is disabled
                        if (errorMsg.includes('Authentication is disabled') || 
                            errorMsg.includes('Tokens are not accepted when authentication is disabled')) {
                            return reject(new AuthenticationException(
                                `Authentication is disabled on the server. Remove the token from your client configuration. Server message: ${decoded.message || decoded.error}`
                            ));
                        }
                    }
                    
                    resolve(new Response(res.statusCode, decoded, responseHeaders));
                });
            });
            
            req.on('error', (error) => {
                reject(new RequestException(`Request failed: ${error.message}`, 0));
            });
            
            req.on('timeout', () => {
                req.destroy();
                reject(new RequestException('Request timeout', 0));
            });
            
            if (bodyStr !== null) {
                req.write(bodyStr);
            }
            
            req.end();
        });
    }
}

module.exports = Request;
