import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure timelock verification contract initializes correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const block = chain.mineBlock([
            Tx.contractCall('timelock-verification', 'get-platform-statistics', [], deployer.address)
        ]);

        // Initial test to verify platform statistics initialization
        assertEquals(block.height, 2);
        block.receipts[0].result.expectOk().expectTuple({
            'total-auditors': types.uint(0),
            'total-certifications': types.uint(0),
            'total-certified-contracts': types.uint(0)
        });
    }
});

Clarinet.test({
    name: "Test auditor application process",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const auditor = accounts.get('wallet_1')!;
        const block = chain.mineBlock([
            Tx.contractCall('timelock-verification', 'apply-as-auditor', 
                [
                    types.ascii('Jane Doe'),
                    types.ascii('SecureAudit Inc.'),
                    types.ascii('https://secureaudit.com'),
                    types.ascii('Timelock Security Expert')
                ], 
                auditor.address)
        ]);

        // Verify application submission
        block.receipts[0].result.expectOk().expectBool(true);
    }
});