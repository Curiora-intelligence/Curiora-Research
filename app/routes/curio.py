from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.schemas.curio_response import CurioResponse
from app.services.vision import analyze_image


curio_router = APIRouter(prefix="/curio",tags=["Curio"],)


@curio_router.post("/analyze",response_model=CurioResponse)
async def analyze(image: UploadFile = File(...),message: str | None = Form(default=None)):
    """
    Analyze an image using Curio.

    Accepts:
        image   -> uploaded image
        message -> user's question/instruction
    """

    if not image.content_type:
        raise HTTPException(
            status_code=400,
            detail="Image content type is missing.",
        )

    if not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Curio currently accepts image files only.",
        )

    image_bytes = await image.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty.",
        )

    try:
        result = await analyze_image(image_bytes=image_bytes,filename=image.filename or "image",message=message,)

        return result

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Curio could not process the image.",
        ) from exc