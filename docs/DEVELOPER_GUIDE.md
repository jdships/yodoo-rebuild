# Yodoo Developer Guide

So you want to hack on Yodoo? Cool. This guide will walk you through how everything works under the hood - from the chat system to billing to adding new tools. No fluff, just the technical bits you need to know.

## Architecture Overview

Yodoo is a Next.js 15 app using the App Router with TypeScript. Here's the stack:

- **Frontend**: React 19, Tailwind CSS, Radix UI, Framer Motion
- **Backend**: Next.js API routes, AI SDK by Vercel
- **Database**: Supabase (PostgreSQL with real-time subscriptions)
- **Auth**: Supabase Auth with Google OAuth
- **Payments**: Polar (subscription billing)
- **AI Models**: OpenAI, Anthropic, Mistral, Google, XAI, OpenRouter, Ollama (local)
- **State Management**: Zustand + React Context (hybrid approach)

## Project Structure

```
app/
├── api/                    # API routes
│   ├── chat/              # Main chat endpoint
│   ├── create-chat/       # Chat creation
│   ├── rate-limits/       # Usage tracking
│   └── ...
├── components/            # React components
│   ├── chat/             # Chat interface
│   ├── multi-chat/       # Multi-model chat
│   ├── layout/           # App shell components
│   └── ...
├── hooks/                # Custom React hooks
└── types/                # TypeScript definitions

lib/
├── chat-store/           # Chat state management
├── user-store/           # User state management
├── models/               # AI model configurations
├── supabase/            # Database client
└── config.ts            # App configuration

components/              # Shared UI components
├── ui/                 # Base components (shadcn/ui)
├── prompt-kit/         # Chat-specific components
└── ...
```

## State Management

We use a hybrid approach - Zustand for complex state, React Context for simple stuff.

### Chat State (`lib/chat-store/`)

The chat system has three main stores:

**1. Chats Store** (`chats/provider.tsx`)

```typescript
// Manages chat list, creation, updates
const { chats, createNewChat, updateChat, deleteChat } = useChats();
```

**2. Messages Store** (`messages/provider.tsx`)

```typescript
// Handles message persistence and caching
const { messages, cacheAndAddMessage, refresh } = useMessages();
```

**3. Session Store** (`session/provider.tsx`)

```typescript
// Tracks current chat ID
const { chatId } = useChatSession();
```

### User State (`lib/user-store/`)

User data is managed through Supabase Auth + our custom user profile:

```typescript
const { user, isLoading } = useUser();
// user contains: id, email, subscription_type, message_count, etc.
```

### Model State (`lib/model-store/`)

AI model selection and configuration:

```typescript
const { models, selectedModel, handleModelChange } = useModel();
```

## Database Schema

We use Supabase with these main tables:

### Users Table

```sql
users (
  id UUID PRIMARY KEY,           -- Links to auth.users
  email TEXT,
  subscription_type TEXT,        -- 'free', 'pro', 'unlimited'
  subscription_status TEXT,      -- 'active', 'inactive', etc.
  message_count INTEGER,         -- Total messages sent
  daily_message_count INTEGER,   -- Daily counter
  polar_customer_id TEXT,        -- Polar billing ID
  -- ... other fields
)
```

### Chats & Messages

```sql
chats (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT,
  model TEXT,
  created_at TIMESTAMPTZ
)

messages (
  id SERIAL PRIMARY KEY,
  chat_id UUID REFERENCES chats(id),
  role TEXT,                     -- 'user', 'assistant', 'system'
  content TEXT,
  experimental_attachments JSONB, -- File attachments
  message_group_id TEXT,         -- Groups user+assistant messages
  model TEXT                     -- Which AI model responded
)
```

### User Keys (BYOK)

```sql
user_keys (
  user_id UUID,
  provider TEXT,                 -- 'openai', 'anthropic', etc.
  encrypted_key TEXT,            -- AES encrypted API key
  iv TEXT                        -- Encryption IV
)
```

## Chat System Deep Dive

