/**
 * Copyright 2017 MaddHacker
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

const crypto = require('crypto');

/**
 * Generic concept of a Content-Type model
 * 
 * @param {String} mimeType => how the client should read the content
 * @param {String} charset => In most cases this should be 'utf8', but can also be 'ascii' or 'latin1'
 *   NOTE: it *must* be one of: 'utf8','ascii', or 'latin1' or it will be interpreted as 'utf8'
 * @param {Object} content => actual content (file, image, etc)
 * @returns {Content} content wrapper for given payload.
 * 
 * @see #interpretCharset(charset)
 */
function Content(mimeType, charset, content) {
    var obj = {};

    obj.type = mimeType;
    obj.charset = function (charset) {

    };
    obj.value = content;
    obj.length = content.length;
    obj.md5 = crypto.createHash('md5').update(content).digest('base64');

    return obj;
}

/**
 * Interprets the given charset to a "formal" designation
 * 
 * @param {String} charset => In most cases this should be 'utf8', but can also be 'ascii' or 'latin1'
 *   NOTE: it *must* be one of: 'utf8','ascii', or 'latin1' or it will be interpreted as 'utf8'
 */
function interpretCharset(charset) {
    switch (charset) {
        case 'latin1':
            return 'ISO-8859-1'
        case 'ascii':
            return 'us-ascii';
        case 'utf8':
        default:
            return 'utf-8';
    }
}

module.exports = {
    text: function (content) {
        return Content('text/plain', content);
    },
    binary: function (content) {
        return Content('application/octet-stream', content);
    },
    html: function (content) {
        return Content('text/html', content);
    },
    xml: function (content) {
        return Content('application/xml', content);
    },
    js: function (content) {
        return Content('application/javascript', content);
    },
    css: function (content) {
        return Content('text/css', content);
    },
    json: function (content) {
        return Content('application/json', content);
    },
    gif: function (content) {
        return Content('image/gif', content);
    },
    png: function (content) {
        return Content('image/png', content);
    },
    jpg: function (content) {
        return Content('image/jpeg', content);
    },
    jpeg: function (content) {
        return Content('image/jpeg', content);
    },
    ico: function (content) {
        return Content('image/x-icon', content);
    },
    custom: Content
};
