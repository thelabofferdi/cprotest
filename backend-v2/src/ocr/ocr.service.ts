import { Injectable } from '@nestjs/common';
import { createWorker } from 'tesseract.js';

export interface MomoSmsData {
  montant?: number;
  reference?: string;
  telephone?: string;
  operator?: 'MTN' | 'MOOV';
  extractedText: string;
  confidence: number;
}

@Injectable()
export class OcrService {
  // Extraire texte d'une image avec Tesseract
  async extractText(imagePath: string, lang = 'fra'): Promise<string> {
    const worker = await createWorker(lang);

    try {
      const {
        data: { text },
      } = await worker.recognize(imagePath);
      return text;
    } finally {
      await worker.terminate();
    }
  }

  // Parser un SMS Mobile Money
  parseMomoSms(text: string): MomoSmsData {
    const result: MomoSmsData = {
      extractedText: text,
      confidence: 0,
    };

    // Détection opérateur
    if (/MTN|MoMo|Mobile\s*Money/i.test(text)) {
      result.operator = 'MTN';
    } else if (/MOOV|Flooz/i.test(text)) {
      result.operator = 'MOOV';
    }

    // Extraction montant (patterns communs)
    const montantPatterns = [
      /montant[:\s]+(\d[\d\s,.]+)/i, // "Montant: 50 000"
      /(\d[\d\s,.]+)\s*F(?:CFA)?/i, // "50 000 FCFA"
      /recu[:\s]+(\d[\d\s,.]+)/i, // "Reçu: 50000"
      /envoye[:\s]+(\d[\d\s,.]+)/i, // "Envoyé: 50000"
    ];

    for (const pattern of montantPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const cleaned = match[1].replace(/[\s,]/g, '');
        const montant = parseFloat(cleaned);
        if (!isNaN(montant) && montant > 0) {
          result.montant = montant;
          result.confidence += 30;
          break;
        }
      }
    }

    // Extraction référence (patterns MTN/Moov)
    const refPatterns = [
      /(?:ref|reference)[:\s]*([A-Z]{2}\d{6}\.\d{4}\.[A-Z0-9]+)/i, // MP240605.1234.A12345
      /(?:transaction|trans|ID)[:\s]*([A-Z0-9]{10,})/i, // ID générique
      /([A-Z]{2}\d{12,})/i, // Code alphanumérique long
    ];

    for (const pattern of refPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        result.reference = match[1].toUpperCase();
        result.confidence += 25;
        break;
      }
    }

    // Extraction téléphone
    const phonePatterns = [
      /(?:de|from|emetteur)[:\s]*(\+?229\s*\d{2}\s*\d{2}\s*\d{2}\s*\d{2})/i,
      /(\+?229\s*\d{8})/i,
      /(\d{2}\s*\d{2}\s*\d{2}\s*\d{2})/i, // Format court
    ];

    for (const pattern of phonePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        result.telephone = match[1].replace(/\s/g, '');
        if (!result.telephone.startsWith('+')) {
          result.telephone = '+229' + result.telephone;
        }
        result.confidence += 20;
        break;
      }
    }

    // Boost confidence si opérateur détecté
    if (result.operator) {
      result.confidence += 25;
    }

    return result;
  }

  // Pipeline complet : image → données MoMo
  async extractMomoData(imagePath: string): Promise<MomoSmsData> {
    // 1. OCR
    const text = await this.extractText(imagePath, 'fra');

    // 2. Parse
    const data = this.parseMomoSms(text);

    return data;
  }
}
