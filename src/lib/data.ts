export interface Candidate {
    member: {
      id: string;
      name: string;
      jobRole: string;
      yearsExperience: number;
      education: string;
      status: string;
    };
    missions: Array<{
      day: number;
      title: string;
      passed?: boolean;
      skipped?: boolean;
      attempts?: number;
    }>;
    signals: {
      commitDays: number;
      missionsCompleted: number;
      missionsFirstTry: number;
    };
  }
  
  export const CANDIDATES_DATA: Candidate[] = [
    {
      member: { id: "CAND-001", name: "Sarah Johnson", jobRole: "Senior Data Engineer", yearsExperience: 9, education: "MS Computer Science", status: "COMPLETED" },
      missions: [
        { day: 7, title: "Embeddings Explained", passed: true, attempts: 1 },
        { day: 8, title: "Vector Databases Overview", passed: true, attempts: 1 },
        { day: 10, title: "Retrieval & Matching Engine", passed: true, attempts: 2 },
        { day: 12, title: "Prompt Engineering Fundamentals", passed: true, attempts: 4 },
        { day: 23, title: "Model Context Protocol (MCP)", passed: true, attempts: 2 },
        { day: 29, title: "Monitoring, Logging & Observability", skipped: true }
      ],
      signals: { commitDays: 28, missionsCompleted: 30, missionsFirstTry: 20 }
    },
    {
      member: { id: "CAND-003", name: "Emily Chen", jobRole: "AI Engineer", yearsExperience: 6, education: "MS Artificial Intelligence", status: "COMPLETED" },
      missions: [
        { day: 7, title: "Embeddings Explained", passed: true, attempts: 1 },
        { day: 8, title: "Vector Databases Overview", passed: true, attempts: 1 },
        { day: 11, title: "RAG End-to-End", passed: true, attempts: 1 },
        { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 1 },
        { day: 23, title: "Model Context Protocol (MCP)", passed: true, attempts: 1 }
      ],
      signals: { commitDays: 31, missionsCompleted: 31, missionsFirstTry: 30 }
    },
    {
      member: { id: "CAND-008", name: "Harold Whitfield", jobRole: "Distinguished Engineer", yearsExperience: 28, education: "BS Computer Science", status: "COMPLETED" },
      missions: [
        { day: 14, title: "Fine-Tuning: Concepts", skipped: true },
        { day: 15, title: "Fine-Tuning: LoRA & QLoRA", skipped: true },
        { day: 21, title: "LangChain Agents", passed: true, attempts: 5 },
        { day: 23, title: "Model Context Protocol (MCP)", passed: true, attempts: 5 }
      ],
      signals: { commitDays: 25, missionsCompleted: 27, missionsFirstTry: 15 }
    }
  ];