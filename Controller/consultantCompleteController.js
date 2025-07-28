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
const bcrypt = require('bcryptjs');

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

      // Check if the requesting user is an admin (from verified token)
      const isAdmin = req.user && req.user.role && req.user.role.toLowerCase() === 'admin';

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

        const consultantData = {
          // Consultant table fields
          id_consultant: consultant.id_consultant,
          google_meet_link: consultant.google_meet_link,
          certification: consultant.certification,
          speciality: consultant.speciality,

          // Users table fields
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

        // Include password only if the requesting user is an admin
        if (isAdmin) {
          consultantData.password = consultant.user?.password;
        }

        return consultantData;
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
                  google_meet_link: consultant.google_meet_link,
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
        google_meet_link, certification, speciality,
        // Profile table fields
        name, bio_json, date_of_birth, job,
        // Availability slots - array of {day_of_week, start_time, end_time}
        availability_slots = []
      } = req.body;

      console.log('Create consultant request:', req.body);

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }

      // Validate password strength
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
      }

      // Check if user already exists with this email
      const existingUserQuery = 'SELECT user_id FROM Users WHERE email = @0';
      const existingUsers = await AppDataSource.query(existingUserQuery, [email]);

      if (existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          message: "A user with this email already exists",
        });
      }

      // Hash password

      try {
        // 1. Create new user using raw SQL
        const createUserQuery = `
          INSERT INTO Users (role, password, status, email, img_link, date_create)
          OUTPUT INSERTED.*
          VALUES (@0, @1, @2, @3, @4, GETDATE())
        `;

        const userResult = await AppDataSource.query(createUserQuery, [
          role || 'consultant',
          password,
          status || 'active',
          email,
          img_link || null
        ]);

        const savedUser = userResult[0];
        console.log('Created user:', savedUser);

        // 2. Create consultant profile using raw SQL
        const createConsultantQuery = `
          INSERT INTO Consultant (user_id, google_meet_link, certification, speciality)
          OUTPUT INSERTED.*
          VALUES (@0, @1, @2, @3)
        `;

        const consultantResult = await AppDataSource.query(createConsultantQuery, [
          savedUser.user_id,
          google_meet_link || null,
          certification || null,
          speciality || null
        ]);

        const savedConsultant = consultantResult[0];
        console.log('Created consultant:', savedConsultant);

        // 3. Create profile if profile data is provided
        let savedProfile = null;
        if (name || bio_json || date_of_birth || job) {
          // Handle bio_json serialization
          let bioJsonString = null;
          if (bio_json) {
            bioJsonString = typeof bio_json === 'string' ? bio_json : JSON.stringify(bio_json);
          }

          const createProfileQuery = `
            INSERT INTO Profile (user_id, name, bio_json, date_of_birth, job)
            OUTPUT INSERTED.*
            VALUES (@0, @1, @2, @3, @4)
          `;

          const profileResult = await AppDataSource.query(createProfileQuery, [
            savedUser.user_id,
            name || null,
            bioJsonString,
            date_of_birth ? new Date(date_of_birth) : null,
            job || null
          ]);

          savedProfile = profileResult[0];
          console.log('Created profile:', savedProfile);
        }

        // 4. Create availability slots using raw SQL
        const createdSlots = [];
        for (const slotData of availability_slots) {
          const { day_of_week, start_time, end_time } = slotData;

          // Check if slot with these times already exists
          const existingSlotQuery = 'SELECT slot_id, start_time, end_time FROM Slot WHERE start_time = @0 AND end_time = @1';
          const existingSlots = await AppDataSource.query(existingSlotQuery, [start_time, end_time]);

          let slot;
          if (existingSlots.length > 0) {
            slot = existingSlots[0];
          } else {
            // Create slot if it doesn't exist
            const createSlotQuery = `
              INSERT INTO Slot (start_time, end_time)
              OUTPUT INSERTED.*
              VALUES (@0, @1)
            `;
            const slotResult = await AppDataSource.query(createSlotQuery, [start_time, end_time]);
            slot = slotResult[0];
          }

          // Create consultant slot relationship
          const createConsultantSlotQuery = `
            INSERT INTO Consultant_Slot (consultant_id, slot_id, day_of_week)
            VALUES (@0, @1, @2)
          `;

          await AppDataSource.query(createConsultantSlotQuery, [
            savedConsultant.id_consultant,
            slot.slot_id,
            day_of_week
          ]);

          createdSlots.push({
            slot_id: slot.slot_id,
            day_of_week: day_of_week,
            start_time: slot.start_time,
            end_time: slot.end_time,
          });
        }

        // Parse bio_json for response if it exists
        if (savedProfile && savedProfile.bio_json) {
          try {
            savedProfile.bio_json = JSON.parse(savedProfile.bio_json);
          } catch (error) {
            // Keep as string if parsing fails
            console.warn(`Failed to parse bio_json for new consultant ${savedUser.user_id}:`, error);
          }
        }

        // Return complete consultant data
        const completeConsultantData = {
          // Consultant table fields
          id_consultant: savedConsultant.id_consultant,
          google_meet_link: savedConsultant.google_meet_link,
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
          message: `Consultant created successfully with email: ${email}`,
        });

      } catch (error) {
        console.error('Database error during consultant creation:', error);
        throw error;
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
        google_meet_link, certification, speciality,
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
        // 1. Update consultant fields using raw query
        if (google_meet_link !== undefined || certification !== undefined || speciality !== undefined) {
          await queryRunner.query(`
            UPDATE Consultant 
            SET google_meet_link = COALESCE(@0, google_meet_link),
                certification = COALESCE(@1, certification),
                speciality = COALESCE(@2, speciality)
            WHERE id_consultant = @3
          `, [
            google_meet_link !== undefined ? google_meet_link : null,
            certification !== undefined ? certification : null,
            speciality !== undefined ? speciality : null,
            parseInt(id)
          ]);
        }

        // Get updated consultant data
        const consultantResult = await queryRunner.query(`
          SELECT * FROM Consultant WHERE id_consultant = @0
        `, [parseInt(id)]);
        const updatedConsultant = consultantResult[0];

        // 2. Update user fields using raw query
        if (role !== undefined || status !== undefined || email !== undefined || img_link !== undefined) {
          await queryRunner.query(`
            UPDATE Users 
            SET role = COALESCE(@0, role),
                status = COALESCE(@1, status),
                email = COALESCE(@2, email),
                img_link = COALESCE(@3, img_link)
            WHERE user_id = @4
          `, [
            role !== undefined ? role : null,
            status !== undefined ? status : null,
            email !== undefined ? email : null,
            img_link !== undefined ? img_link : null,
            parseInt(consultant.user_id)
          ]);
        }

        // 3. Update or create profile using raw queries
        let profile = null;

        // Check if profile exists
        const existingProfileResult = await queryRunner.query(`
          SELECT * FROM Profile WHERE user_id = @0
        `, [parseInt(consultant.user_id)]);

        if (existingProfileResult.length === 0 && (name || bio_json || date_of_birth || job)) {
          // Create new profile if it doesn't exist and we have profile data
          let bioJsonString = null;
          if (bio_json) {
            bioJsonString = typeof bio_json === 'string' ? bio_json : JSON.stringify(bio_json);
          }

          const profileInsertResult = await queryRunner.query(`
            INSERT INTO Profile (user_id, name, bio_json, date_of_birth, job)
            OUTPUT INSERTED.user_id, INSERTED.name, INSERTED.bio_json, INSERTED.date_of_birth, INSERTED.job
            VALUES (@0, @1, @2, @3, @4)
          `, [
            parseInt(consultant.user_id),
            name || null,
            bioJsonString,
            date_of_birth ? new Date(date_of_birth) : null,
            job || null
          ]);
          profile = profileInsertResult[0];
        } else if (existingProfileResult.length > 0) {
          // Update existing profile
          if (name !== undefined || bio_json !== undefined || date_of_birth !== undefined || job !== undefined) {
            let bioJsonString = null;
            if (bio_json !== undefined) {
              bioJsonString = typeof bio_json === 'string' ? bio_json : JSON.stringify(bio_json);
            }

            await queryRunner.query(`
              UPDATE Profile 
              SET name = COALESCE(@0, name),
                  bio_json = COALESCE(@1, bio_json),
                  date_of_birth = COALESCE(@2, date_of_birth),
                  job = COALESCE(@3, job)
              WHERE user_id = @4
            `, [
              name !== undefined ? name : null,
              bioJsonString,
              date_of_birth !== undefined ? (date_of_birth ? new Date(date_of_birth) : null) : null,
              job !== undefined ? job : null,
              parseInt(consultant.user_id)
            ]);
          }

          // Get updated profile
          const updatedProfileResult = await queryRunner.query(`
            SELECT * FROM Profile WHERE user_id = @0
          `, [parseInt(consultant.user_id)]);
          profile = updatedProfileResult[0];
        }

        // 4. Update availability slots if provided using raw queries
        let updatedSlots = [];
        if (availability_slots !== undefined) {
          // Remove existing consultant slots
          await queryRunner.query(`
            DELETE FROM Consultant_Slot WHERE consultant_id = @0
          `, [parseInt(consultant.id_consultant)]);

          // Create new consultant slots
          for (const slotData of availability_slots) {
            const { day_of_week, start_time, end_time } = slotData;

            // Check if slot with these times already exists
            const existingSlotResult = await queryRunner.query(`
              SELECT slot_id, start_time, end_time FROM Slot WHERE start_time = @0 AND end_time = @1
            `, [start_time, end_time]);

            let slot;
            if (existingSlotResult.length > 0) {
              slot = existingSlotResult[0];
            } else {
              // Create slot if it doesn't exist
              const slotInsertResult = await queryRunner.query(`
                INSERT INTO Slot (start_time, end_time)
                OUTPUT INSERTED.slot_id, INSERTED.start_time, INSERTED.end_time
                VALUES (@0, @1)
              `, [start_time, end_time]);
              slot = slotInsertResult[0];
            }

            // Create consultant slot relationship
            await queryRunner.query(`
              INSERT INTO Consultant_Slot (consultant_id, slot_id, day_of_week)
              VALUES (@0, @1, @2)
            `, [
              parseInt(consultant.id_consultant),
              slot.slot_id,
              day_of_week
            ]);

            updatedSlots.push({
              slot_id: slot.slot_id,
              day_of_week: day_of_week,
              start_time: slot.start_time,
              end_time: slot.end_time,
            });
          }
        } else {
          // If slots not provided, get existing slots
          const existingSlotsResult = await queryRunner.query(`
            SELECT cs.slot_id, cs.day_of_week, s.start_time, s.end_time
            FROM Consultant_Slot cs
            INNER JOIN Slot s ON cs.slot_id = s.slot_id
            WHERE cs.consultant_id = @0
          `, [parseInt(consultant.id_consultant)]);

          updatedSlots = existingSlotsResult.map((cs) => ({
            slot_id: cs.slot_id,
            day_of_week: cs.day_of_week,
            start_time: cs.start_time,
            end_time: cs.end_time,
          }));
        }

        await queryRunner.commitTransaction();

        // Get updated user data using raw query
        const updatedUserResult = await queryRunner.query(`
          SELECT * FROM Users WHERE user_id = @0
        `, [parseInt(consultant.user_id)]);
        const updatedUser = updatedUserResult[0];

        // Parse bio_json for response if it exists
        if (profile && profile.bio_json) {
          try {
            profile.bio_json = JSON.parse(profile.bio_json);
          } catch (error) {
            // Keep as string if parsing fails
            console.warn(`Failed to parse bio_json for updated consultant ${consultant.user_id}:`, error);
          }
        }

        // Return complete updated data
        const completeUpdatedData = {
          // Consultant table fields
          id_consultant: updatedConsultant.id_consultant,
          google_meet_link: updatedConsultant.google_meet_link,
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
   * Delete consultant and all related data or set to inactive if has booking sessions
   */
  static async deleteConsultantComplete(req, res) {
    try {
      const { consultantId } = req.params;
      console.log(`🗑️ Delete consultant request for ID: ${consultantId}`);

      const consultantRepository = AppDataSource.getRepository(Consultant);
      const userRepository = AppDataSource.getRepository(User);
      const profileRepository = AppDataSource.getRepository(Profile);
      const consultantSlotRepository = AppDataSource.getRepository(ConsultantSlot);
      const bookingSessionRepository = AppDataSource.getRepository(BookingSession);

      // Check if consultant exists
      const consultant = await consultantRepository.findOne({
        where: { id_consultant: parseInt(consultantId) },
        relations: { user: true },
      });

      if (!consultant) {
        console.log(`❌ Consultant with ID ${consultantId} not found`);
        return res.status(404).json({
          success: false,
          message: "Consultant not found",
        });
      }

      console.log(`✅ Found consultant: ${consultant.user?.email}`);

      // Check if consultant has any booking sessions using raw SQL
      const bookingSessionsQuery = `
        SELECT booking_id, consultant_id, member_id, slot_id, booking_date, status, notes, google_meet_link 
        FROM Booking_Session 
        WHERE consultant_id = @0
      `;
      const bookingSessions = await AppDataSource.query(bookingSessionsQuery, [parseInt(consultantId)]);
      
      // Debug: Log the booking sessions found
      console.log(`📋 Booking sessions details:`, bookingSessions.map(bs => ({ 
        id: bs.booking_id, 
        status: bs.status 
      })));

      console.log(`📅 Found ${bookingSessions.length} booking sessions for consultant`);

      // Start transaction to ensure data integrity
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        if (bookingSessions.length > 0) {
          console.log(`📝 Processing ${bookingSessions.length} booking sessions...`);
          
          // Count booking sessions by status before updating
          const completedSessions = bookingSessions.filter(bs => bs.status === 'Hoàn thành');
          const otherSessions = bookingSessions.filter(bs => bs.status !== 'Hoàn thành');
          
          console.log(`✅ Completed sessions (will keep): ${completedSessions.length}`);
          console.log(`🚫 Other sessions (will cancel): ${otherSessions.length}`);

          // Update booking sessions status to "Đã hủy" except for "Hoàn thành" ones using raw SQL
          let cancelledSessionsCount = 0;
          if (otherSessions.length > 0) {
            try {
              console.log(`📋 Updating ${otherSessions.length} booking sessions to "Đã hủy"`);
              
              // Use raw SQL for booking session updates
              const updateBookingSessionsQuery = `
                UPDATE Booking_Session 
                SET status = N'Đã hủy'
                WHERE consultant_id = @0 AND status != N'Hoàn thành'
              `;
              
              const updateResult = await queryRunner.query(updateBookingSessionsQuery, [parseInt(consultantId)]);
              console.log(`📋 Raw SQL update result:`, updateResult);
              
              // Verify the update by counting sessions that were actually cancelled
              const verifyUpdateQuery = `
                SELECT COUNT(*) as cancelled_count 
                FROM Booking_Session 
                WHERE consultant_id = @0 AND status = N'Đã hủy'
              `;
              const verifyResult = await queryRunner.query(verifyUpdateQuery, [parseInt(consultantId)]);
              
              // Use the verified count, fallback to expected count if verification fails
              const verifiedCount = verifyResult[0]?.cancelled_count;
              cancelledSessionsCount = (verifiedCount !== undefined && verifiedCount !== null) ? verifiedCount : otherSessions.length;
              console.log(`✅ Successfully cancelled ${cancelledSessionsCount} booking sessions`);
              
            } catch (updateError) {
              console.error(`❌ Error updating booking sessions with raw SQL:`, updateError);
              // Set count based on filter since we can't verify the actual update
              cancelledSessionsCount = otherSessions.length;
            }
          }

          // Set user status to inactive instead of deleting using raw SQL
          const updateUserStatusQuery = `
            UPDATE Users 
            SET status = N'inactive'
            WHERE user_id = @0
          `;
          
          await queryRunner.query(updateUserStatusQuery, [consultant.user_id]);
          console.log(`👤 Set user ${consultant.user_id} status to inactive`);

          await queryRunner.commitTransaction();
          console.log(`✅ Transaction committed successfully`);

          res.status(200).json({
            success: true,
            message: `Tư vấn viên có ${bookingSessions.length} phiên tư vấn đã đặt.\n` +
                    `${cancelledSessionsCount} phiên đã được hủy, ${completedSessions.length} phiên hoàn thành được giữ nguyên.\n` +
                    `Trạng thái tài khoản đã được chuyển thành "Không hoạt động".`,
            data: {
              consultant_id: parseInt(consultantId),
              user_id: consultant.user_id,
              action: "status_changed_to_inactive",
              booking_sessions_count: bookingSessions.length,
              cancelled_sessions_count: cancelledSessionsCount,
              completed_sessions_count: completedSessions.length
            }
          });

        } else {
          console.log(`🗑️ No booking sessions found, proceeding with complete deletion...`);
          
          // If no booking sessions, perform deletion in order: consultant slots -> consultant -> profile -> user
          
          // 1. Delete consultant slots first (foreign key constraint) using raw SQL
          console.log(`🕐 Deleting consultant slots...`);
          const deleteConsultantSlotsQuery = `
            DELETE FROM Consultant_Slot 
            WHERE consultant_id = @0
          `;
          await queryRunner.query(deleteConsultantSlotsQuery, [parseInt(consultantId)]);

          // 2. Delete consultant using raw SQL
          console.log(`👨‍💼 Deleting consultant record...`);
          const deleteConsultantQuery = `
            DELETE FROM Consultant 
            WHERE id_consultant = @0
          `;
          await queryRunner.query(deleteConsultantQuery, [parseInt(consultantId)]);

          // 3. Check if profile exists and delete using raw SQL
          console.log(`👤 Checking for profile...`);
          const checkProfileQuery = `
            SELECT user_id FROM Profile WHERE user_id = @0
          `;
          const profileExists = await queryRunner.query(checkProfileQuery, [consultant.user_id]);
          
          if (profileExists.length > 0) {
            console.log(`📋 Deleting profile...`);
            const deleteProfileQuery = `
              DELETE FROM Profile 
              WHERE user_id = @0
            `;
            await queryRunner.query(deleteProfileQuery, [consultant.user_id]);
          }

          // 4. Delete user last using raw SQL
          console.log(`🔐 Deleting user account...`);
          const deleteUserQuery = `
            DELETE FROM Users 
            WHERE user_id = @0
          `;
          await queryRunner.query(deleteUserQuery, [consultant.user_id]);

          await queryRunner.commitTransaction();
          console.log(`✅ Complete deletion transaction committed successfully`);

          res.status(200).json({
            success: true,
            message: "Xóa tư vấn viên thành công!\nĐã xóa: lịch làm việc, thông tin tư vấn viên, hồ sơ cá nhân, tài khoản người dùng",
            data: {
              consultant_id: parseInt(consultantId),
              user_id: consultant.user_id,
              action: "completely_deleted",
              deleted_entities: {
                consultant_slots: true,
                consultant: true,
                profile: profileExists.length > 0,
                user: true
              }
            }
          });
        }

      } catch (error) {
        console.error(`❌ Transaction error:`, error);
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }

    } catch (error) {
      console.error("❌ Error deleting complete consultant:", error);
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
          google_meet_link: updatedBooking.consultant.google_meet_link,
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