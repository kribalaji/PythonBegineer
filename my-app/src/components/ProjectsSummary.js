import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { Typography, Button, Box, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, Tooltip, InputAdornment, IconButton } from "@mui/material"; // Added InputAdornment, IconButton
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"; // Import Day.js adapter
import dayjs from "dayjs";
import Autocomplete from '@mui/material/Autocomplete'; // Import Autocomplete
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import nlp from 'compromise'; // Import compromise NLP library

const initialProjectState = {
  title: "",
  description: "",
  role: "",
  programmingLanguages: "",
  devOpsTools: "",
  versionController: "",
  legacyToolsInfo: "",
  databases: "",
  startDate: null,
  cloudPlatform: "", // Added Cloud Platform
  endDate: null,
  projectURL: "", // Optional field for project URL
  dateErrorFeedback: { startDate: "", endDate: "" }, // For inline date error messages
  isGeneratingDescription: false, // Flag to track description generation state
  isGeneratingRole: false, // Flag to track role generation state
};

// A more comprehensive (but not exhaustive) list of programming languages and related technologies
const programmingLanguageOptions = [
  "Python", "JavaScript", "TypeScript", "Java", "C#", "C++", "Go", "PHP", "Ruby", "Swift",
  "Kotlin", "Scala", "Rust", "Perl", "Fortran", "R", "MATLAB", "HTML", "CSS", "VBA", "Groovy", "Dart", "Elixir", "Clojure",
  "Lisp", "Scheme", "Haskell", "F#", "Erlang", "Lua", "Julia", "Solidity", "Assembly", "Apex (Salesforce)", "SAS",
  "Tcl", "Verilog", "VHDL", "Prolog", "GDScript", "Cypher", "MDX", "XQuery", "XPath", "Octave",
  // Frameworks & Libraries (already somewhat covered, but can be expanded if needed)
  // Unix/Linux Technologies
  "Unix", "Linux", "Bash", "Shell Scripting", "Ksh", "Csh", "Zsh", "Awk", "Sed", "Perl (for scripting)", "PowerShell",
  "System Administration (Linux/Unix)", "Kernel Development (Linux)", "POSIX", "SysV", "BSD", "Solaris", "AIX", "HP-UX", "cron", "systemd", "SysVinit", "GNU Core Utilities",
  // Mainframe Technologies
  "COBOL", "JCL", "PL/I", "Assembler (HLASM)", "REXX", "Easytrieve", "CICS", "IMS DB/DC", "Natural", "ADSO", "FOCUS", "RPG", "ALGOL", "Pascal (Legacy)", "Ada (Legacy)", "Forth", "IDMS", "VSAM", "Cool:Gen", "TELON", "CSP",
  "React", "Angular", "Vue.js", "Node.js", "Express.js", "Django", "Flask", "Spring Framework", ".NET Framework", ".NET Core",
  "Ruby on Rails", "Laravel", "Symfony", "ASP.NET", "Android (Kotlin/Java)", "iOS (Swift/Objective-C)",
  "Flutter (Dart)", "React Native", "AngularJS", "jQuery", "Bootstrap", "Tailwind CSS",
  // DevOps & Infrastructure (some overlap with DevOps tools, but often listed as skills)
  "Docker", "Kubernetes", "Terraform", "Ansible", "Jenkins",
  // Databases (some overlap with dedicated DB list, but often listed as skills)
  "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Oracle", "SQL Server",
  "Amazon ElastiCache", "Azure Cache for Redis",
  // Amazon Web Services (AWS)
  "AWS", "EC2", "S3", "RDS", "Lambda", "DynamoDB", "API Gateway (AWS)", "CloudFormation", "Elastic Beanstalk",
  "ECS", "EKS", "VPC", "Route 53", "CloudFront", "IAM (AWS)", "SNS", "SQS", "Kinesis", "Redshift",
  "EMR", "SageMaker", "Glue", "Step Functions", "CloudWatch", "Cognito", "Amplify", "AppSync",
  "AWS IoT", "AWS Backup", "AWS Transfer Family", "AWS WAF", "AWS Shield", "AWS Certificate Manager",
  "AWS Systems Manager", "AWS Secrets Manager", "AWS Key Management Service (KMS)", "AWS X-Ray",
  "AWS CodeCommit", "AWS CodeBuild", "AWS CodeDeploy", "AWS CodePipeline", "AWS Fargate", "AWS Aurora",
  "AWS DocumentDB", "AWS Neptune", "AWS Timestream", "AWS QLDB", "AWS Managed Blockchain", "AWS Lake Formation", "AWS Glue DataBrew", "AWS AppFlow",
  // Microsoft Azure
  "Azure", "Azure Virtual Machines", "Azure Blob Storage", "Azure SQL Database", "Azure Functions", "Azure Cosmos DB",
  "Azure API Management", "Azure Resource Manager (ARM)", "Azure App Service", "Azure Kubernetes Service (AKS)",
  "Azure Container Instances (ACI)", "Azure Virtual Network", "Azure DNS", "Azure CDN", "Azure Active Directory (AAD)",
  "Azure Service Bus", "Azure Event Grid", "Azure Event Hubs", "Azure Stream Analytics", "Azure Synapse Analytics",
  "Azure Data Lake Storage", "Azure Databricks", "Azure Machine Learning", "Azure Cognitive Services", "Azure Logic Apps",
  "Azure Monitor", "Azure Application Insights", "Azure Key Vault", "Azure Security Center", "Azure Sentinel", "Azure DevOps", "Azure IoT Hub",
  "Azure Backup", "Azure Site Recovery", "Azure ExpressRoute", "Azure VPN Gateway", "Azure Firewall",
  "Azure Front Door", "Azure Static Web Apps", "Azure Purview", "Azure Arc", "Azure Power Platform", "Azure Logic Apps",
  // Google Cloud Platform (GCP)
  "GCP", "Google Cloud", "Compute Engine", "Cloud Storage", "Cloud SQL", "Cloud Functions", "Firestore", "Cloud Datastore",
  "API Gateway (GCP)", "Cloud Deployment Manager", "App Engine", "Google Kubernetes Engine (GKE)",
  "Cloud Run", "Cloud Run for Anthos", "Virtual Private Cloud (VPC)", "Cloud DNS", "Cloud CDN", "Identity and Access Management (IAM - GCP)", "Identity Platform (GCP)",
  "Pub/Sub", "Dataflow", "Dataproc", "Cloud Composer", "Apache Airflow", // Added Dataproc, Cloud Composer, Apache Airflow
  "BigQuery", "Bigtable", "Spanner", "Memorystore", "Cloud AI Platform", "Vertex AI",
  "Dialogflow", "Cloud Natural Language API", "Cloud Vision API", "Cloud Speech-to-Text", "Cloud Translation API",
  "Workflows", "Cloud Monitoring", "Cloud Logging", "Secret Manager (GCP)", "Cloud Key Management Service (KMS - GCP)",
  "Cloud Build", "Artifact Registry", "Cloud Source Repositories", "Apigee", "Anthos", "Looker",
  // Cloud Databases (Specific mentions beyond generic SQL/NoSQL)
  "Amazon Aurora", "Amazon DocumentDB", "Amazon Neptune", "Amazon Timestream", "Amazon QLDB",
  "Azure SQL Managed Instance", "Azure Database for MySQL", "Azure Database for PostgreSQL", "Azure Database for MariaDB",
  "Google Cloud Spanner", "Google Cloud Bigtable", "MongoDB Atlas", "CockroachDB", "YugabyteDB", "PlanetScale",
  "FaunaDB", "Snowflake", "Databricks (as a platform with DB capabilities)", "Firebase Realtime Database", "Firebase Firestore",
  // Other relevant technologies
  "GraphQL", "REST API", "SOAP", "Microservices", "Serverless", "Blockchain", "AI/ML", "Data Science",
  "Big Data", "Spark", "Hadoop", "Kafka", "ETL", "CI/CD", "Agile", "Scrum", "Kanban",
];

