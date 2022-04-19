'use strict'

const ProjectModel = use('App/Models/Project');
const WhitelistModel = use('App/Models/WhitelistUser');
const AirDropModel = use('App/Models/AirDrops');
const StakeModel = use('App/Models/StakingPool');
const Const = use('App/Common/Const');
const ProjectService = use('App/Services/ProjectService');
const WhitelistService = use('App/Services/WhitelistUserService');
const StakingService = use('App/Services/StakingService');
const AirdropService = use('App/Services/AirDropService');
const HelperUtils = use('App/Common/HelperUtils');
const GetSignature = use('App/Common/GenSignature');

const Redis = use('Redis');

const Config = use('Config')
const moment = require('moment');
const { BigNumber } = require('bignumber.js');
const { pick } = require('lodash');

const Web3 = require('web3');
const Provider = require('@truffle/hdwallet-provider');

const provider = new Provider(process.env.ADDRESS_PROVIDER, process.env.URL_PROVIDER);
const web3 = new Web3(provider)

const { Contract, ethers, Wallet } = require('ethers');


class ProjectController {

  async getStakingList({ request, params }) {
    const type = params.type;
    const param = request.all();
    const limit = param.limit ? param.limit : Config.get('const.limit_default');
    const page = param.page ? param.page : Config.get('const.page_default');
    param.limit = limit;
    param.page = page;
    param.is_search = true;
    console.log('Start Project List with params: ', param);

    try {
      if (HelperUtils.hasSql(param.name) || HelperUtils.hasSql(param.registed)) return HelperUtils.responseErrorInternal('ERROR: Have Sql inject!');

      let check = true;
      if (param.status) {
        let statuses = param.status.split(',') || [];
        for (const status of statuses) {
          const format = Number(status);
          if (format === NaN) check = false;
        }
      }

      if (check === false) return HelperUtils.responseErrorInternal('ERROR: status list Wrong!');

      let listData;
      if (type) {
        listData = await (new ProjectService).buildQueryBuilderAdmin(param);

      } else {
        listData = await (new ProjectService).buildQueryBuilderUser(param);
      }
      let projects = JSON.parse(JSON.stringify(listData));

      return HelperUtils.responseSuccess(projects);

    } catch (e) {
      console.log(e)
      return HelperUtils.responseErrorInternal('Get Projects Fail !!!');
    }
  }

  async getProjectFeatured() {
    try {

      const project = await ProjectModel.query().where('is_priority', Const.FEATURE).first();
      const projectService = new ProjectService();

      if(project) {
        projectService.checkStatus(project)
        const StakeService = new StakingService()
        project.total_stake = await StakeService.countStake(project.id, project.buy_type);
        return HelperUtils.responseSuccess([project]);
      }

      return HelperUtils.responseSuccess([]);
    } catch (error) {
      return HelperUtils.responseErrorInternal('Get Projects Fail !!!');
    }
  }

