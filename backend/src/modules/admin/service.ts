import { PrismaClient } from '@prisma/client';
import { createError } from '../../utils/errorHandler';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalBookings: number;
  totalRevenue: number;
  pendingDealers: number;
  recentTransactions: any[];
}

export class AdminService {
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [
        totalUsers,
        totalProperties,
        totalBookings,
        totalRevenue,
        pendingDealers,
        recentTransactions,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.property.count(),
        prisma.booking.count(),
        prisma.payment.aggregate({
          _sum: { amount: true },
        }),
        prisma.dealer.count({
          where: {
            user: {
              role: 'DEALER',
            },
          },
        }),
        prisma.payment.findMany({
          take: 10,
          include: {
            booking: {
              include: {
                property: true,
                user: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
      ]);

      return {
        totalUsers,
        totalProperties,
        totalBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        pendingDealers,
        recentTransactions,
      };
    } catch (error) {
      throw createError('Failed to fetch dashboard stats', 500);
    }
  }

  static async getPropertyAnalytics(): Promise<any> {
    try {
      const [propertiesByStatus, propertiesByType, propertiesByLocation] = await Promise.all([
        prisma.property.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
        prisma.property.groupBy({
          by: ['type'],
          _count: { id: true },
        }),
        prisma.property.groupBy({
          by: ['location'],
          _count: { id: true },
        }),
      ]);

      return {
        byStatus: propertiesByStatus,
        byType: propertiesByType,
        byLocation: propertiesByLocation,
      };
    } catch (error) {
      throw createError('Failed to fetch property analytics', 500);
    }
  }

  static async getBookingAnalytics(): Promise<any> {
    try {
      const [bookingsByStatus, monthlyBookings, revenueByMonth] = await Promise.all([
        prisma.booking.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
        prisma.booking.groupBy({
          by: ['status'],
          _count: { id: true },
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
        prisma.payment.groupBy({
          by: ['createdAt'],
          _sum: { amount: true },
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
      ]);

      return {
        byStatus: bookingsByStatus,
        monthlyBookings,
        revenueByMonth,
      };
    } catch (error) {
      throw createError('Failed to fetch booking analytics', 500);
    }
  }

  static async getDealerAnalytics(): Promise<any> {
    try {
      const [totalDealers, dealersByLevel, commissionStats] = await Promise.all([
        prisma.dealer.count(),
        prisma.dealer.groupBy({
          by: ['parentId'],
          _count: { id: true },
        }),
        prisma.commission.aggregate({
          _sum: { amount: true },
          _count: { id: true },
        }),
      ]);

      return {
        totalDealers,
        dealersByLevel,
        totalCommissions: commissionStats._sum.amount || 0,
        totalCommissionTransactions: commissionStats._count.id,
      };
    } catch (error) {
      throw createError('Failed to fetch dealer analytics', 500);
    }
  }

  static async getRecentActivity(): Promise<any[]> {
    try {
      const activities = await prisma.$transaction([
        // Recent properties
        prisma.property.findMany({
          take: 5,
          include: {
            owner: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        // Recent bookings
        prisma.booking.findMany({
          take: 5,
          include: {
            property: true,
            user: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        // Recent payments
        prisma.payment.findMany({
          take: 5,
          include: {
            booking: {
              include: {
                property: true,
                user: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        // Recent dealers
        prisma.dealer.findMany({
          take: 5,
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
      ]);

      return [
        ...activities[0].map(p => ({ type: 'property', data: p })),
        ...activities[1].map(b => ({ type: 'booking', data: b })),
        ...activities[2].map(p => ({ type: 'payment', data: p })),
        ...activities[3].map(d => ({ type: 'dealer', data: d })),
      ].sort((a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime());
    } catch (error) {
      throw createError('Failed to fetch recent activity', 500);
    }
  }

  static async updateSystemSettings(settings: any): Promise<void> {
    try {
      // Update commission configuration
      if (settings.commissionRates) {
        for (const [level, percentage] of Object.entries(settings.commissionRates)) {
          await prisma.commissionConfig.upsert({
            where: { level: parseInt(level) },
            update: { percentage: parseFloat(percentage as string) },
            create: { level: parseInt(level), percentage: parseFloat(percentage as string) },
          });
        }
      }

      // Update booking duration
      if (settings.bookingDuration) {
        // This would typically be stored in a settings table
        // For now, we'll use environment variables
        console.log('Booking duration updated:', settings.bookingDuration);
      }
    } catch (error) {
      throw createError('Failed to update system settings', 500);
    }
  }

  static async getSystemSettings(): Promise<any> {
    try {
      const commissionConfig = await prisma.commissionConfig.findMany({
        orderBy: { level: 'asc' },
      });

      return {
        commissionRates: commissionConfig.reduce((acc, config) => {
          acc[config.level] = config.percentage;
          return acc;
        }, {} as any),
        bookingDuration: parseInt(process.env.DEFAULT_BOOKING_DURATION_DAYS || '3'),
      };
    } catch (error) {
      throw createError('Failed to fetch system settings', 500);
    }
  }

  static async getUserCount(): Promise<number> {
    try {
      const count = await prisma.user.count({
        where: {
          role: {
            in: ['USER', 'DEALER']
          }
        }
      });
      
      return count;
    } catch (error) {
      throw createError('Failed to fetch user count', 500);
    }
  }

  static async getAllUsers(): Promise<any[]> {
    try {
      console.log('Fetching all users...');
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          mobile: true,
          aadhaar: true,
          aadhaarImage: true,
          profilePic: true,
          role: true,
          status: true,
          createdAt: true,
          dealer: {
            select: {
              id: true,
              referralCode: true,
              status: true,
              commission: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      console.log(`Found ${users.length} users`);
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw createError('Failed to fetch users', 500);
    }
  }

  static async getAllBookings(): Promise<any[]> {
    try {
      console.log('Fetching all bookings...');
      const bookings = await prisma.booking.findMany({
        include: {
          property: {
            select: {
              id: true,
              title: true,
              location: true,
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      console.log(`Found ${bookings.length} bookings`);
      return bookings;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw createError('Failed to fetch bookings', 500);
    }
  }

  static async updateBookingStatus(bookingId: string, status: string): Promise<any> {
    try {
      console.log(`Updating booking ${bookingId} status to ${status}`);
      
      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              location: true,
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
        },
      });
      
      console.log(`Booking status updated successfully`);
      return booking;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw createError('Failed to update booking status', 500);
    }
  }

  static async getDealerRequests(): Promise<any[]> {
    try {
      console.log('Fetching dealer requests...');
      const dealers = await prisma.dealer.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              createdAt: true,
            }
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      console.log(`Found ${dealers.length} dealer requests`);
      return dealers;
    } catch (error) {
      console.error('Error fetching dealer requests:', error);
      throw createError('Failed to fetch dealer requests', 500);
    }
  }

  static async approveDealerRequest(dealerId: string): Promise<any> {
    try {
      console.log(`Approving dealer request ${dealerId}`);
      
      const dealer = await prisma.dealer.findUnique({
        where: { id: dealerId },
        include: { user: true },
      });

      if (!dealer) {
        throw createError('Dealer not found', 404);
      }

      // Update dealer status to APPROVED
      await prisma.dealer.update({
        where: { id: dealerId },
        data: { status: 'APPROVED' },
      });

      // Update user role to DEALER
      await prisma.user.update({
        where: { id: dealer.userId },
        data: { role: 'DEALER' },
      });

      console.log(`Dealer request approved successfully`);
      return { message: 'Dealer approved successfully' };
    } catch (error) {
      console.error('Error approving dealer request:', error);
      throw createError('Failed to approve dealer request', 500);
    }
  }

  static async rejectDealerRequest(dealerId: string): Promise<any> {
    try {
      console.log(`Rejecting dealer request ${dealerId}`);
      
      const dealer = await prisma.dealer.findUnique({
        where: { id: dealerId },
        include: { user: true },
      });

      if (!dealer) {
        throw createError('Dealer not found', 404);
      }

      // Update dealer status to REJECTED
      await prisma.dealer.update({
        where: { id: dealerId },
        data: { status: 'REJECTED' },
      });

      // Update user role back to USER
      await prisma.user.update({
        where: { id: dealer.userId },
        data: { role: 'USER' },
      });

      console.log(`Dealer request rejected successfully`);
      return { message: 'Dealer rejected successfully' };
    } catch (error) {
      console.error('Error rejecting dealer request:', error);
      throw createError('Failed to reject dealer request', 500);
    }
  }

  static async getDealerTree(): Promise<any[]> {
    try {
      console.log('Building dealer tree...');
      
      // Get all dealers with their user info
      const allDealers = await prisma.dealer.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          children: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                }
              },
            }
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Build tree structure
      const buildTree = (dealers: any[], parentId: string | null = null, level: number = 0): any[] => {
        const nodes = dealers.filter(dealer => dealer.parentId === parentId);
        
        return nodes.map(dealer => {
          const children = buildTree(dealers, dealer.id, level + 1);
          
          // Calculate total children count (recursive)
          const totalChildren = children.reduce((sum, child) => sum + child.totalChildren + 1, 0);
          
          // Calculate total commission (recursive)
          const totalCommission = children.reduce((sum, child) => sum + child.totalCommission, 0) + dealer.commission;
          
          return {
            id: dealer.id,
            user: dealer.user,
            referralCode: dealer.referralCode,
            status: dealer.status,
            commission: dealer.commission,
            children: children,
            level: level,
            totalChildren: totalChildren,
            totalCommission: totalCommission,
          };
        });
      };

      const tree = buildTree(allDealers);
      console.log(`Built dealer tree with ${tree.length} root nodes`);
      
      return tree;
    } catch (error) {
      console.error('Error building dealer tree:', error);
      throw createError('Failed to build dealer tree', 500);
    }
  }

  static async blockUser(userId: string): Promise<{ message: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      if (user.role === 'ADMIN') {
        throw createError('Cannot block admin users', 400);
      }

      await prisma.user.update({
        where: { id: userId },
        data: { status: 'BLOCKED' },
      });

      return {
        message: 'User blocked successfully',
      };
    } catch (error) {
      throw createError('Failed to block user', 500);
    }
  }

  static async unblockUser(userId: string): Promise<{ message: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      await prisma.user.update({
        where: { id: userId },
        data: { status: 'ACTIVE' },
      });

      return {
        message: 'User unblocked successfully',
      };
    } catch (error) {
      throw createError('Failed to unblock user', 500);
    }
  }

  // Create new user (admin only)
  static async createUser(data: {
    email: string;
    name: string;
    password?: string;
    mobile?: string;
    aadhaar?: string;
    role: 'USER' | 'DEALER' | 'ADMIN';
  }): Promise<any> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });

      if (existingUser) {
        throw createError('User with this email already exists', 400);
      }

      // Hash password if provided
      let hashedPassword = null;
      if (data.password) {
        hashedPassword = await bcrypt.hash(data.password, 12);
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          name: data.name.trim(),
          password: hashedPassword,
          mobile: data.mobile?.trim() || null,
          aadhaar: data.aadhaar?.trim() || null,
          role: data.role,
        },
        include: {
          dealer: {
            select: {
              id: true,
              referralCode: true,
              status: true,
              commission: true,
            }
          }
        }
      });

      // If creating a dealer, create dealer record
      if (data.role === 'DEALER') {
        await prisma.dealer.create({
          data: {
            userId: user.id,
            referralCode: this.generateReferralCode(),
            status: 'APPROVED', // Auto-approve admin-created dealers
          },
        });
      }

      return user;
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        throw error;
      }
      throw createError('Failed to create user', 500);
    }
  }

  // Update user (admin only)
  static async updateUser(userId: string, data: {
    name?: string;
    mobile?: string;
    aadhaar?: string;
    role?: 'USER' | 'DEALER' | 'ADMIN';
  }): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          dealer: {
            select: {
              id: true,
              referralCode: true,
              status: true,
              commission: true,
            }
          }
        }
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      // Update user data
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name?.trim() || user.name,
          mobile: data.mobile?.trim() || user.mobile,
          aadhaar: data.aadhaar?.trim() || user.aadhaar,
          role: data.role || user.role,
        },
        include: {
          dealer: {
            select: {
              id: true,
              referralCode: true,
              status: true,
              commission: true,
            }
          }
        }
      });

      // Handle role changes
      if (data.role && data.role !== user.role) {
        if (data.role === 'DEALER' && user.role !== 'DEALER') {
          // Create dealer record if user is becoming a dealer
          await prisma.dealer.create({
            data: {
              userId: user.id,
              referralCode: this.generateReferralCode(),
              status: 'APPROVED',
            },
          });
        } else if (user.role === 'DEALER' && data.role !== 'DEALER') {
          // Remove dealer record if user is no longer a dealer
          await prisma.dealer.deleteMany({
            where: { userId: user.id },
          });
        }
      }

      return updatedUser;
    } catch (error) {
      throw createError('Failed to update user', 500);
    }
  }

  // Update user password (admin only)
  static async updateUserPassword(userId: string, password: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Update user password
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
        },
        include: {
          dealer: {
            select: {
              id: true,
              referralCode: true,
              status: true,
              commission: true,
            }
          }
        }
      });

      return updatedUser;
    } catch (error) {
      throw createError('Failed to update user password', 500);
    }
  }

  // Delete user (admin only)
  static async deleteUser(userId: string): Promise<{ message: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      if (user.role === 'ADMIN') {
        throw createError('Cannot delete admin users', 400);
      }

      // Delete related records first
      await prisma.$transaction([
        prisma.dealer.deleteMany({
          where: { userId },
        }),
        prisma.booking.deleteMany({
          where: { userId },
        }),
        prisma.user.delete({
          where: { id: userId },
        }),
      ]);

      return {
        message: 'User deleted successfully',
      };
    } catch (error) {
      throw createError('Failed to delete user', 500);
    }
  }

  // Update user profile picture (admin only)
  static async updateUserProfilePicture(userId: string, profilePicUrl: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { profilePic: profilePicUrl },
        include: {
          dealer: {
            select: {
              id: true,
              referralCode: true,
              status: true,
              commission: true,
            }
          }
        }
      });

      return updatedUser;
    } catch (error) {
      throw createError('Failed to update user profile picture', 500);
    }
  }

  // Update user aadhaar image (admin only)
  static async updateUserAadhaarImage(userId: string, aadhaarImageUrl: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { aadhaarImage: aadhaarImageUrl },
        include: {
          dealer: {
            select: {
              id: true,
              referralCode: true,
              status: true,
              commission: true,
            }
          }
        }
      });

      return updatedUser;
    } catch (error) {
      throw createError('Failed to update user aadhaar image', 500);
    }
  }

  // Get user by ID (admin only)
  static async getUserById(userId: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          dealer: {
            select: {
              id: true,
              referralCode: true,
              status: true,
              commission: true,
            }
          }
        }
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      return user;
    } catch (error) {
      throw createError('Failed to get user', 500);
    }
  }

  // Generate referral code for dealers
  private static generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
} 