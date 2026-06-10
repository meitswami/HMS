"""OpenCV-based table structure detection for hotel registers."""

import cv2
import numpy as np
from typing import List, Dict


class TableDetector:
    def detect(self, image: np.ndarray) -> List[Dict]:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 15, 10,
        )

        # Detect horizontal and vertical lines
        h_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
        v_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 40))

        h_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, h_kernel, iterations=2)
        v_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, v_kernel, iterations=2)

        table_mask = cv2.add(h_lines, v_lines)
        contours, _ = cv2.findContours(table_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        tables = []
        for cnt in contours:
            x, y, w, h = cv2.boundingRect(cnt)
            if w > 100 and h > 50:
                tables.append({"x": x, "y": y, "width": w, "height": h})

        return tables

    def detect_rows(self, image: np.ndarray, table: Dict) -> List[Dict]:
        """Split table region into row bands."""
        x, y, w, h = table["x"], table["y"], table["width"], table["height"]
        roi = image[y : y + h, x : x + w]
        gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)

        row_positions = []
        for i in range(0, h, 5):
            row_slice = edges[i : i + 5, :]
            if np.mean(row_slice) > 10:
                row_positions.append(i)

        rows = []
        for i in range(len(row_positions) - 1):
            ry = row_positions[i]
            rh = row_positions[i + 1] - ry
            if rh > 15:
                rows.append({"y": y + ry, "height": rh, "x": x, "width": w})

        return rows
