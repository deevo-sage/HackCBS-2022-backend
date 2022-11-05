import { getDefaultProvider, providers } from 'ethers';
import fetch from 'node-fetch'

const rinkebyNetworkOptions = providers.getNetwork('Rinkeby');

export const defaultEthersProvider = getDefaultProvider(rinkebyNetworkOptions);

export const alchemyProvider = new providers.AlchemyProvider(
  providers.getNetwork('maticmum'),
  process.env.ALCHEMY_PROVIDER_KEY,
);

export const getConversionRate = async (
  crypto: string,
  fiat: string,
  amount: number,
) => {
  const url = `https://api.exchangerate.host/latest?base=${crypto}&symbols=${fiat}&amount=1`;
  const res = await fetch(url);
  const response: any = await res.json()
  return amount / response.rates[fiat];
};
