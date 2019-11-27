pragma solidity ^0.5.0;

import "../../external/ERC20/Context.sol";
import "../../external/ERC20/ERC20Mintable.sol";
import "../../external/ERC20/ERC20Detailed.sol";

/**
 * @title SimplePOSToken
 * @dev TODO.
 */
contract SimplePOSToken is Context, ERC20Mintable, ERC20Detailed {

    /**
     * @dev Constructor that initiates name and symbol for SimplePOSToken.
     */
    constructor (string memory name, string memory symbol) ERC20Detailed(name, symbol, 18) public {}

}
