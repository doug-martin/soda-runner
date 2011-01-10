assert = require('assert');

exports.assertTitle = function(title)
{
    return function(browser) {
        browser.getTitle(function(title) {
            assert.ok(~title.indexOf(title), 'Title did not include the query');
        });
    }
}