const Queue = require('bull');
// 1. Initiating the Queue
const proposalProcessQueue = new Queue('proposalProcess', {
  redis: {
    host: 'localhost',
    port: 6379,
    password: 'root'
  }
});
// const data = {
//   email: 'userid@domain.com'
// };

// const options = {
//   delay: 60000, // 1 min in ms
//   attempts: 2
// };
// // 2. Adding a Job to the Queue
// sendMailQueue.add(data, options);
module.exports=proposalJobQueue