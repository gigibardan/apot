# 🤖 AI FEATURES - GHID DE UTILIZARE

## Pentru Utilizatori

### 1. AI Travel Chatbot

**Cum accesezi:**
- Click pe iconița 💬 floating din colțul dreapta-jos
- Disponibil pe toate paginile

**Ce poți întreba:**
```
✅ "Recomandă-mi obiective în Transilvania"
✅ "Ce pot vizita 3 zile în Cluj?"
✅ "Cele mai frumoase castele din România"
✅ "Activități adventure în Carpați"
✅ "Cum ajung la Castelul Bran?"
```

**Features:**
- Răspunsuri instant în română
- Context despre platforma ExplorăLumea
- Sugestii personalizate
- Linkuri către obiective reale

**Limitate:**
- Gratuit în limita tier-ului Lovable AI
- Rate limiting la cereri excesive
- Nu salvează conversația (deocamdată)

---

## Pentru Admini

### 2. AI Content Helper

**Unde îl găsești:**
- În form-urile de obiective
- În form-urile de articole blog
- Sidebar în dreapta

**Cum îl folosești:**
1. Completează Title și Description
2. Click "Analizează cu AI"
3. Primești sugestii automate:
   - 📌 Taguri relevante
   - 🔍 Keywords SEO
   - ✍️ Meta Description optimizată
   - 📊 Quality Score
   - 💡 Sugestii îmbunătățire

**Apply suggestions:**
- Click "Aplică" lângă fiecare secțiune
- Sau copy-paste manual
- Review și editează după nevoie

**Best Practices:**
- Folosește AI ca punct de start
- Review întotdeauna sugestiile
- Ajustează pentru ton și stil
- Completează cu informații locale

---

### 3. AI Image Analysis

**Funcționalitate:**
- Analizează imagini uploaded
- Detectează: castele, munți, biserici, etc.
- Sugerează categorii turistice
- Quality score pentru featured image

**Integrare:**
- Auto-trigger după upload (coming soon)
- Manual în ImageUpload component
- Display în image library

**Output:**
```json
{
  "detected": ["castel", "arhitectură gotică"],
  "suggested_types": ["monument", "istoric"],
  "quality_score": 92,
  "description": "Castel medieval pe munte",
  "is_suitable": true
}
```

---

## 🛠️ TECHNICAL DETAILS

### Edge Functions

**ai-chatbot** (Public)
- Endpoint: `/functions/v1/ai-chatbot`
- Model: `google/gemini-2.5-flash`
- Auth: No (verify_jwt = false)
- Streaming: Yes

**analyze-content** (Protected)
- Endpoint: `/functions/v1/analyze-content`
- Model: `google/gemini-2.5-flash`
- Auth: Yes (verify_jwt = true)
- Output: JSON analysis

**analyze-image** (Protected)
- Endpoint: `/functions/v1/analyze-image`
- Model: `google/gemini-2.5-pro` (vision)
- Auth: Yes (verify_jwt = true)
- Output: JSON analysis

### Models Used

**google/gemini-2.5-flash:**
- Use case: Chatbot, content analysis
- Speed: Fast
- Cost: Low
- Quality: Excellent pentru majoritatea tasks

**google/gemini-2.5-pro:**
- Use case: Image analysis (vision support)
- Speed: Medium
- Cost: Higher
- Quality: Top-tier pentru visual analysis

---

## 💰 COST & LIMITS

**Free Tier:**
- Included în Lovable Cloud
- Limited requests/month
- See Settings → Workspace → Usage

**Rate Limits:**
- 429 error = Too many requests
- 402 error = Credits exhausted
- Auto-handled cu friendly messages

**Top-Up:**
- Settings → Workspace → Usage
- Add credits când needed
- Cost tracking în dashboard

---

## 🚀 FUTURE ENHANCEMENTS

### Phase 2 (Optional):
- [ ] Persistent chat history (database)
- [ ] User preference learning
- [ ] Semantic search cu embeddings
- [ ] AI moderation automation
- [ ] Multi-language support
- [ ] Voice interface
- [ ] Image generation

---

## 🐛 TROUBLESHOOTING

**Chatbot nu răspunde:**
- Check console pentru errors
- Verifică LOVABLE_API_KEY în secrets
- Check rate limits în Lovable dashboard

**Analysis timeout:**
- Reduce content length
- Try again în câteva secunde
- Check edge function logs

**Quality score low:**
- Add more details în description
- Include GPS, hours, contact info
- Add multiple photos
- Complete all fields

---

## 📊 ANALYTICS

**Track usage:**
- Requests per user
- Popular queries
- Analysis success rate
- Cost per feature

**View în:**
- Lovable Dashboard → Usage
- Admin → Analytics (coming soon)

---

**STATUS: ✅ AI LAYER FUNCTIONAL**

Platforma are acum capabilități AI avansate! 🎉
