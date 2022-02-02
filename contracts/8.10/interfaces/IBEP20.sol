// SPDX-License-Identifier: MIT


pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IBEP20 is IERC20 {
  /// @dev Return token's name
  function name() external returns (string memory);

  /// @dev Return token's symbol
  function symbol() external returns (string memory);

  /// @dev Return token's decimals
  function decimals() external returns (uint8);
}
