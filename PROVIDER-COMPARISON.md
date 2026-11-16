# مقارنة مزودي خدمات جميل AI

> هذه المقارنة لا تنشئ مفاتيح ولا تشتري اشتراكات. الأسعار والحصص قابلة للتغيير ويجب إعادة التحقق منها قبل التفعيل.

## التصنيف العملي

- **محلي مجاني من ناحية رسوم API:** يمكن تشغيل البرنامج والنموذج دون مفتاح أو فاتورة مزود، مع بقاء تكلفة الجهاز أو GPU والتخزين.
- **يحتاج مفتاحاً:** خدمة سحابية تتطلب مفتاح API أو حساباً.
- **مدفوع:** يحتاج رصيداً أو اشتراكاً للاستخدام الإنتاجي، حتى إن وُجدت حصة تجريبية.
- **تجريبي:** يمكن اختباره ضمن حدود مجانية، لكن لا يصلح إعلانُه خدمة إنتاجية مجانية بلا قيود.

| الأداة | المزود الرئيسي | الحالة المالية | البديل الأقل تكلفة | القرار المقترح |
|---|---|---|---|---|
| TTS | Google Cloud Text-to-Speech | حصة مجانية حتى 4 ملايين حرف شهرياً لبعض النماذج، لكن Billing مطلوب وتُحاسب الزيادة | Piper محلي | ابدأ بـPiper بعد فحص الأصوات العربية والتراخيص؛ استخدم Google فقط بعد موافقة المالك على Billing. |
| استنساخ الصوت وتصميمه | ElevenLabs | الخطة المجانية تشمل Voice Design، لكن Instant/Professional Voice Cloning مرتبطان بخطط مدفوعة | Soundbox محلي | لا نفعّل الاستنساخ السحابي قبل الموافقة والموافقة الصريحة لصاحب الصوت. |
| مكتبة الأصوات | ElevenLabs | الوصول البرمجي لأصوات المكتبة غير متاح لمستخدمي الخطة المجانية حسب التوثيق | Piper وأصوات مرخصة محلياً | نبني مكتبة أصوات داخلية مرخصة بدلاً من ادعاء مكتبة سحابية مجانية. |
| المؤثرات الصوتية | ElevenLabs | توجد حصة مجانية، وAPI مدفوع حسب الاستخدام؛ البديل Stable Audio API مدفوع أيضاً | Stable Audio 3 Small-SFX محلي | يمكن تنفيذ واجهة الحفظ والتشغيل، لكن التوليد يحتاج نموذجاً محلياً وموارد مناسبة. |
| فصل المسارات | AudioShake | أرصدة تجريبية محدودة ثم دفع حسب الدقيقة والنموذج | Demucs محلي | Demucs هو الخيار الأول عند توفر عامل Python/GPU؛ لا نعلن AudioShake مجانياً للإنتاج. |
| الكتب الصوتية والحوار | ElevenLabs | حصة مجانية للتجربة، والاستخدام التجاري يتطلب خطة مدفوعة | Kokoro-82M محلي | يمكن تركيب الحوار محلياً من مقاطع متعددة، مع فحص الأصوات والترخيص. |
| النص إلى فيديو | Runway Dev | API مدفوع ولا يوجد دليل رسمي على رصيد مجاني دائم | Wan2.1 محلي أو fal.ai مدفوع منخفض التكلفة | لا نفعّل زر الإنتاج قبل توفير GPU محلي أو موافقة على مزود مدفوع. |
| الصورة إلى فيديو | Runway Dev | API مدفوع حسب الثانية | Wan2.2 محلي | يحتاج Wan2.2 إلى عتاد قوي، لذلك تبقى الأداة متوقفة في المعاينة الحالية. |
| إنشاء الفيديو والتحرير | Runway Dev | مدفوع حسب الاستخدام | LTX Desktop/LTX-2 محلي | مناسب لاحقاً عند توفير GPU؛ لا نعرضه كخدمة مجانية حالياً. |
| الدبلجة | ElevenLabs Dubbing | الخطة المجانية محدودة وبعلامة مائية، والإنتاج يبدأ بتكلفة لكل دقيقة | Softcatala Open Dubbing محلي | بديل تجريبي محلي، يحتاج نماذج وترخيصاً وإعداداً؛ لا نعلن جاهزيته التجارية. |
| مزامنة الشفاه | Sync Labs | تجربة محدودة: 3 عمليات شهرياً و15 ثانية للعملية، ثم دفع | Wav2Lip محلي | Wav2Lip مقيد للاستخدام غير التجاري حسب مستودعه؛ لا يصلح للإنتاج التجاري دون ترخيص. |
| STT | Deepgram | رصيد تجريبي معلن 200 دولار ثم دفع حسب الدقيقة | Whisper محلي | مسار STT الموجود حالياً يستخدم خدمة Speech الداخلية، ويمكن استبداله بعامل Whisper محلي لاحقاً. |
| تنقية الصوت | Auphonic | ساعتان مجاناً شهرياً مع قيود؛ خدمة سحابية | DeepFilterNet أو FFmpeg محلي | تنقية FFmpeg المحلية هي الوظيفة المجانية التي تم تشغيلها واختبارها في المشروع. |

## المصادر الرسمية

- [Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech) و[التسعير](https://cloud.google.com/text-to-speech/pricing)
- [ElevenLabs Pricing](https://elevenlabs.io/pricing)، [Voice Cloning](https://elevenlabs.io/docs/eleven-api/concepts/voice-cloning)، [Voice Library](https://elevenlabs.io/docs/eleven-creative/voices/voice-library)، [Dubbing](https://elevenlabs.io/dubbing-api)
- [Piper](https://github.com/OHF-Voice/piper1-gpl)، [Soundbox](https://github.com/HamSanders/soundbox)، [Kokoro](https://github.com/hexgrad/kokoro)
- [Stable Audio 3](https://github.com/Stability-AI/stable-audio-3)
- [AudioShake](https://developer.audioshake.ai/)، [Demucs](https://github.com/facebookresearch/demucs)
- [Runway Dev Pricing](https://docs.dev.runwayml.com/guides/pricing/)، [Wan2.1](https://github.com/Wan-Video/Wan2.1)، [Wan2.2](https://github.com/Wan-Video/Wan2.2)
- [LTX Desktop](https://github.com/Lightricks/LTX-Desktop)، [LTX-2](https://github.com/Lightricks/LTX-2)
- [Open Dubbing](https://github.com/softcatala/open-dubbing)، [Sync Labs](https://sync.so/pricing)، [Wav2Lip](https://github.com/Rudrabha/Wav2Lip)
- [Deepgram Pricing](https://deepgram.com/pricing)، [Whisper](https://github.com/openai/whisper)
- [Auphonic Pricing](https://auphonic.com/pricing/)، [DeepFilterNet](https://github.com/Rikorose/DeepFilterNet)

## سياسة التفعيل

لن تُضاف مفاتيح API إلى الواجهة الأمامية أو المستودع. عند اختيار مزود سحابي، سيُضاف المزود في إعدادات الخادم مع حالة `disabled` افتراضياً، وحقل مفتاح مشفر، وفحص اتصال، وسقف إنفاق. لن تظهر الأداة كـ«مكتملة» إلا بعد اختبار إنتاجي حقيقي وحفظ النتيجة في التخزين وسجل العمليات.
