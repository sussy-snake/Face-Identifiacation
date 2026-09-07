import os
import json

class AiSwarmNode:
    def __init__(self):
        # We can integrate directly with an LLM here.
        # Since API keys might not be present in the user's environment, we will safely fallback
        # to a smart heuristic mock if the openai library or key is missing.
        self.api_key = os.getenv("OPENAI_API_KEY", "")

    async def extract_identity(self, candidates):
        """
        Feeds the top 5 SerpApi search results (Titles, Snippets, and URLs) into a lightweight LLM call.
        Returns the extracted identity as a string.
        """
        if not candidates:
            return "Unknown Subject"

        # Prepare the context
        context = ""
        for i, cand in enumerate(candidates[:5]):
            context += f"Result {i+1}:\nTitle: {cand.get('title')}\nSnippet: {cand.get('snippet')}\nURL: {cand.get('link')}\n\n"

        if self.api_key:
            try:
                import openai
                client = openai.AsyncOpenAI(api_key=self.api_key)
                prompt = (
                    "Analyze these search results and extract the exact real-world name of the person or object shown. "
                    "Cross-verify using trusted domains in the URLs (e.g., wikipedia.org, linkedin.com, instagram.com). "
                    "Return only the verified name."
                )
                response = await client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": prompt},
                        {"role": "user", "content": context}
                    ],
                    max_tokens=30,
                    temperature=0.0
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                print(f"[AI Swarm] LLM API failed or missing dependency: {e}. Falling back to smart parser.")
        
        # Fallback heuristic: Extract the most likely name from the best candidate's title
        best_candidate = candidates[0]
        title = best_candidate.get("title", "")
        
        # Clean common suffixes like " - Wikipedia", " | LinkedIn", " (@username)"
        clean_title = title.split(" - ")[0].split(" | ")[0].split(" (")[0]
        
        # If title is very long, just return the first two words (rough name heuristic)
        words = clean_title.split()
        if len(words) > 4:
            clean_title = " ".join(words[:2])
            
        return clean_title
