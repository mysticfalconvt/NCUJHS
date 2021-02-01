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
  "deletedAccount",
];

exports.isStaff = (user) => {
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
