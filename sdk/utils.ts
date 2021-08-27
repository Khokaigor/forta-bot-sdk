import fs from 'fs'
import { join } from 'path'
import { jsonc } from 'jsonc'
import _ from 'lodash'
import { Keccak } from 'sha3'
import { BlockEvent, EventType, FortaConfig, Network, Trace, TransactionEvent } from '.'
import { Transaction } from './transaction'
import { Receipt } from './receipt'
import { TxEventBlock } from './transaction.event'
import { Block } from './block'

export const getFortaConfig: () => FortaConfig = () => {
  const configFlagIndex = process.argv.indexOf('--config')
  const configFile = configFlagIndex == -1 ? undefined : process.argv[configFlagIndex + 1]
  const configPath = join(process.cwd(), configFile || 'forta.config.json')
  const data = fs.readFileSync(configPath, 'utf8')
  return jsonc.parse(data)
}

export const getJsonRpcUrl = () => {
  // if rpc url provided by Forta Scanner i.e. in production
  if (process.env.JSON_RPC_HOST) {
    return `http://${process.env.JSON_RPC_HOST}${process.env.JSON_RPC_PORT ? `:${process.env.JSON_RPC_PORT}` : ''}`
  }
  
  // else, use the rpc url from forta.config.json
  const { jsonRpcUrl } = getFortaConfig()
  if (!jsonRpcUrl) throw new Error('no jspnRpcUrl found')
  return jsonRpcUrl
}

// utility function for writing TransactionEvent tests
export const createTransactionEvent = ({
  type = EventType.BLOCK,
  network = Network.MAINNET,
  transaction,
  receipt,
  traces = [],
  addresses = {},
  block
}: {
  type?: EventType,
  network?: Network,
  transaction: Transaction,
  receipt: Receipt,
  traces?: Trace[],
  addresses?: { [key: string]: boolean },
  block: TxEventBlock
}) => {
  return new TransactionEvent(type, network, transaction, receipt, traces, addresses, block)
}

// utility function for writing BlockEvent tests
export const createBlockEvent = ({
  type = EventType.BLOCK,
  network = Network.MAINNET,
  blockHash,
  blockNumber,
  block
}: {
  type?: EventType,
  network?: Network,
  blockHash: string,
  blockNumber: number,
  block: Block
}) => {
  return new BlockEvent(type, network, blockHash, blockNumber, block)
}

export const assertIsNonEmptyString = (str: string, varName: string) => {
  if (!_.isString(str) || str.length === 0) {
    throw new Error(`${varName} must be non-empty string`);
  }
};

export const assertIsFromEnum = (value: any, Enum: any, varName: string) => {
  if (!Object.values(Enum).includes(value)) {
    throw new Error(`${varName} must be valid enum value`)
  }
}

export const keccak256 = (str: string) => {
  const hash = new Keccak(256)
  hash.update(str)
  return `0x${hash.digest('hex')}`
}