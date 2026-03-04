export const mockStats = {
  prompts: 3,
  mcpServers: 10,
  skills: 5,
  workflows: 3,
};

export const mockPrompts = [
  {
    id: "1",
    name: "Senior Full-Stack Developer",
    preview:
      "Act as a senior full-stack developer with 10+ years of experience in React, Node.js, and cloud architectures. Your goal is to produce production-ready, well-documented code.",
    category: "development",
    status: "improved",
    quality: 92,
    sections: {
      rol: "Act as a senior full-stack developer with 10+ years of experience in React, Node.js, TypeScript, PostgreSQL and cloud architectures (AWS/GCP). You have deep expertise in system design, performance optimization, and security best practices.",
      tarea:
        "Analyze the provided code or requirement and produce a complete, production-ready implementation. Include proper error handling, TypeScript types, unit test coverage, and inline documentation following JSDoc standards.",
      audiencia:
        "Development teams working on enterprise-scale web applications who need high-quality, maintainable code that follows industry standards and can be reviewed by senior engineers.",
      formato:
        "Respond with structured sections: 1) Brief analysis, 2) Implementation code with syntax highlighting, 3) Key decisions explained, 4) Testing approach, 5) Potential improvements. Use markdown headers.",
      contexto:
        "The codebase follows a monorepo structure with strict TypeScript, ESLint, and Prettier configurations. Code must be compatible with Node 20+ and React 19. Performance and bundle size are critical concerns.",
    },
  },
  {
    id: "2",
    name: "Product Marketing Copywriter",
    preview:
      "Act as an expert product marketing copywriter specializing in SaaS and developer tools. Craft compelling, conversion-focused copy that speaks directly to technical audiences.",
    category: "marketing",
    status: "improved",
    quality: 87,
    sections: {
      rol: "Act as an expert product marketing copywriter with 8+ years specializing in SaaS, developer tools, and B2B software. You have a proven track record of crafting copy that converts technical audiences into paying customers.",
      tarea:
        "Create compelling marketing copy for the specified product, feature, or campaign. Focus on benefits over features, use concrete metrics where possible, and maintain an authoritative yet approachable tone.",
      audiencia:
        "Technical decision-makers, developers, and engineering managers who are evaluating tools to improve their workflow. They are skeptical of hype and respond to clear value propositions backed by evidence.",
      formato:
        "Deliver: 1) Hero headline + subheadline, 2) Three key benefit statements with supporting details, 3) Social proof hooks, 4) CTA variants (primary and secondary), 5) Short-form version for ads/emails (under 50 words).",
      contexto:
        "Brand voice is professional but not corporate — think thoughtful, knowledgeable colleague. Avoid jargon overload. Competitor positioning should be implicit, never naming competitors directly.",
    },
  },
  {
    id: "3",
    name: "Data Analysis Expert",
    preview:
      "Act as a data scientist and analyst with expertise in statistical analysis, machine learning, and data visualization. Provide rigorous, insight-driven analysis.",
    category: "analysis",
    status: "pending",
    quality: 74,
    sections: {
      rol: "Act as a senior data scientist with expertise in statistical analysis, machine learning pipelines, Python (pandas, scikit-learn, PyTorch), and data visualization (Plotly, Matplotlib, D3.js). You bring academic rigor to business problems.",
      tarea:
        "Analyze the provided dataset or problem statement. Identify patterns, anomalies, and actionable insights. Suggest appropriate statistical methods and ML approaches where relevant, justifying your choices.",
      audiencia:
        "Product managers, business stakeholders, and data engineers who need both high-level insights and technical implementation details. Audience has varying levels of statistical knowledge.",
      formato:
        "Structure your analysis as: 1) Executive summary (3 sentences), 2) Key findings with supporting statistics, 3) Methodology explanation, 4) Code snippets for reproducibility, 5) Limitations and caveats, 6) Recommended next steps.",
      contexto:
        "Data lives in a Snowflake data warehouse. Python is the primary analysis language. Visualizations will be embedded in a Notion-based internal wiki. All numbers should include confidence intervals or error margins.",
    },
  },
];

