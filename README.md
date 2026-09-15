# Curiora Research

A local visual-intelligence experiment: upload an image, ask a question, and receive a model-generated answer through a FastAPI and Jinja2 interface.

[Curiora organization](https://github.com/Curiora-intelligence) · [Curiora Campus](https://github.com/Curiora-intelligence/Curiora-Campus) · [Portfolio](https://saiganesh-portfolio.onrender.com)

## What it does

- Serves the research interface at `/`.
- Accepts an image and an optional question through `POST /curio/analyze`.
- Validates the upload's declared MIME type, rejects empty uploads and files larger than 15 MB, and cleans up temporary files.
- Loads `mlx-community/Qwen3-VL-8B-Instruct-8bit` lazily using MLX-VLM.
- Uses separate locks for model loading and inference, and runs the blocking analysis in a worker thread.
- Uses a prompt asking for image-grounded answers and explicit uncertainty. Prompt instructions do not guarantee factual correctness.

This repository integrates **pretrained Qwen3-VL 8B**. It does not train a foundation model. The separate Campus repository adds GPT-OSS text routing and a broader model gateway; those capabilities should not be attributed to this standalone vision experiment.

## Local setup

Use Python 3.10+ on an Apple Silicon Mac with enough unified memory and storage for the selected model. The checked-in `requirements.txt` is currently empty, so install the packages used by the implementation explicitly:

```sh
git clone https://github.com/Curiora-intelligence/Curiora-Research.git
cd Curiora-Research
python3 -m venv .venv
source .venv/bin/activate
python -m pip install fastapi 'uvicorn[standard]' jinja2 python-multipart \
  python-dotenv itsdangerous cryptography mlx-vlm
```

Create a local `.env` with `encrypt_key` set to a random session secret. Despite its name, `main.py` passes this value to `SessionMiddleware` as the session-signing secret. Do not commit the secret.

```sh
python -m uvicorn main:app --reload
```

Open http://127.0.0.1:8000. MLX-VLM is imported when the service module is imported; model weights are loaded on the first analysis request. This is not a portable CPU-only web installation.

## API

```sh
curl -X POST http://127.0.0.1:8000/curio/analyze \
  -F 'image=@example.png;type=image/png' \
  -F 'message=What is visible in this image?'
```

The `image` field is required; `message` is optional. Accepted MIME types are `image/jpeg`, `image/png`, `image/webp`, and `image/gif`. A successful response contains `success: true` and an `answer` string. The current generation settings are 384 maximum tokens and temperature 0.2.

## Project structure

| Path | Responsibility |
| --- | --- |
| `main.py` | FastAPI app, sessions, static files, home route |
| `app/routers/curio.py` | Multipart upload validation and cleanup |
| `app/services/vision.py` | Lazy model load, prompting, serialized MLX inference |
| `app/schemas/curio_response.py` | Schema module; the route currently returns a dictionary directly |
| `templates/` | Jinja2 layout and research page |
| `static/css/`, `static/js/` | Research styling and browser interaction |

## Status and limitations

An experimental local application, without a published evaluation suite or claimed accuracy score. It does not implement persistent conversations, training, an action/verification agent loop, or a production authentication boundary. Model-generated answers can be wrong. The current upload limit is checked after reading the upload into memory. A reproducible dependency lock and automated endpoint tests remain to be added.
