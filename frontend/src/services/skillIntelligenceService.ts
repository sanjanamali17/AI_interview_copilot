/**
 * Skill Intelligence Service - AI Interview Copilot v5
 * Maps and analyzes candidate technical skills with competency assessment
 */

export interface SkillAssessment {
  skill: string;
  category: 'technical' | 'soft' | 'domain' | 'experience';
  currentLevel: number; // 0-100
  requiredLevel: number; // 0-100
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  evidence: string[];
  knowledgeGaps: string[];
  recommendations: string[];
}

export interface SkillGraph {
  nodes: SkillNode[];
  edges: SkillEdge[];
  clusters: SkillCluster[];
}

export interface SkillNode {
  id: string;
  name: string;
  category: string;
  level: number;
  importance: 'critical' | 'important' | 'nice-to-have';
  assessed: boolean;
  evidence?: string;
}

export interface SkillEdge {
  source: string;
  target: string;
  relationship: 'prerequisite' | 'related' | 'enhances';
  strength: number; // 0-1
}

export interface SkillCluster {
  name: string;
  skills: string[];
  averageLevel: number;
  description: string;
}

export class SkillIntelligenceService {
  private skillTaxonomy = {
    technical: [
      'Python', 'JavaScript', 'Java', 'C++', 'Go', 'Rust',
      'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
      'Data Structures', 'Algorithms', 'System Design', 'Database Design',
      'Cloud Computing', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
      'React', 'Node.js', 'Angular', 'Vue.js', 'Frontend', 'Backend',
      'SQL', 'NoSQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
      'REST APIs', 'GraphQL', 'Microservices', 'Distributed Systems',
      'Testing', 'CI/CD', 'Git', 'Agile', 'DevOps'
    ],
    soft: [
      'Communication', 'Leadership', 'Teamwork', 'Problem Solving',
      'Critical Thinking', 'Creativity', 'Adaptability', 'Time Management',
      'Presentation Skills', 'Negotiation', 'Mentoring', 'Conflict Resolution'
    ],
    domain: [
      'Data Analysis', 'Data Science', 'Business Intelligence',
      'Product Management', 'Project Management', 'UX Design',
      'Security', 'Performance', 'Scalability', 'Analytics'
    ]
  };

  /**
   * Analyze candidate skills from resume and interview responses
   */
  analyzeSkills(resumeText: string, interviewResponses: string[], position: string): SkillAssessment[] {
    const allText = `${resumeText} ${interviewResponses.join(' ')}`.toLowerCase();
    const assessments: SkillAssessment[] = [];

    // Define required skills for position
    const requiredSkills = this.getRequiredSkillsForPosition(position);

    requiredSkills.forEach(skill => {
      const assessment = this.assessIndividualSkill(skill, allText, interviewResponses);
      assessments.push(assessment);
    });

    return assessments.sort((a, b) => b.currentLevel - a.currentLevel);
  }

