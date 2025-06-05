/**
 * Consultation Controller using TypeORM
 * Handles consultation operations with TypeORM
 */
const AppDataSource = require("../src/data-source");
const Consultation = require("../src/entities/Consultation");
const BookConsultationSession = require("../src/entities/BookConsultationSession");
const User = require("../src/entities/User");

// Get all consultations
exports.getAllConsultations = async (req, res) => {
  try {
    const consultationRepository = AppDataSource.getRepository(Consultation);
    const consultations = await consultationRepository.find();

    // Format the response
    const formattedConsultations = consultations.map((consultation) => ({
      consultationId: consultation.consultation_id,
      scheduledTime: consultation.scheduled_time,
      meetingLink: consultation.meeting_link,
      note: consultation.note,
      status: consultation.status,
    }));

    res.json(formattedConsultations);
  } catch (error) {
    console.error("Get all consultations error:", error);
    res.status(500).json({ error: "Error retrieving consultations" });
  }
};

// Get a single consultation by ID
exports.getConsultationById = async (req, res) => {
  try {
    const { consultationId } = req.params;

    const consultationRepository = AppDataSource.getRepository(Consultation);
    const sessionRepository = AppDataSource.getRepository(
      BookConsultationSession
    );

    const consultation = await consultationRepository.findOne({
      where: { consultation_id: parseInt(consultationId) },
    });

    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    // Get related consultation sessions
    const sessions = await sessionRepository.find({
      where: { consultation_id: parseInt(consultationId) },
      relations: ["consultant", "member"],
    });

    // Format sessions data
    const formattedSessions = sessions.map((session) => ({
      sessionNumber: session.session_number,
      consultant: session.consultant
        ? {
            userId: session.consultant.user_id,
            email: session.consultant.email,
            role: session.consultant.role,
          }
        : null,
      member: session.member
        ? {
            userId: session.member.user_id,
            email: session.member.email,
            role: session.member.role,
          }
        : null,
    }));

    // Format response
    const formattedConsultation = {
      consultationId: consultation.consultation_id,
      scheduledTime: consultation.scheduled_time,
      meetingLink: consultation.meeting_link,
      note: consultation.note,
      status: consultation.status,
      sessions: formattedSessions,
    };

    res.json(formattedConsultation);
  } catch (error) {
    console.error("Get consultation by ID error:", error);
    res.status(500).json({ error: "Error retrieving consultation" });
  }
};

// Create a new consultation
exports.createConsultation = async (req, res) => {
  try {
    const { scheduledTime, meetingLink, note, status = "scheduled" } = req.body;
    const { sessionParticipants } = req.body;

    // Basic validation
    if (!scheduledTime) {
      return res.status(400).json({ error: "Scheduled time is required" });
    }

    if (
      !sessionParticipants ||
      !Array.isArray(sessionParticipants) ||
      sessionParticipants.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "At least one session participant is required" });
    }

    // Start a transaction
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      // Create new consultation
      const consultationRepository =
        transactionalEntityManager.getRepository(Consultation);
      const sessionRepository = transactionalEntityManager.getRepository(
        BookConsultationSession
      );
      const userRepository = transactionalEntityManager.getRepository(User);

      const newConsultation = consultationRepository.create({
        scheduled_time: new Date(scheduledTime),
        meeting_link: meetingLink,
        note: note,
        status: status,
      });

      const savedConsultation = await consultationRepository.save(
        newConsultation
      );

      // Create consultation sessions
      const sessions = [];
      for (const participant of sessionParticipants) {
        const { sessionNumber, consultantId, memberId } = participant;

        // Verify consultant and member exist
        const consultant = await userRepository.findOne({
          where: { user_id: consultantId },
        });

        const member = await userRepository.findOne({
          where: { user_id: memberId },
        });

        if (!consultant) {
          throw new Error(`Consultant with ID ${consultantId} not found`);
        }

        if (!member) {
          throw new Error(`Member with ID ${memberId} not found`);
        }

        // Create session
        const session = sessionRepository.create({
          consultation_id: savedConsultation.consultation_id,
          session_number: sessionNumber,
          consultant_id: consultantId,
          member_id: memberId,
        });

        sessions.push(await sessionRepository.save(session));
      }

      // Return success response
      res.status(201).json({
        message: "Consultation created successfully",
        consultation: {
          consultationId: savedConsultation.consultation_id,
          scheduledTime: savedConsultation.scheduled_time,
          meetingLink: savedConsultation.meeting_link,
          note: savedConsultation.note,
          status: savedConsultation.status,
          sessions: sessions.map((session) => ({
            sessionNumber: session.session_number,
            consultantId: session.consultant_id,
            memberId: session.member_id,
          })),
        },
      });
    });
  } catch (error) {
    console.error("Create consultation error:", error);
    res.status(500).json({
      error: "Failed to create consultation. Please try again later.",
      details: error.message,
    });
  }
};

