"""
Skill Graph Service for AI Interview Copilot v5
Manages candidate skill graph visualization and analysis
"""

import logging
import networkx as nx
import matplotlib.pyplot as plt
import numpy as np
from typing import List, Dict, Optional, Any, Tuple
from datetime import datetime
from models.interview_models import (
    SkillNode, SkillGraph, InterviewSession, EvaluationScore
)
from services.llm_service import llm_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SkillGraphService:
    """Service for managing and analyzing candidate skill graphs"""
    
    def __init__(self):
        """Initialize skill graph service"""
        self.skill_taxonomy = self._load_skill_taxonomy()
        self.skill_dependencies = self._load_skill_dependencies()
        self.graph_layout = "spring"
    
    def _load_skill_taxonomy(self) -> Dict[str, List[str]]:
        """Load skill taxonomy and categories"""
        return {
            "programming_languages": [
                "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust", "php", "ruby"
            ],
            "frontend": [
                "react", "angular", "vue", "nextjs", "html", "css", "sass", "tailwind", "webpack", "babel"
            ],
            "backend": [
                "nodejs", "express", "django", "flask", "spring", "laravel", "rails", "fastapi", "graphql"
            ],
            "databases": [
                "sql", "nosql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "cassandra"
            ],
            "cloud": [
                "aws", "azure", "gcp", "lambda", "ec2", "s3", "cloudfront", "terraform", "kubernetes", "docker"
            ],
            "devops": [
                "ci/cd", "jenkins", "github actions", "gitlab ci", "ansible", "puppet", "monitoring", "logging"
            ],
            "machine_learning": [
                "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "jupyter", "deep learning", "nlp"
            ],
            "soft_skills": [
                "leadership", "communication", "teamwork", "problem solving", "project management", "mentoring"
            ],
            "system_design": [
                "microservices", "distributed systems", "scalability", "load balancing", "caching", "security"
            ]
        }
    
    def _load_skill_dependencies(self) -> Dict[str, List[str]]:
        """Load skill dependency relationships"""
        return {
            "react": ["javascript", "html", "css"],
            "angular": ["typescript", "javascript", "html", "css"],
            "vue": ["javascript", "html", "css"],
            "nodejs": ["javascript"],
            "express": ["nodejs"],
            "django": ["python"],
            "flask": ["python"],
            "spring": ["java"],
            "tensorflow": ["python", "numpy"],
            "pytorch": ["python", "numpy"],
            "scikit-learn": ["python", "numpy"],
            "pandas": ["python", "numpy"],
            "kubernetes": ["docker"],
            "terraform": ["aws", "azure", "gcp"],
            "microservices": ["distributed systems", "apis"],
            "machine learning": ["python", "statistics"],
            "deep learning": ["machine learning", "neural networks"]
        }
    
    async def build_skill_graph(self, session: InterviewSession) -> SkillGraph:
        """
        Build comprehensive skill graph from interview data
        
        Args:
            session: Interview session data
            
        Returns:
            Skill graph with nodes and edges
        """
        try:
            logger.info(f"Building skill graph for session {session.session_id}")
            
            # Extract skills from resume
            resume_skills = self._extract_resume_skills(session)
            
            # Extract skills from job description
            job_skills = self._extract_job_skills(session)
            
            # Infer skills from interview performance
            performance_skills = await self._infer_performance_skills(session)
            
            # Combine all skills
            all_skills = self._combine_skills(resume_skills, job_skills, performance_skills)
            
            # Create skill nodes
            skill_nodes = self._create_skill_nodes(all_skills, session)
            
            # Create skill edges
            skill_edges = self._create_skill_edges(skill_nodes)
            
            # Build skill graph
            skill_graph = SkillGraph(
                nodes=skill_nodes,
                edges=skill_edges,
                last_updated=datetime.now()
            )
            
            logger.info(f"Built skill graph with {len(skill_nodes)} nodes")
            return skill_graph
            
        except Exception as e:
            logger.error(f"Error building skill graph: {str(e)}")
            raise
    
    def _extract_resume_skills(self, session: InterviewSession) -> Dict[str, float]:
        """Extract and score skills from resume"""
        skills = {}
        
        # Add explicit skills
        for skill in session.resume_data.skills:
            normalized_skill = skill.lower().strip()
            skills[normalized_skill] = 7.0  # Base score for claimed skills
        
        # Add technologies
        for tech in session.resume_data.technologies:
            normalized_tech = tech.lower().strip()
            skills[normalized_tech] = 7.0
        
        # Infer skills from projects
        for project in session.resume_data.projects:
            project_skills = self._extract_skills_from_text(project)
            for skill, confidence in project_skills.items():
                if skill in skills:
                    skills[skill] = max(skills[skill], confidence)
                else:
                    skills[skill] = confidence
        
        # Adjust based on experience level
        experience_multiplier = min(1.5, 1.0 + (session.resume_data.total_experience_years / 10))
        for skill in skills:
            skills[skill] = min(10.0, skills[skill] * experience_multiplier)
        
        return skills
    
    def _extract_job_skills(self, session: InterviewSession) -> Dict[str, float]:
        """Extract required skills from job description"""
        skills = {}
        
        # Add required skills
        for skill in session.job_description.required_skills:
            normalized_skill = skill.lower().strip()
            skills[normalized_skill] = 0.0  # Start with 0, will be updated based on performance
        
        # Add technologies
        for tech in session.job_description.technologies:
            normalized_tech = tech.lower().strip()
            skills[normalized_tech] = 0.0
        
        return skills
    
    async def _infer_performance_skills(self, session: InterviewSession) -> Dict[str, float]:
        """Infer skills from interview performance using LLM"""
        if not session.answers_received:
            return {}
        
        # Combine all answers for analysis
        all_answers = " ".join([answer.text for answer in session.answers_received])
        
        # Use LLM to extract and score skills
        prompt = f"""
        Analyze the following interview answers and extract technical skills demonstrated.
        For each skill identified, provide a proficiency score from 0.0 to 10.0 based on:
        - Depth of explanation
        - Technical accuracy
        - Practical examples given
        - Confidence in discussing the topic
        
        Interview Answers:
        {all_answers}
        
        Respond in JSON format with skill names as keys and scores as values.
        Focus on concrete technical skills, not general concepts.
        """
        
        try:
            result = await llm_service.generate_structured_response(prompt)
            return result if isinstance(result, dict) else {}
        except Exception as e:
            logger.warning(f"Failed to infer skills from performance: {str(e)}")
            return {}
    
    def _combine_skills(self, *skill_dicts: Dict[str, float]) -> Dict[str, float]:
        """Combine multiple skill dictionaries"""
        combined = {}
        
        for skill_dict in skill_dicts:
            for skill, score in skill_dict.items():
                if skill in combined:
                    # Take the maximum score for each skill
                    combined[skill] = max(combined[skill], score)
                else:
                    combined[skill] = score
        
        return combined
    
    def _create_skill_nodes(self, skills: Dict[str, float], session: InterviewSession) -> List[SkillNode]:
        """Create skill nodes from skill dictionary"""
        nodes = []
        
        for skill_name, proficiency in skills.items():
            # Determine skill category
            category = self._categorize_skill(skill_name)
            
            # Count evidence (simplified)
            evidence_count = self._count_evidence(skill_name, session)
            
            node = SkillNode(
                name=skill_name,
                proficiency_level=round(proficiency, 2),
                category=category,
                evidence_count=evidence_count
            )
            nodes.append(node)
        
        return nodes
    
    def _categorize_skill(self, skill_name: str) -> str:
        """Categorize skill into taxonomy"""
        skill_lower = skill_name.lower()
        
        for category, skills in self.skill_taxonomy.items():
            if skill_lower in [s.lower() for s in skills]:
                return category
        
        return "other"
    
    def _count_evidence(self, skill_name: str, session: InterviewSession) -> int:
        """Count evidence of skill usage"""
        evidence_count = 0
        
        # Check resume
        if skill_name.lower() in [s.lower() for s in session.resume_data.skills]:
            evidence_count += 1
        
        if skill_name.lower() in [t.lower() for t in session.resume_data.technologies]:
            evidence_count += 1
        
        # Check projects
        for project in session.resume_data.projects:
            if skill_name.lower() in project.lower():
                evidence_count += 1
        
        # Check job description
        if skill_name.lower() in [s.lower() for s in session.job_description.required_skills]:
            evidence_count += 1
        
        return evidence_count
    
    def _create_skill_edges(self, nodes: List[SkillNode]) -> Dict[str, List[str]]:
        """Create skill dependency edges"""
        edges = {}
        node_names = [node.name.lower() for node in nodes]
        
        for node in nodes:
            node_edges = []
            skill_name = node.name.lower()
            
            # Check dependencies
            if skill_name in self.skill_dependencies:
                for dependency in self.skill_dependencies[skill_name]:
                    if dependency.lower() in node_names:
                        node_edges.append(dependency)
            
            # Check reverse dependencies
            for skill, deps in self.skill_dependencies.items():
                if skill_name in [dep.lower() for dep in deps] and skill.lower() in node_names:
                    node_edges.append(skill)
            
            edges[node.name] = node_edges
        
        return edges
    
    def _extract_skills_from_text(self, text: str) -> Dict[str, float]:
        """Extract skills from text using keyword matching"""
        skills = {}
        text_lower = text.lower()
        
        for category, skill_list in self.skill_taxonomy.items():
            for skill in skill_list:
                if skill.lower() in text_lower:
                    # Simple confidence scoring based on context
                    confidence = 5.0  # Base confidence
                    
                    # Boost confidence if mentioned multiple times
                    count = text_lower.count(skill.lower())
                    if count > 1:
                        confidence += min(2.0, count * 0.5)
                    
                    skills[skill] = min(10.0, confidence)
        
        return skills
    
    def analyze_skill_graph(self, skill_graph: SkillGraph) -> Dict[str, Any]:
        """
        Analyze skill graph and generate insights
        
        Args:
            skill_graph: Skill graph to analyze
            
        Returns:
            Analysis results
        """
        try:
            # Create NetworkX graph for analysis
            G = nx.DiGraph()
            
            # Add nodes with proficiency as weight
            for node in skill_graph.nodes:
                G.add_node(node.name, proficiency=node.proficiency_level, category=node.category)
            
            # Add edges
            for source, targets in skill_graph.edges.items():
                for target in targets:
                    G.add_edge(source, target)
            
            # Calculate metrics
            analysis = {
                "total_skills": len(skill_graph.nodes),
                "average_proficiency": np.mean([node.proficiency_level for node in skill_graph.nodes]),
                "strongest_skills": self._get_strongest_skills(skill_graph.nodes, top=5),
                "weakest_skills": self._get_weakest_skills(skill_graph.nodes, top=5),
                "skill_categories": self._analyze_skill_categories(skill_graph.nodes),
                "skill_density": nx.density(G) if G.number_of_nodes() > 0 else 0,
                "central_skills": self._find_central_skills(G),
                "skill_gaps": self._identify_skill_gaps(skill_graph.nodes),
                "learning_path": self._generate_learning_path(skill_graph.nodes)
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing skill graph: {str(e)}")
            return {}
    
    def _get_strongest_skills(self, nodes: List[SkillNode], top: int = 5) -> List[Dict[str, Any]]:
        """Get strongest skills by proficiency"""
        sorted_nodes = sorted(nodes, key=lambda x: x.proficiency_level, reverse=True)
        return [
            {
                "name": node.name,
                "proficiency": node.proficiency_level,
                "category": node.category,
                "evidence_count": node.evidence_count
            }
            for node in sorted_nodes[:top]
        ]
    
    def _get_weakest_skills(self, nodes: List[SkillNode], top: int = 5) -> List[Dict[str, Any]]:
        """Get weakest skills by proficiency"""
        sorted_nodes = sorted(nodes, key=lambda x: x.proficiency_level)
        return [
            {
                "name": node.name,
                "proficiency": node.proficiency_level,
                "category": node.category,
                "evidence_count": node.evidence_count
            }
            for node in sorted_nodes[:top]
        ]
    
    def _analyze_skill_categories(self, nodes: List[SkillNode]) -> Dict[str, Dict[str, float]]:
        """Analyze skill distribution by category"""
        categories = {}
        
        for node in nodes:
            category = node.category
            if category not in categories:
                categories[category] = {
                    "count": 0,
                    "total_proficiency": 0.0,
                    "skills": []
                }
            
            categories[category]["count"] += 1
            categories[category]["total_proficiency"] += node.proficiency_level
            categories[category]["skills"].append({
                "name": node.name,
                "proficiency": node.proficiency_level
            })
        
        # Calculate averages
        for category in categories:
            if categories[category]["count"] > 0:
                categories[category]["average_proficiency"] = (
                    categories[category]["total_proficiency"] / categories[category]["count"]
                )
            else:
                categories[category]["average_proficiency"] = 0.0
        
        return categories
    
    def _find_central_skills(self, G: nx.DiGraph) -> List[Dict[str, Any]]:
        """Find central skills in the dependency graph"""
        if G.number_of_nodes() == 0:
            return []
        
        # Calculate betweenness centrality
        centrality = nx.betweenness_centrality(G)
        
        # Sort by centrality
        central_skills = sorted(centrality.items(), key=lambda x: x[1], reverse=True)
        
        return [
            {
                "name": skill,
                "centrality": round(centrality, 3),
                "proficiency": G.nodes[skill].get("proficiency", 0)
            }
            for skill, centrality in central_skills[:5]
        ]
    
    def _identify_skill_gaps(self, nodes: List[SkillNode]) -> List[str]:
        """Identify skill gaps (skills with low proficiency)"""
        gaps = []
        
        for node in nodes:
            if node.proficiency_level < 4.0:  # Threshold for skill gap
                gaps.append(f"{node.name} (Proficiency: {node.proficiency_level}/10)")
        
        return gaps
    
    def _generate_learning_path(self, nodes: List[SkillNode]) -> List[Dict[str, Any]]:
        """Generate recommended learning path"""
        # Sort by proficiency (ascending) and evidence count (descending)
        sorted_nodes = sorted(nodes, key=lambda x: (x.proficiency_level, -x.evidence_count))
        
        learning_path = []
        for i, node in enumerate(sorted_nodes[:10]):  # Top 10 skills to learn
            learning_path.append({
                "step": i + 1,
                "skill": node.name,
                "category": node.category,
                "current_proficiency": node.proficiency_level,
                "priority": "High" if node.proficiency_level < 3.0 else "Medium" if node.proficiency_level < 6.0 else "Low"
            })
        
        return learning_path
    
    def visualize_skill_graph(self, skill_graph: SkillGraph, save_path: Optional[str] = None) -> str:
        """
        Create visualization of skill graph
        
        Args:
            skill_graph: Skill graph to visualize
            save_path: Optional path to save visualization
            
        Returns:
            Path to saved visualization
        """
        try:
            # Create NetworkX graph
            G = nx.Graph()
            
            # Add nodes with colors based on proficiency
            for node in skill_graph.nodes:
                G.add_node(
                    node.name,
                    proficiency=node.proficiency_level,
                    category=node.category
                )
            
            # Add edges
            for source, targets in skill_graph.edges.items():
                for target in targets:
                    G.add_edge(source, target)
            
            # Create visualization
            plt.figure(figsize=(12, 8))
            
            # Use spring layout
            pos = nx.spring_layout(G, k=2, iterations=50)
            
            # Color nodes by proficiency
            node_colors = [G.nodes[node].get("proficiency", 0) for node in G.nodes()]
            
            # Draw graph
            nx.draw(
                G, pos,
                with_labels=True,
                node_color=node_colors,
                cmap=plt.cm.RdYlGn,
                node_size=1000,
                font_size=8,
                font_weight="bold",
                edge_color="gray",
                alpha=0.7
            )
            
            # Add colorbar
            sm = plt.cm.ScalarMappable(cmap=plt.cm.RdYlGn, norm=plt.Normalize(vmin=0, vmax=10))
            sm.set_array([])
            plt.colorbar(sm, label="Proficiency Level")
            
            plt.title("Candidate Skill Graph", fontsize=16, fontweight="bold")
            plt.axis("off")
            
            # Save or show
            if save_path:
                plt.savefig(save_path, dpi=300, bbox_inches="tight")
                logger.info(f"Skill graph visualization saved to {save_path}")
                return save_path
            else:
                # Default save path
                default_path = f"skill_graph_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
                plt.savefig(default_path, dpi=300, bbox_inches="tight")
                logger.info(f"Skill graph visualization saved to {default_path}")
                return default_path
                
        except Exception as e:
            logger.error(f"Error visualizing skill graph: {str(e)}")
            raise
    
    def compare_skill_graphs(self, candidate_graph: SkillGraph, benchmark_graph: SkillGraph) -> Dict[str, Any]:
        """
        Compare candidate skill graph with benchmark
        
        Args:
            candidate_graph: Candidate's skill graph
            benchmark_graph: Benchmark skill graph
            
        Returns:
            Comparison results
        """
        try:
            # Create skill dictionaries for comparison
            candidate_skills = {node.name: node.proficiency_level for node in candidate_graph.nodes}
            benchmark_skills = {node.name: node.proficiency_level for node in benchmark_graph.nodes}
            
            # Find common and unique skills
            common_skills = set(candidate_skills.keys()) & set(benchmark_skills.keys())
            candidate_unique = set(candidate_skills.keys()) - set(benchmark_skills.keys())
            benchmark_unique = set(benchmark_skills.keys()) - set(candidate_skills.keys())
            
            # Calculate proficiency differences
            proficiency_diffs = {}
            for skill in common_skills:
                diff = candidate_skills[skill] - benchmark_skills[skill]
                proficiency_diffs[skill] = diff
            
            # Generate comparison metrics
            comparison = {
                "common_skills_count": len(common_skills),
                "candidate_unique_skills": list(candidate_unique),
                "benchmark_missing_skills": list(benchmark_unique),
                "average_proficiency_difference": np.mean(list(proficiency_diffs.values())) if proficiency_diffs else 0,
                "skills_above_benchmark": [skill for skill, diff in proficiency_diffs.items() if diff > 0],
                "skills_below_benchmark": [skill for skill, diff in proficiency_diffs.items() if diff < 0],
                "proficiency_differences": proficiency_diffs,
                "skill_match_percentage": (len(common_skills) / max(len(benchmark_skills), 1)) * 100
            }
            
            return comparison
            
        except Exception as e:
            logger.error(f"Error comparing skill graphs: {str(e)}")
            return {}

# Global skill graph service instance
skill_graph_service = SkillGraphService()
