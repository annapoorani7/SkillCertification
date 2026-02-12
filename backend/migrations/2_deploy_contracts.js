const SkillCertificate = artifacts.require("SkillCertificate");

module.exports = function (deployer) {
  deployer.deploy(SkillCertificate);
};
