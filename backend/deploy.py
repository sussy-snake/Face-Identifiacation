import os
from web3 import Web3
from solcx import compile_source, install_solc, get_installed_solc_versions
from dotenv import load_dotenv

load_dotenv()

# Install solc if not installed
if '0.8.0' not in get_installed_solc_versions():
    install_solc('0.8.0')

def deploy_contract():
    provider_uri = os.getenv("WEB3_PROVIDER_URI")
    private_key = os.getenv("PRIVATE_KEY")

    if not provider_uri or not private_key:
        print("Please set WEB3_PROVIDER_URI and PRIVATE_KEY in your .env file")
        return

    w3 = Web3(Web3.HTTPProvider(provider_uri))
    if not w3.is_connected():
        print("Failed to connect to the Ethereum network.")
        return

    account = w3.eth.account.from_key(private_key)
    w3.eth.default_account = account.address
    
    with open('contracts/Verify.sol', 'r') as file:
        contract_source = file.read()

    compiled_sol = compile_source(contract_source, solc_version='0.8.0')
    contract_id, contract_interface = compiled_sol.popitem()

    bytecode = contract_interface['bin']
    abi = contract_interface['abi']

    VerifyContract = w3.eth.contract(abi=abi, bytecode=bytecode)

    print("Deploying contract...")
    transaction = VerifyContract.constructor().build_transaction({
        'chainId': w3.eth.chain_id,
        'gasPrice': w3.eth.gas_price,
        'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address),
    })

    signed_txn = w3.eth.account.sign_transaction(transaction, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    print(f"Transaction hash: {w3.to_hex(tx_hash)}")
    
    print("Waiting for transaction receipt...")
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    print(f"Contract deployed at address: {tx_receipt.contractAddress}")
    print("Please add this to your .env file as CONTRACT_ADDRESS.")

if __name__ == "__main__":
    deploy_contract()
