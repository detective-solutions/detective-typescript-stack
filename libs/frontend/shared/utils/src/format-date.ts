export function formatDate(date: Date) {
  return [date.getFullYear(), convertToTwoDigits(date.getMonth() + 1), convertToTwoDigits(date.getDate())].join('-');
}

function convertToTwoDigits(toBeConverted: number) {
  return toBeConverted.toString().padStart(2, '0');
}