// DevOps Tools options
const devOpsToolsOptions = [
  "Jenkins", "GitLab CI/CD", "GitHub Actions", "CircleCI", "Travis CI",
  "Ansible", "Puppet", "Chef", "Terraform", "Docker", "Kubernetes", "Helm",
  "ArgoCD", "Prometheus", "Grafana", "ELK Stack", "SonarQube", "Nexus",
  "JFrog Artifactory", "AWS CodePipeline", "AWS CodeBuild", "AWS CodeDeploy",
  "Azure DevOps Pipelines", "GCP Cloud Build", "Spinnaker", "Istio", "Vault", "Consul"
];

// Version Controller options
const versionControllerOptions = [
  "Git", "GitHub", "GitLab", "Bitbucket", "Azure DevOps", "SVN",
  "Mercurial", "Perforce", "CVS", "TFS", "AWS CodeCommit",
  "Plastic SCM", "Fossil", "Bazaar", "Darcs", "Legacy-Tools"
];

// Database options
const databaseOptions = [
  "MySQL", "PostgreSQL", "Oracle", "SQL Server", "MariaDB", "SQLite", "DB2",
  "Teradata", "Snowflake", "Redshift", "Vertica", "T-SQL", "PL/SQL", "MongoDB",
  "Cassandra", "Redis", "DynamoDB", "Couchbase", "CouchDB", "Firebase Realtime Database",
  "Neo4j", "HBase", "Elasticsearch", "AWS RDS", "AWS Aurora", "AWS DocumentDB",
  "GCP BigQuery", "GCP Cloud SQL", "GCP Firestore", "GCP Spanner",
  "Azure SQL Database", "Azure Cosmos DB", "Azure Table Storage", "Synapse Analytics", "Databricks"
];

// Cloud Platform options
const cloudPlatformOptions = [
  "Amazon Web Services-(AWS)",
  "Microsoft Azure(Microsoft) - Azure",
  "Google Cloud Platform -(GCP)"
];

// Ordered configuration for checking preceding required fields
// Moved outside the component for stability, as it's a static configuration.
const orderedRequiredFieldsConfig = [
  { name: 'title', label: 'Title', isAlwaysRequired: true },
  { name: 'description', label: 'Description', isAlwaysRequired: true },
  { name: 'role', label: 'Role/Contribution', isAlwaysRequired: true },
  { name: 'programmingLanguages', label: 'Programming Languages', isAlwaysRequired: true },
  { name: 'versionController', label: 'Version Controller', isAlwaysRequired: true },
  { name: 'legacyToolsInfo', label: 'Legacy Tools Information', isAlwaysRequired: false, dependsOn: 'versionController', dependsValue: 'Legacy-Tools' },
  { name: 'databases', label: 'Databases', isAlwaysRequired: true },
  { name: 'startDate', label: 'Start Date', isAlwaysRequired: true },
  // Note: cloudPlatform is optional, endDate is conditionally required later but not for this immediate sequential check.
];

// Memoized ProjectFormItem component
// Project description templates based on common project types
const projectDescriptionTemplates = {
  api: [
    "Designed and implemented RESTful APIs to facilitate seamless data exchange between frontend and backend systems. Focused on creating well-documented endpoints with proper error handling and validation.",
    "Developed robust API services with comprehensive documentation using Swagger/OpenAPI. Implemented authentication, rate limiting, and caching mechanisms to ensure security and performance.",
    "Created scalable microservices architecture using API gateways to manage service-to-service communication. Implemented circuit breakers and fallback mechanisms to enhance system resilience.",
    "Engineered high-performance APIs for critical business functions, optimizing for low latency and high throughput. Leveraged asynchronous processing for non-blocking operations."
  ],
  web: [
    "Developed a responsive web application with modern UI/UX principles, ensuring cross-browser compatibility and accessibility compliance. Implemented state management and optimized performance for an exceptional user experience.",
    "Built an interactive web platform that seamlessly integrates with backend services. Focused on creating reusable components and implementing efficient data fetching strategies to minimize loading times.",
    "Created a feature-rich web application with real-time updates and offline capabilities. Implemented progressive enhancement techniques to ensure functionality across various devices and network conditions.",
    "Led the frontend development of a customer-facing portal, enhancing user engagement through intuitive design and interactive features. Utilized modern JavaScript frameworks and libraries."
  ],
  mobile: [
    "Developed a native mobile application with intuitive user interface and smooth navigation. Implemented offline functionality and push notifications to enhance user engagement.",
    "Created a cross-platform mobile solution that delivers consistent experience across iOS and Android devices. Optimized for performance and battery efficiency while maintaining feature parity.",
    "Built a mobile application with location-based services and social features. Implemented secure authentication and data synchronization between devices.",
    "Engineered a high-performance mobile application focusing on fluid animations and a native look-and-feel. Integrated with device hardware features like camera and GPS."
  ],
  data: [
    "Designed and implemented data processing pipelines to transform raw data into actionable insights. Created efficient ETL processes and implemented data validation to ensure accuracy.",
    "Developed a comprehensive data analytics solution that processes large volumes of structured and unstructured data. Implemented data visualization dashboards to present key metrics and trends.",
    "Built a scalable data platform that integrates multiple data sources and provides unified access through a custom API. Implemented data governance policies and security measures to protect sensitive information.",
    "Architected and implemented a big data solution for processing terabytes of information, enabling advanced analytics and business intelligence reporting. Utilized distributed computing frameworks."
  ],
  cloud: [
    "Architected and deployed cloud-native solutions leveraging serverless technologies to optimize resource utilization and cost efficiency. Implemented infrastructure as code for consistent and repeatable deployments.",
    "Migrated legacy systems to cloud infrastructure, resulting in improved scalability and reduced operational costs. Implemented auto-scaling and load balancing to handle variable workloads.",
    "Designed a multi-region cloud architecture with disaster recovery capabilities. Implemented monitoring and alerting systems to ensure high availability and performance.",
    "Optimized cloud spending by implementing cost-management strategies, rightsizing resources, and leveraging reserved instances/spot instances. Ensured security best practices were followed for cloud deployments."
  ],
  automation: [
    "Developed automation workflows that streamlined business processes and reduced manual intervention. Implemented error handling and reporting mechanisms to ensure reliability.",
    "Created a CI/CD pipeline that automated the build, test, and deployment processes. Implemented quality gates and approval workflows to maintain code quality and stability.",
    "Built automated testing frameworks that significantly improved code coverage and reduced regression issues. Implemented performance testing to identify and address bottlenecks.",
    "Automated infrastructure provisioning and configuration management using tools like Terraform and Ansible, leading to faster environment setup and reduced human error."
  ],
  security: [
    "Conducted comprehensive security assessments and implemented remediation measures to protect against common vulnerabilities. Developed secure coding guidelines and conducted training sessions.",
    "Implemented multi-factor authentication and role-based access control to secure sensitive data and functionality. Conducted regular security audits and penetration testing.",
    "Designed and implemented a zero-trust security architecture with continuous monitoring and threat detection. Developed incident response procedures and conducted simulated breach exercises.",
    "Hardened system configurations and network infrastructure to defend against cyber threats. Developed and maintained security policies and compliance documentation."
  ],
  ai: [
    "Developed machine learning models to analyze patterns and make predictions based on historical data. Implemented feature engineering and model optimization techniques to improve accuracy.",
    "Created natural language processing solutions that extract insights from unstructured text data. Implemented sentiment analysis and entity recognition capabilities.",
    "Built a recommendation system that provides personalized suggestions based on user behavior and preferences. Implemented A/B testing framework to evaluate algorithm performance.",
    "Deployed AI models into production environments, ensuring scalability, monitoring, and retraining capabilities. Worked on MLOps pipelines for efficient model lifecycle management."
  ],
  migration: [
    "Led the successful migration of a critical legacy application to a modern technology stack, minimizing downtime and ensuring data integrity throughout the process. Coordinated with multiple teams for a seamless transition.",
    "Executed a complex data migration project, moving large datasets from on-premise systems to a cloud-based platform. Developed validation scripts to ensure data accuracy post-migration.",
    "Planned and executed the migration of infrastructure services to a new cloud provider, focusing on cost optimization and improved performance. Documented migration procedures and provided post-migration support."
  ],
  integration: [
    "Designed and developed integration solutions to connect disparate enterprise systems, enabling streamlined data flow and improved business process automation. Utilized ESB and API-led connectivity approaches.",
    "Implemented third-party API integrations to extend application functionality and provide enhanced services to users. Managed authentication, data mapping, and error handling for robust integrations.",
    "Built custom integration modules for an ERP system, facilitating real-time data synchronization with other critical business applications. Ensured data consistency and reliability across integrated platforms."
  ],
  default: [
    "Developed a comprehensive solution that addressed key business requirements while ensuring scalability and maintainability. Implemented best practices in software development and documentation.",
    "Created a robust system that streamlined operations and improved efficiency. Focused on delivering a user-friendly experience while maintaining high performance standards.",
    "Built a scalable and reliable solution that integrated with existing systems. Implemented thorough testing procedures to ensure quality and stability.",
    "Contributed to a key project initiative, delivering high-quality software components and collaborating effectively within an agile team environment to meet project milestones."
  ]
};