// Update an existing consultation
exports.updateConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { scheduledTime, meetingLink, note, status } = req.body;
    const userRole = req.user.role; // From JWT token

    // Validate request
    if (!scheduledTime && !meetingLink && !note && !status) {
      return res
        .status(400)
        .json({ error: "At least one field to update is required" });
    }

    // Only allow admins and consultants to update consultations
    if (userRole !== "Admin" && userRole !== "Consultant") {
      return res
        .status(403)
        .json({ error: "Not authorized to update consultations" });
    }

    const consultationRepository = AppDataSource.getRepository(Consultation);

    // Find the consultation to update
    const consultation = await consultationRepository.findOne({
      where: { consultation_id: parseInt(consultationId) },
    });

    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    // Update consultation fields
    if (scheduledTime) consultation.scheduled_time = new Date(scheduledTime);
    if (meetingLink) consultation.meeting_link = meetingLink;
    if (note) consultation.note = note;
    if (status) consultation.status = status;

    // Save changes
    const updatedConsultation = await consultationRepository.save(consultation);

    res.json({
      message: "Consultation updated successfully",
      consultation: {
        consultationId: updatedConsultation.consultation_id,
        scheduledTime: updatedConsultation.scheduled_time,
        meetingLink: updatedConsultation.meeting_link,
        note: updatedConsultation.note,
        status: updatedConsultation.status,
      },
    });
  } catch (error) {
    console.error("Update consultation error:", error);
    res.status(500).json({
      error: "Failed to update consultation. Please try again later.",
    });
  }
};

// Delete a consultation
exports.deleteConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const userRole = req.user.role; // From JWT token

    // Only allow admins to delete consultations
    if (userRole !== "Admin") {
      return res
        .status(403)
        .json({ error: "Not authorized to delete consultations" });
    }

    const consultationRepository = AppDataSource.getRepository(Consultation);
    const sessionRepository = AppDataSource.getRepository(
      BookConsultationSession
    );

    // Find the consultation to delete
    const consultation = await consultationRepository.findOne({
      where: { consultation_id: parseInt(consultationId) },
    });

    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    // Start a transaction to delete both the sessions and consultation
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      // First delete all related sessions
      await transactionalEntityManager
        .createQueryBuilder()
        .delete()
        .from(BookConsultationSession)
        .where("consultation_id = :id", { id: consultationId })
        .execute();

      // Then delete the consultation
      await transactionalEntityManager.remove(consultation);
    });

    res.json({
      message: "Consultation and related sessions deleted successfully",
    });
  } catch (error) {
    console.error("Delete consultation error:", error);
    res.status(500).json({
      error: "Failed to delete consultation. Please try again later.",
    });
  }
};

// Get consultations by consultant ID
exports.getConsultationsByConsultant = async (req, res) => {
  try {
    const { consultantId } = req.params;

    // Get all session entries for this consultant
    const sessionRepository = AppDataSource.getRepository(
      BookConsultationSession
    );
    const consultationRepository = AppDataSource.getRepository(Consultation);

    const sessions = await sessionRepository.find({
      where: { consultant_id: parseInt(consultantId) },
    });

    if (sessions.length === 0) {
      return res.json({
        message: "No consultations found for this consultant",
        consultations: [],
      });
    }

    // Get unique consultation IDs
    const consultationIds = [
      ...new Set(sessions.map((session) => session.consultation_id)),
    ];

    // Get consultation details
    const consultations = await consultationRepository.find({
      where: consultationIds.map((id) => ({ consultation_id: id })),
    });

    // Format the response
    const formattedConsultations = consultations.map((consultation) => ({
      consultationId: consultation.consultation_id,
      scheduledTime: consultation.scheduled_time,
      meetingLink: consultation.meeting_link,
      note: consultation.note,
      status: consultation.status,
    }));

    res.json(formattedConsultations);
  } catch (error) {
    console.error("Get consultations by consultant error:", error);
    res.status(500).json({ error: "Error retrieving consultations" });
  }
};

