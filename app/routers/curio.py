from __future__ import annotations

import os
import tempfile
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool

from app.services.vision import analyze_image


curio_router = APIRouter(prefix="/curio",tags=["Curio"])


ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


MAX_IMAGE_SIZE = 15 * 1024 * 1024


@curio_router.post("/analyze")
async def analyze_curio_image(image: UploadFile = File(...),message: str = Form("")):
    """
    Analyze an uploaded image with Curio.

    Endpoint:

        POST /curio/analyze

    Form fields:

        image   -> uploaded image
        message -> user's question/instruction
    """

    if not image.content_type:
        raise HTTPException(
            status_code=400,
            detail="Image content type is missing.",
        )

    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=415,
            detail=(
                "Unsupported image type. "
                "Please upload JPEG, PNG, WEBP, or GIF."
            ),
        )

    image_bytes = await image.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty.",
        )

    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Image is too large. Maximum size is 15 MB.",
        )

    suffix = ALLOWED_IMAGE_TYPES[image.content_type]

    temporary_path = None

    try:

        with tempfile.NamedTemporaryFile(
            mode="wb",
            suffix=suffix,
            delete=False,
        ) as temporary_file:

            temporary_file.write(image_bytes)
            temporary_path = Path(
                temporary_file.name
            )

        answer = await run_in_threadpool(analyze_image,temporary_path,message)

        return {
            "success": True,
            "answer": answer,
        }

    except FileNotFoundError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    except Exception as error:

        print("Curio image analysis failed:",repr(error),)

        raise HTTPException(status_code=500,
            detail=(
                "Curio could not analyze the image. "
                "Check the server logs for details."
            ),
        ) from error

    finally:

        if temporary_path is not None:

            try:
                os.remove(temporary_path)

            except OSError:
                pass