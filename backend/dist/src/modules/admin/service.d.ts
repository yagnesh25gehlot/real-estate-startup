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
}
//# sourceMappingURL=service.d.ts.map