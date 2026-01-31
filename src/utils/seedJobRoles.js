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
     SOFTWARE & ENGINEERING
  ========================== */
  {
    slug: "software_engineer",
    title: "Software Engineer",
    category: "Engineering",
    keywords: [
      "data structures", "algorithms", "object oriented programming", "oop",
      "java", "python", "c++", "javascript", "typescript",
      "system design", "low level design", "high level design",
      "problem solving", "debugging", "code optimization",
      "git", "github", "version control",
      "operating systems", "computer networks", "dbms",
      "rest api", "microservices", "monolithic architecture",
      "unit testing", "integration testing",
      "agile", "scrum", "sdlc", "clean code", "design patterns"
    ]
  },

  {
    slug: "software_intern",
    title: "Software Engineer Intern",
    category: "Engineering",
    keywords: [
      "java", "python", "c++", "javascript",
      "data structures", "algorithms", "problem solving",
      "oop", "object oriented programming",
      "git", "github", "version control",
      "sql", "dbms", "basic system design",
      "html", "css", "react", "node.js",
      "debugging", "code review",
      "computer science fundamentals",
      "vs code", "linux basics",
      "team collaboration", "communication skills"
    ]
  },

  {
    slug: "backend_dev",
    title: "Backend Developer",
    category: "Engineering",
    keywords: [
      "node.js", "express.js", "nestjs",
      "python", "django", "flask", "fastapi",
      "java", "spring boot",
      "rest api", "graphql", "grpc",
      "mongodb", "postgresql", "mysql", "redis",
      "authentication", "authorization", "jwt", "oauth2",
      "microservices", "event driven architecture",
      "kafka", "rabbitmq",
      "docker", "kubernetes",
      "aws", "gcp", "azure",
      "scalability", "performance optimization",
      "system design", "caching", "rate limiting",
      "ci/cd", "unit testing", "integration testing"
    ]
  },

  {
    slug: "frontend_dev",
    title: "Frontend Developer",
    category: "Engineering",
    keywords: [
      "javascript", "typescript",
      "react", "next.js", "vue.js", "angular",
      "html5", "css3",
      "tailwind css", "bootstrap", "sass",
      "redux", "context api", "zustand",
      "responsive design", "cross browser compatibility",
      "ui/ux principles",
      "figma", "design systems",
      "web performance", "lazy loading", "code splitting",
      "accessibility", "aria", "wcag",
      "seo", "lighthouse",
      "jest", "cypress", "playwright",
      "webpack", "vite"
    ]
  },

  {
    slug: "fullstack_dev",
    title: "Full Stack Developer",
    category: "Engineering",
    keywords: [
      "react", "next.js", "node.js", "express",
      "mongodb", "postgresql", "mysql",
      "rest api", "graphql",
      "authentication", "jwt", "oauth",
      "frontend development", "backend development",
      "system design", "api design",
      "docker", "cloud deployment",
      "aws", "vercel", "netlify",
      "ci/cd", "testing",
      "scalability", "performance optimization"
    ]
  },

  /* =========================
     DATA & AI
  ========================== */
  {
    slug: "data_analyst",
    title: "Data Analyst",
    category: "Data",
    keywords: [
      "sql", "advanced sql", "joins", "window functions",
      "python", "r",
      "excel", "power query",
      "tableau", "power bi", "looker",
      "data visualization", "dashboards",
      "statistics", "descriptive statistics",
      "hypothesis testing", "a/b testing",
      "data cleaning", "data wrangling",
      "pandas", "numpy",
      "eda", "exploratory data analysis",
      "business intelligence",
      "data storytelling", "stakeholder communication"
    ]
  },

  {
    slug: "data_scientist",
    title: "Data Scientist",
    category: "Data",
    keywords: [
      "python", "r",
      "machine learning", "statistical modeling",
      "supervised learning", "unsupervised learning",
      "regression", "classification", "clustering",
      "feature engineering",
      "scikit-learn",
      "deep learning basics",
      "nlp", "computer vision",
      "sql", "bigquery", "snowflake",
      "data visualization",
      "experimentation", "a/b testing",
      "probability", "statistics",
      "model evaluation", "cross validation"
    ]
  },

  {
    slug: "ml_engineer",
    title: "Machine Learning Engineer",
    category: "Data",
    keywords: [
      "python",
      "tensorflow", "pytorch", "keras",
      "scikit-learn",
      "machine learning", "deep learning",
      "nlp", "computer vision",
      "model deployment",
      "flask", "fastapi",
      "docker", "kubernetes",
      "mlops", "model monitoring",
      "feature stores",
      "data pipelines",
      "spark", "hadoop",
      "aws sagemaker", "gcp ai platform",
      "git", "ci/cd",
      "statistics", "linear algebra", "probability"
    ]
  },

  {
    slug: "ai_engineer",
    title: "AI Engineer",
    category: "Data",
    keywords: [
      "artificial intelligence",
      "machine learning", "deep learning",
      "neural networks",
      "nlp", "llms", "transformers",
      "computer vision",
      "prompt engineering",
      "python",
      "tensorflow", "pytorch",
      "model inference",
      "api integration",
      "vector databases",
      "rag pipelines",
      "deployment", "scalability"
    ]
  },

  /* =========================
     DEVOPS & CLOUD
  ========================== */
  {
    slug: "devops_engineer",
    title: "DevOps Engineer",
    category: "Infrastructure",
    keywords: [
      "linux", "bash scripting",
      "ci/cd", "jenkins", "github actions", "gitlab ci",
      "docker", "kubernetes",
      "aws", "gcp", "azure",
      "terraform", "infrastructure as code",
      "ansible",
      "monitoring", "prometheus", "grafana",
      "logging", "elk stack",
      "scalability", "high availability",
      "networking basics",
      "security best practices"
    ]
  },

  {
    slug: "cloud_engineer",
    title: "Cloud Engineer",
    category: "Infrastructure",
    keywords: [
      "aws", "ec2", "s3", "lambda", "rds",
      "gcp", "azure",
      "cloud architecture",
      "iam", "security groups",
      "networking", "vpc",
      "docker", "kubernetes",
      "terraform",
      "scalability", "fault tolerance",
      "cost optimization",
      "monitoring", "logging"
    ]
  },

  /* =========================
     SECURITY
  ========================== */
  {
    slug: "security_engineer",
    title: "Security Engineer",
    category: "Security",
    keywords: [
      "application security",
      "network security",
      "web security",
      "owasp top 10",
      "penetration testing",
      "vulnerability assessment",
      "authentication", "authorization",
      "jwt", "oauth",
      "cryptography basics",
      "secure coding",
      "threat modeling",
      "incident response",
      "security monitoring"
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
      "product lifecycle",
      "roadmap planning",
      "requirement gathering",
      "user stories",
      "stakeholder management",
      "agile", "scrum",
      "market research",
      "user research",
      "prioritization",
      "metrics", "kpis",
      "data driven decisions",
      "cross functional collaboration",
      "communication"
    ]
  },

  {
    slug: "ui_ux_designer",
    title: "UI/UX Designer",
    category: "Design",
    keywords: [
      "ui design", "ux design",
      "user research",
      "wireframing", "prototyping",
      "figma", "adobe xd",
      "design systems",
      "usability testing",
      "information architecture",
      "interaction design",
      "visual design",
      "accessibility",
      "user centered design"
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
        console.log("✅ Successfully seeded 5 Job Roles!");

        process.exit();
    } catch (error) {
        console.error("Error seeding roles:", error);
        process.exit(1);
    }
};

seedRoles();