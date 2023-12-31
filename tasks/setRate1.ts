import {config as dotEnvConfig} from "dotenv";

dotEnvConfig();

const API_KEY: string = process.env.GOERLI_API_KEY!;
const PRIVATE_KEY: string = process.env.GOERLI_PRIVATE_KEY!;
const CONTRACT_ADDRESS: string = '0x5C19e84230344518dFB1F38e6D8002F77E730C9d';

const contract = require("../../../Projects/boot/xcqr-customswap/artifacts/contracts/rate-provider/XCQRRateProvider.sol/XCQRRateProvider.json");
const hre = require("hardhat");

// Provider
const alchemyProvider = new hre.ethers.providers.AlchemyProvider("goerli", API_KEY);

// Signer
const signer = new hre.ethers.Wallet(PRIVATE_KEY, alchemyProvider);

// Contract
const rp = new hre.ethers.Contract(CONTRACT_ADDRESS, contract.abi, signer);

async function setRate1() {

    const decimals = hre.ethers.BigNumber.from(10).pow(18);

    let r = await rp.getRate();
    console.log("the current rate is " + r.div(decimals));

    console.log("updating the rate");
    let newRate;
    if (r.eq(decimals)) {
        newRate = hre.ethers.BigNumber.from(10).mul(decimals);
    } else {
        newRate = hre.ethers.BigNumber.from(1).mul(decimals);
    }
    const estimatedGas = await rp.estimateGas.setRate(newRate);
    console.log("estimatedGas " + estimatedGas);

    const tx = await rp.setRate(newRate);
    await tx.wait();

    r = await rp.getRate();
    console.log("the new rate is " + r.div(decimals));

}

setRate1()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