// Keywords for NLP-based category matching for project descriptions
const categoryKeywords = {
  api: ['api', 'service', 'microservice', 'restful', 'endpoint', 'gateway', 'integration', 'interface'],
  web: ['web', 'website', 'portal', 'frontend', 'ui', 'ux', 'spa', 'pwa', 'application', 'dashboard', 'interface'],
  mobile: ['mobile', 'ios', 'android', 'app', 'native', 'cross-platform', 'flutter', 'react native', 'tablet'],
  data: ['data', 'analytic', 'etl', 'warehouse', 'pipeline', 'bi', 'visualization', 'big data', 'mining', 'report'],
  cloud: ['cloud', 'aws', 'azure', 'gcp', 'serverless', 'lambda', 'ec2', 's3', 'deploy', 'migrat', 'infra'],
  automation: ['automat', 'ci/cd', 'pipeline', 'devops', 'script', 'workflow', 'orchestrat', 'test'],
  security: ['secur', 'auth', 'protect', 'vulnerability', 'cyber', 'encrypt', 'firewall', 'iam', 'compliance'],
  ai: ['ai', 'ml', 'machine learning', 'intelligen', 'nlp', 'neural network', 'deep learning', 'model', 'predict'],
  migration: ['migrat', 'upgrade', 'transition', 'port', 'convert', 'legacy', 'modernize'],
  integration: ['integrat', 'connect', 'sync', 'esb', 'middleware', 'api-led', 'eai'],
  // 'default' can be a fallback or have very generic keywords if needed
};

// Function to generate project description based on title
const generateProjectDescription = (title) => {
  if (!title || title.trim() === "") return "Developed a key project to meet business objectives and deliver value."; // Basic default

  const doc = nlp(title.toLowerCase());
  const titleNouns = doc.nouns().out('array');
  const titleTopics = doc.topics().out('array');
  // Create a comprehensive list of terms from the title for matching
  const titleTerms = [...new Set([...titleNouns, ...titleTopics, ...title.toLowerCase().split(/\s+/)])].filter(term => term.length > 2);

  let bestCategory = 'default';
  let maxScore = 0;

  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    let currentScore = 0;
    keywords.forEach(keyword => {
      // Check if any term from the title includes the keyword (allows partial matches like 'analytic' for 'analytics')
      if (titleTerms.some(term => term.includes(keyword))) {
        currentScore++;
      }
    });

    // Simple boost for more specific categories if a general term also matched
    if (category === 'mobile' && titleTerms.some(term => term.includes('app')) && bestCategory === 'web') {
        currentScore += 1; // Prefer mobile if 'app' is present and web was also a candidate
    }

    if (currentScore > maxScore) {
      maxScore = currentScore;
      bestCategory = category;
    }
  });

  // If no strong match from keywords, or title is very short, stick to a more generic default.
  if (maxScore === 0 && title.split(' ').length < 3) {
      bestCategory = 'default';
  }

  const templatesToUse = projectDescriptionTemplates[bestCategory] || projectDescriptionTemplates['default'];
  const randomIndex = Math.floor(Math.random() * templatesToUse.length);
  let description = templatesToUse[randomIndex];

  // Attempt to replace generic terms with a more specific main topic from the title
  const mainTopic = titleTopics[0] || titleNouns[0] || title; // Get a primary subject from the title
  description = description.replace(/this project/gi, mainTopic);
  description = description.replace(/the (application|system|solution)/gi, `the ${mainTopic}`);
  description = description.replace(/a (application|system|solution)/gi, `a ${mainTopic}`);

  return description;
};

