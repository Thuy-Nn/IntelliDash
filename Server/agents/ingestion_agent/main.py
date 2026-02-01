
from typing import Optional
import pandas as pd
from pathlib import Path


class IngestionState:

    def __init__(
        self,
        file_path: str,
        raw_data: Optional[pd.DataFrame] = None,
        metadata: dict = None,
        error: Optional[str] = None,
        status: str = "pending",
    ):
        self.file_path: str = file_path
        self.raw_data: Optional[pd.DataFrame] = raw_data
        self.metadata: dict = metadata if metadata is not None else {}
        self.error: Optional[str] = error
        self.status: str = status

class IngestionAgent:
    
    def __init__(self):
        self.supported_formats = ['.csv', '.xlsx', '.json', '.parquet']
    
    def validate_file(self, file_path: str):

        path = Path(file_path)
        if not path.exists():
            return False
        return path.suffix.lower() in self.supported_formats
    
    """Main Pipeline to load data"""
    def load_data(self, state: IngestionState):

        try:
            file_path = state.file_path
            
            if not self.validate_file(file_path):
                state.error = f"File not found or format not supported: {file_path}"
                state.status = "failed"
                return state
            
            suffix = Path(file_path).suffix.lower()
            
            if suffix == '.csv':
                state.raw_data = pd.read_csv(file_path)
            elif suffix == '.xlsx':
                state.raw_data = pd.read_excel(file_path)
            elif suffix == '.json':
                state.raw_data = pd.read_json(file_path)
            elif suffix == '.parquet':
                state.raw_data = pd.read_parquet(file_path)
            
            state.metadata = {
                'shape': state.raw_data.shape,
                'columns': list(state.raw_data.columns),
                'dtypes': state.raw_data.dtypes.to_dict(),
                'missing_values': state.raw_data.isnull().sum().to_dict(),
            }
            state.status = "completed"
            
        except Exception as e:
            state.error = f"Error loading data: {str(e)}"
            state.status = "failed"
        
        return state
    
    def get_data_summary(self, state: IngestionState):

        if state.raw_data is None:
            return {}
        
        return {
            'total_rows': len(state.raw_data),
            'total_columns': len(state.raw_data.columns),
            'columns': list(state.raw_data.columns),
            'data_types': state.raw_data.dtypes.to_dict(),
            'first_rows': state.raw_data.head(3).to_dict('records'),
        }
    
if __name__ == "__main__":
    # Test
    agent = IngestionAgent()
    state = IngestionState(file_path="D:\Code\Bachelorarbeit\IntelliDash\Walmart_Sales.csv")
    state = agent.load_data(state)
    if state.status == "completed":
        print("Data loaded successfully!")
        print(agent.get_data_summary(state))
    else:
        print(f"Failed to load data: {state.error}")
