import time
import csv
import os
import numpy as np
import cv2
import mediapipe as mp

EXPORT_PATH = './csv/pushupsNEW.csv'  
VIDEO_PATH = './videos/pushupsDOWN.mp4'

# right_arm_indices = [12, 14, 16, 18, 20, 22] 

landmarks = ['class']
for val in range(1, 33+1):
    landmarks += ['x{}'.format(val), 'y{}'.format(val), 'z{}'.format(val)]

mp_pose = mp.solutions.pose

if not os.path.isfile(EXPORT_PATH):
    # File does not exist, create it and write the header row
    with open(EXPORT_PATH, mode='w', newline='') as csvfile:
        csv.writer(csvfile).writerow(landmarks)

def export_landmark(results, action):
    try:
        keypoints = np.array([[res.x, res.y, res.z] for res in results.pose_world_landmarks.landmark]).flatten().tolist()
        keypoints.insert(0, action)
        
        with open(EXPORT_PATH, mode='a', newline='') as f:
            csv_writer = csv.writer(f, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
            csv_writer.writerow(keypoints)
    except Exception as e:
        print(e)

cap = cv2.VideoCapture(VIDEO_PATH)
# Initiate holistic model
with mp.solutions.pose.Pose(static_image_mode=False, model_complexity=2, smooth_landmarks=True, min_detection_confidence=0.5,
                    min_tracking_confidence=0.5) as pose:
    
    while cap.isOpened():
        ret, frame = cap.read()

        # time.sleep(0.05)

        if not ret:
            break

        # Recolor Feed
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        
        # Make Detections
        results = pose.process(image)

        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            
        if results.pose_world_landmarks:
        
            landmarks = results.pose_world_landmarks.landmark
        
            #from the video export your desired classifications
            k = cv2.waitKey(1)
            if k == ord('w'):
                export_landmark(results, 'up')
            elif k == ord('d'):
                export_landmark(results, 'middle')
            elif k == ord('s'):
                export_landmark(results, 'down')


            mp.solutions.drawing_utils.draw_landmarks(image, results.pose_landmarks, mp.solutions.pose.POSE_CONNECTIONS,
                landmark_drawing_spec=mp.solutions.drawing_styles.get_default_pose_landmarks_style())
            
        cv2.imshow('Raw Webcam Feed', image)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
        
cap.release()
cv2.destroyAllWindows()

