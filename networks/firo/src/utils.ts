import { NETWORKS } from '@rosen-ui/constants';

import type { FiroUtxo } from './types';

const firoNetworkConfig = NETWORKS.firo;

/**
 * Generate OP_RETURN data for Firo transactions
 * @param data - Data to include in OP_RETURN
 * @returns Hex-encoded OP_RETURN script
 */
export const generateOpReturnData = (data: string): string => {
  const dataHex = Buffer.from(data, 'utf8').toString('hex');
  const dataLength = Buffer.from(data, 'utf8').length;
  
  if (dataLength > 80) {
    throw new Error('OP_RETURN data too large (max 80 bytes)');
  }
  
  const lengthHex = dataLength.toString(16).padStart(2, '0');
  return `6a${lengthHex}${dataHex}`;
};

/**
 * Get address balance using block explorer API
 * @param address - Firo address
 * @param explorerApi - Block explorer API URL
 * @returns Promise resolving to balance in satoshis
 */
export const getAddressBalance = async (
  address: string,
  explorerApi: string
): Promise<bigint> => {
  try {
    const response = await fetch(`${explorerApi}/address/${address}/balance`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return BigInt(data.balance || 0);
  } catch (error) {
    console.error('Error fetching address balance:', error);
    return BigInt(0);
  }
};

/**
 * Submit transaction to Firo network
 * @param txHex - Raw transaction hex
 * @param explorerApi - Block explorer API URL
 * @returns Promise resolving to transaction ID
 */
export const submitTransaction = async (
  txHex: string,
  explorerApi: string
): Promise<string> => {
  try {
    const response = await fetch(`${explorerApi}/tx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hex: txHex }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.txid;
  } catch (error) {
    console.error('Error submitting transaction:', error);
    throw error;
  }
};

/**
 * Get UTXOs for a Firo address
 * @param address - Firo address
 * @param explorerApi - Block explorer API URL
 * @returns Promise resolving to array of UTXOs
 */
export const getAddressUtxos = async (
  address: string,
  explorerApi: string
): Promise<FiroUtxo[]> => {
  try {
    const response = await fetch(`${explorerApi}/address/${address}/utxo`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.map((utxo: any) => ({
      txId: utxo.txid,
      index: utxo.vout,
      value: BigInt(utxo.value),
      address: address,
      script: utxo.scriptPubKey?.hex || '',
    }));
  } catch (error) {
    console.error('Error fetching UTXOs:', error);
    return [];
  }
};

/**
 * Calculate fee for Firo transaction
 * @param inputCount - Number of inputs
 * @param outputCount - Number of outputs
 * @param feeRate - Fee rate in sat/byte
 * @returns Fee in satoshis
 */
export const calculateFee = (
  inputCount: number,
  outputCount: number,
  feeRate: number
): bigint => {
  // Typical Firo transaction size estimation
  // Base size + (inputs * 148) + (outputs * 34)
  const txSize = 10 + (inputCount * 148) + (outputCount * 34);
  return BigInt(Math.ceil(txSize * feeRate));
};

/**
 * Validate Firo address format
 * @param address - Address to validate
 * @returns True if address is valid format
 */
export const isValidFiroAddress = (address: string): boolean => {
  // Firo addresses start with 'a' or 'A' for mainnet
  // Length is typically 34 characters
  const firoRegex = /^[aA][a-km-zA-HJ-NP-Z1-9]{33}$/;
  return firoRegex.test(address);
};

/**
 * Select UTXOs for transaction
 * @param utxos - Available UTXOs
 * @param targetAmount - Amount needed
 * @returns Selected UTXOs and change amount
 */
export const selectUtxos = (
  utxos: FiroUtxo[],
  targetAmount: bigint
): { selectedUtxos: FiroUtxo[]; change: bigint } => {
  const sortedUtxos = [...utxos].sort((a, b) => 
    a.value > b.value ? -1 : a.value < b.value ? 1 : 0
  );
  
  const selectedUtxos: FiroUtxo[] = [];
  let totalValue = BigInt(0);
  
  for (const utxo of sortedUtxos) {
    selectedUtxos.push(utxo);
    totalValue += utxo.value;
    
    if (totalValue >= targetAmount) {
      break;
    }
  }
  
  if (totalValue < targetAmount) {
    throw new Error('Insufficient funds');
  }
  
  return {
    selectedUtxos,
    change: totalValue - targetAmount,
  };
};

/**
 * Convert FIRO satoshis to FIRO units
 * @param satoshis - Amount in satoshis
 * @returns Amount in FIRO units
 */
export const satoshisToFiro = (satoshis: bigint): number => {
  return Number(satoshis) / Math.pow(10, 8);
};

/**
 * Convert FIRO units to satoshis
 * @param firo - Amount in FIRO units
 * @returns Amount in satoshis
 */
export const firoToSatoshis = (firo: number): bigint => {
  return BigInt(Math.round(firo * Math.pow(10, 8)));
};

/**
 * Format FIRO amount for display
 * @param satoshis - Amount in satoshis
 * @param precision - Number of decimal places
 * @returns Formatted string
 */
export const formatFiroAmount = (satoshis: bigint, precision = 8): string => {
  const firo = satoshisToFiro(satoshis);
  return firo.toFixed(precision);
};