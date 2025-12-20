import type { FiroUtxo } from '../src/types';

export const mockGenerateUtxos: FiroUtxo[] = [
  {
    txId: 'e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2',
    index: 0,
    value: BigInt(100000000),
    address: 'aJ9VZh7qDhVgdR8j7KjMq2nF4k8xJ2nB3v',
    script: '76a914abc123def456789abc123def456789abc123def488ac',
  },
  {
    txId: 'f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3',
    index: 1,
    value: BigInt(200000000),
    address: 'aF2dX8h3qWgVr9j6KjMp2nF4k8xJ2nB9z',
    script: '76a914def456789abc123def456789abc123def456789ac',
  },
];

export const mockGenerateParams = {
  toAddress: 'aT5bN9h7qDhVgdR8j7KjMq2nF4k8xJ2nC2',
  amount: BigInt(150000000),
  fromAddress: 'aJ9VZh7qDhVgdR8j7KjMq2nF4k8xJ2nB3v',
  changeAddress: 'aJ9VZh7qDhVgdR8j7KjMq2nF4k8xJ2nB3v',
  bridgeFee: BigInt(5000000),
  networkFee: BigInt(10000),
  memo: 'test-bridge-transfer',
};

export const mockExpectedTransaction = {
  inputs: [
    {
      txId: 'e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2',
      index: 0,
      value: BigInt(100000000),
    },
    {
      txId: 'f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3',
      index: 1,
      value: BigInt(200000000),
    },
  ],
  outputs: [
    {
      address: 'aT5bN9h7qDhVgdR8j7KjMq2nF4k8xJ2nC2',
      value: BigInt(150000000),
    },
    {
      address: 'aJ9VZh7qDhVgdR8j7KjMq2nF4k8xJ2nB3v',
      value: BigInt(144990000), // 300000000 - 150000000 - 5000000 - 10000
    },
    {
      opReturn: '746573742d6272696467652d7472616e73666572',
    },
  ],
  fee: BigInt(10000),
  totalInput: BigInt(300000000),
  totalOutput: BigInt(294990000),
};

export const mockApiError = new Error('Network request failed');

export const mockInvalidUtxos: FiroUtxo[] = [
  {
    txId: 'invalid-tx-id',
    index: 0,
    value: BigInt(0),
    address: 'invalid-address',
    script: '',
  },
];

export const mockInsufficientUtxos: FiroUtxo[] = [
  {
    txId: 'small-utxo-1',
    index: 0,
    value: BigInt(1000000), // 0.01 FIRO
    address: 'aJ9VZh7qDhVgdR8j7KjMq2nF4k8xJ2nB3v',
    script: '76a914abc123def456789abc123def456789abc123def488ac',
  },
];