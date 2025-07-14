/**
 * Dashboard Controller
 * Uses existing controllers and service patterns to get dashboard statistics
 */
const AppDataSource = require("../src/data-source");
// Import entities
const User = require("../src/entities/User");
const BookingSession = require("../src/entities/BookingSession");
const Enroll = require("../src/entities/Enroll");
const Consultant = require("../src/entities/Consultant"); // Add this line

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
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const result = await enrollRepository
      .createQueryBuilder("")
      .select("COUNT(DISTINCT user_id)", "count")
      .where("start_at >= :startOfMonth", { startOfMonth })
      .andWhere("start_at <= :endOfMonth", { endOfMonth })
      .getRawOne(); //return object 'count'
    return parseInt(result.count) || 0;
  }

  /**
   * Get members created this month
   */
  static async getMonthlyCreatedMembers() {
    const userRepository = AppDataSource.getRepository(User);
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    return await userRepository
      .createQueryBuilder("user")
      .where("user.date_create >= :startOfMonth", { startOfMonth })
      .andWhere("user.date_create <= :endOfMonth", { endOfMonth })
      .andWhere("user.role = :role", { role: "member" })
      .getCount();
  }

  /**
   * Get active members count
   */
  static async getActiveMembers() {
    const userRepository = AppDataSource.getRepository(User);
    return await userRepository.count({
      where: {
        status: "active",
        role: "member",
      },
    });
  }

  /**
   * Get monthly booking sessions
   */
  static async getMonthlyBookingSessions() {
    const bookingRepository = AppDataSource.getRepository(BookingSession);
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    return await bookingRepository
      .createQueryBuilder("booking")
      .where("booking.booking_date >= :startOfMonth", { startOfMonth })
      .andWhere("booking.booking_date <= :endOfMonth", { endOfMonth })
      .getCount();
  }

  /**
   * Get comprehensive user statistics
   */
  static async getUserStatistics() {
    const userRepository = AppDataSource.getRepository(User);

    const [totalUsers, inactiveUsers, bannedUsers, roleDistribution] =
      await Promise.all([
        userRepository.count(),
        userRepository.count({ where: { status: "inactive" } }),
        userRepository.count({ where: { status: "banned" } }),
        userRepository
          .createQueryBuilder("user")
          .select("user.role", "role")
          .addSelect("COUNT(*)", "count")
          .groupBy("user.role")
          .getRawMany(),
      ]);

    return { totalUsers, inactiveUsers, bannedUsers, roleDistribution };
  }

  /**
   * Get comprehensive booking statistics
   */
  static async getBookingStatistics() {
    const bookingRepository = AppDataSource.getRepository(BookingSession);

    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
    ] = await Promise.all([
      bookingRepository.count(),
      bookingRepository.count({ where: { status: "Đang chờ xác nhận" } }),
      bookingRepository.count({ where: { status: "Đã xác nhận" } }),
      bookingRepository.count({ where: { status: "Đã hoàn thành" } }),
      bookingRepository.count({ where: { status: "Đã hủy" } }),
    ]);

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
    };
  }

  /**
   * Get total consultant count
   */
  static async getTotalConsultantCount() {
    const consultantRepository = AppDataSource.getRepository(Consultant);
    return await consultantRepository.count();
  }
}
/**
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
        totalMonthlyBookingSession,
        totalConsultants,
      ] = await Promise.all([
        DashboardService.getTotalMonthlyCourseEnrollment(),
        DashboardService.getMonthlyCreatedMembers(),
        DashboardService.getActiveMembers(),
        DashboardService.getMonthlyBookingSessions(),
        DashboardService.getTotalConsultantCount(),
      ]);

      const dashboardData = {
        memberStats: {
          totalMonthlyCourseEnrollment,
          monthlyCreatedMember,
          memberActiveCount,
          totalMonthlyBookingSession,
        },
        consultantStats: {
          totalConsultants,
        },
      };

      res.status(200).json({
        success: true,
        data: dashboardData,
        message: "Dashboard statistics retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting dashboard statistics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve dashboard statistics",
        error: error.message,
      });
    }
  }

  /**
   * Get detailed dashboard metrics
   * Returns extended dashboard data with additional statistics
   */
  static async getDetailedDashboard(req, res) {
    let { startDate, endDate } = req.query;
    try {
      // Use service methods to get basic stats

      if (!startDate || !endDate) {
        // If no dates provided, use current month
        const currentDate = new Date();
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        ).toISOString();
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
          23,
          59,
          59
        ).toISOString();
      }

      let
        totalMonthlyCourseEnrollment,
        monthlyCreatedMember,
        memberActiveCount,
        totalMonthlyBookingSession
      //dynamic data
      totalMonthlyBookingSession = await AppDataSource.getRepository(BookingSession)
        .createQueryBuilder("booking")
        .where("booking.booking_date >= :startDate", { startDate })
        .andWhere("booking.booking_date <= :endDate", { endDate })
        .getCount();
      totalMonthlyCourseEnrollment = await AppDataSource.getRepository(Enroll)
        .createQueryBuilder("enroll")
        .select("COUNT(DISTINCT enroll.user_id)", "count")
        .where("enroll.start_at >= :startDate", { startDate })
        .andWhere("enroll.start_at <= :endDate", { endDate })
        .getCount()
      monthlyCreatedMember = await AppDataSource.getRepository(User)
        .createQueryBuilder("user")
        .where("user.date_create >= :startDate", { startDate })
        .andWhere("user.date_create <= :endDate", { endDate })
        .andWhere("user.role = :role", { role: "member" })
        .getCount();
      memberActiveCount = await AppDataSource.getRepository(User)
        .createQueryBuilder("user")
        .where("user.status = :status", { status: "active" })
        .andWhere("user.date_create >= :startDate", { startDate })
        .andWhere("user.date_create <= :endDate", { endDate })
        .andWhere("user.role = :role", { role: "member" })
        .getCount();
      //end dynamic data
      const user = await AppDataSource.getRepository(User).createQueryBuilder("user")
        .where('user.date_create >= :startDate', { startDate })
        .andWhere('user.date_create <= :endDate', { endDate })

      const user_dis = await AppDataSource.query('select distinct role from Users')

      const booking = await AppDataSource.getRepository(BookingSession).createQueryBuilder("booking")
        .where("booking.booking_date >= :startDate", { startDate })
        .andWhere("booking.booking_date <= :endDate", { endDate })
      const detailedData = {
        // Main dashboard metrics (matching the basic endpoint)
        totalMonthlyCourseEnrollment,
        monthlyCreatedMember,
        memberActiveCount,
        totalMonthlyBookingSession,

        // Additional user metrics
        userStats: {
          total: await user.getCount(),
          active: await user.where('user.status = :status', { status: "active" }).getCount(),
          inactive: await user.where('user.status = :status', { status: "inactive" }).getCount(),
          banned: await user.where('user.status = :status', { status: "banned" }).getCount(),
          roleDistribution: await user_dis,
        },

        // Booking metrics
        bookingStats: {
          total: await booking.getCount(),
          confirmed: await booking.where('booking.status = :status ', { status: 'Lên lịch' }).getCount(),
          completed: await booking.where('booking.status = :status ', { status: 'Hoàn thành' }).getCount(),
          cancelled: await booking.where('booking.status = :status ', { status: 'Đã hủy' }).getCount(),
        },

        // Date range info
        dateRange: {
          startDate: startDate,
          endDate: endDate,
        },
      };

      res.status(200).json({
        success: true,
        data: detailedData,
        message: "Detailed dashboard data retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting detailed dashboard data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve detailed dashboard data",
        error: error.message,
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
        message: "Monthly course enrollment count retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting monthly course enrollment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve monthly course enrollment",
        error: error.message,
      });
    }
  }

  static async getMonthlyCreatedMembers(req, res) {
    try {
      const count = await DashboardService.getMonthlyCreatedMembers();
      res.status(200).json({
        success: true,
        data: { monthlyCreatedMember: count },
        message: "Monthly created members count retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting monthly created members:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve monthly created members",
        error: error.message,
      });
    }
  }

  static async getActiveMembers(req, res) {
    try {
      const count = await DashboardService.getActiveMembers();
      res.status(200).json({
        success: true,
        data: { memberActiveCount: count },
        message: "Active members count retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting active members:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve active members",
        error: error.message,
      });
    }
  }

  static async getMonthlyBookingSessions(req, res) {
    try {
      const count = await DashboardService.getMonthlyBookingSessions();
      res.status(200).json({
        success: true,
        data: { totalMonthlyBookingSession: count },
        message: "Monthly booking sessions count retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting monthly booking sessions:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve monthly booking sessions",
        error: error.message,
      });
    }
  }

  /**
   * Get consultant dashboard metrics
   * Returns basic consultant statistics
   */
  static async getConsultantDashboard(req, res) {
    try {
      const consultantCount = await DashboardService.getTotalConsultantCount();

      res.status(200).json({
        success: true,
        data: {
          totalConsultants: consultantCount,
        },
        message: "Consultant dashboard statistics retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting consultant dashboard:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve consultant dashboard statistics",
        error: error.message,
      });
    }
  }
}

module.exports = DashboardController;
