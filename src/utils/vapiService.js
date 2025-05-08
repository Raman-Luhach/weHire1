import Vapi from "@vapi-ai/web";

// Initialize Vapi instance with correct API key
const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY || "e857264a-2e55-4489-b35e-1dc6cb5ac483");
let activeCall = null;

// Set up event listeners
vapi.on("speech-start", () => {
  console.log("Assistant speech has started");
});

vapi.on("speech-end", () => {
  console.log("Assistant speech has ended");
});

vapi.on("call-start", () => {
  console.log("Call has started");
});

vapi.on("call-end", (data) => {
  console.log("Call has ended", data);
  // This data object might contain recording URLs - log it for debugging
  console.log("Call ended with data:", JSON.stringify(data));
});

vapi.on("volume-level", (volume) => {
  console.log(`Assistant volume level: ${volume}`);
});

vapi.on("message", (message) => {
  console.log("Message received:", message);
  // This might include recording related messages - log them
  if (message.type === "artifact" || message.type === "recording") {
    console.log("Artifact/recording message:", JSON.stringify(message));
  }
});

vapi.on("error", (error) => {
  console.error("Vapi error:", error);
});

/**
 * Start an interview with a temporary assistant configuration
 */
const startInterview = (candidateName, jobTitle, companyName, questions = []) => {
  // Clear logging for the questions being sent to Vapi
  console.log("--------- INTERVIEW QUESTIONS SENT TO VAPI ---------");
  console.log("Candidate:", candidateName);
  console.log("Job Title:", jobTitle);
  console.log("Questions:");
  questions.forEach((q, i) => console.log(`${i + 1}. ${q}`));
  console.log("----------------------------------------------------");
  
  // Format questions as a string for the system prompt
  const formattedQuestions = questions?.map((q, i) => `${i + 1}. ${q}`).join('\n') || '';

  // Create assistant configuration
  const assistantOptions = {
    name: `${candidateName} Interview`,
    firstMessage: `Hello ${candidateName}, I'll be conducting your interview today for the ${jobTitle} position at ${companyName}. We'll start with some brief introductions, then move on to the main questions. Feel free to take your time answering, and let me know if you need a break at any point.`,
    transcriber: {
      provider: "deepgram",
      language: "en-US"
    },
    voice: {
      provider: "playht",
      voiceId: "jennifer"
    },
    model: {
      provider: "openai",
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an experienced technical interviewer conducting a job interview for the ${jobTitle}.
Your goal is to interview ${candidateName} and thoroughly evaluate their skills, experience, and fit for the role.

Here are the specific questions from the interview persona that you MUST cover during this interview:
${formattedQuestions}

Interview Structure and Guidelines:

1. INTRODUCTION (2-3 minutes):
   - Introduce yourself warmly as an AI assistant helping with the interview process
   - Briefly explain the structure of the interview
   - Ask a simple ice-breaker question to make the candidate comfortable (e.g., "How are you doing today?" or "Tell me a bit about yourself")

2. MAIN INTERVIEW (15-20 minutes):
   - Ask each question from the provided list in order
   - For each question:
     * Ask the question clearly
     * Listen to the candidate's full response without interrupting
     * Ask 1-2 relevant follow-up questions based on their answer to go deeper
     * If their answer is vague or incomplete, politely ask them to elaborate or provide specific examples
   
3. FOLLOW-UP TECHNIQUES:
   - IMPORTANT: Ask no more than 1-2 follow-up questions per main question
   - Preferably ask only 1 follow-up question for most answers
   - Only ask a second follow-up if absolutely necessary for clarity
   - Never ask more than 2 follow-up questions per main question
   - Use the STAR method (Situation, Task, Action, Result) to guide candidates if they give incomplete answers
   - Follow-up question examples:
     * "Can you tell me more about how you implemented that solution?"
     * "What specific challenges did you face during that project?"
     * "How did you measure the success of that initiative?"
     * "What would you do differently if you had to do it again?"

4. NATURAL CONVERSATION:
   - Make the interview feel like a conversation, not an interrogation
   - Acknowledge good responses with positive feedback like "That's a great example" or "Thank you for that detailed response"
   - Take brief pauses between questions to simulate a natural interview rhythm
   - If the candidate seems nervous or struggling, offer reassurance: "Take your time, there's no rush"

5. BREAKS:
   - After approximately 3-4 questions, offer a short break: "Would you like to take a brief pause before we continue?"
   - If the candidate seems tired or overwhelmed, proactively suggest a short break

6. CLOSING (2-3 minutes):
   - After covering all questions, ask if there's anything else the candidate would like to share
   - Explain the next steps in the interview process
   - Thank the candidate for their time and end the interview professionally

IMPORTANT NOTES:
- Focus on evaluating both technical skills and soft skills
- Be patient and listen carefully to complete answers
- Maintain a professional but friendly tone throughout
- Never criticize or make negative comments about the candidate's responses
- Do not rush through the questions - quality of discussion is more important than covering everything
- If a candidate says they don't know the answer to a technical question, ask if they'd like to talk through their thought process instead

Begin the interview with a warm, professional introduction and proceed with the questions in the order provided.`
        }
      ]
    },
    // Top level recording configuration - required for web calls
    recordingEnabled: true,
    // Additional detailed artifact configuration
    artifactPlan: {
      videoRecordingEnabled: true,
      recordingFormat: "mp3"
    }
  };

  // Log only the essential info
  console.log("Starting interview with assistant name:", assistantOptions.name);

  // Start the call
  try {
    activeCall = vapi.start(assistantOptions);
    console.log("Interview call started successfully");
    return activeCall;
  } catch (error) {
    console.error("Error starting Vapi interview:", error);
    throw error;
  }
};

/**
 * Start an interview using a persistent assistant
 */
const startInterviewWithAssistant = (assistantId, overrides = {}) => {
  try {
    // Make sure overrides include recording settings
    const completeOverrides = {
      ...overrides,
      recordingEnabled: true,
      artifactPlan: {
        ...(overrides.artifactPlan || {}),
        videoRecordingEnabled: true
      }
    };
    
    activeCall = vapi.start(assistantId, completeOverrides);
    return activeCall;
  } catch (error) {
    console.error("Error starting Vapi interview:", error);
    throw error;
  }
};

/**
 * Send a system message during the interview
 */
const sendSystemMessage = (message) => {
  if (activeCall) {
    vapi.send({
      type: "add-message",
      message: {
        role: "system",
        content: message
      }
    });
  }
};

/**
 * Check if the microphone is muted
 */
const isMuted = () => {
  return vapi.isMuted();
};

/**
 * Set the mute state of the microphone
 */
const setMuted = (muted) => {
  vapi.setMuted(muted);
};

/**
 * Make the assistant say something and optionally end the call
 */
const say = (message, endCallAfterSpoken = false) => {
  vapi.say(message, endCallAfterSpoken);
};

/**
 * End the current active call
 */
const endCall = () => {
  if (activeCall) {
    console.log("Ending call...");
    vapi.stop();
    console.log("Call ended");
    activeCall = null;
  }
};

/**
 * Get recording URLs from a completed call
 */
const getRecordingUrl = async (callId) => {
  try {
    console.log(`Fetching recording URLs for call ID: ${callId}`);
    
    // In a real implementation, you would fetch this from Vapi's API directly
    // For now, we'll construct the expected URLs based on the call ID
    const urls = {
      audioUrl: `https://api.vapi.ai/call/${callId}/recording`,
      videoUrl: `https://api.vapi.ai/call/${callId}/video-recording`,
      transcriptUrl: `https://api.vapi.ai/call/${callId}/transcript`
    };
    
    console.log("Generated recording URLs:", urls);
    return urls;
  } catch (error) {
    console.error('Error getting recording URLs:', error);
    return {
      audioUrl: null,
      videoUrl: null,
      transcriptUrl: null
    };
  }
};

// Add methods to handle event listeners
/**
 * Add an event listener for Vapi events
 */
const on = (event, callback) => {
  vapi.on(event, callback);
};

/**
 * Remove an event listener for Vapi events
 */
const off = (event, callback) => {
  if (typeof vapi.off === 'function') {
    vapi.off(event, callback);
  } else if (typeof vapi.removeListener === 'function') {
    vapi.removeListener(event, callback);
  } else {
    console.warn('No method to remove listeners found on Vapi instance');
  }
};

// Export all functions
export default {
  startInterview,
  startInterviewWithAssistant,
  sendSystemMessage,
  isMuted,
  setMuted,
  say,
  endCall,
  getRecordingUrl,
  on,
  off
}; 