// Role templates based on overall experience
const roleTemplates = {
  engineer: [
    "Contributed to the development of {projectTitle}, focusing on implementing core features, writing high-quality code, and collaborating with the team to solve technical challenges.",
    "Played a key role in the {projectTitle} project as a Software Engineer, responsible for module development, unit testing, debugging, and ensuring adherence to coding standards.",
    "As a software engineer on {projectTitle}, I developed and maintained critical software components, participated in code reviews, and actively contributed to agile development processes.",
    "Delivered key functionalities for {projectTitle} by translating technical specifications into well-crafted code, performing thorough testing, and assisting in deployment processes."
  ],
  lead: [
    "Led a sub-team/module for the {projectTitle} project, mentoring junior engineers, coordinating tasks, conducting code reviews, and ensuring timely delivery of high-quality features.",
    "Took technical leadership on key aspects of {projectTitle}, including design contributions, architectural discussions, guiding development efforts, and resolving complex technical issues.",
    "As a Team Lead for {projectTitle}, I was responsible for sprint planning, task delegation, technical oversight, and fostering a collaborative and productive engineering environment.",
    "Spearheaded the development of critical components for {projectTitle}, providing technical guidance, architectural input, and ensuring alignment with project goals and timelines."
  ],
  manager: [
    "Managed the technical execution and delivery of the {projectTitle} project, overseeing the development lifecycle, managing resources, mitigating risks, and aligning with strategic business objectives.",
    "Provided technical management for {projectTitle}, including architectural decisions, roadmap planning, stakeholder communication, and ensuring the team adhered to best practices.",
    "As a Technical Manager for {projectTitle}, I led a team of engineers, defined project scope and deliverables, managed timelines, and ensured the successful launch of a scalable and robust solution.",
    "Directed the end-to-end project lifecycle for {projectTitle}, from conceptualization to deployment, managing budget, resources, and stakeholder expectations to deliver impactful results."
  ]
};

// Function to generate project role based on overall experience and title
const generateProjectRole = (overallExpYears, projectTitle = "this project") => {
  const years = Number(overallExpYears);
  let experienceCategory = years < 6 ? 'engineer' : (years >= 6 && years <= 10 ? 'lead' : 'manager');

  const templates = roleTemplates[experienceCategory] || roleTemplates['engineer']; // Fallback
  const randomIndex = Math.floor(Math.random() * templates.length);
  let roleDescription = templates[randomIndex];

  let refinedProjectTitle = projectTitle || "this project";
  if (projectTitle && projectTitle.trim() !== "") {
    const doc = nlp(projectTitle);
    // Try to get a more specific noun phrase for the project. Example: "Customer Billing API" from "Development of Customer Billing API"
    const mainNounPhrase = doc.match('#Noun+ (of|for)? #Noun+?').out('text') || doc.nouns().get(0)?.text() || projectTitle;
    if (mainNounPhrase && mainNounPhrase.trim().length > 3) {
      refinedProjectTitle = mainNounPhrase.trim();
    }
  }
  return roleDescription.replace(/{projectTitle}/g, refinedProjectTitle);
};

