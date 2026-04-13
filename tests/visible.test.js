// medium/tests/visible.test.js
const assert = require('assert');
const Student = require('../src/models/Student');
const Room = require('../src/models/Room');
const AllotmentService = require('../src/services/allotmentService');
const {
  initializeRooms,
  getAllRooms,
  getRoomById
} = require('../src/services/roomService');
const {
  addToWaitlist,
  removeFromWaitlist,
  getWaitlist,
  processWaitlist,
  clearWaitlist,
} = require('../src/services/waitlistService');
const {
  initializeSwapRequests,
  createSwapRequest,
  approveSwapRequest,
  rejectSwapRequest,
  getSwapRequests,
  clearSwapRequests,
} = require('../src/services/swapService');

// Mock data
const initialStudentsData = require('../data/students.json');
const initialHostelsData = require('../data/hostels.json');
const initialSwapRequestsData = require('../data/swapRequests.json');
const { exit } = require('process');

let students = [];
let rooms = [];
let swapRequests = [];

function setup() {
  // Deep copy initial data to ensure tests are isolated
  students = initialStudentsData.map(s => Student.fromObject(JSON.parse(JSON.stringify(s))));
  rooms = [];
  initialHostelsData.forEach(hostel => {
    hostel.rooms.forEach(roomData => {
      rooms.push(Room.fromObject(JSON.parse(JSON.stringify(roomData))));
    });
  });
  initializeRooms(rooms.map(r => r)); // Pass a copy to initialize
  initializeRooms(rooms.map(r => Room.fromObject({ ...r }))); // Pass a copy to initialize
  // Clear waitlist
  getWaitlist().splice(0, getWaitlist().length);
  getSwapRequests().splice(0, getSwapRequests().length);
  clearWaitlist();
  clearSwapRequests();
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, testFunction) {
  totalTests++;
  setup();
  try {
    passedTests++;
    testFunction();
    console.log(`✅ ${name}`);
  } catch (error) {
    failedTests++;
    console.error(`❌ ${name}`);
    console.error(error.message);
  }
}

console.log('Running Medium Level Tests: DormDesk Hostel Allotment Engine\n');

runTest('Room.hasSpace should correctly report space availability', () => {
  const room = new Room('R999', 'H999', 'Z001', 'Male', 1, ['S001']);
  assert.strictEqual(room.hasSpace(), false, 'Room with 1 capacity and 1 occupant should have no space');

  const room2 = new Room('R998', 'H999', 'Z002', 'Female', 2, ['S002']);
  assert.strictEqual(room2.hasSpace(), true, 'Room with 2 capacity and 1 occupant should have space');

  const room3 = new Room('R997', 'H999', 'Z003', 'Male', 0, []);
  assert.strictEqual(room3.hasSpace(), false, 'Room with 0 capacity should have no space');
});

runTest('AllotmentService.allotRoom should allot a room to an eligible student', () => {
  const student = students.find(s => s.id === 'S001'); // Alice Smith, Female
  const initialFemaleRooms = getAllRooms().filter(r => r.gender === 'Female');
  const roomA101 = initialFemaleRooms.find(r => r.roomNumber === 'A101'); // Capacity 2

  const success = AllotmentService.allotRoom(student, getAllRooms());
  assert.strictEqual(success, true, 'Allotment should be successful');
  assert.strictEqual(student.hasAllotment, true, 'Student should have hasAllotment set to true');
  assert.strictEqual(student.roomId, roomA101.id, 'Student should be allotted to room A101');
  assert.ok(roomA101.occupants.includes('S001'), 'Room A101 should contain S001');
});

runTest('AllotmentService.allotRoom should not allot if no eligible rooms are available', () => {
  const student = students.find(s => s.id === 'S001'); // Alice Smith, Female
  const femaleRooms = getAllRooms().filter(r => r.gender === 'Female');

  // Fill up all female rooms
  femaleRooms.forEach(room => {
    while (room.hasSpace()) {
      room.addOccupant(`TEMP-${Math.random()}`);
    }
  });

  const success = AllotmentService.allotRoom(student, getAllRooms());
  assert.strictEqual(success, false, 'Allotment should fail if no rooms are available');
  assert.strictEqual(student.hasAllotment, false, 'Student should not have an allotment');
  assert.strictEqual(student.roomId, null, 'Student roomId should remain null');
});

runTest('AllotmentService.deallotRoom should deallot a room from a student', () => {
  const student = students.find(s => s.id === 'S002'); // Bob Johnson, Male
  const roomB201 = getAllRooms().find(r => r.roomNumber === 'B201'); // Capacity 3

  // Manually allot for test
  roomB201.addOccupant(student.id);
  student.hasAllotment = true;
  student.roomId = roomB201.id;

  const success = AllotmentService.deallotRoom(student, getAllRooms());
  assert.strictEqual(success, true, 'Deallotment should be successful');
  assert.strictEqual(student.hasAllotment, false, 'Student should not have hasAllotment');
  assert.strictEqual(student.roomId, null, 'Student roomId should be null');
  assert.ok(!roomB201.occupants.includes('S002'), 'Room B201 should not contain S002');
});

runTest('WaitlistService.addToWaitlist and getWaitlist should work', () => {
  const student = students.find(s => s.id === 'S003'); // Charlie Brown
  addToWaitlist(student);
  const currentWaitlist = getWaitlist();
  assert.strictEqual(currentWaitlist.length, 1, 'Waitlist should have 1 student');
  assert.strictEqual(currentWaitlist[0].id, 'S003', 'Waitlisted student ID should match');
});

