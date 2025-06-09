/**
 * Dashboard Controller
 * Uses existing controllers and service patterns to get dashboard statistics
 */
const AppDataSource = require('../src/data-source');

// Import entities
const User = require('../src/entities/User');
const BookingSession = require('../src/entities/BookingSession');
const Enroll = require('../src/entities/Enroll');



/**
 * Dashboard Service - Internal service methods for statistical data
 * These methods provide the specific metrics needed for dashboard
 */
class DashboardService {
    /**
     * Get unique users who enrolled in courses this month
     */
    static async getTotalMonthlyCourseEnrollment() {
        const enrollRepository = AppDataSource.getRepository(Enroll);
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

        const result = await enrollRepository.createQueryBuilder('')
            .select('COUNT(DISTINCT user_id)', 'count')
            .where('start_at >= :startOfMonth', { startOfMonth })
            .andWhere('start_at <= :endOfMonth', { endOfMonth })
            .getRawOne();//return object 'count'
        return parseInt(result.count) || 0;
    }

    /**
     * Get members created this month
     */
    static async getMonthlyCreatedMembers() {
        const userRepository = AppDataSource.getRepository(User);
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

        return await userRepository.createQueryBuilder('user')
            .where('user.date_create >= :startOfMonth', { startOfMonth })
            .andWhere('user.date_create <= :endOfMonth', { endOfMonth })
            .andWhere('user.role = :role', { role: 'member' })
            .getCount();
    }

    /**
     * Get active members count
     */
    static async getActiveMembers() {
        const userRepository = AppDataSource.getRepository(User);
        return await userRepository.count({
            where: {
                status: 'active',
                role: 'member'
            }
        });
    }

    /**
     * Get monthly booking sessions
     */
    static async getMonthlyBookingSessions() {
        const bookingRepository = AppDataSource.getRepository(BookingSession);
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

        return await bookingRepository.createQueryBuilder('booking')
            .where('booking.booking_date >= :startOfMonth', { startOfMonth })
            .andWhere('booking.booking_date <= :endOfMonth', { endOfMonth })
            .getCount();
    }

    /**
     * Get comprehensive user statistics
     */
    static async getUserStatistics() {
        const userRepository = AppDataSource.getRepository(User);

        const [totalUsers, inactiveUsers, bannedUsers, roleDistribution] = await Promise.all([
            userRepository.count(),
            userRepository.count({ where: { status: 'inactive' } }),
            userRepository.count({ where: { status: 'banned' } }),
            userRepository.createQueryBuilder('user')
                .select('user.role', 'role')
                .addSelect('COUNT(*)', 'count')
                .groupBy('user.role')
                .getRawMany()
        ]);

        return { totalUsers, inactiveUsers, bannedUsers, roleDistribution };
    }

    /**
     * Get comprehensive booking statistics
     */
    static async getBookingStatistics() {
        const bookingRepository = AppDataSource.getRepository(BookingSession);

        const [totalBookings, pendingBookings, confirmedBookings, completedBookings, cancelledBookings] = await Promise.all([
            bookingRepository.count(),
            bookingRepository.count({ where: { status: 'pending' } }),
            bookingRepository.count({ where: { status: 'confirmed' } }),
            bookingRepository.count({ where: { status: 'completed' } }),
            bookingRepository.count({ where: { status: 'cancelled' } })
        ]);

        return { totalBookings, pendingBookings, confirmedBookings, completedBookings, cancelledBookings };
    }
}/**
 * Dashboard Controller
 * Provides dashboard metrics using the DashboardService
 */
