/**
 * StudentPortfolioList Component
 * Display all certificates for a student
 */

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
    getStudentCertificates,
    getMyStudentCertificates,
    formatCertificate,
    getProficiencyLabel,
    daysUntilExpiration,
} from "../utils/certificateApi";
import CertificateDetail from "./CertificateDetail";
import "../styles/portfolio.css";

function StudentPortfolioList({ studentAddress = null, isAuthenticated = false }) {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCert, setSelectedCert] = useState(null);
    const [filter] = useState("all"); // all, active, expired, revoked

    const fetchCertificates = useCallback(async () => {
        setLoading(true);

        try {
            let response;

            // If authenticated, use the my-certificates endpoint
            if (isAuthenticated) {
                response = await getMyStudentCertificates();
            } else if (studentAddress) {
                // Otherwise, use the address-based endpoint
                response = await getStudentCertificates(studentAddress);
            } else {
                toast.error("Please enter a student Ethereum address");
                setLoading(false);
                return;
            }

            if (response.success && response.certificates) {
                setCertificates(response.certificates);
                if (response.certificates.length === 0) {
                    toast.info("No certificates found");
                } else {
                    toast.success(`✅ Loaded ${response.certificates.length} certificate(s)`);
                }
            } else {
                setCertificates([]);
                toast.info("No certificates found");
            }
        } catch (error) {
            setCertificates([]);
            toast.error(error.message || "Failed to fetch certificates");
        } finally {
            setLoading(false);
        }
    }, [studentAddress, isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated || studentAddress) {
            fetchCertificates();
        }
    }, [isAuthenticated, studentAddress, fetchCertificates]);

    const getFilteredCertificates = () => {
        return certificates.filter((cert) => {
            const daysLeft = daysUntilExpiration(cert.expires_at);
            const isValid = !cert.revoked && (cert.expires_at === null || daysLeft !== null);
            const isExpired = !cert.revoked && cert.expires_at !== null && daysLeft === null;
            const isRevoked = cert.revoked;

            switch (filter) {
                case "active":
                    return isValid;
                case "expired":
                    return isExpired;
                case "revoked":
                    return isRevoked;
                default:
                    return true;
            }
        });
    };

    const filteredCerts = getFilteredCertificates();

    return (
        <div className="portfolio-container">

            {/* Loading State */}
            {loading ? (
                <div className="loading-state">
                    <p>⏳ Loading certificates...</p>
                </div>
            ) : selectedCert ? (
                /* Detail View */
                <div className="portfolio-detail">
                    <button
                        onClick={() => setSelectedCert(null)}
                        className="btn-back"
                    >
                        ← Back to List
                    </button>
                    <CertificateDetail certificate={selectedCert} />
                </div>
            ) : filteredCerts.length > 0 ? (
                /* Certificate List */
                <div className="portfolio-list">
                    {filteredCerts.map((cert) => {
                        const formatted = formatCertificate(cert);
                        const daysLeft = daysUntilExpiration(cert.expires_at);
                        const statusClass = formatted.isRevoked
                            ? "revoked"
                            : formatted.isValid
                                ? "active"
                                : "expired";

                        return (
                            <div
                                key={cert.id}
                                className={`portfolio-item ${statusClass}`}
                                onClick={() => setSelectedCert(cert)}
                            >
                                <div className="item-header">
                                    <h4>{formatted.skillName}</h4>
                                    <div className="badges">
                                        <span className={`badge-proficiency ${formatted.proficiencyLevel.toLowerCase()}`}>
                                            {getProficiencyLabel(
                                                formatted.proficiencyLevel
                                            )}
                                        </span>
                                        {formatted.isRevoked && (
                                            <span className="badge-status revoked">
                                                REVOKED
                                            </span>
                                        )}
                                        {!formatted.isRevoked && !formatted.isValid && (
                                            <span className="badge-status expired">
                                                EXPIRED
                                            </span>
                                        )}
                                        {formatted.isValid && (
                                            <span className="badge-status active">
                                                VALID
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="item-details">
                                    <p>
                                        <strong>Student:</strong> {cert.student_id}
                                    </p>
                                    <p>
                                        <strong>Class:</strong> {cert.class_name}
                                    </p>
                                    <p>
                                        <strong>Issued:</strong> {formatted.issuedAt}
                                    </p>
                                    <p>
                                        <strong>Expires:</strong> {formatted.expiresAt}
                                    </p>
                                    {daysLeft && (
                                        <p className="days-left">
                                            ⏱️ {daysLeft} days remaining
                                        </p>
                                    )}
                                    {formatted.organizationName && (
                                        <p>
                                            <strong>Issuer:</strong>{" "}
                                            {formatted.organizationName}
                                        </p>
                                    )}
                                </div>

                                <div className="item-footer">
                                    <button
                                        className="btn-view-details"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedCert(cert);
                                        }}
                                    >
                                        View Details →
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : certificates.length > 0 ? (
                <div className="empty-state">
                    <p>
                        📭 No certificates match the current filter
                    </p>
                </div>
            ) : (
                <div className="empty-state">
                    <p>{studentAddress ? "📭 No certificates found" : isAuthenticated ? "📭 You have no certificates yet" : "🔍 Enter a student address to view their certificates"}</p>
                </div>
            )}
        </div>
    );
}

export default StudentPortfolioList;
