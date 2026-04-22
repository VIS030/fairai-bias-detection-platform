"""
Bias Mitigation Service using Fairlearn's ExponentiatedGradient.
Applies DemographicParity constraint to reduce bias.
"""
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from fairlearn.reductions import ExponentiatedGradient, DemographicParity
from fairlearn.metrics import demographic_parity_difference, equalized_odds_difference
import warnings
warnings.filterwarnings('ignore')


class BiasMitigation:
    """Applies bias mitigation using ExponentiatedGradient."""

    def __init__(self):
        self.mitigated_model = None

    def apply_mitigation(self, X_train, X_test, y_train, y_test,
                         sensitive_train, sensitive_test,
                         label_encoders=None) -> dict:
        """
        Apply ExponentiatedGradient with DemographicParity constraint.
        Returns before and after comparison metrics.
        """
        # Before mitigation: train a base model
        base_model = LogisticRegression(max_iter=1000, random_state=42)
        base_model.fit(X_train, y_train)
        y_pred_before = base_model.predict(X_test)

        # Before metrics
        before_metrics = self._compute_metrics(y_test, y_pred_before, sensitive_test)
        before_groups = self._compute_group_metrics(
            y_test, y_pred_before, sensitive_test, label_encoders
        )

        # Apply ExponentiatedGradient mitigation
        constraint = DemographicParity()
        mitigator = ExponentiatedGradient(
            estimator=LogisticRegression(max_iter=1000, random_state=42),
            constraints=constraint,
            max_iter=50
        )

        mitigator.fit(X_train, y_train, sensitive_features=sensitive_train)
        self.mitigated_model = mitigator

        y_pred_after = mitigator.predict(X_test)

        # After metrics
        after_metrics = self._compute_metrics(y_test, y_pred_after, sensitive_test)
        after_groups = self._compute_group_metrics(
            y_test, y_pred_after, sensitive_test, label_encoders
        )

        # Compute improvement
        improvement = {
            "demographic_parity": round(
                abs(before_metrics["demographic_parity_difference"]) -
                abs(after_metrics["demographic_parity_difference"]), 4
            ),
            "equalized_odds": round(
                abs(before_metrics["equalized_odds_difference"]) -
                abs(after_metrics["equalized_odds_difference"]), 4
            ),
            "accuracy_change": round(
                after_metrics["accuracy"] - before_metrics["accuracy"], 4
            ),
        }

        return {
            "before": before_metrics,
            "after": after_metrics,
            "before_groups": before_groups,
            "after_groups": after_groups,
            "improvement": improvement,
        }

    def _compute_metrics(self, y_true, y_pred, sensitive_features) -> dict:
        """Compute all relevant metrics."""
        dpd = demographic_parity_difference(y_true, y_pred,
                                            sensitive_features=sensitive_features)
        eod = equalized_odds_difference(y_true, y_pred,
                                        sensitive_features=sensitive_features)

        return {
            "demographic_parity_difference": round(float(dpd), 4),
            "equalized_odds_difference": round(float(eod), 4),
            "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
            "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 4),
            "recall": round(float(recall_score(y_true, y_pred, zero_division=0)), 4),
            "f1_score": round(float(f1_score(y_true, y_pred, zero_division=0)), 4),
        }

    def _compute_group_metrics(self, y_true, y_pred, sensitive_features,
                               label_encoders=None) -> list:
        """Compute per-group metrics."""
        groups = sensitive_features.unique()
        group_metrics = []

        for g in sorted(groups):
            mask = sensitive_features == g
            group_total = int(mask.sum())
            group_positive = int(y_pred[mask].sum())
            positive_rate = round(float(group_positive / group_total), 4) if group_total > 0 else 0

            # Get original group name
            if label_encoders and 'sex' in label_encoders:
                try:
                    group_name = label_encoders['sex'].inverse_transform([g])[0]
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

        return group_metrics
