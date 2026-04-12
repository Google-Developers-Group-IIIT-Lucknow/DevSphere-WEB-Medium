// medium/src/utils/hostelUtils.js

/**
 * Utility functions for hostel management.
 */

/**
 * Generates a unique ID.
 * @returns {string} A unique ID string.
 */
function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Validates if a given ID is a non-empty string.
 * @param {string} id - The ID to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidId(id) {
  return typeof id === 'string' && id.trim().length > 0;
}

/**
 * Validates if a given gender is either 'Male' or 'Female'.
 * @param {string} gender - The gender string to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidGender(gender) {
  // Bug: Case sensitivity issue. Should normalize input before comparison.
  return gender === 'Male' || gender === 'Female';
}

/**
 * Checks if a student and room are compatible for allotment.
 * @param {Student} student - The student object.
 * @param {Room} room - The room object.
 * @returns {boolean} True if compatible, false otherwise.
 */
function isCompatible(student, room) {
  // Bug: Only checks gender. Should also check if room has space.
  return student.gender === room.gender;
}

module.exports = {
  generateUniqueId,
  isValidId,
  isValidGender,
  isCompatible,
};