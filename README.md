# Face-to-Chain AI Swarm

Face-to-Chain is an advanced pipeline that utilizes an AI Swarm architecture to process facial images, perform OSINT analysis, and securely store the resulting verified identity hashes on the Ethereum Sepolia blockchain.

## Project Architecture

The project is divided into two main components:
1. **Frontend (Next.js)**: A sleek, interactive UI that allows users to upload images and visualize the real-time processing of the AI Swarm.
2. **Backend (Python FastAPI)**: A high-performance API server that orchestrates the AI Swarm nodes and handles the complex logic of image processing, OSINT search, and blockchain interaction.

## AI Swarm Breakdown

The backend utilizes an orchestrator node that delegates tasks to specialized sub-nodes:
- **Orchestrator Node (`orchestrator_node.py`)**: The central hub that routes data between the Vision, OSINT, and Storage nodes.
- **Vision Node (`vision_node.py`)**: Dedicated to handling the facial recognition pipeline, verifying that a face is present in the uploaded image.
- **OSINT Node (`osint_node.py`)**: Takes the raw image, uploads it to ImgBB for hosting, and uses SerpApi (Google Lens) to find the most accurate visual matches across the web.
- **Storage Node (`storage_node.py`)**: Packs the metadata (match title, URL, timestamp) into a SHA-256 hash and securely stores it on the Sepolia blockchain using Web3.

## Web Animation Stack

The frontend is built with a powerful animation stack to provide a smooth, engaging user experience:
- **[Framer Motion](https://www.framer.com/motion/)**: Used for declarative animations and layout transitions.
- **[GSAP](https://gsap.com/)**: Leveraged for complex, high-performance timeline animations.
- **[Lenis](https://lenis.studiofreight.com/)**: Provides smooth, modern scrolling capabilities.
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework for rapid styling.

## Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- MetaMask (or another Web3 wallet) configured for the Sepolia Testnet.

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd face-to-chain
```

### 2. Frontend Setup
```bash
npm install
npm run dev
```
The frontend will be available at `http://localhost:3000`.

### 3. Backend Setup
Open a new terminal and navigate to the backend directory:
```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory with the following keys:
```env
SERPAPI_KEY=your_serpapi_key
WEB3_PROVIDER_URI=your_alchemy_or_infura_sepolia_url
PRIVATE_KEY=your_wallet_private_key
IMGBB_KEY=your_imgbb_key
CONTRACT_ADDRESS=0xecBfb6079DB27D1308B29771c8862C842f084dD9
```

Run the backend server:
```bash
python main.py
```
The API will be available at `http://localhost:8000`.

## Sepolia Contract Address

The identity verification smart contract is deployed on the Ethereum Sepolia Testnet at the following address:
**`0xecBfb6079DB27D1308B29771c8862C842f084dD9`**

You can view the stored transactions on a Sepolia block explorer.
