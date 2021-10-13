import { JsonRpcProvider } from "@ethersproject/providers";
import { ethers } from "ethers";
import fs from "fs";
import readline from 'readline';

const ABI = [{"inputs":[{"internalType":"contract IERC20","name":"_stakedToken","type":"address"},{"internalType":"uint256","name":"_unlockTime","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timeStamp","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"timeStamp","type":"uint256"}],"name":"TimelockEnd","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"_timeLock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_timeStamp","type":"uint256"}],"name":"alterTimelock","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"depositBalances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"forWhom","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"stakeFor","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"stakedToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unlockTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}]

const getBalances = async() => {
    const provider = new JsonRpcProvider("http://10.0.0.45:8545");
    const farm = new ethers.Contract("0x07EdbD02923435Fe2C141F390510178C79DBbc46", ABI, provider); 
    const block = 13362103
    const fileStream = fs.createReadStream('accounts.txt');
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    for await (const line of rl) {
        const balance = ethers.utils.formatEther(await farm.balanceOf(line, {blockTag: block}));
        fs.appendFileSync('results_2.csv', `${line},${balance}\n`);
    }
}

const getDeposits = async() => {
    const provider = new JsonRpcProvider("http://10.0.0.45:8545");
    const farm = new ethers.Contract("0x07EdbD02923435Fe2C141F390510178C79DBbc46", ABI, provider); 
    const fromBlock = 13266072   
    const toBlock = 13362103
    const filter = farm.filters.Staked();
    const blockBatch = 100
    let currentFromBlock = fromBlock
    let currentToBlock = fromBlock + blockBatch
    const addresses : string[] = []
    while (currentToBlock < toBlock) {
        const events = await farm.queryFilter(filter, currentFromBlock, currentToBlock);
        for (const e of events) {
            if (addresses.indexOf(e.args?.user) == -1) {
                addresses.push(e.args?.user)
                fs.appendFileSync('addresses.txt', `${e.args?.user}\n`);
            }
        }
        currentFromBlock = currentToBlock
        currentToBlock = currentFromBlock + blockBatch
    }
    console.log(addresses.length);
}

getBalances()
getDeposits()