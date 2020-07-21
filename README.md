# Instafeed for Node.js


This module allows you to asynchronously fetch posts from the Instagram Graph API with a long-lived User Access Token. To use this module, it is recommended that you obtain a User Access Token from the User Token Generator tool in the Facebook Developers Console. A User Access Token will allow you to fetch only the Instagram posts from the account it was generated for.

For more information about how to obtain a User Access Token, see: [Basic Display API Overview](https://developers.facebook.com/docs/instagram-basic-display-api/overview)

## Table of Contents
- [Usage](#usage)
    - [Basic Usage](#basic-usage)
    - [Request specific number of posts](#request-specific-number-of-posts)
    - [Cursor Based Pagination](#cursor-based-pagination)
    - [Refreshing Your Access Token](#refreshing-your-access-token)
- [instafeed()](#instafeed())
    - [Request Parameters](#instafeed()-request-parameters)
    - [Return Values](#instafeed()-return-values)
- [refreshToken()](#refreshToken)
    - [Request Parameters](#refreshToken()-request-parameters)
    - [Return Values](#refreshToken()-return-values)
- [Error Handling](#errors)
    - [Instafeed Errors](#instafeed-errors)
    - [Instagram API Errors](#instagram-api-errors)
- [Changelog](#changelog)
- [License](#license)

## Usage
**Note:** It is highly recommended that you store User Access Tokens in an environment variable. Therefore, the code snippets below assume your User Access Token is stored in `process.env.ig_user_access_token`. Please be sure to update this value in the code snippets to correctly reference the variable for your User Access Token.

#### Basic Usage
````javascript
// Fetch latest posts from Instagram
instafeed({
    access_token: process.env.ig_user_access_token
})

// Handle success response
.then((response) => {

    // Instagram posts
    let instagram_posts = response.data;

    // Log Instagram posts to console
    console.log(instagram_posts);

// Handle error response
}).catch((error) => {

    // Log error to console
    console.log(error);

// Optionally, you can make an API request to refresh your user access token after the request completes.
}).finally(() => {

    // Refresh user access token
    refreshToken({access_token: process.env.ig_user_access_token});

});
````
The rate limit for API calls made with User Access Tokens is **200 calls per hour**, so it is recommended that you cache the Instagram posts, and only use Instafeed to fetch them when you want to update the cache.

#### Request specific number of posts

By default, Instafeed will request the latest 25 posts, which is the maximum number of posts the API will return per request. If you would like to request a smaller number of posts, you can pass `requestedCount`.

````javascript
// Fetch latest posts from Instagram
instafeed({
    access_token: process.env.ig_user_access_token,
    requestedCount: 4 // Request only the latest 4 posts
})
````

#### Cursor Based Pagination

Instagram's API uses cursor based pagination. With every request Instafeed makes, the return value will contain an `after` property, which is cursor that identifies the last post returned in the request. You can then pass the the cursor to `after` when making a new request to get the next 'page' posts that come after the last post from the previous request.

````javascript
// Fetch latest posts from Instagram
instafeed({
    access_token: process.env.ig_user_access_token,
    requestedCount: 25, // Set page size to 25 posts
    after: 'QVFIUi1OLWQxa240VnEtSy1Dd2FWZA0RjR0N2VllXaERDSFBNUDlYZAWZAfc1B1TURlT2daQkktQW5GZAWVvVVJVeHUwcVpkWVI4dUxRaW5WNkFpNGdaYwFtVkVR' // Pass a page cursor to get the posts that come after it
})
````

#### Refreshing Your Access Token
Instagram long lived User Access Tokens are valid for 60 days, but can be refreshed to extend their lifespan. Every time you refresh your access token, the expiration date is set to 60 days again, and the API responds with the number of seconds until your User Access Token expires. When a User Access Token is refreshed, the API will not refresh it again until at least 24 hours have passed. The API will not throw an error if you refresh too often, so long as you're not hitting the 200 requests per hour rate limit, but it won't actually refresh the token until 24 hours have passed.

This module has a built-in helper function that will send a request to the `/refresh_access_token` endpoint to assist you in easily keeping your User Access Token valid.

````javascript
// Refresh user access token
refreshToken({access_token: process.env.ig_user_access_token})

// Handle success response
.then((response) => {

    // Number of seconds until the User Access Token Expires
    let expiration = response.expires_in;

    // Log expiration to console
    console.log(expiration);

// Handle error response
}).catch((error) => {

    // Log error to console
    console.log(error);

});
````

## Instafeed()

The `instafeed()` function makes a request to the `/me/media` endpoint of the Instagram Graph API.

#### Instafeed() Request Parameters

The `instafeed()` function accepts an object of options as it's only parameter.

| Option | Type | Required | Description |
| :--- | :---: | :---: | :--- |
| access_token | string | Required | A long-lived User Access Token for the Instagram account you want to fetch the posts for. |
| requestedCount | int | Optional | The number of posts you want to fetch, the default value is 25, and the API will only return a maximum of 25 posts per request. An error will be thrown if you attempt to request more than 25 posts. |
| after | string | Optional | An 'after' page cursor from a previous request that points to the end of the 'page' of data that was returned. By passing an 'after' page cursor, you're telling the API to return posts that come after the last post returned in a previous request. |

- [More Information on Access Tokens](https://developers.facebook.com/docs/instagram-basic-display-api/overview#instagram-user-access-tokens)
- [More Information on Cursor-Based Pagination](https://developers.facebook.com/docs/graph-api/using-graph-api/#cursors)

#### instafeed() Return Values

The `instafeed()` function will return the following values if the request was successful.

| Value | Type | Description |
| :--- | :---: | :--- |
| data | array | An array of Instagram post objects. The table below lists all properties attached to each Instagram post object. |
| count | int | A count of the total number of posts the API returned. |
| after | string | The 'after' page cursor returned from the API. You can pass this value to request the next set of posts. |

Each Instagram post object will contain the following properties.
| Property | Type | Always Returned | Description |
| :--- | :---: | :---: | :--- |
| id | string | Yes | The media ID |
| username | string | Yes | The username of the account that made the post. |
| media_type | string | Yes | The media type. Can be IMAGE, VIDEO, or CAROUSEL_ALBUM. |
| media_url | string | Yes | The media URL. If the media_type is IMAGE or CAROUSEL_ALBUM, this will be a link to an image. If the media_type is VIDEO, this will be a link to a video file. |
| thubmnail_url | string | No | The thumbnail image URL, this is only returned if the media_type is VIDEO. |
| permalink | string | Yes | The permanent URL to the Instagram post. |
| caption | string | No | The caption text. If the post has no caption, the API does not return this. |
| timestamp | string | Yes | The publish date in ISO 8601 format. |
| image | string | Yes | This is a property added by the `instafeed()` function. Depending the media_type, this will either be the media_url or thumbnail_url. This will always contain an image URL. |

**Note:** `instafeed()` returns the post objects exactly as they are received from the API, but adds an `image` property to each post so you have a reliable URL to an image for the post regardless of the media_type. See the [Basic Display API Reference for Media](https://developers.facebook.com/docs/instagram-basic-display-api/reference/media) for a definitive reference to the data returned for each Instagram post.

## refreshToken()

The `refreshToken()` function makes a request to the `/refresh_access_token` endpoint of the Instagram Graph API.

#### refreshToken() Request Parameters

The `refreshToken()` function accepts an object of options as it's only parameter.

| Option | Type | Required | Description |
| :--- | :---: | :---: | :--- |
| access_token | string | Required | A long-lived User Access Token for the Instagram account you want to fetch the posts for. |

#### refreshToken() Return Values

The `refreshToken()` function will return the following values if the request was successful.

| Property | Type | Always Returned | Description |
| :--- | :---: | :---: | :--- |
| access_token | string | Yes | A long-lived Instagram User Access Token. |
| token_type | string | Yes | The value is always 'bearer', I'm not sure what this is for. |
| expires_in | int | Yes | The number of seconds until the long-lived User Access Token expires. |

[Basic Display API Reference for refresh_access_token endpoint](https://developers.facebook.com/docs/instagram-basic-display-api/reference/refresh_access_token)

## Errors

In the event of an error, Instafeed will return an error message.

#### Instafeed Errors
Any errors thrown by Instafeed will be prefixed with [Instafeed Error]. The error message will contain instructions on how to fix the error.

#### Instagram API Errors
Any errors thrown by Instafeed will be prefixed with [Instagram API Error]. The error message will contain the Error Code, Error Type, and Error Message returned from the API.

## Changelog

[Changelog](/changelog.md)

## License

[MIT License](/LICENSE)