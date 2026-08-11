from pathlib import Path

from mlx_vlm import load, generate
from mlx_vlm.prompt_utils import apply_chat_template
from mlx_vlm.utils import load_config


MODEL = "mlx-community/Qwen3-VL-8B-Instruct-8bit"

IMAGE = Path("image.png")


print("Loading Curio model...")

model, processor = load(MODEL)

config = load_config(MODEL)

print("Curio model loaded.")
print("Model:", MODEL)


if not IMAGE.exists():

    raise FileNotFoundError(
        f"Image not found: {IMAGE}"
    )


prompt = (
    "You are Curio, a visual intelligence assistant "
    "developed by Curiora Research. "
    "Analyze this image carefully. "
    "Describe the important objects you see, "
    "their relationships, and anything unusual "
    "or potentially important. "
    "Do not invent details that cannot be visually supported."
)


formatted_prompt = apply_chat_template(
    processor,
    config,
    prompt,
    num_images=1,
)


print()
print("Analyzing image...")
print()


output = generate(model,processor,formatted_prompt,str(IMAGE),max_tokens=256,temperature=0.2,verbose=True)


print()
print("=" * 60)
print("CURIO RESPONSE")
print("=" * 60)
print()
print(output)
print()