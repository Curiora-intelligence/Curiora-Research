from pydantic import BaseModel


class CurioResponse(BaseModel):
    success: bool
    answer: str
    model: str
    request_id: str