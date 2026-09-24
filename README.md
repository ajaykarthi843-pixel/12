# Traffic Safety Advisor

A responsive browser prototype for reviewing traffic violation photos and prioritizing a sample case queue.

## Roboflow Model Integration

This project integrates the Roboflow computer vision model:
- **Model ID**: `traffic-violation-project-crtdk/traffic-violation-ay557-instant-1`
- **Classes detected**: `without helmet`, `single helmet`, `double helmet`, `lane change`
- **Inference Mode**: Roboflow Serverless Cloud API with header-based authorization (`Authorization: Bearer <API_KEY>`).

### 1. Web Application Inference (Integrated)

When running the local server (`start-server.ps1` or `run.bat`):
- The server provides a secure proxy endpoint `POST /api/infer` to prevent exposing your private API key in client-side code.
- Uploading any traffic photo via the dashboard automatically runs inference through the Roboflow Cloud model.
- Detected violations (`NO_HELMET`, `WRONG_WAY` / illegal lane change, etc.) are pre-selected with model confidence scores and real bounding box overlays rendered directly onto the evidence canvas.

You can set your private API key via environment variable:
```powershell
$env:ROBOFLOW_API_KEY = "your_private_api_key_here"
.\start-server.ps1
```

### 2. Standalone Python Script Inference

You can also run direct Python inference on any image file or URL:

```bash
# Install dependencies
pip install inference-sdk

# Run inference
python inference.py path/to/traffic_photo.jpg
```

Code snippet implemented in `inference.py`:
```python
from inference_sdk import InferenceHTTPClient, InferenceConfiguration

CLIENT = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key=os.environ.get("ROBOFLOW_API_KEY", "your_api_key")
).configure(InferenceConfiguration(
    api_key_transport="header"
))

result = CLIENT.infer("traffic_photo.jpg", model_id="traffic-violation-project-crtdk/traffic-violation-ay557-instant-1")
print(result)
```

## Run the site

On Windows, double-click `run.bat`, or run:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-server.ps1
```

The launcher opens the site at `http://localhost:8080`. You can also open `index.html` directly in a modern browser.

## Deploy to Vercel

This is a static site and does not need a build step or backend to host the current prototype.

### From the Vercel dashboard

1. Put this project folder in a Git repository and push it to GitHub, GitLab, or Bitbucket.
2. In Vercel, choose **Add New → Project** and import that repository.
3. Set the project root to the folder containing `index.html`.
4. Leave the framework preset as **Other**. Leave the build command and output directory empty, then deploy.

### From the Vercel CLI

Install and authenticate the Vercel CLI, open a terminal in this folder, then run:

```powershell
vercel
vercel --prod
```

The included `vercel.json` enables clean URLs. The current app is a browser-only prototype: photo review, confidence, and sample cases are not powered by a deployed detection model. Connect the model inference service before relying on automated detections or enforcement decisions.

## Project files

- `index.html` – dashboard, queue, upload workflow, and review dialogs.
- `css/` – base styles, components, animations, and the responsive theme overrides.
- `js/app.js` – page interactions and case review state.
- `js/rankingEngine.js` – severity and priority scoring.
- `js/evidenceCanvas.js` – annotated evidence image rendering.
- `js/reportGenerator.js` – CSV and printable report generation.
- `js/data.js` – sample cases and vehicle records.
- `js/videoSimulator.js` – simulated camera feed for the prototype.
