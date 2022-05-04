'use strict'

const HelperUtils = use('App/Common/HelperUtils');
const Const = use('App/Common/Const');
const VoteModel = use('App/Models/Vote')
const VoteService = use('App/Services/VoteService')
class ProposalController {

  async createVote({ request, auth }) {
    try {

      const inputs = request.only(['wallet_address', 'vote'])
      const proposal_id = request.params.id;
      const userVote = await VoteService.findOne({
        wallet_address: inputs.wallet_address,
        proposal_id
      })
      // create if vote not exists
      if(!userVote){
        const newVote=new VoteModel();
        newVote.fill({
          ...inputs,
          proposal_id
        })
        await newVote.save();
        return HelperUtils.responseSuccess(newVote);
      }
      // update if vote exists.
      userVote.merge(inputs);
      await userVote.save();
      return HelperUtils.responseSuccess(userVote);
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