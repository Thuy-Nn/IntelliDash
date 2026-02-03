from typing import Optional
import pandas as pd
from CFG import MAX_DENSITY, CSV_UNIT


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
        self.visualizations = visualizations if visualizations is not None else []
        self.error = error
        self.status = status

class VisualizationAgent:

    def _apply_aggregation(self, df: pd.DataFrame, spec: dict):

        x = spec.get("x")
        y = spec.get("y")
        agg = spec.get("aggregation")

        if spec.get("type") == "single_value":
            if agg == "mean":
                value = round(df[y].mean(), 2)
            elif agg == "sum":
                value = round(df[y].sum(), 2)
            elif agg == "count":
                value = int(df[y].count())
            else:
                raise ValueError(f"Unsupported aggregation for single_value: {agg}")

            value = format_large_number(value)
            unit = CSV_UNIT.get(y, "")
            if unit:
                if unit.endswith("-"):
                    return {"value": value, "unit": unit[1:], "position": "prefix"}

            return {"value": value}
        
        if x is None or y is None:
            raise ValueError("Both 'x' and 'y' must be specified for non-single_value charts")
        
        data = {}
        if agg is None or agg == "null":
            data["x"] = df[x].tolist()
            data["y"] = df[y].tolist()

            # reduce density for scatter plots
            if spec.get("type") == "scatter":
                max_points = MAX_DENSITY
                if len(data["x"]) > max_points:
                    step = len(data["x"]) // max_points
                    data["x"] = data["x"][::step]
                    data["y"] = data["y"][::step]

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
        
        # reduce density for line/bar charts
        if spec.get("type") in ["line", "bar"]:
            max_points = MAX_DENSITY
            if len(data["x"]) > max_points:
                step = len(data["x"]) // (max_points - 1) + 1
                data["x"] = data["x"][::step]
                data["y"] = data["y"][::step]

        return data

    def __call__(self, state: VisualizationState) -> VisualizationState:

        try:
            charts = []
            if state.cleaned_data is None:
                raise ValueError("No cleaned data provided")
            df = state.cleaned_data
            chart_plans = state.visualization_plan.get("charts", [])
            for spec in chart_plans:
                try:
                    values = self._apply_aggregation(df, spec)
                    # print("Chart type:", spec.get("type"))
                    # print("Chart Values:", values.keys())
                    # print('-' * 20)
                    charts.append({
                        "chart": spec,
                        "values": values
                    })
                except Exception as e:
                    print(f"Error processing chart spec {spec}: {e}")
            state.visualizations = charts
            state.status = "success"

        except Exception as e:
            state.error = str(e)
            state.status = "failed"

        return state


# Format big  number, eg: 1234 -> 1.2K 1234567 to 1.2M
def format_large_number(num):
    for unit in ['', 'K', 'M', 'B', 'T']:
        if abs(num) < 1000.0:
            return f"{num:.1f}{unit}"
        num /= 1000.0
    return f"{num:.1f}P"


if __name__ == "__main__":
    agent = VisualizationAgent()
    viz_state = VisualizationState()
    # Example usage
    df = pd.read_csv("Walmart_Sales.csv")
    from agents.cleaning_agent import CleaningAgent, CleaningState
    cleaning_agent = CleaningAgent()
    clean_state = CleaningState(raw_data=df)
    clean_result = cleaning_agent.clean_data(clean_state)
    df = clean_result.cleaned_data
    viz_state.cleaned_data = df
    with open(r"analytics_output.json", "r", encoding="utf-8") as f:
        import json
        viz_plan = json.load(f)
        # print("Loaded visualization plan:", viz_plan)
        # print("-" * 50)
    viz_state.visualization_plan = viz_plan
    print("viz_state:", viz_state.visualization_plan)
    print("-" * 50)
    charts = agent(viz_state)
    # print("Generated charts:", charts.visualizations)

    with open(r"visualization_output.json", "w", encoding="utf-8") as f:
        json.dump(charts.visualizations, f)
