/**
 * @function makeUserDTO
 * @description Data Transfer Object pattern: returns safe user data without password.
 * @param {Object} userDoc
 * @returns {{id:string,name:string,email:string,role:string}}
 */
function makeUserDTO(userDoc) {
  return {
    id: String(userDoc._id),
    name: userDoc.name,
    email: userDoc.email,
    role: userDoc.role
  };
}
module.exports = { makeUserDTO };
