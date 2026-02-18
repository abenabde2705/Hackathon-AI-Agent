# Services JumpBoard

## Services Disponibles

| Service | Path | Description |
|---------|------|-------------|
| Jumpy | `lib/services/jumpy.ts` | Assistant IA HR |
| WhatsApp | `lib/services/whatsapp.ts` | Envoi de messages |
| Twilio | `lib/services/twilio.ts` | Client Twilio |

## Jumpy (AI Assistant)

### Web Platform
```typescript
import { streamJumpyResponse, searchHRDocumentation } from '@/lib/services/jumpy'

// Recherche dans la doc HR
const relevantDocs = await searchHRDocumentation(query)

// Stream la réponse
const stream = await streamJumpyResponse(messages, context)
```

### API Endpoint
```
POST /api/jumpy/chat
Content-Type: application/json

{
  "messages": [{ "role": "user", "content": "..." }],
  "conversationId": "uuid" // optionnel
}

Response: ReadableStream (SSE)
```

### WhatsApp Jumpy
Via Edge Function `supabase/functions/whatsapp-webhook/index.ts`
- Conversation memory (5 derniers messages)
- Suggestions automatiques
- Commande: `jumpy [question]`

## WhatsApp Service

```typescript
import {
  sendWelcomeMessage,
  sendOnboardingProgressMessage,
  sendTicketUpdateMessage,
  sendEventReminderMessage
} from '@/lib/services/whatsapp'

// Envoi message de bienvenue
await sendWelcomeMessage('+33612345678', 'Jean Dupont', 'Camping Les Pins')

// Mise à jour onboarding
await sendOnboardingProgressMessage('+33612345678', 'Jean', 75)

// Update ticket
await sendTicketUpdateMessage('+33612345678', 'TICK-123', 'resolved', 'Résolu par...')
```

## WhatsApp Commands (Edge Function)

| Commande | Action |
|----------|--------|
| `jumpy [question]` | Question à l'IA |
| `jumpy historique` | Voir les 5 dernières questions |
| `ticket [desc]` | Créer un ticket |
| `tickets` | Lister les tickets (manager) |
| `#<id>` | Ouvrir un ticket |
| `progression` | Voir la progression onboarding |
| `faq` / `aide` / `?` | Aide |

## HR Documentation

```typescript
// lib/data/hr-documentation.ts
interface HRDocument {
  id: string
  title: string
  category: string
  keywords: string[]
  content: string
}

// Catégories disponibles
- 'contrat'
- 'conges'
- 'salaire'
- 'securite'
- 'formation'
- ...
```

## Environment Variables

```env
# Groq (Jumpy AI)
GROQ_API_KEY=gsk_...

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## Edge Functions

Les Edge Functions sont dans `supabase/functions/` :

```
functions/
└── whatsapp-webhook/
    ├── index.ts      # Handler principal
    └── hr-docs.ts    # Documentation HR (copie simplifiée)
```

Déploiement :
```bash
supabase functions deploy whatsapp-webhook
```
