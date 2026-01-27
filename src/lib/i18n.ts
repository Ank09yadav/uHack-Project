import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "nav.home": "Home",
            "nav.learn": "Learn",
            "nav.dashboard": "Dashboard",
            "nav.settings": "Settings",
            "nav.community": "Community",
            "nav.teacher": "Teacher",

            "home.title": "AI-Powered Inclusive Education",
            "home.subtitle": "Making learning accessible, personalized, and usable for students with diverse learning needs",
            "home.getStarted": "Get Started",
            "home.learnMore": "Learn More",
            "home.exploreLibrary": "Explore Library",

            "features.stt.title": "Speech-to-Text",
            "features.stt.description": "Convert your voice to text instantly with our advanced speech recognition",
            "features.tts.title": "Text-to-Speech",
            "features.tts.description": "Listen to any content read aloud with natural-sounding voices",
            "features.ai.title": "AI Adaptation",
            "features.ai.description": "Content automatically adjusts to your learning pace and style",
            "features.voice.title": "Voice Assistant",
            "features.voice.description": "Complete voice control for hands-free learning",
            "features.disability.title": "Disability Detection",
            "features.disability.description": "Early detection of learning difficulties with AI",

            "learn.modules": "Learning Modules",
            "learn.start": "Start Learning",
            "learn.continue": "Continue",
            "learn.completed": "Completed",
            "learn.inProgress": "In Progress",
            "learn.notStarted": "Not Started",

            "dashboard.welcome": "Welcome back",
            "dashboard.progress": "Your Progress",
            "dashboard.achievements": "Achievements",
            "dashboard.streak": "Learning Streak",
            "dashboard.focusScore": "Focus Score",
            "dashboard.needsAttention": "Needs Attention",

            "voice.listening": "Listening... Speak now",
            "voice.clickToStart": "Click mic to start speaking",
            "voice.speakToType": "Speak to type...",
            "voice.startSpeaking": "Start Speaking",
            "voice.stopListening": "Stop Listening",
            "voice.readAloud": "Read Aloud",
            "voice.submit": "Submit",
            "voice.clear": "Clear",
            "voice.commands": "Voice Commands",
            "voice.help": "Say 'help' for commands",

            "common.loading": "Loading...",
            "common.save": "Save",
            "common.cancel": "Cancel",
            "common.delete": "Delete",
            "common.edit": "Edit",
            "common.close": "Close",
            "common.next": "Next",
            "common.previous": "Previous",
            "common.submit": "Submit",
            "common.search": "Search",

            "accessibility.highContrast": "High Contrast",
            "accessibility.highContrastDesc": "Enhanced visibility with high contrast colors",
            "accessibility.largeText": "Large Text",
            "accessibility.screenReader": "Screen Reader",
            "accessibility.signLanguage": "Sign Language",
            "accessibility.captions": "Captions",
            "accessibility.default": "Default",
            "accessibility.defaultDesc": "Standard reading experience",
            "accessibility.dyslexia": "Dyslexia Friendly",
            "accessibility.dyslexiaDesc": "OpenDyslexic font, increased spacing",
            "accessibility.calm": "Calm Mode",
            "accessibility.calmDesc": "Reduced animations, soothing colors"
        }
    },
    hi: {
        translation: {
            "nav.home": "होम",
            "nav.learn": "सीखें",
            "nav.dashboard": "डैशबोर्ड",
            "nav.settings": "सेटिंग्स",
            "nav.community": "समुदाय",
            "nav.teacher": "शिक्षक",

            "home.title": "AI-संचालित समावेशी शिक्षा",
            "home.subtitle": "विविध सीखने की जरूरतों वाले छात्रों के लिए सीखने को सुलभ, व्यक्तिगत और उपयोगी बनाना",
            "home.getStarted": "शुरू करें",
            "home.learnMore": "और जानें",
            "home.exploreLibrary": "पुस्तकालय देखें",

            "features.stt.title": "वाक्-से-पाठ",
            "features.stt.description": "हमारी उन्नत वाक् पहचान के साथ अपनी आवाज़ को तुरंत पाठ में बदलें",
            "features.tts.title": "पाठ-से-वाक्",
            "features.tts.description": "प्राकृतिक आवाज़ों के साथ किसी भी सामग्री को ज़ोर से पढ़ें",
            "features.ai.title": "AI अनुकूलन",
            "features.ai.description": "सामग्री स्वचालित रूप से आपकी सीखने की गति और शैली के अनुसार समायोजित होती है",
            "features.voice.title": "वॉयस असिस्टेंट",
            "features.voice.description": "हैंड्स-फ्री सीखने के लिए पूर्ण वॉयस नियंत्रण",
            "features.disability.title": "विकलांगता पहचान",
            "features.disability.description": "AI के साथ सीखने की कठिनाइयों का शीघ्र पता लगाना",

            "learn.modules": "सीखने के मॉड्यूल",
            "learn.start": "सीखना शुरू करें",
            "learn.continue": "जारी रखें",
            "learn.completed": "पूर्ण",
            "learn.inProgress": "प्रगति में",
            "learn.notStarted": "शुरू नहीं हुआ",

            "dashboard.welcome": "वापसी पर स्वागत है",
            "dashboard.progress": "आपकी प्रगति",
            "dashboard.achievements": "उपलब्धियां",
            "dashboard.streak": "सीखने की लकीर",
            "dashboard.focusScore": "फोकस स्कोर",
            "dashboard.needsAttention": "ध्यान चाहिए",

            "voice.listening": "सुन रहा है... अब बोलें",
            "voice.clickToStart": "बोलना शुरू करने के लिए माइक पर क्लिक करें",
            "voice.speakToType": "टाइप करने के लिए बोलें...",
            "voice.startSpeaking": "बोलना शुरू करें",
            "voice.stopListening": "सुनना बंद करें",
            "voice.readAloud": "ज़ोर से पढ़ें",
            "voice.submit": "जमा करें",
            "voice.clear": "साफ़ करें",
            "voice.commands": "वॉयस कमांड",
            "voice.help": "कमांड के लिए 'help' कहें",

            "common.loading": "लोड हो रहा है...",
            "common.save": "सहेजें",
            "common.cancel": "रद्द करें",
            "common.delete": "हटाएं",
            "common.edit": "संपादित करें",
            "common.close": "बंद करें",
            "common.next": "अगला",
            "common.previous": "पिछला",
            "common.submit": "जमा करें",
            "common.search": "खोजें",

            "accessibility.highContrast": "उच्च कंट्रास्ट",
            "accessibility.highContrastDesc": "उच्च कंट्रास्ट रंगों के साथ उन्नत दृश्यता",
            "accessibility.largeText": "बड़ा पाठ",
            "accessibility.screenReader": "स्क्रीन रीडर",
            "accessibility.signLanguage": "सांकेतिक भाषा",
            "accessibility.captions": "कैप्शन",
            "accessibility.default": "डिफ़ॉल्ट",
            "accessibility.defaultDesc": "मानक पढ़ने का अनुभव",
            "accessibility.dyslexia": "डिस्लेक्सिया फ्रेंडली",
            "accessibility.dyslexiaDesc": "ओपनडिस्लेक्सिक फॉन्ट, बढ़ा हुआ अंतराल",
            "accessibility.calm": "शांत मोड",
            "accessibility.calmDesc": "कम एनिमेशन, सुखदायक रंग"
        }
    },
    es: {
        translation: {
            "nav.home": "Inicio",
            "nav.learn": "Aprender",
            "nav.dashboard": "Panel",
            "nav.settings": "Configuración",
            "nav.community": "Comunidad",
            "nav.teacher": "Profesor",

            "home.title": "Educación Inclusiva Impulsada por IA",
            "home.subtitle": "Haciendo el aprendizaje accesible, personalizado y utilizable para estudiantes con diversas necesidades",
            "home.getStarted": "Comenzar",
            "home.learnMore": "Saber Más",
            "home.exploreLibrary": "Explorar Biblioteca",

            "features.stt.title": "Voz a Texto",
            "features.stt.description": "Convierte tu voz en texto instantáneamente",
            "features.tts.title": "Texto a Voz",
            "features.tts.description": "Escucha cualquier contenido leído en voz alta",
            "features.ai.title": "Adaptación IA",
            "features.ai.description": "El contenido se ajusta automáticamente a tu ritmo",
            "features.voice.title": "Asistente de Voz",
            "features.voice.description": "Control de voz completo para aprendizaje sin manos",
            "features.disability.title": "Detección de Discapacidad",
            "features.disability.description": "Detección temprana de dificultades de aprendizaje con IA",

            "learn.modules": "Módulos de Aprendizaje",
            "learn.start": "Comenzar a Aprender",
            "learn.continue": "Continuar",
            "learn.completed": "Completado",
            "learn.inProgress": "En Progreso",
            "learn.notStarted": "No Iniciado",

            "dashboard.welcome": "Bienvenido de nuevo",
            "dashboard.progress": "Tu Progreso",
            "dashboard.achievements": "Logros",
            "dashboard.streak": "Racha de Aprendizaje",
            "dashboard.focusScore": "Puntuación de Enfoque",
            "dashboard.needsAttention": "Necesita Atención",

            "voice.listening": "Escuchando... Habla ahora",
            "voice.clickToStart": "Haz clic en el micrófono para empezar a hablar",
            "voice.speakToType": "Habla para escribir...",
            "voice.startSpeaking": "Empezar a Hablar",
            "voice.stopListening": "Dejar de Escuchar",
            "voice.readAloud": "Leer en Voz Alta",
            "voice.submit": "Enviar",
            "voice.clear": "Limpiar",
            "voice.commands": "Comandos de Voz",
            "voice.help": "Di 'ayuda' para comandos",

            "common.loading": "Cargando...",
            "common.save": "Guardar",
            "common.cancel": "Cancelar",
            "common.delete": "Eliminar",
            "common.edit": "Editar",
            "common.close": "Cerrar",
            "common.next": "Siguiente",
            "common.previous": "Anterior",
            "common.submit": "Enviar",
            "common.search": "Buscar",

            "accessibility.highContrast": "Alto Contraste",
            "accessibility.largeText": "Texto Grande",
            "accessibility.screenReader": "Lector de Pantalla",
            "accessibility.signLanguage": "Lenguaje de Señas",
            "accessibility.captions": "Subtítulos"
        }
    },
    fr: {
        translation: {
            "nav.home": "Accueil",
            "nav.learn": "Apprendre",
            "nav.dashboard": "Tableau de bord",
            "nav.settings": "Paramètres",
            "nav.community": "Communauté",
            "nav.teacher": "Enseignant",

            "home.title": "Éducation Inclusive Alimentée par l'IA",
            "home.subtitle": "Rendre l'apprentissage accessible, personnalisé et utilisable",
            "home.getStarted": "Commencer",
            "home.learnMore": "En Savoir Plus",
            "home.exploreLibrary": "Explorer la Bibliothèque",

            "features.stt.title": "Parole en Texte",
            "features.stt.description": "Convertissez votre voix en texte instantanément",
            "features.tts.title": "Texte en Parole",
            "features.tts.description": "Écoutez n'importe quel contenu lu à haute voix",
            "features.ai.title": "Adaptation IA",
            "features.ai.description": "Le contenu s'adapte automatiquement à votre rythme",
            "features.voice.title": "Assistant Vocal",
            "features.voice.description": "Contrôle vocal complet pour l'apprentissage mains libres",
            "features.disability.title": "Détection de Handicap",
            "features.disability.description": "Détection précoce des difficultés d'apprentissage avec l'IA",

            "learn.modules": "Modules d'Apprentissage",
            "learn.start": "Commencer à Apprendre",
            "learn.continue": "Continuer",
            "learn.completed": "Terminé",
            "learn.inProgress": "En Cours",
            "learn.notStarted": "Pas Commencé",

            "dashboard.welcome": "Bon retour",
            "dashboard.progress": "Votre Progrès",
            "dashboard.achievements": "Réalisations",
            "dashboard.streak": "Série d'Apprentissage",
            "dashboard.focusScore": "Score de Concentration",
            "dashboard.needsAttention": "Nécessite Attention",

            "voice.listening": "Écoute... Parlez maintenant",
            "voice.clickToStart": "Cliquez sur le micro pour commencer à parler",
            "voice.speakToType": "Parlez pour taper...",
            "voice.startSpeaking": "Commencer à Parler",
            "voice.stopListening": "Arrêter d'Écouter",
            "voice.readAloud": "Lire à Haute Voix",
            "voice.submit": "Soumettre",
            "voice.clear": "Effacer",
            "voice.commands": "Commandes Vocales",
            "voice.help": "Dites 'aide' pour les commandes",

            "common.loading": "Chargement...",
            "common.save": "Enregistrer",
            "common.cancel": "Annuler",
            "common.delete": "Supprimer",
            "common.edit": "Modifier",
            "common.close": "Fermer",
            "common.next": "Suivant",
            "common.previous": "Précédent",
            "common.submit": "Soumettre",
            "common.search": "Rechercher",

            "accessibility.highContrast": "Contraste Élevé",
            "accessibility.largeText": "Texte Large",
            "accessibility.screenReader": "Lecteur d'Écran",
            "accessibility.signLanguage": "Langue des Signes",
            "accessibility.captions": "Sous-titres"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: typeof window !== 'undefined'
            ? localStorage.getItem('preferredLanguage') || 'en'
            : 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        },
        react: {
            useSuspense: false
        }
    });

export default i18n;