export const mockSkills = [
  {
    id: "1",
    name: "code_review",
    category: "development",
    description:
      "Performs a thorough code review identifying bugs, security vulnerabilities, performance issues, and style inconsistencies.",
    parameters: ["{{CODE}}", "{{LANGUAGE}}", "{{CONTEXT}}"],
    uses: 847,
    quality: 94,
    template:
      "Review the following {{LANGUAGE}} code:\n\n```\n{{CODE}}\n```\n\nContext: {{CONTEXT}}\n\nProvide a structured review covering: 1) Critical issues, 2) Security concerns, 3) Performance opportunities, 4) Style improvements, 5) Positive highlights.",
  },
  {
    id: "2",
    name: "summarize_document",
    category: "writing",
    description:
      "Creates concise, structured summaries of long documents preserving key information and main arguments.",
    parameters: ["{{DOCUMENT}}", "{{LENGTH}}", "{{AUDIENCE}}"],
    uses: 623,
    quality: 91,
    template:
      "Summarize the following document for {{AUDIENCE}}:\n\n{{DOCUMENT}}\n\nTarget length: {{LENGTH}} words. Preserve key statistics, decisions, and action items. Use bullet points for scanability.",
  },
  {
    id: "3",
    name: "generate_tests",
    category: "development",
    description:
      "Generates comprehensive unit and integration tests for a given function or module.",
    parameters: ["{{FUNCTION}}", "{{FRAMEWORK}}", "{{COVERAGE_GOAL}}"],
    uses: 512,
    quality: 89,
    template:
      "Generate {{FRAMEWORK}} tests for the following function:\n\n{{FUNCTION}}\n\nCoverage goal: {{COVERAGE_GOAL}}%. Include: happy path, edge cases, error conditions, and async scenarios. Use descriptive test names.",
  },
  {
    id: "4",
    name: "translate_technical",
    category: "writing",
    description:
      "Translates technical documentation to plain language for non-technical stakeholders.",
    parameters: ["{{CONTENT}}", "{{TARGET_AUDIENCE}}", "{{TONE}}"],
    uses: 394,
    quality: 88,
    template:
      "Translate this technical content for {{TARGET_AUDIENCE}} using a {{TONE}} tone:\n\n{{CONTENT}}\n\nAvoid jargon. Use analogies where helpful. Maintain accuracy while improving accessibility.",
  },
  {
    id: "5",
    name: "api_design",
    category: "development",
    description:
      "Designs RESTful or GraphQL APIs following best practices for resource naming, versioning, and error handling.",
    parameters: ["{{REQUIREMENTS}}", "{{STYLE}}", "{{AUTH_METHOD}}"],
    uses: 267,
    quality: 85,
    template:
      "Design a {{STYLE}} API for the following requirements:\n\n{{REQUIREMENTS}}\n\nAuthentication: {{AUTH_METHOD}}\n\nInclude: endpoint definitions, request/response schemas, error codes, rate limiting strategy, and versioning approach.",
  },
];

export const mockMcpServers = [
  {
    id: "1",
    name: "filesystem",
    emoji: "📁",
    command: "npx @modelcontextprotocol/server-filesystem /workspace",
    status: "ok",
    issues: [
      { type: "ok", message: "Server responding on port 3001" },
      { type: "ok", message: "Read/write permissions verified" },
      { type: "info", message: "Watching 3 root directories" },
    ],
  },
  {
    id: "2",
    name: "github",
    emoji: "🐙",
    command: "npx @modelcontextprotocol/server-github",
    status: "ok",
    issues: [
      { type: "ok", message: "GitHub token authenticated" },
      { type: "ok", message: "Rate limit: 4,823 / 5,000 remaining" },
      { type: "info", message: "Access to 12 repositories" },
    ],
  },
  {
    id: "3",
    name: "postgres",
    emoji: "🐘",
    command: "npx @modelcontextprotocol/server-postgres postgresql://localhost/db",
    status: "warning",
    issues: [
      { type: "warning", message: "Connection pool near capacity (8/10)" },
      { type: "ok", message: "Query execution working" },
      { type: "warning", message: "Slow query detected: avg 340ms" },
    ],
  },
  {
    id: "4",
    name: "brave-search",
    emoji: "🔍",
    command: "npx @modelcontextprotocol/server-brave-search",
    status: "ok",
    issues: [
      { type: "ok", message: "API key valid" },
      { type: "ok", message: "Search index up to date" },
      { type: "info", message: "Daily quota: 487 / 2,000 used" },
    ],
  },
  {
    id: "5",
    name: "puppeteer",
    emoji: "🎭",
    command: "npx @modelcontextprotocol/server-puppeteer",
    status: "warning",
    issues: [
      { type: "ok", message: "Chromium runtime available" },
      { type: "warning", message: "Memory usage high: 1.2GB / 2GB" },
      { type: "info", message: "Headless mode active" },
    ],
  },
  {
    id: "6",
    name: "slack",
    emoji: "💬",
    command: "npx @modelcontextprotocol/server-slack",
    status: "ok",
    issues: [
      { type: "ok", message: "Bot token authenticated" },
      { type: "ok", message: "Connected to 5 channels" },
      { type: "info", message: "Real-time events subscribed" },
    ],
  },
  {
    id: "7",
    name: "redis",
    emoji: "🔴",
    command: "npx @modelcontextprotocol/server-redis redis://localhost:6379",
    status: "ok",
    issues: [
      { type: "ok", message: "Redis 7.2 connected" },
      { type: "ok", message: "Keyspace: 1,247 keys" },
      { type: "info", message: "Persistence: AOF enabled" },
    ],
  },
  {
    id: "8",
    name: "notion",
    emoji: "📝",
    command: "npx @modelcontextprotocol/server-notion",
    status: "warning",
    issues: [
      { type: "warning", message: "Integration token expires in 3 days" },
      { type: "ok", message: "Page access: 24 pages" },
      { type: "info", message: "Database sync enabled" },
    ],
  },
  {
    id: "9",
    name: "aws-s3",
    emoji: "☁️",
    command: "npx @modelcontextprotocol/server-aws-s3",
    status: "ok",
    issues: [
      { type: "ok", message: "IAM credentials valid" },
      { type: "ok", message: "Bucket access: 3 buckets" },
      { type: "info", message: "Region: us-east-1" },
    ],
  },
  {
    id: "10",
    name: "linear",
    emoji: "📐",
    command: "npx @modelcontextprotocol/server-linear",
    status: "ok",
    issues: [
      { type: "ok", message: "API key authenticated" },
      { type: "ok", message: "Team access: Engineering, Design" },
      { type: "info", message: "Webhook subscriptions active" },
    ],
  },
];

