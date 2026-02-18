# Services Alumni

## Services IA (Prévisionnels)

Le projet Alumni intègre des capacités d'IA pour améliorer l'expérience utilisateur, notamment via l'API Groq (Llama 3).

| Service | Description | Path (Prévu) |
|---------|-------------|--------------|
| `ProfileOptimizer` | Analyse et suggère des améliorations pour le profil Alumni | `lib/services/ai/profile.ts` |
| `JobMatcher` | Recommande des offres d'emploi en fonction du profil | `lib/services/ai/matcher.ts` |
| `AlumniAssistant` | Assistant conversationnel pour répondre aux questions sur le réseau | `lib/services/ai/assistant.ts` |

## Intégration IA

### Configuration Groq
L'IA utilise le modèle `llama-3.1-8b-instant` via Groq pour des réponses rapides et précises.

```typescript
// Exemple d'appel service (prévisionnel)
import { generateProfileSuggestions } from '@/lib/services/ai/profile'

const suggestions = await generateProfileSuggestions(profileData)
```

## Variables d'Environnement

```env
# Groq API (AI Services)
GROQ_API_KEY=gsk_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Services Externes (À venir)

- **Emails Transactionnels** : Resend (pour les invitations et notifications).
- **Stockage Images** : Supabase Storage (pour les avatars et photos d'événements).
