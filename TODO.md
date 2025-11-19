# TODO: Remove Course and Username Fields from Student Management

## Frontend Changes
- [ ] Remove course field from Add-student.jsx form
- [ ] Remove username field from Add-student.jsx form
- [ ] Remove course field from Edit-student.jsx form
- [ ] Remove username field from Edit-student.jsx form

## Backend Changes
- [ ] Update studentController.js to exclude course and username from studentData, validation, and checks
- [ ] Update Student.js model to remove course and username from INSERT and SELECT queries

## Testing
- [ ] Test adding a new student without course and username
- [ ] Test editing an existing student
- [ ] Verify backend API handles requests without these fields
