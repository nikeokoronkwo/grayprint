/**
 * This file contains an API used to access the Grayprint API
 */

const IS_LOCAL = (Deno.env.get('DEV') ?? '0') !== '0';
const urlString = IS_LOCAL ? 'http://localhost:3000/' : 'https://grayprint.com'

/**
 * Authenticate a user into the Grayprint Platform on the given system
 */
function authenticateUser() {

}

/**
 * Polls the server to get the status on the user's authentication
 */
function pollUserAuth() {

}

/**
 * Get template information for a given template
 */
function getTemplateMeta() {

}

/**
 * Fetch the template tarball
 */
function fetchTemplate() {

}
