import mongoose from "mongoose";
import { JobRole } from "../models/jobRole.model.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// --- FIX START: Point to the root .env file ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Go up two levels: utils -> src -> root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
// --- FIX END ---

const ROLES_DATA = [
  /* =========================
     ENGINEERING (INTERNS)
     Focus: Fundamentals, Core Languages, Basic Frameworks, Learning Ability
  ========================== */
  {
    slug: "software_intern",
    title: "SDE Intern",
    category: "Engineering",
    keywords: [
      "data structures", "algorithms", "oop", "object oriented programming",
      "java", "c++", "python",
      "problem solving", "competitive programming",
      "dbms", "sql", "operating systems", "computer networks",
      "git", "github", "version control",
      "debugging", "clean code",
      "linux basics", "shell scripting",
      "sdlc", "agile basics",
      "communication skills", "teamwork"
    ]
  },
  {
    slug: "backend_intern",
    title: "Backend Engineering Intern",
    category: "Engineering",
    keywords: [
      "node.js", "express.js", "python", "django", "flask", "java", "spring boot",
      "rest api", "api development", "json",
      "sql", "mysql", "postgresql", "mongodb",
      "git", "github", "postman",
      "authentication basics", "jwt",
      "data structures", "algorithms",
      "server side programming", "database design",
      "unit testing", "jest", "junit",
      "debugging", "api documentation"
    ]
  },
  {
    slug: "frontend_intern",
    title: "Frontend Engineering Intern",
    category: "Engineering",
    keywords: [
      "html5", "css3", "javascript", "es6+", "typescript",
      "react.js", "next.js", "vue.js",
      "responsive design", "flexbox", "css grid",
      "tailwind css", "bootstrap", "sass",
      "dom manipulation", "fetch api", "axios",
      "git", "github",
      "debugging", "chrome devtools",
      "ui implementation", "cross browser compatibility",
      "basic state management", "redux basics"
    ]
  },
  {
    slug: "fullstack_intern",
    title: "Full Stack Engineering Intern",
    category: "Engineering",
    keywords: [
      "javascript", "typescript",
      "react.js", "node.js", "express.js",
      "html", "css",
      "mongodb", "sql",
      "rest api", "crud operations",
      "git", "version control",
      "frontend integration", "backend logic",
      "mvc architecture",
      "web development fundamentals",
      "deployment basics", "vercel", "netlify", "heroku",
      "debugging", "problem solving"
    ]
  },

  /* =========================
     ENGINEERING (FULL TIME)
     Focus: System Design, Scalability, Advanced Tools, Architecture
  ========================== */
  {
    slug: "software_engineer",
    title: "Software Engineer",
    category: "Engineering",
    keywords: [
      "system design", "low level design", "high level design",
      "data structures", "algorithms", "design patterns",
      "java", "c++", "python", "golang",
      "microservices", "distributed systems",
      "rest api", "graphql", "grpc",
      "sql", "nosql", "database optimization", "indexing",
      "caching", "redis", "memcached",
      "message queues", "kafka", "rabbitmq",
      "docker", "kubernetes", "aws",
      "ci/cd", "unit testing", "integration testing",
      "agile", "scrum", "jira"
    ]
  },
  {
    slug: "backend_dev",
    title: "Backend Developer",
    category: "Engineering",
    keywords: [
      "node.js", "typescript", "java", "spring boot", "python", "fastapi", "go",
      "microservices architecture", "event driven architecture",
      "postgresql", "mysql", "mongodb", "dynamodb",
      "redis", "elasticsearch",
      "docker", "kubernetes", "terraform",
      "aws", "lambda", "ec2", "s3",
      "system design", "scalability", "performance tuning",
      "authentication", "oauth2", "jwt",
      "ci/cd pipelines", "github actions",
      "api security", "swagger", "openapi"
    ]
  },
  {
    slug: "frontend_dev",
    title: "Frontend Developer",
    category: "Engineering",
    keywords: [
      "react", "next.js", "typescript", "javascript",
      "state management", "redux toolkit", "zustand", "react query",
      "tailwind css", "styled components", "css modules",
      "web performance", "core web vitals", "seo",
      "testing", "jest", "react testing library", "cypress", "playwright",
      "build tools", "webpack", "vite",
      "accessibility", "wcag", "aria",
      "server side rendering", "static site generation",
      "figma", "storybook", "design systems"
    ]
  },

  /* =========================
     DATA & AI
     Focus: Math, Modeling, Pipelines, Analysis Tools
  ========================== */
  {
    slug: "data_analyst",
    title: "Data Analyst",
    category: "Data",
    keywords: [
      "sql", "advanced sql", "window functions", "ctes",
      "python", "pandas", "numpy",
      "data visualization", "tableau", "power bi", "looker",
      "excel", "vba", "power query",
      "statistics", "hypothesis testing", "a/b testing",
      "data cleaning", "etl basics",
      "business intelligence", "kpi tracking",
      "reporting", "dashboards",
      "analytical thinking", "stakeholder management"
    ]
  },
  {
    slug: "ml_engineer",
    title: "Machine Learning Engineer",
    category: "Data",
    keywords: [
      "python", "tensorflow", "pytorch", "keras", "scikit-learn",
      "machine learning algorithms", "deep learning", "neural networks",
      "nlp", "computer vision", "transformers", "llms",
      "mlops", "model deployment", "model serving",
      "docker", "kubernetes", "kubeflow", "mlflow",
      "feature engineering", "data pipelines",
      "aws sagemaker", "azure ml", "google vertex ai",
      "big data", "spark", "hadoop",
      "linear algebra", "probability", "calculus"
    ]
  },
  {
    slug: "data_scientist",
    title: "Data Scientist",
    category: "Data",
    keywords: [
      "python", "r", "sql",
      "machine learning", "statistical modeling", "predictive modeling",
      "exploratory data analysis", "feature selection",
      "clustering", "classification", "regression",
      "nlp", "time series analysis",
      "jupyter notebooks", "pandas", "scikit-learn",
      "experiment design", "causal inference",
      "data visualization", "matplotlib", "seaborn",
      "business acumen", "storytelling with data"
    ]
  },

  /* =========================
     INFRASTRUCTURE & SECURITY
     Focus: Automation, Cloud Platforms, Protection
  ========================== */
  {
    slug: "devops_engineer",
    title: "DevOps Engineer",
    category: "Infrastructure",
    keywords: [
      "linux administration", "shell scripting", "bash", "python",
      "ci/cd", "jenkins", "gitlab ci", "github actions", "circleci",
      "docker", "containerization",
      "kubernetes", "helm", "orchestration",
      "infrastructure as code", "terraform", "ansible", "cloudformation",
      "aws", "azure", "gcp",
      "monitoring", "logging", "prometheus", "grafana", "elk stack",
      "network protocols", "load balancing", "nginx"
    ]
  },
  {
    slug: "cloud_engineer",
    title: "Cloud Engineer",
    category: "Infrastructure",
    keywords: [
      "aws", "azure", "gcp",
      "cloud architecture", "solutions architect",
      "serverless", "lambda", "cloud functions",
      "virtualization", "networking", "vpc", "subnetting",
      "identity management", "iam",
      "storage services", "s3", "blob storage",
      "database migration",
      "cost optimization", "finops",
      "disaster recovery", "high availability",
      "python", "go"
    ]
  },
  {
    slug: "security_engineer",
    title: "Security Engineer",
    category: "Security",
    keywords: [
      "network security", "application security", "appsec",
      "vulnerability assessment", "penetration testing",
      "owasp top 10", "burp suite", "metasploit",
      "cryptography", "encryption", "pki",
      "identity and access management", "iam",
      "siem", "splunk",
      "firewalls", "ids/ips",
      "secure coding practices", "sast", "dast",
      "incident response", "forensics",
      "compliance", "gdpr", "soc2", "iso 27001"
    ]
  },

  /* =========================
     PRODUCT & DESIGN
  ========================== */
  {
    slug: "product_manager",
    title: "Product Manager",
    category: "Product",
    keywords: [
      "product strategy", "roadmap planning",
      "user research", "market analysis", "competitor analysis",
      "agile", "scrum", "kanban",
      "user stories", "backlog prioritization",
      "data analysis", "sql", "metrics", "kpis",
      "a/b testing", "experimentation",
      "stakeholder management", "cross-functional leadership",
      "wireframing", "mvp definition",
      "jira", "confluence", "linear",
      "go-to-market strategy"
    ]
  },
  {
    slug: "ui_ux_designer",
    title: "UI/UX Designer",
    category: "Design",
    keywords: [
      "user interface design", "user experience design",
      "interaction design", "visual design",
      "wireframing", "prototyping", "mockups",
      "figma", "adobe xd", "sketch",
      "user research", "usability testing", "personas",
      "information architecture", "user flows",
      "design systems", "typography", "color theory",
      "accessibility", "wcag",
      "html", "css"
    ]
  },

  /* =========================
     BUSINESS (Marketing, Sales, HR, Finance)
     To satisfy enum coverage
  ========================== */
  {
    slug: "digital_marketing",
    title: "Digital Marketing Specialist",
    category: "Marketing",
    keywords: [
      "seo", "sem", "search engine optimization",
      "google analytics", "google ads",
      "social media marketing", "content marketing",
      "email marketing", "mailchimp", "hubspot",
      "copywriting", "content strategy",
      "crm", "salesforce",
      "data analysis", "marketing funnels",
      "ppc", "paid advertising",
      "brand management", "campaign management"
    ]
  },
  {
    slug: "sales_rep",
    title: "Sales Development Rep (SDR)",
    category: "Sales",
    keywords: [
      "lead generation", "prospecting",
      "cold calling", "email outreach",
      "crm", "salesforce", "hubspot",
      "pipeline management",
      "qualification", "b2b sales",
      "consultative selling",
      "negotiation", "closing skills",
      "communication", "presentation skills",
      "account management", "relationship building"
    ]
  },
  {
    slug: "hr_generalist",
    title: "HR Generalist",
    category: "HR",
    keywords: [
      "recruitment", "talent acquisition", "sourcing",
      "employee relations", "conflict resolution",
      "onboarding", "offboarding",
      "performance management", "appraisals",
      "hris", "workday", "bamboo hr",
      "compliance", "labor laws",
      "benefits administration", "payroll",
      "employee engagement", "culture building",
      "training and development"
    ]
  },
  {
    slug: "financial_analyst",
    title: "Financial Analyst",
    category: "Finance",
    keywords: [
      "financial modeling", "forecasting", "budgeting",
      "variance analysis",
      "excel", "advanced excel", "vba",
      "financial reporting", "gaap", "ifrs",
      "data analysis", "sql",
      "sap", "oracle erp", "quickbooks",
      "valuation", "dcf",
      "market research",
      "strategic planning",
      "accounting principles"
    ]
  }
];


const seedRoles = async () => {
    try {
        // Debugging: Print to ensure it's loaded (will print 'undefined' if it fails)
        console.log("Connecting to:", process.env.MONGO_URI ? "Database Found" : "URI MISSING");

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        await JobRole.deleteMany({});
        console.log("Cleared old roles...");

        await JobRole.insertMany(ROLES_DATA);
        console.log("✅ Successfully seeded Job Roles!");

        process.exit();
    } catch (error) {
        console.error("Error seeding roles:", error);
        process.exit(1);
    }
};

seedRoles();