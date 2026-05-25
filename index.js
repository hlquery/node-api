/**
 * hlquery Node.js Client - Main Entry Point
 * 
 * Copyright (C) 2021-2026, Carlos F. Ferry <carlos.ferry@gmail.com>
 * 
 * This file is part of hlquery, released under the BSD License version 3.
 */

const Client = require('./lib/Client');

// Export main client class
module.exports = Client;

// Export all classes for advanced usage
module.exports.Client = Client;
module.exports.Request = require('./lib/Request');
module.exports.Response = require('./lib/Response');
module.exports.Collections = require('./lib/Collections');
module.exports.Documents = require('./lib/Documents');
module.exports.Search = require('./lib/Search');
module.exports.Keys = require('./lib/Keys');
module.exports.Aliases = require('./lib/Aliases');
module.exports.Overrides = require('./lib/Overrides');
module.exports.Synonyms = require('./lib/Synonyms');
module.exports.Stopwords = require('./lib/Stopwords');
module.exports.System = require('./lib/System');
module.exports.SAM = require('./lib/SAM');
module.exports.Modules = require('./lib/Modules');
module.exports.Route = require('./lib/Route');

// Export exceptions
module.exports.Exceptions = require('./lib/Exceptions');

// Export utilities
module.exports.Utils = {
    Config: require('./utils/Config'),
    Validator: require('./utils/Validator'),
    Auth: require('./utils/Auth'),
    Ranker: require('./utils/ranker'),
    PDFParser: require('./utils/PDFParser'),
    CSVParser: require('./utils/CSVParser')
};
