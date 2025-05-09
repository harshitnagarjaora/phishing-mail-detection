import pickle
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

# Load your dataset
df = pd.read_csv("Phishing_Email.csv").dropna(subset=["Email Text"])

# Convert labels to binary (1 = Phishing, 0 = Safe)
df["Email Type"] = df["Email Type"].apply(lambda x: 1 if x == "Phishing Email" else 0)

# Split dataset into training and testing
X_train, X_test, y_train, y_test = train_test_split(
    df["Email Text"], df["Email Type"], test_size=0.2, stratify=df["Email Type"], random_state=42
)

# Vectorize text using TF-IDF
vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

# Train Logistic Regression model
model = LogisticRegression(max_iter=1000, random_state=42)
model.fit(X_train_tfidf, y_train)

# Save the trained model
with open("model.pkl", "wb") as model_file:
    pickle.dump(model, model_file)

# Save the vectorizer
with open("vectorizer.pkl", "wb") as vectorizer_file:
    pickle.dump(vectorizer, vectorizer_file)

print("✅ Model and vectorizer saved successfully!")