pragma solidity ^0.5.0;

import "../../base/Module.sol";
import "../../base/ModuleManager.sol";
import "./SimplePOSToken.sol";
import "../../external/ERC20/SafeMath.sol";

/// @title Simple Point of Sale Module - Allows to convert your customers into your investors.
/// @author Andrey Scherbovich - <andrey@gnosis.pm>
/// @author Vitaly Katz - <vitaly.katz@gnosis.pm>
contract SimplePOSModule is Module {
    using SafeMath for uint256;

    string public constant NAME = "Siple Point of Sale Module";
    string public constant VERSION = "0.1.0";

    uint public commonFund;
    SimplePOSToken public simplePOSToken;

    /// @dev Setup function sets initial storage of contract.
    /// @param _commonFund [0..100) percentage of common fund for customers.
    /// @param _tokenName name for POS token.
    /// @param _tokenSymbol symbol for POS token.
    function setup(uint256 _commonFund, string memory _tokenName, string memory _tokenSymbol)
        public
    {
        require(_commonFund < 100, "Invalid payback parameter");
        commonFund = _commonFund;
        simplePOSToken = new SimplePOSToken(_tokenName, _tokenSymbol);
        setManager();
    }

    /// @dev Fallback function for receiving transactions.
    function ()
        external
        payable
    {
        uint256 ownerPart = msg.value.mul(100 - commonFund).div(100);
        address(manager).transfer(ownerPart);

        // == MINTING STRATEGY ==
        // toMint = log2(2**(totalMinted / 1000) + newSpent) * 100 - totalMinted
        // totalMinted and newSpent in Finney

        // <TOTAL SPENT OF ETH> : <TOTAL MINTED OF TKN>
        // 0.001   ETH : 100   TKN
        // 0.1     ETH : 700   TKN
        // 1       ETH : 1000  TKN
        // 10      ETH : 1400  TKN
        // 100     ETH : 1700  TKN
        // 500     ETH : 1900  TKN
        // 1000    ETH : 2000  TKN

        uint256 newSpent = msg.value.div(10**15);
        uint256 totalMinted = simplePOSToken.totalSupply().div(10**15);
        uint256 toMint = log2((2**(totalMinted.div(1000))).add(newSpent)).mul(100).sub(totalMinted);
        simplePOSToken.mint(msg.sender, toMint.mul(10**18));
    }

    /// https://ethereum.stackexchange.com/questions/8086/logarithm-math-operation-in-solidity#30168
    function log2(uint256 x) internal pure returns (uint256 y) {
        assembly {
            let arg := x
            x := sub(x,1)
            x := or(x, div(x, 0x02))
            x := or(x, div(x, 0x04))
            x := or(x, div(x, 0x10))
            x := or(x, div(x, 0x100))
            x := or(x, div(x, 0x10000))
            x := or(x, div(x, 0x100000000))
            x := or(x, div(x, 0x10000000000000000))
            x := or(x, div(x, 0x100000000000000000000000000000000))
            x := add(x, 1)
            let m := mload(0x40)
            mstore(m,           0xf8f9cbfae6cc78fbefe7cdc3a1793dfcf4f0e8bbd8cec470b6a28a7a5a3e1efd)
            mstore(add(m,0x20), 0xf5ecf1b3e9debc68e1d9cfabc5997135bfb7a7a3938b7b606b5b4b3f2f1f0ffe)
            mstore(add(m,0x40), 0xf6e4ed9ff2d6b458eadcdf97bd91692de2d4da8fd2d0ac50c6ae9a8272523616)
            mstore(add(m,0x60), 0xc8c0b887b0a8a4489c948c7f847c6125746c645c544c444038302820181008ff)
            mstore(add(m,0x80), 0xf7cae577eec2a03cf3bad76fb589591debb2dd67e0aa9834bea6925f6a4a2e0e)
            mstore(add(m,0xa0), 0xe39ed557db96902cd38ed14fad815115c786af479b7e83247363534337271707)
            mstore(add(m,0xc0), 0xc976c13bb96e881cb166a933a55e490d9d56952b8d4e801485467d2362422606)
            mstore(add(m,0xe0), 0x753a6d1b65325d0c552a4d1345224105391a310b29122104190a110309020100)
            mstore(0x40, add(m, 0x100))
            let magic := 0x818283848586878898a8b8c8d8e8f929395969799a9b9d9e9faaeb6bedeeff
            let shift := 0x100000000000000000000000000000000000000000000000000000000000000
            let a := div(mul(x, magic), shift)
            y := div(mload(add(m,sub(255,a))), shift)
            y := add(y, mul(256, gt(arg, 0x8000000000000000000000000000000000000000000000000000000000000000)))
        }
    }

}