  async createProjectStake({ request, auth }) {

    const inputParams = request.only([
      'is_display',
      'project_type',
      'project_name',
      'website',
      'project_information',
      'twitter_link',
      'telegram_link',
      'medium_link',
      'whitepaper_link',
      'token_address',
      'token_symbol',
      'whitelist_hardcap',
      'other_hardcap',
      'whitelist_trigger',
      'other_trigger',
      'whitelist_untrigger',
      'other_untrigger',
      'receive_address',
      'start_time',
      'finish_time',
      'announce_time',
      'distribute_time',
      'min_stake',
      'max_stake',
      'token_name',
      'token_icon',
    ]);


    const data = {
      'is_display': inputParams.is_display,
      'project_type': inputParams.project_type,
      'project_name': inputParams.project_name,
      'website': inputParams.website,
      'project_information': inputParams.project_information,
      'whitepaper_link': inputParams.whitepaper_link,
      'twitter_link': inputParams.twitter_link,
      'telegram_link': inputParams.telegram_link,
      'medium_link': inputParams.medium_link,
      'token_address': inputParams.token_address,
      'token_symbol': inputParams.token_symbol.toUpperCase(),
      'receive_address': inputParams.receive_address,
      'start_time': inputParams.start_time,
      'finish_time': inputParams.finish_time,
      'announce_time': inputParams.announce_time,
      'distribute_time': inputParams.distribute_time,
      'min_stake': inputParams.min_stake,
      'max_stake': inputParams.max_stake,
      'token_name': inputParams.token_name,
      'token_icon': inputParams.token_icon,
    };

    if (data.token_icon) {
      let file = data.token_icon.split('/');
      let fileName = file.pop()
      data.token_icon = fileName;
    }
    data.buy_type = Const.BUY_TYPE.STAKE

    mapFieldDataByProjectType(data, data.project_type, inputParams)

    console.log('Create Project with data: ', data);

    try {

      // Create Project
      const project = new ProjectModel();
      project.fill(data);
      await project.save();

      return HelperUtils.responseSuccess(project);
    } catch (e) {
      console.log('[ProjectController::createProject] - ERROR: ', e);
      return HelperUtils.responseErrorInternal();
    }
  }

  
  async updateProject({ request, auth, params }) {
    const inputParams = request.only([
      'is_display',
      'project_type',
      'project_name',
      'website',
      'project_information',
      'twitter_link',
      'telegram_link',
      'medium_link',
      'whitepaper_link',
      'token_address',
      'token_symbol',
      'whitelist_hardcap',
      'other_hardcap',
      'whitelist_trigger',
      'other_trigger',
      'whitelist_untrigger',
      'other_untrigger',
      'total_raise_amount',
      'receive_address',
      'start_time',
      'finish_time',
      'announce_time',
      'distribute_time',
      'min_stake',
      'max_stake',
      'token_name',
      'token_icon',
      'token_conversion_rate',
    ]);

    const data = {
      'is_display': inputParams.is_display,
      'project_type': inputParams.project_type,
      'project_name': inputParams.project_name,
      'website': inputParams.website,
      'project_information': inputParams.project_information,
      'whitepaper_link': inputParams.whitepaper_link,
      'twitter_link': inputParams.twitter_link,
      'telegram_link': inputParams.telegram_link,
      'medium_link': inputParams.medium_link,
      'token_address': inputParams.token_address,
      'token_symbol': inputParams.token_symbol.toUpperCase(),
      'total_raise_amount': inputParams.total_raise_amount,
      'receive_address': inputParams.receive_address,
      'start_time': inputParams.start_time,
      'finish_time': inputParams.finish_time,
      'announce_time': inputParams.announce_time,
      'distribute_time': inputParams.distribute_time,
      'token_conversion_rate': inputParams.token_conversion_rate,
      'min_stake': inputParams.min_stake,
      'max_stake': inputParams.max_stake,
      'token_name': inputParams.token_name,
      'token_icon': inputParams.token_icon,
    };

    if (data.token_icon) {
      let file = data.token_icon.split('/');
      let fileName = file.pop()
      data.token_icon = fileName;
    }

    if (data.is_display == 1) {
      data.is_update_show_launchpad = 1
    }

    mapFieldDataByProjectType(data, data.project_type, inputParams)

    console.log('[updateProject] - Update Project with data: ', data, params);
    const projectId = params.projectId;
    try {
      const project = await ProjectModel.query().where('id', projectId).first();
      if (!project) {
        return HelperUtils.responseNotFound('Project not found');
      }
      await ProjectModel.query().where('id', projectId).update(data);

      return HelperUtils.responseSuccess(project);
    } catch (e) {
      console.log('[ProjectController::updateProject] - ERROR: ', e);
      return HelperUtils.responseErrorInternal();
    }
  }


  

