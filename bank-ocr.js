const fs = require('fs');

const numberMap = {
  '0': ' _ ' +
       '| |' +
       '|_|',
  '1': '   ' +
       '  |' +
       '  |',
  '2': ' _ ' +
       ' _|' +
       '|_ ',
  '3': ' _ ' +
       ' _|' +
       ' _|',
  '4': '   ' +
       '|_|' +
       '  |',
  '5': ' _ ' +
       '|_ ' +
       ' _|',
  '6': ' _ ' +
       '|_ ' +
       '|_|',
  '7': ' _ ' +
       '  |' +
       '  |',
  '8': ' _ ' +
       '|_|' +
       '|_|',
  '9': ' _ ' +
       '|_|' +
       ' _|'
}

//read the file of scanned numbers into an array of strings containing each line
const acctNumbers = fs.readFileSync('acct-numbers').toString().split("\n");

function parseAcctNumbers(startingIndex = 0) {
  //get out if we've parsed the last number
  if (startingIndex > acctNumbers.length - 4) {
    return
  }

  //isolate a single scanned account number
  const acctString = acctNumbers.slice(startingIndex, startingIndex + 3).join('');

  //turn the scanned number into a string of digits
  const acctNum = produceDigits(acctString, 0, '');

  //assign status, perform the checksum, log output
  console.log(assignAccountNumberStatus(acctNum));

  //move onto the next scanned number
  parseAcctNumbers(startingIndex + 4)
}

function produceDigits(scannedAcctNumber, startIndex, acctNum) {
  //get out if we've reached the end of the scanned acct number
  if (startIndex > 24) {
    return acctNum
  }

  const getScannedDigit = (startIndex, scannedDigit) => {
    //get out if we've reached the end of the scanned digit
    if (scannedDigit.length === 9) {
      return scannedDigit
    }

    //build the digit 3 characters at a time
    const digitFragment = scannedAcctNumber.slice(startIndex, startIndex + 3);

    //shift 27 characters down the string to get to the next "line" and concat the latest 3 characters
    return getScannedDigit(startIndex + 27, scannedDigit + digitFragment )
  }

  //compile each scanned digit
  const scannedDigit = getScannedDigit(startIndex, '')

  //bastardize key/value roles and look up the number character key using the scanned digit string value
  let num;
  Object.keys(numberMap).find(key => {
    if (numberMap[key] === scannedDigit) {
      num = key
    }
  })

  //replace illegible digits
  num = num === undefined ? '?' : num

  //move on to the next digit and concat the latest actual digit to the account number
  return produceDigits(scannedAcctNumber, startIndex + 3, acctNum + num )
}

function assignAccountNumberStatus(acctNum) {
  if (acctNum.includes('?')) {
    return acctNum + " ILL"
  } else {
    return checkSum(acctNum) ? acctNum : acctNum + " ERR"
  }
}

function checkSum(acctNum){
  const cs = acctNum.split('').reduce((acc, val, i) => {
    return parseInt(acc) + ((9 - i) * parseInt(val));
  }, 0)
  return cs % 11 === 0
}

parseAcctNumbers();