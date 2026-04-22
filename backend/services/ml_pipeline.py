"""
ML Pipeline: Data preprocessing, model training, and bias metric computation.
Uses Logistic Regression and Fairlearn for bias detection.
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from fairlearn.metrics import demographic_parity_difference, equalized_odds_difference
import json
import warnings
warnings.filterwarnings('ignore')


class MLPipeline:
    """Handles data preprocessing, model training, and bias detection."""

    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.sensitive_train = None
        self.sensitive_test = None
        self.feature_names = None
        self.df_processed = None

    def preprocess_data(self, df: pd.DataFrame, target_col: str = "income",
                        sensitive_col: str = "sex") -> dict:
        """
        Preprocess the dataset: handle missing values, encode features, split data.
        Returns dataset summary statistics.
        """
        df = df.copy()

        # Clean column names
        df.columns = [c.strip().replace('"', '') for c in df.columns]

        # Replace '?' with NaN and drop
        df.replace('?', np.nan, inplace=True)
        df.replace(' ?', np.nan, inplace=True)
        rows_before = len(df)
        df.dropna(inplace=True)
        rows_after = len(df)

        # Dataset summary
        summary = {
            "total_records": rows_after,
            "dropped_records": rows_before - rows_after,
            "columns": list(df.columns),
            "target_column": target_col,
            "sensitive_column": sensitive_col,
        }

        # Encode target variable
        if target_col in df.columns:
            # Handle income encoding: <=50K -> 0, >50K -> 1
            if target_col == "income":
                df[target_col] = df[target_col].apply(
                    lambda x: 1 if '>50K' in str(x) else 0
                )
            else:
                le = LabelEncoder()
                df[target_col] = le.fit_transform(df[target_col])

        # Store sensitive feature before encoding
        sensitive_values = df[sensitive_col].copy()

        # Compute group distribution
        target_dist = df[target_col].value_counts().to_dict()
        sensitive_dist = df[sensitive_col].value_counts().to_dict()
        summary["target_distribution"] = {str(k): int(v) for k, v in target_dist.items()}
        summary["sensitive_distribution"] = {str(k): int(v) for k, v in sensitive_dist.items()}

        # Encode categorical features
        categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
        for col in categorical_cols:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            self.label_encoders[col] = le

        # Separate features and target
        X = df.drop(columns=[target_col])
        y = df[target_col]

        # Get sensitive feature (encoded)
        sensitive_feature = X[sensitive_col]

        # Store feature names
        self.feature_names = X.columns.tolist()

        # Split data
        self.X_train, self.X_test, self.y_train, self.y_test, \
            self.sensitive_train, self.sensitive_test = train_test_split(
                X, y, sensitive_feature, test_size=0.2, random_state=42, stratify=y
            )

        # Scale features
        self.X_train = pd.DataFrame(
            self.scaler.fit_transform(self.X_train),
            columns=self.feature_names,
            index=self.X_train.index
        )
        self.X_test = pd.DataFrame(
            self.scaler.transform(self.X_test),
            columns=self.feature_names,
            index=self.X_test.index
        )

        self.df_processed = df
        return summary

    def train_model(self) -> dict:
        """
        Train a Logistic Regression model and return performance metrics.
        """
        self.model = LogisticRegression(max_iter=1000, random_state=42, C=1.0)
        self.model.fit(self.X_train, self.y_train)

        y_pred = self.model.predict(self.X_test)

        metrics = {
            "accuracy": round(float(accuracy_score(self.y_test, y_pred)), 4),
            "precision": round(float(precision_score(self.y_test, y_pred, zero_division=0)), 4),
            "recall": round(float(recall_score(self.y_test, y_pred, zero_division=0)), 4),
            "f1_score": round(float(f1_score(self.y_test, y_pred, zero_division=0)), 4),
        }

        return metrics

    def compute_bias_metrics(self) -> dict:
        """
        Compute fairness metrics using Fairlearn.
        Returns bias metrics and group-level statistics.
        """
        y_pred = self.model.predict(self.X_test)

        # Compute fairness metrics
        dpd = demographic_parity_difference(
            self.y_test, y_pred,
            sensitive_features=self.sensitive_test
        )

        eod = equalized_odds_difference(
            self.y_test, y_pred,
            sensitive_features=self.sensitive_test
        )

        # Group-level metrics
        groups = self.sensitive_test.unique()
        group_metrics = []

        for g in sorted(groups):
            mask = self.sensitive_test == g
            group_total = int(mask.sum())
            group_positive = int(y_pred[mask].sum())
            positive_rate = round(float(group_positive / group_total), 4) if group_total > 0 else 0

            # Try to get the original group name
            if 'sex' in self.label_encoders:
                try:
                    group_name = self.label_encoders['sex'].inverse_transform([g])[0]
                except:
                    group_name = str(g)
            else:
                group_name = str(g)

            group_metrics.append({
                "group": group_name,
                "positive_rate": positive_rate,
                "count": group_total,
                "positive_count": group_positive,
            })

        return {
            "demographic_parity_difference": round(float(dpd), 4),
            "equalized_odds_difference": round(float(eod), 4),
            "group_metrics": group_metrics,
        }

    def get_feature_importance(self) -> dict:
        """Extract feature importance from the trained model."""
        if self.model is None:
            return {}

        importance = np.abs(self.model.coef_[0])
        feature_imp = dict(zip(self.feature_names, [round(float(x), 4) for x in importance]))

        # Sort by importance
        feature_imp = dict(sorted(feature_imp.items(), key=lambda x: x[1], reverse=True))

        # Return top 10
        top_features = dict(list(feature_imp.items())[:10])
        return top_features

    def get_model(self):
        """Return the trained model."""
        return self.model

    def get_test_data(self):
        """Return test data for mitigation."""
        return self.X_train, self.X_test, self.y_train, self.y_test, \
            self.sensitive_train, self.sensitive_test
