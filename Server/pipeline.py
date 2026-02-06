
from pathlib import Path
from typing import TypedDict, Any, Optional
from dotenv import load_dotenv

from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI

from agents import IngestionAgent, CleaningAgent, AnalyticsAgent, VisualizationAgent, IngestionState, CleaningState, AnalyticsState, VisualizationState


load_dotenv(Path(__file__).parent / 'agents' / '.env')


class DashboardState(TypedDict):

    file_path: str
    raw_data: Any
    cleaned_data: Any
    visualization_plan: dict
    visualizations: dict
    messages: list
    error: Optional[str]
    current_stage: str


class DashboardOrchestrator:
    
    def __init__(self):
        self.ingestion_agent = IngestionAgent()
        self.cleaning_agent = CleaningAgent()
        self.analytics_agent = AnalyticsAgent()
        self.visualization_agent = VisualizationAgent()
        self.llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0
        )
        self.graph = self._build_graph()
    
    def _build_graph(self):
        """Build the LangGraph workflow"""
        workflow = StateGraph(DashboardState)
        
        # Add nodes
        workflow.add_node("ingestion", self._ingestion_node)
        workflow.add_node("cleaning", self._cleaning_node)
        workflow.add_node("analytics", self._analytics_node)
        workflow.add_node("visualization", self._visualization_node)
        workflow.add_node("finalize", self._finalize_node)
        
        # Add edges
        workflow.set_entry_point("ingestion")
        workflow.add_edge("ingestion", "cleaning")
        workflow.add_edge("cleaning", "analytics")
        workflow.add_edge("analytics", "visualization")
        workflow.add_edge("visualization", "finalize")
        workflow.add_edge("finalize", END)
        
        return workflow.compile()
    
    def _ingestion_node(self, state: DashboardState) -> DashboardState:
        print("\n Stage 1: Data Ingestion")
        print("-" * 50)
        
        ingestion_state = IngestionState(file_path=state["file_path"])
        result = self.ingestion_agent.load_data(ingestion_state)
        
        state["current_stage"] = "ingestion"
        state["messages"].append(f"Ingestion: {result.status}")
        
        if result.status == "completed":
            state["raw_data"] = result.raw_data
            summary = self.ingestion_agent.get_data_summary(result)
            print(f"Data loaded successfully!")
            print(f"   Shape: {summary['total_rows']} rows × {summary['total_columns']} columns")
            print(f"   Columns: {', '.join(summary['columns'][:5])}{'...' if len(summary['columns']) > 5 else ''}")
        else:
            state["error"] = result.error
            print(f"Error: {result.error}")
        
        return state
    
    def _cleaning_node(self, state: DashboardState) -> DashboardState:
        print("\nStage 2: Data Cleaning")
        print("-" * 50)
        
        if state["error"]:
            print(f"Skipping (previous error)")
            return state
        
        cleaning_state = CleaningState(raw_data=state["raw_data"])
        result = self.cleaning_agent.clean_data(cleaning_state)
        
        state["current_stage"] = "cleaning"
        state["messages"].append(f"Cleaning: {result.status}")
        
        if result.status == "completed":
            state["cleaned_data"] = result.cleaned_data
            summary = self.cleaning_agent.get_cleaning_summary(result)
            report = summary['cleaning_report']
            print(f"Data cleaned successfully!")
            print(f"Duplicates removed: {report.get('duplicates_removed', 0)}")
            print(f"Rows removed: {report.get('rows_removed', 0)}")
            print(f"Final shape: {report.get('final_shape', 'N/A')}")
        else:
            state["error"] = result.error
            print(f"Error: {result.error}")
        
        return state
    
    def _analytics_node(self, state: DashboardState) -> DashboardState:
        print("\nStage 3: Data Analysis")
        print("-" * 50)
        
        if state["error"]:
            print(f"Skipping (previous error)")
            return state
        
        analytics_state = AnalyticsState(cleaned_data=state["cleaned_data"])
        result = self.analytics_agent.analyze_data(analytics_state)
        
        state["current_stage"] = "analytics"
        state["messages"].append(f"Analytics: {result.status}")
        
        if result.status == "completed":
            state["analysis_insights"] = result.insights
            state["visualization_plan"] = result.visualization_plan
            print(f"Analysis completed!")
            if result.insights.get('correlations'):
                print(f"   Strong correlations found: {len(result.insights['correlations'])}")
            if result.insights.get('data_quality'):
                quality = result.insights['data_quality']
                print(f"   Data completeness: {quality['completeness']:.1f}%")
            if result.visualization_plan:
                print(f"   Visualization plan created with {len(result.visualization_plan)} items")
        else:
            state["error"] = result.error
            print(f"Error: {result.error}")

        # with open(r"visualization_agent_plan.json", "r", encoding="utf-8") as f:
        #     import json
        #     visualization_plan = json.load(f)
        #     state["visualization_plan"] = visualization_plan
        
        return state
    
    def _visualization_node(self, state: DashboardState) -> DashboardState:

        print("\nStage 4: Visualization")
        print("-" * 50)
        
        if state["error"]:
            print(f"Skipping (previous error)")
            return state
        
        viz_state = VisualizationState(
            cleaned_data=state["cleaned_data"],
            visualization_plan=state["visualization_plan"]
        )
        result = self.visualization_agent(viz_state)
        state["visualizations"] = result.visualizations
        
        return state
    
    def _finalize_node(self, state: DashboardState) -> DashboardState:
        print("\nStage 5: Finalization")
        print("-" * 50)
        
        state["current_stage"] = "finalize"
        
        if state["error"]:
            print(f"Workflow failed: {state['error']}")
            state["messages"].append(f"Workflow failed")
            return state
        
        print(f"\n{'='*50}")
        print(f"Dashboard creation completed successfully!")
        print(f"{'='*50}")
        print(f"Total steps completed: {len(state['messages'])}")
        
        return state
    
    def create_dashboard(self, file_path: str) -> dict:
        print(f"\nStarting IntelliDash - Dashboard Creation Pipeline")
        print(f"Input file: {file_path}")
        print("=" * 50)
        
        initial_state = DashboardState(
            file_path=file_path,
            raw_data=None,
            cleaned_data=None,
            visualization_plan={},
            visualizations={},
            messages=[],
            error=None,
            current_stage="init",
        )
        
        result = self.graph.invoke(initial_state)
        return result["visualizations"]
        
        return {
            # "status": "success" if not result["error"] else "failed",
            # "error": result["error"],
            # "messages": result["messages"],
            # "analysis_insights": result["analysis_insights"],
            # "visualizations_plan": result["visualization_plan"],
            "visualizations": result["visualizations"]
        }


def main():

    file_path = "Walmart_Sales.csv"

    orchestrator = DashboardOrchestrator()
    result = orchestrator.create_dashboard(file_path)
    
    # print("\nWorkflow Results:")
    # print("-" * 50)
    # print("Visualizations:", result["visualizations"])

    with open("visualization_output.json", "w", encoding="utf-8") as f:
        import json
        json.dump(result["visualizations"], f)    
 
    print("\nIntelliDash workflow completed.")

if __name__ == "__main__":
    main()

