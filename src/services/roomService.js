// medium/src/services/roomService.js
const Room = require('../models/Room');

// In-memory store for rooms (simulating a database)
// Holds the current state of all rooms managed by the service
let rooms = [];

/**
 * Initializes the room service with a list of rooms.
 * @param {Array<Object>} initialRoomsData - Array of plain room objects.
 */
function initializeRooms(initialRoomsData) {
  // Convert raw data into Room instances for internal use
  rooms = initialRoomsData.map(data => Room.fromObject(data));
}

/**
 * Retrieves all rooms.
 * @returns {Array<Room>} - Collection of all rooms.
 */
function getAllRooms() {
  // Provide access to the current room collection
  return rooms;
}

function normalizeGender(g) {
  if (!g) return g;
  const val = g.toLowerCase();
  if (val === 'm' || val === 'male') return 'male';
  if (val === 'f' || val === 'female') return 'female';
  return val;
}

/**
 * Finds a room by its ID.
 * @param {string} roomId - The ID of the room to find.
 * @returns {Room|undefined} - The room object if found, otherwise undefined.
 */
function getRoomById(roomId) {
  // Locate a room matching the given identifier
  return rooms.find(room => room.id === roomId);
}

/**
 * Filters rooms by gender.
 * @param {Array<Room>} roomsList - The list of rooms to filter.
 * @param {string} gender - The gender to filter by.
 * @returns {Array<Room>} - An array of rooms matching the criteria.
 */
function getRoomsByGender(roomsList, gender) {
  // Return only rooms that match the specified gender criteria
  return roomsList.filter(
    room => normalizeGender(room.gender) === normalizeGender(gender)
  );

}

/**
 * Updates a room's state in the in-memory store.
 * @param {Room} updatedRoom - The room object with updated properties.
 */
function updateRoom(updatedRoom) {
  // Find the index of the room to update
  const index = rooms.findIndex(room => room.id === updatedRoom.id);

  if (index !== -1) {
    // Replace the existing room entry with the updated version
    rooms[index] = updatedRoom;
  }
}

module.exports = {
  initializeRooms,
  getAllRooms,
  getRoomById,
  getRoomsByGender,
  updateRoom,
};