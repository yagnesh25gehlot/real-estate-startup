export interface DashboardStats {
    totalUsers: number;
    totalProperties: number;
    totalBookings: number;
    totalRevenue: number;
    pendingDealers: number;
    recentTransactions: any[];
}
export declare class AdminService {
    static getDashboardStats(): Promise<DashboardStats>;
    static getPropertyAnalytics(): Promise<any>;
    static getBookingAnalytics(): Promise<any>;
    static getDealerAnalytics(): Promise<any>;
    static getRecentActivity(): Promise<any[]>;
    static updateSystemSettings(settings: any): Promise<void>;
    static getSystemSettings(): Promise<any>;
    static getUserCount(): Promise<number>;
    static getAllUsers(): Promise<any[]>;
    static getAllBookings(): Promise<any[]>;
    static updateBookingStatus(bookingId: string, status: string): Promise<any>;
    static getDealerRequests(): Promise<any[]>;
    static approveDealerRequest(dealerId: string): Promise<any>;
    static rejectDealerRequest(dealerId: string): Promise<any>;
    static getDealerTree(): Promise<any[]>;
    static blockUser(userId: string): Promise<{
        message: string;
    }>;
    static unblockUser(userId: string): Promise<{
        message: string;
    }>;
    static createUser(data: {
        email: string;
        name: string;
        password?: string;
        mobile?: string;
        aadhaar?: string;
        role: 'USER' | 'DEALER' | 'ADMIN';
    }): Promise<any>;
    static updateUser(userId: string, data: {
        name?: string;
        mobile?: string;
        aadhaar?: string;
        role?: 'USER' | 'DEALER' | 'ADMIN';
    }): Promise<any>;
    static updateUserPassword(userId: string, password: string): Promise<any>;
    static deleteUser(userId: string): Promise<{
        message: string;
    }>;
    static updateUserProfilePicture(userId: string, profilePicUrl: string): Promise<any>;
    static updateUserAadhaarImage(userId: string, aadhaarImageUrl: string): Promise<any>;
    static getUserById(userId: string): Promise<any>;
    private static generateReferralCode;
}
//# sourceMappingURL=service.d.ts.map