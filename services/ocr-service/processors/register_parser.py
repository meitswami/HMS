"""Parse OCR text output into structured register rows."""

from typing import List, Dict, Any
from models import OcrRow, OcrField

REGISTER_FIELD_MAP = [
    "serial_number", "full_name", "father_name", "age", "gender",
    "nationality", "mobile_number", "permanent_address", "aadhaar_number",
    "passport_number", "room_number", "check_in_date", "purpose_of_visit",
    "vehicle_number",
]


class RegisterParser:
    def parse_to_rows(
        self,
        ocr_results: List[Dict[str, Any]],
        tables: List[Dict],
    ) -> List[OcrRow]:
        if not ocr_results:
            return []

        # Group text blocks by Y-coordinate into rows
        sorted_texts = sorted(ocr_results, key=lambda t: self._get_y(t))
        row_groups: List[List[Dict]] = []
        current_row: List[Dict] = []
        last_y = -1

        for item in sorted_texts:
            y = self._get_y(item)
            if last_y >= 0 and abs(y - last_y) > 20:
                if current_row:
                    row_groups.append(current_row)
                current_row = []
            current_row.append(item)
            last_y = y

        if current_row:
            row_groups.append(current_row)

        rows = []
        for idx, group in enumerate(row_groups):
            fields = self._map_fields(group, idx)
            if any(f.value.strip() for f in fields):
                rows.append(OcrRow(rowNumber=idx + 1, fields=fields))

        return rows

    def _get_y(self, item: Dict) -> float:
        bbox = item.get("bbox", [0, 0, 0, 0])
        if len(bbox) >= 2:
            return float(bbox[1])
        return 0.0

    def _map_fields(self, group: List[Dict], row_idx: int) -> List[OcrField]:
        fields = []
        texts = [g["text"] for g in group]
        confidences = [g.get("confidence", 50.0) for g in group]

        for i, field_name in enumerate(REGISTER_FIELD_MAP):
            if i < len(texts):
                fields.append(OcrField(
                    fieldName=field_name,
                    value=texts[i],
                    confidence=confidences[i],
                    bbox=group[i].get("bbox"),
                ))
            else:
                fields.append(OcrField(fieldName=field_name, value="", confidence=0.0))

        return fields
