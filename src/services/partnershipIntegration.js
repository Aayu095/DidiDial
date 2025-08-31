// Partnership Integration System for NGOs, Government Programs, and Corporate CSR
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Partnership Types
export const PARTNERSHIP_TYPES = {
  NGO: 'ngo',
  GOVERNMENT: 'government',
  CORPORATE_CSR: 'corporate_csr',
  EDUCATIONAL_INSTITUTION: 'educational_institution',
  HEALTHCARE: 'healthcare',
  FINANCIAL_INSTITUTION: 'financial_institution'
};

// Government Schemes Integration
export const GOVERNMENT_SCHEMES = {
  DIGITAL_INDIA: {
    id: 'digital_india',
    name: 'Digital India',
    nameHindi: 'डिजिटल इंडिया',
    description: 'Government initiative to transform India into digitally empowered society',
    descriptionHindi: 'भारत को डिजिटल रूप से सशक्त समाज में बदलने की सरकारी पहल',
    website: 'https://digitalindia.gov.in',
    helpline: '1800-11-3333',
    relevantModules: ['digital_basics', 'financial_literacy'],
    benefits: [
      'Digital literacy training',
      'Online government services access',
      'Digital payment systems',
      'E-governance services'
    ],
    benefitsHindi: [
      'डिजिटल साक्षरता प्रशिक्षण',
      'ऑनलाइन सरकारी सेवाओं तक पहुंच',
      'डिजिटल भुगतान प्रणाली',
      'ई-गवर्नेंस सेवाएं'
    ],
    eligibility: 'All Indian citizens',
    eligibilityHindi: 'सभी भारतीय नागरिक',
    applicationProcess: 'Visit nearest Common Service Center or apply online',
    applicationProcessHindi: 'निकटतम कॉमन सर्विस सेंटर पर जाएं या ऑनलाइन आवेदन करें'
  },
  
  SKILL_INDIA: {
    id: 'skill_india',
    name: 'Skill India',
    nameHindi: 'स्किल इंडिया',
    description: 'Initiative to skill youth for better livelihoods',
    descriptionHindi: 'बेहतर आजीविका के लिए युवाओं को कुशल बनाने की पहल',
    website: 'https://skillindia.gov.in',
    helpline: '1800-123-9626',
    relevantModules: ['digital_basics', 'financial_literacy', 'functional_literacy'],
    benefits: [
      'Free skill development training',
      'Certification',
      'Job placement assistance',
      'Financial support during training'
    ],
    benefitsHindi: [
      'मुफ्त कौशल विकास प्रशिक्षण',
      'प्रमाणन',
      'नौकरी में सहायता',
      'प्रशिक्षण के दौरान वित्तीय सहायता'
    ],
    eligibility: 'Youth aged 15-45 years',
    eligibilityHindi: '15-45 वर्ष की आयु के युवा',
    applicationProcess: 'Register on Skill India portal or visit training centers',
    applicationProcessHindi: 'स्किल इंडिया पोर्टल पर रजिस्टर करें या प्रशिक्षण केंद्रों पर जाएं'
  },

  BETI_BACHAO_BETI_PADHAO: {
    id: 'beti_bachao_beti_padhao',
    name: 'Beti Bachao Beti Padhao',
    nameHindi: 'बेटी बचाओ बेटी पढ़ाओ',
    description: 'Scheme for girl child welfare and education',
    descriptionHindi: 'बालिका कल्याण और शिक्षा के लिए योजना',
    website: 'https://wcd.nic.in/bbbp-scheme',
    helpline: '011-23388612',
    relevantModules: ['functional_literacy', 'health_education'],
    benefits: [
      'Educational scholarships for girls',
      'Health and nutrition support',
      'Awareness campaigns',
      'Skill development programs'
    ],
    benefitsHindi: [
      'लड़कियों के लिए शैक्षिक छात्रवृत्ति',
      'स्वास्थ्य और पोषण सहायता',
      'जागरूकता अभियान',
      'कौशल विकास कार्यक्रम'
    ],
    eligibility: 'Girl children and women',
    eligibilityHindi: 'बालिकाएं और महिलाएं',
    applicationProcess: 'Contact local Anganwadi or district administration',
    applicationProcessHindi: 'स्थानीय आंगनवाड़ी या जिला प्रशासन से संपर्क करें'
  },

  UJJWALA_YOJANA: {
    id: 'ujjwala_yojana',
    name: 'Pradhan Mantri Ujjwala Yojana',
    nameHindi: 'प्रधानमंत्री उज्ज्वला योजना',
    description: 'Free LPG connections to women from BPL families',
    descriptionHindi: 'बीपीएल परिवारों की महिलाओ��� को मुफ्त एलपीजी कनेक्शन',
    website: 'https://pmuy.gov.in',
    helpline: '1800-266-6696',
    relevantModules: ['health_education', 'financial_literacy'],
    benefits: [
      'Free LPG connection',
      'Subsidized refills',
      'Health benefits from clean cooking',
      'Women empowerment'
    ],
    benefitsHindi: [
      'मुफ्त एलपीजी कनेक्शन',
      'सब्सिडी वाले रिफिल',
      'स्वच्छ खाना पकाने से स्वास्थ्य लाभ',
      'महिला सशक्तिकरण'
    ],
    eligibility: 'Women from BPL families',
    eligibilityHindi: 'बीपीएल परिवारों की महिलाएं',
    applicationProcess: 'Apply through LPG distributors with required documents',
    applicationProcessHindi: 'आवश्यक दस्तावेजों के साथ एलपीजी वितरकों के माध्यम से आवेदन करें'
  },

  AYUSHMAN_BHARAT: {
    id: 'ayushman_bharat',
    name: 'Ayushman Bharat',
    nameHindi: 'आयुष्मान भारत',
    description: 'Health insurance scheme for economically vulnerable families',
    descriptionHindi: 'आर्थिक र��प से कमजोर परिवारों के लिए स्वास्थ्य बीमा योजना',
    website: 'https://pmjay.gov.in',
    helpline: '14555',
    relevantModules: ['health_education', 'digital_basics'],
    benefits: [
      'Health insurance up to ₹5 lakh per family',
      'Cashless treatment',
      'Coverage for pre and post hospitalization',
      'No premium payment required'
    ],
    benefitsHindi: [
      'प्रति परिवार ₹5 लाख तक का स्वास्थ्य बीमा',
      'कैशलेस इलाज',
      'अस्पताल में भर्ती से पहले और बाद का कवरेज',
      'कोई प्रीमियम भुगतान आवश्यक नहीं'
    ],
    eligibility: 'Families identified through SECC database',
    eligibilityHindi: 'SECC डेटाबेस के माध्यम से पहचाने गए परिवार',
    applicationProcess: 'Check eligibility online or visit nearest hospital',
    applicationProcessHindi: 'ऑनलाइन पात्रता जांचें या निकटतम अस्पताल जाएं'
  }
};

