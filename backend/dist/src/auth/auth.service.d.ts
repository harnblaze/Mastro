import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { VkService } from './vk.service';
import { VkAuthDto, LoginDto, CreateUserDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private vkService;
    constructor(prisma: PrismaService, jwtService: JwtService, vkService: VkService);
    validateVkAuth(vkAuthDto: VkAuthDto): Promise<{
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
    private generateTokens;
    validateUser(payload: any): Promise<{
        id: string;
        vkId: string | null;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        passwordHash: string | null;
        createdAt: Date;
    }>;
}
