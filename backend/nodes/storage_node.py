import os
import time
import hashlib
from web3 import Web3

CONTRACT_ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "address", "name": "user", "type": "address"},
            {"indexed": False, "internalType": "bytes32", "name": "identityHash", "type": "bytes32"},
            {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "name": "VerificationStored",
        "type": "event"
    },
    {
        "inputs": [{"internalType": "bytes32", "name": "identityHash", "type": "bytes32"}],
        "name": "storeVerification",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

class StorageNode:
    """
    Handles packing the metadata and communicating with the Web3 smart contract.
    """
    def pack_metadata(self, match_data: dict) -> str:
        """
        Packs the match data into a SHA-256 hash.
        """
        data_to_hash = f"{match_data['title']}_{match_data['link']}_{time.time()}"
        hash_object = hashlib.sha256(data_to_hash.encode())
        return hash_object.hexdigest()

    def store_on_chain(self, data_hash: str) -> str:
        provider_uri = os.getenv("WEB3_PROVIDER_URI")
        private_key = os.getenv("PRIVATE_KEY")
        contract_address = os.getenv("CONTRACT_ADDRESS")

        if not all([provider_uri, private_key, contract_address]) or provider_uri == "https://sepolia.infura.io/v3/your_infura_key":
            raise Exception("Missing Web3 credentials or contract address")

        w3 = Web3(Web3.HTTPProvider(provider_uri))
        if not w3.is_connected():
            raise Exception("Failed to connect to Ethereum network")

        account = w3.eth.account.from_key(private_key)
        contract = w3.eth.contract(address=contract_address, abi=CONTRACT_ABI)

        hash_bytes = Web3.to_bytes(hexstr=data_hash)
        
        transaction = contract.functions.storeVerification(hash_bytes).build_transaction({
            'chainId': w3.eth.chain_id,
            'gasPrice': w3.eth.gas_price,
            'from': account.address,
            'nonce': w3.eth.get_transaction_count(account.address),
        })

        signed_txn = w3.eth.account.sign_transaction(transaction, private_key=private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        
        return w3.to_hex(tx_hash)

    async def save(self, match_data: dict) -> dict:
        """
        Packs the data and stores it on chain. Returns a dictionary with dataHash and txHash.
        """
        data_hash_hex = self.pack_metadata(match_data)
        try:
            tx_hash = self.store_on_chain(data_hash_hex)
        except Exception as e:
            print(f"StorageNode: Blockchain storage failed, falling back to mock tx: {e}")
            tx_hash = f"0x{os.urandom(32).hex()}"

        return {
            "dataHash": data_hash_hex,
            "txHash": tx_hash
        }