// NGO Partners
export const NGO_PARTNERS = {
  PRATHAM: {
    id: 'pratham',
    name: 'Pratham',
    focus: 'Education and literacy',
    focusHindi: 'शिक्षा और साक्षरता',
    website: 'https://pratham.org',
    programs: [
      'Adult literacy programs',
      'Digital literacy training',
      'Women empowerment initiatives'
    ],
    programsHindi: [
      'वयस्क साक्षरता कार्यक्रम',
      'डिजिटल साक्षरता प्रशिक्षण',
      'महिला सशक्तिकरण पहल'
    ],
    collaborationAreas: ['functional_literacy', 'digital_basics'],
    contactInfo: {
      email: 'info@pratham.org',
      phone: '+91-22-6632-2000'
    }
  },

  SELF_EMPLOYED_WOMENS_ASSOCIATION: {
    id: 'sewa',
    name: 'Self Employed Women\'s Association (SEWA)',
    nameHindi: 'स्व-नियोजित महिला संघ (सेवा)',
    focus: 'Women\'s economic empowerment',
    focusHindi: 'महिलाओं का आर्थिक सशक्तिकरण',
    website: 'https://sewa.org',
    programs: [
      'Financial literacy training',
      'Microfinance services',
      'Skill development programs',
      'Healthcare services'
    ],
    programsHindi: [
      'वित्तीय साक्षरता प्रशिक्षण',
      'म���इक्रोफाइनेंस सेवाएं',
      'कौशल विकास कार्यक्रम',
      'स्वास्थ्य सेवाएं'
    ],
    collaborationAreas: ['financial_literacy', 'health_education'],
    contactInfo: {
      email: 'sewa@sewa.org',
      phone: '+91-79-2550-6444'
    }
  }
};