  /**
   * Assess individual skill based on evidence
   */
  private assessIndividualSkill(skill: string, text: string, responses: string[]): SkillAssessment {
    const skillKeywords = this.getSkillKeywords(skill);
    const evidence: string[] = [];
    let level = 0;

    // Find evidence in text
    skillKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches && matches.length > 0) {
        evidence.push(`Mentioned "${keyword}" ${matches.length} time(s)`);
        level += Math.min(matches.length * 10, 30);
      }
    });

    // Analyze responses for depth of knowledge
    responses.forEach((response, index) => {
      if (this.responseContainsSkill(response, skill)) {
        const depth = this.analyzeResponseDepth(response, skill);
        evidence.push(`Question ${index + 1}: ${depth.description}`);
        level += depth.score;
      }
    });

    // Determine proficiency level
    const proficiency = this.getProficiencyLevel(level);

    // Identify knowledge gaps
    const knowledgeGaps = this.identifyKnowledgeGaps(skill, level, proficiency);

    // Generate recommendations
    const recommendations = this.generateSkillRecommendations(skill, level, proficiency);

    return {
      skill,
      category: this.getSkillCategory(skill),
      currentLevel: Math.min(100, level),
      requiredLevel: this.getRequiredLevel(skill, this.getSkillCategory(skill)),
      proficiency,
      evidence,
      knowledgeGaps,
      recommendations
    };
  }

  /**
   * Generate skill graph visualization data
   */
  generateSkillGraph(assessments: SkillAssessment[]): SkillGraph {
    const nodes: SkillNode[] = assessments.map(assessment => ({
      id: assessment.skill,
      name: assessment.skill,
      category: assessment.category,
      level: assessment.currentLevel,
      importance: this.getSkillImportance(assessment.skill),
      assessed: true,
      evidence: assessment.evidence.join('; ')
    }));

    const edges: SkillEdge[] = this.generateSkillEdges(nodes);
    const clusters = this.generateSkillClusters(nodes);

    return { nodes, edges, clusters };
  }

  /**
   * Get required skills for specific position
   */
  private getRequiredSkillsForPosition(position: string): string[] {
    const positionSkills = {
      'Data Scientist': [
        'Python', 'Machine Learning', 'Statistics', 'Data Analysis',
        'SQL', 'Communication', 'Problem Solving', 'Critical Thinking'
      ],
      'Software Engineer': [
        'Data Structures', 'Algorithms', 'System Design', 'Testing',
        'Git', 'Communication', 'Teamwork', 'Problem Solving'
      ],
      'Frontend Developer': [
        'JavaScript', 'React', 'CSS', 'HTML', 'UX Design',
        'Communication', 'Teamwork', 'Problem Solving'
      ],
      'Backend Developer': [
        'Python', 'Java', 'Database Design', 'REST APIs',
        'System Design', 'Communication', 'Problem Solving'
      ]
    };

    return positionSkills[position as keyof typeof positionSkills] || positionSkills['Data Scientist'];
  }

  /**
   * Get keywords associated with each skill
   */
  private getSkillKeywords(skill: string): string[] {
    const keywordMap: Record<string, string[]> = {
      'Python': ['python', 'django', 'flask', 'pandas', 'numpy', 'jupyter'],
      'Machine Learning': ['machine learning', 'ml', 'algorithms', 'models', 'training', 'prediction'],
      'JavaScript': ['javascript', 'js', 'nodejs', 'npm', 'es6', 'async'],
      'React': ['react', 'jsx', 'hooks', 'components', 'redux', 'state'],
      'System Design': ['system design', 'architecture', 'scalability', 'performance', 'distributed'],
      'Communication': ['communicate', 'presentation', 'explain', 'discuss', 'collaborate'],
      'Problem Solving': ['solve', 'problem', 'solution', 'approach', 'algorithm', 'optimize']
    };

    return keywordMap[skill] || [skill.toLowerCase()];
  }

  /**
   * Check if response contains evidence of skill
   */
  private responseContainsSkill(response: string, skill: string): boolean {
    const keywords = this.getSkillKeywords(skill);
    return keywords.some(keyword => response.toLowerCase().includes(keyword));
  }

  /**
   * Analyze depth of knowledge in response
   */
  private analyzeResponseDepth(response: string, skill: string): { score: number; description: string } {
    const keywords = this.getSkillKeywords(skill);
    const matches = keywords.filter(keyword => response.toLowerCase().includes(keyword));
    
    let score = 0;
    let description = '';

    if (matches.length >= 3) {
      score = 25;
      description = 'Comprehensive understanding demonstrated';
    } else if (matches.length >= 2) {
      score = 15;
      description = 'Good understanding of key concepts';
    } else if (matches.length >= 1) {
      score = 8;
      description = 'Basic familiarity with skill';
    }

    // Bonus for detailed explanations
    if (response.length > 200) {
      score += 10;
      description += ' with detailed explanation';
    }

    return { score, description };
  }

  /**
   * Determine proficiency level from score
   */
  private getProficiencyLevel(score: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    if (score >= 80) return 'expert';
    if (score >= 60) return 'advanced';
    if (score >= 40) return 'intermediate';
    return 'beginner';
  }

  /**
   * Identify knowledge gaps for skill
   */
  private identifyKnowledgeGaps(
    skill: string, level: number, _proficiency: string): string[] {
    const gaps: string[] = [];

    if (level < 30) {
      gaps.push(`Fundamental understanding of ${skill} needed`);
    } else if (level < 60) {
      gaps.push(`Intermediate concepts in ${skill} require development`);
    } else if (level < 80) {
      gaps.push(`Advanced ${skill} techniques could be strengthened`);
    }

    // Skill-specific gaps
    const skillGaps: Record<string, string[]> = {
      'Python': ['Advanced data structures', 'Performance optimization', 'Async programming'],
      'Machine Learning': ['Deep learning architectures', 'Model optimization', 'MLOps practices'],
      'System Design': ['Distributed systems', 'Load balancing', 'Caching strategies'],
      'Communication': ['Technical presentation', 'Stakeholder management', 'Cross-functional collaboration']
    };

    if (skillGaps[skill]) {
      gaps.push(...skillGaps[skill].slice(0, 2));
    }

    return gaps;
  }

  /**
   * Generate learning recommendations
   */
  private generateSkillRecommendations(
    skill: string, _level: number, _proficiency: string): string[] {
    const recommendations: string[] = [];

    if (_proficiency === 'beginner') {
      recommendations.push(`Complete foundational ${skill} courses`);
      recommendations.push(`Practice ${skill} with hands-on projects`);
    } else if (_proficiency === 'intermediate') {
      recommendations.push(`Work on advanced ${skill} concepts`);
      recommendations.push(`Apply ${skill} in real-world scenarios`);
    } else if (_proficiency === 'advanced') {
      recommendations.push(`Explore cutting-edge ${skill} techniques`);
      recommendations.push(`Mentor others in ${skill}`);
    }

    // Add specific recommendations
    const specificRecs: Record<string, string[]> = {
      'Python': ['Build data processing pipelines', 'Contribute to open-source Python projects'],
      'Machine Learning': ['Implement papers from scratch', 'Participate in Kaggle competitions'],
      'System Design': ['Design large-scale systems', 'Study distributed systems patterns']
    };

    if (specificRecs[skill]) {
      recommendations.push(...specificRecs[skill]);
    }

    return recommendations;
  }

  /**
   * Get skill category
   */
  private getSkillCategory(skill: string): 'technical' | 'soft' | 'domain' | 'experience' {
    for (const [category, skills] of Object.entries(this.skillTaxonomy)) {
      if (skills.includes(skill)) {
        return category as 'technical' | 'soft' | 'domain';
      }
    }
    return 'technical';
  }

  /**
   * Get required proficiency level for skill
   */
  private getRequiredLevel(_skill: string, category: string): number {
    // Critical technical skills require higher levels
    if (category === 'technical') {
      return 75;
    }
    // Soft skills are important but can be developed
    if (category === 'soft') {
      return 70;
    }
    // Domain knowledge varies by role
    return 65;
  }

  /**
   * Get skill importance for position
   */
  private getSkillImportance(skill: string): 'critical' | 'important' | 'nice-to-have' {
    const criticalSkills = ['Python', 'Machine Learning', 'Problem Solving', 'Communication'];
    const importantSkills = ['SQL', 'Statistics', 'Data Analysis', 'Teamwork'];
    
    if (criticalSkills.includes(skill)) return 'critical';
    if (importantSkills.includes(skill)) return 'important';
    return 'nice-to-have';
  }

  /**
   * Generate skill relationships for graph
   */
  private generateSkillEdges(nodes: SkillNode[]): SkillEdge[] {
    const edges: SkillEdge[] = [];
    
    // Define known relationships
    const relationships = [
      { source: 'Python', target: 'Machine Learning', relationship: 'prerequisite' as const, strength: 0.9 },
      { source: 'Statistics', target: 'Machine Learning', relationship: 'prerequisite' as const, strength: 0.8 },
      { source: 'Machine Learning', target: 'Deep Learning', relationship: 'prerequisite' as const, strength: 0.8 },
      { source: 'Data Analysis', target: 'Machine Learning', relationship: 'enhances' as const, strength: 0.7 },
      { source: 'Communication', target: 'Problem Solving', relationship: 'enhances' as const, strength: 0.6 },
      { source: 'System Design', target: 'Distributed Systems', relationship: 'prerequisite' as const, strength: 0.8 }
    ];

    relationships.forEach(rel => {
      if (nodes.find(n => n.id === rel.source) && nodes.find(n => n.id === rel.target)) {
        edges.push(rel);
      }
    });

    return edges;
  }

  /**
   * Generate skill clusters
   */
  private generateSkillClusters(nodes: SkillNode[]): SkillCluster[] {
    const clusters: SkillCluster[] = [];
    
    // Group by category
    const categories = ['technical', 'soft', 'domain'];
    
    categories.forEach(category => {
      const categorySkills = nodes.filter(n => n.category === category);
      if (categorySkills.length > 0) {
        const avgLevel = categorySkills.reduce((sum, node) => sum + node.level, 0) / categorySkills.length;
        
        clusters.push({
          name: category.charAt(0).toUpperCase() + category.slice(1) + ' Skills',
          skills: categorySkills.map(n => n.id),
          averageLevel: avgLevel,
          description: `${category} competencies and capabilities`
        });
      }
    });

    return clusters;
  }

  /**
   * Get skill strength color for visualization
   */
  getSkillColor(level: number): string {
    if (level >= 80) return '#10b981'; // green
    if (level >= 60) return '#3b82f6'; // blue
    if (level >= 40) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  }

  /**
   * Get category color for visualization
   */
  getCategoryColor(category: string): string {
    switch (category) {
      case 'technical': return '#3b82f6';
      case 'soft': return '#10b981';
      case 'domain': return '#8b5cf6';
      default: return '#6b7280';
    }
  }
}

export const skillIntelligenceService = new SkillIntelligenceService();
