import { getHeightBlocksRepo } from './repository';

export const getHeightNetworks = async () => {
  const data = await getHeightBlocksRepo();
  return data;
};
