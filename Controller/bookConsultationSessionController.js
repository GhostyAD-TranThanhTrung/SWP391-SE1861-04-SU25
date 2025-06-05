/**
 * Book Consultation Session Controller using TypeORM
 * Handles operations related to booking consultation sessions
 */
const AppDataSource = require("../src/data-source");
const BookConsultationSession = require("../src/entities/BookConsultationSession");
const Consultation = require("../src/entities/Consultation");
const User = require("../src/entities/User");

// Get all booked consultation sessions (admin/consultant only)
exports.getAllBookedSessions = async (req, res) => {
  try {
    // Role-based authorization check
    const userRole = req.user.role;
    if (userRole !== "Admin" && userRole !== "Consultant") {
      return res.status(403).json({
        error:
          "Only administrators and consultants can view all booked sessions",
      });
    }

    const bookSessionRepository = AppDataSource.getRepository(
      BookConsultationSession
    );
    const bookedSessions = await bookSessionRepository.find();

    // Format the response with user and consultation details
    const formattedSessions = await Promise.all(
      bookedSessions.map(async (session) => {
        // Get user information since relations are commented out
        const userRepository = AppDataSource.getRepository(User);
        const consultationRepository =
          AppDataSource.getRepository(Consultation);

        const consultant = await userRepository.findOne({
          where: { user_id: session.consultant_id },
        });

        const member = await userRepository.findOne({
          where: { user_id: session.member_id },
        });

        const consultation = await consultationRepository.findOne({
          where: { consultation_id: session.consultation_id },
        });

        return {
          consultationId: session.consultation_id,
          sessionNumber: session.session_number,
          consultant: consultant
            ? {
                userId: consultant.user_id,
                name: `${consultant.first_name} ${consultant.last_name}`,
                email: consultant.email,
              }
            : { userId: session.consultant_id, name: "Unknown Consultant" },
          member: member
            ? {
                userId: member.user_id,
                name: `${member.first_name} ${member.last_name}`,
                email: member.email,
              }
            : { userId: session.member_id, name: "Unknown Member" },
          consultationDetails: consultation
            ? {
                title: consultation.title,
                description: consultation.description,
                status: consultation.status,
                startDate: consultation.start_date,
                endDate: consultation.end_date,
              }
            : { title: "Unknown Consultation" },
        };
      })
    );

    res.json(formattedSessions);
  } catch (error) {
    console.error("Get all booked sessions error:", error);
    res.status(500).json({ error: "Error retrieving booked sessions" });
  }
};

// Get booked sessions by consultation ID
exports.getSessionsByConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Verify consultation exists and user has permission to view it
    const consultationRepository = AppDataSource.getRepository(Consultation);
    const consultation = await consultationRepository.findOne({
      where: { consultation_id: parseInt(consultationId) },
    });

    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    // Build query for booked sessions
    const bookSessionRepository = AppDataSource.getRepository(
      BookConsultationSession
    );
    const whereCondition = { consultation_id: parseInt(consultationId) };

    // If not admin or consultant, restrict to user's own sessions
    if (userRole !== "Admin" && userRole !== "Consultant") {
      whereCondition.member_id = userId;
    }

    const bookedSessions = await bookSessionRepository.find({
      where: whereCondition,
      order: { session_number: "ASC" },
    });

    // Format the response
    const formattedSessions = await Promise.all(
      bookedSessions.map(async (session) => {
        // Get user information
        const userRepository = AppDataSource.getRepository(User);

        const consultant = await userRepository.findOne({
          where: { user_id: session.consultant_id },
        });

        const member = await userRepository.findOne({
          where: { user_id: session.member_id },
        });

        return {
          consultationId: session.consultation_id,
          sessionNumber: session.session_number,
          consultant: consultant
            ? {
                userId: consultant.user_id,
                name: `${consultant.first_name} ${consultant.last_name}`,
                email: consultant.email,
              }
            : { userId: session.consultant_id, name: "Unknown Consultant" },
          member: member
            ? {
                userId: member.user_id,
                name: `${member.first_name} ${member.last_name}`,
                email: member.email,
              }
            : { userId: session.member_id, name: "Unknown Member" },
        };
      })
    );

    res.json(formattedSessions);
  } catch (error) {
    console.error("Get sessions by consultation error:", error);
    res.status(500).json({ error: "Error retrieving consultation sessions" });
  }
};