### Single Chat Flow

1. **User types message** → `ChatInput` component
2. **Submit handler** → `useChatCore` hook
3. **Chat creation** → `ensureChatExists()` creates chat if needed
4. **Message generation** → Unique `message_group_id` created
5. **API call** → `/api/chat` with user message + attachments
6. **AI response** → Streamed back via AI SDK
7. **Persistence** → Both user and AI messages saved to DB

Key files:

- `app/components/chat/chat.tsx` - Main chat interface
- `app/components/chat/use-chat-core.ts` - Chat logic
- `app/api/chat/route.ts` - API endpoint

### Multi-Chat Implementation

Multi-chat lets users talk to multiple AI models simultaneously. Here's how it works:

**1. Model Selection** (`multi-chat/multi-chat.tsx`)

```typescript
const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
```

**2. Chat Instance Creation** (`multi-chat/use-multi-chat.ts`)

```typescript
// Creates separate useChat hooks for each model
const chatHooks = Array.from({ length: MAX_MODELS }, (_, index) => {
  return useChat({
    api: "/api/chat",
    initialMessages: modelInitialMessages,
  });
});
```

**3. Message Broadcasting**
When user sends a message, it goes to all selected models:

```typescript
await Promise.all(
  selectedChats.map(async (chat) => {
    const options = {
      body: {
        chatId: chatIdToUse,
        userId: uid,
        model: chat.model.id,
        message_group_id: messageGroupId, // Same ID for all models
      },
    };
    chat.append({ role: "user", content: prompt }, options);
  })
);
```

**4. Message Deduplication**
The tricky part is loading messages on refresh. Each model should see:

- User messages it responded to
- Its own assistant responses
- No duplicate user messages

This happens in `use-multi-chat.ts`:

```typescript
// Filter messages for each model
const assistantMessageGroupIds = new Set(
  assistantMessagesFromThisModel.map((msg) => msg.message_group_id)
);

// Include user messages only if this model responded
modelInitialMessages = initialMessages.filter((msg) => {
  if (msg.role === "user") {
    const messageGroupId = msg.message_group_id;
    return messageGroupId && assistantMessageGroupIds.has(messageGroupId);
  }
  return msg.role === "assistant" && msg.model === model.id;
});

// Deduplicate user messages by message_group_id
const seenUserMessageGroups = new Set<string>();
modelInitialMessages = modelInitialMessages.filter((msg) => {
  if (msg.role === "user") {
    const messageGroupId = msg.message_group_id;
    if (messageGroupId && seenUserMessageGroups.has(messageGroupId)) {
      return false; // Skip duplicate
    }
    seenUserMessageGroups.add(messageGroupId);
  }
  return true;
});
```

## Usage Limits & Billing

### How Limits Work

We have different limits based on subscription tier and API key ownership:

```typescript
// lib/config.ts
export const AUTH_DAILY_MESSAGE_LIMIT = 100; // Free without keys
export const FREE_WITH_API_KEYS_LIMIT = 250; // Free with keys
export const PRO_MONTHLY_MESSAGE_LIMIT = 5000; // Pro without keys
export const PRO_MONTHLY_MESSAGE_LIMIT_WITH_KEYS = 10000; // Pro with keys
```

### Usage Checking (`lib/usage.ts`)

Before every chat request, we check limits:

```typescript
export async function checkUsage(supabase: SupabaseClient, userId: string) {
  // Get user data
  const userData = await supabase
    .from("users")
    .select("message_count, subscription_type, ...")
    .eq("id", userId);

  // Check if user has API keys
  const hasApiKeys = await userHasApiKeys(userId);

  // Determine limits based on subscription + API keys
  const isUnlimited = userData.subscription_type === "unlimited";
  const isPro = userData.subscription_type === "pro";

  let monthlyLimit;
  if (isUnlimited) {
    monthlyLimit = -1; // Unlimited
  } else if (isPro) {
    monthlyLimit = hasApiKeys ? 10000 : 5000;
  } else {
    monthlyLimit = hasApiKeys ? 250 : 100;
  }

  // Check if over limit
  if (monthlyLimit > 0 && userData.message_count >= monthlyLimit) {
    throw new UsageLimitError("Message limit reached...");
  }
}
```

