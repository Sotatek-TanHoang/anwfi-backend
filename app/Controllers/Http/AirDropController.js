"use strict";

const ProjectModel = use('App/Models/Project');
const Helpers = use("Helpers");
const Drive = use("Drive");
const HelperUtils = use("App/Common/HelperUtils");
const { BigNumber } = require("bignumber.js");
const Const = use("App/Common/Const");
const AirDropService = use("App/Services/AirDropService");
const Config = use('Config')
const hash = require('hash')

class AirDropController {

  /**
   * 
   * @param {*} page a number, is the page index you want display
   * @param {*} limit number of projects display in one page
   * @param {*} name token name, if name !== null => search token with this name
   * @param {*} status status=1,2,3,.. for filter
   * @returns response format with data
   */
  async getProjectAirDropList({ request, params }) {
    const type = params.type;
    const param = request.all();
    const limit = param.limit ? param.limit : Config.get("const.limit_default");
    const page = param.page ? param.page : Config.get("const.page_default");
    param.limit = limit;
    param.page = page;
    param.is_search = true;
    const grid = param.grid;
    console.log("Start Project Air Drop List with params: ", param);

    try {

      if(HelperUtils.hasSql(param.name) || HelperUtils.hasSql(param.registed)) return HelperUtils.responseErrorInternal('ERROR: Have Sql inject!');

      let check = true;
      if(param.status) {
        let statuses = param.status.split(',') || [];
        for(const status of statuses) {
          const format = Number(status);
          if(format === NaN) check = false;
        }
      }

      if(check === false) return HelperUtils.responseErrorInternal('ERROR: status list Wrong!');

      let listData;
      if (type) {
        listData = await (new AirDropService).buildQueryBuilderAdmin(param);

      } else {
        listData = await (new AirDropService).buildQueryBuilder(param);
      }
      let projects = JSON.parse(JSON.stringify(listData));

      // Get total amount for gridview in case fixAmount
      if (grid == 1) {
        let listProject = projects.data.filter(e => {return e.buy_type == 2 && e.distribution_method == 3}).map(e => e.id)
        if(listProject.length > 0) {
          let projectCount = await (new AirDropService).builderAmount(listProject)
  
          const hashProject = new hash();
          projectCount.forEach(e => {
            hashProject.set(e.project_id, e.total_paticipant)
          });
    
          projects.data.forEach(e => {
            if(hashProject.get(e.id)) {
              e.total_raise_amount = new BigNumber(hashProject.get(e.id)).multipliedBy(e.token_conversion_rate).multipliedBy(new BigNumber(10).pow(18)).toLocaleString('fullwide', {useGrouping:false});
            }
          })
        }
      }

      return HelperUtils.responseSuccess(projects);

    } catch (e) {

      console.log(e);
      return HelperUtils.responseErrorInternal(
        "Get Projects Air Drops Fail !!!"
      );
    }

  }

