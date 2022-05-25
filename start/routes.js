'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

const Const = use('App/Common/Const');

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')
Route.get('/', () => 'It\'s working')
Route.get('/test-bull','TestController.test')
//Route.get('image/:fileName', 'FileController.getImage');

Route.group(() => {
  // Auth
  Route.post('/login', 'UserAuthController.login').validator('Login')
  // comment line below to bypass signature checking.
  .middleware('checkSignature');

  // TODO: implement confirm email later
}).middleware(['typeAdmin', 'checkPrefix', 'formatEmailAndWallet']);

// Admin only work routes
Route.group(() => {
  
  // // bulk create user.
  // Route.post('/bulk-create', 'UserController.bulkCreateUser').validator('UserArray')
  
  // // bulk update
  // Route.put('/bulk-update','UserController.bulkUpdateUser').validator('UserArray')
  
  // create admin or governance by admin.
  Route.post('/', 'UserController.createUser').validator('CreateUser');
  Route.put('/transfer/:id','UserController.transferSuperAdmin')
  

}).prefix(Const.USER_TYPE_PREFIX.ADMIN)
  .middleware(['typeAdmin', 'checkPrefix', 'checkAdminJwtSecret', 'auth:admin', 'CheckSuperAdminAbove']);

// Admin and Governance only work routes
Route.group(() => {
  // get list of admins with pagination.
  Route.get('/', 'UserController.getAdminList');
  // get single admin profile by id.
  Route.get('/:id', 'UserController.getUserDetail');

  // update single admin by id.
  Route.put('/:id', 'UserController.updateUserProfile').validator('UpdateUser');
  // delete single admin by id.
  Route.delete('/:id', 'UserController.deleteUser').validator("DeleteUser");

  

  // check if a wallet_address is available.
  Route.get('/wallet/check', 'UserAuthController.checkWalletAddress');
  Route.post('/wallet/check', 'UserAuthController.checkWalletAddress');

}).prefix(Const.USER_TYPE_PREFIX.ADMIN)
  .middleware(['typeAdmin', 'checkPrefix', 'checkAdminJwtSecret', 'auth:admin', 'checkGovernanceAbove']);

// // Admin and Governance only work routes
// Route.group(() => {
//   // get list of admins with pagination.
//   Route.get('/', 'UserController.getAdminList');
//   // get single admin profile by id.
//   Route.get('/:id', 'UserController.getUserDetail');
// }).prefix(Const.USER_TYPE_PREFIX.ADMIN)
//   .middleware(['typeAdmin', 'checkPrefix', 'checkAdminJwtSecret', 'auth:admin', 'checkGovernanceAbove']);

// Proposals APIs for admin
Route.group(() => {
  // get list of proposals.
  Route.get('/proposal', 'ProposalController.getProposalList');
  // get single proposals.
  Route.get('/proposal/:id', 'ProposalController.getProposalDetail')
  // create single proposal
  Route.post('/proposal', 'ProposalController.createProposal').validator('ProposalParams');
  // update single proposal basic information (except for status).
  Route.put('/proposal/:id', 'ProposalController.updateProposalBasic').validator('ProposalParams');
  // udpate single proposal status.
  Route.put('/proposal/status/:id', 'ProposalController.pushProposalProcess')
  // delete single proposal
  Route.delete('/proposal/:id', 'ProposalController.deleteProposal')
  
  // create single pool
  Route.post('/pool', 'PoolController.createPool')   
  
}).middleware(['typeAdmin', 'checkPrefix', 'checkAdminJwtSecret', 'auth:admin',
"checkAdminAbove",
]);
// Voting APIs:
Route.group(() => {

  Route.post('/vote/:id', 'VoteController.create').validator("CheckVote")
  Route.get("/vote/status/:id",'VoteController.checkUserVote')
  // Route.post("/vote/:id", "VoteController.createVote").validator('CheckVote') // vote off-chain
}).middleware(['typeUser', 'checkPrefix', 'checkAdminJwtSecret', 'auth:user']);

 // Pool info APIs:
Route.group(() => {
  Route.get('/pool-token', 'PoolTokenController.getPoolTokenInfo')  
  Route.get('/pool', 'PoolController.getPoolInfo') // get list pool 
  Route.get('/pool/:stake_token', 'PoolController.getPoolDetail')  

  // test API
  Route.post('/pool-sc', 'PoolController.createOrUpdate')   // fetch pool info from SC 
  Route.get('/pool-liquidity', 'PoolController.getPoolLiquidity')  
  Route.get('/finish-proposal', 'ProposalController.finish')  
  Route.post('/pool-token', 'PoolTokenController.getTokenInfoFromSC')  
  Route.get('/token-price', 'PoolTokenController.fetchTokenPrice')  // fetch token price from coinmarket cap

  // Route.post("/vote/:id", "VoteController.createVote").validator('CheckVote') // vote off-chain
})




// Public API:
Route.group(() => {

  Route.post('add-subscribe', 'SubscribeController.addSubscribes').validator('AddSubscribe');

}).middleware(['maskEmailAndWallet']);

// public routes
Route.group(() => {
  // login public user, if account not exists then create
  Route.post('/login', 'UserAuthController.loginPublicUser').validator('Login').middleware('checkSignature'); // login and register when login user not exist
  // get proposal detail for public
  Route.get('/proposal/:id',"ProposalController.getProposalDetail")
  // get proposals list for public
  Route.get('/proposal',"ProposalController.getProposalList")
  // get votes list for public
  Route.get("/vote/:id", "VoteController.getVote"); // get proposal vote with pagination
}).prefix(Const.USER_TYPE_PREFIX.PUBLIC_USER).middleware(['typeUser', 'checkPrefix']);
