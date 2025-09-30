import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { 
  Download, 
  Wifi, 
  Globe, 
  User, 
  Type, 
  Mail, 
  MessageSquare, 
  Phone,
  Copy,
  Check,
  QrCode
} from 'lucide-react';

interface BarcodeType {
  id: string;
  name: string;
  icon: React.ReactNode;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    placeholder: string;
    required?: boolean;
    options?: string[];
  }>;
}

const barcodeTypes: BarcodeType[] = [
  {
    id: 'url',
    name: 'Website URL',
    icon: <Globe className="h-5 w-5" />,
    fields: [
      {
        name: 'url',
        label: 'URL',
        type: 'url',
        placeholder: 'https://example.com',
        required: true
      }
    ]
  },
  {
    id: 'wifi',
    name: 'WiFi Network',
    icon: <Wifi className="h-5 w-5" />,
    fields: [
      {
        name: 'ssid',
        label: 'Network Name (SSID)',
        type: 'text',
        placeholder: 'My WiFi Network',
        required: true
      },
      {
        name: 'password',
        label: 'Password',
        type: 'text',
        placeholder: 'WiFi Password'
      },
      {
        name: 'security',
        label: 'Security Type',
        type: 'select',
        placeholder: '',
        options: ['WPA', 'WEP', 'nopass']
      },
      {
        name: 'hidden',
        label: 'Hidden Network',
        type: 'checkbox',
        placeholder: ''
      }
    ]
  },
  {
    id: 'contact',
    name: 'Contact Card',
    icon: <User className="h-5 w-5" />,
    fields: [
      {
        name: 'firstName',
        label: 'First Name',
        type: 'text',
        placeholder: 'John',
        required: true
      },
      {
        name: 'lastName',
        label: 'Last Name',
        type: 'text',
        placeholder: 'Doe'
      },
      {
        name: 'organization',
        label: 'Company',
        type: 'text',
        placeholder: 'Acme Corp'
      },
      {
        name: 'phone',
        label: 'Phone',
        type: 'tel',
        placeholder: '+1234567890'
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'john@example.com'
      }
    ]
  },
  {
    id: 'text',
    name: 'Plain Text',
    icon: <Type className="h-5 w-5" />,
    fields: [
      {
        name: 'text',
        label: 'Text Content',
        type: 'textarea',
        placeholder: 'Enter any text content here...',
        required: true
      }
    ]
  },
  {
    id: 'email',
    name: 'Email',
    icon: <Mail className="h-5 w-5" />,
    fields: [
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'recipient@example.com',
        required: true
      },
      {
        name: 'subject',
        label: 'Subject',
        type: 'text',
        placeholder: 'Email Subject'
      },
      {
        name: 'body',
        label: 'Message Body',
        type: 'textarea',
        placeholder: 'Email message content...'
      }
    ]
  },
  {
    id: 'sms',
    name: 'SMS Message',
    icon: <MessageSquare className="h-5 w-5" />,
    fields: [
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        placeholder: '+1234567890',
        required: true
      },
      {
        name: 'message',
        label: 'Message',
        type: 'textarea',
        placeholder: 'SMS message content...'
      }
    ]
  },
  {
    id: 'phone',
    name: 'Phone Number',
    icon: <Phone className="h-5 w-5" />,
    fields: [
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        placeholder: '+1234567890',
        required: true
      }
    ]
  }
];

