/**
 * Google Meet Controller
 * Creates and manages Google Meet sessions with restricted access
 */
const { google } = require("googleapis");
const AppDataSource = require("../src/data-source");
const BookingSession = require("../src/entities/BookingSession");

// Load Google API credentials from environment
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

// Check if Google API credentials are set
function checkCredentials() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI || !REFRESH_TOKEN) {
    throw new Error(
      "Google API credentials are not set in environment variables"
    );
  }
}

class GoogleMeetController {
  /**
   * Create a new Google Meet session for a specific consultant and member
   * Restricts access to only these two designated accounts
   */ static async createRestrictedMeeting(req, res) {
    try {
      // Check if Google API credentials are set
      checkCredentials();
      // Extract parameters from request body
      const {
        bookingId,
        consultantEmail,
        memberEmail,
        startTime,
        endTime,
        title,
      } = req.body;

      // Validation
      if (
        !bookingId ||
        !consultantEmail ||
        !memberEmail ||
        !startTime ||
        !endTime
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Required fields missing: bookingId, consultantEmail, memberEmail, startTime, endTime",
        });
      }

      // Ensure valid emails (basic validation)
      if (!isValidEmail(consultantEmail) || !isValidEmail(memberEmail)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format provided",
        });
      } // Get booking details from database to verify the request
      const bookingRepository = AppDataSource.getRepository(BookingSession);
      const booking = await bookingRepository.findOne({
        where: { booking_id: parseInt(bookingId) },
        relations: { consultant: { user: true }, member: true },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking session not found",
        });
      }

      // Set up OAuth2 client for Google API
      const oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
      );

      oauth2Client.setCredentials({
        refresh_token: REFRESH_TOKEN,
      });

      // Create Google Calendar client
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      // Session name
      const meetingTitle =
        title ||
        `Consultation: ${booking.consultant?.user?.full_name} and Member`;

      // Format meeting time (ensure ISO format)
      const meetingStartTime = new Date(startTime).toISOString();
      const meetingEndTime = new Date(endTime).toISOString();
      console.log("Creating calendar event with OAuth client:", CLIENT_ID);
      // Log OAuth client setup for debugging
      console.log("Redirect URI:", REDIRECT_URI);

      // Create calendar event with Google Meet conference
      const event = {
        summary: meetingTitle,
        description: `Booking session ID: ${bookingId}`,
        start: {
          dateTime: meetingStartTime,
          timeZone: "UTC",
        },
        end: {
          dateTime: meetingEndTime,
          timeZone: "UTC",
        },
        // Make this a Google Meet conference
        conferenceData: {
          createRequest: {
            requestId: `booking-${bookingId}-${Date.now()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
        // Only allow these two specific email addresses
        attendees: [{ email: consultantEmail }, { email: memberEmail }],
        // Restrict access and visibility
        guestsCanInviteOthers: false,
        guestsCanModify: false,
        guestsCanSeeOtherGuests: false,
        visibility: "private",
      };

      try {
        // Insert the event with conference data
        const response = await calendar.events.insert({
          calendarId: "primary",
          resource: event,
          conferenceDataVersion: 1,
          sendUpdates: "all",
        });
        console.log("Google Calendar API response success");
      } catch (apiError) {
        console.error(
          "Google Calendar API Error Details:",
          apiError.response?.data || apiError.message
        );
        throw new Error(`Google Calendar API error: ${apiError.message}`);
      } // Extract Meet link from response
      const meetLink = response.data.hangoutLink;

      // Store the Google Meet link in the notes field instead of a dedicated meet_link field
      // Format: [MEET_LINK]https://meet.google.com/abc-xyz-123[/MEET_LINK]
      const meetLinkTag = `[MEET_LINK]${meetLink}[/MEET_LINK]`;

      // Preserve any existing notes and append the meet link
      const existingNotes = booking.notes || "";
      const meetLinkRegex = /\[MEET_LINK\].*?\[\/MEET_LINK\]/;

      // Replace existing meet link tag or append new one
      booking.notes = meetLinkRegex.test(existingNotes)
        ? existingNotes.replace(meetLinkRegex, meetLinkTag)
        : `${existingNotes}\n${meetLinkTag}`;

      await bookingRepository.save(booking); // Return success response with Meet link
      return res.status(201).json({
        success: true,
        message: "Restricted Google Meet session created successfully",
        data: {
          meetLink: meetLink,
          bookingId: bookingId,
          eventId: response.data.id,
          startTime: meetingStartTime,
          endTime: meetingEndTime,
          attendees: [consultantEmail, memberEmail],
          title: meetingTitle,
          notesUpdated: true, // Flag to indicate notes field contains the meet link
        },
      });
    } catch (error) {
      console.error("Error creating restricted Google Meet session:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create Google Meet session",
        error: error.message,
      });
    }
  }
  /**
   * Cancel/delete an existing Google Meet session
   */ static async cancelMeeting(req, res) {
    try {
      // Check if Google API credentials are set
      checkCredentials();
      // Extract parameters from request params
      const { eventId, bookingId } = req.params;

      if (!eventId || !bookingId) {
        return res.status(400).json({
          success: false,
          message: "Required parameters missing: eventId, bookingId",
        });
      } // Get booking details from database to verify the request
      const bookingRepository = AppDataSource.getRepository(BookingSession);
      const booking = await bookingRepository.findOne({
        where: { booking_id: parseInt(bookingId) },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking session not found",
        });
      }

      // Set up OAuth2 client for Google API
      const oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
      );

      oauth2Client.setCredentials({
        refresh_token: REFRESH_TOKEN,
      });

      // Create Google Calendar client
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      // Delete the calendar event
      await calendar.events.delete({
        calendarId: "primary",
        eventId: eventId,
        sendUpdates: "all",
      }); // Update booking to remove Meet link from notes
      if (booking.notes) {
        // Remove the Meet link tag from notes
        const meetLinkRegex = /\[MEET_LINK\].*?\[\/MEET_LINK\]/;
        booking.notes = booking.notes.replace(meetLinkRegex, "").trim();
        await bookingRepository.save(booking);
      } // Return success response
      return res.status(200).json({
        success: true,
        message: "Google Meet session cancelled successfully",
      });
    } catch (error) {
      console.error("Error cancelling Google Meet session:", error);
      res.status(500).json({
        success: false,
        message: "Failed to cancel Google Meet session",
        error: error.message,
      });
    }
  }
}

// Helper function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Helper function to extract the Google Meet link from booking notes
 * @param {string} notes - Notes field content from BookingSession entity
 * @returns {string|null} - Extracted meet link or null if not found
 */
function extractMeetLinkFromNotes(notes) {
  if (!notes) return null;

  const meetLinkMatch = notes.match(/\[MEET_LINK\](.*?)\[\/MEET_LINK\]/);
  return meetLinkMatch ? meetLinkMatch[1] : null;
}

// Export the controller and helper functions
module.exports = {
  createRestrictedMeeting: GoogleMeetController.createRestrictedMeeting,
  cancelMeeting: GoogleMeetController.cancelMeeting,
  extractMeetLinkFromNotes, // Export the helper for use in other controllers/services
};

/* Router implementation should be in a separate file like:

const express = require('express');
const router = express.Router();
const GoogleMeetController = require('../Controller/googleMeetController');

router.post("/create-meeting", GoogleMeetController.createRestrictedMeeting);
router.delete(
  "/cancel-meeting/:eventId/:bookingId",
  GoogleMeetController.cancelMeeting
);

module.exports = router;
*/
