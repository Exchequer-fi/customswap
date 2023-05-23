import {ethers} from "hardhat";
import {scaleDn, scaleUp} from "./biggy";
import {BigNumber, Signer} from "ethers";

export class TokenDeployer {

    public async deployToken(desc: string, symbol: string, decimal: number) {
        const factory = await ethers.getContractFactory("TestToken");
        const contract = await factory.deploy(desc, symbol, decimal);
        return contract.deployed();
    }

    public async attachToken(address: string) {
        const factory = await ethers.getContractFactory("TestToken");
        const token = await factory.attach(address);
        return token.deployed();
    }

    public async deployWETH() {
        const factory = await ethers.getContractFactory("TestWETH");
        const contract = await factory.deploy();
        return contract.deployed();
    }

    public async printTokens(tokens: string[], address: string) {
        console.log("ACCNT TOKENS:", address);
        for (let i = 0; i < tokens.length; i++) {
            const t = await this.attachToken(tokens[i]);
            const s = await t.symbol();
            const b = await t.balanceOf(address);
            const d = await t.decimals();
            console.log(s, scaleDn(b, d));
        }
    }

    public async approveTransfer(token: string, signer: Signer, to: string, amount: BigNumber) {
        let t = await this.attachToken(token);
        (await t.connect(signer).approve(to, amount)).wait();
        //const scale = scaleUp(1, await t.decimals());
        //let b = (await t.balanceOf(signer.getAddress())).div(scale);
        //let a = (await t.allowance(signer.getAddress(), to)).div(scale);
        //let sym = await t.symbol();
        // console.log(sym, "bal:", b.toNumber(), "allow:", a.toNumber());
    }

}