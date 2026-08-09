from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health_check():
    return {"moogi's python grade": "93"}