  async updateContractAddress({ request, auth, params }) {
    const inputParams = request.only([
      'project_contract_address'
    ]);

    const data = {
      'project_contract_address': inputParams.project_contract_address,
      'is_deploy': 1

    };

    console.log('[update Project contract address] - Update with data: ', data, params);
    const projectId = params.projectId;
    try {
      const project = await ProjectModel.query().where('id', projectId).first();
      if (!project) {
        return HelperUtils.responseNotFound('Project not found');
      }
      await ProjectModel.query().where('id', projectId).update(data);

      return HelperUtils.responseSuccess(project);
    } catch (e) {
      console.log('[ProjectController::updateAddressContract] - ERROR: ', e);
      return HelperUtils.responseErrorInternal();
    }
  }

  async getProjectDetail({ request, auth, params }) {
    let param = request.all();
    const { id, type } = params;
    let wallet_add;
    let formatGwei = new BigNumber(10).pow(-18);
    if (auth.user) {
      wallet_add = auth.user.wallet_address;
    }
    console.log('[getDetailProject] - Start getDetailProject with projectId: ', id);
    try {

      let project;
      if (type) {
        project = await ProjectModel.query().where({ id: id, buy_type: Const.BUY_TYPE.STAKE }).first();
      } else {
        project = await ProjectModel.query().where({ id: id, buy_type: Const.BUY_TYPE.STAKE, is_display: 1 }).first();
      }
      if (!project) {
        return HelperUtils.responseNotFound('Project not found');
      }
      project = JSON.parse(JSON.stringify(project));

      let detailProject = pick(project, [
        // Project Info
        'id', 'title', 'updated_at', 'created_at',
        'project_information',

        // Types
        'distribution_method', 'project_type', 'buy_type',

        // Stake

        'whitelist_hardcap', 'other_hardcap', 'whitelist_trigger', 'other_trigger',
        'whitelist_untrigger', 'other_untrigger',

        // Time
        'start_time', 'finish_time', 'announce_time', 'distribute_time', 'snapshot_time',

        // Token Info
        'project_name', 'token_symbol', 'decimals', 'token_address', 'token_name', 'total_raise_amount',
        'display_price_rate', 'airdrop_fix_amount', 'token_icon',

        'project_contract_address',
        'min_stake', 'max_stake', 'twitter_link',
        'telegram_link', 'medium_link', 'whitepaper_link', 'website','transaction_hash',

        'status_deploy', 'is_display', 'is_update_show_launchpad','is_priority'

      ]);

      const projectService = new ProjectService();
      projectService.checkStatus(detailProject);

      if (detailProject.buy_type == Const.BUY_TYPE.STAKE) {
        const StakeService = new StakingService()
        let userWhiteList = await StakeService.getWhitelistUse(project.id);

        if (detailProject.project_type == Const.PROJECT_TYPE.HYRBID) {
          detailProject.whitelist_stake = await StakeService.countWlStake(project.id, wallet_add, userWhiteList);
          detailProject.other_stake = await StakeService.countOtherStake(project.id, wallet_add, userWhiteList);
        }

        if (detailProject.project_type == Const.PROJECT_TYPE.PRIVATE) {
          detailProject.total_stake = await StakeService.countWlStake(project.id, wallet_add, userWhiteList);
        }

        if (detailProject.project_type == Const.PROJECT_TYPE.PUBLIC) {
          detailProject.total_stake = await StakeService.countOtherStake(project.id, wallet_add, userWhiteList);

        }

      } else {
        detailProject.total_participant = 0;
      }

      if (detailProject.project_type == Const.PROJECT_TYPE.PRIVATE) {
        detailProject.whitelist_hardcap = calculateByGwei(+detailProject.whitelist_hardcap, formatGwei);
        detailProject.whitelist_untrigger = calculateByGwei(+detailProject.whitelist_untrigger, formatGwei);
      }
      if (detailProject.project_type == Const.PROJECT_TYPE.PUBLIC) {
        detailProject.other_hardcap = calculateByGwei(+detailProject.other_hardcap, formatGwei);
        detailProject.other_untrigger = calculateByGwei(+detailProject.other_untrigger, formatGwei);
      }
      if (detailProject.project_type == Const.PROJECT_TYPE.HYRBID) {
        detailProject.whitelist_hardcap = calculateByGwei(+detailProject.whitelist_hardcap, formatGwei);
        detailProject.whitelist_untrigger = calculateByGwei(+detailProject.whitelist_untrigger, formatGwei);

        detailProject.other_hardcap = calculateByGwei(+detailProject.other_hardcap, formatGwei);
        detailProject.other_untrigger = calculateByGwei(+detailProject.other_untrigger, formatGwei);
      }

      return HelperUtils.responseSuccess(detailProject);
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: Get public Project fail !');
    }
  }

