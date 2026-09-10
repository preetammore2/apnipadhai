import React from 'react';
import { LegalPage } from '@/components/legal/LegalPage';
import { WpPageView } from '@/components/wp/WpPageView';
import { getManagedPageOrWp } from '@/lib/db-pages';

export const metadata = {
  title: 'Return & Refund Policy — Apni Padhai',
  description:
    'Return and refund policy of Apni Padhai Publication covering online courses, printed books, and digital products.',
};

export default async function RefundPolicyPage() {
  const wp = await getManagedPageOrWp('ap-refund-policy');
  if (wp) return <WpPageView title={wp.title} html={wp.contentHtml} />;

  return (
    <LegalPage
      badge="Return & Refund Policy"
      badgeHi="रिटर्न एवं रिफंड नीति"
      title="Return & Refund Policy"
      titleHi="रिटर्न एवं रिफंड नीति"
      description="Our commitment to student satisfaction. Understand the refund and return process for courses, books, and digital products."
      descriptionHi="छात्र संतुष्टि के प्रति हमारी प्रतिबद्धता। कोर्स, किताबें और डिजिटल उत्पादों के लिए रिफंड और रिटर्न प्रक्रिया को समझें।"
      lastUpdated="January 2026"
      sections={[
        {
          title: '1. Online Course Refunds',
          titleHi: '1. ऑनलाइन कोर्स रिफंड',
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Full refund is available within 7 days of course purchase provided no more than 10% of the course lectures have been viewed.</li>
              <li>Refunds are processed back to the original payment source within 5-7 working days after approval.</li>
              <li>Course access is revoked immediately upon refund approval to prevent misuse.</li>
              <li>Refunds are not applicable once a significant portion of the course has been consumed.</li>
            </ul>
          ),
          contentHi: (
            <ul className="list-disc pl-5 space-y-2">
              <li>कोर्स खरीदने के 7 दिनों के भीतर पूर्ण रिफंड उपलब्ध है, बशर्ते कोर्स के 10% से अधिक लेक्चर न देखे गए हों।</li>
              <li>स्वीकृति के बाद रिफंड 5-7 कार्यदिवसों के भीतर मूल भुगतान स्रोत पर वापस कर दिया जाता है।</li>
              <li>दुरुपयोग रोकने के लिए रिफंड स्वीकृति पर कोर्स एक्सेस तुरंत रद्द कर दिया जाता है।</li>
              <li>कोर्स का काफी हिस्सा उपयोग कर लेने के बाद रिफंड लागू नहीं होता।</li>
            </ul>
          ),
        },
        {
          title: '2. Printed Book Returns',
          titleHi: '2. प्रिंटेड किताबों की वापसी',
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Books may be returned within 7 days of delivery if received in a damaged, defective, or incorrect condition.</li>
              <li>Books must be unused, unmarked, and in their original packaging with all accessories intact.</li>
              <li>For damaged or defective books, replacement or full refund is provided after verification of photo/video evidence.</li>
              <li>Return shipping costs are borne by Apni Padhai for damaged/incorrect items only.</li>
            </ul>
          ),
          contentHi: (
            <ul className="list-disc pl-5 space-y-2">
              <li>डिलीवरी के 7 दिनों के भीतर किताबें वापस की जा सकती हैं, यदि वे क्षतिग्रस्त, दोषपूर्ण या गलत स्थिति में प्राप्त हुई हों।</li>
              <li>किताबें बिना उपयोग, बिना निशान और सभी एक्सेसरीज़ सहित अपनी मूल पैकेजिंग में होनी चाहिए।</li>
              <li>क्षतिग्रस्त या दोषपूर्ण किताबों के लिए फोटो/वीडियो साक्ष्य के सत्यापन के बाद प्रतिस्थापन या पूर्ण रिफंड दिया जाता है।</li>
              <li>केवल क्षतिग्रस्त/गलत वस्तुओं के लिए रिटर्न शिपिंग लागत अपनी पढ़ाई वहन करती है।</li>
            </ul>
          ),
        },
        {
          title: '3. Digital Products (E-Books & PDFs)',
          titleHi: '3. डिजिटल उत्पाद (ई-बुक्स एवं PDF)',
          content: (
            <p>
              Digital products such as e-books, PDFs, and instant-access test series are delivered immediately
              upon purchase and are therefore non-refundable, except where the product is found to be defective or
              does not match its published description.
            </p>
          ),
          contentHi: (
            <p>
              ई-बुक्स, PDF और इंस्टेंट-एक्सेस टेस्ट सीरीज़ जैसे डिजिटल उत्पाद खरीदने पर तुरंत डिलीवर कर दिए जाते हैं
              और इसलिए वे गैर-रिफंडेबल हैं, सिवाय उस स्थिति के जब उत्पाद दोषपूर्ण पाया जाए या उसके प्रकाशित विवरण
              से मेल न खाता हो।
            </p>
          ),
        },
        {
          title: '4. Non-Refundable Situations',
          titleHi: '4. गैर-रिफंडेबल स्थितियां',
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Change of mind after consuming substantial course content.</li>
              <li>Wrongly entered delivery address or failed delivery due to customer unavailability.</li>
              <li>Coupon-applied transactions where the discount has already been availed.</li>
              <li>Refunds requested beyond the stated 7-day window.</li>
            </ul>
          ),
          contentHi: (
            <ul className="list-disc pl-5 space-y-2">
              <li>काफी कोर्स सामग्री उपयोग करने के बाद मन बदलना।</li>
              <li>गलत डिलीवरी पता दर्ज करना या ग्राहक की अनुपलब्धता के कारण डिलीवरी विफल होना।</li>
              <li>कूपन लागू लेनदेन जहां छूट पहले ही ले ली गई हो।</li>
              <li>निर्धारित 7 दिनों की अवधि के बाद किया गया रिफंड अनुरोध।</li>
            </ul>
          ),
        },
        {
          title: '5. How to Request a Refund',
          titleHi: '5. रिफंड कैसे मांगें',
          content: (
            <ol className="list-decimal pl-5 space-y-2">
              <li>Email us at <span className="font-bold text-navy-900">support@apnipadhaipublication.com</span> with your order ID and reason for the refund.</li>
              <li>Attach supporting photos/videos for damaged or defective book claims.</li>
              <li>Our support team will verify your request and respond within 48 working hours.</li>
              <li>Approved refunds are initiated within 5-7 working days.</li>
            </ol>
          ),
          contentHi: (
            <ol className="list-decimal pl-5 space-y-2">
              <li>अपने ऑर्डर ID और रिफंड के कारण के साथ हमें ईमेल करें <span className="font-bold text-navy-900">support@apnipadhaipublication.com</span> पर।</li>
              <li>क्षतिग्रस्त या दोषपूर्ण किताबों के दावे के लिए सहायक फोटो/वीडियो संलग्न करें।</li>
              <li>हमारी सहायता टीम आपके अनुरोध का सत्यापन कर 48 कार्य घंटों के भीतर जवाब देगी।</li>
              <li>स्वीकृत रिफंड 5-7 कार्यदिवसों के भीतर शुरू किए जाते हैं।</li>
            </ol>
          ),
        },
        {
          title: '6. Contact Us',
          titleHi: '6. हमसे संपर्क करें',
          content: (
            <p>
              For any refund or return queries, reach out to our support helpline at{' '}
              <span className="font-bold text-navy-900">+91 70734 80809</span> (Monday to Saturday, 9:00 AM –
              7:00 PM IST) or email{' '}
              <span className="font-bold text-navy-900">support@apnipadhaipublication.com</span>.
            </p>
          ),
          contentHi: (
            <p>
              किसी भी रिफंड या रिटर्न संबंधी प्रश्न के लिए, हमारी सहायता हेल्पलाइन{' '}
              <span className="font-bold text-navy-900">+91 70734 80809</span> (सोमवार से शनिवार, सुबह 9:00 बजे –
              शाम 7:00 बजे IST) पर संपर्क करें या ईमेल करें{' '}
              <span className="font-bold text-navy-900">support@apnipadhaipublication.com</span> पर।
            </p>
          ),
        },
      ]}
    />
  );
}
