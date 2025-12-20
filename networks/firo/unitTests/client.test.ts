import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FiroNetwork } from '../src/client';
import { mockNetworkConfig, mockFiroAddresses } from './testData';

// Mock dependencies
const mockGenerateOpReturnData = vi.fn();
const mockGenerateUnsignedTx = vi.fn();
const mockGetAddressBalance = vi.fn();
const mockSubmitTransaction = vi.fn();
const mockCalculateFee = vi.fn();
const mockGetMaxTransfer = vi.fn();
const mockGetMinTransfer = vi.fn();
const mockValidateAddress = vi.fn();

const mockConfig = {
  ...mockNetworkConfig,
  generateOpReturnData: mockGenerateOpReturnData,
  generateUnsignedTx: mockGenerateUnsignedTx,
  getAddressBalance: mockGetAddressBalance,
  submitTransaction: mockSubmitTransaction,
  calculateFee: mockCalculateFee,
  getMaxTransfer: mockGetMaxTransfer,
  getMinTransfer: mockGetMinTransfer,
  validateAddress: mockValidateAddress,
};

describe('FiroNetwork', () => {
  let firoNetwork: FiroNetwork;

  beforeEach(() => {
    vi.clearAllMocks();
    firoNetwork = new FiroNetwork(mockConfig);
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(firoNetwork.label).toBe('Firo');
      expect(firoNetwork.name).toBe('firo');
      expect(firoNetwork.lockAddress).toBe(mockNetworkConfig.lockAddress);
      expect(firoNetwork.nextHeightInterval).toBe(mockNetworkConfig.nextHeightInterval);
    });

    it('should have correct logo', () => {
      expect(firoNetwork.logo).toBeDefined();
    });
  });

  describe('calculateFee', () => {
    it('should delegate to config calculateFee', () => {
      const mockFee = BigInt(10000);
      mockCalculateFee.mockReturnValue(mockFee);

      const result = firoNetwork.calculateFee(2, 2, 10);

      expect(mockCalculateFee).toHaveBeenCalledWith(2, 2, 10);
      expect(result).toBe(mockFee);
    });
  });

  describe('generateOpReturnData', () => {
    it('should delegate to config generateOpReturnData', () => {
      const mockData = 'test-data';
      const mockOpReturn = '6a09746573742d64617461';
      mockGenerateOpReturnData.mockReturnValue(mockOpReturn);

      const result = firoNetwork.generateOpReturnData(mockData);

      expect(mockGenerateOpReturnData).toHaveBeenCalledWith(mockData);
      expect(result).toBe(mockOpReturn);
    });
  });

  describe('generateUnsignedTx', () => {
    it('should delegate to config generateUnsignedTx', async () => {
      const mockTx = {
        txHex: '0100000001...',
        txId: 'test-tx-id',
        fee: BigInt(10000),
      };
      mockGenerateUnsignedTx.mockResolvedValue(mockTx);

      const result = await firoNetwork.generateUnsignedTx(
        'aT5bN9h7qDhVgdR8j7KjMq2nF4k8xJ2nC2',
        BigInt(100000000),
        'aJ9VZh7qDhVgdR8j7KjMq2nF4k8xJ2nB3v',
        'aJ9VZh7qDhVgdR8j7KjMq2nF4k8xJ2nB3v',
        BigInt(1000000),
        BigInt(10000),
        'test-memo'
      );

      expect(mockGenerateUnsignedTx).toHaveBeenCalledWith(
        'aT5bN9h7qDhVgdR8j7KjMq2nF4k8xJ2nC2',
        BigInt(100000000),
        'aJ9VZh7qDhVgdR8j7KjMq2nF4k8xJ2nB3v',
        'aJ9VZh7qDhVgdR8j7KjMq2nF4k8xJ2nB3v',
        BigInt(1000000),
        BigInt(10000),
        'test-memo'
      );
      expect(result).toBe(mockTx);
    });
  });

  describe('getAddressBalance', () => {
    it('should delegate to config getAddressBalance', async () => {
      const mockBalance = BigInt(175000000);
      mockGetAddressBalance.mockResolvedValue(mockBalance);

      const result = await firoNetwork.getAddressBalance(
        mockFiroAddresses.valid[0],
        'https://explorer.firo.org/api'
      );

      expect(mockGetAddressBalance).toHaveBeenCalledWith(
        mockFiroAddresses.valid[0],
        'https://explorer.firo.org/api'
      );
      expect(result).toBe(mockBalance);
    });
  });

  describe('getMaxTransfer', () => {
    it('should delegate to config getMaxTransfer', async () => {
      const mockMax = BigInt(500000000);
      mockGetMaxTransfer.mockResolvedValue(mockMax);

      const result = await firoNetwork.getMaxTransfer(
        mockFiroAddresses.valid[0],
        BigInt(1000000)
      );

      expect(mockGetMaxTransfer).toHaveBeenCalledWith(
        mockFiroAddresses.valid[0],
        BigInt(1000000)
      );
      expect(result).toBe(mockMax);
    });
  });

  describe('getMinTransfer', () => {
    it('should delegate to config getMinTransfer', () => {
      const mockMin = BigInt(1000000);
      mockGetMinTransfer.mockReturnValue(mockMin);

      const result = firoNetwork.getMinTransfer();

      expect(mockGetMinTransfer).toHaveBeenCalled();
      expect(result).toBe(mockMin);
    });
  });

  describe('submitTransaction', () => {
    it('should delegate to config submitTransaction', async () => {
      const mockTxId = 'submitted-tx-id';
      const mockTxHex = '0100000001...';
      mockSubmitTransaction.mockResolvedValue(mockTxId);

      const result = await firoNetwork.submitTransaction(
        mockTxHex,
        'https://explorer.firo.org/api'
      );

      expect(mockSubmitTransaction).toHaveBeenCalledWith(
        mockTxHex,
        'https://explorer.firo.org/api'
      );
      expect(result).toBe(mockTxId);
    });
  });

  describe('toSafeAddress', () => {
    it('should return address as-is', () => {
      const address = mockFiroAddresses.valid[0];
      const result = firoNetwork.toSafeAddress(address);
      expect(result).toBe(address);
    });
  });

  describe('validateAddress', () => {
    it('should delegate to config validateAddress with network name', async () => {
      mockValidateAddress.mockResolvedValue(true);

      const result = await firoNetwork.validateAddress(mockFiroAddresses.valid[0]);

      expect(mockValidateAddress).toHaveBeenCalledWith(
        'firo',
        mockFiroAddresses.valid[0]
      );
      expect(result).toBe(true);
    });

    it('should handle invalid addresses', async () => {
      mockValidateAddress.mockResolvedValue(false);

      const result = await firoNetwork.validateAddress('invalid-address');

      expect(mockValidateAddress).toHaveBeenCalledWith('firo', 'invalid-address');
      expect(result).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle generateUnsignedTx errors', async () => {
      const error = new Error('Transaction generation failed');
      mockGenerateUnsignedTx.mockRejectedValue(error);

      await expect(firoNetwork.generateUnsignedTx(
        'aT5bN9h7qDhVgdR8j7KjMq2nF4k8xJ2nC2',
        BigInt(100000000),
        'aJ9VZh7qDhVgdR8j7KjMq2nF4k8xJ2nB3v',
        'aJ9VZh7qDhVgdR8j7KjMq2nF4k8xJ2nB3v',
        BigInt(1000000),
        BigInt(10000),
        'test-memo'
      )).rejects.toThrow('Transaction generation failed');
    });

    it('should handle getAddressBalance errors', async () => {
      const error = new Error('Balance fetch failed');
      mockGetAddressBalance.mockRejectedValue(error);

      await expect(firoNetwork.getAddressBalance(
        mockFiroAddresses.valid[0],
        'https://explorer.firo.org/api'
      )).rejects.toThrow('Balance fetch failed');
    });

    it('should handle submitTransaction errors', async () => {
      const error = new Error('Transaction submission failed');
      mockSubmitTransaction.mockRejectedValue(error);

      await expect(firoNetwork.submitTransaction(
        '0100000001...',
        'https://explorer.firo.org/api'
      )).rejects.toThrow('Transaction submission failed');
    });

    it('should handle validateAddress errors', async () => {
      const error = new Error('Address validation failed');
      mockValidateAddress.mockRejectedValue(error);

      await expect(firoNetwork.validateAddress(mockFiroAddresses.valid[0]))
        .rejects.toThrow('Address validation failed');
    });
  });
});