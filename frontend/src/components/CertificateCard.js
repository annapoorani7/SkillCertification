import React from "react";
import { downloadCertificatePDF } from "../utils/pdfGenerator";
import SCHOOL from "../utils/schoolInfo";

const CertificateCard = ({ certificate, showDownload = false }) => {
    return (
        <div className="certificate-card">
            <div className="watermark"></div>
            <div className="cert-header">
                <img src={SCHOOL.logo} alt="School Logo" style={{ width: "60px", height: "60px", marginBottom: "10px" }} />
                <h4 style={{ margin: "0 0 10px 0", color: "#666", textTransform: "uppercase", letterSpacing: "1px", fontSize: "14px" }}>
                    {SCHOOL.name}
                </h4>
                <h3>Certificate of Achievement</h3>
            </div>
            <div className="cert-body">
                <p>This certifies that</p>
                <h2 className="student-name">{certificate.studentName}</h2>
                <p>of Class</p>
                <h3 className="class-name">{certificate.className}</h3>
                <p>has successfully mastered</p>
                <h2 className="skill-name">{certificate.skill}</h2>
            </div>
            <div className="cert-footer">
                <div className="issuer">
                    <span>Issued by:</span> {certificate.issuedBy}
                </div>
                <div className="date">
                    <span>Date:</span>{" "}
                    {new Date(Number(certificate.issuedOn) * 1000).toLocaleDateString()}
                </div>
            </div>
            {showDownload && (
                <button className="download-btn" onClick={async () => await downloadCertificatePDF(certificate)}>
                    Download PDF
                </button>
            )}
        </div>
    );
};

export default CertificateCard;
