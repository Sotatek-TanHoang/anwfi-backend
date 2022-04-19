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
    ICO_OWNER: 1,
    PUBLIC_USER: 2,
  },
  USER_TYPE: {
    WHITELISTED: 1,
    REGULAR: 2,
  },
  USER_TYPE_PREFIX: {
    ICO_OWNER: 'admin',
    PUBLIC_USER: 'user',
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
  POOL_TYPE: {
    SWAP: 'swap',
    CLAIMABLE: 'claimable',
  },
  POOL_DISPLAY: {
    DISPLAY: 1,
    HIDDEN: 0,
  },
  NETWORK_AVAILABLE: {
    ETH: 'eth',
    BSC: 'bsc',
    POLYGON: 'polygon'
  },
  DEPLOY_STATUS: {
    DEPLOYED: 1,
    NOT_DEPLOY: 0,
  },
  POOL_STATUS: {  // Pool Status for version 2
    TBA: 'TBA',
    UPCOMING: 'Upcoming',
    FILLED: 'Filled',
    SWAP: 'Swap',
    CLAIMABLE: 'Claimable',
    ENDED: 'Ended',
    CLOSED: 'Ended',
  },
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
  START_TIME_TRANSFER_STAKING_CONTRACT: +process.env.START_TIME_TRANSFER_STAKING_CONTRACT || 1629824400000,
  END_TIME_TRANSFER_STAKING_CONTRACT: +process.env.END_TIME_TRANSFER_STAKING_CONTRACT || 1630342800000,
  STATUS_DEPLOY : {
    NOT_DEPLOY_YET : 0,
    DEPLOYING : 1,
    HAS_DEPLOYED : 2,
    DEPLOY_FAILED : 3
  },
  BACK_OFF_JOB: 900000, // 15 mins in miliseconds
  JOIN_MESSAGE: "Oasis launchpad uses this cryptographic signature to verify that you are the owner of this wallet",
  USER_MESSAGE: "LaunchGarden uses this cryptographic signature to verify that you are the owner of this wallet",
  ADMIN_MESSAGE: "Oasis launchpad uses this cryptographic signature to verify that you are the owner of this wallet"
});