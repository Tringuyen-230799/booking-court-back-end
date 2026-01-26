export const formatErrorStack = (error: Error) => {
  const stackTrace = error?.stack?.split('\n')[1]?.trim();
  const err = stackTrace?.split(' ');
  const filePath = err?.[err?.length - 1] || 'unknown file';

  return filePath;
};

export function errorConvert(error: Error) {
  const stackTrace = error.stack || '';
  const stackLines = stackTrace.split('\n');

  let fileError;
  let lineError;
  let columnError;

  const stackRegex = /\((.*?):(\d+):(\d+)\)/;
  for (const line of stackLines) {
    const match = stackRegex.exec(line);
    if (match) {
      fileError = match[1];
      lineError = match[2];
      columnError = match[3];
      break;
    }
  }
  return `${error.name}: ${error.message} at ${fileError}:${lineError}:${columnError}`;
}
