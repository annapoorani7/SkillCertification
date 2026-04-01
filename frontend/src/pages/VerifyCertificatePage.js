import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import * as pdfjs from "pdfjs-dist";
import "../App.css";

// Set worker source for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function VerifyCertificatePage() {
    const [certId, setCertId] = useState("");
    const [loading, setLoading] = useState(false);
    const [certificate, setCertificate] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef(null);

    const handleVerify = async (idToVerify) => {
        const id = idToVerify || certId;
        if (!id) {
            toast.warning("Please enter a Certificate ID or upload a PDF");
            return;
        }

        setLoading(true);
        setCertificate(null);
        try {
            const res = await api.get(`/verify/${id}`);
            setCertificate(res.data.certificate);
            toast.success("Certificate Verified!");
        } catch (err) {
            console.error("Verification error:", err);
            toast.error(err.response?.data?.error || "Certificate not found or invalid");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("Please upload a PDF file");
            return;
        }

        setIsProcessing(true);
        setCertificate(null);
        setCertId("");

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            const page = await pdf.getPage(1);

            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;

            // Convert canvas to blob/file for html5-qrcode
            canvas.toBlob(async (blob) => {
                const imageFile = new File([blob], "cert-page.png", { type: "image/png" });

                const html5QrCode = new Html5Qrcode("reader-hidden");
                try {
                    const decodedText = await html5QrCode.scanFile(imageFile, false);
                    console.log("Decoded Text:", decodedText);
                    processDecodedText(decodedText);
                } catch (err) {
                    console.error("QR Scan Error:", err);
                    toast.error("Could not find a valid QR code in the PDF. Please ensure the QR code is clear and visible.");
                } finally {
                    setIsProcessing(false);
                    // Reset file input
                    if (fileInputRef.current) fileInputRef.current.value = "";
                }
            }, "image/png");

        } catch (err) {
            console.error("PDF Processing Error:", err);
            toast.error("Failed to process PDF file. Please try again.");
            setIsProcessing(false);
        }
    };

    const processDecodedText = (text) => {
        try {
            const url = new URL(text);
            const id = url.searchParams.get("id");
            if (id) {
                setCertId(id);
                handleVerify(id);
            } else {
                setCertId(text);
                handleVerify(text);
            }
        } catch (e) {
            setCertId(text);
            handleVerify(text);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>Verify Certificate</h1>
                    <p>Validate certificate authenticity by uploading the PDF or entering the unique ID.</p>
                </div>
            </div>

            <div className="grid-2">
                <motion.div
                    className="card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h3>Verification Methods</h3>
                    <div className="form-stack">
                        <div className="form-group">
                            <label>Upload Certificate (PDF)</label>
                            <div
                                className="upload-zone"
                                onClick={() => fileInputRef.current.click()}
                                style={{
                                    border: "2px dashed #1a237e",
                                    borderRadius: "12px",
                                    padding: "30px",
                                    textAlign: "center",
                                    cursor: "pointer",
                                    backgroundColor: isProcessing ? "#f0f0f0" : "#f8f9ff",
                                    transition: "all 0.3s ease"
                                }}
                            >
                                <div style={{ fontSize: "40px", marginBottom: "10px", color: "#1a237e" }}>
                                    {isProcessing ? "Processing..." : "Select File"}
                                </div>
                                <strong>{isProcessing ? "Processing PDF..." : "Click to Upload PDF"}</strong>
                                <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                                    We'll automatically scan the QR code from your PDF
                                </p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".pdf"
                                    style={{ display: "none" }}
                                />
                            </div>
                        </div>

                        <div style={{ textAlign: "center", margin: "20px 0", color: "#888" }}>
                            <span>— OR —</span>
                        </div>

                        <div className="form-group">
                            <label>Certificate Unique ID</label>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <input
                                    type="text"
                                    className="capsule-input"
                                    placeholder="Enter ID manually"
                                    value={certId}
                                    onChange={(e) => setCertId(e.target.value)}
                                />
                                <button
                                    className={`capsule-button ${loading ? "loading" : ""}`}
                                    onClick={() => handleVerify()}
                                    disabled={loading || isProcessing}
                                >
                                    {loading ? "..." : "Verify"}
                                </button>
                            </div>
                        </div>

                        {/* Hidden element for QR scanner to use */}
                        <div id="reader-hidden" style={{ display: "none" }}></div>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {certificate ? (
                        <motion.div
                            key="cert-result"
                            className="card success-card"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div style={{ textAlign: "center", padding: "10px" }}>
                                <div style={{ fontSize: "40px", marginBottom: "10px", color: "#2e7d32" }}>✓</div>
                                <h3 style={{ color: "#2e7d32" }}>Verified Authenticity</h3>
                                <p style={{ color: "#666", fontSize: "14px" }}>This certificate is valid and registered in our system.</p>

                                <div className="cert-viz" style={{
                                    marginTop: "20px",
                                    padding: "20px",
                                    background: "#fff",
                                    borderRadius: "12px",
                                    textAlign: "left",
                                    border: "1px solid #e0e0e0",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                }}>
                                    <div style={{ marginBottom: "12px" }}>
                                        <label style={{ fontSize: "11px", color: "#999", textTransform: "uppercase" }}>Student Name</label>
                                        <div style={{ fontWeight: "bold", fontSize: "18px" }}>{certificate.studentName}</div>
                                    </div>
                                    <div style={{ display: "flex", gap: "20px", marginBottom: "12px" }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: "11px", color: "#999", textTransform: "uppercase" }}>Class</label>
                                            <div style={{ fontWeight: "600" }}>{certificate.className}</div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: "11px", color: "#999", textTransform: "uppercase" }}>Skill</label>
                                            <div style={{ fontWeight: "600", color: "#1a237e" }}>{certificate.skill}</div>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: "12px" }}>
                                        <label style={{ fontSize: "11px", color: "#999", textTransform: "uppercase" }}>Issued By</label>
                                        <div style={{ fontWeight: "600" }}>{certificate.issuedBy}</div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: "11px", color: "#999", textTransform: "uppercase" }}>Issued Date</label>
                                        <div style={{ fontWeight: "600" }}>
                                            {certificate.issuedOn ? new Date(Number(certificate.issuedOn) * 1000).toLocaleDateString() : "N/A"}
                                        </div>
                                    </div>
                                    <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px dashed #eee", textAlign: "center" }}>
                                        <span style={{ fontSize: "10px", color: "#ccc" }}>CERTIFICATE ID: {certificate.id}</span>
                                    </div>
                                </div>

                                <button
                                    className="capsule-button secondary"
                                    style={{ marginTop: "20px" }}
                                    onClick={() => {
                                        setCertificate(null);
                                        setCertId("");
                                    }}
                                >
                                    Verify Another
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty-state"
                            className="card"
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "350px", color: "#bbb", border: "2px dashed #eee" }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "50px", marginBottom: "10px", color: "#bbb" }}>...</div>
                                <p>{isProcessing ? "Reading certificate..." : "Verification results will appear here"}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default VerifyCertificatePage;
