export function uniqueId() {
  return (Math.random().toString(36) + '00000000000000000').slice(2, 10);
}
