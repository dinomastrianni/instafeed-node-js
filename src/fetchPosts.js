'use strict';

// Module Dependencies
const axios = require('axios');
const { posts } = require('./constants');

// Fetch posts from Instagram API
const fetchPosts = async (options) => {
  
  // Check if an access token was passed
  if (options.hasOwnProperty('access_token')) {

    // Pass access token to request settings
    posts.params.access_token = options.access_token;

  } else {

    // Bail early
    return new Error('[Instafeed Error] Please supply an access token.');

  }
  
  // Check if a specific count of posts was requested
  if (options.hasOwnProperty('requestedCount')) {

    // Check if requested count is greater than the maximum that can be returned per-request
    if (options.requestedCount > posts.params.limit) {

      // Bail early
      return new Error('[Instafeed Error] The maximum number of posts that can be returned per-request is 25, please supply a count less than, or equal to 25.');

    }

    // Check if the requested count is less than the default
    if (options.requestedCount < posts.params.limit) {

      // Set the count to the requested number
      posts.params.limit = options.requestedCount;

    }

  }

  // Check if we need to pass a pagination cursor to the request
  if (options.hasOwnProperty('after')) {

    // Pass the after cursor to instruct the API to return posts after the last post in the previous request
    // See: https://developers.facebook.com/docs/graph-api/using-graph-api#paging
    posts.params.after = options.after;

  }

  // Request posts from Instagram Graph API
  return await axios(posts)
    
  // Handle success response from API
  .then((response) => {
  
    // Data returned from the API
    let apiData = response.data;

    // Select the next cursor for the ability to fetch the next page of posts
    let cursors = apiData.paging.cursors;

    // Select the data object out of the API response, which contains the Instagram Posts.
    let posts = apiData.data;

    // Instagram's API returns an image in media_url for all media_type's except for videos.
    // For videos, the media_url is a link to the video file, and the API returns an image in thumbnail_url.
    // Why Instagram didn't choose to supply the video file in video_url, so that the image is always in media_url, who knows.
    // But we're fixing that here, by adding an image property to each post object, so you can always reference it to get an image for each Instagram post.
    posts.forEach((post) => {

      // Check if the media_type is VIDEO, if so, use thumbnail_url for the image, otherwise, use media_url.
      post.image = (post.media_type == 'VIDEO') ? post.thumbnail_url : post.media_url;

    })

    // Return the posts
    return {
      data: posts, // The Instagram Posts
      count: posts.length, // A count of posts returned in this response
      after: cursors.after // The cursor you can pass to fetch the next page of instagram posts.
    }
      
  })
    
  // Handle error response from API
  .catch((error) => {

    // Data returned from the API
    let errorData = error.response;

    // API Error Code
    let errorCode = errorData.data.error.code;

    // API Error Type
    let errorType = errorData.data.error.type;

    // API Error Message
    let errorMessage = errorData.data.error.message;

    // Response object
    return new Error('[Instagram API Error] Error Code: ' + errorCode + ', Error Type: ' + errorType + ', Error Message: ' + errorMessage);
      
  });

}

// Module Exports
module.exports = {
  fetchPosts
};
