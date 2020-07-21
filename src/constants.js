'use strict';

// Instagram Graph API Hostname
const graphApi = "https://graph.instagram.com";

// Request objects for the Instagram Graph API, these objects are passed directly to Axios.
module.exports = {

  // Request settings to fetch User ID from /me endpoint
  userId: {
    method: 'GET',
    baseURL: graphApi,
    url: "/me",
    responseType: 'json',
    params: {},
  },

  // Request settings to fetch posts from /me/media endpoint
  posts: {
    method: 'GET',
    baseURL: graphApi,
    url: "/me/media",
    responseType: 'json',
    params: {
      fields: 'id, username, media_type, media_url, permalink, thumbnail_url, caption, timestamp',
      limit: 25
    },
  },

  // Request settings to refresh a user access token using the /refresh_access_token endpoint
  refreshAccessToken: {
    method: 'GET',
    baseURL: graphApi,
    url: "/refresh_access_token",
    responseType: 'json',
    params: {
      grant_type: 'ig_refresh_token'
    },
  }

};