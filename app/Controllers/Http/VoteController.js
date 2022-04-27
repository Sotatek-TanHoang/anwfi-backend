'use strict'

const HelperUtils = use('App/Common/HelperUtils');
const Const = use('App/Common/Const');
// const randomString = use('random-string');
class ProposalController {

  async create({ request, auth }) {
    try {
    

      return HelperUtils.responseSuccess({

      });
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: create proposal fail !');
    }
  }
 
  async getVote({ request }) {
    try {
      
      return HelperUtils.responseSuccess({

      });
    } catch (e) {
      console.log(e.message);
      return HelperUtils.responseErrorInternal('ERROR: get proposal list fail !');
    }
  }
}

module.exports = ProposalController