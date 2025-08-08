import { PrismaClient, Commission, Dealer } from '@prisma/client';
import { createError } from '../../utils/errorHandler';
import { sendCommissionEarningsEmail } from '../../mail/notifications';

const prisma = new PrismaClient();

export interface CommissionCalculation {
  dealerId: string;
  amount: number;
  level: number;
}

export class CommissionService {
  static async calculateCommissions(propertyId: string, saleAmount: number): Promise<Commission[]> {
    try {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
          dealer: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!property || !property.dealer) {
        throw createError('Property or dealer not found', 404);
      }

      const commissions: Commission[] = [];
      let currentDealer = property.dealer;
      let level = 1;

      // Get commission configuration
      const commissionConfigs = await prisma.commissionConfig.findMany({
        orderBy: { level: 'asc' },
      });

      // Calculate commissions for each level in the hierarchy
      while (currentDealer && level <= 3) {
        const config = commissionConfigs.find(c => c.level === level);
        if (!config) break;

        const commissionAmount = (saleAmount * config.percentage) / 100;

        const commission = await prisma.commission.create({
          data: {
            dealerId: currentDealer.id,
            propertyId,
            amount: commissionAmount,
            level,
          },
        });

        commissions.push(commission);

        // Send commission earnings email
        await sendCommissionEarningsEmail({
          dealerEmail: currentDealer.user.email,
          dealerName: currentDealer.user.name || 'Dealer',
          propertyTitle: property.title,
          commissionAmount,
          level,
        });

        // Move to parent dealer
        currentDealer = await prisma.dealer.findUnique({
          where: { id: currentDealer.parentId || '' },
          include: {
            user: true,
          },
        });

        level++;
      }

      return commissions;
    } catch (error) {
      throw createError('Failed to calculate commissions', 500);
    }
  }

  static async getDealerCommissions(dealerId: string): Promise<Commission[]> {
    try {
      return await prisma.commission.findMany({
        where: { dealerId },
        include: {
          property: true,
          dealer: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw createError('Failed to fetch dealer commissions', 500);
    }
  }

  static async getDealerHierarchy(dealerId: string): Promise<Dealer | null> {
    try {
      return await prisma.dealer.findUnique({
        where: { id: dealerId },
        include: {
          user: true,
          children: {
            include: {
              user: true,
            },
          },
          parent: {
            include: {
              user: true,
            },
          },
        },
      });
    } catch (error) {
      throw createError('Failed to fetch dealer hierarchy', 500);
    }
  }

  static async getDealerStats(dealerId: string): Promise<any> {
    try {
      const [totalCommissions, totalProperties, childrenCount] = await Promise.all([
        prisma.commission.aggregate({
          where: { dealerId },
          _sum: { amount: true },
        }),
        prisma.property.count({
          where: { dealerId },
        }),
        prisma.dealer.count({
          where: { parentId: dealerId },
        }),
      ]);

      return {
        totalCommissions: totalCommissions._sum.amount || 0,
        totalProperties,
        childrenCount,
      };
    } catch (error) {
      throw createError('Failed to fetch dealer stats', 500);
    }
  }

  static async updateCommissionConfig(level: number, percentage: number): Promise<void> {
    try {
      await prisma.commissionConfig.upsert({
        where: { level },
        update: { percentage },
        create: { level, percentage },
      });
    } catch (error) {
      throw createError('Failed to update commission config', 500);
    }
  }

  static async getCommissionConfig(): Promise<any[]> {
    try {
      return await prisma.commissionConfig.findMany({
        orderBy: { level: 'asc' },
      });
    } catch (error) {
      throw createError('Failed to fetch commission config', 500);
    }
  }

  static async getPendingDealers(): Promise<Dealer[]> {
    try {
      return await prisma.dealer.findMany({
        where: {
          user: {
            role: 'DEALER',
          },
        },
        include: {
          user: true,
          parent: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw createError('Failed to fetch pending dealers', 500);
    }
  }

  static async approveDealer(dealerId: string): Promise<void> {
    try {
      const dealer = await prisma.dealer.findUnique({
        where: { id: dealerId },
        include: { user: true },
      });

      if (!dealer) {
        throw createError('Dealer not found', 404);
      }

      await prisma.user.update({
        where: { id: dealer.userId },
        data: { role: 'DEALER' },
      });
    } catch (error) {
      throw createError('Failed to approve dealer', 500);
    }
  }

  static async getDealerByReferralCode(referralCode: string): Promise<Dealer | null> {
    try {
      return await prisma.dealer.findUnique({
        where: { referralCode },
        include: {
          user: true,
        },
      });
    } catch (error) {
      throw createError('Failed to fetch dealer by referral code', 500);
    }
  }

  static async getDealerTree(dealerId: string, maxDepth: number = 3): Promise<any> {
    try {
      const buildTree = async (dealerId: string, depth: number = 0): Promise<any> => {
        if (depth >= maxDepth) return null;

        const dealer = await prisma.dealer.findUnique({
          where: { id: dealerId },
          include: {
            user: true,
            children: true,
          },
        });

        if (!dealer) return null;

        const children = await Promise.all(
          dealer.children.map(child => buildTree(child.id, depth + 1))
        );

        return {
          id: dealer.id,
          user: dealer.user,
          children: children.filter(Boolean),
          level: depth,
        };
      };

      return await buildTree(dealerId);
    } catch (error) {
      throw createError('Failed to build dealer tree', 500);
    }
  }
} 