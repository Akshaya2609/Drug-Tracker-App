// Initialize Web3 with a provider (using MetaMask for example)
const web3 = new Web3(Web3.givenProvider || "http://localhost:7545"); // Assuming Ganache or similar network

// DOM Elements
const mineBtn = document.getElementById('mineBtn');
const createTransactionBtn = document.getElementById('createTransactionBtn');
const getChainBtn = document.getElementById('getChainBtn');
const mineResponse = document.getElementById('mineResponse');
const transactionResponse = document.getElementById('transactionResponse');
const chainResponse = document.getElementById('chainResponse');

// Load Contract ABI from static folder
async function loadContract() {
    try {
        const contractABI = await fetch("/static/contractABI.json")
            .then(response => response.json()); // Parse the JSON response

        // Set the contract address (replace with your deployed contract address)
        const contractAddress = "0xAF039D5E92F8ee2272207a3a3E51987140E6F935"; // Replace with your actual contract address
        const contract = new web3.eth.Contract(contractABI, contractAddress);

        // Initialize contract interaction after loading
        initializeContractInteraction(contract);
    } catch (error) {
        console.error("Error loading contract ABI:", error);
    }
}

// Function to handle contract interaction, adding event listeners for buttons
function initializeContractInteraction(contract) {
    // Handle creating a new transaction
    createTransactionBtn.addEventListener('click', () => createTransaction(contract));

    // Handle mining a new block
    mineBtn.addEventListener('click', () => mineBlock(contract));

    // Handle getting the full blockchain
    getChainBtn.addEventListener('click', () => getBlockchain(contract));
}

// Handle creating a new transaction
async function createTransaction(contract) {
    const recipientName = document.getElementById('recipient').value.trim();
    const drugName = document.getElementById('drug_name').value.trim();

    if (!recipientName || !drugName) {
        alert('Please provide both recipient name and drug name');
        return;
    }

    const accounts = await web3.eth.getAccounts();
    if (!accounts.length) {
        transactionResponse.innerHTML = "No accounts found. Please connect MetaMask.";
        return;
    }

    try {
        // Fetch recipient address from contract
        const recipientAddress = await contract.methods.recipientAddresses(recipientName).call();

        if (recipientAddress === '0x0000000000000000000000000000000000000000') {
            alert('No recipient found for this name');
            return;
        }

        // Create a new transaction on the contract
        await contract.methods.createTransaction(recipientName, drugName).send({ from: accounts[0] });

        transactionResponse.innerHTML = `Transaction created: Sender: ${accounts[0]}, Recipient: ${recipientAddress}, Drug: ${drugName}`;
        localStorage.setItem('transactionResult', JSON.stringify({ sender: accounts[0], recipient: recipientAddress, drugName }));

    } catch (error) {
        console.error("Error creating transaction:", error);
        transactionResponse.innerHTML = `Error: ${error.message}`;
    }
}

// Handle mining a new block
async function mineBlock(contract) {
    if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    const accounts = await web3.eth.getAccounts();
    if (!accounts.length) {
        mineResponse.innerHTML = "No accounts found. Please connect MetaMask.";
        return;
    }

    try {
        const proof = 12345; // Placeholder proof, replace with actual logic if necessary

        // Call the contract to mine a block
        const result = await contract.methods.mineBlock(proof).send({ from: accounts[0] });

        // Save the block details locally
        localStorage.setItem('blockResult', JSON.stringify(result));
        mineResponse.innerHTML = `Block mined successfully!`;

    } catch (error) {
        console.error("Error mining block:", error);
        mineResponse.innerHTML = `Error: ${error.message}`;
    }
}

// Handle getting the full blockchain

async function getBlockchain(contract) {
    contract.methods.getBlockchain().call()
        .then((data) => {
            chainResponse.innerHTML = `Blockchain: ${JSON.stringify(data, null, 4)}`;
        })
        .catch((error) => {
            console.error("Error fetching blockchain:", error);
            chainResponse.innerHTML = `Error: ${error.message}`;
        });
}

// Load the contract and start interactions
loadContract();