const ProjectFormItem = React.memo(({
  project,
  index,
  onInputChange, // Keep for other text fields
  onAutocompleteChange, // New handler for Autocomplete
  onDateChange,
  onRemoveProject,
  isProjectInProgress,
  projectsCount,
  programmingLanguageOptions,
  devOpsToolsOptions,
  versionControllerOptions,
  databaseOptions, // Existing
  cloudPlatformOptions, // New prop for cloud platform options
  onSmartGenerateDescription, // Renamed for clarity
  onSmartGenerateRole // New handler for Smart Generate Role
}) => {
  // Convert comma-separated string from state to an array for Autocomplete's value prop
  const selectedLanguagesArray = project.programmingLanguages
    ? project.programmingLanguages.split(',').map(lang => lang.trim()).filter(lang => lang)
    : [];

  // Convert comma-separated string from state to an array for DevOps Tools
  const selectedDevOpsToolsArray = project.devOpsTools
    ? project.devOpsTools.split(',').map(tool => tool.trim()).filter(tool => tool)
    : [];

  // Convert comma-separated string from state to an array for Version Controller
  const selectedVersionControllerArray = project.versionController
    ? project.versionController.split(',').map(vc => vc.trim()).filter(vc => vc)
    : [];

  // Convert comma-separated string from state to an array for Databases
  const selectedDatabasesArray = project.databases
    ? project.databases.split(',').map(db => db.trim()).filter(db => db)
    : [];
  
  // Convert comma-separated string from state to an array for Cloud Platforms
  const selectedCloudPlatformsArray = project.cloudPlatform
    ? project.cloudPlatform.split(',').map(cp => cp.trim()).filter(cp => cp)
    : [];

  // Conditional label and helper text for End Date
  const endDateLabel = index > 0
    ? "End Date"
    : "End Date (Leave empty for current projects)";

  const endDateHelperText = project.dateErrorFeedback?.endDate ||
    (project.startDate
      ? (index > 0 ? "Select the project end date" : "Leave empty if this is a current project")
      : "Please select a start date first");

  return (
    <Box sx={{ marginBottom: 4, border: "1px solid #e0e0e0", padding: 2, borderRadius: 2, backgroundColor: "#ffffff", boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography
            variant="h6"
            sx={{ color: "#333", fontWeight: "bold", mr: 1 }}
          >
            Project: {project.title ? project.title : ""}
          </Typography>
          {isProjectInProgress(project) && (
            <Typography
              component="span"
              sx={{
                fontSize: "0.8rem",
                backgroundColor: "#4caf50",
                color: "white",
                padding: "3px 8px",
                borderRadius: "12px",
                display: "inline-block",
              }}
            >
              In Progress
            </Typography>
          )}
        </Box>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => onRemoveProject(index)}
          sx={{ ml: 2, flexShrink: 0 }}
        >
          {projectsCount > 1 ? "Remove Project" : "Reset Project"}
        </Button>
      </Box>

      {/* Title Input */}
      <TextField
        label="Title"
        name="title"
        value={project.title}
        onChange={(e) => onInputChange(index, e)}
        fullWidth
        margin="normal"
        inputProps={{ maxLength: 200 }}
        helperText={`${project.title.length}/200 characters`}
        required
        sx={{
          fontSize: "14px",
          borderRadius: "5px",
        }}
      />

      {/* Description Input with Smart Generate button */}
        <TextField
          label="Description"
          name="description"
          value={project.description}
          onChange={(e) => onInputChange(index, e)}
          fullWidth
          multiline
          rows={4}
          margin="normal"
          inputProps={{ maxLength: 1500 }}
          helperText={`${project.description.length}/1500 characters`}
          required
          sx={{
            fontSize: "14px",
            borderRadius: "5px",
          }}
          InputProps={{
            endAdornment: project.title && (
              <InputAdornment position="end">
                <Tooltip title="Smart Generate Description">
                  <IconButton
                    onClick={() => onSmartGenerateDescription(index)}
                    disabled={!project.title || project.isGeneratingDescription}
                    edge="end"
                    size="small"
                  >
                    {project.isGeneratingDescription ? <CircularProgress size={20} /> : <AutoAwesomeIcon color="primary" />}
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />

      {/* Role/Contribution Input */}
        <TextField
          label="Role/Contribution"
          name="role"
          value={project.role}
          onChange={(e) => onInputChange(index, e)}
          fullWidth
          multiline
          rows={4}
          margin="normal"
          inputProps={{ maxLength: 1500 }}
          helperText={`${project.role.length}/1500 characters`}
          required
          sx={{
            fontSize: "14px",
            borderRadius: "5px",
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Smart Generate Role">
                  <IconButton
                    onClick={() => onSmartGenerateRole(index)}
                    disabled={project.isGeneratingRole}
                    edge="end"
                    size="small"
                  >
                    {project.isGeneratingRole ? <CircularProgress size={20} /> : <AutoAwesomeIcon color="primary" />}
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />

      {/* Programming Languages Input */}
      <Autocomplete
        freeSolo
        multiple={true}
        options={programmingLanguageOptions}
        value={selectedLanguagesArray}
        onChange={(event, newValueArray) => {
          onAutocompleteChange(index, "programmingLanguages", newValueArray.join(', '));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Programming Languages"
            name="programmingLanguages"
            fullWidth
            margin="normal"
            inputProps={{
              ...params.inputProps,
              maxLength: 200,
            }}
            helperText={`${project.programmingLanguages.length}/200 characters. Select or add multiple languages.`}
            required
            sx={{
              fontSize: "14px",
              borderRadius: "5px",
            }}
          />
        )}
        sx={{
          borderRadius: "5px",
        }}
      />

      {/* DevOps Tools Input */}
      <Autocomplete
        freeSolo
        multiple={true}
        options={devOpsToolsOptions}
        value={selectedDevOpsToolsArray}
        onChange={(event, newValueArray) => {
          onAutocompleteChange(index, "devOpsTools", newValueArray.join(', '));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="DevOps Tools"
            name="devOpsTools"
            fullWidth
            margin="normal"
            inputProps={{
              ...params.inputProps,
              maxLength: 200,
            }}
            helperText={`${(project.devOpsTools || "").length}/200 characters. Select or add multiple tools.`}
            sx={{
              fontSize: "14px",
              borderRadius: "5px",
            }}
          />
        )}
        sx={{
          borderRadius: "5px",
        }}
      />

      {/* Version Controller Input */}
      <Autocomplete
        freeSolo
        multiple={true}
        options={versionControllerOptions}
        value={selectedVersionControllerArray}
        onChange={(event, newValueArray) => {
          onAutocompleteChange(index, "versionController", newValueArray.join(', '));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Version Controller"
            name="versionController"
            fullWidth
            margin="normal"
            inputProps={{
              ...params.inputProps,
              maxLength: 200,
            }}
            helperText={`${(project.versionController || "").length}/200 characters. Select or add multiple version control tools.`}
            required
            sx={{
              fontSize: "14px",
              borderRadius: "5px",
            }}
          />
        )}
        sx={{
          borderRadius: "5px",
        }}
      />

      {project.versionController && project.versionController.includes("Legacy-Tools") && (
        <TextField
          label="Legacy Tools Information"
          name="legacyToolsInfo"
          value={project.legacyToolsInfo || ""}
          onChange={(e) => onInputChange(index, e)}
          fullWidth
          margin="normal"
          required
          sx={{
            fontSize: "14px",
            borderRadius: "5px",
          }}
        />
      )}

      {/* Databases Input */}
      <Autocomplete
        freeSolo
        multiple={true}
        options={databaseOptions}
        value={selectedDatabasesArray}
        onChange={(event, newValueArray) => {
          onAutocompleteChange(index, "databases", newValueArray.join(', '));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Databases"
            name="databases"
            fullWidth
            margin="normal"
            inputProps={{
              ...params.inputProps,
              maxLength: 200,
            }}
            helperText={`${project.databases.length}/200 characters. Select or add multiple databases.`}
            required
            sx={{
              fontSize: "14px",
              borderRadius: "5px",
            }}
          />
        )}
        sx={{
          borderRadius: "5px",
        }}
      />

      {/* Cloud Platform Input */}
      <Autocomplete
        freeSolo
        multiple={true}
        options={cloudPlatformOptions} // Use the new prop
        value={selectedCloudPlatformsArray}
        onChange={(event, newValueArray) => {
          onAutocompleteChange(index, "cloudPlatform", newValueArray.join(', '));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Cloud Platform"
            name="cloudPlatform"
            fullWidth
            margin="normal"
            inputProps={{
              ...params.inputProps,
              maxLength: 200,
            }}
            helperText={`${(project.cloudPlatform || "").length}/200 characters. Select or add multiple platforms.`}
            // Not making this required unless specified
            sx={{
              fontSize: "14px",
              borderRadius: "5px",
            }}
          />
        )}
        sx={{
          borderRadius: "5px",
        }}
      />
      {/* Project URL Input (Optional) */}
      <TextField
        label="Project URL (Optional)"
        name="projectURL"
        value={project.projectURL}
        onChange={(e) => onInputChange(index, e)}
        fullWidth
        margin="normal"
        inputProps={{ maxLength: 300 }}
        helperText={`${project.projectURL.length}/300 characters`}
        type="url"
        sx={{
          fontSize: "14px",
          borderRadius: "5px",
        }}
      />

      {/* Start Date Input */}
      <DatePicker
        label="Start Date"
        value={project.startDate}
        onChange={(value) => onDateChange(index, "startDate", value)}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            margin="normal"
            required
            error={!!project.dateErrorFeedback?.startDate}
            helperText={project.dateErrorFeedback?.startDate || "Select the project start date"}
            sx={{
              fontSize: "14px",
              borderRadius: "5px",
            }}
          />
        )}
      />

      <Box sx={{ mt: 3 }}></Box>

      {/* End Date Input - Optional */}
      <Box>
        <DatePicker
          label={endDateLabel}
          value={project.endDate}
          onChange={(value) => onDateChange(index, "endDate", value)}
          minDate={project.startDate ? dayjs(project.startDate).add(1, 'day') : undefined}
          disabled={!project.startDate}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              margin="normal"
              error={!!project.dateErrorFeedback?.endDate}
              helperText={endDateHelperText}
              sx={{
                fontSize: "14px",
                borderRadius: "5px",
                "& .MuiInputLabel-root": {
                  fontSize: "14px", whiteSpace: "normal", lineHeight: "1.2",
                  maxWidth: "100%", height: "auto", padding: "2px 0", overflow: "visible"
                },
                "& .MuiInputLabel-shrink": {
                  transform: "translate(14px, -9px) scale(0.75)", background: "#f9f9f9", padding: "0 4px"
                }
              }}
            />
          )}
        />
      </Box>
    </Box>
  );
});

function ProjectsSummary() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialProjectsFromState = location.state?.projectsData;
  const overallExperienceYears = location.state?.overallExperienceYears ? parseInt(location.state.overallExperienceYears, 10) : 0;

  // State for dialog popups
  const [dialogState, setDialogState] = useState({
    open: false,
    title: "",
    message: "",
    severity: "info",
  });

  // Initialize projects state, auto-populating role for the first project
  const [projects, setProjects] = useState(() => {
    if (initialProjectsFromState && initialProjectsFromState.length > 0) {
      // Ensure dates are Day.js objects if they are stored as strings
      return initialProjectsFromState.map(p => ({
        ...p,
        startDate: p.startDate ? (dayjs.isDayjs(p.startDate) ? p.startDate : dayjs(p.startDate)) : null,
        endDate: p.endDate ? (dayjs.isDayjs(p.endDate) ? p.endDate : dayjs(p.endDate)) : null,
        // Reset generation flags if needed, or ensure they are passed correctly
        isGeneratingDescription: p.isGeneratingDescription || false,
        isGeneratingRole: p.isGeneratingRole || false,
      }));
    }
    return [{ ...initialProjectState }]; // Default initialization
  });

  // State to manage dynamic options lists
  const [dynamicProgrammingLanguageOptions, setDynamicProgrammingLanguageOptions] = useState([...programmingLanguageOptions]);
  const [dynamicDevOpsToolsOptions, setDynamicDevOpsToolsOptions] = useState([...devOpsToolsOptions]);
  const [dynamicVersionControllerOptions, setDynamicVersionControllerOptions] = useState([...versionControllerOptions]);
  const [dynamicDatabaseOptions, setDynamicDatabaseOptions] = useState([...databaseOptions]);
  const [dynamicCloudPlatformOptions, setDynamicCloudPlatformOptions] = useState([...cloudPlatformOptions]); // State for dynamic cloud platform options


  // Handle Smart Generate for project descriptions
  const handleSmartGenerateDescription = useCallback((index) => {
    if (!projects[index].title) return; // Should be disabled if no title, but good check
    const updatedProjects = [...projects];
    updatedProjects[index].isGeneratingDescription = true;
    setProjects(updatedProjects);
    
    // Simulate NLP processing with a timeout
    setTimeout(() => {
      const projectTitle = projects[index].title;
      const generatedDescription = generateProjectDescription(projectTitle);

      const finalProjects = projects.map((p, i) => 
        i === index ? { ...p, description: generatedDescription, isGeneratingDescription: false } : p
      );
      setProjects(finalProjects);
    }, 1000);
  }, [projects]);

  // Handle Smart Generate for project roles
  const handleSmartGenerateRole = useCallback((index) => {
    if (overallExperienceYears === undefined || overallExperienceYears === null || overallExperienceYears < 0) {
      setDialogState({
        open: true,
        title: "Experience Data Missing",
        message: "Overall years of experience is not available or invalid. Please ensure it was entered correctly in the previous step.",
        severity: "warning",
      });
      return;
    }

    const updatedProjects = [...projects];
    updatedProjects[index].isGeneratingRole = true;
    setProjects(updatedProjects);

    setTimeout(() => {
      const projectTitle = projects[index].title;
      const generatedRole = generateProjectRole(overallExperienceYears, projectTitle);
      const finalProjects = projects.map((p, i) => 
        i === index ? { ...p, role: generatedRole, isGeneratingRole: false } : p
      );
      setProjects(finalProjects);
    }, 1000); // Simulate processing time
  }, [projects, overallExperienceYears]);

  // State for initial guidance dialog
  const [initialGuidanceOpen, setInitialGuidanceOpen] = useState(true);

  useEffect(() => {
  }, []); 

  const handleCloseInitialGuidance = () => {
    setInitialGuidanceOpen(false);
    // Optionally, trigger the other guidance dialog here if needed
    setDialogState({
        open: true,
        title: "Project Guidance",
        message: "Your first project should be your current or most recent project. If it's ongoing, leave the end date empty. Subsequent projects should have both start and end dates.",
        severity: "info",
      });
  };
  // Function to close the dialog
  const handleCloseDialog = () => {
    setDialogState(prev => ({ ...prev, open: false }));
  };

  // Helper function to check preceding required fields and show a dialog if any are missing
  const checkPrecedingFieldsAndShowDialog = useCallback((projectIndex, currentFieldName) => {
    const project = projects[projectIndex];
    const currentFieldConfig = orderedRequiredFieldsConfig.find(f => f.name === currentFieldName);
    
    if (!currentFieldConfig) return false; // Current field not in our ordered list for this check

    const currentFieldConfigIndex = orderedRequiredFieldsConfig.indexOf(currentFieldConfig);

    for (let i = 0; i < currentFieldConfigIndex; i++) {
      const fieldConfig = orderedRequiredFieldsConfig[i];
      let isMissing = false;

      if (fieldConfig.isAlwaysRequired) {
        if (!project[fieldConfig.name] || (typeof project[fieldConfig.name] === 'string' && !project[fieldConfig.name].trim())) {
          isMissing = true;
        }
      } else if (fieldConfig.dependsOn) { // Specifically for legacyToolsInfo
        const dependentFieldValue = project[fieldConfig.dependsOn];
        if (dependentFieldValue && typeof dependentFieldValue === 'string' && dependentFieldValue.includes(fieldConfig.dependsValue)) {
          if (!project[fieldConfig.name] || (typeof project[fieldConfig.name] === 'string' && !project[fieldConfig.name].trim())) {
            isMissing = true;
          }
        }
      }

      if (isMissing) {
        setDialogState({
          open: true,
          title: "Missing Input Required",
          message: `Please fill in '${fieldConfig.label}' for Project ${projectIndex + 1} before you proceed with '${currentFieldConfig.label}'.`,
          severity: "warning",
        });
        return true; // A preceding required field is missing
      }
    }
    return false; // No preceding required fields are missing
  }, [projects, setDialogState]); // orderedRequiredFieldsConfig is now stable (defined outside)

  // Handle input changes for a specific project
  const handleInputChange = useCallback((index, e) => {
    const { name, value } = e.target;
    if (checkPrecedingFieldsAndShowDialog(index, name)) {
      return; // Stop processing this input change if a preceding field is missing
    }
    const updatedProjects = [...projects];
    updatedProjects[index][name] = value;
    setProjects(updatedProjects);
  }, [projects, checkPrecedingFieldsAndShowDialog]);

  // Handle Autocomplete changes for a specific project
  const handleAutocompleteChange = useCallback((index, name, value) => {
    const updatedProjects = [...projects];

    if (checkPrecedingFieldsAndShowDialog(index, name)) {
      return; // Stop processing this input change if a preceding field is missing
    }
    updatedProjects[index][name] = value; // Value is already a comma-separated string

    // Add any new values to the respective options arrays
    if (name === "programmingLanguages") {
      const valuesArray = value.split(',').map(v => v.trim()).filter(v => v);
      const newValues = valuesArray.filter(v => !dynamicProgrammingLanguageOptions.includes(v));
      if (newValues.length > 0) {
        setDynamicProgrammingLanguageOptions(prev => [...prev, ...newValues]);
      }
    } else if (name === "devOpsTools") {
      const valuesArray = value.split(',').map(v => v.trim()).filter(v => v);
      const newValues = valuesArray.filter(v => !dynamicDevOpsToolsOptions.includes(v));
      if (newValues.length > 0) {
        setDynamicDevOpsToolsOptions(prev => [...prev, ...newValues]);
      }
    } else if (name === "versionController") {
      const valuesArray = value.split(',').map(v => v.trim()).filter(v => v);
      const newValues = valuesArray.filter(v => !dynamicVersionControllerOptions.includes(v));
      if (newValues.length > 0) {
        setDynamicVersionControllerOptions(prev => [...prev, ...newValues]);
      }
    } else if (name === "databases") {
      const valuesArray = value.split(',').map(v => v.trim()).filter(v => v);
      const newValues = valuesArray.filter(v => !dynamicDatabaseOptions.includes(v));
      if (newValues.length > 0) {
        setDynamicDatabaseOptions(prev => [...prev, ...newValues]);
      }
    } else if (name === "cloudPlatform") { // Handle cloudPlatform
      const valuesArray = value.split(',').map(v => v.trim()).filter(v => v);
      const newValues = valuesArray.filter(v => !dynamicCloudPlatformOptions.includes(v));
      if (newValues.length > 0) {
        setDynamicCloudPlatformOptions(prev => [...prev, ...newValues]);
      }
    }
    setProjects(updatedProjects);
  }, [projects, dynamicProgrammingLanguageOptions, dynamicDevOpsToolsOptions, dynamicVersionControllerOptions, dynamicDatabaseOptions, dynamicCloudPlatformOptions, checkPrecedingFieldsAndShowDialog]);

  // Check if date already exists in other projects
  const isDateDuplicate = useCallback((date, fieldName, currentIndex) => {
    if (!date) return false;
    return projects.some((project, idx) =>
      idx !== currentIndex &&
      project[fieldName] &&
      dayjs(project[fieldName]).isSame(dayjs(date), 'day')
    );
  }, [projects]);

  // Handle date changes
  const handleDateChange = useCallback((index, name, value) => {
    const projectToUpdate = { ...projects[index] };
    
    if (checkPrecedingFieldsAndShowDialog(index, name)) {
      return; // Stop processing this input change if a preceding field is missing
    }

    // Clear previous date error feedback for this field
    projectToUpdate.dateErrorFeedback = { ...projectToUpdate.dateErrorFeedback, [name]: "" };

    // --- 1. Global Duplicate Check ---
    if (value && isDateDuplicate(value, name, index)) {
        const dateType = name === "startDate" ? "start date" : "end date";
        projectToUpdate.dateErrorFeedback[name] = `This ${dateType} is already used.`;
        const updatedProjects = [...projects];
        updatedProjects[index] = projectToUpdate; // projectToUpdate still has old date for 'name'
        setProjects(updatedProjects);
        setDialogState({ open: true, title: "Date Conflict", message: `A project with this ${dateType} already exists. Please choose a unique date.`, severity: "error" });
        return;
    }

    // --- 2. Validations for Older Projects (index > 0) concerning First Project's Start Date ---
    if (index > 0) { // For the second project onwards (older projects)
        const firstProjectStartDate = projects[0]?.startDate;
        if (value && firstProjectStartDate && (dayjs(value).isAfter(firstProjectStartDate, 'day') || dayjs(value).isSame(firstProjectStartDate, 'day'))) {
            const dateType = name === "startDate" ? "start date" : "end date";
            const errorMessage = `${dateType} for older projects must be before the current project's start date (${dayjs(firstProjectStartDate).format('MM/DD/YYYY')}).`;
            projectToUpdate.dateErrorFeedback[name] = errorMessage; // projectToUpdate still has old date for 'name'
            const updatedProjects = [...projects];
            updatedProjects[index] = projectToUpdate;
            setProjects(updatedProjects);
            setDialogState({ open: true, title: "Date Order Conflict", message: errorMessage, severity: "error" });
            return;
        }
    }

    // If no hard errors so far, apply the new date value to projectToUpdate
    projectToUpdate[name] = value;

    // --- 3. Internal Date Order (End Date > Start Date) ---
    // This applies to all projects.
    // Check if setting/changing an END date makes it invalid relative to its OWN start date.
    if (name === "endDate" && projectToUpdate.endDate && projectToUpdate.startDate) {
        if (dayjs(projectToUpdate.endDate).isBefore(projectToUpdate.startDate, 'day') || dayjs(projectToUpdate.endDate).isSame(projectToUpdate.startDate, 'day')) {
            const errorMessage = "End date must be after start date.";
            projectToUpdate.dateErrorFeedback.endDate = errorMessage;
            projectToUpdate.endDate = null; // Corrective: Clear the invalid end date
            const updatedProjects = [...projects];
            updatedProjects[index] = projectToUpdate;
            setProjects(updatedProjects);
            setDialogState({ open: true, title: "Date Order Conflict", message: errorMessage, severity: "error" });
            return;
        }
    }

    // --- 4. Corrective Action: If changing START date makes existing END date invalid ---
    // This applies to all projects.
    if (name === "startDate" && projectToUpdate.startDate && projectToUpdate.endDate) {
        if (dayjs(projectToUpdate.endDate).isBefore(projectToUpdate.startDate, 'day') || dayjs(projectToUpdate.endDate).isSame(projectToUpdate.startDate, 'day')) {
            projectToUpdate.endDate = null; // Corrective action
            projectToUpdate.dateErrorFeedback.endDate = "End date cleared (was before or same as new start date).";
            // No dialog, just local feedback. projectToUpdate is modified.
        }
    }

    // --- 5. Warning for Older Projects (index > 0) needing an End Date ---
    if (index > 0) {
        if (projectToUpdate.startDate && !projectToUpdate.endDate) {
            const warningMessage = "Older projects should have an end date.";
            // Only set local feedback if there isn't a more severe error already
            if (!projectToUpdate.dateErrorFeedback.endDate) {
                projectToUpdate.dateErrorFeedback.endDate = warningMessage;
            }
            // Only show the dialog if it's not already showing a more severe error
            if (dialogState.severity !== 'error') {
               setDialogState({ open: true, title: "Missing End Date", message: warningMessage, severity: "warning" });
            }
        }
    }

    // --- 6. Dialog Management ---
    // If a "Missing End Date" warning was active, but now the condition is resolved for that project, close it.
    // This check needs to be specific to the project being edited and if the warning was actually shown for this project.
    if (dialogState.open && dialogState.title === "Missing End Date" && dialogState.severity === 'warning') {
        const isResolved = (index === 0) || (projectToUpdate.startDate && projectToUpdate.endDate);
        if (isResolved) {
             setDialogState(prev => ({ ...prev, open: false }));
        }
    }
    // Other error dialogs (like "Date Conflict", "Date Order Conflict") are dismissed by the user clicking "OK".

    // --- Final State Update ---
    const updatedProjects = [...projects];
    updatedProjects[index] = projectToUpdate;
    setProjects(updatedProjects);
  }, [projects, isDateDuplicate, dialogState.open, dialogState.title, dialogState.severity, checkPrecedingFieldsAndShowDialog]);

  const addNextProject = () => {
    const newProject = { ...initialProjectState };
    setProjects([...projects, newProject]);
  };

  const removeProject = useCallback((indexToRemove) => {
    if (projects.length > 1) {
      setProjects(prevProjects => prevProjects.filter((_, index) => index !== indexToRemove));
    } else if (projects.length === 1 && indexToRemove === 0) {
      setProjects([{ ...initialProjectState }]);
    }
     // Clear dialog if it was showing an error/warning that might no longer be relevant
     // This is a bit broad, but safer than leaving an irrelevant dialog open.
     if (dialogState.open && (
         ['Date Conflict', 'Date Order Conflict', 'Missing End Date', 'Project Status Conflict'].includes(dialogState.title)
         )) {
         setDialogState(prev => ({ ...prev, open: false }));
     }
     // Also clear any local date errors for the removed project
     // This is implicitly handled by filtering the projects array, but good to note.
  }, [projects.length, dialogState.open, dialogState.title]); // Removed dialogState.severity

  const isAddNextProjectEnabled = () => {
    if (projects.length === 0) return false;
    const lastProject = projects[projects.length - 1];
    // Check if the last project has required fields filled and no date errors
    const hasRequiredFields =
      lastProject.title.trim() &&
      lastProject.description.trim() &&
      lastProject.role.trim() &&
      lastProject.programmingLanguages.trim() &&
      lastProject.versionController.trim() &&
      (lastProject.versionController.includes("Legacy-Tools") ? lastProject.legacyToolsInfo.trim() : true) &&
      lastProject.databases.trim() &&
      lastProject.startDate; // Start date is required for any project. Cloud platform is optional for now.

    const hasDateErrors = !!lastProject.dateErrorFeedback?.startDate || !!lastProject.dateErrorFeedback?.endDate;

    // For the first project, only startDate is required to add the next
    if (projects.length === 1) {
        return hasRequiredFields && !hasDateErrors;
    } else {
        // For subsequent projects, both startDate and endDate are required to add the next
        return hasRequiredFields && lastProject.endDate && !hasDateErrors;
    }
  };

  const isProjectInProgress = (project) => {
    return project.startDate && !project.endDate;
  };

  const validateAllProjects = () => {
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      const missingFields = [];

      if (!project.title.trim()) missingFields.push("Title");
      if (!project.description.trim()) missingFields.push("Description");
      if (!project.role.trim()) missingFields.push("Role/Contribution");
      if (!project.programmingLanguages.trim()) missingFields.push("Programming Languages");
      if (!project.versionController.trim()) missingFields.push("Version Controller");
      if (project.versionController.includes("Legacy-Tools") && !project.legacyToolsInfo.trim()) {
        missingFields.push("Legacy Tools Information");
      }
      if (!project.databases.trim()) missingFields.push("Databases");
      if (!project.startDate) missingFields.push("Start Date");
      
      // For projects other than the first one (index > 0), an end date is required.
      // This aligns with the guidance that the first project can be ongoing.
      if (i > 0 && project.startDate && !project.endDate) {
          missingFields.push("End Date (required for older projects)");
      }

      if (missingFields.length > 0) {
        return `Project ${i + 1} is missing: ${missingFields.join(', ')}. Please complete all fields.`;
      }

      // Check for date feedback errors (which are set by handleDateChange)
      if (project.dateErrorFeedback?.startDate || project.dateErrorFeedback?.endDate) {
        let dateErrorMessage = project.dateErrorFeedback?.startDate && project.dateErrorFeedback?.endDate ? 
            `Start Date error: "${project.dateErrorFeedback.startDate}" and End Date error: "${project.dateErrorFeedback.endDate}"` :
            (project.dateErrorFeedback?.startDate ? `Start Date error: "${project.dateErrorFeedback.startDate}"` : `End Date error: "${project.dateErrorFeedback.endDate}"`);
        return `Project ${i + 1} has ${dateErrorMessage}. Please correct them.`;
      }
    }
    return null; // All projects are valid
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          maxWidth: 800,
          margin: "0 auto",
          padding: { xs: 2, sm: 3 },
          backgroundColor: "#f4f6f8",
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          textAlign: "left",
        }}
      >
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{ color: "#2c3e50", fontWeight: "600", marginBottom: 3 }}
        >
          Projects Summary
        </Typography>

        {/* Initial Guidance Dialog */}
        <Dialog
          open={initialGuidanceOpen}
          onClose={handleCloseInitialGuidance}
          aria-labelledby="initial-guidance-dialog-title"
        >
          <DialogTitle id="initial-guidance-dialog-title" sx={{fontWeight: 'bold', color: 'primary.main'}}>
            Tips for Effective Project Summaries
          </DialogTitle>
          <DialogContent>
            <DialogContentText component="div">
              To help us generate the best summary for you, please ensure your project details include:
              <ul style={{ paddingLeft: '20px', marginTop: '8px', listStyleType: 'disc' }}>
                <li><strong>Action Verbs:</strong> (e.g., Led, Developed, Implemented, Managed, Architected)</li>
                <li><strong>Quantifiable Results:</strong> (e.g., "achieved 20% increase in performance", "reduced load times by 50%")</li>
                <li><strong>Key Technologies & Tools:</strong> (Specific programming languages, cloud services like AWS/Azure/GCP, DevOps tools like Docker/Kubernetes, databases like SQL/MongoDB)</li>
                <li><strong>Leadership/Management Terms:</strong> (If applicable, e.g., "Managed a team of 5", "Coordinated project activities", "Led stakeholder meetings")</li>
                <li><strong>Clear Description of Your Role & Impact:</strong> What did you do, and what was the result?</li>
              </ul>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseInitialGuidance} color="primary" variant="contained" autoFocus>Got it!</Button>
          </DialogActions>
        </Dialog>
        {/* Dialog for Popups */}
        <Dialog
          open={dialogState.open}
          onClose={handleCloseDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title" sx={{color: dialogState.severity === 'error' ? 'error.main' : (dialogState.severity === 'warning' ? 'warning.main' : 'primary.main')}}>
            {dialogState.title}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {dialogState.message}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary" autoFocus>
              OK
            </Button>
          </DialogActions>
        </Dialog>

        {projects.map((project, index) => (
          <ProjectFormItem
            key={index}
            project={project}
            index={index}
            onInputChange={handleInputChange}
            onAutocompleteChange={handleAutocompleteChange}
            onDateChange={handleDateChange}
            onRemoveProject={removeProject}
            isProjectInProgress={isProjectInProgress}
            projectsCount={projects.length}
            programmingLanguageOptions={dynamicProgrammingLanguageOptions}
            devOpsToolsOptions={dynamicDevOpsToolsOptions}
            versionControllerOptions={dynamicVersionControllerOptions}
            cloudPlatformOptions={dynamicCloudPlatformOptions} // Pass new options
            databaseOptions={dynamicDatabaseOptions}
            onSmartGenerateDescription={handleSmartGenerateDescription}
            onSmartGenerateRole={handleSmartGenerateRole}
          />
        ))}

        <Box sx={{ textAlign: "center", marginBottom: 3 }}>
          <Button
            variant="outlined"
            onClick={addNextProject}
            disabled={!isAddNextProjectEnabled()}
            sx={{ marginRight: 2, borderColor: "#3498db", color: "#3498db", '&:hover': { borderColor: "#2980b9", backgroundColor: 'rgba(52, 152, 219, 0.04)' } }}
          >
            Add Next Project
          </Button>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Button
            variant="contained"
            onClick={() => {
              const validationError = validateAllProjects();
              if (validationError) {
                 setDialogState({
                    open: true,
                    title: "Incomplete Project Information",
                    message: validationError,
                    severity: "error",
                 });
                 return; // Prevent navigation
              }
              
              // If all checks pass, navigate
              navigate("/summarize", { state: { projectsData: projects, overallExperience: overallExperienceYears } });
            }}
            sx={{ width: "50%", backgroundColor: "#3498db", '&:hover': { backgroundColor: "#2980b9" } }}
          >
            Next Page → Summarize
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

export default ProjectsSummary;
