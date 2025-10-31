export declare class VkAuthDto {
    vkToken: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class CreateUserDto {
    email: string;
    password: string;
    vkId?: string;
    role?: 'OWNER' | 'STAFF';
}
