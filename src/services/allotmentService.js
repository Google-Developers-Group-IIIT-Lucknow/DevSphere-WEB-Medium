/**
 * Service for handling student room allotments.
 */
class AllotmentService {
  /**
   * Attempts to allot a room to a student.
   * @param {Student} student - The student to allot.
   * @param {Array<Room>} allRooms - All available rooms in the system.
   * @returns {boolean} - True if allotment was successful, false otherwise.
   */
  static allotRoom(student, allRooms) {
    if (student.hasAllotment) {
      console.log(`Student ${student.name} already has an allotment.`);
      return false;
    }

    // Filter rooms based on eligibility criteria (e.g., gender compatibility)
    const eligibleRooms = getRoomsByGender(allRooms, student.gender);

    // Arrange rooms to determine the order in which they are evaluated for allotment
    eligibleRooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));

    // Iterate through rooms and assign the first available slot
    for (const room of eligibleRooms) {
      if (room.hasSpace()) {
        room.addOccupant(student.id);
        student.hasAllotment = true;
        student.roomId = room.id;

        // Persist updated room state
        updateRoom(room);

        console.log(`Allotted room ${room.roomNumber} to ${student.name}.`);
        return true;
      }
    }

    console.log(`No available rooms for ${student.name}.`);
    return false;
  }

  /**
   * Deallocates a room from a student.
   * @param {Student} student - The student to deallocate.
   * @param {Array<Room>} allRooms - All available rooms in the system.
   * @returns {boolean} - True if deallocation was successful, false otherwise.
   */
  static deallotRoom(student, allRooms) {
    // Ensure student currently has an active allotment
    if (!student.hasAllotment || !student.roomId) {
      console.log(`Student ${student.name} does not have an allotment.`);
      return false;
    }

    // Locate the room associated with the student
    const room = allRooms.find(r => r.id === student.roomId);

    if (room) {
      room.removeOccupant(student.id);
      student.hasAllotment = false;
      student.roomId = null;

      // Persist updated room state
      updateRoom(room);

      console.log(`Deallotted room ${room.roomNumber} from ${student.name}.`);
      return true;
    }

    console.log(`Room ${student.roomId} not found for deallocation.`);
    return false;
  }
}

module.exports = AllotmentService;