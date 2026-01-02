from typing import Optional
import pandas as pd


class VisualizationState:

    def __init__(
        self,
        cleaned_data: Optional[pd.DataFrame] = None,
        visualization_plan: Optional[dict] = None,
        visualizations: Optional[list] = None,
        error: Optional[str] = None,
        status: str = "pending",
    ):
        self.cleaned_data = cleaned_data
        self.visualization_plan = visualization_plan if visualization_plan is not None else {}
        self.visualizations = visualizations if visualizations is not None else {}
        self.error = error
        self.status = status

class VisualizationAgent:

    def _apply_aggregation(self, df: pd.DataFrame, spec: dict):

        x = spec.get("x")
        y = spec.get("y")
        agg = spec.get("aggregation")

        if x is None or y is None:
            raise ValueError("Aggregation requires both x and y")        
        
        data = {}
        if agg is None or agg == "null":
            data["x"] = df[x].tolist()
            data["y"] = df[y].tolist()
            return data     

        if agg == "mean":
            df_plot = df.groupby(x, as_index=False)[y].mean()
            df_plot[y] = df_plot[y].round(2)
            data["x"] = df_plot[x].tolist()
            data["y"] = df_plot[y].tolist()
        elif agg == "sum":
            df_plot = df.groupby(x, as_index=False)[y].sum()
            df_plot[y] = df_plot[y].round(2)
            data["x"] = df_plot[x].tolist()
            data["y"] = df_plot[y].tolist()
        elif agg == "count":
            df_plot = df.groupby(x, as_index=False)[y].count()
            df_plot[y] = df_plot[y].round(2)
            data["x"] = df_plot[x].tolist()
            data["y"] = df_plot[y].tolist()
        else:
            raise ValueError(f"Unsupported aggregation: {agg}")

        return data

    def __call__(self, state: VisualizationState) -> VisualizationState:

        try:
            charts = []
            if state.cleaned_data is None:
                raise ValueError("No cleaned data provided")
            df = state.cleaned_data
            chart_plans = state.visualization_plan.get("charts", [])
            for spec in chart_plans:
                values = self._apply_aggregation(df, spec)
                charts.append({
                    "chart": spec,
                    "values": values
                })
            state.visualizations = charts
            state.status = "success"

        except Exception as e:
            state.error = str(e)
            state.status = "failed"

        return state

if __name__ == "__main__":
    agent = VisualizationAgent()
    viz_state = VisualizationState()
    # Example usage
    df = pd.read_csv("D:\Code\Bachelorarbeit\IntelliDash\Walmart_Sales.csv")
    from agents.cleaning_agent import CleaningAgent, CleaningState
    cleaning_agent = CleaningAgent()
    clean_state = CleaningState(raw_data=df)
    clean_result = cleaning_agent.clean_data(clean_state)
    df = clean_result.cleaned_data
    viz_state.cleaned_data = df
    with open(r"D:\Code\Bachelorarbeit\IntelliDash\agents\visualization_agent\plan.json", "r", encoding="utf-8") as f:
        import json
        visualization_plan = json.load(f)
        print("Loaded visualization plan:", visualization_plan)
        print("-" * 50)
    viz_state.visualization_plan = visualization_plan
    print("viz_state:", viz_state.visualization_plan)
    print("-" * 50)
    charts = agent(viz_state)
    print("Generated charts:", charts.visualizations)

    with open("visualization_output.json", "w", encoding="utf-8") as f:
        json.dump(charts.visualizations, f, indent=4)
