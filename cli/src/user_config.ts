/** User configuration */
import { getPassword, setPassword, findCredentials, deletePassword } from "npm:keytar";

/** A model of the configuration object that contains the data */
export interface UserConf {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: string;
    deviceId: string;
}

type UserConfNullableDID = Omit<UserConf, 'deviceId'> & Pick<Partial<UserConf>, 'deviceId'>

export class UserConfiguration {
    private constructor() {}

    static getInstance() {
        if (!UserConfiguration.instance) {
            UserConfiguration.instance = new UserConfiguration();
        }

        return UserConfiguration.instance;
    }

    static instance: UserConfiguration;
    private SERVICE = 'grayprint';

    async getCredentials(): Promise<Required<UserConf>> {
            const creds = await findCredentials(this.SERVICE)
            const credMap = creds.reduce<UserConf>((a, v) => ({ ...a, [v.account]: v.password}), {
                deviceId: ""
            }) as Required<UserConf>
            return credMap 
    }

    async isInstantiated() {
        return (await getPassword(this.SERVICE, 'device_id')) !== null;
    }

    async setupConfiguration(conf: Required<UserConf>) {
        await setPassword(this.SERVICE, 'device_id', conf.deviceId);

        await setPassword(this.SERVICE, 'access_token', conf.accessToken);
        await setPassword(this.SERVICE, 'access_token_expires_at', conf.expiresAt);
        await setPassword(this.SERVICE, 'refresh_token', conf.refreshToken);
    }

    /** Saves the user's device info and other details */
    async saveConfiguration(conf: UserConf) {
        if (conf.deviceId) await setPassword(this.SERVICE, 'device_id', conf.deviceId);

        if (conf.accessToken) await setPassword(this.SERVICE, 'access_token', conf.accessToken);
        if (conf.expiresAt) await setPassword(this.SERVICE, 'access_token_expires_at', conf.expiresAt);
        if (conf.refreshToken) await setPassword(this.SERVICE, 'refresh_token', conf.refreshToken);
    }

    async getAccessToken() {
        return await getPassword(this.SERVICE, 'access_token')
    }

    async getAccessTokenExpiration() {
        return await getPassword(this.SERVICE, 'access_token_expires_at')
    }

    async refreshConfiguration(conf?: UserConf) {
        const accessSuccess = deletePassword(this.SERVICE, 'access_token');
        const refreshSuccess = deletePassword(this.SERVICE, 'refresh_token');

        const successes = await Promise.all([await accessSuccess, await refreshSuccess]);
        if (successes.find(s => !s)) {
            // error
        }
    }
}