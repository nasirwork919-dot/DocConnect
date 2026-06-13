import cv2
import numpy as np
import face_recognition
import os
from datetime import datetime, timedelta
import time
import requests
import json

# --- Supabase Configuration ---
# IMPORTANT: Replace with your actual Edge Function URL and Anon Key
SUPABASE_EDGE_FUNCTION_URL = "https://xrdbgkiorhucmebifuym.supabase.co/functions/v1/record-attendance"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZGJna2lvcmh1Y21lYmlmdXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NTkyMzAsImV4cCI6MjA3NzAzNTIzMH0.Qglr21uo_KtqgwOCwj4xdUZNINFWOLCoTnztuR70KA"

# --- Doctor Name to Supabase ID Mapping ---
# This mapping is crucial. Ensure the names match your image filenames (without extension)
# and the IDs match the 'id' column in your Supabase 'doctors' table.
# In a production system, you might fetch this dynamically from Supabase.
DOCTOR_NAME_TO_SUPABASE_ID = {
    "DR. JAMES GRIFFITH": "1",
    "DR. DAVID VACCUM": "2",
    "DR. SOFIA KHAN": "3",
    "DR. IQRA AHMED": "4",
    "DR. NASIR ALI": "5",
    "DR. EMILY WHITE": "6",
    "DR. JOHN SMITH": "7",
    "DR. SARAH CHEN": "8",
    "DR. MICHAEL BROWN": "9",
    "DR. JESSICA LEE": "10",
    "DR. ROBERT JOHNSON": "11",
    "DR. MARIA GARCIA": "12",
    "DR. WILLIAM DAVIS": "13",
    "DR. LINDA RODRIGUEZ": "14",
    "DR. RICHARD MARTINEZ": "15",
    "DR. SUSAN HERNANDEZ": "16",
    "DR. CHARLES LOPEZ": "17",
    "DR. NANCY GONZALEZ": "18",
    "DR. JOSEPH WILSON": "19",
    "DR. KAREN ANDERSON": "20",
    "DR. THOMAS TAYLOR": "21",
    "DR. BETTY THOMAS": "22",
    "DR. PAUL JACKSON": "23",
    "DR. DOROTHY WHITE": "24",
    "DR. MARK HARRIS": "25",
    "DR. SANDRA MARTIN": "26",
    "DR. STEVEN THOMPSON": "27",
    "DR. ASHLEY MOORE": "28",
    "DR. KEVIN CLARK": "29",
    "DR. LAURA LEWIS": "30"
}

# Folder containing known faces
path = 'images'
images = []
classNames = []
myList = os.listdir(path)
print(f"✅ Loaded {len(myList)} known faces.")

# Load and encode known faces
for cl in myList:
    curImg = cv2.imread(f'{path}/{cl}')
    images.append(curImg)
    classNames.append(os.path.splitext(cl)[0])

def findEncodings(images):
    encodeList = []
    for img in images:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encode = face_recognition.face_encodings(img)
        if len(encode) > 0:
            encodeList.append(encode[0])
    return encodeList

# Dictionary to store the last time attendance was marked for each doctor
last_marked_time = {}
COOLDOWN_PERIOD_SECONDS = 300 # 5 minutes cooldown to prevent spamming

def mark_attendance_supabase(name, confidence_score=None):
    doctor_id = DOCTOR_NAME_TO_SUPABASE_ID.get(name.upper())

    if not doctor_id:
        print(f"⚠️ Doctor ID not found for name: {name}. Skipping attendance.")
        return

    current_time = datetime.now()
    if doctor_id in last_marked_time and (current_time - last_marked_time[doctor_id]).total_seconds() < COOLDOWN_PERIOD_SECONDS:
        # print(f"⏳ Cooldown active for {name}. Skipping attendance for now.")
        return

    # For simplicity, we'll assume "Check-in" for now.
    # More advanced logic could determine "Check-out" based on previous events.
    event_type = "Check-in"
    camera_location = "Main Entrance Camera" # You can make this dynamic if you have multiple cameras

    payload = {
        "doctor_id": doctor_id,
        "event_type": event_type,
        "camera_location": camera_location,
        "confidence_score": confidence_score
    }

    headers = {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
    }

    try:
        response = requests.post(SUPABASE_EDGE_FUNCTION_URL, headers=headers, data=json.dumps(payload))
        response.raise_for_status() # Raise an exception for HTTP errors (4xx or 5xx)

        print(f"🟢 Attendance recorded for {name} ({event_type}) at {current_time.strftime('%Y-%m-%d %H:%M:%S')}")
        # Update last marked time after successful recording
        last_marked_time[doctor_id] = current_time

    except requests.exceptions.HTTPError as http_err:
        print(f"❌ HTTP error occurred while sending attendance for {name}: {http_err}")
        print(f"Response body: {response.text}")
    except requests.exceptions.ConnectionError as conn_err:
        print(f"❌ Connection error occurred while sending attendance for {name}: {conn_err}")
    except requests.exceptions.Timeout as timeout_err:
        print(f"❌ Timeout error occurred while sending attendance for {name}: {timeout_err}")
    except requests.exceptions.RequestException as req_err:
        print(f"❌ An unexpected error occurred while sending attendance for {name}: {req_err}")

# Encode faces
encodeListKnown = findEncodings(images)
print("✅ Encoding complete.")

# Start camera
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Camera not found. Ensure camera is connected and not in use.")
    exit()

print("📷 Camera running — Press 'q' to quit manually.")

while True:
    success, img = cap.read()
    if not success:
        print("⚠️ Failed to grab frame, retrying...")
        time.sleep(1)
        continue

    # Resize for performance
    imgS = cv2.resize(img, (0, 0), None, 0.25, 0.25)
    imgS = cv2.cvtColor(imgS, cv2.COLOR_BGR2RGB)

    # Detect and encode faces
    facesCurFrame = face_recognition.face_locations(imgS)
    encodesCurFrame = face_recognition.face_encodings(imgS, facesCurFrame)

    # For each face in the frame
    for encodeFace, faceLoc in zip(encodesCurFrame, facesCurFrame):
        matches = face_recognition.compare_faces(encodeListKnown, encodeFace)
        faceDis = face_recognition.face_distance(encodeListKnown, encodeFace)

        if len(faceDis) > 0:
            matchIndex = np.argmin(faceDis)
            y1, x2, y2, x1 = faceLoc
            y1, x2, y2, x1 = y1 * 4, x2 * 4, y2 * 4, x1 * 4

            if matches[matchIndex]:
                name = classNames[matchIndex].upper()
                confidence = 1 - faceDis[matchIndex] # Convert distance to a confidence score (0 to 1)
                
                # Green box for recognized face
                cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.rectangle(img, (x1, y2 - 35), (x2, y2), (0, 255, 0), cv2.FILLED)
                cv2.putText(img, name, (x1 + 6, y2 - 6), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

                mark_attendance_supabase(name, confidence)
            else:
                # Red box for unknown face
                cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 255), 2)
                cv2.rectangle(img, (x1, y2 - 35), (x2, y2), (0, 0, 255), cv2.FILLED)
                cv2.putText(img, "UNKNOWN", (x1 + 6, y2 - 6), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

    # Display
    cv2.imshow('Hospital Attendance System', img)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        print("👋 Camera closed manually.")
        break

# Release
cap.release()
cv2.destroyAllWindows()