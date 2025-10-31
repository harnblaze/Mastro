export interface VkUser {
    id: number;
    first_name: string;
    last_name: string;
    photo_200?: string;
    email?: string;
}
export declare class VkService {
    private readonly vkApiUrl;
    validateToken(accessToken: string): Promise<VkUser>;
    sendMessage(userId: number, message: string, accessToken: string): Promise<boolean>;
    getGroupInfo(groupId: number, accessToken: string): Promise<any>;
}
