/**
 * Comprehensive Consultant Controller using TypeORM
 * Complete CRUD operations for Consultant with all related entities:
 * - User (authentication & basic info)
 * - Profile (personal details)
 * - Consultant (professional info)
 * - ConsultantSlot (availability schedule)
 * - Slot (time slots)
 */
const AppDataSource = require("../src/data-source");
const Consultant = require("../src/entities/Consultant");
const User = require("../src/entities/User");
const Profile = require("../src/entities/Profile");
const ConsultantSlot = require("../src/entities/ConsultantSlot");
const Slot = require("../src/entities/Slot");
const BookingSession = require("../src/entities/BookingSession");

class ConsultantCompleteController {
  /**
   * Get all consultants with complete related data including availability slots
   */
  static async getAllConsultantsComplete(req, res) {
    try {
      const consultantRepository = AppDataSource.getRepository(Consultant);
      const profileRepository = AppDataSource.getRepository(Profile);
      const consultantSlotRepository = AppDataSource.getRepository(ConsultantSlot);
      const slotRepository = AppDataSource.getRepository(Slot);

      // Get all consultants with user data
      const consultants = await consultantRepository.find({
        relations: {
          user: true,
        },
      });

      // Get all profiles
      const profiles = await profileRepository.find();
      const profileMap = new Map();
      profiles.forEach((profile) => profileMap.set(profile.user_id, profile));

      // Get all consultant slots and slots
      const consultantSlots = await consultantSlotRepository.find({
        relations: {
          slot: true,
        },
      });

      // Group slots by consultant ID
      const slotsByConsultant = new Map();
      consultantSlots.forEach((cs) => {
        if (!slotsByConsultant.has(cs.consultant_id)) {
          slotsByConsultant.set(cs.consultant_id, []);
        }
        slotsByConsultant.get(cs.consultant_id).push({
          slot_id: cs.slot_id,
          day_of_week: cs.day_of_week,
          start_time: cs.slot.start_time,
          end_time: cs.slot.end_time,
        });
      });

      // Transform the data to include ALL related information
      const completeConsultantDetails = consultants.map((consultant) => {
        const profile = profileMap.get(consultant.user_id);
        const availabilitySlots = slotsByConsultant.get(consultant.id_consultant) || [];

        return {
          // Consultant table fields
          id_consultant: consultant.id_consultant,
          cost: consultant.cost,
          certification: consultant.certification,
          speciality: consultant.speciality,

          // Users table fields (excluding password for security)
          user_id: consultant.user_id,
          date_create: consultant.user?.date_create,
          role: consultant.user?.role,
          status: consultant.user?.status,
          email: consultant.user?.email,
          img_link: consultant.user?.img_link,

          // Profile table fields
          name: profile?.name,
          bio_json: profile?.bio_json,
          date_of_birth: profile?.date_of_birth,
          job: profile?.job,

          // Availability slots
          availability_slots: availabilitySlots,
        };
      });

      res.status(200).json({
        success: true,
        data: {
          totalConsultants: consultants.length,
          consultants: completeConsultantDetails,
        },
        message: "Complete consultant data retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting complete consultants:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve complete consultant data",
        error: error.message,
      });
    }
  }

