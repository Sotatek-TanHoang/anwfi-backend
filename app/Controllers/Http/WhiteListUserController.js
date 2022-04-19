'use strict'
const ProjectService = use('App/Services/ProjectService');
const Const = use('App/Common/Const');
const HelperUtils = use('App/Common/HelperUtils');
const WhitelistService = use('App/Services/WhitelistUserService');
const BadRequestException = use('App/Exceptions/BadRequestException');
const Helpers = use('Helpers');
const { Parser } = require('json2csv');
const moment = require('moment');
const { PROJECT_TYPE } = require('../../Common/Const');

const abi = require("../../abi/Allocation.json");
const Web3 = require("web3");

class WhiteListUserController {

  async getWhiteList({ request }) {
    // get request params
    const projectId = request.params.projectID;
    const page = request.input('page');
    const limit = request.input('limit') ? request.input('limit') : 10;
    const typeUser = request.input('type') ? request.input('type') : 0;
    console.log(`start getWhiteList with project_id ${projectId} and page ${page} and pageSize ${limit}`);
    try {
    
      const projectService = new ProjectService();
      const camp = await projectService.findByProjectId(projectId);
      if (!camp) {
        console.log(`project with id ${projectId}`)
        return HelperUtils.responseBadRequest(`Bad request with projectID ${projectId}`)
      }

      const filterParams = {
        'projectId': projectId,
        'page': page,
        'limit': limit,
        'typeUser': typeUser,
        'projectType': camp.project_type,
        'isExportCsv': false
      };
      const whitelistService = new WhitelistService();
      // get winner list
      let participants;
      if (camp.buy_type === Const.BUY_TYPE.STAKE) {
        participants = await whitelistService.findParticipantsForStaking(filterParams);
      } else {
        participants = await whitelistService.findParticipantsForAirdrop(filterParams);
      }
      
      return HelperUtils.responseSuccess(participants);
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal(e.toString());
    }
  }

  async addWhitelistUsers ({request}) {
    
    const inputs = request.only(['wallet_address', 'project_id']);

    try {

      const projectService = new ProjectService();
      const camp = await projectService.findByProjectId(inputs.project_id);
      if (!camp) {
        console.log(`Project with id ${inputs.project_id}`)
        return HelperUtils.responseBadRequest(`Bad request with projectId ${inputs.project_id}`)
      }

      if (!isAllowAddWhiteList(camp)) {
        return HelperUtils.responseBadRequest(`It's not right time to add whitelist user.`)
      }
      
      const whitelistService = new WhitelistService();
      const params = {
        wallet_address: inputs.wallet_address,
        project_id: inputs.project_id,
      };
      const user = await whitelistService.buildQueryBuilder({
        wallet_address: inputs.wallet_address,
        project_id: inputs.project_id,
      }).first();
      console.log('[addWhitelistUser] - user: ', user);

      if (user) {
        return HelperUtils.responseBadRequest("This whitelist participant is already added");
      }

      const res = await whitelistService.addWhitelistUser(params);
      return HelperUtils.responseSuccess(res);

    }catch (e) {
      console.log("error", e)
      if (e instanceof BadRequestException) {
        return HelperUtils.responseBadRequest(e.message);
      } else {
        return HelperUtils.responseErrorInternal('ERROR : Add Whitelist fail !' + e.message);
      }
    }
  }

  async deleteWhiteList({ request, params }) {
    try {
      console.log('[deleteWhiteList] - Delete WhiteList with params: ', params, request.params);

      const { projectID, walletAddress } = params;

      const projectService = new ProjectService();
      const camp = await projectService.findByProjectId(projectID);
      if (!camp) {
        console.log(`Project with id ${projectID}`)
        return HelperUtils.responseBadRequest(`Bad request with projectId ${projectID}`)
      }

      if (!isAllowAddWhiteList(camp)) {
        return HelperUtils.responseBadRequest(`It's not right time to delete whitelist user.`)
      }

      const web3 = new Web3(process.env.URL_PROVIDER);
      const contract = new web3.eth.Contract(
        abi,
        camp.project_contract_address
      );

      try {
        let stakedAmount = await contract.methods.userAmounts(walletAddress).call();
        if (stakedAmount && stakedAmount > 0) {
          return HelperUtils.responseBadRequest(`Cannot delete the user who staked.`)
        }
      } catch (e) {
        console.log("error", e)
      }

      const whitelistService = new WhitelistService();
      const existRecord = await whitelistService.buildQueryBuilder({
        project_id: projectID,
        wallet_address: walletAddress,
      }).first();
      if (!existRecord) {
        console.log(`Whitelist user with Wallet Address = ${walletAddress} "&&" ProjectID = ${projectID}`)
        return HelperUtils.responseBadRequest(`Bad request with projectId ${inputs.project_id}`)
      }
      await existRecord.delete();
      console.log('existRecord', existRecord);
      return HelperUtils.responseSuccess(existRecord);
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: Delete white list fail !');
    }
  }

