import requests
import os
from dotenv import load_dotenv
load_dotenv()

def get_finance_education_resources(api_key, cx, query, num=10):
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": api_key,
        "cx": cx,
        "q": query,
        "num": num  
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()  
        results = response.json()
        
        if "items" in results:
            print(f"Found {len(results['items'])} results for '{query}':")
            for item in results["items"]:
                print(f"\nTitle: {item.get('title')}")
                print(f"URL: {item.get('link')}")
                print(f"Description: {item.get('snippet')}\n{'-'*50}")
        else:
            print("No results found.")

    except Exception as e:
        print(f"An error occurred: {e}")
API_KEY = os.getenv("API_KEY")
CX = os.getenv("CX")
query = input("Enter your search query for finance education resources: ")
get_finance_education_resources(API_KEY, CX, query)
