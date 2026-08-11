from io import BytesIO

import torch
from PIL import Image
from transformers import (
    AutoProcessor,
    Qwen3VLForConditionalGeneration,
)


MODEL_NAME = "Qwen/Qwen3-VL-8B-Instruct"


print("Loading Curio vision model...")

model = Qwen3VLForConditionalGeneration.from_pretrained(MODEL_NAME,dtype="auto",device_map="auto",)

processor = AutoProcessor.from_pretrained(MODEL_NAME,)

print("Curio vision model loaded.")


async def analyze_image(
    image_bytes: bytes,
    filename: str,
    message: str | None = None,
) -> dict:

    if not image_bytes:
        raise ValueError(
            "Image is empty."
        )


    image = Image.open(
        BytesIO(image_bytes)
    ).convert("RGB")


    user_message = (
        message.strip()
        if message and message.strip()
        else (
            "Describe what you see in this image. "
            "Be useful, specific, and concise."
        )
    )


    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "image": image,
                },
                {
                    "type": "text",
                    "text": user_message,
                },
            ],
        }
    ]


    inputs = processor.apply_chat_template(
        messages,
        tokenize=True,
        add_generation_prompt=True,
        return_dict=True,
        return_tensors="pt",
    )


    inputs = inputs.to(
        model.device
    )


    with torch.inference_mode():

        generated_ids = model.generate(
            **inputs,
            max_new_tokens=256,
        )


    generated_ids_trimmed = [
        output_ids[len(input_ids):]
        for input_ids, output_ids
        in zip(
            inputs.input_ids,
            generated_ids,
        )
    ]


    output_text = processor.batch_decode(
        generated_ids_trimmed,
        skip_special_tokens=True,
        clean_up_tokenization_spaces=False,
    )


    answer = (
        output_text[0].strip()
        if output_text
        else "Curio could not generate a response."
    )


    return {
        "success": True,
        "answer": answer,
        "model": MODEL_NAME,
        "filename": filename,
    }