'use strict';

// Module Dependencies
const axios = require('axios');
const { refreshAccessToken } = require('./constants');

// Refresh the User Access Token
const refreshToken = async (options) => {
  
  // Check if an access token was passed
  if (options.hasOwnProperty('access_token')) {

    // Pass access token to request settings
    refreshAccessToken.params.access_token = options.access_token;

  } else {

    // Bail early
    return new Error('[Instafeed Error] Please supply an access token.');

  }
  
  // Request posts from Instagram Graph API
  return await axios(refreshAccessToken)
    
  // Handle success response from API
  .then((response) => {
    
    // Data returned from the API
    return response.data;

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
  refreshToken
};