// Corporate CSR Partners
export const CORPORATE_PARTNERS = {
  TATA_TRUSTS: {
    id: 'tata_trusts',
    name: 'Tata Trusts',
    focus: 'Education and digital literacy',
    focusHindi: 'शिक्षा और डिजिटल साक्षरता',
    website: 'https://tatatrusts.org',
    programs: [
      'Digital literacy initiatives',
      'Women empowerment programs',
      'Healthcare access',
      'Skill development'
    ],
    programsHindi: [
      'डिजिटल साक्षरता पहल',
      'महिला सशक्तिकरण कार्यक्रम',
      'स्वास्थ्य सेवा पहुंच',
      'कौशल विकास'
    ],
    collaborationAreas: ['digital_basics', 'health_education', 'functional_literacy'],
    csr_budget: '₹1000+ crores annually',
    contactInfo: {
      email: 'info@tatatrusts.org',
      phone: '+91-22-6665-8282'
    }
  },

  INFOSYS_FOUNDATION: {
    id: 'infosys_foundation',
    name: 'Infosys Foundation',
    focus: 'Education and technology access',
    focusHindi: 'शिक्षा और प्रौद्योगिकी पहुंच',
    website: 'https://infosys.com/infosys-foundation',
    programs: [
      'Digital literacy programs',
      'Women in technology initiatives',
      'Rural education support',
      'Healthcare technology'
    ],
    programsHindi: [
      'डिजिटल साक्षरता कार्यक्रम',
      'प्रौद्योगिकी में महिला पहल',
      'ग्रामीण शिक्षा सहायता',
      'स्वास्थ्य प्रौद्योगिकी'
    ],
    collaborationAreas: ['digital_basics', 'functional_literacy'],
    csr_budget: '₹200+ crores annually',
    contactInfo: {
      email: 'foundation@infosys.com',
      phone: '+91-80-2852-0261'
    }
  }
};

// Partnership Integration Service
export class PartnershipIntegrationService {
  constructor() {
    this.db = getFirestore();
  }

