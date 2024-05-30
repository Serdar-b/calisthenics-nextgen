from os import environ
environ['PYGAME_HIDE_SUPPORT_PROMPT'] = '1'

import cv2
import numpy as np
import mediapipe as mp  
import pickle
import pandas as pd
import pygame

pygame.mixer.init()

def play_sound(soundfile, channel, duration_ms=500, volume=1.2):
    sound = pygame.mixer.Sound(soundfile)
    sound.set_volume(volume)
    pygame.mixer.Channel(channel).play(sound, maxtime=duration_ms)

MODEL_PATH = './models/pushupsNEW.pkl'
VIDEO_PATH = 'Boxning_händer.mp4'
VIDEO_PATH = './videos/situpstraintest.mp4'

with open(MODEL_PATH, 'rb') as f:
    model = pickle.load(f)

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

cap = cv2.VideoCapture(0)
printed = False

counter = 0
up_stage = False
middle_stage = False
probability_cap = 0.6

# Create landmark labels for right arm keypoints
landmarks = ['class']
for val in range(1, 33+1):
    landmarks += ['x{}'.format(val), 'y{}'.format(val), 'z{}'.format(val)]
realstage = ''

with mp_pose.Pose(static_image_mode=False, model_complexity=1, smooth_landmarks=True, min_detection_confidence=0.5,
                    min_tracking_confidence=0.5) as pose:
    
    while cap.isOpened():
        ret, frame = cap.read()

        if not ret:
            break
        
        image = cv2.resize(frame, (960, 540))

        # Recolor Feed
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        
        # Make Detections
        results = pose.process(image)
        
        # Recolor image back to BGR for rendering
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        try:

             if results.pose_world_landmarks:

                row = np.array([[landmark.x, landmark.y, landmark.z] for landmark in results.pose_world_landmarks.landmark]).flatten().tolist()
                X = pd.DataFrame([row], columns=landmarks[1:])
                stage = model.predict(X)[0]
                prob = model.predict_proba(X).max()
                if prob >= 0.5:
                    if stage == 'up' and up_stage == False:
                        up_stage = True
                        play_sound("./sounds/up.mp3", 0, duration_ms=1000, volume=0.3)
                    elif stage == 'middle' and middle_stage == False:
                        middle_stage = True
                    elif stage == 'down' and middle_stage and up_stage:
                        play_sound("./sounds/beep.mp3", 0, duration_ms=1000, volume=0.3)
                        counter += 1
                        middle_stage = False
                        up_stage = False

                mp.solutions.drawing_utils.draw_landmarks(image, results.pose_landmarks, mp.solutions.pose.POSE_CONNECTIONS,
                      landmark_drawing_spec=mp.solutions.drawing_styles.get_default_pose_landmarks_style())
                
                cv2.putText(image, f'Stage: {stage}, Prob: {prob:.2f}', (10,50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,255), 2, cv2.LINE_AA)
                cv2.putText(image, f'Count: {counter}', (10,90), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,255), 2, cv2.LINE_AA)


            
        except Exception as e:
            print(e)
            

        cv2.imshow('Raw Webcam Feed', image)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
        
cap.release()
cv2.destroyAllWindows()