"""
Resume Parser Service for AI Interview Copilot v5
Extracts structured information from resume files (PDF, TXT)
"""

import re
import logging
from typing import List, Dict, Optional
from pathlib import Path
import PyPDF2
from docx import Document
from models.interview_models import ResumeData

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ResumeParser:
    """Service for parsing resume files and extracting structured information"""
    
    def __init__(self):
        """Initialize resume parser"""
        self.skill_keywords = self._load_skill_keywords()
        self.technology_keywords = self._load_technology_keywords()
        self.leadership_keywords = self._load_leadership_keywords()
    
    def _load_skill_keywords(self) -> Dict[str, List[str]]:
        """Load skill category keywords"""
        return {
            "technical": [
                "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
                "react", "angular", "vue", "nodejs", "django", "flask", "spring", "express",
                "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
                "sql", "nosql", "mongodb", "postgresql", "mysql", "redis", "elasticsearch",
                "machine learning", "deep learning", "ai", "data science", "analytics",
                "git", "github", "gitlab", "ci/cd", "devops", "agile", "scrum"
            ],
            "soft": [
                "leadership", "communication", "teamwork", "problem solving", "critical thinking",
                "project management", "mentoring", "collaboration", "presentation", "negotiation"
            ],
            "business": [
                "strategy", "planning", "budgeting", "marketing", "sales", "business development",
                "product management", "operations", "finance", "accounting", "consulting"
            ]
        }
    
    def _load_technology_keywords(self) -> List[str]:
        """Load technology stack keywords"""
        return [
            # Programming Languages
            "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust", "php", "ruby",
            # Frontend
            "react", "angular", "vue", "nextjs", "nuxt", "svelte", "html", "css", "sass", "tailwind",
            # Backend
            "nodejs", "express", "django", "flask", "spring", "laravel", "rails", "fastapi",
            # Databases
            "sql", "nosql", "mongodb", "postgresql", "mysql", "sqlite", "redis", "cassandra",
            # Cloud
            "aws", "azure", "gcp", "lambda", "ec2", "s3", "cloudfront", "cloudformation",
            # DevOps
            "docker", "kubernetes", "jenkins", "github actions", "gitlab ci", "terraform", "ansible",
            # ML/AI
            "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy", "jupyter"
        ]
    
    def _load_leadership_keywords(self) -> List[str]:
        """Load leadership-related keywords"""
        return [
            "lead", "leader", "manager", "director", "head", "chief", "vp", "president",
            "team lead", "tech lead", "principal", "senior", "architect", "supervisor",
            "coordinator", "mentor", "advisor", "consultant", "founder", "ceo", "cto"
        ]
    
    async def parse_resume_file(self, file_path: str) -> ResumeData:
        """
        Parse resume file and extract structured information
        
        Args:
            file_path: Path to resume file
            
        Returns:
            ResumeData object with extracted information
        """
        try:
            logger.info(f"Parsing resume file: {file_path}")
            
            # Extract text from file
            text_content = await self._extract_text_from_file(file_path)
            
            # Parse structured information
            resume_data = await self._parse_resume_text(text_content)
            
            logger.info(f"Successfully parsed resume: {len(resume_data.skills)} skills found")
            return resume_data
            
        except Exception as e:
            logger.error(f"Error parsing resume file {file_path}: {str(e)}")
            raise Exception(f"Resume parsing failed: {str(e)}")
    
    async def _extract_text_from_file(self, file_path: str) -> str:
        """Extract text content from resume file"""
        file_path = Path(file_path)
        
        if file_path.suffix.lower() == '.pdf':
            return self._extract_from_pdf(file_path)
        elif file_path.suffix.lower() == '.txt':
            return self._extract_from_txt(file_path)
        elif file_path.suffix.lower() in ['.docx', '.doc']:
            return self._extract_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_path.suffix}")
    
    def _extract_from_pdf(self, file_path: Path) -> str:
        """Extract text from PDF file"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise
        return text
    
    def _extract_from_txt(self, file_path: Path) -> str:
        """Extract text from TXT file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except UnicodeDecodeError:
            # Try with different encoding
            with open(file_path, 'r', encoding='latin-1') as file:
                return file.read()
    
    def _extract_from_docx(self, file_path: Path) -> str:
        """Extract text from DOCX file"""
        try:
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            logger.error(f"Error extracting text from DOCX: {str(e)}")
            raise
    
    async def _parse_resume_text(self, text: str) -> ResumeData:
        """Parse structured information from resume text"""
        # Clean and normalize text
        text = text.lower().strip()
        
        resume_data = ResumeData()
        
        # Extract skills
        resume_data.skills = self._extract_skills(text)
        
        # Extract technologies
        resume_data.technologies = self._extract_technologies(text)
        
        # Extract projects
        resume_data.projects = self._extract_projects(text)
        
        # Extract leadership roles
        resume_data.leadership_roles = self._extract_leadership_roles(text)
        
        # Extract experience level
        resume_data.experience_level = self._determine_experience_level(text)
        
        # Extract industry domain
        resume_data.industry_domain = self._extract_industry_domain(text)
        
        # Calculate total experience years
        resume_data.total_experience_years = self._extract_experience_years(text)
        
        # Extract education
        resume_data.education = self._extract_education(text)
        
        # Extract certifications
        resume_data.certifications = self._extract_certifications(text)
        
        return resume_data
    
    def _extract_skills(self, text: str) -> List[str]:
        """Extract skills from resume text"""
        found_skills = []
        
        for category, keywords in self.skill_keywords.items():
            for keyword in keywords:
                if keyword in text:
                    found_skills.append(keyword.title())
        
        return list(set(found_skills))
    
    def _extract_technologies(self, text: str) -> List[str]:
        """Extract technologies from resume text"""
        found_tech = []
        
        for tech in self.technology_keywords:
            if tech in text:
                found_tech.append(tech.title())
        
        return list(set(found_tech))
    
    def parse_resume_text(self, text: str, filename: str = "resume.txt") -> Dict[str, Any]:
        """Parse resume text content - SIMPLE IMPLEMENTATION"""
        try:
            logger.info(f"Parsing resume text from {filename}")
            
            # Simple text-based parsing
            skills = []
            experience = []
            projects = []
            education = ""
            
            # Extract skills (basic keyword matching)
            skill_keywords = ['python', 'javascript', 'react', 'node', 'sql', 'machine learning', 'data science', 'aws', 'docker']
            for skill in skill_keywords:
                if skill.lower() in text.lower():
                    skills.append(skill.title())
            
            # Extract experience years
            import re
            year_match = re.search(r'(\d+)\s*years?', text.lower())
            years_experience = int(year_match.group(1)) if year_match else 0
            
            # Extract projects
            project_patterns = [
                r'project[s]?:?(.*?)(?:\n\n|\n[A-Z]|\Z)',
                r'personal project[s]:(.*?)(?:\n\n|\n[A-Z]|\Z)'
            ]
            
            for pattern in project_patterns:
                matches = re.findall(pattern, text, re.IGNORECASE | re.DOTALL)
                for match in matches:
                    project_lines = [line.strip() for line in match.split('\n') if line.strip()]
                    for line in project_lines[:5]:  # Limit to first 5 lines
                        if len(line) > 10 and not line.startswith('-'):
                            projects.append(line.title())
            
            return {
                'skills': list(set(skills)),
                'experience': f"{years_experience} years",
                'projects': projects[:10],  # Limit to 10 projects
                'education': education,
                'raw_text': text[:500]  # First 500 chars
            }
            
        except Exception as e:
            logger.error(f"Error parsing resume text: {str(e)}")
            raise Exception(f"Resume parsing failed: {str(e)}")
    
    def _extract_projects(self, text: str) -> List[str]:
        """Extract project information from resume text"""
        projects = []
        
        # Look for project section
        project_patterns = [
            r'project[s]?:?(.*?)(?:\n\n|\n[A-Z]|\Z)',
            r'project experience:(.*?)(?:\n\n|\n[A-Z]|\Z)',
            r'personal project[s]:(.*?)(?:\n\n|\n[A-Z]|\Z)'
        ]
        
        for pattern in project_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE | re.DOTALL)
            for match in matches:
                # Extract project names (simplified)
                project_lines = [line.strip() for line in match.split('\n') if line.strip()]
                for line in project_lines[:5]:  # Limit to first 5 lines
                    if len(line) > 10 and not line.startswith('-'):
                        projects.append(line.title())
        
        return projects[:10]  # Limit to 10 projects
    
    def _extract_leadership_roles(self, text: str) -> List[str]:
        """Extract leadership roles from resume text"""
        leadership_roles = []
        
        for keyword in self.leadership_keywords:
            # Look for patterns like "Team Lead at Company"
            pattern = rf'{keyword}\s+(?:at|for|of|in)?\s*([^\n,;.]*)'
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if len(match.strip()) > 3:
                    leadership_roles.append(f"{keyword.title()} at {match.strip().title()}")
        
        return list(set(leadership_roles))
    
    def _determine_experience_level(self, text: str) -> str:
        """Determine experience level from resume text"""
        years = self._extract_experience_years(text)
        
        if years >= 10:
            return "Senior"
        elif years >= 5:
            return "Mid-Level"
        elif years >= 2:
            return "Junior"
        else:
            return "Entry-Level"
    
    def _extract_experience_years(self, text: str) -> float:
        """Extract total years of experience"""
        # Look for patterns like "5 years of experience"
        year_patterns = [
            r'(\d+(?:\.\d+)?)\s*(?:years?|yrs?)\s*(?:of\s*)?experience',
            r'experience:\s*(\d+(?:\.\d+)?)\s*(?:years?|yrs?)',
            r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:work|professional)?\s*experience'
        ]
        
        total_years = 0
        for pattern in year_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    years = float(match)
                    total_years = max(total_years, years)
                except ValueError:
                    continue
        
        return total_years
    
    def _extract_industry_domain(self, text: str) -> str:
        """Extract industry domain from resume text"""
        industry_keywords = {
            "technology": ["software", "technology", "it", "tech", "computer", "programming"],
            "finance": ["banking", "finance", "financial", "investment", "trading", "fintech"],
            "healthcare": ["healthcare", "medical", "health", "pharmaceutical", "biotech"],
            "retail": ["retail", "ecommerce", "shopping", "sales", "merchandise"],
            "education": ["education", "learning", "academic", "university", "school"],
            "consulting": ["consulting", "consultant", "advisory"],
            "manufacturing": ["manufacturing", "production", "factory", "industrial"]
        }
        
        for industry, keywords in industry_keywords.items():
            for keyword in keywords:
                if keyword in text:
                    return industry.title()
        
        return "General"
    
    def _extract_education(self, text: str) -> List[str]:
        """Extract education information"""
        education = []
        
        # Look for degree patterns
        degree_patterns = [
            r'(bachelor|master|phd|doctorate|associate|b\.s\.|m\.s\.|b\.a\.|m\.a\.|mba)[^,;\n]*',
            r'(university|college|institute)[^,;\n]*',
            r'degree in ([^,;\n]*)'
        ]
        
        for pattern in degree_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if len(match.strip()) > 5:
                    education.append(match.strip().title())
        
        return list(set(education))
    
    def _extract_certifications(self, text: str) -> List[str]:
        """Extract certifications from resume text"""
        certifications = []
        
        # Look for certification patterns
        cert_patterns = [
            r'certified ([^,;\n]*)',
            r'certification: ([^,;\n]*)',
            r'(aws|azure|gcp|pmp|cisa|cism|cissp)[^,;\n]*',
            r'(certificate|cert)\.?[^,;\n]*'
        ]
        
        for pattern in cert_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if len(match.strip()) > 3:
                    certifications.append(match.strip().title())
        
        return list(set(certifications))

# Global resume parser instance
resume_parser = ResumeParser()
