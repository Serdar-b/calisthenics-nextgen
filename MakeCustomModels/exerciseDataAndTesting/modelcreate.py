import pandas as pd
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
import pickle


EXPORT_PATH = "./csv/pushupsNEW.csv"
MODEL_PATH = "./models/pushupsNEW.pkl"

# Load data
df = pd.read_csv(EXPORT_PATH)

X = df.drop('class', axis=1)
y = df['class']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=1234)

pipeline = make_pipeline(StandardScaler(), RandomForestClassifier(random_state=1234))

# Train the model
model = pipeline.fit(X_train, y_train)

yhat = model.predict(X_test)

accuracy = accuracy_score(y_test, yhat)
precision = precision_score(y_test, yhat, average='macro')
recall = recall_score(y_test, yhat, average='macro')
f1 = f1_score(y_test, yhat, average='macro')

print(f'Accuracy: {accuracy}')
print(f'Precision: {precision}')
print(f'Recall: {recall}')
print(f'F1 Score: {f1}')

# Feature Importance
feature_importances = model.named_steps['randomforestclassifier'].feature_importances_
features = X.columns
importance_df = pd.DataFrame({'Feature': features, 'Importance': feature_importances}).sort_values(by='Importance', ascending=False)
print(importance_df.head())  

param_grid = {
    'randomforestclassifier__n_estimators': [100, 200],
    'randomforestclassifier__max_depth': [None, 10, 20],
}

grid_search = GridSearchCV(pipeline, param_grid, cv=5)
grid_search.fit(X_train, y_train)
print(f'Best parameters: {grid_search.best_params_}')
print(f'Best cross-validated score: {grid_search.best_score_}')

# Save the trained model with best parameters
best_model = grid_search.best_estimator_
with open(MODEL_PATH, 'wb') as f:
    pickle.dump(best_model, f)
