'use strict'

const Task = use('Task')
const ProjectService = use('App/Services/ProjectService');
const caculateAllocationQueue = require('../Cron-Jobs/CaculateAllocationJob');
const Const = use("App/Common/Const");
class CaculateAllocation extends Task {
  static get schedule () {
    // return process.env.NODE_ENV == 'development' ? '*/2 * * * *' : '0 0 0 * * ?'
    return process.env.NODE_ENV == 'development' ? '*/2 * * * *' : '*/2 * * * *'
  }

  async handle () {
    console.log('Start Allocation Caculation for projects');

    const projectService = new ProjectService();
    const needToCaculateProjects = await projectService.findProjectEndToDay();

    const formatData = JSON.parse(JSON.stringify(needToCaculateProjects));

    if(!formatData || formatData.length === 0) {
      console.log('No end projects today');
      return;
    }

    console.log('----- Dispatch delay caculation job------------- ');

    for(const data of formatData) {
      const unixFinishStakeTime = +data.finish_time * 1000;
      const currentUnixtime = Date.now();
      const delay = unixFinishStakeTime - currentUnixtime + 1000;
      const jobId = `${process.env.VERSION}-${data.id}`;


      const jobOptions = {
        jobId: jobId,
        delay: delay,
        attempts: Number.MAX_SAFE_INTEGER,
        backoff: Const.BACK_OFF_JOB
      };

      caculateAllocationQueue.add(data.id, jobOptions);

    }

  }
}

module.exports = CaculateAllocation