  async countProjectByType({ request }) {
    try {
      let countProject = await ProjectModel.query()
        .select('project_type')
        .groupBy('project_type')
        .count('project_type as count')

      return HelperUtils.responseSuccess(countProject);
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: Get data fail !');
    }
  }

  async statistical() {
    try {

      const projectService = new ProjectService();
      const res = await projectService.statistical();
      return HelperUtils.responseSuccess(res);
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: get campain status fail !');
    }
  }

  async getSignature({ request, auth, params }) {
    const project_id = params.projectID;
    const wallet_address = auth.user.wallet_address;

    try {
      const projectService = new ProjectService();
      // Check Project key exists or not
      const camp = await projectService.findByProjectId(project_id);

      // Get project keys
      const project_keys = await projectService.findProjectKeyByProjectID(project_id);
      if (!camp || project_keys.rows == 0) {
        console.log(`Campaign with id ${project_id}`)
        return HelperUtils.responseBadRequest(`Bad request with campaignId ${project_id}`)
      };

      const amount = await projectService.getAmount(camp, wallet_address)
      if (!amount) {
        return HelperUtils.responseBadRequest(`User not stake with project ${project_id}`)
      }

      const sig = GetSignature.GenSignature(project_keys.key, Number(amount.allocation).toLocaleString('fullwide', {useGrouping:false}), wallet_address);
      let result = {
        wallet_address,
        amount: Number(amount.allocation).toLocaleString('fullwide', {useGrouping:false}),
        signature: sig

      }
      return HelperUtils.responseSuccess(result);
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('Get Project Keys Failed !');
    }
  }

  async getSignatureAdmin({ request, params}) {
    const project_id = params.projectID;
    let param = request.all();
    let {wallet_address, amount} = param;
    try {

      const projectService = new ProjectService();
      // Check Project key exists or not
      const projects = await projectService.findByProjectId(project_id);

      // Get project keys
      const project_keys = await projectService.findProjectKeyByProjectID(project_id);
      if (!projects || project_keys.rows == 0) {
        console.log(`Campaign with id ${project_id}`)
        return HelperUtils.responseBadRequest(`Bad request with campaignId ${project_id}`)
      };

      const sig = GetSignature.GenSignature(project_keys.key, amount, wallet_address);
      let result = {
        wallet_address,
        amount,
        signature: sig
      }

      return HelperUtils.responseSuccess(result);
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('Get Project Keys Failed !');
    }
  }

  async getAmountAdmin({ auth, params}) {
    const project_id = params.projectID;

    try {
      const projectService = new ProjectService();
      // Check Project key exists or not
      const projects = await projectService.findByProjectId(project_id);

      let amount = await projectService.getAmountContract(projects);
      amount = Number(amount).toLocaleString('fullwide', {useGrouping:false});
      if (amount <= 0) {
        amount = 0;
      }

      return HelperUtils.responseSuccess({amount});
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('Get Project Keys Failed !');
    }
  }

