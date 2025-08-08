import { Commission, Dealer } from '@prisma/client';
export interface CommissionCalculation {
    dealerId: string;
    amount: number;
    level: number;
}
export declare class CommissionService {
    static calculateCommissions(propertyId: string, saleAmount: number): Promise<Commission[]>;
    static getDealerCommissions(dealerId: string): Promise<Commission[]>;
    static getDealerHierarchy(dealerId: string): Promise<Dealer | null>;
    static getDealerStats(dealerId: string): Promise<any>;
    static updateCommissionConfig(level: number, percentage: number): Promise<void>;
    static getCommissionConfig(): Promise<any[]>;
    static getPendingDealers(): Promise<Dealer[]>;
    static approveDealer(dealerId: string): Promise<void>;
    static getDealerByReferralCode(referralCode: string): Promise<Dealer | null>;
    static getDealerTree(dealerId: string, maxDepth?: number): Promise<any>;
}
//# sourceMappingURL=service.d.ts.map