import pandas as pd
from groq import Groq
import os

def analyze_financials(ticker):
    # Define the AI prompt for financials (income statement) analysis
    fs_prompt = """
    You are a financial expert who explains company financial health in simple, everyday language. Given the financials statement of a company, analyze it and provide clear insights into its future prospects, efficiency, and risks. Avoid technical jargon and use real-world comparisons to make it easy for anyone to understand.

    ### Key Areas to Analyze:

    #### 1. Profitability (Is the Company Making Money?)
    - Examine **Gross Profit, EBITDA, and Net Income from Continuing Operations** to determine how much money the company is actually keeping after expenses.

    #### 2. Revenue Growth (Is the Business Expanding?)
    - Analyze **Total Revenue and Operating Revenue** to check if the company is increasing its sales and market presence.

    #### 3. Cost Management (Is the Company Spending Wisely?)
    - Review **Cost of Revenue, Operating Expense, and Selling & Marketing Expense** to see if the company is controlling its costs effectively.

    #### 4. Debt vs. Earnings (Is the Company Overleveraged?)
    - Look at **Total Unusual Items, Interest Expense, and Tax Effect of Unusual Items** to understand if debt and financial risks are increasing.

    #### 5. Cash Flow Efficiency (Is the Company Converting Earnings into Cash?)
    - Check **Reconciled Depreciation and Depreciation & Amortization in the Income Statement** to evaluate cash flow sustainability.

    #### 6. Operational Efficiency (Is the Company Managing Its Resources Well?)
    - Analyze **Operating Expenses and Selling General & Administration Costs** to measure how efficiently the company operates.

    #### 7. Investor Confidence (Is the Company Rewarding Shareholders?)
    - Review **Net Minority Interest and Total Unusual Items Excluding Goodwill** to understand investor interests and financial stability.

    #### 8. Tax Efficiency (Is the Company Managing Its Tax Burden?)
    - Examine **Tax Rate for Calculations and Tax Effect of Unusual Items** to see how effectively the company minimizes taxes.

    #### 9. Market Position (Can the Company Maintain Its Competitive Edge?)
    - Look at **Selling and Marketing Expense and Total Revenue Growth** to determine if the company is staying competitive and expanding.

    ### Final Output:
    Provide a clear, easy-to-understand summary of the company’s financial health. Highlight key strengths, weaknesses, and potential risks with practical explanations. Help an everyday person determine whether the company is financially strong or facing challenges.
    """

    # Define important income statement metrics
    important_metrics_income_statement = [
        "Total Revenue",
        "Operating Revenue",
        "Gross Profit",
        "EBITDA",
        "EBIT",
        "Operating Income",
        "Net Income",
        "Pretax Income",
        "Net Income Common Stockholders",
        "Diluted EPS",
        # Expenses & Costs
        "Cost Of Revenue",
        "Total Expenses",
        "Selling General And Administration",
        "Salaries And Wages",
        "Operating Expense",
        # Taxes & Interest
        "Tax Provision",
        "Interest Expense",
        "Interest Income",
        # Non-Core Items & Adjustments
        "Gain On Sale Of Business",
        "Write Off",
        "Impairment Of Capital Assets",
        "Reconciled Depreciation",
    ]

    # Build file path for the financials CSV file using the ticker
    csv_file_path = f"backend/Data/company_data/{ticker}/financials.csv"
    df = pd.read_csv(csv_file_path)

    # Filter the DataFrame to keep only the desired metrics and convert it to a dictionary
    filtered_df = df[df.iloc[:, 0].isin(important_metrics_income_statement)]
    csv_data = filtered_df.set_index(filtered_df.columns[0]).to_dict()[filtered_df.columns[1]]
    
    # Define API Key (ensure security in a real-world scenario)
    api_key = ""  # Replace with a secure method to store API keys
    client = Groq(api_key=api_key)
    
    # Make the API call to analyze the financials data using the defined prompt
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": fs_prompt},
            {"role": "user", "content": str(csv_data)},
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.8,
        max_tokens=1024,
        top_p=1,
        stop=None,
        stream=False,
    )
    
    # Extract the AI-generated insights from the API response
    final_output_financials = chat_completion.choices[0].message.content
    
    # Save the analysis to a file named using the ticker
    output_file_path = f"{ticker}_financials_analysis.txt"
    with open(output_file_path, "w") as file:
        file.write(final_output_financials)
    
    # print(f"Analysis saved to {output_file_path}")
