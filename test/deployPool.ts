import {ethers} from "hardhat";

import {PoolDeployer} from "../scripts/helpers/PoolDeployer";
import {TokenDeployer} from "../scripts/helpers/TokenDeployer";
import {VaultDeployer} from "../scripts/helpers/VaultDeployer";
import {PoolWrapper} from "../scripts/helpers/PoolWrapper";
import {scaleUp} from "../scripts/helpers/biggy";
import {Contract, Signer} from "ethers";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

function line(msg: string) {
    console.log("---", msg, "---------------------------------");
}

async function main() {

    const [admin, lp, trader] = await ethers.getSigners();
    console.log("admin:", admin.address, "eth: ", (await admin.getBalance()).toString());
    console.log("LP   :", lp.address, "eth: ", (await lp.getBalance()).toString());
    // console.log("tradr:", trader.address, "eth: ", (await trader.getBalance()).toString());

    let customMath: Contract;
    {
        const factory = await ethers.getContractFactory("CustomMath");
        const contract = await factory.deploy();
        customMath = await contract.deployed();
    }

    line("TOKEN begin");

    const td = new TokenDeployer();

    const weth = await td.deployWETH();

    const xcqr = await td.deployToken("XCHR Test Token", "XCHR", 18);
    await xcqr.mint(admin.address, scaleUp(3_000_000, await xcqr.decimals()));
    await xcqr.transfer(lp.address, scaleUp(1_000_000, await xcqr.decimals()));

    const usdc = await td.deployToken("USDC Test Token", "USDC", 6);
    await usdc.mint(admin.address, scaleUp(3_000_000, await usdc.decimals()));
    await usdc.transfer(lp.address, scaleUp(1_000_000, await usdc.decimals()));

    await td.printTokens([xcqr.address, usdc.address], admin.address);
    await td.printTokens([xcqr.address, usdc.address], lp.address);

    line("TOKENS end");

    line("POOL begin");

    const vd = new VaultDeployer();

    const vault = await vd.deployVault(admin.address, weth.address);

    const pd = new PoolDeployer(customMath.address);

    const pool = await pd.deployPool(vault.address, [xcqr.address, usdc.address], admin.address);

    const pw = await new PoolWrapper(customMath.address).connect(pool.address);

    const poolId = await pool.getPoolId();

    const tokens = await vd.getTokens(vault.address, poolId);

    {
        //console.log("PERMISSIONS BEGIN");
        //await vd.grantPermission(vault.address, 'joinPool', lp.address);
        //await vd.grantPermission(vault.address, 'exitPool', lp.address);
        //console.log("PERMISSIONS END");
    }

    line("POOL end");

    {
        // await vd.printTokens(vault.address, poolId);
        // await td.printTokens(tokens, admin.address);
        // await td.printTokens(tokens, lp.address);
        // await pi.printRates(pool.address);

        if (true) {
            line("INIT begin");
            await pw.init(tokens, admin);
            await vd.printTokens(vault.address, poolId);
            //await td.printTokens(tokens, admin.address);
            await td.printTokens(tokens, admin.address);
            line("INIT end");
        }
        if (true) {
            line("JOINT EXACT TKN begin");
            await pw.joinExactTokensIn(tokens, lp);
            await vd.printTokens(vault.address, poolId);
            //await td.printTokens(tokens, admin.address);
            await td.printTokens(tokens, lp.address);
            line("JOIN EXACT TKN end");
        }
        if (true) {
            line("EXIT EXACT TKN begin");
            await pw.exitExactTokensOut(tokens, lp);
            await vd.printTokens(vault.address, poolId);
            //await td.printTokens(tokens, admin.address);
            await td.printTokens(tokens, lp.address);
            line("EXIT EXACT TKN end");
        }
        if (true) {
            line("JOIN EXACT BPT begin");
            await pw.joinExactBPTOut(tokens, lp);
            await vd.printTokens(vault.address, poolId);
            //await td.printTokens(tokens, admin.address);
            await td.printTokens(tokens, lp.address);
            line("JOIN EXACT BPT end");
        }
        if (true) {
            line("EXIT EXACT BPT begin");
            await pw.exitExactBPTIn(tokens, lp);
            await vd.printTokens(vault.address, poolId);
            //await td.printTokens(tokens, admin.address);
            await td.printTokens(tokens, lp.address);
            line("EXIT EXACT BPT end");
        }

    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