export const mockWorkflows = [
  {
    id: "1",
    name: "Code Review Pipeline",
    emoji: "🔍",
    description:
      "Automated code review that analyzes quality, generates improvement suggestions, and creates a summary report.",
    steps: [
      {
        id: "s1",
        name: "Code Analysis",
        type: "SKILL",
        skill: "code_review",
        description: "Run comprehensive code review",
      },
      {
        id: "s2",
        name: "Generate Tests",
        type: "SKILL",
        skill: "generate_tests",
        description: "Suggest missing test coverage",
      },
      {
        id: "s3",
        name: "Format Report",
        type: "TRANSFORM",
        skill: null,
        description: "Structure findings into a report",
      },
    ],
  },
  {
    id: "2",
    name: "Content Repurposer",
    emoji: "♻️",
    description:
      "Takes a long-form article and repurposes it into multiple formats: summary, social posts, and email newsletter.",
    steps: [
      {
        id: "s1",
        name: "Summarize Article",
        type: "SKILL",
        skill: "summarize_document",
        description: "Create concise summary",
      },
      {
        id: "s2",
        name: "Write Social Posts",
        type: "FREE_PROMPT",
        skill: null,
        description: "Generate 3 social media variants",
      },
      {
        id: "s3",
        name: "Email Newsletter",
        type: "FREE_PROMPT",
        skill: null,
        description: "Format as email newsletter",
      },
      {
        id: "s4",
        name: "Bundle Output",
        type: "TRANSFORM",
        skill: null,
        description: "Combine all formats",
      },
    ],
  },
  {
    id: "3",
    name: "API Documentation Generator",
    emoji: "📚",
    description:
      "Analyzes API endpoints and generates comprehensive documentation with examples and usage guides.",
    steps: [
      {
        id: "s1",
        name: "Parse Endpoints",
        type: "SKILL",
        skill: "api_design",
        description: "Extract endpoint structure",
      },
      {
        id: "s2",
        name: "Translate for Humans",
        type: "SKILL",
        skill: "translate_technical",
        description: "Write human-readable descriptions",
      },
      {
        id: "s3",
        name: "Generate Examples",
        type: "FREE_PROMPT",
        skill: null,
        description: "Create request/response examples",
      },
    ],
  },
];

