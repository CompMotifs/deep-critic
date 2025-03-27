import re
from statistics import mean, stdev

def output_summary(output_file_path):
    # Extract columns containing numeric values
    output = pd.read_csv(output_file_path)
    numeric_columns = output.loc[:, output.apply(lambda col: col.astype(str).str.contains(r'\d').any())]

    # Extract unique sections from column names
    unique_sections = {col.split('_')[0] for col in numeric_columns.columns}
    unique_sections.discard('Link to pdf')
    unique_sections.discard('Summary')
    unique_sections.discard('Questions')
    unique_sections.discard('Weaknesses')

    # Dictionary to store results
    section_stats = {}
    # Extract section data and calculate mean and standard deviation
    for section in unique_sections:
        # Filter columns related to the current section
        section_columns = output[[col for col in output.columns if section in col]].values[0]
        
        # Extract numeric values from the section columns
        numeric_values = [int(re.search(r'\d+', entry).group()) for entry in section_columns]
        
        # Calculate mean and standard deviation
        section_mean = mean(numeric_values)
        section_sd = stdev(numeric_values)
        # Store results in the dictionary
        section_stats[section] = (section_mean, section_sd)

    #extract he non-numeric columns
    non_numeric_unique_columns = {"Summary", "Soundness", "Strengths", "Weaknesses", "Questions", "Limitations"}
    non_numeric_columns = output[[col for col in output.columns if any(substring in col for substring in non_numeric_unique_columns)]]

    return section_stats, non_numeric_columns
