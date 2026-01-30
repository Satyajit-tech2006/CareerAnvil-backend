import mongoose from "mongoose";
import { JobRole } from "../models/jobRole.model.js";
import dotenv from "dotenv";

dotenv.config();

const ROLES_DATA = [
    {
        slug: "software_intern",
        title: "Software Engineer Intern",
        category: "Engineering",
        keywords: [
            "java", "python", "c++", "javascript", "data structures", "algorithms", 
            "oop", "object oriented programming", "git", "github", "sql", "problem solving",
            "debugging", "rest api", "html", "css", "react", "node.js", "teamwork", 
            "communication", "agile", "sdlc", "computer science", "vs code"
        ]
    },
    {
        slug: "backend_dev",
        title: "Backend Developer",
        category: "Engineering",
        keywords: [
            "node.js", "express", "mongodb", "sql", "postgresql", "redis", "docker", 
            "kubernetes", "aws", "rest api", "graphql", "microservices", "authentication", 
            "jwt", "oauth", "caching", "scalability", "system design", "ci/cd", "testing",
            "mocha", "jest", "python", "django", "go", "typescript"
        ]
    },
    {
        slug: "frontend_dev",
        title: "Frontend Developer",
        category: "Engineering",
        keywords: [
            "react", "javascript", "typescript", "html5", "css3", "tailwind css", 
            "redux", "context api", "next.js", "vue", "angular", "responsive design", 
            "ui/ux", "figma", "git", "webpack", "vite", "performance optimization", 
            "accessibility", "seo", "jest", "cypress", "bootstrap", "sass"
        ]
    },
    {
        slug: "data_analyst",
        title: "Data Analyst",
        category: "Data",
        keywords: [
            "sql", "python", "r", "excel", "tableau", "power bi", "data visualization", 
            "statistics", "data cleaning", "pandas", "numpy", "matplotlib", "seaborn", 
            "exploratory data analysis", "eda", "business intelligence", "reporting", 
            "data warehousing", "etl", "snowflake", "bigquery", "communication"
        ]
    },
    {
        slug: "ml_engineer",
        title: "Machine Learning Engineer",
        category: "Data",
        keywords: [
            "python", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", 
            "machine learning", "deep learning", "nlp", "computer vision", "sql", 
            "aws sagemaker", "docker", "model deployment", "flask", "fastapi", 
            "data pipelines", "spark", "hadoop", "math", "probability", "statistics", 
            "git", "mlops"
        ]
    }
];

const seedRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB...");

        // Clear existing to avoid duplicates during dev
        await JobRole.deleteMany({});
        console.log("Cleared old roles...");

        // Insert new
        await JobRole.insertMany(ROLES_DATA);
        console.log("✅ Successfully seeded 5 Job Roles!");

        process.exit();
    } catch (error) {
        console.error("Error seeding roles:", error);
        process.exit(1);
    }
};

seedRoles();