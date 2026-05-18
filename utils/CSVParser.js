/**
 * hlquery Node.js Client - CSV parsing helper
 *
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 *
 * This file is part of hlquery, released under the BSD License version 3.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ValidationException } = require('../lib/Exceptions');

class CSVParser {
    static parseFile(filePath, options = {}) {
        this.validateFilePath(filePath);
        this.validateDelimiter(options.delimiter || ',');

        const resolvedPath = path.resolve(filePath);
        const stat = fs.statSync(resolvedPath);

        if (!stat.isFile()) {
            throw new ValidationException(`CSV path is not a file: ${resolvedPath}`);
        }

        const raw = fs.readFileSync(resolvedPath, 'utf8');
        const rows = this.parseCSV(raw, options.delimiter || ',');
        const header = rows.length > 0 ? rows[0] : [];
        const dataRows = rows.length > 1 ? rows.slice(1) : [];
        const content = this.normalizeRows(dataRows.length > 0 ? dataRows : rows, options);

        return {
            filePath: resolvedPath,
            fileName: path.basename(resolvedPath),
            title: this.resolveTitle(resolvedPath, options),
            content: content,
            rowCount: dataRows.length > 0 ? dataRows.length : rows.length,
            columnCount: header.length || (rows[0] ? rows[0].length : 0),
            header: header,
            sizeBytes: stat.size
        };
    }

    static buildDocumentFromParsedCSV(parsed, options = {}) {
        const contentField = options.contentField || 'content';
        const titleField = options.titleField || 'title';
        const document = Object.assign({}, options.document || {});

        document.id = options.id || document.id || this.generateDocumentId(parsed.fileName);
        document[titleField] = options.title || document[titleField] || parsed.title;
        document[contentField] = parsed.content;
        document.file_name = parsed.fileName;
        document.file_path = parsed.filePath;
        document.mime_type = 'text/csv';
        document.row_count = String(parsed.rowCount);
        document.column_count = String(parsed.columnCount);

        if (parsed.header.length > 0) {
            document.columns = parsed.header.map((column) => this.normalizeText(column, options));
        }

        return document;
    }

    static parseCSV(input, delimiter) {
        this.validateDelimiter(delimiter);

        const rows = [];
        let row = [];
        let value = '';
        let inQuotes = false;

        for (let i = 0; i < input.length; i += 1) {
            const char = input[i];
            const next = input[i + 1];

            if (char === '"') {
                if (inQuotes && next === '"') {
                    value += '"';
                    i += 1;
                } else {
                    inQuotes = !inQuotes;
                }
                continue;
            }

            if (!inQuotes && char === delimiter) {
                row.push(value);
                value = '';
                continue;
            }

            if (!inQuotes && (char === '\n' || char === '\r')) {
                if (char === '\r' && next === '\n') {
                    i += 1;
                }
                row.push(value);
                value = '';
                if (row.length > 1 || row[0] !== '') {
                    rows.push(row);
                }
                row = [];
                continue;
            }

            value += char;
        }

        if (value !== '' || row.length > 0) {
            row.push(value);
            rows.push(row);
        }

        return rows;
    }

    static normalizeRows(rows, options = {}) {
        return rows
            .map((row) => row.map((cell) => this.normalizeText(cell, options)).filter(Boolean).join(' '))
            .filter(Boolean)
            .join('\n')
            .trim();
    }

    static normalizeText(text, options = {}) {
        let output = String(text || '').replace(/\r\n/g, '\n').replace(/\0/g, '');
        output = output.replace(/,/g, ' ');

        if (options.collapseWhitespace !== false) {
            output = output.replace(/[ \t]+/g, ' ');
            output = output.replace(/\n{3,}/g, '\n\n');
        }

        return output.trim();
    }

    static resolveTitle(filePath, options = {}) {
        if (options.title) {
            return this.normalizeText(options.title, options);
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

        return `${stem || 'csv'}_${suffix}`;
    }

    static validateFilePath(filePath) {
        if (!filePath || typeof filePath !== 'string') {
            throw new ValidationException('CSV file path must be a non-empty string');
        }
    }

    static validateDelimiter(delimiter) {
        if (typeof delimiter !== 'string' || delimiter.length !== 1) {
            throw new ValidationException('CSV delimiter must be a single character');
        }

        if (delimiter === '"' || delimiter === '\r' || delimiter === '\n') {
            throw new ValidationException('CSV delimiter cannot be a quote or newline');
        }
    }
}

module.exports = CSVParser;
