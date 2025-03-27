import os
import pandas as pd
from groq import Groq

ticker_mapping = {"HDB": "HDFC", "INFY": "Infosys", "LICI.NS": "LIC"}


def generate_company_story(ticker):
    # Define the storytelling prompt
    prompt = f"""
    You are a financial analyst who explains company performance in a simple, engaging storytelling format. Given a company's financial data, generate a compelling story that highlights its rise, challenges, and future outlook in a way that is easy to understand. Avoid technical jargon and focus on clear, real-world comparisons.

    ### Structure of the Story:

    #### 1. **The Rise and Challenges of {ticker_mapping.get(ticker, ticker)}**
    - Introduce the company, its founders, and its early success.
    - Highlight its rapid growth and how it gained investor and customer confidence.
    - Set up the premise of challenges that emerged despite its success.

    #### 2. **The Growth Strategy: Risky or Rewarding?**
    - Analyze whether the company’s growth is sustainable or overly aggressive.
    - Compare its revenue growth and market presence to industry averages.

    ✅ **What Went Well:**  
    - Strong revenue growth, expanding market presence, increasing investor confidence.

    ❌ **Red Flags:**  
    - High debt levels or over-reliance on risky sectors.  
    - Aggressive expansion strategies that may backfire.

    #### 3. **Financial Stability & Warning Signs**
    - Evaluate if reported financials match reality or if warning signs exist.
    - Analyze how the company manages bad loans, debt, and financial risks.

    ✅ **What Went Well:**  
    - Strong reported earnings, low declared bad loans.

    ❌ **Red Flags:**  
    - Frequent loan restructuring instead of recognizing losses.  
    - Low reserves for bad loans compared to industry standards.  

    #### 4. **Leadership & Governance Issues**
    - Assess whether leadership decisions support long-term stability.
    - Identify governance concerns, management turnover, and oversight weaknesses.

    ✅ **What Went Well:**  
    - Strong leadership presence, ambitious expansion.

    ❌ **Red Flags:**  
    - Over-concentration of power in leadership.  
    - High turnover in senior management, indicating instability.

    #### 5. **Revenue & Profitability Trends**
    - Evaluate the company’s income sources and profitability trends.
    - Identify whether earnings are sustainable or artificially inflated.

    ✅ **What Went Well:**  
    - Consistent revenue growth, positive quarterly earnings.

    ❌ **Red Flags:**  
    - Over-reliance on non-core income like fees and commissions.  
    - Declining profit margins in core business operations.

    #### 6. **Market Perception & Investor Confidence**
    - Examine investor sentiment, stock performance, and financial stability.
    - Highlight discrepancies between stock valuation and actual financial health.

    ✅ **What Went Well:**  
    - Strong stock market valuation, optimistic investor sentiment.

    ❌ **Red Flags:**  
    - High promoter pledging of shares, indicating financial stress.  
    - Stock price may be overvalued compared to real financial health.

    ### **Final Verdict**
    - Conclude whether the company is truly strong or facing hidden risks.
    - Provide an overall assessment of financial stability, governance, and risk management.

    📌 **Key Takeaway:** Investors should focus beyond headline growth and assess financial discipline, governance, and risk before making investment decisions.
    """

    # Define file paths for the analysis text files
    base_path = "backend/Analysis"
    filename_bs = os.path.join(base_path, f"{ticker}_balance_sheet_analysis.txt")
    filename_cf = os.path.join(base_path, f"{ticker}_cash_flow_analysis.txt")
    filename_fs = os.path.join(base_path, f"{ticker}_financials_analysis.txt")
    filename_ks = os.path.join(base_path, f"{ticker}_key_stats_analysis.txt")

    # Read the analysis outputs from the text files
    try:
        with open(filename_bs, "r") as file:
            final_output_balance = file.read()
    except Exception as e:
        final_output_balance = f"Error reading {filename_bs}: {e}\n"

    try:
        with open(filename_cf, "r") as file:
            final_output_cashflow = file.read()
    except Exception as e:
        final_output_cashflow = f"Error reading {filename_cf}: {e}\n"

    try:
        with open(filename_fs, "r") as file:
            final_output_financials = file.read()
    except Exception as e:
        final_output_financials = f"Error reading {filename_fs}: {e}\n"

    try:
        with open(filename_ks, "r") as file:
            final_output_keystats = file.read()
    except Exception as e:
        final_output_keystats = f"Error reading {filename_ks}: {e}\n"

    # Combine all analysis data into one string
    data = (
        final_output_balance
        + "\n"
        + final_output_cashflow
        + "\n"
        + final_output_financials
        + "\n"
        + final_output_keystats
    )

    # Define API Key (ensure security in a real-world scenario)
    api_key = ""  # Replace with your secure API key storage method
    client = Groq(api_key=api_key)

    # Make the API call to generate the final story
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": data},
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.8,
        max_tokens=1024,
        top_p=1,
        stop=None,
        stream=False,
    )

    final_output = chat_completion.choices[0].message.content

    # Define output file path and store the story in a text file
    output_file_path = os.path.join(base_path, f"{ticker}_company_story.txt")
    with open(output_file_path, "w") as file:
        file.write(final_output)

