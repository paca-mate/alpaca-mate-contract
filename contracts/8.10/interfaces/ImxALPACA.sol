// SPDX-License-Identifier: MIT


pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ImxALPACA is IERC20 {
    /// @dev mint _amount mxALPACA to _to
    function mint(address _to, uint256 _amount) external;

    /// @dev mint _amount mxALPACA from _from
    function burn(address _from, uint256 _amount) external;
}
