export function log(message: string, source = 'express') {
  const time = new Date().toLocaleTimeString('en-US');
  console.log(`${time} [${source}] ${message}`);
}
