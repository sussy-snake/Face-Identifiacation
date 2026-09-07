from .vision_node import VisionNode
from .osint_node import OsintNode
from .storage_node import StorageNode
from .ai_swarm_node import AiSwarmNode

class OrchestratorNode:
    """
    The central hub that routes data between the Vision, OSINT, and Storage nodes.
    """
    def __init__(self):
        self.vision_node = VisionNode()
        self.osint_node = OsintNode()
        self.storage_node = StorageNode()
        self.ai_swarm_node = AiSwarmNode()

    async def run_pipeline(self, image_path: str) -> dict:
        """
        Executes the full pipeline:
        1. Vision Node: Face detection
        2. OSINT Node: Image upload & search
        3. AI Swarm Node: Identity extraction
        4. Storage Node: Data hashing & blockchain storage
        """
        # Step 1: Vision processing
        await self.vision_node.process_image(image_path)
        
        # Step 2: OSINT Analysis
        candidates = await self.osint_node.analyze(image_path)
        
        # Step 3: Face Comparison & Ranking
        scored_candidates = []
        for candidate in candidates:
            score = await self.vision_node.compare_faces(image_path, candidate.get("link", ""))
            scored_candidates.append({**candidate, "similarity_score": round(score, 1)})
            
        # Sort descending by similarity score
        scored_candidates.sort(key=lambda x: x["similarity_score"], reverse=True)
        
        primary_match = scored_candidates[0] if scored_candidates else None
        alternate_matches = scored_candidates[1:] if len(scored_candidates) > 1 else []

        # Step 4: AI Swarm Identity Extraction
        extracted_identity = await self.ai_swarm_node.extract_identity(scored_candidates)

        # Step 5: Blockchain Storage
        # We now proceed with minting the primary match regardless of exact score threshold
        storage_result = None
        if primary_match:
            # Attach the extracted identity to the primary match before hashing for stronger verification
            primary_match["extracted_identity"] = extracted_identity
            storage_result = await self.storage_node.save(primary_match)
            
        # Compile response
        return {
            "extracted_identity": extracted_identity,
            "primary_match": primary_match,
            "alternate_matches": alternate_matches,
            "blockchain": {
                "tx_hash": storage_result["txHash"] if storage_result else "0x000...",
                "data_hash": storage_result["dataHash"] if storage_result else "0x000..."
            }
        }
