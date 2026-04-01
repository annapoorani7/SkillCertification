import { jsPDF } from "jspdf";
import { generateQRCode } from "./qrGenerator";
import SCHOOL from "./schoolInfo";


export const downloadCertificatePDF = async (certificate) => {
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [800, 600],
    });

    // Generate Verification URL and QR Code
    const verifyUrl = `${window.location.origin}/verify?id=${certificate.id}`;
    const qrCodeDataUrl = await generateQRCode(verifyUrl);

    // Background color
    doc.setFillColor(255, 255, 240); // Light cream color
    doc.rect(0, 0, 800, 600, "F");

    // Border
    doc.setLineWidth(10);
    doc.setDrawColor(26, 35, 126); // School Navy Blue border (#1a237e)
    doc.rect(20, 20, 760, 560);

    // Inner Border
    doc.setLineWidth(2);
    doc.setDrawColor(218, 165, 32); // Gold inner border
    doc.rect(30, 30, 740, 540);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.setTextColor(26, 35, 126); // Navy blue text
    doc.text("Certificate of Achievement", 400, 100, { align: "center" });

    // School Name & Tagline under title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(50, 50, 50);
    doc.text(SCHOOL.name.toUpperCase(), 400, 130, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(12);
    doc.setTextColor(218, 165, 32); // Gold
    doc.text(SCHOOL.tagline, 400, 145, { align: "center" });

    // Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(20);
    doc.setTextColor(100, 100, 100);
    doc.text("This is to certify that", 400, 160, { align: "center" });

    // Student Name
    doc.setFont("times", "bolditalic");
    doc.setFontSize(50);
    doc.setTextColor(0, 0, 0);
    doc.text(certificate.studentName, 400, 230, { align: "center" });

    // Body text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(20);
    doc.setTextColor(100, 100, 100);
    if (certificate.className) {
        const classLine = certificate.section ? `from Class: ${certificate.className} (Section ${certificate.section})` : `from Class: ${certificate.className}`;
        doc.text(classLine, 400, 270, { align: "center" });
    }
    if (certificate.registerNumber) {
        doc.text(`Register Number: ${certificate.registerNumber}`, 400, 290, { align: "center" });
    }
    doc.text("has successfully mastered the skill", 400, certificate.registerNumber ? 330 : 310, { align: "center" });

    // Skill
    doc.setFont("helvetica", "bold");
    doc.setFontSize(35);
    doc.setTextColor(30, 30, 30);
    doc.text(certificate.skill, 400, certificate.registerNumber ? 390 : 370, { align: "center" });

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(15);
    doc.setTextColor(100, 100, 100);
    // Explicitly using the school as the primary issuer, with admin signature/name
    doc.text(`Issued by: ${SCHOOL.fullTitle} (${certificate.issuedBy})`, 60, 480);
    doc.text(
        `Date: ${certificate.issuedOn ? new Date(Number(certificate.issuedOn) * 1000).toLocaleDateString() : 'N/A'}`,
        60,
        500
    );

    // QR Code Placement
    if (qrCodeDataUrl) {
        doc.addImage(qrCodeDataUrl, "PNG", 650, 440, 90, 90);
        doc.setFontSize(10);
        doc.text("Scan to Verify", 695, 540, { align: "center" });
    }

    // ID
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Certificate ID: ${certificate.id}`, 400, 570, { align: "center" });

    doc.save(`${certificate.studentName}_${certificate.skill}_Certificate.pdf`);
};