  async uploadCsv({request}) {
    try {
      const project_id = request.only(['project_id']).project_id;
      const projectService = new ProjectService();
      const camp = await projectService.findByProjectId(project_id);
      if (!camp) {
        console.log(`Project with id ${project_id}`)
        return HelperUtils.responseBadRequest(`Bad request with projectID ${project_id}`);
      }

      if (!isAllowAddWhiteList(camp)) {
        return HelperUtils.responseBadRequest(`It's not right time to import whitelist user.`)
      }

      const validationOptions = {
        extnames: ['csv']
      };

      const csvFile = request.file('csv', validationOptions);
      console.log(csvFile);
      const timeStamp = Date.now();
      const fileName = timeStamp + '_' + (await HelperUtils.randomString(15)) + '.' + (csvFile.extname || 'txt');

      console.log('[uploadFile] - fileName: ', fileName, csvFile.extname);
      await csvFile.move(Helpers.tmpPath('uploads/csv'), {
        name: fileName,
        overwrite: true
      });
      if (!csvFile.moved()) {
        return csvFile.error()
      }
      const path = Helpers.tmpPath('/uploads/csv/' + fileName);
      const whitelistService = new WhitelistService();
      const res = await whitelistService.addWhitelistUserCsv(path, project_id);
      console.log(res)
      if (res.length === 0) {
        return HelperUtils.responseBadRequest('CSV file empty or users already in project!');
      }
      return HelperUtils.responseSuccess( res );
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: Add Whitelist user by CSV file fail !');
    }
  }

  async exportCSV({request}) {
    try{
      const projectId = request.only(['projectId']).projectId;
      const projectService = new ProjectService();
      const camp = await projectService.findByProjectId(projectId);
      if (!camp) {
        console.log(`project with id ${projectId}`)
        return HelperUtils.responseBadRequest(`Bad request with projectID ${projectId}`)
      }

      const filterParams = {
        'projectId': projectId,
        'projectType': camp.project_type,
        'isExportCsv': true
      };
      const whitelistService = new WhitelistService();

      let participants;
      if (camp.buy_type === Const.BUY_TYPE.STAKE) {
        participants = await whitelistService.findParticipantsForStaking(filterParams);
      } else {
        participants = await whitelistService.findParticipantsForAirdrop(filterParams);
      }

      let data = JSON.parse(JSON.stringify(participants));
      if(!data || data.length === 0 ) return HelperUtils.responseBadRequest(`No data for export`);

      const fields = ['wallet_address', 'project_id', 'type_user', 'amount', 'allocation', 'created_at'];
      const opts = {fields};

      const parser = new Parser(opts);

      const csv = parser.parse(data, opts);

      if(!csv || csv.length === 0) return HelperUtils.responseBadRequest(`CSV file  empty while Parser !`);

      return HelperUtils.responseSuccess(csv);

    } catch(e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: Export Whitelist user CSV file fail !' + e.toString()); 
    }
  }
}

const isAllowAddWhiteList = (project) => {
  let buyType = project.buy_type;
  let projectType = project.project_type;
  let distributionMethod = project.distribution_method;

  let isAllow = true;
  if ((Const.BUY_TYPE.AIRDROP ===  buyType && projectType === Const.PROJECT_TYPE.PUBLIC)
    || (Const.BUY_TYPE.STAKE ===  buyType && projectType === Const.PROJECT_TYPE.PUBLIC)) {
      isAllow = false;
  } else {
    let compareTime;
    if (Const.BUY_TYPE.STAKE ===  buyType) {
      compareTime = parseInt(project.start_time);
    } else if (Const.BUY_TYPE.AIRDROP ===  buyType) {
      if (Const.DISTRIBUTION_METHOD.FIXED_AMOUNT === distributionMethod) {
        compareTime = parseInt(project.distribute_time);
      } else {
        compareTime = parseInt(project.snapshot_time);
      }
    }

    const dateTime = Date.now();
    const currentTime = Math.floor(dateTime / 1000);
    if (compareTime && currentTime > compareTime) {
      isAllow = false;
    }
  }
  return isAllow;
}

module.exports = WhiteListUserController
