import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import { Network } from '@rosen-ui/types';

import { dataSource } from '../dataSource';
import '../initialize-datasource-if-needed';

export type NetworkHeight = {
  height: number;
  network: Network;
};

export const getHeightBlocksRepo = async (): Promise<NetworkHeight[]> => {
  const rawData = await dataSource
    .getRepository(BlockEntity)
    .createQueryBuilder('block')
    .select('block.scanner', 'scanner')
    .addSelect('MAX(block.height)', 'height')
    .groupBy('block.scanner')
    .getRawMany();

  const result: NetworkHeight[] = rawData.map((item) => ({
    network: item.scanner,
    height: item.height,
  }));
  return result;
};
