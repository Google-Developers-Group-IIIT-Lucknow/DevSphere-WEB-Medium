// medium/src/models/Room.js

/**
 * Represents a hostel room in the allotment system.
 */
class Room {
  /**
   * @param {string} id - Unique room ID.
   * @param {string} hostelId - ID of the hostel this room belongs to.
   * @param {string} roomNumber - Room number (e.g., "A101").
   * @param {string} gender - Gender assigned to the room ('Male' or 'Female').
   * @param {number} capacity - Maximum number of students the room can hold.
   * @param {Array<string>} occupants - Array of student IDs currently occupying the room.
   */
  constructor(...args) {
  if (args.length === 1 && typeof args[0] === 'object') {
    const { id, number, capacity, occupants = [], gender } = args[0];
    this.id = id;
    this.roomNumber = number;
    this.capacity = capacity;
    this.occupants = [...occupants];
    this.gender = gender;
  } else {
    // support test format
    const [id, hostelId, roomNumber, gender, capacity, occupants = []] = args;
    this.id = id;
    this.hostelId = hostelId;
    this.roomNumber = roomNumber;
    this.gender = gender;
    this.capacity = capacity;
    this.occupants = [...occupants];
  }
}

  /**
   * Checks if the room has available space.
   * @returns {boolean} - True if there's space, false otherwise.
   */
  hasSpace() {
    // Bug: Off-by-one error. Should be this.occupants.length < this.capacity
    return this.occupants.length <= this.capacity;
  }

  /**
   * Adds an occupant to the room.
   * @param {string} studentId - The ID of the student to add.
   * @returns {boolean} - True if student was added, false if no space.
   */
  addOccupant(studentId) {
    if (this.hasSpace()) {
      this.occupants.push(studentId);
      return true;
    }
    return false;
  }

  /**
   * Removes an occupant from the room.
   * @param {string} studentId - The ID of the student to remove.
   * @returns {boolean} - True if student was removed, false otherwise.
   */
  removeOccupant(studentId) {
    const index = this.occupants.indexOf(studentId);
    if (index > -1) {
      this.occupants.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Creates a Room instance from a plain object.
   * @param {Object} data - Plain object containing room data.
   * @returns {Room}
   */
  static fromObject(data) {
    return new Room(
      data.id,
      data.hostelId,
      data.roomNumber,
      data.gender,
      data.capacity,
      data.occupants || []
    );
  }
}

module.exports = Room;