  async joinProject({ request, auth, params }) {
    const project_id = params.projectID;
    const wallet_address = request.all().wallet_address;
    try {

      const result = await AirDropModel.query().where({
        wallet_address,
        project_id
      }).first()

      if(result) {
        return HelperUtils.responseBadRequest(`User has join project`)
      }

      const airDrop = await AirDropModel.create({project_id, wallet_address});

      return HelperUtils.responseSuccess(airDrop);

    } catch (error) {
      return HelperUtils.responseErrorInternal(error);

    }
  }

  async joinStaking({ request, auth, params }) {
    const project_id = params.projectID;
    const wallet_address = request.all().wallet_address;
    try {

      const StakeService = new StakingService()
      const checkWallet = await StakeService.checkWalletJoinStake(project_id, wallet_address);
      if (checkWallet.join_status === 1){
        return HelperUtils.responseBadRequest('Wallet have already !');
      }
      const joinStake = await StakeModel.create({project_id, wallet_address});

      return HelperUtils.responseSuccess(joinStake);
      
    } catch (error) {
      return HelperUtils.responseErrorInternal(error);
      
    }
  }

  async checkStaking({ request, auth, params }) {
    const project_id = params.projectID;
    if(!auth.user) {
      return HelperUtils.responseBadRequest('User not connect system');
    }
    const wallet_address = request.all().wallet_address;
    try {
      const StakeService = new StakingService()
      const checkWallet = await StakeService.checkWalletJoinStake(project_id, wallet_address);
      return HelperUtils.responseSuccess(checkWallet);
    } catch (error) {
      return HelperUtils.responseErrorInternal(error);
      
    }
  }

  async checkAirdrop({ request, auth, params }) {
    const project_id = params.projectID;
    if(!auth.user) {
      return HelperUtils.responseBadRequest('User not connect system');
    }
    const wallet_address = auth.user.wallet_address;
    try {
      const AirdropSr = new AirdropService()
      const checkWallet = await AirdropSr.checkWalletJoinAirdrop(project_id, wallet_address);
      return HelperUtils.responseSuccess(checkWallet);
    } catch (error) {
      return HelperUtils.responseErrorInternal(error);
      
    }
  }

  async updateClaimStatusStaking({ request, auth, params }) {
    const project_id = params.projectID;
    const wallet_address = auth.user.wallet_address;
    try {
      const StakeService = new StakingService()
      const staking = await StakeService.updateStatusWalletJoinStake(project_id, wallet_address);
      if (!staking){
        return HelperUtils.responseBadRequest("Staking not found or status has been updated !")
      }
      return HelperUtils.responseSuccess({claim_status: 1});
    } catch (error) {
      return HelperUtils.responseErrorInternal(error);
      
    }
  }

  async updateClaimStatusAirdrop({ request, auth, params }) {
    const project_id = params.projectID;
    const wallet_address = auth.user.wallet_address;
    try {
      const airdropService = new AirdropService()
      const staking = await airdropService.updateStatusWalletJoinAirdrop(project_id, wallet_address);
      if (!staking){
        return HelperUtils.responseBadRequest("Airdrop not found or status has been updated !")
      }
      return HelperUtils.responseSuccess({claim_status: 1});
    } catch (error) {
      return HelperUtils.responseErrorInternal(error);
      
    }
  }

