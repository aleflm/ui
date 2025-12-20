import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { NATIVE_TOKEN, RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import axios, { Axios } from '@rosen-clients/rate-limited-axios';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import { zipWith } from 'lodash-es';

import AbstractCalculator from '../abstract-calculator';

export class FiroCalculator extends AbstractCalculator {
  readonly chain: Network = NETWORKS.firo.key;

  protected client: Axios;

  constructor(
    tokenMap: TokenMap,
    addresses: string[],
    explorerUrl: string,
    logger?: AbstractLogger,
  ) {
    super(addresses, logger, tokenMap);
    this.client = axios.create({
      baseURL: explorerUrl,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /*
   * @param token Firo chain token supply, always 0
   */
  totalRawSupply = async (): Promise<bigint> => {
    return 0n;
  };

  /*
   * @param token Firo chain token balance, always 0
   */
  totalRawBalance = async (): Promise<bigint> => {
    return 0n;
  };

  /**
   * returns locked amounts of a specific token for different addresses
   * @param token
   */
  getRawLockedAmountsPerAddress = async (token: RosenChainToken) => {
    if (token.type === NATIVE_TOKEN) {
      const balances = await Promise.all(
        this.addresses.map(async (address) => {
          const response = await this.client.get<{ balance: number }>(
            `address/${address}/balance`,
          );
          return BigInt(response.data.balance);
        }),
      );
      return zipWith(this.addresses, balances, (address, amount) => ({
        address,
        amount,
      })).filter((amountPerAddress) => amountPerAddress.amount);
    }

    return [];
  };
}