  // Get relevant government schemes for user
  async getRelevantSchemes(userProfile) {
    const relevantSchemes = [];
    
    // Filter schemes based on user's completed modules and demographics
    Object.values(GOVERNMENT_SCHEMES).forEach(scheme => {
      let relevanceScore = 0;
      
      // Check module relevance
      scheme.relevantModules.forEach(moduleId => {
        if (userProfile.completedModules?.includes(moduleId)) {
          relevanceScore += 2;
        } else if (userProfile.currentModule === moduleId) {
          relevanceScore += 3;
        }
      });
      
      // Check demographic relevance
      if (scheme.id === 'beti_bachao_beti_padhao' && userProfile.category === 'बच्ची') {
        relevanceScore += 5;
      }
      
      if (scheme.id === 'ujjwala_yojana' && userProfile.category === 'महिला') {
        relevanceScore += 3;
      }
      
      if (relevanceScore > 0) {
        relevantSchemes.push({
          ...scheme,
          relevanceScore
        });
      }
    });
    
    // Sort by relevance score
    return relevantSchemes.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // Get NGO partners for collaboration
  async getNGOPartners(focusArea) {
    return Object.values(NGO_PARTNERS).filter(ngo => 
      ngo.collaborationAreas.includes(focusArea)
    );
  }

  // Get corporate CSR opportunities
  async getCSROpportunities(userSkills, location) {
    const opportunities = [];
    
    Object.values(CORPORATE_PARTNERS).forEach(partner => {
      const matchingAreas = partner.collaborationAreas.filter(area => 
        userSkills.includes(area)
      );
      
      if (matchingAreas.length > 0) {
        opportunities.push({
          ...partner,
          matchingAreas,
          opportunityType: 'skill_development'
        });
      }
    });
    
    return opportunities;
  }

  // Create certification for completed modules
  async generateCertification(userId, moduleId, partnerOrg = null) {
    try {
      const certificationId = `cert_${Date.now()}_${userId}_${moduleId}`;
      
      const certification = {
        id: certificationId,
        userId,
        moduleId,
        partnerOrganization: partnerOrg,
        issueDate: Date.now(),
        validUntil: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year validity
        certificateType: 'completion',
        verificationCode: this.generateVerificationCode(),
        skills: this.getSkillsForModule(moduleId),
        isVerified: partnerOrg ? true : false,
        downloadUrl: null // Would be generated after creating PDF
      };
      
      await setDoc(doc(this.db, 'certifications', certificationId), certification);
      
      return certification;
    } catch (error) {
      console.error('Error generating certification:', error);
      throw error;
    }
  }

  // Connect user with local support services
  async findLocalSupport(userLocation, supportType) {
    const localSupport = {
      anganwadi: [],
      healthCenters: [],
      bankBranches: [],
      cscCenters: [], // Common Service Centers
      ngoOffices: []
    };
    
    // In a real implementation, this would query a database of local services
    // For now, returning mock data based on location
    
    if (supportType === 'health' || supportType === 'all') {
      localSupport.healthCenters = [
        {
          name: 'प्राथमिक स्वास्थ्य केंद्र',
          address: `${userLocation.district}, ${userLocation.state}`,
          phone: '108', // Emergency number
          services: ['मातृ स्वास्थ्य', 'बाल स्वास्थ्य', 'टीकाकरण'],
          timings: '9:00 AM - 5:00 PM'
        }
      ];
    }
    
    if (supportType === 'financial' || supportType === 'all') {
      localSupport.bankBranches = [
        {
          name: 'भारतीय स्टेट बैंक',
          address: `मुख्य बाजार, ${userLocation.district}`,
          phone: '1800-11-2211',
          services: ['खाता खोलना', 'लोन', 'डिजिटल बैंकिंग'],
          timings: '10:00 AM - 4:00 PM'
        }
      ];
    }
    
    if (supportType === 'digital' || supportType === 'all') {
      localSupport.cscCenters = [
        {
          name: 'कॉमन सर्विस सेंटर',
          address: `${userLocation.village}, ${userLocation.district}`,
          phone: '1800-3000-3468',
          services: ['डिजिटल सेवाएं', 'ऑनलाइन आवेदन', 'प्रमाण पत्र'],
          timings: '9:00 AM - 6:00 PM'
        }
      ];
    }
    
    return localSupport;
  }

  // Track partnership engagement
  async trackPartnershipEngagement(userId, partnerType, partnerId, engagementType) {
    try {
      const engagementId = `engagement_${Date.now()}_${userId}`;
      
      const engagement = {
        id: engagementId,
        userId,
        partnerType,
        partnerId,
        engagementType, // 'scheme_applied', 'program_joined', 'certification_earned'
        timestamp: Date.now(),
        status: 'active',
        outcome: null // To be updated later
      };
      
      await setDoc(doc(this.db, 'partnershipEngagements', engagementId), engagement);
      
      return engagement;
    } catch (error) {
      console.error('Error tracking partnership engagement:', error);
      throw error;
    }
  }

  // Helper methods
  generateVerificationCode() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  getSkillsForModule(moduleId) {
    const moduleSkills = {
      'digital_basics': ['फोन का उपयोग', 'इंटरनेट सुरक्षा', 'डिजिटल पेमेंट'],
      'functional_literacy': ['पढ़ना', 'लिखना', 'बुनियादी गणित'],
      'health_education': ['स्वास्थ्य जागरूकता', 'पोषण', 'स्वच्छता'],
      'financial_literacy': ['बैंकिंग', 'बचत', 'बजट बनाना']
    };
    
    return moduleSkills[moduleId] || [];
  }

  // Get partnership impact metrics
  async getPartnershipImpact() {
    try {
      // In real implementation, this would aggregate data from multiple sources
      return {
        totalBeneficiaries: 50000,
        schemesConnected: 15,
        certificationsIssued: 12000,
        ngoPartnerships: 25,
        corporatePartnerships: 10,
        governmentPrograms: 8,
        successRate: 85, // Percentage of users who successfully accessed services
        averageTimeToService: 7 // Days
      };
    } catch (error) {
      console.error('Error getting partnership impact:', error);
      return null;
    }
  }
}

// Export singleton instance
export const partnershipService = new PartnershipIntegrationService();