  /**
   * Get consultant by ID with complete related data including availability slots
   */
  static async getConsultantCompleteById(req, res) {
    try {
      const { consultantId } = req.params;
      const consultantRepository = AppDataSource.getRepository(Consultant);
      const profileRepository = AppDataSource.getRepository(Profile);
      const consultantSlotRepository = AppDataSource.getRepository(ConsultantSlot);

      // Get consultant with user data
      const consultant = await consultantRepository.findOne({
        where: { id_consultant: parseInt(consultantId) },
        relations: {
          user: true,
        },
      });

      if (!consultant) {
        return res.status(404).json({
          success: false,
          message: "Consultant not found",
        });
      }

      // Get profile information
      const profile = await profileRepository.findOne({
        where: { user_id: consultant.user_id },
      });

      // Get availability slots
      const consultantSlots = await consultantSlotRepository.find({
        where: { consultant_id: consultant.id_consultant },
        relations: {
          slot: true,
        },
      });

      const availabilitySlots = consultantSlots.map((cs) => ({
        slot_id: cs.slot_id,
        day_of_week: cs.day_of_week,
        start_time: cs.slot.start_time,
        end_time: cs.slot.end_time,
      }));

      // Format complete consultant information
      const completeConsultantDetail = {
        // Consultant table fields
        id_consultant: consultant.id_consultant,
        cost: consultant.cost,
        certification: consultant.certification,
        speciality: consultant.speciality,

        // Users table fields (excluding password for security)
        user_id: consultant.user_id,
        date_create: consultant.user?.date_create,
        role: consultant.user?.role,
        status: consultant.user?.status,
        email: consultant.user?.email,
        img_link: consultant.user?.img_link,

        // Profile table fields
        name: profile?.name,
        bio_json: profile?.bio_json,
        date_of_birth: profile?.date_of_birth,
        job: profile?.job,

        // Availability slots
        availability_slots: availabilitySlots,
      };

      res.status(200).json({
        success: true,
        data: completeConsultantDetail,
        message: "Complete consultant data retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting complete consultant:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve complete consultant data",
        error: error.message,
      });
    }
  }

  /**
   * Create new consultant with complete data including availability slots
   */
  static async createConsultantComplete(req, res) {
    try {
      const {
        // User table fields
        role, password, status, email, img_link,
        // Consultant table fields
        cost, certification, speciality,
        // Profile table fields
        name, bio_json, date_of_birth, job,
        // Availability slots - array of {day_of_week, start_time, end_time}
        availability_slots = []
      } = req.body;

      // Validate required fields
      if (!email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: "Email, password, and role are required",
        });
      }

      const userRepository = AppDataSource.getRepository(User);
      const consultantRepository = AppDataSource.getRepository(Consultant);
      const profileRepository = AppDataSource.getRepository(Profile);
      const slotRepository = AppDataSource.getRepository(Slot);
      const consultantSlotRepository = AppDataSource.getRepository(ConsultantSlot);

