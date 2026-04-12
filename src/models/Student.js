// medium/src/models/Student.js

/**
 * Represents a student in the hostel allotment system.
 */
class Student {
  /**
   * @param {string} id - Unique student ID.
   * @param {string} name - Student's full name.
   * @param {string} gender - Student's gender ('Male' or 'Female').
   * @param {string} program - Student's academic program (e.g., 'B.Tech', 'M.Tech').
   * @param {number} year - Academic year of the student (e.g., 1, 2, 3, 4).
   * @param {boolean} hasAllotment - True if the student has a room allotment.
   * @param {string|null} roomId - ID of the allotted room, or null if no allotment.
   */
  constructor(id, name, gender, program, year, hasAllotment = false, roomId = null) {
    this.id = id;
    this.name = name;
    this.gender = gender;
    this.program = program;
    this.year = year;
    this.hasAllotment = hasAllotment;
    this.roomId = roomId;
  }

  /**
   * Creates a Student instance from a plain object.
   * @param {Object} data - Plain object containing student data.
   * @returns {Student}
   */
  static fromObject(data) {
    return new Student(
      data.id,
      data.name,
      data.gender,
      data.program,
      data.year,
      data.hasAllotment,
      data.roomId
    );
  }
}

module.exports = Student;