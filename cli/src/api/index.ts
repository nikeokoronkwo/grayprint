/**
 * This file contains an API used to access the Grayprint API
 */

import { UserConfiguration, UserConf } from "../user_config.ts";

const IS_LOCAL = (Deno.env.get('DEV') ?? '0') !== '0';
const urlString = IS_LOCAL ? 'http://localhost:3000/' : 'https://grayprint.com'

/**
 * Authenticate a user into the Grayprint Platform on the given system
//  * @todo Implement AuthenticateUser Function
 */
async function authenticateUser() {
    const config = UserConfiguration.getInstance();

    if (await config.isInstantiated()) {
        // send device id associated
        
        const currentConfig = await config.getCredentials();
        const expirationDate = Date.parse(currentConfig.expiresAt);

        if (Date.now() > expirationDate) {
            // expired
            await config.refreshConfiguration();
        }

        // TODO: fetch
    } else {
        // send no data

        // TODO: fetch
    }
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
