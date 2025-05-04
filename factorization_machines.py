import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from fastFM import als

# Generate synthetic data
np.random.seed(42)
n_samples, n_features = 1000, 10
X = np.random.rand(n_samples, n_features)
y = np.random.randint(2, size=n_samples)

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize the Factorization Machine model
fm = als.FMRegression(n_iter=100, rank=10, l2_reg_w=0.1, l2_reg_V=0.1)

# Train the model
fm.fit(X_train, y_train)

# Make predictions
y_pred = fm.predict(X_test)

# Evaluate the model
mse = mean_squared_error(y_test, y_pred)
print(f"Mean Squared Error: {mse:.4f}")