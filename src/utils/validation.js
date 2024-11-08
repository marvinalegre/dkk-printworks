export function validUsername(username) {
  if (username.length < 3) return false;
  if (username.length > 20) return false;
  if (!/^[a-z0-9]+$/.test(username)) return false;

  return true;
}
