import { NetworkType } from '@rosen-ui/types';

export interface FiroTx {
  txId: string;
  vout: number;
  value: bigint;
  scriptPubKey: string;
}

export interface FiroUtxo {
  txId: string;
  index: number;
  value: bigint;
  address: string;
  script: string;
}

export interface FiroTxInput {
  txId: string;
  index: number;
  scriptSig?: string;
  witness?: string[];
}

export interface FiroTxOutput {
  value: bigint;
  scriptPubKey: string;
  address?: string;
}

export interface FiroUnsignedTransaction {
  inputs: FiroTxInput[];
  outputs: FiroTxOutput[];
  fee: bigint;
  changeOutput?: FiroTxOutput;
}

export type FiroNetwork = NetworkType;