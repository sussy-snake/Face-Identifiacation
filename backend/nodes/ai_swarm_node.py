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
        
        # Fallback heuristic: Extract the most common Proper Noun (2 capitalized words) across all candidates
        import re
        from collections import Counter
        
        text_corpus = ""
        for cand in candidates:
            text_corpus += cand.get("title", "") + " " + cand.get("snippet", "") + " "
            
        # Find all sequences of two Capitalized words (e.g., "Charles Leclerc", "Aarav Goel")
        matches = re.findall(r'\b[A-Z][a-z]+\s[A-Z][a-z]+\b', text_corpus)
        
        # Filter out extremely generic false positives
        stop_words = ["Wikipedia", "LinkedIn", "Instagram", "Facebook", "Twitter", "Profile", "Photos", "Images", "Home", "Posts", "Sign In", "Log In", "News", "Sportskeeda Pit", "Getty Images"]
        valid_matches = [m for m in matches if m not in stop_words]
        
        if valid_matches:
            most_common = Counter(valid_matches).most_common(1)[0][0]
            return most_common
            
        # Absolute fallback if regex fails
        best_title = candidates[0].get("title", "")
        clean_title = best_title.split(" - ")[0].split(" | ")[0]
        return " ".join(clean_title.split()[:2])
