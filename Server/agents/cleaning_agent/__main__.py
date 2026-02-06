
from typing import Optional
import pandas as pd
import numpy as np


class CleaningState:

    def __init__(
        self,
        raw_data: Optional[pd.DataFrame] = None,
        cleaned_data: Optional[pd.DataFrame] = None,
        cleaning_report: Optional[dict] = None,
        error: Optional[str] = None,
        status: str = "pending",
    ):
        self.raw_data = raw_data
        self.cleaned_data = cleaned_data
        self.cleaning_report = cleaning_report if cleaning_report is not None else {}
        self.error = error
        self.status = status


class CleaningAgent:
    
    def handle_missing_values(self, df: pd.DataFrame, strategy: str = 'drop'):

        df = df.copy()
        
        if strategy == 'drop':
            df = df.dropna()
        elif strategy == 'fill_mean':
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())
        elif strategy == 'fill_forward':
            df = df.fillna(method='ffill')
        
        return df
    
    def remove_duplicates(self, df: pd.DataFrame):

        initial_len = len(df)
        df = df.drop_duplicates()
        duplicates_removed = initial_len - len(df)
        return df, duplicates_removed
    
    def standardize_columns(self, df: pd.DataFrame):

        df.columns = [col.lower().strip().replace(' ', '_') for col in df.columns]
        return df
    
    """Convert object to numeric where possible"""
    def convert_data_types(self, df: pd.DataFrame):

        conversions = {}
        df = df.copy()
        
        for col in df.columns:
            if df[col].dtype == 'object':
                try:
                    temp = pd.to_numeric(df[col], errors='coerce')
                    if temp.notna().sum() / len(temp) > 0.8:  # If >80% can be converted
                        df[col] = temp
                        conversions[col] = 'numeric'
                except:
                    pass
        
        return df, conversions
    
    """Main cleaning pipeline"""
    def clean_data(self, state: CleaningState):
        try:
            if state.raw_data is None:
                state.error = "No raw data provided"
                state.status = "failed"
                return state
            
            df = state.raw_data.copy()
            initial_shape = df.shape
            report = {}
            
            # Standardize column names
            df = self.standardize_columns(df)
            
            # Remove duplicates
            df, dup_count = self.remove_duplicates(df)
            report['duplicates_removed'] = dup_count
            
            # Handle missing values
            missing_before = df.isnull().sum().sum()
            df = self.handle_missing_values(df, strategy='drop')
            report['missing_values_before'] = int(missing_before)
            report['missing_values_after'] = int(df.isnull().sum().sum())
            
            # Convert data types
            df, conversions = self.convert_data_types(df)
            report['data_type_conversions'] = conversions

            # Remove leading and trailing whitespace from string columns
            str_cols = df.select_dtypes(include=['object']).columns
            for col in str_cols:
                df[col] = df[col].str.strip()
            
            # Data shape information
            report['initial_shape'] = initial_shape
            report['final_shape'] = df.shape
            report['rows_removed'] = initial_shape[0] - df.shape[0]
            
            state.cleaned_data = df
            state.cleaning_report = report
            state.status = "completed"
            
        except Exception as e:
            state.error = f"Error during cleaning: {str(e)}"
            state.status = "failed"
        
        return state
    
    def get_cleaning_summary(self, state: CleaningState):

        if state.cleaned_data is None:
            return {}
        
        return {
            'cleaning_report': state.cleaning_report,
            'data_shape': state.cleaned_data.shape,
            'columns': list(state.cleaned_data.columns),
            'dtypes': state.cleaned_data.dtypes.to_dict(),
        }
    
if __name__ == "__main__":
    # Test
    agent = CleaningAgent()
    df = pd.read_csv("Walmart_Sales.csv")
    # print("Original shape:", df.shape)
    # handle_missing = agent.handle_missing_values(df, strategy='drop')
    # print("After handling missing values shape:", handle_missing.shape)
    # no_duplicates, dup_count = agent.remove_duplicates(df)
    # print("Duplicates removed:", dup_count)
    standardized = agent.standardize_columns(df)
    print("Standardized columns:", standardized.columns.tolist())
    # converted, conversions = agent.convert_data_types(df)
    # print("Data type conversions:", conversions)
    state = CleaningState(raw_data=df)
    result = agent.clean_data(state)
    print("Cleaning Report:", result.cleaning_report)