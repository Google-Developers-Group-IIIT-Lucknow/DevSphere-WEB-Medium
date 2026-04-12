# 🟡 Medium: DormDesk (Broken Hostel Allotment Engine)

## Challenge Overview

Welcome to DormDesk, a system designed to manage hostel room allotments for students. This challenge presents a fully written system, but it's plagued with **6-8 non-trivial logical bugs spread across its modules**. Your mission is to act as a seasoned debugger, understand the system's intricate flow, identify all the bugs, and fix them to ensure the system operates correctly.

This is not a simple syntax-fixing exercise. You'll need to delve deep into the logic, understand how different services interact, and uncover subtle errors that lead to incorrect allotments, waitlist processing, or swap operations.

## Problem Description

The DormDesk system consists of:

*   **`models/`**: Defines `Student` and `Room` data structures.
*   **`services/`**: Contains core business logic for `allotmentService`, `roomService`, `waitlistService`, and `swapService`.
*   **`utils/`**: Provides helper functions like ID generation and validation.
*   **`data/`**: JSON files simulating a database for students, hostels (containing rooms), and swap requests.

The system aims to:
1.  Allot rooms to students based on gender and availability.
2.  Manage a waitlist for students who couldn't be immediately allotted a room.
3.  Handle room swap requests between students.

## Real Issues Observed 

When the system was run with real data, the following issues were observed:

- A 13th student got added to a full room before rejection
- Seniority rules were ignored during allotment
- Room swap allowed swapping with the same room (different object instances)
- Waitlist served most recently added students instead of earliest ones
- Gender restrictions were not properly enforced
- Swap deadlines in "DD-MM-YYYY" format were not handled correctly
- Input student list was unexpectedly modified during processing
### Common Bug Types to Look For:

*   **Off-by-one errors:** Especially in capacity checks or array indexing.
*   **Wrong field usage/Schema Mismatch:** Using an incorrect property name or expecting a different data type than what's actually provided.
*   **Incorrect Data Structure Usage:** Misunderstanding how queues (FIFO) or stacks (LIFO) should behave, or using a simple array where a more robust structure is needed.
*   **Object Reference vs. Value Comparison:** Comparing objects by reference (`===`) when you should be comparing their content or specific properties.
*   **Date Parsing Issues:** Incorrectly handling date strings, especially non-ISO formats, leading to invalid date objects or comparison problems.
*   **Mutation Side-Effects:** Modifying input arrays or objects directly when a copy should be made, leading to unexpected behavior in other parts of the system.
*   **Incorrect Sorting Priority:** Sorting algorithms not producing the desired order, affecting allotment fairness or efficiency.
*   **Missing Validations:** Critical checks (e.g., gender compatibility during swaps, room availability before adding occupants) might be absent.

## Your Responsibilities

1.  **Read the Entire Codebase:** Understand the purpose of each file and how they connect.
2.  **Understand the Flow:** Trace the execution path for key operations like `allotRoom`, `processWaitlist`, and `approveSwapRequest`.
3.  **Identify Bugs:** Pinpoint all logical errors. There are no syntax errors, so focus purely on behavior.
4.  **Fix ALL Bugs:** Ensure the system behaves as expected under all conditions, including edge cases. Partial success is not enough; all tests must pass.

⚠️ Do not modify test files or data files. Only changes in `src/` are allowed.

## How to Run

1.  Navigate to the `medium` directory:
    ```bash
    cd medium
    ```
2.  Run the visible tests:
    ```bash
    node tests/visible.test.js
    ```
    These tests are designed to fail initially. Your goal is to fix `medium/src/**/*.js` files until all tests pass.

3.  (Optional) Run the `runner.js` to see a simulation of the system's operations:
    ```bash
    node runner.js
    ```
    This script demonstrates the system's functionality and can help you observe the effects of your fixes.

## Difficulty Standard

This challenge is equivalent to debugging production code in a real-world scenario. It requires a holistic understanding of the system and careful attention to detail. It is not solvable by just looking at one file; you must understand the interactions across modules.

**Good luck, and may your debugging skills shine!**
