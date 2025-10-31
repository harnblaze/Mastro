export declare class CreateServiceDto {
    title: string;
    durationMinutes: number;
    price: number;
    bufferBefore?: number;
    bufferAfter?: number;
    color?: string;
}
export declare class UpdateServiceDto {
    title?: string;
    durationMinutes?: number;
    price?: number;
    bufferBefore?: number;
    bufferAfter?: number;
    color?: string;
}
