import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  mockGenerateUtxos, 
  mockGenerateParams, 
  mockExpectedTransaction,
  mockApiError,
  mockInvalidUtxos,
  mockInsufficientUtxos 
} from './test-data';

// Mock the utils module
vi.mock('../src/utils', () => ({
  getAddressUtxos: vi.fn(),
  calculateFee: vi.fn(),
  selectUtxos: vi.fn(),
  generateOpReturnData: vi.fn(),
  submitTransaction: vi.fn(),
  isValidFiroAddress: vi.fn(),
}));

// Mock the generateUnsignedTx function
const mockGenerateUnsignedTx = vi.fn();
vi.mock('../src/generateUnsignedTx', () => ({
  generateUnsignedTx: () => mockGenerateUnsignedTx,
}));

import { 
  getAddressUtxos,
  calculateFee,
  selectUtxos,
  generateOpReturnData,
  submitTransaction,
  isValidFiroAddress 
} from '../src/utils';
import { generateUnsignedTx } from '../src/generateUnsignedTx';

describe('Firo Transaction Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    (getAddressUtxos as any).mockResolvedValue(mockGenerateUtxos);
    (calculateFee as any).mockReturnValue(BigInt(10000));
    (selectUtxos as any).mockReturnValue({
      selectedUtxos: mockGenerateUtxos,
      change: BigInt(144990000),
    });
    (generateOpReturnData as any).mockReturnValue('746573742d6272696467652d7472616e73666572');
    (isValidFiroAddress as any).mockReturnValue(true);
    
    mockGenerateUnsignedTx.mockResolvedValue({
      txHex: '0100000002...',
      txId: 'generated-tx-id',
      fee: BigInt(10000),
    });
  });

  describe('generateUnsignedTx', () => {
    it('should generate unsigned transaction successfully', async () => {
      const generateTx = generateUnsignedTx({
        explorerApi: 'https://explorer.firo.org/api',
        feeRate: 10,
        networkName: 'firo',
      });

      const result = await generateTx(
        mockGenerateParams.toAddress,
        mockGenerateParams.amount,
        mockGenerateParams.fromAddress,
        mockGenerateParams.changeAddress,
        mockGenerateParams.bridgeFee,
        mockGenerateParams.networkFee,
        mockGenerateParams.memo
      );

      expect(result).toBeDefined();
      expect(result.txHex).toBe('0100000002...');
      expect(result.txId).toBe('generated-tx-id');
      expect(result.fee).toBe(BigInt(10000));

      // Verify that UTXOs were fetched
      expect(getAddressUtxos).toHaveBeenCalledWith(
        mockGenerateParams.fromAddress,
        'https://explorer.firo.org/api'
      );

      // Verify that address validation was called
      expect(isValidFiroAddress).toHaveBeenCalledWith(mockGenerateParams.toAddress);
      expect(isValidFiroAddress).toHaveBeenCalledWith(mockGenerateParams.fromAddress);
      expect(isValidFiroAddress).toHaveBeenCalledWith(mockGenerateParams.changeAddress);

      // Verify that OP_RETURN data was generated
      expect(generateOpReturnData).toHaveBeenCalledWith(mockGenerateParams.memo);

      // Verify UTXO selection
      expect(selectUtxos).toHaveBeenCalledWith(
        mockGenerateUtxos,
        mockGenerateParams.amount + mockGenerateParams.bridgeFee + mockGenerateParams.networkFee
      );
    });

    it('should handle invalid to address', async () => {
      (isValidFiroAddress as any).mockImplementation((addr: string) => 
        addr !== 'invalid-address'
      );

      const generateTx = generateUnsignedTx({
        explorerApi: 'https://explorer.firo.org/api',
        feeRate: 10,
        networkName: 'firo',
      });

      await expect(generateTx(
        'invalid-address',
        mockGenerateParams.amount,
        mockGenerateParams.fromAddress,
        mockGenerateParams.changeAddress,
        mockGenerateParams.bridgeFee,
        mockGenerateParams.networkFee,
        mockGenerateParams.memo
      )).rejects.toThrow('Invalid to address');
    });

    it('should handle invalid from address', async () => {
      (isValidFiroAddress as any).mockImplementation((addr: string) => 
        addr !== 'invalid-from-address'
      );

      const generateTx = generateUnsignedTx({
        explorerApi: 'https://explorer.firo.org/api',
        feeRate: 10,
        networkName: 'firo',
      });

      await expect(generateTx(
        mockGenerateParams.toAddress,
        mockGenerateParams.amount,
        'invalid-from-address',
        mockGenerateParams.changeAddress,
        mockGenerateParams.bridgeFee,
        mockGenerateParams.networkFee,
        mockGenerateParams.memo
      )).rejects.toThrow('Invalid from address');
    });

    it('should handle invalid change address', async () => {
      (isValidFiroAddress as any).mockImplementation((addr: string) => 
        addr !== 'invalid-change-address'
      );

      const generateTx = generateUnsignedTx({
        explorerApi: 'https://explorer.firo.org/api',
        feeRate: 10,
        networkName: 'firo',
      });

      await expect(generateTx(
        mockGenerateParams.toAddress,
        mockGenerateParams.amount,
        mockGenerateParams.fromAddress,
        'invalid-change-address',
        mockGenerateParams.bridgeFee,
        mockGenerateParams.networkFee,
        mockGenerateParams.memo
      )).rejects.toThrow('Invalid change address');
    });

    it('should handle insufficient funds', async () => {
      (getAddressUtxos as any).mockResolvedValue(mockInsufficientUtxos);
      (selectUtxos as any).mockImplementation(() => {
        throw new Error('Insufficient funds');
      });

      const generateTx = generateUnsignedTx({
        explorerApi: 'https://explorer.firo.org/api',
        feeRate: 10,
        networkName: 'firo',
      });

      await expect(generateTx(
        mockGenerateParams.toAddress,
        mockGenerateParams.amount,
        mockGenerateParams.fromAddress,
        mockGenerateParams.changeAddress,
        mockGenerateParams.bridgeFee,
        mockGenerateParams.networkFee,
        mockGenerateParams.memo
      )).rejects.toThrow('Insufficient funds');
    });

    it('should handle zero amount', async () => {
      const generateTx = generateUnsignedTx({
        explorerApi: 'https://explorer.firo.org/api',
        feeRate: 10,
        networkName: 'firo',
      });

      await expect(generateTx(
        mockGenerateParams.toAddress,
        BigInt(0),
        mockGenerateParams.fromAddress,
        mockGenerateParams.changeAddress,
        mockGenerateParams.bridgeFee,
        mockGenerateParams.networkFee,
        mockGenerateParams.memo
      )).rejects.toThrow('Amount must be greater than 0');
    });

    it('should handle negative fees', async () => {
      const generateTx = generateUnsignedTx({
        explorerApi: 'https://explorer.firo.org/api',
        feeRate: 10,
        networkName: 'firo',
      });

      await expect(generateTx(
        mockGenerateParams.toAddress,
        mockGenerateParams.amount,
        mockGenerateParams.fromAddress,
        mockGenerateParams.changeAddress,
        BigInt(-1000),
        mockGenerateParams.networkFee,
        mockGenerateParams.memo
      )).rejects.toThrow('Bridge fee cannot be negative');
    });

    it('should handle API errors', async () => {
      (getAddressUtxos as any).mockRejectedValue(mockApiError);

      const generateTx = generateUnsignedTx({
        explorerApi: 'https://explorer.firo.org/api',
        feeRate: 10,
        networkName: 'firo',
      });

      await expect(generateTx(
        mockGenerateParams.toAddress,
        mockGenerateParams.amount,
        mockGenerateParams.fromAddress,
        mockGenerateParams.changeAddress,
        mockGenerateParams.bridgeFee,
        mockGenerateParams.networkFee,
        mockGenerateParams.memo
      )).rejects.toThrow('Network request failed');
    });

    it('should handle empty memo', async () => {
      const generateTx = generateUnsignedTx({
        explorerApi: 'https://explorer.firo.org/api',
        feeRate: 10,
        networkName: 'firo',
      });

      await generateTx(
        mockGenerateParams.toAddress,
        mockGenerateParams.amount,
        mockGenerateParams.fromAddress,
        mockGenerateParams.changeAddress,
        mockGenerateParams.bridgeFee,
        mockGenerateParams.networkFee,
        '' // Empty memo
      );

      expect(generateOpReturnData).toHaveBeenCalledWith('');
    });

    it('should handle high fee rate', async () => {
      (calculateFee as any).mockReturnValue(BigInt(100000)); // High fee

      const generateTx = generateUnsignedTx({
        explorerApi: 'https://explorer.firo.org/api',
        feeRate: 100, // High fee rate
        networkName: 'firo',
      });

      const result = await generateTx(
        mockGenerateParams.toAddress,
        mockGenerateParams.amount,
        mockGenerateParams.fromAddress,
        mockGenerateParams.changeAddress,
        mockGenerateParams.bridgeFee,
        mockGenerateParams.networkFee,
        mockGenerateParams.memo
      );

      expect(calculateFee).toHaveBeenCalledWith(2, 3, 100); // 2 inputs, 3 outputs, 100 sat/byte
    });

    it('should include all required transaction outputs', async () => {
      const generateTx = generateUnsignedTx({
        explorerApi: 'https://explorer.firo.org/api',
        feeRate: 10,
        networkName: 'firo',
      });

      await generateTx(
        mockGenerateParams.toAddress,
        mockGenerateParams.amount,
        mockGenerateParams.fromAddress,
        mockGenerateParams.changeAddress,
        mockGenerateParams.bridgeFee,
        mockGenerateParams.networkFee,
        mockGenerateParams.memo
      );

      // Verify the transaction includes:
      // 1. Output to target address
      // 2. Change output
      // 3. OP_RETURN output
      expect(mockGenerateUnsignedTx).toHaveBeenCalledWith(
        expect.objectContaining({
          outputs: expect.arrayContaining([
            expect.objectContaining({
              address: mockGenerateParams.toAddress,
              value: mockGenerateParams.amount,
            }),
            expect.objectContaining({
              address: mockGenerateParams.changeAddress,
            }),
            expect.objectContaining({
              opReturn: expect.any(String),
            }),
          ]),
        })
      );
    });
  });

  describe('Transaction validation', () => {
    it('should validate transaction structure', async () => {
      const generateTx = generateUnsignedTx({
        explorerApi: 'https://explorer.firo.org/api',
        feeRate: 10,
        networkName: 'firo',
      });

      const result = await generateTx(
        mockGenerateParams.toAddress,
        mockGenerateParams.amount,
        mockGenerateParams.fromAddress,
        mockGenerateParams.changeAddress,
        mockGenerateParams.bridgeFee,
        mockGenerateParams.networkFee,
        mockGenerateParams.memo
      );

      // Verify transaction has required fields
      expect(result).toHaveProperty('txHex');
      expect(result).toHaveProperty('txId');
      expect(result).toHaveProperty('fee');
      expect(typeof result.txHex).toBe('string');
      expect(typeof result.txId).toBe('string');
      expect(typeof result.fee).toBe('bigint');
    });

    it('should have non-zero fee', async () => {
      const generateTx = generateUnsignedTx({
        explorerApi: 'https://explorer.firo.org/api',
        feeRate: 10,
        networkName: 'firo',
      });

      const result = await generateTx(
        mockGenerateParams.toAddress,
        mockGenerateParams.amount,
        mockGenerateParams.fromAddress,
        mockGenerateParams.changeAddress,
        mockGenerateParams.bridgeFee,
        mockGenerateParams.networkFee,
        mockGenerateParams.memo
      );

      expect(result.fee).toBeGreaterThan(BigInt(0));
    });

    it('should generate valid transaction hex', async () => {
      const generateTx = generateUnsignedTx({
        explorerApi: 'https://explorer.firo.org/api',
        feeRate: 10,
        networkName: 'firo',
      });

      const result = await generateTx(
        mockGenerateParams.toAddress,
        mockGenerateParams.amount,
        mockGenerateParams.fromAddress,
        mockGenerateParams.changeAddress,
        mockGenerateParams.bridgeFee,
        mockGenerateParams.networkFee,
        mockGenerateParams.memo
      );

      // Basic validation that it's a hex string
      expect(result.txHex).toMatch(/^[0-9a-fA-F]+$/);
      expect(result.txHex.length).toBeGreaterThan(0);
    });
  });
});