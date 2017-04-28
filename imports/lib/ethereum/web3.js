// import {setProvider} from './connection.js'
import Web3 from 'web3';

web3 = new Web3(new Web3.providers.HttpProvider('http://paratii-chain.gerbrandy.com'));
// web3 = new Web3(new Web3.providers.HttpProvider('http://localhost8545'));
// web3 = new Web3()
export default web3;
