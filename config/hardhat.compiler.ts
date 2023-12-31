export const hardhatCompilerConfig = {
    compilers: [
        {
            version: '0.7.1',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 9999
                }
            }
        }
    ],
    overrides: {
        'contracts/vault/Vault.sol': {
            version: "0.7.1",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200,
                },
            },
        },
        'contracts/ComposableCustomPoolFactory.sol': {
            version: '0.7.1',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200,
                },
            },
        },
        'contracts/ComposableCustomPool.sol': {
            version: '0.7.1',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200,
                },
            },
        },

        'contracts/MockComposableCustomPool.sol': {
            version: "0.7.1",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 10,
                },
            },
        },

    }
};
