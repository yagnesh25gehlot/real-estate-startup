export interface NotificationData {
    type: 'PROPERTY_ADDED' | 'PROPERTY_UPDATED' | 'USER_SIGNUP' | 'BOOKING_CREATED' | 'DEALER_REQUEST';
    title: string;
    message: string;
    data?: any;
    adminOnly?: boolean;
}
export declare class NotificationService {
    static createNotification(data: NotificationData): Promise<any>;
    static getAdminNotifications(page?: number, limit?: number, filters?: any): Promise<any>;
    static markAsRead(notificationId: string): Promise<any>;
    static markAllAsRead(): Promise<any>;
    static getUnreadCount(): Promise<number>;
    static cleanupOldNotifications(): Promise<any>;
    static notifyPropertyAdded(property: any, user: any): Promise<void>;
    static notifyPropertyUpdated(property: any, user: any, changes: any): Promise<void>;
    static notifyUserSignup(user: any): Promise<void>;
    static notifyDealerRequest(dealer: any, user: any): Promise<void>;
}
//# sourceMappingURL=service.d.ts.map