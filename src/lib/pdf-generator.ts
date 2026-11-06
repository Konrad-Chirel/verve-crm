import jsPDF from 'jspdf';
import { type Deal } from '@/lib/mock-data';
import { type UserProfile } from '@/context/crm-context';
import { formatCurrency } from '@/lib/utils';

export function generateContractPDF(deal: Deal, profile: UserProfile) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2; // 174mm

  // Palette: Deep Forest Emerald + Warm Editorial Grays
  const cEmerald = [4, 120, 87]; // #047857
  const cDeepEmerald = [6, 78, 59]; // #064E3B
  const cCharcoal = [17, 24, 39]; // #111827
  const cSlate = [100, 116, 139]; // #64748B
  const cLightBg = [248, 250, 252]; // #F8FAFC
  const cMintBg = [236, 253, 245]; // #ECFDF5
  const cBorder = [226, 232, 240]; // #E2E8F0
  const cLightBorder = [241, 245, 249]; // #F1F5F9

  let y = 16;

  // ==========================================
  // 1. EXECUTIVE LETTERHEAD & MONOGRAM
  // ==========================================
  // Monogram square
  doc.setFillColor(cEmerald[0], cEmerald[1], cEmerald[2]);
  doc.roundedRect(margin, y, 11, 11, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('V', margin + 3.4, y + 7.8);

  // Firm title & descriptor
  doc.setTextColor(cCharcoal[0], cCharcoal[1], cCharcoal[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(profile.agency.toUpperCase(), margin + 15, y + 5);

  doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Cabinet de Conseil en Stratégie, Produit & Ingénierie Numérique', margin + 15, y + 9.5);

  // Document metadata on the right
  const todayStr = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const refCode = `MND-${deal.id.replace('deal-', '').toUpperCase()}-2026`;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(cEmerald[0], cEmerald[1], cEmerald[2]);
  doc.text('LETTRE DE MISSION EXÉCUTIVE', pageWidth - margin, y + 4.8, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
  doc.text(`Réf : ${refCode}`, pageWidth - margin, y + 9, { align: 'right' });
  doc.text(`Date d'émission : ${todayStr}`, pageWidth - margin, y + 13, { align: 'right' });

  // Top separator rule
  y += 16;
  doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  // ==========================================
  // 2. STAKEHOLDERS CARTUCHE (2 COLUMNS)
  // ==========================================
  y += 6;
  const boxH = 34;
  doc.setFillColor(cLightBg[0], cLightBg[1], cLightBg[2]);
  doc.roundedRect(margin, y, contentWidth, boxH, 2, 2, 'F');
  doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
  doc.roundedRect(margin, y, contentWidth, boxH, 2, 2, 'S');

  // Left: Client
  const col1X = margin + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(cEmerald[0], cEmerald[1], cEmerald[2]);
  doc.text('ORGANISATION BÉNÉFICIAIRE', col1X, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(cCharcoal[0], cCharcoal[1], cCharcoal[2]);
  doc.text(deal.companyName, col1X, y + 12.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
  doc.text(`${deal.contactName} — ${deal.contactRole}`, col1X, y + 17.5);
  doc.text(`${deal.contactEmail || 'contact@client.fr'} • ${deal.contactPhone || '+33 1 40 50 60 70'}`, col1X, y + 22.5);
  doc.text(`${deal.companySector || 'Services B2B'} • Siège : ${deal.companyCity || 'Paris'}`, col1X, y + 27.5);

  // Vertical Separator
  const midX = margin + contentWidth / 2;
  doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
  doc.line(midX, y + 4, midX, y + boxH - 4);

  // Right: Firm & Representative
  const col2X = midX + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(cEmerald[0], cEmerald[1], cEmerald[2]);
  doc.text('CABINET DE CONSEIL & ÉMETTEUR', col2X, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(cCharcoal[0], cCharcoal[1], cCharcoal[2]);
  doc.text(profile.agency, col2X, y + 12.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
  doc.text(`${profile.name} — ${profile.role}`, col2X, y + 17.5);
  doc.text(`${profile.email} • Ligne partenaire certifiée`, col2X, y + 22.5);
  doc.text('Immatriculation RCS Paris • SAS au capital de 50 000 €', col2X, y + 27.5);

  // ==========================================
  // 3. MISSION TITLE & STRATEGIC CONTEXT
  // ==========================================
  y += boxH + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(cEmerald[0], cEmerald[1], cEmerald[2]);
  doc.text('OBJET DU MANDAT & PROPOSITION COMMERCIALE', margin, y);

  y += 5.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(cCharcoal[0], cCharcoal[1], cCharcoal[2]);
  const splitTitle = doc.splitTextToSize(deal.title, contentWidth);
  doc.text(splitTitle, margin, y);
  y += splitTitle.length * 5.5;

  // Section 1: Scope & Methodology
  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(cCharcoal[0], cCharcoal[1], cCharcoal[2]);
  doc.text('1. Contexte d’intervention & Objectifs prioritaires', margin, y);

  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);

  const defaultContext =
    deal.notes ||
    `Dans le cadre du développement stratégique de ${deal.companyName}, la présente mission vise à concevoir, structurer et déployer des dispositifs à haute valeur ajoutée. L'intervention est articulée autour d'exigences strictes de qualité, d'alignement avec les comités de direction et d'un calendrier d'exécution maîtrisé.`;
  const splitNotes = doc.splitTextToSize(defaultContext, contentWidth);
  doc.text(splitNotes, margin, y);
  y += splitNotes.length * 4.2 + 3;

  // Methodology deliverables bullets
  const bullets = [
    '• Diagnostic exhaustif des flux, analyse des besoins métiers et formalisation des spécifications cibles.',
    '• Conception ergonomique, architecture applicative et développement opérationnel par nos équipes seniors.',
    '• Recette fonctionnelle rigoureuse, transfert de compétences et accompagnement continu à la mise en production.',
  ];
  bullets.forEach((b) => {
    doc.text(b, margin + 2, y);
    y += 4.2;
  });

  // ==========================================
  // 4. FINANCIAL BREAKDOWN & PHASING TABLE
  // ==========================================
  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(cCharcoal[0], cCharcoal[1], cCharcoal[2]);
  doc.text('2. Décomposition des honoraires par phase d’exécution', margin, y);

  y += 4.5;
  const colDescW = 112;
  const colRatioW = 26;
  const colAmountW = 36;

  // Table Header
  doc.setFillColor(cLightBg[0], cLightBg[1], cLightBg[2]);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
  doc.line(margin, y + 7, margin + contentWidth, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(cCharcoal[0], cCharcoal[1], cCharcoal[2]);
  doc.text('Phase contractuelle & Livrables associés', margin + 3, y + 4.8);
  doc.text('Quote-part', margin + colDescW + 3, y + 4.8);
  doc.text('Montant HT', margin + contentWidth - 3, y + 4.8, { align: 'right' });

  // Rows
  const p1 = Math.round(deal.amount * 0.3);
  const p2 = Math.round(deal.amount * 0.45);
  const p3 = deal.amount - p1 - p2;

  const tableRows = [
    {
      title: 'Phase 1 : Cadrage stratégique, audit des flux & spécifications cibles',
      ratio: '30 %',
      amount: formatCurrency(p1),
    },
    {
      title: 'Phase 2 : Conception technique, architecture logicielle & développement',
      ratio: '45 %',
      amount: formatCurrency(p2),
    },
    {
      title: 'Phase 3 : Recette opérationnelle, transfert de compétences & déploiement',
      ratio: '25 %',
      amount: formatCurrency(p3),
    },
  ];

  y += 7;
  tableRows.forEach((r, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(252, 252, 253);
      doc.rect(margin, y, contentWidth, 7.5, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(cCharcoal[0], cCharcoal[1], cCharcoal[2]);
    doc.text(r.title, margin + 3, y + 5);

    doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
    doc.text(r.ratio, margin + colDescW + 3, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(cCharcoal[0], cCharcoal[1], cCharcoal[2]);
    doc.text(r.amount, margin + contentWidth - 3, y + 5, { align: 'right' });

    y += 7.5;
    doc.setDrawColor(cLightBorder[0], cLightBorder[1], cLightBorder[2]);
    doc.line(margin, y, margin + contentWidth, y);
  });

  // Financial Subtotals
  const vat = Math.round(deal.amount * 0.2);
  const ttc = deal.amount + vat;

  y += 2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
  doc.text('Total Honoraires Hors Taxes (HT) :', margin + colDescW + 5, y + 4.5, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(cCharcoal[0], cCharcoal[1], cCharcoal[2]);
  doc.text(formatCurrency(deal.amount), margin + contentWidth - 3, y + 4.5, { align: 'right' });

  y += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.text('TVA légale applicable (20 %) :', margin + colDescW + 5, y + 4.5, { align: 'right' });
  doc.text(formatCurrency(vat), margin + contentWidth - 3, y + 4.5, { align: 'right' });

  // Full-width Executive TTC Banner
  y += 6.5;
  doc.setFillColor(cEmerald[0], cEmerald[1], cEmerald[2]);
  doc.roundedRect(margin, y, contentWidth, 9, 1.5, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('MONTANT TOTAL DU MANDAT (TTC) :', margin + 6, y + 6);
  doc.setFontSize(11);
  doc.text(formatCurrency(ttc), margin + contentWidth - 6, y + 6.2, { align: 'right' });

  // ==========================================
  // 5. CONTRACTUAL TERMS (3-BOX ROW)
  // ==========================================
  y += 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(cCharcoal[0], cCharcoal[1], cCharcoal[2]);
  doc.text('3. Modalités d’exécution & Conditions contractuelles', margin, y);

  y += 4.5;
  const termBoxW = (contentWidth - 6) / 3; // 56mm
  const termBoxH = 22;

  const termsData = [
    {
      title: 'ÉCHÉANCIER DE FACTURATION',
      desc: '40 % d’acompte à la commande\n60 % au solde à la recette finale\nRèglement sous 30 jours nets.',
    },
    {
      title: 'CALENDRIER D’EXÉCUTION',
      desc: `Durée prévisionnelle : 8 semaines\nLancement sous 5 jours ouvrés\nValidité offre : ${deal.nextActionDate || '30 jours'}.`,
    },
    {
      title: 'CONFIDENTIALITÉ & DROITS',
      desc: 'Secret professionnel strict\nCession exclusive des livrables\nProtection intégrale des données.',
    },
  ];

  termsData.forEach((t, i) => {
    const bx = margin + i * (termBoxW + 3);
    doc.setFillColor(cLightBg[0], cLightBg[1], cLightBg[2]);
    doc.roundedRect(bx, y, termBoxW, termBoxH, 1.5, 1.5, 'F');
    doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
    doc.roundedRect(bx, y, termBoxW, termBoxH, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(cEmerald[0], cEmerald[1], cEmerald[2]);
    doc.text(t.title, bx + 3.5, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
    const splitDesc = doc.splitTextToSize(t.desc, termBoxW - 7);
    doc.text(splitDesc, bx + 3.5, y + 9.5);
  });

  // ==========================================
  // 6. FORMAL SIGNATURE BLOCKS (SIDE-BY-SIDE)
  // ==========================================
  y += termBoxH + 7;
  const sigW = (contentWidth - 6) / 2; // 84mm
  const sigH = 36;

  // Box 1: Cabinet
  doc.setFillColor(cLightBg[0], cLightBg[1], cLightBg[2]);
  doc.roundedRect(margin, y, sigW, sigH, 2, 2, 'F');
  doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
  doc.roundedRect(margin, y, sigW, sigH, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(cEmerald[0], cEmerald[1], cEmerald[2]);
  doc.text(`Pour le Cabinet ${profile.agency}`, margin + 5, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(cCharcoal[0], cCharcoal[1], cCharcoal[2]);
  doc.text(`${profile.name}`, margin + 5, y + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
  doc.text(`${profile.role} • Associé signataire`, margin + 5, y + 15.5);

  // Digital verification stamp inside signature box
  doc.setFillColor(cMintBg[0], cMintBg[1], cMintBg[2]);
  doc.roundedRect(margin + 5, y + 19, sigW - 10, 12, 1.5, 1.5, 'F');
  doc.setDrawColor(cEmerald[0], cEmerald[1], cEmerald[2]);
  doc.roundedRect(margin + 5, y + 19, sigW - 10, 12, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(cDeepEmerald[0], cDeepEmerald[1], cDeepEmerald[2]);
  doc.text('VISA ÉLECTRONIQUE CONFORME', margin + 8, y + 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
  doc.text(`Clé certifiée : VERVE-MND-${deal.id.toUpperCase()} • ${todayStr}`, margin + 8, y + 28);

  // Box 2: Client
  const sig2X = margin + sigW + 6;
  doc.setFillColor(cLightBg[0], cLightBg[1], cLightBg[2]);
  doc.roundedRect(sig2X, y, sigW, sigH, 2, 2, 'F');
  doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
  doc.roundedRect(sig2X, y, sigW, sigH, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(cEmerald[0], cEmerald[1], cEmerald[2]);
  doc.text(`Pour le Client ${deal.companyName}`, sig2X + 5, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(cCharcoal[0], cCharcoal[1], cCharcoal[2]);
  doc.text(`${deal.contactName}`, sig2X + 5, y + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
  doc.text(`${deal.contactRole} • Décideur habilité`, sig2X + 5, y + 15.5);
  doc.text('Mention manuscrite : « Bon pour accord et commande »', sig2X + 5, y + 20);
  doc.text('Date et signature :', sig2X + 5, y + 24.5);

  // Client signature line
  doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
  doc.setLineWidth(0.3);
  doc.line(sig2X + 5, y + 31, sig2X + sigW - 5, y + 31);

  // ==========================================
  // 7. LEGAL FOOTER
  // ==========================================
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(cSlate[0], cSlate[1], cSlate[2]);
  const footerText = `${profile.agency} SAS au capital de 50 000 € • Réf. ${refCode} • Document strictement confidentiel • Page 1 sur 1`;
  doc.text(footerText, pageWidth / 2, pageHeight - 9, { align: 'center' });

  // Download PDF file
  const filename = `Proposition_${deal.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_2026.pdf`;
  doc.save(filename);
  return filename;
}
