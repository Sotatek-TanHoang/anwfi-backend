"use strict";

const ForbiddenException = use('App/Exceptions/ForbiddenException');
const Web3 = require('web3')
const web3 = new Web3();
const Env = use('Env')
const HelperUtils=use("App/Common/HelperUtils")
class CheckSignature {
  async handle({ request,response }, next) {
    try {
      if (Env.get('NODE_ENV', 'production') === 'development') {
        return await next();
      }
      // const type = request.params.type;
      // const isAdmin = type == Const.USER_TYPE_PREFIX.ADMIN;
      // const message = isAdmin ? process.env.MESSAGE_SIGNATURE : process.env.MESSAGE_INVESTOR_SIGNATURE;

      const params = request.all();
      const headers = request.headers();
      const signature = params.signature;
      const message = headers.msgsignature;

      console.log('Check Signature with: ', params);
      console.log('Message: ', message, signature);

      let recover = await web3.eth.accounts.recover(message, signature);
      const recoverConvert = Web3.utils.toChecksumAddress(recover);
      const wallet_address = Web3.utils.toChecksumAddress(params.wallet_address);
      console.log('recoverConvert: ', recover, recoverConvert, wallet_address);

      if (recoverConvert && recoverConvert !== wallet_address) {
        return response.forbidden(HelperUtils.responseForbidden('Invalid signature!'));
      }

      headers.wallet_address = wallet_address;

      return await next();
    } catch (e) {
      console.log('ERROR: ', e);
      return response.unauthorized(HelperUtils.responseUnauthorized('Unauthorized!'));
    }
  }
}

module.exports = CheckSignature;
