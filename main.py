from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.routers.curio import curio_router 
app = FastAPI(title="saiganesh")

app.mount("/static",StaticFiles(directory="static"),name="static",)

templates = Jinja2Templates(directory="templates")
app.include_router(curio_router)
#routers
@app.get("/")
async def research_home(request: Request):
    return templates.TemplateResponse(request,"pages/home.html")
