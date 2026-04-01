/**
 * CertificateDetail Component
 * Displays detailed information about a certificate including blockchain details
 */

import React from "react";
import {
    formatCertificate,
    getProficiencyLabel,
    daysUntilExpiration,
} from "../utils/certificateApi";
import "../styles/certificate.css";

function CertificateDetail({ certificate, onRevoke = null }) {
    if (!certificate) {
        return <div className="cert-detail">Certificate not found</div>;
    }

    const formatted = formatCertificate(certificate);
    const daysLeft = daysUntilExpiration(certificate.expires_at);

    return (
        <div className="certificate-detail-card">
            {/* Header */}
            <div className="cert-header">
                <div className="cert-header-content">
                    <h3>{formatted.skillName}</h3>
                    <div className="cert-badges">
                        <span className="badge-proficiency">
                            {getProficiencyLabel(formatted.proficiencyLevel)}
                        </span>
                        {formatted.isRevoked && (
                            <span className="badge-revoked">REVOKED</span>
                        )}
                        {!formatted.isRevoked && formatted.isValid && (
                            <span className="badge-valid">VALID</span>
                        )}
                        {!formatted.isRevoked && !formatted.isValid && (
                            <span className="badge-expired">EXPIRED</span>
                        )}
                    </div>
                </div>
                {formatted.isValid && daysLeft && (
                    <div className="cert-expiration">
                        <span className="exp-label">Expires in</span>
                        <span className="exp-days">{daysLeft} days</span>
                    </div>
                )}
            </div>

            {/* Main Details */}
            <div className="cert-details-grid">
                <div className="cert-detail-item">
                    <label>Organization</label>
                    <p>{formatted.organizationName || "N/A"}</p>
                </div>
                <div className="cert-detail-item">
                    <label>Student Name</label>
                    <p>{formatted.studentAddress}</p>
                </div>
                <div className="cert-detail-item">
                    <label>Class</label>
                    <p>{formatted.className || "N/A"}</p>
                </div>
                <div className="cert-detail-item">
                    <label>Issued Date</label>
                    <p>{formatted.issuedAt}</p>
                </div>
                <div className="cert-detail-item">
                    <label>Expiration Date</label>
                    <p>{formatted.expiresAt}</p>
                </div>
            </div>

            {/* Actions */}
            {formatted.isValid && onRevoke && (
                <div className="cert-actions">
                    <button
                        className="btn-revoke"
                        onClick={() => onRevoke(formatted.id)}
                    >
                        Revoke Certificate
                    </button>
                </div>
            )}
        </div>
    );
}

export default CertificateDetail;
