const utils = require('./utils/general')

const GnosisSafe = artifacts.require("./GnosisSafe.sol");
const CreateAndAddModules = artifacts.require("./libraries/CreateAndAddModules.sol");
const ProxyFactory = artifacts.require("./ProxyFactory.sol");
const SimplePOSModule = artifacts.require("./modules/SimplePOS/SimplePOSModule.sol");
const SimplePOSToken = artifacts.require("./modules/SimplePOS/SimplePOSToken.sol");

contract('SimplePOSModule', function(accounts) {

    let gnosisSafe
    let simplePOSModule
    let simplePOSToken
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
        simplePOSModuleMasterCopy.setup(0, "", "")

        let createAndAddModules = await CreateAndAddModules.new()
        let simplePOSModuleData = await simplePOSModuleMasterCopy.contract.setup.getData(10, "My Token Name", "MTN")
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

        simplePOSToken = SimplePOSToken.at(await simplePOSModule.simplePOSToken())
        assert.equal(await simplePOSToken.totalSupply(), 0)
    })

    it('should split incoming Eth into buckets', async () => {
        // Pay 1 eth        
        await web3.eth.sendTransaction({from: accounts[0], to: simplePOSModule.address, value: web3.toWei(1, 'ether')})
        // 90% goes to the Safe
        assert.equal(await web3.eth.getBalance(gnosisSafe.address).toNumber(), web3.toWei(0.9, 'ether'))
        // 10% goes to Module
        assert.equal(await web3.eth.getBalance(simplePOSModule.address).toNumber(), web3.toWei(0.1, 'ether'))
    })

    it('should mint new tokens on incoming Eth', async () => {
        let value = web3.toWei(0.001, 'ether')
        await web3.eth.sendTransaction({from: accounts[0], to: simplePOSModule.address, value: value})
        let minted = await simplePOSToken.totalSupply()
        console.log("    MINTED " + web3.fromWei(minted, 'ether') + " MTN from " + web3.fromWei(value, "ether") + " ETH")
    })

    it('should mint new tokens on incoming Eth 2', async () => {
        let value = web3.toWei(0.1, 'ether')
        await web3.eth.sendTransaction({from: accounts[0], to: simplePOSModule.address, value: value})
        let minted = await simplePOSToken.totalSupply()
        console.log("    MINTED " + web3.fromWei(minted, 'ether') + " MTN from " + web3.fromWei(value, "ether") + " ETH")
    })

    it('should mint new tokens on incoming Eth 3', async () => {
        let value = web3.toWei(1, 'ether')
        await web3.eth.sendTransaction({from: accounts[0], to: simplePOSModule.address, value: value})
        let minted = await simplePOSToken.totalSupply()
        console.log("    MINTED " + web3.fromWei(minted, 'ether') + " MTN from " + web3.fromWei(value, "ether") + " ETH")
    })

    it('should mint new tokens on incoming Eth 4', async () => {
        let value = web3.toWei(10, 'ether')
        await web3.eth.sendTransaction({from: accounts[0], to: simplePOSModule.address, value: value})
        let minted = await simplePOSToken.totalSupply()
        console.log("    MINTED " + web3.fromWei(minted, 'ether') + " MTN from " + web3.fromWei(value, "ether") + " ETH")
    })

    it('should mint new tokens on incoming Eth 5', async () => {
        let value = web3.toWei(100, 'ether')
        await web3.eth.sendTransaction({from: accounts[0], to: simplePOSModule.address, value: value})
        let minted = await simplePOSToken.totalSupply()
        console.log("    MINTED " + web3.fromWei(minted, 'ether') + " MTN from " + web3.fromWei(value, "ether") + " ETH")
    })

    it('should mint new tokens on incoming Eth 6', async () => {
        let value = web3.toWei(500, 'ether')
        await web3.eth.sendTransaction({from: accounts[0], to: simplePOSModule.address, value: value})
        let minted = await simplePOSToken.totalSupply()
        console.log("    MINTED " + web3.fromWei(minted, 'ether') + " MTN from " + web3.fromWei(value, "ether") + " ETH")
    })

    it('should mint new tokens on incoming Eth 7', async () => {
        let value = web3.toWei(1000, 'ether')
        await web3.eth.sendTransaction({from: accounts[0], to: simplePOSModule.address, value: value})
        let minted = await simplePOSToken.totalSupply()
        console.log("    MINTED " + web3.fromWei(minted, 'ether') + " MTN from " + web3.fromWei(value, "ether") + " ETH")
    })

});
