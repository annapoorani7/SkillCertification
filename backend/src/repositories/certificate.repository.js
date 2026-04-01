/**
 * Certificate Repository
 * Data access layer for certificates
 */

// const db = require('../../db');
// const crypto = require('crypto');

// class CertificateRepository {
//     /**
//      * Create a certificate record
//      */
//     async createCertificate(certificateData) {
//         const query = `
//             INSERT INTO certificates (
//                 id, student_id, skill_id, issuer_id, organization_id,
//                 proficiency_level, certificate_hash, metadata_uri,
//                 blockchain_tx_hash, blockchain_token_id,
//                 issued_at, expires_at, revoked, revocation_reason, created_at
//             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
//             RETURNING *
//         `;

//         const values = [
//             crypto.randomUUID(),
//             certificateData.student_id,
//             certificateData.skill_id,
//             certificateData.issuer_id,
//             certificateData.organization_id,
//             certificateData.proficiency_level,
//             certificateData.certificate_hash,
//             certificateData.metadata_uri,
//             certificateData.blockchain_tx_hash || null,
//             certificateData.blockchain_token_id || null,
//             certificateData.issued_at,
//             certificateData.expires_at,
//             certificateData.revoked || false,
//             certificateData.revocation_reason || null,
//             new Date()
//         ];

//         try {
//             const result = await db.query(query, values);
//             return result.rows[0];
//         } catch (error) {
//             console.error('Error creating certificate in database:', error);
//             throw error;
//         }
//     }

//     /**
//      * Get certificate by ID
//      */
//     async getCertificateById(certificateId) {
//         const query = `
//             SELECT c.*, s.name as skill_name, o.name as organization_name
//             FROM certificates c
//             LEFT JOIN skills s ON c.skill_id = s.id
//             LEFT JOIN organizations o ON c.organization_id = o.id
//             WHERE c.id = $1
//         `;

//         try {
//             const result = await db.query(query, [certificateId]);
//             return result.rows[0] || null;
//         } catch (error) {
//             console.error('Error getting certificate:', error);
//             throw error;
//         }
//     }

//     /**
//      * Get certificates by student address
//      */
//     async getCertificatesByStudent(studentAddress) {
//         const query = `
//             SELECT c.*, s.name as skill_name, o.name as organization_name
//             FROM certificates c
//             LEFT JOIN skills s ON c.skill_id = s.id
//             LEFT JOIN organizations o ON c.organization_id = o.id
//             WHERE c.student_id = $1
//             ORDER BY c.issued_at DESC
//         `;

//         try {
//             const result = await db.query(query, [studentAddress]);
//             return result.rows;
//         } catch (error) {
//             console.error('Error getting student certificates:', error);
//             throw error;
//         }
//     }

//     /**
//      * Get certificates by student username (for authenticated users)
//      */
//     async getCertificatesByUsername(username) {
//         const query = `
//             SELECT c.*, s.name as skill_name, o.name as organization_name
//             FROM certificates c
//             LEFT JOIN skills s ON c.skill_id = s.id
//             LEFT JOIN organizations o ON c.organization_id = o.id
//             WHERE c.student_id ILIKE '%' || $1 || '%'
//             ORDER BY c.issued_at DESC
//         `;

//         try {
//             const result = await db.query(query, [username]);
//             return result.rows;
//         } catch (error) {
//             console.error('Error getting student certificates by username:', error);
//             throw error;
//         }
//     }

//     /**
//      * Get certificates by organization
//      */
//     async getCertificatesByOrganization(organizationId, limit = 100, offset = 0) {
//         const query = `
//             SELECT c.*, s.name as skill_name, o.name as organization_name, u.email as student_email
//             FROM certificates c
//             LEFT JOIN skills s ON c.skill_id = s.id
//             LEFT JOIN organizations o ON c.organization_id = o.id
//             LEFT JOIN users u ON c.student_id = u.email
//             WHERE c.organization_id = $1
//             ORDER BY c.issued_at DESC
//             LIMIT $2 OFFSET $3
//         `;

//         try {
//             const result = await db.query(query, [organizationId, limit, offset]);
//             return result.rows;
//         } catch (error) {
//             console.error('Error getting organization certificates:', error);
//             throw error;
//         }
//     }

//     /**
//      * Get certificates issued by an issuer
//      */
//     async getCertificatesByIssuer(issuerAddress, limit = 100, offset = 0) {
//         const query = `
//             SELECT c.*, s.name as skill_name, o.name as organization_name
//             FROM certificates c
//             LEFT JOIN skills s ON c.skill_id = s.id
//             LEFT JOIN organizations o ON c.organization_id = o.id
//             WHERE c.issuer_id = $1
//             ORDER BY c.issued_at DESC
//             LIMIT $2 OFFSET $3
//         `;

//         try {
//             const result = await db.query(query, [issuerAddress, limit, offset]);
//             return result.rows;
//         } catch (error) {
//             console.error('Error getting issuer certificates:', error);
//             throw error;
//         }
//     }

