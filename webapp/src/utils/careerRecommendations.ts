export function generateCareerRecommendation(answers: Record<string, string>): string {
  const { work_environment, work_style, interests, problem_solving, career_goals } = answers;

  // Simple recommendation logic - in a real app, this would be more sophisticated
  let primaryCareer: any;
  let alternativeCareers: any[] = [];
  let skills: string[] = [];
  let nextSteps: string[] = [];
  let reasoning = '';

  // Technology path
  if (interests === 'technology') {
    if (problem_solving === 'analytical') {
      primaryCareer = {
        title: 'Software Engineer',
        description: 'Design, develop, and maintain software applications and systems.',
        salary: '$85,000 - $150,000',
        growth: 'Excellent (22% growth expected)',
        education: 'Bachelor\'s in Computer Science or related field'
      };
      alternativeCareers = [
        { title: 'Data Scientist', description: 'Analyze complex data to help organizations make decisions' },
        { title: 'DevOps Engineer', description: 'Bridge development and operations teams' }
      ];
      skills = ['Programming', 'Problem Solving', 'System Design', 'Debugging', 'Version Control'];
    } else {
      primaryCareer = {
        title: 'UX/UI Designer',
        description: 'Create user-friendly interfaces and experiences for digital products.',
        salary: '$70,000 - $120,000',
        growth: 'Very Good (13% growth expected)',
        education: 'Bachelor\'s in Design or related field'
      };
      alternativeCareers = [
        { title: 'Product Manager', description: 'Guide product development from conception to launch' },
        { title: 'Web Developer', description: 'Build and maintain websites and web applications' }
      ];
      skills = ['Design Thinking', 'Prototyping', 'User Research', 'Visual Design', 'Communication'];
    }
  }

  // Business path
  else if (interests === 'business') {
    if (work_style === 'leadership') {
      primaryCareer = {
        title: 'Business Manager',
        description: 'Oversee business operations and lead teams to achieve organizational goals.',
        salary: '$75,000 - $130,000',
        growth: 'Good (8% growth expected)',
        education: 'Bachelor\'s in Business Administration or related field'
      };
      alternativeCareers = [
        { title: 'Project Manager', description: 'Plan and execute projects within organizations' },
        { title: 'Marketing Manager', description: 'Develop and implement marketing strategies' }
      ];
      skills = ['Leadership', 'Strategic Planning', 'Communication', 'Team Management', 'Analytics'];
    } else {
      primaryCareer = {
        title: 'Financial Analyst',
        description: 'Analyze financial data to guide business investment decisions.',
        salary: '$65,000 - $100,000',
        growth: 'Good (6% growth expected)',
        education: 'Bachelor\'s in Finance, Economics, or related field'
      };
      alternativeCareers = [
        { title: 'Business Analyst', description: 'Analyze business processes and recommend improvements' },
        { title: 'Consultant', description: 'Provide expert advice to organizations' }
      ];
      skills = ['Financial Modeling', 'Data Analysis', 'Research', 'Critical Thinking', 'Excel'];
    }
  }

  // Healthcare path
  else if (interests === 'healthcare') {
    primaryCareer = {
      title: 'Healthcare Professional',
      description: 'Provide medical care and support to patients in various healthcare settings.',
      salary: '$60,000 - $200,000+',
      growth: 'Excellent (15% growth expected)',
      education: 'Varies by role - from certificates to doctoral degrees'
    };
    alternativeCareers = [
      { title: 'Nurse Practitioner', description: 'Provide advanced nursing care and treatment' },
      { title: 'Healthcare Administrator', description: 'Manage healthcare facilities and operations' }
    ];
    skills = ['Patient Care', 'Medical Knowledge', 'Communication', 'Empathy', 'Problem Solving'];
  }

  // Creative path
  else if (interests === 'creative') {
    primaryCareer = {
      title: 'Creative Professional',
      description: 'Express creativity through various artistic mediums and commercial applications.',
      salary: '$45,000 - $90,000',
      growth: 'Good (4% growth expected)',
      education: 'Bachelor\'s in Fine Arts or related creative field'
    };
    alternativeCareers = [
      { title: 'Graphic Designer', description: 'Create visual concepts for print and digital media' },
      { title: 'Content Creator', description: 'Develop engaging content for various platforms' }
    ];
    skills = ['Creativity', 'Visual Design', 'Software Proficiency', 'Storytelling', 'Brand Development'];
  }

  // Education path
  else if (interests === 'education') {
    primaryCareer = {
      title: 'Educator',
      description: 'Teach and inspire students at various educational levels.',
      salary: '$45,000 - $80,000',
      growth: 'Good (8% growth expected)',
      education: 'Bachelor\'s degree plus teaching certification'
    };
    alternativeCareers = [
      { title: 'Training Specialist', description: 'Develop and deliver training programs for organizations' },
      { title: 'Curriculum Developer', description: 'Design educational programs and materials' }
    ];
    skills = ['Teaching', 'Communication', 'Patience', 'Curriculum Development', 'Classroom Management'];
  }

  // Science path
  else {
    primaryCareer = {
      title: 'Research Scientist',
      description: 'Conduct scientific research to advance knowledge in your field of expertise.',
      salary: '$70,000 - $120,000',
      growth: 'Good (8% growth expected)',
      education: 'Advanced degree (Master\'s or PhD) in relevant scientific field'
    };
    alternativeCareers = [
      { title: 'Lab Technician', description: 'Support scientific research through laboratory work' },
      { title: 'Scientific Writer', description: 'Communicate scientific information to various audiences' }
    ];
    skills = ['Research Methods', 'Data Analysis', 'Critical Thinking', 'Technical Writing', 'Laboratory Skills'];
  }

  // Generate next steps based on goals
  if (career_goals === 'stability') {
    nextSteps = [
      'Research job market demand in your area',
      'Obtain required certifications or education',
      'Build a strong professional network',
      'Gain relevant experience through internships or entry-level positions'
    ];
  } else if (career_goals === 'growth') {
    nextSteps = [
      'Identify advancement opportunities in your chosen field',
      'Develop leadership and management skills',
      'Build a portfolio showcasing your best work',
      'Seek mentorship from industry professionals'
    ];
  } else if (career_goals === 'impact') {
    nextSteps = [
      'Research organizations aligned with your values',
      'Volunteer in your field of interest',
      'Develop skills that address current societal challenges',
      'Network with professionals making a positive impact'
    ];
  } else {
    nextSteps = [
      'Research remote work opportunities',
      'Develop skills that support flexible work arrangements',
      'Build a strong online professional presence',
      'Consider freelance or consulting opportunities'
    ];
  }

  reasoning = `Based on your preferences for ${work_environment} work environment, ${work_style} work style, and your interest in ${interests}, this career path aligns well with your goals of ${career_goals.replace('_', ' ')}. Your preference for ${problem_solving} problem-solving also supports this recommendation.`;

  return JSON.stringify({
    primaryCareer,
    alternativeCareers,
    skills,
    nextSteps,
    reasoning
  });
}