import cv2
from datetime import datetime
import os
import time

from ultralytics import YOLO

# Map each doctor to a local camera index.
DOCTOR_CAMERA_MAP = {
    "DR. NASIR ALI": 0,
    # "DR. SOFIA KHAN": 1,
}

MODEL_NAME = "yolov8n.pt"
PHONE_CLASS_NAME = "cell phone"
PHONE_CONFIDENCE_THRESHOLD = 0.35
PHONE_END_GRACE_SECONDS = 2.0
SHOW_PREVIEW = True
DAILY_LOG_FILENAME_TEMPLATE = "phone_usage_{date}.csv"


def _slugify(value):
    safe = []
    for ch in value.upper():
        if ch.isalnum():
            safe.append(ch)
        else:
            safe.append("_")
    return "".join(safe).strip("_")


def _log_phone_session(doctor_name, camera_index, start_time, end_time, total_seconds_today):
    date_str = start_time.strftime("%Y-%m-%d")
    filename = DAILY_LOG_FILENAME_TEMPLATE.format(date=date_str)
    file_exists = os.path.exists(filename)
    duration_seconds = int((end_time - start_time).total_seconds())

    with open(filename, "a", newline="", encoding="utf-8") as csvfile:
        if not file_exists:
            csvfile.write(
                "doctor_name,camera_index,session_start,session_end,session_seconds,total_seconds_today\n"
            )
        csvfile.write(
            f"{doctor_name},{camera_index},"
            f"{start_time.strftime('%Y-%m-%d %H:%M:%S')},"
            f"{end_time.strftime('%Y-%m-%d %H:%M:%S')},"
            f"{duration_seconds},"
            f"{int(total_seconds_today)}\n"
        )


def _detect_phone(model, frame_bgr):
    results = model(frame_bgr, verbose=False)
    if not results or results[0].boxes is None:
        return False, []

    names = results[0].names or {}
    phone_boxes = []
    for box in results[0].boxes:
        conf = float(box.conf[0])
        if conf < PHONE_CONFIDENCE_THRESHOLD:
            continue
        cls_id = int(box.cls[0])
        label = names.get(cls_id, str(cls_id))
        if label != PHONE_CLASS_NAME:
            continue
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        phone_boxes.append((int(x1), int(y1), int(x2), int(y2)))
    return len(phone_boxes) > 0, phone_boxes


def main():
    model = YOLO(MODEL_NAME)

    caps = {}
    for doctor, cam_index in DOCTOR_CAMERA_MAP.items():
        cap = cv2.VideoCapture(cam_index)
        if not cap.isOpened():
            print(f"Camera {cam_index} not available for {doctor}.")
            continue
        caps[doctor] = cap

    if not caps:
        raise SystemExit("No cameras available. Check DOCTOR_CAMERA_MAP.")

    states = {
        doctor: {"in_use": False, "start": None, "last_seen": None}
        for doctor in caps
    }
    totals = {doctor: 0 for doctor in caps}

    print("Phone usage monitor running. Press Ctrl+C to stop.")

    try:
        while True:
            now = datetime.now()
            for doctor, cap in caps.items():
                ok, frame = cap.read()
                if not ok:
                    continue

                phone_seen, phone_boxes = _detect_phone(model, frame)
                state = states[doctor]

                if phone_seen:
                    if not state["in_use"]:
                        state["in_use"] = True
                        state["start"] = now
                    state["last_seen"] = now
                else:
                    if state["in_use"] and state["last_seen"]:
                        gap = (now - state["last_seen"]).total_seconds()
                        if gap >= PHONE_END_GRACE_SECONDS:
                            session_seconds = (now - state["start"]).total_seconds()
                            totals[doctor] += session_seconds
                            _log_phone_session(
                                doctor,
                                DOCTOR_CAMERA_MAP[doctor],
                                state["start"],
                                now,
                                totals[doctor],
                            )
                            state["in_use"] = False
                            state["start"] = None
                            state["last_seen"] = None

                if SHOW_PREVIEW:
                    for (x1, y1, x2, y2) in phone_boxes:
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                        cv2.putText(
                            frame,
                            "PHONE",
                            (x1, y1 - 6),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.7,
                            (0, 0, 255),
                            2,
                        )
                    cv2.imshow(f"Phone Monitor - {doctor}", frame)

            if SHOW_PREVIEW and cv2.waitKey(1) & 0xFF == ord("q"):
                break

            time.sleep(0.01)
    except KeyboardInterrupt:
        pass
    finally:
        end_time = datetime.now()
        for doctor, state in states.items():
            if state["in_use"] and state["start"]:
                session_seconds = (end_time - state["start"]).total_seconds()
                totals[doctor] += session_seconds
                _log_phone_session(
                    doctor,
                    DOCTOR_CAMERA_MAP[doctor],
                    state["start"],
                    end_time,
                    totals[doctor],
                )
        for cap in caps.values():
            cap.release()
        if SHOW_PREVIEW:
            cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