  async deployStaking({ request, auth, params }) {
    try {
      const projectId = +params.projectId
      const gWei = new BigNumber(10).pow(18)
      let {
        token_address,
        start_time,
        finish_time,
        type_project,
        min_stake,
        max_stake
      } = request.body

      if (type_project === Const.PROJECT_TYPE.PRIVATE) {
        start_time = moment().subtract(2, 'days').unix()
        finish_time = moment().subtract(1, 'days').unix()
      }
      const abi = require('../../abi/AllocationFactory.json');
      const address = process.env.ADDRESS_ALLOCATION_FACTORY;
      const contract = new web3.eth.Contract(abi, address);

      const genSinger = await web3.eth.accounts.create()

      // Create privateKey
      const projectService = new ProjectService();
      await projectService.createRandomProjectKey(projectId, genSinger.privateKey)

      const data = {
        stakeToken: process.env.ADDRESS_TOKEN,
        saleToken: token_address,
        start: start_time,
        end: finish_time,
        lock: 1,
        singer: genSinger.address,
      };
      if(min_stake && max_stake){
        data.min_stake = calculateByGwei(min_stake,gWei)
        data.max_stake = calculateByGwei(max_stake,gWei)
      }else{
        data.min_stake = 0;
        data.max_stake = 0;
      }

      const provider = new ethers.providers.JsonRpcProvider(process.env.URL_PROVIDER);
      const adminAcc = new Wallet(process.env.ADDRESS_PROVIDER).connect(
        provider,
      );
      const AlloFactory = new Contract(process.env.ADDRESS_ALLOCATION_FACTORY, abi, provider);

      console.log('--- Data Deploy ---', data, start_time, finish_time);

      let result = await AlloFactory.connect(adminAcc).createAllocation(
        data.stakeToken,
        data.saleToken,
        data.start,
        data.end,
        data.min_stake,
        data.max_stake,
        data.lock,
        data.singer
      );

      console.log('---- Result Deploy ---------', result);

      updateStatusDeploy(projectId, Const.STATUS_DEPLOY.DEPLOYING, result.hash);

    } catch (error) {
      console.log('error', error);
      updateStatusDeploy(+params.projectId, Const.STATUS_DEPLOY.DEPLOY_FAILED)
    }

  }



  async getStakeUsersByProjectId({ request }) {
    const param = request.only(['limit', 'page', 'projectId', 'type']);
    const limit = param.limit ? param.limit : Const.STAKE_USERS.LIMIT;
    console.log(param)
    const page = param.page ? param.page : Const.STAKE_USERS.PAGE;

    const projectId = param.projectId;
    const type = param.type;

    try {
      const projectService = new ProjectService();

      const project = await projectService.findByProjectId(projectId);


      if (!project) {
        return HelperUtils.responseBadRequest(`ProjectId ${projectId} not found`);
      }


      let stakeUsers;

      if (project.$attributes.project_type === Const.PROJECT_TYPE.PRIVATE) {
        stakeUsers = await projectService.findWhiteListUsersByProjectId(projectId, page, limit);
        for (const stakeUser of stakeUsers) {
          stakeUser['type'] = 'whitelist'
        }
      }

      else if (project.$attributes.project_type === Const.PROJECT_TYPE.PUBLIC) {
        stakeUsers = await projectService.findOtherStakeUserById(projectId, page, limit);
        for (const stakeUser of stakeUsers) {
          stakeUser['type'] = 'other'
        }
      }

      else if (project.$attributes.project_type === Const.PROJECT_TYPE.HYRBID) {


        if (type == Const.PROJECT_TYPE.PRIVATE) {
          stakeUsers = await projectService.findWhiteListUsersByProjectId(projectId, page, limit);
          for (const stakeUser of stakeUsers) {
            stakeUser['type'] = 'whitelist'
          }
        }
        else if (type == Const.PROJECT_TYPE.PUBLIC) {
          stakeUsers = await projectService.findOtherStakeUserById(projectId, page, limit);
          for (const stakeUser of stakeUsers) {
            stakeUser['type'] = 'other'
          }
        }
        else {

          const res = await projectService.findAllStakeUsers(projectId, page, limit);

          stakeUsers = {
            data: res.data,
            total: res.total
          }
          stakeUsers['perPage'] = limit;
          stakeUsers['page'] = page;
          stakeUsers['lastPage'] = Math.ceil(stakeUsers.total / stakeUsers.perPage);
        }

      }


      if (stakeUsers) return HelperUtils.responseSuccess(stakeUsers);

    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('Process Get Stake User Failed');
    }
  }

