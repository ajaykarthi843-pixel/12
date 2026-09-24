import os
import sys
import json
from inference_sdk import InferenceHTTPClient, InferenceConfiguration

# Retrieve API key from environment variable (with fallback)
ROBOFLOW_API_KEY = os.environ.get("ROBOFLOW_API_KEY", "R1EcJXM820zb6UXPtSJk")
MODEL_ID = os.environ.get("ROBOFLOW_MODEL_ID", "traffic-violation-project-crtdk/traffic-violation-ay557-instant-1")

def run_inference(image_path_or_url):
    """
    Run traffic violation detection model on an image using Roboflow Serverless Cloud API.
    Uses header-based authentication as required.
    """
    client = InferenceHTTPClient(
        api_url="https://serverless.roboflow.com",
        api_key=ROBOFLOW_API_KEY
    ).configure(InferenceConfiguration(
        api_key_transport="header"
    ))

    result = client.infer(image_path_or_url, model_id=MODEL_ID)
    return result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(f"Usage: python {sys.argv[0]} <image_path_or_url>")
        sys.exit(1)

    target_image = sys.argv[1]
    try:
        data = run_inference(target_image)
        print(json.dumps(data, indent=2))
    except Exception as e:
        print(f"Inference error: {e}", file=sys.stderr)
        sys.exit(1)
