import React from 'react';
import { LegalPage } from '@/components/legal/LegalPage';
import { WpPageView } from '@/components/wp/WpPageView';
import { getManagedPageOrWp } from '@/lib/db-pages';

export const metadata = {
  title: 'Shipping Policy — Apni Padhai Publication',
  description:
    'Shipping policy of Apni Padhai Publication covering order processing, delivery timelines, tracking, and delivery coverage across India.',
};

export default async function ShippingPolicyPage() {
  const wp = await getManagedPageOrWp('ap-shipping-policy');
  if (wp) return <WpPageView title={wp.title} html={wp.contentHtml} />;

  return (
    <LegalPage
      badge="Shipping Policy"
      badgeHi="शिपिंग नीति"
      title="Shipping & Delivery Policy"
      titleHi="शिपिंग एवं डिलीवरी नीति"
      description="How we process, ship, and deliver your Apni Padhai books safely across India."
      descriptionHi="हम आपकी अपनी पढ़ाई की किताबें पूरे भारत में कैसे प्रोसेस, शिप और डिलीवर करते हैं।"
      lastUpdated="January 2026"
      sections={[
        {
          title: '1. Shipping Destinations',
          titleHi: '1. शिपिंग गंतव्य',
          content: (
            <p>
              We ship our products to locations across India. Delivery is available for all pincodes served by
              our reliable courier partners. Remote and hard-to-reach areas may experience slightly longer
              delivery times.
            </p>
          ),
          contentHi: (
            <p>
              हम अपने उत्पाद भारत भर के स्थानों पर शिप करते हैं। हमारे विश्वसनीय कूरियर पार्टनर्स द्वारा सेवा प्राप्त
              सभी पिनकोड पर डिलीवरी उपलब्ध है। दूरस्थ और कठिन क्षेत्रों में डिलीवरी का समय थोड़ा अधिक लग सकता है।
            </p>
          ),
        },
        {
          title: '2. Order Processing Time',
          titleHi: '2. ऑर्डर प्रोसेसिंग समय',
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Orders are typically processed within 1-3 business days after payment confirmation.</li>
              <li>Processing time does not include weekends or public holidays.</li>
              <li>Orders placed on holidays are processed on the next working day.</li>
            </ul>
          ),
          contentHi: (
            <ul className="list-disc pl-5 space-y-2">
              <li>भुगतान की पुष्टि के बाद ऑर्डर आमतौर पर 1-3 कार्यदिवसों के भीतर प्रोसेस किए जाते हैं।</li>
              <li>प्रोसेसिंग समय में सप्ताहांत या सार्वजनिक अवकाश शामिल नहीं हैं।</li>
              <li>छुट्टियों पर किए गए ऑर्डर अगले कार्यदिवस पर प्रोसेस किए जाते हैं।</li>
            </ul>
          ),
        },
        {
          title: '3. Delivery Times',
          titleHi: '3. डिलीवरी समय',
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-bold text-navy-900">Digital Products:</span> Delivered instantly to the
                email address provided during checkout.
              </li>
              <li>
                <span className="font-bold text-navy-900">Physical Products:</span> Typically delivered within
                5-10 days from the date of order confirmation.
              </li>
              <li>Delivery times may vary based on the shipping destination and unforeseen logistical circumstances.</li>
            </ul>
          ),
          contentHi: (
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-bold text-navy-900">डिजिटल उत्पाद:</span> चेकआउट के समय दिए गए ईमेल पते पर
                तुरंत डिलीवर किए जाते हैं।
              </li>
              <li>
                <span className="font-bold text-navy-900">भौतिक उत्पाद:</span> ऑर्डर की पुष्टि की तारीख से
                आमतौर पर 5-10 दिनों के भीतर डिलीवर किए जाते हैं।
              </li>
              <li>डिलीवरी का समय शिपिंग गंतव्य और अप्रत्याशित परिस्थितियों के आधार पर भिन्न हो सकता है।</li>
            </ul>
          ),
        },
        {
          title: '4. Shipping Notifications & Tracking',
          titleHi: '4. शिपिंग सूचनाएं एवं ट्रैकिंग',
          content: (
            <p>
              Customers receive a confirmation email with tracking information once their order has been
              shipped. You can also track your order anytime on our{' '}
              <span className="font-bold text-navy-900">Track Your Order</span> page using your order ID and
              mobile number.
            </p>
          ),
          contentHi: (
            <p>
              ऑर्डर शिप होने पर ग्राहकों को ट्रैकिंग जानकारी के साथ एक पुष्टिकरण ईमेल प्राप्त होता है। आप अपने ऑर्डर ID
              और मोबाइल नंबर का उपयोग करके हमारे{' '}
              <span className="font-bold text-navy-900">ट्रैक योर ऑर्डर</span> पेज पर किसी भी समय अपने ऑर्डर को ट्रैक
              कर सकते हैं।
            </p>
          ),
        },
        {
          title: '5. Shipping Methods & Charges',
          titleHi: '5. शिपिंग विधियां एवं शुल्क',
          content: (
            <p>
              We use reliable shipping partners to ensure safe and timely delivery of your orders within India.
              Applicable shipping charges, if any, are shown clearly at checkout before you complete payment.
            </p>
          ),
          contentHi: (
            <p>
              हम आपके ऑर्डर की सुरक्षित और समय पर डिलीवरी सुनिश्चित करने के लिए विश्वसनीय शिपिंग पार्टनर्स का उपयोग
              करते हैं। लागू शिपिंग शुल्क, यदि कोई हो, तो भुगतान पूरा करने से पहले चेकआउट पर स्पष्ट रूप से दिखाए जाते हैं।
            </p>
          ),
        },
        {
          title: '6. Damaged or Lost Shipments',
          titleHi: '6. क्षतिग्रस्त या खोए हुए शिपमेंट',
          content: (
            <p>
              If your order arrives damaged or is lost during transit, contact us within 7 days of the expected
              delivery date at{' '}
              <span className="font-bold text-navy-900">support@apnipadhaipublication.com</span> and we will
              arrange a free replacement or refund.
            </p>
          ),
          contentHi: (
            <p>
              यदि आपका ऑर्डर क्षतिग्रस्त पहुंचता है या ट्रांजिट के दौरान खो जाता है, तो अपेक्षित डिलीवरी तिथि के 7
              दिनों के भीतर{' '}
              <span className="font-bold text-navy-900">support@apnipadhaipublication.com</span> पर संपर्क करें और
              हम निःशुल्क प्रतिस्थापन या रिफंड की व्यवस्था करेंगे।
            </p>
          ),
        },
        {
          title: '7. Contact Us',
          titleHi: '7. हमसे संपर्क करें',
          content: (
            <p>
              For any inquiries regarding your order or shipment, contact us at{' '}
              <span className="font-bold text-navy-900">+91 70734 80809</span> or email{' '}
              <span className="font-bold text-navy-900">support@apnipadhaipublication.com</span>.
            </p>
          ),
          contentHi: (
            <p>
              अपने ऑर्डर या शिपमेंट से संबंधित किसी भी प्रश्न के लिए, हमें{' '}
              <span className="font-bold text-navy-900">+91 70734 80809</span> पर संपर्क करें या ईमेल करें{' '}
              <span className="font-bold text-navy-900">support@apnipadhaipublication.com</span> पर।
            </p>
          ),
        },
      ]}
    />
  );
}
