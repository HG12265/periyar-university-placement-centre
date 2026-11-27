import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../src/lib/core.js';

async function seed10Students() {
  console.log('--- Seeding 10 Comprehensive Students for Periyar University Placement Portal ---');

  const defaultPassword = 'student@123';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // 1. Fetch departments
  const deptList = await db.department.findMany({
    include: { programmes: true }
  });

  const getDept = (namePattern) => {
    return deptList.find((d) => d.name.toLowerCase().includes(namePattern.toLowerCase()));
  };

  const csDept = getDept('computer science');
  const domsDept = getDept('management');
  const commDept = getDept('commerce');
  const mathDept = getDept('mathematics');
  const engDept = getDept('english');

  if (!csDept || !domsDept || !commDept || !mathDept || !engDept) {
    throw new Error('Could not find all required departments in the database.');
  }

  // 2. Ensure UG programmes exist
  async function ensureProgramme(deptId, name, level, code) {
    const existing = await db.programme.findFirst({
      where: { departmentId: deptId, name }
    });
    if (existing) return existing;
    return await db.programme.create({
      data: {
        departmentId: deptId,
        name,
        level,
        code,
        active: true
      }
    });
  }

  // PG programmes (find existing or create)
  const mcaProg = csDept.programmes.find((p) => p.name.includes('Master of Computer') || p.name.includes('MCA')) ||
    await ensureProgramme(csDept.id, 'Master of Computer Application', 'PG', 'MCA');

  const mbaProg = domsDept.programmes.find((p) => p.name.includes('MBA') || p.name.includes('Business')) ||
    await ensureProgramme(domsDept.id, 'Master of Business Administration (MBA)', 'PG', 'MBA');

  const mcomProg = commDept.programmes.find((p) => p.name.includes('M.Com') || p.name.includes('Commerce')) ||
    await ensureProgramme(commDept.id, 'M.Com', 'PG', 'MCOM');

  const mscMathProg = mathDept.programmes.find((p) => p.name.includes('M.Sc') || p.name.includes('Mathematics')) ||
    await ensureProgramme(mathDept.id, 'M.Sc Mathematics', 'PG', 'MSCMATH');

  const maEngProg = engDept.programmes.find((p) => p.name.includes('M.A') || p.name.includes('English')) ||
    await ensureProgramme(engDept.id, 'M.A. English', 'PG', 'MAENG');

  // UG programmes (create if missing)
  const bscCsProg = await ensureProgramme(csDept.id, 'B.Sc Computer Science', 'UG', 'BSCCS');
  const bcaProg = await ensureProgramme(csDept.id, 'Bachelor of Computer Applications (BCA)', 'UG', 'BCA');
  const bbaProg = await ensureProgramme(domsDept.id, 'Bachelor of Business Administration (BBA)', 'UG', 'BBA');
  const bcomProg = await ensureProgramme(commDept.id, 'Bachelor of Commerce (B.Com)', 'UG', 'BCOM');
  const bscMathProg = await ensureProgramme(mathDept.id, 'B.Sc Mathematics', 'UG', 'BSCMATH');

  console.log('✓ Academic Programmes verified (UG and PG).');

  // 3. Define 10 detailed students
  const studentsData = [
    // --- 1. PG - Computer Science - Batch of 2027 ---
    {
      fullName: 'PRIYADHARSHINI S',
      email: 'priyadharshini.s@periyaruniversity.ac.in',
      registrationNo: 'U27PG507CAP012',
      departmentId: csDept.id,
      programmeId: mcaProg.id,
      level: 'PG',
      passingYear: 2027,
      phone: '9842111201',
      about:
        'Enthusiastic MCA scholar passionate about full-stack web engineering, scalable distributed systems, and cloud architecture. Proven track record in developing high-performance React and Node.js solutions with clean UI/UX and rigorous testing.',
      portfolio: 'https://priyadharshini-dev.vercel.app',
      linkedin: 'https://linkedin.com/in/priyadharshini-s-dev',
      github: 'https://github.com/priyadharshini-s',
      twitter: 'https://twitter.com/priya_codes',
      educations: [
        {
          qualification: 'SSLC (10th Standard)',
          institution: 'St. Marys Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2019,
          score: 94.2,
          scale: '% Percentage'
        },
        {
          qualification: 'HSC (12th Standard - Computer Science)',
          institution: 'St. Marys Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2021,
          score: 91.8,
          scale: '% Percentage'
        },
        {
          qualification: 'B.Sc Computer Science',
          institution: 'Periyar University Departmental College, Salem',
          board: 'Periyar University',
          passingYear: 2024,
          score: 8.85,
          scale: '10.0 CGPA'
        },
        {
          qualification: 'Master of Computer Application (MCA)',
          institution: 'Periyar University Campus, Salem',
          board: 'Periyar University',
          passingYear: 2027,
          score: 8.92,
          scale: '10.0 CGPA'
        }
      ],
      skills: [
        'React.js',
        'Node.js',
        'Express.js',
        'TypeScript',
        'PostgreSQL',
        'Tailwind CSS',
        'Docker',
        'Redis',
        'RESTful APIs',
        'Git & GitHub'
      ],
      projects: [
        {
          title: 'AI Resume & Portfolio Analyzer',
          technologies: 'React, Node.js, OpenAI API, PostgreSQL, Tailwind CSS',
          description:
            'Built an intelligent applicant resume parsing engine evaluating ATS compatibility, scoring keyword relevancy, and recommending structural formatting improvements. Achieved 94% parsing accuracy across 200+ test resumes.',
          github: 'https://github.com/priyadharshini-s/ai-resume-analyzer',
          liveUrl: 'https://ai-resume-analyzer-demo.vercel.app'
        },
        {
          title: 'Distributed Campus Placement Notification Engine',
          technologies: 'Next.js, Prisma, MySQL, Socket.io, Redis',
          description:
            'Architected a real-time placement notification and student drive scheduling engine supporting 5,000+ simultaneous students with SMS/Email job alert dispatches and role-based coordinator controls.',
          github: 'https://github.com/priyadharshini-s/campus-placement-tracker',
          liveUrl: 'https://placement-tracker-live.vercel.app'
        }
      ],
      internships: [
        {
          companyName: 'Zoho Corporation',
          domain: 'Full-Stack Web Development',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-11-30'),
          description:
            'Engineered internal analytics dashboard modules using React and Java microservices. Optimized complex SQL queries reducing report generation latency by 38%.'
        }
      ],
      experiences: [
        {
          companyName: 'NexGen Software Solutions',
          role: 'Junior Frontend Developer Intern',
          employmentType: 'Internship',
          location: 'Coimbatore, Tamil Nadu',
          startDate: new Date('2023-12-01'),
          endDate: new Date('2024-05-15'),
          currentlyWorking: false,
          description:
            'Collaborated with agile engineering team to refactor responsive customer dashboard with Tailwind CSS and React Query, decreasing page load times by 25%.'
        }
      ],
      certificates: [
        {
          title: 'AWS Certified Solutions Architect – Associate',
          issuer: 'Amazon Web Services',
          year: 2024
        },
        {
          title: 'Meta Frontend Developer Professional Certificate',
          issuer: 'Coursera / Meta',
          year: 2023
        }
      ]
    },

    // --- 2. UG - Computer Science - Batch of 2025 ---
    {
      fullName: 'KARTHIK RAJAN V',
      email: 'karthikrajan.v@periyaruniversity.ac.in',
      registrationNo: 'U25UG507CSC045',
      departmentId: csDept.id,
      programmeId: bscCsProg.id,
      level: 'UG',
      passingYear: 2025,
      phone: '9789022314',
      about:
        'Driven UG Computer Science student with a strong command of modern JavaScript frameworks, responsive web styling, and mobile-first design philosophies. Eager to contribute to high-impact software products.',
      portfolio: 'https://karthikrajan-portfolio.vercel.app',
      linkedin: 'https://linkedin.com/in/karthik-rajan-v',
      github: 'https://github.com/karthikrajan-v',
      twitter: 'https://twitter.com/karthik_codes',
      educations: [
        {
          qualification: 'SSLC (10th Standard)',
          institution: 'Government Model Boys Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2019,
          score: 89.5,
          scale: '% Percentage'
        },
        {
          qualification: 'HSC (12th Standard)',
          institution: 'Government Model Boys Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2021,
          score: 87.2,
          scale: '% Percentage'
        },
        {
          qualification: 'B.Sc Computer Science',
          institution: 'Periyar University Department of Computer Science',
          board: 'Periyar University',
          passingYear: 2025,
          score: 8.42,
          scale: '10.0 CGPA'
        }
      ],
      skills: [
        'JavaScript (ES6+)',
        'React',
        'Next.js',
        'HTML5 & CSS3',
        'Tailwind CSS',
        'Python',
        'MySQL',
        'Git',
        'UI/UX Prototyping',
        'Figma'
      ],
      projects: [
        {
          title: 'Smart AgriTech Crop Disease Predictor',
          technologies: 'Python, TensorFlow Lite, React, Flask',
          description:
            'Created a mobile-friendly web app allowing farmers to photograph leaf patterns and instantly detect common crop diseases with 91% neural net accuracy.',
          github: 'https://github.com/karthikrajan-v/agritech-crop-detector',
          liveUrl: 'https://smart-agritech.vercel.app'
        },
        {
          title: 'University Event Booking & Ticketing Portal',
          technologies: 'React, Firebase, Tailwind CSS',
          description:
            'Designed and launched an intuitive ticket reservation platform for inter-college symposia and cultural festivals handling 1,200+ ticket bookings.',
          github: 'https://github.com/karthikrajan-v/periyar-events-portal',
          liveUrl: 'https://periyar-events.vercel.app'
        }
      ],
      internships: [
        {
          companyName: 'TCS iON',
          domain: 'Frontend Web Engineering',
          startDate: new Date('2024-05-15'),
          endDate: new Date('2024-08-15'),
          description:
            'Assisted in building accessible web UI components adhering to WCAG 2.1 AA standards for state examination portals and student testing environments.'
        }
      ],
      experiences: [],
      certificates: [
        {
          title: 'Google Cloud Certified Associate Cloud Engineer',
          issuer: 'Google Cloud',
          year: 2024
        },
        {
          title: 'Responsive Web Design Certification',
          issuer: 'freeCodeCamp',
          year: 2023
        }
      ]
    },

    // --- 3. PG - Management Studies (DOMS) - Batch of 2026 ---
    {
      fullName: 'ANANYA M',
      email: 'ananya.m@periyaruniversity.ac.in',
      registrationNo: 'U26PG508MBA018',
      departmentId: domsDept.id,
      programmeId: mbaProg.id,
      level: 'PG',
      passingYear: 2026,
      phone: '9443233425',
      about:
        'Dynamic MBA candidate specializing in Marketing Analytics, Human Resource Operations, and Brand Strategy. Adept at translating consumer data into strategic growth roadmaps and employee engagement programs.',
      portfolio: 'https://ananya-mba-insights.vercel.app',
      linkedin: 'https://linkedin.com/in/ananya-m-mba',
      github: 'https://github.com/ananya-m-analytics',
      twitter: 'https://twitter.com/ananya_biz',
      educations: [
        {
          qualification: 'ICSE (10th Standard)',
          institution: 'Cluny Matriculation Higher Secondary School, Salem',
          board: 'ICSE',
          passingYear: 2018,
          score: 92.0,
          scale: '% Percentage'
        },
        {
          qualification: 'CBSE (12th Standard - Commerce)',
          institution: 'Sri Seshaas International School, Salem',
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
          score: 8.65,
          scale: '10.0 CGPA'
        },
        {
          qualification: 'Master of Business Administration (MBA)',
          institution: 'Department of Management Studies (DOMS), Periyar University',
          board: 'Periyar University',
          passingYear: 2026,
          score: 8.8,
          scale: '10.0 CGPA'
        }
      ],
      skills: [
        'Brand Management',
        'Market Research',
        'Power BI',
        'Advanced MS Excel',
        'Talent Acquisition',
        'KPI Dashboards',
        'SPSS Statistical Analysis',
        'Strategic Planning',
        'CRM Systems'
      ],
      projects: [
        {
          title: 'Omnichannel Consumer Behavior & FMCG Retention Study',
          technologies: 'Power BI, SPSS, Excel, Tableau',
          description:
            'Conducted field and online empirical study across 450+ consumers analyzing brand loyalty triggers in tier-2 Tamil Nadu cities. Delivered actionable market entry report for regional packaged goods manufacturers.',
          github: 'https://github.com/ananya-m-analytics/fmcg-consumer-study',
          liveUrl: 'https://ananya-mba-insights.vercel.app/fmcg-study'
        },
        {
          title: 'Campus Recruitment Analytics & Attrition Predictor',
          technologies: 'Python, Pandas, Power BI, Excel Modeling',
          description:
            'Developed predictive HR dashboard tracking fresher hiring metrics, cost-per-hire, and 12-month retention probability across 20+ manufacturing firms.',
          github: 'https://github.com/ananya-m-analytics/hr-attrition-model',
          liveUrl: 'https://ananya-mba-insights.vercel.app/hr-model'
        }
      ],
      internships: [
        {
          companyName: 'Titan Company Limited',
          domain: 'Marketing Research & Brand Management',
          startDate: new Date('2024-05-02'),
          endDate: new Date('2024-07-31'),
          description:
            'Analyzed retail store footfall conversion rates across 18 regional outlets. Formulated visual merchandising recommendations that lifted festive sales by 12%.'
        }
      ],
      experiences: [],
      certificates: [
        {
          title: 'Microsoft Certified: Power BI Data Analyst Associate',
          issuer: 'Microsoft',
          year: 2024
        },
        {
          title: 'Certified Talent Acquisition Specialist',
          issuer: 'SHRM / Coursera',
          year: 2023
        }
      ]
    },

    // --- 4. UG - Management Studies (DOMS) - Batch of 2024 ---
    {
      fullName: 'DINESH KUMAR K',
      email: 'dineshkumar.k@periyaruniversity.ac.in',
      registrationNo: 'U24UG508BBA009',
      departmentId: domsDept.id,
      programmeId: bbaProg.id,
      level: 'UG',
      passingYear: 2024,
      phone: '9655544536',
      about:
        'Resourceful BBA graduate with expertise in logistics, inventory control, and enterprise operations. Experienced in supply chain optimization, vendor management, and business process automation.',
      portfolio: 'https://dinesh-operations.vercel.app',
      linkedin: 'https://linkedin.com/in/dineshkumar-k-ops',
      github: 'https://github.com/dinesh-kumar-k',
      twitter: 'https://twitter.com/dinesh_ops',
      educations: [
        {
          qualification: 'SSLC (10th Standard)',
          institution: 'Little Flower Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2018,
          score: 86.4,
          scale: '% Percentage'
        },
        {
          qualification: 'HSC (12th Standard)',
          institution: 'Little Flower Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2020,
          score: 84.8,
          scale: '% Percentage'
        },
        {
          qualification: 'Bachelor of Business Administration (BBA)',
          institution: 'Periyar University Campus, Salem',
          board: 'Periyar University',
          passingYear: 2024,
          score: 8.15,
          scale: '10.0 CGPA'
        }
      ],
      skills: [
        'Supply Chain Management',
        'ERP Systems',
        'SAP MM Basics',
        'Logistics Scheduling',
        'Inventory Auditing',
        'MS Excel (VLOOKUP, Pivot)',
        'Vendor Negotiation',
        'Team Leadership'
      ],
      projects: [
        {
          title: 'Warehouse Inventory Tracking & Reorder Point Optimizer',
          technologies: 'Excel VBA, SAP ERP Simulation, Google Sheets',
          description:
            'Designed automated reorder point alerting system for a regional manufacturing warehouse, reducing stockout incidents by 24% and holding costs by 15%.',
          github: 'https://github.com/dinesh-kumar-k/inventory-optimizer',
          liveUrl: 'https://dinesh-operations.vercel.app/inventory'
        },
        {
          title: 'Supplier Performance Scorecard System',
          technologies: 'Power BI, Excel, Data Studio',
          description:
            'Created an evaluation framework rating vendors on on-time delivery, defect ppm, and compliance metrics for 40+ regional textile suppliers.',
          github: 'https://github.com/dinesh-kumar-k/vendor-scorecard',
          liveUrl: 'https://dinesh-operations.vercel.app/scorecard'
        }
      ],
      internships: [
        {
          companyName: 'Blue Dart Express Ltd',
          domain: 'Supply Chain & Logistics Operations',
          startDate: new Date('2023-11-01'),
          endDate: new Date('2024-03-31'),
          description:
            'Supervised route hub dispatching and SLA monitoring for 80+ daily cargo routes across western Tamil Nadu with zero delivery exceptions.'
        }
      ],
      experiences: [
        {
          companyName: 'Apex Logistics Solutions',
          role: 'Operations Management Trainee',
          employmentType: 'Full-time',
          location: 'Salem, Tamil Nadu',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-12-31'),
          currentlyWorking: false,
          description:
            'Managed warehouse cross-docking operations, daily order reconciliation, and 3PL vendor freight agreements.'
        }
      ],
      certificates: [
        {
          title: 'Six Sigma White Belt Certified',
          issuer: 'Six Sigma Global Institute',
          year: 2023
        },
        {
          title: 'Supply Chain Logistics Foundations',
          issuer: 'Rutgers University / Coursera',
          year: 2023
        }
      ]
    },

    // --- 5. PG - Commerce - Batch of 2027 ---
    {
      fullName: 'SNEHA R',
      email: 'sneha.r@periyaruniversity.ac.in',
      registrationNo: 'U27PG509COM031',
      departmentId: commDept.id,
      programmeId: mcomProg.id,
      level: 'PG',
      passingYear: 2027,
      phone: '9710055647',
      about:
        'Dedicated M.Com scholar specializing in Corporate Taxation, Financial Reporting, and Forensic Accounting. Experienced in GST filing, statutory audit preparation, and corporate cash flow forecasting.',
      portfolio: 'https://sneha-finance-tax.vercel.app',
      linkedin: 'https://linkedin.com/in/sneha-r-commerce',
      github: 'https://github.com/sneha-r-finance',
      twitter: 'https://twitter.com/sneha_tax',
      educations: [
        {
          qualification: 'SSLC (10th Standard)',
          institution: 'Holy Angels Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2019,
          score: 93.0,
          scale: '% Percentage'
        },
        {
          qualification: 'HSC (12th Standard - Commerce)',
          institution: 'Holy Angels Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2021,
          score: 92.5,
          scale: '% Percentage'
        },
        {
          qualification: 'Bachelor of Commerce (B.Com)',
          institution: 'Periyar University Arts College',
          board: 'Periyar University',
          passingYear: 2024,
          score: 8.75,
          scale: '10.0 CGPA'
        },
        {
          qualification: 'Master of Commerce (M.Com)',
          institution: 'Periyar University Campus, Salem',
          board: 'Periyar University',
          passingYear: 2027,
          score: 8.9,
          scale: '10.0 CGPA'
        }
      ],
      skills: [
        'Tally Prime',
        'GST Taxation & E-Filing',
        'Indian GAAP & Ind AS',
        'Corporate Statutory Audit',
        'Financial Statement Analysis',
        'Advanced Excel (VBA/Macros)',
        'Quickbooks',
        'Income Tax Return Filing'
      ],
      projects: [
        {
          title: 'Automated GST Reconciliation & Input Tax Credit Validator',
          technologies: 'Tally Prime, Python, Excel Macros',
          description:
            'Created an automated spreadsheet utility matching GSTR-2B with purchase ledgers, detecting mismatch discrepancies of over ₹14 Lakhs in pilot testing.',
          github: 'https://github.com/sneha-r-finance/gst-reconciliation-tool',
          liveUrl: 'https://sneha-finance-tax.vercel.app/gst-tool'
        },
        {
          title: 'Comparative Financial Health Assessment of Indian IT Companies',
          technologies: 'Excel Financial Modeling, Tableau, Capitaline',
          description:
            'Evaluated 5-year solvency, profitability ratios, and DuPont analysis for top 6 Indian IT majors with predictive valuation models.',
          github: 'https://github.com/sneha-r-finance/it-sector-financial-analysis',
          liveUrl: 'https://sneha-finance-tax.vercel.app/fin-analysis'
        }
      ],
      internships: [
        {
          companyName: 'K.S. Nathan & Associates (Chartered Accountants)',
          domain: 'Statutory & Tax Audit',
          startDate: new Date('2024-06-15'),
          endDate: new Date('2024-12-15'),
          description:
            'Conducted voucher verification, bank reconciliations, and draft tax computations for 35+ corporate and partnership clients.'
        }
      ],
      experiences: [],
      certificates: [
        {
          title: 'Tally Certified Professional – Advanced GST',
          issuer: 'Tally Education',
          year: 2024
        },
        {
          title: 'Financial Modeling & Valuation Analyst (FMVA) Candidate',
          issuer: 'Corporate Finance Institute (CFI)',
          year: 2024
        }
      ]
    },

    // --- 6. UG - Commerce - Batch of 2025 ---
    {
      fullName: 'ARAVINDH B',
      email: 'aravindh.b@periyaruniversity.ac.in',
      registrationNo: 'U25UG509BCM056',
      departmentId: commDept.id,
      programmeId: bcomProg.id,
      level: 'UG',
      passingYear: 2025,
      phone: '9884466758',
      about:
        'Analytical B.Com student keen on Retail Banking, Equity Research, and Fintech trends. Passionate about wealth management, stock market portfolio optimization, and commercial credit appraisal.',
      portfolio: 'https://aravindh-banking.vercel.app',
      linkedin: 'https://linkedin.com/in/aravindh-b-banking',
      github: 'https://github.com/aravindh-b-finance',
      twitter: 'https://twitter.com/aravindh_fin',
      educations: [
        {
          qualification: 'SSLC (10th Standard)',
          institution: 'C.S.I. Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2019,
          score: 88.0,
          scale: '% Percentage'
        },
        {
          qualification: 'HSC (12th Standard - Commerce with CS)',
          institution: 'C.S.I. Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2021,
          score: 86.5,
          scale: '% Percentage'
        },
        {
          qualification: 'Bachelor of Commerce (B.Com)',
          institution: 'Periyar University Department of Commerce',
          board: 'Periyar University',
          passingYear: 2025,
          score: 8.3,
          scale: '10.0 CGPA'
        }
      ],
      skills: [
        'Commercial Banking',
        'Credit Appraisal',
        'Tally ERP 9',
        'Investment Banking Basics',
        'Excel Financial Modeling',
        'Python for Finance',
        'NISM Capital Markets',
        'Financial Accounting'
      ],
      projects: [
        {
          title: 'Retail SME Loan Default Probability Scoring Engine',
          technologies: 'Python, Pandas, Scikit-learn, Excel',
          description:
            'Built an algorithmic scoring tool evaluating 12 financial indicators from balance sheets to determine loan approval risk tiers.',
          github: 'https://github.com/aravindh-b-finance/credit-scoring-engine',
          liveUrl: 'https://aravindh-banking.vercel.app/credit-score'
        },
        {
          title: 'Mutual Fund Portfolio Performance & Beta Tracker',
          technologies: 'Python, Streamlit, Yahoo Finance API',
          description:
            'Developed real-time fund tracking dashboard measuring Sharpe, Treynor, and Jensen Alpha for 50 prominent Indian equity funds.',
          github: 'https://github.com/aravindh-b-finance/mutual-fund-tracker',
          liveUrl: 'https://mutual-fund-tracker.streamlit.app'
        }
      ],
      internships: [
        {
          companyName: 'HDFC Bank Ltd',
          domain: 'Retail Banking Operations & Credit Services',
          startDate: new Date('2024-05-10'),
          endDate: new Date('2024-08-10'),
          description:
            'Handled customer KYC verification, loan documentation auditing, and digital net-banking onboarding with 98% compliance score.'
        }
      ],
      experiences: [],
      certificates: [
        {
          title: 'NISM Series VIII: Equity Derivatives Certification',
          issuer: 'National Institute of Securities Markets (NISM)',
          year: 2024
        },
        {
          title: 'Bloomberg Market Concepts (BMC)',
          issuer: 'Bloomberg LP',
          year: 2023
        }
      ]
    },

    // --- 7. PG - Mathematics - Batch of 2026 ---
    {
      fullName: 'DIVYA BHARATHI T',
      email: 'divyabharathi.t@periyaruniversity.ac.in',
      registrationNo: 'U26PG510MAT014',
      departmentId: mathDept.id,
      programmeId: mscMathProg.id,
      level: 'PG',
      passingYear: 2026,
      phone: '9487777869',
      about:
        'M.Sc Mathematics post-graduate with specialization in Applied Statistical Modeling, Numerical Analysis, and Machine Learning. Passionate about solving complex business problems with rigorous mathematical formulations.',
      portfolio: 'https://divya-maths-data.vercel.app',
      linkedin: 'https://linkedin.com/in/divya-bharathi-t-math',
      github: 'https://github.com/divyabharathi-t',
      twitter: 'https://twitter.com/divya_maths',
      educations: [
        {
          qualification: 'SSLC (10th Standard)',
          institution: 'Sarada Vidyalaya Girls Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2018,
          score: 95.6,
          scale: '% Percentage'
        },
        {
          qualification: 'HSC (12th Standard)',
          institution: 'Sarada Vidyalaya Girls Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2020,
          score: 93.8,
          scale: '% Percentage'
        },
        {
          qualification: 'B.Sc Mathematics',
          institution: 'Periyar University Departmental College',
          board: 'Periyar University',
          passingYear: 2023,
          score: 9.1,
          scale: '10.0 CGPA'
        },
        {
          qualification: 'M.Sc Mathematics',
          institution: 'Department of Mathematics, Periyar University',
          board: 'Periyar University',
          passingYear: 2026,
          score: 9.05,
          scale: '10.0 CGPA'
        }
      ],
      skills: [
        'Statistical Modeling',
        'Linear Algebra',
        'Probability & Stochastic Processes',
        'Python (NumPy, SciPy, Pandas)',
        'R Programming',
        'MATLAB',
        'Machine Learning Algorithms',
        'SQL & Relational Databases'
      ],
      projects: [
        {
          title: 'Stochastic Volatility Modeling of Stock Indices',
          technologies: 'Python, SciPy, R, Monte Carlo Simulations',
          description:
            'Implemented Black-Scholes and Heston volatility model simulations using Euler-Maruyama discretization, achieving 0.04 RMSE on historical Nifty 50 data.',
          github: 'https://github.com/divyabharathi-t/stochastic-volatility-models',
          liveUrl: 'https://divya-maths-data.vercel.app/volatility'
        },
        {
          title: 'Predictive Epidemic Spread Modeling using SEIR ODEs',
          technologies: 'MATLAB, Python, Streamlit, Matplotlib',
          description:
            'Formulated and calibrated multi-compartment differential equation system simulating vector-borne disease progression across Tamil Nadu districts.',
          github: 'https://github.com/divyabharathi-t/seir-epidemic-model',
          liveUrl: 'https://seir-epidemic-model.streamlit.app'
        }
      ],
      internships: [
        {
          companyName: 'Mu Sigma Business Solutions',
          domain: 'Decision Sciences & Quantitative Analytics',
          startDate: new Date('2024-05-15'),
          endDate: new Date('2024-09-15'),
          description:
            'Formulated multivariate regression models and ANOVA tests to optimize marketing spend allocation across e-commerce verticals.'
        }
      ],
      experiences: [],
      certificates: [
        {
          title: 'Mathematics for Machine Learning Specialization',
          issuer: 'Imperial College London / Coursera',
          year: 2023
        },
        {
          title: 'Data Science Professional Certificate',
          issuer: 'IBM',
          year: 2024
        }
      ]
    },

    // --- 8. UG - Mathematics - Batch of 2024 ---
    {
      fullName: 'VIGNESH S',
      email: 'vignesh.s@periyaruniversity.ac.in',
      registrationNo: 'U24UG510MAT022',
      departmentId: mathDept.id,
      programmeId: bscMathProg.id,
      level: 'UG',
      passingYear: 2024,
      phone: '9361188970',
      about:
        'Motivated B.Sc Mathematics graduate skilled in Operations Research, Graph Theory, and Combinatorial Optimization. Seeking quantitative or software development analyst roles where mathematical rigor meets high-scale computing.',
      portfolio: 'https://vignesh-algorithms.vercel.app',
      linkedin: 'https://linkedin.com/in/vignesh-s-maths',
      github: 'https://github.com/vignesh-s-algo',
      twitter: 'https://twitter.com/vignesh_math',
      educations: [
        {
          qualification: 'SSLC (10th Standard)',
          institution: 'Gokulatha Hindu Vidyalaya, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2018,
          score: 87.2,
          scale: '% Percentage'
        },
        {
          qualification: 'HSC (12th Standard)',
          institution: 'Gokulatha Hindu Vidyalaya, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2020,
          score: 85.6,
          scale: '% Percentage'
        },
        {
          qualification: 'B.Sc Mathematics',
          institution: 'Periyar University Department of Mathematics',
          board: 'Periyar University',
          passingYear: 2024,
          score: 8.25,
          scale: '10.0 CGPA'
        }
      ],
      skills: [
        'Operations Research',
        'Linear Programming (Simplex)',
        'Graph Theory Algorithms',
        'Python',
        'C++',
        'Data Structures & Algorithms',
        'Discrete Mathematics',
        'LaTeX Typography'
      ],
      projects: [
        {
          title: 'Vehicle Routing Optimization using Genetic Algorithms',
          technologies: 'Python, NetworkX, Matplotlib',
          description:
            'Engineered a capacitated vehicle routing problem (CVRP) solver with custom genetic crossover operators, reducing simulated delivery path lengths by 19%.',
          github: 'https://github.com/vignesh-s-algo/cvrp-genetic-solver',
          liveUrl: 'https://vignesh-algorithms.vercel.app/routing'
        },
        {
          title: 'Classroom & Exam Timetable Scheduling Solver',
          technologies: 'C++, Integer Linear Programming (ILP), GLPK',
          description:
            'Formulated constraint satisfaction model scheduling 40+ courses and 12 exam halls without student or faculty room clashes.',
          github: 'https://github.com/vignesh-s-algo/exam-timetable-scheduler',
          liveUrl: 'https://vignesh-algorithms.vercel.app/scheduler'
        }
      ],
      internships: [
        {
          companyName: 'Operations Analytics Lab, IIT Madras Research Park',
          domain: 'Operations Research & Combinatorial Algorithms',
          startDate: new Date('2023-11-15'),
          endDate: new Date('2024-03-15'),
          description:
            'Assisted senior researchers in formulating dynamic network flow algorithms for metropolitan public transit frequency scheduling.'
        }
      ],
      experiences: [
        {
          companyName: 'Quantum Data Systems',
          role: 'Junior Quantitative Analyst',
          employmentType: 'Full-time',
          location: 'Bangalore, Karnataka',
          startDate: new Date('2024-07-01'),
          endDate: new Date('2024-12-31'),
          currentlyWorking: false,
          description:
            'Designed data cleaning pipelines and numerical validation test suites for financial algorithmic trading backtests.'
        }
      ],
      certificates: [
        {
          title: 'Applied Data Science with Python Specialization',
          issuer: 'University of Michigan / Coursera',
          year: 2023
        },
        {
          title: 'Linear & Integer Programming',
          issuer: 'University of Colorado Boulder',
          year: 2023
        }
      ]
    },

    // --- 9. PG - English - Batch of 2026 ---
    {
      fullName: 'KAVITHA M',
      email: 'kavitha.m@periyaruniversity.ac.in',
      registrationNo: 'U26PG511ENG007',
      departmentId: engDept.id,
      programmeId: maEngProg.id,
      level: 'PG',
      passingYear: 2026,
      phone: '9500099081',
      about:
        'High-performing M.A. English scholar with expertise in Technical Communication, Corporate Content Strategy, and Instructional Design. Adept at transforming complex software engineering concepts into crystal-clear developer documentation and engaging brand stories.',
      portfolio: 'https://kavitha-content-craft.vercel.app',
      linkedin: 'https://linkedin.com/in/kavitha-m-writer',
      github: 'https://github.com/kavitha-m-docs',
      twitter: 'https://twitter.com/kavitha_writes',
      educations: [
        {
          qualification: 'SSLC (10th Standard)',
          institution: 'Sri Vidya Mandir Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2018,
          score: 91.4,
          scale: '% Percentage'
        },
        {
          qualification: 'HSC (12th Standard)',
          institution: 'Sri Vidya Mandir Higher Secondary School, Salem',
          board: 'Tamil Nadu State Board',
          passingYear: 2020,
          score: 89.2,
          scale: '% Percentage'
        },
        {
          qualification: 'B.A. English Literature',
          institution: 'Periyar University Departmental College',
          board: 'Periyar University',
          passingYear: 2023,
          score: 8.55,
          scale: '10.0 CGPA'
        },
        {
          qualification: 'M.A. English',
          institution: 'Department of English, Periyar University',
          board: 'Periyar University',
          passingYear: 2026,
          score: 8.7,
          scale: '10.0 CGPA'
        }
      ],
      skills: [
        'Technical Writing',
        'API Documentation',
        'Corporate Copywriting',
        'SEO Content Strategy',
        'Markdown & Docusaurus',
        'DITA XML',
        'Git & GitHub Docs',
        'Contentful CMS',
        'UX Writing',
        'Copyediting & Proofreading'
      ],
      projects: [
        {
          title: 'Developer Documentation Hub for Open Source REST APIs',
          technologies: 'Docusaurus, Markdown, Swagger / OpenAPI, GitHub Pages',
          description:
            'Authored end-to-end developer guide, SDK tutorials, and interactive API documentation for an open-source fintech payment gateway.',
          github: 'https://github.com/kavitha-m-docs/api-dev-docs-hub',
          liveUrl: 'https://kavitha-docs-hub.vercel.app'
        },
        {
          title: 'EdTech Instructional Courseware & Micro-Learning Modules',
          technologies: 'Articulate Storyline, Canva, Markdown, LMS Integration',
          description:
            'Created 10 engaging corporate communication micro-modules with interactive scenario-based assessments for onboarding new hires.',
          github: 'https://github.com/kavitha-m-docs/instructional-courseware',
          liveUrl: 'https://kavitha-content-craft.vercel.app/courseware'
        }
      ],
      internships: [
        {
          companyName: 'Freshworks Inc',
          domain: 'Technical Documentation & Knowledge Base',
          startDate: new Date('2024-05-01'),
          endDate: new Date('2024-10-31'),
          description:
            'Drafted 45+ customer-facing troubleshooting articles and API guides for Freshdesk CRM, reducing repetitive support tickets by 14%.'
        }
      ],
      experiences: [],
      certificates: [
        {
          title: 'Technical Writing Certification',
          issuer: 'Society for Technical Communication (STC)',
          year: 2024
        },
        {
          title: 'Google Technical Writing Course (I & II)',
          issuer: 'Google Developers',
          year: 2023
        }
      ]
    },

    // --- 10. UG - Computer Science (BCA) - Batch of 2027 ---
    {
      fullName: 'SURESH BABU N',
      email: 'sureshbabu.n@periyaruniversity.ac.in',
      registrationNo: 'U27UG507BCA038',
      departmentId: csDept.id,
      programmeId: bcaProg.id,
      level: 'UG',
      passingYear: 2027,
      phone: '9791100192',
      about:
        'Passionate BCA student focusing on cross-platform mobile app development with Flutter and React Native. Experienced in developing secure cloud backends with Firebase and FastAPI.',
      portfolio: 'https://sureshbabu-mobile.vercel.app',
      linkedin: 'https://linkedin.com/in/suresh-babu-n',
      github: 'https://github.com/sureshbabu-n',
      twitter: 'https://twitter.com/suresh_dev',
      educations: [
        {
          qualification: 'SSLC (10th Standard)',
          institution: 'Montfort Higher Secondary School, Yercaud',
          board: 'Tamil Nadu State Board',
          passingYear: 2020,
          score: 90.2,
          scale: '% Percentage'
        },
        {
          qualification: 'HSC (12th Standard)',
          institution: 'Montfort Higher Secondary School, Yercaud',
          board: 'Tamil Nadu State Board',
          passingYear: 2022,
          score: 88.5,
          scale: '% Percentage'
        },
        {
          qualification: 'Bachelor of Computer Applications (BCA)',
          institution: 'Periyar University Department of Computer Science',
          board: 'Periyar University',
          passingYear: 2027,
          score: 8.6,
          scale: '10.0 CGPA'
        }
      ],
      skills: [
        'Flutter & Dart',
        'React Native',
        'TypeScript',
        'Firebase Firestore',
        'FastAPI',
        'Python',
        'SQLite',
        'Git & Version Control',
        'Google Maps API',
        'REST Client Architecture'
      ],
      projects: [
        {
          title: 'Namma Salem Smart Bus Route & Live GPS Tracker',
          technologies: 'Flutter, Firebase, OpenStreetMap API, Node.js',
          description:
            'Built real-time city bus location tracker allowing college students and commuters to view live arrival ETAs across 35 Salem town routes.',
          github: 'https://github.com/sureshbabu-n/salem-bus-live-tracker',
          liveUrl: 'https://salem-bus-tracker.web.app'
        },
        {
          title: 'Periyar Student Study Material & Question Bank App',
          technologies: 'React Native, Expo, Supabase, Tailwind CSS',
          description:
            'Launched offline-first question bank repository containing 5 years of university semester papers with 4,500+ active student downloads.',
          github: 'https://github.com/sureshbabu-n/periyar-study-portal-app',
          liveUrl: 'https://sureshbabu-mobile.vercel.app/study-app'
        }
      ],
      internships: [
        {
          companyName: 'Thoughtworks Technologies (Shadowing Internship)',
          domain: 'Mobile Application Development',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-09-30'),
          description:
            'Collaborated in sprint planning, automated widget testing, and CI/CD pipelines deploying Flutter apps to Play Store internal test track.'
        }
      ],
      experiences: [],
      certificates: [
        {
          title: 'Flutter & Dart – Complete Guide',
          issuer: 'Udemy / Academind',
          year: 2023
        },
        {
          title: 'Google Play Store App Publishing & Security',
          issuer: 'Google Play Academy',
          year: 2024
        }
      ]
    }
  ];

  console.log(`Starting insertion of ${studentsData.length} students...`);

  for (const s of studentsData) {
    // Upsert User
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

    // Check if student exists by userId or registrationNo
    let student = await db.student.findFirst({
      where: {
        OR: [{ userId: user.id }, { registrationNo: s.registrationNo }]
      }
    });

    if (student) {
      // Clear child collections first
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

    // Insert Educations
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

    // Insert Skills
    for (const skill of s.skills) {
      await db.studentSkill.create({
        data: {
          studentId: student.id,
          name: skill
        }
      });
    }

    // Insert Projects
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

    // Insert Internships
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

    // Insert Experiences
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

    // Insert Certificates
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

    console.log(`✓ Seeded student: ${s.fullName} (${s.registrationNo}) [${s.level} - ${s.passingYear}]`);
  }

  console.log('\nAll 10 students seeded successfully with rich profile records!');
}

seed10Students()
  .catch((err) => {
    console.error('Error seeding 10 students:', err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