class DashboardController {
    /**
     * Get basic dashboard statistics
     * Returns the 4 main metrics: totalMonthlyCourseEnrollment, monthlyCreatedMember, 
     * memberActiveCount, totalMonthlyBookingSession
     */
    static async getDashboardStats(req, res) {
        try {
            // Use service methods to get all statistics
            const [
                totalMonthlyCourseEnrollment,
                monthlyCreatedMember,
                memberActiveCount,
                totalMonthlyBookingSession
            ] = await Promise.all([
                DashboardService.getTotalMonthlyCourseEnrollment(),
                DashboardService.getMonthlyCreatedMembers(),
                DashboardService.getActiveMembers(),
                DashboardService.getMonthlyBookingSessions()
            ]);

            const dashboardData = {
                totalMonthlyCourseEnrollment,
                monthlyCreatedMember,
                memberActiveCount,
                totalMonthlyBookingSession
            };

            res.status(200).json({
                success: true,
                data: dashboardData,
                message: 'Dashboard statistics retrieved successfully'
            });

        } catch (error) {
            console.error('Error getting dashboard statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve dashboard statistics',
                error: error.message
            });
        }
    }

    /**
     * Get detailed dashboard metrics
     * Returns extended dashboard data with additional statistics
     */
    static async getDetailedDashboard(req, res) {
        try {
            // Use service methods to get basic stats
            const [
                totalMonthlyCourseEnrollment,
                monthlyCreatedMember,
                memberActiveCount,
                totalMonthlyBookingSession,
                userStats,
                bookingStats
            ] = await Promise.all([
                DashboardService.getTotalMonthlyCourseEnrollment(),
                DashboardService.getMonthlyCreatedMembers(),
                DashboardService.getActiveMembers(),
                DashboardService.getMonthlyBookingSessions(),
                DashboardService.getUserStatistics(),
                DashboardService.getBookingStatistics()
            ]);

            // Current month info
            const currentDate = new Date();
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

            const detailedData = {
                // Main dashboard metrics (matching the basic endpoint)
                totalMonthlyCourseEnrollment,
                monthlyCreatedMember,
                memberActiveCount,
                totalMonthlyBookingSession,

                // Additional user metrics
                userStats: {
                    total: userStats.totalUsers,
                    active: memberActiveCount,
                    inactive: userStats.inactiveUsers,
                    banned: userStats.bannedUsers,
                    roleDistribution: userStats.roleDistribution
                },

                // Booking metrics
                bookingStats: {
                    total: bookingStats.totalBookings,
                    monthly: totalMonthlyBookingSession,
                    pending: bookingStats.pendingBookings,
                    confirmed: bookingStats.confirmedBookings,
                    completed: bookingStats.completedBookings,
                    cancelled: bookingStats.cancelledBookings
                },

                // Current month info
                currentMonth: {
                    name: currentDate.toLocaleString('default', { month: 'long' }),
                    year: currentDate.getFullYear(),
                    startDate: startOfMonth.toISOString(),
                    endDate: endOfMonth.toISOString()
                }
            };

            res.status(200).json({
                success: true,
                data: detailedData,
                message: 'Detailed dashboard data retrieved successfully'
            });

        } catch (error) {
            console.error('Error getting detailed dashboard data:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve detailed dashboard data',
                error: error.message
            });
        }
    }

    /**
     * Get specific metric endpoints for individual statistics
     * These can be called individually if needed
     */
    static async getMonthlyCourseEnrollment(req, res) {
        try {
            const count = await DashboardService.getTotalMonthlyCourseEnrollment();
            res.status(200).json({
                success: true,
                data: { totalMonthlyCourseEnrollment: count },
                message: 'Monthly course enrollment count retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting monthly course enrollment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve monthly course enrollment',
                error: error.message
            });
        }
    }

    static async getMonthlyCreatedMembers(req, res) {
        try {
            const count = await DashboardService.getMonthlyCreatedMembers();
            res.status(200).json({
                success: true,
                data: { monthlyCreatedMember: count },
                message: 'Monthly created members count retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting monthly created members:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve monthly created members',
                error: error.message
            });
        }
    }

    static async getActiveMembers(req, res) {
        try {
            const count = await DashboardService.getActiveMembers();
            res.status(200).json({
                success: true,
                data: { memberActiveCount: count },
                message: 'Active members count retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting active members:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve active members',
                error: error.message
            });
        }
    }

    static async getMonthlyBookingSessions(req, res) {
        try {
            const count = await DashboardService.getMonthlyBookingSessions();
            res.status(200).json({
                success: true,
                data: { totalMonthlyBookingSession: count },
                message: 'Monthly booking sessions count retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting monthly booking sessions:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve monthly booking sessions',
                error: error.message
            });
        }
    }
}

module.exports = DashboardController;


