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

function Content(mimeType, content) {
    var obj = {};

    obj.type = mimeType;
    obj.value = content;
    obj.length = content.length;

    return obj;
}

module.exports = {
    text: function (content) {
        return Content('text/plain', content);
    },
    html: function (content) {
        return Content('text/html', content);
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
    xml: function (content) {
        return Content('application/xml', content);
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
    }
};
