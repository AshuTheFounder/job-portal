import certifi # NAYA: Mac ke SSL error ko fix karne ke liye
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NAYA: TiDB Cloud (Serverless) Connection Setup
def get_db_connection():
    return mysql.connector.connect(
        host="gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com",
        port=4000,
        user="B1TxTmaBevYbBiQ.root",
        password="Pta1smzNDW2M8EvX",  # Jab sab set ho jaye, toh ise TiDB panel se change kar lena security ke liye
        database="test",              # 'sys' ki jagah 'test' use karna safe hai
        ssl_ca=certifi.where(),       # Ye automatically tere Mac ke secure certificates dhundh lega
        ssl_verify_cert=True,
        ssl_verify_identity=True
    )

# NAYA: Server start hote hi table khud bana dega
@app.on_event("startup")
def startup_event():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS jobs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255),
                company VARCHAR(255),
                location VARCHAR(255),
                salary VARCHAR(255),
                type VARCHAR(255),
                description TEXT
            )
        """)
        conn.commit()
        cursor.close()
        conn.close()
        print("✅ Cloud Database Connected & Table Ready!")
    except Exception as e:
        print("❌ Database Connection Error:", e)

# React se aane wale data ka blueprint
class JobPost(BaseModel):
    title: str
    company: str
    location: str
    salary: str
    type: str
    description: str

@app.get("/")
def read_root():
    return {"message": "JobHub Backend is running on Cloud Database! 🚀", "status": "Success"}

@app.get("/jobs")
def get_jobs():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    # ORDER BY id DESC lagaya hai taaki nayi job hamesha upar dikhe!
    cursor.execute("SELECT * FROM jobs ORDER BY id DESC")
    jobs = cursor.fetchall()
    cursor.close()
    conn.close()
    return {"jobs": jobs}

# --- POST ROUTE (Cloud Database mein save karne ke liye) ---
@app.post("/jobs")
def create_job(job: JobPost):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # SQL Command data insert karne ke liye
    sql = "INSERT INTO jobs (title, company, location, salary, type, description) VALUES (%s, %s, %s, %s, %s, %s)"
    values = (job.title, job.company, job.location, job.salary, job.type, job.description)
    
    cursor.execute(sql, values)
    conn.commit()  # Cloud Database ko bolo changes save kar le
    
    cursor.close()
    conn.close()
    
    return {"message": "Job successfully added to Cloud!", "status": "Success"}