  async createProjectAirdrop({ request, auth }) {
    const inputParams = request.only([
      'is_display',
      'project_type',
      'distribution_method',
      'website',
      'twitter_link',
      'telegram_link',
      'medium_link',
      'whitepaper_link',
      'token_address',
      'token_symbol',
      'token_conversion_rate',
      'start_time',
      'finish_time',
      'announce_time',
      'distribute_time',
      'snapshot_time',
      'token_name',
      'token_icon',
    ]);


    const data = {
      'is_display': inputParams.is_display,
      'project_type': inputParams.project_type,
      'distribution_method': inputParams.distribution_method,
      'website': inputParams.website,
      'whitepaper_link': inputParams.whitepaper_link,
      'twitter_link': inputParams.twitter_link,
      'telegram_link': inputParams.telegram_link,
      'medium_link': inputParams.medium_link,
      'token_address': inputParams.token_address,
      'token_symbol': inputParams.token_symbol.toUpperCase(),
      'start_time': inputParams.start_time,
      'finish_time': inputParams.finish_time,
      'announce_time': inputParams.announce_time,
      'distribute_time': inputParams.distribute_time,
      'snapshot_time': inputParams.snapshot_time,
      'token_conversion_rate': inputParams.token_conversion_rate,
      'token_name': inputParams.token_name,
      'token_icon': inputParams.token_icon,
    };

    if (data.token_icon) {
      let file = data.token_icon.split('/');
      let fileName = file.pop()
      data.token_icon = fileName;
    }
    data.buy_type = Const.BUY_TYPE.AIRDROP

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

  async updateProjectAirdrop({ request, auth, params }) {
    const inputParams = request.only([
      'is_display',
      'project_type',
      'distribution_method',
      'website',
      'twitter_link',
      'telegram_link',
      'medium_link',
      'whitepaper_link',
      'token_address',
      'token_symbol',
      'start_time',
      'finish_time',
      'announce_time',
      'distribute_time',
      'snapshot_time',
      'token_name',
      'token_icon',
      'token_conversion_rate',
    ]);

    const data = {
      'is_display': inputParams.is_display,
      'project_type': inputParams.project_type,
      'distribution_method': inputParams.distribution_method,
      'website': inputParams.website,
      'whitepaper_link': inputParams.whitepaper_link,
      'twitter_link': inputParams.twitter_link,
      'telegram_link': inputParams.telegram_link,
      'medium_link': inputParams.medium_link,
      'token_address': inputParams.token_address,
      'token_symbol': inputParams.token_symbol.toUpperCase(),
      'start_time': inputParams.start_time,
      'finish_time': inputParams.finish_time,
      'announce_time': inputParams.announce_time,
      'distribute_time': inputParams.distribute_time,
      'snapshot_time': inputParams.snapshot_time,
      'token_conversion_rate': inputParams.token_conversion_rate,
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

    console.log('[updateProject] - Update Project Airdrop with data: ', data, params);
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

  async getProjectAirdropDetailAdmin({ request }) {
    const id = request.params.id;
    console.log('[getDetailProjectAirdrop] - Start getDetailProjectAirdrop with projectId: ', id);
    try {
      const airdropService = new AirDropService();
      let detailProject = await airdropService.getProjectAirdropDetail(id, 0);

      if (!detailProject) {
        return HelperUtils.responseNotFound('Airdrop project not found');
      }

      let noOfParticipants = await airdropService.countByProjectId(id, detailProject.project_type);
      if (!noOfParticipants) {
        noOfParticipants = 0;
      }

      detailProject.total_participant = noOfParticipants;
      if(detailProject.distribution_method == Const.DISTRIBUTION_METHOD.FIXED_AMOUNT) {
        detailProject.total_raise_amount = new BigNumber(detailProject.token_conversion_rate).multipliedBy(noOfParticipants).multipliedBy(new BigNumber(10).pow(18))
      }

      return HelperUtils.responseSuccess(detailProject);
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: Get Project Airdrop fail !',e);
    }
  }

  async getProjectAirdropDetail({ request }) {
    const id = request.params.id;
    console.log('[getDetailProjectAirdrop] - Start getDetailProjectAirdrop with projectId: ', id);
    try {
      const airdropService = new AirDropService();
      let detailProject = await airdropService.getProjectAirdropDetail(id, 1);
      if (!detailProject) {
        return HelperUtils.responseNotFound('Airdrop project not found');
      }

      let noOfParticipants = await airdropService.countByProjectId(id, detailProject.project_type);
      if (!noOfParticipants) {
        noOfParticipants = 0;
      }

      detailProject.total_participant = noOfParticipants;
      if(detailProject.distribution_method == Const.DISTRIBUTION_METHOD.FIXED_AMOUNT) {
        detailProject.total_raise_amount = new BigNumber(detailProject.token_conversion_rate).multipliedBy(noOfParticipants).multipliedBy(new BigNumber(10).pow(18))
      }
      return HelperUtils.responseSuccess(detailProject);
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: Get Project Airdrop fail !');
    }
  }

  /**
   * 
   * @returns statistical of airdrop projects
   */

  async statistical() {
    try {

      const airDropService = new AirDropService();
      const res = await airDropService.statistical();
      return HelperUtils.responseSuccess(res);
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: get campain status fail !');
    }
  } 
}

module.exports = AirDropController;
