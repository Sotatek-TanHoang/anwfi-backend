'use strict'

const SubcribeModel = use('App/Models/Subscribe');
const HelperUtils = use('App/Common/HelperUtils');

  
class SubscribeController {
  async getSubscribes({ request }) {
    try {
      const res = await SubcribeModel.query().fetch();
      return HelperUtils.responseSuccess(res);
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('Get Whitelist Failed !');
    }
  }

  async addSubscribes({ request }) {

    const inputParams = request.only(['email']);

    try {
      // Create Subscribes
      const subcribeModel = new SubcribeModel();
      let checkEmail = await SubcribeModel.query().where({email: inputParams.email}).first()
      if(checkEmail) {
        return HelperUtils.responseErrorInternal("Email has subscribed");
      }
      subcribeModel.email = inputParams.email;

      await subcribeModel.save()
      return HelperUtils.responseSuccess(subcribeModel);
    }catch (e) {
      console.log('[SubscribeController::addSubscribes] - ERROR: ', e);
      return HelperUtils.responseErrorInternal();
    }
  }
}

module.exports = SubscribeController
