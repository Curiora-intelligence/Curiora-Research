from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI(title="saiganesh",docs_url=None,redoc_url=None,openapi_external_docs=None)

app.mount("/static",StaticFiles(directory="static"),name="static",)

templates = Jinja2Templates(directory="templates")

#routers
@app.get("/")
async def research_home(request: Request):
    return templates.TemplateResponse(request,"pages/home.html")