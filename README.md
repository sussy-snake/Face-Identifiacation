# 🌐 Face-to-Chain: Identity Verification Pipeline

An end-to-end pipeline that takes a face scan as input, genuinely searches the web for matching social media identities using reverse-image search, verifies the biometric match, and anchors the discovered data to the Ethereum blockchain for tamper-evident verification.

Built for the **HH Goa 2026 Shortlisting Task 3**.

---

## 🚀 What the Project Does

This pipeline completely fulfills the "Face scan -> Web search -> Blockchain verification" requirement:
1. **Face Identification:** Detects and encodes an input face using OpenCV Haar Cascades and ORB Feature Extraction (optimized to run entirely in lightweight cloud environments without heavy TensorFlow dependencies).
2. **Web & Social Media Search:** Performs a **genuine, live reverse-image search** using Google Lens (via SerpApi) to discover matching social media posts and identities across the web. **No hardcoded results.**
3. **Blockchain Anchoring:** Once an identity is algorithmically verified via a Hybrid OSINT-Visual Consensus Matrix, the subject's identity metadata is cryptographically hashed and minted directly to the **Ethereum Sepolia Testnet** using Web3.py.

We went above and beyond the requirements by wrapping this powerful Python pipeline in a stunning, cinematic Next.js frontend hosted on Cloudflare Pages, with the backend served via Render.

---

## 🛠️ How to Run It

### Prerequisites
* Python 3.10+
* Node.js 18+
* API Keys required: `SERPAPI_KEY` (Google Lens), `IMGBB_KEY` (Temporary image hosting for search), `ALCHEMY_SEPOLIA_ENDPOINT` (Blockchain RPC), `METAMASK_PRIVATE_KEY` (Wallet for gas fees).

### 1. Run the FastAPI Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
# Create a .env file with your API keys here
uvicorn main:app --reload
```

### 2. Run the Next.js Frontend
```bash
cd face-to-chain
npm install
# Set NEXT_PUBLIC_API_URL=http://localhost:8000 in your .env.local
npm run dev
```

---

## 🔗 Which Blockchain We Used

We used the **Ethereum Sepolia Testnet**. 
The backend utilizes `web3.py` to communicate with the Sepolia network via an Alchemy RPC endpoint. When a match is verified, a SHA-256 hash of the extracted identity data is sent as a transaction payload to the Sepolia chain. The resulting `TX_HASH` is displayed on the frontend, allowing judges to click it and view the immutable, tamper-evident record directly on **Sepolia Etherscan**.

---

## ⚠️ Known Limitations

* **Hardware/Memory Constraints:** Because standard deep-learning models (like `DeepFace` / `TensorFlow`) require 1GB+ of RAM, they crash on free-tier Render instances (512MB RAM). We engineered around this by building a custom **Hybrid OSINT-Visual Consensus Matrix**. It uses extremely lightweight OpenCV ORB mathematics and text-metadata consensus to verify identities. While incredibly efficient, it relies heavily on OSINT consensus, meaning heavily obscured faces or individuals with zero internet presence may be rejected or heavily penalized by the matrix.
* **Thumbnail Resolutions:** Google Lens occasionally returns highly compressed thumbnails, which can cause OpenCV Haar Cascades to fail on the visual extraction step. The system gracefully degrades to semantic text-matching if visual geometry fails.
