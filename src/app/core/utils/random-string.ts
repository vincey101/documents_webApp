export function randomString(length = 36) {
  let random = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    random += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return random;
}
