"""
Insights Engine: Rule-based smart insight generation for bias analysis.
Generates human-readable explanations and recommendations.
"""


class InsightsEngine:
    """Generates AI-like insights based on analysis results."""

    def generate_insights(self, analysis_data: dict) -> list:
        """
        Generate insights based on bias analysis results.
        
        Args:
            analysis_data: Dictionary containing:
                - dataset_summary: dataset stats
                - bias_metrics: fairness metrics
                - group_metrics: per-group statistics
                - feature_importance: feature weights
                - model_metrics: model performance
                - mitigation_results: before/after (optional)
        """
        insights = []

        dataset_summary = analysis_data.get("dataset_summary", {})
        bias_metrics = analysis_data.get("bias_metrics", {})
        group_metrics = analysis_data.get("group_metrics", [])
        feature_importance = analysis_data.get("feature_importance", {})
        model_metrics = analysis_data.get("model_metrics", {})

        # 1. Dataset Imbalance Detection
        target_dist = dataset_summary.get("target_distribution", {})
        if target_dist:
            values = list(target_dist.values())
            if len(values) >= 2:
                ratio = min(values) / max(values) if max(values) > 0 else 0
                if ratio < 0.4:
                    insights.append({
                        "title": "Dataset Imbalance Detected",
                        "description": f"The target variable shows significant imbalance "
                                       f"({', '.join([f'{k}: {v}' for k, v in target_dist.items()])}). "
                                       f"This can cause the model to be biased toward the majority class, "
                                       f"leading to unfair predictions for underrepresented groups.",
                        "severity": "high",
                        "category": "imbalance",
                        "icon": "⚠️"
                    })
                else:
                    insights.append({
                        "title": "Balanced Target Distribution",
                        "description": f"The target variable distribution is relatively balanced "
                                       f"({', '.join([f'{k}: {v}' for k, v in target_dist.items()])}). "
                                       f"This is good for fair model training.",
                        "severity": "info",
                        "category": "imbalance",
                        "icon": "✅"
                    })

        # 2. Sensitive Group Imbalance
        sensitive_dist = dataset_summary.get("sensitive_distribution", {})
        if sensitive_dist:
            values = list(sensitive_dist.values())
            if len(values) >= 2:
                ratio = min(values) / max(values) if max(values) > 0 else 0
                minority_group = min(sensitive_dist, key=sensitive_dist.get)
                majority_group = max(sensitive_dist, key=sensitive_dist.get)
                if ratio < 0.5:
                    insights.append({
                        "title": "Sensitive Group Underrepresentation",
                        "description": f"The group '{minority_group}' is significantly underrepresented "
                                       f"compared to '{majority_group}' "
                                       f"(ratio: {ratio:.2f}). This underrepresentation can amplify "
                                       f"existing biases and lead to less reliable predictions for "
                                       f"the minority group.",
                        "severity": "high",
                        "category": "imbalance",
                        "icon": "👥"
                    })

        # 3. Demographic Parity Analysis
        dpd = bias_metrics.get("demographic_parity_difference", 0)
        if abs(dpd) > 0.1:
            severity = "high" if abs(dpd) > 0.2 else "medium"
            insights.append({
                "title": "Significant Demographic Parity Gap",
                "description": f"The Demographic Parity Difference is {dpd:.4f}, which exceeds "
                               f"the fairness threshold of ±0.10. This means different demographic "
                               f"groups receive positive outcomes at significantly different rates, "
                               f"indicating systemic bias in the model's predictions.",
                "severity": severity,
                "category": "bias",
                "icon": "📊"
            })
        elif abs(dpd) > 0.05:
            insights.append({
                "title": "Moderate Demographic Parity Concern",
                "description": f"The Demographic Parity Difference is {dpd:.4f}. While below "
                               f"the critical threshold, there is still a noticeable gap between "
                               f"groups. Consider monitoring and applying mitigation techniques.",
                "severity": "medium",
                "category": "bias",
                "icon": "📊"
            })
        else:
            insights.append({
                "title": "Fair Demographic Parity",
                "description": f"The Demographic Parity Difference is {dpd:.4f}, which is within "
                               f"acceptable bounds. The model treats different demographic groups "
                               f"relatively equally in terms of positive outcome rates.",
                "severity": "info",
                "category": "bias",
                "icon": "✅"
            })

        # 4. Equal Opportunity Analysis
        eod = bias_metrics.get("equalized_odds_difference", 0)
        if abs(eod) > 0.1:
            severity = "high" if abs(eod) > 0.2 else "medium"
            insights.append({
                "title": "Equal Opportunity Violation",
                "description": f"The Equalized Odds Difference is {eod:.4f}. This means the "
                               f"model has different true positive rates and false positive rates "
                               f"across groups. Qualified individuals from different groups have "
                               f"unequal chances of receiving positive predictions.",
                "severity": severity,
                "category": "bias",
                "icon": "⚖️"
            })

        # 5. Group Outcome Disparity
        if len(group_metrics) >= 2:
            rates = [(g["group"], g["positive_rate"]) for g in group_metrics]
            max_rate = max(rates, key=lambda x: x[1])
            min_rate = min(rates, key=lambda x: x[1])
            gap = max_rate[1] - min_rate[1]

            if gap > 0.05:
                insights.append({
                    "title": f"Outcome Disparity: {max_rate[0]} vs {min_rate[0]}",
                    "description": f"'{max_rate[0]}' receives positive outcomes at a rate of "
                                   f"{max_rate[1]:.1%}, while '{min_rate[0]}' receives them at "
                                   f"{min_rate[1]:.1%} — a gap of {gap:.1%}. "
                                   f"This disparity suggests the model may be perpetuating existing "
                                   f"societal biases present in the training data.",
                    "severity": "high" if gap > 0.15 else "medium",
                    "category": "bias",
                    "icon": "🔍"
                })

        # 6. Sensitive Feature Impact
        if feature_importance:
            sensitive_col = dataset_summary.get("sensitive_column", "sex")
            if sensitive_col in feature_importance:
                imp = feature_importance[sensitive_col]
                all_imps = list(feature_importance.values())
                rank = sorted(all_imps, reverse=True).index(imp) + 1

                if rank <= 3:
                    insights.append({
                        "title": "Sensitive Feature Highly Impactful",
                        "description": f"The sensitive feature '{sensitive_col}' ranks #{rank} "
                                       f"in feature importance (weight: {imp:.4f}). "
                                       f"This means gender is one of the top predictors, "
                                       f"directly contributing to biased outcomes. Consider "
                                       f"removing or deweighting this feature.",
                        "severity": "high",
                        "category": "feature",
                        "icon": "🎯"
                    })
                else:
                    insights.append({
                        "title": "Sensitive Feature Has Limited Direct Impact",
                        "description": f"The sensitive feature '{sensitive_col}' ranks #{rank} "
                                       f"in feature importance (weight: {imp:.4f}). "
                                       f"While not a top predictor, bias can still propagate "
                                       f"through correlated features (proxy discrimination).",
                        "severity": "low",
                        "category": "feature",
                        "icon": "🎯"
                    })

        # 7. Model Performance Insight
        accuracy = model_metrics.get("accuracy", 0)
        if accuracy > 0:
            insights.append({
                "title": f"Model Accuracy: {accuracy:.1%}",
                "description": f"The base model achieves {accuracy:.1%} accuracy with "
                               f"precision: {model_metrics.get('precision', 0):.1%}, "
                               f"recall: {model_metrics.get('recall', 0):.1%}, "
                               f"F1: {model_metrics.get('f1_score', 0):.1%}. "
                               f"Note: High accuracy doesn't guarantee fairness — a model can "
                               f"be accurate overall while being unfairly biased against specific groups.",
                "severity": "info",
                "category": "recommendation",
                "icon": "📈"
            })

        # 8. Recommendations
        if abs(dpd) > 0.1 or abs(eod) > 0.1:
            insights.append({
                "title": "Recommended: Apply Bias Mitigation",
                "description": "Based on the detected bias levels, we strongly recommend "
                               "applying the ExponentiatedGradient mitigation technique. "
                               "This in-processing method adjusts the model during training "
                               "to satisfy demographic parity constraints while maintaining "
                               "reasonable accuracy.",
                "severity": "medium",
                "category": "recommendation",
                "icon": "💡"
            })

            insights.append({
                "title": "Consider Data Collection Improvements",
                "description": "Long-term bias reduction requires addressing root causes: "
                               "1) Collect more representative data for underrepresented groups. "
                               "2) Audit historical data for labeling bias. "
                               "3) Include fairness constraints in your ML pipeline. "
                               "4) Regularly monitor deployed models for bias drift.",
                "severity": "low",
                "category": "recommendation",
                "icon": "📋"
            })

        # 9. Top Features Driving Predictions
        if feature_importance:
            top_3 = list(feature_importance.items())[:3]
            features_str = ", ".join([f"'{k}' ({v:.3f})" for k, v in top_3])
            insights.append({
                "title": "Key Prediction Drivers",
                "description": f"The top features driving predictions are: {features_str}. "
                               f"Understanding these drivers helps identify whether the model "
                               f"relies on legitimate factors or potentially discriminatory proxies.",
                "severity": "info",
                "category": "feature",
                "icon": "🔑"
            })

        return insights
