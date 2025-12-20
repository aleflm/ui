import { FiroUtxo } from './types';

/**
 * Calculate maximum transferable amount for Firo
 * @param utxos - Available UTXOs
 * @param feeRate - Fee rate in sat/byte
 * @param outputCount - Number of outputs (default 1)
 * @returns Maximum transferable amount in satoshis
 */
export const getMaxTransfer = (
  utxos: FiroUtxo[],
  feeRate: number,
  outputCount: number = 1
): bigint => {
  if (utxos.length === 0) return 0n;
  
  const totalInput = utxos.reduce((sum, utxo) => sum + utxo.value, 0n);
  
  // Estimate transaction size
  // Input: ~150 bytes each (UTXO + signature)
  // Output: ~50 bytes each
  // Base transaction: ~50 bytes
  const estimatedSize = utxos.length * 150 + outputCount * 50 + 50;
  const fee = BigInt(estimatedSize * feeRate);
  
  const maxTransfer = totalInput - fee;
  
  return maxTransfer > 0n ? maxTransfer : 0n;
};