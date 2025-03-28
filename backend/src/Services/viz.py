import yfinance as yf
import plotly.graph_objects as go
import plotly.express as px
import plotly.io as pio
from typing import Dict, Any
from datetime import datetime, timedelta
import base64
from io import BytesIO
import traceback

class VisualizationService:
    @staticmethod
    async def get_stock_visualizations(ticker: str) -> Dict[str, Any]:
        """Generate interactive visualizations for company financials"""
        try:
            company = yf.Ticker(ticker)
            
            end_date = datetime.now()
            start_date = end_date - timedelta(days=3*365)
            stock_data = company.history(start=start_date, end=end_date)
            
            visualizations = {
                "stock_price": await VisualizationService._create_stock_chart(stock_data, ticker),
                "revenue_growth": await VisualizationService._create_revenue_chart(company),
                "profitability": await VisualizationService._create_profitability_chart(company)
            }
            
            return visualizations
            
        except Exception as e:
            raise Exception(f"Error generating visualizations: {str(e)}")

    @staticmethod
    async def _convert_fig_to_base64(fig) -> str:
        """Convert plotly figure to base64 string"""
        try:
            img_bytes = pio.to_image(fig, format="png")
            base64_string = base64.b64encode(img_bytes).decode('utf-8')
            return f"data:image/png;base64,{base64_string}"
        except Exception as e:
            print(f"Error converting figure to base64: {str(e)}")
            return ''

    @staticmethod
    async def _create_stock_chart(stock_data, ticker: str) -> str:
        """Create stock price chart"""
        fig = go.Figure(data=[
            go.Candlestick(
                x=stock_data.index,
                high=stock_data['High'],
                low=stock_data['Low'],
                open=stock_data['Open'],
                close=stock_data['Close'],
                name='Stock Price'
            )
        ])
        
        fig.update_layout(
            title=f"{ticker} Stock Price Movement",
            yaxis_title="Price",
            xaxis_title="Date",
            template="plotly_dark",
            width=800,
            height=500
        )
        
        return await VisualizationService._convert_fig_to_base64(fig)

    @staticmethod
    async def _create_revenue_chart(company) -> str:
        """Create revenue trend visualization"""
        if company.income_stmt is not None:
            try:
                revenue_data = company.income_stmt.loc['Total Revenue']
                fig = px.line(
                    x=revenue_data.index,
                    y=revenue_data.values,
                    title="Revenue Growth Trend"
                )
                fig.update_layout(
                    template="plotly_dark",
                    width=800,
                    height=500
                )
                return await VisualizationService._convert_fig_to_base64(fig)
            except Exception as e:
                print(f"Error creating revenue chart: {str(e)}")
                return ""
        return ""

    @staticmethod
    async def _create_profitability_chart(company) -> str:
        """Create profitability metrics visualization"""
        if company.income_stmt is not None:
            try:
                net_income_fields = ['Net Income', 'NetIncome', 'Net Income Common Stockholders']
                operating_income_fields = ['Operating Income', 'OperatingIncome', 'EBIT']
                
                net_income = None
                operating_income = None
                
                for field in net_income_fields:
                    if field in company.income_stmt.index:
                        net_income = company.income_stmt.loc[field]
                        break
                        
                for field in operating_income_fields:
                    if field in company.income_stmt.index:
                        operating_income = company.income_stmt.loc[field]
                        break
                
                if net_income is None or operating_income is None:
                    return ""
                    
                fig = go.Figure()
                fig.add_trace(go.Bar(
                    x=net_income.index,
                    y=net_income.values,
                    name="Net Income"
                ))
                fig.add_trace(go.Bar(
                    x=operating_income.index,
                    y=operating_income.values,
                    name="Operating Income"
                ))
                
                fig.update_layout(
                    title="Profitability Metrics",
                    barmode='group',
                    template="plotly_dark",
                    yaxis_title="Amount ($)",
                    xaxis_title="Date",
                    width=800,
                    height=500
                )
                
                return await VisualizationService._convert_fig_to_base64(fig)
            except Exception as e:
                print(f"Error creating profitability chart: {str(e)}")
                return ""
        return ""
    
    @staticmethod
    async def _convert_fig_to_base64(fig) -> str:
        """Convert plotly figure to base64 string"""
        try:
            # Set static image size
            fig.update_layout(width=800, height=500)
            
            # Configure renderer
            pio.kaleido.scope.mathjax = None
            
            # Convert to image with higher quality
            img_bytes = pio.to_image(fig, format="png", scale=2)
            
            # Convert to base64
            base64_string = base64.b64encode(img_bytes).decode('utf-8')
            return f"data:image/png;base64,{base64_string}"
        except Exception as e:
            print(f"Error in _convert_fig_to_base64: {str(e)}")
            raise e

    @staticmethod
    async def _create_revenue_chart(company) -> str:
        """Create revenue trend visualization"""
        if company.income_stmt is None:
            print("No income statement data available")
            return ""
            
        try:
            # Debug print
            print("Available fields:", company.income_stmt.index.tolist())
            
            if 'Total Revenue' not in company.income_stmt.index:
                print("Total Revenue field not found")
                return ""
                
            revenue_data = company.income_stmt.loc['Total Revenue']
            
            # Debug print
            print("Revenue data:", revenue_data)
            
            fig = px.line(
                x=revenue_data.index,
                y=revenue_data.values,
                title="Revenue Growth Trend"
            )
            
            fig.update_layout(
                template="plotly_dark",
                xaxis_title="Date",
                yaxis_title="Revenue ($)",
                showlegend=True
            )
            
            return await VisualizationService._convert_fig_to_base64(fig)
        except Exception as e:
            print(f"Error creating revenue chart: {str(e)}")
            print(f"Error type: {type(e)}")
            print(f"Error traceback: {traceback.format_exc()}")
            return ""