//     /**
//      * Get all certificates
//      */
//     async getAllCertificates(limit = 1000, offset = 0) {
//         const query = `
//             SELECT c.*, s.name as skill_name, o.name as organization_name, u.student_name as student_name
//             FROM certificates c
//             LEFT JOIN skills s ON c.skill_id = s.id
//             LEFT JOIN organizations o ON c.organization_id = o.id
//             LEFT JOIN users u ON c.student_id = u.id
//             ORDER BY c.issued_at DESC
//             LIMIT $1 OFFSET $2
//         `;

//         try {
//             const result = await db.query(query, [limit, offset]);
//             return result.rows;
//         } catch (error) {
//             console.error('Error getting all certificates:', error);
//             throw error;
//         }
//     }

//     /**
//      * Update certificate
//      */
//     async updateCertificate(certificateId, updateData) {
//         const allowedFields = [
//             'proficiency_level',
//             'revoked',
//             'revocation_reason',
//             'revocation_date',
//             'revocation_tx_hash',
//             'metadata_uri',
//             'blockchain_token_id'
//         ];

//         const fields = Object.keys(updateData).filter(key => allowedFields.includes(key));
//         if (fields.length === 0) {
//             throw new Error('No valid fields to update');
//         }

//         const setClause = fields.map((field, index) => `${field} = $${index + 1}`);
//         const query = `
//             UPDATE certificates
//             SET ${setClause.join(', ')}, updated_at = NOW()
//             WHERE id = $${fields.length + 1}
//             RETURNING *
//         `;

//         const values = fields.map(field => updateData[field]);
//         values.push(certificateId);

//         try {
//             const result = await db.query(query, values);
//             return result.rows[0];
//         } catch (error) {
//             console.error('Error updating certificate:', error);
//             throw error;
//         }
//     }

//     /**
//      * Get skill by ID
//      */
//     async getSkillById(skillId) {
//         const query = `
//             SELECT * FROM skills WHERE id = $1
//         `;

//         try {
//             const result = await db.query(query, [skillId]);
//             return result.rows[0] || null;
//         } catch (error) {
//             console.error('Error getting skill:', error);
//             throw error;
//         }
//     }

//     /**
//      * Get all skills with pagination
//      */
//     async getSkills(limit = 100, offset = 0) {
//         const query = `
//             SELECT * FROM skills
//             ORDER BY name ASC
//             LIMIT $1 OFFSET $2
//         `;

//         try {
//             const result = await db.query(query, [limit, offset]);
//             return result.rows;
//         } catch (error) {
//             console.error('Error getting skills:', error);
//             throw error;
//         }
//     }

//     /**
//      * Create skill
//      */
//     async createSkill(skillName, skillDescription = null, category = null) {
//         const query = `
//             INSERT INTO skills (id, name, description, category, created_at)
//             VALUES ($1, $2, $3, $4, $5)
//             RETURNING *
//         `;

//         const values = [
//             crypto.randomUUID(),
//             skillName,
//             skillDescription,
//             category,
//             new Date()
//         ];

//         try {
//             const result = await db.query(query, values);
//             return result.rows[0];
//         } catch (error) {
//             console.error('Error creating skill:', error);
//             throw error;
//         }
//     }

//     /**
//      * Count certificates with filters
//      */
//     async countCertificates(filters = {}) {
//         let query = 'SELECT COUNT(*) as count FROM certificates WHERE 1=1';
//         const values = [];
//         let paramIndex = 1;

//         if (filters.organizationId) {
//             query += ` AND organization_id = $${paramIndex}`;
//             values.push(filters.organizationId);
//             paramIndex++;
//         }

//         if (filters.issuerId) {
//             query += ` AND issuer_id = $${paramIndex}`;
//             values.push(filters.issuerId);
//             paramIndex++;
//         }

//         if (filters.studentAddress) {
//             query += ` AND student_id = $${paramIndex}`;
//             values.push(filters.studentAddress);
//             paramIndex++;
//         }

//         if (filters.revoked !== undefined) {
//             query += ` AND revoked = $${paramIndex}`;
//             values.push(filters.revoked);
//             paramIndex++;
//         }

//         try {
//             const result = await db.query(query, values);
//             return Number(result.rows[0].count);
//         } catch (error) {
//             console.error('Error counting certificates:', error);
//             throw error;
//         }
//     }

//     /**
//      * Check if certificate exists by blockchain hash
//      */
//     async getCertificateByBlockchainHash(blockchainHash) {
//         const query = `
//             SELECT * FROM certificates WHERE certificate_hash = $1
//         `;

//         try {
//             const result = await db.query(query, [blockchainHash]);
//             return result.rows[0] || null;
//         } catch (error) {
//             console.error('Error getting certificate by hash:', error);
//             throw error;
//         }
//     }
// }

// module.exports = new CertificateRepository();
