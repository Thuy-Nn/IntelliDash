from typing import Optional
import pandas as pd
import plotly.express as px


class VisualizationState:

    def __init__(
        self,
        cleaned_data: Optional[pd.DataFrame] = None,
        visualization_plan: Optional[dict] = None,
        # visualizations: Optional[dict] = None,
        error: Optional[str] = None,
        status: str = "pending",
    ):
        self.cleaned_data = cleaned_data
        self.visualization_plan = visualization_plan if visualization_plan is not None else {}
        # self.visualizations = visualizations if visualizations is not None else {}
        self.error = error
        self.status = status


class VisualizationAgent:

    def _apply_aggregation(self, df: pd.DataFrame, spec: dict) -> pd.DataFrame:

        x = spec.get("x")
        y = spec.get("y")
        agg = spec.get("aggregation")

        if agg is None or agg == "null":
            return df

        if x is None or y is None:
            raise ValueError("Aggregation requires both x and y")

        if agg == "mean":
            return df.groupby(x, as_index=False)[y].mean()
        elif agg == "sum":
            return df.groupby(x, as_index=False)[y].sum()
        elif agg == "count":
            return df.groupby(x, as_index=False)[y].count()
        else:
            raise ValueError(f"Unsupported aggregation: {agg}")

    def _validate_spec(self, spec: dict):

        chart_type = spec.get("type")
        aggregation = spec.get("aggregation")

        # Line & bar charts must be aggregated for dashboards
        if chart_type in ["line", "bar", "area"] and aggregation in [None, "null"]:
            raise ValueError(
                f"{chart_type} chart must use aggregation for dashboard rendering"
            )

        # Pie chart requires both x and y
        if chart_type == "pie" and (spec.get("x") is None or spec.get("y") is None):
            raise ValueError("Pie chart requires both x (names) and y (values)")

    def _render_chart(self, df: pd.DataFrame, spec: dict):

        chart_type = spec.get("type")
        x = spec.get("x")
        y = spec.get("y")
        title = spec.get("title", "Chart")

        if chart_type == "bar":
            return px.bar(df, x=x, y=y, title=title)

        elif chart_type == "line":
            return px.line(df, x=x, y=y, title=title)

        elif chart_type == "area":
            return px.area(df, x=x, y=y, title=title)

        elif chart_type == "scatter":
            return px.scatter(
                df,
                x=x,
                y=y,
                title=title,
                opacity=0.4,
                trendline="ols"
            )

        elif chart_type == "box":
            return px.box(df, x=x, y=y, title=title)

        elif chart_type == "histogram":
            return px.histogram(df, x=x, title=title)

        elif chart_type == "pie":
            return px.pie(df, names=x, values=y, title=title)

        elif chart_type == "heatmap":
            raise ValueError(
                "Heatmap is not supported for dashboard rendering without explicit correlation matrix"
            )

        else:
            raise ValueError(f"Unsupported chart type: {chart_type}")

    """Render all charts of the visualization plan"""
    def render_charts(self, state: VisualizationState):
        try:
            if state.cleaned_data is None:
                raise ValueError("No cleaned data provided")

            df = state.cleaned_data
            charts = state.visualization_plan.get("charts", [])

            if not charts:
                raise ValueError("No charts found in visualization plan")

            print(f"Rendering {len(charts)} charts...")
            for spec in charts:
                self._validate_spec(spec)
                df_plot = self._apply_aggregation(df, spec)
                fig = self._render_chart(df_plot, spec)
                fig.show()

                print(f"Rendered {spec.get('type')} chart: {spec.get('title')}")

            state.status = "completed"

        except Exception as e:
            state.error = str(e)
            state.status = "failed"

        return state

    def get_visualization_summary(self, result: VisualizationState) -> dict:
        return {
            "visualizations_created": result.status
        }
    
    # def save_dashboard(self, dashboard_html: str, path: str):
    #     with open(path, 'w') as f:
    #         f.write(dashboard_html) 

if __name__ == "__main__":
    df = pd.read_csv("D:\Code\Bachelorarbeit\IntelliDash\Walmart_Sales.csv")

    from agents.cleaning_agent import CleaningAgent, CleaningState
    cleaning_agent = CleaningAgent()
    clean_state = CleaningState(raw_data=df)
    clean_result = cleaning_agent.clean_data(clean_state)
    df = clean_result.cleaned_data

    
    with open(r"D:\Code\Bachelorarbeit\IntelliDash\agents\visualization_agent\plan.json", "r", encoding="utf-8") as f:
        import json
        visualization_plan = json.load(f)
    state = VisualizationState(
        cleaned_data=df,
        visualization_plan=visualization_plan
    )
    agent = VisualizationAgent()
    fig = agent.render_charts(state)


