import cv2
import numpy as np
import face_recognition
import os
import requests
import json
import time
from datetime import datetime

# ─── Supabase Configuration ───────────────────────────────────────────────────
SUPABASE_URL = "https://zonoufwagtlbwvpaksuf.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvbm91ZndhZ3RsYnd2cGFrc3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNDc1NjUsImV4cCI6MjA5NjkyMzU2NX0.jvk537eO58M9U-AZGuHH11xoox7huWe3jWjR5DcwCUE"

IMAGES_PATH      = "images"
CAMERA_INDEX     = 0
CAMERA_LOCATION  = "Main Entrance Camera"
PHONE_GRACE_SECS = 10.0   # seconds of no detection before closing a phone session
PHONE_MIN_CONF   = 0.25   # lower = catches more detections
FACE_EVERY_N     = 4      # run face recognition every N frames
YOLO_EVERY_N     = 6      # run phone detection every N frames
CAMERA_WIDTH     = 640    # lower resolution = much faster processing
CAMERA_HEIGHT    = 480

HEADERS = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    "Content-Type": "application/json",
}

# ─── Step 1: Fetch doctors from Supabase (auto-mapping, no manual list) ───────
def fetch_doctor_map():
    """Returns {UPPER_NAME: doctor_id} pulled live from Supabase."""
    try:
        res = requests.get(
            f"{SUPABASE_URL}/rest/v1/doctors?select=id,name",
            headers=HEADERS, timeout=10
        )
        res.raise_for_status()
        mapping = {d["name"].upper(): str(d["id"]) for d in res.json()}
        print(f"✅ Fetched {len(mapping)} doctors from Supabase.")
        return mapping
    except Exception as e:
        print(f"⚠️  Could not fetch doctors: {e}")
        return {}

# ─── Step 2: Load face images from images/ folder ─────────────────────────────
def load_known_faces(path):
    """
    Reads every image in `path/`.
    Filename (without extension) = doctor name.
    Returns (encodings_list, names_list).
    Just drop a photo named 'DR. John Doe.jpg' and it is recognised automatically.
    """
    encodings, names = [], []
    if not os.path.exists(path):
        print(f"⚠️  Images folder '{path}' not found. Create it and add doctor photos.")
        return encodings, names

    for filename in os.listdir(path):
        if not filename.lower().endswith((".jpg", ".jpeg", ".png")):
            continue
        img = cv2.imread(os.path.join(path, filename))
        if img is None:
            print(f"   ⚠️  Could not read {filename}, skipping.")
            continue
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encs = face_recognition.face_encodings(rgb)
        if encs:
            names.append(os.path.splitext(filename)[0])   # "DR. Nasir Ali"
            encodings.append(encs[0])
            print(f"   ✅ Loaded: {filename}")
        else:
            print(f"   ⚠️  No face found in {filename}, skipping.")

    print(f"✅ {len(names)} face(s) ready for recognition.")
    return encodings, names

# ─── Attendance helper ─────────────────────────────────────────────────────────
def mark_attendance(doctor_id, name, confidence, marked_today):
    today = datetime.now().date()
    if marked_today.get(doctor_id) == today:
        return  # already marked today, skip silently
    payload = {
        "doctor_id": doctor_id,
        "event_type": "Check-in",
        "camera_location": CAMERA_LOCATION,
        "confidence_score": round(confidence, 4),
    }
    try:
        res = requests.post(
            f"{SUPABASE_URL}/rest/v1/doctor_attendance",
            headers={**HEADERS, "Prefer": "return=minimal"},
            data=json.dumps(payload), timeout=5
        )
        res.raise_for_status()
        marked_today[doctor_id] = today
        print(f"🟢 Attendance marked: {name}  ({confidence*100:.1f}%)  {datetime.now().strftime('%H:%M:%S')}")
    except Exception as e:
        print(f"❌ Attendance error for {name}: {e}")

# ─── Phone usage helper ────────────────────────────────────────────────────────
def log_phone_usage(doctor_id, name, start_dt, end_dt):
    duration = int((end_dt - start_dt).total_seconds())
    payload = {
        "doctor_id": doctor_id,
        "doctor_name": name,
        "session_start": start_dt.isoformat(),
        "session_end": end_dt.isoformat(),
        "duration_seconds": duration,
        "camera_location": CAMERA_LOCATION,
    }
    try:
        res = requests.post(
            f"{SUPABASE_URL}/rest/v1/phone_usage",
            headers={**HEADERS, "Prefer": "return=minimal"},
            data=json.dumps(payload), timeout=5
        )
        res.raise_for_status()
        print(f"📱 Phone usage saved: {name}  {duration}s")
    except Exception as e:
        print(f"❌ Phone usage error for {name}: {e}")

