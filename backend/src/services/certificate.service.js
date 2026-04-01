/**
 * Certificate Service
 * Business logic for certificate management
 */

const certificateRepository = require('../repositories/certificate.repository');
const crypto = require('crypto');

class CertificateService {
    /**
     * Generate a certificate hash from certificate data
     */
    generateCertificateHash(data) {
        return crypto.createHash('sha256')
            .update(JSON.stringify(data))
            .digest('hex');
    }

    /**
     * Issue a certificate
     */
    async issueCertificate(issuerId, studentId, skillId, proficiencyLevel, expirationDate, organizationId) {
        try {
            // Prepare certificate data
            const certificateData = {
                studentId,
                skillId,
                proficiencyLevel,
                issuedAt: new Date(),
                expirationDate: new Date(expirationDate * 1000)
            };

            const certificateHash = this.generateCertificateHash(certificateData);

            // Get skill name from database
            const skill = await certificateRepository.getSkillById(skillId);
            if (!skill) {
                throw new Error('Skill not found');
            }

            // Save certificate record to database
            const dbCertificate = await certificateRepository.createCertificate({
                student_id: studentId,
                skill_id: skillId,
                issuer_id: issuerId,
                organization_id: organizationId,
                proficiency_level: proficiencyLevel,
                certificate_hash: certificateHash,
                issued_at: new Date(),
                expires_at: new Date(expirationDate * 1000),
                revoked: false,
                revocation_reason: null
            });

            return {
                success: true,
                certificate: dbCertificate,
                message: 'Certificate issued successfully'
            };
        } catch (error) {
            console.error('Error issuing certificate:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Verify a certificate
     */
    async verifyCertificate(certificateId) {
        try {
            // Get certificate from database
            const dbCert = await certificateRepository.getCertificateById(certificateId);
            if (!dbCert) {
                return {
                    success: false,
                    error: 'Certificate not found'
                };
            }

            return {
                success: true,
                certificate: {
                    id: dbCert.id,
                    skillName: dbCert.skill_name,
                    studentId: dbCert.student_id,
                    issuerId: dbCert.issuer_id,
                    proficiencyLevel: dbCert.proficiency_level,
                    issuedAt: dbCert.issued_at,
                    expiresAt: dbCert.expires_at,
                    isRevoked: dbCert.revoked,
                    revocationReason: dbCert.revocation_reason,
                    status: dbCert.revoked ? 'revoked' : (new Date(dbCert.expires_at) < new Date() ? 'expired' : 'valid')
                }
            };
        } catch (error) {
            console.error('Error verifying certificate:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Revoke a certificate
     */
    async revokeCertificate(certificateId, revocationReason) {
        try {
            // Get certificate from database
            const dbCert = await certificateRepository.getCertificateById(certificateId);
            if (!dbCert) {
                return {
                    success: false,
                    error: 'Certificate not found'
                };
            }

            if (dbCert.revoked) {
                return {
                    success: false,
                    error: 'Certificate is already revoked'
                };
            }

            // Update database record
            const updated = await certificateRepository.updateCertificate(certificateId, {
                revoked: true,
                revocation_reason: revocationReason,
                revocation_date: new Date()
            });

            return {
                success: true,
                certificate: updated,
                message: 'Certificate revoked successfully'
            };
        } catch (error) {
            console.error('Error revoking certificate:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get student's certificates
     */
    async getStudentCertificates(studentAddress) {
        try {
            const dbCertificates = await certificateRepository.getCertificatesByStudent(studentAddress);

            return {
                success: true,
                studentAddress,
                certificateCount: dbCertificates.length,
                certificates: dbCertificates.map(cert => ({
                    id: cert.id,
                    skillName: cert.skill_name,
                    proficiencyLevel: cert.proficiency_level,
                    issuedAt: cert.issued_at,
                    expiresAt: cert.expires_at,
                    issuerName: cert.organization_name,
                    status: cert.revoked ? 'revoked' : (new Date(cert.expires_at) < new Date() ? 'expired' : 'valid')
                }))
            };
        } catch (error) {
            console.error('Error getting student certificates:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get certificates for authenticated student by username
     */
    async getStudentCertificatesByUsername(username) {
        try {
            const dbCertificates = await certificateRepository.getCertificatesByUsername(username);

            return {
                success: true,
                certificateCount: dbCertificates.length,
                certificates: dbCertificates.map(cert => ({
                    id: cert.id,
                    skillName: cert.skill_name,
                    proficiencyLevel: cert.proficiency_level,
                    issuedAt: cert.issued_at,
                    expiresAt: cert.expires_at,
                    issuerName: cert.organization_name,
                    status: cert.revoked ? 'revoked' : (new Date(cert.expires_at) < new Date() ? 'expired' : 'valid')
                }))
            };
        } catch (error) {
            console.error('Error getting student certificates by username:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new CertificateService();
