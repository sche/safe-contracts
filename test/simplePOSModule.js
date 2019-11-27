const utils = require('./utils/general')

const GnosisSafe = artifacts.require("./GnosisSafe.sol");
const CreateAndAddModules = artifacts.require("./libraries/CreateAndAddModules.sol");
const ProxyFactory = artifacts.require("./ProxyFactory.sol");
const SimplePOSModule = artifacts.require("./modules/SimplePOSModule.sol");

contract('SimplePOSModule', function(accounts) {

    let gnosisSafe
    let simplePOSModule
    let lw

    const CALL = 0
    const DELEGATE = 1

    beforeEach(async function () {
        // Create lightwallet
        lw = await utils.createLightwallet()
        // Create Master Copies
        let proxyFactory = await ProxyFactory.new()
        let gnosisSafeMasterCopy = await utils.deployContract("deploying Gnosis Safe Mastercopy", GnosisSafe)
        // Initialize safe master copy
        gnosisSafeMasterCopy.setup([accounts[0]], 1, 0, "0x", 0, 0, 0)
        // Create Gnosis Safe
        let gnosisSafeData = await gnosisSafeMasterCopy.contract.setup.getData([lw.accounts[0], lw.accounts[1], accounts[0]], 2, 0, "0x", 0, 0, 0)
        gnosisSafe = utils.getParamFromTxEvent(
            await proxyFactory.createProxy(gnosisSafeMasterCopy.address, gnosisSafeData),
            'ProxyCreation', 'proxy', proxyFactory.address, GnosisSafe, 'create Gnosis Safe Proxy',
        )

        // Create SimplePOS module
        let simplePOSModuleMasterCopy = await SimplePOSModule.new()
        simplePOSModuleMasterCopy.setup(0)

        let createAndAddModules = await CreateAndAddModules.new()
        let simplePOSModuleData = await simplePOSModuleMasterCopy.contract.setup.getData(0.1)
        let simplePOSProxyFactoryData = await proxyFactory.contract.createProxy.getData(simplePOSModuleMasterCopy.address, simplePOSModuleData)

        let modulesCreationData = utils.createAndAddModulesData([simplePOSProxyFactoryData])
        let createAndAddModulesData = createAndAddModules.contract.createAndAddModules.getData(proxyFactory.address, modulesCreationData)

        let nonce = await gnosisSafe.nonce()
        let transactionHash = await gnosisSafe.getTransactionHash(createAndAddModules.address, 0, createAndAddModulesData, DELEGATE, 0, 0, 0, 0, 0, nonce)
        let sig = utils.signTransaction(lw, [lw.accounts[0], lw.accounts[1]], transactionHash)
        utils.logGasUsage(
            'execTransaction enable SimplePOS module',
            await gnosisSafe.execTransaction(createAndAddModules.address, 0, createAndAddModulesData, DELEGATE, 0, 0, 0, 0, 0, sig)
        )

        let modules = await gnosisSafe.getModules()
        simplePOSModule = SimplePOSModule.at(modules[0])
        assert.equal(await simplePOSModule.manager.call(), gnosisSafe.address)
    })

    it('should do nothing', async () => {

    })
});