export default function BarcodeGenerator() {
  const navigate = useNavigate();

  const [selectedType, setSelectedType] = useState<string>('url');
  const [formData, setFormData] = useState<Record<string, string>>({});
  //const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  //const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const currentType = barcodeTypes.find(type => type.id === selectedType);

  useEffect(() => {
    // Reset form data when type changes
    setFormData({});
    //setQrCodeDataUrl(''); //!!!Remove?
  }, [selectedType]);

  const generateQRData = (): string => {
    switch (selectedType) {
      case 'url':
        return formData.url || '';
      
      case 'wifi':
        const security = formData.security || 'WPA';
        const hidden = formData.hidden === 'true' ? 'true' : 'false';
        return `WIFI:T:${security};S:${formData.ssid || ''};P:${formData.password || ''};H:${hidden};;`;
      
      case 'contact':
        return `BEGIN:VCARD
VERSION:3.0
FN:${(formData.firstName || '') + ' ' + (formData.lastName || '')}
ORG:${formData.organization || ''}
TEL:${formData.phone || ''}
EMAIL:${formData.email || ''}
END:VCARD`;
      
      case 'text':
        return formData.text || '';
      
      case 'email':
        const subject = formData.subject ? `?subject=${encodeURIComponent(formData.subject)}` : '';
        const body = formData.body ? `${subject ? '&' : '?'}body=${encodeURIComponent(formData.body)}` : '';
        return `mailto:${formData.email || ''}${subject}${body}`;
      
      case 'sms':
        const message = formData.message ? `?body=${encodeURIComponent(formData.message)}` : '';
        return `sms:${formData.phone || ''}${message}`;
      
      case 'phone':
        return `tel:${formData.phone || ''}`;
      
      default:
        return '';
    }
  };

//   const generateQRCode = async () => {
//     const data = generateQRData();
//     if (!data.trim()) return;

//     setIsGenerating(true);
//     try {
//       const canvas = canvasRef.current;
//       if (canvas) {
//         await QRCode.toCanvas(canvas, data, {
//           width: 300,
//           margin: 2,
//           color: {
//             dark: '#1F2937',
//             light: '#FFFFFF'
//           }
//         });
        
//         const dataUrl = canvas.toDataURL('image/png');
//         setQrCodeDataUrl(dataUrl);
//       }
//     } catch (error) {
//       console.error('Error generating QR code:', error);
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   useEffect(() => {
//     if (Object.keys(formData).length > 0) {
//       generateQRCode();
//     }
//   }, [formData, selectedType]);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const downloadQRCode = () => {
    // if (qrCodeDataUrl) {
    const qrElement = qrRef.current?.querySelector('canvas');

    

    if (qrElement) {
      const dataUrl = qrElement.toDataURL('image/png');
      const link = document.createElement('a');
      if(selectedType == "wifi") {
        link.download = `qrcode-${selectedType}-${formData.ssid.replace(/\s/g, "")}.png`;//formated to be qrcoe-type-ssid
      }else if (selectedType == "contact") {
        link.download = `qrcode-${selectedType}-${formData.firstName}${formData.lastName}.png`;//formated to be qrcoe-type-ssid
      }else if (selectedType == "email") {
        link.download = `qrcode-${selectedType}-${formData.email.replace(new RegExp(`\\${"@"}.*`), "")}.png`;//formated to be qrcoe-type-ssid
      }else {
        //Get current Date if needed
        const now: Date = new Date();
        const year: number = now.getFullYear(); // Get the full year (e.g., 2025)
        const month: number = now.getMonth(); // Get the month (0-indexed, so January is 0, September is 8)
        const day: number = now.getDate(); // Get the day of the month (1-31)

        //default name is corrent time
        link.download = `qrcode-${selectedType}-${year}-${month + 1}-${day}.png`;
      }

      link.href = dataUrl;
      link.click();
    }
  };

  const copyToClipboard = async () => {
    const data = generateQRData();
    if (data) {
      try {
        await navigator.clipboard.writeText(data);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const qrData = generateQRData();

  const hasData = qrData.trim().length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-muted border rounded-xl">
      
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate("/JRX-PortfolioProjects/")}
        className="mb-4 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-black rounded dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
      >
        ← Back
      </button>

      {/* Title  */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          QR Code Generator
        </h1> 
        <p className="text-gray-600 dark:text-violet-500 max-w-2xl mx-auto">
          Generate QR codes for websites, WiFi credentials, contact information, and more. 
          Perfect for sharing information quickly and efficiently.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Type Selection */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-violet-500 mb-4">Select Type</h2>
          <div className="space-y-2">
            {barcodeTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg border transition-colors text-left ${
                  selectedType === type.id
                    ? 'border-blue-500 bg-violet-200 text-violet-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {type.icon}
                <span className="font-medium">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-violet-500 mb-4">
            {currentType?.name} Details
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              {currentType?.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option === 'nopass' ? 'No Password' : option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : field.type === 'checkbox' ? (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData[field.name] === 'true'}
                        onChange={(e) => handleInputChange(field.name, e.target.checked.toString())}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">Hidden Network</span>
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* QR Code Preview */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-violet-500 mb-4">Preview & Download</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            {hasData ? (
              <div className="space-y-4">
                <div className="flex justify-center" ref={qrRef}>
                  <QRCodeCanvas
                    value={qrData}
                    size={300}
                    bgColor="#FFFFFF"
                    fgColor="#1F2937"
                    level="M"
                    className="border border-gray-200 rounded-lg"
                  />
                  {/* <img 
                    src={qrCodeDataUrl} 
                    alt="Generated QR Code"
                    className="border border-gray-200 rounded-lg"
                  /> */}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={downloadQRCode}
                    className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                  
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? 'Copied!' : 'Copy Data'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  {isGenerating ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  ) : (
                     <QrCode className="h-12 w-12 text-gray-400" />
                    //<QRCodeCanvas value="https://example.com" className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <p className="text-gray-500">
                  Fill out the form to generate your QR code
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}