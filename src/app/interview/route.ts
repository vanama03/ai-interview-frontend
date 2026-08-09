import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, candidate, message } = body;

    // Start interview turn
    if (candidate) {
      return NextResponse.json({
        reply: `Welcome ${candidate.member?.name || 'Sarah Johnson'} (CAND-001). I am your AI Evaluation Agent. Let's start with Vector Databases & Embeddings—can you explain how you structured retrieval and metadata filtering during the cohort?`,
        done: false
      });
    }

    // Subsequent turns
    if (message) {
      return NextResponse.json({
        reply: `Great response regarding "${message.substring(0, 30)}...". Moving to Day 23 (Model Context Protocol): How did you design tools and schemas for safe tool execution?`,
        done: false
      });
    }

    return NextResponse.json({ reply: 'Ready to begin interview.', done: false });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}