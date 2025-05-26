import gradio as gr
import pandas as pd

def analyze_dataframe():
    # Read the iris.csv file from the current folder
    try:
        file_path = "C:/PythonBegineer/iris.csv"
        headers = ['sepal_length', 'sepal_width', 'petal_length', 'petal_width', 'species']
        df = pd.read_csv(file_path, header=None, names=headers)
    except Exception as e:
        return f"Error reading file: {e}", None, None, None

    # Get basic statistics
    stats = df.describe().to_string()

    # Get column names
    columns = df.columns.tolist()

    # Get the first few rows
    preview = df.head().to_string()

    return stats, columns, preview

# Define the Gradio interface
interface = gr.Interface(
    fn=analyze_dataframe,
    inputs=None,  # No file upload needed
    outputs=[
        gr.Textbox(label="Basic Statistics"),
        gr.Textbox(label="Column Names"),
        gr.Textbox(label="Preview of DataFrame"),
    ],
    title="Pandas DataFrame Analyzer",
    description="Analyze the Iris dataset directly from the local folder."
)

# Launch the Gradio app
if __name__ == "__main__": 
    interface.launch()