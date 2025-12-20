export const mockFiroUtxos = [
  {
    txId: 'f1e2d3c4b5a6978849302718364950607f8e9d0a1b2c3d4e5f6a7b8c9d0e1f2a',
    index: 0,
    value: BigInt(100000000), // 1 FIRO
    address: 'aJ9VZh7qDhVgdR8j7KjMq2nF4k8xJ2nB3v',
    script: '76a914...',
  },
  {
    txId: 'a2b3c4d5e6f7891011121314151617181920212223242526272829303132333a',
    index: 1,
    value: BigInt(50000000), // 0.5 FIRO
    address: 'aJ9VZh7qDhVgdR8j7KjMq2nF4k8xJ2nB3v',
    script: '76a914...',
  },
  {
    txId: 'b3c4d5e6f7a89b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c',
    index: 2,
    value: BigInt(25000000), // 0.25 FIRO
    address: 'aJ9VZh7qDhVgdR8j7KjMq2nF4k8xJ2nB3v',
    script: '76a914...',
  },
];

export const mockApiResponses = {
  balance: {
    balance: 175000000, // 1.75 FIRO
  },
  utxos: mockFiroUtxos,
  broadcastResponse: {
    txid: 'c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5',
  },
};

export const mockFiroAddresses = {
  valid: [
    'aJ9VZh7qDhVgdR8j7KjMq2nF4k8xJ2nB3v',
    'aF2dX8h3qWgVr9j6KjMp2nF4k8xJ2nB9z',
    'aT5bN9h7qDhVgdR8j7KjMq2nF4k8xJ2nC2',
  ],
  invalid: [
    '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', // Bitcoin address
    'DFpvmC1qW4FnRjY8u2xNQxV1GpR9eGZtY4', // Doge address
    'invalid-address',
    'short',
    '',
  ],
};

export const mockTransactionData = {
  targetAddress: 'aT5bN9h7qDhVgdR8j7KjMq2nF4k8xJ2nC2',
  amount: BigInt(30000000), // 0.3 FIRO
  fee: BigInt(1000000), // 0.01 FIRO
  opReturnData: 'test-bridge-data',
  expectedOpReturn: '6a10746573742d6272696467652d64617461',
  changeAddress: 'aJ9VZh7qDhVgdR8j7KjMq2nF4k8xJ2nB3v',
};

export const mockExplorerApi = 'https://explorer.firo.org/api';
export const mockFeeRate = 10; // sat/byte

export const mockNetworkConfig = {
  lockAddress: 'aJ9VZh7qDhVgdR8j7KjMq2nF4k8xJ2nB3v',
  nextHeightInterval: 720,
  explorerApi: mockExplorerApi,
  feeRate: mockFeeRate,
};