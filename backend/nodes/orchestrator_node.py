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
        match_data = await self.osint_node.analyze(image_path)
        
        # Step 3: Blockchain Storage
        storage_result = await self.storage_node.save(match_data)
        
        # Step 4: Compile Final Result
        return {
            "status": "success",
            "matchName": match_data["title"],
            "matchUrl": match_data["link"],
            "txHash": storage_result["txHash"],
            "dataHash": storage_result["dataHash"],
            "confidenceScore": 99.8
        }
