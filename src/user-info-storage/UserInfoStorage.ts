import { TableStorage } from "../util/type/table-storage";

export interface UserInfo {
    id: string;
    username: string;
    password: string;
}
export enum UserInfoStorageType {
    Surreal = "Surreal"
}
export interface UserInfoStorage extends TableStorage {
    getUserInfo(): Promise<UserInfo | null>;
    getUserInfoByName(name: string): Promise<UserInfo | null>;
    get connected(): boolean
    /**
     * 
     * @param userInfo 
     * @throws if `userInfo.username` already exists
     */
    createUserInfo(userInfo: Omit<UserInfo, 'id'>): Promise<{ id: string }>;
    updateUserInfo(userInfo: Partial<Omit<UserInfo, 'id'>>): Promise<void>;
    deleteUserInfo(): Promise<void>;
    ready(): Promise<UserInfoStorage>;
    toUser(userId: string): UserInfoStorage;
    prepare(): Promise<void>;
}