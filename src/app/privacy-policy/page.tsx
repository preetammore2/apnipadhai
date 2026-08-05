import React from 'react';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata = {
  title: 'Privacy Policy — Apni Padhai',
  description:
    'Privacy policy of Apni Padhai Publication explaining how student data is collected, used, stored and protected.',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      badge="Privacy Policy"
      badgeHi="गोपनीयता नीति"
      title="Privacy Policy"
      titleHi="गोपनीयता नीति"
      description="Your privacy matters to us. This policy explains how Apni Padhai Publication collects, uses, and safeguards your personal information."
      descriptionHi="आपकी निजता हमारे लिए महत्वपूर्ण है। यह नीति बताती है कि अपनी पढ़ाई पब्लिकेशन आपकी व्यक्तिगत जानकारी कैसे एकत्र करती है, उपयोग करती है और उसकी सुरक्षा कैसे करती है।"
      lastUpdated="January 2026"
      sections={[
        {
          title: '1. Information We Collect',
          titleHi: '1. हम कौन सी जानकारी एकत्र करते हैं',
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Personal details such as name, phone number, email address, and delivery address provided during registration, course enrollment, or book checkout.</li>
              <li>Academic preferences such as target exam, category, and course selections.</li>
              <li>Usage data including pages visited, lectures watched, test attempts, and device information collected through analytics tools.</li>
              <li>Payment transaction details. We never store your full card, UPI, or bank credentials on our servers.</li>
            </ul>
          ),
          contentHi: (
            <ul className="list-disc pl-5 space-y-2">
              <li>रजिस्ट्रेशन, कोर्स में नामांकन या किताब की खरीदारी के दौरान दी गई व्यक्तिगत जानकारी जैसे नाम, फोन नंबर, ईमेल पता और डिलीवरी पता।</li>
              <li>शैक्षणिक प्राथमिकताएं जैसे लक्ष्य परीक्षा, श्रेणी और कोर्स का चयन।</li>
              <li>उपयोग डेटा जिसमें देखे गए पेज, देखे गए लेक्चर, टेस्ट प्रयास और एनालिटिक्स टूल से एकत्रित डिवाइस जानकारी शामिल है।</li>
              <li>भुगतान लेनदेन विवरण। हम आपके पूरे कार्ड, UPI या बैंक क्रेडेंशियल कभी भी अपने सर्वर पर संग्रहीत नहीं करते।</li>
            </ul>
          ),
        },
        {
          title: '2. How We Use Your Information',
          titleHi: '2. हम आपकी जानकारी का उपयोग कैसे करते हैं',
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>To deliver live classes, recorded lectures, books, test series, and other purchased services.</li>
              <li>To send exam alerts, study material PDFs, and important batch updates via SMS, WhatsApp, email, or Telegram.</li>
              <li>To process orders, arrange courier delivery, and resolve support queries.</li>
              <li>To improve our platform, courses, and learning experience through analysis of aggregated usage patterns.</li>
            </ul>
          ),
          contentHi: (
            <ul className="list-disc pl-5 space-y-2">
              <li>लाइव क्लास, रिकॉर्डेड लेक्चर, किताबें, टेस्ट सीरीज़ और अन्य खरीदी गई सेवाएं उपलब्ध कराने के लिए।</li>
              <li>परीक्षा अलर्ट, स्टडी मैटेरियल PDF और महत्वपूर्ण बैच अपडेट SMS, WhatsApp, ईमेल या Telegram के माध्यम से भेजने के लिए।</li>
              <li>ऑर्डर प्रोसेस करने, कूरियर डिलीवरी की व्यवस्था करने और सहायता से जुड़ी समस्याओं को हल करने के लिए।</li>
              <li>एकत्रित उपयोग पैटर्न के विश्लेषण के माध्यम से हमारे प्लेटफॉर्म, कोर्स और सीखने के अनुभव को बेहतर बनाने के लिए।</li>
            </ul>
          ),
        },
        {
          title: '3. Data Sharing & Disclosure',
          titleHi: '3. डेटा साझा करना एवं प्रकटीकरण',
          content: (
            <p>
              We do not sell your personal data. Your information is shared only with trusted service partners —
              such as courier companies, payment gateways, and cloud infrastructure providers — strictly for the
              purpose of delivering our services. We may disclose data where required by law or to protect the
              rights and safety of Apni Padhai and its students.
            </p>
          ),
          contentHi: (
            <p>
              हम आपका व्यक्तिगत डेटा नहीं बेचते। आपकी जानकारी केवल विश्वसनीय सेवा साझेदारों के साथ साझा की जाती है —
              जैसे कूरियर कंपनियां, भुगतान गेटवे और क्लाउड इंफ्रास्ट्रक्चर प्रदाता — और वह भी केवल हमारी सेवाएं
              देने के उद्देश्य से। हम कानून द्वारा आवश्यक होने पर या अपनी पढ़ाई और उसके छात्रों के अधिकारों एवं
              सुरक्षा की रक्षा के लिए डेटा का प्रकटीकरण कर सकते हैं।
            </p>
          ),
        },
        {
          title: '4. Data Security',
          titleHi: '4. डेटा सुरक्षा',
          content: (
            <p>
              We implement industry-standard technical and organisational safeguards, including encrypted data
              transmission (HTTPS/SSL), restricted employee access, and secure payment processing, to protect your
              information against unauthorised access, alteration, or misuse.
            </p>
          ),
          contentHi: (
            <p>
              हम आपकी जानकारी को अनधिकृत पहुंच, परिवर्तन या दुरुपयोग से बचाने के लिए उद्योग-मानक तकनीकी और
              संगठनात्मक सुरक्षा उपाय अपनाते हैं, जिनमें एन्क्रिप्टेड डेटा ट्रांसमिशन (HTTPS/SSL), सीमित
              कर्मचारी पहुंच और सुरक्षित भुगतान प्रोसेसिंग शामिल है।
            </p>
          ),
        },
        {
          title: '5. Data Retention',
          titleHi: '5. डेटा रखरखाव',
          content: (
            <p>
              We retain your personal information only for as long as necessary to fulfil the purposes described
              in this policy, comply with legal obligations, and maintain records for dispute resolution. You may
              request deletion of your account data at any time by contacting our support team.
            </p>
          ),
          contentHi: (
            <p>
              हम आपकी व्यक्तिगत जानकारी केवल तब तक रखते हैं जब तक इस नीति में वर्णित उद्देश्यों को पूरा करने,
              कानूनी दायित्वों का पालन करने और विवाद समाधान हेतु रिकॉर्ड बनाए रखने के लिए आवश्यक हो। आप किसी भी
              समय हमारी सहायता टीम से संपर्क करके अपने खाते का डेटा हटाने का अनुरोध कर सकते हैं।
            </p>
          ),
        },
        {
          title: '6. Your Rights',
          titleHi: '6. आपके अधिकार',
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Access and obtain a copy of the personal data we hold about you.</li>
              <li>Rectify inaccurate or incomplete information.</li>
              <li>Request erasure of your personal data, subject to legal obligations.</li>
              <li>Withdraw consent for marketing communications at any time.</li>
            </ul>
          ),
          contentHi: (
            <ul className="list-disc pl-5 space-y-2">
              <li>आपके बारे में हमारे पास मौजूद व्यक्तिगत डेटा तक पहुंच और उसकी प्रति प्राप्त करना।</li>
              <li>गलत या अधूरी जानकारी को सुधारना।</li>
              <li>कानूनी दायित्वों के अधीन, अपने व्यक्तिगत डेटा को हटाने का अनुरोध करना।</li>
              <li>किसी भी समय मार्केटिंग संचार के लिए दी गई सहमति वापस लेना।</li>
            </ul>
          ),
        },
        {
          title: "7. Children's Privacy",
          titleHi: "7. बच्चों की गोपनीयता",
          content: (
            <p>
              Our platform is intended for students preparing for competitive examinations and is accessible to
              minors under the supervision of parents or guardians. We do not knowingly collect data from children
              under 13 years without verifiable parental consent.
            </p>
          ),
          contentHi: (
            <p>
              हमारा प्लेटफॉर्म प्रतियोगी परीक्षाओं की तैयारी करने वाले छात्रों के लिए है और माता-पिता या
              अभिभावकों की निगरानी में नाबालिगों के लिए सुलभ है। हम सत्यापन योग्य माता-पिता की सहमति के बिना
              13 वर्ष से कम उम्र के बच्चों से जानबूझकर डेटा एकत्र नहीं करते।
            </p>
          ),
        },
        {
          title: '8. Changes to This Policy',
          titleHi: '8. इस नीति में बदलाव',
          content: (
            <p>
              We may update this Privacy Policy from time to time. Significant changes will be communicated on
              this page and, where appropriate, through direct notifications. Continued use of our services after
              changes constitutes acceptance of the updated policy.
            </p>
          ),
          contentHi: (
            <p>
              हम समय-समय पर इस गोपनीयता नीति को अपडेट कर सकते हैं। महत्वपूर्ण बदलाव इस पेज पर और जहां उपयुक्त हो,
              सीधे सूचनाओं के माध्यम से बताए जाएंगे। बदलावों के बाद हमारी सेवाओं का उपयोग जारी रखना अपडेट की
              गई नीति को स्वीकार करना माना जाएगा।
            </p>
          ),
        },
      ]}
    />
  );
}