// Book a consultation session
exports.bookSession = async (req, res) => {
  try {
    const { consultationId, sessionNumber, consultantId } = req.body;
    const memberId = req.user.userId; // From JWT token

    // Validate required fields
    if (!consultationId || !sessionNumber || !consultantId) {
      return res.status(400).json({
        error:
          "Consultation ID, session number, and consultant ID are required",
      });
    }

    // Verify consultation exists
    const consultationRepository = AppDataSource.getRepository(Consultation);
    const consultation = await consultationRepository.findOne({
      where: { consultation_id: parseInt(consultationId) },
    });

    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    // Verify consultant exists and has consultant role
    const userRepository = AppDataSource.getRepository(User);
    const consultant = await userRepository.findOne({
      where: { user_id: parseInt(consultantId) },
    });

    if (!consultant) {
      return res.status(404).json({ error: "Consultant not found" });
    }

    if (consultant.role !== "Consultant") {
      return res.status(400).json({
        error: "Selected user is not a consultant",
      });
    }

    // Verify session is available (not already booked)
    const bookSessionRepository = AppDataSource.getRepository(
      BookConsultationSession
    );
    const existingBooking = await bookSessionRepository.findOne({
      where: {
        consultation_id: parseInt(consultationId),
        session_number: parseInt(sessionNumber),
      },
    });

    if (existingBooking) {
      return res.status(409).json({ error: "This session is already booked" });
    }

    // Verify session number is valid for the consultation
    if (sessionNumber < 1) {
      return res.status(400).json({
        error: "Invalid session number",
      });
    }

    // Create new booking
    const newBooking = bookSessionRepository.create({
      consultation_id: parseInt(consultationId),
      session_number: parseInt(sessionNumber),
      consultant_id: parseInt(consultantId),
      member_id: memberId,
    });

    await bookSessionRepository.save(newBooking);

    // Return success response
    res.status(201).json({
      message: "Consultation session booked successfully",
      booking: {
        consultationId: newBooking.consultation_id,
        sessionNumber: newBooking.session_number,
        consultantId: newBooking.consultant_id,
        memberId: newBooking.member_id,
      },
    });
  } catch (error) {
    console.error("Book session error:", error);
    res.status(500).json({
      error: "Failed to book consultation session. Please try again later.",
      details: error.message,
    });
  }
};