### Multi-Chat Credit Deduction

In multi-chat, if you message 4 models at once, it deducts 4 credits:

```typescript
// Each model call increments the counter
await Promise.all(
  selectedChats.map(async (chat) => {
    // This calls /api/chat which calls incrementMessageCount()
    chat.append({ role: "user", content: prompt }, options);
  })
);
```

### Billing Integration (Polar)

We use Polar for subscription billing:

**1. Checkout Creation** (`app/api/create-checkout/route.ts`)

```typescript
const checkout = await polar.checkouts.create({
  product_id:
    planType === "pro" ? POLAR_PRO_PRODUCT_ID : POLAR_UNLIMITED_PRODUCT_ID,
  success_url: `${origin}/confirmation`,
  customer_email: user.email,
});
```

**2. Webhook Handling** (`app/api/webhooks/polar/route.ts`)

```typescript
// When user subscribes/cancels, Polar sends webhook
if (event.type === "subscription.created") {
  await supabase
    .from("users")
    .update({
      subscription_type: "pro", // or "unlimited"
      subscription_status: "active",
      polar_customer_id: subscription.customer_id,
    })
    .eq("id", userId);
}
```

**3. Upgrade Button Logic**
When users hit limits, the chat input shows an upgrade button:

```typescript
// app/components/chat-input/chat-input.tsx
const isOverLimit = useMemo(() => {
  if (!usage) return false;
  if (usage.subscriptionType === "unlimited") return false;
  return usage.monthlyLimit > 0 && usage.monthlyCount >= usage.monthlyLimit;
}, [usage]);

// Show crown icon instead of send arrow
{isOverLimit ? (
  <Crown className="size-4" />
) : (
  <ArrowUpIcon className="size-4" />
)}
```

## AI Model System

### Model Configuration (`lib/models/`)

Each AI provider has its own config file:

```typescript
// lib/models/data/openai.ts
export const openaiModels: ModelConfig[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    pricing: "pro",
    apiSdk: openai,
    webSearch: true,
    tags: ["reasoning", "multimodal"],
  },
  // ...
];
```

### Model Loading (`lib/models/index.ts`)

```typescript
export async function getAllModels(): Promise<ModelConfig[]> {
  const models = [
    ...openaiModels,
    ...anthropicModels,
    ...mistralModels,
    // ...
  ];

  // Add Ollama models if available
  if (process.env.NODE_ENV === "development" && !process.env.DISABLE_OLLAMA) {
    const ollamaModels = await getOllamaModels();
    models.push(...ollamaModels);
  }

  return models;
}
```

### Adding New Models

To add a new AI provider:

1. **Create model config** in `lib/models/data/your-provider.ts`
2. **Add API client** using AI SDK format
3. **Export models** in `lib/models/index.ts`
4. **Add API key** to environment variables
5. **Create provider icon** in `components/icons/`

Example:

```typescript
// lib/models/data/my-provider.ts
import { createMyProvider } from "my-ai-sdk";

const myProvider = createMyProvider({
  apiKey: process.env.MY_PROVIDER_API_KEY,
});

export const myProviderModels: ModelConfig[] = [
  {
    id: "my-model-1",
    name: "My Model 1",
    provider: "myprovider",
    pricing: "free",
    apiSdk: myProvider.chat,
    tags: ["fast", "coding"],
  },
];
```

## Tools System

### How Tools Work

Tools are external services users can access. They're defined in `lib/tools/data/index.ts`:

```typescript
export const toolsData: Tool[] = [
  {
    id: "ai-summarizer",
    name: "AI Summarizer",
    description: "Summarize long articles and documents",
    category: "text",
    pricing: "pro", // "free", "pro", or "unlimited"
    provider: "Yodoo",
    icon: "summarize",
    imageUrl: "https://...",
    tags: ["AI", "text", "productivity"],
    features: ["PDF Support", "Batch Processing"],
    website: "https://example.com",
    accessible: true, // Whether it actually works
  },
];
```

