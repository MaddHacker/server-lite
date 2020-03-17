/**
 * Copyright 2020 MaddHacker
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const promise = require('promise');
const fs = require('fs');
const path = require('path');
const stringUtilz = require('string-utilz');

const _regExPre = '%{';
const _regExPost = '}';
const _regExRange = 'g';
const _regExActionStart = '= ';
const _regExGroup = '(.+?)'
const _fileExtension = '.html';

/**
 * ServerLite Markup support.  This allows for dynamic HTML in a partial-esque format
 * 
 */
class slMarkup {

    /**
     * New object takes an implementation of {output-manager} that can be used to write to.
     * 
     * @param {slUtils} utilz => used to load files, will pull {output-manager} (if needed) from utilz
     * @param {Object} defaultValues => sets the default values the markup manager will use (e.g. title)
     * @param {String} templateRoot => root location (relative to the base path) of the templates folder
     * 
     * @see output-manager
     * @see https://www.npmjs.com/package/output-manager 
     */
    constructor(utilz, defaultValues = {}, templateRoot = '') {
        this._utilz = utilz;
        this._defaultValues = defaultValues;
        this._templateRootFolder = templateRoot;
        this._templateCache = {};
        if ('' != this._templateRootFolder) { this._cacheTemplatesRecursively(); }
    }

    /**
     * Shortcut got the {output-manager}
     */
    get o() { return this._utilz._out; }

    /**
     * Returns the default values that are currently set for markup
     */
    get defaultValues() { return this._defaultValues; }

    /**
     * Sets default values for the markup manager
     * 
     * @param {Object} values => new values to set
     */
    set defaultValues(values) { this._defaultValues = values || {}; }

    /**
     * Gets the root folder for templates
     */
    get templateRoot() { return this._templateRootFolder; }

    /**
     * Sets the template root
     * 
     * @param {String} root => String value of the relative root folder of templates
     */
    set templateRoot(root) { this._templateRootFolder = root || ''; }

    /**
     * Gets the template cache object
     */
    get templateCache() { return this._templateCache; }

    /**
     * @returns {Boolean} => {true} if the cache is all loaded, {false} if it's still async loading
     */
    cacheLoaded() { return Object.values(this._templateCacheAsyncHandler).filter(v => { return v }).length > 0; }

    /**
     * Internal method that can be called to build/rebuild the template cache
     */
    _cacheTemplatesRecursively() {
        this._templateCacheAsyncHandler = {};
        this._cacheTemplatesForDir(this._templateRootFolder);
    }

    /**
     * For the given {baseDir} will get all files/directories, then add the appropriate files to the cache, and 
     * recursively call itself for each directory
     * 
     * @param {String} baseDir => base directory to look at - handles recursion.
     * 
     * @see _cacheTemplatesRecursively
     */
    _cacheTemplatesForDir(baseDir = '') {
        this._templateCacheAsyncHandler[baseDir] = false;
        fs.readdir(baseDir, { withFileTypes: true }, (err, files) => {
            this._templateCacheAsyncHandler[baseDir] = true;
            if (err) { this.o.e(err); }
            else {
                files.forEach(f => {
                    let filePath = this._filePath(baseDir, f.name);
                    this._templateCacheAsyncHandler[filePath] = false;
                    this.o.t('found file or dir: ' + filePath);
                    if (f.isFile()) { this._loadFile(filePath); }
                    else if (f.isDirectory()) { this._cacheTemplatesForDir(filePath); }
                    else { this.o.w('Found unknown file type: ' + filePath); }
                });
            }
        });
    }

    /**
     * Actually reads the file and adds it to the cache.
     * 
     * @param {String} fullPath => Full path of the file to read (async).
     * 
     * @see _cacheTemplatesForDir
     * @see _cacheTemplatesRecursively
     * @see fs.readFile
     */
    _loadFile(fullPath) {
        this.o.t('loading file: ' + fullPath);
        fs.readFile(fullPath, (err, data) => {
            if (err) { this.o.e('Could not read file! ' + err); }
            else {
                this.o.t('adding to cache: ' + fullPath + ' ::: ' + data.toString());
                this._templateCache[fullPath] = data.toString();
            }
            this._templateCacheAsyncHandler[fullPath] = true;
            this.o.t('currentCache: ' + JSON.stringify(this._templateCache));
        });
    }

    /**
     * Builds the filename for the given path/name combo.
     * 
     * @param {String} basePath => base path of the given filename 
     * @param {String} name => name of the file
     * 
     * @returns {String} => full path/filename with appropriate filesystem separator
     * 
     * @see path.sep
     */
    _filePath(basePath, name) { return basePath + path.sep + name; }

    /**
     * Given any override vars, will create a new object, copy in the defaults then copy the given 
     * values into the new object, overriding or appending to the defaults as appropriate.
     * 
     * @param {Object} overrideVars => whatever variables should override the given defaults
     */
    buildVarsFromDefaults(overrideVars = {}) {
        let vars = {};
        Object.assign(vars, this._defaultValues);
        Object.assign(vars, overrideVars);
        return vars;
    }

    /**
     * Given any template as a {String} will replace all *simple* matches (e.g. variable substiution).
     * Variables are noted in the template with the '%{varName}' format.  For this example, the 'mappedVars'
     * or 'defaultValues' need to have a key with name 'varName', which the value of when then replace.
     * In other words:
     *      buildFromTemplate('<body>${foo}</body>', {foo:'bar'})
     * will yield:
     *      '<body>bar</body>'
     * 
     * @param {String} template => typically loaded from a file, but can be any string
     * @param {Object} mappedVars => will replace any matching vars in the template
     */
    buildFromTemplate(template = '', mappedVars = this._defaultValues) {
        let vars = this.buildVarsFromDefaults(mappedVars);

        let result = template;
        Object.keys(vars).forEach(k => {
            result = result.replace(new RegExp(_regExPre + k + _regExPost, _regExRange), match => {
                return vars[k];
            });
        });

        return result;
    }

    /**
     * Will load the provided {filePath} synchronously from the fs, then recurse on the partials
     * 
     * @param {String} filePath => full path of file to load
     * @param {Object} mappedVars => variables to replace
     * 
     * @returns {String} => processed file
     * 
     * @see buildFromTemplate
     */
    buildFromFileWithPartials(filePath = '', mappedVars = this._defaultValues) {
        let data = fs.readFileSync(filePath, { encoding: 'utf8' });
        return this.buildFromTemplate(this._recursePartials(data), mappedVars);
    }

    /**
     * Recursively replaces the magic partial matcher with the string value found in the cache.
     * 
     * @param {String} template => string representation of thing to parse
     * 
     * @returns {String} => processed template
     * 
     * @see _cacheTemplatesForDir
     */
    _recursePartials(template = '') {
        return stringUtilz.containsIgnoreCase(template, _regExPre + _regExActionStart) ? this._recursePartials(
            template.replace(new RegExp(_regExPre + _regExActionStart + _regExGroup + _regExPost, _regExRange), (match, contents) => {
                let filename = this._filePath(this._templateRootFolder, contents.trim() + _fileExtension);
                if (!this._templateCache[filename]) { this.o.w('Could not find file "' + filename + '" in the cache!'); }
                return this._templateCache[filename] || '';
            })
        ) : template;
    }

}

/**
 * All exports
 */
module.exports = slMarkup;