runTest('WaitlistService.removeFromWaitlist should remove a student', () => {
  const student1 = students.find(s => s.id === 'S003');
  const student2 = students.find(s => s.id === 'S004');
  addToWaitlist(student1);
  addToWaitlist(student2);

  const removed = removeFromWaitlist('S003');
  assert.ok(removed !== undefined, 'Student S003 should be removed');
  assert.strictEqual(getWaitlist().length, 1, 'Waitlist should have 1 student remaining');
  assert.strictEqual(getWaitlist()[0].id, 'S004', 'Remaining student should be S004');
});

runTest('WaitlistService.processWaitlist should allot rooms to waitlisted students', () => {
  const studentAlice = students.find(s => s.id === 'S001'); // Female
  const studentDiana = students.find(s => s.id === 'S004'); // Female
  const studentEve = students.find(s => s.id === 'S005'); // Female

  // Fill one female room, leave one space in another
  const roomA101 = getRoomById('R001'); // Capacity 2
  const roomA102 = getRoomById('R002'); // Capacity 1
  roomA101.addOccupant('TEMP1'); // Fill one spot in A101

  addToWaitlist(studentAlice); // Should get A101
  addToWaitlist(studentDiana); // Should get A102
  addToWaitlist(studentEve); // Should remain on waitlist

  processWaitlist(getAllRooms(), AllotmentService.allotRoom);

  assert.strictEqual(getWaitlist().length, 1, 'One student should remain on waitlist');
  assert.strictEqual(getWaitlist()[0].id, 'S005', 'Eve should still be on waitlist');

  assert.strictEqual(studentAlice.hasAllotment, true, 'Alice should have an allotment');
  assert.strictEqual(studentAlice.roomId, roomA101.id, 'Alice should be in A101');
  assert.ok(roomA101.occupants.includes('S001'), 'Room A101 should contain Alice');

  assert.strictEqual(studentDiana.hasAllotment, true, 'Diana should have an allotment');
  assert.strictEqual(studentDiana.roomId, roomA102.id, 'Diana should be in A102');
  assert.ok(roomA102.occupants.includes('S004'), 'Room A102 should contain Diana');
});

runTest('SwapService.createSwapRequest should create a new request', () => {
  const request = createSwapRequest('S001', 'S002');
  assert.ok(request !== null, 'Swap request should be created');
  assert.strictEqual(request.status, 'pending', 'Request status should be pending');
  assert.strictEqual(getSwapRequests().length, 1, 'There should be 1 swap request');
});

runTest('SwapService.createSwapRequest should not create duplicate requests', () => {
  createSwapRequest('S001', 'S002');
  const request = createSwapRequest('S001', 'S002');
  assert.strictEqual(request, null, 'Duplicate swap request should not be created');
  assert.strictEqual(getSwapRequests().length, 1, 'There should still be 1 swap request');
});

runTest('SwapService.approveSwapRequest should swap rooms between two students', () => {
  const studentAlice = students.find(s => s.id === 'S001'); // Female
  const studentBob = students.find(s => s.id === 'S002'); // Male

  const roomA101 = getRoomById('R001'); // Female, Capacity 2
  const roomB201 = getRoomById('R003'); // Male, Capacity 3

  // Manually allot rooms
  roomA101.addOccupant(studentAlice.id);
  studentAlice.hasAllotment = true;
  studentAlice.roomId = roomA101.id;

  roomB201.addOccupant(studentBob.id);
  studentBob.hasAllotment = true;
  studentBob.roomId = roomB201.id;

  const swapReq = createSwapRequest('S001', 'S002');
  const success = approveSwapRequest(swapReq.requestId, students, getAllRooms());

  assert.strictEqual(success, true, 'Swap approval should be successful');
  assert.strictEqual(studentAlice.roomId, roomB201.id, 'Alice should now be in B201');
  assert.strictEqual(studentBob.roomId, roomA101.id, 'Bob should now be in A101');

  assert.ok(roomB201.occupants.includes('S001'), 'Room B201 should contain Alice');
  assert.ok(!roomB201.occupants.includes('S002'), 'Room B201 should not contain Bob');

  assert.ok(roomA101.occupants.includes('S002'), 'Room A101 should contain Bob');
  assert.ok(!roomA101.occupants.includes('S001'), 'Room A101 should not contain Alice');

  assert.strictEqual(getSwapRequests().find(r => r.requestId === swapReq.requestId).status, 'approved', 'Swap request status should be approved');
});

runTest('SwapService.rejectSwapRequest should reject a pending request', () => {
  const swapReq = createSwapRequest('S001', 'S002');
  const success = rejectSwapRequest(swapReq.requestId);

  assert.strictEqual(success, true, 'Swap rejection should be successful');
  assert.strictEqual(getSwapRequests().find(r => r.requestId === swapReq.requestId).status, 'rejected', 'Swap request status should be rejected');
});

console.log('\nAll Medium Level tests completed.');

console.log('\n---------------------------');
console.log(`Total: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (failedTests === 0) {
  console.log('🎉 All tests passed!');
  process.exit(0);
} else {
  console.log(`⚠️ ${failedTests} test(s) failed`);
  process.exit(1);
}