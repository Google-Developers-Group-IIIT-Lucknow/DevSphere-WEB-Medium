// medium/src/services/swapService.js
const Student = require('../models/Student');
const Room = require('../models/Room');
const {
  getRoomById,
  updateRoom
} = require('./roomService');

// In-memory store for swap requests
// Maintains the current set of swap requests in the system
let swapRequests = [];

/**
 * Represents a swap request between two students.
 * @typedef {Object} SwapRequest
 * @property {string} requestId - Unique ID for the swap request.
 * @property {string} studentId1 - ID of the first student requesting the swap.
 * @property {string} studentId2 - ID of the second student involved in the swap.
 * @property {string} status - Current status of the request ('pending', 'approved', 'rejected').
 * @property {Date} requestDate - Date when the request was made.
 */

/**
 * Initializes the swap service with existing swap requests.
 * @param {Array<Object>} initialSwapRequests - Array of plain swap request objects.
 */
function initializeSwapRequests(initialSwapRequests) {
  // Normalize incoming data into internal swap request format
  swapRequests = initialSwapRequests.map(req => ({
    ...req,
    requestDate: new Date(req.requestDate)
  }));
}

/**
 * Creates a new swap request.
 * @param {string} studentId1 - ID of the student initiating the swap.
 * @param {string} studentId2 - ID of the student to swap with.
 * @returns {SwapRequest|null} - The created swap request, or null if invalid.
 */
function createSwapRequest(studentId1, studentId2) {
  // Prevent invalid self-referential requests
  if (studentId1 === studentId2) {
    console.log('Cannot swap with self.');
    return null;
  }

  // Check for existing requests between the same pair of students
  const existingRequest = swapRequests.find(
    req =>
    (req.studentId1 === studentId1 && req.studentId2 === studentId2) ||
    (req.studentId1 === studentId2 && req.studentId2 === studentId1)
  );

  if (existingRequest) {
    console.log('A similar swap request already exists.');
    return null;
  }

  // Create and store a new pending swap request
  const newRequest = {
    requestId: `swap-${Date.now()}`,
    studentId1,
    studentId2,
    status: 'pending',
    requestDate: new Date(),
  };

  swapRequests.push(newRequest);
  console.log(`Swap request created: ${newRequest.requestId}`);
  return newRequest;
}

/**
 * Approves a pending swap request and performs the room swap.
 * @param {string} requestId - The ID of the swap request to approve.
 * @param {Array<Student>} allStudents - All students in the system.
 * @param {Array<Room>} allRooms - All rooms in the system.
 * @returns {boolean} - True if swap was successful, false otherwise.
 */
function approveSwapRequest(requestId, allStudents, allRooms) {
  const request = swapRequests.find(req => req.requestId === requestId);

  // Ensure request exists and is in a valid state
  if (!request || request.status !== 'pending') {
    console.log('Invalid or non-pending swap request.');
    return false;
  }

  // Retrieve involved students
  const student1 = allStudents.find(s => s.id === request.studentId1);
  const student2 = allStudents.find(s => s.id === request.studentId2);

  if (!student1 || !student2) {
    console.log('One or both students not found for swap.');
    return false;
  }

  // Ensure both students currently have room assignments
  if (!student1.hasAllotment || !student2.hasAllotment) {
    console.log('One or both students do not have room allotments.');
    return false;
  }

  // Retrieve rooms associated with each student
  const room1 = getRoomById(student1.roomId);
  const room2 = getRoomById(student2.roomId);

  if (!room1 || !room2) {
    console.log('One or both rooms not found for swap.');
    return false;
  }

  // Perform the swap of occupants between rooms
  room1.removeOccupant(student1.id);
  room2.removeOccupant(student2.id);

  room1.addOccupant(student2.id);
  room2.addOccupant(student1.id);

  // Update student-room associations
  student1.roomId = room2.id;
  student2.roomId = room1.id;

  // Persist updated room states
  updateRoom(room1);
  updateRoom(room2);

  request.status = 'approved';
  console.log(`Swap request ${requestId} approved. Rooms swapped.`);
  return true;
}

/**
 * Rejects a pending swap request.
 * @param {string} requestId - The ID of the swap request to reject.
 * @returns {boolean} - True if rejection was successful, false otherwise.
 */
function rejectSwapRequest(requestId) {
  const request = swapRequests.find(req => req.requestId === requestId);

  // Ensure request exists and is still pending
  if (!request || request.status !== 'pending') {
    console.log('Invalid or non-pending swap request.');
    return false;
  }

  request.status = 'rejected';
  console.log(`Swap request ${requestId} rejected.`);
  return true;
}

/**
 * Gets all swap requests.
 * @returns {Array<SwapRequest>} - Collection of swap requests.
 */
function getSwapRequests() {
  // Provide access to the current list of swap requests
  return swapRequests;
}

module.exports = {
  initializeSwapRequests,
  createSwapRequest,
  approveSwapRequest,
  rejectSwapRequest,
  getSwapRequests,
};