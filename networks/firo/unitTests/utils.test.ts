import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  generateOpReturnData,
  getAddressBalance,
  submitTransaction,
  getAddressUtxos,
  calculateFee,
  isValidFiroAddress,
  selectUtxos,
  satoshisToFiro,
  firoToSatoshis,
  formatFiroAmount
} from '../src/utils';
import { 
  mockFiroUtxos, 
  mockApiResponses, 
  mockFiroAddresses,
  mockTransactionData,
  mockExplorerApi 
} from './testData';

// Mock fetch globally
global.fetch = vi.fn();

describe('Firo Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateOpReturnData', () => {
    it('should generate correct OP_RETURN data for short string', () => {
      const data = 'hello';
      const result = generateOpReturnData(data);
      const expected = '6a0568656c6c6f'; // OP_RETURN + length(5) + 'hello' in hex
      expect(result).toBe(expected);
    });

    it('should generate correct OP_RETURN data for bridge data', () => {
      const result = generateOpReturnData(mockTransactionData.opReturnData);
      expect(result).toBe(mockTransactionData.expectedOpReturn);
    });

    it('should handle empty string', () => {
      const result = generateOpReturnData('');
      expect(result).toBe('6a00'); // OP_RETURN + length(0)
    });

    it('should throw error for data too large', () => {
      const largeData = 'a'.repeat(81); // 81 bytes, over 80 byte limit
      expect(() => generateOpReturnData(largeData)).toThrow('OP_RETURN data too large');
    });

    it('should handle maximum allowed data size', () => {
      const maxData = 'a'.repeat(80);
      const result = generateOpReturnData(maxData);
      expect(result).toMatch(/^6a50[a-f0-9]{160}$/); // OP_RETURN + 0x50 (80) + 160 hex chars
    });
  });

  describe('getAddressBalance', () => {
    it('should fetch address balance successfully', async () => {
      const mockFetch = fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponses.balance),
      });

      const balance = await getAddressBalance(
        mockFiroAddresses.valid[0],
        mockExplorerApi
      );

      expect(balance).toBe(BigInt(175000000));
      expect(mockFetch).toHaveBeenCalledWith(
        `${mockExplorerApi}/address/${mockFiroAddresses.valid[0]}/balance`
      );
    });

    it('should return 0 for API error', async () => {
      const mockFetch = fetch as any;
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      const balance = await getAddressBalance(
        mockFiroAddresses.valid[0],
        mockExplorerApi
      );

      expect(balance).toBe(BigInt(0));
    });

    it('should return 0 for HTTP error', async () => {
      const mockFetch = fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const balance = await getAddressBalance(
        mockFiroAddresses.valid[0],
        mockExplorerApi
      );

      expect(balance).toBe(BigInt(0));
    });

    it('should handle missing balance in response', async () => {
      const mockFetch = fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const balance = await getAddressBalance(
        mockFiroAddresses.valid[0],
        mockExplorerApi
      );

      expect(balance).toBe(BigInt(0));
    });
  });

  describe('submitTransaction', () => {
    const mockTxHex = '0100000001...'; // Mock transaction hex

    it('should submit transaction successfully', async () => {
      const mockFetch = fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponses.broadcastResponse),
      });

      const txId = await submitTransaction(mockTxHex, mockExplorerApi);

      expect(txId).toBe(mockApiResponses.broadcastResponse.txid);
      expect(mockFetch).toHaveBeenCalledWith(
        `${mockExplorerApi}/tx`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ hex: mockTxHex }),
        }
      );
    });

    it('should throw error for HTTP error', async () => {
      const mockFetch = fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(submitTransaction(mockTxHex, mockExplorerApi))
        .rejects.toThrow('HTTP error! status: 400');
    });

    it('should throw error for network error', async () => {
      const mockFetch = fetch as any;
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(submitTransaction(mockTxHex, mockExplorerApi))
        .rejects.toThrow('Network error');
    });
  });

  describe('getAddressUtxos', () => {
    it('should fetch UTXOs successfully', async () => {
      const mockFetch = fetch as any;
      const mockUtxoResponse = mockApiResponses.utxos.map(utxo => ({
        txid: utxo.txId,
        vout: utxo.index,
        value: Number(utxo.value),
        scriptPubKey: { hex: utxo.script },
      }));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUtxoResponse),
      });

      const utxos = await getAddressUtxos(
        mockFiroAddresses.valid[0],
        mockExplorerApi
      );

      expect(utxos).toHaveLength(3);
      expect(utxos[0].txId).toBe(mockFiroUtxos[0].txId);
      expect(utxos[0].value).toBe(mockFiroUtxos[0].value);
    });

    it('should return empty array for API error', async () => {
      const mockFetch = fetch as any;
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      const utxos = await getAddressUtxos(
        mockFiroAddresses.valid[0],
        mockExplorerApi
      );

      expect(utxos).toEqual([]);
    });

    it('should handle missing scriptPubKey', async () => {
      const mockFetch = fetch as any;
      const mockUtxoResponse = [{
        txid: 'test-tx-id',
        vout: 0,
        value: 100000000,
        // scriptPubKey missing
      }];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUtxoResponse),
      });

      const utxos = await getAddressUtxos(
        mockFiroAddresses.valid[0],
        mockExplorerApi
      );

      expect(utxos[0].script).toBe('');
    });
  });

  describe('calculateFee', () => {
    it('should calculate fee correctly for standard transaction', () => {
      const fee = calculateFee(2, 2, 10); // 2 inputs, 2 outputs, 10 sat/byte
      const expectedSize = 10 + (2 * 148) + (2 * 34); // 374 bytes
      const expectedFee = BigInt(Math.ceil(374 * 10)); // 3740 satoshis
      expect(fee).toBe(expectedFee);
    });

    it('should handle single input/output', () => {
      const fee = calculateFee(1, 1, 5);
      const expectedSize = 10 + 148 + 34; // 192 bytes
      const expectedFee = BigInt(Math.ceil(192 * 5)); // 960 satoshis
      expect(fee).toBe(expectedFee);
    });

    it('should handle high fee rate', () => {
      const fee = calculateFee(1, 2, 100);
      const expectedSize = 10 + 148 + 68; // 226 bytes
      const expectedFee = BigInt(Math.ceil(226 * 100)); // 22600 satoshis
      expect(fee).toBe(expectedFee);
    });
  });

  describe('isValidFiroAddress', () => {
    it('should validate correct Firo addresses', () => {
      mockFiroAddresses.valid.forEach(address => {
        expect(isValidFiroAddress(address)).toBe(true);
      });
    });

    it('should reject invalid addresses', () => {
      mockFiroAddresses.invalid.forEach(address => {
        expect(isValidFiroAddress(address)).toBe(false);
      });
    });
  });

  describe('selectUtxos', () => {
    it('should select UTXOs optimally', () => {
      const targetAmount = BigInt(75000000); // 0.75 FIRO
      const result = selectUtxos(mockFiroUtxos, targetAmount);

      expect(result.selectedUtxos).toHaveLength(1);
      expect(result.selectedUtxos[0].value).toBe(BigInt(100000000)); // Largest UTXO
      expect(result.change).toBe(BigInt(25000000)); // 1 - 0.75 = 0.25 FIRO
    });

    it('should select multiple UTXOs when needed', () => {
      const targetAmount = BigInt(125000000); // 1.25 FIRO
      const result = selectUtxos(mockFiroUtxos, targetAmount);

      expect(result.selectedUtxos).toHaveLength(2);
      expect(result.change).toBe(BigInt(25000000)); // 1.5 - 1.25 = 0.25 FIRO
    });

    it('should throw error for insufficient funds', () => {
      const targetAmount = BigInt(200000000); // 2 FIRO (more than available)
      expect(() => selectUtxos(mockFiroUtxos, targetAmount))
        .toThrow('Insufficient funds');
    });

    it('should handle exact amount', () => {
      const targetAmount = BigInt(175000000); // Exact total
      const result = selectUtxos(mockFiroUtxos, targetAmount);

      expect(result.change).toBe(BigInt(0));
      expect(result.selectedUtxos).toHaveLength(3);
    });
  });

  describe('satoshisToFiro', () => {
    it('should convert satoshis to FIRO correctly', () => {
      expect(satoshisToFiro(BigInt(100000000))).toBe(1);
      expect(satoshisToFiro(BigInt(50000000))).toBe(0.5);
      expect(satoshisToFiro(BigInt(0))).toBe(0);
    });
  });

  describe('firoToSatoshis', () => {
    it('should convert FIRO to satoshis correctly', () => {
      expect(firoToSatoshis(1)).toBe(BigInt(100000000));
      expect(firoToSatoshis(0.5)).toBe(BigInt(50000000));
      expect(firoToSatoshis(0)).toBe(BigInt(0));
    });
  });

  describe('formatFiroAmount', () => {
    it('should format FIRO amounts correctly', () => {
      expect(formatFiroAmount(BigInt(100000000))).toBe('1.00000000');
      expect(formatFiroAmount(BigInt(50000000), 2)).toBe('0.50');
      expect(formatFiroAmount(BigInt(0))).toBe('0.00000000');
    });
  });
});