const Student = require('../models/Student');

// In-memory store for waitlisted students (simulating a queue)
// Maintains the current list of students waiting for room allocation
let waitlist = [];

/**
 * Adds a student to the waitlist.
 * @param {Student} student - The student to add to the waitlist.
 */
function addToWaitlist(student) {
  // Add student to the waitlist
  waitlist.push(student);
  console.log(`Student ${student.name} added to waitlist.`);
}

/**
 * Removes a student from the waitlist.
 * @param {string} studentId - The ID of the student to remove.
 * @returns {Student|undefined} - The removed student, or undefined if not found.
 */
function removeFromWaitlist(studentId) {
  // Locate student in the waitlist
  const index = waitlist.findIndex(s => s.id === studentId);

  if (index > -1) {
    // Remove and return the student from the waitlist
    const [removedStudent] = waitlist.splice(index, 1);
    console.log(`Student ${removedStudent.name} removed from waitlist.`);
    return removedStudent;
  }

  return undefined;
}

/**
 * Gets the current waitlist.
 * @returns {Array<Student>} - Collection of waitlisted students.
 */
function getWaitlist() {
  // Provide access to the current waitlist
  return waitlist;
}

/**
 * Attempts to process the waitlist by allotting rooms to students.
 * This function should be called when rooms become available.
 * @param {Array<Room>} allRooms - All available rooms in the system.
 * @param {Function} allotRoomFn - Function to call for room allotment (e.g., AllotmentService.allotRoom).
 */
function processWaitlist(allRooms, allotRoomFn) {
  console.log('Processing waitlist...');

  // Iterate through the waitlist and attempt allotment for each student
  for (let i = 0; i < waitlist.length; i++) {
    const student = waitlist[i];

    if (allotRoomFn(student, allRooms)) {
      // Remove student from waitlist upon successful allotment
      waitlist.splice(i, 1);
      i--; // Adjust index after removal to continue iteration correctly
    }
  }

  console.log('Waitlist processing complete.');
}

module.exports = {
  addToWaitlist,
  removeFromWaitlist,
  getWaitlist,
  processWaitlist,
};