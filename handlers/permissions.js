exports.permissionList = [
  "admin",
  "teacher",
  "ta",
  "student",
  "para",
  "parent",
  "discipline",
  "pbis",
  "bullyingAdmin",
  "bullyingTeacher",
  "bullyingDesignated",
  "disciplineEmail",
  "bullyingEmail",
  "pbisEmail",
  "phoneEmail",
];

exports.isStaff = (user) => {
  console.log("teachertest");
  if (
    user.permissions.includes("teacher") ||
    user.permissions.includes("admin") ||
    user.permissions.includes("para")
  ) {
    return true;
  } else {
    return false;
  }
};
