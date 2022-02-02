// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
/// @title mxALPACA
/// @notice mxALPACA is the token entitled to GrassMaxi locker.
contract mxALPACA is ERC20, Ownable {

    mapping(address => bool) public okOperators;

    event LogSetOKOperator(address operator, bool ok);

    constructor() ERC20("Alpaca Mate xALPACA", "mxALPACA") {}

    function setOKOperator(address _operator, bool ok) external onlyOwner {
        okOperators[_operator] = ok;
        emit LogSetOKOperator(_operator, ok);
    }

    function mint(address _to, uint256 _amount) external {
        require(okOperators[msg.sender], "!authorized");

        _mint(_to, _amount);
    }

    function burn(address _from, uint256 _amount) external {
        require(okOperators[msg.sender], "!authorized");

        _burn(_from, _amount);
    }
}