export const mockContextPacks = [
  {
    id: "1",
    emoji: "⚡",
    name: "Full-Stack Development",
    description:
      "Complete development environment with filesystem access, GitHub integration, database connections, and code execution. Ideal for software engineering tasks.",
    resources: { prompts: 1, skills: 3, mcps: 4 },
    mcpConfig: {
      mcpServers: {
        filesystem: {
          command: "npx",
          args: ["@modelcontextprotocol/server-filesystem", "/workspace"],
        },
        github: {
          command: "npx",
          args: ["@modelcontextprotocol/server-github"],
          env: { GITHUB_TOKEN: "${GITHUB_TOKEN}" },
        },
        postgres: {
          command: "npx",
          args: [
            "@modelcontextprotocol/server-postgres",
            "postgresql://localhost/dev",
          ],
        },
        redis: {
          command: "npx",
          args: [
            "@modelcontextprotocol/server-redis",
            "redis://localhost:6379",
          ],
        },
      },
    },
  },
  {
    id: "2",
    emoji: "📊",
    name: "Data & Analytics",
    description:
      "Data analysis environment with database access, search capabilities, and cloud storage. Perfect for data science and business intelligence workflows.",
    resources: { prompts: 1, skills: 2, mcps: 3 },
    mcpConfig: {
      mcpServers: {
        postgres: {
          command: "npx",
          args: [
            "@modelcontextprotocol/server-postgres",
            "postgresql://localhost/analytics",
          ],
        },
        "brave-search": {
          command: "npx",
          args: ["@modelcontextprotocol/server-brave-search"],
          env: { BRAVE_API_KEY: "${BRAVE_API_KEY}" },
        },
        "aws-s3": {
          command: "npx",
          args: ["@modelcontextprotocol/server-aws-s3"],
          env: {
            AWS_ACCESS_KEY_ID: "${AWS_ACCESS_KEY_ID}",
            AWS_SECRET_ACCESS_KEY: "${AWS_SECRET_ACCESS_KEY}",
          },
        },
      },
    },
  },
  {
    id: "3",
    emoji: "✍️",
    name: "Content Creation",
    description:
      "Writing and content management suite with Notion integration, web research, and team communication. Built for content teams and marketers.",
    resources: { prompts: 2, skills: 2, mcps: 3 },
    mcpConfig: {
      mcpServers: {
        notion: {
          command: "npx",
          args: ["@modelcontextprotocol/server-notion"],
          env: { NOTION_TOKEN: "${NOTION_TOKEN}" },
        },
        "brave-search": {
          command: "npx",
          args: ["@modelcontextprotocol/server-brave-search"],
          env: { BRAVE_API_KEY: "${BRAVE_API_KEY}" },
        },
        slack: {
          command: "npx",
          args: ["@modelcontextprotocol/server-slack"],
          env: { SLACK_BOT_TOKEN: "${SLACK_BOT_TOKEN}" },
        },
      },
    },
  },
  {
    id: "4",
    emoji: "🚀",
    name: "DevOps & Infrastructure",
    description:
      "Infrastructure management pack with cloud storage, project tracking, and team communication. For DevOps engineers and platform teams.",
    resources: { prompts: 1, skills: 1, mcps: 4 },
    mcpConfig: {
      mcpServers: {
        "aws-s3": {
          command: "npx",
          args: ["@modelcontextprotocol/server-aws-s3"],
          env: {
            AWS_ACCESS_KEY_ID: "${AWS_ACCESS_KEY_ID}",
            AWS_SECRET_ACCESS_KEY: "${AWS_SECRET_ACCESS_KEY}",
          },
        },
        linear: {
          command: "npx",
          args: ["@modelcontextprotocol/server-linear"],
          env: { LINEAR_API_KEY: "${LINEAR_API_KEY}" },
        },
        slack: {
          command: "npx",
          args: ["@modelcontextprotocol/server-slack"],
          env: { SLACK_BOT_TOKEN: "${SLACK_BOT_TOKEN}" },
        },
        github: {
          command: "npx",
          args: ["@modelcontextprotocol/server-github"],
          env: { GITHUB_TOKEN: "${GITHUB_TOKEN}" },
        },
      },
    },
  },
];

export const mockCategoryData = [
  { category: "Development", count: 1 },
  { category: "Marketing", count: 1 },
  { category: "Analysis", count: 1 },
];

export const mockRecentActivity = [
  {
    id: "1",
    type: "prompt",
    color: "#6366f1",
    text: 'Prompt "Senior Full-Stack Developer" improved',
    time: "2 min ago",
  },
  {
    id: "2",
    type: "skill",
    color: "#22c55e",
    text: 'Skill "code_review" executed successfully',
    time: "8 min ago",
  },
  {
    id: "3",
    type: "workflow",
    color: "#a855f7",
    text: '"Code Review Pipeline" workflow completed',
    time: "23 min ago",
  },
  {
    id: "4",
    type: "mcp",
    color: "#06b6d4",
    text: "MCP Server postgres warning detected",
    time: "1 hr ago",
  },
  {
    id: "5",
    type: "skill",
    color: "#22c55e",
    text: 'Skill "summarize_document" executed',
    time: "2 hr ago",
  },
  {
    id: "6",
    type: "prompt",
    color: "#6366f1",
    text: '"Data Analysis Expert" prompt created',
    time: "3 hr ago",
  },
];
