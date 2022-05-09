const ErrorFactory = use('App/Common/ErrorFactory');
const BadRequestException = use("App/Exceptions/BadRequestException")
// const UserService = use('App/Services/UserService');
const Joi = require('joi');
// schema object for validation.
const schema=Joi.object({
  wallet_address:Joi.string().required(),
  role:Joi.number().integer().greater(-1).less(4).required(),
  username:Joi.string(),
  email:Joi.string().email()
})
class UserArray {
  get rules() {
    try{
      const {users}=this.ctx.request.only(['users'])
      users.forEach(user=>{
        const {error}=schema.validate(user);
        if(error){
          throw new Error(error)
        }
      })
      
    }catch(e){
      console.log(e.message);
      throw new BadRequestException(e.message)
    }
  }

  get messages() {}

  get validateAll() {
    return true;
  }
 
  async fails(errorMessage) {
    return ErrorFactory.validatorException(errorMessage)
  }
}

module.exports = UserArray;
