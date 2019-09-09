import {Event} from '../Event';
import {addAction, World} from '../World';
import {PriceOracleProxy} from '../Contract/PriceOracleProxy';
import {Invokation} from '../Invokation';
import {Arg, Fetcher, getFetcherValue} from '../Command';
import {storeAndSaveContract} from '../Networks';
import {getContract} from '../Contract';
import {getAddressV} from '../CoreValue';
import {AddressV} from '../Value';

const PriceOracleProxyContract = getContract("PriceOracleProxy");

export interface PriceOracleProxyData {
  invokation?: Invokation<PriceOracleProxy>,
  contract?: PriceOracleProxy,
  description: string,
  address?: string,
  cETH: string,
  cUSDC: string,
  cDAI: string
}

export async function buildPriceOracleProxy(world: World, from: string, event: Event): Promise<{world: World, priceOracleProxy: PriceOracleProxy, invokation: Invokation<PriceOracleProxy>}> {
  const fetchers = [
    new Fetcher<{comptroller: AddressV, priceOracle: AddressV, cETH: AddressV, cUSDC: AddressV, cDAI: AddressV}, PriceOracleProxyData>(`
        #### Price Oracle Proxy

        * "Deploy <Comptroller:Address> <PriceOracle:Address> <cETH:Address> <cUSDC:Address> <cDAI:Address>" - The Price Oracle which proxies to a backing oracle
        * E.g. "PriceOracleProxy Deploy (Unitroller Address) (PriceOracle Address) cETH cUSDC cDAI"
      `,
      "PriceOracleProxy",
      [
        new Arg("comptroller", getAddressV),
        new Arg("priceOracle", getAddressV),
        new Arg("cETH", getAddressV),
        new Arg("cUSDC", getAddressV),
        new Arg("cDAI", getAddressV)
      ],
      async (world, {comptroller, priceOracle, cETH, cUSDC, cDAI}) => {
        return {
          invokation: await PriceOracleProxyContract.deploy<PriceOracleProxy>(world, from, [comptroller.val, priceOracle.val, cETH.val, cUSDC.val, cDAI.val]),
          description: "Price Oracle Proxy",
          cETH: cETH.val,
          cUSDC: cUSDC.val,
          cDAI: cDAI.val
        };
      },
      {catchall: true}
    )
  ];

  let priceOracleProxyData = await getFetcherValue<any, PriceOracleProxyData>("DeployPriceOracleProxy", fetchers, world, event);
  let invokation = priceOracleProxyData.invokation!;
  delete priceOracleProxyData.invokation;

  if (invokation.error) {
    throw invokation.error;
  }
  const priceOracleProxy = invokation.value!;
  priceOracleProxyData.address = priceOracleProxy._address;

  world = await storeAndSaveContract(
    world,
    priceOracleProxy,
    'PriceOracleProxy',
    invokation,
    [
      { index: ['PriceOracleProxy'], data: priceOracleProxyData }
    ]
  );

  return {world, priceOracleProxy, invokation};
}
