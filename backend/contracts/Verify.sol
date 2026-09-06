// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Verify {
    event VerificationStored(address indexed user, bytes32 identityHash, uint256 timestamp);

    function storeVerification(bytes32 identityHash) public {
        emit VerificationStored(msg.sender, identityHash, block.timestamp);
    }
}
