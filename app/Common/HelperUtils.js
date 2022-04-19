'use strict'

const crypto = use('crypto');
const Const = use('App/Common/Const');
const escapeWildcards = (raw, escapeChar = '\\') => {
  return String(raw).trim().replace(/[\\%_]/g, (match) => escapeChar + match);
}

const Web3 = require('web3');

const hasSql = (value) => {

  if (value === null || value === undefined) {
      return false;
  }
  
  // sql regex reference: http://www.symantec.com/connect/articles/detection-sql-injection-and-cross-site-scripting-attacks
  var sql_meta = new RegExp('(%27)|(\')|(--)|(%23)|(#)', 'i');
  if(sql_meta.test(value)){
      return true;
  }
  
  var sql_meta2 = new RegExp('((%3D)|(=))[^\n]*((%27)|(\')|(--)|(%3B)|(;))', 'i');
  if(sql_meta2.test(value)){
      return true;
  }
  
  var sql_typical = new RegExp('w*((%27)|(\'))((%6F)|o|(%4F))((%72)|r|(%52))', 'i');
  if(sql_typical.test(value)){
      return true;
  }
  
  var sql_union = new RegExp('((%27)|(\'))union', 'i');
  if(sql_union.test(value)){
      return true;
  }
  
  return false;
}

/**
 * Generate "random" alpha-numeric string.
 *
 * @param  {int}      length - Length of the string
 * @return {string}   The result
 */
const randomString = async (length = 40) => {
  let string = ''
  let len = string.length

  if (len < length) {
    let size = length - len
    let bytes = await crypto.randomBytes(size)
    let buffer = new Buffer(bytes)

    string += buffer
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substr(0, size)
  }

  return string
};

const doMask = (obj, fields) => {
  for (const prop in obj) {
    if (!obj.hasOwnProperty(prop)) continue;
    if (fields.indexOf(prop) != -1) {
      obj[prop] = this.maskEmail(obj[prop]);
    } else if (typeof obj[prop] === 'object') {
      this.doMask(obj[prop], fields);
    }
  }
};

const maskEmail = async (email) => {
  console.log(`Email before mask is ${email}`);
  const preEmailLength = email.split("@")[0].length;
  // get number of word to hide, half of preEmail
  const hideLength = ~~(preEmailLength / 2);
  console.log(hideLength);
  // create regex pattern
  const r = new RegExp(".{" + hideLength + "}@", "g")
  // replace hide with ***
  email = email.replace(r, "***@");
  console.log(`Email after mask is ${email}`);
  return email;
};

const maskWalletAddress = async (wallet) => {
  console.log(`Wallet before mask is ${wallet}`);
  const preWalletLength = wallet.length;
  console.log('preWalletLength', preWalletLength);

  // get number of word to hide, 1/3 of preWallet
  const hideLength = Math.floor(preWalletLength / 3);
  console.log('hideLength', hideLength);

  // replace hide with ***
  let r = wallet.substr(hideLength, hideLength);
  wallet = wallet.replace(r, "*************");

  console.log(`Wallet after mask is ${wallet}`);
  return wallet;
};

const checkRole = (params, extraData) => {
  return {
    ...params,
    role: params.type === Const.USER_TYPE_PREFIX.ICO_OWNER ? Const.USER_ROLE.ICO_OWNER : Const.USER_ROLE.PUBLIC_USER,
  }
};

const responseErrorInternal = (message) => {
  return {
    status: 500,
    message: message || 'Sorry there seems to be a server error!',
    data: null,
  }
};

const responseNotFound = (message) => {
  return {
    status: 404,
    message: message || 'Not Found !',
    data: null,
  }
};

const responseBadRequest = (message) => {
  return {
    status: 400,
    message: message || 'Looks like this is unkown request, please try again or contact us.',
    data: null,
  }
};

const responseSuccess = (data = null, message) => {
  return {
    status: 200,
    message: message || 'Success !',
    data,
  }
};

const checkSumAddress = (address) => {
  const addressVerified = Web3.utils.toChecksumAddress(address);
  return addressVerified;
};

const seconds_since_epoch = (d) => { 
  return Math.floor( d / 1000 ); 
}
const toFixedNumber = function(x) {
  if (Math.abs(x) < 1.0) {
    var e = parseInt(x.toString().split('e-')[1]);
    if (e) {
        x *= Math.pow(10,e-1);
        x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
    }
  } else {
    var e = parseInt(x.toString().split('+')[1]);
    if (e > 17) {
        e -= 17;
        x /= Math.pow(10,e);
        x += (new Array(e+1)).join('0');
    }
  }
  return x;
}

module.exports = {
  randomString,
  doMask,
  maskEmail,
  maskWalletAddress,
  responseSuccess,
  responseNotFound,
  responseErrorInternal,
  responseBadRequest,
  checkSumAddress,
  toFixedNumber,

  seconds_since_epoch,
  escapeWildcards,
  hasSql
};
