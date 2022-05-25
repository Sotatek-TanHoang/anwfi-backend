module.exports = Object.freeze({
  // TWO_WEEKS_SECONDS: 1209600,
  LIMIT_PROCESS_NUMBER: 10,
  TWO_WEEKS_SECONDS: 300,
  DEFAULT_LIMIT: 10,
  EXPIRE_TOKEN_TIME: 300, // 5 mins
  TOKEN_DECIMAL: 18,
  CONTRACTS: {
    // map to contract_name in contract_logs table
    CAMPAIGN: 'Campaign',
    CAMPAIGNFACTORY: 'CampaignFactory',
    ETHLINK: 'ETHLink',
    ERC20: 'Erc20',
    TIER: 'Tier',
    MANTRA_STAKE: 'MantraStake',
    STAKING_POOL: 'StakingPool',
  },
  TX_TABLE: {
    CAMPAIGN: 1,
  },
  MAX_BUY_CAMPAIGN: 1000,
  EVENT_BY_TOKEN: 'TokenPurchaseByToken',
  CAMPAIGN_BLOCKCHAIN_STATUS: {
    REGISTRATION_WAITING_TX_FROM_CLIENT: 0,
    REGISTRATION_WAITING_CONFIRMATION: 1,
    REGISTRATION_CONFIRMED: 2,
    DELETION_WAITING_TX_FROM_CLIENT: 3,
    DELETION_WAITING_CONFIRMATION: 4,
    DELETION_CONFIRMED: 5,
    ACTIVATION_ACCOUNT_TX_FROM_CLIENT: 6,
    INACTIVE: 7,
    REGISTRATION_TX_FAILED: 10,
    DELETION_TX_FAILED: 11
  },
  OPERATORS_BLOCKCHAIN_ADDRESS_STATUS: {
    REGISTRATION_WAITING_TX_FROM_CLIENT: 0,
    REGISTRATION_WAITING_CONFIRMATION: 1,
    REGISTRATION_CONFIRMED: 2,
    DELETION_WAITING_TX_FROM_CLIENT: 3,
    DELETION_WAITING_CONFIRMATION: 4,
    DELETION_CONFIRMED: 5,
    ACTIVATION_ACCOUNT_TX_FROM_CLIENT: 6,
    REGISTRATION_TX_FAILED: 10,
    DELETION_TX_FAILED: 11
  },
  JOB_KEY: {
    SEND_CONFIRMATION_EMAIL: 'SendConfirmationEmailJob-job'
  },
  ACTIVE: 0,
  FEATURE: 1,
  USER_ROLE: {
    SUPER_ADMIN:3,
    ADMIN: 2,
    GOVERNANCE:1,
    PUBLIC_USER: 0,
  },
  USER_TYPE: {
    WHITELISTED: 1,
    REGULAR: 2,
  },
  USER_TYPE_PREFIX: {
    ADMIN: 'admin',
    PUBLIC_USER: 'public',
  },
  USER_STATUS: {
    UNVERIFIED: 0,
    ACTIVE: 1,
    BLOCKED: 2,
    DELETED: 3
  },
  FILE_SITE: '2mb',
  FILE_EXT: ['png', 'gif', 'jpg', 'jpeg', 'JPEG'],
  TIME_EXPIRED: 300000,
  PASSWORD_MIN_LENGTH: 8,
  TEXT_MAX_LENGTH: 255,
  EXPIRE_ETH_PRICE: 900,
  ERROR_CODE: {
    AUTH_ERROR: {
      ADDRESS_NOT_EXIST: 'AUTH_ERROR.ADDRESS_NOT_EXIST',
      PASSWORD_NOT_MATCH: 'AUTH_ERROR.PASSWORD_NOT_MATCH',
    },
  },
  BUY_TYPE: {
    STAKE: 1,
    AIRDROP: 2,
  },
  ACCEPT_CURRENCY: {
    ETH: 'eth',
    BNB: 'bnb',
    POLYGON: 'matic',
    USDT: 'usdt',
    USDC: 'usdc',
    BUSD: 'busd'
  },
  PROPOSAL_TYPE: {
    LIQUIDITY_PROVIDER_FEE: 'liquidity provider fee',
    SWAP_FEE: 'swap fee',
    STAKE_FEE:'stake fee',
    ANWFI_REWARD_PER_BLOCK:'ANWFI reward per block',
    OFFCHAIN_PROPOSAL:'offchain proposal'
  },
  // POOL_DISPLAY: {
  //   DISPLAY: 1,
  //   HIDDEN: 0,
  // },

  NETWORK_AVAILABLE: {
    ETH: 'eth',
    BSC: 'bsc',
    POLYGON: 'polygon'
  },
  // DEPLOY_STATUS: {
  //   DEPLOYED: 1,
  //   NOT_DEPLOY: 0,
  // },
  POOL_STATUS: {
    CREATED: 0,
    LIVE: 1,
    END:2,
  },
  PROPOSAL_STATUS: {  
    CREATED: 0, 
    ACTIVE: 1,
    SUCCESS: 2,
    FAILED: -1,
    QUEUE: 3,
    EXECUTED: 4,
    // CLOSED: 'Ended',
  },
  CONTRACT_ADDRESS : {
    POOL : "0xC472DD48E8ad269ae174892B523e246BF26287cE",
    AWNFI :"0x79E79B3EF77A9cE708A5218ddbD793807b2c4C33",// address awnfi token 
  },
  COINMARKETCAP_API_KEY:"adc30f62-ab80-4363-92fa-f42aabb037b2",
  RPCURL : "https://rinkeby.infura.io/v3/9340d0c9c93046fb817055e8ba9d3c15",
  STAKE_USERS: {
    LIMIT: 5,
    PAGE: 1
  },  
  PROJECT_TYPE: {
    PRIVATE: 1,
    PUBLIC: 2,
    HYRBID: 3 
  },  
  DISTRIBUTION_METHOD: {
    LINEAR: 1,
    QUADRATIC : 2,
    FIXED_AMOUNT: 3,
  },
  STAKING_STATUS: {
    AWAITING_STAKING: 1,
    STAKING: 2,
    AWAITING_RESULT: 3,
    AWAITING_CLAIM: 4,
    CLAIM: 5,
    COMPLETED: 6
  },
  AIRDROP_STATUS: {
    AWAITING_APPLICATION: 1,
    APPLICATION: 2,
    AWAITING_RESULT: 3,
    AWAITING_CLAIM: 4,
    CLAIM: 5,
    COMPLETED: 6
  },
  ALLOCATION_CACULATION_QUEUE: 'ALLOCATION_CACULATION_QUEUE',
  AIR_DROPS_CACULATION_QUEUE: 'AIR_DROPS_CACULATION_QUEUE',
  UPDATE_VOTE_QUEUE:"UPDATE_VOTE_QUEUE",
  CALCULATE_VOTE_QUEUE:"CALCULATE_VOTE_QUEUE",
  STATUS_DEPLOY : {
    NOT_DEPLOY_YET : 0,
    DEPLOYING : 1,
    HAS_DEPLOYED : 2,
    DEPLOY_FAILED : 3
  },
  BACK_OFF_JOB: 900000, // 15 mins in miliseconds
  JOIN_MESSAGE: "ANWFI uses this cryptographic signature to verify that you are the owner of this wallet",
  USER_MESSAGE: "ANWFI uses this cryptographic signature to verify that you are the owner of this wallet",
  ADMIN_MESSAGE: "ANWFI uses this cryptographic signature to verify that you are the owner of this wallet"
});