### Adding New Tools

1. **Add tool config** to `toolsData` array
2. **Set pricing tier** - determines who can access it
3. **Add tool icon** to `components/icons/`
4. **Upload tool image** to `public/tool-images/`
5. **Implement tool logic** (if `accessible: true`)

### Tool Access Control

Tools are filtered based on user subscription:

```typescript
// app/tools/page.tsx
const getToolAccessInfo = (tool: Tool) => {
  if (tool.pricing === "free") return { canAccess: true };
  if (tool.pricing === "pro" && (isPro || isUnlimited))
    return { canAccess: true };
  if (tool.pricing === "unlimited" && isUnlimited) return { canAccess: true };

  return {
    canAccess: false,
    upgradeText:
      tool.pricing === "pro" ? "Pro Plan Required" : "Unlimited Plan Required",
  };
};
```

## API Routes

### Main Chat Endpoint (`app/api/chat/route.ts`)

This is where the magic happens:

```typescript
export async function POST(req: Request) {
  const { messages, chatId, userId, model, message_group_id } =
    await req.json();

  // 1. Validate usage limits
  const supabase = await validateAndTrackUsage({
    userId,
    model,
    isAuthenticated,
  });

  // 2. Save user message (only once per message_group_id)
  if (message_group_id) {
    const existingMessages = await supabase
      .from("messages")
      .select("id")
      .eq("message_group_id", message_group_id)
      .eq("role", "user");

    if (existingMessages.length === 0) {
      await logUserMessage({ supabase, userId, chatId, content, attachments });
    }
  }

  // 3. Get AI model and generate response
  const modelConfig = allModels.find((m) => m.id === model);
  const stream = await streamText({
    model: modelConfig.apiSdk,
    messages: cleanedMessages,
    tools: enableSearch ? searchTools : undefined,
  });

  // 4. Return streaming response
  return stream.toDataStreamResponse({
    onFinish: async ({ finishReason, usage, text }) => {
      await storeAssistantMessage({ supabase, chatId, messages, model });
    },
  });
}
```

### Rate Limiting (`app/api/rate-limits/route.ts`)

Returns current usage stats:

```typescript
export async function GET(request: Request) {
  const usage = await getMessageUsage(userId, isAuthenticated);
  return Response.json({
    dailyCount: usage.dailyCount,
    monthlyCount: usage.monthlyCount,
    dailyLimit: usage.dailyLimit,
    monthlyLimit: usage.monthlyLimit,
    subscriptionType: usage.subscriptionType,
    hasApiKeys: usage.hasApiKeys,
  });
}
```

## Authentication & Security

### Supabase Auth

We use Supabase Auth with Google OAuth:

```typescript
// lib/supabase/client.ts
export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
```

### Row Level Security (RLS)

All database access is protected by RLS policies:

```sql
-- Users can only see their own chats
CREATE POLICY "Users can view their own chats" ON chats
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only see messages from their chats
CREATE POLICY "Users can view messages from their chats" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
      AND chats.user_id = auth.uid()
    )
  );
```

### API Key Encryption (BYOK)

User API keys are encrypted before storage:

```typescript
// lib/encryption.ts
export function encryptKey(key: string): { encrypted: string; iv: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(
    "aes-256-cbc",
    process.env.ENCRYPTION_KEY!
  );
  let encrypted = cipher.update(key, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { encrypted, iv: iv.toString("hex") };
}
```

### CSRF Protection

