import streamlit as st
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from docx import Document
from PIL import Image
import pdfplumber
import pytesseract
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
import pandas as pd

# Function to summarize text using Sumy
def summarize_text(text, sentence_count=5):
    parser = PlaintextParser.from_string(text, Tokenizer("english"))
    summarizer = LsaSummarizer()
    summary = summarizer(parser.document, sentence_count)
    return " ".join(str(sentence) for sentence in summary)

# Function to calculate similarity between job description and resumes
def calculate_similarity(job_description, resumes):
    documents = [job_description] + resumes
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(documents)
    similarity_scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    return similarity_scores

# Function to extract text from different file formats
def extract_text_from_file(file):
    if file.name.endswith(".txt"):
        return file.read().decode("utf-8")
    elif file.name.endswith(".docx"):
        doc = Document(file)
        return "\n".join([paragraph.text for paragraph in doc.paragraphs])
    elif file.name.endswith(".pdf"):
        with pdfplumber.open(file) as pdf:
            return "\n".join([page.extract_text() for page in pdf.pages if page.extract_text()])
    elif file.name.endswith((".png", ".jpg", ".jpeg")):
        image = Image.open(file)
        return pytesseract.image_to_string(image)
    else:
        st.error("Unsupported file format!")
        return None

# Streamlit app
st.title("Resume Matcher with Sumy and Streamlit")

# User role selection
role = st.sidebar.selectbox("Select your role", ["Candidate", "HR", "Admin"])

if role == "Candidate":
    st.header("Candidate Portal")
    uploaded_file = st.file_uploader("Upload your resume (TXT, DOCX, PDF, or Image)", type=["txt", "docx", "pdf", "png", "jpg", "jpeg"])
    if uploaded_file:
        resume_text = extract_text_from_file(uploaded_file)
        if resume_text:
            summarized_resume = summarize_text(resume_text)
            st.subheader("Summarized Resume")
            st.write(summarized_resume)

elif role == "HR":
    st.header("HR Portal")
    job_description = st.text_area("Enter Job Description")
    uploaded_files = st.file_uploader("Upload resumes (TXT, DOCX, PDF, or Image)", type=["txt", "docx", "pdf", "png", "jpg", "jpeg"], accept_multiple_files=True)
    if job_description and uploaded_files:
        resumes = []
        for file in uploaded_files:
            resume_text = extract_text_from_file(file)
            if resume_text:
                resumes.append(resume_text)
        summarized_resumes = [summarize_text(resume) for resume in resumes]
        similarity_scores = calculate_similarity(job_description, summarized_resumes)
        results = pd.DataFrame({
            "Resume": [file.name for file in uploaded_files],
            "Similarity Score": similarity_scores
        }).sort_values(by="Similarity Score", ascending=False)
        st.subheader("Matching Results")
        st.dataframe(results)

elif role == "Admin":
    st.header("Admin Portal")
    st.write("Admin functionalities can be implemented here, such as managing user roles or accessing logs.")