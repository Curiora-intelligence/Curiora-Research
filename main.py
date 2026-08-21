from fastapi import FastAPI, Request
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
load_dotenv()
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.routers.curio import curio_router 
from cryptography.fernet import Fernet
import os
app = FastAPI(title="saiganesh")

app.add_middleware(SessionMiddleware,secret_key=os.getenv("encrypt_key"))

app.mount("/static",StaticFiles(directory="static"),name="static",)

templates = Jinja2Templates(directory="templates")
app.include_router(curio_router)
#routers
@app.get("/")
async def research_home(request: Request):
    return templates.TemplateResponse(request,"pages/home.html")

