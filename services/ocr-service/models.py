from pydantic import BaseModel
from typing import Optional, List


class OcrField(BaseModel):
    fieldName: str
    value: str
    confidence: float
    bbox: Optional[List[float]] = None


class OcrRow(BaseModel):
    rowNumber: int
    fields: List[OcrField]
