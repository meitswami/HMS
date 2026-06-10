"""
HMS OCR Microservice
Supports PaddleOCR, Tesseract, EasyOCR with table detection and confidence scoring.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import logging

from models import OcrField, OcrRow
from engines.ocr_engine import OcrEngineManager
from processors.table_detector import TableDetector
from processors.register_parser import RegisterParser

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="HMS OCR Service",
    description="AI-powered hotel register digitization",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ocr_manager = OcrEngineManager()
table_detector = TableDetector()
register_parser = RegisterParser()


class ProcessRequest(BaseModel):
    fileKey: str
    engine: str = "paddle"
    scanId: Optional[str] = None


@app.get("/health")
async def health():
    return {"status": "healthy", "engines": ocr_manager.available_engines()}


@app.post("/api/ocr/process")
async def process_register(req: ProcessRequest):
    """Process a register image/PDF from S3 storage."""
    try:
        image = await ocr_manager.load_from_storage(req.fileKey)
        tables = table_detector.detect(image)
        raw_text = ocr_manager.extract(req.engine, image)
        rows = register_parser.parse_to_rows(raw_text, tables)
        overall_confidence = sum(f.confidence for r in rows for f in r.fields) / max(
            sum(len(r.fields) for r in rows), 1
        )

        return {
            "scanId": req.scanId,
            "engine": req.engine,
            "overallConfidence": round(overall_confidence, 2),
            "tableDetected": len(tables) > 0,
            "rowCount": len(rows),
            "rows": [r.model_dump() for r in rows],
            "pages": [{"pageNumber": 1, "rowCount": len(rows)}],
        }
    except Exception as e:
        logger.error(f"OCR processing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ocr/upload")
async def upload_and_process(
    file: UploadFile = File(...),
    engine: str = "paddle",
):
    """Direct file upload for OCR processing."""
    import numpy as np
    import cv2

    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image file")

    tables = table_detector.detect(image)
    raw_text = ocr_manager.extract(engine, image)
    rows = register_parser.parse_to_rows(raw_text, tables)

    return {
        "filename": file.filename,
        "engine": engine,
        "tableDetected": len(tables) > 0,
        "rowCount": len(rows),
        "rows": [r.model_dump() for r in rows],
    }


@app.post("/api/aadhaar/decode-qr")
async def decode_aadhaar_qr(file: UploadFile = File(...)):
    """Decode Aadhaar secure QR code from image."""
    from processors.aadhaar_qr import AadhaarQrDecoder

    contents = await file.read()
    decoder = AadhaarQrDecoder()
    result = decoder.decode(contents)

    if not result:
        raise HTTPException(status_code=400, detail="Could not decode Aadhaar QR")

    return result


@app.post("/api/face/detect")
async def detect_faces(file: UploadFile = File(...)):
    """Detect faces and generate embeddings for recognition."""
    import numpy as np
    import cv2

    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    detected = []
    for i, (x, y, w, h) in enumerate(faces):
        detected.append({
            "index": i,
            "bbox": [int(x), int(y), int(w), int(h)],
            "quality": min(w * h / 10000, 1.0),
        })

    return {"faceCount": len(detected), "faces": detected}
