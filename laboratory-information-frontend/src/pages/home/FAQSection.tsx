import { Card, CardContent } from '../../components/common/card'
import { HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
export function FAQSection() {
  const { t } = useTranslation();
  const faqs = [
    {
      question: t("faq.question1"),
      answer: t("faq.answer1")
    },
    {
      question: t("faq.question2"),
      answer: t("faq.answer2")
    },
    {
      question: t("faq.question3"),
      answer: t("faq.answer3")
    },
    {
      question: t("faq.question4"),
      answer: t("faq.answer4")
    }
  ];

  return (
    <section className="px-4 sm:px-6 py-12 sm:py-16 md:py-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl text-gray-900 mb-3 sm:mb-4 px-4">
           {t("faq.title")}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4">
            {t("faq.description")}
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {faqs.map((faq, index) => (
            <Card key={index} className="bg-white border border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div className="space-y-2 sm:space-y-3 flex-1">
                    <h4 className="text-sm sm:text-base text-gray-900 font-medium">{faq.question}</h4>
                    <p className="text-sm sm:text-base text-gray-600">{faq.answer}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