      // Check if user already exists with this email
      const existingUser = await userRepository.findOne({
        where: { email: email },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "A user with this email already exists",
        });
      }

      // Start transaction to ensure data integrity
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // 1. Create new user
        const newUser = queryRunner.manager.create(User, {
          role: role,
          password: password, // Note: In production, this should be hashed
          status: status || 'active',
          email: email,
          img_link: img_link || null,
        });

        const savedUser = await queryRunner.manager.save(newUser);

        // 2. Create consultant profile
        const newConsultant = queryRunner.manager.create(Consultant, {
          user_id: savedUser.user_id,
          cost: cost || null,
          certification: certification || null,
          speciality: speciality || null,
        });

        const savedConsultant = await queryRunner.manager.save(newConsultant);

        // 3. Create profile if profile data is provided
        let savedProfile = null;
        if (name || bio_json || date_of_birth || job) {
          const newProfile = queryRunner.manager.create(Profile, {
            user_id: savedUser.user_id,
            name: name || null,
            bio_json: bio_json || null,
            date_of_birth: date_of_birth || null,
            job: job || null,
          });

          savedProfile = await queryRunner.manager.save(newProfile);
        }

        // 4. Create availability slots
        const createdSlots = [];
        for (const slotData of availability_slots) {
          const { day_of_week, start_time, end_time } = slotData;

          // Check if slot with these times already exists
          let slot = await queryRunner.manager.findOne(Slot, {
            where: { start_time, end_time },
          });

          // Create slot if it doesn't exist
          if (!slot) {
            const newSlot = queryRunner.manager.create(Slot, {
              start_time,
              end_time,
            });
            slot = await queryRunner.manager.save(newSlot);
          }

          // Create consultant slot relationship
          const consultantSlot = queryRunner.manager.create(ConsultantSlot, {
            consultant_id: savedConsultant.id_consultant,
            slot_id: slot.slot_id,
            day_of_week: day_of_week,
          });

          await queryRunner.manager.save(consultantSlot);

          createdSlots.push({
            slot_id: slot.slot_id,
            day_of_week: day_of_week,
            start_time: slot.start_time,
            end_time: slot.end_time,
          });
        }

        await queryRunner.commitTransaction();

        // Return complete consultant data
        const completeConsultantData = {
          // Consultant table fields
          id_consultant: savedConsultant.id_consultant,
          cost: savedConsultant.cost,
          certification: savedConsultant.certification,
          speciality: savedConsultant.speciality,

          // Users table fields (excluding password for security)
          user_id: savedUser.user_id,
          date_create: savedUser.date_create,
          role: savedUser.role,
          status: savedUser.status,
          email: savedUser.email,
          img_link: savedUser.img_link,

          // Profile table fields
          name: savedProfile?.name,
          bio_json: savedProfile?.bio_json,
          date_of_birth: savedProfile?.date_of_birth,
          job: savedProfile?.job,

          // Availability slots
          availability_slots: createdSlots,
        };

        res.status(201).json({
          success: true,
          data: completeConsultantData,
          message: "Consultant created successfully with complete profile and availability",
        });

      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }

    } catch (error) {
      console.error("Error creating complete consultant:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create complete consultant",
        error: error.message,
      });
    }
  }

  /**
   * Update consultant with complete data including availability slots
   */
  static async updateConsultantComplete(req, res) {
    try {
      const { id } = req.params;
      const {
        // User table fields
        role, status, email, img_link,
        // Consultant table fields
        cost, certification, speciality,
        // Profile table fields
        name, bio_json, date_of_birth, job,
        // Availability slots - array of {day_of_week, start_time, end_time}
        availability_slots
      } = req.body;

      const consultantRepository = AppDataSource.getRepository(Consultant);
      const userRepository = AppDataSource.getRepository(User);
      const profileRepository = AppDataSource.getRepository(Profile);
      const slotRepository = AppDataSource.getRepository(Slot);
      const consultantSlotRepository = AppDataSource.getRepository(ConsultantSlot);

      // Check if consultant exists
      const consultant = await consultantRepository.findOne({
        where: { id_consultant: parseInt(id) },
        relations: { user: true },
      });

      if (!consultant) {
        return res.status(404).json({
          success: false,
          message: "Consultant not found",
        });
      }

      // Start transaction to ensure data integrity
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // 1. Update consultant fields
        if (cost !== undefined) consultant.cost = cost;
        if (certification !== undefined) consultant.certification = certification;
        if (speciality !== undefined) consultant.speciality = speciality;

        const updatedConsultant = await queryRunner.manager.save(consultant);

        // 2. Update user fields
        const user = await queryRunner.manager.findOne(User, {
          where: { user_id: consultant.user_id },
        });

        if (user) {
          if (role !== undefined) user.role = role;
          if (status !== undefined) user.status = status;
          if (email !== undefined) user.email = email;
          if (img_link !== undefined) user.img_link = img_link;

          await queryRunner.manager.save(user);
        }

        // 3. Update or create profile
        let profile = await queryRunner.manager.findOne(Profile, {
          where: { user_id: consultant.user_id },
        });

        if (!profile && (name || bio_json || date_of_birth || job)) {
          // Create new profile if it doesn't exist and we have profile data
          profile = queryRunner.manager.create(Profile, {
            user_id: consultant.user_id,
            name: name || null,
            bio_json: bio_json || null,
            date_of_birth: date_of_birth || null,
            job: job || null,
          });
        } else if (profile) {
          // Update existing profile
          if (name !== undefined) profile.name = name;
          if (bio_json !== undefined) profile.bio_json = bio_json;
          if (date_of_birth !== undefined) profile.date_of_birth = date_of_birth;
          if (job !== undefined) profile.job = job;
        }

        if (profile) {
          await queryRunner.manager.save(profile);
        }

        // 4. Update availability slots if provided
        let updatedSlots = [];
        if (availability_slots !== undefined) {
          // Remove existing consultant slots
          await queryRunner.manager.delete(ConsultantSlot, {
            consultant_id: consultant.id_consultant,
          });

          // Create new consultant slots
          for (const slotData of availability_slots) {
            const { day_of_week, start_time, end_time } = slotData;

            // Check if slot with these times already exists
            let slot = await queryRunner.manager.findOne(Slot, {
              where: { start_time, end_time },
            });

            // Create slot if it doesn't exist
            if (!slot) {
              const newSlot = queryRunner.manager.create(Slot, {
                start_time,
                end_time,
              });
              slot = await queryRunner.manager.save(newSlot);
            }

            // Create consultant slot relationship
            const consultantSlot = queryRunner.manager.create(ConsultantSlot, {
              consultant_id: consultant.id_consultant,
              slot_id: slot.slot_id,
              day_of_week: day_of_week,
            });

            await queryRunner.manager.save(consultantSlot);

            updatedSlots.push({
              slot_id: slot.slot_id,
              day_of_week: day_of_week,
              start_time: slot.start_time,
              end_time: slot.end_time,
            });
          }
        } else {
          // If slots not provided, get existing slots
          const existingConsultantSlots = await queryRunner.manager.find(ConsultantSlot, {
            where: { consultant_id: consultant.id_consultant },
            relations: { slot: true },
          });

          updatedSlots = existingConsultantSlots.map((cs) => ({
            slot_id: cs.slot_id,
            day_of_week: cs.day_of_week,
            start_time: cs.slot.start_time,
            end_time: cs.slot.end_time,
          }));
        }

        await queryRunner.commitTransaction();

        // Get updated user data
        const updatedUser = await userRepository.findOne({
          where: { user_id: consultant.user_id },
        });

        // Return complete updated data
        const completeUpdatedData = {
          // Consultant table fields
          id_consultant: updatedConsultant.id_consultant,
          cost: updatedConsultant.cost,
          certification: updatedConsultant.certification,
          speciality: updatedConsultant.speciality,

          // Users table fields (excluding password for security)
          user_id: updatedUser?.user_id,
          date_create: updatedUser?.date_create,
          role: updatedUser?.role,
          status: updatedUser?.status,
          email: updatedUser?.email,
          img_link: updatedUser?.img_link,

          // Profile table fields
          name: profile?.name,
          bio_json: profile?.bio_json,
          date_of_birth: profile?.date_of_birth,
          job: profile?.job,

          // Availability slots
          availability_slots: updatedSlots,
        };

        res.status(200).json({
          success: true,
          data: completeUpdatedData,
          message: "Consultant updated successfully with complete profile and availability",
        });

      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }

    } catch (error) {
      console.error("Error updating complete consultant:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update complete consultant",
        error: error.message,
      });
    }
  }

  /**
   * Delete consultant and all related data
   */
  static async deleteConsultantComplete(req, res) {
    try {
      const { consultantId } = req.params;

      const consultantRepository = AppDataSource.getRepository(Consultant);
      const consultantSlotRepository = AppDataSource.getRepository(ConsultantSlot);

      // Check if consultant exists
      const consultant = await consultantRepository.findOne({
        where: { id_consultant: parseInt(consultantId) },
      });

      if (!consultant) {
        return res.status(404).json({
          success: false,
          message: "Consultant not found",
        });
      }

      // Start transaction to ensure data integrity
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Delete consultant slots first (foreign key constraint)
        await queryRunner.manager.delete(ConsultantSlot, {
          consultant_id: parseInt(consultantId),
        });

        // Delete the consultant (cascade will handle User and Profile)
        await queryRunner.manager.delete(Consultant, {
          id_consultant: parseInt(consultantId),
        });

        await queryRunner.commitTransaction();

        res.status(200).json({
          success: true,
          message: "Consultant and all related data deleted successfully",
        });

      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }

    } catch (error) {
      console.error("Error deleting complete consultant:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete complete consultant",
        error: error.message,
      });
    }
  }

  /**
   * Get consultant availability by day of week
   */
  static async getConsultantAvailabilityByDay(req, res) {
    try {
      const { consultantId, dayOfWeek } = req.params;

      const consultantSlotRepository = AppDataSource.getRepository(ConsultantSlot);

      const availability = await consultantSlotRepository.find({
        where: {
          consultant_id: parseInt(consultantId),
          day_of_week: dayOfWeek,
        },
        relations: {
          slot: true,
        },
      });

      const availabilitySlots = availability.map((cs) => ({
        slot_id: cs.slot_id,
        day_of_week: cs.day_of_week,
        start_time: cs.slot.start_time,
        end_time: cs.slot.end_time,
      }));

      res.status(200).json({
        success: true,
        data: {
          consultant_id: parseInt(consultantId),
          day_of_week: dayOfWeek,
          availability_slots: availabilitySlots,
        },
        message: `Availability for ${dayOfWeek} retrieved successfully`,
      });
    } catch (error) {
      console.error("Error getting consultant availability:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve consultant availability",
        error: error.message,
      });
    }
  }

  /**
   * Update booking session status and Google Meet link
   */
  static async updateBookingSessionStatusAndLink(req, res) {
    try {
      const { bookingId } = req.params;
      const { status, google_meet_link } = req.body;

      // Validate required fields
      if (!bookingId) {
        return res.status(400).json({
          success: false,
          message: "Booking ID is required",
        });
      }

      if (!status && !google_meet_link) {
        return res.status(400).json({
          success: false,
          message: "At least one field (status or google_meet_link) must be provided",
        });
      }

      const bookingRepository = AppDataSource.getRepository(BookingSession);

      // Check if booking exists
      const booking = await bookingRepository.findOne({
        where: { booking_id: parseInt(bookingId) },
        relations: {
          consultant: {
            user: true,
          },
          member: true,
          slot: true,
        },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking session not found",
        });
      }

      // Prepare update data
      const updateData = {};
      if (status !== undefined) updateData.status = status;
      if (google_meet_link !== undefined) updateData.google_meet_link = google_meet_link;

      // Update the booking session
      await bookingRepository.update(parseInt(bookingId), updateData);

      // Get the updated booking with all relations
      const updatedBooking = await bookingRepository.findOne({
        where: { booking_id: parseInt(bookingId) },
        relations: {
          consultant: {
            user: true,
          },
          member: true,
          slot: true,
        },
      });

      // Format the response data
      const bookingData = {
        booking_id: updatedBooking.booking_id,
        consultant_id: updatedBooking.consultant_id,
        member_id: updatedBooking.member_id,
        slot_id: updatedBooking.slot_id,
        booking_date: updatedBooking.booking_date,
        status: updatedBooking.status,
        notes: updatedBooking.notes,
        google_meet_link: updatedBooking.google_meet_link,
        
        // Additional related data
        consultant_info: updatedBooking.consultant ? {
          id_consultant: updatedBooking.consultant.id_consultant,
          cost: updatedBooking.consultant.cost,
          certification: updatedBooking.consultant.certification,
          speciality: updatedBooking.consultant.speciality,
          consultant_name: updatedBooking.consultant.user?.name,
          consultant_email: updatedBooking.consultant.user?.email,
        } : null,
        
        member_info: updatedBooking.member ? {
          user_id: updatedBooking.member.user_id,
          email: updatedBooking.member.email,
          role: updatedBooking.member.role,
          status: updatedBooking.member.status,
        } : null,
        
        slot_info: updatedBooking.slot ? {
          slot_id: updatedBooking.slot.slot_id,
          start_time: updatedBooking.slot.start_time,
          end_time: updatedBooking.slot.end_time,
        } : null,
      };

      res.status(200).json({
        success: true,
        data: bookingData,
        message: "Booking session updated successfully",
      });

    } catch (error) {
      console.error("Error updating booking session:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update booking session",
        error: error.message,
      });
    }
  }
}

module.exports = ConsultantCompleteController; 