from __future__ import annotations

import threading
from pathlib import Path

from mlx_vlm import load, generate
from mlx_vlm.prompt_utils import apply_chat_template
from mlx_vlm.utils import load_config


MODEL_ID = "mlx-community/Qwen3-VL-8B-Instruct-8bit"

MAX_TOKENS = 384
TEMPERATURE = 0.2


_model = None
_processor = None
_config = None

_model_lock = threading.Lock()
_inference_lock = threading.Lock()


SYSTEM_PROMPT = """
You are Curio, the visual intelligence assistant developed by Curiora Research.

Your job is to help people understand the visual world.

Analyze only what is visually supported by the image.

Be precise and useful.

Do not invent objects, text, damage, locations, identities, causes,
measurements, or events that cannot reasonably be supported by the image.

When the user asks about something specific, answer that question directly.

If the image contains something potentially important, explain why it
may matter without presenting speculation as fact.

If the image does not provide enough information to answer confidently,
say so clearly.

Keep responses concise enough for an interactive assistant while still
providing useful reasoning.
""".strip()


def _load_model() -> tuple:
    """
    Load Curio exactly once.

    The model is loaded lazily so importing this module does not immediately
    allocate approximately 10+ GB of unified memory.
    """

    global _model
    global _processor
    global _config

    if (
        _model is not None
        and _processor is not None
        and _config is not None
    ):
        return _model, _processor, _config

    with _model_lock:

        if (
            _model is not None
            and _processor is not None
            and _config is not None
        ):
            return _model, _processor, _config

        print("Loading Curio vision model...")
        print(f"Model: {MODEL_ID}")

        _model, _processor = load(MODEL_ID)
        _config = load_config(MODEL_ID)

        print("Curio vision model loaded.")

    return _model, _processor, _config


def analyze_image(image_path: str | Path,message: str = "",) -> str:
    """
    Analyze one image with Qwen3-VL and return plain text.

    Parameters
    ----------
    image_path:
        Path to the temporary/local image file.

    message:
        User's question or instruction about the image.
    """

    image_path = Path(image_path)

    if not image_path.is_file():
        raise FileNotFoundError(
            f"Image file not found: {image_path}"
        )

    model, processor, config = _load_model()

    user_message = message.strip()

    if not user_message:
        user_message = (
            "Describe what you see in this image and identify "
            "anything important that the user should know."
        )

    prompt = (
        f"{SYSTEM_PROMPT}\n\n"
        f"User's request:\n"
        f"{user_message}"
    )

    # IMPORTANT:
    # mlx-vlm expects the image collection here.
    # Passing str(image_path) directly can result in the path being
    # treated as an iterable of characters.
    images = [str(image_path)]

    formatted_prompt = apply_chat_template(
        processor,
        config,
        prompt,
        num_images=len(images),
    )

    print("Curio is analyzing an image...")
    print(f"User request: {user_message}")

    # Qwen3-VL inference uses MLX GPU.
    # A lock prevents two simultaneous demo requests from competing
    # aggressively for the same 16 GB unified-memory pool.
    with _inference_lock:

        result = generate(
            model,
            processor,
            formatted_prompt,
            images,
            max_tokens=MAX_TOKENS,
            temperature=TEMPERATURE,
            verbose=False,
        )

    answer = getattr(result, "text", None)

    if answer is None:
        answer = str(result)

    answer = answer.strip()

    if not answer:
        raise RuntimeError(
            "Curio generated an empty response."
        )

    return answer