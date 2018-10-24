const utils = require('./utils')
const safeUtils = require('./utilsPersonalSafe')
const solc = require('solc')
const abi = require('ethereumjs-abi');

const GnosisSafe = artifacts.require("./GnosisSafe.sol")
const ProxyFactory = artifacts.require("./ProxyFactory.sol")
const MockContract = artifacts.require('./MockContract.sol');
const MockToken = artifacts.require('./Token.sol');

contract('GnosisSafePersonalEdition', function(accounts) {

    let lw
    let executor = accounts[8]
    let gnosisSafeMasterCopy
    let proxyFactory

    const CALL = 0
    const CREATE = 2
    const method = "0x" + abi.methodID('transfer', ['address', 'uint256']).toString('hex');

    beforeEach(async function () {
        // Create lightwallet
        lw = await utils.createLightwallet()
        // Create Master Copies
        proxyFactory = await ProxyFactory.new()
        gnosisSafeMasterCopy = await GnosisSafe.new()
        gnosisSafeMasterCopy.setup([lw.accounts[0], lw.accounts[1], lw.accounts[2]], 3, 0, "0x")
    })

    testEstimate = async function (threshold) {
        // Create Gnosis Safe
        let gnosisSafeData = await gnosisSafeMasterCopy.contract.setup.getData([lw.accounts[0], lw.accounts[1], lw.accounts[2]], threshold, 0, "0x")
        gnosisSafe = utils.getParamFromTxEvent(
            await proxyFactory.createProxy(gnosisSafeMasterCopy.address, gnosisSafeData),
            'ProxyCreation', 'proxy', proxyFactory.address, GnosisSafe, 'create Gnosis Safe',
        )

        assert.equal(await web3.eth.getBalance(gnosisSafe.address), 0)

        let executorBalance = await web3.eth.getBalance(executor).toNumber()

        let data = await gnosisSafe.contract.removeOwner.getData(lw.accounts[1], lw.accounts[2], 1)
        await safeUtils.executeTransaction(lw, gnosisSafe, 'executeTransaction', [lw.accounts[0], lw.accounts[1], lw.accounts[2]], gnosisSafe.address, 0, data, CALL, executor, {
            estimated: async function(safe, to, value, data, operation, dataGasEstimate, txGasEstimate, txGasToken, gasPrice, refundReceiver) {
                let signatureGasEstimate = (5000 + Math.ceil((data.length - 2) / 64) * 100) + 5000 * threshold
                console.log("    Signature Gas Estimate: " + signatureGasEstimate)
                console.log("    Runtime Gas Estimate: " + (txGasEstimate + signatureGasEstimate))
                let requiredGas = dataGasEstimate + txGasEstimate + signatureGasEstimate
                console.log("    Required Gas Estimate: " + requiredGas)
                let requiredFunds = (requiredGas + 10000) * gasPrice
                console.log("    Required Funds Estimate: " + requiredFunds)
                await web3.eth.sendTransaction({from: accounts[0], to: safe.address, value: requiredFunds})
                assert.equal(await web3.eth.getBalance(safe.address).toNumber(), requiredFunds)
            }
        })

        console.log("    Leftover on safe", web3.fromWei(await web3.eth.getBalance(gnosisSafe.address).toNumber()), "ETH")
        let executorDiff = await web3.eth.getBalance(executor) - executorBalance
        console.log("    Executor earned " + web3.fromWei(executorDiff, 'ether') + " ETH")
        assert.ok(executorDiff > 0)

        assert.deepEqual(await gnosisSafe.getOwners(), [lw.accounts[0], lw.accounts[1]])
        assert.equal(await gnosisSafe.getThreshold(), 1)
    }

    it('fund with minimal amount for 1 required confirmation', async () => {
        await(testEstimate(1))
    });

    it('fund with minimal amount for 2 required confirmation', async () => {
        await(testEstimate(2))
    });

    it('fund with minimal amount for 3 required confirmation', async () => {
        await(testEstimate(3))
    });
})
