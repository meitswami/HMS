"""Aadhaar Secure QR code decoder."""

import json
import logging
from typing import Optional, Dict

import cv2
import numpy as np

logger = logging.getLogger(__name__)


class AadhaarQrDecoder:
    def decode(self, image_bytes: bytes) -> Optional[Dict]:
        """Decode Aadhaar QR from image bytes."""
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        detector = cv2.QRCodeDetector()
        data, _, _ = detector.detectAndDecode(image)

        if not data:
            return None

        return self._parse_aadhaar_data(data)

    def _parse_aadhaar_data(self, raw: str) -> Dict:
        """Parse Aadhaar QR XML/JSON payload."""
        result = {"raw": raw}

        # Aadhaar QR contains XML or numbered fields
        if raw.startswith("<"):
            import xml.etree.ElementTree as ET
            try:
                root = ET.fromstring(raw)
                for child in root:
                    tag = child.tag.lower()
                    if "name" in tag:
                        result["name"] = child.text
                    elif "dob" in tag or "birth" in tag:
                        result["dob"] = child.text
                    elif "gender" in tag:
                        result["gender"] = child.text
                    elif "address" in tag or "co" in tag:
                        result["address"] = child.text
            except ET.ParseError:
                pass
        elif "|" in raw:
            parts = raw.split("|")
            if len(parts) >= 4:
                result.update({
                    "referenceId": parts[0],
                    "name": parts[1] if len(parts) > 1 else None,
                    "dob": parts[2] if len(parts) > 2 else None,
                    "gender": parts[3] if len(parts) > 3 else None,
                })

        return result
