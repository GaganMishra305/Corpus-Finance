from fastapi import FastAPI
from src.Routers import assessment, quiz_bot, tutor_bot, doubt_bot, recommend, v2

app = FastAPI(title='AIFinance', version='1.0.0')

@app.get("/" , description='Health check route')
async def health_check():
    return {"status": "healthy"}

