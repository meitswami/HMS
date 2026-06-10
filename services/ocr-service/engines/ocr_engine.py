"""Multi-engine OCR manager: PaddleOCR, Tesseract, EasyOCR."""

import logging
import os
from typing import List, Dict, Any

import cv2
import numpy as np

logger = logging.getLogger(__name__)

REGISTER_COLUMNS = [
    "serial_number", "full_name", "father_name", "age", "gender",
    "nationality", "mobile_number", "address", "aadhaar_number",
    "passport_number", "room_number", "check_in_date", "purpose_of_visit",
    "vehicle_number",
]


class OcrEngineManager:
    def __init__(self):
        self._paddle = None
        self._easyocr = None

    def available_engines(self) -> List[str]:
        engines = ["tesseract"]
        try:
            import paddleocr  # noqa
            engines.append("paddle")
        except ImportError:
            pass
        try:
            import easyocr  # noqa
            engines.append("easyocr")
        except ImportError:
            pass
        return engines

    def _get_paddle(self):
        if self._paddle is None:
            from paddleocr import PaddleOCR
            self._paddle = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
        return self._paddle

    def _get_easyocr(self):
        if self._easyocr is None:
            import easyocr
            self._easyocr = easyocr.Reader(["en", "hi"], gpu=False)
        return self._easyocr

    async def load_from_storage(self, file_key: str) -> np.ndarray:
        """Load image from MinIO/S3. Falls back to placeholder for dev."""
        try:
            from minio import Minio

            client = Minio(
                os.getenv("S3_ENDPOINT", "localhost"),
                access_key=os.getenv("S3_ACCESS_KEY", "minioadmin"),
                secret_key=os.getenv("S3_SECRET_KEY", "minioadmin"),
                secure=False,
            )
            bucket = os.getenv("S3_BUCKET", "hms-documents")
            response = client.get_object(bucket, file_key)
            data = response.read()
            nparr = np.frombuffer(data, np.uint8)
            return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except Exception as e:
            logger.warning(f"Storage load failed: {e}, using blank image")
            return np.zeros((800, 600, 3), dtype=np.uint8)

    def extract(self, engine: str, image: np.ndarray) -> List[Dict[str, Any]]:
        if engine == "paddle":
            return self._extract_paddle(image)
        elif engine == "easyocr":
            return self._extract_easyocr(image)
        elif engine == "ensemble":
            paddle = self._extract_paddle(image)
            tess = self._extract_tesseract(image)
            return paddle if len(paddle) >= len(tess) else tess
        return self._extract_tesseract(image)

    def _extract_paddle(self, image: np.ndarray) -> List[Dict[str, Any]]:
        try:
            ocr = self._get_paddle()
            result = ocr.ocr(image, cls=True)
            texts = []
            if result and result[0]:
                for line in result[0]:
                    bbox, (text, conf) = line
                    texts.append({
                        "text": text,
                        "confidence": float(conf) * 100,
                        "bbox": [p[0] for p in bbox] + [p[1] for p in bbox],
                    })
            return texts
        except Exception as e:
            logger.error(f"PaddleOCR failed: {e}")
            return self._extract_tesseract(image)

    def _extract_tesseract(self, image: np.ndarray) -> List[Dict[str, Any]]:
        import pytesseract

        data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
        texts = []
        for i in range(len(data["text"])):
            if data["text"][i].strip():
                texts.append({
                    "text": data["text"][i],
                    "confidence": float(data["conf"][i]) if data["conf"][i] != -1 else 50.0,
                    "bbox": [
                        data["left"][i], data["top"][i],
                        data["width"][i], data["height"][i],
                    ],
                })
        return texts

    def _extract_easyocr(self, image: np.ndarray) -> List[Dict[str, Any]]:
        try:
            reader = self._get_easyocr()
            results = reader.readtext(image)
            return [
                {"text": text, "confidence": float(conf) * 100, "bbox": bbox}
                for bbox, text, conf in results
            ]
        except Exception as e:
            logger.error(f"EasyOCR failed: {e}")
            return self._extract_tesseract(image)
