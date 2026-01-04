
from typing import Optional
import pandas as pd
import numpy as np
from agents.llm import get_llm_client
import json


class AnalyticsState:

    def __init__(
        self,
        cleaned_data: Optional[pd.DataFrame] = None,
        insights: Optional[dict] = None,
        statistics: Optional[dict] = None,
        domain_info: Optional[dict] = None,
        visualization_plan: Optional[dict] = None,
        error: Optional[str] = None,
        status: str = "pending",
    ):
        self.cleaned_data = cleaned_data
        self.insights = insights if insights is not None else {}
        self.statistics = statistics if statistics is not None else {}
        self.domain_info = domain_info if domain_info is not None else {}
        self.visualization_plan = visualization_plan if visualization_plan is not None else {}
        self.error = error
        self.status = status


class AnalyticsAgent:

    def __init__(self):
        self.llm_client = get_llm_client()
    
    def _calculate_statistics(self, df: pd.DataFrame) -> dict:

        stats = {}
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            stats[col] = {
                'mean': float(df[col].mean()),
                'median': float(df[col].median()),
                'std': float(df[col].std()),
                'min': float(df[col].min()),
                'max': float(df[col].max()),
                'q25': float(df[col].quantile(0.25)),
                'q75': float(df[col].quantile(0.75)),
            }
        
        return stats
    
    def _identify_correlations(self, df: pd.DataFrame, threshold: float = 0.5) -> dict:

        numeric_df = df.select_dtypes(include=[np.number])
        correlations = numeric_df.corr()
        
        strong_corrs = {}
        for i in range(len(correlations.columns)):
            for j in range(i+1, len(correlations.columns)):
                corr_value = correlations.iloc[i, j]
                if abs(corr_value) >= threshold:
                    col1 = correlations.columns[i]
                    col2 = correlations.columns[j]
                    strong_corrs[f"{col1}_vs_{col2}"] = float(corr_value)
        
        return strong_corrs
    
    def _generate_categorical_insights(self, df: pd.DataFrame) -> dict:

        insights = {}
        categorical_cols = df.select_dtypes(include=['object']).columns
        
        for col in categorical_cols:
            top_values = df[col].value_counts().head(5)
            insights[col] = {
                'unique_count': int(df[col].nunique()),
                'top_values': top_values.to_dict(),
            }
        
        return insights
    
    """Main analysis pipeline"""
    def analyze_data(self, state: AnalyticsState) -> AnalyticsState:
        try:
            if state.cleaned_data is None:
                state.error = "No cleaned data provided"
                state.status = "failed"
                return state
            
            df = state.cleaned_data
            
            # Calculate statistics
            state.statistics = self._calculate_statistics(df)
            
            # Generate insights
            insights = {}
            insights['correlations'] = self._identify_correlations(df)
            insights['categorical'] = self._generate_categorical_insights(df)
            insights['data_quality'] = {
                'total_rows': len(df),
                'total_columns': len(df.columns),
                'missing_values': int(df.isnull().sum().sum()),
                'completeness': float((1 - df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100),
            }
            
            state.insights = insights

            # generate domain info
            state.domain_info = self._classify_domain(state)

            # generate visualization plan
            state.visualization_plan = self._plan_visualizations(state, state.domain_info)

            state.status = "completed"
            
        except Exception as e:
            state.error = f"Error during analysis: {str(e)}"
            state.status = "failed"
        
        return state
    
    def get_analysis_summary(self, state: AnalyticsState):

        if not state.insights:
            return {}
        
        return {
            'insights': state.insights,
            'statistics': state.statistics,
            'domain_info': state.domain_info,
            'visualization_plan': state.visualization_plan,
            'status': state.status,
        }

    def _classify_domain(self, state: AnalyticsState):

        context = {
            "Column names of datasets": list(state.cleaned_data.columns) if state.cleaned_data is not None else [],
            "Sample data": state.cleaned_data.head(5).to_dict(orient='records') if state.cleaned_data is not None else []
        }
        # "numeric_columns": list(state.statistics.keys()) if state.statistics else [],
        # "categorical_columns": list(state.insights.get('categorical', {}).keys()) if state.insights else [],

        prompt = f"""
        You are a data domain expert.

        Identify the DOMAIN of the dataset.

        Return ONLY valid JSON:
        {{
        "domain": "string",
        "confidence": 0.0,
        "dashboard_focus": ["string"]
        }}

        Context:
        {json.dumps(context, indent=2)}
        """
        # print("Classify Domain Prompt:", prompt)

        response = self.llm_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        return self._extract_json(response.choices[0].message.content)
    
    
    def _plan_visualizations(self, state: AnalyticsState, domain_info: dict):

        analysis_constraints = {
            "dashboard_type": "executive",
            "max_charts": 10,
            "rules": [
                "Do not plot raw multi-series line charts without aggregation",
                "For binary categorical variables, use mean or median, never sum",
                "Do not use heatmap for continuous vs categorical relationships",
                "Prefer aggregated metrics over raw data points",
                "Each chart must answer a question"
            ]
            }
        
        
        context = {
            "domain": domain_info,
            # "statistics": state.statistics,
            "correlations": state.insights.get('correlations', {}),
            "categorical_insights": state.insights.get('categorical', {}),
            "data_quality": state.insights.get('data_quality', {}),
            "columns": list(state.cleaned_data.columns) if state.cleaned_data is not None else [],
            "sample_data": state.cleaned_data.head(5).to_dict(orient='records') if state.cleaned_data is not None else []
        }
        # print(state.cleaned_data.head(5))
        # print("="*10)
        # print(context["sample_data"])
        # print("="*10)

        prompt = f"""
        You are a senior data analyst specializing in the {domain_info["domain"]} domain.

        Design a DASHBOARD tailored to this domain.

        Rules Analysis: {analysis_constraints}

        Constraints:
        - Each chart must be interpretable in under 5 seconds
        - Prefer aggregated metrics over raw data
        - Avoid overplotting
        - Avoid misleading comparisons due to data imbalance
        - Exclude charts that do not directly support a decision

        The reason must explain:
        1. A question answered
        2. Decision it supports


        Return ONLY valid JSON:
        {{
        "charts": [
            {{
            "id": "string",
            "type": "line | bar | scatter | box | histogram | heatmap | pie | area",
            "x": "string or null" (still original column name),
            "y": "string or null" (still original column name),
            "aggregation": "mean | sum | count | null",
            "title": "string",
            "reason": "string",
            "priority": 0.0
            }}
        ]
        }}

        Context:
        {json.dumps(context, indent=2)}
        """

        # print("Plan Visualizations Prompt:", prompt)
        
        response = self.llm_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )


        return self._extract_json(response.choices[0].message.content)

    # self is instance of AnalyticsAgent
    def _extract_json(self, content):
        try:
            # First, try to extract JSON enclosed within ```json and ```
            start_idx = content.find("```json")
            if start_idx != -1:
                start_idx += 7 
                end_idx = content.rfind("```")
                json_content = content[start_idx:end_idx].strip()
            else:
                # If no delimiters, assume entire content could be JSON
                json_content = content.strip()

            # Clean up common issues that might cause parsing errors
            json_content = json_content.replace('None', 'null')  # Replace Python None with JSON null
            json_content = json_content.replace('\n', ' ').replace('\r', ' ')  # Remove newlines
            json_content = ' '.join(json_content.split())  # Normalize whitespace

            # Attempt to parse and return the JSON object
            return json.loads(json_content)

        except json.JSONDecodeError as e:
            print(f"Failed to extract JSON: {e}")

            # Try to clean up the content further if initial parsing fails
            try:
                # Remove any trailing commas before closing brackets/braces
                json_content = json_content.replace(',]', ']').replace(',}', '}')
                return json.loads(json_content)
            except:
                print("Failed to parse JSON even after cleanup")
                return {}

        except Exception as e:
            print(f"Unexpected error while extracting JSON: {e}")
            return {}




if __name__ == "__main__":
    # Simple test
    agent = AnalyticsAgent()
    df = pd.read_csv("Walmart_Sales.csv")
    # stats = agent.calculate_statistics(df)
    # print("Statistics:", stats)
    # corrs = agent.identify_correlations(df)
    # print("Correlations:", corrs)
    # cat_insights = agent.generate_categorical_insights(df)
    # print("Categorical Insights:", cat_insights)

    from agents.cleaning_agent import CleaningAgent, CleaningState
    cleaning_agent = CleaningAgent()
    clean_state = CleaningState(raw_data=df)
    clean_result = cleaning_agent.clean_data(clean_state)
    df = clean_result.cleaned_data
    analysis_state = AnalyticsState(cleaned_data=df)
    result_state = agent.analyze_data(analysis_state)
    with open("analytics_output.json", "w", encoding="utf-8") as f:
        json.dump(result_state.visualization_plan, f, indent=2)
    print("Visualization Plan:", result_state.visualization_plan)