// Get consultations by member ID
exports.getConsultationsByMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    // Get all session entries for this member
    const sessionRepository = AppDataSource.getRepository(
      BookConsultationSession
    );
    const consultationRepository = AppDataSource.getRepository(Consultation);

    const sessions = await sessionRepository.find({
      where: { member_id: parseInt(memberId) },
    });

    if (sessions.length === 0) {
      return res.json({
        message: "No consultations found for this member",
        consultations: [],
      });
    }

    // Get unique consultation IDs
    const consultationIds = [
      ...new Set(sessions.map((session) => session.consultation_id)),
    ];

    // Get consultation details
    const consultations = await consultationRepository.find({
      where: consultationIds.map((id) => ({ consultation_id: id })),
    });

    // Format the response
    const formattedConsultations = consultations.map((consultation) => ({
      consultationId: consultation.consultation_id,
      scheduledTime: consultation.scheduled_time,
      meetingLink: consultation.meeting_link,
      note: consultation.note,
      status: consultation.status,
    }));

    res.json(formattedConsultations);
  } catch (error) {
    console.error("Get consultations by member error:", error);
    res.status(500).json({ error: "Error retrieving consultations" });
  }
};

// Add participant to a consultation session
exports.addParticipant = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { sessionNumber, participantId, participantType } = req.body;
    const userRole = req.user.role; // From JWT token

    // Validate input
    if (!sessionNumber || !participantId || !participantType) {
      return res.status(400).json({
        error:
          "Session number, participant ID, and participant type are required",
      });
    }

    // Validate participant type
    if (participantType !== "consultant" && participantType !== "member") {
      return res.status(400).json({
        error: "Participant type must be either 'consultant' or 'member'",
      });
    }

    // Only admins and consultants can add participants
    if (userRole !== "Admin" && userRole !== "Consultant") {
      return res
        .status(403)
        .json({ error: "Not authorized to modify consultation participants" });
    }

    const consultationRepository = AppDataSource.getRepository(Consultation);
    const sessionRepository = AppDataSource.getRepository(
      BookConsultationSession
    );
    const userRepository = AppDataSource.getRepository(User);

    // Verify consultation exists
    const consultation = await consultationRepository.findOne({
      where: { consultation_id: parseInt(consultationId) },
    });

    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    // Verify participant exists and has the correct role
    const participant = await userRepository.findOne({
      where: { user_id: participantId },
    });

    if (!participant) {
      return res.status(404).json({ error: "Participant not found" });
    }

    if (participantType === "consultant" && participant.role !== "Consultant") {
      return res.status(400).json({ error: "User is not a consultant" });
    }

    // Create a new session entry
    const newSession = sessionRepository.create({
      consultation_id: parseInt(consultationId),
      session_number: sessionNumber,
      consultant_id: participantType === "consultant" ? participantId : null,
      member_id: participantType === "member" ? participantId : null,
    });

    await sessionRepository.save(newSession);

    res.status(201).json({
      message: "Participant added successfully to consultation session",
      session: {
        consultationId: parseInt(consultationId),
        sessionNumber: sessionNumber,
        participantId: participantId,
        participantType: participantType,
      },
    });
  } catch (error) {
    console.error("Add participant error:", error);
    res.status(500).json({
      error:
        "Failed to add participant to consultation session. Please try again later.",
      details: error.message,
    });
  }
};

// Get upcoming consultations
exports.getUpcomingConsultations = async (req, res) => {
  try {
    const consultationRepository = AppDataSource.getRepository(Consultation);

    const now = new Date();

    // Find consultations scheduled in the future
    const consultations = await consultationRepository
      .createQueryBuilder("consultation")
      .where("consultation.scheduled_time > :now", { now })
      .andWhere("consultation.status != :cancelledStatus", {
        cancelledStatus: "cancelled",
      })
      .orderBy("consultation.scheduled_time", "ASC")
      .getMany();

    // Format the response
    const formattedConsultations = consultations.map((consultation) => ({
      consultationId: consultation.consultation_id,
      scheduledTime: consultation.scheduled_time,
      meetingLink: consultation.meeting_link,
      note: consultation.note,
      status: consultation.status,
    }));

    res.json(formattedConsultations);
  } catch (error) {
    console.error("Get upcoming consultations error:", error);
    res.status(500).json({ error: "Error retrieving upcoming consultations" });
  }
};
