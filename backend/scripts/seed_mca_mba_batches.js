import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../src/lib/core.js';

async function seedMcaMbaBatches() {
  console.log('--- Seeding MCA and MBA Students for Batches 2026, 2025, 2024 ---');

  const defaultPassword = 'student@123';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // 1. Fetch departments
  const deptList = await db.department.findMany({
    include: { programmes: true }
  });

  const csDept = deptList.find((d) => d.name.toLowerCase().includes('computer science'));
  const domsDept = deptList.find((d) => d.name.toLowerCase().includes('management'));

  if (!csDept || !domsDept) {
    throw new Error('Required departments (Computer Science, DOMS) not found in DB.');
  }

  // 2. Locate MCA & MBA programmes
  const mcaProg = csDept.programmes.find(
    (p) => p.name.includes('Master of Computer') || p.name.includes('MCA')
  );
  const mbaProg = domsDept.programmes.find(
    (p) => p.name.includes('MBA') || p.name.includes('Business')
  );

  if (!mcaProg || !mbaProg) {
    throw new Error('Could not find MCA or MBA programmes.');
  }

  console.log(`✓ Using CS Programme: ${mcaProg.name} (${mcaProg.id})`);
  console.log(`✓ Using DOMS Programme: ${mbaProg.name} (${mbaProg.id})`);

  // 3. Define 12 students (6 for MCA, 6 for MBA across 2026, 2025, 2024)
  const studentsData = [
    // ==========================================
    // COMPUTER SCIENCE - MCA - 2026 (2 Students)
    // ==========================================
    {
      fullName: 'ABHISHEK K',
      email: 'abhishek.k@periyaruniversity.ac.in',
      registrationNo: 'U26PG507CAP015',
      departmentId: csDept.id,
      programmeId: mcaProg.id,
      level: 'PG',
      passingYear: 2026,
      phone: '9843212345',
      about:
        'High-performing MCA student specializing in Cloud Microservices, Go, and React. Passionate about high-throughput backend architectures and container orchestration.',
      portfolio: 'https://abhishek-codes.vercel.app',
      linkedin: 'https://linkedin.com/in/abhishek-k-dev',
      github: 'https://github.com/abhishek-k-dev',
      twitter: 'https://twitter.com/abhishek_dev',
      educations: [
        {
          qualification: 'SSLC (10th Standard)',
          institution: 'St. Pauls Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2018,
          score: 91.2,
          scale: '% Percentage'
        },
        {
          qualification: 'HSC (12th Standard)',
          institution: 'St. Pauls Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2020,
          score: 89.4,
          scale: '% Percentage'
        },
        {
          qualification: 'B.Sc Computer Science',
          institution: 'Periyar University Departmental College',
          board: 'Periyar University',
          passingYear: 2023,
          score: 8.7,
          scale: '10.0 CGPA'
        },
        {
          qualification: 'Master of Computer Application (MCA)',
          institution: 'Department of Computer Science, Periyar University',
          board: 'Periyar University',
          passingYear: 2026,
          score: 8.85,
          scale: '10.0 CGPA'
        }
      ],
      skills: [
        'Go (Golang)',
        'React.js',
        'Node.js',
        'Docker',
        'Kubernetes',
        'PostgreSQL',
        'Redis',
        'REST APIs',
        'Microservices Architecture',
        'Git & GitHub'
      ],
      projects: [
        {
          title: 'Distributed Microservices Task Queue',
          technologies: 'Go, Redis, RabbitMQ, Docker',
          description:
            'Engineered distributed queue worker processing 15,000 asynchronous events/min with exponential backoff retry and Dead Letter Queue (DLQ).',
          github: 'https://github.com/abhishek-k-dev/go-distributed-queue',
          liveUrl: 'https://queue-monitor-demo.vercel.app'
        },
        {
          title: 'Cloud Native Health Monitoring Dashboard',
          technologies: 'React, Prometheus API, Tailwind CSS, WebSockets',
          description:
            'Real-time metrics visualizer streaming CPU, memory, and container status across Kubernetes pods with threshold alert notifications.',
          github: 'https://github.com/abhishek-k-dev/k8s-pod-monitor',
          liveUrl: 'https://cloud-health-dashboard.vercel.app'
        }
      ],
      internships: [
        {
          companyName: 'Chargebee Technologies',
          domain: 'Backend Engineering',
          startDate: new Date('2024-05-01'),
          endDate: new Date('2024-10-31'),
          description:
            'Developed subscription billing webhook dispatchers in Go, reducing dropped event rates to under 0.01% under heavy transaction spikes.'
        }
      ],
      experiences: [],
      certificates: [
        {
          title: 'Certified Kubernetes Administrator (CKA)',
          issuer: 'The Linux Foundation',
          year: 2024
        },
        {
          title: 'AWS Certified Developer – Associate',
          issuer: 'Amazon Web Services',
          year: 2023
        }
      ]
    },
    {
      fullName: 'HARINI S',
      email: 'harini.s@periyaruniversity.ac.in',
      registrationNo: 'U26PG507CAP016',
      departmentId: csDept.id,
      programmeId: mcaProg.id,
      level: 'PG',
      passingYear: 2026,
      phone: '9790123456',
      about:
        'Versatile MCA student with strong background in MERN stack, GraphQL, and modern web application security. Enthusiastic about creating accessible and intuitive digital interfaces.',
      portfolio: 'https://harini-fullstack.vercel.app',
      linkedin: 'https://linkedin.com/in/harini-s-mca',
      github: 'https://github.com/harini-s-tech',
      twitter: 'https://twitter.com/harini_codes',
      educations: [
        {
          qualification: 'SSLC (10th Standard)',
          institution: 'Holy Cross Girls Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2018,
          score: 93.5,
          scale: '% Percentage'
        },
        {
          qualification: 'HSC (12th Standard)',
          institution: 'Holy Cross Girls Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2020,
          score: 91.0,
          scale: '% Percentage'
        },
        {
          qualification: 'Bachelor of Computer Applications (BCA)',
          institution: 'Periyar University Departmental College',
          board: 'Periyar University',
          passingYear: 2023,
          score: 8.9,
          scale: '10.0 CGPA'
        },
        {
          qualification: 'Master of Computer Application (MCA)',
          institution: 'Department of Computer Science, Periyar University',
          board: 'Periyar University',
          passingYear: 2026,
          score: 8.95,
          scale: '10.0 CGPA'
        }
      ],
      skills: [
        'React',
        'Next.js',
        'Node.js',
        'GraphQL',
        'MongoDB',
        'Express.js',
        'TypeScript',
        'Jest Testing',
        'Tailwind CSS',
        'OAuth 2.0 Security'
      ],
      projects: [
        {
          title: 'Collaborative Real-Time Whiteboard & Code Editor',
          technologies: 'Next.js, WebSockets, WebRTC, Canvas API',
          description:
            'Built multi-user interactive canvas supporting live cursor presence, shape drawing, and concurrent code execution across team rooms.',
          github: 'https://github.com/harini-s-tech/collab-whiteboard',
          liveUrl: 'https://collab-canvas-live.vercel.app'
        },
        {
          title: 'Healthcare Teleconsultation & Prescription Portal',
          technologies: 'React, Node.js, GraphQL, MongoDB',
          description:
            'Created patient appointment scheduling system with automated SMS reminders and PDF prescription download generator.',
          github: 'https://github.com/harini-s-tech/telehealth-portal',
          liveUrl: 'https://telehealth-periyar.vercel.app'
        }
      ],
      internships: [
        {
          companyName: 'PayPal India',
          domain: 'Frontend Web Engineering',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-11-30'),
          description:
            'Implemented modular checkout components in React and improved WCAG accessibility rating across merchant onboarding flows.'
        }
      ],
      experiences: [],
      certificates: [
        {
          title: 'Meta Full-Stack Engineer Professional Certificate',
          issuer: 'Meta / Coursera',
          year: 2023
        },
        {
          title: 'MongoDB Certified Developer Associate',
          issuer: 'MongoDB Inc',
          year: 2024
        }
      ]
    },

    // ==========================================
    // COMPUTER SCIENCE - MCA - 2025 (2 Students)
    // ==========================================
    {
      fullName: 'MOHAMED FAZIL A',
      email: 'mohamedfazil.a@periyaruniversity.ac.in',
      registrationNo: 'U25PG507CAP021',
      departmentId: csDept.id,
      programmeId: mcaProg.id,
      level: 'PG',
      passingYear: 2025,
      phone: '9842234567',
      about:
        'Dynamic MCA graduating student experienced in Python backend development, Django, FastAPI, and Postgres database optimization. Passionate about building enterprise-grade REST APIs.',
      portfolio: 'https://fazil-dev.vercel.app',
      linkedin: 'https://linkedin.com/in/mohamed-fazil-a',
      github: 'https://github.com/fazil-codes',
      twitter: 'https://twitter.com/fazil_tech',
      educations: [
        {
          qualification: 'SSLC (10th Standard)',
          institution: 'Al-Ameen Matriculation Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2017,
          score: 88.6,
          scale: '% Percentage'
        },
        {
          qualification: 'HSC (12th Standard)',
          institution: 'Al-Ameen Matriculation Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2019,
          score: 86.8,
          scale: '% Percentage'
        },
        {
          qualification: 'B.Sc Computer Science',
          institution: 'Periyar University Arts College',
          board: 'Periyar University',
          passingYear: 2022,
          score: 8.35,
          scale: '10.0 CGPA'
        },
        {
          qualification: 'Master of Computer Application (MCA)',
          institution: 'Department of Computer Science, Periyar University',
          board: 'Periyar University',
          passingYear: 2025,
          score: 8.5,
          scale: '10.0 CGPA'
        }
      ],
      skills: [
        'Python',
        'FastAPI',
        'Django',
        'PostgreSQL',
        'Docker',
        'Celery',
        'Redis',
        'Linux Administration',
        'Git & CI/CD',
        'Nginx'
      ],
      projects: [
        {
          title: "Automated Exam Question Paper Generator with Bloom's Taxonomy",
          technologies: 'FastAPI, PostgreSQL, React, NLP',
          description:
            'Developed an algorithmic curriculum question selector balancing difficulty levels and module weights across university question banks.',
          github: 'https://github.com/fazil-codes/exam-generator-fastapi',
          liveUrl: 'https://auto-exam-gen.vercel.app'
        },
        {
          title: 'Multi-Tenant E-Commerce Inventory Engine',
          technologies: 'Django REST Framework, Celery, Redis, Docker',
          description:
            'Built multi-tenant vendor catalog with real-time stock deductions, order sync, and automated PDF invoice emailing.',
          github: 'https://github.com/fazil-codes/multitenant-ecommerce',
          liveUrl: 'https://inventory-hub-demo.vercel.app'
        }
      ],
      internships: [
        {
          companyName: 'Zoho Corporation',
          domain: 'Backend Engineering',
          startDate: new Date('2023-12-01'),
          endDate: new Date('2024-05-31'),
          description:
            'Enhanced Zoho Books payment reconciliation logic using Python and asynchronous database drivers.'
        }
      ],
      experiences: [
        {
          companyName: 'Softron Web Technologies',
          role: 'Junior Backend Developer Trainee',
          employmentType: 'Full-time',
          location: 'Salem, Tamil Nadu',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-12-31'),
          currentlyWorking: false,
          description:
            'Developed internal REST APIs for client CMS and integrated Razorpay payment webhooks.'
        }
      ],
      certificates: [
        {
          title: 'Python Institute Certified Associate in Python Programming (PCAP)',
          issuer: 'OpenEDG',
          year: 2023
        },
        {
          title: 'PostgreSQL 15 Associate Certification',
          issuer: 'EnterpriseDB',
          year: 2024
        }
      ]
    },
    {
      fullName: 'POOJA SHREE V',
      email: 'poojashree.v@periyaruniversity.ac.in',
      registrationNo: 'U25PG507CAP022',
      departmentId: csDept.id,
      programmeId: mcaProg.id,
      level: 'PG',
      passingYear: 2025,
      phone: '9944345678',
      about:
        'Driven MCA scholar proficient in Data Science, Machine Learning, and Big Data Analytics. Strong hands-on background in Scikit-learn, PyTorch, and Power BI reporting.',
      portfolio: 'https://poojashree-portfolio.vercel.app',
      linkedin: 'https://linkedin.com/in/pooja-shree-v',
      github: 'https://github.com/poojashree-v',
      twitter: 'https://twitter.com/pooja_codes',
      educations: [
        {
          qualification: 'SSLC (10th Standard)',
          institution: 'Sri Sarada Balamandir Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2017,
          score: 92.4,
          scale: '% Percentage'
        },
        {
          qualification: 'HSC (12th Standard)',
          institution: 'Sri Sarada Balamandir Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2019,
          score: 90.2,
          scale: '% Percentage'
        },
        {
          qualification: 'Bachelor of Computer Applications (BCA)',
          institution: 'Periyar University Departmental College',
          board: 'Periyar University',
          passingYear: 2022,
          score: 8.6,
          scale: '10.0 CGPA'
        },
        {
          qualification: 'Master of Computer Application (MCA)',
          institution: 'Department of Computer Science, Periyar University',
          board: 'Periyar University',
          passingYear: 2025,
          score: 8.78,
          scale: '10.0 CGPA'
        }
      ],
      skills: [
        'Python',
        'Scikit-learn',
        'PyTorch',
        'Pandas & NumPy',
        'Power BI',
        'SQL Analytics',
        'Streamlit',
        'Git & GitHub',
        'Tableau',
        'Exploratory Data Analysis'
      ],
      projects: [
        {
          title: 'Predictive Campus Placement Analytics & Skill Gap Detector',
          technologies: 'Python, Scikit-Learn, Streamlit, Pandas',
          description:
            'Trained Random Forest and XGBoost classifiers on 5 years of historical hiring data predicting student selection probability with 89% accuracy.',
          github: 'https://github.com/poojashree-v/placement-skill-gap-predictor',
          liveUrl: 'https://placement-analytics.streamlit.app'
        },
        {
          title: 'Customer Churn Prediction Dashboard with Explainable AI',
          technologies: 'Python, SHAP, LightGBM, Dash',
          description:
            'Engineered banking churn classification model with SHAP waterfall plots explaining individual customer risk drivers.',
          github: 'https://github.com/poojashree-v/churn-prediction-xai',
          liveUrl: 'https://churn-xai-dashboard.vercel.app'
        }
      ],
      internships: [
        {
          companyName: 'Mu Sigma Business Solutions',
          domain: 'Data Science & Analytics',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-06-15'),
          description:
            'Built data cleaning pipelines and feature selection algorithms on consumer marketing transaction logs.'
        }
      ],
      experiences: [],
      certificates: [
        {
          title: 'IBM Data Science Professional Certificate',
          issuer: 'IBM / Coursera',
          year: 2023
        },
        {
          title: 'TensorFlow Developer Certificate',
          issuer: 'Google',
          year: 2024
        }
      ]
    },

    // ==========================================
    // COMPUTER SCIENCE - MCA - 2024 (2 Students)
    // ==========================================
    {
      fullName: 'SANTHOSH KUMAR R',
      email: 'santhoshkumar.r@periyaruniversity.ac.in',
      registrationNo: 'U24PG507CAP003',
      departmentId: csDept.id,
      programmeId: mcaProg.id,
      level: 'PG',
      passingYear: 2024,
      phone: '9443145678',
      about:
        'Graduated MCA professional specializing in Java Enterprise, Spring Boot microservices, and Angular. Experienced in fintech transaction pipelines, unit testing, and CI/CD automation.',
      portfolio: 'https://santhosh-kumar-dev.vercel.app',
      linkedin: 'https://linkedin.com/in/santhoshkumar-r-dev',
      github: 'https://github.com/santhosh-kumar-r',
      twitter: 'https://twitter.com/santhosh_dev',
      educations: [
        {
          qualification: 'SSLC (10th Standard)',
          institution: 'AVS Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2016,
          score: 87.5,
          scale: '% Percentage'
        },
        {
          qualification: 'HSC (12th Standard)',
          institution: 'AVS Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2018,
          score: 85.0,
          scale: '% Percentage'
        },
        {
          qualification: 'B.Sc Computer Science',
          institution: 'Periyar University Departmental College',
          board: 'Periyar University',
          passingYear: 2021,
          score: 8.2,
          scale: '10.0 CGPA'
        },
        {
          qualification: 'Master of Computer Application (MCA)',
          institution: 'Department of Computer Science, Periyar University',
          board: 'Periyar University',
          passingYear: 2024,
          score: 8.45,
          scale: '10.0 CGPA'
        }
      ],
      skills: [
        'Java 17',
        'Spring Boot',
        'Spring Security',
        'Angular',
        'MySQL',
        'Docker',
        'Kafka',
        'JUnit 5',
        'Git & CI/CD',
        'Jenkins'
      ],
      projects: [
        {
          title: 'Core Banking Transaction Ledger & Fraud Alert Service',
          technologies: 'Java, Spring Boot, Kafka, MySQL, Angular',
          description:
            'Implemented double-entry accounting ledger processing simulated NEFT/RTGS fund transfers with Kafka transaction stream deduplication.',
          github: 'https://github.com/santhosh-kumar-r/banking-ledger-spring',
          liveUrl: 'https://banking-ledger-demo.vercel.app'
        },
        {
          title: 'Automated CI/CD Pipeline Dashboard for University Systems',
          technologies: 'Node.js, Docker, GitHub Actions API, React',
          description:
            'Built a centralized deployment status monitor tracking test runs, code coverage metrics, and container image builds across 8 repos.',
          github: 'https://github.com/santhosh-kumar-r/cicd-pipeline-monitor',
          liveUrl: 'https://cicd-monitor-demo.vercel.app'
        }
      ],
      internships: [
        {
          companyName: 'Wipro Technologies',
          domain: 'Java Enterprise Solutions',
          startDate: new Date('2023-08-01'),
          endDate: new Date('2024-02-28'),
          description:
            'Engineered Spring Boot REST controllers and fixed SonarQube security hotspots in banking client codebase.'
        }
      ],
      experiences: [
        {
          companyName: 'Covenant Tech Solutions',
          role: 'Software Engineer',
          employmentType: 'Full-time',
          location: 'Chennai, Tamil Nadu',
          startDate: new Date('2024-04-01'),
          endDate: new Date('2024-12-31'),
          currentlyWorking: false,
          description:
            'Developed enterprise microservices with Spring Cloud, Eureka service discovery, and Docker container deployments.'
        }
      ],
      certificates: [
        {
          title: 'Oracle Certified Professional: Java SE 11 Developer',
          issuer: 'Oracle',
          year: 2023
        },
        {
          title: 'Spring Professional Certification',
          issuer: 'VMware',
          year: 2024
        }
      ]
    },
    {
      fullName: 'DEEPALAKSHMI N',
      email: 'deepalakshmi.n@periyaruniversity.ac.in',
      registrationNo: 'U24PG507CAP004',
      departmentId: csDept.id,
      programmeId: mcaProg.id,
      level: 'PG',
      passingYear: 2024,
      phone: '9841256789',
      about:
        'Graduated MCA alumnus working in Mobile and Cloud App Engineering. Strong focus on Flutter, Firebase, and AWS serverless computing.',
      portfolio: 'https://deepa-dev.vercel.app',
      linkedin: 'https://linkedin.com/in/deepalakshmi-n-mca',
      github: 'https://github.com/deepalakshmi-n',
      twitter: 'https://twitter.com/deepa_tech',
      educations: [
        {
          qualification: 'SSLC (10th Standard)',
          institution: 'Government Girls Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2016,
          score: 90.0,
          scale: '% Percentage'
        },
        {
          qualification: 'HSC (12th Standard)',
          institution: 'Government Girls Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2018,
          score: 88.5,
          scale: '% Percentage'
        },
        {
          qualification: 'B.Sc Computer Science',
          institution: 'Periyar University Department of Computer Science',
          board: 'Periyar University',
          passingYear: 2021,
          score: 8.4,
          scale: '10.0 CGPA'
        },
        {
          qualification: 'Master of Computer Application (MCA)',
          institution: 'Department of Computer Science, Periyar University',
          board: 'Periyar University',
          passingYear: 2024,
          score: 8.6,
          scale: '10.0 CGPA'
        }
      ],
      skills: [
        'Flutter & Dart',
        'Firebase Firestore',
        'AWS Lambda',
        'Node.js',
        'REST APIs',
        'Git & GitHub',
        'SQLite',
        'Figma UI Design',
        'Google Play Store Publishing',
        'State Management (Bloc/Provider)'
      ],
      projects: [
        {
          title: 'Salem City Smart Water Supply & Grievance App',
          technologies: 'Flutter, Firebase, Cloud Functions, Google Maps',
          description:
            'Designed public utility reporting app with geotagged complaint photos and municipal ward routing.',
          github: 'https://github.com/deepalakshmi-n/salem-water-app',
          liveUrl: 'https://salem-smart-water.web.app'
        },
        {
          title: 'Cross-Platform Attendance & QR Check-in System',
          technologies: 'Flutter, Node.js, MongoDB, QR Scanner API',
          description:
            'Created fast student QR attendance scanning app with offline sync and automated attendance percentage reports.',
          github: 'https://github.com/deepalakshmi-n/qr-attendance-flutter',
          liveUrl: 'https://qr-attendance-app.vercel.app'
        }
      ],
      internships: [
        {
          companyName: 'Cognizant Technology Solutions',
          domain: 'Mobile App Development',
          startDate: new Date('2023-09-01'),
          endDate: new Date('2024-03-31'),
          description:
            'Developed cross-platform Flutter screens for healthcare client and configured automated testing workflows.'
        }
      ],
      experiences: [
        {
          companyName: 'Skyline Digital Innovations',
          role: 'Associate Mobile App Developer',
          employmentType: 'Full-time',
          location: 'Coimbatore, Tamil Nadu',
          startDate: new Date('2024-05-01'),
          endDate: new Date('2024-12-31'),
          currentlyWorking: false,
          description:
            'Developed and published 3 production Flutter apps to Google Play Store with 50K+ combined downloads.'
        }
      ],
      certificates: [
        {
          title: 'Google Associate Android Developer',
          issuer: 'Google Developers',
          year: 2023
        },
        {
          title: 'AWS Certified Cloud Practitioner',
          issuer: 'Amazon Web Services',
          year: 2023
        }
      ]
    },

    // ==========================================
    // DOMS - MBA - 2026 (2 Students)
    // ==========================================
    {
      fullName: 'VISHNU PRASAD M',
      email: 'vishnuprasad.m@periyaruniversity.ac.in',
      registrationNo: 'U26PG508MBA025',
      departmentId: domsDept.id,
      programmeId: mbaProg.id,
      level: 'PG',
      passingYear: 2026,
      phone: '9791234578',
      about:
        'MBA candidate in Finance & Investment Banking. Skilled in DCF financial valuation, equity research, corporate mergers & acquisitions analysis, and Power BI financial reporting.',
      portfolio: 'https://vishnu-mba-finance.vercel.app',
      linkedin: 'https://linkedin.com/in/vishnuprasad-m-mba',
      github: 'https://github.com/vishnuprasad-fin',
      twitter: 'https://twitter.com/vishnu_finance',
      educations: [
        {
          qualification: 'SSLC (10th Standard)',
          institution: 'Sri Ramakrishna Mission Vidyalaya, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2018,
          score: 91.5,
          scale: '% Percentage'
        },
        {
          qualification: 'HSC (12th Standard - Commerce)',
          institution: 'Sri Ramakrishna Mission Vidyalaya, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2020,
          score: 89.0,
          scale: '% Percentage'
        },
        {
          qualification: 'Bachelor of Commerce (B.Com)',
          institution: 'Periyar University Departmental College',
          board: 'Periyar University',
          passingYear: 2023,
          score: 8.5,
          scale: '10.0 CGPA'
        },
        {
          qualification: 'Master of Business Administration (MBA)',
          institution: 'Department of Management Studies (DOMS), Periyar University',
          board: 'Periyar University',
          passingYear: 2026,
          score: 8.75,
          scale: '10.0 CGPA'
        }
      ],
      skills: [
        'Financial Modeling',
        'DCF Valuation',
        'Corporate Finance',
        'Power BI Dashboards',
        'Advanced MS Excel',
        'Equity Research',
        'Bloomberg Terminal Concepts',
        'Credit Risk Analysis',
        'Portfolio Theory'
      ],
      projects: [
        {
          title: 'Valuation & M&A Synergy Analysis of Indian EV Sector',
          technologies: 'Excel Financial Model, DCF, Monte Carlo, Power BI',
          description:
            'Constructed comprehensive 3-statement financial forecast and merger synergy model for electric two-wheeler manufacturers.',
          github: 'https://github.com/vishnuprasad-fin/ev-m-and-a-valuation',
          liveUrl: 'https://vishnu-mba-finance.vercel.app/ev-valuation'
        },
        {
          title: 'Fixed Income Yield Curve & Credit Spread Monitor',
          technologies: 'Python, Excel, Streamlit, NSE Data API',
          description:
            'Analyzed government bond yield curve inversions and corporate bond spread risk across rating tiers from AAA to BBB.',
          github: 'https://github.com/vishnuprasad-fin/bond-yield-tracker',
          liveUrl: 'https://bond-yield-monitor.streamlit.app'
        }
      ],
      internships: [
        {
          companyName: 'Kotak Mahindra Capital',
          domain: 'Investment Banking & Corporate Advisory',
          startDate: new Date('2024-05-15'),
          endDate: new Date('2024-08-15'),
          description:
            'Assisted deal advisory team in preparing pitch decks, industry benchmarking models, and confidential information memorandums (CIM).'
        }
      ],
      experiences: [],
      certificates: [
        {
          title: 'Financial Modeling & Valuation Analyst (FMVA)',
          issuer: 'Corporate Finance Institute (CFI)',
          year: 2024
        },
        {
          title: 'NISM Series XV: Research Analyst Certification',
          issuer: 'National Institute of Securities Markets (NISM)',
          year: 2024
        }
      ]
    },
    {
      fullName: 'MEGHA SHARMA K',
      email: 'meghasharma.k@periyaruniversity.ac.in',
      registrationNo: 'U26PG508MBA026',
      departmentId: domsDept.id,
      programmeId: mbaProg.id,
      level: 'PG',
      passingYear: 2026,
      phone: '9600123489',
      about:
        'MBA scholar specializing in Human Resource Management & Organizational Behavior. Passionate about people analytics, compensation benchmarking, and modern performance appraisal frameworks.',
      portfolio: 'https://megha-hr-analytics.vercel.app',
      linkedin: 'https://linkedin.com/in/megha-sharma-hr',
      github: 'https://github.com/megha-sharma-analytics',
      twitter: 'https://twitter.com/megha_hr',
      educations: [
        {
          qualification: 'SSLC (10th Standard)',
          institution: 'Kendriya Vidyalaya, Salem',
          board: 'CBSE',
          passingYear: 2018,
          score: 92.0,
          scale: '% Percentage'
        },
        {
          qualification: 'HSC (12th Standard)',
          institution: 'Kendriya Vidyalaya, Salem',
          board: 'CBSE',
          passingYear: 2020,
          score: 90.5,
          scale: '% Percentage'
        },
        {
          qualification: 'Bachelor of Business Administration (BBA)',
          institution: 'Periyar University Departmental College',
          board: 'Periyar University',
          passingYear: 2023,
          score: 8.7,
          scale: '10.0 CGPA'
        },
        {
          qualification: 'Master of Business Administration (MBA)',
          institution: 'Department of Management Studies (DOMS), Periyar University',
          board: 'Periyar University',
          passingYear: 2026,
          score: 8.85,
          scale: '10.0 CGPA'
        }
      ],
      skills: [
        'People Analytics',
        'HRIS Platforms',
        'Talent Acquisition',
        'Performance Management (OKRs)',
        'Employee Engagement Frameworks',
        'Power BI Dashboards',
        'Advanced MS Excel',
        'Indian Labor Laws & Compliance'
      ],
      projects: [
        {
          title: 'Employee Turnover Risk & Engagement Index Model',
          technologies: 'Power BI, Excel Statistical Functions, SurveyMonkey API',
          description:
            'Analyzed engagement survey responses from 600+ corporate employees identifying burnout indicators and retention intervention triggers.',
          github: 'https://github.com/megha-sharma-analytics/hr-turnover-index',
          liveUrl: 'https://megha-hr-analytics.vercel.app/turnover-model'
        },
        {
          title: 'Competitive Compensation & Salary Benchmarking Matrix',
          technologies: 'Python, Pandas, Tableau, Excel',
          description:
            'Created compensation percentile grid across 25 tech and management roles in South Indian IT hubs.',
          github: 'https://github.com/megha-sharma-analytics/comp-benchmarking',
          liveUrl: 'https://megha-hr-analytics.vercel.app/salary-grid'
        }
      ],
      internships: [
        {
          companyName: 'Infosys BPM',
          domain: 'Human Resources & Talent Management',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-09-30'),
          description:
            'Supported campus recruitment drives across 12 universities and automated candidate offer letter generation pipeline.'
        }
      ],
      experiences: [],
      certificates: [
        {
          title: 'Associate Professional in Human Resources (aPHR)',
          issuer: 'HR Certification Institute (HRCI)',
          year: 2024
        },
        {
          title: 'HR Analytics Specialization',
          issuer: 'Coursera / Wharton University',
          year: 2023
        }
      ]
    },

    // ==========================================
    // DOMS - MBA - 2025 (2 Students)
    // ==========================================
    {
      fullName: 'PRAVEEN RAJ S',
      email: 'praveenraj.s@periyaruniversity.ac.in',
      registrationNo: 'U25PG508MBA011',
      departmentId: domsDept.id,
      programmeId: mbaProg.id,
      level: 'PG',
      passingYear: 2025,
      phone: '9843345679',
      about:
        'MBA graduate in Marketing Management & Digital Brand Strategy. Experienced in omnichannel growth marketing, SEO/SEM performance campaigns, and consumer behavior analysis.',
      portfolio: 'https://praveen-marketing-mba.vercel.app',
      linkedin: 'https://linkedin.com/in/praveen-raj-s-mba',
      github: 'https://github.com/praveen-raj-marketing',
      twitter: 'https://twitter.com/praveen_brand',
      educations: [
        {
          qualification: 'SSLC (10th Standard)',
          institution: 'Montfort Higher Secondary School, Yercaud',
          board: 'Tamil Nadu State Board',
          passingYear: 2017,
          score: 89.0,
          scale: '% Percentage'
        },
        {
          qualification: 'HSC (12th Standard)',
          institution: 'Montfort Higher Secondary School, Yercaud',
          board: 'Tamil Nadu State Board',
          passingYear: 2019,
          score: 87.5,
          scale: '% Percentage'
        },
        {
          qualification: 'Bachelor of Business Administration (BBA)',
          institution: 'Periyar University Arts College',
          board: 'Periyar University',
          passingYear: 2022,
          score: 8.4,
          scale: '10.0 CGPA'
        },
        {
          qualification: 'Master of Business Administration (MBA)',
          institution: 'Department of Management Studies (DOMS), Periyar University',
          board: 'Periyar University',
          passingYear: 2025,
          score: 8.6,
          scale: '10.0 CGPA'
        }
      ],
      skills: [
        'Digital Marketing Strategy',
        'Google Ads & GA4 Analytics',
        'SEO / SEM Optimization',
        'Consumer Behavior Analysis',
        'Brand Positioning',
        'Social Media Performance Campaigns',
        'HubSpot CRM',
        'Market Sizing & TAM / SAM'
      ],
      projects: [
        {
          title: 'D2C Brand Launch & Customer Acquisition Strategy',
          technologies: 'Google Analytics 4, Meta Ads Manager, Excel Modeling',
          description:
            'Formulated end-to-end go-to-market plan for an organic wellness D2C startup, forecasting CAC, LTV, and ROAS across channels.',
          github: 'https://github.com/praveen-raj-marketing/d2c-launch-strategy',
          liveUrl: 'https://praveen-marketing-mba.vercel.app/gtm-plan'
        },
        {
          title: 'Retail Footfall & Visual Merchandising Impact Analysis',
          technologies: 'Power BI, SPSS, Survey Data',
          description:
            'Studied impact of store layout modifications on basket size and dwell time across 10 department stores in Salem and Erode.',
          github: 'https://github.com/praveen-raj-marketing/retail-merchandising-study',
          liveUrl: 'https://praveen-marketing-mba.vercel.app/retail-study'
        }
      ],
      internships: [
        {
          companyName: 'Marico Limited',
          domain: 'Sales & Marketing Operations',
          startDate: new Date('2024-04-15'),
          endDate: new Date('2024-07-15'),
          description:
            'Managed territory sales distribution audits and organized consumer activation campaigns across 40 rural retail outlets.'
        }
      ],
      experiences: [
        {
          companyName: 'BrandSpark Marketing Agency',
          role: 'Digital Marketing Associate Trainee',
          employmentType: 'Full-time',
          location: 'Salem, Tamil Nadu',
          startDate: new Date('2024-08-01'),
          endDate: new Date('2024-12-31'),
          currentlyWorking: false,
          description:
            'Managed PPC budgets exceeding ₹5 Lakhs/month achieving 3.8x average ROAS for FMCG clients.'
        }
      ],
      certificates: [
        {
          title: 'Google Analytics 4 Certification',
          issuer: 'Google',
          year: 2024
        },
        {
          title: 'HubSpot Inbound Marketing Certified',
          issuer: 'HubSpot Academy',
          year: 2023
        }
      ]
    },
    {
      fullName: 'SWETHA MOHAN R',
      email: 'swethamohan.r@periyaruniversity.ac.in',
      registrationNo: 'U25PG508MBA012',
      departmentId: domsDept.id,
      programmeId: mbaProg.id,
      level: 'PG',
      passingYear: 2025,
      phone: '9790456780',
      about:
        'Operations & Supply Chain Management specialist. Passionate about lean manufacturing principles, inventory replenishment modeling, and enterprise ERP implementation.',
      portfolio: 'https://swetha-supplychain.vercel.app',
      linkedin: 'https://linkedin.com/in/swetha-mohan-ops',
      github: 'https://github.com/swetha-mohan-scm',
      twitter: 'https://twitter.com/swetha_ops',
      educations: [
        {
          qualification: 'SSLC (10th Standard)',
          institution: 'St. Anthonys Matriculation Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2017,
          score: 91.0,
          scale: '% Percentage'
        },
        {
          qualification: 'HSC (12th Standard)',
          institution: 'St. Anthonys Matriculation Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2019,
          score: 89.5,
          scale: '% Percentage'
        },
        {
          qualification: 'Bachelor of Commerce (B.Com)',
          institution: 'Periyar University Departmental College',
          board: 'Periyar University',
          passingYear: 2022,
          score: 8.55,
          scale: '10.0 CGPA'
        },
        {
          qualification: 'Master of Business Administration (MBA)',
          institution: 'Department of Management Studies (DOMS), Periyar University',
          board: 'Periyar University',
          passingYear: 2025,
          score: 8.7,
          scale: '10.0 CGPA'
        }
      ],
      skills: [
        'Supply Chain Analytics',
        'Lean Six Sigma',
        'SAP S/4HANA (Basics)',
        'Inventory Management Models',
        'Procurement & Sourcing',
        'MS Excel Solver Optimization',
        'Demand Forecasting',
        'Total Quality Management (TQM)'
      ],
      projects: [
        {
          title: 'Demand Forecasting & Safety Stock Optimization Model',
          technologies: 'Python (ARIMA / Holt-Winters), Excel Solver, Power BI',
          description:
            'Built statistical demand forecasting engine reducing forecast bias by 18% for a regional auto ancillary manufacturer.',
          github: 'https://github.com/swetha-mohan-scm/demand-forecasting-model',
          liveUrl: 'https://swetha-supplychain.vercel.app/forecast'
        },
        {
          title: 'Green Supply Chain & Carbon Footprint Audit in Textiles',
          technologies: 'Tableau, Life Cycle Assessment (LCA) Framework, Excel',
          description:
            'Evaluated logistics emission benchmarks and reverse logistics recycling opportunities for 15 textile processing units.',
          github: 'https://github.com/swetha-mohan-scm/green-supply-chain-study',
          liveUrl: 'https://swetha-supplychain.vercel.app/green-scm'
        }
      ],
      internships: [
        {
          companyName: 'TVS Motor Company',
          domain: 'Operations & Quality Assurance',
          startDate: new Date('2024-05-01'),
          endDate: new Date('2024-08-31'),
          description:
            'Applied 5S and Kaizen methodologies on motorcycle assembly sub-lines, reducing cycle idle time by 7%.'
        }
      ],
      experiences: [],
      certificates: [
        {
          title: 'Certified Supply Chain Analyst (CSCA)',
          issuer: 'ISCEA',
          year: 2024
        },
        {
          title: 'Lean Six Sigma Green Belt (ICGB)',
          issuer: 'KPMG / MSME',
          year: 2023
        }
      ]
    },

    // ==========================================
    // DOMS - MBA - 2024 (2 Students)
    // ==========================================
    {
      fullName: 'ARUN KUMAR T',
      email: 'arunkumar.t@periyaruniversity.ac.in',
      registrationNo: 'U24PG508MBA005',
      departmentId: domsDept.id,
      programmeId: mbaProg.id,
      level: 'PG',
      passingYear: 2024,
      phone: '9442567891',
      about:
        'MBA alumnus with dual specialization in Logistics & International Business. Proven expertise in freight forwarding, customs clearance, and global supply network design.',
      portfolio: 'https://arun-ops-mba.vercel.app',
      linkedin: 'https://linkedin.com/in/arunkumar-t-mba',
      github: 'https://github.com/arun-kumar-biz',
      twitter: 'https://twitter.com/arun_operations',
      educations: [
        {
          qualification: 'SSLC (10th Standard)',
          institution: 'Government Model Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2016,
          score: 86.0,
          scale: '% Percentage'
        },
        {
          qualification: 'HSC (12th Standard)',
          institution: 'Government Model Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2018,
          score: 84.5,
          scale: '% Percentage'
        },
        {
          qualification: 'Bachelor of Business Administration (BBA)',
          institution: 'Periyar University Departmental College',
          board: 'Periyar University',
          passingYear: 2021,
          score: 8.1,
          scale: '10.0 CGPA'
        },
        {
          qualification: 'Master of Business Administration (MBA)',
          institution: 'Department of Management Studies (DOMS), Periyar University',
          board: 'Periyar University',
          passingYear: 2024,
          score: 8.35,
          scale: '10.0 CGPA'
        }
      ],
      skills: [
        'International Logistics',
        'EXIM Documentation',
        'Freight Management',
        'Warehouse Operations',
        'SAP ERP Basics',
        'MS Project',
        'Vendor Negotiation',
        'Port Terminal Logistics'
      ],
      projects: [
        {
          title: 'Port Logistics Congestion & Container Turnaround Study',
          technologies: 'Arena Simulation, Excel Modeling, Power BI',
          description:
            'Simulated berth allocation and container crane scheduling at Chennai port, proposing queuing models that cut dwell time by 14 hours.',
          github: 'https://github.com/arun-kumar-biz/port-logistics-simulation',
          liveUrl: 'https://arun-ops-mba.vercel.app/port-study'
        },
        {
          title: 'Incoterms 2020 Compliance & Freight Cost Comparison Tool',
          technologies: 'Python, Excel, Web Dashboard',
          description:
            'Created automated cost estimation calculator comparing CIF, FOB, and DDP shipping economics across multimodal cargo routes.',
          github: 'https://github.com/arun-kumar-biz/incoterms-freight-calculator',
          liveUrl: 'https://arun-ops-mba.vercel.app/freight-calc'
        }
      ],
      internships: [
        {
          companyName: 'Allcargo Logistics Ltd',
          domain: 'International Freight Forwarding',
          startDate: new Date('2023-08-01'),
          endDate: new Date('2024-01-31'),
          description:
            'Assisted freight operations desk in bill of lading tracking, customs manifest filings, and container tracking.'
        }
      ],
      experiences: [
        {
          companyName: 'DHL Global Forwarding',
          role: 'Logistics Operations Executive',
          employmentType: 'Full-time',
          location: 'Chennai, Tamil Nadu',
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-12-31'),
          currentlyWorking: false,
          description:
            'Supervised air and ocean freight export consignments with 99.2% on-time transit SLA compliance.'
        }
      ],
      certificates: [
        {
          title: 'Certified International Trade & Logistics Professional (CITLP)',
          issuer: 'FIATA',
          year: 2023
        },
        {
          title: 'MS Project & Project Scheduling Certificate',
          issuer: 'PMI Chapter',
          year: 2023
        }
      ]
    },
    {
      fullName: 'NANDHINI DEVI P',
      email: 'nandhinidevi.p@periyaruniversity.ac.in',
      registrationNo: 'U24PG508MBA006',
      departmentId: domsDept.id,
      programmeId: mbaProg.id,
      level: 'PG',
      passingYear: 2024,
      phone: '9842678902',
      about:
        'Graduated MBA professional specializing in Banking Operations, Credit Risk Assessment, and Wealth Management. Experienced in underwriting corporate loans and assessing retail credit scores.',
      portfolio: 'https://nandhini-banking-mba.vercel.app',
      linkedin: 'https://linkedin.com/in/nandhini-devi-p',
      github: 'https://github.com/nandhini-fin-mba',
      twitter: 'https://twitter.com/nandhini_biz',
      educations: [
        {
          qualification: 'SSLC (10th Standard)',
          institution: 'Sri Sarada Girls Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2016,
          score: 89.2,
          scale: '% Percentage'
        },
        {
          qualification: 'HSC (12th Standard - Commerce)',
          institution: 'Sri Sarada Girls Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2018,
          score: 88.0,
          scale: '% Percentage'
        },
        {
          qualification: 'Bachelor of Commerce (B.Com)',
          institution: 'Periyar University Department of Commerce',
          board: 'Periyar University',
          passingYear: 2021,
          score: 8.4,
          scale: '10.0 CGPA'
        },
        {
          qualification: 'Master of Business Administration (MBA)',
          institution: 'Department of Management Studies (DOMS), Periyar University',
          board: 'Periyar University',
          passingYear: 2024,
          score: 8.55,
          scale: '10.0 CGPA'
        }
      ],
      skills: [
        'Credit Appraisal',
        'Banking Operations',
        'Financial Statement Spreading',
        'AML / KYC Compliance',
        'Finacle (Basics)',
        'Risk Underwriting',
        'MS Excel Financial Modeling',
        'Customer Relationship Management'
      ],
      projects: [
        {
          title: 'Credit Appraisal & Working Capital Assessment of SME Textile Units',
          technologies: 'Excel Financial Models, Tandon Committee Norms, Power BI',
          description:
            'Evaluated balance sheets of 20 textile manufacturing firms to establish MPBF (Maximum Permissible Bank Finance) limits.',
          github: 'https://github.com/nandhini-fin-mba/sme-credit-appraisal',
          liveUrl: 'https://nandhini-banking-mba.vercel.app/credit-model'
        },
        {
          title: 'Non-Performing Assets (NPA) Resolution & Recovery Strategy Framework',
          technologies: 'SPSS, Power BI, Excel',
          description:
            'Analyzed stressed asset resolution timelines under IBC and SARFAESI acts for regional commercial cooperative banks.',
          github: 'https://github.com/nandhini-fin-mba/npa-resolution-study',
          liveUrl: 'https://nandhini-banking-mba.vercel.app/npa-study'
        }
      ],
      internships: [
        {
          companyName: 'ICICI Bank Ltd',
          domain: 'Retail Credit & Banking Operations',
          startDate: new Date('2023-09-01'),
          endDate: new Date('2024-02-28'),
          description:
            'Processed mortgage and business loan applications, verifying income documents and CIBIL credit profiles.'
        }
      ],
      experiences: [
        {
          companyName: 'Axis Bank Ltd',
          role: 'Assistant Manager – Credit Risk',
          employmentType: 'Full-time',
          location: 'Salem, Tamil Nadu',
          startDate: new Date('2024-04-01'),
          endDate: new Date('2024-12-31'),
          currentlyWorking: false,
          description:
            'Conducted financial spreading and pre-sanction site visits for commercial SME borrowers.'
        }
      ],
      certificates: [
        {
          title: 'Certificate in Commercial Banking & Credit Analysis (CBCA)',
          issuer: 'Corporate Finance Institute (CFI)',
          year: 2023
        },
        {
          title: 'JAIIB (Junior Associate of Indian Institute of Bankers)',
          issuer: 'Indian Institute of Banking and Finance (IIBF)',
          year: 2024
        }
      ]
    }
  ];

  console.log(`Starting insertion of ${studentsData.length} MCA and MBA students...`);

  for (const s of studentsData) {
    // 1. Upsert User
    const user = await db.user.upsert({
      where: { email: s.email },
      update: {
        fullName: s.fullName,
        passwordHash,
        role: 'STUDENT',
        status: 'ACTIVE',
        mustChangePassword: false
      },
      create: {
        email: s.email,
        fullName: s.fullName,
        passwordHash,
        role: 'STUDENT',
        status: 'ACTIVE',
        mustChangePassword: false
      }
    });

    // 2. Check if student profile exists
    let student = await db.student.findFirst({
      where: {
        OR: [{ userId: user.id }, { registrationNo: s.registrationNo }]
      }
    });

    if (student) {
      // Clean child collections
      await db.education.deleteMany({ where: { studentId: student.id } });
      await db.studentSkill.deleteMany({ where: { studentId: student.id } });
      await db.studentProject.deleteMany({ where: { studentId: student.id } });
      await db.internship.deleteMany({ where: { studentId: student.id } });
      await db.experience.deleteMany({ where: { studentId: student.id } });
      await db.certificate.deleteMany({ where: { studentId: student.id } });

      student = await db.student.update({
        where: { id: student.id },
        data: {
          userId: user.id,
          registrationNo: s.registrationNo,
          departmentId: s.departmentId,
          programmeId: s.programmeId,
          level: s.level,
          passingYear: s.passingYear,
          phone: s.phone,
          about: s.about,
          portfolio: s.portfolio,
          linkedin: s.linkedin,
          github: s.github,
          twitter: s.twitter
        }
      });
    } else {
      student = await db.student.create({
        data: {
          userId: user.id,
          registrationNo: s.registrationNo,
          departmentId: s.departmentId,
          programmeId: s.programmeId,
          level: s.level,
          passingYear: s.passingYear,
          phone: s.phone,
          about: s.about,
          portfolio: s.portfolio,
          linkedin: s.linkedin,
          github: s.github,
          twitter: s.twitter
        }
      });
    }

    // 3. Insert Educations
    for (const edu of s.educations) {
      await db.education.create({
        data: {
          studentId: student.id,
          qualification: edu.qualification,
          institution: edu.institution,
          board: edu.board,
          passingYear: edu.passingYear,
          score: edu.score,
          scale: edu.scale
        }
      });
    }

    // 4. Insert Skills
    for (const skill of s.skills) {
      await db.studentSkill.create({
        data: {
          studentId: student.id,
          name: skill
        }
      });
    }

    // 5. Insert Projects
    for (const proj of s.projects) {
      await db.studentProject.create({
        data: {
          studentId: student.id,
          title: proj.title,
          technologies: proj.technologies,
          description: proj.description,
          github: proj.github,
          liveUrl: proj.liveUrl
        }
      });
    }

    // 6. Insert Internships
    for (const intern of s.internships) {
      await db.internship.create({
        data: {
          studentId: student.id,
          companyName: intern.companyName,
          domain: intern.domain,
          startDate: intern.startDate,
          endDate: intern.endDate,
          description: intern.description
        }
      });
    }

    // 7. Insert Experiences
    for (const exp of s.experiences) {
      await db.experience.create({
        data: {
          studentId: student.id,
          companyName: exp.companyName,
          role: exp.role,
          employmentType: exp.employmentType,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          currentlyWorking: exp.currentlyWorking,
          description: exp.description
        }
      });
    }

    // 8. Insert Certificates
    for (const cert of s.certificates) {
      await db.certificate.create({
        data: {
          studentId: student.id,
          title: cert.title,
          issuer: cert.issuer,
          year: cert.year
        }
      });
    }

    console.log(
      `✓ Seeded: ${s.fullName} (${s.registrationNo}) [${s.departmentId === csDept.id ? 'MCA' : 'MBA'} - Batch of ${s.passingYear}]`
    );
  }

  console.log('\nAll 12 MCA and MBA batch students seeded successfully!');
}

seedMcaMbaBatches()
  .catch((err) => {
    console.error('Error seeding MCA and MBA batches:', err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
