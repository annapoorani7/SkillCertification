// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract SkillCertificate {
    // Structure to hold certificate details
    struct Certificate {
        uint id;
        string studentName;
        string skill;
        string issuedBy;
        uint issuedOn;
    }

    // Mapping of certificate ID to Certificate
    mapping(uint => Certificate) public certificates;

    // Counter for certificate IDs
    uint public certCount;

    // Event emitted when a certificate is issued
    event CertificateIssued(
        uint id,
        string studentName,
        string skill,
        string issuedBy,
        uint issuedOn
    );

    // Function to issue a new certificate
    function issueCertificate(
        string memory _studentName,
        string memory _skill,
        string memory _issuedBy
    ) public {
        certCount++;
        certificates[certCount] = Certificate(
            certCount,
            _studentName,
            _skill,
            _issuedBy,
            block.timestamp
        );

        emit CertificateIssued(
            certCount,
            _studentName,
            _skill,
            _issuedBy,
            block.timestamp
        );
    }

    // Function to verify a certificate by ID
    function verifyCertificate(uint _id) public view returns (
        uint,
        string memory,
        string memory,
        string memory,
        uint
    ) {
        Certificate memory cert = certificates[_id];
        return (
            cert.id,
            cert.studentName,
            cert.skill,
            cert.issuedBy,
            cert.issuedOn
        );
    }
}
