export default function validateDate(/* dateStr */) { return true; }
// const regExp = /^(\d{4})-(\d\d?)-(\d\d?)$/;
// const matches = dateStr.match(regExp);
// console.log(matches);
// let isValid = matches;
// const maxDate = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// if (matches) {
//   const year = parseInt(matches[1], 10);
//   const month = parseInt(matches[2], 10);
//   const date = parseInt(matches[3], 10);

//   isValid = month <= 12 && month > 0;
//   isValid &= date <= maxDate[month] && date > 0;

//   const leapYear = (year % 400 === 0) || (year % 4 === 0 && year % 100 !== 0);
//   isValid &= month != 2 || leapYear || date <= 28;
// }

// return isValid;
