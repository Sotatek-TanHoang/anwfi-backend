"use strict";

const ForbiddenException = use('App/Exceptions/ForbiddenException');
const Web3 = require('web3')
const web3 = new Web3();
const Const = use("App/Common/Const");

class CheckUserSignature {
  async handle({ request, }, next) {
    try {

      const params = request.all();
      const headers = request.headers();
      const signature = params.signature;
      const message = Const.USER_MESSAGE;

      console.log('Check Signature with: ', params);
      console.log('Message: ', message, signature);

      let recover = await web3.eth.accounts.recover(message, signature);
      const recoverConvert = Web3.utils.toChecksumAddress(recover);
      const wallet_address = Web3.utils.toChecksumAddress(params.wallet_address);
      console.log('recoverConvert: ', recover, recoverConvert, wallet_address);

      if (recoverConvert && recoverConvert !== wallet_address) {
        throw new ForbiddenException('Invalid signature!');
      }

      headers.wallet_address = wallet_address;

      await next();
    } catch (e) {
      console.log('ERROR: ', e);
      throw new ForbiddenException('Unauthorized!');
    }
  }
}

module.exports = CheckUserSignature;
