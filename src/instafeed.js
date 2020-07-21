'use strict';

// Module Dependencies
const { fetchPosts } = require('./fetchPosts');

// Instafeed wrapper function
const instafeed = async (options) => {

    // Fetch posts from Instagram
    return await fetchPosts(options);

}

// Module Exports
module.exports = {
    instafeed
}