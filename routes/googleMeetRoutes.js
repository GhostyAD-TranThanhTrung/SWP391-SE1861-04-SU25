/**
 * Google Meet Routes
 * Defines routes for Google Meet functionality
 */
const express = require("express");
const router = express.Router();
const {
  createRestrictedMeeting,
  cancelMeeting,
} = require("../Controller/googleMeetController");

/**
 * @route POST /api/googlemeet/create-meeting
 * @desc Create a new Google Meet session with access restricted to two specific accounts
 * @access Private
 */
router.post("/create-meeting", createRestrictedMeeting);

/**
 * @route DELETE /api/googlemeet/cancel-meeting/:eventId/:bookingId
 * @desc Cancel/delete an existing Google Meet session
 * @access Private
 */
router.delete("/cancel-meeting/:eventId/:bookingId", cancelMeeting);

module.exports = router;
