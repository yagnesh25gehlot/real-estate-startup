import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Phone, Globe, ChevronDown, Check } from "lucide-react";
import { Link } from "react-router-dom";

type Language = "hindi" | "english";

interface Content {
  hero: {
    title: string;
    subtitle: string;
    cta: string;
  };
  mission: {
    title: string;
    content: string;
  };
  vision: {
    title: string;
    content: string;
  };
  businessModel: {
    title: string;
    subtitle: string;
    sections: {
      title: string;
      content: string;
    }[];
  };
  cta: {
    title: string;
    subtitle: string;
    cta: string;
    listProperty: string;
    hours: string;
    services: string;
  };
}

const content: Record<Language, Content> = {
  hindi: {
    hero: {
      title: "RealtyTopper के बारे में",
      subtitle:
        "IIT से पढ़े हुए और 20 साल से ज्यादा अनुभव वाले Property Dealers द्वारा चलाया गया भरोसेमंद मकान-प्लेटफॉर्म जहां आपको मिलता है ज्यादा लोगों तक पहुंच, जांचे हुए मकान, और पूरी पारदर्शिता।",
      cta: "अभी कॉल करें: 8112279602",
    },
    mission: {
      title: "हमारा लक्ष्य",
      content:
        "राजस्थान के छोटे-बड़े शहरों और कस्बों में मकान का काम सरल, साफ और भरोसेमंद बनाना। हम देते हैं कम पैसे में ज्यादा लोगों तक पहुंच, जांचे हुए मकान, और पूरा सहयोग डील पूरी होने तक।",
    },
    vision: {
      title: "हमारा सपना",
      content:
        "भारत का सबसे भरोसेमंद मकान-प्लेटफॉर्म बनना, जहां खरीदने वाले और बेचने वाले दोनों को मिले अच्छे सौदे, पूरी पारदर्शिता, और पेशेवर सहयोग। हमारा लक्ष्य है हर मकान का सौदा सफल बनाना।",
    },
    businessModel: {
      title: "हमारा कारोबार मॉडल | पारदर्शी कीमतें",
      subtitle: "कम पैसे में ज्यादा फायदा - यही हमारा वादा आपके लिए।",
      sections: [
        {
          title: "मकान लिस्टिंग",
          content:
            "कम विज्ञापन शुल्क पर आपके मकान को ज्यादा लोगों तक पहुंच मिलेगी। सफल सौदा होने पर विज्ञापन शुल्क पूरा वापस मिलेगा।",
        },
        {
          title: "कमीशन संरचना",
          content:
            "किराया/लीज: पहले महीने के किराये का 30%\nखरीद/बिक्री: मकान की कीमत का 2%\nमकान मालिक से सफल सौदे के बाद ही लिया जाता है।",
        },
        {
          title: "सुरक्षित और भरोसेमंद",
          content:
            "सभी मकान जांचे हुए। बुकिंग राशि हमारे पास सुरक्षित। हर कदम पर पूरी पारदर्शिता। कानूनी सहयोग उपलब्ध।",
        },
      ],
    },
    cta: {
      title: "अपनी मकान की यात्रा शुरू करने के लिए तैयार हैं?",
      subtitle:
        "अभी हमें कॉल करें और पाएं सबसे अच्छे सौदे। हमारी टीम आपकी पूरी मदद करेगी।",
      cta: "अभी कॉल करें: 8112279602",
      listProperty: "अपना मकान लिस्ट करें",
      hours: "सुबह 9 बजे - रात 9 बजे | सोमवार - रविवार",
      services: "सभी मकान से जुड़े काम - कागजात, कानूनी काम, दस्तावेज",
    },
  },
  english: {
    hero: {
      title: "About RealtyTopper",
      subtitle:
        "A trusted real estate platform operated by IITians and professional property dealers with 20+ years of experience, offering massive reach, verified properties, and complete transparency.",
      cta: "Call Now: 8112279602",
    },
    mission: {
      title: "Our Mission",
      content:
        "To make real estate simple, transparent, and trustworthy in Rajasthan's tier 2, 3 cities and towns. We provide massive reach, verified properties, and complete support at minimal charges until deal completion.",
    },
    vision: {
      title: "Our Vision",
      content:
        "To become India's most trusted real estate platform where both buyers and sellers get the best deals, complete transparency, and professional support. Our goal is to make every property deal successful.",
    },
    businessModel: {
      title: "Our Business Model | Transparent Pricing",
      subtitle: "Maximum value at minimal charges - that's our promise to you.",
      sections: [
        {
          title: "Property Listing",
          content:
            "Get massive reach for your property at minimal advertising fees. Advertising fees are fully refundable upon successful deal completion.",
        },
        {
          title: "Commission Structure",
          content:
            "Rent/Lease: 30% of first month rent\nBuy/Sell: 2% of property price\nCharged from property owner only after successful deal.",
        },
        {
          title: "Safe & Secure",
          content:
            "All properties are verified. Your booking amount is safe with us. Complete transparency in every step. Legal support available.",
        },
      ],
    },
    cta: {
      title: "Ready to Start Your Real Estate Journey?",
      subtitle:
        "Call us now and get the best deals. Our team will provide complete support.",
      cta: "Call Now: 8112279602",
      listProperty: "List Your Property",
      hours: "9 AM - 9 PM | Monday - Sunday",
      services:
        "All property related work - paperwork, legal work, documentation",
    },
  },
};

