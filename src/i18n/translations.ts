// ─── CreativeNode Translation Strings ─────────────────────────────────────────
// Supported languages: 'en' (English) | 'hi' (Hindi)

export type Lang = 'en' | 'hi';

export const translations = {
  en: {
    // ── Navbar ──────────────────────────────────────────────────────────────
    nav_home: 'Home',
    nav_portfolio: 'Portfolio',
    nav_atelier: 'Atelier',
    nav_services: 'Services',
    nav_investment: 'Investment',
    nav_signin: 'Sign In',
    nav_get_started: 'Get Started',
    nav_logout: 'Logout',

    // ── Language Switcher ───────────────────────────────────────────────────
    lang_toggle_label: 'हिं',   // Show Hindi option when current is English

    // ── Hero Section ────────────────────────────────────────────────────────
    hero_badge: 'Exquisite Visual Dominance Est. 2026',
    hero_headline_1: 'Bespoke Poster',
    hero_headline_2: 'Artwork Specialists',
    hero_body: 'CreativeNode merges elite Swiss modernist structure with cinematic deep noir aesthetics. We sculpt visual campaigns for premium athletic brands, high fashion houses, and corporate directors globally.',
    hero_stat_1_label: 'Posters Delivered',
    hero_stat_2_label: 'On-Time SLA',
    hero_stat_3_label: 'Available Turnaround',
    hero_cta_primary: 'Configure Live Canvas',
    hero_cta_secondary: 'Explore Portfolio',

    // ── Auth Portal ─────────────────────────────────────────────────────────
    auth_login_tab: 'Sign In',
    auth_signup_tab: 'Create Account',
    auth_forgot_tab: 'Forgot Password',
    auth_email_label: 'Email Address',
    auth_password_label: 'Password',
    auth_name_label: 'Display Name',
    auth_login_btn: 'Authenticate',
    auth_signup_btn: 'Create Account',
    auth_google_btn: 'Continue with Google',
    auth_forgot_link: 'Forgot password?',
    auth_no_account: "Don't have an account?",
    auth_have_account: 'Already have an account?',
    auth_reset_btn: 'Send Reset Link',
    auth_success_login: 'Successfully authenticated! Welcome back.',
    auth_success_signup: 'Account provisioned successfully!',
    auth_success_google: 'Successfully authenticated with Google!',
    auth_error_short_pass: 'Password must be at least 6 characters.',
    auth_error_generic: 'Authentication failed. Verify credentials.',

    // ── Profile Page ─────────────────────────────────────────────────────────
    profile_title: 'Client Profile Workbench',
    profile_subtitle: 'Configure system themes, manage active subscription license thresholds, and review bookmarked custom lookbooks directly.',
    profile_registered: 'REGISTERED ACCOUNT',
    profile_license: 'License Credentials',
    profile_tier_free: 'Arambam Plan',
    profile_tier_pro: 'Thozhil Plan',
    profile_tier_sovereign: 'Mudalvar Plan',
    profile_tier_section_title: 'Subscription License',
    profile_admin_desc: 'Super Admin: Assign account tiers directly. Changes take effect immediately.',
    profile_user_desc: 'Your current subscription plan. Contact the admin to upgrade your license tier.',
    profile_admin_banner: 'Super Admin Controls — Tier Assignment Active',
    profile_quota_label: 'Daily Atelier Quota Status',
    profile_quota_free: 'Arambam plan: 2 designs per day. Upgrade to Thozhil for more credits.',
    profile_quota_pro: 'Thozhil plan active — 5 designs per day, full portfolio and export access.',
    profile_quota_sovereign: 'Mudalvar plan active (Lifetime). No limits — unlimited design freedom!',
    profile_your_plan: 'Your Plan',
    profile_admin_only: 'Admin Only',
    profile_request_upgrade: 'Request Upgrade →',
    profile_contact_admin: 'Contact Admin',
    profile_disconnect: 'Disconnect Account',
    profile_launch_crm: 'Launch CRM Workspace',

    // ── Tier Cards (User View) ────────────────────────────────────────────────
    tier_free_label: 'Arambam — Free Plan',
    tier_free_quota: '2 designs / day',
    tier_free_desc: 'Perfect for newcomers. Browse the portfolio and use the basic design studio for free.',
    tier_free_price: 'Free',
    tier_free_f1: '2 AI designs per day',
    tier_free_f2: 'Portfolio browser access',
    tier_free_f3: 'Basic Atelier studio',

    tier_pro_label: 'Thozhil — Business Plan',
    tier_pro_quota: '5 designs / day',
    tier_pro_desc: 'For freelancers and small businesses. More credits, premium lookbooks and export history.',
    tier_pro_price: '₹4,999 one-time',
    tier_pro_f1: '5 AI designs per day',
    tier_pro_f2: 'Full portfolio library',
    tier_pro_f3: 'Export gallery & history',
    tier_pro_f4: 'Priority support',

    tier_sov_label: 'Mudalvar — Unlimited Plan',
    tier_sov_quota: 'Unlimited',
    tier_sov_desc: 'No limits whatsoever. Full platform access granted exclusively by the admin.',
    tier_sov_price: 'Admin Grant Only',
    tier_sov_f1: 'Unlimited AI designs',
    tier_sov_f2: 'All Thozhil features',
    tier_sov_f3: 'CRM workspace access',
    tier_sov_f4: 'Direct admin channel',
    tier_sov_f5: 'Lifetime license',

    // ── Admin Tier Switcher ───────────────────────────────────────────────────
    admin_tier_free_label: 'Arambam (Free)',
    admin_tier_free_desc: 'Start your journey — basic access for newcomers',
    admin_tier_free_price: 'Free',
    admin_tier_pro_label: 'Thozhil (Pro)',
    admin_tier_pro_desc: 'Business-level branding access — one-time lifetime license',
    admin_tier_pro_price: '₹4,999 one-time',
    admin_tier_sov_label: 'Mudalvar — Unlimited Plan',
    admin_tier_sov_desc: 'Full freedom — lifetime unlimited exports, Admin only',
    admin_tier_sov_price: 'Admin Grant',
  },

  hi: {
    // ── Navbar ──────────────────────────────────────────────────────────────
    nav_home: 'होम',
    nav_portfolio: 'पोर्टफोलियो',
    nav_atelier: 'एटेलियर',
    nav_services: 'सेवाएं',
    nav_investment: 'निवेश',
    nav_signin: 'साइन इन',
    nav_get_started: 'शुरू करें',
    nav_logout: 'लॉग आउट',

    // ── Language Switcher ───────────────────────────────────────────────────
    lang_toggle_label: 'EN',   // Show English option when current is Hindi

    // ── Hero Section ────────────────────────────────────────────────────────
    hero_badge: 'विशिष्ट दृश्य डिज़ाइन — 2026 से',
    hero_headline_1: 'बेस्पोक पोस्टर',
    hero_headline_2: 'आर्टवर्क विशेषज्ञ',
    hero_body: 'CreativeNode एलीट स्विस मॉडर्निस्ट संरचना और सिनेमाई नोयर सौंदर्यशास्त्र को जोड़ता है। हम प्रीमियम ब्रांड, फैशन हाउस और कॉर्पोरेट निदेशकों के लिए दृश्य अभियान बनाते हैं।',
    hero_stat_1_label: 'पोस्टर डिलीवर',
    hero_stat_2_label: 'समय पर SLA',
    hero_stat_3_label: 'उपलब्ध टर्नअराउंड',
    hero_cta_primary: 'लाइव कैनवास बनाएं',
    hero_cta_secondary: 'पोर्टफोलियो देखें',

    // ── Auth Portal ─────────────────────────────────────────────────────────
    auth_login_tab: 'साइन इन',
    auth_signup_tab: 'खाता बनाएं',
    auth_forgot_tab: 'पासवर्ड भूल गए',
    auth_email_label: 'ईमेल पता',
    auth_password_label: 'पासवर्ड',
    auth_name_label: 'प्रदर्शन नाम',
    auth_login_btn: 'प्रमाणित करें',
    auth_signup_btn: 'खाता बनाएं',
    auth_google_btn: 'Google से जारी रखें',
    auth_forgot_link: 'पासवर्ड भूल गए?',
    auth_no_account: 'खाता नहीं है?',
    auth_have_account: 'पहले से खाता है?',
    auth_reset_btn: 'रीसेट लिंक भेजें',
    auth_success_login: 'सफलतापूर्वक प्रमाणित! वापस स्वागत है।',
    auth_success_signup: 'खाता सफलतापूर्वक बनाया गया!',
    auth_success_google: 'Google से सफलतापूर्वक लॉगिन हुआ!',
    auth_error_short_pass: 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए।',
    auth_error_generic: 'प्रमाणीकरण विफल। कृपया क्रेडेंशियल जांचें।',

    // ── Profile Page ─────────────────────────────────────────────────────────
    profile_title: 'क्लाइंट प्रोफाइल वर्कबेंच',
    profile_subtitle: 'सिस्टम थीम कॉन्फ़िगर करें, सदस्यता प्रबंधित करें, और बुकमार्क किए गए लुकबुक देखें।',
    profile_registered: 'पंजीकृत खाता',
    profile_license: 'लाइसेंस क्रेडेंशियल',
    profile_tier_free: 'आरंभम प्लान',
    profile_tier_pro: 'तोझिल प्लान',
    profile_tier_sovereign: 'मुदलवार प्लान',
    profile_tier_section_title: 'सदस्यता लाइसेंस',
    profile_admin_desc: 'सुपर एडमिन: टियर सीधे असाइन करें। परिवर्तन तुरंत लागू होते हैं।',
    profile_user_desc: 'आपकी वर्तमान सदस्यता योजना। अपग्रेड के लिए एडमिन से संपर्क करें।',
    profile_admin_banner: 'सुपर एडमिन कंट्रोल — टियर असाइनमेंट सक्रिय',
    profile_quota_label: 'दैनिक डिज़ाइन कोटा',
    profile_quota_free: 'आरंभम प्लान: प्रति दिन 2 डिज़ाइन। अधिक के लिए तोझिल में अपग्रेड करें।',
    profile_quota_pro: 'तोझिल प्लान सक्रिय — प्रति दिन 5 डिज़ाइन, पूर्ण पोर्टफोलियो और एक्सपोर्ट।',
    profile_quota_sovereign: 'मुदलवार प्लान सक्रिय (आजीवन)। कोई सीमा नहीं — असीमित डिज़ाइन!',
    profile_your_plan: 'आपकी योजना',
    profile_admin_only: 'केवल एडमिन',
    profile_request_upgrade: 'अपग्रेड करें →',
    profile_contact_admin: 'एडमिन से संपर्क करें',
    profile_disconnect: 'खाता डिस्कनेक्ट करें',
    profile_launch_crm: 'CRM वर्कस्पेस खोलें',

    // ── Tier Cards (User View) ────────────────────────────────────────────────
    tier_free_label: 'आरंभम — मुफ्त योजना',
    tier_free_quota: '2 डिज़ाइन / दिन',
    tier_free_desc: 'नए लोगों के लिए। पोर्टफोलियो ब्राउज़ करें और बेसिक स्टूडियो मुफ्त में उपयोग करें।',
    tier_free_price: 'मुफ्त',
    tier_free_f1: 'रोज 2 AI डिज़ाइन',
    tier_free_f2: 'पोर्टफोलियो ब्राउज़र',
    tier_free_f3: 'बेसिक एटेलियर स्टूडियो',

    tier_pro_label: 'तोझिल — बिज़नेस योजना',
    tier_pro_quota: '5 डिज़ाइन / दिन',
    tier_pro_desc: 'फ्रीलांसर और छोटे व्यवसायों के लिए। अधिक क्रेडिट, प्रीमियम लुकबुक और एक्सपोर्ट इतिहास।',
    tier_pro_price: '₹4,999 एक बार',
    tier_pro_f1: 'रोज 5 AI डिज़ाइन',
    tier_pro_f2: 'पूरी पोर्टफोलियो लाइब्रेरी',
    tier_pro_f3: 'एक्सपोर्ट गैलरी और इतिहास',
    tier_pro_f4: 'प्राथमिकता सहायता',

    tier_sov_label: 'मुदलवार — असीमित योजना',
    tier_sov_quota: 'असीमित',
    tier_sov_desc: 'कोई सीमा नहीं। पूरी प्लेटफॉर्म एक्सेस — केवल एडमिन द्वारा प्रदान की जाती है।',
    tier_sov_price: 'केवल एडमिन',
    tier_sov_f1: 'असीमित AI डिज़ाइन',
    tier_sov_f2: 'सभी तोझिल सुविधाएं',
    tier_sov_f3: 'CRM वर्कस्पेस',
    tier_sov_f4: 'डायरेक्ट एडमिन चैनल',
    tier_sov_f5: 'आजीवन लाइसेंस',

    // ── Admin Tier Switcher ───────────────────────────────────────────────────
    admin_tier_free_label: 'आरंभम (मुफ्त)',
    admin_tier_free_desc: 'नए यूजर के लिए — बेसिक एक्सेस',
    admin_tier_free_price: 'मुफ्त',
    admin_tier_pro_label: 'तोझिल (प्रो)',
    admin_tier_pro_desc: 'बिज़नेस ब्रांडिंग एक्सेस — आजीवन लाइसेंस',
    admin_tier_pro_price: '₹4,999 एक बार',
    admin_tier_sov_label: 'मुदलवार (असीमित)',
    admin_tier_sov_desc: 'पूरी आज़ादी — आजीवन असीमित एक्सपोर्ट, केवल एडमिन',
    admin_tier_sov_price: 'एडमिन ग्रांट',
  }
} as const;

export type TranslationKey = keyof typeof translations['en'];
