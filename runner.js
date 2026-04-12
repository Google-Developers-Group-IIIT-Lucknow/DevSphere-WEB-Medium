// medium/runner.js
const Student = require('./src/models/Student');
const Room = require('./src/models/Room');
const AllotmentService = require('./src/services/allotmentService');
const {
  initializeRooms,
  getAllRooms,
  getRoomById
} = require('./src/services/roomService');
const {
  addToWaitlist,
  removeFromWaitlist,
  getWaitlist,
  processWaitlist
} = require('./src/services/waitlistService');
const {
  initializeSwapRequests,
  createSwapRequest,
  approveSwapRequest,
  rejectSwapRequest,
  getSwapRequests
} = require('./src/services/swapService');

// Load initial data
const initialStudentsData = require('./data/students.json');
const initialHostelsData = require('./data/hostels.json');
const initialSwapRequestsData = require('./data/swapRequests.json');

function main() {
  console.log('--- DormDesk Hostel Allotment Engine Simulation ---');

  // 1. Initialize Data
  const students = initialStudentsData.map(s => Student.fromObject(s));
  const rooms = [];
  initialHostelsData.forEach(hostel => {
    hostel.rooms.forEach(roomData => {
      rooms.push(Room.fromObject(roomData));
    });
  });
  initializeRooms(rooms);
  initializeSwapRequests(initialSwapRequestsData);

  console.log('\nInitial State:');
  console.log('Students:', students.map(s => ({
    id: s.id,
    name: s.name,
    hasAllotment: s.hasAllotment,
    roomId: s.roomId
  })));
  console.log('Rooms:', getAllRooms().map(r => ({
    id: r.id,
    roomNumber: r.roomNumber,
    occupants: r.occupants
  })));
  console.log('Waitlist:', getWaitlist().map(s => s.id));
  console.log('Swap Requests:', getSwapRequests().map(req => ({
    id: req.requestId,
    status: req.status
  })));

  // 2. Simulate Allotment
  console.log('\n--- Simulating Allotment ---');
  const alice = students.find(s => s.id === 'S001'); // Female
  const bob = students.find(s => s.id === 'S002'); // Male
  const charlie = students.find(s => s.id === 'S003'); // Male
  const diana = students.find(s => s.id === 'S004'); // Female
  const eve = students.find(s => s.id === 'S005'); // Female

  AllotmentService.allotRoom(alice, getAllRooms());
  AllotmentService.allotRoom(bob, getAllRooms());
  AllotmentService.allotRoom(charlie, getAllRooms());
  AllotmentService.allotRoom(diana, getAllRooms());
  AllotmentService.allotRoom(eve, getAllRooms()); // This student might go to waitlist

  console.log('\nState After Initial Allotment:');
  console.log('Students:', students.map(s => ({
    id: s.id,
    name: s.name,
    hasAllotment: s.hasAllotment,
    roomId: s.roomId
  })));
  console.log('Rooms:', getAllRooms().map(r => ({
    id: r.id,
    roomNumber: r.roomNumber,
    occupants: r.occupants
  })));
  console.log('Waitlist:', getWaitlist().map(s => s.id));

  // 3. Simulate Deallotment and Waitlist Processing
  console.log('\n--- Simulating Deallotment and Waitlist Processing ---');
  // Let's say Bob decides to leave, freeing up his room
  AllotmentService.deallotRoom(bob, getAllRooms());
  processWaitlist(getAllRooms(), AllotmentService.allotRoom); // Process waitlist after a room is free

  console.log('\nState After Deallotment and Waitlist Processing:');
  console.log('Students:', students.map(s => ({
    id: s.id,
    name: s.name,
    hasAllotment: s.hasAllotment,
    roomId: s.roomId
  })));
  console.log('Rooms:', getAllRooms().map(r => ({
    id: r.id,
    roomNumber: r.roomNumber,
    occupants: r.occupants
  })));
  console.log('Waitlist:', getWaitlist().map(s => s.id));

  // 4. Simulate Swap Request
  console.log('\n--- Simulating Swap Request ---');
  // Assuming Alice and Diana both have allotments now
  const swapReq = createSwapRequest(alice.id, diana.id);
  if (swapReq) {
    approveSwapRequest(swapReq.requestId, students, getAllRooms());
  }

  console.log('\nState After Swap Request:');
  console.log('Students:', students.map(s => ({
    id: s.id,
    name: s.name,
    hasAllotment: s.hasAllotment,
    roomId: s.roomId
  })));
  console.log('Rooms:', getAllRooms().map(r => ({
    id: r.id,
    roomNumber: r.roomNumber,
    occupants: r.occupants
  })));
  console.log('Swap Requests:', getSwapRequests().map(req => ({
    id: req.requestId,
    status: req.status
  })));

  console.log('\n--- Simulation Complete ---');
}

main();