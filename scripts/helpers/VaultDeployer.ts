import {ethers} from "hardhat";
import {TokenDeployer} from "./TokenDeployer";
import {scaleDn} from "./biggy";

import {Vault} from "../../typechain-types/vault/Vault";

export class VaultDeployer {

    public static readonly SECOND = 1;
    public static readonly MINUTE = this.SECOND * 60;
    public static readonly HOUR = this.MINUTE * 60;
    public static readonly DAY = this.HOUR * 24;
    public static readonly MONTH = this.DAY * 30;
    public static readonly ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    public static readonly ANY_ADDRESS = '0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF';

    private readonly pauseWindowDuration = 3 * VaultDeployer.MONTH;
    private readonly bufferPeriodDuration = VaultDeployer.MONTH;

    private vault: Vault | undefined;

    private async deployAuthorizer(from: string) {
        const factory = await ethers.getContractFactory("TimelockAuthorizer");
        return factory.deploy(from, VaultDeployer.ZERO_ADDRESS, VaultDeployer.MONTH);
    }

    public async attachAuthorizer(address: string) {
        const factory = await ethers.getContractFactory("TimelockAuthorizer");
        return factory.attach(address);
    }

    public async attachVault(address: string) {
        const factory = await ethers.getContractFactory("Vault");
        return factory.attach(address);
    }

    public async deployVault(admin: string, wethAddress: string) {
        const authorizer = await this.deployAuthorizer(admin);
        const factory = await ethers.getContractFactory("Vault");
        this.vault = await factory.deploy(
            authorizer.address,
            wethAddress,
            this.pauseWindowDuration,
            this.bufferPeriodDuration
        );
        return this;
    }

    public async getAddress() {
        const vault = this.vault!;
        return await vault.address;
    }

    public async getTokens(poolId: string) {
        const vault = this.vault!;
        const {tokens: tokens} = await vault.getPoolTokens(poolId);
        return tokens;
    }

    public async printTokens(vaultAddress: string, poolId: string) {
        console.log("VAULT TOKENS:", poolId);
        const vault = await this.attachVault(vaultAddress);
        const pd = new TokenDeployer();
        const {tokens: tokens, balances,} = await vault.getPoolTokens(poolId);
        for (let i = 0; i < tokens.length; i++) {
            const t = await pd.attachToken(tokens[i]);
            const s = await t.symbol();
            const d = await t.decimals();
            console.log(s, scaleDn(balances[i], d));
        }
    }

    public async grantPermission(vaultAddress: string, action: string, actorAddress: string) {
        const vault = await this.attachVault(vaultAddress);
        const selector = vault.interface.getSighash(action);
        const actionId = await vault.getActionId(selector);
        const authorizer = await new VaultDeployer().attachAuthorizer(await vault.getAuthorizer());
        await authorizer.grantPermissions([actionId], actorAddress, [VaultDeployer.ANY_ADDRESS]);
    }

}