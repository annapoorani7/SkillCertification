const express = require('express');
// const { body, param } = require('express-validator');
// const certificateController = require('../controllers/certificate.controller');
// const authMiddleware = require('../../middleware/auth');

const router = express.Router();

// ============ PUBLIC ENDPOINTS (No authentication required) ============

/**
 * Public certificate verification by ID
 * GET /api/verify/:certificateId
 */
// router.get('/verify/:certificateId',
//     certificateController.publicVerify
// );

// ============ AUTHENTICATED ENDPOINTS ============

/**
 * Issue a single certificate
 * POST /api/certificates/issue
 */
// router.post(
//     '/issue',
//     authMiddleware,
//     body('studentId')
//         .notEmpty()
//         .withMessage('Student ID is required'),
//     body('skillId')
//         .notEmpty()
//         .withMessage('Skill ID is required'),
//     body('proficiencyLevel')
//         .isIn(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
//         .withMessage('Invalid proficiency level'),
//     body('expirationDate')
//         .isInt({ min: Math.floor(Date.now() / 1000) })
//         .withMessage('Expiration date must be in the future'),
//     certificateController.issueCertificate
// );

// /**
//  * Get certificate details and verify
//  * GET /api/certificates/:certificateId
//  */
// router.get(
//     '/:certificateId',
//     authMiddleware,
//     certificateController.getCertificate
// );

// /**
//  * Verify certificate (authenticated)
//  * GET /api/certificates/:certificateId/verify
//  */
// router.get(
//     '/:certificateId/verify',
//     authMiddleware,
//     certificateController.verifyCertificate
// );

// /**
//  * Revoke certificate
//  * POST /api/certificates/:certificateId/revoke
//  */
// router.post(
//     '/:certificateId/revoke',
//     authMiddleware,
//     body('revocationReason')
//         .isString()
//         .trim()
//         .isLength({ min: 10, max: 500 })
//         .withMessage('Revocation reason must be 10-500 characters'),
//     certificateController.revokeCertificate
// );

// /**
//  * Get student's certificates
//  * GET /api/certificates/student/:studentId
//  */
// router.get(
//     '/student/:studentId',
//     authMiddleware,
//     certificateController.getStudentCertificates
// );

// /**
//  * Get authenticated student's own certificates
//  * GET /api/certificates/my-certificates
//  */
// router.get(
//     '/my-certificates',
//     authMiddleware,
//     certificateController.getMyStudentCertificates
// );

module.exports = router;
