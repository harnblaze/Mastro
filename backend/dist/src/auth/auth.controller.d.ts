import { AuthService } from './auth.service';
import { VkAuthDto, LoginDto, CreateUserDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    vkAuth(vkAuthDto: VkAuthDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            role: any;
            vkId: any;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            role: any;
            vkId: any;
        };
    }>;
    register(createUserDto: CreateUserDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            role: any;
            vkId: any;
        };
    }>;
    getProfile(req: any): any;
}
