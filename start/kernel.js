'use strict'

/** @type {import('@adonisjs/framework/src/Server')} */
const Server = use('Server')

/*
|--------------------------------------------------------------------------
| Global Middleware
|--------------------------------------------------------------------------
|
| Global middleware are executed on each http request only when the routes
| match.
|
*/
const globalMiddleware = [
  'Adonis/Middleware/BodyParser',
  'Adonis/Middleware/Session',
  'Adonis/Middleware/Shield',
  'Adonis/Middleware/AuthInit',
  'App/Middleware/ConvertEmptyStringsToNull',
]

/*
|--------------------------------------------------------------------------
| Named Middleware
|--------------------------------------------------------------------------
|
| Named middleware is key/value object to conditionally add middleware on
| specific routes or group of routes.
|
| // define
| {
|   auth: 'Adonis/Middleware/Auth'
| }
|
| // use
| Route.get().middleware('auth')
|
*/
const namedMiddleware = {
  auth: 'Adonis/Middleware/Auth',
  guest: 'Adonis/Middleware/AllowGuestOnly',
  checkPrefix: 'App/Middleware/CheckPrefix',
  checkRole: 'App/Middleware/CheckRole',
  checkParamRole:"App/Middleware/CheckParamRole",
  checkAdminAbove:"App/Middleware/CheckAdminAbove",
  CheckSuperAdminAbove:"App/Middleware/CheckSuperAdminAbove",
  checkStatus: 'App/Middleware/CheckStatus',
  checkPublicStatus: 'App/Middleware/CheckPublicStatus',
  checkJwtSecret: 'App/Middleware/CheckJwtSecret',
  checkAdminJwtSecret: 'App/Middleware/CheckAdminJwtSecret',
  checkJwtWebhook: 'App/Middleware/CheckJwtWebhook',
  checkIcoOwner: 'App/Middleware/CheckIcoOwner',
  checkSignature: 'App/Middleware/CheckSignature',
  checkJoinSignature: 'App/Middleware/CheckJoinSignature',
  checkUserSignature: 'App/Middleware/CheckUserSignature',
  checkAdminSignature: 'App/Middleware/CheckAdminSignature',
  checkBlockPassSignature: 'App/Middleware/CheckBlockPassSignature',
  checkGovernanceAbove:'App/Middleware/checkGovernanceAbove',
  CheckProposalRole:'App/Middleware/CheckProposalRole',
  formatEmailAndWallet: 'App/Middleware/FormatEmailAndWallet',
  maskEmailAndWallet: 'App/Middleware/MaskEmailAndWallet',
  typeAdmin: 'App/Middleware/TypeAdmin',
  typeUser: 'App/Middleware/TypeUser',
}

/*
|--------------------------------------------------------------------------
| Server Middleware
|--------------------------------------------------------------------------
|
| Server level middleware are executed even when route for a given URL is
| not registered. Features like `static assets` and `cors` needs better
| control over request lifecycle.
|
*/
const serverMiddleware = [
  'Adonis/Middleware/Static',
  'Adonis/Middleware/Cors'
]

Server
  .registerGlobal(globalMiddleware)
  .registerNamed(namedMiddleware)
  .use(serverMiddleware)

/*
|--------------------------------------------------------------------------
| Run Scheduler
|--------------------------------------------------------------------------
|
| Run the scheduler on boot of the web sever.
|
// */
// const Scheduler = use('Adonis/Addons/Scheduler')
// Scheduler.run()