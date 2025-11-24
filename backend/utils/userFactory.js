/**
 * @function createUser
 * @description Factory Pattern: builds a standardized user object.
 * @param {String} name
 * @param {String} email
 * @param {String} password
 * @param {String} role
 */
function createUser(name, email, password, role = 'user') {
  return { name, email, password, role };
}
module.exports = { createUser };