  async checkUserIsWhitelist({ params, auth }) {
    try {
      const projectId = params.projectID
      const wallet_address = auth.user.wallet_address

      const result = await WhitelistModel.query().where({
        wallet_address,
        project_id: projectId
      }).first()

      if (!result) {
        return HelperUtils.responseBadRequest(`User has join project`)
      }
      return HelperUtils.responseSuccess(result);
    } catch (error) {
      return HelperUtils.responseErrorInternal(error);
    }
  }


  async updateMarkFeature({ request, auth, params }) {
    const inputParams = request.only([
      'id',
      'buy_type'
    ])
    const data = {
      is_priority: 1,
    }
    const projectId = params.id
    const buyType = inputParams.buy_type
    console.log('[Update feature as mark with id] : ', projectId , buyType);
    try {
      await ProjectModel.query().where({ is_priority: 1}).update({ is_priority: 0 });
      const project = await ProjectModel.query().where('id', projectId).first();
      if (!project) {
        return HelperUtils.responseNotFound('Project not found');
      }
      await ProjectModel.query().where({ id: projectId}).update(data);
      return HelperUtils.responseSuccess(project);
    } catch (error) {
      console.log('[ProjectController::update mark as featured] - ERROR: ', error);
      return HelperUtils.responseErrorInternal();
    }
  }
}

/**
 * function update status in project
 * @param {*} projectId 
 * @param {*} status 
 * @returns 
 */
let updateStatusDeploy = async function (projectId, status, hash) {
  try {
    const project = await ProjectModel.query().where('id', projectId).first();
    if (!project) {
      return HelperUtils.responseNotFound('Project not found');
    }
    await ProjectModel.query().where('id', projectId).update({ 'status_deploy': status, 'transaction_hash': hash });
    return HelperUtils.responseSuccess(project);
  } catch (error) {
    console.log('[ProjectController::updateStatusDeploy] - ERROR: ', error);
    return HelperUtils.responseErrorInternal();
  }
}

/**
 * type project : public => save to other, private => save to whitelist, hybrid => both 
 * @param {*} data 
 * @param {*} projectType 
 * @param {*} inputParams 
 */
let mapFieldDataByProjectType = function (data, projectType, inputParams) {

  let gWei = new BigNumber(10).pow(18)
  if (projectType == Const.PROJECT_TYPE.PUBLIC) {
    data.other_hardcap = calculateByGwei(+inputParams.other_hardcap, gWei);
    data.other_trigger = inputParams.other_trigger;
    data.other_untrigger = calculateByGwei(+inputParams.other_untrigger, gWei);

    data.whitelist_hardcap = null;
    data.whitelist_trigger = null;
    data.whitelist_untrigger = null;
  }

  if (projectType == Const.PROJECT_TYPE.PRIVATE) {
    data.whitelist_hardcap = calculateByGwei(+inputParams.whitelist_hardcap, gWei);
    data.whitelist_trigger = inputParams.whitelist_trigger;
    data.whitelist_untrigger = calculateByGwei(+inputParams.whitelist_untrigger, gWei);

    data.other_hardcap = null;
    data.other_trigger = null;
    data.other_untrigger = null;
  }
  if (projectType == Const.PROJECT_TYPE.HYRBID) {
    data.other_hardcap = calculateByGwei(+inputParams.other_hardcap, gWei);
    data.other_trigger = inputParams.other_trigger;
    data.other_untrigger = calculateByGwei(+inputParams.other_untrigger, gWei);
    data.whitelist_hardcap = calculateByGwei(+inputParams.whitelist_hardcap, gWei);
    data.whitelist_trigger = inputParams.whitelist_trigger;
    data.whitelist_untrigger = calculateByGwei(+inputParams.whitelist_untrigger, gWei);
  }
}


let calculateByGwei = function (field, gWei) {
  let convertNumber = new BigNumber(field).multipliedBy(gWei).toString()
  return HelperUtils.toFixedNumber(convertNumber);
}
module.exports = ProjectController
