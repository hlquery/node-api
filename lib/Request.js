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
    constructor(baseUrl, timeout = 30000, authToken = null, authMethod = 'bearer', options = {}) {
        if (timeout && typeof timeout === 'object') {
            options = timeout;
            timeout = options.timeout || 30000;
            authToken = options.token || null;
            authMethod = options.auth_method || options.authMethod || 'bearer';
        }

        this.baseUrl = baseUrl.replace(/\/+$/, '');
        this.timeout = timeout;
        this.authToken = authToken;
        this.authMethod = authMethod;
        this.agent = options.agent || null;
        this.httpAgent = options.http_agent || options.httpAgent || null;
        this.httpsAgent = options.https_agent || options.httpsAgent || null;
        this.defaultHeaders = options.headers || {};
        this.maxResponseBytes = options.max_response_bytes || options.maxResponseBytes || 0;
        this.throwOnError = Boolean(options.throw_on_error || options.throwOnError);
        this.queryArrayFormat = options.query_array_format || options.queryArrayFormat || 'comma';
        this.signal = options.signal || null;
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
    async execute(method, path, body = null, queryParams = {}, requestOptions = {}) {
        const baseUrl = new URL(`${this.baseUrl}/`);
        const url = new URL(path, baseUrl);
        if (url.origin !== baseUrl.origin) {
            throw new RequestException('Request URL must use the configured server origin', 0, null, {
                code: 'CROSS_ORIGIN_REQUEST',
                retryable: false
            });
        }
        const signal = requestOptions.signal || this.signal;
        const maxResponseBytes = requestOptions.max_response_bytes || requestOptions.maxResponseBytes || this.maxResponseBytes;
        const throwOnError = requestOptions.throw_on_error !== undefined
            ? requestOptions.throw_on_error
            : (requestOptions.throwOnError !== undefined ? requestOptions.throwOnError : this.throwOnError);
        const queryArrayFormat = requestOptions.query_array_format || requestOptions.queryArrayFormat || this.queryArrayFormat;

        if (signal && signal.aborted) {
            throw new RequestException('Request aborted', 0, null, {
                code: 'ABORT_ERR',
                retryable: false
            });
        }
        
        // Add query parameters
        Object.keys(queryParams).forEach(key => {
            const value = queryParams[key];
            if (value === undefined || value === null) {
                return;
            }

            if (Array.isArray(value)) {
                if (queryArrayFormat === 'repeat' || queryArrayFormat === 'repeated') {
                    value.forEach(item => url.searchParams.append(key, item));
                } else {
                    url.searchParams.append(key, value.join(','));
                }
                return;
            }

            if (typeof value === 'object') {
                url.searchParams.append(key, JSON.stringify(value));
                return;
            }

            url.searchParams.append(key, value);
        });
        
        const headers = {
            'Accept': 'application/json',
            ...this.defaultHeaders,
            ...(requestOptions.headers || {})
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
            timeout: requestOptions.timeout || this.timeout
        };
        
        const client = url.protocol === 'https:' ? https : http;
        const agent = this.agent || (url.protocol === 'https:' ? this.httpsAgent : this.httpAgent);
        if (agent) {
            options.agent = agent;
        }
        
        return new Promise((resolve, reject) => {
            let settled = false;
            let req = null;
            const rejectOnce = (error) => {
                if (settled) {
                    return;
                }
                settled = true;
                if (signal && abortHandler && typeof signal.removeEventListener === 'function') {
                    signal.removeEventListener('abort', abortHandler);
                } else if (signal && abortHandler && typeof signal.removeListener === 'function') {
                    signal.removeListener('abort', abortHandler);
                }
                reject(error);
            };
            const resolveOnce = (response) => {
                if (settled) {
                    return;
                }
                settled = true;
                if (signal && abortHandler && typeof signal.removeEventListener === 'function') {
                    signal.removeEventListener('abort', abortHandler);
                } else if (signal && abortHandler && typeof signal.removeListener === 'function') {
                    signal.removeListener('abort', abortHandler);
                }
                resolve(response);
            };
            const abortHandler = () => {
                if (req) {
                    req.destroy();
                }
                rejectOnce(new RequestException('Request aborted', 0, null, {
                    code: 'ABORT_ERR',
                    retryable: false
                }));
            };

            if (signal && typeof signal.addEventListener === 'function') {
                signal.addEventListener('abort', abortHandler, { once: true });
            } else if (signal && typeof signal.once === 'function') {
                signal.once('abort', abortHandler);
            }

            req = client.request(url, options, (res) => {
                const responseHeaders = {};
                Object.keys(res.headers).forEach(key => {
                    responseHeaders[key.toLowerCase()] = res.headers[key];
                });
                
                const chunks = [];
                let receivedBytes = 0;
                
                res.on('data', (chunk) => {
                    receivedBytes += chunk.length;
                    if (maxResponseBytes > 0 && receivedBytes > maxResponseBytes) {
                        res.destroy();
                        rejectOnce(new RequestException(
                            `Response exceeded maximum size of ${maxResponseBytes} bytes`,
                            res.statusCode,
                            null,
                            {
                                headers: responseHeaders,
                                retryable: false,
                                code: 'MAX_RESPONSE_BYTES'
                            }
                        ));
                        return;
                    }
                    chunks.push(chunk);
                });
                
                res.on('end', () => {
                    if (settled) {
                        return;
                    }
                    const rawBuffer = Buffer.concat(chunks);
                    const data = rawBuffer.toString('utf8');
                    let decoded;
                    let parsed = true;
                    try {
                        decoded = data ? JSON.parse(data) : null;
                    } catch (e) {
                        // If JSON parsing fails, return raw response
                        decoded = data;
                        parsed = false;
                    }

                    const response = new Response(res.statusCode, decoded, responseHeaders, {
                        statusMessage: res.statusMessage || '',
                        rawBody: rawBuffer,
                        parsed: parsed,
                        request: {
                            method: method,
                            url: url.toString(),
                            path: path
                        }
                    });
                    
                    // Check for demo mode errors
                    if (res.statusCode === 403 && decoded && typeof decoded === 'object') {
                        const errorMsg = decoded.error || decoded.message || '';
                        if (errorMsg.includes('Demo mode is enabled') || 
                            errorMsg.includes('Operation not allowed') ||
                            errorMsg.includes('Write operations are not allowed')) {
                            return rejectOnce(new DemoModeException(
                                `Demo mode is enabled on the server. Write operations are blocked. Only search and read operations are permitted. Server message: ${decoded.message || decoded.error}`
                            ));
                        }
                        // Check if server rejected token because auth is disabled
                        if (errorMsg.includes('Authentication is disabled') || 
                            errorMsg.includes('Tokens are not accepted when authentication is disabled')) {
                            return rejectOnce(new AuthenticationException(
                                `Authentication is disabled on the server. Remove the token from your client configuration. Server message: ${decoded.message || decoded.error}`
                            ));
                        }
                    }

                    if (throwOnError && response.isError()) {
                        const errorMessage = response.getError() ||
                            `${res.statusCode} ${res.statusMessage || 'HTTP error'}`;
                        return rejectOnce(new RequestException(errorMessage, res.statusCode, decoded, {
                            response: response,
                            headers: responseHeaders,
                            rawBody: rawBuffer,
                            retryable: res.statusCode >= 500
                        }));
                    }
                    
                    resolveOnce(response);
                });
            });
            
            req.on('error', (error) => {
                if (settled) {
                    return;
                }
                rejectOnce(new RequestException(`Request failed: ${error.message}`, 0, null, {
                    cause: error,
                    retryable: true,
                    code: error.code || null
                }));
            });
            
            req.on('timeout', () => {
                req.destroy();
                rejectOnce(new RequestException('Request timeout', 0, null, {
                    retryable: true,
                    code: 'ETIMEDOUT'
                }));
            });
            
            if (bodyStr !== null) {
                req.write(bodyStr);
            }
            
            req.end();
        });
    }
}

module.exports = Request;
