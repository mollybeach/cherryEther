import { JsonRpcProvider } from "@ethersproject/providers";
import { ethers } from "ethers";
import fs from "fs";

const ABI = [
    "function EXPIRATION() view returns (uint256)",
    "function calculateRewards(address account, uint256[] tokenIds) view returns (uint256[] rewards)",
    "function claimRewards(uint256[] tokenIds)",
    "function deposit(uint256[] tokenIds, uint256[] amounts)",
    "function depositBalances(address, uint256) view returns (uint256)",
    "function depositBlocks(address, uint256) view returns (uint256)",
    "function depositsOf(address account) view returns (uint256[] tokenIds, uint256[] amounts)",
    "function itemValues(uint256) view returns (uint256)",
    "function onERC1155BatchReceived(address, address, uint256[], uint256[], bytes) pure returns (bytes4)",
    "function onERC1155Received(address, address, uint256, uint256, bytes) pure returns (bytes4)",
    "function supportsInterface(bytes4 interfaceId) view returns (bool)",
    "function withdraw(uint256[] tokenIds, uint256[] amounts)"
  ]

const TOKEN_ABI = [{"inputs":[{"internalType":"address","name":"treasure","type":"address"},{"internalType":"string[]","name":"names","type":"string[]"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"indexed":false,"internalType":"uint256[]","name":"values","type":"uint256[]"}],"name":"TransferBatch","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"TransferSingle","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"value","type":"string"},{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"}],"name":"URI","type":"event"},{"inputs":[],"name":"TREASURE","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"accounts","type":"address[]"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"}],"name":"balanceOfBatch","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bytes","name":"","type":"bytes"}],"name":"onERC721Received","outputs":[{"internalType":"bytes4","name":"","type":"bytes4"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeBatchTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"unravel","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"uri","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}]

const getDeposits = async() => {
    const provider = new JsonRpcProvider("http://10.0.0.45:8545");
    const farm = new ethers.Contract("0xe83c0200e93cb1496054e387bddae590c07f0194", ABI, provider); 
    const fromBlock = 13176610   
    const toBlock = 13356610
    const token = new ethers.Contract("0xd0ed73b33789111807bd64ae2a6e1e6f92f986f5", TOKEN_ABI, provider);
    const filter = token.filters.TransferSingle();
    const blockBatch = 100
    let currentFromBlock = fromBlock
    let currentToBlock = fromBlock + blockBatch
    while (currentToBlock < toBlock) {
        const events = await token.queryFilter(filter, currentFromBlock, currentToBlock);
        for (const e of events.filter(e => e.args?.to.toLowerCase() == farm.address
            || e.args?.from.toLowerCase() == farm.address)) {
            const res = `${e.blockNumber},${e.args?.from},${e.args?.to},${e.args?.id},${e.args?.value}\n`;
            fs.appendFileSync('results.csv', res)
        }
        currentFromBlock = currentToBlock
        currentToBlock = currentFromBlock + blockBatch
    }
}

getDeposits()