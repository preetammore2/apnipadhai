import React from 'react';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata = {
  title: 'Terms & Conditions — Apni Padhai',
  description:
    'Terms and conditions governing the use of Apni Padhai Publication website, online courses, books, and related services.',
};

export default function TermsConditionsPage() {
  return (
    <LegalPage
      badge="Terms & Conditions"
      badgeHi="नियम एवं शर्तें"
      title="Terms & Conditions"
      titleHi="नियम एवं शर्तें"
      description="Please read these terms carefully before enrolling in our courses or purchasing books from Apni Padhai Publication."
      descriptionHi="कृपया हमारे कोर्स में नामांकन करने या अपनी पढ़ाई पब्लिकेशन से किताबें खरीदने से पहले इन नियमों को ध्यान से पढ़ें।"
      lastUpdated="January 2026"
      sections={[
        {
          title: '1. Acceptance of Terms',
          titleHi: '1. नियमों की स्वीकृति',
          content: (
            <p>
              By accessing the Apni Padhai website, mobile application, or purchasing any course, book, or test
              series, you agree to be bound by these Terms &amp; Conditions and our Privacy Policy. If you do not
              agree with any part of these terms, you should discontinue use of our services.
            </p>
          ),
          contentHi: (
            <p>
              अपनी पढ़ाई वेबसाइट, मोबाइल एप्लिकेशन तक पहुंच करके, या कोई कोर्स, किताब या टेस्ट सीरीज़ खरीदकर, आप इन
              नियमों एवं शर्तों और हमारी गोपनीयता नीति से बंधे होने के लिए सहमत होते हैं। यदि आप इन नियमों के
              किसी भी हिस्से से सहमत नहीं हैं, तो आपको हमारी सेवाओं का उपयोग बंद कर देना चाहिए।
            </p>
          ),
        },
        {
          title: '2. Eligibility & Account',
          titleHi: '2. पात्रता एवं खाता',
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>You must provide accurate and complete information while registering or placing an order.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>We reserve the right to suspend accounts that provide false information or misuse the platform.</li>
            </ul>
          ),
          contentHi: (
            <ul className="list-disc pl-5 space-y-2">
              <li>रजिस्ट्रेशन या ऑर्डर करते समय आपको सटीक और पूरी जानकारी देनी होगी।</li>
              <li>अपने खाते के क्रेडेंशियल की गोपनीयता बनाए रखने की जिम्मेदारी आपकी है।</li>
              <li>हम गलत जानकारी देने या प्लेटफॉर्म का दुरुपयोग करने वाले खातों को निलंबित करने का अधिकार रखते हैं।</li>
            </ul>
          ),
        },
        {
          title: '3. Course & Book Purchases',
          titleHi: '3. कोर्स एवं किताब की खरीदारी',
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Course access is granted to a single user account and may not be shared, transferred, or resold.</li>
              <li>Lecture access validity is specified on each batch page and begins from the date of enrollment.</li>
              <li>Prices, discounts, and offers are subject to change without prior notice.</li>
              <li>Physical books are delivered via courier; delivery timelines may vary by location.</li>
            </ul>
          ),
          contentHi: (
            <ul className="list-disc pl-5 space-y-2">
              <li>कोर्स एक्सेस केवल एकल उपयोगकर्ता खाते को दिया जाता है और इसे साझा, स्थानांतरित या पुनर्विक्रय नहीं किया जा सकता।</li>
              <li>लेक्चर एक्सेस की वैधता प्रत्येक बैच पेज पर निर्दिष्ट है और नामांकन की तिथि से शुरू होती है।</li>
              <li>मूल्य, छूट और ऑफ़र बिना पूर्व सूचना के बदल सकते हैं।</li>
              <li>फिजिकल किताबें कूरियर के माध्यम से डिलीवर की जाती हैं; डिलीवरी का समय स्थान के अनुसार भिन्न हो सकता है।</li>
            </ul>
          ),
        },
        {
          title: '4. Intellectual Property',
          titleHi: '4. बौद्धिक संपदा',
          content: (
            <p>
              All content on our platform — including video lectures, Brahmastra books, notes, PDFs, test papers,
              logos, and brand assets — is the exclusive intellectual property of Apni Padhai Publication. Any
              unauthorised copying, recording, redistribution, or commercial use is strictly prohibited and may
              result in legal action.
            </p>
          ),
          contentHi: (
            <p>
              हमारे प्लेटफॉर्म पर मौजूद सभी सामग्री — जिसमें वीडियो लेक्चर, ब्रह्मास्त्र किताबें, नोट्स, PDF, टेस्ट
              पेपर, लोगो और ब्रांड संपत्तियां शामिल हैं — अपनी पढ़ाई पब्लिकेशन की विशेष बौद्धिक संपदा है। कोई भी
              अनधिकृत कॉपी, रिकॉर्डिंग, पुनर्वितरण या व्यावसायिक उपयोग सख्त वर्जित है और इसके परिणामस्वरूप
              कानूनी कार्रवाई हो सकती है।
            </p>
          ),
        },
        {
          title: '5. User Conduct',
          titleHi: '5. उपयोगकर्ता आचरण',
          content: (
            <p>
              You agree not to upload, share, or distribute content that is unlawful, defamatory, or infringes on
              the rights of others. Sharing lecture access, cracking, or tampering with the platform&apos;s security
              systems is strictly prohibited.
            </p>
          ),
          contentHi: (
            <p>
              आप गैरकानूनी, मानहानिकारक या दूसरों के अधिकारों का उल्लंघन करने वाली सामग्री अपलोड, साझा या वितरित
              नहीं करने के लिए सहमत हैं। लेक्चर एक्सेस साझा करना, क्रैक करना या प्लेटफॉर्म की सुरक्षा प्रणाली
              से छेड़छाड़ करना सख्त वर्जित है।
            </p>
          ),
        },
        {
          title: '6. Disclaimer of Warranties',
          titleHi: '6. वारंटी अस्वीकरण',
          content: (
            <p>
              While we strive for accuracy in our study material and notifications, examination patterns and
              official notifications are controlled by respective government bodies. Apni Padhai does not
              guarantee selection or marks; success depends on individual effort and preparation. Services are
              provided on an &quot;as is&quot; and &quot;as available&quot; basis.
            </p>
          ),
          contentHi: (
            <p>
              हालांकि हम अपने स्टडी मैटेरियल और सूचनाओं में सटीकता के लिए प्रयासरत हैं, परीक्षा का स्वरूप और
              आधिकारिक सूचनाएं संबंधित सरकारी निकायों द्वारा नियंत्रित होती हैं। अपनी पढ़ाई चयन या अंकों की
              गारंटी नहीं देती; सफलता व्यक्तिगत प्रयास और तैयारी पर निर्भर करती है। सेवाएं &quot;जैसी हैं&quot;
              और &quot;जैसी उपलब्ध हैं&quot; आधार पर प्रदान की जाती हैं।
            </p>
          ),
        },
        {
          title: '7. Limitation of Liability',
          titleHi: '7. दायित्व की सीमा',
          content: (
            <p>
              To the maximum extent permitted by law, Apni Padhai shall not be liable for any indirect,
              incidental, or consequential damages arising from the use of our platform, including loss of data,
              profits, or exam outcomes.
            </p>
          ),
          contentHi: (
            <p>
              कानून द्वारा अनुमत अधिकतम सीमा तक, अपनी पढ़ाई हमारे प्लेटफॉर्म के उपयोग से उत्पन्न किसी भी
              अप्रत्यक्ष, आकस्मिक या परिणामी क्षति के लिए उत्तरदायी नहीं होगी, जिसमें डेटा, लाभ या परीक्षा
              परिणामों की हानि शामिल है।
            </p>
          ),
        },
        {
          title: '8. Governing Law',
          titleHi: '8. लागू कानून',
          content: (
            <p>
              These terms are governed by the laws of India. Any disputes shall be subject to the exclusive
              jurisdiction of the courts of Bhilwara, Rajasthan.
            </p>
          ),
          contentHi: (
            <p>
              इन नियमों पर भारत के कानून लागू होते हैं। कोई भी विवाद राजस्थान के भीलवाड़ा न्यायालयों के
              अनन्य क्षेत्राधिकार के अधीन होगा।
            </p>
          ),
        },
        {
          title: '9. Changes to Terms',
          titleHi: '9. नियमों में बदलाव',
          content: (
            <p>
              We may revise these Terms &amp; Conditions at any time. Updated terms will be posted on this page,
              and continued use of our services constitutes acceptance of the revised terms.
            </p>
          ),
          contentHi: (
            <p>
              हम किसी भी समय इन नियमों एवं शर्तों में संशोधन कर सकते हैं। अपडेट किए गए नियम इस पेज पर पोस्ट किए
              जाएंगे, और हमारी सेवाओं का उपयोग जारी रखना संशोधित नियमों की स्वीकृति माना जाएगा।
            </p>
          ),
        },
      ]}
    />
  );
}
