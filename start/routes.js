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
Route.get('image/:fileName', 'FileController.getImage');

Route.group(() => {
  // Auth
  Route.post('/login', 'AuthAdminController.login').validator('Login').middleware('checkSignature');

  // TODO: implement confirm email later
  // Route.get('confirm-email/:token', 'AdminController.confirmEmail'); // Confirm email when register

}).prefix(Const.USER_TYPE_PREFIX.ICO_OWNER).middleware(['typeAdmin', 'checkPrefix', 'formatEmailAndWallet']);

// Admin work route
Route.group(() => {

  // project
  // Route.get('projects/staking-list', 'ProjectController.getStakingList');
  // Route.put('projects/:projectId/update', 'ProjectController.updateProject').validator('UpdateProject');
  // Route.put('projects/:projectId/update-contract-address', 'ProjectController.updateContractAddress').validator('UpdateContractAddress');

  // Route.get('projects/count-project/type-project', 'ProjectController.countProjectByType');

  // Route.put('mark-feature/:id/update', 'ProjectController.updateMarkFeature').validator('UpdateMarkFeature');


  Route.post('/create-admin', 'AdminController.create').validator('CreateAdmin');
  Route.get('admins', 'AdminController.adminList');
  Route.get('admins/:id', 'AdminController.adminDetail');

  Route.get('check-wallet-address', 'AuthAdminController.checkWalletAddress');
  Route.post('check-wallet-address', 'AuthAdminController.checkWalletAddress');

  // WhiteList Control
  Route.post('add-whitelist-users', 'WhiteListUserController.addWhitelistUsers').validator('AddWhitelistUsers');
  Route.get('whitelist-users/:projectID', 'WhiteListUserController.getWhiteList');
  Route.delete('whitelist-users/:projectID/delete/:walletAddress', 'WhiteListUserController.deleteWhiteList');
  Route.post('add-whitelist-users-csv', 'WhiteListUserController.uploadCsv');
  Route.get('export-csv', 'WhiteListUserController.exportCSV');

  //Subscribe
  Route.get('subscribes', 'SubscribeController.getSubscribes')

  //Get signature
  // Route.get('signature/:projectID', 'ProjectController.getSignatureAdmin');
  // Route.get('amount/:projectID', 'ProjectController.getAmountAdmin');


}).prefix(Const.USER_TYPE_PREFIX.ICO_OWNER).middleware(['typeAdmin', 'checkPrefix', 'checkAdminJwtSecret','auth:admin']);

// Public API:
Route.group(() => {
  // Route.get('projects/featured', 'ProjectController.getProjectFeatured');
  Route.post('add-subscribe', 'SubscribeController.addSubscribes').validator('AddSubscribe');

}).middleware(['maskEmailAndWallet']);

Route.group(() => {

  Route.post('/register', 'UserAuthController.register').validator('Register').middleware('checkSignature');
  Route.post('/register-email', 'UserAuthController.registerEmail').middleware('checkSignature');
  Route.get('confirm-email/:token', 'UserController.confirmEmail'); // Confirm email when register 
  Route.post('/login', 'UserAuthController.login').validator('Login').middleware('checkSignature'); // login and register when login user not exist
  Route.get('/user-profile', 'UserController.profile');
  // Route.get('projects/signature/:projectID', 'ProjectController.getSignature');
  // Route.post('join_project/:projectID', 'ProjectController.joinProject').middleware('checkJoinSignature');
  // Route.get('check-user/:projectID', 'ProjectController.checkUserIsWhitelist');

}).prefix(Const.USER_TYPE_PREFIX.PUBLIC_USER).middleware(['typeUser', 'checkPrefix', 'formatEmailAndWallet']);
