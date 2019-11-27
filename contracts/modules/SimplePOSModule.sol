pragma solidity ^0.5.0;
import "../base/Module.sol";
import "../base/ModuleManager.sol";

/// @title Simple Point of Sale Module - Allows to convert your customers into your investors.
/// @author Andrey Scherbovich - <andrey@gnosis.pm>
/// @author Vitaly Katz - <vitaly.katz@gnosis.pm>
contract SimplePOSModule is Module {

    string public constant NAME = "Siple Point of Sale Module";
    string public constant VERSION = "0.1.0";

    /// @dev Setup function sets initial storage of contract.
    /// @param _commonFund [0..1) percentage of common fund for customers.
    function setup(uint256 _commonFund)
        public
    {
        require(_commonFund < 1, "Invalid payback parameter");
        setManager();
    }
}
