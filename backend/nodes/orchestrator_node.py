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

    async def run_pipeline(self, image_path: str) -> list:
        """
        Executes the full pipeline:
        1. Vision Node: Multi-face detection and cropping
        2. OSINT Node: Image search per face
        3. AI Swarm Node: Identity extraction
        4. Storage Node: Data hashing & blockchain storage
        """
        # Step 1: Vision processing (returns up to 2 cropped face paths)
        crop_paths = await self.vision_node.process_image(image_path)
        
        final_results = []
        
        for crop_path in crop_paths:
            # Step 2: OSINT Analysis (fetch top 5 candidates)
            candidates = await self.osint_node.analyze(crop_path)
            
            # Step 3: AI Swarm Identity Extraction
            # We extract identity from the original candidate list so Vision Node can use it for mock fallback 
            # and we can use it as a tie-breaker.
            extracted_identity = await self.ai_swarm_node.extract_identity(candidates)

            # Step 4: Face Comparison & Ranking across all 5 candidates
            scored_candidates = []
            
            for candidate in candidates:
                try:
                    # Pass the full candidate dict AND the extracted identity for intelligent fallback
                    raw_distance = await self.vision_node.compare_faces(crop_path, candidate, extracted_identity)
                    
                    # True Cosine Distance to Percentage Formula (ArcFace threshold is ~0.68)
                    # We map distance 0.0 -> 100%, 0.68 -> 80%, 1.0 -> 0%
                    if raw_distance <= 0.68:
                        similarity_score = 100.0 - (raw_distance / 0.68) * 20.0
                    else:
                        similarity_score = 80.0 - ((raw_distance - 0.68) / 0.32) * 80.0
                        
                    similarity_score = max(0.0, min(100.0, similarity_score))
                    
                    print(f"[RE-RANK] Candidate: {candidate.get('title')} | Raw Distance: {raw_distance:.4f} | Calculated Score: {similarity_score:.1f}%")
                    
                    scored_candidates.append({**candidate, "similarity_score": round(similarity_score, 1), "raw_distance": raw_distance})
                except Exception as e:
                    print(f"[RE-RANK ERROR] Failed on candidate {candidate.get('title')}: {e}")
                    scored_candidates.append({**candidate, "similarity_score": 0.0, "raw_distance": 1.0})
                

            # Tie-Breaker: Massive boost if candidate title matches the verified extracted identity
            for cand in scored_candidates:
                if extracted_identity and extracted_identity.lower() in cand.get("title", "").lower():
                    if "linkedin.com" in cand.get("link", "") or "instagram.com" in cand.get("link", "") or "wikipedia.org" in cand.get("link", ""):
                        print(f"[TIE-BREAKER] Boosting {cand.get('title')} (+15% for Verified Profile Match)")
                        cand["similarity_score"] = min(100.0, cand["similarity_score"] + 15.0)

            # Biometric Re-ranking: Strict sort descending by facial similarity score
            scored_candidates.sort(key=lambda x: x["similarity_score"], reverse=True)
            
            primary_match = scored_candidates[0] if scored_candidates else None
            alternate_matches = scored_candidates[1:] if len(scored_candidates) > 1 else []

            # Step 5: Blockchain Storage
            storage_result = None
            if primary_match:
                # Attach the extracted identity to the primary match before hashing for stronger verification
                primary_match["extracted_identity"] = extracted_identity
                storage_result = await self.storage_node.save(primary_match)
                
            # Append this face's result block
            final_results.append({
                "extracted_identity": extracted_identity,
                "primary_match": primary_match,
                "alternate_matches": alternate_matches,
                "blockchain": {
                    "tx_hash": storage_result["txHash"] if storage_result else "0x000...",
                    "data_hash": storage_result["dataHash"] if storage_result else "0x000..."
                }
            })
            
        return final_results
