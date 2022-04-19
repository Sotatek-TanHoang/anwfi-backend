const GenSignature = (privateKey, amount, user) => {
  var Web3 = require('web3');
  const { soliditySha3 } = require("web3-utils");

  var web3 = new Web3();

  const message = soliditySha3(user, amount);
  const result = web3.eth.accounts.sign(message, privateKey)
  return result.signature
}

module.exports = {
  GenSignature
}