We protect against CSRF attacks:

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  if (request.method === "POST") {
    const token = request.cookies.get("csrf_token")?.value;
    const headerToken = request.headers.get("x-csrf-token");

    if (!token || token !== headerToken) {
      return new Response("CSRF token mismatch", { status: 403 });
    }
  }
}
```

## File Uploads & Attachments

### File Handling (`lib/file-handling.ts`)

```typescript
export async function processFiles(
  files: File[],
  chatId: string,
  userId: string
): Promise<Attachment[]> {
  const attachments: Attachment[] = [];

  for (const file of files) {
    // Validate file
    const validation = await validateFile(file);
    if (!validation.isValid) throw new Error(validation.error);

    // Upload to Supabase Storage
    const fileName = `${userId}/${chatId}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("chat-attachments")
      .upload(fileName, file);

    if (error) throw new Error("Upload failed");

    // Create attachment object
    attachments.push({
      name: file.name,
      contentType: file.type,
      url: getPublicUrl(data.path),
    });
  }

  return attachments;
}
```

### Storage Policies

Files are protected by storage policies:

```sql
-- Users can only upload files to their own folder
CREATE POLICY "Users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

## Prompt Suggestions

### Configuration (`lib/config.ts`)

```typescript
export const SUGGESTIONS = [
  {
    label: "Summary",
    highlight: "Summarize",
    prompt: "Summarize",
    items: [
      "Summarize the French Revolution",
      "Summarize the plot of Inception",
    ],
    icon: Notepad,
  },
  // ...
];
```

### Component (`app/components/chat-input/suggestions.tsx`)

The suggestions component handles two states:

1. **Category buttons** - shows main categories
2. **Suggestion list** - shows specific prompts when category is clicked

```typescript
const [activeCategory, setActiveCategory] = useState<string | null>(null);

// Show category buttons or suggestion list
{
  showCategorySuggestions ? suggestionsList : suggestionsGrid;
}
```

## Development Tips

### Adding Features

1. **Start with types** - Define TypeScript interfaces first
2. **Database first** - Add tables/columns before code
3. **API routes** - Create endpoints before frontend
4. **Components** - Build UI components last
5. **Test with limits** - Always test with different subscription tiers

### Debugging

**Chat Issues:**

- Check browser console for API errors
- Look at Network tab for failed requests
- Verify message_group_id is being generated
- Check Supabase logs for database errors

**Billing Issues:**

- Test with Polar's sandbox mode
- Verify webhook signatures
- Check user subscription_status in database
- Look at Polar dashboard for payment status

**Performance:**

- Use React DevTools to check re-renders
- Monitor Supabase real-time connections
- Check bundle size with `npm run build`
- Profile with Chrome DevTools

### Environment Setup

```bash
# Copy environment variables
cp .env.example .env.local

# Install dependencies
npm install

# Run database migrations
# (Run the SQL files in docs/ in your Supabase dashboard)

# Start development server
npm run dev
```

### Testing

We don't have comprehensive tests yet (PRs welcome!), but here's what to test manually:

- **Chat flow**: Send messages, verify persistence
- **Multi-chat**: Test with multiple models
- **File uploads**: Try different file types
- **Billing**: Test upgrade/downgrade flows
- **Limits**: Test hitting usage limits
- **Mobile**: Test responsive design

## Common Gotchas

1. **Message persistence**: User messages need `message_group_id` to save
2. **Multi-chat deduplication**: User messages can appear multiple times without proper filtering
3. **Billing webhooks**: Polar webhooks need proper signature verification
4. **RLS policies**: New tables need RLS policies or queries will fail
5. **API key encryption**: BYOK requires `ENCRYPTION_KEY` environment variable
6. **Ollama detection**: Only works in development by default

## Contributing

Want to contribute? Here are some areas that need work:

- **Tests**: Unit tests, integration tests, E2E tests
- **Mobile app**: React Native version
- **More AI providers**: Cohere, Replicate, etc.
- **Advanced tools**: Code execution, web browsing, etc.
- **Team features**: Shared chats, collaboration
- **Analytics**: Usage tracking, insights
- **Performance**: Caching, optimization

The codebase is pretty well organized, so dive in and start hacking! If you get stuck, check the existing patterns - there's usually a similar implementation you can learn from.
