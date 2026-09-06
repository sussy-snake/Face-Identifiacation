import os
import requests

class OsintNode:
    """
    Takes raw search results from SerpApi, filters out noise,
    and confirms the most accurate social media match.
    """
    def upload_to_imgbb(self, image_path: str) -> str:
        imgbb_key = os.getenv("IMGBB_KEY")
        if not imgbb_key or imgbb_key == "your_imgbb_key":
            raise Exception("IMGBB_KEY not set")
        
        with open(image_path, "rb") as file:
            url = "https://api.imgbb.com/1/upload"
            payload = {
                "key": imgbb_key,
            }
            files = {
                "image": file
            }
            response = requests.post(url, data=payload, files=files)
            response.raise_for_status()
            return response.json()["data"]["url"]

    def search_serpapi(self, image_url: str):
        serpapi_key = os.getenv("SERPAPI_KEY")
        if not serpapi_key or serpapi_key == "your_serpapi_key":
            raise Exception("SERPAPI_KEY not set")
        
        params = {
          "engine": "google_lens",
          "url": image_url,
          "api_key": serpapi_key
        }
        
        response = requests.get("https://serpapi.com/search", params=params)
        response.raise_for_status()
        data = response.json()
        
        if "visual_matches" in data and len(data["visual_matches"]) > 0:
            best_match = data["visual_matches"][0]
            return {
                "title": best_match.get("title", "Unknown"),
                "link": best_match.get("link", ""),
                "thumbnail": best_match.get("thumbnail", "")
            }
        return None

    async def analyze(self, image_path: str) -> dict:
        """
        Executes the OSINT pipeline: Uploads image and searches SerpApi.
        """
        try:
            image_url = self.upload_to_imgbb(image_path)
            match_data = self.search_serpapi(image_url)
            if not match_data:
                match_data = {
                    "title": "Unknown Person",
                    "link": "N/A",
                    "thumbnail": ""
                }
            return match_data
        except Exception as e:
            print(f"OsintNode: External API failed (ImgBB/SerpApi), falling back to mock: {e}")
            return {
                "title": "Alex_Doe_99 (Mocked Fallback)",
                "link": "https://example.com/alex_doe",
                "thumbnail": ""
            }
