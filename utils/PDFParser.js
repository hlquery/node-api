/**
 * hlquery Node.js Client - Optional PDF parsing helper
 *
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 *
 * This file is part of hlquery, released under the BSD License version 3.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ValidationException } = require('../lib/Exceptions');

class PDFParser {
    /**
     * Parse a PDF file from disk.
     *
     * @param {string} filePath
     * @param {object} options
     * @returns {Promise<object>}
     */
    static async parseFile(filePath, options = {}) {
        this.validateFilePath(filePath);

        const resolvedPath = path.resolve(filePath);
        const stat = fs.statSync(resolvedPath);

        if (!stat.isFile()) {
            throw new ValidationException(`PDF path is not a file: ${resolvedPath}`);
        }

        const pdfParse = this.loadPDFParse();
        const buffer = fs.readFileSync(resolvedPath);
        const parsed = await pdfParse(buffer);
        const metadata = parsed && parsed.metadata && typeof parsed.metadata === 'object'
            ? parsed.metadata
            : {};

        const content = this.normalizeText(parsed && parsed.text ? parsed.text : '', options);
        const title = this.resolveTitle(resolvedPath, metadata, options);
        const fileName = path.basename(resolvedPath);

        return {
            filePath: resolvedPath,
            fileName: fileName,
            title: title,
            content: content,
            pageCount: parsed && typeof parsed.numpages === 'number' ? parsed.numpages : null,
            info: parsed && parsed.info ? parsed.info : {},
            metadata: metadata,
            version: parsed && parsed.version ? parsed.version : null,
            sizeBytes: stat.size
        };
    }

    /**
     * Build a standard hlquery document from parsed PDF data.
     *
     * @param {object} parsed
     * @param {object} options
     * @returns {object}
     */
    static buildDocumentFromParsedPDF(parsed, options = {}) {
        const contentField = options.contentField || 'content';
        const titleField = options.titleField || 'title';
        const document = Object.assign({}, options.document || {});

        document.id = options.id || document.id || this.generateDocumentId(parsed.fileName);
        document[titleField] = options.title || document[titleField] || parsed.title;
        document[contentField] = parsed.content;

        if (options.includeMetadata !== false) {
            document.file_name = parsed.fileName;
            document.file_path = parsed.filePath;
            document.mime_type = 'application/pdf';

            if (parsed.pageCount !== null) {
                document.page_count = String(parsed.pageCount);
            }

            if (parsed.sizeBytes !== null) {
                document.file_size_bytes = String(parsed.sizeBytes);
            }

            this.attachMetadata(document, parsed.info, 'pdf_info', options);
            this.attachMetadata(document, parsed.metadata, 'pdf_meta', options);
        }

        return document;
    }

    static attachMetadata(document, metadata, prefix, options = {}) {
        if (!metadata || typeof metadata !== 'object') {
            return;
        }

        const fieldPrefix = options.metadataPrefix || prefix;

        for (const [key, value] of Object.entries(metadata)) {
            if (value === null || value === undefined) {
                continue;
            }

            const normalizedKey = this.normalizeFieldName(`${fieldPrefix}_${key}`);
            const normalizedValue = this.normalizeMetadataValue(value, options);

            if (normalizedKey && normalizedValue !== '') {
                document[normalizedKey] = normalizedValue;
            }
        }
    }

    static normalizeMetadataValue(value, options = {}) {
        if (typeof value === 'string') {
            return this.normalizeText(value, options);
        }

        if (typeof value === 'number' || typeof value === 'boolean') {
            return String(value);
        }

        return this.normalizeText(JSON.stringify(value), options);
    }

    static normalizeFieldName(name) {
        return String(name)
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9_]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .slice(0, 64);
    }

    static normalizeText(text, options = {}) {
        let output = String(text || '');

        output = output.replace(/\r\n/g, '\n');

        if (options.stripNullBytes !== false) {
            output = output.replace(/\0/g, '');
        }

        if (options.sanitizeCommas !== false) {
            output = output.replace(/,/g, ' ');
        }

        if (options.collapseWhitespace !== false) {
            output = output.replace(/[ \t]+/g, ' ');
            output = output.replace(/\n{3,}/g, '\n\n');
        }

        return output.trim();
    }

    static resolveTitle(filePath, metadata, options = {}) {
        if (options.title) {
            return this.normalizeText(options.title, options);
        }

        if (metadata && typeof metadata.Title === 'string' && metadata.Title.trim() !== '') {
            return this.normalizeText(metadata.Title, options);
        }

        return this.normalizeText(path.basename(filePath, path.extname(filePath)), options);
    }

    static generateDocumentId(fileName) {
        const stem = path.basename(fileName, path.extname(fileName))
            .toLowerCase()
            .replace(/[^a-z0-9._-]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .slice(0, 40);
        const suffix = crypto.randomBytes(4).toString('hex');

        return `${stem || 'pdf'}_${suffix}`;
    }

    static validateFilePath(filePath) {
        if (!filePath || typeof filePath !== 'string') {
            throw new ValidationException('PDF file path must be a non-empty string');
        }
    }

    static loadPDFParse() {
        try {
            return require('pdf-parse');
        } catch (error) {
            throw new ValidationException(
                'PDF parsing requires the optional dependency `pdf-parse`. ' +
                'Install it in etc/api/node with `npm install pdf-parse`.'
            );
        }
    }
}

module.exports = PDFParser;