# ─── Main ──────────────────────────────────────────────────────────────────────
def main():
    # 1. Doctors from Supabase
    doctor_map = fetch_doctor_map()

    # 2. Known faces
    known_encodings, known_names = load_known_faces(IMAGES_PATH)
    if not known_encodings:
        print("⚠️  No faces loaded. Add photos to the images/ folder and restart.")

    # 3. Phone detection model (optional — works without it)
    phone_model = None
    try:
        from ultralytics import YOLO
        phone_model = YOLO("yolov8n.pt")
        print("✅ Phone detection ready.")
    except Exception as e:
        print(f"⚠️  Phone detection disabled: {e}")

    # 4. Camera
    cap = cv2.VideoCapture(CAMERA_INDEX)
    if not cap.isOpened():
        print("❌ Camera not found. Check CAMERA_INDEX setting.")
        return
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_WIDTH)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_HEIGHT)

    print("\n📷 System running — Press 'q' to quit.\n")

    marked_today  = {}   # {doctor_id: date} — marks attendance once per calendar day
    phone_state   = {"active": False, "start": None, "last_seen": None,
                     "doctor_id": None, "doctor_name": None}
    frame_count   = 0

    # Cached overlay data — redrawn on every frame even when detection is skipped
    cached_faces  = []   # [(x1,y1,x2,y2, label, color, doctor_id, doctor_name)]
    cached_phones = []   # [(x1,y1,x2,y2, conf_str)]

    while True:
        ok, frame = cap.read()
        if not ok:
            time.sleep(0.1)
            continue

        frame_count += 1
        now = datetime.now()

        # ── Face Recognition (every FACE_EVERY_N frames) ────────────────────
        if frame_count % FACE_EVERY_N == 0:
            small  = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
            rgb_sm = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)
            locs   = face_recognition.face_locations(rgb_sm, number_of_times_to_upsample=0)
            encs   = face_recognition.face_encodings(rgb_sm, locs)

            cached_faces = []
            for enc, loc in zip(encs, locs):
                distances = face_recognition.face_distance(known_encodings, enc)
                matches   = face_recognition.compare_faces(known_encodings, enc)
                y1, x2, y2, x1 = [v * 2 for v in loc]

                if len(distances) > 0 and matches[np.argmin(distances)]:
                    idx        = np.argmin(distances)
                    name       = known_names[idx]
                    confidence = 1 - distances[idx]
                    doctor_id  = doctor_map.get(name.upper())
                    if not doctor_id:
                        color, label, did, dname = (0,165,255), f"{name.upper()} (NOT IN DB)", None, None
                    else:
                        color, label, did, dname = (0,255,0), name.upper(), doctor_id, name
                        mark_attendance(doctor_id, name, confidence, marked_today)
                    cached_faces.append((x1, y1, x2, y2, label, color, did, dname))
                else:
                    cached_faces.append((x1, y1, x2, y2, "UNKNOWN", (0,0,255), None, None))

        # ── Draw cached face boxes on every frame ───────────────────────────
        current_id, current_name = None, None
        for (x1, y1, x2, y2, label, color, did, dname) in cached_faces:
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.rectangle(frame, (x1, y2-35), (x2, y2), color, cv2.FILLED)
            cv2.putText(frame, label, (x1+6, y2-6),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            if did:
                current_id, current_name = did, dname

        # ── Phone Detection (every YOLO_EVERY_N frames, only if doctor visible) ──
        if phone_model and current_id and frame_count % YOLO_EVERY_N == 0:
            results    = phone_model(frame, verbose=False)
            phone_seen = False
            cached_phones = []

            if results and results[0].boxes is not None:
                for box in results[0].boxes:
                    conf  = float(box.conf[0])
                    lbl   = results[0].names.get(int(box.cls[0]), "")
                    if lbl == "cell phone" and conf >= PHONE_MIN_CONF:
                        phone_seen = True
                        bx1, by1, bx2, by2 = [int(v) for v in box.xyxy[0].tolist()]
                        cached_phones.append((bx1, by1, bx2, by2, f"PHONE {conf:.0%}"))

            if phone_seen:
                if not phone_state["active"]:
                    phone_state.update({"active": True, "start": now,
                                        "doctor_id": current_id, "doctor_name": current_name})
                phone_state["last_seen"] = now
            else:
                if phone_state["active"] and phone_state["last_seen"]:
                    gap = (now - phone_state["last_seen"]).total_seconds()
                    if gap >= PHONE_GRACE_SECS:
                        log_phone_usage(phone_state["doctor_id"], phone_state["doctor_name"],
                                        phone_state["start"], now)
                        phone_state.update({"active": False, "start": None,
                                            "last_seen": None, "doctor_id": None, "doctor_name": None})
            if not current_id:
                cached_phones = []

        # ── Draw cached phone boxes on every frame ──────────────────────────
        for (bx1, by1, bx2, by2, plabel) in cached_phones:
            cv2.rectangle(frame, (bx1, by1), (bx2, by2), (0, 0, 255), 2)
            cv2.putText(frame, plabel, (bx1, by1-8),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        cv2.imshow("Hospital — Attendance & Phone Monitor", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    # Save any open phone session on exit
    if phone_state["active"] and phone_state["start"]:
        log_phone_usage(phone_state["doctor_id"], phone_state["doctor_name"],
                        phone_state["start"], datetime.now())

    cap.release()
    cv2.destroyAllWindows()
    print("👋 System stopped.")


if __name__ == "__main__":
    main()