// Cancel a booked session
exports.cancelBooking = async (req, res) => {
  try {
    const { consultationId, sessionNumber } = req.params;
    const userId = req.user.userId; // From JWT token
    const userRole = req.user.role;

    const bookSessionRepository = AppDataSource.getRepository(
      BookConsultationSession
    );

    // Find booking
    const booking = await bookSessionRepository.findOne({
      where: {
        consultation_id: parseInt(consultationId),
        session_number: parseInt(sessionNumber),
      },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Authorization check - member can only cancel their own bookings unless admin/consultant
    const isConsultant =
      userRole === "Consultant" && booking.consultant_id === userId;
    const isAdmin = userRole === "Admin";
    const isMember = booking.member_id === userId;

    if (!isMember && !isConsultant && !isAdmin) {
      return res.status(403).json({
        error: "You do not have permission to cancel this booking",
      });
    }

    // Delete the booking
    await bookSessionRepository.remove(booking);

    // Return success response
    res.json({
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({
      error: "Failed to cancel booking. Please try again later.",
      details: error.message,
    });
  }
};

// Reassign a booked session to a different consultant
exports.reassignSession = async (req, res) => {
  try {
    const { consultationId, sessionNumber } = req.params;
    const { newConsultantId } = req.body;
    const userRole = req.user.role;

    // Only admins can reassign sessions
    if (userRole !== "Admin") {
      return res.status(403).json({
        error: "Only administrators can reassign sessions",
      });
    }

    // Validate input
    if (!newConsultantId) {
      return res.status(400).json({
        error: "New consultant ID is required",
      });
    }

    // Verify new consultant exists and has consultant role
    const userRepository = AppDataSource.getRepository(User);
    const consultant = await userRepository.findOne({
      where: { user_id: parseInt(newConsultantId) },
    });

    if (!consultant) {
      return res.status(404).json({ error: "New consultant not found" });
    }

    if (consultant.role !== "Consultant") {
      return res.status(400).json({
        error: "Selected user is not a consultant",
      });
    }

    const bookSessionRepository = AppDataSource.getRepository(
      BookConsultationSession
    );

    // Find booking
    const booking = await bookSessionRepository.findOne({
      where: {
        consultation_id: parseInt(consultationId),
        session_number: parseInt(sessionNumber),
      },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Create new booking with updated consultant_id
    // Due to composite primary key constraints, we need to delete and recreate
    await bookSessionRepository.remove(booking);

    const updatedBooking = bookSessionRepository.create({
      consultation_id: booking.consultation_id,
      session_number: booking.session_number,
      consultant_id: parseInt(newConsultantId),
      member_id: booking.member_id,
    });

    await bookSessionRepository.save(updatedBooking);

    // Return success response
    res.json({
      message: "Session reassigned successfully",
      booking: {
        consultationId: updatedBooking.consultation_id,
        sessionNumber: updatedBooking.session_number,
        consultantId: updatedBooking.consultant_id,
        memberId: updatedBooking.member_id,
      },
    });
  } catch (error) {
    console.error("Reassign session error:", error);
    res.status(500).json({
      error: "Failed to reassign session. Please try again later.",
      details: error.message,
    });
  }
};

// Get sessions booked by a specific member
exports.getSessionsByMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Authorization check - user can only view their own sessions unless admin/consultant
    if (
      parseInt(memberId) !== userId &&
      userRole !== "Admin" &&
      userRole !== "Consultant"
    ) {
      return res.status(403).json({
        error: "You do not have permission to view these sessions",
      });
    }

    const bookSessionRepository = AppDataSource.getRepository(
      BookConsultationSession
    );
    const bookedSessions = await bookSessionRepository.find({
      where: { member_id: parseInt(memberId) },
    });

    // Format the response with consultation details
    const formattedSessions = await Promise.all(
      bookedSessions.map(async (session) => {
        // Get related information
        const userRepository = AppDataSource.getRepository(User);
        const consultationRepository =
          AppDataSource.getRepository(Consultation);

        const consultant = await userRepository.findOne({
          where: { user_id: session.consultant_id },
        });

        const consultation = await consultationRepository.findOne({
          where: { consultation_id: session.consultation_id },
        });

        return {
          consultationId: session.consultation_id,
          sessionNumber: session.session_number,
          consultant: consultant
            ? {
                userId: consultant.user_id,
                name: `${consultant.first_name} ${consultant.last_name}`,
                email: consultant.email,
              }
            : { userId: session.consultant_id, name: "Unknown Consultant" },
          consultationDetails: consultation
            ? {
                title: consultation.title,
                description: consultation.description,
                status: consultation.status,
                startDate: consultation.start_date,
                endDate: consultation.end_date,
              }
            : { title: "Unknown Consultation" },
        };
      })
    );

    res.json(formattedSessions);
  } catch (error) {
    console.error("Get sessions by member error:", error);
    res.status(500).json({ error: "Error retrieving member sessions" });
  }
};

// Get sessions assigned to a specific consultant
exports.getSessionsByConsultant = async (req, res) => {
  try {
    const { consultantId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Authorization check - consultant can view their own sessions, admin can view any
    if (parseInt(consultantId) !== userId && userRole !== "Admin") {
      return res.status(403).json({
        error: "You do not have permission to view these sessions",
      });
    }

    // Verify user is actually a consultant
    const userRepository = AppDataSource.getRepository(User);
    const consultant = await userRepository.findOne({
      where: { user_id: parseInt(consultantId) },
    });

    if (
      !consultant ||
      (consultant.role !== "Consultant" && userRole !== "Admin")
    ) {
      return res.status(400).json({
        error: "Selected user is not a consultant",
      });
    }

    const bookSessionRepository = AppDataSource.getRepository(
      BookConsultationSession
    );
    const bookedSessions = await bookSessionRepository.find({
      where: { consultant_id: parseInt(consultantId) },
    });

    // Format the response with member and consultation details
    const formattedSessions = await Promise.all(
      bookedSessions.map(async (session) => {
        // Get related information
        const userRepository = AppDataSource.getRepository(User);
        const consultationRepository =
          AppDataSource.getRepository(Consultation);

        const member = await userRepository.findOne({
          where: { user_id: session.member_id },
        });

        const consultation = await consultationRepository.findOne({
          where: { consultation_id: session.consultation_id },
        });

        return {
          consultationId: session.consultation_id,
          sessionNumber: session.session_number,
          member: member
            ? {
                userId: member.user_id,
                name: `${member.first_name} ${member.last_name}`,
                email: member.email,
              }
            : { userId: session.member_id, name: "Unknown Member" },
          consultationDetails: consultation
            ? {
                title: consultation.title,
                description: consultation.description,
                status: consultation.status,
                startDate: consultation.start_date,
                endDate: consultation.end_date,
              }
            : { title: "Unknown Consultation" },
        };
      })
    );

    res.json(formattedSessions);
  } catch (error) {
    console.error("Get sessions by consultant error:", error);
    res.status(500).json({ error: "Error retrieving consultant sessions" });
  }
};

// Check if a session is available to book
exports.checkSessionAvailability = async (req, res) => {
  try {
    const { consultationId, sessionNumber } = req.params;

    // Verify consultation exists
    const consultationRepository = AppDataSource.getRepository(Consultation);
    const consultation = await consultationRepository.findOne({
      where: { consultation_id: parseInt(consultationId) },
    });

    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    // Check if session is already booked
    const bookSessionRepository = AppDataSource.getRepository(
      BookConsultationSession
    );
    const existingBooking = await bookSessionRepository.findOne({
      where: {
        consultation_id: parseInt(consultationId),
        session_number: parseInt(sessionNumber),
      },
    });

    const isAvailable = !existingBooking;

    // Return availability status
    res.json({
      consultationId: parseInt(consultationId),
      sessionNumber: parseInt(sessionNumber),
      isAvailable,
      consultationDetails: {
        title: consultation.title,
        startDate: consultation.start_date,
        endDate: consultation.end_date,
        status: consultation.status,
      },
    });
  } catch (error) {
    console.error("Check session availability error:", error);
    res.status(500).json({ error: "Error checking session availability" });
  }
};
