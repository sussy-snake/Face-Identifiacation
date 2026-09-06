from .vision_node import VisionNode
from .osint_node import OsintNode
from .storage_node import StorageNode

class OrchestratorNode:
    """
    The central hub that routes data between the Vision, OSINT, and Storage nodes.
    """
    def __init__(self):
        self.vision_node = VisionNode()
        self.osint_node = OsintNode()
        self.storage_node = StorageNode()

    async def run_pipeline(self, image_path: str) -> dict:
        """
        Executes the full pipeline:
        1. Vision Node: Face detection
        2. OSINT Node: Image upload & search
        3. Storage Node: Data hashing & blockchain storage
        """
        # Step 1: Vision processing
        await self.vision_node.process_image(image_path)
        
        # Step 2: OSINT Analysis
        candidates = await self.osint_node.analyze(image_path)
        
        # Step 3: Facial Similarity Threshold Verification
        best_match = None
        best_score = 0
        fallbacks = []

        for candidate in candidates:
            score = await self.vision_node.compare_faces(image_path, candidate.get("link", ""))
            
            # Format candidate with its score
            scored_candidate = {**candidate, "similarity_score": round(score, 1)}
            
            if score >= 80:
                if score > best_score:
                    best_score = score
                    best_match = scored_candidate
            else:
                fallbacks.append(scored_candidate)

        # Step 4: Conditional Routing
        if best_match:
            # Exact Match -> Proceed to Blockchain Storage
            storage_result = await self.storage_node.save(best_match)
            return {
                "status": "exact_match",
                "matchName": best_match["title"],
                "matchSnippet": best_match.get("snippet", "No caption available"),
                "matchUrl": best_match["link"],
                "txHash": storage_result["txHash"],
                "dataHash": storage_result["dataHash"],
                "confidenceScore": best_match["similarity_score"]
            }
        else:
            # Partial Match -> Do not mint to blockchain, return fallbacks
            return {
                "status": "partial_match",
                "message": "Couldn't find the exact data.",
                "fallbacks": fallbacks[:3] # Top 3 background/scenery matches
            }
