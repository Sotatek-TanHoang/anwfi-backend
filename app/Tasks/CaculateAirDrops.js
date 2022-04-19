'use strict'

const Task = use('Task')
const ProjectService = use('App/Services/ProjectService');
const caculateAirDropsQueue = require('../Cron-Jobs/CaculateAirDropsJob');
const Const = use("App/Common/Const");
class CaculateAirDrops extends Task {
  static get schedule () {
    // return process.env.NODE_ENV == 'development' ? '*/2 * * * *' : '0 */10 * ? * *'
    return process.env.NODE_ENV == 'development' ? '*/2 * * * *' : '*/2 * * * *'
  }

  async handle () {
    console.log('Start Air Drops Caculation for projects');

    const projectService = new ProjectService();
    const needToCaculateProjects = await projectService.findAirDropEndToDay() || [];

    const formatData = JSON.parse(JSON.stringify(needToCaculateProjects));

    console.log('----- Dispatch delay caculation job------------- ');

    for(const data of formatData) {
      
      const jobId = `AIRDROP*-${data.id}`;
      const unixSnapShotTime = +data.snapshot_time * 1000;
      const currentUnixtime = Date.now();
      const delay = unixSnapShotTime - currentUnixtime + 1000;


      const jobOptions = {
        jobId: jobId,
        delay: delay,
        attempts: Number.MAX_SAFE_INTEGER,
      };

      console.log(jobOptions)

      caculateAirDropsQueue.add(data.id, jobOptions);

    }

  }
}

module.exports = CaculateAirDrops;