const LanguageSelector = ({
  language,
  onLanguageChange,
}: {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-300"
      >
        <Globe className="h-4 w-4" />
        <span className="font-medium">
          {language === "hindi" ? "हिंदी" : "English"}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[140px] z-50 animate-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => {
              onLanguageChange("hindi");
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium">हिंदी</span>
            {language === "hindi" && (
              <Check className="h-4 w-4 text-blue-600" />
            )}
          </button>
          <button
            onClick={() => {
              onLanguageChange("english");
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium">English</span>
            {language === "english" && (
              <Check className="h-4 w-4 text-blue-600" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

const About = () => {
  const [language, setLanguage] = useState<Language>("hindi");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentContent = content[language];

  const handleLanguageChange = (newLanguage: Language) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setLanguage(newLanguage);
      setIsTransitioning(false);
    }, 150);
  };

  return (
    <>
      <Helmet>
        <title>
          About Us - RealtyTopper | आपका भरोसेमंद Real Estate Partner
        </title>
        <meta
          name="description"
          content="RealtyTopper - IITians और 20+ years experience वाले professional dealers द्वारा संचालित trusted real estate platform. Call us: 8112279602"
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="relative mb-16 rounded-2xl overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="/images/villa.jpg"
              alt="About RealtyTopper"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          </div>

          {/* Language Selector */}
          <div className="absolute top-6 right-6 z-20">
            <LanguageSelector
              language={language}
              onLanguageChange={handleLanguageChange}
            />
          </div>

          <div className="relative z-10 text-center py-20 px-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              About <span className="text-blue-300">RealtyTopper</span>
            </h1>
            <p
              className={`text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed transition-opacity duration-300 ${
                isTransitioning ? "opacity-50" : "opacity-100"
              }`}
            >
              {currentContent.hero.subtitle}
            </p>
            <div className="mt-8">
              <a
                href="tel:8112279602"
                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Phone className="h-6 w-6 mr-2" />
                {currentContent.hero.cta}
              </a>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {currentContent.mission.title}
            </h2>
            <p
              className={`text-gray-700 leading-relaxed transition-opacity duration-300 ${
                isTransitioning ? "opacity-50" : "opacity-100"
              }`}
            >
              {currentContent.mission.content}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {currentContent.vision.title}
            </h2>
            <p
              className={`text-gray-700 leading-relaxed transition-opacity duration-300 ${
                isTransitioning ? "opacity-50" : "opacity-100"
              }`}
            >
              {currentContent.vision.content}
            </p>
          </div>
        </div>

        {/* Business Model */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {currentContent.businessModel.title}
            </h2>
            <p
              className={`text-xl text-gray-600 max-w-3xl mx-auto transition-opacity duration-300 ${
                isTransitioning ? "opacity-50" : "opacity-100"
              }`}
            >
              {currentContent.businessModel.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentContent.businessModel.sections.map((section, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {section.title}
                </h3>
                <p
                  className={`text-gray-600 whitespace-pre-line transition-opacity duration-300 ${
                    isTransitioning ? "opacity-50" : "opacity-100"
                  }`}
                >
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full"></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">
              {currentContent.cta.title}
            </h2>
            <p
              className={`text-xl mb-8 text-blue-100 max-w-2xl mx-auto transition-opacity duration-300 ${
                isTransitioning ? "opacity-50" : "opacity-100"
              }`}
            >
              {currentContent.cta.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:8112279602"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-lg transform hover:scale-105 shadow-lg"
              >
                <Phone className="h-5 w-5" />
                {currentContent.cta.cta}
              </a>
              <Link
                to="/list-property"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105"
              >
                {currentContent.cta.listProperty}
              </Link>
            </div>
            <div className="mt-6 text-blue-100">
              <p className="text-lg">
                <strong>{currentContent.cta.hours}</strong>
              </p>
              <p className="text-sm mt-2">
                <strong>{currentContent.cta.services}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
