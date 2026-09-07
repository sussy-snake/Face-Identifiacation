import gradio as gr
from main import app as fastapi_app

def backend_status():
    return "True Biometric Backend is Active and Running."

# Hugging Face Gradio SDK requires a Gradio interface to mark the space as "Running"
demo = gr.Interface(
    fn=backend_status, 
    inputs=[], 
    outputs="text", 
    title="Face-to-Chain Backend Status"
)

# This cleverly mounts your FastAPI backend directly into the Gradio Space
# Your API routes (like /api/verify) will remain perfectly accessible!
app = gr.mount_gradio_app(fastapi_app, demo, path="/")
